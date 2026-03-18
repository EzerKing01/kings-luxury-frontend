import axios from 'axios';

// Get base URL from environment variable, fallback to localhost for development
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const API = axios.create({ baseURL: BASE_URL });

// Log all requests in development (optional)
API.interceptors.request.use((req) => {
  console.log(`Making ${req.method.toUpperCase()} request to:`, req.url);
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

/**
 * Constructs a full image URL from a stored path.
 * Handles both single filenames and paths that already include 'uploads/'.
 * Returns null if path is falsy.
 */
export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path; // already absolute
  // Remove any leading slashes
  const cleanPath = path.replace(/^\/+/, '');
  // If the path already includes 'uploads/', don't add it again
  if (cleanPath.startsWith('uploads/')) {
    return `${BASE_URL}/${cleanPath}`;
  }
  // Otherwise, assume it's just a filename
  return `${BASE_URL}/uploads/${cleanPath}`;
};

/**
 * Helper for multiple images – returns an array of full URLs.
 */
export const getImageUrls = (paths) => {
  if (!paths || !Array.isArray(paths)) return [];
  return paths.map(path => getImageUrl(path));
};

// Public endpoints
export const fetchRooms = () => API.get('/rooms');
export const fetchRoom = (id) => API.get(`/rooms/${id}`);
export const fetchMenu = () => API.get('/restaurant/menu');

// Authentication
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/signup', data);

// Bookings & Orders (authenticated)
export const createBooking = (data) => API.post('/bookings', data);
export const createOrder = (data) => API.post('/restaurant/orders', data);
export const fetchUserBookings = () => API.get('/bookings/user');
export const fetchUserOrders = () => API.get('/restaurant/orders/user');

// Admin endpoints
export const fetchStats = () => API.get('/admin/stats');

// Rooms admin (with multiple file upload)
export const createRoom = (data) => {
  return API.post('/rooms', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateRoom = (id, data) => {
  return API.put(`/rooms/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteRoom = (id) => API.delete(`/rooms/${id}`);

// Menu admin (with multiple file upload)
export const createMenuItem = (data) => {
  return API.post('/restaurant/menu', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateMenuItem = (id, data) => {
  return API.put(`/restaurant/menu/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteMenuItem = (id) => API.delete(`/restaurant/menu/${id}`);