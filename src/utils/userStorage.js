// utils/userStorage.js
const USERS_STORAGE_KEY = 'carwash_users';

// Get all users from localStorage
export const getUsers = () => {
  try {
    const users = localStorage.getItem(USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : [
      { id: 1, name: 'Admin User', email: 'admin@carwash.com', role: 'Administrator', password: 'admin123' },
      { id: 2, name: 'Juan Dela Cruz', email: 'juan@carwash.com', role: 'Staff', password: 'staff123' },
      { id: 3, name: 'Maria Santos', email: 'maria@carwash.com', role: 'Staff', password: 'staff123' },
      { id: 4, name: 'Jose Rizal', email: 'jose@carwash.com', role: 'Staff', password: 'staff123' }
    ];
  } catch (error) {
    console.error('Error getting users from localStorage:', error);
    return [];
  }
};

// Save users to localStorage
export const saveUsers = (users) => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users to localStorage:', error);
  }
};

// Add a new user
export const addUser = (userData) => {
  const users = getUsers();
  const newUser = {
    id: Date.now(), // Simple ID generation
    ...userData
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
};

// Update an existing user
export const updateUser = (id, updatedData) => {
  const users = getUsers();
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updatedData };
    saveUsers(users);
    return users[index];
  }
  return null;
};

// Delete a user
export const deleteUser = (id) => {
  const users = getUsers();
  const filteredUsers = users.filter(user => user.id !== id);
  saveUsers(filteredUsers);
  return filteredUsers;
};

// Get a user by ID
export const getUserById = (id) => {
  const users = getUsers();
  return users.find(user => user.id === id);
};

// Get users by role
export const getUsersByRole = (role) => {
  const users = getUsers();
  return users.filter(user => user.role === role);
};

// Search users
export const searchUsers = (searchTerm) => {
  const users = getUsers();
  const term = searchTerm.toLowerCase();
  return users.filter(user =>
    user.name.toLowerCase().includes(term) ||
    user.email.toLowerCase().includes(term) ||
    user.role.toLowerCase().includes(term)
  );
};