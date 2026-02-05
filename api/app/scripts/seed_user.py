"""
Script de création d'un utilisateur de test.
Usage: python -m app.scripts.seed_user [--admin]
"""
import argparse
import sys

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User, UserRole


def create_test_user(
    email: str = "test@example.com",
    password: str = "123456789",
    role: UserRole = UserRole.USER,
) -> User:
    """Crée un utilisateur de test dans la base de données."""
    db: Session = SessionLocal()
    try:
        # Vérifie si l'utilisateur existe déjà
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"Utilisateur {email} existe déjà (id: {existing.id})")
            return existing

        # Crée l'utilisateur
        user = User(
            email=email,
            password_hash=hash_password(password),
            role=role,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        print(f"Utilisateur créé: {user.email} (id: {user.id}, role: {user.role.value})")
        return user

    finally:
        db.close()


def main():
    """Point d'entrée du script."""
    parser = argparse.ArgumentParser(description="Créer un utilisateur de test")
    parser.add_argument("--email", default="test@example.com", help="Email de l'utilisateur")
    parser.add_argument("--password", default="123456789", help="Mot de passe")
    parser.add_argument("--admin", action="store_true", help="Créer un admin au lieu d'un user")

    args = parser.parse_args()
    role = UserRole.ADMIN if args.admin else UserRole.USER

    create_test_user(email=args.email, password=args.password, role=role)


if __name__ == "__main__":
    main()

# Seed_user.py