import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, AlertCircle, User, Phone, BookOpen } from 'lucide-react';
import axios from 'axios';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Navbar from '../layouts/Navbar';
import Footer from '../layouts/Footer';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const dataToSubmit = {
        name,
        email,
        password,
        role,
        [role + '_profile']: profileData
      };

      const response = await axios.post('http://127.0.0.1:5000/api/register', dataToSubmit);

      if (response.status === 201) {
        //  redirect to login page after successful registration
        printf('Registration successful...');
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileInputChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  return (
    <>
    <Navbar/>
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="p-6 bg-blue-600 text-white text-center">
            <GraduationCap className="h-12 w-12 mx-auto mb-3" />
            <h1 className="text-2xl font-bold">Student Portal</h1>
            <p className="text-blue-100 mt-1">Create a new account</p>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <Input
                  label="Full Name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  icon={<User className="h-5 w-5 text-gray-400" />}
                />
              </div>

              <div className="mb-4">
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  icon={<Mail className="h-5 w-5 text-gray-400" />}
                />
              </div>

              <div className="mb-4">
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

              <div className="mb-6">
                <Input
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  icon={<Lock className="h-5 w-5 text-gray-400" />}
                />
              </div>

              {/* Role selection */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">Register as</label>
                <div className="grid grid-cols-2 gap-2">
                  {['student', 'lecturer'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`p-3 rounded-lg border transition-colors ${
                        role === r
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Role-specific fields */}
              {role === 'student' && (
                <>
                  <div className="mb-4">
                    <Input
                      label="Registration Number"
                      type="text"
                      name="reg_no"
                      value={profileData.reg_no || ''}
                      onChange={handleProfileInputChange}
                      placeholder="Enter your registration number"
                      required
                      icon={<BookOpen className="h-5 w-5 text-gray-400" />}
                    />
                  </div>
                  <div className="mb-4">
                    <Input
                      label="Program"
                      type="text"
                      name="program"
                      value={profileData.program || ''}
                      onChange={handleProfileInputChange}
                      placeholder="Enter your program"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <Input
                      label="Year of Study"
                      type="text"
                      name="year_of_study"
                      value={profileData.year_of_study || ''}
                      onChange={handleProfileInputChange}
                      placeholder="Enter your year of study"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <Input
                      label="Phone Number"
                      type="text"
                      name="phone"
                      value={profileData.phone || ''}
                      onChange={handleProfileInputChange}
                      placeholder="Enter your phone number"
                      required
                      icon={<Phone className="h-5 w-5 text-gray-400" />}
                    />
                  </div>
                </>
              )}

              {role === 'lecturer' && (
                <>
                  <div className="mb-4">
                    <Input
                      label="Staff Number"
                      type="text"
                      name="staff_no"
                      value={profileData.staff_no || ''}
                      onChange={handleProfileInputChange}
                      placeholder="Enter your staff number"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <Input
                      label="Department"
                      type="text"
                      name="department"
                      value={profileData.department || ''}
                      onChange={handleProfileInputChange}
                      placeholder="Enter your department"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <Input
                      label="Phone Number"
                      type="text"
                      name="phone"
                      value={profileData.phone || ''}
                      onChange={handleProfileInputChange}
                      placeholder="Enter your phone number"
                      required
                      icon={<Phone className="h-5 w-5 text-gray-400" />}
                    />
                  </div>
                </>
              )}

              <Button type="submit" variant="primary" fullWidth disabled={isLoading} className="py-3">
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering...
                  </span>
                ) : (
                  'Sign up'
                )}
              </Button>
            </form>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-center text-gray-600">
              © 2025 University Student Portal. All rights reserved.
            </p>
            <p className="text-xs text-center text-gray-600 mt-2">
              <span>Already have an account? </span>
              <a href="/login" className="text-blue-600 hover:text-blue-800">
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default RegisterPage;
