import { lazy, Suspense } from 'react'
import './CategoryPanel.css'

// Lazy load page components
const Payroll = lazy(() => import('./pages/Payroll'))
const ManageBookings = lazy(() => import('./pages/Bookings/ManageBookings'))
const ManageServices = lazy(() => import('./pages/Bookings/ManageServices'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Inventory = lazy(() => import('./pages/Inventory'))
const InventoryReport = lazy(() => import('./pages/Reports/InventoryReport'))
const AccountManagement = lazy(() => import('./pages/AccountManagement/AccountManagement'))

// Map component names to actual components
const componentMap = {
  'Payroll': Payroll,
  'Bookings/ManageBookings': ManageBookings,
  'Bookings/ManageServices': ManageServices,
  'Dashboard': Dashboard,
  'Inventory': Inventory,
  'Reports/InventoryReport': InventoryReport,
  'InventoryReport': InventoryReport,
  'AccountManagement': AccountManagement
}

function CategoryPanel({ category, onBack, isMobilePanelOpen, isOpen }) {
  if (!category) return null;

  const Component = componentMap[category.component] || null

  const panelClass = `category-panel ${isOpen ? 'menu-open' : ''} ${isMobilePanelOpen ? 'open-mobile' : ''}`
  return (
    <div className={panelClass}>
      <button className="mobile-back-btn" onClick={onBack}>
        ← Back to Menu
      </button>
      <div className="category-content">
        {Component ? (
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <Component />
          </Suspense>
        ) : (
          <p>{category.content || 'Content not available'}</p>
        )}
      </div>
    </div>
  )
}

export default CategoryPanel