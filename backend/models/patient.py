from datetime import datetime
from bson import ObjectId
from database.connection import get_db


class Patient:
    collection_name = "patients"

    def __init__(self, data=None):
        if data:
            self.id = str(data.get("_id", ""))
            self.full_name = data.get("fullName", "")
            self.dob = data.get("dob", "")
            self.email = data.get("email", "")
            self.glucose = data.get("glucose", 0)
            self.haemoglobin = data.get("haemoglobin", 0)
            self.cholesterol = data.get("cholesterol", 0)
            self.remarks = data.get("remarks", "")
            self.created_at = data.get("createdAt", datetime.utcnow())
            self.updated_at = data.get("updatedAt", datetime.utcnow())

    def to_dict(self):
        return {
            "_id": self.id,
            "fullName": self.full_name,
            "dob": self.dob.isoformat() if hasattr(self.dob, "isoformat") else self.dob,
            "email": self.email,
            "glucose": self.glucose,
            "haemoglobin": self.haemoglobin,
            "cholesterol": self.cholesterol,
            "remarks": self.remarks,
            "createdAt": self.created_at.isoformat() if hasattr(self.created_at, "isoformat") else self.created_at,
            "updatedAt": self.updated_at.isoformat() if hasattr(self.updated_at, "isoformat") else self.updated_at,
        }

    def to_json(self):
        data = self.to_dict()
        data["id"] = data.pop("_id")
        return data

    @staticmethod
    def get_collection():
        db = get_db()
        return db[Patient.collection_name]

    @staticmethod
    def create_patient(data):
        collection = Patient.get_collection()
        now = datetime.utcnow()
        patient_doc = {
            "fullName": data.get("fullName", "").strip(),
            "dob": data.get("dob"),
            "email": data.get("email", "").strip().lower(),
            "glucose": float(data.get("glucose", 0)),
            "haemoglobin": float(data.get("haemoglobin", 0)),
            "cholesterol": float(data.get("cholesterol", 0)),
            "remarks": data.get("remarks", ""),
            "createdAt": now,
            "updatedAt": now,
        }
        result = collection.insert_one(patient_doc)
        patient_doc["_id"] = result.inserted_id
        return Patient(patient_doc)

    @staticmethod
    def get_all_patients(search_query=None):
        collection = Patient.get_collection()
        if search_query:
            query = {
                "$or": [
                    {"fullName": {"$regex": search_query, "$options": "i"}},
                    {"email": {"$regex": search_query, "$options": "i"}},
                ]
            }
            cursor = collection.find(query).sort("createdAt", -1)
        else:
            cursor = collection.find().sort("createdAt", -1)
        return [Patient(doc) for doc in cursor]

    @staticmethod
    def get_patient_by_id(patient_id):
        collection = Patient.get_collection()
        try:
            doc = collection.find_one({"_id": ObjectId(patient_id)})
            return Patient(doc) if doc else None
        except Exception:
            return None

    @staticmethod
    def update_patient(patient_id, data):
        collection = Patient.get_collection()
        update_fields = {}
        if "fullName" in data:
            update_fields["fullName"] = data["fullName"].strip()
        if "dob" in data:
            update_fields["dob"] = data["dob"]
        if "email" in data:
            update_fields["email"] = data["email"].strip().lower()
        if "glucose" in data:
            update_fields["glucose"] = float(data["glucose"])
        if "haemoglobin" in data:
            update_fields["haemoglobin"] = float(data["haemoglobin"])
        if "cholesterol" in data:
            update_fields["cholesterol"] = float(data["cholesterol"])
        if "remarks" in data:
            update_fields["remarks"] = data["remarks"]
        update_fields["updatedAt"] = datetime.utcnow()
        try:
            collection.update_one({"_id": ObjectId(patient_id)}, {"$set": update_fields})
            return Patient.get_patient_by_id(patient_id)
        except Exception:
            return None

    @staticmethod
    def delete_patient(patient_id):
        collection = Patient.get_collection()
        try:
            result = collection.delete_one({"_id": ObjectId(patient_id)})
            return result.deleted_count > 0
        except Exception:
            return False

    @staticmethod
    def get_patient_count():
        collection = Patient.get_collection()
        return collection.count_documents({})