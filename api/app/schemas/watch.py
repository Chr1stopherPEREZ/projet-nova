"""
Schémas Pydantic pour les watches.
Spec: docs/07-api-spec.md
"""
from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, HttpUrl, field_validator


class WatchCreate(BaseModel):
    """Payload pour créer une watch."""
    url: HttpUrl
    label: str | None = None
    variant_sku: str | None = None  # SKU de la variante (optionnel mais recommandé)
    variant_selector: dict[str, Any] | None = None  # {"Couleur": "Noir", "Taille": "M"}
    variant_meta: dict[str, Any] | None = None  # {couleur, taille, codeCouleur, labelTaille, etc.}

    @field_validator("url", mode="before")
    @classmethod
    def validate_url(cls, v):
        """Convertit HttpUrl en string pour stockage."""
        return str(v) if v else v


class WatchUpdate(BaseModel):
    """Payload pour mettre à jour une watch (PATCH)."""
    status: str | None = None  # ACTIVE ou PAUSED
    label: str | None = None
    variant_sku: str | None = None
    variant_selector: dict[str, Any] | None = None
    variant_meta: dict[str, Any] | None = None

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
    stock_state: str  # IN_STOCK, OUT_OF_STOCK, SOLD_OUT, UNKNOWN, BROKEN
    last_checked_at: datetime | None = None
    variant_sku: str | None = None
    variant_selector: dict[str, Any] | None = None
    variant_meta: dict[str, Any] | None = None
    site_name: str | None = None

    model_config = {"from_attributes": True}


    # Schémas pour la prévisualisation des variantes

class VariantInfo(BaseModel):
    """Information sur une variante de produit."""
    variant_sku: str
    color: str | None = None
    size: str | None = None
    available: bool | None = None
    meta: dict[str, Any] | None = None  # Données brutes utiles (ex: IDs Nike)


class PreviewRequest(BaseModel):
    """Payload pour la prévisualisation d'un produit."""
    url: HttpUrl

    @field_validator("url", mode="before")
    @classmethod
    def validate_url(cls, v):
        """Convertit HttpUrl en string."""
        return str(v) if v else v


class PreviewResponse(BaseModel):
    """Réponse de la prévisualisation avec les variantes disponibles."""
    title: str | None = None
    source: str  # "nike" | "générique"
    variants: list[VariantInfo] = []
    debug_info: dict[str, Any] | None = None  # Info de debug (erreurs, warnings, etc.)


# Schéma pour les vérifications

class WatchCheckOut(BaseModel):
    """Réponse pour un check de watch."""
    id: UUID
    watch_id: UUID
    checked_at: datetime
    stock_state: str
    http_status: int | None = None
    fetch_mode: str
    duration_ms: int | None = None
    error_code: str | None = None
    error_message: str | None = None
    details: dict[str, Any] | None = None  # {variant_sku, couleur, taille, tailles_disponibles, etc.}

    model_config = {"from_attributes": True}

# Watch.py SCHEMAS
