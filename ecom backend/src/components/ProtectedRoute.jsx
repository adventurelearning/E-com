import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isLoggedIn, getAdminInfo } from '../utils/auth';

const ProtectedRoute = ({ children, requiredPermission }) => {
  const location = useLocation();
  const adminInfo = getAdminInfo();
  
  if (!isLoggedIn()) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  
  // Check permissions if required
  if (requiredPermission) {
    const hasPermission = adminInfo?.role === 'admin' || 
                          adminInfo?.permissions?.includes(requiredPermission);
    
    if (!hasPermission) {
      return <Navigate to="/" replace />;
    }
  }
  
  return children;
};

export default ProtectedRoute;