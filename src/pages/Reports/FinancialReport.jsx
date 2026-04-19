// FinancialReport.jsx
import { useState, useEffect } from 'react'
import './FinancialReport.css'

const STORAGE_KEY = 'financialReportData'

const initialExpenses = [
  {
    id: '1',
    date: '2026-03-20',
    productName: 'Staff Salary (Week 3)',
    category: 'Salary',
    amount: 8500.00,
    type: 'expense'
  },
  {
    id: '2',
    date: '2026-03-21',
    productName: 'Water Bill',
    category: 'Utility',
    amount: 2100.00,
    type: 'expense'
  },
  {
    id: '3',
    date: '2026-03-22',
    productName: 'Pressure Washer Repair',
    category: 'Maintenance',
    amount: 1300.00,
    type: 'expense'
  },
  {
    id: '4',
    date: '2026-03-23',
    productName: 'Electricity Bill',
    category: 'Utility',
    amount: 7100.00,
    type: 'expense'
  }
]

const initialRevenue = [
  {
    id: '1',
    date: '2026-03-23',
    serviceName: 'Full Detail - SUV',
    amount: 5000.00,
    type: 'revenue'
  },
  {
    id: '2',
    date: '2026-03-23',
    serviceName: 'Oil Change - Van',
    amount: 1200.00,
    type: 'revenue'
  }
]

