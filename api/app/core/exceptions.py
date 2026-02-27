import logging
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError, HTTPException
from sqlalchemy.exc import IntegrityError
from app.schemas.errors import APIError, ErrorResponse


class APIException(Exception):
    """Exception personnalisée pour les erreurs API avec code métier stable."""
    def __init__(self, code: str, message: str, status_code: int = status.HTTP_400_BAD_REQUEST, details: dict = None):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details


def raise_api_error(code: str, message: str, status_code: int = status.HTTP_400_BAD_REQUEST, details: dict = None):
    """Helper pour lever une APIException."""
    raise APIException(code=code, message=message, status_code=status_code, details=details)


logger = logging.getLogger(__name__)


async def api_exception_handler(request: Request, exc: APIException):
    """Gère les APIException personnalisées."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details
            }
        }
    )


async def http_exception_handler(request: Request, exc: HTTPException):
    """Gère les exceptions HTTP standard (404, 401, 403, etc.)."""
    # Mappage des codes par défaut si nécessaire
    code = "HTTP_ERROR"
    if exc.status_code == status.HTTP_404_NOT_FOUND:
        code = "NOT_FOUND"
    elif exc.status_code == status.HTTP_401_UNAUTHORIZED:
        code = "NOT_AUTHENTICATED"
    elif exc.status_code == status.HTTP_403_FORBIDDEN:
        code = "FORBIDDEN"
    elif exc.status_code == status.HTTP_409_CONFLICT:
        code = "CONFLICT"
    
    # Si le détail est déjà un dictionnaire avec "code", on l'utilise tel quel
    if isinstance(exc.detail, dict) and "code" in exc.detail:
        # S'assurer que "details" est présent (même si None)
        error_payload = exc.detail.copy()
        if "details" not in error_payload:
            error_payload["details"] = None
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": error_payload},
            headers=getattr(exc, "headers", None)
        )

    # Sinon, on normalise le texte libre
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": code,
                "message": str(exc.detail),
                "details": None
            }
        },
        headers=getattr(exc, "headers", None)
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Gère les erreurs de validation Pydantic (422)."""
    fields = []
    for error in exc.errors():
        fields.append({
            "field": ".".join([str(p) for p in error["loc"][1:]]) if len(error["loc"]) > 1 else str(error["loc"][0]),
            "message": error["msg"],
            "type": error["type"]
        })
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Erreur de validation des données",
                "details": {"fields": fields}
            }
        }
    )

async def integrity_exception_handler(request: Request, exc: IntegrityError):
    """Gère les erreurs d'intégrité de la base de données (ex: doublons)."""
    logger.error(f"Database IntegrityError: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={
            "error": {
                "code": "DATABASE_CONFLICT",
                "message": "Une contrainte d'intégrité a été violée (ex: doublon)",
                "details": None
            }
        }
    )

async def general_exception_handler(request: Request, exc: Exception):
    """Handler de secours pour toutes les autres exceptions (500)."""
    logger.exception("Unhandled exception occurred")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "Une erreur interne est survenue",
                "details": None
            }
        }
    )

# Exceptions.py