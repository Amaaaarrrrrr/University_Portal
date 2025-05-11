import React, { useState } from 'react';
import Navbar from '../layouts/Navbar';
import Footer from '../layouts/Footer';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simple validation
    const { name, email, message } = formData;
    if (!name || !email || !message) {
      setError('Please fill in all fields.');
      setIsSubmitted(false);
      return;
    }

    // Clear error and simulate form submission
    setError('');
    setTimeout(() => {
      setIsSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    }, 500);
  };

  return (
    <>
      <Navbar />
      <div className="px-6 py-12 max-w-4xl mx-auto text-gray-800 space-y-12">
        <section className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-blue-800">Contact Us</h1>
          <p className="text-lg text-gray-600">
            We’d love to hear from you! Reach out with any questions, feedback, or support inquiries.
          </p>
        </section>

        <section className="bg-white p-6 rounded-lg shadow space-y-6">
          <h2 className="text-2xl font-semibold text-blue-700">Send Us a Message</h2>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded">
              {error}
            </div>
          )}
          {isSubmitted && (
            <div className="bg-green-100 text-green-700 p-3 rounded">
              Your message has been sent successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border px-4 py-2 rounded focus:ring focus:border-blue-400"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border px-4 py-2 rounded focus:ring focus:border-blue-400"
                placeholder="Your email"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows="5"
                className="w-full border px-4 py-2 rounded focus:ring focus:border-blue-400"
                placeholder="Your message"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-700 text-white px-6 py-2 rounded shadow hover:bg-blue-800 transition"
            >
              Send Message
            </button>
          </form>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default ContactPage;