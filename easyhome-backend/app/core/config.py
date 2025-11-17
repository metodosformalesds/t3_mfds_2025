"""
Configuration settings for the EasyHome Backend API
"""
from pydantic_settings import BaseSettings
from typing import List
import os
from pathlib import Path

# Base directory (easyhome-backend/)
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Buscar .env en múltiples ubicaciones
def find_env_file():
    """Busca el archivo .env en el directorio actual y directorios padre"""
    possible_locations = [
        BASE_DIR / ".env",  # /opt/easyhome/easyhome-backend/.env
        BASE_DIR.parent / ".env",  # /opt/easyhome/.env
        Path(".env"),  # ./env en el directorio actual
    ]
    
    for env_path in possible_locations:
        if env_path.exists():
            print(f"📄 Archivo .env encontrado en: {env_path}")
            return str(env_path)
    
    print(f"⚠️  No se encontró archivo .env. Buscado en: {[str(p) for p in possible_locations]}")
    return str(BASE_DIR / ".env")  # Fallback

ENV_FILE = find_env_file()


class Settings(BaseSettings):
    """Application settings from environment variables"""
    
    # Application
    APP_NAME: str = "EasyHome Backend API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Database Configuration
    DB_NAME: str
    DB_USER: str
    DB_PASSWORD: str
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    
    # Optional: Full DATABASE_URL (if provided, overrides individual components)
    DATABASE_URL: str | None = None
    
    # Security
    SECRET_KEY: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "https://main.d30cfshgj52c8r.amplifyapp.com",
        "https://d84l1y8p4kdic.cloudfront.net"
    ]
    
    # AWS Cognito Configuration
    AWS_REGION: str = "us-east-1"
    AWS_ACCESS_KEY_ID: str | None = None
    AWS_SECRET_ACCESS_KEY: str | None = None
    COGNITO_USER_POOL_ID: str | None = None
    COGNITO_DEFAULT_GROUP: str = "Clientes"
    
    # AWS S3 Configuration
    S3_BUCKET_NAME: str
    S3_REGION: str
    
    class Config:
        env_file = ENV_FILE
        case_sensitive = True
    
    @property
    def database_url(self) -> str:
        """
        Construct synchronous database URL from components or use provided DATABASE_URL
        Always returns URL compatible with psycopg2 (without +asyncpg)
        """
        if self.DATABASE_URL:
            # Remove +asyncpg if present to ensure sync compatibility
            return self.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
        
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    @property
    def async_database_url(self) -> str:
        """
        Async database URL for async database operations
        """
        base_url = self.database_url
        return base_url.replace("postgresql://", "postgresql+asyncpg://")


# Global settings instance
settings = Settings()
