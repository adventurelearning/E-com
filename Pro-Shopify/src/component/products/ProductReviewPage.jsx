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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxSlides, setLightboxSlides] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const productResponse = await Api.get(`/products/${id}`);
        setProduct(productResponse.data);
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

  const openLightbox = (images, index) => {
    setLightboxSlides(images.map(img => ({ src: img })));
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const toggleLike = (reviewId) => {
    setLikedReviews(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  const toggleExpand = (reviewId) => {
    setExpandedReview(prev => prev === reviewId ? null : reviewId);
  };

  const filteredReviews = ratingFilter > 0
    ? reviews.filter(review => Math.floor(review.rating) === ratingFilter)
    : reviews;

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortOption === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortOption === 'highest') {
      return b.rating - a.rating;
    } else {
      return a.rating - b.rating;
    }
  });

  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = sortedReviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage);

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => Math.floor(r.rating) === rating).length,
    percentage: (reviews.filter(r => Math.floor(r.rating) === rating).length / reviews.length * 100) || 0
  }));

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
          <div className="animate-pulse rounded-full h-12 w-12 bg-primary mb-3"></div>
          <p className="text-gray-600 text-sm">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-xl shadow-md border border-red-100">
        <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaRegStar className="text-lg" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">Error loading reviews</h3>
        <p className="text-red-600 text-sm mb-5 text-center">{error}</p>
        <div className="text-center">
          <Link
            to={`/productpage/${id}`}
            className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary text-white rounded-md font-medium shadow-sm hover:shadow transition-all text-sm"
          >
            <FaChevronLeft className="mr-1.5" size={12} />
            Return to product
          </Link>
        </div>
      </div>
    );
  }

  if (!product || reviews.length === 0) {
    return (
      <div className="text-center py-12 max-w-2xl mx-auto bg-white rounded-xl p-6 shadow-md">
        <div className="bg-[#f8d7da] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaRegStar className="text-primary text-2xl" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">No reviews yet</h2>
        <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto">
          Be the first to share your experience with this product!
        </p>
        {/* <button
          onClick={() => navigate(`/productpage/${id}/write-review`)}
          className="inline-flex items-center px-5 py-2.5 bg-primary hover:bg-primary text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all text-sm"
        >
          Write Your Review
        </button> */}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={lightboxSlides}
        plugins={[Thumbnails, Zoom]}
        zoom={{ maxZoomPixelRatio: 5 }}
        thumbnails={{ position: 'bottom', width: 80, height: 60 }}
        on={{
          view: ({ index }) => setLightboxIndex(index),
        }}
      />

      <div className="mb-5">
        <button
          onClick={() => navigate(`/productpage/${id}`)}
          className="flex items-center text-primary hover:text-[#a0001c] font-medium transition-colors text-sm"
        >
          <FaChevronLeft className="mr-1.5" size={12} />
          Back to Product
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/4">
          <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 sticky top-20">
            <div className="text-center mb-6">
              <div className="inline-block bg-primary text-white text-3xl font-bold mb-2 px-4 py-2 rounded-lg">
                {product.averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center mb-2">
                <Rating
                  initialValue={product.averageRating}
                  readonly
                  size={20}
                  SVGstyle={{ display: 'inline-block' }}
                  fillColor="#ffc107"
                  emptyColor="#e0e0e0"
                />
              </div>
              <p className="text-gray-600 text-sm">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</p>
            </div>

            <div className="mb-5">
              <h3 className="font-semibold text-base text-gray-800 mb-3">Rating Breakdown</h3>
              <div className="space-y-2 mb-5">
                {ratingDistribution.map((dist, index) => (
                  <button
                    key={index}
                    onClick={() => setRatingFilter(dist.rating === ratingFilter ? 0 : dist.rating)}
                    className={`flex items-center w-full p-2 rounded-lg transition-all text-sm ${dist.rating === ratingFilter
                        ? 'bg-red-50 border border-red-200 shadow-inner'
                        : 'hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center w-12">
                      <span className="text-gray-800 font-medium mr-1">{dist.rating}</span>
                      <FaStar className="text-yellow-500 text-xs" />
                    </div>
                    <div className="flex-1 ml-2">
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full"
                          style={{ width: `${dist.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-gray-700 text-xs ml-2 w-8 font-medium">
                      {dist.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {Object.keys(attributeRatings).length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-base text-gray-800 mb-3">Detailed Ratings</h3>
                <div className="space-y-3">
                  {Object.entries(attributeRatings).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-3 rounded-lg text-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-700 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                        <span className="text-gray-800 font-bold">{value.average.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center">
                        <Rating
                          initialValue={value.average}
                          readonly
                          size={14}
                          SVGstyle={{ display: 'inline-block' }}
                          fillColor="#ffc107"
                          emptyColor="#e0e0e0"
                        />
                        <span className="ml-2 text-xs text-gray-500">({value.count})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(ratingFilter > 0 || sortOption !== 'newest') && (
              <button
                onClick={() => {
                  setRatingFilter(0);
                  setSortOption('newest');
                }}
                className="mt-6 w-full py-2 text-center bg-primary hover:bg-primary text-white rounded-lg font-medium shadow-sm hover:shadow transition-all text-sm"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        <div className="lg:w-3/4">
          <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h1 className="text-xl font-semibold text-gray-900 mb-1.5">
                  Customer Reviews for {product.name}
                </h1>
                <div className="flex items-center text-sm">
                  <Rating
                    initialValue={product.averageRating}
                    readonly
                    size={16}
                    SVGstyle={{ display: 'inline-block' }}
                    fillColor="#ffc107"
                    emptyColor="#e0e0e0"
                    className="mr-1.5"
                  />
                  <span className="text-gray-700">
                    {product.averageRating.toFixed(1)} out of 5
                  </span>
                </div>
              </div>

              <div className="mt-3 sm:mt-0">
                <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg text-sm">
                  <FaSort className="text-gray-500 mr-1.5 text-xs" />
                  <span className="text-gray-600 mr-1.5">Sort by:</span>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="bg-transparent border-0 focus:ring-0 text-gray-800 font-medium text-sm p-0 m-0"
                  >
                    <option value="newest">Newest First</option>
                    <option value="highest">Highest Rated</option>
                    <option value="lowest">Lowest Rated</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {currentReviews.length > 0 ? (
                currentReviews.map((review) => (
                  <div key={review._id} className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow text-sm">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/4 mb-3 md:mb-0">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-[#f8d7da] mr-3 flex items-center justify-center overflow-hidden">
                            {review.user?.photoURL && review.user.photoURL.trim() !== "" ? (
                              <img
                                src={review.user.photoURL}
                                alt={review.user?.name || "User Avatar"}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none"; // hide broken img
                                  e.currentTarget.parentElement.innerHTML =
                                    `<div class="flex items-center justify-center w-full h-full text-gray-50  bg-blue-400 font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 12c2.28 0 4-1.72 4-4s-1.72-4-4-4-4 1.72-4 4 1.72 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>`;
                                }}
                              />
                            ) : (
                              <div className="flex items-center justify-center w-full h-full text-gray-50 bg-blue-400 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 12c2.28 0 4-1.72 4-4s-1.72-4-4-4-4 1.72-4 4 1.72 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>  </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{review.user?.name || 'Anonymous'}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>

                        {review.detailedRatings && (
                          <div className="mt-3 bg-red-50 px-2 py-1 rounded-full text-xs inline-block">
                            <span className="font-medium text-primary">
                              {Math.floor(review.rating)} Star Review
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="md:w-3/4">
                        <div className="flex items-center mb-2">
                          <Rating
                            initialValue={review.rating}
                            readonly
                            size={16}
                            SVGstyle={{ display: 'inline-block' }}
                            fillColor="#ffc107"
                            emptyColor="#e0e0e0"
                            className="mr-2"
                          />
                          <h3 className="font-medium text-gray-800 text-sm">{review.title || 'Great Product'}</h3>
                        </div>

                        <div className="text-gray-700 mb-3 relative text-sm">
                          <p className={expandedReview === review._id ? '' : 'line-clamp-3'}>
                            {review.comment}
                          </p>
                          {review.comment && review.comment.length > 200 && (
                            <button
                              onClick={() => toggleExpand(review._id)}
                              className="text-primary hover:text-[#a0001c] text-xs font-medium mt-1"
                            >
                              {expandedReview === review._id ? 'Show less' : 'Read more'}
                            </button>
                          )}
                        </div>

                        {review.images && review.images.length > 0 && (
                          <div className="mb-3">
                            <div className="flex items-center text-gray-600 mb-1.5 text-xs">
                              <FaImages className="mr-1.5" size={12} />
                              <span>Attached images</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {review.images.map((img, index) => (
                                <div
                                  key={index}
                                  className="w-16 h-16 border border-gray-200 rounded-lg overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105"
                                  onClick={() => openLightbox(review.images, index)}
                                >
                                  <img
                                    src={img}
                                    alt={`Review ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {review.adminComment && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm">
                            <div className="flex items-center mb-1.5">
                              <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded mr-1.5">Admin</span>
                              <span className="text-blue-800 font-medium">Response</span>
                            </div>
                            <p className="text-blue-700">{review.adminComment}</p>
                          </div>
                        )}

                        {/* <div className="mt-4 flex items-center text-xs">
                          <button 
                            onClick={() => toggleLike(review._id)}
                            className="flex items-center text-gray-500 hover:text-red-500 mr-4"
                          >
                            {likedReviews[review._id] ? (
                              <FaHeart className="text-primary mr-1" size={12} />
                            ) : (
                              <FaRegHeart className="mr-1" size={12} />
                            )}
                            <span>{likedReviews[review._id] ? 'Liked' : 'Helpful'}</span>
                          </button>
                          
                          <button className="text-gray-500 hover:text-primary text-xs">
                            Report
                          </button>
                        </div> */}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="bg-[#f8d7da] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaFilter className="text-primary text-xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No reviews match your filters</h3>
                  <p className="text-gray-600 text-sm mb-5 max-w-md mx-auto">
                    Try adjusting your filter settings to see more reviews
                  </p>
                  <button
                    onClick={() => {
                      setRatingFilter(0);
                      setSortOption('newest');
                    }}
                    className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary text-white rounded-lg font-medium shadow-sm hover:shadow transition-all text-sm"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="inline-flex space-x-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${currentPage === 1
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
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${currentPage === i + 1
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                      }`}
                  >
                    &gt;
                  </button>
                </nav>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              {/* <button
                onClick={() => navigate(`/productpage/${id}/write-review`)}
                className="inline-flex items-center px-6 py-2.5 bg-primary hover:bg-primary text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all text-sm"
              >
                Write Your Review
                <FaStar className="ml-2 text-yellow-300" size={14} />
              </button> */}

              <p className="mt-3 text-gray-600 text-xs">
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