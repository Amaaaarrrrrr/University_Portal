import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    dueDate: '',
    lecturer_id: '', // Manually input lecturer_id
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);

    // Fetch assignments
    axios
      .get('http://127.0.0.1:5000/api/assignments')
      .then((response) => {
        setAssignments(response.data.assignments || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching assignments:', error);
        setError('Failed to load assignments');
        setLoading(false);
      });
  }, []);

  const handleInputChange = (e) => {
    setNewAssignment({
      ...newAssignment,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddAssignment = (e) => {
    e.preventDefault();

    // Validate input
    if (!newAssignment.title || !newAssignment.lecturer_id || !newAssignment.dueDate) {
      setError('Title, Lecturer ID, and Due Date are required');
      return;
    }

    const payload = {
      title: newAssignment.title,
      description: newAssignment.description,
      due_date: newAssignment.dueDate,
      lecturer_id: newAssignment.lecturer_id, // Send lecturer_id as input
    };

    console.log('Posting assignment payload:', payload);

    axios
      .post('http://127.0.0.1:5000/api/assignments', payload)
      .then((response) => {
        setAssignments([...assignments, response.data.assignment]);
        setNewAssignment({
          title: '',
          description: '',
          dueDate: '',
          lecturer_id: '', // Reset after posting
        });
        setError(null);
      })
      .catch((error) => {
        console.error('Error posting assignment:', error.response ? error.response.data : error.message);
        setError('Failed to post new assignment');
      });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Assignments</h1>

      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleAddAssignment} className="space-y-4 mb-8">
        <div>
          <label className="block font-semibold">Title</label>
          <input
            type="text"
            name="title"
            value={newAssignment.title}
            onChange={handleInputChange}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label className="block font-semibold">Description</label>
          <textarea
            name="description"
            value={newAssignment.description}
            onChange={handleInputChange}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block font-semibold">Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={newAssignment.dueDate}
            onChange={handleInputChange}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block font-semibold">Lecturer ID</label>
          <input
            type="text"
            name="lecturer_id"
            value={newAssignment.lecturer_id}
            onChange={handleInputChange}
            className="w-full border rounded p-2"
            placeholder="Enter Lecturer ID"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Share Assignment
        </button>
      </form>

      <div className="space-y-4">
        {loading ? (
          <p>Loading assignments...</p>
        ) : assignments.length === 0 ? (
          <p>No assignments shared yet.</p>
        ) : (
          assignments.map((assignment) => (
            <div key={assignment.id} className="border rounded p-4 shadow-sm">
              <h2 className="text-lg font-semibold">{assignment.title}</h2>
              <p>{assignment.description}</p>
              <p className="text-sm text-gray-500">
                Due: {new Date(assignment.due_date).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Assignments;

// in future we will implement the fetching of lecturers from db to make it more dynamic

