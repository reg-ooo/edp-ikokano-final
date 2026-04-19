// pages/AccountManagement/EditUser.jsx
import { useState, useEffect } from 'react';
import styles from './AddUser.module.css';
import { getUserById, updateUser } from '../../utils/userStorage';

const EditUser = ({ userId, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Staff',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [originalUser, setOriginalUser] = useState(null);

  useEffect(() => {
    if (userId) {
      const user = getUserById(userId);
      if (user) {
        setOriginalUser(user);
        setFormData({
          name: user.name,
          email: user.email,
          role: user.role,
          password: '' // Don't populate password for security
        });
      }
    }
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    // Validation
    if (!formData.name.trim() || !formData.email.trim()) {
      setMessage('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }

    // Password validation (only if provided)
    if (formData.password && formData.password.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare update data
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role
      };

      // Only include password if it was changed
      if (formData.password) {
        updateData.password = formData.password;
      }

      // Update user in localStorage
      const updatedUser = updateUser(userId, updateData);

      if (updatedUser) {
        setMessage(`User "${updatedUser.name}" has been updated successfully!`);
        onUpdate(updatedUser);

        // Close modal after success
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setMessage('User not found or update failed.');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setMessage('An error occurred while updating the user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear any error messages when user starts typing
    if (message) setMessage('');
  };

  if (!originalUser) {
    return (
      <div className={styles['settings-panel']}>
        <div className={styles['loading']}>Loading user data...</div>
      </div>
    );
  }

  return (
    <div className={styles['settings-panel']}>
      <h2>Edit User</h2>
      {message && (
        <div className={`${styles['message']} ${message.includes('successfully') ? styles['success'] : styles['error']}`}>
          {message}
        </div>
      )}
      <form className={styles['add-user-form']} onSubmit={handleSubmit}>
        <div className={styles['form-group']}>
          <label>Full Name *</label>
          <input
            type="text"
            placeholder="Enter full name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className={styles['form-group']}>
          <label>Email Address *</label>
          <input
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className={styles['form-group']}>
          <label>Role *</label>
          <select
            value={formData.role}
            onChange={(e) => handleInputChange('role', e.target.value)}
            disabled={isSubmitting}
          >
            <option value="Staff">Staff</option>
            <option value="Manager">Manager</option>
            <option value="Administrator">Administrator</option>
          </select>
        </div>
        <div className={styles['form-group']}>
          <label>Password (leave blank to keep current)</label>
          <input
            type="password"
            placeholder="Enter new password (min. 6 characters)"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            minLength="6"
            disabled={isSubmitting}
          />
        </div>
        <div className={styles['form-actions']}>
          <button
            type="button"
            className={styles['cancel-btn']}
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles['submit-btn']}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;