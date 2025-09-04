import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Api from '../../Services/Api';
import { toast } from 'react-toastify';
import {
  FiShoppingBag,
  FiChevronDown,
  FiChevronUp,
  FiPlus,
  FiCreditCard,
  FiDollarSign,
  FiCheck,
  FiTruck,
  FiPackage,
  FiChevronRight,
  FiMapPin,
  FiLoader
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import AddressForm from './AdressForm';
import { useCart } from '../../context/CartContext';
import { useRef } from 'react';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [] });
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const { resetCart, refreshCart } = useCart();
  const addressSectionRef = useRef(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [razorpayOrderId, setRazorpayOrderId] = useState(null); // Add this state

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login', { state: { from: '/checkout' } });
          return;
        }

        const cartResponse = await Api.get('/cart', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCart(cartResponse.data || { items: [] });

        const addressResponse = await Api.get('/users/addresses', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setAddresses(addressResponse.data);
        const defaultAddress = addressResponse.data.find(addr => addr.isDefault);
        if (defaultAddress) setSelectedAddress(defaultAddress._id);

      } catch (error) {
        toast.error('Failed to load checkout data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleAddressSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await Api.get('/users/addresses', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAddresses(response.data);
      const defaultAddress = response.data.find(addr => addr.isDefault);
      if (defaultAddress) setSelectedAddress(defaultAddress._id);

      setShowAddressForm(false);
    } catch (error) {
      toast.error('Failed to load addresses');
      console.error(error);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    try {
      setProcessingPayment(true);
      const token = localStorage.getItem('token');
      
      // Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error('Failed to load payment gateway. Please try again.');
        setProcessingPayment(false);
        return;
      }

      // Create Razorpay order
      const orderResponse = await Api.post('/orders/create-razorpay-order', {
        amount: Math.round(subtotal * 100), // Convert to paise
        currency: 'INR'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.message || 'Failed to create payment order');
      }

      const razorpayOrder = orderResponse.data.order;
      setRazorpayOrderId(razorpayOrder.id); // Store the Razorpay order ID
      
      const address = addresses.find(addr => addr._id === selectedAddress);

      // Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Your Store Name',
        description: `Payment for ${cart.items.length} items`,
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            // Verify payment
            const verificationResponse = await Api.post('/orders/update-razorpay-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });

            if (verificationResponse.data.success) {
              await completeOrder(response.razorpay_payment_id, razorpayOrder.id); // Pass both IDs
            } else {
              toast.error('Payment verification failed. Please contact support.');
              setProcessingPayment(false);
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
            setProcessingPayment(false);
          }
        },
        prefill: {
          name: address?.fullName || '',
          email: 'customer@example.com',
          contact: address?.phone || ''
        },
        notes: {
          items: cart.items.length.toString(),
          address: `${address?.street}, ${address?.city}`
        },
        theme: {
          color: getComputedStyle(document.documentElement)
            .getPropertyValue('--color-primary')
            .trim()
        },
        modal: {
          ondismiss: function() {
            setProcessingPayment(false);
            toast.info('Payment cancelled');
          }
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();

    } catch (error) {
      console.error('Razorpay payment error:', error);
      
      // Improved error handling
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to initialize payment. Please try again.');
      }
      setProcessingPayment(false);
    }
  };

  const completeOrder = async (razorpayPaymentId = null, razorpay_order_id = null) => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !selectedAddress || cart.items.length === 0) {
        toast.error('Missing required information for order');
        return;
      }

      const address = addresses.find(addr => addr._id === selectedAddress);
      if (!address) {
        toast.error('Selected address not found');
        return;
      }

      const orderData = {
        shippingAddress: {
          fullName: address.fullName,
          phone: address.phone,
          street: address.street,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode
        },
        paymentMethod,
        total: subtotal,
        razorpayPaymentId: paymentMethod === 'razorpay' ? razorpayPaymentId : null,
        razorpay_order_id: paymentMethod === 'razorpay' ? razorpay_order_id : null // Add this
      };

      const response = await Api.post('/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Clear cart
      await Api.delete('/cart/clear/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      refreshCart();
      setCart({ items: [] });
      
      toast.success('Order placed successfully!');
      navigate('/orders', { 
        state: { 
          orderId: response.data.orderId,
          paymentMethod: paymentMethod 
        } 
      });

    } catch (error) {
      console.error('Order completion error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setProcessingPayment(false);
    }
  };

  const placeOrder = async () => {
    if (!selectedAddress) {
      if (addressSectionRef.current) {
        const elementPosition = addressSectionRef.current.getBoundingClientRect().top + window.scrollY;
        const offset = 80;
        window.scrollTo({
          top: elementPosition - offset,
          behavior: "smooth",
        });
        addressSectionRef.current.classList.add("ring-2", "ring-red-500", "ring-offset-2");
        setTimeout(() => {
          addressSectionRef.current.classList.remove("ring-2", "ring-red-500", "ring-offset-2");
        }, 2000);
      }
      toast.error('Please select a delivery address');
      return;
    }

    if (paymentMethod === 'razorpay') {
      await handleRazorpayPayment();
    } else {
      await completeOrder();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (showAddressForm) {
    return (
      <AddressForm
        onSave={handleAddressSave}
        onClose={() => setShowAddressForm(false)}
      />
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiShoppingBag className="text-3xl text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet</p>
          <Link
            to="/products"
            className="inline-flex items-center px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const defaultAddress = addresses.find(addr => addr.isDefault);
  const otherAddresses = addresses.filter(addr => !addr.isDefault);
  const subtotal = cart.items.reduce(
    (sum, item) => sum + (item.productId?.discountPrice || item.productId?.originalPrice || 0) * item.quantity,
    0
  );
  const discount = cart.items.reduce(
    (sum, item) => item.productId?.discountPrice
      ? sum + (item.productId.originalPrice - item.productId.discountPrice) * item.quantity
      : sum,
    0
  );

  return (
    <div className=" mx-auto px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Complete Your Order</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Delivery Address */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address Section */}
            <div ref={addressSectionRef}>
              <motion.div
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                whileHover={{ y: -2 }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold flex items-center">
                      <FiTruck className="mr-2 text-primary" />
                      Delivery Address
                    </h2>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="text-primary hover:text-[#b10024] font-medium flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors"
                    >
                      <FiPlus className="text-sm" />
                      Add New Address
                    </button>
                  </div>

                  {addresses.length > 0 ? (
                    <div className="space-y-4">
                      {/* Default Address */}
                      {defaultAddress && (
                        <motion.div
                          whileTap={{ scale: 0.98 }}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedAddress === defaultAddress._id
                              ? 'border-primary bg-red-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                            }`}
                          onClick={() => setSelectedAddress(defaultAddress._id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <h3 className="font-medium text-gray-800">{defaultAddress.label}</h3>
                              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Default
                              </span>
                            </div>
                            {selectedAddress === defaultAddress._id && (
                              <span className="bg-purple-100 text-primary p-1 rounded-full">
                                <FiCheck className="text-sm" />
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-gray-700">
                            {defaultAddress.street}, {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.postalCode}
                          </p>
                          <p className="text-gray-600 mt-1">Phone: {defaultAddress.phone}</p>
                        </motion.div>
                      )}

                      {/* View All Addresses Toggle */}
                      {otherAddresses.length > 0 && (
                        <div className="border-t border-gray-100 pt-4">
                          <button
                            onClick={() => setShowAllAddresses(!showAllAddresses)}
                            className="text-primary hover:text-[#b10024] font-medium flex items-center gap-1"
                          >
                            {showAllAddresses ? (
                              <>
                                <FiChevronDown className="text-sm" />
                                Hide addresses
                              </>
                            ) : (
                              <>
                                <FiChevronRight className="text-sm" />
                                View all addresses ({otherAddresses.length})
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* Other Addresses */}
                      {showAllAddresses && otherAddresses.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3 }}
                          className="space-y-4 mt-4 overflow-hidden"
                        >
                          {otherAddresses.map(address => (
                            <motion.div
                              key={address._id}
                              whileTap={{ scale: 0.98 }}
                              className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedAddress === address._id
                                  ? 'border-primary bg-red-50 shadow-md'
                                  : 'border-gray-200 hover:border-gray-300'
                                }`}
                              onClick={() => setSelectedAddress(address._id)}
                            >
                              <div className="flex justify-between items-start">
                                <h3 className="font-medium text-gray-800">{address.label}</h3>
                                {selectedAddress === address._id && (
                                  <span className="bg-purple-100 text-primary p-1 rounded-full">
                                    <FiCheck className="text-sm" />
                                  </span>
                                )}
                              </div>
                              <p className="mt-2 text-gray-700">
                                {address.street}, {address.city}, {address.state} - {address.postalCode}
                              </p>
                              <p className="text-gray-600 mt-1">Phone: {address.phone}</p>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiMapPin className="text-2xl text-primary" />
                      </div>
                      <p className="text-gray-500 mb-4">No addresses found</p>
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="text-primary hover:text-[#b10024] font-medium px-4 py-2 rounded-md bg-purple-50 hover:bg-purple-100 transition-colors"
                      >
                        Add your first address
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Payment Method Section */}
            <motion.div
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              whileHover={{ y: -2 }}
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FiCreditCard className="mr-2 text-primary" />
                  Payment Method
                </h2>
                <div className="space-y-3">
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className={`border rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'cod'
                        ? 'border-primary bg-red-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <div className="flex items-center">
                      <div className={`h-5 w-5 rounded-full border flex items-center justify-center mr-3 ${paymentMethod === 'cod' ? 'border-primary bg-primary' : 'border-gray-300'
                        }`}>
                        {paymentMethod === 'cod' && <div className="h-2 w-2 rounded-full bg-white"></div>}
                      </div>
                      <div>
                        <h3 className="font-medium">Cash on Delivery</h3>
                        <p className="text-sm text-gray-600">Pay when you receive the product</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className={`border rounded-xl p-4 cursor-pointer transition-all ${paymentMethod === 'razorpay'
                        ? 'border-primary bg-red-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                    onClick={() => setPaymentMethod('razorpay')}
                  >
                    <div className="flex items-center">
                      <div className={`h-5 w-5 rounded-full border flex items-center justify-center mr-3 ${paymentMethod === 'razorpay' ? 'border-primary bg-primary' : 'border-gray-300'
                        }`}>
                        {paymentMethod === 'razorpay' && <div className="h-2 w-2 rounded-full bg-white"></div>}
                      </div>
                      <div>
                        <h3 className="font-medium">UPI / Card / NetBanking</h3>
                        <p className="text-sm text-gray-600">Pay securely with Razorpay</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              className="bg-white rounded-xl shadow-sm border border-gray-100 sticky top-4 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FiPackage className="mr-2 text-primary" />
                  Order Summary
                </h2>

                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {cart.items.map(item => (
                    <motion.div
                      key={item._id}
                      className="flex items-start border-b border-gray-100 pb-4"
                      whileHover={{ x: 2 }}
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                        <img
                          src={item.productId?.images?.[0] || 'https://via.placeholder.com/150'}
                          alt={item.productId?.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800 line-clamp-2">{item.productId?.name}</h3>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                            <span className="px-3 py-1 bg-white text-center w-12">
                              {item.quantity}
                            </span>
                          </div>
                          <span className="font-medium">
                            ₹{(
                              (item.productId?.discountPrice || item.productId?.originalPrice || 0) *
                              item.quantity
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({cart.items.reduce((total, item) => total + item.quantity, 0)} items)</span>
                    <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount</span>
                      <span className="text-green-600">-₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={placeOrder}
                  disabled={processingPayment}
                  className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${selectedAddress && !processingPayment
                      ? 'bg-gradient-to-r from-primary to-secondary text-white hover:from-secondary hover:to-secondary shadow-md'
                      : 'bg-gray-200 text-gray-500'
                    } ${processingPayment ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {processingPayment ? (
                    <>
                      <FiLoader className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : !selectedAddress ? (
                    'Select an address'
                  ) : (
                    <>
                      <FiCheck className="mr-2" />
                      {paymentMethod === 'razorpay' ? 'Pay Now' : 'Place Order'}
                    </>
                  )}
                </button>

                {paymentMethod === 'razorpay' && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      <strong>Test Mode:</strong> Use test card 4111 1111 1111 1111 or UPI ID "success@razorpay"
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CheckoutPage;