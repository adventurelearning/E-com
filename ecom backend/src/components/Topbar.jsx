import { Avatar, IconButton } from '@mui/material';
import React, { useEffect, useState } from 'react';
import {
  FiMenu,
  FiX,
  FiBell,
  FiLogOut,
} from 'react-icons/fi';
import { logout } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

const Topbar = ({ toggleSidebar, themeMode, sidebarOpen }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show full topbar content only if sidebar is closed or in mobile view
  const shouldShowContent = isMobile || !sidebarOpen;

  // Adjust width: full on mobile or when sidebar is closed; else subtract sidebar width
  const topbarWidth = shouldShowContent ? 'w-full' : 'md:ml-64 w-full md:w-[calc(100%-256px)]';

  return (
    <div
      className={`fixed top-0 left-0 h-16 z-40 bg-white border-b border-gray-200 shadow-sm transition-all ${topbarWidth}`}
    >
      <div className="flex items-center justify-between h-full px-4">
        {/* Left: Menu or Close icon */}
        <div className="flex items-center gap-3">
          {shouldShowContent && (

            <button
              onClick={toggleSidebar}
              className="text-gray-700 hover:text-black focus:outline-none text-xl"
            >
              {sidebarOpen ? <FiX /> : <FiMenu />}
            </button>
          )}

          {/* Show title only when sidebar is closed or on mobile */}
          {shouldShowContent && (
            <h1 className="text-lg font-semibold text-gray-800 mt-2">Admin Panel</h1>
          )}
        </div>

        {/* Right section: only show in mobile view or when sidebar is closed */}
        <div className="flex items-center gap-4">

          <button
            onClick={() => {
              logout();                     // Clear token and user info
              navigate('/admin/login');     // Redirect to login
            }}
            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 px-2 py-1 border-2 border-red-200 hover:border-red-400 rounded transition"
          >
            <FiLogOut className="text-lg" />
            Logout
          </button>
          <IconButton color="inherit">
            <Avatar alt="Admin User" src="/static/images/avatar/1.jpg" />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
