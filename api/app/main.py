"""
Point d'entrée de l'API Nova (FastAPI).
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError, HTTPException
from sqlalchemy.exc import IntegrityError

from app.core.config import settings
from app.api.routes.auth import router as auth_router
from app.api.routes.watches import router as watches_router
from app.api.routes.jobs import router as jobs_router
from app.core.exceptions import (
    APIException,
    http_exception_handler,
    validation_exception_handler,
    integrity_exception_handler,
    general_exception_handler,
    api_exception_handler,
)

app = FastAPI(
    title="Nova API",
    description="API de suivi de retour en stock",
    version="0.3.0",
)

# Exception handlers
app.add_exception_handler(APIException, api_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(IntegrityError, integrity_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Configuration CORS (externalisé via CORS_ORIGINS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth_router)
app.include_router(watches_router)
app.include_router(jobs_router)


@app.get("/health")
async def health_check() -> dict:
    """Endpoint de vérification de santé."""
    return {"status": "ok", "environment": settings.app_env}

# Main.py