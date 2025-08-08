import { useState, useEffect } from 'react';
import Api from '../../Services/Api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Division = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigate();

  // Responsive items per page
  const getItemsPerPage = () => {
    if (typeof window === 'undefined') return 8;
    if (window.innerWidth < 640) return 4;  // sm
    if (window.innerWidth < 768) return 6;  // md
    if (window.innerWidth < 1024) return 8; // lg
    return 10; // xl
  };

  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage());
  const [visibleItems, setVisibleItems] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(getItemsPerPage());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await Api.get('categories');
        setCategories(response.data);
      } catch (err) {
        setError(err.message || 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      const startIndex = currentPage * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setVisibleItems(categories.slice(startIndex, endIndex));
    } else {
      setVisibleItems([]);
    }
  }, [currentPage, categories, itemsPerPage]);

  const totalPages = Math.ceil(categories.length / itemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToPage = (pageIndex) => {
    setCurrentPage(pageIndex);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {[...Array(itemsPerPage)].map((_, index) => (
            <motion.div 
              key={index} 
              className="animate-pulse"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
            >
              <div className="bg-gray-200 rounded-t-[400px] h-32 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Shop by Category</h2>
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-center">
          <p className="font-medium">Error loading categories</p>
          <p className="text-sm mt-1">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Shop by Category</h2>
        
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className={`p-2 h-10 w-10 rounded-full flex items-center justify-center shadow-sm ${
                currentPage === 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } transition-colors`}
              aria-label="Previous"
              disabled={currentPage === 0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="hidden sm:flex gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
                // Show first, last, and current page with neighbors
                let pageIndex;
                if (totalPages <= 5) {
                  pageIndex = index;
                } else if (currentPage < 3) {
                  pageIndex = index;
                } else if (currentPage > totalPages - 4) {
                  pageIndex = totalPages - 5 + index;
                } else {
                  pageIndex = currentPage - 2 + index;
                }

                return (
                  <button
                    key={pageIndex}
                    onClick={() => goToPage(pageIndex)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentPage === pageIndex 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-700 hover:bg-[#f0d1e2]'
                    } transition-colors`}
                  >
                    {pageIndex + 1}
                  </button>
                );
              })}
            </div>
            
            
            <button
              onClick={handleNext}
              className={`p-2 h-10 w-10 rounded-full flex items-center justify-center shadow-sm ${
                currentPage === totalPages - 1 || totalPages === 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } transition-colors`}
              aria-label="Next"
              disabled={currentPage === totalPages - 1 || totalPages === 0}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="relative">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {visibleItems.map((category) => (
            <motion.div
              key={category.id}
              className="group cursor-pointer"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              onClick={() => navigate(`/category/${category.name}`)}
            >
              <div className="relative bg-white rounded-t-[400px] shadow-sm overflow-hidden group-hover:bg-[#f3e1eb] transition-all duration-300">
                <div className="w-full h-32 mb-4 flex items-center justify-center">
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <h3 className="text-center mt-3 font-medium text-gray-800 text-sm md:text-base line-clamp-2 group-hover:text-[#d10024] transition-colors">
                {category.name}
              </h3>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 sm:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 0}
              className="p-2 disabled:opacity-50"
              aria-label="Previous"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToPage(index)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    currentPage === index 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages - 1}
              className="p-2 disabled:opacity-50"
              aria-label="Next"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Division;