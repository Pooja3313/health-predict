import logging
from services.gemini_service import generate_health_remark

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AIService:
   

    @staticmethod
    def generate_health_assessment(glucose: float, haemoglobin: float, cholesterol: float) -> str:
     
        logger.info("Delegating health assessment to Gemini SDK service...")
        return generate_health_remark(glucose, haemoglobin, cholesterol)