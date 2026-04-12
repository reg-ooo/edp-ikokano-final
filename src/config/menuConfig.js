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
      { id: 'inventory-report', label: 'InventoryReport', component: 'Reports/InventoryReport' }
    ]
  }
]