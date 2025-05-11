import React, { useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import axios from 'axios';

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Component that displays a list of courses a student is enrolled in.
 * It fetches course data from an API on component mount and displays
 * them in a card format. While loading, it shows a loading message,
 * and in case of an error, it displays an error message. If no courses
 * are enrolled, it informs the user accordingly.
 */

/*******  f716acc5-e0f0-4c51-a1d9-97948510f2a5  *******/
const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch courses when component mounts
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/courses'); // Adjust base URL if needed
        setCourses(response.data);
      } catch (err) {
        setError('Failed to load courses');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
      <div className="grid gap-6">
        <Card title="Enrolled Courses">
          {loading ? (
            <p className="text-gray-600">Loading courses...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : courses.length === 0 ? (
            <p className="text-gray-600">No courses enrolled yet</p>
          ) : (
            <ul className="list-disc pl-5 space-y-2">
              {courses.map((course) => (
                <li key={course.id}>
                  <div className="font-semibold">{course.title} ({course.code})</div>
                  <div className="text-sm text-gray-500">{course.description}</div>
                  <div className="text-xs text-gray-400">Semester: {course.semester_id}, Program: {course.program}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
};

export default StudentCourses;
