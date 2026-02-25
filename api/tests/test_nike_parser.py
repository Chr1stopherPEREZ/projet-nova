"""
Tests pour le parser Nike (LOT 7/8).
Vérifie l'extraction des variantes depuis le JSON __NEXT_DATA__.
"""
import pytest
from app.services.nike_parser import (
    extract_next_data,
    parse_nike_variants,
    is_nike_url,
    check_variant_availability,
    find_product_like_object,
    is_sku_like_item,
    find_sku_like_arrays,
    extract_nike_variants_from_html,
)
from app.models.watch import StockState


class TestNikeUrlDetection:
    """Tests pour la détection des URLs Nike."""

    def test_nike_url_detection_positive(self):
        """Détecte correctement les URLs Nike."""
        assert is_nike_url("https://www.nike.com/fr/t/chaussures-air-max") is True
        assert is_nike_url("https://nike.com/product/123") is True
        assert is_nike_url("http://NIKE.COM/fr/product") is True

    def test_nike_url_detection_negative(self):
        """Rejette les URLs non-Nike."""
        assert is_nike_url("https://www.adidas.com/product") is False
        assert is_nike_url("https://amazon.fr/nike-shoes") is False
        assert is_nike_url("") is False


class TestExtractNextData:
    """Tests pour l'extraction du JSON __NEXT_DATA__."""

    def test_extract_next_data_valid(self):
        """Extrait correctement le JSON valide."""
        html = '''
        <html>
        <head>
            <script id="__NEXT_DATA__" type="application/json">{"props":{"pageProps":{"test": true}}}</script>
        </head>
        </html>
        '''
        data = extract_next_data(html)
        assert data is not None
        assert data["props"]["pageProps"]["test"] is True

    def test_extract_next_data_missing(self):
        """Retourne None si __NEXT_DATA__ absent."""
        html = '<html><head></head><body>No data</body></html>'
        data = extract_next_data(html)
        assert data is None

    def test_extract_next_data_invalid_json(self):
        """Retourne None si le JSON est invalide."""
        html = '<script id="__NEXT_DATA__">not valid json</script>'
        data = extract_next_data(html)
        assert data is None


class TestParseNikeVariants:
    """Tests pour le parsing des variantes Nike."""

    def test_parse_variants_from_skus(self):
        """Parse correctement les variantes depuis la structure skus."""
        data = {
            "props": {
                "pageProps": {
                    "initialState": {
                        "Threads": {
                            "products": {
                                "12345": {
                                    "title": "Nike Air Max 90",
                                    "skus": [
                                        {
                                            "skuId": "SKU001",
                                            "nikeSize": "42",
                                            "colorCode": "BLACK",
                                            "available": True,
                                        },
                                        {
                                            "skuId": "SKU002",
                                            "nikeSize": "43",
                                            "colorCode": "BLACK",
                                            "available": False,
                                        },
                                    ],
                                    "colorways": [
                                        {
                                            "colorCode": "BLACK",
                                            "label": "Noir/Blanc",
                                        }
                                    ],
                                }
                            }
                        }
                    }
                }
            }
        }

        title, variants, debug_info = parse_nike_variants(data)

        assert title == "Nike Air Max 90"
        assert len(variants) == 2
        assert debug_info["variants_count"] == 2

        # Première variante
        assert variants[0].variant_sku == "SKU001"
        assert variants[0].size == "42"
        assert variants[0].color == "Noir/Blanc"
        assert variants[0].available is True

        # Deuxième variante (indisponible)
        assert variants[1].variant_sku == "SKU002"
        assert variants[1].size == "43"
        assert variants[1].available is False

    def test_parse_variants_from_colorways_only(self):
        """Parse les variantes depuis colorways si pas de skus."""
        data = {
            "props": {
                "pageProps": {
                    "initialState": {
                        "Threads": {
                            "products": {
                                "ABC": {
                                    "title": "Chaussettes Nike",
                                    "skus": [],
                                    "colorways": [
                                        {
                                            "colorCode": "WHITE",
                                            "label": "Blanc",
                                            "pid": "CW001",
                                            "inStock": True,
                                        },
                                        {
                                            "colorCode": "BLACK",
                                            "label": "Noir",
                                            "pid": "CW002",
                                            "inStock": False,
                                        },
                                    ],
                                }
                            }
                        }
                    }
                }
            }
        }

        title, variants, debug_info = parse_nike_variants(data)

        assert title == "Chaussettes Nike"
        assert len(variants) == 2
        assert variants[0].variant_sku == "CW001"
        assert variants[0].color == "Blanc"
        assert variants[0].available is True
        assert "variants_count" in debug_info

    def test_parse_variants_empty_product(self):
        """Retourne une liste vide si aucun produit trouvé."""
        data = {"props": {"pageProps": {}}}
        title, variants, debug_info = parse_nike_variants(data)
        assert title is None
        assert variants == []
        assert "found_sku_arrays" in debug_info


