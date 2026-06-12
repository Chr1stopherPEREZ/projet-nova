"""
Routes pour les statistiques (LOT 10).
"""
from datetime import datetime, timezone, timedelta
from typing import List
from urllib.parse import urlparse

from fastapi import APIRouter, Depends
from sqlalchemy import func, and_, String
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user, require_admin
from app.core.csrf import verify_csrf
from app.core.database import get_db
from app.models.user import User
from app.models.watch import Watch, WatchStatus
from app.models.watch_check import WatchCheck
from app.models.site_profile import SiteProfile
from app.schemas.stats import (
    UserDashboardResponse, 
    AdminDashboardResponse, 
    DashboardKPIs, 
    AdminDashboardKPIs,
    PerformanceRow,
    RecentActivityRow,
    SiteProfileSimple
)

router = APIRouter(prefix="/stats", tags=["stats"])
admin_router = APIRouter(prefix="/admin/stats", tags=["admin_stats"])

def get_host_from_url(url: str) -> str:
    """Extrait le host d'une URL."""
    try:
        parsed = urlparse(url)
        return parsed.netloc or url
    except Exception:
        return url

@router.get("/dashboard", response_model=UserDashboardResponse)
def get_user_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retourne les stats du dashboard utilisateur."""
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    seven_days_ago = now - timedelta(days=7)

    # KPIs
    active_watches = db.query(Watch).filter(
        Watch.user_id == current_user.id,
        Watch.watch_status == WatchStatus.ACTIVE
    ).count()

    in_stock_count = db.query(Watch).filter(
        Watch.user_id == current_user.id,
        Watch.watch_status == WatchStatus.ACTIVE,
        Watch.stock_state == "IN_STOCK"
    ).count()

    out_of_stock_count = db.query(Watch).filter(
        Watch.user_id == current_user.id,
        Watch.watch_status == WatchStatus.ACTIVE,
        Watch.stock_state == "OUT_OF_STOCK"
    ).count()

    checks_today = db.query(WatchCheck).join(Watch).filter(
        Watch.user_id == current_user.id,
        WatchCheck.checked_at >= today_start
    ).count()

    checks_7d = db.query(WatchCheck).join(Watch).filter(
        Watch.user_id == current_user.id,
        WatchCheck.checked_at >= seven_days_ago
    ).count()

    # Changements sur 7 jours (syntaxe Postgres JSONB)
    try:
        changes_7d = db.query(WatchCheck).join(Watch).filter(
            Watch.user_id == current_user.id,
            WatchCheck.checked_at >= seven_days_ago,
            WatchCheck.details['changed'].astext == 'true'
        ).count()
    except Exception as e:
        # Fallback si erreur SQL
        print(f"Erreur stats changes_7d: {e}")
        changes_7d = 0
    
    last_check = db.query(WatchCheck).join(Watch).filter(
        Watch.user_id == current_user.id
    ).order_by(WatchCheck.checked_at.desc()).first()
    
    errors_7d = db.query(WatchCheck).join(Watch).filter(
        Watch.user_id == current_user.id,
        WatchCheck.checked_at >= seven_days_ago,
        WatchCheck.http_status >= 400
    ).count()

    # Performance Table (Aggregation par host)
    watches = db.query(Watch).filter(Watch.user_id == current_user.id).all()
    watch_ids = [w.id for w in watches]
    
    performance_data = {}
    if watch_ids:
        # Group by Watch.original_url pour être conforme SQL (Postgres exige de grouper par les colonnes sélectionnées)
        # On utilise une sous-requête pour compter les changements par montre si on voulait être précis,
        # mais ici on simplifie l'agrégation par host.
        checks_query = db.query(
            Watch.original_url,
            func.count(WatchCheck.id).label("count")
        ).join(WatchCheck).filter(
            Watch.id.in_(watch_ids)
        ).group_by(Watch.original_url).all()
        
        for url, count in checks_query:
            host = get_host_from_url(url)
            if host not in performance_data:
                performance_data[host] = {"checks": 0, "changes": 0, "alerts_sent": 0}
            performance_data[host]["checks"] += count

    table = [
        PerformanceRow(
            host=host, 
            checks=data["checks"], 
            changes=data["changes"], 
            alerts_sent=data["alerts_sent"]
        ) for host, data in performance_data.items()
    ]

    # Notifications non lues
    unread_notifications_count = 0
    try:
        unread_query = db.query(WatchCheck).join(Watch).filter(
            Watch.user_id == current_user.id,
            WatchCheck.details['changed'].astext == 'true'
        )
        if current_user.last_notifications_read_at:
            unread_query = unread_query.filter(WatchCheck.checked_at > current_user.last_notifications_read_at)
        
        unread_notifications_count = unread_query.count()
    except Exception as e:
        print(f"Erreur stats unread_notifications: {e}")
        unread_notifications_count = 0

    # Activité récente
    recent_checks = db.query(WatchCheck).join(Watch).filter(
        Watch.user_id == current_user.id
    ).options(
        joinedload(WatchCheck.watch).joinedload(Watch.site_profile)
    ).order_by(WatchCheck.checked_at.desc()).limit(10).all()
    
    recent_activity = [
        RecentActivityRow(
            id=c.id,
            watch_id=c.watch_id,
            checked_at=c.checked_at,
            product_name=c.watch.label or "Produit sans nom",
            site_name=c.watch.site_profile.name if c.watch.site_profile else None,
            from_state=None,
            to_state=c.stock_state,
            price=c.details.get("price") if c.details else None,
            currency=c.details.get("currency") if c.details else None
        ) for c in recent_checks
    ]

    return UserDashboardResponse(
        kpis=DashboardKPIs(
            active_watches=active_watches,
            in_stock_count=in_stock_count,
            out_of_stock_count=out_of_stock_count,
            checks_today=checks_today,
            checks_7d=checks_7d,
            changes_7d=changes_7d,
            last_check_at=last_check.checked_at if last_check else None,
            errors_7d=errors_7d,
            alerts_sent_7d=changes_7d, # MVP: 1 changement = 1 alerte
            unread_notifications_count=unread_notifications_count
        ),
        table=table,
        recent_activity=recent_activity
    )

@router.post("/notifications/mark-as-read", status_code=204)
def mark_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: None = Depends(verify_csrf),
):
    """Marque toutes les notifications comme lues pour l'utilisateur."""
    current_user.last_notifications_read_at = datetime.now(timezone.utc)
    db.commit()
    return None

