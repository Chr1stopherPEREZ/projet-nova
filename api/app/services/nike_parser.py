"""
Parser Nike pour extraire les variantes (coloris, tailles, SKU) depuis une page produit.
Extrait les données depuis le JSON __NEXT_DATA__ embarqué dans la page.
"""
import json
import logging
import re
from typing import Any

import httpx

from app.schemas.watch import VariantInfo, PreviewResponse


def extract_nike_variants_from_html(html: str, url: str) -> list[VariantInfo]:
    """
    Extrait les variantes Nike directement depuis le HTML (fallback).
    Cherche les boutons de taille et leur état (disabled).
    
    Args:
        html: Contenu HTML de la page
        url: URL du produit pour générer des SKUs stables
        
    Returns:
        Liste de VariantInfo
    """
    variants = []
    
    # Normalisation basique de l'URL pour le SKU synthétique
    clean_url = url.split('?')[0].rstrip('/')
    
    # 1. Tenter de trouver les boutons de taille via regex
    # Nike utilise souvent des boutons avec des libellés comme "EU 42" ou similaire
    # et des attributs aria-disabled="true" ou disabled
    
    # Pattern pour capturer le texte de la taille et l'état
    # Exemple: <button ...>EU 42</button>
    # On cherche des éléments qui ressemblent à des sélecteurs de taille
    
    # On cherche d'abord le bloc contenant les tailles pour limiter le bruit
    size_grid_match = re.search(r'fieldset[^>]*data-testid="sku-selector"[^>]*>(.*?)</fieldset>', html, re.DOTALL)
    if not size_grid_match:
        # Fallback sur une recherche plus large si le fieldset n'est pas trouvé
        size_grid_content = html
    else:
        size_grid_content = size_grid_match.group(1)

    # Recherche des labels de taille (souvent dans des <label> ou <button>)
    # On cherche des patterns de type: <input ... id="sku-input-XXXX" ... disabled="" ...> <label ...>EU 44</label>
    # Ou des boutons directs
    
    # Approche 1: Chercher les inputs radio (souvent utilisés pour les tailles)
    # <input type="radio" ... id="sku-input-25032049" name="sku-adapter" value="25032049" ... disabled="">
    input_pattern = r'<input[^>]*type="radio"[^>]*id="([^"]+)"[^>]*value="([^"]+)"[^>]*>'
    inputs = re.finditer(input_pattern, size_grid_content)
    
    input_map = {} # id -> is_disabled
    for m in inputs:
        full_tag = m.group(0)
        input_id = m.group(1)
        is_disabled = 'disabled' in full_tag or 'aria-disabled="true"' in full_tag
        input_map[input_id] = is_disabled

    # Associer avec les labels
    # <label for="sku-input-25032049" ...>EU 44</label>
    for input_id, is_disabled in input_map.items():
        label_pattern = f'<label[^>]*for="{input_id}"[^>]*>(.*?)</label>'
        label_match = re.search(label_pattern, size_grid_content, re.DOTALL)
        if label_match:
            size_text = re.sub(r'<[^>]+>', '', label_match.group(1)).strip()
            if size_text:
                # Générer un SKU synthétique stable
                # Format: nike|url|color|size
                synth_sku = f"nike|{clean_url}|unknown|{size_text}"
                
                variants.append(VariantInfo(
                    variant_sku=synth_sku,
                    size=size_text,
                    available=not is_disabled,
                    meta={
                        "source": "html_fallback",
                        "size": size_text,
                        "html_id": input_id
                    }
                ))

    # Approche 2 : Si rien trouvé, chercher des boutons avec des libellés de taille
    if not variants:
        # <button ... data-testid="size-grid-button" ...>EU 42.5</button>
        btn_pattern = r'<button[^>]*data-testid="size-grid-button"[^>]*>(.*?)</button>'
        btns = re.finditer(btn_pattern, size_grid_content)
        for m in btns:
            full_tag = m.group(0)
            size_text = re.sub(r'<[^>]+>', '', m.group(1)).strip()
            if size_text:
                is_disabled = 'disabled' in full_tag or 'aria-disabled="true"' in full_tag
                synth_sku = f"nike|{clean_url}|unknown|{size_text}"
                
                variants.append(VariantInfo(
                    variant_sku=synth_sku,
                    size=size_text,
                    available=not is_disabled,
                    meta={
                        "source": "html_fallback",
                        "size": size_text
                    }
                ))

    # Approche 3 : Fallback Regex plus large (ex: EU 42-46)
    if not variants:
        # On cherche des occurrences de "EU" suivies de chiffres
        # On évite de matcher trop large en limitant le contexte
        # On cherche par exemple : EU 42, EU 42.5, EU 40-44
        eu_pattern = r'(?:EU\s*)(\d+(?:[.,]\d+)?(?:\s*-\s*\d+(?:[.,]\d+)?)?)'
        matches = re.finditer(eu_pattern, size_grid_content)
        seen_sizes = set()
        for m in matches:
            size_text = m.group(1).strip()
            # On rajoute EU pour la cohérence si on l'a matché
            full_size_text = f"EU {size_text}"
            
            if full_size_text in seen_sizes:
                continue
            seen_sizes.add(full_size_text)
            
            # Rechercher la disponibilité dans le voisinage du match (environ 100 caractères)
            start_pos = max(0, m.start() - 100)
            end_pos = min(len(size_grid_content), m.end() + 100)
            context = size_grid_content[start_pos:end_pos]
            
            # Si on voit "disabled" ou "aria-disabled=\"true\"" près de la taille
            is_disabled = ('disabled' in context) or ('aria-disabled="true"' in context)
            
            # Si on ne voit rien d'évident, available=None (indéterminé)
            available_val = False if is_disabled else None
            
            synth_sku = f"nike|{clean_url}|unknown|{full_size_text}"
            variants.append(VariantInfo(
                variant_sku=synth_sku,
                size=full_size_text,
                available=available_val,
                meta={
                    "source": "html_fallback_regex",
                    "size": full_size_text,
                    "regex_match": m.group(0)
                }
            ))

    return variants

