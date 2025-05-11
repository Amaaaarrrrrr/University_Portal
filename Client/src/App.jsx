import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CoursePage from './pages/CoursePage';
import UnitRegistrationForm from './forms/UnitRegistrationForm';
import NotFoundPage from './pages/NotFoundPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

// Student pages
import StudentLayout from './layouts/StudentLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentCourses from './pages/student/StudentCourses';
import UnitRegistration from './pages/student/UnitRegistration';
import StudentFees from './pages/student/StudentFees';
import StudentHostel from './pages/student/StudentHostel';
import DocumentSubmission from './pages/student/DocumentSubmission';
import StudentAuth from './pages/student/StudentAuth';

// Lecturer pages
import LecturerLayout from './layouts/LecturerLayout';
import LecturerDashboard from './pages/lecturer/LecturerDashboard';
import LecturerCourses from './pages/lecturer/LecturerCourses';
import GradesSubmission from './pages/lecturer/GradesSubmission';
import LecturerAnnouncements from './pages/lecturer/LecturerAnnouncements';
import Assignments from './pages/lecturer/Assignments';
import LecturerAuth from './pages/lecturer/LecturerAuth';

// Admin pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import FeesManagement from './pages/admin/FeesManagement';
import HostelManagement from './pages/admin/HostelManagement';
import LecturerAssignment from './pages/admin/LecturerAssignment';
import StudentRegistrationApproval from './pages/admin/StudentRegistrationApproval';
import FeeClearanceStatus from './pages/admin/FeeClearanceStatus';
import AdminAuth from './pages/admin/AdminAuth';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/courses" element={<CoursePage />} />
            <Route path="/registration" element={<UnitRegistrationForm />} />
            <Route path="/home" element={<HomePage/>} />
            <Route path='/about' element={<AboutPage/>}/>
            <Route path='/contact' element={<ContactPage/>}/>

            {/* Student routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="courses" element={<StudentCourses />} />
              <Route path="register-units" element={<UnitRegistration />} />
              <Route path="fees" element={<StudentFees />} />
              <Route path="hostel" element={<StudentHostel />} />
              <Route path="documents" element={<DocumentSubmission />} />
              <Route path="auth" element={<StudentAuth />} />
            </Route>

            {/* Lecturer routes */}
            <Route
              path="/lecturer"
              element={
                <ProtectedRoute allowedRoles={['lecturer']}>
                  <LecturerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<LecturerDashboard />} />
              <Route path="courses" element={<LecturerCourses />} />
              <Route path="grades" element={<GradesSubmission />} />
              <Route path="announcements" element={<LecturerAnnouncements />} />
              <Route path="assignments" element={<Assignments />} />
              <Route path="auth" element={<LecturerAuth />} />
            </Route>

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="fees" element={<FeesManagement />} />
              <Route path="hostels" element={<HostelManagement />} />
              <Route path="assign-lecturers" element={<LecturerAssignment />} />
              <Route path="student-registration" element={<StudentRegistrationApproval />} />
              <Route path="fee-status" element={<FeeClearanceStatus />} />
              <Route path="auth" element={<AdminAuth />} />
            </Route>

            {/* Fallback routes */}
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;