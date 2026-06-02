"""
Parser Shopify de Nova

Ce module gère les produits Shopify ou compatibles. Il permet de détecter
une URL Shopify, d’extraire le handle produit, d’interroger l’endpoint JSON
natif de Shopify, puis de normaliser les variantes pour le preview et la
vérification de stock.

Il est utilisé par le moteur de check de Nova pour déterminer si un produit,
ou une variante précise, est disponible.
"""

import json
import logging
import re
from typing import Any, Optional
from urllib.parse import urlparse

import httpx
from app.schemas.watch import VariantInfo, PreviewResponse
from app.models.watch import StockState

logger = logging.getLogger(__name__)

def is_shopify_url(url: str) -> bool:
    """Vérifie si l'URL semble être une URL de produit Shopify."""
    if "mercredimaison.com" in url or "myshopify.com" in url:
        return True
    
    # Heuristique : si on arrive à extraire un handle via le pattern /products/, 
    # c'est probablement du Shopify (ou compatible avec notre parser).
    # On exclut Nike qui a son propre parser et peut avoir des patterns différents.
    if "nike.com" in url:
        return False
        
    return extract_handle(url) is not None

def extract_handle(url: str) -> Optional[str]:
    """Extrait le handle du produit à partir de l'URL Shopify."""
    parsed = urlparse(url)
    path = parsed.path
    # Matches /products/<handle> (le handle est la partie juste après /products/)
    # On cherche le pattern standard Shopify qui est très répandu.
    match = re.search(r'/products/([^/?#]+)', path)
    if match:
        return match.group(1)
    return None

def get_shopify_ajax_url(url: str, handle: str) -> str:
    """Construit l'URL AJAX pour un produit Shopify en respectant le préfixe de chemin."""
    parsed = urlparse(url)
    path = parsed.path
    # On extrait le préfixe qui se trouve avant /products/
    prefix = ""
    if "/products/" in path:
        prefix = path.split("/products/")[0]
    
    return f"https://{parsed.netloc}{prefix}/products/{handle}.js"

def fetch_shopify_product_json_sync(handle: str, base_url: str) -> Optional[dict]:
    """Récupère le JSON du produit via l'endpoint Shopify AJAX (version synchrone)."""
    ajax_url = get_shopify_ajax_url(base_url, handle)
    logger.info(f"Fetching Shopify AJAX (sync): {ajax_url}")
    
    try:
        # On utilise httpx.Client au lieu de AsyncClient
        with httpx.Client(timeout=10.0) as client:
            response = client.get(ajax_url)
            logger.info(f"Shopify AJAX sync response: status={response.status_code}, content_type={response.headers.get('content-type')}")
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Shopify AJAX sync error {response.status_code} for {ajax_url}")
    except Exception as e:
        logger.error(f"Shopify AJAX sync exception: {str(e)}")
    return None

async def fetch_shopify_product_json(handle: str, base_url: str) -> Optional[dict]:
    """Récupère le JSON du produit via l'endpoint Shopify AJAX."""
    ajax_url = get_shopify_ajax_url(base_url, handle)
    logger.info(f"Fetching Shopify AJAX: {ajax_url}")
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(ajax_url)
            logger.info(f"Shopify AJAX response: status={response.status_code}, content_type={response.headers.get('content-type')}")
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Shopify AJAX error {response.status_code} for {ajax_url}")
        except Exception as e:
            logger.error(f"Shopify AJAX exception: {str(e)}")
    return None

def normalize_shopify_variants(product_json: dict) -> list[VariantInfo]:
    """Normalise les variantes Shopify en VariantInfo."""
    variants = []
    # Log debug pour reproduction
    nb_variants = len(product_json.get("variants", []))
    logger.info(f"Normalizing Shopify variants: title='{product_json.get('title')}', nb_variants={nb_variants}")
    
    options_names = [opt.get("name") for opt in product_json.get("options", [])]
    
    for i, v in enumerate(product_json.get("variants", [])):
        # Log les 3 premières variantes
        if i < 3:
            logger.info(f"Variant {i}: id={v.get('id')}, available={v.get('available')}, inv_qty={v.get('inventory_quantity')}")
            
        meta = {
            "id": v.get("id"),
            "sku": v.get("sku"),
            "price": v.get("price"),
            "options": {},
            "inventory_quantity": v.get("inventory_quantity")
        }
        
        # Mapping options
        for j, opt_name in enumerate(options_names):
            opt_key = f"option{j+1}"
            if v.get(opt_key):
                meta["options"][opt_name] = v.get(opt_key)
        
        # Les variantes Shopify n'ont souvent pas de champs "couleur" ou "taille" explicites dans le JSON,
        # elles sont dans option1, option2, etc.
        # On essaiera de deviner ou on utilisera simplement les premières options.
        size = None
        color = None
        for name, value in meta["options"].items():
            name_lower = name.lower()
            if "taille" in name_lower or "size" in name_lower:
                size = value
            elif "couleur" in name_lower or "color" in name_lower:
                color = value

        # Vérification stricte du champ available
        is_available = v.get("available")
        if is_available is not True:
            is_available = False

        variants.append(VariantInfo(
            variant_sku=str(v.get("id")), # Utiliser l'ID Shopify comme SKU technique
            color=color,
            size=size,
            available=is_available,
            meta=meta
        ))
    return variants

