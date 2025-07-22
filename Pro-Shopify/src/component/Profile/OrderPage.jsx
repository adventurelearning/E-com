import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Skeleton,
  Card,
  CardContent,
  CardActionArea,
  Divider,
  Stack,
  useMediaQuery,
  IconButton,
  Tooltip,
  Avatar,
  Alert,
  useTheme,
  Badge
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  ShoppingBag as ShoppingBagIcon,
  Receipt as ReceiptIcon,
  CalendarToday as CalendarIcon,
  Info as InfoIcon,
  ImageNotSupported as ImageNotSupportedIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as DeliveredIcon,
  Pending as PendingIcon,
  Cancel as CancelledIcon
} from '@mui/icons-material';
import Api from '../../Services/Api';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await Api.get('/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // Sort orders by date (newest first)
      const sortedOrders = response.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sortedOrders);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setLoading(false);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to load orders. Please try again later.');
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getFirstProductImage = useCallback((order) => {
    if (order?.items && order.items.length > 0 &&
      order.items[0]?.productId &&
      order.items[0].productId?.images &&
      order.items[0].productId.images.length > 0) {
      return order.items[0].productId.images[0];
    }
    return null;
  }, []);

  const getStatusIcon = useCallback((status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <PendingIcon fontSize="small" />;
      case 'delivered':
        return <DeliveredIcon fontSize="small" />;
      case 'cancelled':
        return <CancelledIcon fontSize="small" />;
      case 'shipped':
        return <ShippingIcon fontSize="small" />;
      default:
        return <InfoIcon fontSize="small" />;
    }
  }, []);

  const getStatusColor = useCallback((status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'shipped':
        return 'info';
      default:
        return 'default';
    }
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Invalid Date";
    }
  }, []);

  const formatCurrency = useCallback((amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return '₹0.00';
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  }, []);

  const getOrderBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return theme.palette.warning.main;
      case 'delivered':
        return theme.palette.success.main;
      case 'cancelled':
        return theme.palette.error.main;
      case 'shipped':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          <Skeleton width={200} />
        </Typography>
        {[...Array(isSmallMobile ? 3 : isMobile ? 4 : 5)].map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            height={isSmallMobile ? 120 : isMobile ? 150 : 70}
            sx={{ 
              mb: 2, 
              borderRadius: 2,
              animation: "pulse 1.5s ease-in-out infinite"
            }}
          />
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        p: { xs: 2, md: 3 }, 
        maxWidth: 1200, 
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh'
      }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>My Orders</Typography>
        <Paper sx={{ 
          p: 3, 
          textAlign: 'center', 
          borderRadius: 2,
          width: '100%',
          maxWidth: 600
        }}>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              alignItems: 'center',
              '& .MuiAlert-message': {
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }
            }}
          >
            {error}
          </Alert>
          <Button
            variant="contained"
            onClick={fetchOrders}
            startIcon={<ArrowForwardIcon />}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 500
            }}
          >
            Retry Loading Orders
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <>
    <Box sx={{
      p: { xs: 2, md: 3 },
      maxWidth: 1200,
      mx: 'auto',
      minHeight: 'calc(100vh - 64px - 56px)'
    }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        mb: 3
      }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            fontSize: { xs: '1.75rem', sm: '2rem' }
          }}
        >
          My Orders
        </Typography>
        {orders.length > 0 && (
          <Chip
            label={`${orders.length} ${orders.length === 1 ? 'Order' : 'Orders'}`}
            color="primary"
            variant="outlined"
            sx={{
              px: 1,
              fontWeight: 500,
              fontSize: '0.875rem'
            }}
          />
        )}
      </Box>

      {orders.length === 0 ? (
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 4 },
            textAlign: 'center',
            borderRadius: 3,
            maxWidth: 600,
            mx: 'auto',
            background: theme.palette.mode === 'dark' ? 
              'linear-gradient(to bottom right, #1a1a1a, #2a2a2a)' : 
              'linear-gradient(to bottom right, #f9f9f9, #ffffff)'
          }}
        >
          <ShoppingBagIcon sx={{ 
            fontSize: 60, 
            color: 'text.disabled', 
            mb: 2,
            opacity: 0.8
          }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            No Orders Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ 
            mb: 3,
            maxWidth: 400,
            mx: 'auto'
          }}>
            Your order history will appear here once you start shopping with us.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/')}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 500,
              boxShadow: theme.shadows[2],
              '&:hover': {
                boxShadow: theme.shadows[4]
              }
            }}
          >
            Start Shopping
          </Button>
        </Paper>
      ) : isMobile ? (
        <Stack spacing={2}>
          {orders.map((order) => {
            const firstImage = getFirstProductImage(order);
            const orderIdShort = order._id.substring(18, 24).toUpperCase();
            const itemCount = order.items?.length || 0;
            
            return (
              <Card
                key={order._id}
                elevation={2}
                sx={{
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[6]
                  }
                }}
              >
                <CardActionArea onClick={() => navigate(`/orders/${order._id}`)}>
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              bgcolor: getOrderBadgeColor(order.status),
                              border: `2px solid ${theme.palette.background.paper}`
                            }}
                          >
                            {getStatusIcon(order.status)}
                          </Avatar>
                        }
                      >
                        {firstImage ? (
                          <Avatar
                            variant="rounded"
                            src={firstImage}
                            alt={`Product from Order ${orderIdShort}`}
                            sx={{
                              width: 80,
                              height: 80,
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <Avatar
                            variant="rounded"
                            sx={{
                              width: 80,
                              height: 80,
                              bgcolor: 'grey.200'
                            }}
                          >
                            <ImageNotSupportedIcon sx={{ 
                              fontSize: 40, 
                              color: 'grey.500' 
                            }} />
                          </Avatar>
                        )}
                      </Badge>
                      
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography 
                            variant="subtitle1" 
                            fontWeight={600} 
                            noWrap
                            sx={{
                              fontSize: '1rem',
                              maxWidth: '60%'
                            }}
                          >
                            Order #{orderIdShort}
                          </Typography>
                          <Chip
                            label={order.status || 'N/A'}
                            color={getStatusColor(order.status)}
                            size="small"
                            sx={{
                              height: 24,
                              fontSize: '0.75rem'
                            }}
                          />
                        </Stack>

                        <Stack spacing={0.5}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <CalendarIcon fontSize="small" color="action" sx={{ opacity: 0.7 }} />
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(order.createdAt)}
                            </Typography>
                          </Stack>

                          <Stack direction="row" alignItems="center" spacing={1}>
                            <ShoppingBagIcon fontSize="small" color="action" sx={{ opacity: 0.7 }} />
                            <Typography variant="body2" color="text.secondary">
                              {itemCount} {itemCount === 1 ? 'item' : 'items'}
                            </Typography>
                          </Stack>

                          <Stack direction="row" alignItems="center" spacing={1}>
                            <ReceiptIcon fontSize="small" color="action" sx={{ opacity: 0.7 }} />
                            <Typography variant="body2" fontWeight={500} color="text.primary">
                              {formatCurrency(order.total)}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
        </Stack>
      ) : (
        <Paper
          elevation={2}
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            border: `1px solid ${theme.palette.divider}`,
            background: theme.palette.mode === 'dark' ? 
              'linear-gradient(to right, #1a1a1a, #2a2a2a)' : 
              'linear-gradient(to right, #f9f9f9, #ffffff)'
          }}
        >
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ 
                bgcolor: theme.palette.mode === 'dark' ? 
                  'rgba(255, 255, 255, 0.05)' : 
                  'rgba(0, 0, 0, 0.05)'
              }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Order ID</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Items</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => {
                  const firstImage = getFirstProductImage(order);
                  const orderIdShort = order._id.substring(18, 24).toUpperCase();
                  const itemCount = order.items?.length || 0;
                  
                  return (
                    <TableRow
                      key={order._id}
                      hover
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        '&:hover': {
                          bgcolor: theme.palette.mode === 'dark' ? 
                            'rgba(255, 255, 255, 0.03)' : 
                            'rgba(0, 0, 0, 0.03)'
                        }
                      }}
                      onClick={() => navigate(`/orders/${order._id}`)}
                    >
                      <TableCell>
                        {firstImage ? (
                          <Avatar
                            variant="rounded"
                            src={firstImage}
                            alt={`Product from Order ${orderIdShort}`}
                            sx={{
                              width: 50,
                              height: 50,
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <Avatar
                            variant="rounded"
                            sx={{
                              width: 50,
                              height: 50,
                              bgcolor: 'grey.200'
                            }}
                          >
                            <ImageNotSupportedIcon sx={{ fontSize: 28, color: 'grey.500' }} />
                          </Avatar>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          fontWeight={500} 
                          sx={{ 
                            wordBreak: 'break-all',
                            fontFamily: 'monospace'
                          }}
                        >
                          #{orderIdShort}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(order.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {formatCurrency(order.total)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.status || 'N/A'}
                          color={getStatusColor(order.status)}
                          size="small"
                          icon={getStatusIcon(order.status)}
                          sx={{
                            height: 24,
                            '& .MuiChip-icon': {
                              color: 'inherit',
                              fontSize: '16px',
                              marginLeft: '4px'
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View details" arrow>
                          <IconButton
                            size="small"
                            sx={{
                              '&:hover': {
                                backgroundColor: theme.palette.action.hover
                              }
                            }}
                          >
                            <InfoIcon 
                              color="primary" 
                              sx={{ fontSize: '1.25rem' }} 
                            />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
    </>
  );
};

export default OrdersPage;