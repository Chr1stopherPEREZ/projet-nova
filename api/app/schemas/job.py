"""
Schémas Pydantic pour les jobs (LOT 5).
"""
from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel, model_validator


class JobRunRequest(BaseModel):
    """Corps de la requête POST /jobs/run."""
    watch_id: Optional[UUID] = None
    run_all: Optional[Literal[True]] = None  # Accepte uniquement true, pas false

    @model_validator(mode="after")
    def validate_exclusive(self):
        """Vérifie que watch_id XOR run_all est fourni."""
        if self.watch_id is None and self.run_all is None:
            raise ValueError("Either 'watch_id' or 'run_all' must be provided")
        if self.watch_id is not None and self.run_all is not None:
            raise ValueError("Cannot specify both 'watch_id' and 'run_all'")
        return self


class CheckResult(BaseModel):
    """Résultat d'un check individuel."""
    watch_id: UUID
    watch_label: Optional[str]
    stock_state: str
    http_status: int
    changed: bool
    previous_state: Optional[str] = None


class JobRunResponse(BaseModel):
    """Réponse de POST /jobs/run."""
    message: str
    checks_executed: int
    changes_detected: int
    emails_sent: int
    results: list[CheckResult]

# Job.py
