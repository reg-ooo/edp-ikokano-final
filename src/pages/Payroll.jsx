// Payroll.jsx
import { useState, useEffect } from 'react';
import './Payroll.css';

const STORAGE_KEY = 'payrollData';

// Initial payroll data based on the image
const initialEmployees = [
  {
    id: '1',
    name: 'Alejandro',
    role: 'Lead Detailer',
    type: 'INTERNAL',
    basePay: 8500.00,
    commission: null,
    deductions: 500.00,
    netPay: 8000.00
  },
  {
    id: '2',
    name: 'Linda',
    role: 'Window Tint Specialist',
    type: 'OUTSOURCE',
    basePay: null,
    commission: 2100.00,
    deductions: null,
    netPay: 2100.00
  },
  {
    id: '3',
    name: 'Samantha',
    role: 'Cashier/Admin',
    type: 'INTERNAL',
    basePay: 1300.00,
    commission: null,
    deductions: null,
    netPay: 1300.00
  },
  {
    id: '4',
    name: 'Jose',
    role: 'Lead Detailer',
    type: 'INTERNAL',
    basePay: 7100.00,
    commission: null,
    deductions: null,
    netPay: 7100.00
  },
  {
    id: '5',
    name: 'Ibarra',
    role: 'Lead Detailer',
    type: 'INTERNAL',
    basePay: 1300.00,
    commission: null,
    deductions: null,
    netPay: 1300.00
  },
  {
    id: '6',
    name: 'Rizal',
    role: 'Carwasher',
    type: 'INTERNAL',
    basePay: 1300.00,
    commission: null,
    deductions: null,
    netPay: 1300.00
  }
];

function Payroll() {
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_employees`)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Error parsing saved employees:', e)
        return initialEmployees
      }
    }
    return initialEmployees
  })
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    type: 'INTERNAL',
    basePay: '',
    commission: '',
    deductions: ''
  });

  // Save to localStorage whenever employees change
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_employees`, JSON.stringify(employees))
    } catch (e) {
      console.error('Error saving employees to localStorage:', e)
    }
  }, [employees])

  // Calculate totals
  const totalBasePay = employees.reduce((sum, emp) => sum + (emp.basePay || 0), 0);
  const totalCommissions = employees.reduce((sum, emp) => sum + (emp.commission || 0), 0);
  const totalDeductions = employees.reduce((sum, emp) => sum + (emp.deductions || 0), 0);
  const netPayout = employees.reduce((sum, emp) => sum + (emp.netPay || 0), 0);

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = searchTerm === '' || 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'All' || emp.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // Calculate net pay for an employee
  const calculateNetPay = (type, basePay, commission, deductions) => {
    let total = 0;
    if (type === 'INTERNAL') {
      total = (basePay || 0) - (deductions || 0);
    } else {
      total = (commission || 0) - (deductions || 0);
    }
    return Math.max(0, total);
  };

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
      setEmployees(prev => prev.map(emp => emp.id === editingEmployee.id ? newEmployee : emp));
    } else {
      // Added to BOTTOM for chronological employee list
      setEmployees(prev => [...prev, newEmployee]);
    }
    
    closeModal();
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name} from payroll?`)) {
      setEmployees(prev => prev.filter(emp => emp.id !== id));
    }
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '---';
    return `₱${amount.toLocaleString()}`;
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
    <div className="payroll-wrap">
      {/* Header with timestamp */}
      <div className="payroll-header">
        <div className="timestamp">
          Last Updated: {formattedDate} | {formattedTime}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="payroll-summary-cards">
        <div className="summary-card">
          <h4>Total Base Pay</h4>
          <p className="summary-amount">₱{totalBasePay.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h4>Total Commissions</h4>
          <p className="summary-amount">₱{totalCommissions.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h4>Deductions</h4>
          <p className="summary-amount negative">-₱{totalDeductions.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h4>Net Payout</h4>
          <p className="summary-amount positive">₱{netPayout.toLocaleString()}</p>
        </div>
      </div>

      {/* Search and Filter Bar */}
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
              <th>Deductions / VA LE</th>
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
                <td>
                  <div className="action-buttons">
                    <button className="edit-btn" onClick={() => openEditModal(employee)}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(employee.id, employee.name)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredEmployees.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-state">
                  <div className="empty-message">
                    No employees found
                  </div>
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
                    onClick={() => {
                      if (window.confirm(`Delete ${editingEmployee.name} from payroll?`)) {
                        handleDelete(editingEmployee.id, editingEmployee.name);
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

export default Payroll;