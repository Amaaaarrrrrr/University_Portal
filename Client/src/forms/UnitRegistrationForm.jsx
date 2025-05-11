import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify'; // Optional for toast notifications
import { Loader } from 'lucide-react'; // Only import icons

const UnitRegistrationForm = () => {
  const [courseCode, setCourseCode] = useState('');
  const [semesterId, setSemesterId] = useState('');
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // To check if the user is logged in

  useEffect(() => {
    // Check if the student is logged in (assuming token is stored in localStorage)
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsLoggedIn(true);
    }

    // Fetch courses and semesters for dropdowns
    const fetchCoursesAndSemesters = async () => {
      try {
        setLoading(true);
        const courseResponse = await axios.get('http://127.0.0.1:5000/api/courses');
        const semesterResponse = await axios.get('http://127.0.0.1:5000/api/semesters/active');
  
        setCourses(courseResponse.data);
        setSemesters(Array.isArray(semesterResponse.data) ? semesterResponse.data : [semesterResponse.data]);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
  
    fetchCoursesAndSemesters();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!isLoggedIn) {
      setError('You must be logged in as a student to register for courses.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/registration', {
        course_code: courseCode,
        semester_id: semesterId,
      });
      toast.success('Registration successful!');
      setCourseCode('');
      setSemesterId('');
      setRegistrations((prev) => [...prev, response.data]);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRegistration = async (registrationId) => {
    try {
      setLoading(true);
      await axios.delete('http://127.0.0.1:5000/api/registration', {
        data: { registration_id: registrationId },
      });
      setRegistrations(registrations.filter((reg) => reg.id !== registrationId));
      toast.success('Registration deleted successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-8">
          Register for a Course
        </h1>

        {loading && <Loader className="animate-spin w-8 h-8 mr-2 text-blue-700" />}

        {/* Error for not being logged in */}
        {!isLoggedIn && (
          <div className="bg-red-100 text-red-700 p-4 mb-4 text-center rounded-lg">
            You must be logged in as a student to register for courses.
          </div>
        )}

        {/* Registration Form */}
        {isLoggedIn && (
          <form onSubmit={handleRegister} className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4">
              <label htmlFor="courseCode" className="block text-sm font-medium text-gray-700">Course Code</label>
              <select
                id="courseCode"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course.code} value={course.code}>
                    {course.code} - {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="semesterId" className="block text-sm font-medium text-gray-700">Semester</label>
              <select
                id="semesterId"
                value={semesterId}
                onChange={(e) => setSemesterId(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">Select Semester</option>
                {semesters.map((semester) => (
                  <option key={semester.id} value={semester.id}>
                    {semester.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              disabled={loading}
            >
              Register
            </button>
          </form>
        )}

        {/* Existing Registrations */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800">Your Current Registrations</h2>
          <ul className="mt-4">
            {registrations.length === 0 ? (
              <p className="text-gray-600">No registrations found.</p>
            ) : (
              registrations.map((reg) => (
                <li key={reg.id} className="bg-white p-4 rounded-lg shadow-md mb-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-lg font-medium text-gray-800">{reg.course_code} - {reg.course_title}</p>
                      <p className="text-sm text-gray-500">Semester: {reg.semester_id}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteRegistration(reg.id)}
                      className="bg-red-600 text-white py-1 px-3 rounded-lg hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Error */}
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default UnitRegistrationForm;
