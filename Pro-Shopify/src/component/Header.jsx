import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import logo from '../assets/ADV E-Commerce logo.svg';
import logo from '../assets/Group 12.svg';
import Search from './Search';
import { MdOutlineShoppingCart, MdMenu, MdClose, MdAccountCircle, MdDeleteForever, MdHelpCenter } from "react-icons/md";
import { IoGitCompareOutline } from "react-icons/io5";
import { FaRegHeart, FaUser, FaSignOutAlt, FaShoppingBag, FaHeart } from "react-icons/fa";
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useSnackbar } from 'notistack';
import Api from '../Services/Api';

const Header = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileAnchorEl, setMobileAnchorEl] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const { cartCount, fetchCartCount } = useCart();
  const { enqueueSnackbar } = useSnackbar();
  const open = Boolean(anchorEl);
  const mobileOpenMenu = Boolean(mobileAnchorEl);
  const { wishlistCount } = useWishlist();

  useEffect(() => {
    const checkAuthState = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token) {
        const expiry = localStorage.getItem('token_expiry');
        if (expiry && Date.now() > parseInt(expiry)) {
          handleLogout();
          return;
        }

        setIsLoggedIn(true);
        if (userData) {
          setUser(JSON.parse(userData));
        } else {
          fetchUserData();
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    checkAuthState();
    fetchCartCount();

    const handleStorageChange = () => {
      checkAuthState();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchCartCount]);

  const fetchUserData = async () => {
    try {
      const response = await Api.get('/users/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const userData = response.data.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error fetching user data:', error);
      handleLogout();
    }
  };

  const handleLoginClick = () => navigate('/login');

  const handleLogout = async () => {
    try {
      await Api.put('/users/logout', {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('token_expiry');
      localStorage.removeItem('user');

      setIsLoggedIn(false);
      setUser(null);
      handleClose();
      handleMobileMenuClose();

      window.dispatchEvent(new Event('storage'));
      navigate('/');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await Api.delete('/users/delete-account', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setUser(null);
      setDeleteConfirmOpen(false);
      handleClose();
      handleMobileMenuClose();
      enqueueSnackbar('Account deleted successfully', { variant: 'success' });
      navigate('/');
    } catch (error) {
      console.error('Delete account error:', error);
      enqueueSnackbar('Failed to delete account', { variant: 'error' });
    }
  };

  useEffect(() => {
    Api.get('/logo').then((res) => {
      console.log(res.data);
    })
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClick = (event) => {
    setMobileAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuClose = () => {
    setMobileAnchorEl(null);
  };

  const drawer = ( 
    <div className="w-72 h-full flex flex-col">
      <div className="flex justify-between items-center p-4 bg-gray-50">
        <Link to="/" onClick={handleDrawerToggle}>
          <img src={logo} alt="Logo" className="w-32" />
        </Link>
        <button onClick={handleDrawerToggle} className="text-gray-600 p-1">
          <MdClose className="text-xl" />
        </button>
      </div>

      <hr className="border-gray-200" />

      <div className="flex-grow overflow-y-auto">
        <div className="p-4">
          <Search fullWidth />
        </div>

        {isLoggedIn ? (
          <>
            <div className="p-2">
              <button
                className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded flex items-center justify-center"
                onClick={handleLogout}
              >
                <FaSignOutAlt className="mr-2" />
                Logout
              </button>
            </div>
            <div className="p-2">
              <Link to="/profile" className="w-full" onClick={handleDrawerToggle}>
                <button className="w-full text-left py-2 px-4 rounded flex items-center hover:bg-gray-100">
                  <FaUser className="mr-2" /> My Profile
                </button>
              </Link>
            </div>
            <div className="p-2">
              <Link to="/orders" className="w-full" onClick={handleDrawerToggle}>
                <button className="w-full text-left py-2 px-4 rounded flex items-center hover:bg-gray-100">
                  <FaShoppingBag className="mr-2" /> My Orders
                </button>
              </Link>
            </div>
            <div className="p-2">
              <Link to="/wishlist" className="w-full" onClick={handleDrawerToggle}>
                <button className="w-full text-left py-2 px-4 rounded flex items-center hover:bg-gray-100">
                  <FaHeart className="mr-2" /> Wishlist
                </button>
              </Link>
            </div>
          </>
        ) : (
          <div className="p-2">
            <button
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded flex items-center justify-center"
              onClick={() => {
                handleDrawerToggle();
                handleLoginClick();
              }}
            >
              <MdAccountCircle className="mr-2" />
              Login
            </button>
          </div>
        )}

        <div className="p-2">
          <Link to="/help-center" className="w-full" onClick={handleDrawerToggle}>
            <button className="w-full text-left py-2 px-4 rounded hover:bg-gray-100">
              Help Center
            </button>
          </Link>
        </div>
        <div className="p-2">
          <Link to="/orders" className="w-full" onClick={handleDrawerToggle}>
            <button className="w-full text-left py-2 px-4 rounded hover:bg-gray-100">
              Order Tracking
            </button>
          </Link>
        </div>
      </div>

      <hr className="border-gray-200" />

      <div className="flex justify-around p-4 bg-gray-50">
        <Link to="/wishlist" onClick={handleDrawerToggle} className="relative p-2">
          <FaRegHeart className="text-xl text-gray-700" />
          {wishlistCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {wishlistCount}
            </span>
          )}
        </Link>

        <Link to="/addtocart" onClick={handleDrawerToggle} className="relative p-2">
          <MdOutlineShoppingCart className="text-xl text-gray-700" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  );

  return (
    <header className="bg-white shadow-sm w-full">
      {/* Top Strip */}
      <div className="top-strip py-2 px-4 border-b border-gray-200 bg-gray-50 hidden md:block">
        <div className=" mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="w-full md:w-1/2">
              <p className="text-xs md:text-sm font-medium text-gray-600">
                Get up to 50% off Opening sales, limited time only
              </p>
            </div>
            <div className="hidden md:flex items-center justify-end space-x-4">
              <Link to="/help-center" className="text-xs md:text-sm font-medium text-gray-600 hover:text-primary transition">
                Help Center
              </Link>
              <Link to="/orders" className="text-xs md:text-sm font-medium text-gray-600 hover:text-primary transition">
                Order Tracking
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="header py-3 border-b border-gray-200">
        <div className=" mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex-1 md:flex-none md:w-1/4 flex justify-center md:justify-start">
              <Link to="/">
                <img
                  src={logo}
                  alt="Logo"
                  className="h-12 md:h-16 w-auto transition-transform hover:scale-105"
                />
              </Link>
            </div>

            {/* Search - Hidden on mobile */}
            <div className="hidden md:block md:w-2/5 lg:w-2/5">
              <Search />
            </div>

            {/* Action Buttons */}
            <div className="flex-1 md:flex-none md:w-1/4 flex justify-end items-center space-x-1 md:space-x-3">
              {isLoggedIn ? (
                <>
                  {/* Desktop User Menu */}
                  <div className="hidden md:flex items-center">
                    <button
                      onClick={handleClick}
                      className="flex items-center text-gray-700 hover:text-primary transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm mr-2">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{user?.name}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="ml-1"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                  </div>

                  {/* Mobile User Icon */}
                  <button
                    onClick={handleMobileMenuClick}
                    className="md:hidden text-gray-700 hover:text-primary"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLoginClick}
                  className="hidden md:flex items-center bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded"
                >
                  <MdAccountCircle className="mr-2" />
                  Login
                </button>
              )}

              <button
                onClick={(e) => {
                  e.preventDefault();
                  const token = localStorage.getItem('token');
                  if (!token) {
                    navigate('/login', { state: { from: '/wishlist' } });
                  } else {
                    navigate('/wishlist');
                  }
                }}
                className="relative p-2 text-gray-700 hover:text-primary"
              >
                <FaRegHeart className="text-xl" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>

              <Link
                to="/addtocart"
                className="relative p-2 text-gray-700 hover:text-primary"
              >
                <MdOutlineShoppingCart className="text-xl" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Search - Visible only on mobile */}
          <div className="flex items-center justify-between md:hidden px-4 py-3 bg-white shadow-sm">

            {/* Search Bar - full width with flex-grow */}
            {/* <div className="flex-1 mx-2">
              <Search fullWidth />
            </div> */}
          </div>
        </div>
      </div>

      {/* Desktop User Menu */}
      {anchorEl && (
        <div
          className="fixed inset-0 z-50"
          onClick={handleClose}
          style={{ display: open ? 'block' : 'none' }}
        >
          <div
            className="absolute right-4 top-16 bg-white rounded-md shadow-lg py-2 w-56 z-50 border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                navigate('/profile');
                handleClose();
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center"
            >
              <FaUser className="mr-3 text-gray-600" />
              <span className="text-sm">My Profile</span>
            </button>
            <button
              onClick={() => {
                navigate('/orders');
                handleClose();
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center"
            >
              <FaShoppingBag className="mr-3 text-gray-600" />
              <span className="text-sm">Orders</span>
            </button>
            <button
              onClick={() => {
                navigate('/wishlist');
                handleClose();
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center"
            >
              <FaHeart className="mr-3 text-gray-600" />
              <span className="text-sm">Wishlist</span>
            </button>
            <button
              onClick={() => {
                navigate('/orders');
                handleClose();
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center"
            >
              <FaHeart className="mr-3 text-gray-600" />
              <span className="text-sm">Tracking Order</span>
            </button>
            <button
              onClick={() => {
                navigate('/help-center');
                handleClose();
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center"
            >
              <MdHelpCenter className="mr-3 text-gray-600" />
              <span className="text-sm">Help Center</span>
            </button>
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center text-red-600"
            >
              <MdDeleteForever className="mr-3" />
              <span className="text-sm">Delete Account</span>
            </button>
            <hr className="my-1 border-gray-200" />
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center text-red-600"
            >
              <FaSignOutAlt className="mr-3" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile User Menu */}
      {mobileAnchorEl && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50"
          onClick={handleMobileMenuClose}
          style={{ display: mobileOpenMenu ? 'block' : 'none' }}
        >
          <div
            className="absolute right-0 top-0 h-full bg-white w-64 shadow-lg z-50 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-medium">Menu</h3>
              <button onClick={handleMobileMenuClose} className="text-gray-600">
                <MdClose className="text-xl" />
              </button>
            </div>
            <div className="py-2">
              <button
                onClick={() => {
                  navigate('/profile');
                  handleMobileMenuClose();
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center"
              >
                <FaUser className="mr-3 text-gray-600" />
                <span className="text-sm">My Profile</span>
              </button>
              <button
                onClick={() => {
                  navigate('/orders');
                  handleMobileMenuClose();
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center"
              >
                <FaShoppingBag className="mr-3 text-gray-600" />
                <span className="text-sm">Orders</span>
              </button>
              <button
                onClick={() => {
                  navigate('/wishlist');
                  handleMobileMenuClose();
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center"
              >
                <FaHeart className="mr-3 text-gray-600" />
                <span className="text-sm">Wishlist</span>
              </button>
              <button
                onClick={() => {
                  navigate('/help-center');
                  handleMobileMenuClose();
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center"
              >
                <MdHelpCenter className="mr-3 text-gray-600" />
                <span className="text-sm">Help Center</span>
              </button>
              <button
                onClick={() => setDeleteConfirmOpen(true)}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center text-red-600"
              >
                <MdDeleteForever className="mr-3" />
                <span className="text-sm">Delete Account</span>
              </button>
              <hr className="my-1 border-gray-200" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center text-red-600"
              >
                <FaSignOutAlt className="mr-3" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-2">Are you sure you want to delete your account?</h3>
            <p className="text-gray-600 mb-4">
              This action cannot be undone. All your data will be permanently removed.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleDrawerToggle}></div>
          <div className="relative z-10 h-full">
            {drawer}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;