import React, { useState, useEffect } from 'react';
import Api from '../../Services/Api';
import { Link } from 'react-router-dom';

const SubBanner = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const response = await Api.get('/subbanners');
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Mobile View - Horizontal Scroll */}
      <div className="lg:hidden flex space-x-4 overflow-x-auto pb-4 hide-scrollbar h-full">
        {products.map((product, index) => (
          <div
            key={index}
            className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex-none w-[45vw] h-full"
          >
            <div className="relative h-full w-full bg-gray-100 overflow-hidden">
              {product.imageUrl ? (
                <Link to={product.link} className="block h-full">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                    }}
                  />
                </Link>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-500 text-sm">
                  No Image Available
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View - Vertical Stack */}
      <div className="hidden lg:flex flex-col gap-4 h-full">
        {products.map((product, index) => (
          <div
            key={index}
            className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex-1 h-full"
          >
            <div className="relative h-full w-full bg-gray-100 overflow-hidden">
              {product.imageUrl ? (
                <Link to={product.link} className="block h-full">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                    }}
                  />
                </Link>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-500">
                  No Image Available
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubBanner;