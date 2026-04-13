// pages/AccountManagement/AccountSettings.jsx
import { useState } from 'react';
import styles from './AccountSettings.module.css';

const AccountSettings = () => {
  const [account, setAccount] = useState({
    name: 'Admin User',
    email: 'admin@carwash.com',
    role: 'Administrator'
  });

  const handleManageAccount = () => {
    alert('Manage Account clicked');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      alert('Logged out successfully!');
    }
  };

  const handleDeactivate = () => {
    if (window.confirm('Are you sure you want to deactivate your account?')) {
      alert('Account deactivated');
    }
  };

  return (
    <div className={styles['settings-panel']}>
      <h2>Your Account Settings</h2>
      <div className={styles['account-settings']}>
        <div className={styles['account-info']}>
          <div className={styles['info-group']}>
            <label>Name</label>
            <input 
              type="text" 
              value={account.name}
              onChange={(e) => setAccount({...account, name: e.target.value})}
            />
          </div>
          <div className={styles['info-group']}>
            <label>Email</label>
            <input 
              type="email" 
              value={account.email}
              onChange={(e) => setAccount({...account, email: e.target.value})}
            />
          </div>
          <div className={styles['info-group']}>
            <label>Role</label>
            <input type="text" value={account.role} disabled className={styles['disabled-input']} />
          </div>
          <div className={styles['info-group']}>
            <label>Change Password</label>
            <input type="password" placeholder="New password" />
            <input type="password" placeholder="Confirm new password" />
          </div>
          <button className={styles['save-btn']} onClick={handleManageAccount}>
            Save Changes
          </button>
        </div>
        <div className={styles['account-buttons']}>
          <button className={styles['logout-btn']} onClick={handleLogout}>Logout</button>
          <button className={styles['deactivate-btn']} onClick={handleDeactivate}>Deactivate</button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;