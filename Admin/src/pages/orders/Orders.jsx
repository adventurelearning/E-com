import React, { useState, useEffect } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TableSortLabel,
  Select, MenuItem, FormControl, InputLabel, Chip,
  IconButton, Tooltip, Typography, Box,
  LinearProgress, Snackbar, Alert, Avatar, Badge, Button,
  TextField, useMediaQuery, useTheme
} from '@mui/material';
import {
  CheckCircle, Cancel, LocalShipping,
  Refresh, FilterList, MoreVert, Edit,
  HourglassEmpty, Payment, LocationOn, ArrowUpward, ArrowDownward,
  ArrowBackIosNew,
  ArrowForwardIos,
  Download
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
  }, []);

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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await Api.put(
        `/orders/admin/${orderId}`,
        { status: newStatus },
      );

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      setSnackbar({
        open: true,
        message: `Order status updated to ${newStatus}`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update order status',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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

  // Responsive table cell rendering
  const renderTableCell = (content, align = 'left', sx = {}) => (
    <TableCell align={align} sx={{ ...sx, py: isSmallScreen ? 1 : 2 }}>
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
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  label="Filter by Status"
                  sx={{
                    '& .MuiSelect-select': {
                      color: purpleTheme.primaryDark,
                      fontWeight: 500
                    }
                  }}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="shipped">Shipped</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
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
                    fontSize: '0.9rem',
                    backgroundColor: 'white'
                  }
                }}
              />

              {!isExtraSmallScreen && (
                <Box display="flex" alignItems="center" ml={isSmallScreen ? 0 : 2} mt={isSmallScreen ? 2 : 0}>
                  <Typography variant="body2" sx={{ mr: 1, color: 'text.secondary' }}>
                    Sort by:
                  </Typography>
                  <Chip
                    label="Date"
                    onClick={() => handleSort('createdAt')}
                    variant={sortField === 'createdAt' ? 'filled' : 'outlined'}
                    color="primary"
                    size="small"
                    icon={getSortIcon('createdAt')}
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label="Total"
                    onClick={() => handleSort('total')}
                    variant={sortField === 'total' ? 'filled' : 'outlined'}
                    color="primary"
                    size="small"
                    icon={getSortIcon('total')}
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label="Items"
                    onClick={() => handleSort('items')}
                    variant={sortField === 'items' ? 'filled' : 'outlined'}
                    color="primary"
                    size="small"
                    icon={getSortIcon('items')}
                  />
                </Box>
              )}
            </Box>
          </Box>

          <Box display="flex" alignItems="center" flexWrap="wrap" justifyContent={isSmallScreen ? 'space-between' : 'flex-end'} width={isSmallScreen ? '100%' : 'auto'}>
            <Box display="flex" alignItems="center" sx={{ ml: isSmallScreen ? 0 : 'auto' }} mt={isSmallScreen ? 2 : 0}>
              {!isExtraSmallScreen && (
                <>
                  <Typography variant="body2" sx={{ mr: 1, color: purpleTheme.primaryDark }}>
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
                        fontSize: '0.875rem',
                        color: purpleTheme.primaryDark,
                        fontWeight: 500
                      }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          '& .MuiMenuItem-root': {
                            fontSize: '0.875rem'
                          }
                        }
                      }
                    }}
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                  </Select>
                </>
              )}

              <Typography variant="body2" sx={{ mr: 2, color: purpleTheme.primaryDark }}>
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
            <Typography variant="body2" sx={{ mr: 1, color: 'text.secondary', mb: 1 }}>
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
              />
              <Chip
                label="Total"
                onClick={() => handleSort('total')}
                variant={sortField === 'total' ? 'filled' : 'outlined'}
                color="primary"
                size="small"
                icon={getSortIcon('total')}
              />
              <Chip
                label="Items"
                onClick={() => handleSort('items')}
                variant={sortField === 'items' ? 'filled' : 'outlined'}
                color="primary"
                size="small"
                icon={getSortIcon('items')}
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
                    fontSize: isSmallScreen ? '0.875rem' : '1rem',
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
                    {renderTableCell('Actions', 'center', { color: 'common.white' })}
                    {renderTableCell('Invoice', 'center', { color: 'common.white' })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedOrders.length > 0 ? (
                    paginatedOrders.map((order, index) => (
                      <StyledTableRow key={order._id}>
                        {renderTableCell(
                          <Typography variant="body2" sx={{
                            fontFamily: 'monospace',
                            color: purpleTheme.primaryDark
                          }}>
                            {index + 1}
                          </Typography>
                        )}
                        
                        {renderTableCell(
                          <Typography variant="body2" sx={{
                            fontFamily: 'monospace',
                            color: purpleTheme.primaryDark
                          }}>
                            #{order._id.substring(order._id.length - 6).toUpperCase()}
                          </Typography>
                        )}
                        
                        {renderTableCell(
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{
                              bgcolor: purpleTheme.primary,
                              width: 36,
                              height: 36,
                              mr: 2,
                              fontSize: '1rem'
                            }}>
                              {order.user?.name?.charAt(0) || 'C'}
                            </Avatar>
                            <Box>
                              <Typography fontWeight="600" fontSize={isSmallScreen ? '0.875rem' : '1rem'}>
                                {order.user?.name || 'Unknown'}
                              </Typography>
                              <Typography variant="body2" color="textSecondary" fontSize={isSmallScreen ? '0.75rem' : '0.875rem'}>
                                {order.user?.email || 'No email'}
                              </Typography>
                              <Box display="flex" alignItems="center" mt={0.5}>
                                <LocationOn fontSize="small" color="action" sx={{ mr: 0.5 }} />
                                <Typography variant="caption" color="textSecondary">
                                  {order.shippingAddress?.city || 'Unknown city'}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        )}
                        
                        {renderTableCell(
                          <Box display="flex" flexDirection="column">
                            <Typography fontWeight="500" fontSize={isSmallScreen ? '0.875rem' : '1rem'}>
                              {dayjs(order.createdAt).format('MMMD,YYYY')}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" fontSize={isSmallScreen ? '0.75rem' : '0.875rem'}>
                              {dayjs(order.createdAt).fromNow()}
                            </Typography>
                          </Box>
                        )}
                        
                        {renderTableCell(
                          <Box display="flex" alignItems="center">
                            <Payment fontSize="small" sx={{ mr: 1, color: purpleTheme.primary }} />
                            <Typography variant="body2" fontWeight="500" fontSize={isSmallScreen ? '0.875rem' : '1rem'}>
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
                                fontSize: '0.75rem',
                                backgroundColor: purpleTheme.primary
                              }
                            }}
                          />,
                          'center'
                        )}
                        
                        {renderTableCell(
                          <Typography fontWeight="bold" color="primary" sx={{ fontSize: isSmallScreen ? '0.875rem' : '1.1rem' }}>
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
                            sx={{ fontSize: isSmallScreen ? '0.75rem' : '0.875rem' }}
                          />
                        )}
                        
                        {renderTableCell(
                          <FormControl size="small" variant="outlined">
                            <Select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              sx={{
                                minWidth: 120,
                                fontWeight: '500',
                                '& .MuiSelect-select': {
                                  color: purpleTheme.primaryDark,
                                  fontSize: isSmallScreen ? '0.75rem' : '0.875rem'
                                }
                              }}
                              IconComponent={MoreVert}
                              renderValue={(selected) => (
                                <Box display="flex" alignItems="center">
                                  <Edit fontSize="small" sx={{ mr: 1, color: purpleTheme.primary }} />
                                  <span style={{ fontSize: isSmallScreen ? '0.75rem' : '0.875rem' }}>Update</span>
                                </Box>
                              )}
                            >
                              <MenuItem value="pending" sx={{ fontSize: isSmallScreen ? '0.75rem' : '0.875rem' }}>Pending</MenuItem>
                              <MenuItem value="processing" sx={{ fontSize: isSmallScreen ? '0.75rem' : '0.875rem' }}>Processing</MenuItem>
                              <MenuItem value="shipped" sx={{ fontSize: isSmallScreen ? '0.75rem' : '0.875rem' }}>Shipped</MenuItem>
                              <MenuItem value="delivered" sx={{ fontSize: isSmallScreen ? '0.75rem' : '0.875rem' }}>Delivered</MenuItem>
                              <MenuItem value="cancelled" sx={{ fontSize: isSmallScreen ? '0.75rem' : '0.875rem' }}>Cancelled</MenuItem>
                            </Select>
                          </FormControl>,
                          'center'
                        )}
                        
                        {renderTableCell(
                          <Button
                            variant="contained"
                            onClick={() => downloadInvoice(order._id)}
                            startIcon={<Download fontSize="small" />}
                            sx={{
                              background: `linear-gradient(135deg, ${purpleTheme.primary} 0%, ${purpleTheme.primaryDark} 100%)`,
                              color: '#fff',
                              borderRadius: '8px',
                              fontWeight: 600,
                              px: isSmallScreen ? 1.5 : 2.5,
                              py: isSmallScreen ? 0.5 : 1,
                              textTransform: 'none',
                              fontSize: isSmallScreen ? '0.75rem' : '0.875rem',
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
                      </StyledTableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                        <Box textAlign="center" p={2}>
                          <LocalShipping sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                          <Typography variant="h6" color="textSecondary">
                            No orders found
                          </Typography>
                          <Typography variant="body2" color="textSecondary" mt={1}>
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
                  color: 'white'
                }}
              />
              <Chip
                label={`Pending: ${orders.filter(o => o.status === 'pending').length}`}
                color="warning"
                variant="outlined"
                sx={{ fontWeight: '500' }}
              />
              <Chip
                label={`Processing: ${orders.filter(o => o.status === 'processing').length}`}
                color="info"
                variant="outlined"
                sx={{ fontWeight: '500' }}
              />
              <Chip
                label={`Shipped: ${orders.filter(o => o.status === 'shipped').length}`}
                sx={{
                  fontWeight: '500',
                  backgroundColor: purpleTheme.secondary,
                  color: purpleTheme.primaryDark
                }}
              />
              <Chip
                label={`Delivered: ${orders.filter(o => o.status === 'delivered').length}`}
                color="success"
                variant="outlined"
                sx={{ fontWeight: '500' }}
              />
              <Chip
                label={`Cancelled: ${orders.filter(o => o.status === 'cancelled').length}`}
                color="error"
                variant="outlined"
                sx={{ fontWeight: '500' }}
              />
            </Box>

            <Box>
              <Typography variant="body2" color="textSecondary">
                Showing {Math.min(paginatedOrders.length, rowsPerPage)} of {filteredOrders.length} orders
              </Typography>
            </Box>
          </Box>
        </>
      )}

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
            backgroundColor: purpleTheme.primary
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Orders;