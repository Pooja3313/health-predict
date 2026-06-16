import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

/**
 * PatientForm Component
 * Reusable form for creating and editing patients with validation.
 */
function PatientForm({ initialData, onSubmit, isEdit = false }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || '',
    dob: initialData?.dob ? initialData.dob.split('T')[0] : '',
    email: initialData?.email || '',
    glucose: initialData?.glucose || '',
    haemoglobin: initialData?.haemoglobin || '',
    cholesterol: initialData?.cholesterol || '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Full Name validation - text only
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.fullName.trim())) {
      newErrors.fullName = 'Full Name must contain only letters and spaces';
    }

    // Email validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailPattern.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Date of Birth validation
    if (!formData.dob) {
      newErrors.dob = 'Date of Birth is required';
    } else {
      const dobDate = new Date(formData.dob);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (dobDate > today) {
        newErrors.dob = 'Date of Birth cannot be a future date';
      }
    }

    // Glucose validation
    if (!formData.glucose && formData.glucose !== 0) {
      newErrors.glucose = 'Glucose level is required';
    } else if (isNaN(formData.glucose) || formData.glucose === '') {
      newErrors.glucose = 'Glucose must be a numeric value';
    } else if (Number(formData.glucose) < 0) {
      newErrors.glucose = 'Glucose cannot be negative';
    }

    // Haemoglobin validation
    if (!formData.haemoglobin && formData.haemoglobin !== 0) {
      newErrors.haemoglobin = 'Haemoglobin level is required';
    } else if (isNaN(formData.haemoglobin) || formData.haemoglobin === '') {
      newErrors.haemoglobin = 'Haemoglobin must be a numeric value';
    } else if (Number(formData.haemoglobin) < 0) {
      newErrors.haemoglobin = 'Haemoglobin cannot be negative';
    }

    // Cholesterol validation
    if (!formData.cholesterol && formData.cholesterol !== 0) {
      newErrors.cholesterol = 'Cholesterol level is required';
    } else if (isNaN(formData.cholesterol) || formData.cholesterol === '') {
      newErrors.cholesterol = 'Cholesterol must be a numeric value';
    } else if (Number(formData.cholesterol) < 0) {
      newErrors.cholesterol = 'Cholesterol cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    try {
      setSubmitting(true);
      const submitData = {
        ...formData,
        glucose: Number(formData.glucose),
        haemoglobin: Number(formData.haemoglobin),
        cholesterol: Number(formData.cholesterol),
      };
      await onSubmit(submitData);
    } catch (err) {
      // Error handling is done in the parent
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/patients');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="md:col-span-2">
            <label htmlFor="fullName" className="label">
              Full Name <span className="text-danger-500">*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              className={`input ${errors.fullName ? 'input-error' : ''}`}
              placeholder="Enter patient's full name"
            />
            {errors.fullName && <p className="error-text">{errors.fullName}</p>}
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="dob" className="label">
              Date of Birth <span className="text-danger-500">*</span>
            </label>
            <input
              id="dob"
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              className={`input ${errors.dob ? 'input-error' : ''}`}
            />
            {errors.dob && <p className="error-text">{errors.dob}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="label">
              Email Address <span className="text-danger-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`input ${errors.email ? 'input-error' : ''}`}
              placeholder="patient@example.com"
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>
        </div>
      </div>

      {/* Blood Test Values */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Blood Test Values</h3>
        <p className="text-sm text-gray-500 mb-4">
          Enter the patient's latest blood test results. These values will be analyzed by AI to generate a health assessment.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Glucose */}
          <div>
            <label htmlFor="glucose" className="label">
              Glucose (mg/dL) <span className="text-danger-500">*</span>
            </label>
            <div className="relative">
              <input
                id="glucose"
                name="glucose"
                type="number"
                step="0.1"
                value={formData.glucose}
                onChange={handleChange}
                className={`input ${errors.glucose ? 'input-error' : ''}`}
                placeholder="e.g. 100"
              />
            </div>
            {errors.glucose && <p className="error-text">{errors.glucose}</p>}
          </div>

          {/* Haemoglobin */}
          <div>
            <label htmlFor="haemoglobin" className="label">
              Haemoglobin (g/dL) <span className="text-danger-500">*</span>
            </label>
            <input
              id="haemoglobin"
              name="haemoglobin"
              type="number"
              step="0.1"
              value={formData.haemoglobin}
              onChange={handleChange}
              className={`input ${errors.haemoglobin ? 'input-error' : ''}`}
              placeholder="e.g. 14"
            />
            {errors.haemoglobin && <p className="error-text">{errors.haemoglobin}</p>}
          </div>

          {/* Cholesterol */}
          <div>
            <label htmlFor="cholesterol" className="label">
              Cholesterol (mg/dL) <span className="text-danger-500">*</span>
            </label>
            <input
              id="cholesterol"
              name="cholesterol"
              type="number"
              step="0.1"
              value={formData.cholesterol}
              onChange={handleChange}
              className={`input ${errors.cholesterol ? 'input-error' : ''}`}
              placeholder="e.g. 180"
            />
            {errors.cholesterol && <p className="error-text">{errors.cholesterol}</p>}
          </div>
        </div>
      </div>

      {/* AI Notice */}
      <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-4 border border-primary-100">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-primary-800">AI Health Assessment</p>
            <p className="text-xs text-primary-600 mt-0.5">
              Blood test values will be sent to Google Gemini AI for automated health risk analysis. 
              The AI-generated remarks will be stored with the patient record.
            </p>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleCancel}
          disabled={submitting}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary min-w-[140px] flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {isEdit ? 'Updating...' : 'Saving...'}
            </>
          ) : (
            <>
              {isEdit ? 'Update Patient' : 'Save Patient'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default PatientForm;