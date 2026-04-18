import { useState } from 'react'
import styles from './Menu.module.css'
import logoPlaceholder from './assets/logo-placeholder.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faHandHoldingDollar,
  faCalendarDays,
  faChartLine,
  faChevronDown,
  faWarehouse,
  faBox,
  faBook,
  faHandsHelping,
  faChartSimple
} from '@fortawesome/free-solid-svg-icons'

// Map categories to icons
const getCategoryIcon = (categoryId) => {
  const iconMap = {
    'dashboard': faChartSimple,
    'payroll': faHandHoldingDollar,
    'bookings': faCalendarDays,
    'inventory': faBox,
    'reports': faChartLine
  }
  return iconMap[categoryId] || faHandHoldingDollar
}

const getSubmenuIcon = (submenuId) => {
  const iconMap = {
    'booking-report': faBook,
    'financial-report': faChartLine,
    'inventory-report': faWarehouse,
    'staff-report': faChartSimple,
    'manage-bookings': faBook,
    'manage-services': faHandsHelping
  }
  return iconMap[submenuId] || faChartLine
}

function Menu({ isOpen, categories = [], selectedCategory, onCategorySelect, setOpen }) {
    const [expandedDropdown, setExpandedDropdown] = useState(null)

    const handleDropdownClick = (id) => {
        setExpandedDropdown(expandedDropdown === id ? null : id)
    }

    const handleItemClick = (id) => {
        onCategorySelect(id)
        setExpandedDropdown(null)
    }

    const handleSubmenuClick = (id) => {
        onCategorySelect(id)
    }

    return(
        <>
         <div className={`${styles.menu} ${isOpen ? styles.open : ''}`}>
            <div className={styles.menuHeader}>
              <div className={styles.logo}>
                <img src={logoPlaceholder} alt="Logo" />
              </div>
            </div>
            <ul className={styles.categoryList}>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    {cat.hasDropdown ? (
                      <>
                        <button 
                          className={`${styles.categoryBtn} ${styles.dropdownToggle}`}
                          onClick={() => handleDropdownClick(cat.id)}
                        >
                          <span className={styles.btnContent}>
                            <FontAwesomeIcon 
                              icon={getCategoryIcon(cat.id)} 
                              className={styles.icon}
                            />
                            <span>{cat.label}</span>
                          </span>
                          <FontAwesomeIcon 
                            icon={faChevronDown} 
                            className={`${styles.chevron} ${expandedDropdown === cat.id ? styles.expanded : ''}`}
                          />
                        </button>
                        {expandedDropdown === cat.id && (
                          <ul className={styles.submenu}>
                            {cat.submenu.map((item) => (
                              <li key={item.id}>
                                <button
                                  className={`${styles.submenuBtn} ${selectedCategory === item.id ? styles.active : ''}`}
                                  onClick={() => handleSubmenuClick(item.id)}
                                >
                                  <span className={styles.btnContent}>
                                    <FontAwesomeIcon 
                                      icon={getSubmenuIcon(item.id)} 
                                      className={styles.submenuIcon}
                                    />
                                    <span>{item.label}</span>
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <button 
                        className={`${styles.categoryBtn} ${selectedCategory === cat.id ? styles.active : ''}`}
                        onClick={() => handleItemClick(cat.id)}
                      >
                        <span className={styles.btnContent}>
                          <FontAwesomeIcon 
                            icon={getCategoryIcon(cat.id)} 
                            className={styles.icon}
                          />
                          <span>{cat.label}</span>
                        </span>
                      </button>
                    )}
                  </li>
                ))}
            </ul>
         </div>
        </>
    )
}

export default Menu;