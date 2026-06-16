import re
from datetime import datetime
from typing import Dict, Tuple


def validate_patient_data(data: dict, is_update: bool = False) -> Tuple[bool, Dict[str, str]]:
   
    errors = {}

    # Full Name validation
    if not is_update or "fullName" in data:
        full_name = data.get("fullName", "")
        if not full_name or not full_name.strip():
            errors["fullName"] = "Full Name is required"
        elif len(full_name.strip()) < 2:
            errors["fullName"] = "Full Name must be at least 2 characters"
        elif len(full_name.strip()) > 100:
            errors["fullName"] = "Full Name must not exceed 100 characters"

    # Email validation
    if not is_update or "email" in data:
        email = data.get("email", "")
        if not email or not email.strip():
            errors["email"] = "Email is required"
        else:
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, email.strip()):
                errors["email"] = "Please provide a valid email address"

    # Date of Birth validation
    if not is_update or "dob" in data:
        dob = data.get("dob", "")
        if not dob:
            errors["dob"] = "Date of Birth is required"
        else:
            try:
                # Parse the date - handle both datetime objects and string dates
                if isinstance(dob, str):
                    dob_date = datetime.fromisoformat(dob.replace("Z", "+00:00"))
                else:
                    dob_date = dob

                # Check if date is in the future
                if dob_date > datetime.now(dob_date.tzinfo) if dob_date.tzinfo else dob_date > datetime.utcnow():
                    errors["dob"] = "Date of Birth cannot be a future date"
            except (ValueError, TypeError):
                errors["dob"] = "Invalid date format. Please use YYYY-MM-DD"

    # Glucose validation
    if not is_update or "glucose" in data:
        glucose = data.get("glucose")
        if glucose is None or glucose == "":
            errors["glucose"] = "Glucose level is required"
        else:
            try:
                glucose_val = float(glucose)
                if glucose_val < 0:
                    errors["glucose"] = "Glucose level cannot be negative"
                elif glucose_val > 500:
                    errors["glucose"] = "Glucose level seems too high (max 500)"
            except (ValueError, TypeError):
                errors["glucose"] = "Glucose must be a numeric value"

    # Haemoglobin validation
    if not is_update or "haemoglobin" in data:
        haemoglobin = data.get("haemoglobin")
        if haemoglobin is None or haemoglobin == "":
            errors["haemoglobin"] = "Haemoglobin level is required"
        else:
            try:
                haemoglobin_val = float(haemoglobin)
                if haemoglobin_val < 0:
                    errors["haemoglobin"] = "Haemoglobin level cannot be negative"
                elif haemoglobin_val > 25:
                    errors["haemoglobin"] = "Haemoglobin level seems too high (max 25)"
            except (ValueError, TypeError):
                errors["haemoglobin"] = "Haemoglobin must be a numeric value"

    # Cholesterol validation
    if not is_update or "cholesterol" in data:
        cholesterol = data.get("cholesterol")
        if cholesterol is None or cholesterol == "":
            errors["cholesterol"] = "Cholesterol level is required"
        else:
            try:
                cholesterol_val = float(cholesterol)
                if cholesterol_val < 0:
                    errors["cholesterol"] = "Cholesterol level cannot be negative"
                elif cholesterol_val > 500:
                    errors["cholesterol"] = "Cholesterol level seems too high (max 500)"
            except (ValueError, TypeError):
                errors["cholesterol"] = "Cholesterol must be a numeric value"

    return len(errors) == 0, errors


def sanitize_patient_data(data: dict) -> dict:
  
    sanitized = {}

    if "fullName" in data:
        sanitized["fullName"] = data["fullName"].strip()

    if "email" in data:
        sanitized["email"] = data["email"].strip().lower()

    if "dob" in data:
        dob = data["dob"]
        if isinstance(dob, str):
            try:
                sanitized["dob"] = datetime.fromisoformat(dob.replace("Z", "+00:00"))
            except ValueError:
                sanitized["dob"] = dob
        else:
            sanitized["dob"] = dob

    numeric_fields = ["glucose", "haemoglobin", "cholesterol"]
    for field in numeric_fields:
        if field in data and data[field] is not None and data[field] != "":
            try:
                sanitized[field] = float(data[field])
            except (ValueError, TypeError):
                sanitized[field] = data[field]

    if "remarks" in data:
        sanitized["remarks"] = data["remarks"]

    return sanitized


def validate_mongo_id(patient_id: str) -> bool:
 
    if not patient_id:
        return False
    return bool(re.match(r'^[0-9a-fA-F]{24}$', patient_id))