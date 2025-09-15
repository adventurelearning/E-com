import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Api from '../../Services/Api';

dayjs.extend(relativeTime);

// Status configuration
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const statusIcons = {
  pending: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  ),
  processing: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
    </svg>
  ),
  shipped: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h4.05a2.5 2.5 0 014.9 0H20a1 1 0 001-1v-6a1 1 0 00-.293-.707l-4-4A1 1 0 0016 3H3a1 1 0 00-1 1zm14.707 3L17 5.414V7h2.293l-2-2zM16 9v2h2V9h-2z" />
    </svg>
  ),
  delivered: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  ),
  cancelled: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  )
};

const paymentMethods = {
  credit_card: 'Credit Card',
  paypal: 'PayPal',
  apple_pay: 'Apple Pay',
  google_pay: 'Google Pay',
  cod: 'Cash on Delivery'
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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
        console.log(response.data);

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

  const handleChangePage = (newPage) => {
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
  const handleStatusSelect = (order, newStatus) => {
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
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    );
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
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'processing':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        );
      case 'shipped':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h4.05a2.5 2.5 0 014.9 0H20a1 1 0 001-1v-6a1 1 0 00-.293-.707l-4-4A1 1 0 0016 3H3a1 1 0 00-1 1zm14.707 3L17 5.414V7h2.293l-2-2zM16 9v2h2V9h-2z" />
          </svg>
        );
      case 'delivered':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'cancelled':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
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
      icon: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      )
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
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'intransit':
      case 'outfordelivery':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h4.05a2.5 2.5 0 014.9 0H20a1 1 0 001-1v-6a1 1 0 00-.293-.707l-4-4A1 1 0 0016 3H3a1 1 0 00-1 1zm14.707 3L17 5.414V7h2.293l-2-2zM16 9v2h2V9h-2z" />
          </svg>
        );
      case 'exception':
      case 'inforeceived':
      default:
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  // Render unified timeline for an order
  const renderUnifiedTimeline = (order) => {
    const timeline = createUnifiedTimeline(order);

    return (
      <div className="relative pl-4 ml-1 border-l-2 border-dashed border-purple-300">
        {timeline.map((event, index) => (
          <div
            key={index}
            className="relative mb-4"
          >
            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-purple-100 border-2 border-white z-10"></div>
            <div className={`rounded-md shadow-sm border ${index === timeline.length - 1 ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
              <div className="p-2">
                <div className="flex justify-between items-start flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center text-gray-500 text-xs mb-1">
                      {event.icon}
                      <span className="ml-1">{dayjs(event.date).format('MMM D, YYYY h:mm A')}</span>
                    </div>
                    <div className="text-sm font-semibold mb-1">
                      {event.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {event.description}
                    </div>
                    {event.changedBy && (
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        Updated by: {event.changedBy}
                      </div>
                    )}
                    {event.trackingId && (
                      <div className="mt-1 text-xs text-gray-500">
                        Tracking: {event.trackingCourier} - {event.trackingId}
                      </div>
                    )}
                  </div>
                  {event.isTracking && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 ml-2">
                      Tracking
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-3 w-full max-w-screen-2xl mx-auto box-border mt-3">
      {/* Filter Bar */}
      <div className="mb-4 p-3 rounded-lg shadow-md border-l-4 border-purple-600 bg-white">
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-1 text-purple-600 hover:bg-purple-100 rounded"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
            </button>

            <div className={`flex flex-row items-center flex-wrap gap-2 ${!showFilters ? 'hidden md:flex' : ''}`}>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="pl-3 pr-10 py-1.5 text-sm text-purple-800 font-medium border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="Search by email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-44"
              />

              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-600">Sort:</span>
                <button
                  onClick={() => handleSort('createdAt')}
                  className={`px-2 py-1 flex text-xs rounded-full ${sortField === 'createdAt' ? 'bg-purple-100 text-purple-600' : 'bg-white text-purple-800 border border-purple-600'}`}
                >
                  Date {getSortIcon('createdAt')}
                </button>
                <button
                  onClick={() => handleSort('total')}
                  className={`px-2 py-1 flex text-xs rounded-full ${sortField === 'total' ? 'bg-purple-100 text-purple-600' : 'bg-white text-purple-800 border border-purple-600'}`}
                >
                  Total {getSortIcon('total')}
                </button>
                <button
                  onClick={() => handleSort('items')}
                  className={`px-2 py-1 flex text-xs rounded-full ${sortField === 'items' ? 'bg-purple-100 text-purple-600' : 'bg-white text-purple-800 border border-purple-600'}`}
                >
                  Items {getSortIcon('items')}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-sm text-purple-800">Rows:</span>
              <select
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                className=" py-1 text-sm text-purple-800 font-medium border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-16"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
            </div>



            <button
              onClick={() => window.location.reload()}
              className="p-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
              title="Refresh orders"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="m-4 flex justify-between flex-wrap gap-2">
        <div className="flex flex-wrap gap-1">
          <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs font-bold rounded-full">
            Total: {orders.length}
          </span>
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium border border-yellow-300 rounded-full">
            Pending: {orders.filter(o => o.status === 'pending').length}
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium border border-blue-300 rounded-full">
            Processing: {orders.filter(o => o.status === 'processing').length}
          </span>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium border border-purple-300 rounded-full">
            Shipped: {orders.filter(o => o.status === 'shipped').length}
          </span>
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium border border-green-300 rounded-full">
            Delivered: {orders.filter(o => o.status === 'delivered').length}
          </span>
          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium border border-red-300 rounded-full">
            Cancelled: {orders.filter(o => o.status === 'cancelled').length}
          </span>
        </div>

        <div>
          <span className="text-xs text-gray-500">
            Showing {Math.min(paginatedOrders.length, rowsPerPage)} of {filteredOrders.length} orders
          </span>
        </div>
      </div>

      {loading ? (
        <div className="h-1 bg-purple-100 rounded-full"></div>
      ) : (
        <>
          <div className="rounded-lg shadow-md border border-purple-100 bg-white overflow-auto">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-purple-100 text-purple-600">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-bold">#</th>
                    <th className="px-3 py-2 text-left text-xs font-bold">Order ID</th>
                    <th className="px-3 py-2 text-left text-xs font-bold">Customer</th>
                    <th className="px-3 py-2 text-left text-xs font-bold">Date</th>
                    <th className="px-3 py-2 text-left text-xs font-bold">Payment</th>
                    <th className="px-3 py-2 text-center text-xs font-bold">Items</th>
                    <th className="px-3 py-2 text-right text-xs font-bold">Total</th>
                    <th className="px-3 py-2 text-left text-xs font-bold">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-bold">Tracking</th>
                    <th className="px-3 py-2 text-center text-xs font-bold">Actions</th>
                    <th className="px-3 py-2 text-center text-xs font-bold">Invoice</th>
                    <th className="px-3 py-2 text-center text-xs font-bold">History</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.length > 0 ? (
                    paginatedOrders.map((order, index) => (
                      <React.Fragment key={order._id}>
                        <tr className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-purple-100 transition-colors`}>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-purple-800 font-mono">
                            {index + 1}
                          </td>

                          <td className="px-3 py-2 whitespace-nowrap text-sm text-purple-800 font-mono">
                            #{order._id.substring(order._id.length - 6).toUpperCase()}
                          </td>

                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold mr-2 overflow-hidden">
                                {order.user?.photoURL ? (
                                  // <img
                                  //   src={order.user.photoURL}
                                  //   alt={order.user?.name || 'User'}
                                  //   className="w-full h-full object-cover"
                                  // />
                                  order.user?.name?.charAt(0) || 'C'

                                ) : (
                                  order.user?.name?.charAt(0) || 'C'
                                )}
                              </div>

                              <div>
                                <div className="text-sm font-medium">
                                  {order.user?.name || 'Unknown'}
                                </div>
                                <div className="">
                                  {order.user?.email || 'No email'}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="flex flex-col">
                              <div className="text-sm font-medium">
                                {dayjs(order.createdAt).format('MMM D, YY')}
                              </div>
                              <div className="text-xs text-gray-500">
                                {dayjs(order.createdAt).fromNow()}
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                              </svg>
                              <div className="text-sm font-medium">
                                {paymentMethods[order.paymentMethod] || order.paymentMethod}
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-2 whitespace-nowrap text-center">
                            <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-purple-600 bg-purple-100 rounded-full">
                              {getItemCount(order.items)}
                            </span>
                          </td>

                          <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-bold text-purple-600">
                            ₹{order.total}
                          </td>

                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                              {statusIcons[order.status]}
                              <span className="ml-1">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                            </span>
                          </td>

                          <td className="px-3 py-2 whitespace-nowrap">
                            {order.trackingId ? (
                              <div>
                                <div className="text-sm font-medium">
                                  {order.trackingCourier}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {order.trackingId}
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500">
                                Not shipped
                              </div>
                            )}
                          </td>

                          <td className="px-3 py-2 whitespace-nowrap text-center">
                            <div className="relative">
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusSelect(order, e.target.value)}
                                className="pl-7 pr-8 py-1 text-xs text-purple-800 font-medium border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none"
                              >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                <svg className="h-3 w-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-2 whitespace-nowrap text-center">
                            <button
                              onClick={() => downloadInvoice(order._id)}
                              className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-purple-600 to-purple-800 text-white text-xs font-semibold rounded shadow-sm hover:shadow-md transition-all"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Invoice
                            </button>
                          </td>

                          <td className="px-3 py-2 whitespace-nowrap text-center">
                            <button
                              onClick={() => toggleOrderExpansion(order)}
                              className="p-1 text-purple-600 hover:bg-purple-100 rounded"
                            >
                              {expandedOrders[order._id] ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          </td>
                        </tr>

                        {/* Status History and Tracking Row */}
                        <tr>
                          <td colSpan={12} className="p-0">
                            <div className={`overflow-hidden transition-all duration-300 ${expandedOrders[order._id] ? 'max-h-screen' : 'max-h-0'}`}>
                              <div className="m-1 p-3 bg-gray-50 rounded">
                                <div className="flex items-center text-sm font-semibold mb-2">
                                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  </svg>
                                  Order Timeline
                                </div>

                                {order.statusHistory && order.statusHistory.length > 0 ? (
                                  renderUnifiedTimeline(order)
                                ) : (
                                  <div className="text-sm text-gray-500">
                                    No status history available.
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={12} className="px-4 py-8 text-center">
                        <div className="text-center p-4">
                          <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h4.05a2.5 2.5 0 014.9 0H20a1 1 0 001-1v-6a1 1 0 00-.293-.707l-4-4A1 1 0 0016 3H3a1 1 0 00-1 1zm14.707 3L17 5.414V7h2.293l-2-2zM16 9v2h2V9h-2z" />
                          </svg>
                          <div className="text-sm text-gray-600 font-medium">
                            No orders found
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Try changing your filters or check back later
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mb-4 mt-3 p-1 flex justify-end items-center rounded-lg shadow-md bg-white">
                        <span className="text-sm text-purple-800 m-2">
              {`${page * rowsPerPage + 1}-${Math.min(page * rowsPerPage + rowsPerPage, filteredOrders.length)} of ${filteredOrders.length}`}
            </span>

            <button
              onClick={() => setPage(old => Math.max(old - 1, 0))}
              disabled={page === 0}
              className="m-2 p-2 bg-purple-100 text-purple-800 rounded disabled:opacity-50 hover:bg-purple-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            <button
              onClick={() => setPage(old => old + 1)}
              disabled={page >= Math.ceil(filteredOrders.length / rowsPerPage) - 1}
              className="p-2 m-2 bg-purple-100 text-purple-800 rounded disabled:opacity-50 hover:bg-purple-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

        </>
      )}

      {/* Tracking Dialog */}
      {trackingDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold">Add Tracking Information</h3>
            </div>
            <div className="p-4">
              <div className="text-xs text-gray-500 mb-3">
                Order #{trackingDialog.order?._id?.substring(trackingDialog.order?._id.length - 6).toUpperCase()}
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">Tracking ID</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={trackingDialog.trackingId}
                  onChange={(e) => setTrackingDialog({ ...trackingDialog, trackingId: e.target.value })}
                  placeholder="Enter tracking ID"
                />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">Courier (e.g., ekart, dhl)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={trackingDialog.trackingCourier}
                  onChange={(e) => setTrackingDialog({ ...trackingDialog, trackingCourier: e.target.value })}
                  placeholder="Enter courier name"
                />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">Note (Optional)</label>
                <textarea
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  rows={2}
                  value={trackingDialog.note}
                  onChange={(e) => setTrackingDialog({ ...trackingDialog, note: e.target.value })}
                  placeholder="Add a note"
                ></textarea>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setTrackingDialog({ ...trackingDialog, open: false })}
                className="px-3 py-1 text-xs text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
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
                className="px-3 py-1 text-xs text-purple-600 bg-purple-100 rounded disabled:opacity-50 hover:bg-purple-700"
              >
                Mark as Shipped
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar.open && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`px-4 py-3 rounded shadow-lg text-purple-600 text-sm font-medium ${snackbar.severity === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}>
            {snackbar.message}
            <button
              onClick={handleCloseSnackbar}
              className="ml-4 text-purple-600 hover:text-gray-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;