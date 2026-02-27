"""
Configuration des tests pytest.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app
from app.models import User, Watch, WatchCheck, SiteProfile  # Import tous les modèles


# Base de données SQLite en mémoire pour les tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Crée une session de base de données pour chaque test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Client de test FastAPI avec la DB de test."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user_data():
    """Données utilisateur de test."""
    return {
        "email": "test@example.com",
        "password": "123456789",
    }


@pytest.fixture
def registered_user(client, test_user_data):
    """Crée un utilisateur enregistré et retourne les cookies."""
    response = client.post("/auth/register", json=test_user_data)
    assert response.status_code == 201
    return {
        "data": response.json(),
        "cookies": response.cookies,
    }


@pytest.fixture
def auth_cookies(registered_user):
    """Retourne les cookies d'authentification et CSRF."""
    cookies = registered_user["cookies"]
    return {
        "access_token": cookies.get("access_token"),
        "csrf_token": cookies.get("csrf_token")
    }


@pytest.fixture
def auth_headers(registered_user):
    """Retourne le header CSRF nécessaire pour les requêtes mutables."""
    cookies = registered_user["cookies"]
    return {
        "X-CSRF-Token": cookies.get("csrf_token")
    }


@pytest.fixture(autouse=True)
def reset_email_service_after_test():
    """
    Fixture auto-exécutée après chaque test pour réinitialiser l'EmailService.
    Évite les fuites d'état global entre tests.
    """
    yield  # Le test s'exécute ici
    # Cleanup après le test
    from app.services.email import reset_email_service
    reset_email_service()


# Conftest.py