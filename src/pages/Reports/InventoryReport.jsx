// InventoryReport.jsx
import { useState, useEffect } from 'react';
import './InventoryReport.css';

const STORAGE_KEY = 'inventoryReportData';

// Initial inventory items based on the image
const initialInventory = [
  {
    id: '1',
    productName: 'Tire Black Polish',
    usedIn: 'Exterior Detailing',
    quantity: 12,
    unit: 'BOTTLES',
    lastUpdated: '2026-03-25'
  },
  {
    id: '2',
    productName: 'Microfiber Towels',
    usedIn: 'All Services',
    quantity: 8,
    unit: 'UNITS',
    lastUpdated: '2026-03-25'
  },
  {
    id: '3',
    productName: 'Car Shampoo',
    usedIn: '',
    quantity: 2,
    unit: 'GALLONS',
    lastUpdated: '2026-03-24'
  },
  {
    id: '4',
    productName: 'Glass Cleaner',
    usedIn: 'Interior Detailing',
    quantity: 15,
    unit: 'BOTTLES',
    lastUpdated: '2026-03-23'
  },
  {
    id: '5',
    productName: 'Wax Paste',
    usedIn: 'Exterior Detailing',
    quantity: 6,
    unit: 'CONTAINERS',
    lastUpdated: '2026-03-22'
  },
  {
    id: '6',
    productName: 'Interior Brush',
    usedIn: 'Interior Detailing',
    quantity: 10,
    unit: 'UNITS',
    lastUpdated: '2026-03-25'
  }
];

