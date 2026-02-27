"""
Middleware et dépendance CSRF (Double Submit Cookie).
Spec: docs/05-security.md
"""
from typing import Optional

from fastapi import HTTPException, status, Request, Cookie, Header, Depends


def verify_csrf(
    request: Request,
    csrf_token: Optional[str] = Cookie(default=None),
    x_csrf_token: Optional[str] = Header(default=None, alias="X-CSRF-Token"),
    x_skip_csrf: Optional[str] = Header(default=None, alias="X-Skip-CSRF"),
) -> None:
    """
    Vérifie la protection CSRF pour les requêtes mutables.
    Compare le cookie csrf_token avec le header X-CSRF-Token.
    """
    from app.core.config import settings

    # Bypass si désactivé explicitement (env var ou header)
    if settings.csrf_disabled or x_skip_csrf == "1":
        return

    # Les méthodes sûres (GET, HEAD, OPTIONS) ne nécessitent pas de vérification CSRF
    if request.method in ("GET", "HEAD", "OPTIONS"):
        return

    # Pour POST/PATCH/PUT/DELETE, vérifier CSRF
    if not csrf_token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "CSRF_INVALID",
                "message": "Token CSRF manquant dans les cookies",
            },
        )

    if not x_csrf_token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "CSRF_INVALID",
                "message": "Token CSRF manquant dans le header X-CSRF-Token",
            },
        )

    if csrf_token != x_csrf_token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "CSRF_INVALID",
                "message": "Les tokens CSRF ne correspondent pas",
            },
        )

# CSRF.py