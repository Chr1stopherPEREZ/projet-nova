"""
Moteur de check réutilisable (extrait de worker.py pour LOT 5).
Permet d'exécuter un check depuis l'API ou le worker.
Supporte les variantes (LOT 7/8): vérification par variant_sku.
"""
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Any

from sqlalchemy.orm import Session

from app.models.watch import Watch, StockState
from app.models.watch_check import WatchCheck
from app.services.nike_parser import is_nike_url, check_variant_availability, extract_next_data, parse_nike_variants
from app.services.shopify_parser import (
    is_shopify_url, 
    check_shopify_availability, 
    extract_handle, 
    fetch_shopify_product_json_sync,
    get_shopify_ajax_url
)

logger = logging.getLogger(__name__)

# Chemin vers les fixtures
FIXTURES_DIR = Path(__file__).resolve().parent.parent / "fixtures" / "checks"


def load_fixture(fixture_name: str) -> bytes:
    """
    Charge une fixture HTML depuis le dossier fixtures/checks.
    
    Args:
        fixture_name: Nom du fichier fixture (ex: "in_stock.html")
    
    Returns:
        Contenu de la fixture en bytes
    
    Raises:
        FileNotFoundError: Si la fixture n'existe pas
    """
    fixture_path = FIXTURES_DIR / fixture_name
    if not fixture_path.exists():
        raise FileNotFoundError(f"Fixture non trouvée: {fixture_path}")
    return fixture_path.read_bytes()


def analyze_fixture(content: bytes, fixture_name: str) -> tuple[StockState, int]:
    """
    Analyse déterministe du contenu d'une fixture (mode global, sans variante).
    
    Règle simple et stable:
    - Si le contenu contient "ADD_TO_CART" => IN_STOCK
    - Sinon => OUT_OF_STOCK
    
    Args:
        content: Contenu de la fixture en bytes
        fixture_name: Nom de la fixture (pour logs)
    
    Returns:
        Tuple (stock_state, http_status_simulé)
    """
    text = content.decode("utf-8", errors="replace")
    
    if "ADD_TO_CART" in text:
        stock_state = StockState.IN_STOCK
    else:
        stock_state = StockState.OUT_OF_STOCK
    
    http_status = 200
    
    logger.info(f"Analyse fixture '{fixture_name}': stock_state={stock_state.value}, http_status={http_status}")
    return stock_state, http_status


def analyze_variant(
    content: bytes, 
    variant_sku: str, 
    variant_selector: dict[str, Any] | None,
    variant_meta: dict[str, Any] | None,
    url: str
) -> tuple[StockState, int, dict[str, Any]]:
    """
    Analyse la disponibilité d'une variante spécifique.
    """
    text = content.decode("utf-8", errors="replace")
    
    if is_shopify_url(url):
        # Shopify: on attend souvent du JSON dans la fixture pour les tests, 
        # ou on essaie d'extraire si c'est du HTML (mais ici on privilégie l'endpoint AJAX)
        try:
            product_json = json.loads(text)
            stock_state_str, details = check_shopify_availability(product_json, variant_selector)
            stock_state = StockState(stock_state_str)
            return stock_state, 200, details
        except json.JSONDecodeError:
            # ERREUR CRITIQUE: Si c'est du Shopify mais pas du JSON, on ne doit pas dire IN_STOCK
            logger.error(f"La fixture pour Shopify n'est pas un JSON valide: {url}")
            details = {
                "source": "shopify",
                "error": "Contenu non-JSON reçu pour Shopify",
                "mode": "fail-safe"
            }
            return StockState.UNKNOWN, 200, details
    
    if is_nike_url(url):
        # Utiliser le parser Nike pour vérifier la variante
        stock_state_str, details = check_variant_availability(text, variant_sku, variant_meta)
        stock_state = StockState(stock_state_str)
        
        logger.info(f"Analyse variante Nike sku={variant_sku}: stock_state={stock_state.value}")
        return stock_state, 200, details
    
    # Pour les autres sites: fallback sur analyse globale avec détails
    if "ADD_TO_CART" in text:
        stock_state = StockState.IN_STOCK
    else:
        stock_state = StockState.OUT_OF_STOCK
    
    details = {
        "variant_sku": variant_sku,
        "mode": "global_fallback",
        "note": "Parser spécifique non disponible pour ce site",
    }
    if variant_meta:
        details["color"] = variant_meta.get("color")
        details["size"] = variant_meta.get("size")
    
    logger.info(f"Analyse variante (fallback) sku={variant_sku}: stock_state={stock_state.value}")
    return stock_state, 200, details


def get_last_check(db: Session, watch_id) -> Optional[WatchCheck]:
    """
    Récupère le dernier check pour une watch.
    
    Args:
        db: Session SQLAlchemy
        watch_id: ID de la watch
    
    Returns:
        Le dernier WatchCheck ou None si aucun
    """
    return (
        db.query(WatchCheck)
        .filter(WatchCheck.watch_id == watch_id)
        .order_by(WatchCheck.checked_at.desc())
        .first()
    )


