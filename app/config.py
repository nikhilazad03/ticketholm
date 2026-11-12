from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# Load .env into the process environment so Pydantic AI detects GEMINI_API_KEY
load_dotenv()


class Settings(BaseSettings):
    # Gmail API credentials
    google_client_id: str = ""
    google_client_secret: str = ""
    google_refresh_token: str = ""
    email_address: str | None = None

    # Supabase Database
    database_url: str

    # Gemini LLM config (Free tier via Google AI Studio)
    gemini_api_key: str = ""
    classifier_model: str = "google:gemini-3.8-flash"
    agent_model: str = "google:gemini-3.8-flash"
    # Background Poller
    poll_interval_seconds: int = 30

    # Dashboard Auth
    dashboard_username: str = "admin"
    dashboard_password: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()