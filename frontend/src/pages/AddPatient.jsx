import React from 'react';
import { useNavigate } from 'react-router-dom';
import PatientForm from '../components/PatientForm';
import patientService from '../services/api';
import toast from 'react-hot-toast';


function AddPatient() {
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      const result = await patientService.createPatient(formData);
      toast.success('Patient created successfully! AI health assessment generated.');
      navigate('/patients');
    } catch (err) {
      // Field-level errors are displayed inline by PatientForm.
      // Only show a general toast for the main error or non-field errors.
      if (err.errors && typeof err.errors === 'object') {
        // Check if there are any non-field errors to toast
        const nonFieldErrors = Object.keys(err.errors).filter(
          (key) => !['fullName', 'email', 'dob', 'glucose', 'haemoglobin', 'cholesterol', 'duplicate'].includes(key)
        );
        nonFieldErrors.forEach((key) => toast.error(err.errors[key]));
        // If we have field errors, toast a general message
        if (Object.keys(err.errors).length > 0 && nonFieldErrors.length === 0) {
          toast.error('Please fix the highlighted errors.');
        }
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