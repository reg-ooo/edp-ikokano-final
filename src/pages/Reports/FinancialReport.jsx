// FinancialReport.jsx
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import './FinancialReport.css'

const STORAGE_KEY = 'financialReportData'

const initialExpenses = [
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
        const parsed = JSON.parse(saved)
        return parsed.filter(exp => exp.productName !== 'Staff Salary (Week 3)')
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
  const [viewExpense, setViewExpense] = useState(null)

  // keep localStorage saving (unchanged behavior)
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_expenses`, JSON.stringify(expenses))
    } catch (e) {
      console.error('Error saving expenses:', e)
    }
  }, [expenses])

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_revenue`, JSON.stringify(revenue))
    } catch (e) {
      console.error('Error saving revenue:', e)
    }
  }, [revenue])

  // scroll lock (updated)
  useEffect(() => {
    const isOpen = !!viewExpense
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [viewExpense])

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


  // totals
  const totalRevenue = revenue.reduce((sum, item) => sum + item.amount, 0)
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0)
  const netProfit = totalRevenue - totalExpenses

  const openViewPanel = (expense) => setViewExpense(expense)
  const closeViewPanel = () => setViewExpense(null)

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
      return expense.amount.toString().includes(amountSearch)
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
            {netProfit >= 0
              ? `₱${netProfit.toLocaleString()}`
              : `-₱${Math.abs(netProfit).toLocaleString()}`}
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
                  <button className="view-btn" onClick={() => openViewPanel(expense)}>View</button>
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

      {/* View Modal */}
      {viewExpense && createPortal(
        <div className="modal-overlay" onClick={closeViewPanel}>
          <div className="modal detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-header">
              <h3>Expense Details</h3>
              <button className="detail-close-btn" onClick={closeViewPanel}>✕</button>
            </div>

            <div className="detail-name">{viewExpense.productName}</div>
            <div className="detail-role">{viewExpense.category}</div>

            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Date</span>
                <span className="detail-value">{viewExpense.date}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Amount</span>
                <span className="detail-value">₱{viewExpense.amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="detail-actions">
              <button className="cancel-btn" onClick={closeViewPanel}>
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  )
}

export default FinancialReport