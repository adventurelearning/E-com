import React, { useState, useEffect } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, TableSortLabel,
  Select, MenuItem, FormControl, InputLabel, Chip,
  IconButton, Tooltip, Typography, Box,
  LinearProgress, Snackbar, Alert, Avatar, Badge,Button
} from '@mui/material';
import {
  CheckCircle, Cancel, LocalShipping,
  Refresh, FilterList, MoreVert, Edit,
  HourglassEmpty, Payment, LocationOn, ArrowUpward, ArrowDownward,
  ArrowBackIosNew,
  ArrowForwardIos,
  FileUploadOff,
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

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await Api.get('/orders/userOrders/all');
        console.log(response.data);

        // Calculate total for each order
        // const ordersWithTotal = response.data.map(order => {
        //   const total = order.items.reduce((sum, item) =>
        //     sum + (item.quantity * (item.productId?.price || 0)), 0);
        //   return { ...order, total };
        // });

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
      // Update order in backend
      await Api.put(
        `/orders/admin/${orderId}`,
        { status: newStatus },
      );

      // Update local state
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

  const filteredOrders = orders.filter(order =>
    statusFilter === 'all' || order.status === statusFilter
  );

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const isAsc = sortDirection === 'asc';

    if (sortField === 'createdAt') {
      return isAsc
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
    }

    if (sortField === 'total') {
      console.log(a);

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
  console.log(paginatedOrders);

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

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Invoice download failed:', error);
      alert('Failed to download invoice. Please try again.');
    }
  };

  return (
    <div
      style={{
        padding: '14px',
        width: '100%',
        maxWidth: '1050px',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}
    >
      {/* <Box display="flex" alignItems="center" mb={3} sx={{
        background: `linear-gradient(135deg, ${purpleTheme.primary} 0%, ${purpleTheme.primaryDark} 100%)`,
        padding: '16px 24px',
        borderRadius: 3,
        color: 'white'
      }}>
        <LocalShipping fontSize="large" sx={{ mr: 2, color: 'white' }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Orders Dashboard
        </Typography>
      </Box> */}

      <Paper sx={{
        mb: 3,
        p: 2,
        borderRadius: 3,
        boxShadow: 3,
        borderLeft: `4px solid ${purpleTheme.primary}`
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
          <Box display="flex" alignItems="center" mb={{ xs: 2, sm: 0 }}>
            <FilterList sx={{ mr: 1, color: purpleTheme.primary }} />
            <FormControl size="small" sx={{ minWidth: 180, mr: 2 }}>
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

            <Box display="flex" alignItems="center" ml={2}>
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
          </Box>

          <Box display="flex" alignItems="center">
            <Box display="flex" alignItems="center" sx={{ ml: 'auto' }}>
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
      </Paper>

      {loading ? (
        <LinearProgress color="primary" sx={{ height: 6, borderRadius: 3 }} />
      ) : (
        <>
          <Paper sx={{
            borderRadius: 3,
            boxShadow: 3,
            overflow: 'hidden',
            border: `1px solid ${purpleTheme.secondary}`
          }}>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead sx={{
                  bgcolor: purpleTheme.primary,
                  '& th': {
                    fontWeight: 'bold !important',
                    fontSize: '1rem'
                  }
                }}>
                  <TableRow>
                    <TableCell sx={{ color: 'common.white' }}>
                      S.no
                    </TableCell>
                    <TableCell sx={{ color: 'common.white' }}>
                      Order ID
                    </TableCell>
                    <TableCell sx={{ color: 'common.white' }}>Customer</TableCell>
                    <TableCell sx={{ color: 'common.white' }}>
                      Date
                    </TableCell>
                    <TableCell sx={{ color: 'common.white' }}>Payment</TableCell>
                    <TableCell align="center" sx={{ color: 'common.white' }}>
                      Items
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'common.white' }}>
                      Total
                    </TableCell>
                    <TableCell sx={{ color: 'common.white' }}>Status</TableCell>
                    <TableCell align="center" sx={{ color: 'common.white' }}>Actions</TableCell>
                   <TableCell align="center" sx={{ color: 'common.white' }}>Invoice</TableCell>

                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedOrders.length > 0 ? (
                    paginatedOrders.map((order, index) => (
                      <StyledTableRow key={order._id}>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          <Typography variant="body2" sx={{
                            fontFamily: 'monospace',
                            color: purpleTheme.primaryDark
                          }}>
                            {/* Serial number + Order ID suffix */}
                            {index + 1}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          <Typography variant="body2" sx={{
                            fontFamily: 'monospace',
                            color: purpleTheme.primaryDark
                          }}>
                            #{order._id.substring(order._id.length - 6).toUpperCase()}
                          </Typography>
                        </TableCell>
                        <TableCell>
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
                              <Typography fontWeight="600">{order.user?.name || 'Unknown'}</Typography>
                              <Typography variant="body2" color="textSecondary">
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
                        </TableCell>
                        <TableCell>
                          <Box display="flex" flexDirection="column">
                            <Typography fontWeight="500">
                              {dayjs(order.createdAt).format('MMMD,YYYY')}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {dayjs(order.createdAt).fromNow()}
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Payment fontSize="small" sx={{ mr: 1, color: purpleTheme.primary }} />
                            <Typography variant="body2" fontWeight="500">
                              {paymentMethods[order.paymentMethod] || order.paymentMethod}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
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
                          >
                            {/* <Typography fontWeight="500">{getItemCount(order.items)}</Typography> */}
                          </Badge>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold" color="primary" sx={{ fontSize: '1.1rem' }}>
                            ${order.total}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={statusIcons[order.status]}
                            label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            color={statusColors[order.status]}
                            size="small"

                          />
                        </TableCell>
                        <TableCell align="center">
                          <FormControl size="small" variant="outlined">
                            <Select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              sx={{
                                minWidth: 120,
                                fontWeight: '500',
                                '& .MuiSelect-select': {
                                  color: purpleTheme.primaryDark
                                }
                              }}
                              IconComponent={MoreVert}
                              renderValue={(selected) => (
                                <Box display="flex" alignItems="center">
                                  <Edit fontSize="small" sx={{ mr: 1, color: purpleTheme.primary }} />
                                  <span>Update</span>
                                </Box>
                              )}
                            >
                              <MenuItem value="pending">Pending</MenuItem>
                              <MenuItem value="processing">Processing</MenuItem>
                              <MenuItem value="shipped">Shipped</MenuItem>
                              <MenuItem value="delivered">Delivered</MenuItem>
                              <MenuItem value="cancelled">Cancelled</MenuItem>
                            </Select>
                          </FormControl>
                           </TableCell>
                           <TableCell>
                          {/* Download Invoice Button */}
                          <Button
                            variant="contained"
                            onClick={() => downloadInvoice(order._id)}
                            startIcon={<Download fontSize="small" />}
                            sx={{
                              background: `linear-gradient(135deg, ${purpleTheme.primary} 0%, ${purpleTheme.primaryDark} 100%)`,
                              color: '#fff',
                              borderRadius: '8px',
                              fontWeight: 600,
                              px: 2.5,
                              py: 1,
                              textTransform: 'none',
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
                          </Button>
                       </TableCell>
                      </StyledTableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
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

          <Box mt={3} display="flex" justifyContent="space-between" flexWrap="wrap">
            <Box display="flex" flexWrap="wrap">
              <Chip
                label={`Total: ${orders.length}`}
                sx={{
                  mb: 1,
                  fontWeight: 'bold',
                  backgroundColor: purpleTheme.primary,
                  color: 'white'
                }}
              />
              <Chip
                label={`Pending: ${orders.filter(o => o.status === 'pending').length}`}
                color="warning"
                variant="outlined"
                sx={{ ml: 1, mb: 1, fontWeight: '500' }}
              />
              <Chip
                label={`Processing: ${orders.filter(o => o.status === 'processing').length}`}
                color="info"
                variant="outlined"
                sx={{ ml: 1, mb: 1, fontWeight: '500' }}
              />
              <Chip
                label={`Shipped: ${orders.filter(o => o.status === 'shipped').length}`}
                sx={{
                  ml: 1,
                  mb: 1,
                  fontWeight: '500',
                  backgroundColor: purpleTheme.secondary,
                  color: purpleTheme.primaryDark
                }}
              />
              <Chip
                label={`Delivered: ${orders.filter(o => o.status === 'delivered').length}`}
                color="success"
                variant="outlined"
                sx={{ ml: 1, mb: 1, fontWeight: '500' }}
              />
              <Chip
                label={`Cancelled: ${orders.filter(o => o.status === 'cancelled').length}`}
                color="error"
                variant="outlined"
                sx={{ ml: 1, mb: 1, fontWeight: '500' }}
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