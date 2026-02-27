
class TestWatchesSubset:
    """Pack de tests Watches Lot 9."""

    def test_create_watch_success(self, client, registered_user):
        """Test création d'un suivi réussi."""
        cookies = registered_user["cookies"]
        csrf_token = cookies.get("csrf_token")
        response = client.post(
            "/watches",
            json={"url": "https://www.nike.com/fr/t/af1-123"},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        assert response.status_code == 201
        assert "id" in response.json()

    def test_get_watches_list(self, client, registered_user):
        """Test récupération de la liste des suivis."""
        cookies = registered_user["cookies"]
        response = client.get("/watches", cookies=cookies)
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_get_watch_detail(self, client, registered_user):
        """Test récupération du détail d'un suivi."""
        cookies = registered_user["cookies"]
        csrf_token = cookies.get("csrf_token")
        create_res = client.post(
            "/watches",
            json={"url": "https://www.nike.com/fr/t/af1-123"},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        watch_id = create_res.json()["id"]
        
        response = client.get(f"/watches/{watch_id}", cookies=cookies)
        assert response.status_code == 200
        assert response.json()["id"] == watch_id

    def test_update_watch_success(self, client, registered_user):
        """Test mise à jour d'un suivi (PAUSE)."""
        cookies = registered_user["cookies"]
        csrf_token = cookies.get("csrf_token")
        create_res = client.post(
            "/watches",
            json={"url": "https://www.nike.com/fr/t/af1-123"},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        watch_id = create_res.json()["id"]
        
        response = client.patch(
            f"/watches/{watch_id}",
            json={"status": "PAUSED"},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        assert response.status_code == 200
        assert response.json()["status"] == "PAUSED"

    def test_delete_watch_success(self, client, registered_user):
        """Test suppression d'un suivi."""
        cookies = registered_user["cookies"]
        csrf_token = cookies.get("csrf_token")
        create_res = client.post(
            "/watches",
            json={"url": "https://www.nike.com/fr/t/af1-123"},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        watch_id = create_res.json()["id"]
        
        response = client.delete(
            f"/watches/{watch_id}",
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        assert response.status_code == 204

    def test_get_watch_checks_history(self, client, registered_user):
        """Test récupération de l'historique des checks."""
        cookies = registered_user["cookies"]
        csrf_token = cookies.get("csrf_token")
        create_res = client.post(
            "/watches",
            json={"url": "https://www.nike.com/fr/t/af1-123"},
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        watch_id = create_res.json()["id"]
        
        response = client.get(f"/watches/{watch_id}/checks", cookies=cookies)
        assert response.status_code == 200
        assert isinstance(response.json(), list)

# Test_Watches_Subset.py