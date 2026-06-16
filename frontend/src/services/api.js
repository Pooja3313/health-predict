import axios from "axios";

const API_BASE_URL = "/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

const patientService = {
  createPatient: async (patientData) => {
    try {
      const response = await apiClient.post("/patients", patientData);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { error: "Network error. Please try again." }
      );
    }
  },

  getAllPatients: async (searchQuery = "") => {
    try {
      const params = searchQuery ? { search: searchQuery } : {};
      const response = await apiClient.get("/patients", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to fetch patients." };
    }
  },

  getPatientById: async (id) => {
    try {
      const response = await apiClient.get(`/patients/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Patient not found." };
    }
  },

  updatePatient: async (id, patientData) => {
    try {
      const response = await apiClient.put(`/patients/${id}`, patientData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to update patient." };
    }
  },

  deletePatient: async (id) => {
    try {
      const response = await apiClient.delete(`/patients/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to delete patient." };
    }
  },

  getStats: async () => {
    try {
      const response = await apiClient.get("/patients/stats");
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: "Failed to fetch statistics." };
    }
  },
};

export default patientService;
