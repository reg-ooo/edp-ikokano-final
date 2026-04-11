// Central menu configuration
export const categories = [
  {
    id: 'bookings',
    label: 'Bookings',
    hasDropdown: true,
    submenu: [
      { id: 'manage-bookings', label: 'Manage Bookings', component: 'Bookings/ManageBookings' }
    ]
  },
  { 
    id: 'payroll', 
    label: 'Payroll', 
    component: 'Payroll'
  }
]