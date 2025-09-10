import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FaHeart, FaRegHeart, FaStar, FaShoppingCart,
  FaChevronLeft, FaChevronRight, FaTruck,
  FaShieldAlt, FaExchangeAlt, FaCheck, FaPlus, FaMinus
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Rating } from 'react-simple-star-rating';
import { toast } from 'react-toastify';
import Api from '../../Services/Api';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('description');
  const [generalAttributes, setGeneralAttributes] = useState([]);
  const [otherAttributes, setOtherAttributes] = useState({});

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

  // Enhanced function to find attribute values
const findAttributeValue = (attributeId, attributeCode, productAttributes) => {
  console.log(`Finding value for attributeId: ${attributeId}, attributeCode: ${attributeCode}`);
  console.log("Product attributes:", productAttributes);

  const values = [];

  // Direct attributes
  if (productAttributes[attributeId] !== undefined) {
    values.push(productAttributes[attributeId]);
  }

  if (productAttributes[attributeCode] !== undefined) {
    values.push(productAttributes[attributeCode]);
  }

  // From spec array
  if (Array.isArray(productAttributes.spec)) {
    for (const specItem of productAttributes.spec) {
      if (specItem[attributeId] !== undefined) {
        values.push(specItem[attributeId]);
      }
      if (specItem[attributeCode] !== undefined) {
        values.push(specItem[attributeCode]);
      }
    }
  }

  // From futures array
  if (Array.isArray(productAttributes.futures)) {
    for (const futureItem of productAttributes.futures) {
      if (futureItem[attributeId] !== undefined) {
        values.push(futureItem[attributeId]);
      }
      if (futureItem[attributeCode] !== undefined) {
        values.push(futureItem[attributeCode]);
      }
    }
  }

  // If nothing found, return null, else return full array
  if (values.length === 0) {
    return null;
  }
  return values.length === 1 ? values[0] : values;
};


  // Function to process attributes
// Function to process attributes
const processAttributes = (product, attributeFamily) => {
  console.log('Processing attributes for product:', product);
  console.log('Attribute family:', attributeFamily);

  if (!attributeFamily || !product.attributes) {
    return { general: [], other: {} };
  }

  const generalAttrs = [];
  const otherAttrs = {};

  // Initialize groups with isRepeatable property
  attributeFamily.groups.forEach(group => {
    if (group.code !== 'general') {
      otherAttrs[group.code] = {
        name: group.name,
        isRepeatable: group.isRepeatable || false,
        items: [] // This will hold arrays of attributes for each repeatable item
      };
    }
  });

  // Process each attribute configuration
  attributeFamily.attributes.forEach(attrConfig => {
    const attribute = attrConfig.attribute;
    const groupCode = attrConfig.group;
    const attributeId = attribute._id;
    const attributeCode = attribute.code;

    // Find the attribute value
    const attributeValue = findAttributeValue(attributeId, attributeCode, product.attributes);

    // If we found a value, add it to the appropriate group
    if (attributeValue !== null && attributeValue !== undefined && attributeValue !== '') {
      const attributeWithValue = {
        ...attribute,
        value: attributeValue
      };

      if (groupCode === 'general') {
        generalAttrs.push(attributeWithValue);
      } else if (otherAttrs[groupCode]) {
        // For repeatable groups, we need to structure the data differently
        if (otherAttrs[groupCode].isRepeatable && Array.isArray(attributeValue)) {
          // Initialize items array if needed
          if (otherAttrs[groupCode].items.length === 0) {
            attributeValue.forEach((_, index) => {
              otherAttrs[groupCode].items.push([]);
            });
          }
          
          // Add attribute to each item
          attributeValue.forEach((value, index) => {
            if (index < otherAttrs[groupCode].items.length) {
              otherAttrs[groupCode].items[index].push({
                ...attribute,
                value: value
              });
            }
          });
        } else {
          // For non-repeatable groups, use the flat attributes array
          if (!otherAttrs[groupCode].attributes) {
            otherAttrs[groupCode].attributes = [];
          }
          otherAttrs[groupCode].attributes.push(attributeWithValue);
        }
      }
    }
  });

  // Remove empty groups
  Object.keys(otherAttrs).forEach(groupCode => {
    if (otherAttrs[groupCode].isRepeatable) {
      if (otherAttrs[groupCode].items.length === 0) {
        delete otherAttrs[groupCode];
      }
    } else {
      if (otherAttrs[groupCode].attributes.length === 0) {
        delete otherAttrs[groupCode];
      }
    }
  });

  console.log('Processed attributes:', { general: generalAttrs, other: otherAttrs });

  return { general: generalAttrs, other: otherAttrs };
};


  // Function to render attribute based on type
