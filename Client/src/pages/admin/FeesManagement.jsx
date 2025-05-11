import React, { useState, useEffect } from 'react';
import { Search, Filter, Check, X, AlertCircle, RefreshCcw, AlertTriangle } from 'lucide-react';

const FeesManagement = () => {
  const [clearances, setClearances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [notification, setNotification] = useState(null);

  // Fetch all clearance statuses
  const fetchClearances = async () => {
    setLoading(true);
    try {
      // Use relative URL path to avoid CORS issues
      const response = await fetch('http://172.0.0.1:5000/api/admin/clearance', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch clearance data: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Received non-JSON response from server');
      }
      
      const data = await response.json();
      setClearances(data.clearances || []);
      setError(null);
    } catch (err) {
      setError(`Error fetching clearance data: ${err.message}`);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial data fetch
    fetchClearances();
    
    // Set up error handling for network issues
    const handleOnline = () => setError(null);
    const handleOffline = () => setError('Network connection lost. Please check your connection.');
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update clearance status
  const updateClearanceStatus = async (studentId, newStatus) => {
    try {
      const response = await fetch(`http://172.0.0.1:5000/api/admin/clearance/${studentId}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'same-origin' // Include cookies if using session authentication
      });

      if (!response.ok) {
        throw new Error(`Failed to update clearance status: ${response.status}`);
      }

      // Update local state to reflect the change
      setClearances(prevClearances => 
        prevClearances.map(clearance => 
          clearance.student_id === studentId 
            ? { 
                ...clearance, 
                status: newStatus, 
                cleared_on: newStatus === 'cleared' ? new Date().toISOString() : clearance.cleared_on 
              } 
            : clearance
        )
      );

      // Show success notification
      setNotification({
        type: 'success',
        message: `Student #${studentId} status updated to ${newStatus}.`
      });

      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error(err);
      setNotification({
        type: 'error',
        message: 'Failed to update status. Please try again.'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Filter and search functionality
  const filteredClearances = clearances.filter(clearance => {
    const matchesSearch = 
      clearance.student_id.toString().includes(searchTerm) || 
      clearance.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clearance.program.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && clearance.status === filter;
  });

  // Calculate stats
  const stats = {
    total: clearances.length,
    cleared: clearances.filter(c => c.status === 'cleared').length,
    pending: clearances.filter(c => c.status === 'pending').length,
    flagged: clearances.filter(c => c.status === 'flagged').length
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Fees Management</h1>
      
      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Total Students</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-green-50 p-4 rounded shadow">
          <p className="text-green-600">Cleared</p>
          <p className="text-2xl font-bold">{stats.cleared}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded shadow">
          <p className="text-yellow-600">Pending</p>
          <p className="text-2xl font-bold">{stats.pending}</p>
        </div>
        <div className="bg-red-50 p-4 rounded shadow">
          <p className="text-red-600">Flagged</p>
          <p className="text-2xl font-bold">{stats.flagged}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Search by ID, name, or program..."
            className="pl-10 pr-4 py-2 border rounded w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Filter className="h-5 w-5 text-gray-400" />
            </span>
            <select
              className="pl-10 pr-4 py-2 border rounded"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="cleared">Cleared</option>
              <option value="pending">Pending</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
            onClick={fetchClearances}
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`mb-4 p-3 rounded flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {notification.type === 'success' ? 
            <Check className="h-5 w-5" /> : 
            <AlertCircle className="h-5 w-5" />
          }
          {notification.message}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          {error}
          <button 
            className="ml-auto bg-red-200 hover:bg-red-300 text-red-800 px-3 py-1 rounded text-sm"
            onClick={fetchClearances}
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        /* Clearance Table */
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Due</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cleared On</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredClearances.length > 0 ? (
                filteredClearances.map((clearance) => (
                  <tr key={clearance.student_id}>
                    <td className="px-6 py-4 whitespace-nowrap">{clearance.student_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{clearance.student_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{clearance.program}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatCurrency(clearance.amount_due)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        clearance.status === 'cleared' ? 'bg-green-100 text-green-800' :
                        clearance.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {clearance.status.charAt(0).toUpperCase() + clearance.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {clearance.cleared_on ? new Date(clearance.cleared_on).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {clearance.status !== 'cleared' && (
                          <button 
                            onClick={() => updateClearanceStatus(clearance.student_id, 'cleared')}
                            className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded text-sm flex items-center gap-1"
                          >
                            <Check className="h-4 w-4" />
                            Clear
                          </button>
                        )}
                        {clearance.status !== 'pending' && (
                          <button 
                            onClick={() => updateClearanceStatus(clearance.student_id, 'pending')}
                            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded text-sm flex items-center gap-1"
                          >
                            Mark Pending
                          </button>
                        )}
                        {clearance.status !== 'flagged' && (
                          <button 
                            onClick={() => updateClearanceStatus(clearance.student_id, 'flagged')}
                            className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm flex items-center gap-1"
                          >
                            <X className="h-4 w-4" />
                            Flag
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No clearance records found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FeesManagement;