@admin_router.get("/dashboard", response_model=AdminDashboardResponse)
def get_admin_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Retourne les stats du dashboard admin (global)."""
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    seven_days_ago = now - timedelta(days=7)

    active_watches = db.query(Watch).filter(Watch.watch_status == WatchStatus.ACTIVE).count()
    checks_today = db.query(WatchCheck).filter(WatchCheck.checked_at >= today_start).count()
    
    # Changements sur 7 jours (syntaxe Postgres JSONB)
    try:
        changes_7d = db.query(WatchCheck).filter(
            WatchCheck.checked_at >= seven_days_ago,
            WatchCheck.details['changed'].astext == 'true'
        ).count()
    except Exception as e:
        print(f"Erreur admin stats changes_7d: {e}")
        changes_7d = 0

    errors_7d = db.query(WatchCheck).filter(
        WatchCheck.checked_at >= seven_days_ago,
        WatchCheck.http_status >= 400
    ).count()
    
    last_check = db.query(WatchCheck).order_by(WatchCheck.checked_at.desc()).first()

    # Top domains
    checks_query = db.query(
        Watch.original_url,
        func.count(WatchCheck.id).label("count")
    ).join(WatchCheck).group_by(Watch.original_url).order_by(func.count(WatchCheck.id).desc()).limit(20).all()
    
    domain_data = {}
    for url, count in checks_query:
        host = get_host_from_url(url)
        if host not in domain_data:
            domain_data[host] = {"checks": 0, "changes": 0, "alerts_sent": 0}
        domain_data[host]["checks"] += count

    top_domains = [
        PerformanceRow(
            host=host, 
            checks=data["checks"], 
            changes=data["changes"], 
            alerts_sent=data["alerts_sent"]
        ) for host, data in domain_data.items()
    ]

    return AdminDashboardResponse(
        kpis=AdminDashboardKPIs(
            active_watches=active_watches,
            checks_today=checks_today,
            alerts_sent_7d=changes_7d, # MVP
            errors_7d=errors_7d,
            last_check_at=last_check.checked_at if last_check else None
        ),
        top_domains=top_domains
    )

@admin_router.get("/site-profiles", response_model=List[SiteProfileSimple])
def list_admin_site_profiles(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Liste les profils de site (Admin)."""
    return db.query(SiteProfile).order_by(SiteProfile.name).all()

# Stats.py ROUTES