# Preuves Lot 8 - API Errors (Réelles)

Ce document contient les sorties réelles de l'API Nova après uniformisation des erreurs (Lot 8).
Toutes les commandes ont été exécutées avec l'API configurée en `APP_ENV=production` (protection CSRF active).

## Configuration de test
```bash
export API_URL="http://localhost:8000"
export CSRF="nG2hgZyoePIkr99puYAKghQR6DkD62m7WK5jboiY51I"
```

## 1. Watch Inexistante (404)

**Commande :**
```bash
curl -s -X GET "$API_URL/watches/00000000-0000-0000-0000-000000000000" \
     -b cookies.txt
```

**Réponse (Body) :**
```json
{
    "error": {
        "code": "WATCH_NOT_FOUND",
        "message": "Suivi introuvable",
        "details": {
            "watch_id": "00000000-0000-0000-0000-000000000000"
        }
    }
}
```

## 2. Erreur de Validation Pydantic (422)

**Commande :**
```bash
curl -s -X POST "$API_URL/watches" \
     -H "Content-Type: application/json" \
     -H "X-CSRF-Token: $CSRF" \
     -b cookies.txt \
     -d '{"url":"not-an-url","label":"Test"}'
```

**Réponse (Body) :**
```json
{
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Erreur de validation des donn\u00e9es",
        "details": {
            "fields": [
                {
                    "field": "url",
                    "message": "Input should be a valid URL, relative URL without a base",
                    "type": "url_parsing"
                }
            ]
        }
    }
}
```

## 3. Non Authentifié (401)

**Commande :**
```bash
curl -s -X GET "$API_URL/watches"
```

**Réponse (Body) :**
```json
{
    "error": {
        "code": "NOT_AUTHENTICATED",
        "message": "Session expir\u00e9e ou absente",
        "details": null
    }
}
```

## 4. CSRF Invalide / Manquant (403)

**Commande :**
```bash
curl -s -X POST "$API_URL/watches" \
     -H "Content-Type: application/json" \
     -H "X-CSRF-Token: wrong-token" \
     -b cookies.txt \
     -d '{"url":"https://nike.com/product","label":"Test"}'
```

**Réponse (Body) :**
```json
{
    "error": {
        "code": "CSRF_INVALID",
        "message": "Les tokens CSRF ne correspondent pas",
        "details": null
    }
}
```

## 5. Vérification CSRF (/auth/_csrf-check) (204)

**Commande (Token correct) :**
```bash
curl -s -i -X POST "$API_URL/auth/_csrf-check" \
     -H "X-CSRF-Token: $CSRF" \
     -b cookies.txt
```

**Réponse (Headers) :**
```
HTTP/1.1 204 No Content
```