class TestCheckVariantAvailability:
    """Tests pour la vérification de disponibilité d'une variante."""

    def test_check_variant_found_in_stock(self):
        """Détecte une variante en stock."""
        html = '''
        <script id="__NEXT_DATA__" type="application/json">
        {
            "props": {
                "pageProps": {
                    "initialState": {
                        "Threads": {
                            "products": {
                                "P1": {
                                    "title": "Test Product",
                                    "skus": [
                                        {"skuId": "SKU-TARGET", "nikeSize": "42", "colorCode": "BLK", "available": true}
                                    ],
                                    "colorways": [{"colorCode": "BLK", "label": "Black"}]
                                }
                            }
                        }
                    }
                }
            }
        }
        </script>
        '''

        status, details = check_variant_availability(
            html=html,
            variant_sku="SKU-TARGET",
            variant_meta={"color": "Black", "size": "42"},
        )

        assert status == StockState.IN_STOCK.value
        assert details["found"] is True
        assert details["available_in_source"] is True

    def test_check_variant_found_out_of_stock(self):
        """Détecte une variante en rupture."""
        html = '''
        <script id="__NEXT_DATA__" type="application/json">
        {
            "props": {
                "pageProps": {
                    "initialState": {
                        "Threads": {
                            "products": {
                                "P1": {
                                    "title": "Test Product",
                                    "skus": [
                                        {"skuId": "SKU-OOS", "nikeSize": "42", "colorCode": "BLK", "available": false}
                                    ],
                                    "colorways": [{"colorCode": "BLK", "label": "Black"}]
                                }
                            }
                        }
                    }
                }
            }
        }
        </script>
        '''

        status, details = check_variant_availability(
            html=html,
            variant_sku="SKU-OOS",
            variant_meta=None,
        )

        assert status == StockState.OUT_OF_STOCK.value
        assert details["found"] is True
        assert details["available_in_source"] is False

    def test_check_variant_not_found(self):
        """Retourne UNKNOWN si variante non trouvée."""
        html = '''
        <script id="__NEXT_DATA__" type="application/json">
        {
            "props": {
                "pageProps": {
                    "initialState": {
                        "Threads": {
                            "products": {
                                "P1": {
                                    "title": "Test Product",
                                    "skus": [
                                        {"skuId": "OTHER-SKU", "nikeSize": "42", "available": true}
                                    ],
                                    "colorways": []
                                }
                            }
                        }
                    }
                }
            }
        }
        </script>
        '''

        status, details = check_variant_availability(
            html=html,
            variant_sku="NON-EXISTENT",
            variant_meta=None,
        )

        assert status == StockState.UNKNOWN.value
        assert details["found"] is False

    def test_check_variant_color_only_mode(self):
        """Mode COLOR_ONLY: vérifie si au moins une taille est dispo pour le coloris."""
        html = '''
        <script id="__NEXT_DATA__" type="application/json">
        {
            "props": {
                "pageProps": {
                    "initialState": {
                        "Threads": {
                            "products": {
                                "P1": {
                                    "title": "Test Product",
                                    "skus": [
                                        {"skuId": "SKU-40", "nikeSize": "40", "colorCode": "BLK", "available": false},
                                        {"skuId": "SKU-41", "nikeSize": "41", "colorCode": "BLK", "available": true},
                                        {"skuId": "SKU-42", "nikeSize": "42", "colorCode": "BLK", "available": true}
                                    ],
                                    "colorways": [{"colorCode": "BLK", "label": "Black"}]
                                }
                            }
                        }
                    }
                }
            }
        }
        </script>
        '''

        # SKU inexistant mais colorCode fourni → mode COLOR_ONLY
        status, details = check_variant_availability(
            html=html,
            variant_sku="COLOR-ONLY-SKU",
            variant_meta={"colorCode": "BLK"},
        )

        assert status == StockState.IN_STOCK.value
        assert details.get("mode") == "COLOR_ONLY"
        assert len(details.get("available_sizes", [])) == 2  # 41 et 42

    def test_check_variant_color_size_fallback_match(self):
        """Détecte une variante via fallback COLOR+SIZE même si le SKU est différent."""
        html = '''
        <script id="__NEXT_DATA__" type="application/json">
        {
            "props": {
                "pageProps": {
                    "initialState": {
                        "Threads": {
                            "products": {
                                "P1": {
                                    "skus": [
                                        {"skuId": "NEW-SKU-42", "nikeSize": "42", "colorCode": "BLK", "available": true}
                                    ],
                                    "colorways": [{"colorCode": "BLK", "label": "Black"}]
                                }
                            }
                        }
                    }
                }
            }
        }
        </script>
        '''
        # On cherche un vieux SKU mais avec les bonnes meta
        status, details = check_variant_availability(
            html=html,
            variant_sku="OLD-SKU",
            variant_meta={"colorCode": "BLK", "size": "42"},
        )
        assert status == StockState.IN_STOCK.value
        assert details["mode"] == "COLOR_SIZE_FALLBACK"
        assert details["found"] is True

    def test_check_variant_color_size_fallback_out_of_stock(self):
        """Retourne OUT_OF_STOCK si la taille demandée est en rupture, pas IN_STOCK global."""
        html = '''
        <script id="__NEXT_DATA__" type="application/json">
        {
            "props": {
                "pageProps": {
                    "initialState": {
                        "Threads": {
                            "products": {
                                "P1": {
                                    "skus": [
                                        {"skuId": "SKU-41", "nikeSize": "41", "colorCode": "BLK", "available": true},
                                        {"skuId": "SKU-42", "nikeSize": "42", "colorCode": "BLK", "available": false}
                                    ],
                                    "colorways": [{"colorCode": "BLK", "label": "Black"}]
                                }
                            }
                        }
                    }
                }
            }
        }
        </script>
        '''
        # On suit la taille 42 (en rupture), mais la 41 est dispo.
        # On ne doit PAS avoir IN_STOCK via COLOR_ONLY.
        status, details = check_variant_availability(
            html=html,
            variant_sku="SOME-SKU",
            variant_meta={"colorCode": "BLK", "size": "42"},
        )
        assert status == StockState.OUT_OF_STOCK.value
        assert details["mode"] == "COLOR_SIZE_FALLBACK"

    def test_check_variant_color_size_fallback_unknown_if_missing(self):
        """Retourne UNKNOWN (NOT_FOUND) si la taille demandée n'existe pas du tout."""
        html = '''
        <script id="__NEXT_DATA__" type="application/json">
        {
            "props": {
                "pageProps": {
                    "initialState": {
                        "Threads": {
                            "products": {
                                "P1": {
                                    "skus": [
                                        {"skuId": "SKU-41", "nikeSize": "41", "colorCode": "BLK", "available": true}
                                    ],
                                    "colorways": [{"colorCode": "BLK", "label": "Black"}]
                                }
                            }
                        }
                    }
                }
            }
        }
        </script>
        '''
        # Taille 44 demandée, n'existe pas.
        status, details = check_variant_availability(
            html=html,
            variant_sku="SOME-SKU",
            variant_meta={"colorCode": "BLK", "size": "44"},
        )
        assert status == StockState.UNKNOWN.value
        assert details["mode"] == "NOT_FOUND"


