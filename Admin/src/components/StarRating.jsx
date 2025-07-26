import React from 'react';
import { FaStar } from 'react-icons/fa';

const StarRating = ({ rating, size = 16 }) => {
  return (
    <div className="flex">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= rating;
        
        return (
          <FaStar 
            key={index}
            className={isFilled ? 'text-yellow-400' : 'text-gray-300'} 
            size={size}
          />
        );
      })}
    </div>
  );
};

export default StarRating;