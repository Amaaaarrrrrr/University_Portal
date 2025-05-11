import React from 'react';
import Navbar from '../layouts/Navbar';
import Footer from '../layouts/Footer';

const AboutPage = () => {
  return (
    <>
      <Navbar />
      <div className="px-6 py-12 max-w-6xl mx-auto text-gray-800 space-y-16">
        {/* Hero Banner */}
        <section className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-blue-800">About Our Student Portal</h1>
          <p className="text-lg">
            Empowering students, streamlining university life, and building a connected academic community.
          </p>
          <img
            src="/students.jpeg"
            alt="Students working"
            className="w-full max-h-[400px] object-cover rounded-lg shadow"
          />
        </section>

        {/* Welcome Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-700">Welcome to the Future of Student Services</h2>
          <p>
            Our university student portal is a dynamic digital platform designed to simplify and enhance your academic journey.
            From course registration to hostel booking and fee management, everything you need is just a few clicks away.
          </p>
        </section>

        {/* Mission & Vision */}
        <section className="grid md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-xl font-bold text-blue-600 mb-2">Our Mission</h3>
            <p>
              To provide an accessible, user-friendly, and secure platform that enhances the academic and administrative experience for students, lecturers, and administrators.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-blue-600 mb-2">Our Vision</h3>
            <p>
              To be the leading university platform for academic services, recognized for innovation, reliability, and empowering digital education systems.
            </p>
          </div>
        </section>

        {/* Core Values */}
        <section className="bg-blue-50 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-blue-700 mb-4">Our Core Values</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Integrity and transparency in all services</li>
            <li>Innovation through continuous improvement</li>
            <li>Student-centered design and responsiveness</li>
            <li>Collaboration and inclusiveness</li>
            <li>Security and data privacy</li>
          </ul>
        </section>

        {/* Features Highlight */}
        <section>
          <h2 className="text-2xl font-semibold text-blue-700 mb-6">What You Can Do on the Portal</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <FeatureCard title="Course Registration" description="Register for academic units per semester with a simple click." />
            <FeatureCard title="Fee Payment & Clearance" description="Manage your tuition and fee records with real-time payment tracking." />
            <FeatureCard title="Hostel Booking" description="Book hostel rooms easily and check your accommodation status." />
            <FeatureCard title="Announcements" description="Stay informed with real-time updates from lecturers and the administration." />
            <FeatureCard title="Document Requests" description="Request transcripts, admission letters, and more – online and trackable." />
            <FeatureCard title="Lecturer Tools" description="Lecturers can post grades, announcements, and manage course materials." />
          </div>
        </section>

        {/* Impact Section */}
        <section className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">Our Impact</h2>
          <p className="mb-4">Since its launch, the student portal has transformed academic life for:</p>
          <div className="grid md:grid-cols-3 gap-6">
            <StatCard label="Students Served" value="7,500+" />
            <StatCard label="Courses Registered" value="45,000+" />
            <StatCard label="Hostel Bookings" value="3,200+" />
          </div>
        </section>

        {/* Meet the Team */}
        <section>
          <h2 className="text-2xl font-semibold text-blue-700 mb-6">Meet the Team</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <TeamCard name="Wallace" role="Frontend Engineer" />
            <TeamCard name="KK" role="Backend Engineer" />
            <TeamCard name="Michael" role="Backend Engineer" />
            <TeamCard name="Abdullahi" role="Frontend Engineer" />
            <TeamCard name="Joy" role="Backend Engineer" />
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center py-10 bg-blue-50 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-blue-800 mb-2">Have Feedback?</h2>
          <p className="mb-4">We're always improving. Share your suggestions or ideas to help us grow.</p>
          <button className="bg-blue-700 text-white px-6 py-2 rounded shadow hover:bg-blue-800 transition">
            Contact Us
          </button>
        </section>
      </div>
      <Footer />
    </>
  );
};

const FeatureCard = ({ title, description }) => (
  <div className="border p-4 rounded shadow hover:shadow-lg transition bg-white">
    <h4 className="font-semibold text-blue-700">{title}</h4>
    <p className="text-sm mt-1 text-gray-600">{description}</p>
  </div>
);

const StatCard = ({ label, value }) => (
  <div className="bg-blue-100 p-4 rounded shadow text-center">
    <p className="text-xl font-bold text-blue-800">{value}</p>
    <p className="text-gray-700">{label}</p>
  </div>
);

const TeamCard = ({ name, role }) => (
  <div className="text-center bg-white p-4 rounded shadow hover:shadow-lg transition">
    <img
      src={`https://ui-avatars.com/api/?name=${name}&background=0D8ABC&color=fff`}
      alt={name}
      className="w-20 h-20 rounded-full mx-auto mb-2"
    />
    <h4 className="font-semibold text-gray-800">{name}</h4>
    <p className="text-sm text-gray-500">{role}</p>
  </div>
);

export default AboutPage;