class TestRecursiveFallback:
    """Tests pour le fallback récursif find_product_like_object."""

    def test_find_product_in_deep_structure(self):
        """Trouve un produit dans une structure profondément imbriquée."""
        data = {
            "buildId": "abc123",
            "props": {
                "pageProps": {
                    "apollo": {
                        "cache": {
                            "ROOT_QUERY": {
                                "product": {
                                    "title": "Produit Profond",
                                    "skus": [
                                        {"skuId": "DEEP-SKU-001", "nikeSize": "42", "available": True},
                                        {"skuId": "DEEP-SKU-002", "nikeSize": "43", "available": False},
                                    ],
                                    "colorways": [
                                        {"colorCode": "BLK", "label": "Noir"}
                                    ]
                                }
                            }
                        }
                    }
                }
            }
        }

        result = find_product_like_object(data)
        assert result is not None
        assert "skus" in result
        assert len(result["skus"]) == 2
        assert result["title"] == "Produit Profond"

    def test_find_product_via_parse_nike_variants_fallback(self):
        """parse_nike_variants utilise le repli (fallback) récursif."""
        # Structure qui ne correspond à aucun des 3 chemins connus
        data = {
            "buildId": "xyz",
            "props": {
                "pageProps": {
                    "data": {
                        "nested": {
                            "deeply": {
                                "product": {
                                    "name": "Produit de Repli",
                                    "skus": [
                                        {"id": "FB-001", "size": "M", "inStock": True},
                                    ],
                                    "colors": [
                                        {"colorId": "RED", "label": "Rouge"}
                                    ]
                                }
                            }
                        }
                    }
                }
            }
        }

        title, variants, debug_info = parse_nike_variants(data)
        assert title == "Produit de Repli"
        assert len(variants) >= 1
        # Le parseur devrait extraire au moins le SKU
        assert variants[0].variant_sku == "FB-001"
        assert "variants_count" in debug_info

    def test_find_product_in_list(self):
        """Trouve un produit dans une liste d'objets."""
        data = {
            "props": {
                "pageProps": {
                    "items": [
                        {"type": "banner"},
                        {
                            "type": "product",
                            "skus": [{"skuId": "LIST-SKU", "available": True}],
                        },
                        {"type": "footer"}
                    ]
                }
            }
        }

        result = find_product_like_object(data)
        assert result is not None
        assert result.get("skus")[0]["skuId"] == "LIST-SKU"

    def test_no_product_found(self):
        """Retourne None si aucun produit n'est trouvé."""
        data = {
            "props": {
                "pageProps": {
                    "other": "data",
                    "nested": {"truc": "ici"}
                }
            }
        }

        result = find_product_like_object(data)
        assert result is None

    def test_max_depth_protection(self):
        """Ne dépasse pas la profondeur maximale."""
        # Créer une structure très profonde
        deep = {"skus": [{"skuId": "DEEP", "available": True}]}
        for _ in range(20):  # 20 niveaux de profondeur
            deep = {"nested": deep}
        
        data = {"root": deep}
        
        # Avec max_depth par défaut (15), ne devrait pas trouver le produit
        result = find_product_like_object(data, max_depth=15)
        assert result is None
        
        # Avec max_depth plus élevé, devrait le trouver
        result = find_product_like_object(data, max_depth=25)
        assert result is not None

    def test_colorways_only_product(self):
        """Trouve un produit qui n'a que des coloris (pas de skus)."""
        data = {
            "props": {
                "deep": {
                    "product": {
                        "title": "Coloris Uniquement",
                        "colorways": [
                            {"colorCode": "WHT", "pid": "CW-123", "inStock": True}
                        ]
                    }
                }
            }
        }

        result = find_product_like_object(data)
        assert result is not None
        assert result["title"] == "Coloris Uniquement"
        assert len(result["colorways"]) == 1


