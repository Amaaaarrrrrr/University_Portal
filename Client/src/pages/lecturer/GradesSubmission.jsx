import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GradesSubmission = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [formData, setFormData] = useState({
    student_id: '',
    course_id: '',
    semester_id: '',
    grade: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Axios instance with base URL
  const api = axios.create({
    baseURL: 'http://127.0.0.1:5000/api',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Fetch all required data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, coursesRes, semestersRes] = await Promise.all([
          api.get('/students'),
          api.get('/courses'),
          api.get('/semesters/active')
        ]);

        setStudents(studentsRes.data);
        setCourses(coursesRes.data);
        setSemesters(semestersRes.data);
        setMessage({ text: 'Data loaded successfully', type: 'success' });
      } catch (error) {
        console.error('Fetch error:', error);
        setMessage({ 
          text: error.response?.data?.error || error.message || 'Failed to load data',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.student_id || !formData.course_id || !formData.semester_id || !formData.grade) {
      setMessage({ text: 'All fields are required', type: 'error' });
      return false;
    }

    const validGrades = ['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'E'];
    if (!validGrades.includes(formData.grade.toUpperCase())) {
      setMessage({ 
        text: 'Invalid grade. Valid grades are: A, B+, B, C+, C, D+, D, E', 
        type: 'error' 
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setMessage({ text: 'Submitting grade...', type: 'info' });

    try {
      const response = await api.post('/grades', {
        ...formData,
        grade: formData.grade.toUpperCase() // Ensure consistent case
      });

      setMessage({ text: 'Grade submitted successfully!', type: 'success' });
      setFormData({
        student_id: '',
        course_id: '',
        semester_id: '',
        grade: ''
      });
    } catch (error) {
      console.error('Submission error:', error);
      setMessage({ 
        text: error.response?.data?.error || error.message || 'Submission failed',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Message component
  const Message = ({ msg }) => (
    <div style={{
      padding: '10px',
      margin: '10px 0',
      borderRadius: '4px',
      backgroundColor: msg.type === 'error' ? '#ffebee' : 
                       msg.type === 'success' ? '#e8f5e9' : '#e3f2fd',
      color: msg.type === 'error' ? '#c62828' : 
             msg.type === 'success' ? '#2e7d32' : '#1565c0',
      textAlign: 'center'
    }}>
      {msg.text}
    </div>
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p>Loading data...</p>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '700px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Submit Grades</h2>
      
      {message.text && <Message msg={message} />}

      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        marginBottom: '20px',
        backgroundColor: '#f9f9f9',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        {/* Student Select */}
        <div>
          <label htmlFor="student_id" style={{ display: 'block', marginBottom: '5px' }}>
            Student:
          </label>
          <select
            id="student_id"
            name="student_id"
            value={formData.student_id}
            onChange={handleChange}
            required
            style={{
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              width: '100%',
              fontSize: '16px'
            }}
          >
            <option value="">-- Select Student --</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.name} ({student.reg_no})
              </option>
            ))}
          </select>
        </div>

        {/* Course Select */}
        <div>
          <label htmlFor="course_id" style={{ display: 'block', marginBottom: '5px' }}>
            Course:
          </label>
          <select
            id="course_id"
            name="course_id"
            value={formData.course_id}
            onChange={handleChange}
            required
            style={{
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              width: '100%',
              fontSize: '16px'
            }}
          >
            <option value="">-- Select Course --</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.code} - {course.title}
              </option>
            ))}
          </select>
        </div>

        {/* Semester Select */}
        <div>
          <label htmlFor="semester_id" style={{ display: 'block', marginBottom: '5px' }}>
            Semester:
          </label>
          <select
            id="semester_id"
            name="semester_id"
            value={formData.semester_id}
            onChange={handleChange}
            required
            style={{
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              width: '100%',
              fontSize: '16px'
            }}
          >
            <option value="">-- Select Semester --</option>
            {semesters.map(semester => (
              <option key={semester.id} value={semester.id}>
                {semester.name || semester.term} {semester.year && `(${semester.year})`}
              </option>
            ))}
          </select>
        </div>

        {/* Grade Input */}
        <div>
          <label htmlFor="grade" style={{ display: 'block', marginBottom: '5px' }}>
            Grade:
          </label>
          <input
            id="grade"
            type="text"
            name="grade"
            placeholder="e.g., A, B+, C"
            value={formData.grade}
            onChange={handleChange}
            required
            style={{
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              width: '100%',
              maxWidth: '150px',
              fontSize: '16px'
            }}
          />
          <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
            Valid grades: A, B+, B, C+, C, D+, D, E
          </small>
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '12px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: submitting ? '#888' : '#28a745',
            color: 'white',
            cursor: submitting ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            marginTop: '10px'
          }}
        >
          {submitting ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Submitting...
            </>
          ) : (
            'Submit Grade'
          )}
        </button>
      </form>
    </div>
  );
};

export default GradesSubmission;