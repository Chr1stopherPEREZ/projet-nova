"""
Routes pour les watches (suivis de produits).
Spec: docs/07-api-spec.md
"""
from urllib.parse import urlparse
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.csrf import verify_csrf
from app.core.exceptions import raise_api_error
from app.models.user import User
from app.models.watch import Watch, WatchStatus, StockState
from app.schemas.watch import WatchCreate, WatchOut, WatchUpdate, PreviewRequest, PreviewResponse, WatchCheckOut
from app.api.deps import get_current_user
from app.services.nike_parser import fetch_preview as fetch_nike_preview
from app.services.shopify_parser import is_shopify_url, fetch_shopify_preview

router = APIRouter(prefix="/watches", tags=["watches"])


def normalize_url(url: str) -> str:
    """
    Normalise une URL pour éviter les doublons.
    
    NOTE: La normalisation supprime les query params et le slash final.
    Cela peut surprendre si deux pages diffèrent uniquement par query string
    (rare pour un produit, mais possible). À garder en tête.
    """
    parsed = urlparse(url)
    # Supprime tous les query params et normalise
    normalized = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
    # Supprime le slash final si présent
    return normalized.rstrip("/")


@router.post("", response_model=WatchOut, status_code=status.HTTP_201_CREATED)
def create_watch(
    watch_data: WatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: None = Depends(verify_csrf),
):
    """
    Crée une nouvelle watch pour le user connecté.
    Auth + CSRF obligatoires.
    """
    url_str = str(watch_data.url)
    normalized = normalize_url(url_str)

    # Vérifie si une watch existe déjà pour cette URL normalisée + variant_sku
    existing = db.query(Watch).filter(
        Watch.user_id == current_user.id,
        Watch.normalized_url == normalized,
        Watch.variant_sku == watch_data.variant_sku,  # None == None permet les watches globales uniques
    ).first()
    if existing:
        raise_api_error(
            code="WATCH_ALREADY_EXISTS",
            message="Un suivi existe déjà pour cette URL et cette variante",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    # Crée la watch
    watch = Watch(
        user_id=current_user.id,
        original_url=url_str,
        normalized_url=normalized,
        label=watch_data.label,
        variant_sku=watch_data.variant_sku,
        variant_selector=watch_data.variant_selector,
        variant_meta=watch_data.variant_meta,
        watch_status=WatchStatus.ACTIVE,
        stock_state=StockState.UNKNOWN,
    )
    db.add(watch)
    db.commit()
    db.refresh(watch)

    return WatchOut(
        id=watch.id,
        url=watch.original_url,
        label=watch.label,
        status=watch.watch_status.value,
        stock_state=watch.stock_state.value,
        last_checked_at=watch.last_checked_at,
        variant_sku=watch.variant_sku,
        variant_selector=watch.variant_selector,
        variant_meta=watch.variant_meta,
    )


@router.get("", response_model=list[WatchOut])
def list_watches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Liste les watches du user connecté.
    Auth obligatoire.
    """
    watches = db.query(Watch).filter(Watch.user_id == current_user.id).all()
    return [
        WatchOut(
            id=w.id,
            url=w.original_url,
            label=w.label,
            status=w.watch_status.value,
            stock_state=w.stock_state.value,
            last_checked_at=w.last_checked_at,
            variant_sku=w.variant_sku,
            variant_selector=w.variant_selector,
            variant_meta=w.variant_meta,
        )
        for w in watches
    ]


@router.get("/{watch_id}", response_model=WatchOut)
def get_watch(
    watch_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Récupère une watch par son ID.
    Auth obligatoire. Retourne 404 si non trouvée ou non owned (évite l'énumération).
    """
    watch = db.query(Watch).filter(
        Watch.id == watch_id,
        Watch.user_id == current_user.id,
    ).first()
    if not watch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "WATCH_NOT_FOUND",
                "message": "Suivi introuvable",
                "details": {"watch_id": str(watch_id)}
            },
        )
    return WatchOut(
        id=watch.id,
        url=watch.original_url,
        label=watch.label,
        status=watch.watch_status.value,
        stock_state=watch.stock_state.value,
        last_checked_at=watch.last_checked_at,
        variant_sku=watch.variant_sku,
        variant_selector=watch.variant_selector,
        variant_meta=watch.variant_meta,
    )


