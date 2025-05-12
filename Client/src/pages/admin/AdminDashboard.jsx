import React from 'react';
import { Users, BookOpen, FileText, Activity } from 'lucide-react';


const AdminDashboard = () => {
  return (
    <>
      
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow p-6 flex items-center space-x-4">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-gray-600 text-sm">User Management</p>
                <p className="text-lg font-semibold">Manage Accounts</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-6 flex items-center space-x-4">
              <BookOpen className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-gray-600 text-sm">Courses</p>
                <p className="text-lg font-semibold">Add / Edit Units</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-6 flex items-center space-x-4">
              <FileText className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-gray-600 text-sm">Documents</p>
                <p className="text-lg font-semibold">Review Requests</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-6 flex items-center space-x-4">
              <Activity className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-gray-600 text-sm">Audit Logs</p>
                <p className="text-lg font-semibold">Track Activity</p>
              </div>
            </div>
          </div>

          {/* Placeholder for future charts or stats */}
          <div className="mt-10">
            <div className="bg-white rounded-2xl shadow p-6 text-center text-gray-500">
              <p>Analytics and insights coming soon...</p>
            </div>
          </div>
        </div>
      </div>
      
    </>
  );
};

export default AdminDashboard;
