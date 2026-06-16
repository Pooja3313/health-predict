from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from config.config import Config
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DatabaseConnection:
    _instance = None
    _client = None
    _db = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseConnection, cls).__new__(cls)
            cls._instance._connect()
        return cls._instance

    def _connect(self):
        try:
            self._client = MongoClient(
                Config.MONGO_URI,
                serverSelectionTimeoutMS=5000,
            )
            self._client.admin.command("ping")
            self._db = self._client[Config.MONGO_DB_NAME]
            logger.info(f"Successfully connected to MongoDB: {Config.MONGO_DB_NAME}")
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            raise ConnectionError(f"Could not connect to MongoDB: {str(e)}")

    @property
    def db(self):
        if self._db is None:
            self._connect()
        return self._db

    @property
    def client(self):
        return self._client

    def close(self):
        if self._client:
            self._client.close()
            logger.info("MongoDB connection closed.")


def get_db():
    return DatabaseConnection().db


def test_connection():
    try:
        db = get_db()
        collections = db.list_collection_names()
        return {
            "status": "connected",
            "database": Config.MONGO_DB_NAME,
            "collections": collections,
        }
    except Exception as e:
        return {"status": "disconnected", "error": str(e)}