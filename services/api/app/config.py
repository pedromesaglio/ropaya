from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    redis_url: str
    stripe_secret_key: str
    stripe_webhook_secret: str
    stripe_commission_percent: float = 2.5
    secret_key: str
    environment: str = "development"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
