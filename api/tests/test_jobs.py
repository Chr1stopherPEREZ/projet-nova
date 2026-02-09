"""
Tests des routes /jobs (LOT 5).
Spec: docs/06-test-strategy.md
"""
import pytest
from uuid import uuid4

from app.services.email import EmailService, FakeEmailBackend, set_email_service


class TestJobsRun:
    """Tests de l'endpoint POST /jobs/run."""

    def test_run_job_without_auth_returns_401(self, client):
        """Test POST /jobs/run sans auth => 401."""
        response = client.post(
            "/jobs/run",
            json={"run_all": True},
        )
        assert response.status_code == 401

    def test_run_job_without_csrf_returns_403(self, client, registered_user):
        """Test POST /jobs/run sans CSRF => 403."""
        cookies = registered_user["cookies"]
        response = client.post(
            "/jobs/run",
            json={"run_all": True},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": cookies.get("csrf_token")},
            # Pas de header X-CSRF-Token
        )
        assert response.status_code == 403
        assert "CSRF" in response.json()["detail"]

    def test_run_job_on_other_user_watch_returns_404(self, client, db_session):
        """Test POST /jobs/run sur watch d'un autre user => 404 (isolation)."""
        # User A crée une watch
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
        csrf_b = cookies_b.get("csrf_token")

        # User B tente de run sur la watch de User A
        response = client.post(
            "/jobs/run",
            json={"watch_id": watch_id},
            cookies={"access_token": cookies_b.get("access_token"), "csrf_token": csrf_b},
            headers={"X-CSRF-Token": csrf_b},
        )
        assert response.status_code == 404

    def test_run_job_single_watch_creates_check(self, client, registered_user, db_session):
        """Test POST /jobs/run avec watch_id crée un check."""
        cookies = registered_user["cookies"]
        csrf_token = cookies.get("csrf_token")
        
        # Créer une watch
        create_response = client.post(
            "/watches",
            json={"url": "https://example.com/product/test-job"},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        watch_id = create_response.json()["id"]
        
        # Setup fake email backend
        fake_backend = FakeEmailBackend()
        set_email_service(EmailService(fake_backend))
        
        # Run le job
        response = client.post(
            "/jobs/run",
            json={"watch_id": watch_id},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["checks_executed"] == 1
        assert len(data["results"]) == 1
        assert data["results"][0]["watch_id"] == watch_id
        assert data["results"][0]["stock_state"] in ["IN_STOCK", "OUT_OF_STOCK"]
        
        # Premier check = pas de changement
        assert data["results"][0]["changed"] is False
        assert data["changes_detected"] == 0
        assert data["emails_sent"] == 0
        assert len(fake_backend.sent_emails) == 0

    def test_run_job_no_email_without_change(self, client, registered_user, db_session):
        """Test POST /jobs/run 2x sans changement => pas d'email."""
        cookies = registered_user["cookies"]
        csrf_token = cookies.get("csrf_token")
        
        # Créer une watch
        create_response = client.post(
            "/watches",
            json={"url": "https://example.com/product/no-change"},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        watch_id = create_response.json()["id"]
        
        # Setup fake email backend
        fake_backend = FakeEmailBackend()
        set_email_service(EmailService(fake_backend))
        
        # Run 1
        client.post(
            "/jobs/run",
            json={"watch_id": watch_id},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        
        # Run 2 (même fixture => pas de changement)
        response = client.post(
            "/jobs/run",
            json={"watch_id": watch_id},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["changes_detected"] == 0
        assert data["emails_sent"] == 0
        assert len(fake_backend.sent_emails) == 0

    def test_run_job_email_sent_on_change(self, client, registered_user, db_session, monkeypatch):
        """Test POST /jobs/run avec changement => email envoyé."""
        cookies = registered_user["cookies"]
        csrf_token = cookies.get("csrf_token")
        
        # Créer une watch
        create_response = client.post(
            "/watches",
            json={"url": "https://example.com/product/change-test"},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        watch_id = create_response.json()["id"]
        
        # Setup fake email backend
        fake_backend = FakeEmailBackend()
        set_email_service(EmailService(fake_backend))
        
        # Import settings pour pouvoir le modifier
        from app.core.config import settings
        
        # Run 1 avec in_stock.html
        monkeypatch.setattr(settings, "fixture_name", "in_stock.html")
        client.post(
            "/jobs/run",
            json={"watch_id": watch_id},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        
        # Run 2 avec out_of_stock.html => changement!
        monkeypatch.setattr(settings, "fixture_name", "out_of_stock.html")
        response = client.post(
            "/jobs/run",
            json={"watch_id": watch_id},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["changes_detected"] == 1
        assert data["emails_sent"] == 1
        assert len(fake_backend.sent_emails) == 1
        # Vérifier le contenu de l'email
        email = fake_backend.sent_emails[0]
        assert "Changement de stock" in email["subject"]
        assert "IN_STOCK" in email["body"]
        assert "OUT_OF_STOCK" in email["body"]

    def test_run_job_run_all_executes_on_active_watches(self, client, registered_user, db_session):
        """Test POST /jobs/run avec run_all=true exécute sur les watches ACTIVE."""
        cookies = registered_user["cookies"]
        csrf_token = cookies.get("csrf_token")
        
        # Créer 2 watches
        client.post(
            "/watches",
            json={"url": "https://example.com/product/run-all-1"},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        client.post(
            "/watches",
            json={"url": "https://example.com/product/run-all-2"},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        
        # Setup fake email backend
        fake_backend = FakeEmailBackend()
        set_email_service(EmailService(fake_backend))
        
        # Run all
        response = client.post(
            "/jobs/run",
            json={"run_all": True},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["checks_executed"] == 2
        assert len(data["results"]) == 2

    def test_run_job_invalid_body_returns_422(self, client, registered_user):
        """Test POST /jobs/run avec body invalide => 422."""
        cookies = registered_user["cookies"]
        csrf_token = cookies.get("csrf_token")
        
        # Ni watch_id ni run_all
        response = client.post(
            "/jobs/run",
            json={},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        assert response.status_code == 422

    def test_run_job_both_watch_id_and_run_all_returns_422(self, client, registered_user):
        """Test POST /jobs/run avec watch_id ET run_all => 422."""
        cookies = registered_user["cookies"]
        csrf_token = cookies.get("csrf_token")
        
        response = client.post(
            "/jobs/run",
            json={"watch_id": str(uuid4()), "run_all": True},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        assert response.status_code == 422

    def test_run_job_run_all_false_returns_422(self, client, registered_user):
        """Test POST /jobs/run avec run_all=false => 422 (seul true est accepté)."""
        cookies = registered_user["cookies"]
        csrf_token = cookies.get("csrf_token")
        
        response = client.post(
            "/jobs/run",
            json={"run_all": False},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        assert response.status_code == 422


# Test_jobs.py
