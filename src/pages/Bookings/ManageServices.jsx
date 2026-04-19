import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import './ManageServices.css'

const STORAGE_KEY = 'manageServicesList'

/*const initialServices = [
  { 
    id: '1', 
    serviceName: 'PFF Tinting', 
    serviceCat: 'Detailing', 
    servicePrice: '5000', 
    duration: '4 hours' 
  },
  { id: '2', 
    serviceName: 'Carwash', 
    serviceCat: 'Maintenance', 
    servicePrice: '1000', 
    duration: '1 hour' 
  }
]*/

const parseDuration = (duration = '') => {
  const hoursMatch = duration.match(/(\d+)\s*hour/)
  const minutesMatch = duration.match(/(\d+)\s*minute/)

  return {
    durationHours: hoursMatch ? Number(hoursMatch[1]) : 0,
    durationMinutes: minutesMatch ? Number(minutesMatch[1]) : 0
  }
}

const formatDuration = (hours, minutes) => {
  const parts = []
  if (hours > 0) {
    parts.push(`${hours} hour${hours === 1 ? '' : 's'}`)
  }
  if (minutes > 0) {
    parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`)
  }
  return parts.length ? parts.join(' ') : '0 minutes'
}

function ManageServices() {
  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return parsed
      } catch (e) { 
        console.error('Error parsing saved services:', e)
        return initialServices 
      }
    }
    return initialServices
  })
  
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [sortOrder, setSortOrder] = useState('asc')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editServiceId, setEditServiceId] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteService, setDeleteService] = useState(null)
  const [viewService, setViewService] = useState(null);

  const [formData, setFormData] = useState({
    serviceName: '',
    serviceCat: '',
    servicePrice: '',
    durationHours: 1,
    durationMinutes: 0
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(services))
  }, [services])

  // Scroll-lock: disable body scroll when panel is open
  useEffect(() => {
    const isOpen = isModalOpen || isDeleteModalOpen || !!viewService;
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isModalOpen, isDeleteModalOpen, viewService]);

  const openCreateForm = () => {
    setEditServiceId(null)
    setFormData({ serviceName: '', serviceCat: '', servicePrice: '', durationHours: 1, durationMinutes: 0 })
    setIsModalOpen(true)
  }

  const openEditForm = (service) => {
    setEditServiceId(service.id)
    setFormData({
      serviceName: service.serviceName,
      serviceCat: service.serviceCat,
      servicePrice: service.servicePrice,
      ...parseDuration(service.duration)
    })
    setIsModalOpen(true)
  }

  const openViewPanel = (service) => {
    setViewService(service);
  };

  const closeViewPanel = () => {
    setViewService(null);
  };

  const closeModal = () => {
    setIsModalOpen(false)
    setEditServiceId(null)
  }

  const buildServicePayload = ({ serviceName, serviceCat, servicePrice, durationHours, durationMinutes }) => ({
    serviceName,
    serviceCat,
    servicePrice,
    duration: formatDuration(durationHours, durationMinutes)
  })

  const handleFormSubmit = (e) => {
    e.preventDefault()

    if (Number(formData.durationHours) <= 0 && Number(formData.durationMinutes) <= 0) {
      alert('Give an estimated duration.')
      return
    }

    if (editServiceId) {
      setServices(prev => prev.map(item => item.id === editServiceId ? { ...item, ...buildServicePayload(formData) } : item))
    } else {
      setServices(prev => [{ ...buildServicePayload(formData), id: Date.now().toString() }, ...prev])
    }
    closeModal()
  }

  const handleDelete = (id, serviceName) => {
    setDeleteService({ id, serviceName })
    setIsDeleteModalOpen(true)
  }

  // SEARCH AND SORT LOGIC
  const filtered = services
    .filter((service) => {
      const term = search.toLowerCase()
      return (service.serviceName?.toLowerCase() || "").includes(term) || 
             (service.serviceCat?.toLowerCase() || "").includes(term)
    })
    .sort((a, b) => {
      const nameA = a.serviceName?.toLowerCase() || ""
      const nameB = b.serviceName?.toLowerCase() || ""
      const cmp = nameA.localeCompare(nameB)
      return sortOrder === 'asc' ? cmp : -cmp
    })

  return (
    <div className="manage-services-wrap">
      <h1>Manage Services</h1>
      
      <div className="manage-services-top">
        <div className="manage-services-controls">
          <button className="primary-btn" onClick={openCreateForm}>Add Service</button>
          
          <input
            className="manage-services-search"
            placeholder="Search service name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="manage-services-filter"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="asc">Sort Services A-Z</option>
            <option value="desc">Sort Services Z-A</option>
          </select>
        </div>
      </div>

      <table className="manage-services-table">
        <thead>
          <tr>
            <th>Service</th>
            <th>Category</th>
            <th>Pricing</th>
            <th>Duration</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((service) => (
            <tr key={service.id}>
              <td><strong>{service.serviceName}</strong></td>
              <td>{service.serviceCat}</td>
              <td>₱{Number(service.servicePrice).toLocaleString()}</td>
              <td>{service.duration}</td>
              <td className="manage-services-actions">
                <button className="view-btn" onClick={() => openViewPanel(service)}>View</button>
                <button className="edit-btn" onClick={() => openEditForm(service)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(service.id, service.serviceName)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {viewService && createPortal(
        <div className="modal-overlay" onClick={closeViewPanel}>
          <div className="modal detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-header">
              <h3>Service Details</h3>
              <button className="detail-close-btn" onClick={closeViewPanel}>✕</button>
            </div>
            <div className="detail-name">{viewService.serviceName}</div>
            <div className="detail-role">{viewService.serviceCat}</div>
            
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Price</span>
                <span className="detail-value">₱{Number(viewService.servicePrice).toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Duration</span>
                <span className="detail-value">{viewService.duration}</span>
              </div>
            </div>

            <div className="detail-actions">
              <button className="submit-btn" onClick={() => { closeViewPanel(); openEditForm(viewService); }}>
                Edit Service
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
            <h3>{editServiceId ? 'Edit Service Details' : 'Create Service'}</h3>
            <form onSubmit={handleFormSubmit} className="modal-form">
              <div className="modal-row">
                <label>Service Name</label>
                <input value={formData.serviceName} onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })} required />
              </div>
              <div className="modal-row">
                <label>Category</label>
                <input value={formData.serviceCat} onChange={(e) => setFormData({ ...formData, serviceCat: e.target.value })} required />
              </div>
              <div className="modal-row">
                <label>Price (₱)</label>
                <input type="number" value={formData.servicePrice} onChange={(e) => setFormData({ ...formData, servicePrice: e.target.value })} required />
              </div>
              <div className="modal-row">
                <label>Duration (Hours)</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={formData.durationHours}
                  onChange={(e) => setFormData({ ...formData, durationHours: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="modal-row">
                <label>Duration (Minutes)</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                  required
                />
              </div>
              
              <div className="buttons-row">
                <button type="submit" className="primary-btn">Save</button>
                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {isDeleteModalOpen && deleteService && createPortal(
        <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete the "{deleteService.serviceName}" service?</p>
            <div className="buttons-row">
              <button className="primary-btn" onClick={() => {
                setServices(prev => prev.filter(s => s.id !== deleteService.id))
                setIsDeleteModalOpen(false)
                setDeleteService(null)
              }}>Delete</button>
              <button className="cancel-btn" onClick={() => {
                setIsDeleteModalOpen(false)
                setDeleteService(null)
              }}>Cancel</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default ManageServices