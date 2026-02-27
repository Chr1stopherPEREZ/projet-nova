from app.services.email import EmailService, FakeEmailBackend, set_email_service
from app.core.config import settings

class TestJobsSubset:
    """Pack de tests Jobs Lot 9."""

    def test_run_job_single_watch_creates_check(self, client, registered_user):
        """Test POST /jobs/run crée un check en DB."""
        cookies = registered_user["cookies"]
        csrf_token = cookies.get("csrf_token")
        
        # Créer un suivi
        create_res = client.post(
            "/watches",
            json={"url": "https://example.com/product/1"},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        watch_id = create_res.json()["id"]
        
        # Lancer le job
        response = client.post(
            "/jobs/run",
            json={"watch_id": watch_id},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        assert response.status_code == 200
        assert response.json()["checks_executed"] == 1

    def test_run_job_no_email_without_change(self, client, registered_user, monkeypatch):
        """Test pas d'email si l'état n'a pas changé."""
        cookies = registered_user["cookies"]
        csrf_token = cookies.get("csrf_token")
        
        # Créer un suivi
        create_res = client.post(
            "/watches",
            json={"url": "https://example.com/product/no-change"},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        watch_id = create_res.json()["id"]
        
        # Mock Email
        fake_backend = FakeEmailBackend()
        set_email_service(EmailService(fake_backend))
        
        # Run 1
        client.post(
            "/jobs/run",
            json={"watch_id": watch_id},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        
        # Run 2
        response = client.post(
            "/jobs/run",
            json={"watch_id": watch_id},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        assert response.json()["changes_detected"] == 0
        assert len(fake_backend.sent_emails) == 0

    def test_run_job_email_sent_on_change(self, client, registered_user, monkeypatch):
        """Test email envoyé si l'état change."""
        cookies = registered_user["cookies"]
        csrf_token = cookies.get("csrf_token")
        
        # Créer un suivi
        create_res = client.post(
            "/watches",
            json={"url": "https://example.com/product/change"},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        watch_id = create_res.json()["id"]
        
        # Mock Email
        fake_backend = FakeEmailBackend()
        set_email_service(EmailService(fake_backend))
        
        # Run 1: IN_STOCK
        monkeypatch.setattr(settings, "fixture_name", "in_stock.html")
        client.post(
            "/jobs/run",
            json={"watch_id": watch_id},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        
        # Run 2: OUT_OF_STOCK
        monkeypatch.setattr(settings, "fixture_name", "out_of_stock.html")
        response = client.post(
            "/jobs/run",
            json={"watch_id": watch_id},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        assert response.json()["changes_detected"] == 1
        assert len(fake_backend.sent_emails) == 1

    def test_run_job_run_all_executes_on_active_watches(self, client, registered_user):
        """Test run_all=true lance les checks sur tous les suivis."""
        cookies = registered_user["cookies"]
        csrf_token = cookies.get("csrf_token")
        
        # Créer 2 suivis
        for i in range(2):
            client.post(
                "/watches",
                json={"url": f"https://example.com/product/{i}"},
                cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
                headers={"X-CSRF-Token": csrf_token},
            )
        
        response = client.post(
            "/jobs/run",
            json={"run_all": True},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        assert response.json()["checks_executed"] == 2

    def test_run_job_without_auth_returns_401(self, client):
        """Test run job sans auth => 401."""
        response = client.post("/jobs/run", json={"run_all": True})
        assert response.status_code == 401

# Test_Jobs_Subset.py