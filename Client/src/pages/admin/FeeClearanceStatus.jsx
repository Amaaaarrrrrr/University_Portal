import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FeeClearanceStatus = () => {
  const [clearances, setClearances] = useState([]);
  const [loading, setLoading] = useState({
    fetching: false,
    updating: false
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Axios instance with proper configuration
  const api = axios.create({
    baseURL: 'http://127.0.0.1:5000/api',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  useEffect(() => {
    const fetchClearanceStatuses = async () => {
      try {
        setLoading(prev => ({ ...prev, fetching: true }));
        setError(null);
        
        const response = await api.get('/admin/clearance');
        setClearances(response.data.clearances || []);
      } catch (error) {
        console.error('Error fetching clearance statuses:', error);
        setError(error.response?.data?.error || 
                error.response?.data?.message || 
                'Failed to load clearance records');
      } finally {
        setLoading(prev => ({ ...prev, fetching: false }));
      }
    };
    fetchClearanceStatuses();
  }, []);

  const handleUpdateStatus = async (studentId, newStatus) => {
    try {
      setLoading(prev => ({ ...prev, updating: true }));
      setError(null);
      setSuccess(null);
      
      await api.put(`/admin/clearance/${studentId}`, {
        status: newStatus,
        cleared_on: newStatus === 'cleared' ? new Date().toISOString() : null
      });
      
      setClearances(prev => 
        prev.map(clearance => 
          clearance.student_id === studentId 
            ? { 
                ...clearance, 
                status: newStatus,
                cleared_on: newStatus === 'cleared' ? new Date().toISOString() : null
              } 
            : clearance
        )
      );
      setSuccess(`Status updated to ${newStatus} for student ${studentId}`);
    } catch (error) {
      console.error('Error updating clearance status:', error);
      setError(error.response?.data?.error || 
              error.response?.data?.message || 
              'Failed to update clearance status');
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  };

  const filteredClearances = clearances.filter(clearance => {
    const matchesSearch = 
      (clearance.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clearance.student_id?.toString().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = 
      statusFilter === 'all' || 
      clearance.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Fee Clearance Status</h1>
      
      {/* Status Messages */}
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

      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name or ID..."
            className="w-full p-2 border rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="all">All Statuses</option>
            <option value="cleared">Cleared</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      {loading.fetching ? (
        <div className="text-center py-8">
          <p>Loading clearance records...</p>
        </div>
      ) : filteredClearances.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No clearance records found</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Due</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cleared On</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClearances.map(clearance => (
                <tr key={clearance.student_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {clearance.student_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {clearance.student_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {clearance.amount_due ? `$${clearance.amount_due.toFixed(2)}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {clearance.amount_paid ? `$${clearance.amount_paid.toFixed(2)}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {clearance.balance ? `$${clearance.balance.toFixed(2)}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${clearance.status === 'cleared' ? 'bg-green-100 text-green-800' : 
                        clearance.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {clearance.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {clearance.cleared_on ? new Date(clearance.cleared_on).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleUpdateStatus(clearance.student_id, 'cleared')}
                      disabled={loading.updating || clearance.status === 'cleared'}
                      className={`text-green-600 hover:text-green-900 ${(loading.updating || clearance.status === 'cleared') ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Mark Cleared
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(clearance.student_id, 'pending')}
                      disabled={loading.updating || clearance.status === 'pending'}
                      className={`text-yellow-600 hover:text-yellow-900 ${(loading.updating || clearance.status === 'pending') ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Mark Pending
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FeeClearanceStatus;