logger = logging.getLogger(__name__)


def is_sku_like_item(item: dict) -> bool:
    """
    Vérifie si un dict ressemble à un SKU Nike.
    
    Un SKU a typiquement:
    - Un identifiant: skuId, id, sku, productId
    - Un indicateur de stock: available, inStock, isAvailable, stockLevel, level
    
    Args:
        item: Dictionnaire à vérifier
    
    Returns:
        True si l'item ressemble à un SKU
    """
    if not isinstance(item, dict):
        return False
    
    id_keys = {"skuId", "id", "sku", "productId", "variantId", "skuCode", "gtin", "merchSku"}
    # Clés de disponibilité possibles
    stock_keys = {"available", "inStock", "isAvailable", "stockLevel", "level", "inventory", "quantity", "stock"}
    
    has_id = any(k in item for k in id_keys)
    has_stock = any(k in item for k in stock_keys)
    
    # Un SKU valide a au moins un ID et idéalement un indicateur de stock
    # Mais on accepte aussi s'il a un ID + une taille (nikeSize, size)
    has_size = "nikeSize" in item or "size" in item or "localizedSize" in item
    
    return has_id and (has_stock or has_size)


def find_sku_like_arrays(obj: Any, depth: int = 0, max_depth: int = 20, found_arrays: list | None = None) -> list[tuple[str, list]]:
    """
    Parcourt récursivement un objet JSON pour trouver des listes "sku-like".
    
    Une liste sku-like contient plusieurs dicts où la majorité ont:
    - skuId/id + available/inStock/stockLevel
    
    Args:
        obj: Objet JSON (dict ou list)
        depth: Profondeur actuelle
        max_depth: Profondeur maximale
        found_arrays: Liste des arrays trouvés (key_path, array)
    
    Returns:
        Liste de tuples (key_name, array) contenant des SKUs potentiels
    """
    if found_arrays is None:
        found_arrays = []
    
    if depth > max_depth:
        return found_arrays
    
    if isinstance(obj, dict):
        for key, value in obj.items():
            # Si c'est une liste, vérifier si elle contient des SKUs
            if isinstance(value, list) and len(value) >= 2:
                # Compter combien d'items ressemblent à des SKUs
                sku_like_count = sum(1 for item in value if is_sku_like_item(item))
                # Si au moins 50% des items sont sku-like et au moins 2, c'est une liste de SKUs
                if sku_like_count >= 2 and sku_like_count / len(value) >= 0.5:
                    logger.debug(f"Trouvé array sku-like '{key}' avec {sku_like_count}/{len(value)} items à profondeur {depth}")
                    found_arrays.append((key, value))
            # Continuer la recherche récursive
            find_sku_like_arrays(value, depth + 1, max_depth, found_arrays)
    
    elif isinstance(obj, list):
        for item in obj:
            find_sku_like_arrays(item, depth + 1, max_depth, found_arrays)
    
    return found_arrays


