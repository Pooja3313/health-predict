import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PatientForm from '../components/PatientForm';
import LoadingSpinner from '../components/LoadingSpinner';
import patientService from '../services/api';
import toast from 'react-hot-toast';


function EditPatient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const fetchPatient = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await patientService.getPatientById(id);
      setPatient(data.patient);
    } catch (err) {
      const errorMsg = err.error || 'Failed to load patient';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      const result = await patientService.updatePatient(id, formData);
      toast.success('Patient updated successfully! AI health assessment regenerated.');
      navigate('/patients');
    } catch (err) {
      // Field-level errors are displayed inline by PatientForm.
      // Only show a general toast for the main error or non-field errors.
      if (err.errors && typeof err.errors === 'object') {
        const nonFieldErrors = Object.keys(err.errors).filter(
          (key) => !['fullName', 'email', 'dob', 'glucose', 'haemoglobin', 'cholesterol', 'duplicate'].includes(key)
        );
        nonFieldErrors.forEach((key) => toast.error(err.errors[key]));
        if (Object.keys(err.errors).length > 0 && nonFieldErrors.length === 0) {
          toast.error('Please fix the highlighted errors.');
        }
      } else {
        toast.error(err.error || 'Failed to update patient');
      }
      throw err;
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading patient data..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Patient Not Found</h3>
        <p className="text-sm text-gray-500 mb-6">{error}</p>
        <button onClick={() => navigate('/patients')} className="btn-primary">
          Back to Patients
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Edit Patient</h2>
        <p className="text-sm text-gray-500 mt-1">
          Update patient information. Blood test changes will trigger a new AI health assessment.
        </p>
      </div>

      {/* Patient Form with existing data */}
      {patient && (
        <PatientForm
          initialData={patient}
          onSubmit={handleSubmit}
          isEdit={true}
        />
      )}
    </div>
  );
}

export default EditPatient;