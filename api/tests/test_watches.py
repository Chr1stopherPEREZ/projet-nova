"""
Tests des routes /watches.
Spec: docs/06-test-strategy.md
"""
import pytest
from uuid import uuid4


class TestCreateWatch:
    """Tests de création de suivi (watch)."""

    def test_create_watch_success(self, client, registered_user):
        """Test POST /watches OK (auth + csrf) => 201."""
        cookies = registered_user["cookies"]
        csrf_token = cookies.get("csrf_token")
        response = client.post(
            "/watches",
            json={"url": "https://example.com/product/123", "label": "Test Product"},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["url"] == "https://example.com/product/123"
        assert data["label"] == "Test Product"
        assert data["status"] == "ACTIVE"
        assert data["stock_state"] == "UNKNOWN"
        assert "id" in data

    def test_create_watch_without_label(self, client, registered_user):
        """Test POST /watches sans label => 201."""
        cookies = registered_user["cookies"]
        csrf_token = cookies.get("csrf_token")
        response = client.post(
            "/watches",
            json={"url": "https://example.com/product/456"},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["label"] is None

    def test_create_watch_without_auth_returns_401(self, client):
        """Test POST /watches sans auth => 401."""
        response = client.post(
            "/watches",
            json={"url": "https://example.com/product/123"},
        )
        assert response.status_code == 401

    def test_create_watch_without_csrf_returns_403(self, client, registered_user):
        """Test POST /watches sans CSRF => 403."""
        cookies = registered_user["cookies"]
        response = client.post(
            "/watches",
            json={"url": "https://example.com/product/123"},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": cookies.get("csrf_token")},
        # Pas de header X-CSRF-Token
        )
        assert response.status_code == 403
        assert "CSRF" in response.json()["detail"]

    def test_create_watch_duplicate_url_returns_400(self, client, registered_user):
        """Test POST /watches avec URL déjà existante => 400."""
        cookies = registered_user["cookies"]
        csrf_token = cookies.get("csrf_token")
        # Crée un premier suivi
        client.post(
            "/watches",
            json={"url": "https://example.com/product/dup"},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        # Tente de créer un second suivi avec la même URL
        response = client.post(
            "/watches",
            json={"url": "https://example.com/product/dup"},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]


class TestListWatches:
    """Tests de listing des suivis."""

    def test_list_watches_returns_created_watch(self, client, registered_user):
        """Test GET /watches retourne le suivi créé => 200."""
        cookies = registered_user["cookies"]
        csrf_token = cookies.get("csrf_token")
        # Crée un suivi
        client.post(
            "/watches",
            json={"url": "https://example.com/product/list-test"},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        # Liste les suivis
        response = client.get(
            "/watches",
            cookies={"access_token": cookies.get("access_token")},
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]["url"] == "https://example.com/product/list-test"

    def test_list_watches_without_auth_returns_401(self, client):
        """Test GET /watches sans auth => 401."""
        response = client.get("/watches")
        assert response.status_code == 401


class TestGetWatch:
    """Tests de récupération d'un suivi par ID."""

    def test_get_watch_by_id_success(self, client, registered_user):
        """Test GET /watches/{id} OK => 200."""
        cookies = registered_user["cookies"]
        csrf_token = cookies.get("csrf_token")
        # Crée un suivi
        create_response = client.post(
            "/watches",
            json={"url": "https://example.com/product/detail-test"},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        watch_id = create_response.json()["id"]
        # Récupère le suivi par ID
        response = client.get(
            f"/watches/{watch_id}",
            cookies={"access_token": cookies.get("access_token")},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == watch_id
        assert data["url"] == "https://example.com/product/detail-test"

    def test_get_watch_not_found_returns_404(self, client, registered_user):
        """Test GET /watches/{id} avec ID inexistant => 404."""
        cookies = registered_user["cookies"]
        fake_id = str(uuid4())
        response = client.get(
            f"/watches/{fake_id}",
            cookies={"access_token": cookies.get("access_token")},
        )
        assert response.status_code == 404


class TestWatchIsolation:
    """Tests d'isolation entre utilisateurs."""

    def test_user_cannot_see_other_user_watch(self, client, db_session, test_user_data):
        """Test isolation : un user B ne voit pas les suivis du user A."""
        # User A crée un suivi
        user_a_data = {"email": "usera@example.com", "password": "password123"}
        reg_a = client.post("/auth/register", json=user_a_data)
        cookies_a = reg_a.cookies
        csrf_a = cookies_a.get("csrf_token")
        create_response = client.post(
            "/watches",
            json={"url": "https://example.com/product/secret"},
            cookies={"access_token": cookies_a.get("access_token"), "csrf_token": csrf_a},
            headers={"X-CSRF-Token": csrf_a},
        )
        watch_id = create_response.json()["id"]

        # User B s'inscrit
        user_b_data = {"email": "userb@example.com", "password": "password123"}
        reg_b = client.post("/auth/register", json=user_b_data)
        cookies_b = reg_b.cookies

        # User B tente d'accéder au suivi de User A
        response = client.get(
            f"/watches/{watch_id}",
            cookies={"access_token": cookies_b.get("access_token")},
        )
        assert response.status_code == 404  # 404 pour éviter l'énumération

        # User B liste ses suivis (doit être vide)
        list_response = client.get(
            "/watches",
            cookies={"access_token": cookies_b.get("access_token")},
        )
        assert list_response.status_code == 200
        assert list_response.json() == []

# Test_watches.py
