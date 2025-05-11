import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, ClipboardList, Speaker, User, Home } from 'lucide-react'; // optional icons

function LecturerDashboard() {
  const dashboardItems = [
    { title: 'My Courses', path: '/lecturer/courses', icon: <BookOpen size={24} /> },
    { title: 'Submit Grades', path: '/lecturer/grades', icon: <FileText size={24} /> },
    { title: 'Assignments', path: '/lecturer/assignments', icon: <ClipboardList size={24} /> },
    { title: 'Announcements', path: '/lecturer/announcements', icon: <Speaker size={24} /> },
    { title: 'Account Settings', path: '/lecturer/account', icon: <User size={24} /> },
  ];

  return (
    <div>
      {/* NAVIGATION BAR */}
      <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Home size={28} />
          <span className="text-lg font-bold">Lecturer Portal</span>
        </div>
        <div className="flex gap-4">
          <p>Plan your Classes that can run for 90 days per Semester</p>
          <p>Lecturer should adare to code of conducts and policies of the University</p>
          
        </div>
      </nav>

      {/* DASHBOARD CONTENT */}
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Lecturer Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map((item) => (
            <Link
              to={item.path}
              key={item.title}
              className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition flex items-center gap-4"
            >
              {item.icon}
              <span className="text-lg font-medium">{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LecturerDashboard;