class TestSkuLikeDetection:
    """Tests pour la détection de listes sku-like."""
    """Tests pour la détection de listes sku-like."""

    def test_is_sku_like_item_valid(self):
        """Détecte un item qui ressemble à un SKU."""
        # Cas classique Nike
        assert is_sku_like_item({"skuId": "ABC123", "available": True}) is True
        assert is_sku_like_item({"id": "123", "inStock": False}) is True
        assert is_sku_like_item({"sku": "SKU001", "isAvailable": True}) is True
        # Avec taille mais sans stock (acceptable)
        assert is_sku_like_item({"skuId": "ABC", "nikeSize": "42"}) is True
        assert is_sku_like_item({"id": "X", "size": "M"}) is True

    def test_is_sku_like_item_invalid(self):
        """Rejette les items qui ne ressemblent pas à des SKUs."""
        assert is_sku_like_item({"name": "Product"}) is False
        assert is_sku_like_item({"available": True}) is False  # Pas d'ID
        assert is_sku_like_item({"color": "red"}) is False
        assert is_sku_like_item("not a dict") is False
        assert is_sku_like_item(None) is False
        assert is_sku_like_item([]) is False

    def test_find_sku_like_arrays_basic(self):
        """Trouve une liste de SKUs avec des clés non-standard."""
        data = {
            "props": {
                "pageData": {
                    "variantes": [  # Clé non-standard (pas 'skus')
                        {"skuId": "V1", "available": True, "size": "S"},
                        {"skuId": "V2", "available": False, "size": "M"},
                        {"skuId": "V3", "available": True, "size": "L"},
                    ]
                }
            }
        }

        result = find_sku_like_arrays(data)
        assert len(result) >= 1
        # La liste "variantes" devrait être trouvée
        found_keys = [k for k, v in result]
        assert "variantes" in found_keys

    def test_find_sku_like_arrays_deep(self):
        """Trouve des listes sku-like profondément imbriquées."""
        data = {
            "root": {
                "level1": {
                    "level2": {
                        "level3": {
                            "productItems": [  # Nom aléatoire
                                {"id": "P1", "stockLevel": 5},
                                {"id": "P2", "stockLevel": 0},
                            ]
                        }
                    }
                }
            }
        }

        result = find_sku_like_arrays(data)
        assert len(result) >= 1
        found_keys = [k for k, v in result]
        assert "productItems" in found_keys

    def test_find_sku_like_arrays_ignores_small_lists(self):
        """Ignore les listes avec moins de 2 éléments de type SKU."""
        data = {
            "petit": [
                {"skuId": "UNIQUE", "available": True}  # Seulement 1 élément
            ],
            "mixte": [
                {"skuId": "SKU1", "available": True},
                {"name": "Pas un SKU"},  # 50% ne sont pas des SKUs
            ]
        }

        result = find_sku_like_arrays(data)
        # "petit" ne devrait pas être trouvé (trop petit)
        found_keys = [k for k, v in result]
        assert "petit" not in found_keys

    def test_parse_nike_variants_with_sku_like_fallback(self):
        """parse_nike_variants utilise find_sku_like_arrays comme repli (fallback)."""
        # Structure où les SKUs sont dans une clé non-standard
        data = {
            "buildId": "abc",
            "props": {
                "pageProps": {
                    "productData": {
                        "name": "Produit de Test",
                        "allVariants": [  # Pas 'skus' ni 'availableSkus'
                            {"skuId": "VAR-001", "nikeSize": "40", "available": True},
                            {"skuId": "VAR-002", "nikeSize": "41", "available": False},
                            {"skuId": "VAR-003", "nikeSize": "42", "available": True},
                        ]
                    }
                }
            }
        }

        title, variants, debug_info = parse_nike_variants(data)
        
        # Le repli sku-like devrait trouver les variantes
        assert len(variants) == 3
        assert variants[0].variant_sku == "VAR-001"
        assert variants[0].size == "40"
        assert variants[0].available is True
        assert debug_info["variants_count"] == 3
        assert len(debug_info.get("found_sku_arrays", [])) >= 1


