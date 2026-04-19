// BookingReport.jsx
import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import './BookingReport.css';

const STORAGE_KEY = 'manageBookingsData';
const SERVICES_STORAGE_KEY = 'manageServicesList';
const STAFF_STORAGE_KEY = 'staffReportData';

function BookingReport() {
  const [rawBookings, setRawBookings] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Error parsing saved bookings:', e)
      }
    }
    return []
  })

  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem(SERVICES_STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Error parsing saved services:', e)
      }
    }
    return []
  })

  const [staff, setStaff] = useState(() => {
    const saved = localStorage.getItem(STAFF_STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Error parsing saved staff:', e)
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

  const parseServiceAmount = (text = '') => {
    const match = text.match(/₱\s*([\d,]+(?:\.\d+)?)/)
    if (match) {
      return parseFloat(match[1].replace(/,/g, ''))
    }
    const digits = text.replace(/[^\d.]/g, '')
    return digits ? parseFloat(digits) : 0
  }

  // Scroll-lock: disable body scroll when panel is open
  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isModalOpen]);

  const findService = (serviceName) => {
    return services.find((s) => s.serviceName === serviceName)
  }

  const mapBookingEntry = (booking) => {
    const serviceName = booking.serviceAvails || (booking.service || '').split(' - ₱')[0] || ''
    const service = findService(serviceName)
    const amount = parseServiceAmount(booking.service || serviceName) || Number(service?.servicePrice || 0)

    // Resolve assigned staff
    let assignedStaffDisplay = 'Unassigned'
    if (booking.assignedStaff) {
      const staffMember = staff.find(s => s.id === booking.assignedStaff)
      if (staffMember) {
        assignedStaffDisplay = `${staffMember.name} (${staffMember.position})`
      } else {
        // Fallback if staff not found
        assignedStaffDisplay = booking.assignedStaff
      }
    }

    return {
      id: booking.id,
      refNumber: booking.id,
      status: booking.status
        ? booking.status.toUpperCase() === 'IN-PROGRESS'
          ? 'IN PROGRESS'
          : booking.status.toUpperCase()
        : 'PENDING',
      customerName: booking.name || '',
      vehicle: booking.vehicleModel
        ? `${booking.vehicleBrand} ${booking.vehicleModel}`
        : booking.details || '',
      serviceDetails: serviceName || 'Unknown Service',
      assignedStaff: assignedStaffDisplay,
      startTime: booking.startTime || '',
      endTime: booking.endTime || '',
      duration: service?.duration || booking.duration || '--',
      amount,
      paymentMethod: booking.paymentMethod || 'Cash',
      serviceDate: booking.serviceDate || ''
    }
  }

  const bookings = useMemo(() => rawBookings.map(mapBookingEntry), [rawBookings, services, staff])

  const serviceOptions = ['All Services', ...new Set(services.map((s) => s.serviceName))]

  useEffect(() => {
    const saved = localStorage.getItem(SERVICES_STORAGE_KEY)
    if (saved) {
      try {
        setServices(JSON.parse(saved))
      } catch (e) {
        console.error('Error parsing saved services:', e)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rawBookings))
  }, [rawBookings])

  useEffect(() => {
    const handleStorageChange = () => {
      const savedBookings = localStorage.getItem(STORAGE_KEY)
      const savedServices = localStorage.getItem(SERVICES_STORAGE_KEY)
      const savedStaff = localStorage.getItem(STAFF_STORAGE_KEY)

      if (savedBookings) {
        try {
          setRawBookings(JSON.parse(savedBookings))
        } catch (e) {
          console.error('Error parsing bookings from storage event:', e)
        }
      }

      if (savedServices) {
        try {
          setServices(JSON.parse(savedServices))
        } catch (e) {
          console.error('Error parsing services from storage event:', e)
        }
      }

      if (savedStaff) {
        try {
          setStaff(JSON.parse(savedStaff))
        } catch (e) {
          console.error('Error parsing staff from storage event:', e)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)

    const interval = setInterval(handleStorageChange, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  const formatWaitTime = (minutes) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = Math.round(minutes % 60)
      return `${hours}h ${remainingMinutes}m`
    }
    return `${Math.round(minutes)} mins`
  }

  const todayBookings = bookings.length
  const netRevenue = bookings.reduce((sum, booking) => sum + booking.amount, 0)
  const activeBay = `${bookings.filter((b) => b.status === 'IN PROGRESS').length}/5`

  const waitingBookings = bookings.filter((b) => b.status === 'PENDING')
  const avgWaitTime = waitingBookings.length
    ? formatWaitTime(
        waitingBookings.reduce((sum, booking) => {
          if (!booking.serviceDate) return sum
          const diff = Math.max(0, new Date() - new Date(booking.serviceDate))
          return sum + diff / 60000
        }, 0) / waitingBookings.length
      )
    : '0 mins'

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      searchTerm === '' ||
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.refNumber.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesService =
      serviceFilter === 'All Services' || booking.serviceDetails === serviceFilter

    return matchesSearch && matchesService
  })

  const openCreateModal = () => {
    setEditingBooking(null)
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
    })
    setIsModalOpen(true)
  }

  const openEditModal = (booking) => {
    setEditingBooking(booking)
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
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingBooking(null)
  }

  const handleServiceSelection = (value) => {
    const service = findService(value)
    setFormData((prev) => ({
      ...prev,
      serviceDetails: value,
      amount: service ? service.servicePrice : prev.amount,
      duration: service ? service.duration : prev.duration
    }))
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()

    if (!formData.customerName.trim() || !formData.vehicle.trim() || !formData.serviceDetails.trim() || !formData.amount) {
      alert('Please fill in all required fields.')
      return
    }

    const amountNum = parseFloat(formData.amount)
    const servicePrice = Number(findService(formData.serviceDetails)?.servicePrice || amountNum || 0)

    const newBooking = {
      id: editingBooking ? editingBooking.id : Date.now().toString(),
      serviceDate: editingBooking?.serviceDate || '',
      status: formData.status,
      name: formData.customerName,
      vehicle: formData.vehicle,
      serviceAvails: formData.serviceDetails,
      service: `${formData.serviceDetails} - ₱${servicePrice}`,
      assignedStaff: formData.assignedStaff || 'Unassigned',
      startTime: formData.startTime,
      endTime: formData.endTime,
      duration: formData.duration || findService(formData.serviceDetails)?.duration || '--',
      amount: servicePrice,
      paymentMethod: formData.paymentMethod
    }

    if (editingBooking) {
      setRawBookings((prev) => prev.map((b) => (b.id === editingBooking.id ? newBooking : b)))
    } else {
      setRawBookings((prev) => [newBooking, ...prev])
    }

    closeModal()
  }

  const handleDelete = (id, customerName) => {
    if (window.confirm(`Are you sure you want to delete booking for ${customerName}?`)) {
      setRawBookings((prev) => prev.filter((booking) => booking.id !== id))
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'status-completed'
      case 'IN PROGRESS':
        return 'status-progress'
      case 'PENDING':
        return 'status-pending'
      case 'WAITING':
        return 'status-waiting'
      default:
        return ''
    }
  }


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
      {isModalOpen && createPortal(
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
                  <label>Service *</label>
                  {services.length > 0 ? (
                    <select
                      value={formData.serviceDetails}
                      onChange={(e) => handleServiceSelection(e.target.value)}
                      required
                    >
                      <option value="">Select Service</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.serviceName}>
                          {`${service.serviceName} - ₱${service.servicePrice}`}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.serviceDetails}
                      onChange={(e) => setFormData({ ...formData, serviceDetails: e.target.value })}
                      placeholder="Enter service details"
                      required
                    />
                  )}
                </div>
                <div className="form-group">
                  <label>Assigned Staff</label>
                  <select 
                    value={formData.assignedStaff} 
                    onChange={(e) => setFormData({...formData, assignedStaff: e.target.value})}
                  >
                    <option value="">Unassigned</option>
                    {staff.map(staffMember => (
                      <option key={staffMember.id} value={staffMember.id}>
                        {staffMember.name} ({staffMember.position})
                      </option>
                    ))}
                  </select>
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
        </div>,
        document.body
      )}
    </div>
  );
}

export default BookingReport;