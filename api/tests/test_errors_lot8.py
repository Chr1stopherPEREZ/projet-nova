import pytest
from fastapi import status
from uuid import uuid4

def test_404_watch_not_found_standard_format(client, auth_cookies):
    """Vérifie que le format d'erreur pour une watch inexistante est standard."""
    fake_id = uuid4()
    response = client.get(f"/watches/{fake_id}", cookies=auth_cookies)
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "WATCH_NOT_FOUND"
    assert "message" in data["error"]
    assert data["error"]["details"]["watch_id"] == str(fake_id)

def test_401_unauthenticated_standard_format(client):
    """Vérifie le format d'erreur pour un accès non authentifié."""
    # On s'assure qu'aucun cookie n'est présent
    response = client.get("/watches")
    
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "NOT_AUTHENTICATED"

def test_422_validation_error_standard_format(client, auth_cookies, auth_headers):
    """Vérifie le format d'erreur pour une erreur de validation (Pydantic)."""
    # URL invalide (pas une URL)
    payload = {"url": "not-an-url", "label": "Test"}
    response = client.post("/watches", json=payload, cookies=auth_cookies, headers=auth_headers)
    
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    data = response.json()
    assert "error" in data
    assert data["error"]["code"] == "VALIDATION_ERROR"
    assert "fields" in data["error"]["details"]
    assert len(data["error"]["details"]["fields"]) > 0
    assert data["error"]["details"]["fields"][0]["field"] == "url"

def test_403_csrf_invalid_standard_format(client, auth_cookies):
    """Vérifie le format d'erreur pour un CSRF invalide."""
    # On envoie un mauvais token CSRF dans le header
    bad_headers = {"X-CSRF-Token": "wrong-token"}
    
    # On s'assure qu'on est en "production" pour que le CSRF soit activé
    from app.core.config import settings
    original_env = settings.app_env
    settings.app_env = "production"
    
    try:
        payload = {"url": "https://nike.com/test", "label": "Test"}
        response = client.post("/watches", json=payload, cookies=auth_cookies, headers=bad_headers)
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
        data = response.json()
        assert "error" in data
        assert data["error"]["code"] == "CSRF_INVALID"
    finally:
        settings.app_env = original_env

# Test_Errors_Lot8.py