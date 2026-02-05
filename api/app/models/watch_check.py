"""
Modèle WatchCheck (historique des contrôles).
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Index, Uuid
from sqlalchemy.orm import relationship

from app.core.database import Base


class WatchCheck(Base):
    """Table watch_checks."""

    __tablename__ = "watch_checks"
    __table_args__ = (
        Index("idx_watch_checks_watch_time", "watch_id", "checked_at"),
    )

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    watch_id = Column(Uuid, ForeignKey("watches.id", ondelete="CASCADE"), nullable=False)
    checked_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    stock_state = Column(String, nullable=False)  # StockState value
    http_status = Column(Integer, nullable=True)
    fetch_mode = Column(String, nullable=False, default="HTTP")
    duration_ms = Column(Integer, nullable=True)
    error_code = Column(String, nullable=True)
    error_message = Column(String, nullable=True)

    # Relations
    watch = relationship("Watch", back_populates="checks")

# WatchCheck.py