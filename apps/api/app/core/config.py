from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

from app.core.db_url import normalize_database_url


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    ENV: str = Field(default="dev")
    DATABASE_URL: str = Field(
        default="postgresql+psycopg://postgres:postgres@localhost:5432/selection_neuro"
    )
    # Comma-separated origins, ex: "http://localhost:3000,https://site.com"
    CORS_ORIGINS: str = Field(default="http://localhost:3000")
    ADMIN_TOKEN: str = Field(default="")

    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    @property
    def database_url(self) -> str:
        return normalize_database_url(self.DATABASE_URL)

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()