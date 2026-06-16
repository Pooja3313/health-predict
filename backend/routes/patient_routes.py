from flask import Blueprint
from controllers.patient_controller import PatientController

patient_bp = Blueprint("patients", __name__, url_prefix="/api/patients")

patient_bp.route("", methods=["POST"])(PatientController.create_patient)
patient_bp.route("", methods=["GET"])(PatientController.get_all_patients)
patient_bp.route("/stats", methods=["GET"])(PatientController.get_stats)
patient_bp.route("/<string:patient_id>", methods=["GET"])(PatientController.get_patient)
patient_bp.route("/<string:patient_id>", methods=["PUT"])(PatientController.update_patient)
patient_bp.route("/<string:patient_id>", methods=["DELETE"])(PatientController.delete_patient)