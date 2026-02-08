"""
Worker de check déterministe (LOT 4).

Ce worker exécute un check en mode fixture (déterministe).
Il lit une fixture HTML locale et persiste le résultat dans watch_checks.

Usage: python -m app.worker
Env vars:
    CHECK_MODE=fixture (obligatoire pour activer)
    FIXTURE_NAME=in_stock.html (nom du fichier fixture)
"""
import logging
import sys
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.watch import Watch, WatchStatus, StockState
from app.models.watch_check import WatchCheck

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)

# Chemin vers les fixtures (resolve() pour robustesse si structure change)
FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures" / "checks"


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
    
    # Règle déterministe simple
    if "ADD_TO_CART" in text:
        stock_state = StockState.IN_STOCK
    else:
        stock_state = StockState.OUT_OF_STOCK
    
    # HTTP status simulé (fixture = succès)
    http_status = 200
    
    logger.info(f"Analyse fixture '{fixture_name}': stock_state={stock_state.value}, http_status={http_status}")
    return stock_state, http_status


def run_check(db: Session, watch: Watch, fixture_name: str) -> WatchCheck:
    """
    Exécute un check déterministe sur une watch.
    
    Args:
        db: Session SQLAlchemy
        watch: Watch à vérifier
        fixture_name: Nom de la fixture à utiliser
    
    Returns:
        WatchCheck créé et persisté
    """
    logger.info(f"Check watch_id={watch.id} (url={watch.original_url}) avec fixture '{fixture_name}'")
    
    # Charger et analyser la fixture
    content = load_fixture(fixture_name)
    stock_state, http_status = analyze_fixture(content, fixture_name)
    
    # Créer le WatchCheck
    check = WatchCheck(
        watch_id=watch.id,
        checked_at=datetime.now(timezone.utc),
        stock_state=stock_state.value,
        http_status=http_status,
        fetch_mode="FIXTURE",
        duration_ms=0,  # Instantané avec fixtures
    )
    
    db.add(check)
    
    # Mettre à jour la watch
    watch.stock_state = stock_state
    watch.last_checked_at = check.checked_at
    
    db.commit()
    db.refresh(check)
    
    logger.info(f"WatchCheck créé: id={check.id}, watch_id={watch.id}, stock_state={stock_state.value}")
    return check


def get_watches_to_check(db: Session) -> list[Watch]:
    """
    Récupère les watches ACTIVE à vérifier.
    Pour LOT 4, on prend toutes les watches ACTIVE (ou la première disponible).
    """
    watches = db.query(Watch).filter(Watch.watch_status == WatchStatus.ACTIVE).all()
    return watches


def main() -> None:
    """
    Point d'entrée du worker.
    Mode déterministe uniquement (CHECK_MODE=fixture).
    """
    check_mode = settings.check_mode
    fixture_name = settings.fixture_name
    
    logger.info("=" * 60)
    logger.info("Worker Nova démarré")
    logger.info(f"CHECK_MODE={check_mode}")
    logger.info(f"FIXTURE_NAME={fixture_name}")
    logger.info("=" * 60)
    
    # Vérifier le mode
    if check_mode != "fixture":
        logger.error(f"CHECK_MODE='{check_mode}' non supporté. Seul 'fixture' est implémenté.")
        logger.info("Le worker refuse de s'exécuter en mode live (LOT 4 = fixtures uniquement).")
        sys.exit(1)
    
    # Vérifier que la fixture existe
    try:
        load_fixture(fixture_name)
        logger.info(f"Fixture '{fixture_name}' trouvée et lisible")
    except FileNotFoundError as e:
        logger.error(str(e))
        logger.info(f"Fixtures disponibles: {[p.name for p in FIXTURES_DIR.glob('*.html')]}")
        sys.exit(1)
    
    # Connexion DB et exécution
    db = SessionLocal()
    try:
        watches = get_watches_to_check(db)
        
        if not watches:
            logger.error("Aucune watch ACTIVE trouvée.")
            logger.info("Créez une watch ACTIVE via l'API (POST /watches) avant de lancer le worker.")
            sys.exit(1)
        
        logger.info(f"{len(watches)} watch(es) à vérifier")
        
        checks_created = 0
        for watch in watches:
            try:
                check = run_check(db, watch, fixture_name)
                checks_created += 1
            except Exception as e:
                logger.error(f"Erreur check watch_id={watch.id}: {e}", exc_info=True)
        
        logger.info("=" * 60)
        logger.info(f"Worker terminé: {checks_created} check(s) créé(s)")
        logger.info("=" * 60)
        
    except Exception as e:
        logger.error(f"Erreur worker: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()

# Worker.py