"""
Schémas Pydantic pour l'authentification.
"""
from uuid import UUID
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """Schéma pour la création d'un utilisateur (register)."""
    email: EmailStr
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    """Schéma pour la connexion (login)."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Schéma de réponse utilisateur."""
    id: UUID
    email: str
    role: str
    unread_notifications_count: int = 0

    model_config = {"from_attributes": True}


class TokenData(BaseModel):
    """Données extraites du JWT."""
    user_id: UUID
    email: str
    role: str

# Auth.py SCHEMAS