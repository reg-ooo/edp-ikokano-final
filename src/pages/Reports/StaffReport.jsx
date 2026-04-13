// StaffReport.jsx
import { useState, useEffect } from 'react'
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
  const [staff, setStaff] = useState(initialStaff)
  const [search, setSearch] = useState('')
  const [selectedStaff, setSelectedStaff] = useState(initialStaff[0])
  const [activeTab, setActiveTab] = useState('profile')
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false) // Hidden by default

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setStaff(JSON.parse(saved))
  }, [])

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
    alert('Edit Profile feature coming soon!')
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
          <button 
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Performance Analytics
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
                              width: `${(selectedStaff.attendance.present / 
                                (selectedStaff.attendance.present + selectedStaff.attendance.absent)) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <div className="rate-value">
                          {Math.round((selectedStaff.attendance.present / 
                            (selectedStaff.attendance.present + selectedStaff.attendance.absent)) * 100)}%
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

                {activeTab === 'analytics' && (
                  <div className="analytics-details">
                    <div className="details-card">
                      <h4>Performance Analytics</h4>
                      <div className="analytics-placeholder">
                        <p>Performance metrics and analytics coming soon...</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Tabs */}
              <div className="employee-bottom-tabs">
                <button 
                  className={`bottom-tab ${activeTab === 'work' ? 'active' : ''}`}
                  onClick={() => setActiveTab('work')}
                >
                  Lead Detailer
                </button>
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default StaffReport