// Central menu configuration
export const categories = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    component: 'Dashboard'
  },
  {
    id: 'bookings',
    label: 'Bookings',
    hasDropdown: true,
    submenu: [
      { id: 'manage-bookings', label: 'Manage Bookings', component: 'Bookings/ManageBookings' },
      { id: 'manage-services', label: 'Manage Services', component: 'Bookings/ManageServices' }
    ]
  },
  { 
    id: 'inventory', 
    label: 'Inventory & Products', 
    component: 'Inventory'
  },
  { 
    id: 'payroll', 
    label: 'Payroll', 
    component: 'Payroll'
  },
  {
    id: 'reports',
    label: 'Reports',
    hasDropdown: true,
    submenu: [
      { id: 'booking-report', label: 'Booking Report', component: 'Reports/BookingReport' },
      { id: 'financial-report', label: 'Financial Report', component: 'Reports/FinancialReport' },
      { id: 'inventory-report', label: 'Inventory Report', component: 'Reports/InventoryReport' },
      { id: 'staff-report', label: 'Staff Report', component: 'Reports/StaffReport' }
    ]
  },
  { 
    id: 'account', 
    label: 'Account Management', 
    component: 'AccountManagement'
  }
]