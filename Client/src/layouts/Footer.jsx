import { GraduationCap } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center mb-4">
            <GraduationCap className="h-8 w-8 text-blue-400" />
            <span className="ml-2 text-xl font-bold text-white">University Portal</span>
          </div>
          <p className="text-gray-400">
            Empowering students with tools for academic success and campus engagement.
          </p>
          <div className="flex space-x-4 mt-4">
            <a href="https://facebook.com" className="text-gray-300 hover:text-white" target="_blank" rel="noopener noreferrer">
              <span className="sr-only">Facebook</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12.073C22 6.486 17.523 2 12 2S2 6.486 2 12.073C2 17.09 5.656 21.128 10.438 21.954v-6.352h-3.13v-2.529h3.13V10.41c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.464.099 2.795.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.763v2.313h3.587l-.467 2.529h-3.12V22C18.344 21.128 22 17.09 22 12.073z" />
              </svg>
            </a>
            <a href="https://twitter.com" className="text-gray-300 hover:text-white" target="_blank" rel="noopener noreferrer">
              <span className="sr-only">Twitter</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20c7.547 0 11.675-6.155 11.675-11.496 0-.175 0-.349-.012-.522A8.18 8.18 0 0022 5.92a8.27 8.27 0 01-2.357.636 4.07 4.07 0 001.804-2.228 8.18 8.18 0 01-2.605.981 4.11 4.11 0 00-7.034 3.743A11.65 11.65 0 013.15 4.71a4.06 4.06 0 001.27 5.482A4.1 4.1 0 012.8 9.71v.051a4.1 4.1 0 003.292 4.014 4.13 4.13 0 01-1.085.141c-.265 0-.522-.025-.774-.072a4.1 4.1 0 003.832 2.82A8.23 8.23 0 012 18.407 11.6 11.6 0 008.29 20" />
              </svg>
            </a>
            <a href="https://instagram.com" className="text-gray-300 hover:text-white" target="_blank" rel="noopener noreferrer">
              <span className="sr-only">Instagram</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.849.07 1.366.062 2.633.34 3.608 1.316.975.975 1.254 2.243 1.316 3.608.058 1.265.07 1.645.07 4.849s-.012 3.584-.07 4.849c-.062 1.366-.34 2.633-1.316 3.608-.975.975-2.243 1.254-3.608 1.316-1.265.058-1.645.07-4.849.07s-3.584-.012-4.849-.07c-1.366-.062-2.633-.34-3.608-1.316-.975-.975-1.254-2.243-1.316-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.849c.062-1.366.34-2.633 1.316-3.608.975-.975 2.243-1.254 3.608-1.316C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.775.13 4.602.392 3.636 1.357 2.67 2.323 2.408 3.496 2.35 4.773 2.291 6.053 2.278 6.462 2.278 12s.013 5.947.072 7.227c.058 1.277.32 2.45 1.285 3.415.966.966 2.139 1.228 3.416 1.285 1.28.059 1.689.072 7.227.072s5.947-.013 7.227-.072c1.277-.058 2.45-.32 3.416-1.285.965-.966 1.227-2.139 1.285-3.416.059-1.28.072-1.689.072-7.227s-.013-5.947-.072-7.227c-.058-1.277-.32-2.45-1.285-3.415C20.45.392 19.277.13 18 .072 16.719.013 16.31 0 12 0zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
              </svg>
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-white text-sm font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2">
            <li><a href="/home" className="text-gray-300 hover:text-white">Home</a></li>
            <li><a href="/courses" className="text-gray-300 hover:text-white">Courses</a></li>
            <li><a href="/about" className="text-gray-300 hover:text-white">About Us</a></li>
            <li><a href="/register" className="text-gray-300 hover:text-white">SignUp</a></li>
            <li><a href="/contact" className="text-gray-300 hover:text-white">Contact Us</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Resources</h3>
          <ul className="space-y-2">
            <li><a href="#" className="text-gray-300 hover:text-white">Student Handbook</a></li>
            <li><a href="#" className="text-gray-300 hover:text-white">Academic Policies</a></li>
            <li><a href="#" className="text-gray-300 hover:text-white">Financial Aid</a></li>
            <li><a href="#" className="text-gray-300 hover:text-white">Health Services</a></li>
            <li><a href="#" className="text-gray-300 hover:text-white">Campus Events</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Stay Connected</h3>
          <p className="text-gray-300 mb-4">
            Subscribe to our newsletter for updates on campus events and important announcements.
          </p>
          <form className="flex">
            <input
              type="email"
              placeholder="Your email address"
              className="px-3 py-2 bg-gray-700 text-white placeholder-gray-400 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500 flex-grow"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} University Portal. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;