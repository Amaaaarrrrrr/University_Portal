import { Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SidebarLink from '../components/common/SidebarLink';
import {
  Gauge,
  Users,
  MessageSquare,
  DollarSign,
  Home,
  UserCheck,
  ClipboardList,
  FileCheck,
  UserCircle,
  LogOut,
  Menu,
  X,
  Settings,
} from 'lucide-react';

const sidebarLinks = [
  { to: '/admin/dashboard', icon: Gauge, text: 'Dashboard' },
  { to: '/admin/users', icon: Users, text: 'User Management' },
  { to: '/admin/announcements', icon: MessageSquare, text: 'Announcements' },
  { to: '/admin/fees', icon: DollarSign, text: 'Fees Management' },
  { to: '/admin/hostels', icon: Home, text: 'Hostel Management' },
  { to: '/admin/assign-lecturers', icon: UserCheck, text: 'Assign Lecturers' },
  { to: '/admin/student-registration', icon: ClipboardList, text: 'Registration Approval' },
  { to: '/admin/fee-status', icon: FileCheck, text: 'Fee Clearance Status' },
  { to: '/admin/auth', icon: UserCircle, text: 'My Profile' },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex md:w-64 flex-col bg-white border-r border-gray-200">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Settings className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Admin Portal</h1>
          </div>
        </div>

        <div className="flex flex-col justify-between h-full p-4 overflow-y-auto">
          <div className="space-y-1">
            {sidebarLinks.map((link, index) => (
              <SidebarLink
                key={index}
                to={link.to}
                icon={<link.icon size={20} />}
                text={link.text}
              />
            ))}
          </div>

          <button
            onClick={handleLogout}
            aria-label="Logout"
            className="flex items-center mt-8 p-3 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity duration-200 ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleMobileMenu}
        aria-label="Close sidebar"
      ></div>

      {/* Mobile sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white z-30 md:hidden transform transition-transform duration-300 ease-in-out will-change-transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-blue-600" />
            <h1 className="text-lg font-bold text-gray-900">Admin Portal</h1>
          </div>
          <button onClick={toggleMobileMenu} aria-label="Close menu" className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col justify-between h-full p-4 overflow-y-auto">
          <div className="space-y-1">
            {sidebarLinks.map((link, index) => (
              <SidebarLink
                key={index}
                to={link.to}
                icon={<link.icon size={20} />}
                text={link.text}
              />
            ))}
          </div>

          <button
            onClick={handleLogout}
            aria-label="Logout"
            className="flex items-center mt-8 p-3 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className={`bg-white border-b border-gray-200 transition-all duration-200 ${
            isScrolled ? 'shadow-sm' : ''
          }`}
        >
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              onClick={toggleMobileMenu}
              aria-label="Open menu"
              className="md:hidden text-gray-600 focus:outline-none"
            >
              <Menu size={24} />
            </button>

            <div className="flex items-center space-x-3 ml-auto">
              <div className="relative">
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
