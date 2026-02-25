import pytest
from app.services.shopify_parser import (
    is_shopify_url, extract_handle, normalize_shopify_variants, 
    match_shopify_variant, check_shopify_availability
)
from app.models.watch import StockState

def test_is_shopify_url():
    assert is_shopify_url("https://mercredimaison.com/products/mon-produit") is True
    assert is_shopify_url("https://mercredimaison.com/en/products/mon-produit") is True
    assert is_shopify_url("https://www.nike.com/t/shoes") is False

def test_extract_handle():
    assert extract_handle("https://mercredimaison.com/products/mon-produit") == "mon-produit"
    assert extract_handle("https://mercredimaison.com/en/products/mon-produit?variant=123") == "mon-produit"
    assert extract_handle("https://mercredimaison.com/products/mon-produit#section") == "mon-produit"
    assert extract_handle("https://mercredimaison.com/invalid") is None

def test_normalize_shopify_variants():
    product_json = {
        "title": "Produit Test",
        "options": [
            {"name": "Couleur", "values": ["Noir", "Blanc"]},
            {"name": "Taille", "values": ["S", "M"]}
        ],
        "variants": [
            {
                "id": 101,
                "title": "Noir / S",
                "option1": "Noir",
                "option2": "S",
                "available": True,
                "sku": "SKU-NOIR-S",
                "price": 5000
            },
            {
                "id": 102,
                "title": "Noir / M",
                "option1": "Noir",
                "option2": "M",
                "available": False,
                "sku": "SKU-NOIR-M",
                "price": 5000
            }
        ]
    }
    
    variants = normalize_shopify_variants(product_json)
    assert len(variants) == 2
    assert variants[0].variant_sku == "101"
    assert variants[0].color == "Noir"
    assert variants[0].size == "S"
    assert variants[0].available is True
    assert variants[0].meta["options"]["Couleur"] == "Noir"
    assert variants[0].meta["options"]["Taille"] == "S"
    
    assert variants[1].available is False

def test_match_shopify_variant():
    product_json = {
        "options": [{"name": "Couleur"}, {"name": "Taille"}],
        "variants": [
            {"id": 101, "option1": "Noir", "option2": "S", "available": True},
            {"id": 102, "option1": "Blanc", "option2": "M", "available": True}
        ]
    }
    variants = normalize_shopify_variants(product_json)
    
    # Correspondance exacte
    v = match_shopify_variant(variants, {"Couleur": "Noir", "Taille": "S"})
    assert v is not None
    assert v.variant_sku == "101"
    
    # Pas de correspondance
    v = match_shopify_variant(variants, {"Couleur": "Bleu"})
    assert v is None
    
    # Correspondance partielle (les options non spécifiées dans le sélecteur sont ignorées dans le matching si non strict, 
    # mais ici on veut que tout ce qui est dans le sélecteur corresponde)
    v = match_shopify_variant(variants, {"Couleur": "Noir"})
    assert v is not None
    assert v.variant_sku == "101"

def test_check_shopify_availability():
    product_json = {
        "variants": [
            {"id": 101, "option1": "Noir", "available": True},
            {"id": 102, "option1": "Blanc", "available": False}
        ],
        "options": [{"name": "Couleur"}]
    }
    
    # Vérification globale (pas de sélecteur)
    state, details = check_shopify_availability(product_json, None)
    assert state == StockState.IN_STOCK.value
    
    # Variante stricte (en stock)
    state, details = check_shopify_availability(product_json, {"Couleur": "Noir"})
    assert state == StockState.IN_STOCK.value
    
    # Variante stricte (en rupture)
    state, details = check_shopify_availability(product_json, {"Couleur": "Blanc"})
    assert state == StockState.OUT_OF_STOCK.value
    
    # Variante stricte (non trouvée)
    state, details = check_shopify_availability(product_json, {"Couleur": "Bleu"})
    assert state == StockState.OUT_OF_STOCK.value
    assert details["error"] == "Variante introuvable"

def test_check_shopify_top_level_guard():
    product_json = {
        "title": "Bougie Flower Shop",
        "available": False, # Épuisé au niveau supérieur
        "variants": [
            {"id": 101, "option1": "Standard", "available": True}
        ],
        "options": [{"name": "Style"}]
    }
    
    # Doit retourner OUT_OF_STOCK à cause du garde-fou au niveau supérieur
    state, details = check_shopify_availability(product_json, None)
    assert state == StockState.OUT_OF_STOCK.value
    assert details["mode"] == "top_level_guard"
    assert details["product_available"] is False

def test_check_shopify_details():
    product_json = {
        "title": "Produit Test",
        "available": True,
        "variants": [
            {"id": 101, "option1": "Rouge", "available": True},
            {"id": 102, "option1": "Bleu", "available": False}
        ],
        "options": [{"name": "Couleur"}]
    }
    
    state, details = check_shopify_availability(product_json, None)
    assert details["product_available"] is True
    assert details["any_available"] is True
    assert details["nb_variants"] == 2
    assert len(details["variant_sample"]) == 2
    assert details["variant_sample"][0]["id"] == "101"

# Test_Shopify_Parser.py