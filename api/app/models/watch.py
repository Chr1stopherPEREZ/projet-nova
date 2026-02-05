"""
Modèle Watch (suivi de produit).
"""
import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import Column, String, Enum, DateTime, Integer, ForeignKey, UniqueConstraint, Uuid
from sqlalchemy.orm import relationship

from app.core.database import Base


class WatchStatus(str, PyEnum):
    """Statut de surveillance."""
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"


class StockState(str, PyEnum):
    """État du stock détecté."""
    IN_STOCK = "IN_STOCK"
    OUT_OF_STOCK = "OUT_OF_STOCK"
    UNKNOWN = "UNKNOWN"
    BROKEN = "BROKEN"


class Watch(Base):
    """Table watches."""

    __tablename__ = "watches"
    __table_args__ = (
        UniqueConstraint("user_id", "normalized_url", name="uq_user_normalized_url"),
    )

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    site_profile_id = Column(Uuid, ForeignKey("site_profiles.id", ondelete="SET NULL"), nullable=True)
    original_url = Column(String, nullable=False)
    normalized_url = Column(String, nullable=False)
    label = Column(String, nullable=True)
    watch_status = Column(Enum(WatchStatus), nullable=False, default=WatchStatus.ACTIVE)
    stock_state = Column(Enum(StockState), nullable=False, default=StockState.UNKNOWN)
    last_checked_at = Column(DateTime(timezone=True), nullable=True)
    next_check_at = Column(DateTime(timezone=True), nullable=True)
    fail_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relations
    user = relationship("User", back_populates="watches")
    site_profile = relationship("SiteProfile", back_populates="watches")
    checks = relationship("WatchCheck", back_populates="watch", cascade="all, delete-orphan")

# Watch.py