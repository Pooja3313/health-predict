import os
from google import genai
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Gemini SDK with API key from environment
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
_genai_client = None

if GEMINI_API_KEY:
    _genai_client = genai.Client(api_key=GEMINI_API_KEY)
else:
    logger.warning("GEMINI_API_KEY is not set. Gemini features will use fallback assessment.")


def generate_health_remark(glucose: float, haemoglobin: float, cholesterol: float) -> str:
    """
    Generate a health assessment remark using the official Google Gemini SDK.

    Args:
        glucose (float): Blood glucose level in mg/dL
        haemoglobin (float): Haemoglobin level in g/dL
        cholesterol (float): Cholesterol level in mg/dL

    Returns:
        str: Short health assessment / risk prediction text. Falls back to
             threshold-based assessment if the API call fails.
    """
    # Fallback if API key is not configured
    if not GEMINI_API_KEY or not _genai_client:
        logger.warning("GEMINI_API_KEY not configured. Using fallback assessment.")
        return _fallback_assessment(glucose, haemoglobin, cholesterol)

    try:
        # Use the latest fast Gemini model
        model_name = "gemini-2.5-flash"

        prompt = (
            f"Analyze the following blood test values and provide a short health risk assessment:\n"
            f"Glucose: {glucose}\n"
            f"Haemoglobin: {haemoglobin}\n"
            f"Cholesterol: {cholesterol}\n\n"
            f"Provide a concise assessment (1-2 sentences) identifying any risks such as: "
            f"Possible Diabetes Risk, Possible Anemia Risk, High Cholesterol Risk, or Healthy Range. "
            f"Keep the response short and professional."
        )

        logger.info("Sending request to Gemini API for health assessment...")
        response = _genai_client.models.generate_content(
            model=model_name,
            contents=prompt,
        )

        # Extract the text from the response
        if response and response.text:
            assessment = response.text.strip()
            logger.info(f"Health assessment generated successfully: {assessment}")
            return assessment
        else:
            logger.warning("Gemini returned an empty response. Using fallback assessment.")
            return _fallback_assessment(glucose, haemoglobin, cholesterol)

    except Exception as e:
        logger.error(f"Gemini API call failed: {str(e)}")
        return _fallback_assessment(glucose, haemoglobin, cholesterol)


def _fallback_assessment(glucose: float, haemoglobin: float, cholesterol: float) -> str:
   
    risks = []

    # Glucose thresholds
    if glucose > 200:
        risks.append("Possible Diabetes Risk (High Glucose)")
    elif glucose > 140:
        risks.append("Pre-diabetic Glucose Level - Further testing recommended")
    elif glucose < 70:
        risks.append("Low Glucose Level - Possible Hypoglycemia Risk")
    else:
        risks.append("Glucose: Normal Range")

    # Haemoglobin thresholds
    if haemoglobin < 12:
        risks.append("Possible Anemia Risk (Low Haemoglobin)")
    elif haemoglobin > 17:
        risks.append("High Haemoglobin Level - Further testing recommended")
    else:
        risks.append("Haemoglobin: Normal Range")

    # Cholesterol thresholds
    if cholesterol > 240:
        risks.append("High Cholesterol Risk")
    elif cholesterol > 200:
        risks.append("Borderline High Cholesterol - Monitor closely")
    else:
        risks.append("Cholesterol: Normal Range")

    # Check if all values are in normal range
    is_glucose_normal = 70 <= glucose <= 140
    is_haemoglobin_normal = 12 <= haemoglobin <= 17
    is_cholesterol_normal = cholesterol <= 200

    if is_glucose_normal and is_haemoglobin_normal and is_cholesterol_normal:
        return (
            "Healthy Range - All blood values are within normal limits. "
            "Maintain a balanced diet and regular exercise."
        )

    return " | ".join(risks)
