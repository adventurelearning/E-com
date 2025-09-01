const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');
const User = require('../models/User');

// Protect: Checks if user is logged in
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // Log the authorization header (mask the token for security)
  if (authHeader) {
    const tokenParts = authHeader.split(' ');
    const maskedToken = tokenParts.length > 1 
      ? tokenParts[0] + ' ' + tokenParts[1].substring(0, 10) + '...' 
      : 'Invalid format';
    console.log("Authorization header:", maskedToken);
  } else {
    console.log("Authorization header: Not provided");
  }

  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return res.status(401).json({ 
      success: false,
      message: 'No token provided, authorization denied' 
    });
  }

  const token = authHeader.split(' ')[1];

  // Check if token exists
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'No token, authorization denied' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded user ID:", decoded.id);

    // Try to find user in AdminUser collection first
    let user = await AdminUser.findById(decoded.id).select('-password');
    
    // If not found in AdminUser, try User collection
    if (!user) {
      user = await User.findById(decoded.id).select('-password');
    }

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Check if user is active
    if (user.isActive === false) {
      return res.status(401).json({ 
        success: false,
        message: 'Account is deactivated, please contact administrator' 
      });
    }

    req.user = user;
    console.log("Authenticated user:", user.name, "- Role:", user.role);
    
    next(); // Continue to next handler
  } catch (err) {
    console.error("Token verification error:", err.message);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired, please login again' 
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token' 
      });
    }
    
    return res.status(401).json({ 
      success: false,
      message: 'Not authorized, token failed' 
    });
  }
};

// Require Role: Checks if user has the required role
const requireRole = (role) => {
  console.log("Role required:", role);
  
  return (req, res, next) => {
    console.log("Checking user role:", req.user ? req.user.role : 'No user');
    
    if (!req.user) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied: authentication required' 
      });
    }
    
    if (req.user.role !== role) {
      return res.status(403).json({ 
        success: false,
        message: `Access denied: ${role} role required` 
      });
    }
    
    next();
  };
};

// Optional: Middleware to require any of multiple roles
const requireAnyRole = (roles) => {
  console.log("Any of these roles required:", roles);
  
  return (req, res, next) => {
    console.log("Checking user role:", req.user ? req.user.role : 'No user');
    
    if (!req.user) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied: authentication required' 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: `Access denied: required roles are ${roles.join(', ')}` 
      });
    }
    
    next();
  };
};

// Optional: Middleware to check if user is the owner or has admin role
const requireOwnershipOrAdmin = (paramName = 'id') => {
  return (req, res, next) => {
    const resourceId = req.params[paramName];
    
    // Allow if user is admin
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Allow if user owns the resource
    if (req.user._id.toString() === resourceId) {
      return next();
    }
    
    return res.status(403).json({ 
      success: false,
      message: 'Access denied: not owner or administrator' 
    });
  };
};

module.exports = {
  protect,
  requireRole,
  requireAnyRole,
  requireOwnershipOrAdmin
};