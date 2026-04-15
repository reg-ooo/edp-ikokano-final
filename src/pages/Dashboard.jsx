import { useState, useEffect } from 'react';
import './Dashboard.css';

const STORAGE_KEY = 'manageBookingsData';

function Dashboard() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const loadBookings = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsedBookings = JSON.parse(saved);
          setBookings(parsedBookings);
        }
      } catch (e) {
        console.error('Error loading bookings:', e);
      }
    };

    loadBookings();

    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY) {
        loadBookings();
      }
    };

    const handleBookingsUpdated = () => {
      loadBookings();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('bookingsUpdated', handleBookingsUpdated);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bookingsUpdated', handleBookingsUpdated);
    };
  }, []);

  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, booking) => {
    const priceMatch = booking.service.match(/₱([\d,]+)/);
    if (priceMatch) {
      return sum + parseInt(priceMatch[1].replace(/,/g, ''), 10);
    }
    return sum;
  }, 0);

  const recentActivities = bookings.slice(0, 5);

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="system-stats">
        <h2>System Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Bookings</h3>
            <p className="stat-value">{totalBookings}</p>
          </div>
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p className="stat-value">₱{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <h3>Low Stocks Alert</h3>
            <p className="stat-value">0</p>
          </div>
        </div>
      </div>
      
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        {recentActivities.length > 0 ? (
          <div className="activity-list">
            {recentActivities.map((booking) => (
              <div key={booking.id} className="activity-item">
                <div className="activity-info">
                  <strong>{booking.name}</strong> - {booking.service}
                  <br />
                  <small>Status: {booking.status} | Date: {booking.serviceDate}</small>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>no booking yet.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;