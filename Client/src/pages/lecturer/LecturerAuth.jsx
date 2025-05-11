import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LecturerAuth() {
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Retrieve token from localStorage using 'access-token' key
  const token = localStorage.getItem('access-token');

  useEffect(() => {
    axios
      .get('/api/profile', {
        headers: { Authorization: `Bearer ${token}` }, // using access-token here
      })
      .then((response) => {
        setProfile({ name: response.data.name, email: response.data.email });
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching profile:', error);
        setLoading(false);
        setMessage('Failed to load profile.');
      });
  }, [token]); // dependency added to re-run if token changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    axios
      .put(
        '/api/profile',
        { ...profile, password: password || undefined },
        { headers: { Authorization: `Bearer ${token}` } } // using access-token here
      )
      .then(() => setMessage('Profile updated successfully.'))
      .catch((err) => {
        console.error('Update error:', err);
        setMessage('Failed to update profile.');
      })
      .finally(() => setSaving(false));
  };

  const handleLogout = () => {
    localStorage.removeItem('access-token'); // remove access-token
    navigate('/login');
  };

  const handleDelete = () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    axios
      .delete('/api/profile', {
        headers: { Authorization: `Bearer ${token}` }, // using access-token here
      })
      .then(() => {
        localStorage.removeItem('access-token'); // remove access-token
        alert('Account deleted successfully.');
        navigate('/register');
      })
      .catch((err) => {
        console.error('Delete error:', err);
        alert('Failed to delete account.');
      });
  };

  if (loading) return <p className="p-6">Loading account settings...</p>;

  return (
    <div className="p-6 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          value={profile.name}
          onChange={handleChange}
          placeholder="Name"
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="email"
          value={profile.email}
          onChange={handleChange}
          placeholder="Email"
          type="email"
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New Password (optional)"
          type="password"
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          disabled={saving}
          className={`w-full py-2 rounded ${
            saving ? 'bg-gray-400' : 'bg-blue-600 text-white'
          }`}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {message && <p className="mt-4 text-sm text-center">{message}</p>}

      <div className="mt-8 space-y-2">
        <button
          onClick={handleLogout}
          className="w-full py-2 bg-yellow-500 text-white rounded"
        >
          Logout
        </button>
        <button
          onClick={handleDelete}
          className="w-full py-2 bg-red-600 text-white rounded"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}

export default LecturerAuth;
