import React from 'react';

const StatusBadge = ({ isActive }) => {
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${
      isActive 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
    }`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
};

export default StatusBadge;