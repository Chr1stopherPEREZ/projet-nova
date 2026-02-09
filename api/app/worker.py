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

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.watch import Watch, WatchStatus
from app.services.check_engine import load_fixture, run_check, FIXTURES_DIR

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)


def get_watches_to_check(db) -> list[Watch]:
    """
    Récupère les watches ACTIVE à vérifier.
    Pour LOT 4, on prend toutes les watches ACTIVE.
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
                check, _, _ = run_check(db, watch, fixture_name, commit=True)
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