import { useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ProductContext } from '../../context/ProductDetail';
import { FaSpinner, FaExclamationTriangle, FaFilter, FaChevronDown, FaChevronUp, FaTimes } from 'react-icons/fa';
import { FaHeart, FaRegHeart, FaStar, FaShoppingCart, FaSearch } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '../../context/WishlistContext';
import { toast } from 'react-toastify';

const CategoryProduct = () => {
  const { category } = useParams();
    const { state } = useLocation();
  const { product, loading, error } = useContext(ProductContext);
  const navigate = useNavigate();

  // State for filters
  const [priceFilter, setPriceFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // State for collapsible sections
  const [openSections, setOpenSections] = useState({
    subcategories: true,
    price: true,
    brands: true
  });

  // Extract unique brands and subcategories from products
  const [brands, setBrands] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    fetchWishlistCount,
    wishlistItems
  } = useWishlist();

  useEffect(() => {
    if (Array.isArray(product)) {
      // Extract unique brands
      const uniqueBrands = [...new Set(product.map(item => item.brand))].filter(Boolean);
      setBrands(uniqueBrands);

      // Extract unique subcategories for the current category
      const categoryProducts = product.filter(
        item => item.category && item.category.toString().toLowerCase() === category.toLowerCase()
      );
      const uniqueSubcategories = [...new Set(categoryProducts.map(item => item.subcategory))].filter(Boolean);
      setSubcategories(uniqueSubcategories);
    }
  }, [product, category]);

  const handleClick = (productId) => {
    navigate(`/productpage/${productId}`);
  };

  // Filter products by category first
  const categoryProducts = Array.isArray(product)
    ? product.filter(
      (item) => item.category && item.category.toString().toLowerCase() === category.toLowerCase()
    )
    : [];

  // Apply additional filters
  let filteredProducts = [...categoryProducts];

  // Apply subcategory filter
  if (selectedSubcategory) {
    filteredProducts = filteredProducts.filter(
      item => item.subcategory && item.subcategory.toLowerCase() === selectedSubcategory.toLowerCase()
    );
  }

  // Apply brand filter
  if (brandFilter) {
    filteredProducts = filteredProducts.filter(
      item => item.brand && item.brand.toLowerCase() === brandFilter.toLowerCase()
    );
  }

  // Apply price filter
  if (priceFilter === 'low-to-high') {
    filteredProducts.sort((a, b) =>
      (a.discountPrice || a.originalPrice) - (b.discountPrice || b.originalPrice)
    );
  } else if (priceFilter === 'high-to-low') {
    filteredProducts.sort((a, b) =>
      (b.discountPrice || b.originalPrice) - (a.discountPrice || a.originalPrice)
    );
  } else if (priceFilter === 'discount') {
    filteredProducts = filteredProducts.filter(
      item => item.discountPrice && item.discountPrice < item.originalPrice
    );
  }

  // Apply search filter
  if (searchQuery) {
    filteredProducts = filteredProducts.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }

  // Toggle collapsible sections
  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[50vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <FaSpinner className="text-4xl text-blue-500 mb-4" />
        </motion.div>
        <p className="text-lg text-gray-600">Loading products...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[50vh]">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500 }}
        >
          <FaExclamationTriangle className="text-4xl text-red-500 mb-4" />
        </motion.div>
        <p className="text-lg text-gray-600">Failed to load products. Please try again later.</p>
        <p className="text-sm text-gray-500 mt-2">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const resetFilters = () => {
    setPriceFilter('');
    setBrandFilter('');
    setSelectedSubcategory('');
    setSearchQuery('');
  };

  const activeFiltersCount = [priceFilter, brandFilter, selectedSubcategory, searchQuery].filter(Boolean).length;

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 capitalize mb-2">
              {category}
            </h1>
            <p className="text-gray-600">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative flex-grow md:w-64">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search in category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            <button
              className="md:hidden flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            >
              <FaFilter /> Filters {activeFiltersCount > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {(priceFilter || brandFilter || selectedSubcategory || searchQuery) && (
          <div className="mb-6 bg-blue-50 p-3 rounded-lg flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Active filters:</span>
            {selectedSubcategory && (
              <span className="bg-white px-3 py-1 rounded-full text-sm flex items-center gap-1 shadow-sm">
                Subcategory: {selectedSubcategory}
                <button onClick={() => setSelectedSubcategory('')} className="text-gray-500 hover:text-gray-700">
                  <FaTimes size={12} />
                </button>
              </span>
            )}
            {brandFilter && (
              <span className="bg-white px-3 py-1 rounded-full text-sm flex items-center gap-1 shadow-sm">
                Brand: {brandFilter}
                <button onClick={() => setBrandFilter('')} className="text-gray-500 hover:text-gray-700">
                  <FaTimes size={12} />
                </button>
              </span>
            )}
            {priceFilter && (
              <span className="bg-white px-3 py-1 rounded-full text-sm flex items-center gap-1 shadow-sm">
                Price: {priceFilter === 'low-to-high' ? 'Low to High' :
                  priceFilter === 'high-to-low' ? 'High to Low' : 'Discounted'}
                <button onClick={() => setPriceFilter('')} className="text-gray-500 hover:text-gray-700">
                  <FaTimes size={12} />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="bg-white px-3 py-1 rounded-full text-sm flex items-center gap-1 shadow-sm">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="text-gray-500 hover:text-gray-700">
                  <FaTimes size={12} />
                </button>
              </span>
            )}
            <button
              onClick={resetFilters}
              className="ml-auto text-blue-600 text-sm font-medium hover:underline flex items-center gap-1"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          {/* Mobile Filters Overlay */}
          <AnimatePresence>
            {mobileFiltersOpen && (
              <motion.div
                initial={{ opacity: 0, x: -300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed inset-0 z-50 md:hidden"
              >
                <div
                  className="absolute inset-0 bg-black bg-opacity-50"
                  onClick={() => setMobileFiltersOpen(false)}
                />
                <div className="absolute inset-y-0 left-0 w-4/5 max-w-sm bg-white shadow-xl overflow-y-auto p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Filters</h2>
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FaTimes size={20} />
                    </button>
                  </div>

                  {/* Subcategories */}
                  {subcategories.length > 0 && (
                    <div className="mb-6 border-b pb-4">
                      <button
                        className="flex justify-between items-center w-full font-medium mb-3"
                        onClick={() => toggleSection('subcategories')}
                      >
                        <span>Subcategories</span>
                        {openSections.subcategories ? (
                          <FaChevronUp className="text-gray-500 text-sm" />
                        ) : (
                          <FaChevronDown className="text-gray-500 text-sm" />
                        )}
                      </button>
                      {openSections.subcategories && (
                        <div className="space-y-2">
                          {subcategories.map((subcat) => (
                            <div key={subcat} className="flex items-center">
                              <input
                                type="radio"
                                id={`subcat-${subcat}`}
                                name="subcategory"
                                checked={selectedSubcategory === subcat}
                                onChange={() => setSelectedSubcategory(subcat)}
                                className="mr-2"
                              />
                              <label htmlFor={`subcat-${subcat}`} className="capitalize cursor-pointer">
                                {subcat}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Price Filter */}
                  <div className="mb-6 border-b pb-4">
                    <button
                      className="flex justify-between items-center w-full font-medium mb-3"
                      onClick={() => toggleSection('price')}
                    >
                      <span>Price</span>
                      {openSections.price ? (
                        <FaChevronUp className="text-gray-500 text-sm" />
                      ) : (
                        <FaChevronDown className="text-gray-500 text-sm" />
                      )}
                    </button>
                    {openSections.price && (
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="price-low-to-high"
                            name="price"
                            checked={priceFilter === 'low-to-high'}
                            onChange={() => setPriceFilter('low-to-high')}
                            className="mr-2"
                          />
                          <label htmlFor="price-low-to-high" className="cursor-pointer">
                            Low to High
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="price-high-to-low"
                            name="price"
                            checked={priceFilter === 'high-to-low'}
                            onChange={() => setPriceFilter('high-to-low')}
                            className="mr-2"
                          />
                          <label htmlFor="price-high-to-low" className="cursor-pointer">
                            High to Low
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="price-discount"
                            name="price"
                            checked={priceFilter === 'discount'}
                            onChange={() => setPriceFilter('discount')}
                            className="mr-2"
                          />
                          <label htmlFor="price-discount" className="cursor-pointer">
                            Discounted Items
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Brand Filter */}
                  {brands.length > 0 && (
                    <div className="mb-6">
                      <button
                        className="flex justify-between items-center w-full font-medium mb-3"
                        onClick={() => toggleSection('brands')}
                      >
                        <span>Brands</span>
                        {openSections.brands ? (
                          <FaChevronUp className="text-gray-500 text-sm" />
                        ) : (
                          <FaChevronDown className="text-gray-500 text-sm" />
                        )}
                      </button>
                      {openSections.brands && (
                        <div className="space-y-2">
                          {brands.map((brand) => (
                            <div key={brand} className="flex items-center">
                              <input
                                type="radio"
                                id={`brand-${brand}`}
                                name="brand"
                                checked={brandFilter === brand}
                                onChange={() => setBrandFilter(brand)}
                                className="mr-2"
                              />
                              <label htmlFor={`brand-${brand}`} className="capitalize cursor-pointer">
                                {brand}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={resetFilters}
                      className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sidebar Filters - Desktop */}
          <div className="hidden md:block w-full md:w-72 flex-shrink-0">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">Filters</h2>
                <button
                  onClick={resetFilters}
                  className="text-blue-600 text-sm hover:underline flex items-center gap-1"
                >
                  Reset all
                  {activeFiltersCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Search in sidebar */}
              <div className="relative mb-6">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search in category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>

              {/* Subcategories */}
              {subcategories.length > 0 && (
                <div className="mb-6 border-b pb-4">
                  <button
                    className="flex justify-between items-center w-full font-medium mb-3"
                    onClick={() => toggleSection('subcategories')}
                  >
                    <span>Subcategories</span>
                    {openSections.subcategories ? (
                      <FaChevronUp className="text-gray-500 text-sm" />
                    ) : (
                      <FaChevronDown className="text-gray-500 text-sm" />
                    )}
                  </button>
                  {openSections.subcategories && (
                    <div className="space-y-2">
                      {subcategories.map((subcat) => (
                        <div key={subcat} className="flex items-center">
                          <input
                            type="radio"
                            id={`subcat-${subcat}`}
                            name="subcategory"
                            checked={selectedSubcategory === subcat}
                            onChange={() => setSelectedSubcategory(subcat)}
                            className="mr-2"
                          />
                          <label htmlFor={`subcat-${subcat}`} className="capitalize cursor-pointer">
                            {subcat}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Price Filter */}
              <div className="mb-6 border-b pb-4">
                <button
                  className="flex justify-between items-center w-full font-medium mb-3"
                  onClick={() => toggleSection('price')}
                >
                  <span>Price</span>
                  {openSections.price ? (
                    <FaChevronUp className="text-gray-500 text-sm" />
                  ) : (
                    <FaChevronDown className="text-gray-500 text-sm" />
                  )}
                </button>
                {openSections.price && (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="price-low-to-high"
                        name="price"
                        checked={priceFilter === 'low-to-high'}
                        onChange={() => setPriceFilter('low-to-high')}
                        className="mr-2"
                      />
                      <label htmlFor="price-low-to-high" className="cursor-pointer">
                        Low to High
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="price-high-to-low"
                        name="price"
                        checked={priceFilter === 'high-to-low'}
                        onChange={() => setPriceFilter('high-to-low')}
                        className="mr-2"
                      />
                      <label htmlFor="price-high-to-low" className="cursor-pointer">
                        High to Low
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="price-discount"
                        name="price"
                        checked={priceFilter === 'discount'}
                        onChange={() => setPriceFilter('discount')}
                        className="mr-2"
                      />
                      <label htmlFor="price-discount" className="cursor-pointer">
                        Discounted Items
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Brand Filter */}
              {brands.length > 0 && (
                <div className="mb-6">
                  <button
                    className="flex justify-between items-center w-full font-medium mb-3"
                    onClick={() => toggleSection('brands')}
                  >
                    <span>Brands</span>
                    {openSections.brands ? (
                      <FaChevronUp className="text-gray-500 text-sm" />
                    ) : (
                      <FaChevronDown className="text-gray-500 text-sm" />
                    )}
                  </button>
                  {openSections.brands && (
                    <div className="space-y-2">
                      {brands.map((brand) => (
                        <div key={brand} className="flex items-center">
                          <input
                            type="radio"
                            id={`brand-${brand}`}
                            name="brand"
                            checked={brandFilter === brand}
                            onChange={() => setBrandFilter(brand)}
                            className="mr-2"
                          />
                          <label htmlFor={`brand-${brand}`} className="capitalize cursor-pointer">
                            {brand}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product._id} 
                      className="border rounded-lg p-4 hover:shadow-lg transition-shadow bg-white flex flex-col group"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      whileHover={{
                        y: -5,
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                      }}
                      layout
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h2
                          className="text-lg font-semibold line-clamp-1 hover:text-blue-600 cursor-pointer transition-colors"
                          onClick={() => handleClick(product._id)}
                          title={product.name}
                        >
                          {product.name} {product.colors ? `(${product.colors})` : ''}
                        </h2>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const token = localStorage.getItem('token');
                            if (!token) {
                              navigate('/login', { state: { from: `/category/${category}` } });
                              return;
                            }

                            try {
                              if (isInWishlist(product._id)) {
                                // Find the wishlist item ID to remove
                                const wishlistItem = wishlistItems.find(item => item.product._id === product._id);
                                if (wishlistItem) {
                                  await removeFromWishlist(wishlistItem._id);
                                  toast.success('Removed from wishlist');
                                }
                              } else {
                                await addToWishlist(product._id);
                                toast.success('Added to wishlist');
                              }
                              fetchWishlistCount();
                            } catch (error) {
                              toast.error('Failed to update wishlist');
                            }
                          }}
                          className={`transition-colors ${isInWishlist(product._id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                          aria-label={isInWishlist(product._id) ? "Remove from favorites" : "Add to favorites"}
                        >
                          {isInWishlist(product._id) ? (
                            <FaHeart className="group-hover:scale-110 transition-transform" />
                          ) : (
                            <FaRegHeart className="group-hover:scale-110 transition-transform" />
                          )}
                        </button>
                      </div>

                      {/* Product Image */}
                      <div
                        className="relative h-48 w-full bg-gray-100 rounded-md overflow-hidden cursor-pointer"
                        onClick={() => handleClick(product._id)}
                      >
                        <img
                          src={
                            Array.isArray(product.images) && product.images.length > 0
                              ? product.images[0]
                              : 'https://via.placeholder.com/300x300?text=No+Image'
                          }
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        {product.discountPrice && product.discountPrice < product.originalPrice && (
                          <span className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {Math.round(
                              ((product.originalPrice - product.discountPrice) / product.originalPrice) * 100
                            )}% OFF
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300" />
                      </div>

                      {/* Product Details */}
                      <div className="mt-4 flex-grow flex flex-col justify-between">

                        {/* Price */}
                        <div className="flex items-center mt-2">
                          <span className="text-lg font-bold text-gray-800">
                            ₹{product.discountPrice?.toLocaleString() || product.originalPrice?.toLocaleString()}
                          </span>
                          {product.discountPrice && product.discountPrice < product.originalPrice && (
                            <>
                              <span className="text-red-500 line-through text-sm ml-2">
                                ₹{product.originalPrice?.toLocaleString()}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Offers */}
                        {product.offers && (
                          <div className="mt-2 text-xs text-green-700">
                            {product.offers.slice(0, 2).map((offer, i) => (
                              <div key={i} className="flex items-start mb-1">
                                <span className="mr-1">•</span>
                                <span className="line-clamp-1">{offer}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="mt-4 flex justify-between items-center">
                          <div className="flex items-center mb-2">
                            <div className="flex items-center bg-blue-50 px-2 py-1 rounded">
                              <span className="text-yellow-500 mr-1">{product.rating || 4.2}</span>
                              <FaStar className="text-yellow-500 text-xs" />
                            </div>
                            <span className="text-gray-500 text-sm ml-2">({product.reviews || 124} reviews)</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-12 min-h-[40vh]"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png"
                  alt="No products found"
                  className="w-32 h-32 object-contain mb-4 opacity-70"
                />
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 text-center max-w-md">
                  We couldn't find any products matching your filters. Try adjusting your filters or browse our other categories.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  Reset Filters
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryProduct;