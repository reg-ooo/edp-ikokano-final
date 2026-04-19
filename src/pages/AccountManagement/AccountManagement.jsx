// pages/AccountManagement/AccountManagement.jsx
import { useState, useEffect } from 'react';
import styles from './AccountManagement.module.css';
import UserList from './UserList';
import AddUser from './AddUser';
import ActivityLogs from './ActivityLogs';
import RolesPermissions from './RolesPermissions';
import AccountSettings from './AccountSettings';

function AccountManagement() {
  const [activePage, setActivePage] = useState('userList');
  const [searchTerm, setSearchTerm] = useState('');
  const [userSettingsOpen, setUserSettingsOpen] = useState(false);
  const [yourAccountOpen, setYourAccountOpen] = useState(false);
  const [filteredSidebarItems, setFilteredSidebarItems] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Define all searchable settings items
  const settingsItems = [
    { id: 'userList', label: 'View User List', category: 'User Settings', path: 'userList', group: 'userSettings' },
    { id: 'addUser', label: 'Add New User', category: 'User Settings', path: 'addUser', group: 'userSettings' },
    { id: 'activityLogs', label: 'Activity Logs', category: 'System', path: 'activityLogs', group: 'activityLogs' },
    { id: 'roles', label: 'Roles & Permissions', category: 'Security', path: 'roles', group: 'roles' },
    { id: 'account', label: 'Manage Account', category: 'Your Account Settings', path: 'account', group: 'yourAccount' },
  ];

  // Filter settings based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSidebarItems([]);
      setShowSearchResults(false);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = settingsItems.filter(item => 
      item.label.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term)
    );
    setFilteredSidebarItems(filtered);
    setShowSearchResults(true);
  }, [searchTerm]);

  const handleSearchResultClick = (path, group) => {
    setActivePage(path);
    setSearchTerm('');
    setShowSearchResults(false);
    
    // Auto-expand the dropdown if needed
    if (group === 'userSettings') {
      setUserSettingsOpen(true);
    } else if (group === 'yourAccount') {
      setYourAccountOpen(true);
    }
  };

  // Render the active page
  const renderPage = () => {
    switch(activePage) {
      case 'userList':
        return <UserList searchTerm={searchTerm} refreshTrigger={refreshTrigger} />;
      case 'addUser':
        return <AddUser onUserAdded={() => setRefreshTrigger(prev => prev + 1)} />;
      case 'activityLogs':
        return <ActivityLogs searchTerm={searchTerm} />;
      case 'roles':
        return <RolesPermissions searchTerm={searchTerm} />;
      case 'account':
        return <AccountSettings />;
      default:
        return <UserList searchTerm={searchTerm} refreshTrigger={refreshTrigger} />;
    }
  };

  return (
    <div className={styles['account-management-wrap']}>
      {/* Search Bar */}
      <div className={styles['search-container']}>
        <div className={styles['search-wrapper']}>
          <svg className={styles['search-icon']} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="10" cy="10" r="7" />
            <line x1="21" y1="21" x2="15" y2="15" />
          </svg>
          <input
            type="text"
            className={styles['search-input']}
            placeholder="Search settings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className={styles['search-clear']}
              onClick={() => setSearchTerm('')}
            >
              ✕
            </button>
          )}
        </div>

        {/* Search Results Dropdown (Facebook-style) */}
        {showSearchResults && (
          <div className={styles['search-results-dropdown']}>
            {filteredSidebarItems.length > 0 ? (
              <>
                <div className={styles['search-results-header']}>
                  Settings
                </div>
                {filteredSidebarItems.map(item => (
                  <div 
                    key={item.id}
                    className={styles['search-result-item']}
                    onClick={() => handleSearchResultClick(item.path, item.group)}
                  >
                    <div className={styles['result-icon']}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                    </div>
                    <div className={styles['result-content']}>
                      <div className={styles['result-title']}>{item.label}</div>
                      <div className={styles['result-category']}>{item.category}</div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className={styles['search-results-empty']}>
                No settings found for "{searchTerm}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content Layout */}
      <div className={styles['account-content']}>
        {/* Sidebar */}
        <div className={styles['account-sidebar']}>
          {/* User Settings Dropdown */}
          <div className={styles['sidebar-dropdown']}>
            <div 
              className={`${styles['dropdown-header']} ${userSettingsOpen ? styles.open : ''}`}
              onClick={() => setUserSettingsOpen(!userSettingsOpen)}
            >
              <span>User Settings</span>
              <svg 
                className={`${styles['dropdown-chevron']} ${userSettingsOpen ? styles.open : ''}`}
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            {userSettingsOpen && (
              <ul className={styles['dropdown-menu']}>
                <li 
                  className={activePage === 'userList' ? styles.active : undefined}
                  onClick={() => setActivePage('userList')}
                >
                  View User List
                </li>
                <li 
                  className={activePage === 'addUser' ? styles.active : undefined}
                  onClick={() => setActivePage('addUser')}
                >
                  Add New User
                </li>
              </ul>
            )}
          </div>

          {/* Activity Logs */}
          <div className={styles['sidebar-item']}>
            <div 
              className={`${styles['sidebar-link']} ${activePage === 'activityLogs' ? styles.active : ''}`}
              onClick={() => setActivePage('activityLogs')}
            >
              <span>Activity Logs</span>
            </div>
          </div>

          {/* Roles & Permissions */}
          <div className={styles['sidebar-item']}>
            <div 
              className={`${styles['sidebar-link']} ${activePage === 'roles' ? styles.active : ''}`}
              onClick={() => setActivePage('roles')}
            >
              <span>Roles & Permissions</span>
            </div>
          </div>

          {/* Your Account Settings Dropdown */}
          <div className={styles['sidebar-dropdown']}>
            <div 
              className={`${styles['dropdown-header']} ${yourAccountOpen ? styles.open : ''}`}
              onClick={() => setYourAccountOpen(!yourAccountOpen)}
            >
              <span>Your Account Settings</span>
              <svg 
                className={`${styles['dropdown-chevron']} ${yourAccountOpen ? styles.open : ''}`}
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            {yourAccountOpen && (
              <ul className={styles['dropdown-menu']}>
                <li 
                  className={activePage === 'account' ? styles.active : undefined}
                  onClick={() => setActivePage('account')}
                >
                  Manage Account
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Main Content - Renders the selected page */}
        <div className={styles['account-main']}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

export default AccountManagement;