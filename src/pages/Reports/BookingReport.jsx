// BookingReport.jsx
import { useState, useEffect } from 'react';
import './BookingReport.css';

const STORAGE_KEY = 'manageBookingsData';

const serviceOptions = ['All Services', 'Premium Wash', 'Basic Exterior', 'Deluxe Wash', 'Basic Wash'];

function BookingReport() {
  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        // Map ManageBookings data to BookingReport format
        return data.map(b => ({
          id: b.id,
          refNumber: b.id,
          status: b.status ? b.status.toUpperCase() === 'IN-PROGRESS' ? 'IN PROGRESS' : b.status.toUpperCase() : 'PENDING',
          customerName: b.name || '',
          vehicle: b.vehicleModel ? `${b.vehicleBrand} ${b.vehicleModel}` : b.details || '',
          serviceDetails: b.serviceAvails || b.service || '',
          assignedStaff: 'Unassigned',
          startTime: '',
          endTime: '',
          duration: '30 mins',
          amount: 0,
          paymentMethod: 'Cash'
        }))
      } catch (e) {
        console.error('Error parsing saved bookings:', e)
        return []
      }
    }
    return []
  })
  
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState('All Services');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);

  const [formData, setFormData] = useState({
    refNumber: '',
    status: 'PENDING',
    customerName: '',
    vehicle: '',
    serviceDetails: '',
    assignedStaff: '',
    startTime: '',
    endTime: '',
    duration: '',
    amount: '',
    paymentMethod: 'Cash'
  });

  // Refresh bookings when ManageBookings data changes (via storage event listener)
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const data = JSON.parse(saved)
          const mapped = data.map(b => ({
            id: b.id,
            refNumber: b.id,
            status: b.status ? b.status.toUpperCase() === 'IN-PROGRESS' ? 'IN PROGRESS' : b.status.toUpperCase() : 'PENDING',
            customerName: b.name || '',
            vehicle: b.vehicleModel ? `${b.vehicleBrand} ${b.vehicleModel}` : b.details || '',
            serviceDetails: b.serviceAvails || b.service || '',
            assignedStaff: 'Unassigned',
            startTime: '',
            endTime: '',
            duration: '30 mins',
            amount: 0,
            paymentMethod: 'Cash'
          }))
          setBookings(mapped)
        } catch (e) {
          console.error('Error parsing saved bookings:', e)
        }
      }
    }

    // Listen for storage changes from other tabs/windows
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Sync with ManageBookings data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const data = JSON.parse(saved)
          const mapped = data.map(b => ({
            id: b.id,
            refNumber: b.id,
            status: b.status ? b.status.toUpperCase() === 'IN-PROGRESS' ? 'IN PROGRESS' : b.status.toUpperCase() : 'PENDING',
            customerName: b.name || '',
            vehicle: b.vehicleModel ? `${b.vehicleBrand} ${b.vehicleModel}` : b.details || '',
            serviceDetails: b.serviceAvails || b.service || '',
            assignedStaff: 'Unassigned',
            startTime: '',
            endTime: '',
            duration: '30 mins',
            amount: 0,
            paymentMethod: 'Cash'
          }))
          setBookings(mapped)
        } catch (e) {
          console.error('Error syncing bookings:', e)
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Calculate summary metrics
  const todayBookings = bookings.length;
  const netRevenue = bookings.reduce((sum, booking) => sum + booking.amount, 0);
  const activeBay = `${bookings.filter(b => b.status === 'IN PROGRESS').length}/5`;
  
  // Calculate average wait time (simplified - based on pending/waiting bookings)
  const waitingBookings = bookings.filter(b => b.status === 'WAITING' || b.status === 'PENDING');
  const avgWaitTime = waitingBookings.length > 0 ? '15 mins' : '0 mins';

  // Filter bookings based on search and service filter
  const filteredBookings = bookings.filter(booking => {
    // Search by name or plate
    const matchesSearch = searchTerm === '' || 
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.refNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by service
    const matchesService = serviceFilter === 'All Services' || 
      booking.serviceDetails.includes(serviceFilter);
    
    return matchesSearch && matchesService;
  });

  const openCreateModal = () => {
    setEditingBooking(null);
    setFormData({
      refNumber: `#${String(bookings.length + 1).padStart(4, '0')}`,
      status: 'PENDING',
      customerName: '',
      vehicle: '',
      serviceDetails: '',
      assignedStaff: '',
      startTime: '',
      endTime: '',
      duration: '',
      amount: '',
      paymentMethod: 'Cash'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (booking) => {
    setEditingBooking(booking);
    setFormData({
      refNumber: booking.refNumber,
      status: booking.status,
      customerName: booking.customerName,
      vehicle: booking.vehicle,
      serviceDetails: booking.serviceDetails,
      assignedStaff: booking.assignedStaff,
      startTime: booking.startTime,
      endTime: booking.endTime,
      duration: booking.duration,
      amount: booking.amount.toString(),
      paymentMethod: booking.paymentMethod
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBooking(null);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.customerName.trim() || !formData.vehicle.trim() || !formData.serviceDetails.trim() || !formData.amount) {
      alert('Please fill in all required fields.');
      return;
    }

    const amountNum = parseFloat(formData.amount);
    const newBooking = {
      id: editingBooking ? editingBooking.id : Date.now().toString(),
      refNumber: formData.refNumber,
      status: formData.status,
      customerName: formData.customerName,
      vehicle: formData.vehicle,
      serviceDetails: formData.serviceDetails,
      assignedStaff: formData.assignedStaff || 'Unassigned',
      startTime: formData.startTime,
      endTime: formData.endTime,
      duration: formData.duration || '--',
      amount: amountNum,
      paymentMethod: formData.paymentMethod
    };

    if (editingBooking) {
      setBookings(prev => prev.map(b => b.id === editingBooking.id ? newBooking : b));
    } else {
      // FIXED: Added to BOTTOM instead of TOP
      setBookings(prev => [...prev, newBooking]);  // ← Changed from [newBooking, ...prev]
    }
    
    closeModal();
  };

  const handleDelete = (id, customerName) => {
    if (window.confirm(`Are you sure you want to delete booking for ${customerName}?`)) {
      setBookings(prev => prev.filter(booking => booking.id !== id));
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'COMPLETED': return 'status-completed';
      case 'IN PROGRESS': return 'status-progress';
      case 'PENDING': return 'status-pending';
      case 'WAITING': return 'status-waiting';
      default: return '';
    }
  };

  return (
    <div className="booking-report-wrap">
      {/* Header Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <h4>TODAY'S BOOKINGS</h4>
          <p className="summary-number">{todayBookings}</p>
        </div>
        <div className="summary-card">
          <h4>NET REVENUE</h4>
          <p className="summary-number">₱{netRevenue.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h4>ACTIVE BAY</h4>
          <p className="summary-number">{activeBay}</p>
        </div>
        <div className="summary-card">
          <h4>AVG. WAIT TIME</h4>
          <p className="summary-number">{avgWaitTime}</p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-wrapper">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="10" cy="10" r="7"/>
            <line x1="21" y1="21" x2="15" y2="15"/>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search by name or plate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="service-filter"
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
        >
          {serviceOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        {/* Note: Create booking via Manage Bookings */}
      </div>

      {/* Bookings Table */}
      <div className="table-container">
        <table className="bookings-table">
          <thead>
            <tr>
              <th>REF & STATUS</th>
              <th>CUSTOMER & VEHICLE</th>
              <th>SERVICE DETAILS</th>
              <th>ASSIGNED STAFF</th>
              <th>DURATION</th>
              <th>FINANCIALS</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.id}>
                <td className="ref-cell">
                  <div className="ref-number">{booking.refNumber}</div>
                  <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="customer-cell">
                  <div className="customer-name">{booking.customerName}</div>
                  <div className="vehicle-plate">{booking.vehicle}</div>
                </td>
                <td className="service-cell">{booking.serviceDetails}</td>
                <td className="staff-cell">{booking.assignedStaff}</td>
                <td className="duration-cell">
                  {booking.duration}<br/>
                  {booking.startTime && <span className="time-range">{booking.startTime} - {booking.endTime || '--'}</span>}
                </td>
                <td className="financials-cell">
                  ₱{booking.amount.toLocaleString()}<br/>
                  <span className="payment-method">{booking.paymentMethod}</span>
                </td>
                <td className="action-cell">
                  {/* Use Manage Bookings to edit */}
                </td>
              </tr>
            ))}
            {filteredBookings.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-state">
                  <div className="empty-message">No bookings found</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingBooking ? 'Edit Booking' : 'New Booking'}</h3>
            <form onSubmit={handleFormSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Reference Number</label>
                  <input 
                    type="text" 
                    value={formData.refNumber} 
                    onChange={(e) => setFormData({...formData, refNumber: e.target.value})}
                    readOnly={!editingBooking}
                    className={!editingBooking ? 'readonly-input' : ''}
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="WAITING">Waiting</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Customer Name *</label>
                  <input 
                    type="text" 
                    value={formData.customerName} 
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Vehicle (Plate/Model) *</label>
                  <input 
                    type="text" 
                    value={formData.vehicle} 
                    onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
                    placeholder="e.g., Toyota Fortuner (ABC1234)"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Service Details *</label>
                  <input 
                    type="text" 
                    value={formData.serviceDetails} 
                    onChange={(e) => setFormData({...formData, serviceDetails: e.target.value})}
                    placeholder="e.g., Premium Wash, Basic Exterior"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Assigned Staff</label>
                  <input 
                    type="text" 
                    value={formData.assignedStaff} 
                    onChange={(e) => setFormData({...formData, assignedStaff: e.target.value})}
                    placeholder="Staff name"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input 
                    type="time" 
                    value={formData.startTime} 
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input 
                    type="time" 
                    value={formData.endTime} 
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input 
                    type="text" 
                    value={formData.duration} 
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="e.g., 30 mins"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Amount (₱) *</label>
                  <div className="amount-input-wrapper">
                    <input 
                      type="number" 
                      value={formData.amount} 
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      placeholder="0.00"
                      required 
                      step="0.01"
                      min="0"
                      className="amount-input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Payment Method</label>
                  <select 
                    value={formData.paymentMethod} 
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                  >
                    <option value="Cash">Cash</option>
                    <option value="GCash">GCash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="primary-btn">
                  {editingBooking ? 'Save Changes' : 'Create Booking'}
                </button>
                <button type="button" className="secondary-btn" onClick={closeModal}>
                  Cancel
                </button>
                {editingBooking && (
                  <button 
                    type="button" 
                    className="delete-btn"
                    onClick={() => {
                      if (window.confirm(`Delete booking for ${editingBooking.customerName}?`)) {
                        handleDelete(editingBooking.id, editingBooking.customerName);
                        closeModal();
                      }
                    }}
                  >
                    Delete Booking
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

export default BookingReport;