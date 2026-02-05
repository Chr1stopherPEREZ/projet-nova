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
) -> None:
    """
    Vérifie la protection CSRF pour les requêtes mutables.
    Compare le cookie csrf_token avec le header X-CSRF-Token.
    """
    # Les méthodes sûres (GET, HEAD, OPTIONS) ne nécessitent pas de vérification CSRF
    if request.method in ("GET", "HEAD", "OPTIONS"):
        return

    # Pour POST/PATCH/PUT/DELETE, vérifier CSRF
    if not csrf_token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRF token missing in cookie",
        )

    if not x_csrf_token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRF token missing in header",
        )

    if csrf_token != x_csrf_token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRF token mismatch",
        )

# CSRF.py