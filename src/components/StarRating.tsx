import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface StarRatingProps {
  rating: number | undefined;
  onRatingChange: (rating: number) => void;
  size?: number;
  interactive?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  onRatingChange, 
  size = 24, 
  interactive = true 
}) => {
  // Default to 0 if no rating exists (meaning habit wasn't performed)
  const currentRating = rating || 0;
  
  const handleStarClick = () => {
    if (interactive) {
      // Toggle between 0 and 1
      onRatingChange(currentRating === 1 ? 0 : 1);
    }
  };

  return (
    <div className="flex justify-center">
      <motion.div
        whileHover={interactive ? { scale: 1.2 } : {}}
        whileTap={interactive ? { scale: 0.9 } : {}}
        onClick={handleStarClick}
        className={`cursor-pointer transition-all duration-200 ${
          interactive ? 'hover:animate-bounce' : ''
        }`}
        style={{ cursor: interactive ? 'pointer' : 'default' }}
      >
                    <Star
              size={size}
              className={`transition-all duration-300 ${
                currentRating === 1 
                  ? 'fill-yellow-400 text-yellow-400 animate-twinkle' 
                  : 'fill-transparent text-gray-300'
              }`}
              style={{
                filter: currentRating === 1 ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))' : 'none'
              }}
            />
      </motion.div>
    </div>
  );
};

export default StarRating; 