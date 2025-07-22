import axios from 'axios';
import { toast } from 'react-toastify';

const Api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE_URL,
});

// Add the token dynamically for each request + check expiry
Api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const expiry = localStorage.getItem('token_expiry');

  // If token exists, check if expired
  if (token) {
    if (expiry && Date.now() > Number(expiry)) {
      toast.error('Session expired. Please login again.');

      // Token has expired — remove all auth-related items
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token_expiry');
      
      // Redirect to login after toast shows
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      
      return Promise.reject(new Error('Token expired'));
    }

    // Token is valid - add to headers
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default Api;