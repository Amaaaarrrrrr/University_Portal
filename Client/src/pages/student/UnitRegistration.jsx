import React, { useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import axios from 'axios';

const UnitRegistration = () => {
  const [units, setUnits] = useState([]); // Registered units
  const [availableCourses, setAvailableCourses] = useState([]);
  const [availableSemesters, setAvailableSemesters] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [loading, setLoading] = useState({
    registrations: false,
    courses: false,
    semesters: false,
    submitting: false
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  // Fetch all necessary data on mount
  useEffect(() => {
    fetchRegistrations();
    fetchAvailableCourses();
    fetchAvailableSemesters();
  }, []);

  const fetchRegistrations = async () => {
    setLoading(prev => ({ ...prev, registrations: true }));
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/registration');
      setUnits(res.data);
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to fetch registrations', type: 'error' });
    } finally {
      setLoading(prev => ({ ...prev, registrations: false }));
    }
  };

  const fetchAvailableCourses = async () => {
    setLoading(prev => ({ ...prev, courses: true }));
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/courses');
      setAvailableCourses(res.data);
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to fetch available courses', type: 'error' });
    } finally {
      setLoading(prev => ({ ...prev, courses: false }));
    }
  };

 const fetchAvailableSemesters = async () => {
  setLoading(prev => ({ ...prev, semesters: true }));
  try {
    const res = await axios.get('http://127.0.0.1:5000/api/semesters');
    setAvailableSemesters([res.data]); // Wrap in array since it returns single object
  } catch (err) {
    console.error(err);
    setMessage({ 
      text: err.response?.data?.error || 'Failed to fetch available semesters', 
      type: 'error' 
    });
  } finally {
    setLoading(prev => ({ ...prev, semesters: false }));
  }
};

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !selectedSemester) {
      setMessage({ text: 'Please select both course and semester', type: 'error' });
      return;
    }

    setLoading(prev => ({ ...prev, submitting: true }));
    setMessage({ text: '', type: '' });

    try {
      const res = await axios.post('http://127.0.0.1:5000/api/registration', { 
        course_code: selectedCourse,
        semester_id: selectedSemester 
      });
      
      setMessage({ text: res.data.message, type: 'success' });
      setSelectedCourse('');
      setSelectedSemester('');
      fetchRegistrations(); // refresh list
    } catch (err) {
      console.error(err);
      setMessage({ 
        text: err.response?.data?.error || 'Registration failed', 
        type: 'error' 
      });
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  const handleDelete = async (registrationId) => {
    if (!window.confirm('Are you sure you want to delete this registration?')) return;
    
    try {
      const res = await axios.delete('http://127.0.0.1:5000/api/registration', { 
        data: { registration_id: registrationId } 
      });
      
      setMessage({ text: res.data.message, type: 'success' });
      fetchRegistrations();
    } catch (err) {
      console.error(err);
      setMessage({ 
        text: err.response?.data?.error || 'Failed to delete registration', 
        type: 'error' 
      });
    }
  };

  // Message component for consistent styling
  const Message = ({ msg }) => (
    <div className={`mt-2 p-2 rounded ${
      msg.type === 'error' ? 'bg-red-100 text-red-700' : 
      msg.type === 'success' ? 'bg-green-100 text-green-700' : 
      'bg-blue-100 text-blue-700'
    }`}>
      {msg.text}
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Unit Registration</h1>

      <Card title="Register for a Unit">
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-gray-700">Select Course:</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="border rounded px-3 py-2 w-full"
              disabled={loading.courses}
            >
              <option value="">-- Select Course --</option>
              {availableCourses.map(course => (
                <option key={course.code} value={course.code}>
                  {course.code} - {course.title}
                </option>
              ))}
            </select>
            {loading.courses && <p className="text-sm text-gray-500">Loading courses...</p>}
          </div>

          <div>
            <label className="block text-gray-700">Select Semester:</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="border rounded px-3 py-2 w-full"
              disabled={loading.semesters}
            >
              <option value="">-- Select Semester --</option>
              {availableSemesters.map(semester => (
                <option key={semester.id} value={semester.id}>
                  {semester.name || semester.term} ({semester.year})
                </option>
              ))}
            </select>
            {loading.semesters && <p className="text-sm text-gray-500">Loading semesters...</p>}
          </div>

          <button
            type="submit"
            disabled={loading.submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading.submitting ? 'Registering...' : 'Register'}
          </button>
        </form>
        {message.text && <Message msg={message} />}
      </Card>

      <Card title="Registered Units">
        {loading.registrations ? (
          <p className="text-gray-600">Loading registrations...</p>
        ) : units.length === 0 ? (
          <p className="text-gray-600">No units registered yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">Course Code</th>
                  <th className="px-4 py-2 border">Course Title</th>
                  <th className="px-4 py-2 border">Semester</th>
                  <th className="px-4 py-2 border">Registered On</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {units.map((unit) => (
                  <tr key={unit.id}>
                    <td className="px-4 py-2 border">{unit.course_code}</td>
                    <td className="px-4 py-2 border">{unit.course_title}</td>
                    <td className="px-4 py-2 border">{unit.semester_name || unit.semester_id}</td>
                    <td className="px-4 py-2 border">
                      {new Date(unit.registered_on).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      <button
                        onClick={() => handleDelete(unit.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UnitRegistration;