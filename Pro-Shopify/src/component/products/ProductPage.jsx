import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Api from '../../Services/Api';
import {
  FaHeart, FaRegHeart, FaStar, FaShoppingCart,
  FaChevronLeft, FaChevronRight, FaTruck,
  FaShieldAlt, FaExchangeAlt, FaCheck, FaPlus, FaMinus
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Rating } from 'react-simple-star-rating';
import { toast } from 'react-toastify';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import Lightbox from 'yet-another-react-lightbox';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import { useLocation } from 'react-router-dom';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [similarProducts, setSimilarProducts] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0, show: false });
  const [activeTab, setActiveTab] = useState('description');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const { fetchCartCount } = useCart();
  const {
    wishlistCount,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    fetchWishlistCount
  } = useWishlist();
  const location = useLocation();
  const [colorVariants, setColorVariants] = useState([]);
  const [loadingVariants, setLoadingVariants] = useState(false);

  // Function to safely render HTML content
  const createMarkup = (htmlContent) => {
    return { __html: htmlContent || '' };
  };

  // Function to check if special price is active
  const isSpecialPriceActive = (product) => {
    if (!product || !product.specialPrice || product.specialPrice <= 0) {
      return false;
    }
    
    const now = new Date();
    const startDate = new Date(product.specialPriceStart);
    const endDate = new Date(product.specialPriceEnd);
    
    return now >= startDate && now <= endDate;
  };

  // Function to get the display price
  const getDisplayPrice = (product) => {
    if (isSpecialPriceActive(product)) {
      return {
        price: product.specialPrice,
        originalPrice: product.originalPrice,
        discountPercent: Math.round(((product.originalPrice - product.specialPrice) / product.originalPrice) * 100),
        isSpecial: true
      };
    } else if (product.discountPrice > 0 && product.discountPrice < product.originalPrice) {
      return {
        price: product.discountPrice,
        originalPrice: product.originalPrice,
        discountPercent: product.discountPercent,
        isSpecial: false
      };
    } else {
      return {
        price: product.originalPrice,
        originalPrice: null,
        discountPercent: 0,
        isSpecial: false
      };
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await Api.get(`/products/${id}`);
        const productData = response.data;

        // Fetch reviews for this product
        const reviewsResponse = await Api.get(`/reviews/product/${id}`);
        setReviews(reviewsResponse.data);
        setReviewsLoading(false);

        const enhancedProduct = {
          ...productData,
          images: productData.images,
          colors: productData.colors,
          sizeChart: productData.sizeChart || [
            { label: 'S', stock: 10 },
            { label: 'M', stock: 15 },
            { label: 'L', stock: 8 },
            { label: 'XL', stock: 5 }
          ],
          // Calculate discount percent if not provided
          discountPercent: productData.discountPercent || 
            (productData.discountPrice > 0 && productData.originalPrice > productData.discountPrice ? 
              Math.round(((productData.originalPrice - productData.discountPrice) / productData.originalPrice) * 100) : 0),
          discountPrice: productData.discountPrice || 0,
          originalPrice: productData.originalPrice,
          specialPrice: productData.specialPrice || 0,
          specialPriceStart: productData.specialPriceStart || null,
          specialPriceEnd: productData.specialPriceEnd || null,
          offers: productData.offers || [
            'Bank offer 10% off',
            'No cost EMI available',
            'Exchange offer up to ₹15,000'
          ].slice(0, Math.floor(Math.random() * 3) + 1),
          deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
          }),
          warranty: productData.warranty || '1 Year Manufacturer Warranty',
          returnPolicy: productData.returnPolicy || '30 Days Return Policy',
          category: productData.category,
          // Keep the description as is - we'll handle HTML rendering in the component
          description: productData.description,
          specifications: productData.specifications || [
            { key: 'Material', value: 'Premium Cotton Blend' },
            { key: 'Dimensions', value: '30 x 20 x 5 cm' },
            { key: 'Weight', value: '450g' },
            { key: 'Country of Origin', value: 'India' }
          ],
          featureDescriptions: productData.featureDescriptions || [
            {
              title: 'Premium Quality',
              description: 'Made with high-grade materials for long-lasting durability'
            },
            {
              title: 'Eco-Friendly',
              description: 'Manufactured using sustainable practices and materials'
            },
            {
              title: 'Comfort Fit',
              description: 'Ergonomic design for all-day comfort'
            }
          ]
        };

        setProduct(enhancedProduct);
        setSelectedColor(enhancedProduct.colors[0]);
        setSelectedSize(enhancedProduct.sizeChart[0]?.label || '');

        fetchSimilarProducts(enhancedProduct.category, id, enhancedProduct.name);
      } catch (err) {
        setError(err.message || 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    const fetchSimilarProducts = async (category, currentProductId, currentProductName) => {
      try {
        setSimilarLoading(true);
        const response = await Api.get('/products');
        const filteredProducts = response.data
          .filter(p => p.category === category &&
            p.id !== currentProductId &&
            p.name !== currentProductName)
          .slice(0, 4)
          .map(p => {
            const displayPrice = getDisplayPrice(p);
            return {
              ...p,
              images: p.images || ['https://via.placeholder.com/300'],
              rating: p.averageRating || (Math.random() * 1 + 3.5).toFixed(1),
              reviews: p.reviews?.length || Math.floor(Math.random() * 200),
              discountPercent: displayPrice.discountPercent,
              discountPrice: displayPrice.price,
              originalPrice: displayPrice.originalPrice
            };
          });

        setSimilarProducts(filteredProducts);
      } catch (err) {
        console.error('Error fetching similar products:', err);
      } finally {
        setSimilarLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (id) {
      setIsFavorite(isInWishlist(id));
    }
  }, [id, isInWishlist]);

  // Add this useEffect for fetching color variants
  useEffect(() => {
    if (product?.groupId) {
      const fetchColorVariants = async () => {
        setLoadingVariants(true);
        try {
          const response = await Api.get(`/products/group/${product.groupId}`);
          // Filter out current product and products without colors
          const variants = response.data.filter(
            p => p._id !== id && p.colors && p.colors.length > 0
          );
          setColorVariants(variants);
        } catch (error) {
          console.error('Failed to fetch color variants', error);
        } finally {
          setLoadingVariants(false);
        }
      };
      fetchColorVariants();
    }
  }, [id, product?.groupId]);

  // Add this function to handle variant navigation
  const navigateToVariant = (variantId) => {
    // Preserve scroll position when navigating to variant
    navigate(`/productpage/${variantId}`, {
      state: { scrollPosition: window.scrollY },
      replace: true
    });
  };

  // Add this effect to restore scroll position when navigating between variants
  useEffect(() => {
    if (location.state?.scrollPosition) {
      window.scrollTo(0, location.state.scrollPosition);
    }
  }, [location]);

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { state: { from: `/productpage/${id}` } });
        return;
      }

      await Api.post('/cart', {
        productId: id,
        quantity,
      });

      toast.success('Product added to cart!');
      fetchCartCount();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const toggleFavorite = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { from: `/productpage/${id}` } });
      return;
    }

    try {
      if (isFavorite) {
        // Find the wishlist item ID to remove
        const wishlistItems = []; // You need to get wishlist items from context
        const itemToRemove = wishlistItems.find(item => item.product._id === id);
        if (itemToRemove) {
          await removeFromWishlist(itemToRemove._id);
        }
      } else {
        await addToWishlist(id);
      }
      setIsFavorite(!isFavorite);
      fetchWishlistCount();
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y, show: true });
  };

  const handleMouseLeave = () => {
    setZoomPosition({ ...zoomPosition, show: false });
  };

  const renderDetailedRatings = (detailedRatings) => {
    if (!detailedRatings || Object.keys(detailedRatings).length === 0) return null;

    return (
      <div className="mt-1 grid grid-cols-2 gap-2">
        {Object.entries(detailedRatings).map(([key, value]) => (
          <div key={key} className="flex items-center text-sm">
            <span className="text-gray-600 w-24 truncate">{key}:</span>
            <Rating
              initialValue={value}
              readonly
              size={15}
              SVGstyle={{ display: 'inline-block' }}
              className="ml-2"
            />
            <span className="ml-2 text-gray-800 font-medium">{value.toFixed(1)}</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-12 p-6 bg-red-50 rounded-lg shadow-sm">
        <h3 className="text-xl font-bold text-red-600 mb-4">Error loading product</h3>
        <p className="text-red-700">{error}</p>
        <Link to="/" className="mt-4 inline-block text-purple-600 hover:underline">
          Return to homepage
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Product not found</h2>
        <Link to="/products" className="text-primary hover:underline">
          Browse our products
        </Link>
      </div>
    );
  }

  // Get the display price information
  const displayPrice = getDisplayPrice(product);
  const isSpecialActive = isSpecialPriceActive(product);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Lightbox Component */}
      {product && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          index={lightboxIndex}
          slides={product.images.map(img => ({ src: img }))}
          plugins={[Thumbnails, Zoom]}
          zoom={{
            maxZoomPixelRatio: 5,
            zoomInMultiplier: 2,
            scrollToZoom: true
          }}
          thumbnails={{
            position: 'bottom',
            width: 80,
            height: 60,
            gap: 10,
            showToggle: true,
            border: 0
          }}
          on={{
            view: ({ index }) => setLightboxIndex(index),
          }}
          controller={{ closeOnBackdropClick: true }}
          carousel={{
            padding: 0,
            spacing: 0
          }}
          styles={{
            container: { backgroundColor: 'rgba(0, 0, 0, 0.92)' },
            thumbnail: { borderRadius: '4px', border: '2px solid transparent' },
            thumbnailActive: { borderColor: 'primary' }
          }}
          render={{
            buttonPrev: lightboxIndex <= 0 ? null : undefined,
            buttonNext: lightboxIndex >= product.images.length - 1 ? null : undefined,
            iconClose: () => (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ),
            iconZoomIn: () => (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zm-7-3v3m0 0v3m0-3h3m-3-3H7"
                />
              </svg>
            ),
            iconZoomOut: () => (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zm-4 0H7"
                />
              </svg>
            )
          }}
        />
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <Link to={`/category/${product.category}`} className="ml-1 text-sm font-medium text-gray-700 hover:text-primary md:ml-2">
                  Products
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                  {product.name}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Main Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12">
          {/* Product Images Section */}
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-200 relative">
            <div className="relative aspect-square w-full rounded-xl overflow-hidden group"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  className="h-full w-full object-contain cursor-zoom-in"
                  onClick={() => {
                    setLightboxIndex(currentImageIndex);
                    setLightboxOpen(true);
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>

              {/* Zoom effect */}
              {zoomPosition.show && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div
                    className="absolute w-[200%] h-[200%] bg-no-repeat bg-cover"
                    style={{
                      backgroundImage: `url(${product.images[currentImageIndex]})`,
                      backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      transform: 'translate(-50%, -50%)',
                      left: `${zoomPosition.x}%`,
                      top: `${zoomPosition.y}%`,
                    }}
                  />
                </div>
              )}

              {/* Discount Badge */}
              {displayPrice.discountPercent > 0 && (
                <div className={`absolute top-4 left-4 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md ${
                  isSpecialActive 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500' 
                    : 'bg-gradient-to-r from-primary to-[#ff5252]'
                }`}>
                  {displayPrice.discountPercent}% OFF
                  {isSpecialActive && <span className="ml-1">(Special)</span>}
                </div>
              )}

              {/* Favorite Button */}
              <motion.button
                onClick={toggleFavorite}
                className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md"
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isFavorite ? (
                  <FaHeart className="text-primary text-xl" />
                ) : (
                  <FaRegHeart className="text-xl text-gray-700" />
                )}
              </motion.button>

              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 text-gray-800 p-2 rounded-full shadow-lg hover:bg-white transition-all transform hover:scale-110"
                    aria-label="Previous image"
                  >
                    <FaChevronLeft className="text-sm" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 text-gray-800 p-2 rounded-full shadow-lg hover:bg-white transition-all transform hover:scale-110"
                    aria-label="Next image"
                  >
                    <FaChevronRight className="text-sm" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {product.images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto py-2 scrollbar-hide">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 h-16 w-16 border-2 rounded-md overflow-hidden transition-all ${index === currentImageIndex
                      ? 'border-primary scale-105 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Special Price Timer (if active) */}
            {isSpecialActive && product.specialPriceEnd && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-orange-800 font-medium text-sm mb-2">
                  🕒 Special offer ends in:
                </p>
                <div className="flex gap-2">
                  {(() => {
                    const now = new Date();
                    const endDate = new Date(product.specialPriceEnd);
                    const timeLeft = endDate - now;
                    
                    if (timeLeft <= 0) return null;
                    
                    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                    
                    return (
                      <>
                        {days > 0 && <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">{days}d</span>}
                        <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">{hours}h</span>
                        <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">{minutes}m</span>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Quantity Selector and Action Buttons */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between max-w-xs mx-auto">
                <span className="text-gray-700 font-medium">Quantity:</span>
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <button
                    onClick={decrementQuantity}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 bg-white text-center w-12">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-primary to-[#ff5252] hover:from-primary hover:to-primary text-white px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaShoppingCart />
                  Add to Cart
                </motion.button>

                <motion.button
                  onClick={() => {
                    handleAddToCart();
                    navigate('/buy-now', {
                      state: {
                        product: {
                          _id: id,
                          name: product.name,
                          images: product.images,
                          originalPrice: product.originalPrice,
                          discountPrice: displayPrice.price,
                          discountPercent: displayPrice.discountPercent,
                          isSpecial: displayPrice.isSpecial
                        },
                        quantity
                      }
                    });
                  }}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-500 hover:to-yellow-500 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Buy Now
                </motion.button>
              </div>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <div className="mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>
              <div className="flex items-center mt-2">
                <Rating
                  initialValue={product.averageRating}
                  readonly
                  size={20}
                  allowFraction
                  SVGstyle={{ display: 'inline-block' }}
                  className="mr-2"
                />
                <span className="text-gray-700 font-medium">{product.averageRating.toFixed(1)}</span>
                <span className="text-gray-500 text-sm ml-2">({reviews.length || 0} reviews)</span>
              </div>
            </div>

            {/* Price Section */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-2xl md:text-3xl font-bold text-gray-900">
                  ₹{displayPrice.price.toLocaleString()}
                </span>
                {displayPrice.originalPrice && (
                  <span className="text-gray-500 line-through text-lg">
                    ₹{displayPrice.originalPrice.toLocaleString()}
                  </span>
                )}
                {displayPrice.discountPercent > 0 && (
                  <span className={`text-lg font-medium ${isSpecialActive ? 'text-orange-600' : 'text-primary'}`}>
                    Save {displayPrice.discountPercent}%
                    {isSpecialActive && <span className="ml-1">(Special)</span>}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">Inclusive of all taxes</p>
              
              {/* Special Price Info */}
              {isSpecialActive && (
                <div className="mt-2 p-2 bg-orange-50 border border-orange-100 rounded-md">
                  <p className="text-orange-700 text-sm">
                    🎉 Special price valid until {new Date(product.specialPriceEnd).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {/* Color Selection */}
            <div className="mt-6">
              <h3 className="font-medium text-lg mb-3">Color: <span className="font-normal text-gray-700">{selectedColor}</span></h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <motion.button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border rounded-full text-sm font-medium transition-all flex items-center gap-2 ${selectedColor === color
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-200 hover:border-gray-300'}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {selectedColor === color && <FaCheck className="text-xs" />}
                    {color}
                  </motion.button>
                ))}
              </div>
            </div>
            {product?.groupId && (
              <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200">
                  Color Variants
                </h2>

                {loadingVariants ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : colorVariants.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {colorVariants.map(variant => {
                      const variantDisplayPrice = getDisplayPrice(variant);
                      return (
                        <motion.div
                          key={variant._id}
                          className="flex flex-col items-center cursor-pointer group"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => navigateToVariant(variant._id)}
                        >
                          <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-primary transition-all">
                            {variant.images?.[0] ? (
                              <img
                                src={variant.images[0]}
                                alt={variant.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-gray-400">
                                No Image
                              </div>
                            )}

                            {variant.colors?.[0] === selectedColor && (
                              <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                                Current
                              </div>
                            )}
                            
                            {/* Discount badge for variant */}
                            {variantDisplayPrice.discountPercent > 0 && (
                              <div className={`absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded ${
                                isSpecialPriceActive(variant) 
                                  ? 'bg-orange-500' 
                                  : 'bg-primary'
                              }`}>
                                {variantDisplayPrice.discountPercent}% OFF
                              </div>
                            )}
                          </div>

                          <div className="mt-2 text-center">
                            <div className="flex justify-center items-center gap-1">
                              {variant.colors?.map((color, idx) => (
                                <div
                                  key={idx}
                                  className={`w-4 h-4 rounded-full border ${color === selectedColor ? 'border-primary' : 'border-gray-300'}`}
                                  style={{ backgroundColor: color.toLowerCase() }}
                                  title={color}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium mt-1">
                              {variant.colors?.[0] || 'Color variant'}
                            </span>
                            <div className="flex items-center justify-center mt-1">
                              <span className="text-sm font-bold text-primary">
                                ₹{(variantDisplayPrice.price || 0).toLocaleString()}
                              </span>
                              {variantDisplayPrice.originalPrice && (
                                <span className="text-gray-500 line-through text-xs ml-1">
                                  ₹{variantDisplayPrice.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No other color variants available
                  </div>
                )}
              </div>
            )}
            {/* Size Selection */}
            {product.sizeChart && product.sizeChart.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-lg mb-3">Size: {selectedSize && <span className="font-normal text-gray-700">{selectedSize}</span>}</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizeChart.map((sizeObj) => (
                    <motion.button
                      key={sizeObj.label}
                      onClick={() => setSelectedSize(sizeObj.label)}
                      disabled={sizeObj.stock <= 0}
                      className={`w-12 h-10 flex items-center justify-center border rounded-md text-sm font-medium transition-all relative ${selectedSize === sizeObj.label
                        ? 'border-primary bg-primary text-white'
                        : sizeObj.stock <= 0
                          ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                          : 'border-gray-200 hover:border-gray-300'}`}
                      whileHover={sizeObj.stock > 0 ? { scale: 1.05 } : {}}
                      whileTap={sizeObj.stock > 0 ? { scale: 0.95 } : {}}
                    >
                      {sizeObj.label}
                      {sizeObj.stock <= 0 && (
                        <span className="absolute w-full h-px bg-gray-400 top-1/2 left-0 transform -rotate-12"></span>
                      )}
                    </motion.button>
                  ))}
                </div>
                {selectedSize && (
                  <div className="mt-2 text-sm text-gray-600">
                    {product.sizeChart.find(size => size.label === selectedSize)?.stock || 0} in stock
                  </div>
                )}
              </div>
            )}

            {/* Delivery & Offers Section */}
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="bg-primary p-2 rounded-full text-white">
                    <FaTruck className="text-xl" />
                  </div>
                  <div>
                    <p className="font-medium">Free Delivery</p>
                    <p className="text-sm text-gray-600">
                      Delivery by {product.deliveryDate}
                      <br />
                      Free shipping on orders over ₹500
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <FaShieldAlt className="text-gray-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Warranty</p>
                    <p className="text-sm text-gray-600">{product.warranty}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <FaExchangeAlt className="text-gray-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Returns</p>
                    <p className="text-sm text-gray-600">{product.returnPolicy}</p>
                  </div>
                </div>
              </div>

              {product.offers && product.offers.length > 0 && (
                <div className="border border-green-100 bg-green-50 rounded-xl p-4">
                  <h3 className="font-medium text-lg mb-3 text-green-800">Available offers</h3>
                  <ul className="space-y-3">
                    {product.offers.map((offer, i) => (
                      <motion.li
                        key={i}
                        className="flex items-start"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <span className="text-green-500 mr-2 mt-1">
                          <FaCheck className="text-sm" />
                        </span>
                        <span className="text-gray-700">{offer}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {['description', 'specs', 'reviews'].map((tab) => (
              <button
                key={tab}
                className={`px-6 py-4 font-medium text-lg ${activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600'}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'reviews' ? `Reviews (${reviews.length})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Description */}
            {activeTab === 'description' && (
              <div>
                <h3 className="font-medium text-lg mb-4 text-gray-800">Product Details</h3>
                {/* Use dangerouslySetInnerHTML to render HTML content */}
                <div 
                  className="text-gray-700 mb-6 product-description"
                  dangerouslySetInnerHTML={createMarkup(product.description)}
                />

                {product.featureDescriptions?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-medium text-lg mb-4 text-gray-800">Key Features</h3>
                    <ul className="space-y-6">
                      {product.featureDescriptions.map((feature, index) => (
                        <li key={index} className="flex flex-col md:flex-row items-start gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                          {feature.image && (
                            <div className="w-full md:w-1/3">
                              <img
                                src={feature.image}
                                alt={feature.title}
                                className="rounded-lg w-full object-cover border border-gray-200 shadow-sm"
                              />
                            </div>
                          )}

                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <div className="bg-gray-100 p-2 rounded-full mr-2">
                                <FaCheck className="text-primary" />
                              </div>
                              {feature.title && (
                                <h4 className="font-medium text-gray-900 text-base md:text-lg">{feature.title}</h4>
                              )}
                            </div>
                            <p className="text-gray-700">{feature.description}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>
            )}

            {/* Specifications */}
            {activeTab === 'specs' && (
              <div>
                <h3 className="font-medium text-lg mb-4 text-gray-800">Specifications</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Brand</span>
                    <span className="text-gray-800 font-medium">{product.brand}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Color</span>
                    <span className="text-gray-800 font-medium">{selectedColor}</span>
                  </div>

                  {selectedSize && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">Size</span>
                      <span className="text-gray-800 font-medium">{selectedSize}</span>
                    </div>
                  )}

                  {product.specifications?.map((spec, index) => (
                    <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500">{spec.key}</span>
                      <span className="text-gray-800 font-medium text-right max-w-xs">{spec.value}</span>
                    </div>
                  ))}

                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">SKU</span>
                    <span className="text-gray-800 font-medium">PRD{id}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews */}
            {activeTab === 'reviews' && (
              <div className="flex flex-col md:flex-row gap-8">
                {/* Average Rating Card */}
                <div className="md:w-1/3 lg:w-1/4">
                  <div className="text-center bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div className="text-5xl font-bold mb-2 text-gray-900">
                      {product.averageRating.toFixed(1)}
                    </div>
                    <div className="flex justify-center mb-3">
                      <Rating
                        initialValue={product.averageRating}
                        readonly
                        size={25}
                        SVGstyle={{ display: 'inline-block' }}
                      />
                    </div>
                    <p className="text-gray-600">{reviews.length} ratings</p>
                  </div>
                </div>

                {/* Review List */}
                <div className="md:w-2/3 lg:w-3/4">
                  {reviewsLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.slice(0, 3).map((review) => (
                        <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0">
                          <div className="flex items-start mb-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 mr-4 overflow-hidden">
                              {review.user?.photoURL ? (
                                <img
                                  src={review.user.photoURL}
                                  alt={review.user.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center w-full h-full text-gray-500 font-medium">
                                  {review.user?.name?.charAt(0) || 'U'}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{review.user?.name || 'Anonymous'}</p>
                              <div className="flex items-center mt-1">
                                <Rating
                                  initialValue={review.rating}
                                  readonly
                                  size={15}
                                  SVGstyle={{ display: 'inline-block' }}
                                  className="mr-2"
                                />
                                <span className="text-gray-500 text-sm">
                                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>

                          <p className="text-gray-700 mt-3">{review.comment}</p>

                          {/* Optional review images */}
                          {review.images?.length > 0 && (
                            <div className="mt-4 flex gap-3 flex-wrap">
                              {review.images.map((img, i) => (
                                <img
                                  key={i}
                                  src={img}
                                  alt={`Review image ${i + 1}`}
                                  className="w-24 h-24 object-cover rounded-lg border hover:scale-105 transition-transform"
                                />
                              ))}
                            </div>
                          )}

                          {/* Admin response */}
                          {review.adminComment && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                              <div className="flex items-center mb-2">
                                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded mr-2">Admin</span>
                                <span className="text-blue-800 font-medium">Response</span>
                              </div>
                              <p className="text-blue-700">{review.adminComment}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                    </div>
                  )}

                  {reviews.length > 0 && (
                    <button
                      className="mt-6 text-primary font-medium hover:underline flex items-center"
                      onClick={() => navigate(`/productpage/${id}/reviews`)}
                    >
                      See all {reviews.length} reviews
                      <FaChevronRight className="ml-1 text-sm" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>


        {/* Similar Products Section */}
        <div className="mt-12 bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200">Similar Products</h2>

          {similarLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : similarProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {similarProducts.map((item) => {
                const itemDisplayPrice = getDisplayPrice(item);
                const isItemSpecialActive = isSpecialPriceActive(item);
                
                return (
                  <motion.div
                    key={item.id}
                    className="relative border rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white group"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link to={`/productpage/${item._id}`} className="block">
                      <div className="relative h-48 bg-gray-100 flex items-center justify-center p-4">
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                        {itemDisplayPrice.discountPercent > 0 && (
                          <div className={`absolute top-3 left-3 text-white text-xs font-bold px-2 py-1 rounded ${
                            isItemSpecialActive 
                              ? 'bg-orange-500' 
                              : 'bg-primary'
                          }`}>
                            {itemDisplayPrice.discountPercent}% OFF
                            {isItemSpecialActive && <span className="ml-1 text-xs">Special</span>}
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 line-clamp-2 h-12 mb-2">{item.name}</h3>
                        <div className="flex items-center mb-2">
                          <Rating
                            initialValue={item.averageRating}
                            readonly
                            size={15}
                            className="mr-2"
                            SVGstyle={{ display: 'inline-block' }}
                          />
                          <span className="text-gray-600 text-sm">({item.reviews?.length || 0})</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-lg font-bold text-gray-900">
                            ₹{(itemDisplayPrice.price || 0).toLocaleString()}
                          </span>
                          {itemDisplayPrice.originalPrice && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500 line-through text-sm">
                                ₹{itemDisplayPrice.originalPrice.toLocaleString()}
                              </span>
                              {itemDisplayPrice.discountPercent > 0 && (
                                <span className={`text-sm ${isItemSpecialActive ? 'text-orange-600' : 'text-primary'}`}>
                                  {itemDisplayPrice.discountPercent}% off
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No similar products found</p>
              <Link
                to="/products"
                className="text-primary hover:underline font-medium"
              >
                Browse all products
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;