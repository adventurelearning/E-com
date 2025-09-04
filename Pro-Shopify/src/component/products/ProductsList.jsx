import React, { useState, useEffect } from 'react';
import Api from '../../Services/Api';
import { FaChevronLeft, FaChevronRight, FaHeart, FaRegHeart, FaStar, FaShoppingCart, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAllOffers, setShowAllOffers] = useState(false);
  const navigate = useNavigate();

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      (prevIndex + 1) % product.images.length
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      (prevIndex - 1 + product.images.length) % product.images.length
    );
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  const toggleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleClick = () => {
    navigate(`/productpage/${product._id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    handleClick()
  };

  const toggleShowOffers = (e) => {
    e.stopPropagation();
    setShowAllOffers(!showAllOffers);
  };

  return (
    <motion.div
      className="border rounded-lg p-3 sm:p-4 hover:shadow-lg transition-shadow bg-white flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -5 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      onClick={handleClick}
    >
      {/* Top Section */}
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <h2 className="text-sm sm:text-base md:text-lg font-semibold line-clamp-1">
            {product.name} ({product.colors})
          </h2>
          <button
            onClick={toggleFavorite}
            className="text-red-500 hover:text-red-700 transition-colors text-sm sm:text-base"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? <FaHeart /> : <FaRegHeart />}
          </button>
        </div>

        {/* Image Carousel */}
        <div className="relative mt-3 sm:mt-4 overflow-hidden rounded-lg">
          <div className="relative w-full h-32 sm:h-40 md:h-48 bg-gray-100 flex items-center justify-center">
            {product.images.map((image, index) => (
              <motion.img
                key={index}
                src={image}
                alt={`${product.name} - ${index + 1}`}
                className={`absolute inset-0 w-full h-full transition-opacity duration-300 
              ${index === currentImageIndex ? "opacity-100" : "opacity-0"} 
              object-contain sm:object-cover`}
                initial={{ opacity: 0 }}
                animate={{ opacity: index === currentImageIndex ? 1 : 0 }}
                transition={{ duration: 0.5 }}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          {product.images.length > 1 && isHovered && (
            <>
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white text-gray-800 p-1.5 sm:p-2 rounded-full shadow-md hover:bg-gray-100"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Previous image"
              >
                <FaChevronLeft className="text-xs sm:text-sm" />
              </motion.button>
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-gray-800 p-1.5 sm:p-2 rounded-full shadow-md hover:bg-gray-100"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Next image"
              >
                <FaChevronRight className="text-xs sm:text-sm" />
              </motion.button>
            </>
          )}

          {/* Dots Indicator */}
          {product.images.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToImage(index);
                  }}
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all 
                ${index === currentImageIndex ? "bg-black w-2 sm:w-3" : "bg-gray-300"}`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Price and Offers */}
        <div className="mt-3 sm:mt-4">
          <div className="flex items-center">
            <span className="text-base sm:text-lg font-bold">
              ₹{product.discountPrice.toLocaleString()}
            </span>
            <span className="text-gray-500 line-through text-xs sm:text-sm ml-2">
              ₹{product.originalPrice.toLocaleString()}
            </span>
            <span className="text-green-600 text-xs sm:text-sm font-medium ml-2">
              {product.discountPercent}% off
            </span>
          </div>

          {product.offers && product.offers.length > 0 && (
            <div className="mt-2 text-[11px] sm:text-xs text-green-700">
              {/* Show first offer always */}
              <div className="flex items-start mb-1">
                <span className="mr-1">•</span>
                <span>{product.offers[0]}</span>
              </div>

              {/* Show additional offers if expanded */}
              {showAllOffers &&
                product.offers.slice(1).map((offer, i) => (
                  <div key={i + 1} className="flex items-start mb-1">
                    <span className="mr-1">•</span>
                    <span>{offer}</span>
                  </div>
                ))}

              {/* Toggle button */}
              {product.offers.length > 1 && (
                <button
                  onClick={toggleShowOffers}
                  className="text-primary flex items-center mt-1 text-xs sm:text-sm"
                >
                  {showAllOffers ? (
                    <>
                      <span>Show less</span>
                      <FaChevronUp className="ml-1 text-[10px] sm:text-xs" />
                    </>
                  ) : (
                    <>
                      <span>+{product.offers.length - 1} more offers</span>
                      <FaChevronDown className="ml-1 text-[10px] sm:text-xs" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-auto pt-3 sm:pt-4 flex justify-between border-t border-gray-100">
        <div className="flex items-center mt-1 sm:mt-2">
          <div className="flex items-center bg-blue-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
            <span className="text-yellow-500 text-xs sm:text-sm mr-1">
              {product.rating || 4.2}
            </span>
            <FaStar className="text-yellow-500 text-[10px] sm:text-xs" />
          </div>
          <span className="text-gray-500 text-[11px] sm:text-sm ml-2">
            ({product.reviews || 124} reviews)
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          className="p-1.5 sm:p-2 text-gray-600 hover:text-primary transition-colors"
          aria-label="Add to cart"
        >
          <FaShoppingCart className="text-sm sm:text-base" />
        </button>
      </div>
    </motion.div>

  );
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [visibleCount, setVisibleCount] = useState(5); // Initial count per category
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await Api.get('/products');
        // Add some mock data for demonstration
        const enhancedProducts = response.data.map(product => ({
          ...product,
          rating: (Math.random() * 1 + 4).toFixed(1),
          reviews: Math.floor(Math.random() * 500),
          offers: [
            'Bank offer 10% off',
            'No cost EMI available',
            'Exchange offer up to ₹15,000'
          ].slice(0, Math.floor(Math.random() * 3) + 1)
        }));
        setProducts(enhancedProducts);
      } catch (err) {
        setError(err.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = () => {
    let result = [...products];

    // Apply filters
    if (filter === 'discount') {
      result = result.filter(p => p.discountPercent > 20);
    } else if (filter === 'new') {
      // Get the newest products (assuming there's a createdAt field)
      result = result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Apply sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.discountPrice - b.discountPrice);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.discountPrice - a.discountPrice);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  };

  // Group products by category AFTER filtering and sorting
  const groupProductsByCategory = (productsToGroup) => {
    const grouped = {};
    productsToGroup.forEach(product => {
      if (!grouped[product.category]) {
        grouped[product.category] = [];
      }
      grouped[product.category].push(product);
    });
    return grouped;
  };

  // Get the filtered and sorted products
  const filteredAndSortedProducts = filteredProducts();

  // Group the filtered products by category
  const groupedProducts = groupProductsByCategory(filteredAndSortedProducts);

  // Get visible products for each category
  const getVisibleProductsByCategory = () => {
    const result = {};

    // For each category, take only the first 'visibleCount' products
    Object.keys(groupedProducts).forEach(category => {
      result[category] = groupedProducts[category].slice(0, visibleCount);
    });

    return result;
  };

  const visibleProductsByCategory = getVisibleProductsByCategory();

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 5); // Load 5 more products per category
  };

  // Check if there are more products to load in any category
  const hasMoreProducts = () => {
    return Object.keys(groupedProducts).some(
      category => groupedProducts[category].length > visibleProductsByCategory[category].length
    );
  };

  // Function to navigate to category page
  const navigateToCategory = (category) => {
    // Convert category name to URL-friendly format
    const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
    navigate(`/category/${categorySlug}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg max-w-md mx-auto mt-8">
        <h3 className="font-bold mb-2">Error loading products</h3>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-secondary text-white px-4 py-2 rounded hover:bg-primary transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className=" mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-center lg:text-left">Trending Products</h1>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="filter" className="text-sm font-medium text-gray-700">Filter:</label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              <option value="all">All Products</option>
              <option value="discount">Big Discounts</option>
              <option value="new">New Arrivals</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>
        </div>
      </div>

      {filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-700">No products match your filters</h3>
          <button
            onClick={() => {
              setFilter('all');
              setSortBy('featured');
            }}
            className="mt-4 text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          {/* Display products grouped by category */}
          {Object.entries(visibleProductsByCategory).map(([category, categoryProducts]) => (
            <div key={category}>
              <div className="flex justify-between items-center mb-4 mt-8">
                <h2 className="text-xl font-semibold">{category}</h2>
                {groupedProducts[category].length > visibleCount && (
                  <button
                    onClick={() => navigateToCategory(category)}
                    className="text-primary hover:underline flex items-center"
                  >
                    See More
                    <FaChevronRight className="ml-1 text-xs" />
                  </button>
                )}
              </div>

              {/* Desktop / Large Screens - Grid */}
              <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {categoryProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Mobile - Horizontal Scroll with 2 items per view */}
              <div className="sm:hidden overflow-x-auto">
                <div className="flex space-x-3 min-w-max">
                  {categoryProducts.map((product) => (
                    <div key={product.id} className="w-1/2 flex-shrink-0">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Show Load More button if there are more products to show */}
      {/* {hasMoreProducts() && (
        <div className="mt-8 flex justify-center">
          <button 
            onClick={handleLoadMore}
            className="border border-primary text-primary px-4 py-2 rounded-md hover:bg-red-50 transition-colors"
          >
            Load More Products
          </button>
        </div>
      )} */}
    </div>
  );
};

export default ProductList;