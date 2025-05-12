import { Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SidebarLink from '../components/common/SidebarLink';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios'; // ✅ Added import
import {
  BookOpen,
  GraduationCap,
  ClipboardList,
  MessageSquare,
  FileText,
  UserCircle,
  LogOut,
  Menu,
  X,
  Gauge
} from 'lucide-react';

const LecturerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [loading, setLoading] = useState(false); // moved inside component
  const [courses, setCourses] = useState([]); // added
  const [filteredCourses, setFilteredCourses] = useState([]); // added
  const [programs, setPrograms] = useState([]); // ✅ added
  const [error, setError] = useState(null); // ✅ added

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/courses');
        const courseData = response.data || [];
        setCourses(courseData);
        setFilteredCourses(courseData);
        const uniquePrograms = [
          ...new Set(courseData.map((course) => course.program).filter(Boolean))
        ];
        setPrograms(uniquePrograms);
      } catch (err) {
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const getInitials = (name) => {
    if (!name) return 'L';
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex md:w-64 flex-col bg-white border-r border-gray-200">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Lecturer Portal</h1>
          </div>
        </div>

        <div className="flex flex-col justify-between h-full p-4 overflow-y-auto">
          <div className="space-y-1">
            <SidebarLink to="/lecturer/dashboard" icon={<Gauge size={20} />} text="Dashboard" />
            <SidebarLink to="/lecturer/courses" icon={<BookOpen size={20} />} text="My Courses" />
            <SidebarLink to="/lecturer/grades" icon={<ClipboardList size={20} />} text="Grade Submission" />
            <SidebarLink to="/lecturer/announcements" icon={<MessageSquare size={20} />} text="Announcements" />
            <SidebarLink to="/lecturer/assignments" icon={<FileText size={20} />} text="Assignments" />
            {/* <SidebarLink to="/lecturer/auth" icon={<UserCircle size={20} />} text="My Profile" /> */}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center mt-8 p-3 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile backdrop */}
      <div
        role="presentation"
        aria-hidden={!isMobileMenuOpen}
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity duration-200 ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleMobileMenu}
      ></div>

      {/* Mobile sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white z-30 md:hidden transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            <h1 className="text-lg font-bold text-gray-900">Lecturer Portal</h1>
          </div>
          <button
            onClick={toggleMobileMenu}
            aria-label="Close sidebar menu"
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col justify-between h-full p-4 overflow-y-auto">
          <div className="space-y-1">
            <SidebarLink to="/lecturer/dashboard" icon={<Gauge size={20} />} text="Dashboard" />
            <SidebarLink to="/lecturer/courses" icon={<BookOpen size={20} />} text="My Courses" />
            <SidebarLink to="/lecturer/grades" icon={<ClipboardList size={20} />} text="Grade Submission" />
            <SidebarLink to="/lecturer/announcements" icon={<MessageSquare size={20} />} text="Announcements" />
            <SidebarLink to="/lecturer/assignments" icon={<FileText size={20} />} text="Assignments" />
            <SidebarLink to="/lecturer/auth" icon={<UserCircle size={20} />} text="My Profile" />
          </div>

          <button
            onClick={handleLogout}
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
              aria-label="Open sidebar menu"
              className="md:hidden text-gray-600 focus:outline-none"
            >
              <Menu size={24} />
            </button>

            <div className="flex items-center space-x-3 ml-auto">
              <div className="relative">
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'Lecturer'}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[150px]">{user?.email || 'email@example.com'}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                    {getInitials(user?.name)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {loading ? (
            <div className="text-center text-gray-500">Loading courses...</div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

export default LecturerLayout;
