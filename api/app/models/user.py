"""
Modèle Utilisateur.
"""
import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import Column, String, Enum, DateTime, Uuid
from sqlalchemy.orm import relationship

from app.core.database import Base


class UserRole(str, PyEnum):
    """Rôles utilisateur."""
    USER = "USER"
    ADMIN = "ADMIN"


class User(Base):
    """Table users."""

    __tablename__ = "users"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    email = Column(String, nullable=False, unique=True, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.USER)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    last_notifications_read_at = Column(DateTime(timezone=True), nullable=True)

    # Relations
    watches = relationship("Watch", back_populates="user", cascade="all, delete-orphan")

# User.py