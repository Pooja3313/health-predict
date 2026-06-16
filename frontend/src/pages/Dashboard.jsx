import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import patientService from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

/**
 * Dashboard Page
 * Displays overview statistics and quick access to patient management.
 */
function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await patientService.getStats();
      setStats(data);
    } catch (err) {
      const errorMsg = err.error || 'Failed to load dashboard statistics';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading dashboard..." />;
  }

  if (error && !stats) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h3>
        <p className="text-sm text-gray-500 mb-6">{error}</p>
        <button onClick={fetchStats} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Patients */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
              Total
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats?.totalPatients || 0}</h3>
          <p className="text-sm text-gray-500">Total Patients</p>
        </div>

        {/* Avg Glucose */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-accent-600 bg-accent-50 px-2.5 py-1 rounded-full">
              Average
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats?.averageGlucose?.toFixed(1) || '0.0'}</h3>
          <p className="text-sm text-gray-500">Avg Glucose (mg/dL)</p>
        </div>

        {/* Avg Haemoglobin */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-danger-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-danger-600 bg-danger-50 px-2.5 py-1 rounded-full">
              Average
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats?.averageHaemoglobin?.toFixed(1) || '0.0'}</h3>
          <p className="text-sm text-gray-500">Avg Haemoglobin (g/dL)</p>
        </div>

        {/* Avg Cholesterol */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-full">
              Average
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats?.averageCholesterol?.toFixed(1) || '0.0'}</h3>
          <p className="text-sm text-gray-500">Avg Cholesterol (mg/dL)</p>
        </div>
      </div>

      {/* Quick Actions and Recent Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/patients/add')}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all group"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Add New Patient</p>
                  <p className="text-xs text-gray-500">Create a new patient record</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/patients')}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-accent-300 hover:bg-accent-50 transition-all group"
              >
                <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center group-hover:bg-accent-200 transition-colors">
                  <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">View All Patients</p>
                  <p className="text-xs text-gray-500">Manage patient records</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Patients */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Patients</h3>
              <Link to="/patients" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                View All
              </Link>
            </div>

            {stats?.recentPatients?.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {stats.recentPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between py-3">
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
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{formatDate(patient.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 mb-4">No patients registered yet</p>
                <button
                  onClick={() => navigate('/patients/add')}
                  className="btn-primary"
                >
                  Add Your First Patient
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Health Insights Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold">AI-Powered Health Insights</h3>
            <p className="text-sm text-primary-100">Real-time health risk predictions using Gemini AI</p>
          </div>
        </div>
        <p className="text-sm text-primary-100 leading-relaxed">
          This dashboard uses Google Gemini AI to analyze blood test results and generate health risk predictions.
          Each patient record is automatically analyzed for potential health risks including diabetes, anemia, and cholesterol issues.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;