import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';

const StudentHostel = () => {
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch hostels and rooms on mount
  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/hostels')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch hostels');
        }
        return res.json();
      })
      .then(data => setHostels(data.hostels))
      .catch(err => console.error('Error fetching hostels:', err));

    fetch('http://127.0.0.1:5000/api/rooms')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch rooms');
        }
        return res.json();
      })
      .then(data => setRooms(data.rooms))
      .catch(err => console.error('Error fetching rooms:', err));
  }, []);

  const handleBooking = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!selectedRoom || !startDate || !endDate) {
      setError('Please select a room and valid dates');
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:5000/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: 1,
        room_id: selectedRoom,
        start_date: startDate,
        end_date: endDate
      })
    });


      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setSelectedRoom('');
        setStartDate('');
        setEndDate('');
      } else {
        setError(data.error || 'Booking failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-4 border-b pb-2">Hostel Booking</h1>

      <Card title="Available Rooms" className="bg-gray-50 rounded-lg shadow-inner">
        <form onSubmit={handleBooking} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Select Room:</label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">-- Select a room --</option>
              {rooms.map(room => (
                <option
                  key={room.id}
                  value={room.id}
                  disabled={room.status === 'booked'} // Disable booked rooms
                >
                  Room {room.room_number} ({room.capacity} capacity) - {room.status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 shadow-md transition duration-200"
          >
            Book Room
          </button>
        </form>

        {message && (
          <p className="text-green-700 bg-green-100 border border-green-300 px-4 py-2 rounded-lg mt-2">
            {message}
          </p>
        )}
        {error && (
          <p className="text-red-700 bg-red-100 border border-red-300 px-4 py-2 rounded-lg mt-2">
            {error}
          </p>
        )}
      </Card>

      <Card title="Hostel Rooms" className="bg-gray-50 rounded-lg shadow-inner">
        <ol className="list-disc pl-5 text-gray-700 space-y-2">
          {rooms.map(room => (
            <li key={room.id}>
            <strong>Room {room.room_number}</strong> - {room.bed_count} beds - 
            ${room.price_per_bed ? room.price_per_bed.toFixed(2) : 'N/A'} per bed -
            <span
              className={`ml-2 inline-block ${
                room.status === 'booked' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
              } font-semibold px-2 py-1 rounded-full`}
            >
              Status: {room.status}
            </span>
          </li>
          
          ))}
        </ol>
      </Card>

      <Card title="Hostels" className="bg-gray-50 rounded-lg shadow-inner">
        <ol className="list-disc pl-5 text-gray-700 space-y-1">
          {hostels.map(hostel => (
            <li key={hostel.id}>
              <strong>{hostel.name}</strong> - {hostel.location}
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
};

export default StudentHostel;