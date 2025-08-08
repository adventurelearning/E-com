import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaShoppingCart, FaTrash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Api from '../../Services/Api'; // Ensure this path is correct for your project
import { useCart } from '../../context/CartContext'; // Ensure this path is correct
import { useWishlist } from '../../context/WishlistContext'; // Ensure this path is correct

const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlistItems, removeFromWishlist, fetchWishlistItems } = useWishlist();
  const { fetchCartCount } = useCart();

  useEffect(() => {
    // Fetch wishlist items when the component mounts
    fetchWishlistItems();
  }, [fetchWishlistItems]); // Dependency array: Re-run if fetchWishlistItems changes (unlikely for a stable function)

  const handleRemoveItem = async (itemId) => {
    // itemId here is the _id of the wishlist item itself, not the product id
    const success = await removeFromWishlist(itemId);
    if (success) {
      toast.success('Item removed from wishlist');
    } else {
      toast.error('Failed to remove item');
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // If no token, redirect to login page, passing the current path to navigate back after login
        navigate('/login', { state: { from: '/wishlist' } });
        return;
      }

      // API call to add product to cart
      await Api.post('/cart', {
        productId,
        quantity: 1 // Default quantity for adding from wishlist
      });

      toast.success('Product added to cart!');
      fetchCartCount(); // Update cart count in the UI
      // Optionally, you might want to remove the item from wishlist after adding to cart
      // This depends on your business logic. If so, call handleRemoveItem here as well:
      // handleRemoveItem(wishlistItemId); // You would need to pass the wishlist item _id
    } catch (error) {
      // Handle different error scenarios
      const errorMessage = error.response?.data?.message || 'Failed to add to cart. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Wishlist</h1>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4 text-gray-300">
              <FaRegHeart className="inline-block" />
            </div>
            <h2 className="text-2xl font-medium text-gray-700 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-500 mb-6">
              You haven't added any items to your wishlist yet.
            </p>
            <Link
              to="/"
              className="bg-[#d10024] text-white px-6 py-3 rounded-lg inline-block hover:bg-[#b30020] transition-colors duration-200 ease-in-out"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <motion.div
                key={item._id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Link to product details page */}
                <Link to={`/productpage/${item.product._id}`} className="block">
                  <div className="h-48 bg-gray-100 flex items-center justify-center p-4">
                    <img
                      src={item.product.images?.[0] || 'https://via.placeholder.com/300/e0e0e0/ffffff?text=No+Image'}
                      alt={item.product.name}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                </Link>

                <div className="p-4">
                  <Link to={`/productpage/${item.product._id}`}>
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {item.product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center mb-3">
                    <div className="font-bold text-lg text-gray-900">
                      ₹{item.product.discountPrice?.toLocaleString('en-IN') || '0'}
                    </div>
                    {item.product.originalPrice && (
                      <div className="text-gray-500 line-through text-sm ml-2">
                        ₹{item.product.originalPrice.toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between gap-2">
                    {/* Add to Cart button */}
                    <motion.button
                      onClick={() => handleAddToCart(item.product._id)}
                      className="flex-1 bg-[#d10024] text-white py-2 rounded flex items-center justify-center gap-2 text-sm hover:bg-[#b30020] transition-colors duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaShoppingCart />
                      Add to Cart
                    </motion.button>

                    {/* Remove from Wishlist button */}
                    <motion.button
                      onClick={() => handleRemoveItem(item._id)}
                      className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-600 transition-colors duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Remove from wishlist"
                    >
                      <FaTrash />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Wishlist;