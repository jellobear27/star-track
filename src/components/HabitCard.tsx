import React from 'react';
import { motion } from 'framer-motion';
import { X, Edit3 } from 'lucide-react';
import StarRating from './StarRating';
import { Habit, HabitEntry } from '../types';

interface HabitCardProps {
  habit: Habit;
  entry?: HabitEntry | null;
  onRatingChange: (habitId: string, rating: number) => void;
  onEdit?: (habit: Habit) => void;
  onDelete?: (habitId: string) => void;
  currentDate?: string;
}

const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  entry,
  onRatingChange,
  onEdit,
  onDelete,
  currentDate
}) => {

  const handleRatingChange = (rating: number) => {
    onRatingChange(habit.id, rating);
  };

  const bubbleColors = [
    'bg-gradient-to-br from-cyan-400 to-cyan-600',
    'bg-gradient-to-br from-blue-400 to-blue-600',
    'bg-gradient-to-br from-indigo-400 to-indigo-600',
    'bg-gradient-to-br from-purple-400 to-purple-600',
    'bg-gradient-to-br from-violet-400 to-violet-600',
    'bg-gradient-to-br from-slate-400 to-slate-600',
    'bg-gradient-to-br from-sky-400 to-sky-600',
    'bg-gradient-to-br from-cyan-500 to-blue-600'
  ];

  const colorIndex = parseInt(habit.color) || 0;
  const bubbleColor = bubbleColors[colorIndex % bubbleColors.length];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ y: -5 }}
      className={`relative overflow-hidden rounded-3xl p-6 shadow-2xl backdrop-blur-sm border border-cyan-400/20 ${bubbleColor} w-80 h-64`}
      style={{
        background: `linear-gradient(135deg, ${habit.color}20, ${habit.color}40)`,
        boxShadow: `0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(6, 182, 212, 0.2), 0 0 20px rgba(6, 182, 212, 0.1)`
      }}
    >
      {/* Floating bubbles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `rgba(6, 182, 212, ${Math.random() * 0.6 + 0.4})`,
              boxShadow: `0 0 ${Math.random() * 8 + 4}px rgba(6, 182, 212, ${Math.random() * 0.5 + 0.3})`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 1, 0.3],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between mb-4 h-20">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <motion.div
            className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            {habit.icon}
          </motion.div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-lg mb-1 truncate">{habit.name}</h3>
            <p className="text-white/80 text-sm line-clamp-2">{habit.description}</p>
          </div>
        </div>
        
        <div className="flex gap-2 flex-shrink-0">
          {onEdit && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onEdit(habit)}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <Edit3 size={16} />
            </motion.button>
          )}
          {onDelete && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete(habit.id)}
              className="p-2 rounded-full bg-red-500/20 text-red-200 hover:bg-red-500/30 transition-colors"
            >
              <X size={16} />
            </motion.button>
          )}
        </div>
      </div>

      {/* Star Rating */}
      <div className="relative z-10 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/90 text-sm font-medium">
            {currentDate ? `${new Date(currentDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} Progress:` : "Today's Progress:"}
          </span>
          <span className="text-white font-bold text-lg">
            {(entry?.stars || 0) === 1 ? '⭐ Star Earned!' : 'No Star Yet'}
          </span>
        </div>
        <div className="flex justify-center">
          <StarRating
            rating={entry?.stars}
            onRatingChange={handleRatingChange}
            size={32}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default HabitCard; 