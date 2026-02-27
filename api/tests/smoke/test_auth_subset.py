
class TestAuthSubset:
    """Pack de tests Auth Lot 9."""

    def test_register_success(self, client, test_user_data):
        """Test inscription réussie."""
        response = client.post("/auth/register", json=test_user_data)
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == test_user_data["email"]
        assert "access_token" in response.cookies
        assert "csrf_token" in response.cookies

    def test_register_duplicate_email(self, client, test_user_data):
        """Test inscription avec email déjà existant => 400."""
        client.post("/auth/register", json=test_user_data)
        response = client.post("/auth/register", json=test_user_data)
        assert response.status_code == 400

    def test_login_success(self, client, test_user_data):
        """Test login OK."""
        client.post("/auth/register", json=test_user_data)
        response = client.post("/auth/login", json=test_user_data)
        assert response.status_code == 200
        assert "access_token" in response.cookies

    def test_login_invalid_password(self, client, test_user_data):
        """Test login avec mot de passe invalide => 401."""
        client.post("/auth/register", json=test_user_data)
        response = client.post("/auth/login", json={
            "email": test_user_data["email"],
            "password": "wrongpassword",
        })
        assert response.status_code == 401

    def test_get_watches_without_cookie_returns_401(self, client):
        """Test accès protégé sans cookie => 401."""
        response = client.get("/watches")
        assert response.status_code == 401

    def test_csrf_without_header_returns_403(self, client, registered_user):
        """Test CSRF : POST protégé sans X-CSRF-Token => 403."""
        cookies = registered_user["cookies"]
        response = client.post(
            "/auth/_csrf-check",
            cookies={"access_token": cookies.get("access_token"), "csrf_token": cookies.get("csrf_token")},
        )
        assert response.status_code == 403

    def test_logout_returns_204(self, client, registered_user):
        """Test logout avec CSRF valide => 204."""
        cookies = registered_user["cookies"]
        csrf_token = cookies.get("csrf_token")
        response = client.post(
            "/auth/logout",
            cookies={"access_token": cookies.get("access_token"), "csrf_token": csrf_token},
            headers={"X-CSRF-Token": csrf_token},
        )
        assert response.status_code == 204

# Test_Auth_Subset.py