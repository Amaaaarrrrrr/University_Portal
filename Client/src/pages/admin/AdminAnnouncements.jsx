import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LecturerAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/announcements');
        console.log('Fetched announcements:', response.data);
        setAnnouncements(response.data);
      } catch (error) {
        console.error('Failed to load announcements:', error);
        setMessage('Failed to load announcements.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      setMessage('Please provide both title and content.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token'); // if needed for Authorization
      console.log('token', token); // Debugging
      const response = await axios.post(
        'http://127.0.0.1:5000/api/announcements',
        { title: newTitle, content: newContent },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      console.log('POST response:', response.data);

      setMessage(response.data.message || 'Announcement posted.');
      setAnnouncements((prev) => [
        ...prev,
        { id: Date.now(), title: newTitle },
      ]);

      setNewTitle('');
      setNewContent('');
    } catch (error) {
      console.error('Failed to post announcement:', error);
      setMessage(error.response?.data?.error || 'Failed to post announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (announcementId) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://127.0.0.1:5000/api/announcements/${announcementId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setAnnouncements(prev => prev.filter(announcement => announcement.id !== announcementId));
      setMessage('Announcement deleted successfully.');
    } catch (error) {
      console.error('Failed to delete announcement:', error);
      setMessage(error.response?.data?.error || 'Failed to delete announcement.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Admin Announcements</h2>

      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '20px',
        backgroundColor: '#f9f9f9',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      }}>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New announcement title"
          required
          style={{
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Announcement content"
          required
          rows={4}
          style={{
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '10px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: submitting ? '#888' : '#007BFF',
            color: 'white',
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? 'Adding...' : 'Add Announcement'}
        </button>
      </form>

      {message && (
        <p style={{ color: message.includes('Failed') ? 'red' : 'green', textAlign: 'center' }}>
          {message}
        </p>
      )}

      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading announcements...</p>
      ) : (
        <ul style={{
          listStyle: 'none',
          padding: 0,
        }}>
          {announcements.map((announcement) => (
            <li key={announcement.id || `${announcement.title}-${announcement.date_posted}`} style={{
              backgroundColor: '#fff',
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '6px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              position: 'relative',
            }}>
              <h3>{announcement.title}</h3>
              <p>{announcement.content}</p>
              <small>Posted by {announcement.posted_by} on {new Date(announcement.date_posted).toLocaleString()}</small>
              <button
                onClick={() => handleDelete(announcement.id)}
                disabled={deleting}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: '#ff4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '5px 10px',
                  cursor: 'pointer',
                  opacity: deleting ? 0.6 : 1,
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LecturerAnnouncements;