// pages/AccountManagement/UserList.jsx
import { useState, useEffect } from 'react';
import styles from './UserList.module.css';
import { getUsers, deleteUser, searchUsers } from '../../utils/userStorage';
import EditUser from './EditUser';

const UserList = ({ searchTerm, refreshTrigger }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);

  // Load users from localStorage on component mount and when refreshTrigger changes
  useEffect(() => {
    const loadUsers = () => {
      const storedUsers = getUsers();
      setUsers(storedUsers);
      setLoading(false);
    };
    loadUsers();
  }, [refreshTrigger]);

  // Filter users based on search term
  const filteredUsers = searchTerm ? searchUsers(searchTerm) : users;

  const handleEdit = (user) => {
    setEditingUserId(user.id);
  };

  const handleUpdateUser = (updatedUser) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === updatedUser.id ? updatedUser : user
      )
    );
    setEditingUserId(null);
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      const updatedUsers = deleteUser(id);
      setUsers(updatedUsers);
      alert(`${name} has been deleted successfully.`);
    }
  };

  if (loading) {
    return (
      <div className={styles['settings-panel']}>
        <h2>User List</h2>
        <div className={styles['loading']}>Loading users...</div>
      </div>
    );
  }

  if (editingUserId) {
    return (
      <EditUser
        userId={editingUserId}
        onClose={handleCancelEdit}
        onUpdate={handleUpdateUser}
      />
    );
  }

  return (
    <div className={styles['settings-panel']}>
      <h2>User List</h2>
      <div className={styles['user-stats']}>
        <span>Total Users: {users.length}</span>
      </div>
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
        {filteredUsers.length === 0 && users.length > 0 && (
          <div className={styles['empty-state']}>No users match your search</div>
        )}
        {users.length === 0 && (
          <div className={styles['empty-state']}>No users found. Add some users first.</div>
        )}
      </div>
    </div>
  );
};

export default UserList;