import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '../../components/common/Card';

const StudentFees = () => {
  const [feeStructures, setFeeStructures] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchFeeStructures();
  }, []);

  const fetchFeeStructures = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/fee-structures/');
      setFeeStructures(response.data);
    } catch (err) {
      console.error('Error fetching fee structures:', err);
      setMessage('Failed to load fee structures');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Fee Structures</h1>

      <Card title="Fee Details">
        {message && <p className="text-red-500">{message}</p>}
        {feeStructures.length > 0 ? (
          <table className="border-collapse border border-gray-300 w-full text-sm">
            <thead>
              <tr>
                <th className="border px-2 py-1">ID</th>
                
                <th className="border px-2 py-1">Hostel</th>
                <th className="border px-2 py-1">Semester</th>
                <th className="border px-2 py-1">Amount</th>
              </tr>
            </thead>
            <tbody>
              {feeStructures.map((fs) => (
                <tr key={fs.id}>
                  <td className="border px-2 py-1">{fs.id}</td>
                  
                  <td className="border px-2 py-1">{fs.hostel?.name}</td> {/* Adjust to render the 'name' of the hostel */}
                  <td className="border px-2 py-1">{fs.semester?.name}</td> {/* Adjust to render the 'name' of the semester */}
                  <td className="border px-2 py-1">{fs.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-600">No fee structures available.</p>
        )}
      </Card>
    </div>
  );
};

export default StudentFees;
