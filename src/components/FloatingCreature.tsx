import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingCreatureProps {
  isHappy: boolean;
  onAnimationComplete?: () => void;
}

const FloatingCreature: React.FC<FloatingCreatureProps> = ({ isHappy, onAnimationComplete }) => {
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    if (isHappy) {
      setShowSparkles(true);
      const timer = setTimeout(() => setShowSparkles(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isHappy]);

  return (
    <div className="fixed bottom-8 right-8 z-50 pointer-events-none">
      <motion.div
        className="relative"
        animate={{
          y: [0, -10, 0],
          rotate: [0, 2, -2, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Main Creature Body */}
        <motion.div
          className="relative w-20 h-20"
          animate={{
            scale: isHappy ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: 0.6,
            ease: "easeInOut"
          }}
          onAnimationComplete={onAnimationComplete}
        >
          {/* Body */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full shadow-lg border-2 border-white/30" />
          
          {/* Belly */}
          <div className="absolute inset-2 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full" />
          
          {/* Eyes */}
          <div className="absolute top-2 left-3 w-6 h-6 bg-white shadow-inner border border-gray-300"
               style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}>
            <div className="absolute inset-1 bg-blue-500 animate-blink"
                 style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }} />
            <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white rounded-full" />
          </div>
          <div className="absolute top-2 right-3 w-6 h-6 bg-white shadow-inner border border-gray-300"
               style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}>
            <div className="absolute inset-1 bg-blue-500 animate-blink"
                 style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }} />
            <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white rounded-full" />
          </div>
          
          {/* Happy Eyes */}
          <AnimatePresence>
            {isHappy && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute top-2 left-3 w-6 h-6 bg-white shadow-inner border border-gray-300"
                style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}
              >
                <div 
                  className="absolute inset-1 bg-blue-500"
                  style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}
                />
                <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white rounded-full" />
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {isHappy && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute top-2 right-3 w-6 h-6 bg-white shadow-inner border border-gray-300"
                style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}
              >
                <div 
                  className="absolute inset-1 bg-blue-500"
                  style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}
                />
                <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white rounded-full" />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Mouth */}
          <motion.div
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-4 h-2"
            animate={{
              borderRadius: isHappy ? "0 0 20px 20px" : "20px 20px 0 0",
              backgroundColor: isHappy ? "#ff6b9d" : "#ff9ecd"
            }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Cheeks */}
          <AnimatePresence>
            {isHappy && (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute bottom-3 left-2 w-2 h-2 bg-pink-300 rounded-full"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute bottom-3 right-2 w-2 h-2 bg-pink-300 rounded-full"
                />
              </>
            )}
          </AnimatePresence>
        </motion.div>



        {/* Antennae */}
        <motion.div
          className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-4 bg-gradient-to-t from-purple-400 to-transparent"
          animate={{
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-yellow-300 rounded-full shadow-sm" />

        {/* Sparkles when happy */}
        <AnimatePresence>
          {showSparkles && (
            <>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    opacity: 0, 
                    scale: 0, 
                    x: 0, 
                    y: 0 
                  }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    scale: [0, 1, 0],
                    x: Math.cos(i * 45 * Math.PI / 180) * 30,
                    y: Math.sin(i * 45 * Math.PI / 180) * 30 - 20
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.1,
                    ease: "easeOut"
                  }}
                  className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-300 rounded-full"
                  style={{
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Floating particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/60 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + (i % 2) * 20}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default FloatingCreature; 