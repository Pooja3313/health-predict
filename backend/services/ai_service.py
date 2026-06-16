"""
AI Service Module
Provides health assessment functionality by delegating to the Gemini SDK service.
This module maintains backward compatibility with existing imports.
"""
import logging
from services.gemini_service import generate_health_remark

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AIService:
    """
    Service class for generating health assessments.
    Delegates to the official Gemini SDK via gemini_service.py.
    """

    @staticmethod
    def generate_health_assessment(glucose: float, haemoglobin: float, cholesterol: float) -> str:
        """
        Generate a health risk assessment using Google Gemini SDK.

        Args:
            glucose (float): Blood glucose level
            haemoglobin (float): Haemoglobin level
            cholesterol (float): Cholesterol level

        Returns:
            str: Health assessment / risk prediction text
        """
        logger.info("Delegating health assessment to Gemini SDK service...")
        return generate_health_remark(glucose, haemoglobin, cholesterol)