from uuid import uuid4
from app.services.email import EmailService, FakeEmailBackend, set_email_service
from app.core.config import settings

def test_integration_happy_path(client, monkeypatch):
    """
    Scénario d'intégration complet :
    1. Register un nouvel utilisateur
    2. Login (via les cookies du register ou via la route login)
    3. Créer une watch (suivi)
    4. Lancer un job (run) qui détecte un état initial
    5. Lancer un second job qui détecte un changement
    6. Vérifier qu'un check a été créé et qu'un email a été envoyé
    """
    # 1. Register
    user_data = {
        "email": f"integration_{uuid4().hex[:8]}@example.com",
        "password": "strongpassword123"
    }
    register_response = client.post("/auth/register", json=user_data)
    assert register_response.status_code == 201
    
    # Récupérer les cookies et le token CSRF
    cookies = register_response.cookies
    csrf_token = cookies.get("csrf_token")
    auth_headers = {"X-CSRF-Token": csrf_token}
    
    # 2. Login (optionnel car register connecte déjà, mais on le fait pour le flow)
    login_response = client.post("/auth/login", json=user_data)
    assert login_response.status_code == 200
    cookies = login_response.cookies
    csrf_token = cookies.get("csrf_token")
    auth_headers = {"X-CSRF-Token": csrf_token}

    # 3. Créer une watch
    watch_data = {"url": "https://www.nike.com/fr/t/chaussure-air-force-1-07-v0X9p0/CW2288-111", "label": "AF1 Integration Test"}
    create_response = client.post(
        "/watches", 
        json=watch_data,
        cookies=cookies,
        headers=auth_headers
    )
    assert create_response.status_code == 201
    watch_id = create_response.json()["id"]

    # Configuration du backend email simulé
    fake_backend = FakeEmailBackend()
    set_email_service(EmailService(fake_backend))

    # 4. Premier run : État initial (IN_STOCK via fixture)
    monkeypatch.setattr(settings, "check_mode", "fixture")
    monkeypatch.setattr(settings, "fixture_name", "in_stock.html")
    
    run1_response = client.post(
        "/jobs/run",
        json={"watch_id": watch_id},
        cookies=cookies,
        headers=auth_headers
    )
    assert run1_response.status_code == 200
    assert run1_response.json()["checks_executed"] == 1
    assert run1_response.json()["changes_detected"] == 0
    assert len(fake_backend.sent_emails) == 0

    # 5. Second run : Changement (OUT_OF_STOCK via fixture)
    monkeypatch.setattr(settings, "fixture_name", "out_of_stock.html")
    
    run2_response = client.post(
        "/jobs/run",
        json={"watch_id": watch_id},
        cookies=cookies,
        headers=auth_headers
    )
    assert run2_response.status_code == 200
    assert run2_response.json()["changes_detected"] == 1
    assert run2_response.json()["emails_sent"] == 1

    # 6. Vérifications finales
    # Vérifier que l'email contient les bonnes infos
    assert len(fake_backend.sent_emails) == 1
    email = fake_backend.sent_emails[0]
    assert user_data["email"] == email["to"]
    assert email["subject"]  # Sujet non vide
    assert watch_data["label"] in email["body"]  # Élément stable

    # Vérifier en base via l'API
    get_response = client.get(f"/watches/{watch_id}", cookies=cookies)
    assert get_response.status_code == 200
    watch_detail = get_response.json()
    assert watch_detail["stock_state"] == "OUT_OF_STOCK"
    
    # Vérifier l'historique des checks
    history_response = client.get(f"/watches/{watch_id}/checks", cookies=cookies)
    assert history_response.status_code == 200
    checks = history_response.json()
    assert len(checks) >= 2
    assert checks[0]["stock_state"] == "OUT_OF_STOCK"
    assert checks[1]["stock_state"] == "IN_STOCK"

# Test_Integration_Happy_Path.py