def find_product_like_object(obj: Any, depth: int = 0, max_depth: int = 15) -> dict | None:
    """
    Parcourt récursivement un objet JSON pour trouver un objet "product-like".
    
    Un objet product-like contient:
    - Une liste `skus` (objets avec skuId/id + available/inStock/stockLevel)
    - Et/ou une liste `colorways`/colors
    
    Args:
        obj: Objet JSON (dict ou list)
        depth: Profondeur actuelle (pour éviter récursion infinie)
        max_depth: Profondeur maximale
    
    Returns:
        Dictionnaire product-like ou None
    """
    if depth > max_depth:
        return None
    
    if isinstance(obj, dict):
        # Vérifier si c'est un objet product-like
        skus = obj.get("skus") or obj.get("availableSkus") or obj.get("productSkus")
        colorways = obj.get("colorways") or obj.get("colors")
        
        # Un produit valide a soit des skus, soit des colorways
        if isinstance(skus, list) and len(skus) > 0:
            # Vérifier que les skus ont une structure valide
            first_sku = skus[0] if skus else {}
            if isinstance(first_sku, dict) and ("skuId" in first_sku or "id" in first_sku):
                logger.debug(f"Trouvé objet product-like avec {len(skus)} SKUs à profondeur {depth}")
                return obj
        
        if isinstance(colorways, list) and len(colorways) > 0:
            first_cw = colorways[0] if colorways else {}
            if isinstance(first_cw, dict) and ("colorCode" in first_cw or "colorId" in first_cw or "pid" in first_cw):
                logger.debug(f"Trouvé objet product-like avec {len(colorways)} colorways à profondeur {depth}")
                return obj
        
        # Parcourir les valeurs du dict
        for key, value in obj.items():
            result = find_product_like_object(value, depth + 1, max_depth)
            if result:
                return result
    
    elif isinstance(obj, list):
        for item in obj:
            result = find_product_like_object(item, depth + 1, max_depth)
            if result:
                return result
    
    return None


