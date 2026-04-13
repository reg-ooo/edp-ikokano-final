// pages/AccountManagement/AddUser.jsx
import { useState } from 'react';
import styles from './AddUser.module.css';

const AddUser = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Staff',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      alert('Please fill in all fields');
      return;
    }
    alert(`User ${formData.name} added successfully!`);
    setFormData({ name: '', email: '', role: 'Staff', password: '' });
  };

  return (
    <div className={styles['settings-panel']}>
      <h2>Add New User</h2>
      <form className={styles['add-user-form']} onSubmit={handleSubmit}>
        <div className={styles['form-group']}>
          <label>Full Name *</label>
          <input 
            type="text" 
            placeholder="Enter full name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        <div className={styles['form-group']}>
          <label>Email Address *</label>
          <input 
            type="email" 
            placeholder="Enter email address"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>
        <div className={styles['form-group']}>
          <label>Role *</label>
          <select 
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
          >
            <option>Staff</option>
            <option>Manager</option>
            <option>Administrator</option>
          </select>
        </div>
        <div className={styles['form-group']}>
          <label>Password *</label>
          <input 
            type="password" 
            placeholder="Enter password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
        </div>
        <button type="submit" className={styles['submit-btn']}>Add User</button>
      </form>
    </div>
  );
};

export default AddUser;