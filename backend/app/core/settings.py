from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    # =====================================================
    # APPLICATION
    # =====================================================

    app_name: str
    app_version: str
    debug: bool

    # =====================================================
    # DATABASE
    # =====================================================

    database_url: str

    # =====================================================
    # JWT
    # =====================================================

    secret_key: str
    algorithm: str
    access_token_expire_minutes: int

    # =====================================================
    # GEMINI
    # =====================================================

    gemini_api_key: str = ""

    # =====================================================
    # EMAIL / SMTP
    # =====================================================

    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587

    smtp_username: str
    smtp_password: str

    smtp_from_email: str
    smtp_from_name: str = "StudyFlow AI"

    # =====================================================
    # FRONTEND
    # =====================================================

    frontend_url: str = "http://localhost:5173"

    # =====================================================
    # CONFIG
    # =====================================================

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()