// Inventory.jsx
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { updateTimestamp } from '../utils/timeUtils'
import './Inventory.css'

const STORAGE_KEY = 'inventoryData'

const initialInventory = [
  {
    id: '1',
    productName: 'Tire Black Polish',
    category: 'Detailing',
    stockLevel: 12,
    unitPrice: 450.00,
    status: 'in-stock',
    lowStockThreshold: 5
  },
  {
    id: '2',
    productName: 'Nano Graphene Coating',
    category: 'Detailing',
    stockLevel: 2,
    unitPrice: 2000.00,
    status: 'low-stock',
    lowStockThreshold: 5
  }
]

function Inventory() {
  const [inventory, setInventory] = useState(() => {
    // Initialize from localStorage or use initialInventory
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Error parsing saved inventory:', e)
        return initialInventory
      }
    }
    return initialInventory
  })
  
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editItemId, setEditItemId] = useState(null)
  const [viewItem, setViewItem] = useState(null);

  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    stockLevel: '',
    unitPrice: ''
  })

  // Save to localStorage whenever inventory changes and notify Dashboard
  useEffect(() => {
    try {
      const savedStr = localStorage.getItem(STORAGE_KEY);
      const savedArr = savedStr ? JSON.parse(savedStr) : [];
      const changed = JSON.stringify(savedArr) !== JSON.stringify(inventory);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory))
      
      if (changed) {
        updateTimestamp('inventory');
      }

      window.dispatchEvent(new CustomEvent('inventoryUpdated'))
    } catch (e) {
      console.error('Error saving inventory to localStorage:', e)
    }
  }, [inventory])

  // Scroll-lock: disable body scroll when panel is open
  useEffect(() => {
    const isOpen = isModalOpen || !!viewItem;
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isModalOpen, viewItem]);

  const openCreateForm = () => {
    setEditItemId(null)
    setFormData({
      productName: '',
      category: '',
      stockLevel: '',
      unitPrice: ''
    })
    setIsModalOpen(true)
  }

  const openEditForm = (item) => {
    setEditItemId(item.id)
    setFormData({
      productName: item.productName,
      category: item.category,
      stockLevel: item.stockLevel,
      unitPrice: item.unitPrice
    })
    setIsModalOpen(true)
  }

  const openViewPanel = (item) => {
    setViewItem(item);
  };

  const closeModal = () => {
    setIsModalOpen(false)
    setEditItemId(null)
  }

  const closeViewPanel = () => {
    setViewItem(null);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault()

    if (!formData.productName.trim() || !formData.category.trim() || !formData.stockLevel || !formData.unitPrice) {
      alert('Please complete all fields.')
      return
    }

    const stockLevelNum = parseInt(formData.stockLevel)
    const unitPriceNum = parseFloat(formData.unitPrice)
    const lowStockThreshold = 5
    const status = stockLevelNum <= lowStockThreshold ? 'low-stock' : 'in-stock'

    if (editItemId) {
      setInventory((prev) =>
        prev.map((item) =>
          item.id === editItemId
            ? { 
                ...item, 
                productName: formData.productName,
                category: formData.category,
                stockLevel: stockLevelNum,
                unitPrice: unitPriceNum,
                status: status
              }
            : item
        )
      )
      setEditItemId(null)
    } else {
      const newItem = {
        id: Date.now().toString(),
        productName: formData.productName,
        category: formData.category,
        stockLevel: stockLevelNum,
        unitPrice: unitPriceNum,
        status: status,
        lowStockThreshold: 5
      }
      setInventory((prev) => [newItem, ...prev])
    }

    setIsModalOpen(false)
  }

  const handleDelete = (id, productName) => {
    if (window.confirm(`Are you sure you want to delete ${productName}?`)) {
      setInventory((prev) => prev.filter((item) => item.id !== id))
    }
  }

  const handleStockLevelChange = (id, increment) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStockLevel = increment ? item.stockLevel + 1 : Math.max(0, item.stockLevel - 1)
          const newStatus = newStockLevel <= item.lowStockThreshold ? 'low-stock' : 'in-stock'
          return { ...item, stockLevel: newStockLevel, status: newStatus }
        }
        return item
      })
    )
  }

  const filtered = inventory.filter((item) => {
    const term = search.toLowerCase()
    return (
      item.productName.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term)
    )
  })

  const totalItems = filtered.length
  const lowStockCount = filtered.filter(item => item.status === 'low-stock').length

  return (
    <div className="inventory-wrap">
      <h1>Inventory</h1>
      <div className="inventory-top">
        <div className="inventory-controls">
          <input
            className="inventory-search"
            placeholder="Search supplies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="primary-btn" onClick={openCreateForm}>Add Item</button>
        </div>
        <div className="inventory-stats">
          <span className="stat-badge">Total Items: {totalItems}</span>
          <span className="stat-badge low-stock-badge">Low Stock: {lowStockCount}</span>
        </div>
      </div>

      <table className="inventory-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Category</th>
            <th>Stock Level</th>
            <th>Unit Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((item) => (
            <tr key={item.id}>
              <td>{item.productName}</td>
              <td>{item.category}</td>
              <td>{item.stockLevel}</td>  
              <td>₱{item.unitPrice.toLocaleString()}</td>
              <td>
                <span className={`inventory-status ${item.status}`}>
                  {item.status === 'in-stock' ? 'In Stock' : 'Low Stock'}
                </span>
              </td>
              <td className="inventory-actions">
                <button className="view-btn" onClick={() => openViewPanel(item)}>View</button>
                <button className="link-btn" onClick={() => openEditForm(item)}>Edit</button>
                <button className="link-btn delete" onClick={() => handleDelete(item.id, item.productName)}>Delete</button>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                No items found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {viewItem && createPortal(
        <div className="modal-overlay" onClick={closeViewPanel}>
          <div className="modal detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-header">
              <h3>Item Details</h3>
              <button className="detail-close-btn" onClick={closeViewPanel}>✕</button>
            </div>
            <div className="detail-name">{viewItem.productName}</div>
            <div className="detail-role">{viewItem.category}</div>
            
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Stock Level</span>
                <span className="detail-value">{viewItem.stockLevel}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Unit Price</span>
                <span className="detail-value">₱{viewItem.unitPrice.toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status</span>
                <span className={`inventory-status ${viewItem.status}`}>
                  {viewItem.status === 'in-stock' ? 'In Stock' : 'Low Stock'}
                </span>
              </div>
            </div>

            <div className="detail-actions">
              <button className="submit-btn" onClick={() => { closeViewPanel(); openEditForm(viewItem); }}>
                Edit Item
              </button>
              <button className="cancel-btn" onClick={closeViewPanel}>
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {isModalOpen && createPortal(
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editItemId ? 'Edit Item' : 'Add Item'}</h3>
            <form onSubmit={handleFormSubmit} className="modal-form">
              <div className="modal-row">
                <label>Product Name</label>
                <input 
                  value={formData.productName} 
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })} 
                  placeholder="Product Name"
                  required 
                />
              </div>
              <div className="modal-row">
                <label>Category</label>
                <input 
                  value={formData.category} 
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
                  placeholder="Category"
                  required 
                />
              </div>
              <div className="modal-row">
                <label>Stock Level</label>
                <div className="stock-control-modal">
                  <button 
                    type="button"
                    className="stock-modal-btn"
                    onClick={() => setFormData({ ...formData, stockLevel: Math.max(0, (parseInt(formData.stockLevel) || 0) - 1) })}
                  >
                    −
                  </button>
                  <input 
                    type="number" 
                    value={formData.stockLevel} 
                    onChange={(e) => setFormData({ ...formData, stockLevel: e.target.value })}
                    required 
                    min="0"
                  />
                  <button 
                    type="button"
                    className="stock-modal-btn"
                    onClick={() => setFormData({ ...formData, stockLevel: (parseInt(formData.stockLevel) || 0) + 1 })}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="modal-row">
                <label>Unit Price</label>
                <div className="price-input-group">
                  <span className="price-prefix">₱</span>
                  <input 
                    type="number" 
                    value={formData.unitPrice} 
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    placeholder="0.00"
                    required 
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              <div className="buttons-row">
                <button type="submit" className="primary-btn">{editItemId ? 'Save Changes' : 'Add Item'}</button>
                <button type="button" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default Inventory