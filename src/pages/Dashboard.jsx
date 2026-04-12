import './Dashboard.css';

function Dashboard() {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="system-stats">
        <h2>System Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Bookings</h3>
            <p className="stat-value">0</p>
          </div>
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p className="stat-value">$0</p>
          </div>
          <div className="stat-card">
            <h3>Low Stocks Alert</h3>
            <p className="stat-value">0</p>
          </div>
        </div>
      </div>
      
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <p>no booking yet.</p>
      </div>
    </div>
  );
}

export default Dashboard;