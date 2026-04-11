import { useState } from 'react'
import notificationIcon from './assets/notification.svg'
import profileIcon from './assets/user.svg'
import hamburgerIcon from './assets/hamburger.svg'
import './Header.css'

function Header({ isOpen, setOpen }) {
  const [notifications, setNotifications] = useState(0)

  const handleNotificationClick = () => {
    console.log('Notifications clicked')
  }

  const handleProfileClick = () => {
    console.log('Profile clicked')
  }

  return (
    <header className="header">
      <button
        onClick={() => setOpen(!isOpen)} 
        className="hamburger-btn"
        aria-label="Menu"
        title="Toggle Menu"
      >
        <img src={hamburgerIcon} alt="Menu" />
      </button>
      <div className="icon-container">
        <button
          className="icon-button"
          onClick={handleNotificationClick}
          aria-label="Notifications"
          title="Notifications"
        >
          <img src={notificationIcon} alt="Notifications" />
          {notifications > 0 && (
            <span style={{
              position: 'absolute',
              top: '0.25rem',
              right: '0.25rem',
              backgroundColor: '#ff4444',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }}>
              {notifications}
            </span>
          )}
        </button>

        <button
          className="icon-button"
          onClick={handleProfileClick}
          aria-label="Profile"
          title="Profile"
        >
          <img src={profileIcon} alt="Profile" />
        </button>
      </div>
    </header>
  )
}

export default Header