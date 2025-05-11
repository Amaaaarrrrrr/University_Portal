import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingRegistrations = async () => {
    try {
      const response = await axios.get('http://172.0.0.1:5000/api/admin/pending-registrations');
      setPendingRegistrations(response.data.registrations);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveRegistration = async (id) => {
    try {
      await axios.put(`http://172.0.0.1:5000/api/admin/approve-registration/${id}`);
      setPendingRegistrations(prev => prev.filter(reg => reg.id !== id));
    } catch (error) {
      console.error('Approval error:', error);
    }
  };

  const rejectRegistration = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await axios.put(`http://172.0.0.1:5000/api/admin/reject-registration/${id}`, { reason });
      setPendingRegistrations(prev => prev.filter(reg => reg.id !== id));
    } catch (error) {
      console.error('Rejection error:', error);
    }
  };

  useEffect(() => {
    fetchPendingRegistrations();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      {loading ? (
        <p>Loading pending registrations...</p>
      ) : pendingRegistrations.length === 0 ? (
        <p>No pending registrations.</p>
      ) : (
        <div className="grid gap-4">
          {pendingRegistrations.map((reg) => (
            <div key={reg.id} className="border p-4 rounded shadow bg-white">
              <h2 className="text-lg font-semibold">{reg.student_name}</h2>
              <p>Email: {reg.student_email}</p>
              <p>Student ID: {reg.student_id}</p>
              <p>Program: {reg.program_name}</p>
              <p>Department: {reg.department}</p>
              <p>Batch Year: {reg.batch_year}</p>
              <p>Submitted At: {new Date(reg.submitted_at).toLocaleString()}</p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => approveRegistration(reg.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => rejectRegistration(reg.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
