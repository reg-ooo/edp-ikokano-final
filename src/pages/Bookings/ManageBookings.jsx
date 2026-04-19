// ManageBookings.jsx
import { useState, useEffect } from 'react'
import './ManageBookings.css'

const STORAGE_KEY = 'manageBookingsData'
const SERVICES_STORAGE_KEY = 'manageServicesList'
const STAFF_STORAGE_KEY = 'staffReportData'

const initialBookings = [
  {
    id: '1',
    name: 'Alejandro Walker',
    details: 'SUV - Premium Service',
    serviceDate: '2026-03-23',
    completedDate: '',
    service: 'Full Detail - ₱5,000',
    status: 'in-progress',
    contact: '09171234567',
    vehicleModel: 'Toyota Fortuner',
    vehicleBrand: 'Toyota',
    serviceAvails: 'Cleaning and Engine Check',
    assignedStaff: null
  },
  {
    id: '2',
    name: 'Samantha Walker',
    details: 'Van - Basic Service',
    serviceDate: '2026-03-23',
    completedDate: '2026-03-24',
    service: 'Oil Change - ₱1,200',
    status: 'completed',
    contact: '09179876543',
    vehicleModel: 'Nissan Urvan',
    vehicleBrand: 'Nissan',
    serviceAvails: 'Oil and Filter Change',
    assignedStaff: null
  }
]

