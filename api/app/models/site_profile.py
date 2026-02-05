"""
Modèle SiteProfile (profil de site pour le scraping).
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Boolean, DateTime, JSON, Uuid
from sqlalchemy.orm import relationship

from app.core.database import Base


class SiteProfile(Base):
    """Table site_profiles."""

    __tablename__ = "site_profiles"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    domain_pattern = Column(String, nullable=False, index=True)
    fetch_mode = Column(String, nullable=False, default="HTTP")
    rules_json = Column(JSON, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relations
    watches = relationship("Watch", back_populates="site_profile")

# Site_profile.py