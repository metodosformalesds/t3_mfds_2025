"""
Configuration settings for the EasyHome Backend API
"""
from pydantic_settings import BaseSettings
from typing import List
import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent


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
    BACKEND_CORS_ORIGINS: List[str] = []
    
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
        env_file = os.path.join(BASE_DIR, ".env")
        case_sensitive = True
    
    @property
    def database_url(self) -> str:
        """
        Construct database URL from components or use provided DATABASE_URL
        """
        if self.DATABASE_URL:
            return self.DATABASE_URL
        
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    @property
    def async_database_url(self) -> str:
        """
        Async database URL for async database operations
        """
        return self.database_url.replace("postgresql://", "postgresql+asyncpg://")


# Global settings instance
settings = Settings()
