import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FaStar, FaChevronLeft, FaRegStar, FaHeart, 
  FaFilter, FaSort, FaRegHeart, FaImages 
} from 'react-icons/fa';
import { Rating } from 'react-simple-star-rating';
import Api from '../../Services/Api';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

const ProductReviewsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(5);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [sortOption, setSortOption] = useState('newest');
  const [likedReviews, setLikedReviews] = useState({});
  const [expandedReview, setExpandedReview] = useState(null);
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxSlides, setLightboxSlides] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch product details
        const productResponse = await Api.get(`/products/${id}`);
        setProduct(productResponse.data);
        
        // Fetch reviews
        const reviewsResponse = await Api.get(`/reviews/product/${id}`);
        setReviews(reviewsResponse.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Open lightbox with specific images and starting index
  const openLightbox = (images, index) => {
    setLightboxSlides(images.map(img => ({ src: img })));
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Toggle like for a review
  const toggleLike = (reviewId) => {
    setLikedReviews(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  // Toggle review expansion
  const toggleExpand = (reviewId) => {
    setExpandedReview(prev => prev === reviewId ? null : reviewId);
  };

  // Filter reviews based on rating
  const filteredReviews = ratingFilter > 0 
    ? reviews.filter(review => Math.floor(review.rating) === ratingFilter)
    : reviews;

  // Sort reviews
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortOption === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortOption === 'highest') {
      return b.rating - a.rating;
    } else {
      return a.rating - b.rating;
    }
  });

  // Pagination
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = sortedReviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage);

  // Rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => Math.floor(r.rating) === rating).length,
    percentage: (reviews.filter(r => Math.floor(r.rating) === rating).length / reviews.length * 100) || 0
  }));

  // Detailed rating attributes
  const detailedRatingAttributes = () => {
    const attributes = {};
    
    reviews.forEach(review => {
      if (review.detailedRatings) {
        Object.entries(review.detailedRatings).forEach(([key, value]) => {
          if (!attributes[key]) {
            attributes[key] = { total: 0, count: 0, average: 0 };
          }
          attributes[key].total += value;
          attributes[key].count += 1;
        });
      }
    });
    
    // Calculate averages
    Object.keys(attributes).forEach(key => {
      attributes[key].average = attributes[key].total / attributes[key].count;
    });
    
    return attributes;
  };

  const attributeRatings = detailedRatingAttributes();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-pulse rounded-full h-16 w-16 bg-primary mb-4"></div>
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-2xl shadow-lg border border-red-100">
        <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaRegStar className="text-2xl" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Error loading reviews</h3>
        <p className="text-red-600 mb-6 text-center">{error}</p>
        <div className="text-center">
          <Link 
            to={`/productpage/${id}`} 
            className="inline-flex items-center px-5 py-2.5 bg-primary hover:bg-primary text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
          >
            <FaChevronLeft className="mr-2" />
            Return to product
          </Link>
        </div>
      </div>
    );
  }

  if (!product || reviews.length === 0) {
    return (
      <div className="text-center py-16 max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-lg">
        <div className="bg-[#f8d7da] w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaRegStar className="text-primary text-4xl" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">No reviews yet</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Be the first to share your experience with this product!
        </p>
        <button
          onClick={() => navigate(`/productpage/${id}/write-review`)}
          className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          Write Your Review
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Lightbox implementation */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={lightboxSlides}
        plugins={[Thumbnails, Zoom]}
          zoom={{ maxZoomPixelRatio: 5 }} // default is 3
        thumbnails={{ position: 'bottom', width: 80, height: 60 }}
        on={{
          view: ({ index }) => setLightboxIndex(index),
        }}
      />

      <div className="mb-6">
        <button 
          onClick={() => navigate(`/productpage/${id}`)}
          className="flex items-center text-primary hover:text-[#a0001c] font-medium transition-colors"
        >
          <FaChevronLeft className="mr-2" />
          Back to Product
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar with rating summary */}
        <div className="lg:w-1/4">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-20">
            <div className="text-center mb-8">
              <div className="inline-block bg-primary text-white text-5xl font-bold mb-2 px-6 py-3 rounded-xl">
                {product.averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center mb-3">
                <Rating
                  initialValue={product.averageRating}
                  readonly
                  size={28}
                  SVGstyle={{ display: 'inline-block' }}
                  fillColor="primary"
                  emptyColor="#e0e0e0"
                />
              </div>
              <p className="text-gray-600">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</p>
            </div>

            {/* Rating Distribution */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg text-gray-800 mb-4">Rating Breakdown</h3>
              <div className="space-y-3 mb-6">
                {ratingDistribution.map((dist, index) => (
                  <button
                    key={index}
                    onClick={() => setRatingFilter(dist.rating === ratingFilter ? 0 : dist.rating)}
                    className={`flex items-center w-full p-3 rounded-xl transition-all ${
                      dist.rating === ratingFilter 
                        ? 'bg-red-50 border border-red-200 shadow-inner' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center w-16">
                      <span className="text-gray-800 font-medium mr-1">{dist.rating}</span>
                      <FaStar className="text-primary" />
                    </div>
                    <div className="flex-1 ml-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-primary h-full rounded-full" 
                          style={{ width: `${dist.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-gray-700 text-sm ml-3 w-10 font-medium">
                      {dist.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Detailed Rating Attributes */}
            {Object.keys(attributeRatings).length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold text-lg text-gray-800 mb-4">Detailed Ratings</h3>
                <div className="space-y-4">
                  {Object.entries(attributeRatings).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-4 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 font-medium">{key}</span>
                        <span className="text-gray-800 font-bold">{value.average.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center">
                        <Rating 
                          initialValue={value.average} 
                          readonly 
                          size={18} 
                          SVGstyle={{ display: 'inline-block' }} 
                          fillColor="primary"
                          emptyColor="#e0e0e0"
                        />
                        <span className="ml-2 text-sm text-gray-500">({value.count} ratings)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Clear Filters */}
            {(ratingFilter > 0 || sortOption !== 'newest') && (
              <button
                onClick={() => {
                  setRatingFilter(0);
                  setSortOption('newest');
                }}
                className="mt-8 w-full py-3 text-center bg-primary hover:bg-primary text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Main Reviews Content */}
        <div className="lg:w-3/4">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Customer Reviews for {product.name}
                </h1>
                <div className="flex items-center">
                  <Rating
                    initialValue={product.averageRating}
                    readonly
                    size={20}
                    SVGstyle={{ display: 'inline-block' }}
                    fillColor="primary"
                    emptyColor="#e0e0e0"
                    className="mr-2"
                  />
                  <span className="text-gray-700">
                    {product.averageRating.toFixed(1)} out of 5
                  </span>
                </div>
              </div>
              
              <div className="mt-4 sm:mt-0">
                <div className="flex items-center bg-gray-50 px-4 py-2 rounded-xl">
                  <FaSort className="text-gray-500 mr-2" />
                  <span className="text-gray-600 mr-2">Sort by:</span>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="bg-transparent border-0 focus:ring-0 text-gray-800 font-medium"
                  >
                    <option value="newest">Newest First</option>
                    <option value="highest">Highest Rated</option>
                    <option value="lowest">Lowest Rated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
              {currentReviews.length > 0 ? (
                currentReviews.map((review) => (
                  <div key={review._id} className="border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row">
                      {/* User Info */}
                      <div className="md:w-1/4 mb-4 md:mb-0">
                        <div className="flex items-center">
                          <div className="w-14 h-14 rounded-full bg-[#f8d7da] mr-4 flex items-center justify-center overflow-hidden">
                            {review.user?.photoURL ? (
                              <img 
                                src={review.user.photoURL} 
                                alt={review.user.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-primary font-bold text-xl">
                                {review.user?.name?.charAt(0) || 'U'}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{review.user?.name || 'Anonymous'}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        {review.detailedRatings && (
                          <div className="mt-4 bg-red-50 px-3 py-1.5 rounded-full text-sm inline-block">
                            <span className="font-medium text-primary">
                              {Math.floor(review.rating)} Star Review
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Review Content */}
                      <div className="md:w-3/4">
                        <div className="flex items-center mb-3">
                          <Rating
                            initialValue={review.rating}
                            readonly
                            size={20}
                            SVGstyle={{ display: 'inline-block' }}
                            fillColor="primary"
                            emptyColor="#e0e0e0"
                            className="mr-3"
                          />
                          <h3 className="text-lg font-bold text-gray-800">{review.title || 'Great Product'}</h3>
                        </div>
                        
                        {/* Review Comment */}
                        <div className="text-gray-700 mb-4 relative">
                          <p className={expandedReview === review._id ? '' : 'line-clamp-3'}>
                            {review.comment}
                          </p>
                          {review.comment && review.comment.length > 200 && (
                            <button 
                              onClick={() => toggleExpand(review._id)}
                              className="text-primary hover:text-[#a0001c] text-sm font-medium mt-1"
                            >
                              {expandedReview === review._id ? 'Show less' : 'Read more'}
                            </button>
                          )}
                        </div>
                        
                        {/* Review Images */}
                        {review.images && review.images.length > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center text-gray-600 mb-2">
                              <FaImages className="mr-2" />
                              <span className="text-sm">Attached images</span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                              {review.images.map((img, index) => (
                                <div 
                                  key={index} 
                                  className="w-20 h-20 border-2 border-gray-200 rounded-xl overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105"
                                  onClick={() => openLightbox(review.images, index)}
                                >
                                  <img 
                                    src={img} 
                                    alt={`Review ${index+1}`} 
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Admin Response */}
                        {review.adminComment && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <div className="flex items-center mb-2">
                              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded mr-2">Admin</span>
                              <span className="text-blue-800 font-medium">Response</span>
                            </div>
                            <p className="text-blue-700">{review.adminComment}</p>
                          </div>
                        )}
                        
                        {/* Review Actions */}
                        <div className="mt-6 flex items-center">
                          <button 
                            onClick={() => toggleLike(review._id)}
                            className="flex items-center text-gray-500 hover:text-red-500 mr-6"
                          >
                            {likedReviews[review._id] ? (
                              <FaHeart className="text-primary mr-1.5" />
                            ) : (
                              <FaRegHeart className="mr-1.5" />
                            )}
                            <span>{likedReviews[review._id] ? 'Liked' : 'Helpful'}</span>
                          </button>
                          
                          <button className="text-gray-500 hover:text-primary">
                            Report
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 rounded-2xl bg-gray-50 border border-gray-200">
                  <div className="bg-[#f8d7da] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaFilter className="text-primary text-3xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">No reviews match your filters</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Try adjusting your filter settings to see more reviews
                  </p>
                  <button
                    onClick={() => {
                      setRatingFilter(0);
                      setSortOption('newest');
                    }}
                    className="inline-flex items-center px-5 py-2.5 bg-primary hover:bg-primary text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <nav className="inline-flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      currentPage === 1 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    &lt;
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        currentPage === i + 1
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    &gt;
                  </button>
                </nav>
              </div>
            )}

            {/* Write Review Button */}
            <div className="mt-10 pt-8 border-t border-gray-200 text-center">
              <button
                onClick={() => navigate(`/productpage/${id}/write-review`)}
                className="inline-flex items-center px-8 py-4 bg-primary hover:bg-primary text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all"
              >
                Write Your Review
                <FaStar className="ml-3 text-yellow-300" />
              </button>
              
              <p className="mt-4 text-gray-600">
                Share your experience to help others make better choices
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductReviewsPage;