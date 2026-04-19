// pages/AccountManagement/ActivityLogs.jsx
import { useState, useEffect } from 'react';
import styles from './ActivityLogs.module.css';

const STORAGE_KEY = 'activityLogs';

const ActivityLogs = ({ searchTerm }) => {
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved activity logs:', e);
      }
    }

    return [
      { id: 1, user: 'Admin User', action: 'Added new user: Juan Dela Cruz', timestamp: '2026-03-27 10:30 AM' },
      { id: 2, user: 'Juan Dela Cruz', action: 'Updated booking #0002 status to COMPLETED', timestamp: '2026-03-27 09:45 AM' },
      { id: 3, user: 'Admin User', action: 'Modified inventory: Car Shampoo quantity updated', timestamp: '2026-03-26 03:20 PM' },
      { id: 4, user: 'Maria Santos', action: 'Processed payment of ₱200.00', timestamp: '2026-03-26 02:15 PM' },
      { id: 5, user: 'System', action: 'Backup completed successfully', timestamp: '2026-03-26 12:00 AM' }
    ];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    const handleNewLog = (event) => {
      const entry = event.detail;
      if (!entry || !entry.action) return;

      const timestamp = entry.timestamp || new Date().toLocaleString('en-PH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      const newLog = {
        id: Date.now().toString(),
        user: entry.user || 'System',
        action: entry.action,
        timestamp
      };

      setLogs((prevLogs) => [newLog, ...prevLogs]);
    };

    window.addEventListener('activityLogEntry', handleNewLog);
    return () => window.removeEventListener('activityLogEntry', handleNewLog);
  }, []);

  const filteredLogs = logs.filter(log =>
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const clearLogs = () => {
    if (window.confirm('Clear all activity logs?')) {
      setLogs([]);
    }
  };

  return (
    <div className={styles['settings-panel']}>
      <div className={styles['section-header']}>
        <h2>Activity Logs</h2>
      </div>
      <div className={styles['logs-list']}>
        {filteredLogs.map(log => (
          <div key={log.id} className={styles['log-item']}>
            <div className={styles['log-header']}>
              <span className={styles['log-user']}>{log.user}</span>
              <span className={styles['log-time']}>{log.timestamp}</span>
            </div>
            <div className={styles['log-action']}>{log.action}</div>
          </div>
        ))}
        {filteredLogs.length === 0 && (
          <div className={styles['empty-state']}>No activity logs found</div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;