def run_check(
    db: Session,
    watch: Watch,
    fixture_name: str,
    commit: bool = True,
) -> tuple[WatchCheck, bool, Optional[str]]:
    """
    Exécute un check déterministe sur une watch.
    
    Si la watch a un variant_sku, vérifie la disponibilité de cette variante.
    Sinon, utilise le mode global (comportement historique).
    
    Args:
        db: Session SQLAlchemy
        watch: Watch à vérifier
        fixture_name: Nom de la fixture à utiliser
        commit: Si True, commit la transaction (False pour tests)
    
    Returns:
        Tuple (WatchCheck créé, changed: bool, previous_state: str ou None)
    """
    has_variant = bool(watch.variant_sku)
    logger.info(
        f"Check watch_id={watch.id} (url={watch.original_url}) "
        f"avec fixture '{fixture_name}', variant_sku={watch.variant_sku}"
    )
    
    # Récupérer le dernier check pour comparer
    last_check = get_last_check(db, watch.id)
    previous_state = last_check.stock_state if last_check else None
    
    error_code = None
    error_message = None

    # 1) Chemin prioritaire Shopify : Toujours LIVE (pas de fixture)
    if is_shopify_url(watch.original_url):
        handle = extract_handle(watch.original_url)
        if handle:
            ajax_url = get_shopify_ajax_url(watch.original_url, handle)
            logger.info(f"Chemin SHOPIFY_LIVE emprunté pour watch_id={watch.id}, ajax_url={ajax_url}")
            
            product_json = fetch_shopify_product_json_sync(handle, watch.original_url)
            if product_json:
                stock_state_str, details = check_shopify_availability(product_json, watch.variant_selector)
                stock_state = StockState(stock_state_str)
                http_status = 200
                if stock_state == StockState.UNKNOWN:
                    error_code = "PARSER_ERROR"
                    error_message = details.get("error") if details else "État inconnu détecté (Shopify)"
            else:
                logger.error(f"Échec de la récupération du JSON Shopify live pour {watch.original_url}")
                stock_state = StockState.UNKNOWN
                http_status = 500
                error_code = "NETWORK_ERROR"
                error_message = "Impossible de récupérer le JSON Shopify live"
                details = {"error": error_message, "source": "shopify", "ajax_url": ajax_url}
        else:
            logger.error(f"Impossible d'extraire le handle de l'URL Shopify : {watch.original_url}")
            stock_state = StockState.UNKNOWN
            http_status = 400
            error_code = "INVALID_URL"
            error_message = "Handle Shopify non trouvé"
            details = {"error": error_message, "source": "shopify"}
    else:
        # 2) Chemin classique (fixtures) pour les autres sites (Nike, etc.)
        try:
            # Charger la fixture
            content = load_fixture(fixture_name)
            
            # Analyser selon le mode (variante ou global)
            details: dict[str, Any] | None = None
            
            if has_variant:
                # Mode VARIANTE: vérifier la dispo de la variante spécifique
                stock_state, http_status, details = analyze_variant(
                    content=content,
                    variant_sku=watch.variant_sku,
                    variant_selector=watch.variant_selector,
                    variant_meta=watch.variant_meta,
                    url=watch.original_url,
                )
            else:
                # Mode GLOBAL: comportement historique
                stock_state, http_status = analyze_fixture(content, fixture_name)
            
            if stock_state == StockState.UNKNOWN:
                error_code = "PARSER_ERROR"
                error_message = details.get("error") if details else "État inconnu détecté"
            else:
                error_code = None
                error_message = None

        except Exception as e:
            logger.error(f"Erreur lors de l'exécution du check pour watch_id={watch.id}: {e}")
            stock_state = StockState.UNKNOWN
            http_status = 500
            error_code = "INTERNAL_ERROR"
            error_message = str(e)
            details = {"error": error_message, "mode": "error_fallback"}
    
    # Détecter le changement (comparer stock_state)
    changed = False
    if last_check is not None:
        if last_check.stock_state != stock_state.value:
            changed = True
            logger.info(f"Changement détecté: {last_check.stock_state} -> {stock_state.value}")
    # Premier check = pas de changement (pas de référence pour comparer)
    
    # Créer le WatchCheck
    fetch_mode = "FIXTURE"
    if is_shopify_url(watch.original_url):
        fetch_mode = "SHOPIFY_LIVE"
    
    # Assertion de sécurité demandée par l'utilisateur
    if is_shopify_url(watch.original_url) and fetch_mode != "SHOPIFY_LIVE":
        logger.error(f"CRITIQUE : URL Shopify détectée mais fetch_mode est {fetch_mode} au lieu de SHOPIFY_LIVE pour la watch {watch.id}")
        
    check = WatchCheck(
        watch_id=watch.id,
        checked_at=datetime.now(timezone.utc),
        stock_state=stock_state.value,
        http_status=http_status,
        fetch_mode=fetch_mode,
        duration_ms=0,
        error_code=error_code,
        error_message=error_message,
        details=details,  # Détails de la variante si disponibles
    )
    
    db.add(check)
    
    # Mettre à jour la watch
    watch.stock_state = stock_state
    watch.last_checked_at = check.checked_at
    
    if commit:
        db.commit()
        db.refresh(check)
    
    logger.info(
        f"WatchCheck créé: id={check.id}, watch_id={watch.id}, "
        f"stock_state={stock_state.value}, changed={changed}, has_variant={has_variant}"
    )
    return check, changed, previous_state


# Check_engine.py
