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
from app.models.user import User
from app.models.watch import Watch, WatchStatus, StockState
from app.schemas.watch import WatchCreate, WatchOut, WatchUpdate
from app.api.deps import get_current_user

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

    # Vérifie si une watch existe déjà pour cette URL normalisée
    existing = db.query(Watch).filter(
        Watch.user_id == current_user.id,
        Watch.normalized_url == normalized,
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Watch already exists for this URL",
        )

    # Crée la watch
    watch = Watch(
        user_id=current_user.id,
        original_url=url_str,
        normalized_url=normalized,
        label=watch_data.label,
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
            detail="Watch not found",
        )
    return WatchOut(
        id=watch.id,
        url=watch.original_url,
        label=watch.label,
        status=watch.watch_status.value,
        stock_state=watch.stock_state.value,
        last_checked_at=watch.last_checked_at,
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
            detail="Watch not found",
        )

    if watch_data.status:
        watch.watch_status = WatchStatus(watch_data.status)

    db.commit()
    db.refresh(watch)

    return WatchOut(
        id=watch.id,
        url=watch.original_url,
        label=watch.label,
        status=watch.watch_status.value,
        stock_state=watch.stock_state.value,
        last_checked_at=watch.last_checked_at,
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
            detail="Watch not found",
        )

    db.delete(watch)
    db.commit()
    return None


# NOTE: Les routes suivantes sont définies dans docs/07-api-spec.md mais non implémentées
# pour le Lot 3. Elles seront ajoutées dans un lot ultérieur (worker/checks) :
# - GET /watches/{id}/checks (historique des contrôles)
# - GET /watches/{id}/notifications (historique des notifications)

# Watches.py
