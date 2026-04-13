// pages/AccountManagement/UserList.jsx
import { useState, useEffect } from 'react';
import styles from './UserList.module.css';

const UserList = ({ searchTerm }) => {
  const [users, setUsers] = useState([
    { id: 1, name: 'Admin User', email: 'admin@carwash.com', role: 'Administrator' },
    { id: 2, name: 'Juan Dela Cruz', email: 'juan@carwash.com', role: 'Staff' },
    { id: 3, name: 'Maria Santos', email: 'maria@carwash.com', role: 'Staff' },
    { id: 4, name: 'Jose Rizal', email: 'jose@carwash.com', role: 'Staff' }
  ]);

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (user) => {
    alert(`Edit user: ${user.name}`);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete ${name}?`)) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  return (
    <div className={styles['settings-panel']}>
      <h2>User List</h2>
      <div className={styles['user-list']}>
        {filteredUsers.map(user => (
          <div key={user.id} className={styles['user-item']}>
            <div className={styles['user-info']}>
              <span className={styles['user-name']}>{user.name}</span>
              <span className={styles['user-email']}>{user.email}</span>
            </div>
            <span className={styles['user-role']}>{user.role}</span>
            <div className={styles['action-buttons']}>
              <button className={styles['edit-btn']} onClick={() => handleEdit(user)}>Edit</button>
              <button className={styles['delete-btn']} onClick={() => handleDelete(user.id, user.name)}>Delete</button>
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className={styles['empty-state']}>No users found</div>
        )}
      </div>
    </div>
  );
};

export default UserList;