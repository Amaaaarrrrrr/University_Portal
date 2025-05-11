import React, { useEffect, useState } from 'react';
import axios from 'axios';

function LecturerCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [semesterId, setSemesterId] = useState(null);  // For optional filtering
  const [program, setProgram] = useState(null);        // For optional filtering

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);

      try {
        const params = {};  // Query parameters object
        if (semesterId) params.semester_id = semesterId;  // Add semester_id if defined
        if (program) params.program = program;              // Add program if defined

        const response = await axios.get('http://127.0.0.1:5000/api/courses', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          params: params,  // Add query params to the request
        });

        setCourses(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setLoading(false);
      }
    };

    fetchCourses();
  }, [semesterId, program]);  // Rerun effect when semesterId or program changes

  if (loading) return <p className="p-6">Loading courses...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Courses</h1>
      <div className="space-y-4">
        {courses.length === 0 ? (
          <p>No courses assigned.</p>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="p-4 border rounded shadow-sm">
              <h2 className="font-semibold text-lg">
                {course.code}: {course.title}
              </h2>
              <p className="text-sm text-gray-600">Semester: {course.semester_id}</p>
              <p className="text-sm text-gray-600">Program: {course.program}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default LecturerCourses;
