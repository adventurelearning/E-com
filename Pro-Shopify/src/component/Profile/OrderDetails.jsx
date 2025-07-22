import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Alert,
  Skeleton,
  Stack,
  IconButton,
  Badge,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  ArrowBack,
  LocalShipping,
  CheckCircle,
  ShoppingBag,
  Receipt,
  Chat,
  Download,
  Home,
  Phone,
  CalendarToday,
  Payment,
  Info,
  Rowing,
  Store,
  CreditCard,
  Assignment,
  DoneAll,
  HourglassEmpty
} from '@mui/icons-material';
import Api from '../../Services/Api';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await Api.get(`/orders/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setOrder(response.data);
        setLoading(false);
        // Set active step based on order status
        updateActiveStep(response.data.status);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setLoading(false);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else if (err.response?.status === 404) {
          setError('Order not found.');
        } else {
          setError('Failed to load order details. Please try again.');
        }
      }
    };

    fetchOrderDetails();
  }, [id, navigate]);

  const updateActiveStep = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        setActiveStep(0);
        break;
      case 'confirmed':
        setActiveStep(1);
        break;
      case 'processing':
        setActiveStep(2);
        break;
      case 'shipped':
        setActiveStep(3);
        break;
      case 'delivered':
        setActiveStep(4);
        break;
      case 'cancelled':
        setActiveStep(-1); // Special case for cancelled
        break;
      default:
        setActiveStep(0);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'shipped':
        return 'info';
      case 'processing':
        return 'secondary';
      case 'confirmed':
        return 'primary';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') {
      return '₹0.00';
    }
    return `₹${amount.toFixed(2)}`;
  };

  const getFirstProductImage = (product) => {
    if (product?.images?.length > 0) {
      return product.images[0];
    }
    return null;
  };

  const steps = [
    {
      label: 'Order Placed',
      description: 'Your order has been received',
      icon: <Assignment color="primary" />
    },
    {
      label: 'Order Confirmed',
      description: 'Seller has confirmed your order',
      icon: <CheckCircle color="primary" />
    },
    {
      label: 'Processing',
      description: 'Seller is preparing your order',
      icon: <Store color="primary" />
    },
    {
      label: 'Shipped',
      description: 'Your order is on the way',
      icon: <LocalShipping color="primary" />
    },
    {
      label: 'Delivered',
      description: 'Your order has been delivered',
      icon: <DoneAll color="success" />
    }
  ];

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
        <Skeleton variant="rectangular" width={120} height={40} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3, borderRadius: '12px' }}>
              <Skeleton variant="text" width="60%" height={40} />
              <Skeleton variant="rectangular" height={150} sx={{ mt: 2, borderRadius: '8px' }} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3, borderRadius: '12px' }}>
              <Skeleton variant="text" width="70%" height={40} />
              <Skeleton variant="rectangular" height={300} sx={{ mt: 2, borderRadius: '8px' }} />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto', textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/orders')}
          variant="outlined"
        >
          Back to Orders
        </Button>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto', textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No order details available.
        </Typography>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/orders')}
          variant="outlined"
          sx={{ mt: 2 }}
        >
          Back to Orders
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto', bgcolor: 'background.default' }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/orders')}
        sx={{ mb: 3 }}
        variant="outlined"
      >
        Back to Orders
      </Button>

      {/* Order Header */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        mb: 3,
        gap: 2
      }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Order #{id.substring(18, 24).toUpperCase()}
        </Typography>
        <Chip
          label={order.status || 'N/A'}
          color={getStatusColor(order.status)}
          size="medium"
          icon={order.status === 'delivered' ? <CheckCircle /> : 
                order.status === 'cancelled' ? <HourglassEmpty /> : 
                <LocalShipping />}
          sx={{
            px: 2,
            py: 1,
            fontSize: '0.875rem',
            fontWeight: 600,
            textTransform: 'capitalize'
          }}
        />
      </Box>

      {/* Action Buttons */}
      <Stack direction={isMobile ? 'column' : 'row'} spacing={2} sx={{ mb: 4 }}>
        <Button
          variant="contained"
          startIcon={<Chat />}
          sx={{ 
            textTransform: 'none',
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' }
          }}
        >
          Contact Support
        </Button>
        <Button
          variant="outlined"
          startIcon={<Download />}
          sx={{ textTransform: 'none' }}
          onClick={async () => {
            try {
              const token = localStorage.getItem('token');
              const response = await Api.get(`/orders/${order._id}/invoice`, {
                responseType: 'blob',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              const url = window.URL.createObjectURL(new Blob([response.data]));
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', `invoice-${order._id}.pdf`);
              document.body.appendChild(link);
              link.click();

              link.parentNode.removeChild(link);
              window.URL.revokeObjectURL(url);
            } catch (error) {
              console.error('Invoice download failed:', error);
            }
          }}
        >
          Download Invoice
        </Button>
      </Stack>

      {/* Order Status Stepper */}
      <Paper sx={{ 
        p: 3, 
        mb: 4, 
        borderRadius: '12px', 
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
        bgcolor: 'background.paper'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
          <LocalShipping sx={{ mr: 1, color: 'primary.main' }} />
          Order Status
        </Typography>
        
        <Stepper activeStep={activeStep} orientation={isMobile ? 'vertical' : 'horizontal'}>
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                optional={!isMobile && <Typography variant="caption">{step.description}</Typography>}
                StepIconComponent={() => (
                  <Box sx={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    bgcolor: index <= activeStep ? 'primary.main' : 'action.disabledBackground',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'common.white'
                  }}>
                    {step.icon}
                  </Box>
                )}
              >
                {step.label}
              </StepLabel>
              {isMobile && (
                <StepContent>
                  <Typography variant="body2">{step.description}</Typography>
                </StepContent>
              )}
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Grid container spacing={3}>
        {/* Left Column - Order Items */}
        <Grid item xs={12} md={8}>
          {/* Order Items */}
          <Paper sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: '12px', 
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
            bgcolor: 'background.paper'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
              <ShoppingBag sx={{ mr: 1, color: 'primary.main' }} />
              Order Items ({order.items.length})
            </Typography>

            <List sx={{ py: 0 }}>
              {order.items.map((item, index) => {
                const firstImage = getFirstProductImage(item.productId);
                return (
                  <React.Fragment key={item.productId?._id || index}>
                    <ListItem 
                      sx={{ 
                        py: 2, 
                        px: 0,
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          badgeContent={item.quantity || 0}
                          color="primary"
                          overlap="rectangular"
                          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                        >
                          <Avatar
                            variant="rounded"
                            src={firstImage}
                            sx={{
                              width: 80,
                              height: 80,
                              mr: 2,
                              bgcolor: 'grey.100',
                              borderRadius: '8px'
                            }}
                          >
                            {!firstImage && <ShoppingBag />}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body1" fontWeight={600}>
                            {item.productId?.name || 'Unknown Product'}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {item.productId?.description || 'No description available'}
                          </Typography>
                        }
                        sx={{ mr: 2 }}
                      />
                      <Typography variant="body1" fontWeight={600} color="primary.main">
                        ₹{(item.productId?.discountPrice * item.quantity).toFixed(2)}
                      </Typography>
                    </ListItem>
                    {index < order.items.length - 1 && (
                      <Divider
                        component="li"
                        sx={{
                          mx: 0,
                          borderColor: 'divider',
                          borderBottomWidth: '1px'
                        }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </List>
          </Paper>
        </Grid>

        {/* Right Column - Order Summary and Address */}
        <Grid item xs={12} md={4}>
          {/* Order Summary */}
          <Paper sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: '12px', 
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
            bgcolor: 'background.paper'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
              <Receipt sx={{ mr: 1, color: 'primary.main' }} />
              Order Summary
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Order ID</Typography>
                <Typography variant="body1" fontWeight={500}>#{id.substring(18, 24).toUpperCase()}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Order Date</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {new Date(order.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Payment Method</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                   order.paymentMethod === 'card' ? 'Credit/Debit Card' : 
                   order.paymentMethod || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Payment Status</Typography>
                <Chip
                  label="Paid"
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ fontWeight: 500 }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Price Details</Typography>
            <Stack spacing={1.5} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                <Typography variant="body2">₹{order.subtotal?.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Shipping</Typography>
                <Typography variant="body2" color="success.main">Free</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Tax</Typography>
                <Typography variant="body2">₹{order.tax?.toFixed(2) || '0.00'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Discount</Typography>
                <Typography variant="body2" color="error.main">-₹{order.discount?.toFixed(2) || '0.00'}</Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body1" fontWeight={600}>Total Amount</Typography>
              <Typography variant="body1" fontWeight={600} color="primary.main">
                ₹{order.total?.toFixed(2)}
              </Typography>
            </Box>
          </Paper>

          {/* Delivery Address */}
          {order.shippingAddress && (
            <Paper sx={{ 
              p: 3, 
              borderRadius: '12px', 
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
              bgcolor: 'background.paper'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                <Home sx={{ mr: 1, color: 'primary.main' }} />
                Delivery Address
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" fontWeight={500}>{order.shippingAddress.fullName}</Typography>
                <Typography variant="body2" color="text.secondary">{order.shippingAddress.street}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                </Typography>
                <Typography variant="body2" color="text.secondary">{order.shippingAddress.country}</Typography>
              </Box>

              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Phone sx={{ fontSize: '16px', color: 'text.secondary' }} />
                <Typography variant="body2">{order.shippingAddress.phone}</Typography>
                {order.shippingAddress.alternatePhone && (
                  <Typography variant="body2">, {order.shippingAddress.alternatePhone}</Typography>
                )}
              </Stack>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderDetails;