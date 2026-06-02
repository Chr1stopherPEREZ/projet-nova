"""
Seed de données initiales pour Nova.
Crée un utilisateur de démonstration de manière idempotente.

Usage: python -m app.seed
"""
import os
import sys

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.watch import Watch, WatchStatus, StockState
from app.models.watch_check import WatchCheck
from datetime import datetime, timezone, timedelta


# Configuration via variables d'environnement (avec valeurs par défaut)
SEED_DEMO_USER = os.getenv("SEED_DEMO_USER", "1").lower() not in ("0", "false", "no")
DEMO_EMAIL = os.getenv("DEMO_EMAIL", "user@example.com")
DEMO_PASSWORD = os.getenv("DEMO_PASSWORD", "password123")

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@example.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "adminpassword")


def seed_users(db: Session) -> None:
    """
    Crée les utilisateurs de démonstration (user + admin) s'ils n'existent pas.
    Idempotent.
    """
    if not SEED_DEMO_USER:
        print("[seed] SEED_DEMO_USER=0, skip création utilisateurs demo")
        return

    # User Standard
    existing_user = db.query(User).filter(User.email == DEMO_EMAIL).first()
    if not existing_user:
        user = User(
            email=DEMO_EMAIL,
            password_hash=hash_password(DEMO_PASSWORD),
            role=UserRole.USER,
        )
        db.add(user)
        print(f"[seed] Utilisateur standard créé: {DEMO_EMAIL}")
    else:
        print(f"[seed] Utilisateur standard {DEMO_EMAIL} existe déjà")

    # Admin
    existing_admin = db.query(User).filter(User.email == ADMIN_EMAIL).first()
    if not existing_admin:
        admin = User(
            email=ADMIN_EMAIL,
            password_hash=hash_password(ADMIN_PASSWORD),
            role=UserRole.ADMIN,
        )
        db.add(admin)
        print(f"[seed] Administrateur créé: {ADMIN_EMAIL}")
    else:
        print(f"[seed] Administrateur {ADMIN_EMAIL} existe déjà")

    db.commit()


def seed_data(db: Session) -> None:
    """
    Crée des données de démo (watches + checks) pour l'utilisateur standard.
    """
    user = db.query(User).filter(User.email == DEMO_EMAIL).first()
    if not user:
        return

    # 1. Créer une montre si elle n'existe pas
    url = "https://www.nike.com/fr/t/chaussure-air-max-plus-pour-E06z6p/DZ3531-100"
    watch = db.query(Watch).filter(Watch.user_id == user.id, Watch.original_url == url).first()
    
    if not watch:
        watch = Watch(
            user_id=user.id,
            original_url=url,
            normalized_url="nike.com/fr/t/chaussure-air-max-plus",
            label="Nike Air Max Plus",
            watch_status=WatchStatus.ACTIVE,
            stock_state=StockState.IN_STOCK
        )
        db.add(watch)
        db.flush()
        print(f"[seed] Watch créée pour {DEMO_EMAIL}: {watch.label}")
    
    # 2. Créer quelques checks si aucun n'existe
    existing_checks = db.query(WatchCheck).filter(WatchCheck.watch_id == watch.id).count()
    if existing_checks == 0:
        now = datetime.now(timezone.utc)
        
        # Check 1: Hier (En rupture)
        c1 = WatchCheck(
            watch_id=watch.id,
            checked_at=now - timedelta(days=1),
            stock_state=StockState.OUT_OF_STOCK.value,
            http_status=200,
            fetch_mode="FIXTURE",
            details={"changed": False}
        )
        # Check 2: Il y a 12h (En stock ! Changement)
        c2 = WatchCheck(
            watch_id=watch.id,
            checked_at=now - timedelta(hours=12),
            stock_state=StockState.IN_STOCK.value,
            http_status=200,
            fetch_mode="FIXTURE",
            details={"changed": True}
        )
        # Check 3: Il y a 1h (Toujours en stock)
        c3 = WatchCheck(
            watch_id=watch.id,
            checked_at=now - timedelta(hours=1),
            stock_state=StockState.IN_STOCK.value,
            http_status=200,
            fetch_mode="FIXTURE",
            details={"changed": False}
        )
        db.add_all([c1, c2, c3])
        print(f"[seed] 3 checks créés pour la montre {watch.label}")
    
    db.commit()


def main() -> None:
    """Point d'entrée du seed."""
    print("[seed] Démarrage du seed Nova...")
    
    db = SessionLocal()
    try:
        seed_users(db)
        seed_data(db)
        print("[seed] Seed terminé avec succès")
    except Exception as e:
        print(f"[seed] ERREUR: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()

# Seed.py