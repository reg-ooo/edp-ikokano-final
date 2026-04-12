// pages/AccountManagement/RolesPermissions.jsx
import { useState } from 'react';
import styles from './RolesPermissions.module.css';

const RolesPermissions = ({ searchTerm }) => {
  const [roles, setRoles] = useState([
    { id: 1, name: 'Administrator', permissions: ['Full Access', 'Manage Users', 'Manage Inventory', 'Manage Payroll', 'View Reports'] },
    { id: 2, name: 'Manager', permissions: ['Manage Inventory', 'Manage Payroll', 'View Reports'] },
    { id: 3, name: 'Staff', permissions: ['View Bookings', 'Update Status', 'View Inventory'] },
    { id: 4, name: 'Cashier', permissions: ['View Bookings', 'Process Payments', 'View Reports'] }
  ]);

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (role) => {
    alert(`Edit role: ${role.name}`);
  };

  return (
    <div className={styles['settings-panel']}>
      <h2>Roles & Permissions</h2>
      <div className={styles['roles-list']}>
        {filteredRoles.map(role => (
          <div key={role.id} className={styles['role-item']}>
            <div className={styles['role-header']}>
              <span className={styles['role-name']}>{role.name}</span>
              <button className={styles['edit-btn']} onClick={() => handleEdit(role)}>Edit</button>
            </div>
            <div className={styles['role-permissions']}>{role.permissions.join(', ')}</div>
          </div>
        ))}
        {filteredRoles.length === 0 && (
          <div className={styles['empty-state']}>No roles found</div>
        )}
      </div>
    </div>
  );
};

export default RolesPermissions;