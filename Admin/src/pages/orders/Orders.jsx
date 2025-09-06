import React, { useState, useEffect } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TableSortLabel,
  Select, MenuItem, FormControl, InputLabel, Chip,
  IconButton, Tooltip, Typography, Box,
  LinearProgress, Snackbar, Alert, Avatar, Badge, Button,
  TextField, useMediaQuery, useTheme, Dialog, DialogTitle,
  DialogContent, DialogActions, Collapse, Card, CardContent,
  Accordion, AccordionSummary, AccordionDetails,
  CircularProgress, Grid
} from '@mui/material';
import {
  CheckCircle, Cancel, LocalShipping,
  Refresh, FilterList, MoreVert, Edit,
  HourglassEmpty, Payment, LocationOn, ArrowUpward, ArrowDownward,
  ArrowBackIosNew, ArrowForwardIos, Download, ExpandMore, ExpandLess,
  History, Person, Info, CalendarToday, Schedule,
  Place, Assignment, Warning
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Api from '../../Services/Api';

dayjs.extend(relativeTime);

// Purple theme colors
const purpleTheme = {
  primary: '#7e57c2',
  primaryLight: '#b085f5',
  primaryDark: '#4d2c91',
  secondary: '#f3e5f5',
};

// Status configuration
const statusColors = {
  pending: 'warning',
  processing: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'error'
};

const statusIcons = {
  pending: <HourglassEmpty fontSize="small" />,
  processing: <Refresh fontSize="small" />,
  shipped: <LocalShipping fontSize="small" />,
  delivered: <CheckCircle fontSize="small" />,
  cancelled: <Cancel fontSize="small" />
};

const paymentMethods = {
  credit_card: 'Credit Card',
  paypal: 'PayPal',
  apple_pay: 'Apple Pay',
  google_pay: 'Google Pay',
  cod: 'Cash on Delivery'
};

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: purpleTheme.secondary,
    transition: 'background-color 0.3s ease',
  },
}));

