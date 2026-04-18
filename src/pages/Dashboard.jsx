import { useState, useEffect } from 'react';
import './Dashboard.css';

const BOOKING_STORAGE_KEY = 'manageBookingsData';
const INVENTORY_STORAGE_KEY = 'inventoryData';

function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    const loadBookings = () => {
      try {
        const saved = localStorage.getItem(BOOKING_STORAGE_KEY);
        if (saved) {
          const parsedBookings = JSON.parse(saved);
          setBookings(parsedBookings);
        }
      } catch (e) {
        console.error('Error loading bookings:', e);
      }
    };

    const loadInventory = () => {
      try {
        const saved = localStorage.getItem(INVENTORY_STORAGE_KEY);
        if (saved) {
          const parsedInventory = JSON.parse(saved);
          const lowStockItems = parsedInventory.filter((item) => item.status === 'low-stock');
          setLowStockCount(lowStockItems.length);
        } else {
          setLowStockCount(0);
        }
      } catch (e) {
        console.error('Error loading inventory:', e);
        setLowStockCount(0);
      }
    };

    loadBookings();
    loadInventory();

    const handleStorageChange = (e) => {
      if (e.key === BOOKING_STORAGE_KEY) {
        loadBookings();
      }
      if (e.key === INVENTORY_STORAGE_KEY) {
        loadInventory();
      }
    };

    const handleBookingsUpdated = () => {
      loadBookings();
    };

    const handleInventoryUpdated = () => {
      loadInventory();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('bookingsUpdated', handleBookingsUpdated);
    window.addEventListener('inventoryUpdated', handleInventoryUpdated);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bookingsUpdated', handleBookingsUpdated);
      window.removeEventListener('inventoryUpdated', handleInventoryUpdated);
    };
  }, []);

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((booking) => booking.status === 'pending').length;
  const inProgressBookings = bookings.filter((booking) => booking.status === 'in-progress' || booking.status === 'in progress').length;
  const completedBookings = bookings.filter((booking) => booking.status === 'completed').length;
  const totalRevenue = bookings.reduce((sum, booking) => {
    const priceMatch = booking.service.match(/₱([\d,]+)/);
    if (priceMatch) {
      return sum + parseInt(priceMatch[1].replace(/,/g, ''), 10);
    }
    return sum;
  }, 0);

  const statusItems = [
    { key: 'pending', label: 'Pending', color: '#ffc107', value: pendingBookings },
    { key: 'in-progress', label: 'In Progress', color: '#17a2b8', value: inProgressBookings },
    { key: 'completed', label: 'Completed', color: '#28a745', value: completedBookings }
  ];

  const statusTotal = statusItems.reduce((sum, item) => sum + item.value, 0);
  const circumference = 2 * Math.PI * 44;
  let offset = 0;

  const pieSegments = statusItems
    .filter((item) => item.value > 0)
    .map((item) => {
      const dash = Number(((item.value / statusTotal) * circumference).toFixed(2));
      const segment = { ...item, dash, offset };
      offset += dash;
      return segment;
    });

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
            <h3>Pending Bookings</h3>
            <p className="stat-value">{pendingBookings}</p>
          </div>
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p className="stat-value">₱{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <h3>Low Stocks Alert</h3>
            <p className="stat-value">{lowStockCount}</p>
          </div>
        </div>
      </div>
      
      <div className="status-breakdown">
        <h2>Booking Status Breakdown</h2>
        <div className="pie-chart-row">
          <div className="pie-chart">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="44" fill="transparent" stroke="#e9ecef" strokeWidth="20" />
              {statusTotal > 0 && pieSegments.map((segment) => (
                <circle
                  key={segment.key}
                  cx="60"
                  cy="60"
                  r="44"
                  fill="transparent"
                  stroke={segment.color}
                  strokeWidth="20"
                  strokeDasharray={`${segment.dash} ${circumference}`}
                  strokeDashoffset={-segment.offset}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
              ))}
              {statusTotal === 0 && (
                <text x="60" y="60" textAnchor="middle" dominantBaseline="middle" fill="#666" fontSize="12">
                  No data
                </text>
              )}
            </svg>
          </div>
          <div className="pie-legend">
            {statusItems.map((item) => {
              const percent = statusTotal ? Math.round((item.value / statusTotal) * 100) : 0;
              return (
                <div key={item.key} className="pie-legend-item">
                  <span className="pie-legend-color" style={{ backgroundColor: item.color }} />
                  <span>{item.label}: {item.value} ({percent}%)</span>
                </div>
              );
            })}
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