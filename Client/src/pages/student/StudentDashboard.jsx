import React from 'react';
import  Card  from '../../components/common/Card';

const StudentDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Current Semester">
          <p className="text-gray-600">Fall 2025</p>
        </Card>
        <Card title="Enrolled Courses">
          <p className="text-gray-600">6 Active Courses</p>
        </Card>
        <Card title="GPA">
          <p className="text-gray-600">3.75</p>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;