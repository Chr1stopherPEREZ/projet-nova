"""
Point d'entrée de l'API Nova (Fast API).
"""
import os

from fastapi import FastAPI

APP_ENV = os.getenv("APP_ENV", "development")

app = FastAPI(
    title="Nova API",
    description="API de suivi de retour en stock",
    version="0.1.0",
)


@app.get("/health")
async def health_check() -> dict:
    """Endpoint de vérification de santé."""
    return {"status": "ok", "environment": APP_ENV}

# Main.py