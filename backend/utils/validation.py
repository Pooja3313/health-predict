import re
from datetime import datetime
from typing import Dict, Tuple


def _validate_email(email: str) -> str:
    if not email or not email.strip():
        return "Email is required"

    email = email.strip()
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$'

    if not re.match(pattern, email):
        return "Invalid email"

    local_part, domain = email.rsplit("@", 1)
    if ".." in domain or "." not in domain:
        return "Invalid email"

    tld = domain.rsplit(".", 1)[-1]
    if len(tld) < 2 or not tld.isalpha():
        return "Invalid email"

    if not local_part or local_part[0] in "._%+-" or local_part[-1] in "._%+-":
        return "Invalid email"

    return ""


def _validate_date_of_birth(dob) -> str:
    if not dob:
        return "Date of birth is required"

    try:
        if isinstance(dob, str):
            dob_str = dob.strip()
            date_pattern = re.match(r'^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$', dob_str)
            if date_pattern:
                year, month, day = int(date_pattern.group(1)), int(date_pattern.group(2)), int(date_pattern.group(3))
            else:
                date_pattern = re.match(r'^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$', dob_str)
                if date_pattern:
                    day, month, year = int(date_pattern.group(1)), int(date_pattern.group(2)), int(date_pattern.group(3))
                else:
                    return "Invalid date of birth"

            if month < 1 or month > 12:
                return "Invalid date of birth"

            days_in_month = {
                1: 31, 2: 29, 3: 31, 4: 30, 5: 31, 6: 30,
                7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31,
            }
            if day < 1 or day > days_in_month.get(month, 31):
                return "Invalid date of birth"

            if month == 2 and day == 29:
                is_leap = (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0)
                if not is_leap:
                    return "Invalid date of birth"

            dob_date = datetime(year, month, day)

        elif hasattr(dob, 'year'):
            dob_date = dob
        else:
            return "Invalid date of birth"

        now = datetime.utcnow()
        if dob_date > now:
            return "Date of birth cannot be a future date"

    except (ValueError, TypeError):
        return "Invalid date of birth"

    return ""


def validate_patient_data(data: dict, is_update: bool = False) -> Tuple[bool, Dict[str, str]]:
    errors = {}

    # Full Name
    if not is_update or "fullName" in data:
        full_name = data.get("fullName", "")
        if not full_name or not full_name.strip():
            errors["fullName"] = "Full name is required"
        elif len(full_name.strip()) < 2 or len(full_name.strip()) > 100:
            errors["fullName"] = "Invalid full name"

    # Email
    if not is_update or "email" in data:
        email = data.get("email", "")
        error_msg = _validate_email(email)
        if error_msg:
            errors["email"] = error_msg

    # Date of Birth
    if not is_update or "dob" in data:
        dob = data.get("dob", "")
        error_msg = _validate_date_of_birth(dob)
        if error_msg:
            errors["dob"] = error_msg

    # Glucose
    if not is_update or "glucose" in data:
        glucose = data.get("glucose")
        if glucose is None or glucose == "":
            errors["glucose"] = "Glucose is required"
        else:
            try:
                glucose_val = float(glucose)
                if glucose_val < 0 or glucose_val > 500:
                    errors["glucose"] = "Invalid glucose"
            except (ValueError, TypeError):
                errors["glucose"] = "Invalid glucose"

    # Haemoglobin
    if not is_update or "haemoglobin" in data:
        haemoglobin = data.get("haemoglobin")
        if haemoglobin is None or haemoglobin == "":
            errors["haemoglobin"] = "Haemoglobin is required"
        else:
            try:
                haemoglobin_val = float(haemoglobin)
                if haemoglobin_val < 0 or haemoglobin_val > 25:
                    errors["haemoglobin"] = "Invalid haemoglobin"
            except (ValueError, TypeError):
                errors["haemoglobin"] = "Invalid haemoglobin"

    # Cholesterol
    if not is_update or "cholesterol" in data:
        cholesterol = data.get("cholesterol")
        if cholesterol is None or cholesterol == "":
            errors["cholesterol"] = "Cholesterol is required"
        else:
            try:
                cholesterol_val = float(cholesterol)
                if cholesterol_val < 0 or cholesterol_val > 500:
                    errors["cholesterol"] = "Invalid cholesterol"
            except (ValueError, TypeError):
                errors["cholesterol"] = "Invalid cholesterol"

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
                err = _validate_date_of_birth(dob)
                if not err:
                    dob_str = dob.strip()
                    parts = re.split(r'[-/]', dob_str)
                    if len(parts) == 3:
                        if len(parts[0]) == 4:
                            y, m, d = int(parts[0]), int(parts[1]), int(parts[2])
                        else:
                            d, m, y = int(parts[0]), int(parts[1]), int(parts[2])
                        sanitized["dob"] = datetime(y, m, d)
                    else:
                        sanitized["dob"] = dob
                else:
                    sanitized["dob"] = dob
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