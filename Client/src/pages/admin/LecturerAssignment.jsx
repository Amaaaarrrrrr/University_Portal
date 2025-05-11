import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminAssignLecturers() {
  const [lecturers, setLecturers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [formData, setFormData] = useState({
    lecturerId: '',
    courseId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const api = axios.create({
    baseURL: 'http://127.0.0.1:5000/api',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lectRes, courseRes, assignRes] = await Promise.all([
          api.get('/lecturers'),
          api.get('/courses'),
          api.get('/assignments')
        ]);
        setLecturers(lectRes.data.lecturers);
        setCourses(courseRes.data.courses);
        setAssignments(assignRes.data.assignments);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch initial data.');
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.lecturerId || !formData.courseId) {
      setError('Both lecturer and course must be selected.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/assignments', {
        lecturer_id: formData.lecturerId,
        course_id: formData.courseId
      });

      setAssignments(prev => [...prev, res.data.assignment]);
      setFormData({ lecturerId: '', courseId: '' });
      setSuccess('Course assigned to lecturer successfully.');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to assign course.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to remove this assignment?')) return;

    try {
      await api.delete(`/assignments/${assignmentId}`);
      setAssignments(prev => prev.filter(a => a.id !== assignmentId));
      setSuccess('Assignment removed.');
    } catch (err) {
      console.error(err);
      setError('Failed to delete assignment.');
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin - Assign Courses to Lecturers</h1>

      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <form onSubmit={handleAssign} className="space-y-4 bg-white p-4 shadow rounded mb-6">
        <div>
          <label className="block font-semibold">Select Lecturer *</label>
          <select name="lecturerId" value={formData.lecturerId} onChange={handleChange} className="w-full border p-2 rounded" required>
            <option value="">-- Select Lecturer --</option>
            {Array.isArray(lecturers) && lecturers.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold">Select Course *</label>
          <select name="courseId" value={formData.courseId} onChange={handleChange} className="w-full border p-2 rounded" required>
            <option value="">-- Select Course --</option>
            {Array.isArray(courses) && courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        <button type="submit" className={`px-4 py-2 text-white rounded ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`} disabled={loading}>
          {loading ? 'Assigning...' : 'Assign Course'}
        </button>
      </form>

      <div>
        <h2 className="text-lg font-semibold mb-3">Current Courses per Lecturers</h2>
        {assignments.length === 0 ? (
          <p className="text-gray-500">No assignments yet.</p>
        ) : (
          <ul className="space-y-2">
            {assignments.map(a => (
              <li key={a.id} className="bg-gray-50 border p-3 rounded flex justify-between items-center">
                <span>{a.lecturer_name} - {a.course_title}</span>
                <button onClick={() => handleDelete(a.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">Remove</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default AdminAssignLecturers;