const Orders = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [searchEmail, setSearchEmail] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [trackingDialog, setTrackingDialog] = useState({
    open: false,
    order: null,
    trackingId: '',
    trackingCourier: '',
    note: ''
  });
  const [expandedOrders, setExpandedOrders] = useState({});
  const [trackingData, setTrackingData] = useState({});
  const [trackingLoading, setTrackingLoading] = useState({});

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await Api.get('/orders/userOrders/all');
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load orders',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [snackbar]);

  // Function to fetch tracking details
  const fetchTrackingDetails = async (orderId, trackingCourier, trackingId) => {
    setTrackingLoading(prev => ({ ...prev, [orderId]: true }));
    
    try {
      const response = await Api.post('/tracking', {
        courier: trackingCourier,
        trackingNumber: trackingId,
        orderId: orderId,
      });
      
      setTrackingData(prev => ({ 
        ...prev, 
        [orderId]: response.data 
      }));
    } catch (err) {
      console.error('Error fetching tracking details:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load tracking information',
        severity: 'error'
      });
    } finally {
      setTrackingLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleSort = (field) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    setSortField(field);
    setSortDirection(isAsc ? 'desc' : 'asc');
  };

  const handleStatusChange = async (orderId, newStatus, trackingInfo = null, note = '') => {
    try {
      const payload = { 
        status: newStatus,
        note: note || `Status changed to ${newStatus}`
      };
      
      // Include tracking info if provided
      if (trackingInfo) {
        payload.trackingId = trackingInfo.trackingId;
        payload.trackingCourier = trackingInfo.trackingCourier;
      }

      const response = await Api.put(`/orders/admin/${orderId}`, payload);

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? response.data : order
        )
      );

      setSnackbar({
        open: true,
        message: `Order status updated to ${newStatus}`,
        severity: 'success'
      });

      // Close the tracking dialog if it was open
      setTrackingDialog({
        open: false,
        order: null,
        trackingId: '',
        trackingCourier: '',
        note: ''
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update order status',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Open tracking dialog when changing status to shipped
  const handleStatusSelect = (order, newStatus) =>{
    if (newStatus === 'shipped') {
      setTrackingDialog({
        open: true,
        order: order,
        trackingId: order.trackingId || '',
        trackingCourier: order.trackingCourier || '',
        note: ''
      });
    } else {
      handleStatusChange(order._id, newStatus);
    }
  };

  // Toggle order expansion for status history and tracking
  const toggleOrderExpansion = async (order) => {
    const orderId = order._id;
    const isExpanding = !expandedOrders[orderId];
    
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: isExpanding
    }));
    
    // If expanding and order has tracking info, fetch tracking details
    if (isExpanding && order.trackingId && order.trackingCourier && !trackingData[orderId]) {
      await fetchTrackingDetails(orderId, order.trackingCourier, order.trackingId);
    }
  };

  // Filter orders based on status and email search
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesEmail = order.user?.email?.toLowerCase().includes(searchEmail.toLowerCase());
    return matchesStatus && matchesEmail;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const isAsc = sortDirection === 'asc';

    if (sortField === 'createdAt') {
      return isAsc
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
    }

    if (sortField === 'total') {
      return isAsc ? a.total - b.total : b.total - a.total;
    }

    if (sortField === 'items') {
      return isAsc ? a.items.length - b.items.length : b.items.length - a.items.length;
    }

    return 0;
  });

  const paginatedOrders = sortedOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Function to get item count
  const getItemCount = (items) => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  // Function to get sort direction icon
  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />;
  };

  const downloadInvoice = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await Api.get(`/orders/${id}/invoice`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Invoice download failed:', error);
      alert('Failed to download invoice. Please try again.');
    }
  };

  // Get status icon for timeline
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <HourglassEmpty sx={{ fontSize: 16 }} />;
      case 'processing':
        return <Refresh sx={{ fontSize: 16 }} />;
      case 'shipped':
        return <LocalShipping sx={{ fontSize: 16 }} />;
      case 'delivered':
        return <CheckCircle sx={{ fontSize: 16 }} />;
      case 'cancelled':
        return <Cancel sx={{ fontSize: 16 }} />;
      default:
        return <Info sx={{ fontSize: 16 }} />;
    }
  };

  // Format tracking status
  const formatTrackingStatus = (status) => {
    if (!status) return 'Unknown';
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format date for display
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

  // Create unified timeline for an order
  const createUnifiedTimeline = (order) => {
    const timeline = [];
    
    // Add order creation
    timeline.push({
      type: 'system',
      title: 'Order Created',
      description: 'Order was placed successfully.',
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
    const orderTrackingData = trackingData[order._id];
    if (orderTrackingData && orderTrackingData.data && orderTrackingData.data.tracking.checkpoints) {
      orderTrackingData.data.tracking.checkpoints.forEach((checkpoint, index) => {
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


  // Render unified timeline for an order
  const renderUnifiedTimeline = (order) => {
    const timeline = createUnifiedTimeline(order);
    
    return (
      <Box sx={{ 
        position: 'relative',
        pl: 2,
        ml: 1,
        borderLeft: '2px dashed',
        borderColor: 'primary.light'
      }}>
        {timeline.map((event, index) => (
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
                backgroundColor: index === timeline.length - 1 ? 'success.main' : 'primary.main',
                border: '2px solid',
                borderColor: 'white',
                boxShadow: '0 0 0 1px primary.main',
                zIndex: 2
              }
            }}
          >
            <Card sx={{ 
              borderRadius: '8px',
              boxShadow: index === timeline.length - 1 ? '0 2px 8px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.05)',
              border: index === timeline.length - 1 ? '1px solid' : '1px solid',
              borderColor: index === timeline.length - 1 ? 'success.light' : 'grey.200',
              backgroundColor: index === timeline.length - 1 ? 'success.10' : 'background.paper'
            }}>
              <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5, fontSize: '0.75rem' }}>
                      {event.icon}
                      <Box component="span" sx={{ ml: 0.5 }}>
                        {dayjs(event.date).format('MMM D, YYYY h:mm A')}
                      </Box>
                    </Typography>
                    <Typography variant="body2" fontWeight="600" gutterBottom sx={{ fontSize: '0.875rem' }}>
                      {event.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      {event.description}
                    </Typography>
                    {event.changedBy && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5, fontSize: '0.7rem' }}>
                        <Person sx={{ fontSize: 14, mr: 0.5 }} />
                        Updated by: {event.changedBy}
                      </Typography>
                    )}
                    {event.trackingId && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontSize: '0.7rem' }}>
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
                      sx={{ fontWeight: 500, ml: 1, fontSize: '0.7rem' }}
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    );
  };

  // Responsive table cell rendering
  const renderTableCell = (content, align = 'left', sx = {}) => (
    <TableCell align={align} sx={{ 
      ...sx, 
      py: isSmallScreen ? 1 : 2,
      fontSize: isExtraSmallScreen ? '0.7rem' : (isSmallScreen ? '0.8rem' : '1rem')
    }}>
      {content}
    </TableCell>
  );

  return (
    <div
      style={{
        padding: isExtraSmallScreen ? '8px' : '14px',
        width: '100%',
        maxWidth: '1050px',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}
    >
      <Paper sx={{
        mb: 3,
        p: 2,
        borderRadius: 3,
        boxShadow: 3,
        borderLeft: `4px solid ${purpleTheme.primary}`
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap">
          <Box display="flex" alignItems="center" mb={{ xs: 2, sm: 0 }} flexWrap="wrap">
            {isSmallScreen ? (
              <IconButton 
                onClick={() => setShowFilters(!showFilters)}
                sx={{ mr: 1, color: purpleTheme.primary }}
              >
                <FilterList />
              </IconButton>
            ) : (
              <FilterList sx={{ mr: 1, color: purpleTheme.primary }} />
            )}
            
            <Box display={isSmallScreen && !showFilters ? 'none' : 'flex'} 
                 flexDirection={isSmallScreen ? 'column' : 'row'} 
                 alignItems={isSmallScreen ? 'flex-start' : 'center'}
                 width={isSmallScreen ? '100%' : 'auto'}
                 gap={isSmallScreen ? 2 : 0}>
              
              <FormControl size="small" sx={{ minWidth: 180, mr: isSmallScreen ? 0 : 2, mb: isSmallScreen ? 2 : 0, width: isSmallScreen ? '100%' : 'auto' }}>
                <InputLabel sx={{ fontSize: isExtraSmallScreen ? '0.8rem' : '1rem' }}>Filter by Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  label="Filter by Status"
                  sx={{
                    '& .MuiSelect-select': {
                      color: purpleTheme.primaryDark,
                      fontWeight: 500,
                      fontSize: isExtraSmallScreen ? '0.8rem' : '0.9rem'
                    }
                  }}
                >
                  <MenuItem value="all" sx={{ fontSize: isExtraSmallScreen ? '0.8rem' : '0.9rem' }}>All Statuses</MenuItem>
                  <MenuItem value="pending" sx={{ fontSize: isExtraSmallScreen ? '0.8rem' : '0.9rem' }}>Pending</MenuItem>
                  <MenuItem value="processing" sx={{ fontSize: isExtraSmallScreen ? '0.8rem' : '0.9rem' }}>Processing</MenuItem>
                  <MenuItem value="shipped" sx={{ fontSize: isExtraSmallScreen ? '0.8rem' : '0.9rem' }}>Shipped</MenuItem>
                  <MenuItem value="delivered" sx={{ fontSize: isExtraSmallScreen ? '0.8rem' : '0.9rem' }}>Delivered</MenuItem>
                  <MenuItem value="cancelled" sx={{ fontSize: isExtraSmallScreen ? '0.8rem' : '0.9rem' }}>Cancelled</MenuItem>
                </Select>
              </FormControl>

              <TextField
                size="small"
                variant="outlined"
                placeholder="Search by email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                sx={{
                  ml: isSmallScreen ? 0 : 2,
                  width: isSmallScreen ? '100%' : 220,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontSize: isExtraSmallScreen ? '0.8rem' : '0.9rem',
                    backgroundColor: 'white'
                  }
                }}
              />

              {!isExtraSmallScreen && (
                <Box display="flex" alignItems="center" ml={isSmallScreen ? 0 : 2} mt={isSmallScreen ? 2 : 0}>
                  <Typography variant="body2" sx={{ mr: 1, color: 'text.secondary', fontSize: isSmallScreen ? '0.8rem' : '0.9rem' }}>
                    Sort by:
                  </Typography>
                  <Chip
                    label="Date"
                    onClick={() => handleSort('createdAt')}
                    variant={sortField === 'createdAt' ? 'filled' : 'outlined'}
                    color="primary"
                    size="small"
                    icon={getSortIcon('createdAt')}
                    sx={{ mr: 1, fontSize: isSmallScreen ? '0.7rem' : '0.8rem' }}
                  />
                  <Chip
                    label="Total"
                    onClick={() => handleSort('total')}
                    variant={sortField === 'total' ? 'filled' : 'outlined'}
                    color="primary"
                    size="small"
                    icon={getSortIcon('total')}
                    sx={{ mr: 1, fontSize: isSmallScreen ? '0.7rem' : '0.8rem' }}
                  />
                  <Chip
                    label="Items"
                    onClick={() => handleSort('items')}
                    variant={sortField === 'items' ? 'filled' : 'outlined'}
                    color="primary"
                    size="small"
                    icon={getSortIcon('items')}
                    sx={{ fontSize: isSmallScreen ? '0.7rem' : '0.8rem' }}
                  />
                </Box>
              )}
            </Box>
          </Box>

          <Box display="flex" alignItems="center" flexWrap="wrap" justifyContent={isSmallScreen ? 'space-between' : 'flex-end'} width={isSmallScreen ? '100%' : 'auto'}>
            <Box display="flex" alignItems="center" sx={{ ml: isSmallScreen ? 0 : 'auto' }} mt={isSmallScreen ? 2 : 0}>
              {!isExtraSmallScreen && (
                <>
                  <Typography variant="body2" sx={{ mr: 1, color: purpleTheme.primaryDark, fontSize: isSmallScreen ? '0.8rem' : '0.9rem' }}>
                    Rows:
                  </Typography>
                  <Select
                    value={rowsPerPage}
                    onChange={handleChangeRowsPerPage}
                    size="small"
                    sx={{
                      width: 80,
                      mr: 2,
                      '& .MuiSelect-select': {
                        padding: '6px 32px 6px 12px',
                        fontSize: isSmallScreen ? '0.8rem' : '0.875rem',
                        color: purpleTheme.primaryDark,
                        fontWeight: 500
                      }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          '& .MuiMenuItem-root': {
                            fontSize: isSmallScreen ? '0.8rem' : '0.875rem'
                          }
                        }
                      }
                    }}
                  >
                    <MenuItem value={5} sx={{ fontSize: isSmallScreen ? '0.8rem' : '0.875rem' }}>5</MenuItem>
                    <MenuItem value={10} sx={{ fontSize: isSmallScreen ? '0.8rem' : '0.875rem' }}>10</MenuItem>
                    <MenuItem value={25} sx={{ fontSize: isSmallScreen ? '0.8rem' : '0.875rem' }}>25</MenuItem>
                  </Select>
                </>
              )}

              <Typography variant="body2" sx={{ mr: 2, color: purpleTheme.primaryDark, fontSize: isSmallScreen ? '0.8rem' : '0.9rem' }}>
                {`${page * rowsPerPage + 1}-${Math.min(page * rowsPerPage + rowsPerPage, filteredOrders.length)} of ${filteredOrders.length}`}
              </Typography>

              <IconButton
                onClick={() => setPage(old => Math.max(old - 1, 0))}
                disabled={page === 0}
                size="small"
                sx={{
                  mr: 1,
                  backgroundColor: purpleTheme.secondary,
                  '&:hover': { backgroundColor: purpleTheme.primaryLight },
                  '&:disabled': { opacity: 0.5 }
                }}
              >
                <ArrowBackIosNew fontSize="small" sx={{ color: purpleTheme.primaryDark }} />
              </IconButton>

              <IconButton
                onClick={() => setPage(old => old + 1)}
                disabled={page >= Math.ceil(filteredOrders.length / rowsPerPage) - 1}
                size="small"
                sx={{
                  backgroundColor: purpleTheme.secondary,
                  '&:hover': { backgroundColor: purpleTheme.primaryLight }
                }}
              >
                <ArrowForwardIos fontSize="small" sx={{ color: purpleTheme.primaryDark }} />
              </IconButton>
            </Box>

            <Tooltip title="Refresh orders">
              <IconButton
                color="primary"
                onClick={() => window.location.reload()}
                sx={{
                  ml: 1,
                  backgroundColor: purpleTheme.secondary,
                  '&:hover': {
                    backgroundColor: purpleTheme.primaryLight,
                  }
                }}
              >
                <Refresh sx={{ color: purpleTheme.primaryDark }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {isExtraSmallScreen && (
          <Box mt={2}>
            <Typography variant="body2" sx={{ mr: 1, color: 'text.secondary', mb: 1, fontSize: '0.8rem' }}>
              Sort by:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              <Chip
                label="Date"
                onClick={() => handleSort('createdAt')}
                variant={sortField === 'createdAt' ? 'filled' : 'outlined'}
                color="primary"
                size="small"
                icon={getSortIcon('createdAt')}
                sx={{ fontSize: '0.7rem' }}
              />
              <Chip
                label="Total"
                onClick={() => handleSort('total')}
                variant={sortField === 'total' ? 'filled' : 'outlined'}
                color="primary"
                size="small"
                icon={getSortIcon('total')}
                sx={{ fontSize: '0.7rem' }}
              />
              <Chip
                label="Items"
                onClick={() => handleSort('items')}
                variant={sortField === 'items' ? 'filled' : 'outlined'}
                color="primary"
                size="small"
                icon={getSortIcon('items')}
                sx={{ fontSize: '0.7rem' }}
              />
            </Box>
          </Box>
        )}
      </Paper>

      {loading ? (
        <LinearProgress color="primary" sx={{ height: 6, borderRadius: 3 }} />
      ) : (
        <>
          <Paper sx={{
            borderRadius: 3,
            boxShadow: 3,
            overflow: 'auto',
            border: `1px solid ${purpleTheme.secondary}`
          }}>
            <TableContainer sx={{ overflowX: 'auto', maxWidth: '100%' }}>
              <Table sx={{ minWidth: isSmallScreen ? 800 : 'auto' }}>
                <TableHead sx={{
                  bgcolor: purpleTheme.primary,
                  '& th': {
                    fontWeight: 'bold !important',
                    fontSize: isExtraSmallScreen ? '0.7rem' : (isSmallScreen ? '0.8rem' : '1rem'),
                    py: isSmallScreen ? 1 : 2,
                    whiteSpace: 'nowrap'
                  }
                }}>
                  <TableRow>
                    {renderTableCell('S.no', 'left', { color: 'common.white' })}
                    {renderTableCell('Order ID', 'left', { color: 'common.white' })}
                    {renderTableCell('Customer', 'left', { color: 'common.white' })}
                    {renderTableCell('Date', 'left', { color: 'common.white' })}
                    {renderTableCell('Payment', 'left', { color: 'common.white' })}
                    {renderTableCell('Items', 'center', { color: 'common.white' })}
                    {renderTableCell('Total', 'right', { color: 'common.white' })}
                    {renderTableCell('Status', 'left', { color: 'common.white' })}
                    {renderTableCell('Tracking', 'left', { color: 'common.white' })}
                    {renderTableCell('Actions', 'center', { color: 'common.white' })}
                    {renderTableCell('Invoice', 'center', { color: 'common.white' })}
                    {renderTableCell('History', 'center', { color: 'common.white' })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedOrders.length > 0 ? (
                    paginatedOrders.map((order, index) => (
                      <React.Fragment key={order._id}>
                        <StyledTableRow>
                          {renderTableCell(
                            <Typography variant="body2" sx={{
                              fontFamily: 'monospace',
                              color: purpleTheme.primaryDark,
                              fontSize: isExtraSmallScreen ? '0.7rem' : (isSmallScreen ? '0.8rem' : '0.9rem')
                            }}>
                              {index + 1}
                            </Typography>
                          )}
                          
                          {renderTableCell(
                            <Typography variant="body2" sx={{
                              fontFamily: 'monospace',
                              color: purpleTheme.primaryDark,
                              fontSize: isExtraSmallScreen ? '0.7rem' : (isSmallScreen ? '0.8rem' : '0.9rem')
                            }}>
                              #{order._id.substring(order._id.length - 6).toUpperCase()}
                            </Typography>
                          )}
                          
                          {renderTableCell(
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{
                                bgcolor: purpleTheme.primary,
                                width: isExtraSmallScreen ? 28 : 36,
                                height: isExtraSmallScreen ? 28 : 36,
                                mr: 2,
                                fontSize: isExtraSmallScreen ? '0.8rem' : '1rem'
                              }}>
                                {order.user?.name?.charAt(0) || 'C'}
                              </Avatar>
                              <Box>
                                <Typography fontWeight="600" sx={{ fontSize: isExtraSmallScreen ? '0.75rem' : (isSmallScreen ? '0.8rem' : '1rem') }}>
                                  {order.user?.name || 'Unknown'}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ fontSize: isExtraSmallScreen ? '0.65rem' : (isSmallScreen ? '0.7rem' : '0.875rem') }}>
                                  {order.user?.email || 'No email'}
                                </Typography>
                                <Box display="flex" alignItems="center" mt={0.5}>
                                  <LocationOn fontSize="small" color="action" sx={{ mr: 0.5, fontSize: isExtraSmallScreen ? '0.8rem' : '1rem' }} />
                                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: isExtraSmallScreen ? '0.6rem' : (isSmallScreen ? '0.65rem' : '0.75rem') }}>
                                    {order.shippingAddress?.city || 'Unknown city'}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          )}
                          
                          {renderTableCell(
                            <Box display="flex" flexDirection="column">
                              <Typography fontWeight="500" sx={{ fontSize: isExtraSmallScreen ? '0.7rem' : (isSmallScreen ? '0.8rem' : '1rem') }}>
                                {dayjs(order.createdAt).format('MMMD,YYYY')}
                              </Typography>
                              <Typography variant="body2" color="textSecondary" sx={{ fontSize: isExtraSmallScreen ? '0.6rem' : (isSmallScreen ? '0.7rem' : '0.875rem') }}>
                                {dayjs(order.createdAt).fromNow()}
                              </Typography>
                            </Box>
                          )}
                          
                          {renderTableCell(
                            <Box display="flex" alignItems="center">
                              <Payment fontSize="small" sx={{ mr: 1, color: purpleTheme.primary, fontSize: isExtraSmallScreen ? '0.8rem' : '1rem' }} />
                              <Typography variant="body2" fontWeight="500" sx={{ fontSize: isExtraSmallScreen ? '0.7rem' : (isSmallScreen ? '0.8rem' : '1rem') }}>
                                {paymentMethods[order.paymentMethod] || order.paymentMethod}
                              </Typography>
                            </Box>
                          )}
                          
                          {renderTableCell(
                            <Badge
                              badgeContent={getItemCount(order.items)}
                              color="primary"
                              anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                              }}
                              sx={{
                                '& .MuiBadge-badge': {
                                  fontWeight: 'bold',
                                  fontSize: isExtraSmallScreen ? '0.6rem' : '0.75rem',
                                  backgroundColor: purpleTheme.primary
                                }
                              }}
                            />,
                            'center'
                          )}
                          
                          {renderTableCell(
                            <Typography fontWeight="bold" color="primary" sx={{ fontSize: isExtraSmallScreen ? '0.8rem' : (isSmallScreen ? '0.9rem' : '1.1rem') }}>
                              ${order.total}
                            </Typography>,
                            'right'
                          )}
                          
                          {renderTableCell(
                            <Chip
                              icon={statusIcons[order.status]}
                              label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              color={statusColors[order.status]}
                              size="small"
                              sx={{ fontSize: isExtraSmallScreen ? '0.6rem' : (isSmallScreen ? '0.7rem' : '0.875rem') }}
                            />
                          )}
                          
                          {renderTableCell(
                            order.trackingId ? (
                              <Box>
                                <Typography variant="body2" fontWeight="500" sx={{ fontSize: isExtraSmallScreen ? '0.7rem' : (isSmallScreen ? '0.8rem' : '0.9rem') }}>
                                  {order.trackingCourier}
                                </Typography>
                                <Typography variant="caption" color="textSecondary" sx={{ fontSize: isExtraSmallScreen ? '0.6rem' : (isSmallScreen ? '0.7rem' : '0.8rem') }}>
                                  {order.trackingId}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="caption" color="textSecondary" sx={{ fontSize: isExtraSmallScreen ? '0.6rem' : (isSmallScreen ? '0.7rem' : '0.8rem') }}>
                                Not shipped yet
                              </Typography>
                            )
                          )}
                          
                          {renderTableCell(
                            <FormControl size="small" variant="outlined">
                              <Select
                                value={order.status}
                                onChange={(e) => handleStatusSelect(order, e.target.value)}
                                sx={{
                                  minWidth: isExtraSmallScreen ? 80 : 120,
                                  fontWeight: '500',
                                  '& .MuiSelect-select': {
                                    color: purpleTheme.primaryDark,
                                    fontSize: isExtraSmallScreen ? '0.7rem' : (isSmallScreen ? '0.75rem' : '0.875rem')
                                  }
                                }}
                                // IconComponent={MoreVert}
                                renderValue={(selected) => (
                                  <Box display="flex" alignItems="center">
                                    <Edit fontSize="small" sx={{ mr: 1, color: purpleTheme.primary, fontSize: isExtraSmallScreen ? '0.8rem' : '1rem' }} />
                                    <span style={{ fontSize: isExtraSmallScreen ? '0.7rem' : (isSmallScreen ? '0.75rem' : '0.875rem') }}>Update</span>
                                  </Box>
                                )}
                              >
                                <MenuItem value="pending" sx={{ fontSize: isExtraSmallScreen ? '0.7rem' : (isSmallScreen ? '0.75rem' : '0.875rem') }}>Pending</MenuItem>
                                <MenuItem value="processing" sx={{ fontSize: isExtraSmallScreen ? '0.7rem' : (isSmallScreen ? '0.75rem' : '0.875rem') }}>Processing</MenuItem>
                                <MenuItem value="shipped" sx={{ fontSize: isExtraSmallScreen ? '0.7rem' : (isSmallScreen ? '0.75rem' : '0.875rem') }}>Shipped</MenuItem>
                                <MenuItem value="delivered" sx={{ fontSize: isExtraSmallScreen ? '0.7rem' : (isSmallScreen ? '0.75rem' : '0.875rem') }}>Delivered</MenuItem>
                                <MenuItem value="cancelled" sx={{ fontSize: isExtraSmallScreen ? '0.7rem' : (isSmallScreen ? '0.75rem' : '0.875rem') }}>Cancelled</MenuItem>
                              </Select>
                            </FormControl>,
                            'center'
                          )}
                          
                          {renderTableCell(
                            <Button
                              variant="contained"
                              onClick={() => downloadInvoice(order._id)}
                              startIcon={<Download fontSize="small" sx={{ fontSize: isExtraSmallScreen ? '0.8rem' : '1rem' }} />}
                              sx={{
                                background: `linear-gradient(135deg, ${purpleTheme.primary} 0%, ${purpleTheme.primaryDark} 100%)`,
                                color: '#fff',
                                borderRadius: '8px',
                                fontWeight: 600,
                                px: isExtraSmallScreen ? 1 : (isSmallScreen ? 1.5 : 2.5),
                                py: isExtraSmallScreen ? 0.3 : (isSmallScreen ? 0.5 : 1),
                                textTransform: 'none',
                                fontSize: isExtraSmallScreen ? '0.65rem' : (isSmallScreen ? '0.7rem' : '0.875rem'),
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 6px 8px rgba(0,0,0,0.15)',
                                  background: `linear-gradient(135deg, ${purpleTheme.primaryDark} 0%, ${purpleTheme.primary} 100%)`,
                                }
                              }}
                            >
                              Invoice
                            </Button>,
                            'center'
                          )}
                          
                          {renderTableCell(
                            <IconButton
                              size="small"
                              onClick={() => toggleOrderExpansion(order)}
                              sx={{
                                color: purpleTheme.primary,
                                '&:hover': {
                                  backgroundColor: purpleTheme.secondary
                                }
                              }}
                            >
                              {expandedOrders[order._id] ? 
                                <ExpandLess sx={{ fontSize: isExtraSmallScreen ? '0.8rem' : '1rem' }} /> : 
                                <ExpandMore sx={{ fontSize: isExtraSmallScreen ? '0.8rem' : '1rem' }} />
                              }
                            </IconButton>,
                            'center'
                          )}
                        </StyledTableRow>
                        
                        {/* Status History and Tracking Row */}
                        <TableRow>
                          <TableCell style={{ padding: 0 }} colSpan={12}>
                            <Collapse in={expandedOrders[order._id]} timeout="auto" unmountOnExit>
                              <Box sx={{ margin: 1, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                                <Typography variant="h6" gutterBottom component="div" sx={{ display: 'flex', alignItems: 'center', fontSize: isExtraSmallScreen ? '0.9rem' : '1.25rem' }}>
                                  <History sx={{ mr: 1, fontSize: isExtraSmallScreen ? '0.9rem' : '1.25rem' }} /> Order Timeline
                                </Typography>
                                
                                {order.statusHistory && order.statusHistory.length > 0 ? (
                                  renderUnifiedTimeline(order)
                                ) : (
                                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: isExtraSmallScreen ? '0.75rem' : '0.875rem' }}>
                                    No status history available.
                                  </Typography>
                                )}

                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={12} align="center" sx={{ py: 6 }}>
                        <Box textAlign="center" p={2}>
                          <LocalShipping sx={{ fontSize: isExtraSmallScreen ? 60 : 80, color: 'text.disabled', mb: 2 }} />
                          <Typography variant="h6" color="textSecondary" sx={{ fontSize: isExtraSmallScreen ? '0.9rem' : '1.25rem' }}>
                            No orders found
                          </Typography>
                          <Typography variant="body2" color="textSecondary" mt={1} sx={{ fontSize: isExtraSmallScreen ? '0.75rem' : '0.875rem' }}>
                            Try changing your filters or check back later
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Box mt={3} display="flex" justifyContent="space-between" flexWrap="wrap" gap={1}>
            <Box display="flex" flexWrap="wrap" gap={1}>
              <Chip
                label={`Total: ${orders.length}`}
                sx={{
                  fontWeight: 'bold',
                  backgroundColor: purpleTheme.primary,
                  color: 'white',
                  fontSize: isExtraSmallScreen ? '0.7rem' : '0.875rem'
                }}
              />
              <Chip
                label={`Pending: ${orders.filter(o => o.status === 'pending').length}`}
                color="warning"
                variant="outlined"
                sx={{ fontWeight: '500', fontSize: isExtraSmallScreen ? '0.7rem' : '0.875rem' }}
              />
              <Chip
                label={`Processing: ${orders.filter(o => o.status === 'processing').length}`}
                color="info"
                variant="outlined"
                sx={{ fontWeight: '500', fontSize: isExtraSmallScreen ? '0.7rem' : '0.875rem' }}
              />
              <Chip
                label={`Shipped: ${orders.filter(o => o.status === 'shipped').length}`}
                sx={{
                  fontWeight: '500',
                  backgroundColor: purpleTheme.secondary,
                  color: purpleTheme.primaryDark,
                  fontSize: isExtraSmallScreen ? '0.7rem' : '0.875rem'
                }}
              />
              <Chip
                label={`Delivered: ${orders.filter(o => o.status === 'delivered').length}`}
                color="success"
                variant="outlined"
                sx={{ fontWeight: '500', fontSize: isExtraSmallScreen ? '0.7rem' : '0.875rem' }}
              />
              <Chip
                label={`Cancelled: ${orders.filter(o => o.status === 'cancelled').length}`}
                color="error"
                variant="outlined"
                sx={{ fontWeight: '500', fontSize: isExtraSmallScreen ? '0.7rem' : '0.875rem' }}
              />
            </Box>

            <Box>
              <Typography variant="body2" color="textSecondary" sx={{ fontSize: isExtraSmallScreen ? '0.7rem' : '0.875rem' }}>
                Showing {Math.min(paginatedOrders.length, rowsPerPage)} of {filteredOrders.length} orders
                </Typography>
            </Box>
          </Box>
        </>
      )}

      {/* Tracking Dialog */}
      <Dialog open={trackingDialog.open} onClose={() => setTrackingDialog({...trackingDialog, open: false})}>
        <DialogTitle sx={{ fontSize: isExtraSmallScreen ? '1rem' : '1.25rem' }}>Add Tracking Information</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" gutterBottom sx={{ fontSize: isExtraSmallScreen ? '0.75rem' : '0.875rem' }}>
            Order #{trackingDialog.order?._id?.substring(trackingDialog.order?._id.length - 6).toUpperCase()}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Tracking ID"
            fullWidth
            variant="outlined"
            value={trackingDialog.trackingId}
            onChange={(e) => setTrackingDialog({...trackingDialog, trackingId: e.target.value})}
            sx={{ mb: 2 }}
            InputProps={{
              sx: { fontSize: isExtraSmallScreen ? '0.8rem' : '0.9rem' }
            }}
            InputLabelProps={{
              sx: { fontSize: isExtraSmallScreen ? '0.8rem' : '0.9rem' }
            }}
          />
          <TextField
            margin="dense"
            label="Courier (e.g., ekart, dhl)"
            fullWidth
            variant="outlined"
            value={trackingDialog.trackingCourier}
            onChange={(e) => setTrackingDialog({...trackingDialog, trackingCourier: e.target.value})}
            sx={{ mb: 2 }}
            InputProps={{
              sx: { fontSize: isExtraSmallScreen ? '0.8rem' : '0.9rem' }
            }}
            InputLabelProps={{
              sx: { fontSize: isExtraSmallScreen ? '0.8rem' : '0.9rem' }
            }}
          />
          <TextField
            margin="dense"
            label="Note (Optional)"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={trackingDialog.note}
            onChange={(e) => setTrackingDialog({...trackingDialog, note: e.target.value})}
            InputProps={{
              sx: { fontSize: isExtraSmallScreen ? '0.8rem' : '0.9rem' }
            }}
            InputLabelProps={{
              sx: { fontSize: isExtraSmallScreen ? '0.8rem' : '0.9rem' }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setTrackingDialog({...trackingDialog, open: false})}
            sx={{ fontSize: isExtraSmallScreen ? '0.7rem' : '0.875rem' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleStatusChange(
              trackingDialog.order._id, 
              'shipped', 
              {
                trackingId: trackingDialog.trackingId,
                trackingCourier: trackingDialog.trackingCourier
              },
              trackingDialog.note
            )}
            disabled={!trackingDialog.trackingId || !trackingDialog.trackingCourier}
            variant="contained"
            sx={{ fontSize: isExtraSmallScreen ? '0.7rem' : '0.875rem' }}
          >
            Mark as Shipped
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: '100%',
            fontWeight: '500',
            backgroundColor: purpleTheme.primary,
            fontSize: isExtraSmallScreen ? '0.8rem' : '0.9rem'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Orders;