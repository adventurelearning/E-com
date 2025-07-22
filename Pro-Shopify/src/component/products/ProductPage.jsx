import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Api from '../../Services/Api';
import {
  FaHeart, FaRegHeart, FaStar, FaShoppingCart,
  FaChevronLeft, FaChevronRight, FaTruck,
  FaShieldAlt, FaExchangeAlt, FaCheck
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Rating } from 'react-simple-star-rating';
import { toast } from 'react-toastify';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

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
  const { fetchCartCount } = useCart();
  const {
  wishlistCount,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
  fetchWishlistCount
} = useWishlist();

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
        // color: selectedColor,
        // size: selectedSize
      });

      toast.success('Product added to cart!');
      fetchCartCount(); // Update the cart count in the header
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await Api.get(`/products/${id}`);

        const enhancedProduct = {
          ...response.data,
          images: response.data.images || [
            'https://via.placeholder.com/800x800/EEE?text=Product+Image',
            'https://via.placeholder.com/800x800/EEE?text=Product+Image+2',
            'https://via.placeholder.com/800x800/EEE?text=Product+Image+3'
          ],
          colors: response.data.colors || ['Black', 'White', 'Blue', 'Red'],
          sizeChart: response.data.sizeChart || [
            { label: 'S', stock: 10 },
            { label: 'M', stock: 15 },
            { label: 'L', stock: 8 },
            { label: 'XL', stock: 5 }
          ],
          rating: response.data.rating || (Math.random() * 1 + 4).toFixed(1),
          reviews: response.data.reviews || Math.floor(Math.random() * 500),
          discountPercent: response.data.discountPercent || Math.floor(Math.random() * 30) + 5,
          discountPrice: response.data.discountPrice ||
            Math.round(response.data.originalPrice * 0.9),
          originalPrice: response.data.originalPrice,
          offers: response.data.offers || [
            'Bank offer 10% off',
            'No cost EMI available',
            'Exchange offer up to ₹15,000'
          ].slice(0, Math.floor(Math.random() * 3) + 1),
          deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
          }),
          warranty: response.data.warranty || '1 Year Manufacturer Warranty',
          returnPolicy: response.data.returnPolicy || '30 Days Return Policy',
          category: response.data.category,
          description: response.data.description || 'This premium product features high-quality materials and craftsmanship. Designed for comfort and durability, it offers excellent value for money. Perfect for everyday use or special occasions.'
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
          .map(p => ({
            ...p,
            images: p.images || ['https://via.placeholder.com/300'],
            rating: p.rating || (Math.random() * 1 + 3.5).toFixed(1),
            reviews: p.reviews || Math.floor(Math.random() * 200),
            discountPercent: p.discountPercent || Math.floor(Math.random() * 30) + 5,
            discountPrice: p.discountPrice || Math.round(p.originalPrice * 0.9),
            originalPrice: p.originalPrice
          }));

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

