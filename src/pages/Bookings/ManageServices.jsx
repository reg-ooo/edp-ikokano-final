// ManageServices.jsx
import { useState, useEffect } from 'react'
import './ManageServices.css'

const STORAGE_KEY = 'manageServicesData'

const initialServices = [
  {
    id: '1',
    name: 'Alejandro Walker',
    details: 'SUV - Premium Service',
    serviceAvailedDate: '2026-03-20',
    serviceScheduledDate: '2026-03-23',
    completedDate: '',
    vehicleCompletion: '',
    service: 'Full Detail - ₱5,000',
    status: 'in-progress',
    contact: '09171234567',
    vehicleModel: 'Toyota Fortuner',
    vehicleBrand: 'Toyota',
    serviceAvails: 'Cleaning and Engine Check'
  },
  {
    id: '2',
    name: 'Samantha Walker',
    details: 'Van - Basic Service',
    serviceAvailedDate: '2026-03-21',
    serviceScheduledDate: '2026-03-23',
    completedDate: '2026-03-24',
    vehicleCompletion: 'Oil changed, filter replaced, tires rotated',
    service: 'Oil Change - ₱1,200',
    status: 'completed',
    contact: '09179876543',
    vehicleModel: 'Nissan Urvan',
    vehicleBrand: 'Nissan',
    serviceAvails: 'Oil and Filter Change'
  }
]

