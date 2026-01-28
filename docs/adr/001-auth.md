# ADR 001 — Authentification

## Contexte
Nova expose une API (FastAPI) consommée par un dashboard web.

## Décision (V1)
- Auth via **JWT access token** court (ex. 15–60 min).
- Stockage recommandé : **cookie HttpOnly** (évite localStorage), SameSite=Lax.
- Refresh token : **optionnel** (si implémenté, rotation).

## Justification
- Simple à déployer, compatible SPA.
- Limite l’exposition XSS (HttpOnly).

## Réinitialisation de mot de passe (Token)
- Utilisation de **tokens à usage unique et persistés** en base de données.
- Chaque token est lié à un utilisateur, possède une date d'expiration (ex. 24 heures) et un statut (utilisé ou non).
- **Justification** : Permet une invalidation facile, un audit précis des demandes et évite les attaques par rejeu (replay) contrairement à certains tokens purement stateless.

## Conséquences
- Gestion CSRF si cookie (token CSRF ou double-submit).
- Les endpoints doivent vérifier rôle (RBAC).
