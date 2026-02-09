"""
Service d'envoi d'emails (LOT 5).
Utilise smtplib pour envoyer via Mailhog en dev.
"""
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Protocol

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailBackend(Protocol):
    """Interface pour l'envoi d'emails (facilite les tests)."""
    
    def send(self, to: str, subject: str, body: str) -> bool:
        """Envoie un email."""
        ...


class SMTPEmailBackend:
    """Backend SMTP réel (Mailhog en dev)."""
    
    def __init__(self, host: str, port: int):
        self.host = host
        self.port = port
    
    def send(self, to: str, subject: str, body: str) -> bool:
        """Envoie un email via SMTP."""
        try:
            msg = MIMEMultipart()
            msg["From"] = settings.smtp_from
            msg["To"] = to
            msg["Subject"] = subject
            msg.attach(MIMEText(body, "plain"))
            
            with smtplib.SMTP(self.host, self.port) as server:
                server.sendmail(settings.smtp_from, to, msg.as_string())
            
            logger.info(f"Email envoyé à {to}: {subject}")
            return True
        except Exception as e:
            logger.error(f"Erreur envoi email à {to}: {e}")
            return False


class FakeEmailBackend:
    """Backend fake pour les tests (n'envoie rien, stocke les emails)."""
    
    def __init__(self):
        self.sent_emails: list[dict] = []
    
    def send(self, to: str, subject: str, body: str) -> bool:
        """Stocke l'email au lieu de l'envoyer."""
        self.sent_emails.append({
            "to": to,
            "subject": subject,
            "body": body,
        })
        logger.info(f"[FAKE] Email simulé à {to}: {subject}")
        return True
    
    def reset(self):
        """Réinitialise les emails envoyés."""
        self.sent_emails = []


class EmailService:
    """Service d'envoi d'emails pour Nova."""
    
    def __init__(self, backend: EmailBackend):
        self.backend = backend
    
    def send_stock_change_notification(
        self,
        to: str,
        watch_label: str,
        watch_url: str,
        previous_state: str,
        new_state: str,
        checked_at: str,
    ) -> bool:
        """
        Envoie une notification de changement de stock.
        
        Args:
            to: Adresse email du destinataire
            watch_label: Label de la watch (ou URL si pas de label)
            watch_url: URL de la watch
            previous_state: État précédent (IN_STOCK, OUT_OF_STOCK, etc.)
            new_state: Nouvel état
            checked_at: Date/heure du check
        
        Returns:
            True si envoi réussi, False sinon
        """
        subject = "[Nova] Changement de stock détecté"
        body = f"""Bonjour,

Un changement de stock a été détecté sur votre suivi :

📦 Produit : {watch_label}
🔗 URL : {watch_url}

📊 Changement :
   Ancien état : {previous_state}
   Nouvel état : {new_state}

🕐 Détecté le : {checked_at}

---
Nova - Plateforme de suivi de retour en stock
"""
        return self.backend.send(to, subject, body)


# Instance globale (remplacée par fake en tests via dependency injection)
_email_service: EmailService | None = None


def get_email_service() -> EmailService:
    """Retourne le service email (injectable pour les tests)."""
    global _email_service
    if _email_service is None:
        backend = SMTPEmailBackend(
            host=settings.smtp_host,
            port=settings.smtp_port,
        )
        _email_service = EmailService(backend)
    return _email_service


def set_email_service(service: EmailService) -> None:
    """Permet de remplacer le service email (pour les tests)."""
    global _email_service
    _email_service = service


def reset_email_service() -> None:
    """Réinitialise le service email global (pour éviter les fuites d'état entre tests)."""
    global _email_service
    _email_service = None


# Email.py
