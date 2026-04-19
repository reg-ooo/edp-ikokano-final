import { useState, useEffect } from 'react'
import notificationIcon from './assets/notification.svg'
import hamburgerIcon from './assets/hamburger.svg'
import './Header.css'

const INVENTORY_STORAGE_KEY = 'inventoryData'

function Header({ isOpen, setOpen }) {
  const [notifications, setNotifications] = useState(0)
  const [showBanner, setShowBanner] = useState(false)
  const [lowStockItems, setLowStockItems] = useState([])

  // Check inventory for low stock on mount and when it updates
  useEffect(() => {
    const checkLowStock = () => {
      const saved = localStorage.getItem(INVENTORY_STORAGE_KEY)
      if (saved) {
        try {
          const inventory = JSON.parse(saved)
          const low = inventory.filter(item => item.stockLevel < item.lowStockThreshold)
          setLowStockItems(low)
          setNotifications(low.length)
        } catch (e) {
          console.error('Error checking inventory:', e)
        }
      }
    }

    // Check on mount
    checkLowStock()

    // Listen for inventory updates
    window.addEventListener('inventoryUpdated', checkLowStock)
    
    return () => window.removeEventListener('inventoryUpdated', checkLowStock)
  }, [])

  const handleNotificationClick = () => {
    setShowBanner(!showBanner)
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
        <div style={{ position: 'relative' }}>
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
          
          {showBanner && lowStockItems.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              marginTop: '8px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffc107',
              color: '#856404',
              padding: '12px 16px',
              fontSize: '14px',
              borderRadius: '4px',
              minWidth: '300px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              zIndex: 1000
            }}>
              ⚠️ Low Stock Alert: {lowStockItems.length} item(s) running low
              {lowStockItems.map(item => (
                <div key={item.id} style={{ marginTop: '4px', fontSize: '12px' }}>
                  • {item.productName}: {item.stockLevel}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header