import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Api from '../../Services/Api';
import { FiArrowLeft, FiStar, FiImage, FiClock, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const ProductReviews = () => {
  const { id } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productInfo, setProductInfo] = useState(null);
  const [ratingAnalysis, setRatingAnalysis] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const reviewsResponse = await Api.get(`reviews/product/${id}`);
        setReviews(reviewsResponse.data);
        
        const productResponse = await Api.get(`products/${id}`);
        setProductInfo(productResponse.data);
        
        // Calculate detailed rating analysis
        calculateRatingAnalysis(reviewsResponse.data);
        
      } catch (err) {
        console.error(err);
        setError('Failed to load reviews. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Calculate detailed ratings analysis
  const calculateRatingAnalysis = (reviews) => {
    if (!reviews || reviews.length === 0) return;
    
    const analysis = {
      totalReviews: reviews.length,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      detailedRatings: {
        quality: { total: 0, count: 0, average: 0 },
        value: { total: 0, count: 0, average: 0 },
        performance: { total: 0, count: 0, average: 0 },
        design: { total: 0, count: 0, average: 0 },
        easeOfUse: { total: 0, count: 0, average: 0 }
      }
    };
    
    let totalRating = 0;
    
    reviews.forEach(review => {
      // Overall rating analysis
      totalRating += review.rating;
      const roundedRating = Math.round(review.rating);
      analysis.ratingDistribution[roundedRating] = (analysis.ratingDistribution[roundedRating] || 0) + 1;
      
      // Detailed ratings analysis
      if (review.detailedRatings) {
        Object.keys(review.detailedRatings).forEach(category => {
          if (analysis.detailedRatings[category]) {
            analysis.detailedRatings[category].total += review.detailedRatings[category];
            analysis.detailedRatings[category].count++;
          }
        });
      }
    });
    
    // Calculate averages
    analysis.averageRating = totalRating / reviews.length;
    
    Object.keys(analysis.detailedRatings).forEach(category => {
      const cat = analysis.detailedRatings[category];
      if (cat.count > 0) {
        cat.average = cat.total / cat.count;
      }
    });
    
    setRatingAnalysis(analysis);
  };

  // Calculate relative time
  const getFormattedTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    let relative = '';
    if (diffInSeconds < 60) {
      relative = 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      relative = `${minutes} min ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      relative = `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      relative = `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      relative = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }

    const absolute = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const time = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    return `${relative} • ${absolute}, ${time}`;
  };

  // Purple-themed star rating component
  const renderStars = (rating, size = 'base') => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const iconSize = size === 'sm' ? 'text-sm' : 'text-base';
    
    return (
      <div className={`flex items-center ${iconSize}`}>
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return (
              <FiStar 
                key={i}
                className="text-violet-500 fill-current"
                style={{ strokeWidth: 1.5 }}
              />
            );
          } else if (i === fullStars && hasHalfStar) {
            return (
              <div key={i} className="relative">
                <FiStar 
                  className="text-gray-300"
                  style={{ strokeWidth: 1.5 }}
                />
                <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                  <FiStar 
                    className="text-violet-500 fill-current"
                    style={{ strokeWidth: 1.5 }}
                  />
                </div>
              </div>
            );
          } else {
            return (
              <FiStar 
                key={i}
                className="text-gray-300"
                style={{ strokeWidth: 1.5 }}
              />
            );
          }
        })}
        <span className="ml-2 font-bold text-violet-700">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Rating progress bar component
  const RatingProgressBar = ({ value, max = 5 }) => {
    const percentage = (value / max) * 100;
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-violet-600 h-2.5 rounded-full" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Back Button */}
      <button 
        className="flex items-center mb-6 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
        onClick={() => navigate(-1)}
      >
        <FiArrowLeft className="mr-2" />
        Back
      </button>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-t-4 border-violet-600 border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-violet-700 font-medium">Loading reviews...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p>{error}</p>
          <button 
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Product Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-violet-800 mb-2">Product Reviews</h1>
              {productInfo && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="text-lg font-semibold text-gray-800">{productInfo.name}</span>
                  {productInfo.averageRating && (
                    <div className="flex items-center px-4 py-2 bg-violet-100 rounded-full">
                      {renderStars(productInfo.averageRating)}
                      <span className="ml-2 text-violet-800 font-medium">
                        ({reviews.length} reviews)
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Detailed Rating Analysis Section */}
          {ratingAnalysis && (
            <div className="bg-white rounded-xl shadow-md border border-violet-100 mb-8 p-6">
              <h2 className="text-xl font-bold text-violet-800 mb-4">Rating Analysis</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Overall Rating Summary */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Overall Rating</h3>
                  <div className="flex items-center mb-2">
                    <div className="text-4xl font-bold text-violet-700 mr-4">
                      {ratingAnalysis.averageRating.toFixed(1)}
                    </div>
                    <div>
                      {renderStars(ratingAnalysis.averageRating)}
                      <div className="text-gray-600 mt-1">
                        {ratingAnalysis.totalReviews} reviews
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Rating Distribution</h3>
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <div key={stars} className="flex items-center mb-2">
                        <div className="w-10 text-violet-700 font-medium">
                          {stars} <FiStar className="inline-block mb-1" />
                        </div>
                        <div className="flex-1 mx-3">
                          <RatingProgressBar 
                            value={ratingAnalysis.ratingDistribution[stars] || 0} 
                            max={ratingAnalysis.totalReviews} 
                          />
                        </div>
                        <div className="w-10 text-right text-gray-600">
                          {ratingAnalysis.ratingDistribution[stars] 
                            ? ((ratingAnalysis.ratingDistribution[stars] / ratingAnalysis.totalReviews) * 100).toFixed(0) + '%' 
                            : '0%'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Detailed Ratings Breakdown */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Detailed Ratings</h3>
                  <div className="space-y-4">
                    {Object.entries(ratingAnalysis.detailedRatings).map(([category, data]) => (
                      data.count > 0 && (
                        <div key={category}>
                          <div className="flex justify-between mb-1">
                            <span className="capitalize text-gray-700 font-medium">
                              {category.replace(/([A-Z])/g, ' $1')}
                            </span>
                            <span className="text-violet-700 font-bold">
                              {data.average.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3/4 mr-3">
                              <RatingProgressBar value={data.average} />
                            </div>
                            <div className="text-sm text-gray-500">
                              ({data.count})
                            </div>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reviews Grid */}
          {reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-violet-200 rounded-xl bg-violet-50">
              <div className="bg-violet-100 p-4 rounded-full mb-4">
                <FiStar className="text-violet-600 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-violet-800 mb-1">No Reviews Yet</h3>
              <p className="text-gray-600 max-w-md text-center">
                Be the first to share your experience with this product!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review) => (
                <div key={review._id} className="bg-white rounded-xl shadow-md border border-violet-100 overflow-hidden">
                  <div className="p-5">
                    {/* Review Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <div className="bg-violet-100 w-10 h-10 rounded-full flex items-center justify-center">
                          <span className="font-bold text-violet-700">
                            {review.user?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="ml-3">
                          <h4 className="font-semibold text-gray-900">
                            {review.user?.name || 'User'}
                          </h4>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <FiClock className="mr-1" size={14} />
                            <span title={new Date(review.createdAt).toLocaleString()}>
                              {getFormattedTime(review.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    
                    {/* Detailed Ratings */}
                    {review.detailedRatings && (
                      <div className="mb-4 p-3 bg-violet-50 rounded-lg">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(review.detailedRatings).map(([key, value]) => (
                            <div key={key} className="flex items-center">
                              <span className="font-medium text-violet-800 capitalize mr-2">
                                {key}:
                              </span>
                              <div className="flex">
                                {renderStars(value, 'sm')}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Review Comment */}
                    <p className="text-gray-700 mb-4">{review.comment}</p>
                    
                    {/* Admin Comment */}
                    {review.adminComment && (
                      <div className="mt-5 pt-5 border-t border-violet-100">
                        <div className="flex items-start">
                          <div className="bg-violet-600 p-2 rounded-full mr-3">
                            <FiUser className="text-white" size={16} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-violet-700">Admin Response</span>
                              <span className="text-xs text-gray-500">
                                {review.adminCommentDate && getFormattedTime(review.adminCommentDate)}
                              </span>
                            </div>
                            <div className="bg-violet-50 p-4 rounded-lg">
                              <p className="text-gray-700">{review.adminComment}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Review Images */}
                    {review.images?.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-violet-50">
                        <div className="flex items-center text-gray-600 mb-3">
                          <FiImage className="mr-2 text-violet-500" />
                          <span className="font-medium">Customer Photos</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {review.images.map((img, idx) => (
                            <div 
                              key={idx} 
                              className="aspect-square overflow-hidden rounded-lg border border-violet-100 cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => window.open(img, '_blank')}
                            >
                              <img 
                                src={img} 
                                alt={`Review by ${review.user?.name}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductReviews;