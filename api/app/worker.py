"""
Worker de check déterministe (LOT 4).

Ce worker exécute un check en mode fixture (déterministe).
Il lit une fixture HTML locale et persiste le résultat dans watch_checks.

Usage: python -m app.worker
Variables d'environnement :
    CHECK_MODE=fixture (obligatoire pour activer)
    FIXTURE_NAME=in_stock.html (nom du fichier fixture)
"""
import logging
import sys

import time

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.watch import Watch, WatchStatus, StockState
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


def wait_for_db(timeout: int = 60) -> None:
    """Attend que la base de données soit prête et que le schéma soit migré."""
    from sqlalchemy import text
    from app.core.database import engine
    
    start_time = time.time()
    attempt = 1
    
    logger.info("Attente de la base de données et du schéma...")
    while time.time() - start_time < timeout:
        try:
            with engine.connect() as conn:
                # 1. Vérifier la connexion
                conn.execute(text("SELECT 1"))
                
                # 2. Vérifier si la table 'watches' existe (indique que les migrations sont passées)
                # PostgreSQL spécifique
                result = conn.execute(text("SELECT to_regclass('public.watches');")).scalar()
                
                if result is not None:
                    logger.info(f"Base de données et schéma prêts (tentative {attempt})")
                    return
                else:
                    logger.info(f"DB connectée mais schéma non prêt (table 'watches' absente)... Tentative {attempt}")
        except Exception as e:
            logger.info(f"Attente DB... Tentative {attempt} (erreur: {e})")
            
        time.sleep(1)
        attempt += 1
            
    logger.error(f"Base de données ou schéma non disponible après {timeout}s")
    sys.exit(1)


def main() -> None:
    """
    Point d'entrée du worker.
    Mode déterministe uniquement (CHECK_MODE=fixture).
    """
    # Attendre la DB avant tout
    wait_for_db()

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
            logger.info("Aucune watch ACTIVE trouvée.")
            logger.info("Créez une watch ACTIVE via l'API (POST /watches) avant de lancer le worker.")
            return
        
        logger.info(f"{len(watches)} watch(es) à vérifier")
        
        checks_created = 0
        for watch in watches:
            success = False
            retries = 2
            for attempt in range(retries + 1):
                try:
                    logger.info(f"Check watch_id={watch.id} (Attempt {attempt + 1})")
                    check, _, _ = run_check(db, watch, fixture_name, commit=True)
                    checks_created += 1
                    success = True
                    logger.info(f"Check success for watch_id={watch.id}")
                    break
                except Exception as e:
                    logger.warning(f"Attempt {attempt + 1} failed for watch_id={watch.id}: {e}")
                    last_error = str(e)
                    if attempt < retries:
                        time.sleep(2)  # Petit wait entre retries
                    else:
                        logger.error(f"All {retries + 1} attempts failed for watch_id={watch.id}")
            
            if not success:
                # Si tout a échoué, on s'assure que la watch est marquée en erreur en DB
                try:
                    from app.models.watch_check import WatchCheck
                    from datetime import datetime, timezone
                    
                    logger.info(f"Création d'un WatchCheck UNKNOWN de secours pour watch_id={watch.id}")
                    fallback_check = WatchCheck(
                        watch_id=watch.id,
                        checked_at=datetime.now(timezone.utc),
                        stock_state=StockState.UNKNOWN.value,
                        http_status=500,
                        fetch_mode="WORKER_FALLBACK",
                        error_code="INTERNAL_ERROR",
                        error_message=f"Échec après retries: {last_error}",
                    )
                    db.add(fallback_check)
                    watch.stock_state = StockState.UNKNOWN
                    watch.last_checked_at = fallback_check.checked_at
                    db.commit()
                    checks_created += 1
                except Exception as e2:
                    logger.error(f"Impossible de créer le check de secours pour watch_id={watch.id}: {e2}")
                
                logger.error(f"Job failed for watch_id={watch.id}")
        
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