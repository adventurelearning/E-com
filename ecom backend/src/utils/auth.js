// src/utils/auth.js
export const isLoggedIn = () => !!localStorage.getItem('adminToken');
console.log('isLoggedIn:', isLoggedIn());
console.log('adminToken:', localStorage.getItem('adminToken'));

export const getAdminInfo = () => {
  try {
    return JSON.parse(localStorage.getItem('adminInfo'));
  } catch {
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminInfo');
  localStorage.removeItem('token_expiry');
};
