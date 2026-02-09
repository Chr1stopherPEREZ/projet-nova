"""
Routes pour les jobs (LOT 5).
POST /jobs/run : déclenche un check sur une ou plusieurs watches.
"""
import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.csrf import verify_csrf
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.watch import Watch, WatchStatus
from app.schemas.job import JobRunRequest, JobRunResponse, CheckResult
from app.services.check_engine import run_check
from app.services.email import get_email_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.post("/run", response_model=JobRunResponse, status_code=200)
def run_job(
    request: JobRunRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _: None = Depends(verify_csrf),
) -> JobRunResponse:
    """
    Déclenche un check de stock.
    
    - Si `watch_id` fourni : check sur cette watch uniquement
    - Si `run_all=true` : check sur toutes les watches ACTIVE de l'utilisateur
    
    Envoie un email si un changement de stock est détecté.
    """
    logger.info(f"POST /jobs/run par user_id={current_user.id}")
    
    # Vérifier le mode (fixture uniquement pour LOT 5)
    if settings.check_mode != "fixture":
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=f"CHECK_MODE='{settings.check_mode}' non supporté. Seul 'fixture' est implémenté.",
        )
    
    # Déterminer les watches à vérifier
    watches: list[Watch] = []
    
    if request.watch_id:
        # Mode single watch
        watch = (
            db.query(Watch)
            .filter(Watch.id == request.watch_id, Watch.user_id == current_user.id)
            .first()
        )
        if not watch:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Watch not found",
            )
        watches = [watch]
        logger.info(f"Mode single watch: watch_id={request.watch_id}")
    else:
        # Mode run_all : toutes les watches ACTIVE de l'utilisateur
        watches = (
            db.query(Watch)
            .filter(Watch.user_id == current_user.id, Watch.watch_status == WatchStatus.ACTIVE)
            .all()
        )
        logger.info(f"Mode run_all: {len(watches)} watch(es) ACTIVE")
    
    if not watches:
        return JobRunResponse(
            message="Aucune watch à vérifier",
            checks_executed=0,
            changes_detected=0,
            emails_sent=0,
            results=[],
        )
    
    # Exécuter les checks
    results: list[CheckResult] = []
    changes_detected = 0
    emails_sent = 0
    email_service = get_email_service()
    
    for watch in watches:
        try:
            check, changed, previous_state = run_check(
                db=db,
                watch=watch,
                fixture_name=settings.fixture_name,
                commit=True,
            )
            
            result = CheckResult(
                watch_id=watch.id,
                watch_label=watch.label,
                stock_state=check.stock_state,
                http_status=check.http_status,
                changed=changed,
                previous_state=previous_state,
            )
            results.append(result)
            
            if changed:
                changes_detected += 1
                # Envoyer notification email
                sent = email_service.send_stock_change_notification(
                    to=current_user.email,
                    watch_label=watch.label or watch.original_url,
                    watch_url=watch.original_url,
                    previous_state=previous_state or "N/A",
                    new_state=check.stock_state,
                    checked_at=check.checked_at.strftime("%Y-%m-%d %H:%M:%S UTC"),
                )
                if sent:
                    emails_sent += 1
                    logger.info(f"Email envoyé pour watch_id={watch.id}")
        
        except Exception as e:
            logger.error(f"Erreur check watch_id={watch.id}: {e}", exc_info=True)
            # Continue avec les autres watches
    
    message = f"{len(results)} check(s) exécuté(s)"
    if changes_detected > 0:
        message += f", {changes_detected} changement(s) détecté(s)"
    if emails_sent > 0:
        message += f", {emails_sent} email(s) envoyé(s)"
    
    logger.info(message)
    
    return JobRunResponse(
        message=message,
        checks_executed=len(results),
        changes_detected=changes_detected,
        emails_sent=emails_sent,
        results=results,
    )


# Jobs.py
