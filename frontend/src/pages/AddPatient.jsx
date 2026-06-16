import React from 'react';
import { useNavigate } from 'react-router-dom';
import PatientForm from '../components/PatientForm';
import patientService from '../services/api';
import toast from 'react-hot-toast';

/**
 * Add Patient Page
 * Form to create a new patient with AI health assessment.
 */
function AddPatient() {
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      const result = await patientService.createPatient(formData);
      toast.success('Patient created successfully! AI health assessment generated.');
      navigate('/patients');
    } catch (err) {
      if (err.errors) {
        // Display validation errors from backend
        Object.values(err.errors).forEach((msg) => {
          toast.error(msg);
        });
      } else {
        toast.error(err.error || 'Failed to create patient');
      }
      throw err; // Re-throw so form knows submission failed
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Add New Patient</h2>
        <p className="text-sm text-gray-500 mt-1">
          Enter patient details and blood test values. AI will generate a health assessment automatically.
        </p>
      </div>

      {/* Patient Form */}
      <PatientForm onSubmit={handleSubmit} isEdit={false} />
    </div>
  );
}

export default AddPatient;