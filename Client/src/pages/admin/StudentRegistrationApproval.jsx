import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentRegistrationApproval = () => {
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [loading, setLoading] = useState({
    registrations: false,
    processing: false
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Axios instance with auth
  const api = axios.create({
    baseURL: 'http://127.0.0.1:5000/api',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  useEffect(() => {
    const fetchPendingRegistrations = async () => {
      try {
        setLoading(prev => ({ ...prev, registrations: true }));
        const response = await api.get('/admin/pending-registrations');
        setPendingRegistrations(response.data.registrations || []);
      } catch (error) {
        console.error('Error fetching registrations:', error);
        setError(error.response?.data?.error || 'Failed to load registrations');
      } finally {
        setLoading(prev => ({ ...prev, registrations: false }));
      }
    };
    fetchPendingRegistrations();
  }, []);

  const handleApprove = async (registrationId) => {
    if (!window.confirm('Approve this student registration?')) return;
    
    try {
      setLoading(prev => ({ ...prev, processing: true }));
      setError(null);
      
      await api.put(`/admin/approve-registration/${registrationId}`);
      
      setPendingRegistrations(prev => 
        prev.filter(reg => reg.id !== registrationId)
      );
      setSuccess('Registration approved successfully!');
    } catch (error) {
      console.error('Approval failed:', error);
      setError(error.response?.data?.error || 'Approval failed');
    } finally {
      setLoading(prev => ({ ...prev, processing: false }));
    }
  };

  const handleReject = async (registrationId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    
    try {
      setLoading(prev => ({ ...prev, processing: true }));
      setError(null);
      
      await api.put(`/admin/reject-registration/${registrationId}`, { reason });
      
      setPendingRegistrations(prev => 
        prev.filter(reg => reg.id !== registrationId)
      );
      setSuccess('Registration rejected successfully!');
    } catch (error) {
      console.error('Rejection failed:', error);
      setError(error.response?.data?.error || 'Rejection failed');
    } finally {
      setLoading(prev => ({ ...prev, processing: false }));
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Student Registration Approval</h1>
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading.registrations ? (
        <div className="text-center py-8">
          <p>Loading pending registrations...</p>
        </div>
      ) : pendingRegistrations.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No pending registrations.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingRegistrations.map(registration => (
            <div key={registration.id} className="border rounded-lg p-4 shadow-sm bg-white">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <h3 className="font-semibold">Student Information</h3>
                  <p>{registration.student_name}</p>
                  <p className="text-sm text-gray-600">{registration.student_email}</p>
                  <p className="text-sm text-gray-600">{registration.student_id}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold">Program Details</h3>
                  <p>{registration.program_name}</p>
                  <p className="text-sm text-gray-600">{registration.department}</p>
                  <p className="text-sm text-gray-600">Batch: {registration.batch_year}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold">Submission Date</h3>
                  <p>{new Date(registration.submitted_at).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-2 border-t">
                <button
                  onClick={() => handleReject(registration.id)}
                  disabled={loading.processing}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                >
                  {loading.processing ? 'Processing...' : 'Reject'}
                </button>
                <button
                  onClick={() => handleApprove(registration.id)}
                  disabled={loading.processing}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                >
                  {loading.processing ? 'Processing...' : 'Approve'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentRegistrationApproval;