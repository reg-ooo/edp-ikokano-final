// StaffReport.jsx
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import './StaffReport.css'

const STORAGE_KEY = 'staffReportData'

const initialStaff = [
  {
    id: '1',
    name: 'Alejandro Walker',
    position: 'Lead Detailer',
    role: 'lead-detailer',
    email: 'alejandro@example.com',
    phone: '09171234567',
    hireDate: '2024-01-15',
    salary: 25000,
    status: 'active',
    attendance: {
      present: 18,
      absent: 2,
      late: 1
    },
    payroll: {
      basic: 25000,
      overtime: 1500,
      deductions: 500,
      net: 26000
    }
  },
  {
    id: '2',
    name: 'Samantha Walker',
    position: 'Cashier/Admin',
    role: 'admin',
    email: 'samantha@example.com',
    phone: '09179876543',
    hireDate: '2024-02-01',
    salary: 20000,
    status: 'active',
    attendance: {
      present: 20,
      absent: 0,
      late: 0
    },
    payroll: {
      basic: 20000,
      overtime: 0,
      deductions: 300,
      net: 19700
    }
  },
  {
    id: '3',
    name: 'Jose Rizal',
    position: 'Carwasher',
    role: 'carwasher',
    email: 'jose@example.com',
    phone: '09175551234',
    hireDate: '2024-01-20',
    salary: 15000,
    status: 'active',
    attendance: {
      present: 17,
      absent: 3,
      late: 2
    },
    payroll: {
      basic: 15000,
      overtime: 800,
      deductions: 400,
      net: 15400
    }
  },
  {
    id: '4',
    name: 'Juan Dela Cruz',
    position: 'Lead Detailer',
    role: 'lead-detailer',
    email: 'juan@example.com',
    phone: '09176667788',
    hireDate: '2024-02-10',
    salary: 25000,
    status: 'active',
    attendance: {
      present: 15,
      absent: 5,
      late: 2
    },
    payroll: {
      basic: 25000,
      overtime: 1000,
      deductions: 600,
      net: 25400
    }
  },
  {
    id: '5',
    name: 'Crisostomo Ibarra',
    position: 'Carwasher',
    role: 'carwasher',
    email: 'crisostomo@example.com',
    phone: '09179998877',
    hireDate: '2024-02-15',
    salary: 15000,
    status: 'active',
    attendance: {
      present: 16,
      absent: 4,
      late: 1
    },
    payroll: {
      basic: 15000,
      overtime: 500,
      deductions: 300,
      net: 15200
    }
  }
]