const renderAttributeValue = (attribute, isRepeatable = false) => {
  if (!attribute || attribute.value === undefined || attribute.value === null) {
    return <span className="text-gray-400">N/A</span>;
  }

  // Handle repeatable attributes
  if (isRepeatable && Array.isArray(attribute.value)) {
    return (
      <div className="space-y-4">
        {attribute.value.map((value, index) => {
          const singleValueAttribute = { ...attribute, value };
          console.log("Rendering repeatable attribute value:", singleValueAttribute);
          
          return (
            <div key={index}>
              {renderAttributeValue(singleValueAttribute, false)}
            </div>
          );
        })}
      </div>
    );
  }

  // Handle regular attributes based on type
  switch (attribute.type) {
    case 'image':
      return (
        <div className="mt-2">
          <img
            src={attribute.value}
            alt={attribute.label}
            className="w-fit max-h-48 object-contain rounded-lg shadow-sm border border-gray-200 bg-white"
          />
        </div>
      );

    case 'MCE Editer':
      return <div className="attribute-html-content" dangerouslySetInnerHTML={createMarkup(attribute.value)} />;

    case 'boolean':
      return (
        <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${attribute.value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {attribute.value ? 'Yes' : 'No'}
        </div>
      );

    case 'select':
      if (attribute.options?.length > 0) {
        const selectedOption = attribute.options.find(opt => opt.value === attribute.value);
        return selectedOption ? selectedOption.label : attribute.value;
      }
      return attribute.value;

    case 'multiselect':
      if (Array.isArray(attribute.value)) {
        if (attribute.options?.length > 0) {
          return (
            <div className="flex flex-wrap gap-1">
              {attribute.value.map(val => {
                const selectedOption = attribute.options.find(opt => opt.value === val);
                return (
                  <span key={val} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {selectedOption ? selectedOption.label : val}
                  </span>
                );
              })}
            </div>
          );
        }
        return (
          <div className="flex flex-wrap gap-1">
            {attribute.value.map(val => (
              <span key={val} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                {val}
              </span>
            ))}
          </div>
        );
      }
      return attribute.value;

    case 'date':
    case 'datetime':
      return new Date(attribute.value).toLocaleDateString();

    case 'keyvalue':
      if (Array.isArray(attribute.value)) {
console.log("Rendering keyvalue attribute:", attribute);

        return (
          <div className="border rounded-lg overflow-hidden mt-2">
            {attribute.value.map((item, idx) => (
              <div key={idx} className={`grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                <div className="text-sm text-gray-600 font-medium sm:col-span-1 break-words">
                  {item.key}:
                </div>
                <div className="text-gray-800 font-medium sm:col-span-2 break-words">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        );
      }

      if (typeof attribute.value === 'object' && attribute.value !== null) {
        return (
          <div className="border rounded-lg overflow-hidden mt-2">
            {Object.entries(attribute.value).map(([key, value], idx) => (
              <div key={key} className={`grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                {/* <div className="text-sm text-gray-600 font-medium sm:col-span-1 break-words">
                  {key}:
                </div> */}
                <div className="text-gray-800 font-medium sm:col-span-2 break-words">
                  {value}
                </div>
              </div>
            ))}
          </div>
        );
      }
      return attribute.value;

    default:
      return attribute.value;
  }
};

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);

        // Fetch product
        const productResponse = await Api.get(`/products/${id}`);
        const productData = productResponse.data;
        console.log('Fetched product data:', productData);

        // Fetch reviews
        try {
          const reviewsResponse = await Api.get(`/reviews/product/${id}`);
          setReviews(reviewsResponse.data);
        } catch (error) {
          console.error('Error fetching reviews:', error);
        }

        // Process attributes if attribute family exists
        if (productData.attributeFamily) {
          try {
            // Process attributes
            const { general, other } = processAttributes(productData, productData.attributeFamily);
            setGeneralAttributes(general);
            setOtherAttributes(other);
          } catch (error) {
            console.error('Error processing attributes:', error);
          }
        }

        // Enhance product data with defaults
        const enhancedProduct = {
          ...productData,
          images: productData.images || [],
          discountPercent: productData.discountPercent ||
            (productData.discountPrice > 0 && productData.originalPrice > productData.discountPrice ?
              Math.round(((productData.originalPrice - productData.discountPrice) / productData.originalPrice) * 100) : 0),
          discountPrice: productData.discountPrice || 0,
          specialPrice: productData.specialPrice || 0,
          specialPriceStart: productData.specialPriceStart || null,
          specialPriceEnd: productData.specialPriceEnd || null,
          offers: productData.offers || [],
          deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
          }),
          warranty: productData.warranty || '1 Year Manufacturer Warranty',
          returnPolicy: productData.returnPolicy || '30 Days Return Policy'
        };

        setProduct(enhancedProduct);
      } catch (err) {
        console.error('Failed to fetch product:', err);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      await Api.post('/cart', {
        productId: id,
        quantity,
      });

      toast.success('Product added to cart!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const toggleFavorite = async () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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

  // Get tab names from attribute groups
  const attributeTabs = Object.keys(otherAttributes);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary">
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link to={`/category/${product.category}`} className="ml-1 text-sm font-medium text-gray-700 hover:text-primary md:ml-2">
                  {product.category}
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
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
            {product.images && product.images.length > 0 ? (
              <>
                {/* Product Image Section */}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden group">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentImageIndex}
                      src={product.images[currentImageIndex]}
                      alt={product.name}
                      className="h-64 sm:h-80 md:h-full w-full object-contain"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </AnimatePresence>

                  {/* Discount Badge */}
                  {displayPrice.discountPercent > 0 && (
                    <div className={`absolute top-4 left-4 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md ${isSpecialActive
                      ? "bg-gradient-to-r from-orange-500 to-red-500"
                      : "bg-gradient-to-r bg-primary to-pink-600"
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
                      <FaHeart className="text-pink-500 text-xl" />
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
                          ? "border-primary scale-105 shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                          }`}
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
              </>
            ) : (
              <div className="aspect-square w-full rounded-xl bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}

            {/* Quantity Selector & Buttons */}
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
                  <span className="px-4 py-1 bg-white text-center w-12">
                    {quantity}
                  </span>
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
                  className="flex-1 bg-gradient-to-r bg-primary to-pink-600 hover:bg-primary hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-all flex items-center justify-center gap-2 font-medium shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaShoppingCart />
                  Add to Cart
                </motion.button>

                <motion.button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r bg-primary to-blue-600 hover:bg-primary hover:to-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
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
                  initialValue={product.averageRating || 0}
                  readonly
                  size={20}
                  allowFraction
                  SVGstyle={{ display: "inline-block" }}
                  className="mr-2"
                />
                <span className="text-gray-700 font-medium">
                  {product.averageRating?.toFixed(1) || '0.0'}
                </span>
                <span className="text-gray-500 text-sm ml-2">
                  ({reviews.length} reviews)
                </span>
              </div>
            </div>

            {/* Price Section */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl md:text-3xl font-bold text-gray-900">
                  ₹{displayPrice.price.toLocaleString()}
                </span>
                {displayPrice.originalPrice && (
                  <span className="text-gray-500 line-through text-lg">
                    ₹{displayPrice.originalPrice.toLocaleString()}
                  </span>
                )}
                {displayPrice.discountPercent > 0 && (
                  <span className={`text-lg font-medium ${isSpecialActive ? "text-primary" : "text-primary"}`}>
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

            {/* General Attributes */}
            {generalAttributes.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-lg mb-3">Product Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generalAttributes.map((attribute) => (
                    <div key={attribute._id} className="flex flex-col">
                      <span className="text-sm text-gray-500">{attribute.label}:</span>
                      {/* // In both attribute rendering sections, change from span to div: */}
                      <div className="text-gray-800 font-medium">
                        {renderAttributeValue(attribute)}
                      </div>
                    </div>
                  ))}
                </div>
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
                  <FaShieldAlt className="text-gray-600 text-base mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Warranty</p>
                    <p className="text-sm text-gray-600">{product.warranty}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <FaExchangeAlt className="text-gray-600 text-base mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Returns</p>
                    <p className="text-sm text-gray-600">{product.returnPolicy}</p>
                  </div>
                </div>
              </div>

              {product.offers && product.offers.length > 0 && (
                <div className="border border-green-100 bg-green-50 rounded-xl p-4">
                  <h3 className="font-medium text-green-800 mb-3">Available offers</h3>
                  <ul className="space-y-3">
                    {product.offers.map((offer, i) => (
                      <motion.li
                        key={i}
                        className="flex items-start"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <span className="text-green-500 mr-2 mt-0.5">
                          <FaCheck className="text-sm" />
                        </span>
                        <span className="text-sm text-gray-700">{offer}</span>
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
          {/* Tabs */}
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {['description', ...attributeTabs, 'reviews'].map((tab) => (
              <button
                key={tab}
                className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600'
                  }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'description' ? 'Description' :
                  tab === 'reviews' ? `Reviews (${reviews.length})` :
                    otherAttributes[tab]?.name || tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Description */}
            {activeTab === 'description' && (
              <div>
                <h3 className="font-medium text-lg mb-3 text-gray-800">Product Description</h3>
                <div
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={createMarkup(product.description)}
                />
              </div>
            )}

            {/* Attribute Groups */}
{attributeTabs.includes(activeTab) && (
  <div>
    <h3 className="font-medium text-lg mb-4 text-gray-800">
      {otherAttributes[activeTab]?.name}
    </h3>
    
    {otherAttributes[activeTab]?.isRepeatable ? (
      // Render repeatable items
      <div className="space-y-6">
        {otherAttributes[activeTab]?.items.map((item, itemIndex) => (
          <div key={itemIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            {/* <h4 className="font-medium text-gray-700 mb-3">Item {itemIndex + 1}</h4> */}
            <div className="space-y-4">
              {item.map((attribute) => (
                <div key={attribute._id} className="flex flex-col">
                  {/* <span className="text-sm text-gray-500">{attribute.label}:</span> */}
                  {/* <div className="text-gray-800 font-medium"> */}
                    {renderAttributeValue(attribute, false)}
                  {/* </div> */}
                </div>
              ))}
            </div>  
          </div>
        ))}
      </div>
    ) : (
      // Render non-repeatable attributes
      <div className="space-y-4">
        {otherAttributes[activeTab]?.attributes.map((attribute) => (
          <div key={attribute._id} className="flex flex-col">
            <span className="text-sm text-gray-500">{attribute.label}:</span>
            <div className="text-gray-800 font-medium">
              {renderAttributeValue(attribute, false)}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}

            {/* Reviews */}
            {activeTab === 'reviews' && (
              <div className="flex flex-col md:flex-row gap-8">
                {/* Average Rating */}
                <div className="md:w-1/4">
                  <div className="text-center bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div className="text-5xl font-bold mb-2 text-gray-900">
                      {product.averageRating?.toFixed(1) || '0.0'}
                    </div>
                    <div className="flex justify-center mb-3">
                      <Rating
                        initialValue={product.averageRating || 0}
                        readonly
                        size={20}
                        className="mr-1"
                        SVGstyle={{ display: 'inline-block' }}
                      />
                    </div>
                    <p className="text-gray-600">{reviews.length} ratings</p>
                  </div>
                </div>

                {/* Review List */}
                <div className="md:w-3/4">
                  {reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.slice(0, 5).map((review) => (
                        <div
                          key={review._id}
                          className="border-b border-gray-100 pb-6 last:border-0"
                        >
                          <div className="flex items-start mb-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 mr-4 flex items-center justify-center">
                              <span className="text-gray-700 font-medium">
                                {review.user?.name?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">
                                {review.user?.name || 'Anonymous'}
                              </p>
                              <div className="flex items-center mt-1">
                                <Rating
                                  initialValue={review.rating}
                                  readonly
                                  size={15}
                                  className="mr-2"
                                  SVGstyle={{ display: 'inline-block' }}
                                />
                                <span className="text-gray-500 text-sm">
                                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>

                          <p className="text-gray-700 mt-3">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;