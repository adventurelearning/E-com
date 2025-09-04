import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Api from '../../Services/Api';
import AddReview from '../AddReview';
import { toast } from 'react-toastify';

// Heroicons (replace with your actual icon imports)
import {
  ArrowLeftIcon,
  TruckIcon,
  CheckCircleIcon,
  ShoppingBagIcon,
  ReceiptPercentIcon,
  ChatBubbleLeftEllipsisIcon,
  ArrowDownTrayIcon,
  HomeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [reviewProduct, setReviewProduct] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState(null);
  
  // Refs for timeline navigation
  const timelineContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

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

  useEffect(() => {
    fetchOrderDetails();
  }, [id, navigate]);

  // Check scroll position to show/hide arrows
  const checkScrollPosition = () => {
    if (timelineContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = timelineContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Scroll timeline left or right
  const scrollTimeline = (direction) => {
    if (timelineContainerRef.current) {
      const scrollAmount = 200;
      timelineContainerRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
      
      // Check position after scrolling
      setTimeout(checkScrollPosition, 300);
    }
  };

  const filterTrackingEvents = (checkpoints) => {
    const unwantedStatuses = ['Inscanned', 'InfoReceived', 'LabelCreated'];
    return checkpoints.filter(checkpoint => 
      !unwantedStatuses.includes(checkpoint.tag) &&
      !unwantedStatuses.some(status => 
        checkpoint.message.toLowerCase().includes(status.toLowerCase())
      )
    );
  };

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
      
      await fetchOrderDetails();
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
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'confirmed':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'processing':
        return <TruckIcon className="h-4 w-4" />;
      case 'shipped':
        return <TruckIcon className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircleIcon className="h-4 w-4" />;
      default:
        return <CheckCircleIcon className="h-4 w-4" />;
    }
  };

  const createUnifiedTimeline = () => {
    const timeline = [];
    
    timeline.push({
      type: 'system',
      title: 'Order Placed',
      description: 'Your order has been placed',
      date: order.createdAt,
      status: 'created',
      icon: <CheckCircleIcon className="h-4 w-4" />
    });
    
    if (order.statusHistory && order.statusHistory.length > 0) {
      order.statusHistory.forEach(item => {
        timeline.push({
          type: 'status',
          title: item.status.charAt(0).toUpperCase() + item.status.slice(1),
          description: item.note || `Status updated`,
          date: item.changedAt,
          status: item.status,
          icon: getStatusIcon(item.status)
        });
      });
    }
       
    return timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const TimelineItem = ({ event, isLast, isActive }) => {
    return (
      <div className="flex flex-col items-center min-w-[140px] relative z-10 p-2">
        <div className="relative mb-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center 
            ${isActive ? 'bg-primary text-white' : isLast ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}
            ${(isActive || isLast) ? 'ring-2 ring-primary/20' : ''}
            transition-all duration-300`}>
            {React.cloneElement(event.icon, { className: "h-5 w-5" })}
          </div>
          
          {!isLast && (
            <div className="absolute top-1/2 left-full w-52 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
          )}
        </div>

        <div className="text-center px-1">
          <div className={`text-sm font-semibold mb-1
            ${isActive ? 'text-primary' : isLast ? 'text-green-600' : 'text-gray-900'}`}>
            {event.title}
          </div>
          <div className="text-xs text-gray-500 mb-1 line-clamp-2 leading-tight" title={event.description}>
            {event.description}
          </div>
          <div className="text-xs text-gray-500 text-[0.7rem]">
            {formatDate(event.date)}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <div className="w-24 h-7 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
              <div className="w-3/5 h-7 bg-gray-200 rounded"></div>
              <div className="h-28 bg-gray-200 rounded mt-2"></div>
            </div>
          </div>
          <div>
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
              <div className="w-4/5 h-7 bg-gray-200 rounded"></div>
              <div className="h-60 bg-gray-200 rounded mt-2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-6xl mx-auto text-center">
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">
          {error}
        </div>
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center text-primary border border-primary rounded-md px-3 py-1 text-sm hover:bg-primary/5"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Orders
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-4 max-w-6xl mx-auto text-center">
        <div className="text-lg text-gray-500">
          No order details available.
        </div>
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center text-primary border border-primary rounded-md px-3 py-1 text-sm mt-2 mx-auto hover:bg-primary/5"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Orders
        </button>
      </div>
    );
  }

  const unifiedTimeline = createUnifiedTimeline();

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center text-primary border border-primary rounded-md px-3 py-1.5 text-sm mb-6 hover:bg-primary/5"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Back to Orders
      </button>

      {/* Order Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">
            Order #{order.orderNumber || id.substring(18, 24).toUpperCase()}
          </h1>
          <div className="flex items-center flex-wrap gap-1">
            <div className="text-sm text-gray-600 flex items-center">
              <CalendarDaysIcon className="h-4 w-4 mr-1" />
              Ordered on {formatDate(order.createdAt)}
            </div>
          </div>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
          {order.status || 'N/A'}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <button className="flex items-center justify-center bg-primary text-white rounded-md px-4 py-2.5 text-sm hover:bg-primary/90 transition-colors">
          <ChatBubbleLeftEllipsisIcon className="h-4 w-4 mr-1.5" />
          Contact Support
        </button>
        <button
          className="flex items-center justify-center border border-gray-300 rounded-md px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
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
          <ArrowDownTrayIcon className="h-4 w-4 mr-1.5" />
          Download Invoice
        </button>
      </div>

      {/* Enhanced Horizontal Timeline */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6 relative">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TruckIcon className="h-5 w-5 mr-2 text-primary" />
          Order Journey
        </h2>

        {/* Navigation Arrows */}
        {showLeftArrow && (
          <button 
            onClick={() => scrollTimeline('left')}
            className="absolute left-2 top-1/2 z-20 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
        )}
        
        {showRightArrow && (
          <button 
            onClick={() => scrollTimeline('right')}
            className="absolute right-2 top-1/2 z-20 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        )}

        <div 
          ref={timelineContainerRef}
          className="relative min-h-[140px] pb-2 overflow-x-hidden"
          onScroll={checkScrollPosition}
        >
          <div className="flex items-start relative">
            {unifiedTimeline.map((event, index) => (
              <TimelineItem 
                key={index}
                event={event}
                isLast={index === unifiedTimeline.length - 1}
                isActive={index === unifiedTimeline.length - 1 && order.status !== 'delivered'}
              />
            ))}
          </div>
        </div>

        {order.trackingId && (
          <div className="flex justify-center mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => fetchTrackingDetails(order.trackingCourier, order.trackingId)}
              disabled={trackingLoading}
              className="flex items-center border border-gray-300 rounded-md px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {trackingLoading ? (
                <div className="h-4 w-4 mr-1 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <ArrowPathIcon className="h-4 w-4 mr-1" />
              )}
              {trackingLoading ? 'Updating tracking...' : 'Refresh Tracking'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ShoppingBagIcon className="h-5 w-5 mr-2 text-primary" />
              Order Items ({order.items.length})
            </h2>

            <div className="divide-y divide-gray-200">
              {order.items.map((item, index) => {
                const firstImage = getFirstProductImage(item.productId);
                return (
                  <div key={item.productId?._id || index} className="py-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-16 h-16 rounded-md bg-gray-100 overflow-hidden mr-4">
                        {firstImage ? (
                          <img src={firstImage} alt={item.productId?.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBagIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {item.productId?.name || 'Unknown Product'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Quantity: {item.quantity}</p>
                        <p className="text-sm font-semibold text-primary mt-1">
                          ₹{(item.productId?.discountPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    {order.status === 'delivered' && (
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={() => handleOpenReview(item.productId)}
                          className="text-xs border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50 transition-colors"
                        >
                          Write a Review
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Summary and Address */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ReceiptPercentIcon className="h-5 w-5 mr-2 text-primary" />
              Order Summary
            </h2>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Order ID</p>
                <p className="text-sm font-medium">#{order.orderNumber || id.substring(18, 24).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Order Date</p>
                <p className="text-sm font-medium">
                  {new Date(order.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                <p className="text-sm font-medium">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                   order.paymentMethod === 'card' ? 'Credit/Debit Card' : 
                   order.paymentMethod || 'N/A'}
                </p>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Payment Status</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium 
                  ${order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                  {order.paymentStatus || 'Paid'}
                </span>
              </div>
            </div>

            <hr className="my-4 border-gray-200" />

            <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Details</h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Subtotal</span>
                <span className="text-xs">₹{order.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Shipping</span>
                <span className="text-xs text-green-600">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Tax</span>
                <span className="text-xs">₹{order.tax?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Discount</span>
                <span className="text-xs text-red-600">-₹{order.discount?.toFixed(2) || '0.00'}</span>
              </div>
            </div>

            <hr className="my-4 border-gray-200" />

            <div className="flex justify-between">
              <span className="text-sm font-semibold">Total Amount</span>
              <span className="text-sm font-semibold text-primary">
                ₹{order.total?.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Delivery Address */}
          {order.shippingAddress && (
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <HomeIcon className="h-5 w-5 mr-2 text-primary" />
                Delivery Address
              </h2>

              <div className="mb-4">
                <p className="text-sm font-medium">{order.shippingAddress.fullName}</p>
                <p className="text-xs text-gray-600 mt-1">{order.shippingAddress.street}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                </p>
                <p className="text-xs text-gray-600 mt-1">{order.shippingAddress.country}</p>
              </div>

              <div className="flex items-center">
                <PhoneIcon className="h-4 w-4 text-gray-500 mr-1.5" />
                <span className="text-xs">{order.shippingAddress.phone}</span>
                {order.shippingAddress.alternatePhone && (
                  <span className="text-xs ml-1">, {order.shippingAddress.alternatePhone}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {reviewProduct && (
        <AddReview
          open={Boolean(reviewProduct)}
          onClose={handleCloseReview}
          product={reviewProduct}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
};

export default OrderDetails;