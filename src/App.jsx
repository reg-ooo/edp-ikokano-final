import { useState, useEffect } from 'react'
import './App.css'
import Menu from './Menu.jsx'
import Header from './Header.jsx'
import CategoryPanel from './CategoryPanel.jsx'
import { categories } from './config/menuConfig.js'

function App() {
  const [isOpen, setOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false)

  // Default to first category on mount
  useEffect(() => {
    setSelectedCategory(categories[0].id)
  }, [])

  // Handle menu closing
  useEffect(() => {
    if (!isOpen) {
      setIsMobilePanelOpen(false)
    }
  }, [isOpen])

  const handleCategorySelect = (id) => {
    setSelectedCategory(id)
    setIsMobilePanelOpen(true)
  }

  const handleBackToMenu = () => {
    setIsMobilePanelOpen(false)
  }

  let activeCategory = categories.find(c => c.id === selectedCategory)
  if (!activeCategory) {
    for (let cat of categories) {
      if (cat.submenu) {
        const found = cat.submenu.find(s => s.id === selectedCategory)
        if (found) {
          activeCategory = found
          break
        }
      }
    }
  }

  return (
    <>
      <div className={`header-container ${isOpen ? 'sidebar-open' : ''}`}>
        <Header isOpen={isOpen} setOpen={setOpen} />
      </div>

      <div className={`menu-container ${isMobilePanelOpen ? 'mobile-panel-open' : ''}`}>
        <Menu 
          isOpen={isOpen}
          setOpen={setOpen}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />
        {activeCategory && (
          <CategoryPanel 
            category={activeCategory} 
            onBack={handleBackToMenu}
            isMobilePanelOpen={isMobilePanelOpen}
            isOpen={isOpen}
          />
        )}
      </div>
    </>
  )
}

export default App
