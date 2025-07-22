import axios from 'axios';
import { toast } from 'react-toastify';

const Api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE_URL,
});
// Add the token dynamically for each request + check expiry
Api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  const expiry = localStorage.getItem('token_expiry');

  // If token exists, check if expired
  if (token) {
    if (expiry && Date.now() > Number(expiry)) {
            toast.error('Session expired. Please login again.');

      // 🔴 Token has expired — remove and optionally redirect
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminInfo');
      localStorage.removeItem('token_expiry');
      // Optional redirect or logout logic:
      setTimeout(() => {
        window.location.href = '/admin/login';
      }, 1500); // delay for toast to show
      return Promise.reject(new Error('Token expired'));
    }

    // ✅ Token is valid
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default Api;