function FinancialReport() {
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_expenses`)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Error parsing saved expenses:', e)
        return initialExpenses
      }
    }
    return initialExpenses
  })
  
  const [revenue, setRevenue] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_revenue`)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Error parsing saved revenue:', e)
        return initialRevenue
      }
    }
    return initialRevenue
  })
  
  const [search, setSearch] = useState('')
  const [amountSearch, setAmountSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editExpenseId, setEditExpenseId] = useState(null)

  const [formData, setFormData] = useState({
    date: '',
    productName: '',
    category: '',
    amount: ''
  })

  // Save to localStorage whenever expenses or revenue change
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_expenses`, JSON.stringify(expenses))
    } catch (e) {
      console.error('Error saving expenses to localStorage:', e)
    }
  }, [expenses])

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_revenue`, JSON.stringify(revenue))
    } catch (e) {
      console.error('Error saving revenue to localStorage:', e)
    }
  }, [revenue])

  // Sync Payroll data into expenses
  useEffect(() => {
    const syncPayrollExpense = () => {
      try {
        const savedPayroll = localStorage.getItem('payrollData_employees')
        if (savedPayroll) {
          const employees = JSON.parse(savedPayroll)
          const totalPayroll = employees.reduce((sum, emp) => sum + (emp.netPay || 0), 0)
          
          setExpenses(prevExpenses => {
            // Check if we already have an auto-generated salary expense
            const autoSalaryIndex = prevExpenses.findIndex(exp => exp.id === 'auto-payroll-expense')
            
            if (totalPayroll > 0) {
              if (autoSalaryIndex >= 0) {
                // Update existing
                const updated = [...prevExpenses]
                updated[autoSalaryIndex] = {
                  ...updated[autoSalaryIndex],
                  amount: totalPayroll,
                  date: new Date().toISOString().split('T')[0] // updating to today's date or leave it?
                }
                return updated
              } else {
                // Create new
                return [
                  ...prevExpenses,
                  {
                    id: 'auto-payroll-expense',
                    date: new Date().toISOString().split('T')[0],
                    productName: 'Total Employee Payroll (Auto)',
                    category: 'Salary',
                    amount: totalPayroll,
                    type: 'expense'
                  }
                ]
              }
            } else if (autoSalaryIndex >= 0) {
              // Remove if total is 0
              return prevExpenses.filter(exp => exp.id !== 'auto-payroll-expense')
            }
            return prevExpenses
          })
        }
      } catch (e) {
        console.error('Error syncing payroll expense:', e)
      }
    }

    // Initial sync
    syncPayrollExpense()

    // Listen for custom event from Payroll module
    window.addEventListener('payrollUpdated', syncPayrollExpense)
    return () => window.removeEventListener('payrollUpdated', syncPayrollExpense)
  }, [])

  // Calculate totals
  const totalRevenue = revenue.reduce((sum, item) => sum + item.amount, 0)
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0)
  const netProfit = totalRevenue - totalExpenses

  const openCreateForm = () => {
    setEditExpenseId(null)
    setFormData({
      date: new Date().toISOString().split('T')[0],
      productName: '',
      category: '',
      amount: ''
    })
    setIsModalOpen(true)
  }

  const openEditForm = (expense) => {
    setEditExpenseId(expense.id)
    setFormData({
      date: expense.date,
      productName: expense.productName,
      category: expense.category,
      amount: expense.amount
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditExpenseId(null)
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()

    if (!formData.productName.trim() || !formData.category.trim() || !formData.amount || !formData.date) {
      alert('Please complete all fields.')
      return
    }

    const amountNum = parseFloat(formData.amount)

    if (editExpenseId) {
      setExpenses((prev) =>
        prev.map((item) =>
          item.id === editExpenseId
            ? { 
                ...item, 
                date: formData.date,
                productName: formData.productName,
                category: formData.category,
                amount: amountNum
              }
            : item
        )
      )
      setEditExpenseId(null)
    } else {
      const newExpense = {
        id: Date.now().toString(),
        date: formData.date,
        productName: formData.productName,
        category: formData.category,
        amount: amountNum,
        type: 'expense'
      }
      setExpenses((prev) => [...prev, newExpense])
    }

    setIsModalOpen(false)
  }

  const handleDelete = (id, productName) => {
    if (window.confirm(`Are you sure you want to delete ${productName}?`)) {
      setExpenses((prev) => prev.filter((item) => item.id !== id))
    }
  }

  const filteredExpenses = expenses
    .filter((expense) => {
      if (filterCategory !== 'All') return expense.category === filterCategory
      return true
    })
    .filter((expense) => {
      const term = search.toLowerCase()
      return (
        expense.productName.toLowerCase().includes(term) ||
        expense.category.toLowerCase().includes(term)
      )
    })
    .filter((expense) => {
      if (!amountSearch) return true
      const amountStr = expense.amount.toString()
      return amountStr.includes(amountSearch)
    })

  const uniqueCategories = ['All', ...new Set(expenses.map(e => e.category))]

  return (
    <div className="financial-wrap">
     {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card revenue-card">
          <h4>Total Service Revenue</h4>
          <p className="summary-amount">₱{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="summary-card expense-card">
          <h4>Total Operational Costs</h4>
          <p className="summary-amount negative">
            {totalExpenses > 0 ? `-₱${totalExpenses.toLocaleString()}` : `₱${totalExpenses.toLocaleString()}`}
          </p>
        </div>
        <div className="summary-card profit-card">
          <h4>Net Profit</h4>
          <p className={`summary-amount ${netProfit >= 0 ? 'positive' : 'negative'}`}>
            {netProfit >= 0 ? `₱${netProfit.toLocaleString()}` : `-₱${Math.abs(netProfit).toLocaleString()}`}
          </p>
        </div>
      </div>

      {/* Expenses Section */}
      <div className="expenses-section">
        <div className="expenses-header">
          <h3>Record New Expense</h3>
          <div className="expenses-controls">
            <input
              className="expenses-search"
              placeholder="Search by name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <input
              className="expenses-amount-search"
              placeholder="Search by amount..."
              value={amountSearch}
              onChange={(e) => setAmountSearch(e.target.value)}
              type="number"
              step="0.01"
            />
            <select
              className="expenses-filter"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button className="primary-btn" onClick={openCreateForm}>Add Expense</button>
          </div>
        </div>

        <table className="expenses-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Product/Service Name</th>
              <th>Category</th>
              <th>Amount (₱)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((expense) => (
              <tr key={expense.id}>
                <td>{expense.date}</td>
                <td className="product-name-cell">{expense.productName}</td>
                <td>
                  <span className={`category-badge ${expense.category.toLowerCase()}`}>
                    {expense.category}
                  </span>
                </td>
                <td className="amount-cell">₱{expense.amount.toLocaleString()}</td>
                <td className="expense-actions">
                  <button className="link-btn" onClick={() => openEditForm(expense)}>Edit</button>
                  <button className="link-btn delete" onClick={() => handleDelete(expense.id, expense.productName)}>Delete</button>
                </td>
              </tr>
            ))}
            {filteredExpenses.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                  No expenses found.
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
            <h3>{editExpenseId ? 'Edit Expense' : 'Add New Expense'}</h3>
            <form onSubmit={handleFormSubmit} className="modal-form">
              <div className="modal-row">
                <label>Date</label>
                <input 
                  type="date" 
                  value={formData.date} 
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required 
                />
              </div>
              <div className="modal-row">
                <label>Product/Service Name</label>
                <input 
                  value={formData.productName} 
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })} 
                  placeholder="e.g., Staff Salary, Water Bill"
                  required 
                />
              </div>
              <div className="modal-row">
                <label>Category</label>
                <select 
                  value={formData.category} 
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Salary">Salary</option>
                  <option value="Utility">Utility</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Supplies">Supplies</option>
                  <option value="Rent">Rent</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="modal-row">
                <label>Amount (₱)</label>
                <div className="amount-input-wrapper">
                  <span className="amount-currency">₱</span>
                  <input 
                    type="number" 
                    value={formData.amount} 
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    required 
                    step="0.01"
                    min="0"
                    className="amount-input-field"
                  />
                </div>
              </div>
              <div className="buttons-row">
                <button type="submit" className="primary-btn">{editExpenseId ? 'Save Changes' : 'Add Expense'}</button>
                <button type="button" onClick={closeModal}>Cancel</button>
                {editExpenseId && (
                  <button 
                    type="button" 
                    className="delete-btn"
                    onClick={() => {
                      const expense = expenses.find(e => e.id === editExpenseId)
                      if (window.confirm(`Delete ${expense?.productName}?`)) {
                        handleDelete(editExpenseId, expense?.productName)
                        closeModal()
                      }
                    }}
                  >
                    Delete Expense
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default FinancialReport