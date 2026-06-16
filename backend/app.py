from flask import Flask, jsonify
from flask_cors import CORS
from config.config import Config, config_by_name
from database.connection import test_connection
from routes.patient_routes import patient_bp
import logging
import os

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def create_app(config_name=None):
    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")

    app = Flask(__name__)
    app.config.from_object(config_by_name.get(config_name, config_by_name["default"]))

    CORS(app, resources={r"/api/*": {"origins": "*"}})
    app.register_blueprint(patient_bp)

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "healthy",
            "service": "Health Prediction API",
            "version": "1.0.0",
        }), 200

    @app.route("/api/db-status", methods=["GET"])
    def database_status():
        status = test_connection()
        return jsonify(status), 200 if status["status"] == "connected" else 503

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": "Internal server error"}), 500

    logger.info(f"Health Prediction Application started in {config_name} mode")
    return app


if __name__ == "__main__":
    app = create_app()
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=Config.DEBUG,
    )