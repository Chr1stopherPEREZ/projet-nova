"""
Services métier pour Nova.
"""
from app.services.email import EmailService, get_email_service, set_email_service, FakeEmailBackend
from app.services.check_engine import run_check, load_fixture, analyze_fixture, get_last_check

__all__ = [
    "EmailService",
    "get_email_service",
    "set_email_service",
    "FakeEmailBackend",
    "run_check",
    "load_fixture",
    "analyze_fixture",
    "get_last_check",
]

# __init__.py SERVICES
