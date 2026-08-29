import axios from 'axios';
import constants from '../constants';

const API = axios.create({
    baseURL: `${constants.HOST}/user`,
});

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

// Fetch users
export const fetchUsers = (params = {}) => API.get('/', { params });
// Create user
export const createUser = (user) => API.post('/register', {...user, confirmPassword: user.password});
// Update user
export const updateUser = (id, user) =>
  API.put(`/${id}`, user, authHeaders());
// Update user password
export const changePassword = (id, passwordData) =>
  API.put(`/${id}/change-password`, passwordData, authHeaders());
// Delete user
export const deleteUser = (id) => API.delete(`/${id}`);
// Login user
export const loginUser = (credentials) => API.post('/login', credentials);