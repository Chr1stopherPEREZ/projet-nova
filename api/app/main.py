"""
Point d'entrée de l'API Nova (FastAPI).
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes.auth import router as auth_router
from app.api.routes.watches import router as watches_router
from app.api.routes.jobs import router as jobs_router

app = FastAPI(
    title="Nova API",
    description="API de suivi de retour en stock",
    version="0.3.0",
)

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