import pytest
from app.models.watch import Watch, WatchStatus, StockState

def test_list_watches_success(client, registered_user):
    """Test que GET /watches retourne 200 et la liste des suivis."""
    cookies = registered_user["cookies"]
    
    # Créer un suivi pour l'utilisateur
    # On utilise l'API pour être sûr que ça passe par le nouveau code
    response = client.post(
        "/watches",
        json={
            "url": "https://mercredimaison.com/products/bougie-flower-shop",
            "label": "Bougie Flower Shop",
            "variant_selector": {"Couleur": "Unique"}
        },
        cookies=cookies,
        headers={"X-CSRF-Token": cookies.get("csrf_token")}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["variant_selector"] == {"Couleur": "Unique"}
    
    # Lister les suivis
    response = client.get("/watches", cookies=cookies)
    assert response.status_code == 200
    watches = response.json()
    assert len(watches) >= 1
    
    # Vérifier que variant_selector est présent dans la liste
    watch = next(w for w in watches if w["id"] == data["id"])
    assert watch["variant_selector"] == {"Couleur": "Unique"}

def test_get_watch_detail_success(client, registered_user):
    """Test que GET /watches/{id} retourne 200 et les détails avec variant_selector."""
    cookies = registered_user["cookies"]
    
    # Créer une watch
    response = client.post(
        "/watches",
        json={
            "url": "https://mercredimaison.com/products/another",
            "variant_selector": {"Taille": "M"}
        },
        cookies=cookies,
        headers={"X-CSRF-Token": cookies.get("csrf_token")}
    )
    watch_id = response.json()["id"]
    
    # Voir le détail
    response = client.get(f"/watches/{watch_id}", cookies=cookies)
    assert response.status_code == 200
    data = response.json()
    assert data["variant_selector"] == {"Taille": "M"}

# Test_Watches_500_fix.py