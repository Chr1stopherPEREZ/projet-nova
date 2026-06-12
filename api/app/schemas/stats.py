"""
Schémas Pydantic pour les statistiques (LOT 10).
"""
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel


class DashboardKPIs(BaseModel):
    """KPIs pour le tableau de bord utilisateur."""
    active_watches: int
    in_stock_count: int
    out_of_stock_count: int
    checks_today: int
    checks_7d: int
    changes_7d: int
    last_check_at: Optional[datetime]
    errors_7d: int
    alerts_sent_7d: int
    unread_notifications_count: int


class PerformanceRow(BaseModel):
    """Ligne du tableau de performance des surveillances."""
    host: str
    checks: int
    changes: int
    alerts_sent: int


class RecentActivityRow(BaseModel):
    """Ligne d'activité récente."""
    id: UUID
    watch_id: UUID
    checked_at: datetime
    product_name: str
    site_name: Optional[str]
    from_state: Optional[str]
    to_state: str
    price: Optional[float]
    currency: Optional[str]


class UserDashboardResponse(BaseModel):
    """Réponse de GET /stats/dashboard."""
    kpis: DashboardKPIs
    table: List[PerformanceRow]
    recent_activity: List[RecentActivityRow]


class AdminDashboardKPIs(BaseModel):
    """KPIs pour le tableau de bord administrateur (global)."""
    active_watches: int
    checks_today: int
    alerts_sent_7d: int
    errors_7d: int
    last_check_at: Optional[datetime]


class AdminDashboardResponse(BaseModel):
    """Réponse de GET /admin/stats/dashboard."""
    kpis: AdminDashboardKPIs
    top_domains: List[PerformanceRow]


class SiteProfileSimple(BaseModel):
    """Représentation simplifiée d'un profil de site."""
    id: UUID
    name: str
    domain_pattern: str
    fetch_mode: str
    is_active: bool

    model_config = {"from_attributes": True}

# Stats.py SCHEMAS