function StaffReport() {
  const [staff, setStaff] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : initialStaff
  })
  const [search, setSearch] = useState('')
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false) // Hidden by default

  // Add state for edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editFormData, setEditFormData] = useState(null)

  // Scroll-lock: disable body scroll when panel is open
  useEffect(() => {
    document.body.style.overflow = isEditModalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isEditModalOpen]);

  // Sync with Payroll Data
  useEffect(() => {
    const syncWithPayroll = () => {
      const savedPayroll = localStorage.getItem('payrollData_employees')
      if (savedPayroll) {
        try {
          const payrollStaff = JSON.parse(savedPayroll)
          setStaff(prevStaff => {
            const updatedStaff = prevStaff.map(member => {
              // Try to find matching employee in payroll data by name
              const payrollRecord = payrollStaff.find(
                p => p.name.toLowerCase() === member.name.toLowerCase()
              )
              
              if (payrollRecord) {
                return {
                  ...member,
                  payroll: {
                    basic: payrollRecord.basePay || 0,
                    overtime: payrollRecord.commission || 0, // Mapping commission to overtime for UI
                    deductions: payrollRecord.deductions || 0,
                    net: payrollRecord.netPay || 0
                  }
                }
              }
              return member
            })
            
            // Optionally, add new staff from payroll that aren't in StaffReport
            payrollStaff.forEach(p => {
              const exists = updatedStaff.some(s => s.name.toLowerCase() === p.name.toLowerCase())
              if (!exists) {
                updatedStaff.push({
                  id: `payroll-auto-${p.id}`,
                  name: p.name,
                  position: p.role,
                  role: p.role.toLowerCase().replace(/\s+/g, '-'),
                  email: 'Pending from payroll',
                  phone: 'Pending from payroll',
                  hireDate: new Date().toISOString().split('T')[0],
                  salary: p.basePay || p.commission || 0,
                  status: 'active',
                  attendance: { present: 0, absent: 0, late: 0 },
                  payroll: {
                    basic: p.basePay || 0,
                    overtime: p.commission || 0,
                    deductions: p.deductions || 0,
                    net: p.netPay || 0
                  }
                })
              }
            })
            
            return updatedStaff
          })
        } catch (e) {
          console.error("Error syncing with payroll data", e)
        }
      }
    }
    
    // Initial sync
    syncWithPayroll()

    // Listen for payroll updates
    window.addEventListener('payrollUpdated', syncWithPayroll)
    return () => window.removeEventListener('payrollUpdated', syncWithPayroll)
  }, [])

  // Set selected staff after initialization if null
  useEffect(() => {
    if (!selectedStaff && staff.length > 0) {
      setSelectedStaff(staff[0])
    } else if (selectedStaff) {
      // Keep selected staff updated if their data changed
      const updated = staff.find(s => s.id === selectedStaff.id)
      if (updated) setSelectedStaff(updated)
    }
  }, [staff, selectedStaff])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(staff))
  }, [staff])

  const filteredStaff = staff.filter(member =>
    member.name.toLowerCase().includes(search.toLowerCase()) ||
    member.position.toLowerCase().includes(search.toLowerCase())
  )

  const selectStaff = (staffMember) => {
    setSelectedStaff(staffMember)
    // Close sidebar on mobile after selection
    if (window.innerWidth <= 768) {
      setIsDirectoryOpen(false)
    }
  }

  const toggleDirectory = () => {
    setIsDirectoryOpen(!isDirectoryOpen)
  }

  const closeDirectory = () => {
    setIsDirectoryOpen(false)
  }

  const handleEditProfile = () => {
    if (selectedStaff) {
      setEditFormData({
        email: selectedStaff.email,
        phone: selectedStaff.phone,
        position: selectedStaff.position,
        status: selectedStaff.status
      })
      setIsEditModalOpen(true)
    }
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    setStaff(prev => 
      prev.map(member => 
        member.id === selectedStaff.id 
          ? { ...member, ...editFormData }
          : member
      )
    )
    setIsEditModalOpen(false)
  }

  const getAttendanceRate = (attendance) => {
    const present = Number(attendance?.present) || 0
    const absent = Number(attendance?.absent) || 0
    const total = present + absent
    if (total === 0) return 0
    return (present / total) * 100
  }

  const getPunctualityRate = (attendance) => {
    const present = Number(attendance?.present) || 0
    const late = Number(attendance?.late) || 0
    if (present === 0) return 0
    return ((present - late) / present) * 100
  }

  return (
    <div className="staff-report-wrap">
      {/* Header with Tabs */}
      <div className="staff-header">
        <button className="toggle-directory-btn" onClick={toggleDirectory} aria-label="Toggle Team Directory">
          ☰
        </button>
        <div className="staff-tabs">
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Employee Profile
          </button>
          <button 
            className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            Attendance & Payroll
          </button>
        </div>
      </div>

      {/* Main Content - Sidebar + Main Panel */}
      <div className="staff-main-layout">
        {/* Sidebar Overlay - Hidden by default */}
        <div className={`team-directory-overlay ${isDirectoryOpen ? 'open' : ''}`} onClick={closeDirectory}>
          <div className={`team-directory-sidebar ${isDirectoryOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="directory-header">
              <div className="directory-header-top">
                <h3>Team Directory</h3>
                <button className="close-directory-btn" onClick={closeDirectory}>×</button>
              </div>
              <input
                className="directory-search"
                placeholder="Search Staff..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="staff-list">
              {filteredStaff.map((member) => (
                <div 
                  key={member.id} 
                  className={`staff-card ${selectedStaff?.id === member.id ? 'active' : ''}`}
                  onClick={() => selectStaff(member)}
                >
                  <div className="staff-avatar">
                    {member.name.charAt(0)}
                  </div>
                  <div className="staff-info">
                    <h4>{member.name}</h4>
                    <p>{member.position}</p>
                  </div>
                </div>
              ))}
              {filteredStaff.length === 0 && (
                <div className="no-results">No staff members found.</div>
              )}
            </div>
          </div>
        </div>

        {/* Main Panel - Employee Details */}
        <div className="employee-main-panel">
          {selectedStaff && (
            <>
              <div className="employee-profile-header">
                <div className="employee-avatar-large">
                  {selectedStaff.name.charAt(0)}
                </div>
                <div className="employee-info">
                  <h2>{selectedStaff.name}</h2>
                  <p className="employee-position">{selectedStaff.position}</p>
                  <button className="edit-profile-btn" onClick={handleEditProfile}>
                    Edit Profile
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="employee-tab-content">
                {activeTab === 'profile' && (
                  <div className="profile-details">
                    <div className="details-card">
                      <h4>Contact Information</h4>
                      <div className="detail-row">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{selectedStaff.email}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Phone:</span>
                        <span className="detail-value">{selectedStaff.phone}</span>
                      </div>
                    </div>
                    
                    <div className="details-card">
                      <h4>Employment Details</h4>
                      <div className="detail-row">
                        <span className="detail-label">Role:</span>
                        <span className="detail-value">{selectedStaff.role}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Hire Date:</span>
                        <span className="detail-value">{selectedStaff.hireDate}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Status:</span>
                        <span className={`status-badge ${selectedStaff.status}`}>
                          {selectedStaff.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'attendance' && (
                  <div className="attendance-details">
                    <div className="details-card">
                      <h4>Work & Attendance</h4>
                      <div className="attendance-stats-grid">
                        <div className="stat-card">
                          <span className="stat-label">Present</span>
                          <span className="stat-value">{selectedStaff.attendance.present} days</span>
                        </div>
                        <div className="stat-card">
                          <span className="stat-label">Absent</span>
                          <span className="stat-value">{selectedStaff.attendance.absent} days</span>
                        </div>
                        <div className="stat-card">
                          <span className="stat-label">Late</span>
                          <span className="stat-value">{selectedStaff.attendance.late} days</span>
                        </div>
                      </div>
                      <div className="attendance-rate">
                        <div className="rate-label">Attendance Rate</div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ 
                              width: `${getAttendanceRate(selectedStaff.attendance)}%` 
                            }}
                          ></div>
                        </div>
                        <div className="rate-value">
                          {Math.round(getAttendanceRate(selectedStaff.attendance))}%
                        </div>
                      </div>
                    </div>

                    <div className="details-card">
                      <h4>Payroll Summary</h4>
                      <div className="payroll-summary">
                        <div className="payroll-row">
                          <span>Basic Salary:</span>
                          <span>₱{selectedStaff.payroll.basic.toLocaleString()}</span>
                        </div>
                        <div className="payroll-row">
                          <span>Overtime:</span>
                          <span className="positive">+₱{selectedStaff.payroll.overtime.toLocaleString()}</span>
                        </div>
                        <div className="payroll-row">
                          <span>Deductions:</span>
                          <span className="negative">-₱{selectedStaff.payroll.deductions.toLocaleString()}</span>
                        </div>
                        <div className="payroll-row total">
                          <span>Net Pay:</span>
                          <span>₱{selectedStaff.payroll.net.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Tabs */}
              <div className="employee-bottom-tabs">
                <button 
                  className={`bottom-tab ${activeTab === 'work-attendance' ? 'active' : ''}`}
                  onClick={() => setActiveTab('work-attendance')}
                >
                  Work & Attendance
                </button>
                <button 
                  className={`bottom-tab ${activeTab === 'compensation' ? 'active' : ''}`}
                  onClick={() => setActiveTab('compensation')}
                >
                  Compensation
                </button>
              </div>

              {/* Work & Attendance Tab Content */}
              {activeTab === 'work-attendance' && (
                <div className="work-attendance-details">
                  <div className="details-card">
                    <h4>Attendance Records</h4>
                    <div className="attendance-detailed-grid">
                      <div className="attendance-item">
                        <span className="label">Days Present</span>
                        <span className="value present">{selectedStaff.attendance.present}</span>
                      </div>
                      <div className="attendance-item">
                        <span className="label">Days Absent</span>
                        <span className="value absent">{selectedStaff.attendance.absent}</span>
                      </div>
                      <div className="attendance-item">
                        <span className="label">Late Arrivals</span>
                        <span className="value late">{selectedStaff.attendance.late}</span>
                      </div>
                      <div className="attendance-item">
                        <span className="label">Total Days</span>
                        <span className="value total">{selectedStaff.attendance.present + selectedStaff.attendance.absent}</span>
                      </div>
                    </div>
                  </div>

                  <div className="details-card">
                    <h4>Work Performance</h4>
                    <div className="performance-metrics">
                      <div className="metric-row">
                        <span className="metric-label">Attendance Rate:</span>
                        <div className="metric-bar">
                          <div 
                            className="metric-progress"
                            style={{ 
                              width: `${getAttendanceRate(selectedStaff.attendance)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="metric-value">
                          {Math.round(getAttendanceRate(selectedStaff.attendance))}%
                        </span>
                      </div>
                      <div className="metric-row">
                        <span className="metric-label">Punctuality Rate:</span>
                        <div className="metric-bar">
                          <div 
                            className="metric-progress"
                            style={{ 
                              width: `${getPunctualityRate(selectedStaff.attendance)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="metric-value">
                          {Math.round(getPunctualityRate(selectedStaff.attendance))}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Compensation Tab Content */}
              {activeTab === 'compensation' && (
                <div className="compensation-details">
                  <div className="details-card">
                    <h4>Compensation Breakdown</h4>
                    <div className="compensation-breakdown">
                      <div className="compensation-row">
                        <span className="comp-label">Monthly Base Salary:</span>
                        <span className="comp-value base">₱{selectedStaff.payroll.basic.toLocaleString()}</span>
                      </div>
                      <div className="compensation-row">
                        <span className="comp-label">Overtime/Commission:</span>
                        <span className="comp-value positive">+₱{selectedStaff.payroll.overtime.toLocaleString()}</span>
                      </div>
                      <div className="compensation-row">
                        <span className="comp-label">Deductions:</span>
                        <span className="comp-value negative">-₱{selectedStaff.payroll.deductions.toLocaleString()}</span>
                      </div>
                      <div className="compensation-row total">
                        <span className="comp-label">Net Pay:</span>
                        <span className="comp-value net">₱{selectedStaff.payroll.net.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="details-card">
                    <h4>Salary Information</h4>
                    <div className="salary-info">
                      <div className="salary-item">
                        <span className="label">Annual Salary:</span>
                        <span className="value">₱{(selectedStaff.payroll.basic * 12).toLocaleString()}</span>
                      </div>
                      <div className="salary-item">
                        <span className="label">Monthly Average:</span>
                        <span className="value">₱{selectedStaff.payroll.net.toLocaleString()}</span>
                      </div>
                      <div className="salary-item">
                        <span className="label">Deduction Rate:</span>
                        <span className="value percentage">
                          {((selectedStaff.payroll.deductions / selectedStaff.payroll.basic) * 100).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {isEditModalOpen && editFormData && createPortal(
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Profile - {selectedStaff?.name}</h2>
              <button className="close-btn" onClick={() => setIsEditModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleEditSubmit} className="edit-staff-form">
              <div className="form-group">
                <label>Position</label>
                <input 
                  type="text" 
                  value={editFormData.position} 
                  onChange={(e) => setEditFormData({...editFormData, position: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={editFormData.email} 
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input 
                  type="text" 
                  value={editFormData.phone} 
                  onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select 
                  value={editFormData.status} 
                  onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on-leave">On Leave</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="save-btn">Save Changes</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default StaffReport