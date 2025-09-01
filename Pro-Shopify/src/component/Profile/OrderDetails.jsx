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
  Alert,
  Skeleton,
  Stack,
  Card,
  CardContent,
  useTheme,
  IconButton,
  Collapse,
  Tooltip
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
  LocationOn,
  ExpandMore,
  Person,
  Info
} from '@mui/icons-material';
import Api from '../../Services/Api';
import AddReview from '../AddReview';
import { toast } from 'react-toastify';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const [reviewProduct, setReviewProduct] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const handleOpenReview = (product) => {
    setReviewProduct(product);
  };

  const handleCloseReview = () => {
    setReviewProduct(null);
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      const response = await Api.post('/reviews', reviewData);
      toast.success('Review submitted successfully!');
      handleCloseReview();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await Api.get(`/orders/${id}`);
        setOrder(response.data);
        setLoading(false);
        
        if (response.data.trackingId && response.data.trackingCourier) {
          fetchTrackingDetails(response.data.trackingCourier, response.data.trackingId);
        }
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

  const fetchTrackingDetails = async (courier, trackingNumber) => {
    setTrackingLoading(true);
    setTrackingError(null);
    
    try {
      const response = await Api.post('/tracking', {
        courier,
        trackingNumber,
        orderId: id,
      });
      
      setTrackingData(response.data);
    } catch (err) {
      console.error('Error fetching tracking details:', err);
      setTrackingError('Failed to load tracking information.');
    } finally {
      setTrackingLoading(false);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Create unified timeline
  const createUnifiedTimeline = () => {
    const timeline = [];
    
    // Add order creation
    timeline.push({
      type: 'system',
      title: 'Order Created',
      description: 'Your order has been placed successfully.',
      date: order.createdAt,
      status: 'created',
      icon: <CalendarToday sx={{ fontSize: 16 }} />
    });
    
    // Add status history from database
    if (order.statusHistory && order.statusHistory.length > 0) {
      order.statusHistory.forEach(item => {
        timeline.push({
          type: 'status',
          title: `Order ${item.status.charAt(0).toUpperCase() + item.status.slice(1)}`,
          description: item.note || `Order status changed to ${item.status}`,
          date: item.changedAt,
          status: item.status,
          changedBy: item.changedBy?.name || 'System',
          trackingId: item.trackingId,
          trackingCourier: item.trackingCourier,
          icon: getStatusIcon(item.status)
        });
      });
    }
    
    // Add tracking events if available
    if (trackingData && trackingData.data && trackingData.data.tracking.checkpoints) {
      trackingData.data.tracking.checkpoints.forEach((checkpoint, index) => {
        timeline.push({
          type: 'tracking',
          title: checkpoint.message,
          description: checkpoint.location || 'Tracking update',
          date: checkpoint.checkpoint_time,
          status: checkpoint.tag,
          icon: getTrackingIcon(checkpoint.tag),
          isTracking: true
        });
      });
    }
    
    // Sort timeline by date
    timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
    return timeline;
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Info sx={{ fontSize: 16 }} />;
      case 'processing':
        return <LocalShipping sx={{ fontSize: 16 }} />;
      case 'shipped':
        return <LocalShipping sx={{ fontSize: 16 }} />;
      case 'delivered':
        return <CheckCircle sx={{ fontSize: 16 }} />;
      default:
        return <Info sx={{ fontSize: 16 }} />;
    }
  };

  const getTrackingIcon = (tag) => {
    switch (tag?.toLowerCase()) {
      case 'delivered':
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'intransit':
        return <LocalShipping sx={{ fontSize: 16 }} />;
      case 'outfordelivery':
        return <LocalShipping sx={{ fontSize: 16 }} />;
      case 'exception':
        return <Info sx={{ fontSize: 16 }} />;
      case 'inforeceived':
        return <Info sx={{ fontSize: 16 }} />;
      default:
        return <Info sx={{ fontSize: 16 }} />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: { xs: 1, md: 2 }, maxWidth: 1200, mx: 'auto' }}>
        <Skeleton variant="rectangular" width={100} height={30} sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, mb: 2, borderRadius: '8px' }}>
              <Skeleton variant="text" width="60%" height={30} />
              <Skeleton variant="rectangular" height={120} sx={{ mt: 1, borderRadius: '6px' }} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, mb: 2, borderRadius: '8px' }}>
              <Skeleton variant="text" width='70%' height={30} />
              <Skeleton variant="rectangular" height={250} sx={{ mt: 1, borderRadius: '6px' }} />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, maxWidth: 1200, mx: 'auto', textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/orders')}
          variant="outlined"
          size="small"
        >
          Back to Orders
        </Button>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ p: 2, maxWidth: 1200, mx: 'auto', textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No order details available.
        </Typography>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/orders')}
          variant="outlined"
          size="small"
          sx={{ mt: 2 }}
        >
          Back to Orders
        </Button>
      </Box>
    );
  }

  const unifiedTimeline = createUnifiedTimeline();

  return (
    <Box sx={{ p: { xs: 1, md: 2 }, maxWidth: 1200, mx: 'auto', bgcolor: 'background.default' }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/orders')}
        sx={{ mb: 2 }}
        variant="outlined"
        size="small"
      >
        Back to Orders
      </Button>

      {/* Order Header */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        mb: 2,
        gap: 1
      }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
            Order #{order.orderNumber || id.substring(18, 24).toUpperCase()}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarToday sx={{ fontSize: 14, mr: 0.5 }} />
              Ordered on {formatDate(order.createdAt)}
            </Typography>
          </Box>
        </Box>
        <Chip
          label={order.status || 'N/A'}
          color={getStatusColor(order.status)}
          size="small"
          icon={order.status === 'delivered' ? <CheckCircle /> : <LocalShipping />}
          sx={{
            px: 1,
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'capitalize'
          }}
        />
      </Box>

      {/* Action Buttons */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<Chat />}
          size="small"
          sx={{ textTransform: 'none' }}
        >
          Contact Support
        </Button>
        <Button
          variant="outlined"
          startIcon={<Download />}
          size="small"
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

      {/* Unified Timeline */}
      <Paper sx={{ 
        p: 2, 
        mb: 3, 
        borderRadius: '8px', 
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
        bgcolor: 'background.paper'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
            <CalendarToday sx={{ mr: 1, fontSize: 20, color: 'primary.main' }} />
            Order Tracking
          </Typography>
          <Tooltip title={expanded ? "Collapse" : "Expand"}>
            <IconButton 
              size="small" 
              onClick={() => setExpanded(!expanded)}
              sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
            >
              <ExpandMore />
            </IconButton>
          </Tooltip>
        </Box>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ 
            position: 'relative',
            pl: 2,
            ml: 1,
            borderLeft: '2px dashed',
            borderColor: 'primary.light'
          }}>
            {unifiedTimeline.map((event, index) => (
              <Box 
                key={index} 
                sx={{ 
                  position: 'relative',
                  mb: 2,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: -21,
                    top: 4,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: index === unifiedTimeline.length - 1 ? 'success.main' : 'primary.main',
                    border: '2px solid',
                    borderColor: 'white',
                    boxShadow: '0 0 0 1px primary.main',
                    zIndex: 2
                  }
                }}
              >
                <Card sx={{ 
                  borderRadius: '8px',
                  boxShadow: index === unifiedTimeline.length - 1 ? '0 2px 8px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.05)',
                  border: index === unifiedTimeline.length - 1 ? '1px solid' : '1px solid',
                  borderColor: index === unifiedTimeline.length - 1 ? 'success.light' : 'grey.200',
                  backgroundColor: index === unifiedTimeline.length - 1 ? 'success.10' : 'background.paper'
                }}>
                  <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          {event.icon}
                          <Box component="span" sx={{ ml: 0.5 }}>
                            {formatDate(event.date)}
                          </Box>
                        </Typography>
                        <Typography variant="body2" fontWeight="600" gutterBottom>
                          {event.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {event.description}
                        </Typography>
                        {event.changedBy && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <Person sx={{ fontSize: 14, mr: 0.5 }} />
                            Updated by: {event.changedBy}
                          </Typography>
                        )}
                        {event.trackingId && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            Tracking: {event.trackingCourier} - {event.trackingId}
                          </Typography>
                        )}
                      </Box>
                      {event.isTracking && (
                        <Chip 
                          label="Tracking" 
                          size="small" 
                          color="info" 
                          variant="outlined"
                          sx={{ fontWeight: 500, ml: 1 }}
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Collapse>
      </Paper>

      <Grid container spacing={2}>
        {/* Order Items */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ 
            p: 2, 
            mb: 2, 
            borderRadius: '8px', 
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
            bgcolor: 'background.paper'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
              <ShoppingBag sx={{ mr: 1, fontSize: 20, color: 'primary.main' }} />
              Order Items ({order.items.length})
            </Typography>

            <List sx={{ py: 0 }}>
              {order.items.map((item, index) => {
                const firstImage = getFirstProductImage(item.productId);
                return (
                  <React.Fragment key={item.productId?._id || index}>
                    <ListItem 
                      sx={{ 
                        py: 1, 
                        px: 0,
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          variant="rounded"
                          src={firstImage}
                          sx={{
                            width: 60,
                            height: 60,
                            mr: 1,
                            bgcolor: 'grey.100',
                            borderRadius: '6px'
                          }}
                        >
                          {!firstImage && <ShoppingBag />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={600}>
                            {item.productId?.name || 'Unknown Product'}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                              Quantity: {item.quantity}
                            </Typography>
                            <Typography variant="body2" color="primary.main" fontWeight={600}>
                              ₹{(item.productId?.discountPrice * item.quantity).toFixed(2)}
                            </Typography>
                          </Box>
                        }
                        sx={{ mr: 1 }}
                      />
                    </ListItem>
                    {index < order.items.length - 1 && (
                      <Divider
                        component="li"
                        sx={{
                          mx: 0,
                          borderColor: 'divider'
                        }}
                      />
                    )}
                    {order.status === 'delivered' && (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleOpenReview(item.productId)}
                          sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                        >
                          Write a Review
                        </Button>
                      </Box>
                    )}
                  </React.Fragment>
                );
              })}
            </List>
          </Paper>
        </Grid>

        {/* Order Summary and Address */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ 
            p: 2, 
            mb: 2, 
            borderRadius: '8px', 
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
            bgcolor: 'background.paper'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
              <Receipt sx={{ mr: 1, fontSize: 20, color: 'primary.main' }} />
              Order Summary
            </Typography>

            <Grid container spacing={1} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Order ID</Typography>
                <Typography variant="body2" fontWeight={500}>#{order.orderNumber || id.substring(18, 24).toUpperCase()}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Order Date</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {new Date(order.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Payment Method</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                   order.paymentMethod === 'card' ? 'Credit/Debit Card' : 
                   order.paymentMethod || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Payment Status</Typography>
                <Chip
                  label={order.paymentStatus || 'Paid'}
                  size="small"
                  color={order.paymentStatus === 'pending' ? 'warning' : 'success'}
                  variant="outlined"
                  sx={{ fontWeight: 500, height: 24 }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 1.5 }} />

            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Price Details</Typography>
            <Stack spacing={1} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">Subtotal</Typography>
                <Typography variant="caption">₹{order.subtotal?.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">Shipping</Typography>
                <Typography variant="caption" color="success.main">Free</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">Tax</Typography>
                <Typography variant="caption">₹{order.tax?.toFixed(2) || '0.00'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">Discount</Typography>
                <Typography variant="caption" color="error.main">-₹{order.discount?.toFixed(2) || '0.00'}</Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" fontWeight={600}>Total Amount</Typography>
              <Typography variant="body2" fontWeight={600} color="primary.main">
                ₹{order.total?.toFixed(2)}
              </Typography>
            </Box>
          </Paper>

          {/* Delivery Address */}
          {order.shippingAddress && (
            <Paper sx={{ 
              p: 2, 
              borderRadius: '8px', 
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
              bgcolor: 'background.paper'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center' }}>
                <Home sx={{ mr: 1, fontSize: 20, color: 'primary.main' }} />
                Delivery Address
              </Typography>

              <Box sx={{ mb: 1.5 }}>
                <Typography variant="body2" fontWeight={500}>{order.shippingAddress.fullName}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{order.shippingAddress.street}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{order.shippingAddress.country}</Typography>
              </Box>

              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <Phone sx={{ fontSize: '14px', color: 'text.secondary' }} />
                <Typography variant="caption">{order.shippingAddress.phone}</Typography>
                {order.shippingAddress.alternatePhone && (
                  <Typography variant="caption">, {order.shippingAddress.alternatePhone}</Typography>
                )}
              </Stack>
            </Paper>
          )}
        </Grid>
      </Grid>
      
      {reviewProduct && (
        <AddReview
          open={Boolean(reviewProduct)}
          onClose={handleCloseReview}
          product={reviewProduct}
          onSubmit={handleReviewSubmit}
        />
      )}
    </Box>
  );
};

export default OrderDetails;