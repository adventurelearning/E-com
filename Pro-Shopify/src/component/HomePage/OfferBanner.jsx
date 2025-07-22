import React, { useState, useEffect } from 'react';
import Api from '../../Services/Api';
import { Link } from 'react-router-dom';

const OfferBanner = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await Api.get('/offers');
        setOffers(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (offers.length === 0) {
    return null; // Don't render anything if no offers
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Special Offers</h2>
      
      <div className="">
        {offers.map((offer) => (
          <div key={offer._id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
            <div className="relative">
                <Link to={offer.link}>
              <img 
                src={offer.bannerImage} 
                alt={offer.title} 
                className="w-full h-49 "
              />
              </Link>
              <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                {Math.round(((offer.price - offer.discountPrice) / offer.price) * 100)}% OFF
              </div>
            </div>
            
            {/* <div className="p-4">
              <h3 className="text-xl font-semibold mb-1">{offer.title}</h3>
              <p className="text-gray-600 mb-3">{offer.subtitle}</p>
              
              <div className="flex items-center mb-4">
                <span className="text-gray-500 line-through mr-2">${offer.price}</span>
                <span className="text-2xl font-bold text-red-600">${offer.discountPrice}</span>
              </div>
              
              <a 
                href={offer.link} 
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-bold py-2 px-4 rounded transition"
              >
                Shop Now
              </a>
            </div> */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OfferBanner;