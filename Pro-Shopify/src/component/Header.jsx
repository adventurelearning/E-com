
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo3.png';
import Search from './Search';
import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { MdOutlineShoppingCart, MdMenu, MdClose, MdAccountCircle, MdDeleteForever, MdHelpCenter } from "react-icons/md";
import { IoGitCompareOutline } from "react-icons/io5";
import { FaRegHeart, FaUser, FaSignOutAlt, FaShoppingBag, FaHeart } from "react-icons/fa";
import Tooltip from '@mui/material/Tooltip';
import { useCart } from '../context/CartContext';
import {
  useMediaQuery,
  Box,
  Drawer,
  List,
  ListItem,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  ListItemIcon,
  Chip
} from '@mui/material';
import { useSnackbar } from 'notistack';
import Api from '../Services/Api';
import { useWishlist } from '../context/WishlistContext';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 5,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
    fontSize: '0.6rem',
    backgroundColor: '#d10024',
    color: 'white',
  },
}));

const Header = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:768px)');
  const isTablet = useMediaQuery('(max-width:1024px)');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileAnchorEl, setMobileAnchorEl] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const { cartCount, cartError, fetchCartCount, resetCart } = useCart();
  const { enqueueSnackbar } = useSnackbar();
  const open = Boolean(anchorEl);
  const mobileOpenMenu = Boolean(mobileAnchorEl);
  const { wishlistCount } = useWishlist();

  useEffect(() => {
    const checkAuthState = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token) {
        // Check token expiration
        const expiry = localStorage.getItem('token_expiry');
        if (expiry && Date.now() > parseInt(expiry)) {
          // Token expired
          handleLogout();
          return;
        }

        setIsLoggedIn(true);
        if (userData) {
          setUser(JSON.parse(userData));
        } else {
          // Fetch user data if not in localStorage
          fetchUserData();
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    checkAuthState();
    fetchCartCount();

    // Listen for storage events (login/logout from other tabs)
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
      handleLogout(); // Logout if token is invalid
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
      // Clear all auth-related data
      localStorage.removeItem('token');
      localStorage.removeItem('token_expiry');
      localStorage.removeItem('user');

      setIsLoggedIn(false);
      setUser(null);
      handleClose();
      handleMobileMenuClose();

      // Dispatch storage event to notify other tabs
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
    <Box sx={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="flex justify-between items-center p-4 bg-gray-50">
        <Link to="/" onClick={handleDrawerToggle}>
          <img src={logo} alt="Logo" className="w-32" />
        </Link>
        <IconButton onClick={handleDrawerToggle}>
          <MdClose className="text-gray-600" />
        </IconButton>
      </div>

      <Divider />

      <List sx={{ flexGrow: 1 }}>
        <ListItem>
          <Search fullWidth />
        </ListItem>

        {isLoggedIn ? (
          <>
            <ListItem>
              <Button
                fullWidth
                variant="contained"
                color="error"
                onClick={handleLogout}
                startIcon={<FaSignOutAlt />}
              >
                Logout
              </Button>
            </ListItem>
            <ListItem>
              <Link to="/profile" className="w-full" onClick={handleDrawerToggle}>
                <Button fullWidth startIcon={<FaUser />}>My Profile</Button>
              </Link>
            </ListItem>
            <ListItem>
              <Link to="/orders" className="w-full" onClick={handleDrawerToggle}>
                <Button fullWidth startIcon={<FaShoppingBag />}>My Orders</Button>
              </Link>
            </ListItem>
            <ListItem>
              <Link to="/wishlist" className="w-full" onClick={handleDrawerToggle}>
                <Button fullWidth startIcon={<FaHeart />}>Wishlist</Button>
              </Link>
            </ListItem>
          </>
        ) : (
          <ListItem>
            <Button
              fullWidth
              variant="contained"
              color="error"
              onClick={() => {
                handleDrawerToggle();
                handleLoginClick();
              }}
              startIcon={<MdAccountCircle />}
            >
              Login
            </Button>
          </ListItem>
        )}

        <ListItem>
          <Link to="/help-center" className="w-full" onClick={handleDrawerToggle}>
            <Button fullWidth>Help Center</Button>
          </Link>
        </ListItem>
        <ListItem>
          <Link to="/orders" className="w-full" onClick={handleDrawerToggle}>
            <Button fullWidth>Order Tracking</Button>
          </Link>
        </ListItem>
      </List>

      <Divider />

      <div className="flex justify-around p-4 bg-gray-50">
        <Tooltip title="Wishlist">
          <IconButton component={Link} to="/wishlist" onClick={handleDrawerToggle}>
            <StyledBadge badgeContent={wishlistCount} color="error">
              <FaRegHeart className="text-xl" />
            </StyledBadge>
          </IconButton>
        </Tooltip>

        <Tooltip title="Cart">
          <IconButton component={Link} to="/addtocart" onClick={handleDrawerToggle}>
            <StyledBadge badgeContent={cartCount} color="error">
              <MdOutlineShoppingCart className="text-xl" />
            </StyledBadge>
          </IconButton>
        </Tooltip>
      </div>
    </Box>
  );

  return (
    <header className='bg-white shadow-sm w-full'>
      {/* Top Strip */}
      <div className='top-strip py-2 border-b border-gray-200 bg-gray-50 hidden md:block'>
        <div className='container mx-auto px-4'>
          <div className='flex items-center justify-between'>
            <div className='w-full md:w-1/2'>
              <p className='text-xs md:text-sm font-medium text-gray-600'>
                Get up to 50% off Opening sales, limited time only
              </p>
            </div>
            <div className='hidden md:flex items-center justify-end space-x-4'>
              <Link to='/help-center' className='text-xs md:text-sm font-medium text-gray-600 hover:text-[#d10024] transition'>
                Help Center
              </Link>
              <Link to='/orders' className='text-xs md:text-sm font-medium text-gray-600 hover:text-[#d10024] transition'>
                Order Tracking
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className='header py-3 border-b border-gray-200'>
        <div className='container mx-auto px-4'>
          <div className='flex items-center justify-between'>
            {/* Mobile Menu Button */}
            {/* <div className='md:hidden flex items-center'>
              <IconButton onClick={handleDrawerToggle} className="text-gray-700">
                <MdMenu className="text-2xl" />
              </IconButton>
            </div> */}

            {/* Logo */}
            <div className='flex-1 md:flex-none md:w-1/4 flex justify-center md:justify-start'>
              <Link to='/'>
                <img
                  src={logo}
                  alt="Logo"
                  className='h-12 md:h-20 w-auto transition-transform hover:scale-105'
                />
              </Link>
            </div>

            {/* Search - Hidden on mobile */}
            <div className='hidden md:block md:w-2/5 lg:w-2/5'>
              <Search />
            </div>

            {/* Action Buttons */}
            <div className='flex-1 md:flex-none md:w-1/4 flex justify-end items-center space-x-1 md:space-x-3'>
              {isLoggedIn ? (
                <>
                  {/* Desktop User Menu */}
                  {!isMobile && (
                    <div className="flex items-center">
                      <Button
                        onClick={handleClick}
                        size="small"
                        sx={{
                          textTransform: 'none',
                          color: 'text.primary',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                          }
                        }}
                        startIcon={
                          <Avatar
                            sx={{
                              width: 30,
                              height: 30,
                              bgcolor: '#d10024',
                              fontSize: '0.875rem',
                              fontWeight: 'bold'
                            }}
                          >
                            {user?.name?.charAt(0).toUpperCase()}
                          </Avatar>
                        }
                        endIcon={
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
                          >
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        }
                      >
                        <span className="text-sm font-medium ml-1">{user?.name}</span>
                      </Button>
                    </div>
                  )}

                  {/* Mobile User Icon */}
                  {isMobile && (
                    <IconButton
                      size="medium"
                      onClick={handleMobileMenuClick}
                      className="text-gray-700 hover:text-[#d10024]"
                    >
                      <Avatar
                        sx={{
                          width: 30,
                          height: 30,
                          bgcolor: '#d10024',
                          fontSize: '0.875rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {user?.name?.charAt(0).toUpperCase()}
                      </Avatar>
                    </IconButton>
                  )}
                </>
              ) : (
                !isMobile && (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleLoginClick}
                    size="small"
                    className='hidden md:block'
                    startIcon={<MdAccountCircle />}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 'medium',
                      px: 2,
                      py: 1
                    }}
                  >
                    Login
                  </Button>
                )
              )}

              <Tooltip title="Wishlist" placement="bottom" arrow>
                <IconButton
                  size="medium"
                  onClick={(e) => {
                    e.preventDefault();
                    const token = localStorage.getItem('token');
                    if (!token) {
                      navigate('/login', { state: { from: '/wishlist' } });
                    } else {
                      navigate('/wishlist');
                    }
                  }}
                  className="text-gray-700 hover:text-[#d10024]"
                >
                  <StyledBadge badgeContent={wishlistCount} color="error">
                    <FaRegHeart className="text-[20px]" />
                  </StyledBadge>
                </IconButton>
              </Tooltip>
              <Tooltip title="Cart" placement="bottom" arrow>
                <IconButton
                  size="medium"
                  component={Link}
                  to="/addtocart"
                  className="text-gray-700 hover:text-[#d10024]"
                >
                  {cartCount > 0 ? (
                    <StyledBadge badgeContent={cartCount} color="error">
                      <MdOutlineShoppingCart className="text-[22px]" />
                    </StyledBadge>
                  ) : (
                    <MdOutlineShoppingCart className="text-[22px]" />
                  )}
                </IconButton>
              </Tooltip>
            </div>
          </div>

          {/* Mobile Search - Visible only on mobile */}
          {isMobile && (
            <div className='mt-3'>
              <Search fullWidth />
            </div>
          )}
        </div>
      </div>

      {/* Desktop User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 4,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
            mt: 1.5,
            minWidth: 200,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={() => {
            navigate('/profile');
            handleClose();
          }}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <FaUser fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">My Profile</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate('/orders');
            handleClose();
          }}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <FaShoppingBag fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Orders</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate('/wishlist');
            handleClose();
          }}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <FaHeart fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Wishlist</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate('/orders');
            handleClose();
          }}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <FaHeart fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Tracking Order</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate('/help-center');
            handleClose();
          }}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <MdHelpCenter fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Help Center</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => setDeleteConfirmOpen(true)}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <MdDeleteForever fontSize="16px" color="error" />
          </ListItemIcon>
          <Typography variant="body2" color="error">Delete Account</Typography>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem
          onClick={handleLogout}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <FaSignOutAlt fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2" color='error'>Logout</Typography>
        </MenuItem>
      </Menu>

      {/* Mobile User Menu */}
      <Menu
        anchorEl={mobileAnchorEl}
        open={mobileOpenMenu}
        onClose={handleMobileMenuClose}
        PaperProps={{
          elevation: 4,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
            mt: 1.5,
            minWidth: 200,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={() => {
            navigate('/profile');
            handleMobileMenuClose();
          }}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <FaUser fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">My Profile</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate('/orders');
            handleMobileMenuClose();
          }}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <FaShoppingBag fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Orders</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate('/wishlist');
            handleMobileMenuClose();
          }}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <FaHeart fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Wishlist</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate('/help-center');
            handleMobileMenuClose();
          }}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <MdHelpCenter fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Help Center</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => setDeleteConfirmOpen(true)}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <MdDeleteForever fontSize="16px" color="error" />
          </ListItemIcon>
          <Typography variant="body2" color="error">Delete Account</Typography>
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem
          onClick={handleLogout}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <FaSignOutAlt fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2" color='error'>Logout</Typography>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Menu
        anchorEl={anchorEl}
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'center',
        }}
        PaperProps={{
          style: {
            padding: '20px',
            maxWidth: '300px',
          },
        }}
      >
        <Typography variant="body1" sx={{ mb: 2, fontWeight: 'bold' }}>
          Are you sure you want to delete your account?
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          This action cannot be undone. All your data will be permanently removed.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setDeleteConfirmOpen(false)}
            size="small"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteAccount}
            size="small"
          >
            Delete
          </Button>
        </Box>
      </Menu>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
          },
        }}
      >
        {drawer}
      </Drawer>
    </header>
  );
};
export default Header;