const toggleFavorite = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    navigate('/login', { state: { from: `/productpage/${id}` } });
    return;
  }

  try {
    if (isFavorite) {
      // Find the wishlist item ID to remove
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
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
        <Link to="/products" className="text-purple-600 hover:underline">
          Browse our products
        </Link>
      </div>
    );
  }

  return (
    <>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-purple-600">
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
                <Link to={`/category/${product.category}`} className="ml-1 text-sm font-medium text-gray-700 hover:text-purple-600 md:ml-2">
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
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="relative aspect-square w-full bg-gray-50 rounded-lg overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  className="h-full w-full object-contain"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>

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

              {/* Discount Badge */}
              {product.discountPercent > 0 && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  {product.discountPercent}% OFF
                </div>
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
                      ? 'border-[#d10024] scale-105 shadow-md'
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
                  className="flex-1 bg-[#d10024] hover:bg-[#d10024] text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
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
                          discountPrice: product.discountPrice,
                          discountPercent: product.discountPercent
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
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>
                <div className="flex items-center mt-2">
                  <Rating
                    initialValue={parseFloat(product.rating)}
                    readonly
                    size={20}
                    allowFraction
                    SVGstyle={{ display: 'inline-block' }}
                    className="mr-2"
                  />
                  <span className="text-gray-700 font-medium">{product.rating}</span>
                  <span className="text-gray-500 text-sm ml-2">({product.reviews} reviews)</span>
                </div>
              </div>
              <motion.button
                onClick={toggleFavorite}
                className="text-gray-400 hover:text-red-500 transition-colors p-2"
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                whileTap={{ scale: 0.9 }}
              >
                {isFavorite ? (
                  <FaHeart className="text-red-500 text-2xl" />
                ) : (
                  <FaRegHeart className="text-2xl" />
                )}
              </motion.button>
            </div>

            {/* Price Section */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-2xl md:text-3xl font-bold text-gray-900">
                  ₹{product.discountPrice.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-gray-500 line-through text-lg">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                )}
                {product.discountPercent > 0 && (
                  <span className="text-green-600 text-lg font-medium">
                    {product.discountPercent}% off
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">Inclusive of all taxes</p>
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
                      ? 'border-[#d10024] bg-purple-50 text-[#d10024]'
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
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
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
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-start gap-3">
                  <FaTruck className="text-gray-600 text-xl mt-1 flex-shrink-0" />
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
                <div className="border border-green-100 bg-green-50 rounded-lg p-4">
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

        {/* Product Description Section */}
        <div className="mt-12 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-100">Product Details</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="font-medium text-lg mb-3 text-gray-800">Description</h3>
              <p className="text-gray-700 whitespace-pre-line">
                {product.description}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-lg mb-3 text-gray-800">Specifications</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Brand</span>
                  <span className="text-gray-800 font-medium">BrandX</span>
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
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Material</span>
                  <span className="text-gray-800 font-medium">Premium Quality</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">SKU</span>
                  <span className="text-gray-800 font-medium">PRD{id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-100">Customer Reviews</h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3 lg:w-1/4">
              <div className="text-center bg-gray-50 p-6 rounded-lg border border-gray-100">
                <div className="text-5xl font-bold mb-2 text-gray-900">{product.rating}</div>
                <div className="flex justify-center mb-3">
                  <Rating
                    initialValue={parseFloat(product.rating)}
                    readonly
                    size={25}
                    SVGstyle={{ display: 'inline-block' }}
                  />
                </div>
                <p className="text-gray-600">{product.reviews} ratings</p>
              </div>
            </div>
            <div className="md:w-2/3 lg:w-3/4">
              <div className="space-y-6">
                {[1, 2, 3].map((review) => (
                  <div key={review} className="border-b border-gray-100 pb-6 last:border-0">
                    <div className="flex items-start mb-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 mr-4 flex items-center justify-center text-gray-500">
                        {review}
                      </div>
                      <div>
                        <p className="font-medium">Customer {review}</p>
                        <div className="flex items-center mt-1">
                          <Rating
                            initialValue={5 - review}
                            readonly
                            size={15}
                            SVGstyle={{ display: 'inline-block' }}
                            className="mr-2"
                          />
                          <span className="text-gray-500 text-sm">
                            {new Date().toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 pl-14">
                      {review === 1
                        ? "Absolutely love this product! The quality exceeded my expectations and it fits perfectly. Will definitely purchase again."
                        : review === 2
                          ? "Good product overall, but the color was slightly different than shown in the pictures. Still happy with the purchase."
                          : "Decent product for the price. Delivery took a bit longer than expected but customer service was helpful."}
                    </p>
                  </div>
                ))}
              </div>
              <button className="mt-6 text-purple-600 font-medium hover:underline flex items-center">
                See all {product.reviews} reviews
                <FaChevronRight className="ml-1 text-sm" />
              </button>
            </div>
          </div>
        </div>

        {/* Similar Products Section */}
        <div className="mt-12 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-100">Similar Products</h2>

          {similarLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#d10024]"></div>
            </div>
          ) : similarProducts.length > 0 ? (
            <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {similarProducts.map((item) => (
                <motion.div
                  key={item.id}
                  className="relative border rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link to={`/productpage/${item._id}`} className="block">
                    <div className=" h-48 bg-gray-100 flex items-center justify-center p-4">
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="h-full w-full object-contain"
                      />
                      {item.discountPercent > 0 && (
                        <div className="absolute  top-3 left-3 bg-[#d10024] text-white text-xs font-bold px-2 py-1 rounded">
                          {item.discountPercent}% OFF
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 line-clamp-2 h-12 mb-2">{item.name}</h3>
                      <div className="flex items-center mb-2">
                        <Rating
                          initialValue={parseFloat(item.rating)}
                          readonly
                          size={15}
                          className="mr-2"
                          SVGstyle={{ display: 'inline-block' }}
                        />
                        <span className="text-gray-600 text-sm">({item.reviews})</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-lg font-bold text-gray-900">
                          ₹{(item.discountPrice || 0).toLocaleString()}
                        </span>
                        {item.originalPrice && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 line-through text-sm">
                              ₹{item.originalPrice.toLocaleString()}
                            </span>
                            {item.discountPercent > 0 && (
                              <span className="text-green-600 text-sm">
                                {item.discountPercent}% off
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No similar products found</p>
              <Link
                to="/products"
                className="text-purple-600 hover:underline font-medium"
              >
                Browse all products
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductPage;
