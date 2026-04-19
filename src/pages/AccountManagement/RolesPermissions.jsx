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
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [editedRoleName, setEditedRoleName] = useState('');
  const [editedPermissions, setEditedPermissions] = useState([]);

  const availablePermissions = [
    'Full Access',
    'Manage Users',
    'Manage Inventory',
    'Manage Payroll',
    'View Reports',
    'View Bookings',
    'Update Status',
    'View Inventory',
    'Process Payments'
  ];

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (role) => {
    setEditingRoleId(role.id);
    setEditedRoleName(role.name);
    setEditedPermissions(role.permissions);
  };

  const handleCancel = () => {
    setEditingRoleId(null);
    setEditedRoleName('');
    setEditedPermissions([]);
  };

  const handlePermissionToggle = (permission) => {
    setEditedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((item) => item !== permission)
        : [...prev, permission]
    );
  };

  const handleSave = () => {
    if (!editedRoleName.trim()) {
      alert('Role name cannot be empty.');
      return;
    }

    setRoles((prevRoles) =>
      prevRoles.map((role) =>
        role.id === editingRoleId
          ? { ...role, name: editedRoleName.trim(), permissions: editedPermissions }
          : role
      )
    );

    handleCancel();
  };

  return (
    <div className={styles['settings-panel']}>
      <h2>Roles & Permissions</h2>
      <div className={styles['roles-list']}>
        {filteredRoles.map((role) => {
          const isEditing = role.id === editingRoleId;

          return (
            <div key={role.id} className={styles['role-item']}>
              <div className={styles['role-header']}>
                <span className={styles['role-name']}>{role.name}</span>
                {isEditing ? (
                  <div className={styles['role-actions']}>
                    <button className={styles['save-btn']} onClick={handleSave}>Save</button>
                    <button className={styles['cancel-btn']} onClick={handleCancel}>Cancel</button>
                  </div>
                ) : (
                  <button className={styles['edit-btn']} onClick={() => handleEdit(role)}>Edit</button>
                )}
              </div>

              {isEditing ? (
                <div className={styles['edit-form']}>
                  <label className={styles['edit-label']}>
                    Role Name
                    <input
                      type="text"
                      value={editedRoleName}
                      onChange={(e) => setEditedRoleName(e.target.value)}
                      className={styles['edit-input']}
                    />
                  </label>

                  <div className={styles['permissions-grid']}>
                    {availablePermissions.map((permission) => (
                      <label key={permission} className={styles['permission-option']}>
                        <input
                          type="checkbox"
                          checked={editedPermissions.includes(permission)}
                          onChange={() => handlePermissionToggle(permission)}
                        />
                        {permission}
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={styles['role-permissions']}>{role.permissions.join(', ')}</div>
              )}
            </div>
          );
        })}
        {filteredRoles.length === 0 && (
          <div className={styles['empty-state']}>No roles found</div>
        )}
      </div>
    </div>
  );
};

export default RolesPermissions;