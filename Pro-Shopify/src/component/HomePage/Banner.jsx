import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Api from '../../Services/Api';

const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await Api.get(`/banners`);
        setBanners(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load banners. Please try again later.');
        console.error('Error fetching banners:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Auto-rotate banners if there are multiple
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prevIndex) => 
          prevIndex === banners.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // Change banner every 5 seconds
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const goToPrevBanner = () => {
    setCurrentBannerIndex((prevIndex) => 
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    );
  };

  const goToNextBanner = () => {
    setCurrentBannerIndex((prevIndex) => 
      prevIndex === banners.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4 max-w-4xl mx-auto">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="bg-gray-100 border-l-4 border-gray-500 text-gray-700 p-4 my-4 max-w-4xl mx-auto">
        <p>No active banners available at the moment.</p>
      </div>
    );
  }

  const currentBanner = banners[currentBannerIndex];

  return (
    <>
    
    <div className='flex justify-between h-[500px]'>
     <div className="relative w-full h-full overflow-hidden rounded-lg shadow-lg bg-gray-100">
      {/* Banner Image - Responsive with different sizes */}
      <div className="relative w-full  aspect-[16/9] md:aspect-[21/9] lg:aspect-[24/9]">
       <Link 
                to={currentBanner.link}>
        <img 
          src={currentBanner.imageUrl} 
          alt={currentBanner.title} 
          className="w-full h-[500px] object-cover"
          loading="lazy"
        />
        </Link>
        {/* Gradient Overlay */}
        <div className="absolute inset-75 bg-gradient-to-r from-black/60 to-black/20"></div>
        
        {/* Banner Content */}
        {/* <div className="absolute inset-0  flex items-center ml-[50%]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg text-[#171216da] p-4 sm:p-6">
              <h2 className="text-1xl sm:text-1xl md:text-3xl font-bold mb-2 sm:mb-3">
                {currentBanner.title}
              </h2>
              <p className="text-lg sm:text-xl mb-4 sm:mb-6">
                {currentBanner.subtitle}
              </p>
              <Link 
                to={currentBanner.link}
                className="inline-block bg-white text-gray-800 font-semibold py-2 px-6 rounded-full hover:bg-gray-100 transition duration-300 hover:scale-105 transform"
              >
                {currentBanner.buttonText}
              </Link>
            </div>
          </div>
        </div> */}
      </div>

      {/* Navigation Arrows (if multiple banners) */}
      {banners.length > 1 && (
        <>
          <button 
            onClick={goToPrevBanner}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition"
            aria-label="Previous banner"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={goToNextBanner}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition"
            aria-label="Next banner"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator (if multiple banners) */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBannerIndex(index)}
              className={`w-3 h-3 rounded-full transition ${index === currentBannerIndex ? 'bg-white w-6' : 'bg-white/50'}`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
    </div>
    </>
  );
};

export default Banner;