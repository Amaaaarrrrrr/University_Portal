import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';

const DocumentSubmission = () => {
  const [documentType, setDocumentType] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [requests, setRequests] = useState([]); // store fetched requests

  // GET request to fetch existing document requests
  const fetchRequests = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/document_requests');
      const data = await response.json();

      if (response.ok) {
        setRequests(data); // assuming API returns an array
      } else {
        console.error('Failed to fetch requests:', data.error);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  };

  useEffect(() => {
    fetchRequests(); // fetch requests when component mounts
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!documentType.trim()) {
      setError('Please enter a document type');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/api/document_requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_type: documentType }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setDocumentType('');
        fetchRequests(); // refresh the list after submission
      } else {
        setError(data.error || 'Submission failed');
      }
    } catch (err) {
      setError('An error occurred while submitting');
    }
  };

  // function to determine status color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-500 text-white';
      case 'rejected':
        return 'bg-red-500 text-white';
      case 'pending':
      default:
        return 'bg-yellow-400 text-black';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Document Submission</h1>
      <Card title="Upload Documents">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-gray-700">
            Document Type:
            <input
              type="text"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="mt-1 block w-full border rounded p-2"
              placeholder="e.g., Transcript, ID Copy"
            />
          </label>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </form>

        {message && <p className="text-green-600 mt-2">{message}</p>}
        {error && <p className="text-red-600 mt-2">{error}</p>}

        {/* Display list of document requests */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-800">Submitted Requests:</h2>
          {requests.length === 0 ? (
            <p className="text-gray-600">No requests yet.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {requests.map((req, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center border rounded px-4 py-2 shadow-sm"
                >
                  <div>
                    <span className="font-medium">{req.document_type}</span>
                    {req.id && <span className="text-sm text-gray-500"> (ID: {req.id})</span>}
                  </div>
                  <span
                    className={`text-sm font-semibold px-2 py-1 rounded ${getStatusColor(
                      req.status || 'pending'
                    )}`}
                  >
                    {req.status ? req.status.toUpperCase() : 'PENDING'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DocumentSubmission;
