from flask import jsonify, request
from models.patient import Patient
from services.ai_service import AIService
from utils.validation import validate_patient_data, sanitize_patient_data, validate_mongo_id
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PatientController:

    @staticmethod
    def create_patient():
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "No data provided"}), 400

            sanitized_data = sanitize_patient_data(data)
            is_valid, errors = validate_patient_data(sanitized_data)
            if not is_valid:
                return jsonify({"error": "Validation failed", "errors": errors}), 400

            if not sanitized_data.get("remarks"):
                try:
                    health_assessment = AIService.generate_health_assessment(
                        glucose=sanitized_data["glucose"],
                        haemoglobin=sanitized_data["haemoglobin"],
                        cholesterol=sanitized_data["cholesterol"],
                    )
                    sanitized_data["remarks"] = health_assessment
                except Exception as e:
                    logger.error(f"AI service error: {str(e)}")
                    sanitized_data["remarks"] = "Health assessment temporarily unavailable."

            patient = Patient.create_patient(sanitized_data)
            logger.info(f"Patient created successfully: {patient.full_name}")
            return jsonify({
                "message": "Patient created successfully",
                "patient": patient.to_json(),
            }), 201

        except Exception as e:
            logger.error(f"Error creating patient: {str(e)}")
            return jsonify({"error": "Internal server error"}), 500

    @staticmethod
    def get_all_patients():
        try:
            search_query = request.args.get("search", "").strip()
            search_query = search_query if search_query else None
            patients = Patient.get_all_patients(search_query)
            return jsonify({
                "patients": [patient.to_json() for patient in patients],
                "count": len(patients),
            }), 200

        except Exception as e:
            logger.error(f"Error fetching patients: {str(e)}")
            return jsonify({"error": "Internal server error"}), 500

    @staticmethod
    def get_patient(patient_id):
        try:
            if not validate_mongo_id(patient_id):
                return jsonify({"error": "Invalid patient ID format"}), 400

            patient = Patient.get_patient_by_id(patient_id)
            if not patient:
                return jsonify({"error": "Patient not found"}), 404

            return jsonify({"patient": patient.to_json()}), 200

        except Exception as e:
            logger.error(f"Error fetching patient {patient_id}: {str(e)}")
            return jsonify({"error": "Internal server error"}), 500

    @staticmethod
    def update_patient(patient_id):
        try:
            if not validate_mongo_id(patient_id):
                return jsonify({"error": "Invalid patient ID format"}), 400

            data = request.get_json()
            if not data:
                return jsonify({"error": "No data provided"}), 400

            existing_patient = Patient.get_patient_by_id(patient_id)
            if not existing_patient:
                return jsonify({"error": "Patient not found"}), 404

            sanitized_data = sanitize_patient_data(data)
            is_valid, errors = validate_patient_data(sanitized_data, is_update=True)
            if not is_valid:
                return jsonify({"error": "Validation failed", "errors": errors}), 400

            has_blood_changes = any(
                field in sanitized_data for field in ["glucose", "haemoglobin", "cholesterol"]
            )
            if has_blood_changes:
                try:
                    glucose = sanitized_data.get("glucose", existing_patient.glucose)
                    haemoglobin = sanitized_data.get("haemoglobin", existing_patient.haemoglobin)
                    cholesterol = sanitized_data.get("cholesterol", existing_patient.cholesterol)
                    health_assessment = AIService.generate_health_assessment(
                        glucose=glucose,
                        haemoglobin=haemoglobin,
                        cholesterol=cholesterol,
                    )
                    sanitized_data["remarks"] = health_assessment
                except Exception as e:
                    logger.error(f"AI service error during update: {str(e)}")
                    if "remarks" not in sanitized_data:
                        sanitized_data["remarks"] = "Health assessment temporarily unavailable."

            updated_patient = Patient.update_patient(patient_id, sanitized_data)
            if not updated_patient:
                return jsonify({"error": "Failed to update patient"}), 500

            logger.info(f"Patient updated successfully: {updated_patient.full_name}")
            return jsonify({
                "message": "Patient updated successfully",
                "patient": updated_patient.to_json(),
            }), 200

        except Exception as e:
            logger.error(f"Error updating patient {patient_id}: {str(e)}")
            return jsonify({"error": "Internal server error"}), 500

    @staticmethod
    def delete_patient(patient_id):
        try:
            if not validate_mongo_id(patient_id):
                return jsonify({"error": "Invalid patient ID format"}), 400

            patient = Patient.get_patient_by_id(patient_id)
            if not patient:
                return jsonify({"error": "Patient not found"}), 404

            deleted = Patient.delete_patient(patient_id)
            if not deleted:
                return jsonify({"error": "Failed to delete patient"}), 500

            logger.info(f"Patient deleted successfully: {patient.full_name}")
            return jsonify({"message": "Patient deleted successfully"}), 200

        except Exception as e:
            logger.error(f"Error deleting patient {patient_id}: {str(e)}")
            return jsonify({"error": "Internal server error"}), 500

    @staticmethod
    def get_stats():
        try:
            total_patients = Patient.get_patient_count()
            all_patients = Patient.get_all_patients()

            if total_patients > 0:
                avg_glucose = sum(p.glucose for p in all_patients) / total_patients
                avg_haemoglobin = sum(p.haemoglobin for p in all_patients) / total_patients
                avg_cholesterol = sum(p.cholesterol for p in all_patients) / total_patients
            else:
                avg_glucose = avg_haemoglobin = avg_cholesterol = 0

            recent_patients = all_patients[:5]
            return jsonify({
                "totalPatients": total_patients,
                "averageGlucose": round(avg_glucose, 1),
                "averageHaemoglobin": round(avg_haemoglobin, 1),
                "averageCholesterol": round(avg_cholesterol, 1),
                "recentPatients": [p.to_json() for p in recent_patients],
            }), 200

        except Exception as e:
            logger.error(f"Error fetching stats: {str(e)}")
            return jsonify({"error": "Internal server error"}), 500