async def fetch_shopify_preview(url: str) -> PreviewResponse:
    """Génère un preview pour un produit Shopify."""
    handle = extract_handle(url)
    if not handle:
        return PreviewResponse(source="shopify", variants=[], debug_info={"error": "Handle non trouvé"})
    
    product_json = await fetch_shopify_product_json(handle, url)
    if not product_json:
        return PreviewResponse(source="shopify", variants=[], debug_info={"error": "JSON produit non récupérable"})
    
    variants = normalize_shopify_variants(product_json)
    return PreviewResponse(
        title=product_json.get("title"),
        source="shopify",
        variants=variants
    )

def match_shopify_variant(variants: list[VariantInfo], selector: dict[str, Any]) -> Optional[VariantInfo]:
    """Trouve la variante exacte correspondant au sélecteur."""
    if not selector:
        return None
    
    for v in variants:
        v_options = v.meta.get("options", {})
        match = True
        for key, value in selector.items():
            if v_options.get(key) != value:
                match = False
                break
        if match:
            return v
    return None

def check_shopify_availability(product_json: dict, variant_selector: dict[str, Any] | None = None) -> tuple[str, dict[str, Any]]:
    """Vérifie le stock pour Shopify (via JSON)."""
    if not product_json or not isinstance(product_json, dict) or "variants" not in product_json:
        logger.error("Shopify JSON invalid or empty")
        return StockState.UNKNOWN.value, {"error": "JSON invalide", "source": "shopify"}

    # Garde-fou
    # Si le produit entier est marqué indisponible au top-level, on s'arrête là.
    product_available = product_json.get("available")
    
    variants = normalize_shopify_variants(product_json)
    if not variants:
        logger.warning(f"No variants found for product: {product_json.get('title')}")
        return StockState.OUT_OF_STOCK.value, {"error": "Aucune variante trouvée", "source": "shopify"}

    # Calcul de any_available pour les logs et détails
    any_available = any(v.available is True for v in variants)

    # Échantillon des variantes pour le debug
    variant_sample = [
        {"id": v.variant_sku, "available": v.available}
        for v in variants[:5]
    ]

    details = {
        "source": "shopify",
        "product_title": product_json.get("title"),
        "product_available": product_available,
        "any_available": any_available,
        "nb_variants": len(variants),
        "variant_sample": variant_sample
    }
    
    # Garde-fou au niveau supérieur
    if product_available is False:
        logger.info(f"Shopify Top-level 'available' is False for '{product_json.get('title')}'")
        details["mode"] = "top_level_guard"
        return StockState.OUT_OF_STOCK.value, details

    if not variant_selector:
        # Si pas de sélecteur, dispo si au moins une variante est dispo
        details["mode"] = "global"
        
        state = StockState.IN_STOCK.value if any_available else StockState.OUT_OF_STOCK.value
        logger.info(f"Shopify Global stock check for '{product_json.get('title')}': {state}")
        return state, details

    # Matching variante exacte
    selected_variant = match_shopify_variant(variants, variant_selector)
    if not selected_variant:
        details["mode"] = "variant_strict"
        details["error"] = "Variante introuvable"
        details["requested_selector"] = variant_selector
        logger.warning(f"Shopify variant not found for selector {variant_selector}")
        return StockState.OUT_OF_STOCK.value, details
    
    details["mode"] = "variant_strict"
    details["found_variant"] = selected_variant.meta
    details["found_variant_available"] = selected_variant.available
    
    if selected_variant.available is True:
        logger.info(f"Shopify Variant check: IN_STOCK for {variant_selector}")
        return StockState.IN_STOCK.value, details
    else:
        logger.info(f"Shopify Variant check: OUT_OF_STOCK for {variant_selector}")
        return StockState.OUT_OF_STOCK.value, details

# Shoprify_Parser.py