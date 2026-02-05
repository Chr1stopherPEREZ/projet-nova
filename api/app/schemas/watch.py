"""
Schémas Pydantic pour les watches.
Spec: docs/07-api-spec.md
"""
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, HttpUrl, field_validator


class WatchCreate(BaseModel):
    """Payload pour créer une watch."""
    url: HttpUrl
    label: str | None = None

    @field_validator("url", mode="before")
    @classmethod
    def validate_url(cls, v):
        """Convertit HttpUrl en string pour stockage."""
        return str(v) if v else v


class WatchUpdate(BaseModel):
    """Payload pour mettre à jour une watch (PATCH)."""
    status: str | None = None  # ACTIVE ou PAUSED

    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        """Valide le statut."""
        if v and v not in ("ACTIVE", "PAUSED"):
            raise ValueError("status must be ACTIVE or PAUSED")
        return v


class WatchOut(BaseModel):
    """Réponse watch (detail/list item)."""
    id: UUID
    url: str
    label: str | None = None
    status: str  # ACTIVE ou PAUSED (correspond à watch_status dans le modèle)
    stock_state: str  # IN_STOCK, OUT_OF_STOCK, UNKNOWN, BROKEN
    last_checked_at: datetime | None = None

    model_config = {"from_attributes": True}

# Watch.py
