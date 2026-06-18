import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function validateEmail(email) {
  if (!email || !email.trim()) {
    return 'Email is required';
  }
  const trimmed = email.trim();
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
  if (!pattern.test(trimmed)) {
    return 'Invalid email';
  }
  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return 'Invalid email';
  }
  const domain = parts[1];
  if (!domain.includes('.')) {
    return 'Invalid email';
  }
  if (domain.includes('..')) {
    return 'Invalid email';
  }
  return '';
}

function validateDateOfBirth(dobValue) {
  const dateObj = new Date(dobValue);
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date of birth';
  }

  const parts = dobValue.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    if (month < 1 || month > 12) {
      return 'Invalid date of birth';
    }

    const daysInMonth = {
      1: 31, 2: 29, 3: 31, 4: 30, 5: 31, 6: 30,
      7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31,
    };

    if (day < 1 || day > (daysInMonth[month] || 31)) {
      return 'Invalid date of birth';
    }

    if (month === 2 && day === 29) {
      const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
      if (!isLeap) {
        return 'Invalid date of birth';
      }
    }
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (dateObj > today) {
    return 'Date of birth cannot be a future date';
  }

  return '';
}

function validateBloodTestField(value, fieldName) {
  if (value === '' || value === null || value === undefined) {
    return `${fieldName} is required`;
  }
  if (isNaN(value) || value === '') {
    return `Invalid ${fieldName.toLowerCase()}`;
  }
  const num = Number(value);
  if (num < 0) {
    return `Invalid ${fieldName.toLowerCase()}`;
  }
  return '';
}

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
  const [dobTouched, setDobTouched] = useState(false);

  useEffect(() => {
    if (initialData?.serverErrors) {
      setErrors((prev) => ({
        ...prev,
        ...initialData.serverErrors,
      }));
    }
  }, [initialData?.serverErrors]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2 || formData.fullName.trim().length > 100) {
      newErrors.fullName = 'Full name is required';
    }

    const emailError = validateEmail(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    // If user never touched date field -> "Date of birth is required"
    // If user touched it and value is empty (browser cleared invalid) -> "Invalid date of birth"
    // If user picked date from calendar -> validate normally
    if (!dobTouched && !formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else if (dobTouched && !formData.dob) {
      newErrors.dob = 'Invalid date of birth';
    } else {
      const dobError = validateDateOfBirth(formData.dob);
      if (dobError) {
        newErrors.dob = dobError;
      }
    }

    const glucoseError = validateBloodTestField(formData.glucose, 'Glucose');
    if (glucoseError) {
      newErrors.glucose = glucoseError;
    }

    const haemoglobinError = validateBloodTestField(formData.haemoglobin, 'Haemoglobin');
    if (haemoglobinError) {
      newErrors.haemoglobin = haemoglobinError;
    }

    const cholesterolError = validateBloodTestField(formData.cholesterol, 'Cholesterol');
    if (cholesterolError) {
      newErrors.cholesterol = cholesterolError;
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
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
    // Track when user interacts with date field
    if (name === 'dob') {
      setDobTouched(true);
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
      if (err.errors && typeof err.errors === 'object') {
        const serverFieldErrors = {};
        let hasFieldError = false;
        Object.entries(err.errors).forEach(([field, message]) => {
          const fieldMap = {
            fullName: 'fullName',
            email: 'email',
            dob: 'dob',
            glucose: 'glucose',
            haemoglobin: 'haemoglobin',
            cholesterol: 'cholesterol',
            duplicate: 'duplicate',
          };
          const formField = fieldMap[field];
          if (formField) {
            serverFieldErrors[formField] = message;
            hasFieldError = true;
          } else {
            toast.error(message);
          }
        });
        if (hasFieldError) {
          setErrors((prev) => ({
            ...prev,
            ...serverFieldErrors,
          }));
        }
      } else {
        toast.error(err.error || 'Failed to save patient');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/patients');
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Blood Test Values</h3>
        <p className="text-sm text-gray-500 mb-4">
          Enter the patient's latest blood test results.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="glucose" className="label">
              Glucose (mg/dL) <span className="text-danger-500">*</span>
            </label>
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
            {errors.glucose && <p className="error-text">{errors.glucose}</p>}
          </div>

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

      {errors.duplicate && (
        <div className="bg-danger-50 border border-danger-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-danger-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-danger-800">{errors.duplicate}</p>
              <p className="text-xs text-danger-600 mt-0.5">
                A patient with the same name, date of birth, and email already exists in the system.
              </p>
            </div>
          </div>
        </div>
      )}

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
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button type="button" onClick={handleCancel} disabled={submitting} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="btn-primary min-w-[140px] flex items-center justify-center gap-2">
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {isEdit ? 'Updating...' : 'Saving...'}
            </>
          ) : (
            <>{isEdit ? 'Update Patient' : 'Save Patient'}</>
          )}
        </button>
      </div>
    </form>
  );
}

export default PatientForm;