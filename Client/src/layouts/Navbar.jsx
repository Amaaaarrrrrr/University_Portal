import { GraduationCap, BookOpen, Home, Info, Mail, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <h1 className="ml-2 text-xl font-bold text-gray-900">University Portal</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex space-x-6">
              <Link to="/home" className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                <Home className="h-4 w-4 mr-1" /> Home
              </Link>
              <Link to="/courses" className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                <BookOpen className="h-4 w-4 mr-1" /> Courses
              </Link>
              <Link to="/about" className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                <Info className="h-4 w-4 mr-1" /> About
              </Link>
              <Link to="/contact" className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                <Mail className="h-4 w-4 mr-1" /> Contact
              </Link>
            </nav>

            {/* Login / Signup */}
            <Link
              to="/login"
              className="ml-4 inline-flex items-center bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Log / Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;