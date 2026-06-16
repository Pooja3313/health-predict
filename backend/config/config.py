"""
Application Configuration Module
Loads environment variables and provides configuration for the application.
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Main configuration class."""

    # MongoDB Configuration
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "health_prediction_db")

    # Google Gemini AI Configuration
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

    # Server Configuration
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
    DEBUG = os.getenv("DEBUG", "True").lower() == "true"
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 5000))


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True


class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False


class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    MONGO_DB_NAME = "health_prediction_test_db"


# Configuration dictionary
config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
    "default": DevelopmentConfig,
}