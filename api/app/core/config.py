"""
Configuration de l'application via variables d'environnement.
"""
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configuration centralisée de l'API Nova."""

    # Application
    app_env: str = Field(default="development", alias="APP_ENV")
    debug: bool = Field(default=False, alias="DEBUG")

    # Database
    database_url: str = Field(alias="DATABASE_URL", default="postgresql://nova:nova@db:5432/nova")

    # JWT
    jwt_secret_key: str = Field(alias="JWT_SECRET_KEY", default="dev-secret-change-in-production")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    jwt_expire_minutes: int = Field(default=60 * 24, alias="JWT_EXPIRE_MINUTES")  # 24 heures

    # CSRF
    csrf_disabled: bool = Field(alias="CSRF_DISABLED", default=False)

    # CORS
    cors_origins: str = Field(alias="CORS_ORIGINS", default="http://localhost:3000")

    # Cookies
    cookie_secure: bool | None = Field(alias="COOKIE_SECURE", default=None)

    # Worker
    check_mode: str = Field(alias="CHECK_MODE", default="fixture")  # "fixture" = mode déterministe
    fixture_name: str = Field(alias="FIXTURE_NAME", default="in_stock.html")

    # SMTP (Mailhog en dev)
    smtp_host: str = Field(alias="SMTP_HOST", default="mailhog")
    smtp_port: int = Field(alias="SMTP_PORT", default=1025)
    smtp_from: str = Field(alias="SMTP_FROM", default="noreply@nova.dev")

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS_ORIGINS en liste (séparé par virgules)."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def use_cookie_secure(self) -> bool:
        """Détermine si on utilise secure=True sur les cookies."""
        if self.cookie_secure is not None:
            return self.cookie_secure
        return self.app_env == "production"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

# Validation de sécurité en production
if settings.app_env == "production":
    forbidden_keys = [
        "dev-secret-change-in-production",
        "change-this-secret-in-production",
        "changeme",
        "secret",
        "password",
    ]
    if settings.jwt_secret_key in forbidden_keys:
        raise ValueError("JWT_SECRET_KEY must be set in production to a strong, unique value (not a placeholder).")

# Config.py