function InventoryReport() {
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_inventory`)
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
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showGraph, setShowGraph] = useState(true);

  const [formData, setFormData] = useState({
    productName: '',
    usedIn: '',
    quantity: '',
    unit: 'BOTTLES'
  });

  // Save to localStorage whenever inventory changes
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_inventory`, JSON.stringify(inventory))
    } catch (e) {
      console.error('Error saving inventory to localStorage:', e)
    }
  }, [inventory])

  // Get unique usedIn categories for filter
  const categories = ['All', ...new Set(inventory.map(item => item.usedIn).filter(cat => cat !== ''))];

  // Filter inventory based on search and category
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.usedIn && item.usedIn.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || item.usedIn === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Calculate summary statistics
  const totalProducts = inventory.length;
  const totalUnits = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockCount = inventory.filter(item => item.quantity <= 5).length;
  
  // Find max quantity for graph scaling
  const maxQuantity = Math.max(...inventory.map(item => item.quantity), 1);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      productName: '',
      usedIn: '',
      quantity: '',
      unit: 'BOTTLES'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      productName: item.productName,
      usedIn: item.usedIn || '',
      quantity: item.quantity.toString(),
      unit: item.unit
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.productName.trim() || !formData.quantity) {
      alert('Please fill in product name and quantity.');
      return;
    }

    const quantityNum = parseInt(formData.quantity);

    const newItem = {
      id: editingItem ? editingItem.id : Date.now().toString(),
      productName: formData.productName,
      usedIn: formData.usedIn,
      quantity: quantityNum,
      unit: formData.unit,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    if (editingItem) {
      setInventory(prev => prev.map(item => item.id === editingItem.id ? newItem : item));
    } else {
      // FIXED: Added to BOTTOM instead of TOP
      setInventory(prev => [newItem, ...prev]);  // ← Changed from [newItem, ...prev]
    }
    
    closeModal();
  };

  const handleDelete = (id, productName) => {
    if (window.confirm(`Are you sure you want to delete ${productName} from inventory?`)) {
      setInventory(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleStockUpdate = (id, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 0) return;
    
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          quantity: newQuantity,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return item;
    }));
  };

  const getStockStatus = (quantity) => {
    if (quantity <= 0) return 'out-of-stock';
    if (quantity <= 3) return 'critical';
    if (quantity <= 5) return 'low';
    return 'in-stock';
  };

  const getStatusText = (quantity) => {
    if (quantity <= 0) return 'Out of Stock';
    if (quantity <= 3) return 'Critical';
    if (quantity <= 5) return 'Low Stock';
    return 'In Stock';
  };

  const getBarColor = (quantity) => {
    if (quantity <= 3) return '#ef4444';
    if (quantity <= 5) return '#f59e0b';
    return '#10b981';
  };

  const currentDateTime = new Date();
  const formattedDate = currentDateTime.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
  const formattedTime = currentDateTime.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="inventory-report-wrap">
      {/* Header with timestamp */}
      <div className="report-header">
        <div>
          <div className="timestamp">
            Last Updated: {formattedDate} | {formattedTime}
          </div>
        </div>
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${showGraph ? 'active' : ''}`}
            onClick={() => setShowGraph(true)}
          >
            Bar Chart
          </button>
          <button 
            className={`toggle-btn ${!showGraph ? 'active' : ''}`}
            onClick={() => setShowGraph(false)}
          >
            Card View
          </button>
        </div>
      </div>

      {/* Search and Action Bar */}
      <div className="search-action-bar">
        <div className="search-wrapper">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="10" cy="10" r="7"/>
            <line x1="21" y1="21" x2="15" y2="15"/>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="category-filter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
          ))}
        </select>
        <button className="add-btn" onClick={openCreateModal}>
          + Add Product
        </button>
      </div>

      {/* Summary Stats */}
      <div className="summary-stats">
        <div className="stat-item">
          <span className="stat-label">Total Products:</span>
          <span className="stat-value">{totalProducts}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Units:</span>
          <span className="stat-value">{totalUnits}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Low Stock Items:</span>
          <span className="stat-value warning">{lowStockCount}</span>
        </div>
      </div>

      {/* Bar Graph Section - Canva Style */}
      {showGraph && (
        <div className="graph-section">
          <div className="graph-header">
            <h3>Stock Level Overview</h3>
            <p className="graph-subtitle">Current inventory quantities by product</p>
          </div>
          <div className="bar-chart">
            {filteredInventory.map((item) => {
              const barWidth = (item.quantity / maxQuantity) * 100;
              const barColor = getBarColor(item.quantity);
              return (
                <div key={item.id} className="bar-item">
                  <div className="bar-label">
                    <span className="bar-product">{item.productName}</span>
                    <span className="bar-value">{item.quantity} {item.unit}</span>
                  </div>
                  <div className="bar-track">
                    <div 
                      className="bar-fill"
                      style={{ 
                        width: `${barWidth}%`,
                        backgroundColor: barColor,
                        transition: 'width 0.5s ease'
                      }}
                    >
                      <span className="bar-percentage">{Math.round(barWidth)}%</span>
                    </div>
                  </div>
                  <div className="bar-meta">
                    <span className="bar-category">{item.usedIn || 'All Services'}</span>
                    <span className={`bar-status ${getStockStatus(item.quantity)}`}>
                      {getStatusText(item.quantity)}
                    </span>
                  </div>
                </div>
              );
            })}
            {filteredInventory.length === 0 && (
              <div className="empty-graph">
                <p>No inventory items to display</p>
              </div>
            )}
          </div>
          
          {/* Graph Legend */}
          <div className="graph-legend">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#10b981' }}></div>
              <span>Healthy Stock (&gt;5)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#f59e0b' }}></div>
              <span>Low Stock (3-5)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#ef4444' }}></div>
              <span>Critical (&lt;3)</span>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Cards - Styled like the image */}
      {!showGraph && (
        <div className="inventory-cards">
          {filteredInventory.map((item) => (
            <div key={item.id} className="inventory-card">
              <div className="card-header">
                <h3 className="product-name">{item.productName}</h3>
                <div className="card-actions">
                  <button className="card-edit-btn" onClick={() => openEditModal(item)}>✎</button>
                  <button className="card-delete-btn" onClick={() => handleDelete(item.id, item.productName)}>×</button>
                </div>
              </div>
              <div className="used-in">
                {item.usedIn ? (
                  <>Used in: <span className="used-in-value">{item.usedIn}</span></>
                ) : (
                  <span className="used-in-empty">—</span>
                )}
              </div>
              <div className="quantity-section">
                <div className="quantity-label">{item.unit}</div>
                <div className="quantity-value-wrapper">
                  <button 
                    className="quantity-btn minus"
                    onClick={() => handleStockUpdate(item.id, item.quantity, -1)}
                    disabled={item.quantity <= 0}
                  >
                    −
                  </button>
                  <span className={`quantity-number ${getStockStatus(item.quantity)}`}>
                    {item.quantity}
                  </span>
                  <button 
                    className="quantity-btn plus"
                    onClick={() => handleStockUpdate(item.id, item.quantity, 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="stock-status">
                <span className={`stock-badge ${getStockStatus(item.quantity)}`}>
                  {getStatusText(item.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingItem ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleFormSubmit} className="modal-form">
              <div className="form-group">
                <label>Product Name *</label>
                <input 
                  type="text" 
                  value={formData.productName} 
                  onChange={(e) => setFormData({...formData, productName: e.target.value})}
                  placeholder="e.g., Tire Black Polish"
                  required
                />
              </div>

              <div className="form-group">
                <label>Used In</label>
                <input 
                  type="text" 
                  value={formData.usedIn} 
                  onChange={(e) => setFormData({...formData, usedIn: e.target.value})}
                  placeholder="e.g., Exterior Detailing"
                />
                <small>Leave empty if used in multiple services</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Quantity *</label>
                  <input 
                    type="number" 
                    value={formData.quantity} 
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    placeholder="0"
                    required 
                    min="0"
                    step="1"
                  />
                </div>
                <div className="form-group">
                  <label>Unit *</label>
                  <select 
                    value={formData.unit} 
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  >
                    <option value="BOTTLES">BOTTLES</option>
                    <option value="UNITS">UNITS</option>
                    <option value="GALLONS">GALLONS</option>
                    <option value="CONTAINERS">CONTAINERS</option>
                    <option value="PIECES">PIECES</option>
                    <option value="ROLLS">ROLLS</option>
                    <option value="SETS">SETS</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="submit-btn">
                  {editingItem ? 'Save Changes' : 'Add Product'}
                </button>
                <button type="button" className="cancel-btn" onClick={closeModal}>
                  Cancel
                </button>
                {editingItem && (
                  <button 
                    type="button" 
                    className="delete-btn"
                    onClick={() => {
                      if (window.confirm(`Delete ${editingItem.productName} from inventory?`)) {
                        handleDelete(editingItem.id, editingItem.productName);
                        closeModal();
                      }
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryReport;