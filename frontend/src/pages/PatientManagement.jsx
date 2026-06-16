import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import patientService from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';

/**
 * Patient Management Page
 * Displays all patients with search, edit, delete, and view functionality.
 */
function PatientManagement() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, patient: null });
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const fetchPatients = useCallback(async (search) => {
    try {
      setLoading(true);
      const data = await patientService.getAllPatients(search);
      setPatients(data.patients || []);
    } catch (err) {
      toast.error(err.error || 'Failed to load patients');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients(searchQuery);
  }, [fetchPatients, searchQuery]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchPatients]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleViewDetails = async (patientId) => {
    try {
      const data = await patientService.getPatientById(patientId);
      setSelectedPatient(data.patient);
      setShowDetails(true);
    } catch (err) {
      toast.error(err.error || 'Failed to load patient details');
    }
  };

  const handleEdit = (patientId) => {
    navigate(`/patients/edit/${patientId}`);
  };

  const handleDeleteClick = (patient) => {
    setDeleteConfirm({ open: true, patient });
  };

  const handleDeleteConfirm = async () => {
    const patient = deleteConfirm.patient;
    if (!patient) return;

    try {
      setDeleting(true);
      await patientService.deletePatient(patient.id);
      toast.success(`Patient "${patient.fullName}" deleted successfully`);
      setDeleteConfirm({ open: false, patient: null });
      fetchPatients(searchQuery);
    } catch (err) {
      toast.error(err.error || 'Failed to delete patient');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch {
      return dateStr;
    }
  };

  const getRiskBadge = (remarks) => {
    if (!remarks) return null;
    const lower = remarks.toLowerCase();

    if (lower.includes('diabetes') || lower.includes('diabetic')) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Diabetes Risk</span>;
    }
    if (lower.includes('anemia') || lower.includes('anemia')) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-100 text-danger-800">Anemia Risk</span>;
    }
    if (lower.includes('cholesterol') && (lower.includes('high') || lower.includes('risk'))) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">High Cholesterol</span>;
    }
    if (lower.includes('healthy') || lower.includes('normal')) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Healthy</span>;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patient Records</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage and view all patient blood test records
          </p>
        </div>
        <button
          onClick={() => navigate('/patients/add')}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Patient
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search by patient name or email..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="input pl-12"
        />
      </div>

      {/* Patients Table */}
      {loading ? (
        <LoadingSpinner message="Loading patients..." />
      ) : patients.length === 0 ? (
        <EmptyState
          title="No patients found"
          message={searchQuery ? "No patients match your search criteria." : "Get started by adding your first patient record."}
          action={searchQuery ? undefined : () => navigate('/patients/add')}
          actionLabel="Add Patient"
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Mobile cards view (visible on small screens) */}
          <div className="block lg:hidden divide-y divide-gray-100">
            {patients.map((patient) => (
              <div key={patient.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-700">
                        {patient.fullName?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{patient.fullName}</p>
                      <p className="text-xs text-gray-500">{patient.email}</p>
                    </div>
                  </div>
                  {getRiskBadge(patient.remarks)}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <span className="text-gray-500">Glucose</span>
                    <p className="font-semibold text-gray-900">{patient.glucose}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <span className="text-gray-500">Haemo</span>
                    <p className="font-semibold text-gray-900">{patient.haemoglobin}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <span className="text-gray-500">Cholest</span>
                    <p className="font-semibold text-gray-900">{patient.cholesterol}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-gray-500">{formatDate(patient.createdAt)}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleViewDetails(patient.id)}
                      className="p-2 rounded-lg text-accent-600 bg-accent-50 hover:bg-accent-100 border border-accent-200 transition-all"
                      title="View Details"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleEdit(patient.id)}
                      className="p-2 rounded-lg text-primary-600 bg-primary-50 hover:bg-primary-100 border border-primary-200 transition-all"
                      title="Edit Patient"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(patient)}
                      className="p-2 rounded-lg text-danger-600 bg-danger-50 hover:bg-danger-100 border border-danger-200 transition-all"
                      title="Delete Patient"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table view (visible on large screens) */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Patient</th>
                  <th className="table-header">Contact</th>
                  <th className="table-header">Blood Values</th>
                  <th className="table-header">Risk Assessment</th>
                  <th className="table-header">Date Added</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-700">
                            {patient.fullName?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{patient.fullName}</p>
                          <p className="text-xs text-gray-500">{formatDate(patient.dob)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <p className="text-gray-900">{patient.email}</p>
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-4">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Glucose</p>
                          <p className="font-semibold text-gray-900">{patient.glucose}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Haemo</p>
                          <p className="font-semibold text-gray-900">{patient.haemoglobin}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Cholest</p>
                          <p className="font-semibold text-gray-900">{patient.cholesterol}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      {getRiskBadge(patient.remarks) || (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="table-cell text-sm text-gray-500">
                      {formatDate(patient.createdAt)}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleViewDetails(patient.id)}
                          className="p-2 rounded-lg text-accent-600 bg-accent-50 hover:bg-accent-100 border border-accent-200 transition-all"
                          title="View Details"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEdit(patient.id)}
                          className="p-2 rounded-lg text-primary-600 bg-primary-50 hover:bg-primary-100 border border-primary-200 transition-all"
                          title="Edit Patient"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(patient)}
                          className="p-2 rounded-lg text-danger-600 bg-danger-50 hover:bg-danger-100 border border-danger-200 transition-all"
                          title="Delete Patient"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      <Modal
        isOpen={showDetails}
        onClose={() => { setShowDetails(false); setSelectedPatient(null); }}
        title="Patient Details"
        size="lg"
      >
        {selectedPatient && (
          <div className="space-y-8">
            {/* Patient Info: Full Name left | DOB right - same line, Email below */}
            <div className="border border-gray-200 rounded-lg p-3 bg-white">
              <div className="flex flex-row justify-between items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-700 whitespace-nowrap">Full Name:</span>
                  <span className="text-xs font-medium text-gray-900 truncate max-w-[150px]">{selectedPatient.fullName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-700 whitespace-nowrap">DOB:</span>
                  <span className="text-xs font-medium text-gray-900 whitespace-nowrap">{formatDate(selectedPatient.dob)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-700 whitespace-nowrap">Email:</span>
                <span className="text-xs font-medium text-gray-900 truncate">{selectedPatient.email}</span>
              </div>
            </div>

            {/* Blood Values */}
            <div className="border border-gray-200 rounded-lg p-3 bg-white">
              <p className="text-xs font-bold text-gray-700 mb-2">Blood Test Values</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-accent-50 rounded-lg p-2 text-center border border-accent-200">
                  <p className="text-[10px] text-accent-600 font-medium">Glucose</p>
                  <p className="text-base font-bold text-accent-800">{selectedPatient.glucose}</p>
                  <p className="text-[10px] text-accent-500">mg/dL</p>
                </div>
                <div className="bg-danger-50 rounded-lg p-2 text-center border border-danger-200">
                  <p className="text-[10px] text-danger-600 font-medium">Haemoglobin</p>
                  <p className="text-base font-bold text-danger-800">{selectedPatient.haemoglobin}</p>
                  <p className="text-[10px] text-danger-500">g/dL</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-2 text-center border border-yellow-200">
                  <p className="text-[10px] text-yellow-600 font-medium">Cholesterol</p>
                  <p className="text-base font-bold text-yellow-800">{selectedPatient.cholesterol}</p>
                  <p className="text-[10px] text-yellow-500">mg/dL</p>
                </div>
              </div>
            </div>

            {/* AI Remarks */}
            <div className="border border-primary-200 rounded-lg p-3 bg-gradient-to-r from-primary-50 to-accent-50">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[9px] font-bold">AI</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-primary-800 mb-1">Health Risk Prediction</p>
                  <div className="bg-white/80 rounded-lg p-2 border border-primary-100">
                    <p className="text-xs text-gray-700">{selectedPatient.remarks || 'No assessment available'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Record Dates */}
            <div className="border border-gray-200 rounded-lg p-2 bg-gray-50 flex justify-between text-[10px] text-gray-500">
              <div><span className="font-semibold">Created:</span> {formatDate(selectedPatient.createdAt)}</div>
              <div><span className="font-semibold">Updated:</span> {formatDate(selectedPatient.updatedAt)}</div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, patient: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Patient"
        message={`Are you sure you want to delete "${deleteConfirm.patient?.fullName}"? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}

export default PatientManagement;