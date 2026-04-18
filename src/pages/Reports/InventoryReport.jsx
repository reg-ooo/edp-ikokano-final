// InventoryReport.jsx
import { useState, useEffect } from 'react';
import LastUpdated from '../../components/LastUpdated';
import './InventoryReport.css';

const STORAGE_KEY = 'inventoryData';

function InventoryReport() {
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Error parsing saved inventory:', e)
        return []
      }
    }
    return []
  })
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showGraph, setShowGraph] = useState(true);

  // Sync report when the inventory page updates shared storage
  useEffect(() => {
    const handleInventoryUpdated = () => {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          setInventory(JSON.parse(saved))
        } catch (e) {
          console.error('Error parsing inventory update:', e)
        }
      }
    }

    window.addEventListener('inventoryUpdated', handleInventoryUpdated)
    return () => window.removeEventListener('inventoryUpdated', handleInventoryUpdated)
  }, [])

  // Get unique categories for filter
  const categories = ['All', ...new Set(inventory.map(item => item.category || '').filter(cat => cat !== ''))];

  // Filter inventory based on search and category
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Calculate summary statistics
  const totalProducts = inventory.length;
  const totalUnits = inventory.reduce((sum, item) => sum + (item.stockLevel || 0), 0);
  const lowStockCount = inventory.filter(item => (item.stockLevel || 0) <= 5).length;
  
  // Find max quantity for graph scaling
  const maxQuantity = Math.max(...inventory.map(item => item.stockLevel || 0), 1);

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

  return (
    <div className="inventory-report-wrap">
      <h1>Inventory Report</h1>
      {/* Header with timestamp */}
      <div className="report-header">
        <div>
          <div className="timestamp">
            <LastUpdated storageKey="inventory" />
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
              const quantity = item.stockLevel || 0;
              const barWidth = (quantity / maxQuantity) * 100;
              const barColor = getBarColor(quantity);
              return (
                <div key={item.id} className="bar-item">
                  <div className="bar-label">
                    <span className="bar-product">{item.productName}</span>
                    <span className="bar-value">{quantity} {item.unit || 'UNITS'}</span>
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
                    <span className="bar-category">{item.category || 'All Services'}</span>
                    <span className={`bar-status ${getStockStatus(quantity)}`}>
                      {getStatusText(quantity)}
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
          {filteredInventory.map((item) => {
            const quantity = item.stockLevel || 0;
            return (
              <div key={item.id} className="inventory-card">
                <div className="card-header">
                  <h3 className="product-name">{item.productName}</h3>
                </div>
                <div className="used-in">
                  {item.category ? (
                    <>Used in: <span className="used-in-value">{item.category}</span></>
                  ) : (
                    <span className="used-in-empty">—</span>
                  )}
                </div>
                <div className="quantity-section">
                  <div className="quantity-label">{item.unit || 'UNITS'}</div>
                  <div className="quantity-value-wrapper">
                    <span className={`quantity-number ${getStockStatus(quantity)}`}>
                      {quantity}
                    </span>
                  </div>
                </div>
                <div className="stock-status">
                  <span className={`stock-badge ${getStockStatus(quantity)}`}>
                    {getStatusText(quantity)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

    </div>
  );
}

export default InventoryReport;