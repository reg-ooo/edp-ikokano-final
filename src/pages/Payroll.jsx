// Payroll.jsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import LastUpdated from '../components/LastUpdated';
import { updateTimestamp } from '../utils/timeUtils';
import './Payroll.css';

const STORAGE_KEY = 'payrollData';

function Payroll() {
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_employees`)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Error parsing saved employees:', e)
        return []
      }
    }
    return []
  })
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewEmployee, setViewEmployee] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    type: 'INTERNAL',
    basePay: '',
    commission: '',
    deductions: ''
  });

  // Helper function to persist and dispatch activity logs
  const dispatchActivityLog = (action, userName = 'System') => {
    const timestamp = new Date().toLocaleString('en-PH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const newLog = {
      id: Date.now().toString(),
      user: userName,
      action,
      timestamp
    };

    try {
      const savedLogs = localStorage.getItem('activityLogs');
      const currentLogs = savedLogs ? JSON.parse(savedLogs) : [];
      localStorage.setItem('activityLogs', JSON.stringify([newLog, ...currentLogs]));
    } catch (e) {
      console.error('Error saving activity log entry:', e);
    }

    window.dispatchEvent(new CustomEvent('activityLogEntry', {
      detail: newLog
    }));
  };

  // Save to localStorage whenever employees change + notify Dashboard
  useEffect(() => {
    try {
      const savedStr = localStorage.getItem(`${STORAGE_KEY}_employees`);
      const savedArr = savedStr ? JSON.parse(savedStr) : [];
      const changed = JSON.stringify(savedArr) !== JSON.stringify(employees);
      
      localStorage.setItem(`${STORAGE_KEY}_employees`, JSON.stringify(employees))
      if (changed) {
        updateTimestamp('payroll');
      }
      
      window.dispatchEvent(new CustomEvent('payrollUpdated'))
    } catch (e) {
      console.error('Error saving employees to localStorage:', e)
    }
  }, [employees])

  // Calculate totals
  const totalBasePay = employees.reduce((sum, emp) => sum + (emp.basePay || 0), 0);
  const totalCommissions = employees.reduce((sum, emp) => sum + (emp.commission || 0), 0);

  // Scroll-lock
  useEffect(() => {
    const isOpen = isModalOpen || !!viewEmployee;
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isModalOpen, viewEmployee]);

  // Filter + sort employees
  const filteredEmployees = employees
    .filter(emp => {
      const matchesSearch = searchTerm === '' || 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'All' || emp.type === typeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') {
        cmp = a.name.localeCompare(b.name);
      } else if (sortField === 'netPay') {
        cmp = (a.netPay || 0) - (b.netPay || 0);
      } else if (sortField === 'basePay') {
        cmp = (a.basePay || a.commission || 0) - (b.basePay || b.commission || 0);
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

  const calculateNetPay = (type, basePay, commission, deductions) => {
    let total = 0;
    if (type === 'INTERNAL') {
      total = (basePay || 0) - (deductions || 0);
    } else {
      total = (commission || 0) - (deductions || 0);
    }
    return Math.max(0, total);
  };

  const getFormattedTimestamp = () => {
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
  };

  const liveNetPay = calculateNetPay(
    formData.type,
    parseFloat(formData.basePay) || 0,
    parseFloat(formData.commission) || 0,
    parseFloat(formData.deductions) || 0
  );

  const openCreateModal = () => {
    setEditingEmployee(null);
    setFormData({
      name: '',
      role: '',
      type: 'INTERNAL',
      basePay: '',
      commission: '',
      deductions: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      role: employee.role,
      type: employee.type,
      basePay: employee.basePay ? employee.basePay.toString() : '',
      commission: employee.commission ? employee.commission.toString() : '',
      deductions: employee.deductions ? employee.deductions.toString() : ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  const openViewPanel = (employee) => {
    setViewEmployee(employee);
  };

  const closeViewPanel = () => {
    setViewEmployee(null);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.role.trim()) {
      alert('Please fill in employee name and role.');
      return;
    }

    const type = formData.type;
    let basePay = null;
    let commission = null;
    let deductions = parseFloat(formData.deductions) || 0;

    if (type === 'INTERNAL') {
      basePay = parseFloat(formData.basePay) || 0;
      commission = null;
    } else {
      basePay = null;
      commission = parseFloat(formData.commission) || 0;
    }

    const netPay = calculateNetPay(type, basePay, commission, deductions);

    const newEmployee = {
      id: editingEmployee ? editingEmployee.id : Date.now().toString(),
      name: formData.name,
      role: formData.role,
      type: type,
      basePay: basePay,
      commission: commission,
      deductions: deductions > 0 ? deductions : null,
      netPay: netPay
    };

    if (editingEmployee) {
      // EDIT: Log the edit activity
      setEmployees(prev => prev.map(emp => emp.id === editingEmployee.id ? newEmployee : emp));
      dispatchActivityLog(`Edited payroll employee: ${formData.name} (${formData.role})`);
      
      if (viewEmployee && viewEmployee.id === editingEmployee.id) {
        setViewEmployee(newEmployee);
      }
    } else {
      // ADD: Log the new employee activity
      setEmployees(prev => [...prev, newEmployee]);
      dispatchActivityLog(`Added new payroll employee: ${formData.name} (${formData.role}) - ${type === 'INTERNAL' ? `Base Pay: ₱${basePay.toLocaleString()}` : `Commission: ₱${commission.toLocaleString()}`}`);
    }
    
    closeModal();
  };

  const handleDelete = (id, name, role) => {
    if (window.confirm(`Are you sure you want to delete ${name} from payroll?`)) {
      // DELETE: Log the deletion activity
      dispatchActivityLog(`Deleted payroll employee: ${name} (${role})`);
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      if (viewEmployee && viewEmployee.id === id) closeViewPanel();
      if (editingEmployee && editingEmployee.id === id) closeModal();
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '---';
    return `₱${amount.toLocaleString()}`;
  };

  return (
    <div className="payroll-wrap">
      <h1>Payroll</h1>
      <div className="payroll-header">
        <div className="timestamp">
          <LastUpdated storageKey="payroll" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="payroll-summary-cards">
        <div className="summary-card">
          <h4>Total Employees</h4>
          <p className="summary-amount">{employees.length}</p>
        </div>
        <div className="summary-card">
          <h4>Total Base Pay</h4>
          <p className="summary-amount">₱{totalBasePay.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h4>Total Commissions</h4>
          <p className="summary-amount">₱{totalCommissions.toLocaleString()}</p>
        </div>
      </div>

      {/* Search, Filter and Sort Bar */}
      <div className="payroll-search-bar">
        <div className="search-wrapper">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="10" cy="10" r="7"/>
            <line x1="21" y1="21" x2="15" y2="15"/>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search by name or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="type-filter"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="All">All Types</option>
          <option value="INTERNAL">Internal</option>
          <option value="OUTSOURCE">Outsource</option>
        </select>
        <select
          className="type-filter"
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
        >
          <option value="name">Sort by Name</option>
          <option value="netPay">Sort by Net Pay</option>
          <option value="basePay">Sort by Base/Commission</option>
        </select>
        <select
          className="type-filter"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="asc">ASC</option>
          <option value="desc">DESC</option>
        </select>
        <button className="add-btn" onClick={openCreateModal}>
          + Add Employee
        </button>
      </div>

      {/* Payroll Table */}
      <div className="payroll-table-container">
        <table className="payroll-table">
          <thead>
            <tr>
              <th>Employee / Role</th>
              <th>Type</th>
              <th>Base / Rate</th>
              <th>Commission (Outsource)</th>
              <th>Deductions</th>
              <th>Net Pay</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => (
              <tr key={employee.id}>
                <td className="employee-cell">
                  <div className="employee-name">{employee.name}</div>
                  <div className="employee-role">{employee.role}</div>
                </td>
                <td>
                  <span className={`type-badge ${employee.type === 'INTERNAL' ? 'internal' : 'outsource'}`}>
                    {employee.type}
                  </span>
                </td>
                <td className="amount-cell">
                  {employee.type === 'INTERNAL' ? formatCurrency(employee.basePay) : '---'}
                </td>
                <td className="amount-cell">
                  {employee.type === 'OUTSOURCE' ? formatCurrency(employee.commission) : '---'}
                </td>
                <td className="amount-cell deduction">
                  {employee.deductions ? `-${formatCurrency(employee.deductions)}` : '---'}
                </td>
                <td className="amount-cell net-pay-cell">
                  {formatCurrency(employee.netPay)}
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="view-btn" onClick={() => openViewPanel(employee)}>
                      View
                    </button>
                    <button className="edit-btn" onClick={() => openEditModal(employee)}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(employee.id, employee.name, employee.role)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredEmployees.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-state">
                  <div className="empty-message">
                    No employees found
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail View Panel */}
      {viewEmployee && createPortal(
        <div className="modal-overlay" onClick={closeViewPanel}>
          <div className="modal detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-header">
              <h3>Employee Details</h3>
              <button className="detail-close-btn" onClick={closeViewPanel}>✕</button>
            </div>
            <div className="detail-avatar">
              {viewEmployee.name.charAt(0)}
            </div>
            <div className="detail-name">{viewEmployee.name}</div>
            <div className="detail-role">{viewEmployee.role}</div>
            <span className={`type-badge ${viewEmployee.type === 'INTERNAL' ? 'internal' : 'outsource'}`}>
              {viewEmployee.type}
            </span>

            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Base Pay</span>
                <span className="detail-value">
                  {viewEmployee.type === 'INTERNAL' ? formatCurrency(viewEmployee.basePay) : '---'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Commission</span>
                <span className="detail-value">
                  {viewEmployee.type === 'OUTSOURCE' ? formatCurrency(viewEmployee.commission) : '---'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Deductions</span>
                <span className="detail-value deduction-value">
                  {viewEmployee.deductions ? `-${formatCurrency(viewEmployee.deductions)}` : '---'}
                </span>
              </div>
              <div className="detail-item net-pay-highlight">
                <span className="detail-label">Net Pay</span>
                <span className="detail-value net-pay-value">
                  {formatCurrency(viewEmployee.netPay)}
                </span>
              </div>
            </div>

            <div className="detail-actions">
              <button className="submit-btn" onClick={() => { closeViewPanel(); openEditModal(viewEmployee); }}>
                Edit Employee
              </button>
              <button className="cancel-btn" onClick={closeViewPanel}>
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && createPortal(
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h3>
            <form onSubmit={handleFormSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Employee Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Alejandro"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Role *</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    placeholder="e.g., Lead Detailer"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Employment Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      type: e.target.value,
                      basePay: '',
                      commission: ''
                    });
                  }}
                >
                  <option value="INTERNAL">Internal (Salary-based)</option>
                  <option value="OUTSOURCE">Outsource (Commission-based)</option>
                </select>
              </div>

              {formData.type === 'INTERNAL' ? (
                <div className="form-group">
                  <label>Base Pay (₱) *</label>
                  <div className="amount-input-wrapper">
                    <input
                      type="number"
                      value={formData.basePay}
                      onChange={(e) => setFormData({...formData, basePay: e.target.value})}
                      placeholder="0.00"
                      required
                      step="0.01"
                      min="0"
                      className="amount-input"
                    />
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label>Commission (₱) *</label>
                  <div className="amount-input-wrapper">
                    <span className="currency-symbol">₱</span>
                    <input
                      type="number"
                      value={formData.commission}
                      onChange={(e) => setFormData({...formData, commission: e.target.value})}
                      placeholder="0.00"
                      required
                      step="0.01"
                      min="0"
                      className="amount-input"
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Deductions (₱)</label>
                <div className="amount-input-wrapper">
                  <input
                    type="number"
                    value={formData.deductions}
                    onChange={(e) => setFormData({...formData, deductions: e.target.value})}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="amount-input"
                  />
                </div>
                <small>SSS, PhilHealth, Pag-IBIG, etc.</small>
              </div>

              <div className="net-pay-preview">
                <span className="net-pay-preview-label">Computed Net Pay</span>
                <span className="net-pay-preview-value">₱{liveNetPay.toLocaleString()}</span>
              </div>

              <div className="modal-actions">
                <button type="submit" className="submit-btn">
                  {editingEmployee ? 'Save Changes' : 'Add Employee'}
                </button>
                <button type="button" className="cancel-btn" onClick={closeModal}>
                  Cancel
                </button>
                {editingEmployee && (
                  <button
                    type="button"
                    className="delete-modal-btn"
                    onClick={() => handleDelete(editingEmployee.id, editingEmployee.name, editingEmployee.role)}
                  >
                    Delete
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

export default Payroll;