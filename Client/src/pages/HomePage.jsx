import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Award, 
  Globe, 
  Calendar, 
  ChevronsRight, 
  Menu, 
  X 
} from 'lucide-react';
import axios from 'axios';
import Navbar from '../layouts/Navbar';
import Footer from '../layouts/Footer';


const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/courses'); 
        setCourses(response.data); 
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar/>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                Welcome to University Student Portal
              </h1>
              <p className="mt-4 text-xl text-blue-100">
                Your gateway to academic excellence and campus resources
              </p>
              <div className="mt-8">
                <Link to="/login">
                  <Button
                    variant="outline"
                    className="mr-4 bg-white text-blue-700 hover:bg-blue-50 border-white"
                  >
                    Log in to Portal
                  </Button>
                </Link>
                <a href="/courses">
                  <Button variant="secondary" className="bg-blue-700 hover:bg-blue-800">
                    Explore Courses
                  </Button>
                </a>
              </div>
            </div>
            <div className="md:w-5/12 flex justify-center md:justify-end">
              <div className="w-full max-w-md relative">
                <div className="bg-white p-8 rounded-lg shadow-lg transform rotate-3 absolute -top-4 -right-4 w-full h-full z-0"></div>
                <div className="bg-white p-8 rounded-lg shadow-lg relative z-10">
                  <div className="flex items-center text-blue-600 mb-4">
                    <GraduationCap className="h-6 w-6 mr-2" />
                    <h3 className="font-bold">Student Portal</h3>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-gray-200 rounded-full w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded-full"></div>
                    <div className="h-3 bg-gray-200 rounded-full w-5/6"></div>
                  </div>
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Current Term</span>
                      <span className="font-medium">Fall 2025</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-500">Registration</span>
                      <span className="font-medium text-green-600">Open</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Available Programs</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our diverse range of academic programs designed to prepare you for success in your chosen field.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {courses.map((course) => (
                <Card key={course.id} className="transition-transform hover:shadow-md hover:-translate-y-1">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-4">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{course.title}</h3>
                        <p className="text-sm text-gray-500">{course.code}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 flex-grow mb-4">{course.description}</p>
                    <Link to="/registration" className="text-blue-600 flex items-center text-sm font-medium">
                      register <ChevronsRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Portal Features</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Our student portal offers a comprehensive suite of tools to enhance your academic journey.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Course Registration</h3>
              <p className="text-gray-600">
                Easily browse and register for courses each semester, with real-time availability updates.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Grade Management</h3>
              <p className="text-gray-600">
                View your academic progress, grades, and transcript information in one convenient location.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Schedule Planner</h3>
              <p className="text-gray-600">
                Plan your academic schedule efficiently with our intuitive calendar and conflict detection.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Student Services</h3>
              <p className="text-gray-600">
                Access housing, meal plans, and other essential campus services all from your portal.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Campus Resources</h3>
              <p className="text-gray-600">
                Discover academic support, career services, and other resources available to students.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Faculty Portal</h3>
              <p className="text-gray-600">
                Dedicated interfaces for instructors to manage courses, upload materials, and submit grades.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">About Our University</h2>
              <p className="text-lg text-gray-600 mb-4">
                Founded in 1965, our university has been at the forefront of academic excellence and innovation for over five decades.
              </p>
              <p className="text-gray-600 mb-4">
                We are committed to providing a supportive and dynamic learning environment where students can thrive and achieve their full potential.
              </p>
              <p className="text-gray-600">
                Our state-of-the-art facilities, dedicated faculty, and diverse student body create a vibrant community focused on discovery, creativity, and personal growth.
              </p>
            </div>
            <div className="md:w-5/12">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">15,000+</p>
                    <p className="text-gray-700">Students</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">1,200+</p>
                    <p className="text-gray-700">Faculty Members</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-3xl font-bold text-purple-600">200+</p>
                    <p className="text-gray-700">Programs</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-3xl font-bold text-yellow-600">98%</p>
                    <p className="text-gray-700">Employment Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      
      <section id="contact" className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Contact Us</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Have questions about our programs or the student portal? We're here to help.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Get in Touch</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Main Campus</p>
                      <p className="text-gray-600">123 University Avenue, Academic City</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Email</p>
                      <p className="text-blue-600">admissions@university.edu</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Phone</p>
                      <p className="text-gray-600">(555) 123-4567</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Office Hours</p>
                      <p className="text-gray-600">Monday - Friday: 8:00 AM - 5:00 PM</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Send a Message</h3>
                  <form className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <textarea
                        id="message"
                        rows="3"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      ></textarea>
                    </div>
                    <Button variant="primary" type="button" className="w-full">
                      Send Message
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer/>
    </div>
  );
};

export default HomePage;