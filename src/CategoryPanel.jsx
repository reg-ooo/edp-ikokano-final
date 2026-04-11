import { lazy, Suspense } from 'react'
import './CategoryPanel.css'

// Lazy load page components
const Payroll = lazy(() => import('./pages/Payroll'))

// Map component names to actual components
const componentMap = {
  'Payroll': Payroll
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