function ManageServices() {
  const [services, setServices] = useState(() => {
    // Initialize from localStorage or use initialServices
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Error parsing saved services:', e)
        return initialServices
      }
    }
    return initialServices
  })
  
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [sortField, setSortField] = useState('serviceScheduledDate')
  const [sortOrder, setSortOrder] = useState('asc')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editServiceId, setEditServiceId] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    vehicleModel: '',
    vehicleBrand: '',
    serviceAvails: '',
    serviceAvailedDate: '',
    serviceScheduledDate: '',
    completedDate: '',
    vehicleCompletion: '',
    status: 'pending'
  })

  // Save to localStorage whenever services change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(services))
    } catch (e) {
      console.error('Error saving services to localStorage:', e)
    }
  }, [services])

  const openCreateForm = () => {
    setEditServiceId(null)
    setFormData({
      name: '',
      contact: '',
      vehicleModel: '',
      vehicleBrand: '',
      serviceAvails: '',
      serviceAvailedDate: '',
      serviceScheduledDate: '',
      completedDate: '',
      vehicleCompletion: '',
      status: 'pending'
    })
    setIsModalOpen(true)
  }

  const openEditForm = (service) => {
    setEditServiceId(service.id)
    setFormData({
      name: service.name,
      contact: service.contact,
      vehicleModel: service.vehicleModel,
      vehicleBrand: service.vehicleBrand,
      serviceAvails: service.serviceAvails,
      serviceAvailedDate: service.serviceAvailedDate || '',
      serviceScheduledDate: service.serviceScheduledDate || '',
      completedDate: service.completedDate || '',
      vehicleCompletion: service.vehicleCompletion || '',
      status: service.status
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditServiceId(null)
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.serviceScheduledDate || !formData.serviceAvails.trim()) {
      alert('Please complete required fields: Name, Service Scheduled Date, and Service.')
      return
    }

    if (editServiceId) {
      setServices((prev) =>
        prev.map((item) =>
          item.id === editServiceId
            ? { 
                ...item, 
                ...formData,
                details: `${formData.vehicleModel} - ${formData.serviceAvails}`,
                service: `${formData.serviceAvails} - ₱1,000`
              }
            : item
        )
      )
      setEditServiceId(null)
    } else {
      const newService = {
        id: Date.now().toString(),
        name: formData.name,
        contact: formData.contact,
        vehicleModel: formData.vehicleModel,
        vehicleBrand: formData.vehicleBrand,
        serviceAvails: formData.serviceAvails,
        serviceAvailedDate: formData.serviceAvailedDate,
        serviceScheduledDate: formData.serviceScheduledDate,
        completedDate: formData.completedDate,
        vehicleCompletion: formData.vehicleCompletion,
        status: formData.status,
        service: `${formData.serviceAvails} - ₱1,000`,
        details: `${formData.vehicleModel} - ${formData.serviceAvails}`
      }
      setServices((prev) => [newService, ...prev])
    }

    setIsModalOpen(false)
  }

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete the service for ${name}?`)) {
      setServices((prev) => prev.filter((service) => service.id !== id))
    }
  }

  const filtered = services
    .filter((service) => {
      if (filter !== 'All') return service.status === filter.toLowerCase()
      return true
    })
    .filter((service) => {
      const term = search.toLowerCase()
      return (
        service.name.toLowerCase().includes(term) ||
        service.details.toLowerCase().includes(term) ||
        service.service.toLowerCase().includes(term)
      )
    })
    .sort((a, b) => {
      let cmp = 0
      if (sortField === 'name') {
        cmp = a.name.localeCompare(b.name)
      } else if (sortField === 'serviceAvailedDate') {
        cmp = new Date(a.serviceAvailedDate || '9999-12-31') - new Date(b.serviceAvailedDate || '9999-12-31')
      } else if (sortField === 'serviceScheduledDate') {
        cmp = new Date(a.serviceScheduledDate) - new Date(b.serviceScheduledDate)
      } else if (sortField === 'completedDate') {
        cmp = new Date(a.completedDate || '9999-12-31') - new Date(b.completedDate || '9999-12-31')
      } else if (sortField === 'status') {
        cmp = a.status.localeCompare(b.status)
      }
      return sortOrder === 'asc' ? cmp : -cmp
    })

  return (
    <div className="manage-services-wrap">
      <div className="manage-services-top">
        <div className="manage-services-controls">
          <button className="primary-btn" onClick={openCreateForm}>Add Service</button>
          <input
            className="manage-services-search"
            placeholder="Search by name, service or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="manage-services-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>All</option>
            <option>In Progress</option>
            <option>Completed</option>
            <option>Pending</option>
          </select>
          <select
            className="manage-services-filter"
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
          >
            <option value="serviceScheduledDate">Sort by Scheduled Date</option>
            <option value="serviceAvailedDate">Sort by Availed Date</option>
            <option value="completedDate">Sort by Completed Date</option>
            <option value="name">Sort by Name</option>
            <option value="status">Sort by Status</option>
          </select>
          <select
            className="manage-services-filter"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="asc">ASC</option>
            <option value="desc">DESC</option>
          </select>
        </div>
      </div>

      <table className="manage-services-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Date Availed</th>
            <th>Scheduled Date</th>
            <th>Completed Date</th>
            <th>Vehicle Completion</th>
            <th>Details</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((service) => (
            <tr key={service.id}>
              <td>
                <strong>{service.name}</strong><br />
                <span>{service.details}</span>
              </td>
              <td>{service.serviceAvailedDate || '—'}</td>
              <td>{service.serviceScheduledDate || '—'}</td>
              <td>{service.completedDate || '—'}</td>
              <td>
                {service.vehicleCompletion ? (
                  <span title={service.vehicleCompletion}>
                    {service.vehicleCompletion.length > 30 
                      ? service.vehicleCompletion.substring(0, 30) + '...' 
                      : service.vehicleCompletion}
                  </span>
                ) : '—'}
              </td>
              <td>{service.service}</td>
              <td>
                <span className={`manage-services-status ${service.status}`}>
                  {service.status.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </span>
              </td>
              <td className="manage-services-actions">
                <button className="link-btn" onClick={() => openEditForm(service)}>Details</button>
                <button className="link-btn delete" onClick={() => handleDelete(service.id, service.name)}>Delete</button>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center', padding: '1rem' }}>
                No services found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editServiceId ? 'Service Details' : 'Create Service'}</h3>
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
                <label>Service Availed</label>
                <input value={formData.serviceAvails} onChange={(e) => setFormData({ ...formData, serviceAvails: e.target.value })} required />
              </div>
              
              <div className="modal-row">
                <label>Date Service Availed</label>
                <input 
                  type="date" 
                  value={formData.serviceAvailedDate} 
                  onChange={(e) => setFormData({ ...formData, serviceAvailedDate: e.target.value })} 
                />
              </div>
              
              <div className="modal-row">
                <label>Service Scheduled Date</label>
                <input 
                  type="date" 
                  value={formData.serviceScheduledDate} 
                  onChange={(e) => setFormData({ ...formData, serviceScheduledDate: e.target.value })} 
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
                  Set when service is completed
                </small>
              </div>
              
              <div className="modal-row">
                <label>Vehicle Completion Notes</label>
                <textarea 
                  value={formData.vehicleCompletion} 
                  onChange={(e) => setFormData({ ...formData, vehicleCompletion: e.target.value })}
                  rows="3"
                  placeholder="Enter details about work completed on the vehicle..."
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontFamily: 'inherit',
                    fontSize: '1rem'
                  }}
                />
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
              
              <div className="modal-row">
                <label>Documents</label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button 
                    type="button" 
                    className="secondary-btn"
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: '#374151'
                    }}
                    onClick={() => alert('View Document feature coming soon!')}
                  >
                    View Document
                  </button>
                  <button 
                    type="button" 
                    className="secondary-btn"
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: '#374151'
                    }}
                    onClick={() => alert('Edit Document feature coming soon!')}
                  >
                    Edit Document
                  </button>
                </div>
                <small style={{ color: '#666', fontSize: '0.8rem' }}>
                  Document management coming soon
                </small>
              </div>
              
              <div className="buttons-row">
                <button type="submit" className="primary-btn">Save</button>
                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageServices