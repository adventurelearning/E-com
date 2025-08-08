import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Api from '../../Services/Api';
import { FiShoppingBag, FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import { MdOutlineRemoveShoppingCart } from 'react-icons/md';
import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';

const CartPage = () => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState({});
  const navigate = useNavigate();
  const { refreshCart } = useCart();

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { state: { from: '/cart' } });
        return;
      }

      const response = await Api.get('/cart', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCart(response.data || { items: [] });
    } catch (error) {
      console.error('Error fetching cart:', error);
      if (error.response?.status === 401) {
        navigate('/login', { state: { from: '/cart' } });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [navigate]);

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      setUpdatingItems(prev => ({ ...prev, [itemId]: true }));
      const token = localStorage.getItem('token');
      const response = await Api.put(`/cart/${itemId}`, {
        quantity: newQuantity
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Update the specific item's quantity in the state
      setCart(prevCart => ({
        ...prevCart,
        items: prevCart.items.map(item =>
          item._id === itemId ? { ...item, quantity: newQuantity } : item
        )
      }));
      toast.success('Quantity updated');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error(error.response?.data?.message || 'Failed to update quantity');
    } finally {
      setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const removeItem = async (itemId) => {
    try {
      setUpdatingItems(prev => ({ ...prev, [itemId]: true }));
      const token = localStorage.getItem('token');
      console.log('Deleting item with ID:', itemId);
      await Api.delete(`/cart/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Remove the item from state immediately
      setCart(prevCart => {
        const updatedItems = prevCart.items.filter(item => item._id !== itemId);
        console.log('Updated items after deletion:', updatedItems);
        return { ...prevCart, items: updatedItems };
      });
      await refreshCart();

      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error(error.response?.data?.message || 'Failed to remove item');

      fetchCart();
    } finally {
      setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const clearCart = async () => {
    try {
      const token = localStorage.getItem('token');
      await Api.delete('/cart/clear/all', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Clear the cart in state immediately
      setCart({ items: [] });
      await refreshCart();
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error(error.response?.data?.message || 'Failed to clear cart');
    }
  };

  const subtotal = cart.items.reduce(
    (sum, item) => sum + (item.productId?.discountPrice || item.productId?.originalPrice || 0) * item.quantity,
    0
  );

  if (loading) {

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Shopping Cart</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4 flex flex-col sm:flex-row gap-4 animate-pulse">
                <div className="w-32 h-32 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="flex gap-4 mt-4">
                    <div className="flex items-center border rounded-lg overflow-hidden w-28">
                      <div className="px-3 py-1 bg-gray-200 w-full h-8"></div>
                    </div>
                    <div className="h-8 w-20 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 h-fit animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-full mt-6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold mb-6 text-gray-900"
        >
          Your Shopping Cart
        </motion.h1>

        {cart.items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 flex flex-col items-center"
          >
            <div className="w-48 h-48 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <FiShoppingBag className="text-gray-400 text-6xl" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Looks like you haven't added anything to your cart yet. Start shopping to find amazing products!
            </p>
            <Link
              to="/"
              className="bg-[#d10024] hover:bg-[#b10024] text-white px-6 py-3 rounded-lg transition-colors font-medium inline-flex items-center gap-2"
            >
              Start Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {cart.items.map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border-b border-gray-100 last:border-0 ${updatingItems[item._id] ? 'opacity-70' : ''}`}
                  >
                    <div className="p-4 flex flex-col sm:flex-row gap-4">
                      <Link
                        to={`/productpage/${item.productId?._id}`}
                        className="flex-shrink-0 w-32 h-32 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center"
                      >
                        <img
                          src={item.productId?.images?.[0] || 'https://via.placeholder.com/150'}
                          alt={item.productId?.name}
                          className="w-full h-full object-contain"
                        />
                      </Link>

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <Link
                            to={`/productpage/${item.productId?._id}`}
                            className="font-medium text-lg hover:text-purple-600 line-clamp-1"
                          >
                            {item.productId?.name}
                          </Link>
                          <button
                            onClick={() => removeItem(item._id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            disabled={updatingItems[item._id]}
                          >
                            <FiTrash2 />
                          </button>
                        </div>

                        <div className="mt-1 text-sm text-gray-600">
                          {item.color && <span>Color: {item.color}</span>}
                          {item.size && <span className="ml-2">Size: {item.size}</span>}
                        </div>

                        {/* Price display */}
                        <div className="mt-3 flex items-center flex-wrap gap-2">
                          {item.productId?.discountPrice ? (
                            <>
                              <span className="font-bold text-lg">₹{item.productId.discountPrice.toLocaleString()}</span>
                              <span className="text-gray-500 line-through text-sm">
                                ₹{item.productId.originalPrice.toLocaleString()}
                              </span>
                              <span className="text-green-600 text-sm font-medium bg-green-50 px-2 py-0.5 rounded">
                                {Math.round((1 - item.productId.discountPrice / item.productId.originalPrice) * 100)}% off
                              </span>
                            </>
                          ) : (
                            <span className="font-bold text-lg">₹{item.productId?.originalPrice?.toLocaleString()}</span>
                          )}
                        </div>

                        {/* Quantity controls */}
                        <div className="mt-4 flex items-center gap-4">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors text-gray-600 disabled:opacity-50"
                              disabled={item.quantity <= 1 || updatingItems[item._id]}
                            >
                              <FiMinus className="text-sm" />
                            </button>
                            <span className="px-4 py-2 bg-white text-center w-12 font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors text-gray-600 disabled:opacity-50"
                              disabled={updatingItems[item._id]}
                            >
                              <FiPlus className="text-sm" />
                            </button>
                          </div>

                          <div className="text-gray-700 font-medium">
                            ₹{(
                              (item.productId?.discountPrice || item.productId?.originalPrice || 0) *
                              item.quantity
                            ).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                <div className="p-4 border-t border-gray-100">
                  <button
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-700 font-medium flex items-center gap-2"
                  >
                    <MdOutlineRemoveShoppingCart className="text-lg" />
                    Clear Entire Cart
                  </button>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-4"
              >
                <h2 className="text-xl font-bold mb-6 pb-2 border-b border-gray-100">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({cart.items.reduce((total, item) => total + item.quantity, 0)} items)</span>
                    <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-600">Calculated at checkout</span>
                  </div>
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  className="w-full bg-[#d10024] hover:bg-[#b10024] text-white py-3 rounded-lg transition-colors font-medium mb-4"
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout
                </button>

                <Link
                  to="/"
                  className="block text-center text-[#d10024] hover:underline font-medium"
                >
                  Continue Shopping
                </Link>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="font-medium mb-3">We accept</h3>
                  <div className="flex gap-2">
                    <div className="w-12 h-8 bg-gray-100 rounded-md"></div>
                    <div className="w-12 h-8 bg-gray-100 rounded-md"></div>
                    <div className="w-12 h-8 bg-gray-100 rounded-md"></div>
                    <div className="w-12 h-8 bg-gray-100 rounded-md"></div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartPage;