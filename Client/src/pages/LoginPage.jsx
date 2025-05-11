import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import Navbar from '../layouts/Navbar';
import Footer from '../layouts/Footer';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user) {
      redirectBasedOnRole(user.role);
    }
  }, [user]);

  const redirectBasedOnRole = (role) => {
    const routes = {
      student: '/student/dashboard',
      lecturer: '/lecturer/dashboard',
      admin: '/admin/dashboard'
    };
    navigate(routes[role] || '/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid email or password');
      }

      if (!data.user?.role) {
        throw new Error('Invalid user data from server');
      }

      // Store user data and update context
      localStorage.setItem('user', JSON.stringify(data.user));
      login(data.user);
      redirectBasedOnRole(data.user.role);

    } catch (err) {
      setError(err.message);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <Navbar/>
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="p-6 bg-blue-600 text-white text-center">
            <div className="flex flex-col items-center">
              <div className="bg-white rounded-full p-2 mb-4">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold">University Portal</h1>
              <p className="text-blue-100 mt-2">Sign in to access your account</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className="mb-4">
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your university email"
                  required
                  icon={<Mail className="h-5 w-5 text-gray-400" />}
                />
              </div>

              {/* Password Input */}
              <div className="mb-6">
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  icon={<Lock className="h-5 w-5 text-gray-400" />}
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 text-sm text-gray-600">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#forgot-password" className="text-blue-600 hover:text-blue-800">
                    Forgot password?
                  </a>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isLoading}
                className="py-3"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Registration Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a
                  href="/register"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Create account
                </a>
              </p>
            </div>
          </div>

          {/* Footer Section */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-center text-gray-600">
              © {new Date().getFullYear()} University Portal. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default LoginPage;