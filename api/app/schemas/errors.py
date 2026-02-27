from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ErrorDetail(BaseModel):
    field: Optional[str] = None
    message: str
    type: Optional[str] = None


class ErrorResponse(BaseModel):
    code: str = Field(..., description="Code d'erreur en SCREAMING_SNAKE_CASE")
    message: str = Field(..., description="Message d'erreur humain et court")
    details: Optional[Dict[str, Any]] = Field(None, description="Détails supplémentaires sur l'erreur")


class APIError(BaseModel):
    error: ErrorResponse

# Errors.py