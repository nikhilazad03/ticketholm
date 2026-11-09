from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load .env into the environment so Pydantic AI detects GEMINI_API_KEY
load_dotenv()

class Settings(BaseSettings):
    google_client_id: str
    google_client_secret: str
    google_refresh_token: str
    database_url: str
    gemini_api_key: str = ""
    classifier_model: str = "google-gla:gemini-2.5-flash"
    agent_model: str = "google-gla:gemini-2.5-pro"
    poll_interval_seconds: int = 60
    dashboard_username: str = "admin"
    dashboard_password: str = ""

settings = Settings()