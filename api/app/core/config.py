"""
Configuration de l'application via variables d'environnement.
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configuration centralisée de l'API Nova."""

    # Application
    app_env: str = "development"
    debug: bool = False

    # Database
    database_url: str = "postgresql://nova:nova@db:5432/nova"

    # JWT
    jwt_secret_key: str = "dev-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24  # 24 heures

    # CSRF
    csrf_secret_key: str = "csrf-secret-change-in-production"

    # CORS
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS_ORIGINS en liste (séparé par virgules)."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

# Config.py