function ManageBookings() {
  const [bookings, setBookings] = useState(() => {
    // Initialize from localStorage or use initialBookings
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Error parsing saved bookings:', e)
        return initialBookings
      }
    }
    return initialBookings
  })
  
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [sortField, setSortField] = useState('serviceDate')
  const [sortOrder, setSortOrder] = useState('asc')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editBookingId, setEditBookingId] = useState(null)
  const [services, setServices] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [staff, setStaff] = useState([])
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteBooking, setDeleteBooking] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    vehicleModel: '',
    vehicleBrand: '',
    serviceAvails: '',
    serviceDate: '',
    completedDate: '',
    status: 'pending'
  })

  // Load services from ManageServices
  useEffect(() => {
    const saved = localStorage.getItem(SERVICES_STORAGE_KEY)
    if (saved) {
      try {
        setServices(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading services:', e)
      }
    }
  }, [])

  // Load staff from StaffReport
  useEffect(() => {
    const saved = localStorage.getItem(STAFF_STORAGE_KEY)
    if (saved) {
      try {
        setStaff(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading staff:', e)
      }
    }
  }, [])

  // Save to localStorage whenever bookings change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings))
    } catch (e) {
      console.error('Error saving bookings to localStorage:', e)
    }
  }, [bookings])

  const openCreateForm = () => {
    setEditBookingId(null)
    setSelectedCategory('')
    setFormData({
      name: '',
      contact: '',
      vehicleModel: '',
      vehicleBrand: '',
      serviceAvails: '',
      serviceDate: '',
      completedDate: '',
      status: 'pending'
    })
    setIsModalOpen(true)
  }

  const openEditForm = (booking) => {
    setEditBookingId(booking.id)
    const service = services.find(s => s.serviceName === booking.serviceAvails)
    setSelectedCategory(service?.serviceCat || '')
    setFormData({
      name: booking.name,
      contact: booking.contact,
      vehicleModel: booking.vehicleModel,
      vehicleBrand: booking.vehicleBrand,
      serviceAvails: booking.serviceAvails,
      serviceDate: booking.serviceDate,
      completedDate: booking.completedDate || '',
      status: booking.status
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditBookingId(null)
  }

  const getServicePrice = (serviceName) => {
    const service = services.find(s => s.serviceName === serviceName)
    return service ? service.servicePrice : '0'
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.serviceDate || !formData.serviceAvails.trim()) {
      alert('Please complete required fields: Name, Service Date, and Service.')
      return
    }

    const servicePrice = getServicePrice(formData.serviceAvails)

    // Only validate completed date if status is completed and user didn't provide one
    let completedDateValue = formData.completedDate
    if (formData.status === 'completed' && !completedDateValue) {
      // Ask user if they want to set a completion date
      const setToday = window.confirm(
        'Status is set to "Completed" but no completion date is provided.\n\nWould you like to set today\'s date as the completion date?'
      )
      if (setToday) {
        completedDateValue = new Date().toISOString().split('T')[0]
      } else {
        // Keep it empty, user can edit it later
        completedDateValue = ''
      }
    }

    if (editBookingId) {
      setBookings((prev) =>
        prev.map((item) =>
          item.id === editBookingId
            ? { 
                ...item, 
                name: formData.name,
                contact: formData.contact,
                vehicleModel: formData.vehicleModel,
                vehicleBrand: formData.vehicleBrand,
                serviceAvails: formData.serviceAvails,
                serviceDate: formData.serviceDate,
                completedDate: completedDateValue,
                status: formData.status,
                service: `${formData.serviceAvails} - ₱${servicePrice}`,
                details: `${formData.vehicleModel} - ${formData.serviceAvails}`
              }
            : item
        )
      )
      setEditBookingId(null)
    } else {
      const newBooking = {
        id: Date.now().toString(),
        name: formData.name,
        contact: formData.contact,
        vehicleModel: formData.vehicleModel,
        vehicleBrand: formData.vehicleBrand,
        serviceAvails: formData.serviceAvails,
        serviceDate: formData.serviceDate,
        completedDate: completedDateValue,
        status: formData.status,
        service: `${formData.serviceAvails} - ₱${servicePrice}`,
        details: `${formData.vehicleModel} - ${formData.serviceAvails}`
      }
      setBookings((prev) => [newBooking, ...prev])
    }

    setIsModalOpen(false)
  }

  const handleDelete = (id, name) => {
    setDeleteBooking({ id, name })
    setIsDeleteModalOpen(true)
  }
  
  const getAvailableStaffForService = (serviceCategory) => {
    if (!serviceCategory) return staff
    
    // Map service categories to appropriate staff roles
    const categoryRoleMap = {
      'Detailing': ['lead-detailer'],
      'Maintenance': ['carwasher'],
      'Cleaning': ['carwasher'],
      'Repair': ['lead-detailer', 'carwasher'], // Both can handle repairs
      'Inspection': ['lead-detailer', 'admin']
    }
    
    const allowedRoles = categoryRoleMap[serviceCategory] || []
    return staff.filter(staffMember => allowedRoles.includes(staffMember.role))
  }

  const handleStaffAssignment = (bookingId, staffId) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === bookingId
          ? { ...booking, assignedStaff: staffId }
          : booking
      )
    )
  }

  const filtered = bookings
    .filter((booking) => {
      if (filter !== 'All') return booking.status === filter.toLowerCase()
      return true
    })
    .filter((booking) => {
      const term = search.toLowerCase()
      return (
        booking.name.toLowerCase().includes(term) ||
        booking.details.toLowerCase().includes(term) ||
        booking.service.toLowerCase().includes(term)
      )
    })
    .sort((a, b) => {
      let cmp = 0
      if (sortField === 'name') {
        cmp = a.name.localeCompare(b.name)
      } else if (sortField === 'serviceDate') {
        cmp = new Date(a.serviceDate) - new Date(b.serviceDate)
      } else if (sortField === 'completedDate') {
        // Handle empty dates by putting them at the end
        const dateA = a.completedDate ? new Date(a.completedDate) : new Date('9999-12-31')
        const dateB = b.completedDate ? new Date(b.completedDate) : new Date('9999-12-31')
        cmp = dateA - dateB
      } else if (sortField === 'status') {
        cmp = a.status.localeCompare(b.status)
      }
      return sortOrder === 'asc' ? cmp : -cmp
    })

  return (
    <div className="manage-bookings-wrap">
      <h1>Manage Bookings</h1>
      <div className="manage-bookings-top">
        <div className="manage-bookings-controls">
          <button className="primary-btn" onClick={openCreateForm}>Add Booking</button>
          <input
            className="manage-bookings-search"
            placeholder="Search by name, service or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="manage-bookings-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>All</option>
            <option>In-Progress</option>
            <option>Completed</option>
            <option>Pending</option>
          </select>
          <select
            className="manage-bookings-filter"
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
          >
            <option value="serviceDate">Sort by Service Date</option>
            <option value="completedDate">Sort by Completed Date</option>
            <option value="name">Sort by Name</option>
            <option value="status">Sort by Status</option>
          </select>
          <select
            className="manage-bookings-filter"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="asc">ASC</option>
            <option value="desc">DESC</option>
          </select>
        </div>
      </div>

      <table className="manage-bookings-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Service Date</th>
            <th>Completed Date</th>
            <th>Details</th>
            <th>Assign Staff</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((row) => {
            // Find the service category for this booking
            const service = services.find(s => s.serviceName === row.serviceAvails)
            const serviceCategory = service?.serviceCat || ''
            const availableStaff = getAvailableStaffForService(serviceCategory)
            
            return (
              <tr key={row.id}>
                <td>
                  <strong>{row.name}</strong><br />
                  <span>{row.details}</span>
                </td>
                <td>{row.serviceDate}</td>
                <td>{row.completedDate || '—'}</td>
                <td>{row.service}</td>
                <td>
                  <select
                    value={row.assignedStaff || ''}
                    onChange={(e) => handleStaffAssignment(row.id, e.target.value)}
                    className="staff-assignment-select"
                  >
                    <option value="">Unassigned</option>
                    {availableStaff.map(staffMember => (
                      <option key={staffMember.id} value={staffMember.id}>
                        {staffMember.name} ({staffMember.position})
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <span className={`manage-bookings-status ${row.status}`}>
                    {row.status.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                </td>
                <td className="manage-bookings-actions">
                  <button className="link-btn" onClick={() => openEditForm(row)}>Details</button>
                  <button className="link-btn delete" onClick={() => handleDelete(row.id, row.name)}>Delete</button>
                </td>
              </tr>
            )
          })}
          {filtered.length === 0 && (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '1rem' }}>
                No bookings found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editBookingId ? 'Customer Booking Details' : 'Create Booking'}</h3>
            <form onSubmit={handleFormSubmit} className="modal-form">
              <div className="modal-row">
                <label>Customer Name</label>
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="modal-row">
                <label>Contact Number</label>
                <input value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} />
              </div>
              <div className="modal-row">
                <label>Vehicle Model</label>
                <input value={formData.vehicleModel} onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })} />
              </div>
              <div className="modal-row">
                <label>Vehicle Brand</label>
                <input value={formData.vehicleBrand} onChange={(e) => setFormData({ ...formData, vehicleBrand: e.target.value })} />
              </div>
              <div className="modal-row">
                <label>Service Category</label>
                <select value={selectedCategory} onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  setFormData({ ...formData, serviceAvails: '' })
                }}>
                  <option value="">Select Category</option>
                  {[...new Set(services.map(s => s.serviceCat))].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="modal-row">
                <label>Service Availed</label>
                <select value={formData.serviceAvails} onChange={(e) => setFormData({ ...formData, serviceAvails: e.target.value })} required>
                  <option value="">Select Service</option>
                  {services.filter(s => s.serviceCat === selectedCategory).map(service => (
                    <option key={service.id} value={service.serviceName}>{service.serviceName}</option>
                  ))}
                </select>
              </div>
              <div className="modal-row">
                <label>Date of Service Availed</label>
                <input 
                  type="date" 
                  value={formData.serviceDate} 
                  onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })} 
                  required 
                />
              </div>
              <div className="modal-row">
                <label>Date of Service Completed</label>
                <input 
                  type="date" 
                  value={formData.completedDate} 
                  onChange={(e) => setFormData({ ...formData, completedDate: e.target.value })}
                />
                <small style={{ color: '#666', fontSize: '0.8rem' }}>
                  {formData.status === 'completed' 
                    ? 'You can manually set or change the completion date' 
                    : 'Completion date can be set now or when status changes to completed'}
                </small>
              </div>
              <div className="modal-row">
                <label>Status</label>
                <select 
                  value={formData.status} 
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="buttons-row">
                <button type="submit" className="primary-btn">Save</button>
                <button type="button" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && deleteBooking && (
        <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete the booking for "{deleteBooking.name}"?</p>
            <div className="buttons-row">
              <button className="primary-btn" onClick={() => {
                setBookings((prev) => prev.filter((booking) => booking.id !== deleteBooking.id))
                setIsDeleteModalOpen(false)
                setDeleteBooking(null)
              }}>Delete</button>
              <button className="cancel-btn" onClick={() => {
                setIsDeleteModalOpen(false)
                setDeleteBooking(null)
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageBookings