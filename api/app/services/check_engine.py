"""
Moteur de check réutilisable (extrait de worker.py pour LOT 5).
Permet d'exécuter un check depuis l'API ou le worker.
"""
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from sqlalchemy.orm import Session

from app.models.watch import Watch, StockState
from app.models.watch_check import WatchCheck

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
    Analyse déterministe du contenu d'une fixture.
    
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
    
    Args:
        db: Session SQLAlchemy
        watch: Watch à vérifier
        fixture_name: Nom de la fixture à utiliser
        commit: Si True, commit la transaction (False pour tests)
    
    Returns:
        Tuple (WatchCheck créé, changed: bool, previous_state: str ou None)
    """
    logger.info(f"Check watch_id={watch.id} (url={watch.original_url}) avec fixture '{fixture_name}'")
    
    # Récupérer le dernier check pour comparer
    last_check = get_last_check(db, watch.id)
    previous_state = last_check.stock_state if last_check else None
    
    # Charger et analyser la fixture
    content = load_fixture(fixture_name)
    stock_state, http_status = analyze_fixture(content, fixture_name)
    
    # Détecter le changement (comparer stock_state)
    changed = False
    if last_check is not None:
        # Comparer avec le dernier état
        if last_check.stock_state != stock_state.value:
            changed = True
            logger.info(f"Changement détecté: {last_check.stock_state} -> {stock_state.value}")
    # Premier check = pas de changement (pas de référence pour comparer)
    
    # Créer le WatchCheck
    check = WatchCheck(
        watch_id=watch.id,
        checked_at=datetime.now(timezone.utc),
        stock_state=stock_state.value,
        http_status=http_status,
        fetch_mode="FIXTURE",
        duration_ms=0,
    )
    
    db.add(check)
    
    # Mettre à jour la watch
    watch.stock_state = stock_state
    watch.last_checked_at = check.checked_at
    
    if commit:
        db.commit()
        db.refresh(check)
    
    logger.info(f"WatchCheck créé: id={check.id}, watch_id={watch.id}, stock_state={stock_state.value}, changed={changed}")
    return check, changed, previous_state


# Check_engine.py
