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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4">
      
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-4">
        {products.map((product, index) => (
          <div key={index} className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            {/* Product Image Container - Relative for absolute positioning of info */}
            <div className="relative h-55 bg-gray-100 overflow-hidden">
              {product.imageUrl ? (
                   <Link 
                to={product.link}>
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
              
              {/* Product Info - Absolute positioned at bottom */}
            {/* <div className={`absolute bottom-0 ${index % 2 === 0 ? 
                'right-2 text-center' : 'left-2 text-center'} p-4 text-purple-700 bottom-5`}>
                <h2 className="text-xl font-semibold mb-1">{product.title}</h2>
                <p className="text-[17px] text-black">
                {product.subtitle}</p>
                <p className="text-red-600 mb-3">${product.price ? product.price.toFixed(2) : '0.00'}</p>
                 <Link 
                to={product.link}
                className="bg-white text-black font-medium py-2 px-4 rounded
                 hover:bg-gray-200 transition-colors duration-300">
                {product.buttonText}
              </Link>
              </div> */}
            </div>
          </div>
        ))}
      </div>
     </div>
  );
};

export default SubBanner;