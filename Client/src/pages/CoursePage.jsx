import { useEffect, useState } from 'react';
import axios from 'axios';
import { BookOpen, Loader, Search, XCircle } from 'lucide-react';
import Navbar from '../layouts/Navbar';
import Footer from '../layouts/Footer';


const CoursePage = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/courses');
        const courseData = response.data || [];
        setCourses(courseData);
        setFilteredCourses(courseData);

        const uniquePrograms = [
          ...new Set(courseData.map((course) => course.program).filter(Boolean)),
        ];
        setPrograms(uniquePrograms);
      } catch (err) {
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    let filtered = courses;

    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (normalizedSearch !== '') {
      filtered = filtered.filter((course) => {
        const name = course.name?.toLowerCase() || '';
        const code = course.code?.toLowerCase() || '';
        return name.includes(normalizedSearch) || code.includes(normalizedSearch);
      });
    }

    if (selectedProgram) {
      filtered = filtered.filter((course) => course.program === selectedProgram);
    }

    setFilteredCourses(filtered);
  }, [searchTerm, selectedProgram, courses]);

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-8">
          Explore Available Courses
        </h1>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by course name or code"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
          >
            <option value="">All Programs</option>
            {programs.map((program) => (
              <option key={program} value={program}>
                {program}
              </option>
            ))}
          </select>

          {(searchTerm || selectedProgram) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedProgram('');
              }}
              className="flex items-center px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Clear Filters
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center mt-20 text-blue-700">
            <Loader className="animate-spin w-8 h-8 mr-2" />
            <span>Loading courses...</span>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg text-center">
            {error}
          </div>
        ) : filteredCourses.length === 0 ? (
          <p className="text-center text-gray-600">
            No courses match your search or filter.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {course.name || course.program || 'Unnamed Course'}
                  </h2>
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-sm text-gray-500 mb-1">
                  <span className="font-medium text-gray-700">Code:</span>{' '}
                  {course.code || 'N/A'}
                </p>
                <p className="text-sm text-gray-500 mb-1">
                  <span className="font-medium text-gray-700">Program:</span>{' '}
                  {course.program || 'N/A'}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {course.description || 'No description available.'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    <Footer />
    </>
    
  );
};

export default CoursePage;