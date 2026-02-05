"""
Tests d'authentification.
Spec: docs/06-test-strategy.md
"""
import pytest


class TestRegister:
    """Tests de l'inscription."""

    def test_register_success(self, client, test_user_data):
        """Test inscription réussie."""
        response = client.post("/auth/register", json=test_user_data)
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == test_user_data["email"]
        assert data["role"] == "USER"
        assert "id" in data
        # Vérifie que les cookies sont posés
        assert "access_token" in response.cookies
        assert "csrf_token" in response.cookies

    def test_register_duplicate_email(self, client, test_user_data):
        """Test inscription avec email déjà existant."""
        client.post("/auth/register", json=test_user_data)
        response = client.post("/auth/register", json=test_user_data)
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]


class TestLogin:
    """Tests de connexion."""

    def test_login_success(self, client, test_user_data):
        """Test login OK : retour 200 + cookie access_token présent."""
        # D'abord créer l'utilisateur
        client.post("/auth/register", json=test_user_data)

        # Puis se connecter
        response = client.post("/auth/login", json=test_user_data)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user_data["email"]
        assert data["role"] == "USER"
        # Vérifie que les cookies sont posés
        assert "access_token" in response.cookies
        assert "csrf_token" in response.cookies

    def test_login_invalid_password(self, client, test_user_data):
        """Test login avec mot de passe invalide."""
        client.post("/auth/register", json=test_user_data)
        response = client.post("/auth/login", json={
            "email": test_user_data["email"],
            "password": "wrongpassword",
        })
        assert response.status_code == 401

    def test_login_unknown_email(self, client):
        """Test login avec email inconnu."""
        response = client.post("/auth/login", json={
            "email": "unknown@example.com",
            "password": "somepassword",
        })
        assert response.status_code == 401


class TestProtectedAccess:
    """Tests d'accès aux routes protégées."""

    def test_protected_without_cookie_returns_401(self, client):
        """Test accès protégé sans cookie => 401."""
        response = client.post("/auth/logout")
        assert response.status_code == 401

    def test_protected_with_cookie(self, client, registered_user):
        """Test accès protégé avec cookie valide et CSRF."""
        # Le registered_user fixture a déjà les cookies
        cookies = registered_user["cookies"]
        csrf_token = cookies.get("csrf_token")
        response = client.post(
            "/auth/logout",
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        assert response.status_code == 204


class TestCSRF:
    """Tests de la protection CSRF."""

    def test_csrf_without_header_returns_403(self, client, registered_user):
        """Test CSRF : POST protégé sans X-CSRF-Token => 403."""
        cookies = registered_user["cookies"]
        # POST vers _csrf-check sans le header X-CSRF-Token
        response = client.post(
            "/auth/_csrf-check",
            cookies={"access_token": cookies.get("access_token"), "csrf_token": cookies.get("csrf_token")},
        )
        assert response.status_code == 403
        assert "CSRF" in response.json()["detail"]

    def test_csrf_with_valid_header_returns_204(self, client, registered_user):
        """Test CSRF : POST avec X-CSRF-Token valide => 204."""
        cookies = registered_user["cookies"]
        csrf_token = cookies.get("csrf_token")
        response = client.post(
            "/auth/_csrf-check",
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        assert response.status_code == 204

    def test_csrf_with_wrong_header_returns_403(self, client, registered_user):
        """Test CSRF : POST avec X-CSRF-Token invalide => 403."""
        cookies = registered_user["cookies"]
        response = client.post(
            "/auth/_csrf-check",
            cookies={"access_token": cookies.get("access_token"), "csrf_token": cookies.get("csrf_token")},
            headers={"X-CSRF-Token": "wrong-token"},
        )
        assert response.status_code == 403
        assert "mismatch" in response.json()["detail"]


class TestLogout:
    """Tests de déconnexion."""

    def test_logout_returns_204(self, client, registered_user):
        """Test logout : retourne 204 No Content avec CSRF valide."""
        cookies = registered_user["cookies"]
        csrf_token = cookies.get("csrf_token")
        response = client.post(
            "/auth/logout",
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        assert response.status_code == 204

# Test_auth.py