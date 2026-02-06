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


# Configuration via variables d'environnement (avec valeurs par défaut)
SEED_DEMO_USER = os.getenv("SEED_DEMO_USER", "1").lower() not in ("0", "false", "no")
DEMO_EMAIL = os.getenv("DEMO_EMAIL", "demo@nova.dev")
DEMO_PASSWORD = os.getenv("DEMO_PASSWORD", "Demo12345!")


def seed_demo_user(db: Session) -> None:
    """
    Crée l'utilisateur de démonstration s'il n'existe pas.
    Idempotent : ne fait rien si l'utilisateur existe déjà.
    """
    if not SEED_DEMO_USER:
        print("[seed] SEED_DEMO_USER=0, skip création utilisateur demo")
        return

    existing = db.query(User).filter(User.email == DEMO_EMAIL).first()
    if existing:
        print(f"[seed] Utilisateur {DEMO_EMAIL} existe déjà (id: {existing.id})")
        return

    user = User(
        email=DEMO_EMAIL,
        password_hash=hash_password(DEMO_PASSWORD),
        role=UserRole.USER,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    print(f"[seed] Utilisateur créé: {user.email} (id: {user.id})")


def main() -> None:
    """Point d'entrée du seed."""
    print("[seed] Démarrage du seed Nova...")
    
    db = SessionLocal()
    try:
        seed_demo_user(db)
        print("[seed] Seed terminé avec succès")
    except Exception as e:
        print(f"[seed] ERREUR: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()

# Seed.py