class TestHtmlFallback:
    """Tests pour l'extraction des variantes via HTML."""

    def test_extract_nike_variants_from_html_radio(self):
        """Extrait les tailles via les sélecteurs radio et les libellés (labels)."""
        html = '''
        <fieldset data-testid="sku-selector">
            <div>
                <input type="radio" id="sku-input-1" value="1" disabled="">
                <label for="sku-input-1">EU 42</label>
            </div>
            <div>
                <input type="radio" id="sku-input-2" value="2">
                <label for="sku-input-2">EU 43</label>
            </div>
        </fieldset>
        '''
        url = "https://www.nike.com/fr/t/prod/SX4508-001"
        variants = extract_nike_variants_from_html(html, url)
        
        assert len(variants) == 2
        assert variants[0].size == "EU 42"
        assert variants[0].available is False
        assert variants[1].size == "EU 43"
        assert variants[1].available is True
        assert "SX4508-001" in variants[0].variant_sku

    def test_extract_nike_variants_from_html_buttons(self):
        """Extrait les tailles via les boutons directs."""
        html = '''
        <div data-testid="sku-selector">
            <button data-testid="size-grid-button" disabled="">EU 40</button>
            <button data-testid="size-grid-button">EU 41</button>
            <button data-testid="size-grid-button" aria-disabled="true">EU 42</button>
        </div>
        '''
        url = "https://www.nike.com/fr/t/prod/SX4508-001"
        variants = extract_nike_variants_from_html(html, url)
        
        assert len(variants) == 3
        assert variants[0].size == "EU 40"
        assert variants[0].available is False
        assert variants[1].size == "EU 41"
        assert variants[1].available is True
        assert variants[2].size == "EU 42"
        assert variants[2].available is False

    def test_check_variant_availability_html_match(self):
        """Vérifie la disponibilité via le fallback HTML dans check_variant_availability."""
        html = '''
        <html>
        <body>
            <fieldset data-testid="sku-selector">
                <button data-testid="size-grid-button" disabled="">EU 42</button>
                <button data-testid="size-grid-button">EU 43</button>
            </fieldset>
        </body>
        </html>
        '''
        # L'URL doit correspondre pour le match HTML si on veut un SKU synthétique stable
        url = "https://www.nike.com/fr/t/prod/SX4508-001"
        variant_sku = f"nike|{url}|unknown|EU 42"
        variant_meta = {"size": "EU 42", "url": url}
        
        # Cas 1: Taille en rupture
        status, details = check_variant_availability(html, variant_sku, variant_meta)
        assert status == StockState.OUT_OF_STOCK.value
        assert details["mode"] == "HTML_SIZE_MATCH"
        assert details["found"] is True
        
        # Cas 2: Taille en stock
        variant_sku_43 = f"nike|{url}|unknown|EU 43"
        variant_meta_43 = {"size": "EU 43", "url": url}
        status, details = check_variant_availability(html, variant_sku_43, variant_meta_43)
        assert status == StockState.IN_STOCK.value
        assert details["mode"] == "HTML_SIZE_MATCH"
        assert details["found"] is True

# Test_Nike_Parser.py