def extract_next_data(html: str) -> dict | None:
    """
    Extrait le JSON __NEXT_DATA__ depuis le HTML Nike.
    
    Args:
        html: Contenu HTML de la page
    
    Returns:
        Dictionnaire JSON ou None si non trouvé
    """
    pattern = r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>'
    match = re.search(pattern, html, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError as e:
            logger.warning(f"Erreur parsing __NEXT_DATA__: {e}")
    return None


def parse_nike_variants(data: dict) -> tuple[str | None, list[VariantInfo], dict[str, Any]]:
    """
    Parse les variantes depuis le JSON __NEXT_DATA__ de Nike.
    
    Args:
        data: Dictionnaire JSON de __NEXT_DATA__
    
    Returns:
        Tuple (title, liste de VariantInfo, debug_info)
    """
    variants = []
    title = None
    debug_info: dict[str, Any] = {}
    
    try:
        # Naviguer dans la structure Nike
        # Structure typique: props.pageProps.initialState.products ou similar
        props = data.get("props", {})
        page_props = props.get("pageProps", {})
        
        # Chercher le produit dans différentes structures possibles
        product = None
        
        # Structure 1: pageProps.initialState.Threads.products
        initial_state = page_props.get("initialState", {})
        threads = initial_state.get("Threads", {})
        products = threads.get("products", {})
        
        if products:
            # Premier produit trouvé
            for pid, prod in products.items():
                product = prod
                break
        
        # Structure 2: pageProps.product directement
        if not product:
            product = page_props.get("product", {})
        
        # Structure 3 : queries Apollo style
        if not product:
            queries = initial_state.get("queries", {})
            for key, query_data in queries.items():
                if "product" in str(query_data).lower():
                    data_content = query_data.get("data", {})
                    product = data_content.get("product", {})
                    if product:
                        break
        
        # Structure 4 : FALLBACK RÉCURSIF - parcourir tout le JSON pour objet product-like
        if not product:
            logger.info("Structures connues non trouvées, tentative de recherche récursive...")
            product = find_product_like_object(data)
            if product:
                logger.info("Produit trouvé via recherche récursive")
        
        # Structure 5 : FALLBACK SKU-LIKE ARRAYS - chercher des listes de SKUs n'importe où
        sku_arrays_found = []
        if not product:
            logger.info("Recherche de listes sku-like dans le JSON...")
            sku_arrays_found = find_sku_like_arrays(data)
            if sku_arrays_found:
                # Prendre le plus grand array trouvé
                key_name, best_array = max(sku_arrays_found, key=lambda x: len(x[1]))
                logger.info(f"Trouvé liste sku-like '{key_name}' avec {len(best_array)} items")
                # Créer un pseudo-produit avec ces SKUs
                product = {"skus": best_array, "_source": f"sku_array:{key_name}"}
        
        # Remplir debug_info avec les statistiques initiales (avant extraction)
        debug_info["found_sku_arrays_count"] = len(sku_arrays_found)
        if sku_arrays_found:
            key_name, best_array = max(sku_arrays_found, key=lambda x: len(x[1]))
            debug_info["best_sku_array_len"] = len(best_array)
            debug_info["best_sku_array_key"] = key_name
            if len(best_array) > 0 and isinstance(best_array[0], dict):
                debug_info["best_sku_array_sample_keys"] = list(best_array[0].keys())[:15]
        
        if not product:
            logger.warning("Aucun produit trouvé dans __NEXT_DATA__ (après toutes les stratégies)")
            debug_info["found_sku_arrays"] = [(k, len(v)) for k, v in sku_arrays_found] if sku_arrays_found else []
            return title, variants, debug_info
        
        # Extraire le titre
        title = product.get("title") or product.get("name") or product.get("productTitle")
        
        # Extraire les SKUs/variantes
    # Nike utilise typiquement : skus, availableSkus, productSkus
        skus = product.get("skus") or product.get("availableSkus") or []
        
        # Si toujours pas de SKUs et qu'on a trouvé des arrays sku-like, les utiliser
        if not skus and sku_arrays_found:
            _, best_array = max(sku_arrays_found, key=lambda x: len(x[1]))
            skus = best_array
        
        # Extraire les couleurs depuis colorways ou similar
        colorways = product.get("colorways") or product.get("colors") or []
        colorway_map = {}
        for cw in colorways:
            color_code = cw.get("colorCode") or cw.get("colorId")
            if color_code:
                colorway_map[color_code] = {
                    "label": cw.get("label") or cw.get("colorDescription") or cw.get("fullTitle"),
                    "inStock": cw.get("inStock", cw.get("available")),
                }
        
        # Parser chaque SKU
        for sku in skus:
            sku_id = sku.get("skuId") or sku.get("id")
            if not sku_id:
                continue
            
            # Extraire couleur et taille
            nike_size = sku.get("nikeSize") or sku.get("size") or sku.get("localizedSize")
            color_code = sku.get("colorCode") or sku.get("colorId")
            
            # Obtenir le label de la couleur
            color_label = None
            if color_code and color_code in colorway_map:
                color_label = colorway_map[color_code].get("label")
            
            # Disponibilité - chercher dans plusieurs champs possibles
            available = sku.get("available")
            if available is None:
                available = sku.get("inStock")
            if available is None:
                available = sku.get("isAvailable")
            if available is None and ("stockLevel" in sku or "stock" in sku):
                stock_val = sku.get("stockLevel", sku.get("stock"))
                if isinstance(stock_val, (int, float)):
                    available = stock_val > 0
                elif isinstance(stock_val, str):
                    available = stock_val.upper() in ("IN_STOCK", "AVAILABLE", "TRUE")
            if available is None and "level" in sku:
                available = sku.get("level", 0) > 0
            if available is None and "quantity" in sku:
                available = sku.get("quantity", 0) > 0
            
            variant = VariantInfo(
                variant_sku=sku_id,
                color=color_label,
                size=str(nike_size) if nike_size else None,
                available=available,
                meta={
                    "colorCode": color_code,
                    "nikeSize": nike_size,
                    "skuId": sku_id,
                }
            )
            variants.append(variant)
        
        # Si pas de SKUs mais des colorways, créer des variantes par couleur
        if not variants and colorways:
            for cw in colorways:
                color_code = cw.get("colorCode") or cw.get("colorId")
                sku_id = cw.get("pid") or color_code or cw.get("styleColor")
                
                if sku_id:
                    variant = VariantInfo(
                        variant_sku=str(sku_id),
                        color=cw.get("label") or cw.get("colorDescription"),
                        size=None,  # Colorway sans taille spécifique
                        available=cw.get("inStock", cw.get("available")),
                        meta={
                            "colorCode": color_code,
                            "styleColor": cw.get("styleColor"),
                            "url": cw.get("url"),
                        }
                    )
                    variants.append(variant)
        
        # Remplir debug_info avec les statistiques
        debug_info["found_sku_arrays"] = [(k, len(v)) for k, v in sku_arrays_found] if sku_arrays_found else []
        debug_info["skus_count"] = len(skus)
        debug_info["variants_count"] = len(variants)
        debug_info["product_source"] = product.get("_source", "standard")
        if skus and len(skus) > 0 and isinstance(skus[0], dict):
            debug_info["sample_sku_keys"] = list(skus[0].keys())[:15]  # Limiter à 15 clés
        
    except Exception as e:
        logger.error(f"Erreur parsing Nike variants: {e}")
        debug_info["error"] = str(e)
    
    return title, variants, debug_info


async def fetch_nike_preview(url: str, timeout: float = 15.0) -> PreviewResponse:
    """
    Récupère le preview d'un produit Nike depuis son URL.
    
    Args:
        url: URL de la page produit Nike
        timeout: Timeout pour la requête HTTP
    
    Returns:
        PreviewResponse avec les variantes et debug_info en cas d'échec
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    }
    
    debug_info: dict[str, Any] = {}
    
    try:
        async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            html = response.text
            debug_info["http_status"] = response.status_code
    except httpx.HTTPError as e:
        logger.error(f"Erreur HTTP lors du fetch Nike: {e}")
        debug_info["error"] = f"HTTP error: {str(e)}"
        return PreviewResponse(title=None, source="nike", variants=[], debug_info=debug_info)
    
    # Extraire __NEXT_DATA__
    next_data = extract_next_data(html)
    
    # Collecte d'infos de debug HTML
    debug_info["html_len"] = len(html)
    debug_info["html_has_next_data"] = next_data is not None
    debug_info["html_has_size_testid"] = ('data-testid="sku-selector"' in html) or ('data-testid="size-grid-button"' in html) or ('name="sku-adapter"' in html)
    debug_info["html_has_eu"] = "EU" in html
    debug_info["html_snippet"] = (html[:180] + "...") if len(html) > 180 else html
    
    # Extraire le titre du HTML si possible (fallback)
    html_title_match = re.search(r'<title[^>]*>(.*?)</title>', html, re.I)
    if html_title_match:
        debug_info["html_title"] = html_title_match.group(1).strip()
    
    # Heuristique anti-bot/consentement
    anti_bot_reasons: list[str] = []
    if debug_info["html_len"] < 8000:
        anti_bot_reasons.append("short_html")
    if not debug_info["html_has_eu"]:
        anti_bot_reasons.append("no_eu_sizes_text")
    if not debug_info["html_has_size_testid"]:
        anti_bot_reasons.append("no_size_selectors")
    debug_info["anti_bot_suspected"] = len(anti_bot_reasons) > 0
    if anti_bot_reasons:
        debug_info["anti_bot_reasons"] = anti_bot_reasons
    
    if not next_data:
        logger.warning(f"__NEXT_DATA__ non trouvé pour {url}")
        debug_info["error"] = "NEXT_DATA_NOT_FOUND"
        # Tenter quand même le fallback HTML si pas de NEXT_DATA
        html_variants = extract_nike_variants_from_html(html, url)
        if html_variants:
            debug_info["html_fallback_used"] = True
            debug_info["html_sizes_count"] = len(html_variants)
            debug_info["html_sizes_sample"] = [v.size for v in html_variants[:5]]
            return PreviewResponse(
                title=debug_info.get("html_title"),
                source="nike",
                variants=html_variants,
                debug_info=debug_info
            )
        return PreviewResponse(title=debug_info.get("html_title"), source="nike", variants=[], debug_info=debug_info)
    
    title, variants, parse_debug = parse_nike_variants(next_data)
    
    # Si le titre n'a pas été trouvé dans NEXT_DATA, utiliser celui du HTML
    if not title:
        title = debug_info.get("html_title")
    
    # Fusionner debug_info du parsing
    debug_info.update(parse_debug)
    debug_info["next_data_keys"] = list(next_data.keys()) if next_data else []
    
    if not variants:
        debug_info["warning"] = "NO_VARIANTS_EXTRACTED"
        
        # Fallback HTML
        logger.info(f"Tentative de fallback HTML pour {url}")
        html_variants = extract_nike_variants_from_html(html, url)
        if html_variants:
            variants = html_variants
            debug_info["html_fallback_used"] = True
            debug_info["html_sizes_count"] = len(html_variants)
            debug_info["html_sizes_sample"] = [v.size for v in html_variants[:5]]
            logger.info(f"Fallback HTML réussi: {len(html_variants)} tailles trouvées")
        else:
            debug_info["html_fallback_used"] = False
            logger.warning("Fallback HTML échoué (aucune taille trouvée)")
    
    return PreviewResponse(
        title=title,
        source="nike",
        variants=variants,
        debug_info=debug_info if debug_info else None
    )


def is_nike_url(url: str) -> bool:
    """Vérifie si l'URL est une URL Nike."""
    return "nike.com" in url.lower()


async def fetch_preview(url: str) -> PreviewResponse:
    """
    Récupère le preview d'un produit depuis son URL.
    Détecte automatiquement la source (Nike ou générique).
    
    Args:
        url: URL de la page produit
    
    Returns:
        PreviewResponse avec les variantes
    """
    if is_nike_url(url):
        return await fetch_nike_preview(url)
    
    # Pour les autres sites: retourner un preview générique vide
    # TODO: Ajouter d'autres parsers (Amazon, Zalando, etc.)
    return PreviewResponse(
        title=None,
        source="generic",
        variants=[]
    )


def check_variant_availability(
    html: str,
    variant_sku: str,
    variant_meta: dict[str, Any] | None = None
) -> tuple[str, dict[str, Any]]:
    """
    Vérifie la disponibilité d'une variante spécifique depuis le HTML Nike.
    
    Args:
        html: Contenu HTML de la page
        variant_sku: SKU de la variante à vérifier
        variant_meta: Métadonnées de la variante (couleur, taille, etc.)
    
    Returns:
        Tuple (stock_state: IN_STOCK|OUT_OF_STOCK|UNKNOWN, details: dict)
    """
    from app.models.watch import StockState
    
    next_data = extract_next_data(html)
    variants = []
    title = None
    
    if next_data:
        title, variants, _ = parse_nike_variants(next_data)
    
    details = {
        "variant_sku": variant_sku,
        "title": title,
    }
    
    if variant_meta:
        details["color"] = variant_meta.get("color")
        details["size"] = variant_meta.get("size")
    
    # Chercher la variante par SKU
    for v in variants:
        if v.variant_sku == variant_sku:
            details["found"] = True
            details["available_in_source"] = v.available
            details["mode"] = "SKU_MATCH"
            
            if v.available is True:
                return StockState.IN_STOCK.value, details
            elif v.available is False:
                return StockState.OUT_OF_STOCK.value, details
            else:
                return StockState.UNKNOWN.value, details
    
    # Mode FALLBACK: si on a colorCode et size (pour Nike spécifiquement)
    if variant_meta and variant_meta.get("colorCode") and variant_meta.get("size"):
        requested_color = variant_meta["colorCode"]
        requested_size = str(variant_meta["size"])
        details["requested_colorCode"] = requested_color
        details["requested_size"] = requested_size
        
        for v in variants:
            v_color = v.meta.get("colorCode") if v.meta else None
            # Comparaison de taille flexible (42 vs "42")
            v_size = str(v.size) if v.size else None
            
            if v_color == requested_color and v_size == requested_size:
                details["found"] = True
                details["mode"] = "COLOR_SIZE_FALLBACK"
                details["available_in_source"] = v.available
                
                if v.available is True:
                    return StockState.IN_STOCK.value, details
                elif v.available is False:
                    return StockState.OUT_OF_STOCK.value, details
                else:
                    return StockState.UNKNOWN.value, details

    # Mode COLOR_ONLY : seulement si pas de taille demandée
    if variant_meta and variant_meta.get("colorCode") and not variant_meta.get("size"):
        color_code = variant_meta["colorCode"]
        matching_sizes = []
        any_available = False
        
        for v in variants:
            if v.meta and v.meta.get("colorCode") == color_code:
                if v.size:
                    matching_sizes.append({
                        "size": v.size,
                        "available": v.available
                    })
                if v.available:
                    any_available = True
        
        if matching_sizes:
            details["mode"] = "COLOR_ONLY"
            details["available_sizes"] = [s for s in matching_sizes if s.get("available")]
            details["all_sizes"] = matching_sizes
            
            if any_available:
                return StockState.IN_STOCK.value, details
            else:
                return StockState.OUT_OF_STOCK.value, details
    
    # Variante non trouvée dans NEXT_DATA -> Fallback HTML
    if variant_meta and variant_meta.get("size"):
        requested_size = str(variant_meta["size"])
        # Utiliser l'URL de variant_meta ou l'URL de base si possible
        product_url = variant_meta.get("url") or ""
        
        logger.info(f"[NIKE_PARSER] Variante {variant_sku} non trouvée dans NEXT_DATA. Tentative de fallback HTML pour la taille {requested_size}.")
        
        html_variants = extract_nike_variants_from_html(html, product_url)
        
        # LOG DEBUG VIA logger
        logger.info(f"HTML fallback: {len(html_variants)} tailles extraites du HTML.")
        for v in html_variants:
            logger.debug(f"HTML variant found: {v.size} (available: {v.available})")
            if v.size == requested_size:
                details["found"] = True
                details["mode"] = "HTML_SIZE_MATCH"
                details["available_in_source"] = v.available
                
                if v.available is True:
                    return StockState.IN_STOCK.value, details
                elif v.available is False:
                    return StockState.OUT_OF_STOCK.value, details
                else:
                    return StockState.UNKNOWN.value, details

    # Variante non trouvée
    details["found"] = False
    details["mode"] = "NOT_FOUND"
    details["error"] = "Variante non trouvée dans la page"
    return StockState.UNKNOWN.value, details

# Nike_Parser.py