@router.patch("/{watch_id}", response_model=WatchOut)
def update_watch(
    watch_id: UUID,
    watch_data: WatchUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: None = Depends(verify_csrf),
):
    """
    Met à jour une watch (status ACTIVE/PAUSED).
    Auth + CSRF obligatoires.
    """
    watch = db.query(Watch).filter(
        Watch.id == watch_id,
        Watch.user_id == current_user.id,
    ).first()
    if not watch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "WATCH_NOT_FOUND",
                "message": "Suivi introuvable",
                "details": {"watch_id": str(watch_id)}
            },
        )

    if watch_data.status:
        watch.watch_status = WatchStatus(watch_data.status)
    if watch_data.label is not None:
        watch.label = watch_data.label
    if watch_data.variant_sku is not None:
        watch.variant_sku = watch_data.variant_sku
    if watch_data.variant_selector is not None:
        watch.variant_selector = watch_data.variant_selector
    if watch_data.variant_meta is not None:
        watch.variant_meta = watch_data.variant_meta

    db.commit()
    db.refresh(watch)

    return WatchOut(
        id=watch.id,
        url=watch.original_url,
        label=watch.label,
        status=watch.watch_status.value,
        stock_state=watch.stock_state.value,
        last_checked_at=watch.last_checked_at,
        variant_sku=watch.variant_sku,
        variant_selector=watch.variant_selector,
        variant_meta=watch.variant_meta,
    )


@router.delete("/{watch_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_watch(
    watch_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: None = Depends(verify_csrf),
):
    """
    Supprime une watch.
    Auth + CSRF obligatoires.
    """
    watch = db.query(Watch).filter(
        Watch.id == watch_id,
        Watch.user_id == current_user.id,
    ).first()
    if not watch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "WATCH_NOT_FOUND",
                "message": "Suivi introuvable",
                "details": {"watch_id": str(watch_id)}
            },
        )

    db.delete(watch)
    db.commit()
    return None


@router.get("/{watch_id}/checks", response_model=list[WatchCheckOut])
def get_watch_checks(
    watch_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Récupère l'historique des checks pour une watch.
    Auth obligatoire.
    """
    from app.models.watch_check import WatchCheck
    
    watch = db.query(Watch).filter(
        Watch.id == watch_id,
        Watch.user_id == current_user.id,
    ).first()
    if not watch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "WATCH_NOT_FOUND",
                "message": "Suivi introuvable",
                "details": {"watch_id": str(watch_id)}
            },
        )
    
    checks = db.query(WatchCheck).filter(
        WatchCheck.watch_id == watch_id
    ).order_by(WatchCheck.checked_at.desc()).limit(50).all()
    
    return [
        WatchCheckOut(
            id=c.id,
            watch_id=c.watch_id,
            checked_at=c.checked_at,
            stock_state=c.stock_state,
            http_status=c.http_status,
            fetch_mode=c.fetch_mode,
            duration_ms=c.duration_ms,
            error_code=c.error_code,
            error_message=c.error_message,
            details=c.details,
        )
        for c in checks
    ]


@router.post("/preview", response_model=PreviewResponse)
async def preview_product(
    request: PreviewRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Analyse une URL produit et retourne les variantes disponibles.
    Utile pour choisir coloris/taille avant de créer une watch.
    Auth obligatoire.
    """
    url_str = str(request.url)
    
    try:
        if is_shopify_url(url_str):
            preview = await fetch_shopify_preview(url_str)
        else:
            preview = await fetch_nike_preview(url_str)
            # Marquer Nike comme expérimental
            if preview.source == "nike":
                preview.debug_info = preview.debug_info or {}
                preview.debug_info["experimental"] = True
                preview.debug_info["warning"] = "Le support Nike est expérimental. La détection des variantes peut être imprécise."
        
        return preview
    except Exception as e:
        raise_api_error(
            code="PREVIEW_FAILED",
            message=f"Impossible d'analyser l'URL: {str(e)}",
            status_code=status.HTTP_400_BAD_REQUEST,
        )


# NOTE: Route notifications non implémentée
# - GET /watches/{id}/notifications (historique des notifications)

# Watches.py
