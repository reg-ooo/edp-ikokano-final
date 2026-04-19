// pages/AccountManagement/UserList.jsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './UserList.module.css';
import { getUsers, deleteUser, searchUsers } from '../../utils/userStorage';
import EditUser from './EditUser';

const UserList = ({ searchTerm, refreshTrigger }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);
  const [viewUser, setViewUser] = useState(null);

  // Load users from localStorage on component mount and when refreshTrigger changes
  useEffect(() => {
    const loadUsers = () => {
      const storedUsers = getUsers();
      setUsers(storedUsers);
      setLoading(false);
    };
    loadUsers();
  }, [refreshTrigger]);

  useEffect(() => {
    const isOpen = editingUserId || !!viewUser;
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [editingUserId, viewUser]);

  // Filter users based on search term
  const filteredUsers = searchTerm ? searchUsers(searchTerm) : users;

  const handleEdit = (user) => {
    setEditingUserId(user.id);
  };

  const openViewPanel = (user) => {
    setViewUser(user);
  };

  const closeViewPanel = () => {
    setViewUser(null);
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
              <button className={styles['view-btn']} onClick={() => openViewPanel(user)}>View</button>
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

      {viewUser && createPortal(
        <div className={styles['modal-overlay']} onClick={closeViewPanel}>
          <div className={styles['detail-modal']} onClick={(e) => e.stopPropagation()}>
            <div className={styles['detail-modal-header']}>
              <h3>User Details</h3>
              <button className={styles['detail-close-btn']} onClick={closeViewPanel}>✕</button>
            </div>
            <div className={styles['detail-name']}>{viewUser.name}</div>
            <div className={styles['detail-role']}>{viewUser.role}</div>
            
            <div className={styles['detail-grid']}>
              <div className={styles['detail-item']}>
                <span className={styles['detail-label']}>Email</span>
                <span className={styles['detail-value']}>{viewUser.email}</span>
              </div>
              <div className={styles['detail-item']}>
                <span className={styles['detail-label']}>Username</span>
                <span className={styles['detail-value']}>{viewUser.username}</span>
              </div>
            </div>

            <div className={styles['detail-actions']}>
              <button className={styles['submit-btn']} onClick={() => { closeViewPanel(); handleEdit(viewUser); }}>
                Edit User
              </button>
              <button className={styles['cancel-btn']} onClick={closeViewPanel}>
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default UserList;