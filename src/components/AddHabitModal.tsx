import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Sparkles } from 'lucide-react';
import { Habit } from '../types';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  editingHabit?: Habit | null;
}

const AddHabitModal: React.FC<AddHabitModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  editingHabit
}) => {
  const [name, setName] = useState(editingHabit?.name || '');
  const [description, setDescription] = useState(editingHabit?.description || '');
  const [selectedColor, setSelectedColor] = useState(editingHabit?.color || '0');
  const [selectedIcon, setSelectedIcon] = useState(editingHabit?.icon || '💪');

  const colors = [
    { id: '0', name: 'Pink', class: 'bg-gradient-to-br from-pink-400 to-pink-600' },
    { id: '1', name: 'Purple', class: 'bg-gradient-to-br from-purple-400 to-purple-600' },
    { id: '2', name: 'Blue', class: 'bg-gradient-to-br from-blue-400 to-blue-600' },
    { id: '3', name: 'Green', class: 'bg-gradient-to-br from-green-400 to-green-600' },
    { id: '4', name: 'Yellow', class: 'bg-gradient-to-br from-yellow-400 to-yellow-600' },
    { id: '5', name: 'Red', class: 'bg-gradient-to-br from-red-400 to-red-600' },
    { id: '6', name: 'Indigo', class: 'bg-gradient-to-br from-indigo-400 to-indigo-600' },
    { id: '7', name: 'Teal', class: 'bg-gradient-to-br from-teal-400 to-teal-600' }
  ];

  const icons = [
    // Fitness & Health
    '💪', '🏃', '🚴', '🏋️', '🧘', '🏊', '⚽', '🏀', '🎾', '🏓', '🏸', '🥊', '🥋', '🧗', '🏔️', '🏃‍♀️',
    
    // Wellness & Self-Care
    '🧠', '💤', '🛁', '🧖', '💆', '💇', '💅', '🧴', '🫧', '🌿', '🍃', '🌸', '🌺', '🌻', '🌼', '🌷',
    
    // Food & Nutrition
    '🍎', '🥗', '🥑', '🥦', '🥕', '🍅', '🥝', '🍓', '🫐', '🥭', '🍊', '🍋', '🥥', '🥜', '🌰', '🥑',
    
    // Learning & Growth
    '📚', '📖', '✏️', '🖊️', '📝', '🎓', '🎒', '📱', '💻', '🖥️', '📊', '📈', '🎯', '🎪', '🎭', '🎨',
    
    // Creativity & Hobbies
    '🎨', '🎭', '🎪', '🎵', '🎶', '🎸', '🎹', '🎺', '🥁', '🎤', '🎧', '🎬', '📷', '🎥', '🎮', '🧩',
    
    // Productivity & Work
    '💼', '💻', '📱', '📞', '📧', '📨', '📬', '📋', '📝', '✂️', '🔧', '⚙️', '🔨', '🛠️', '📊', '📈',
    
    // Nature & Outdoors
    '🌱', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🌺', '🌸', '🌼', '🌻', '🌷', '🌹', '🌻',
    
    // Travel & Adventure
    '✈️', '🚗', '🚲', '🚁', '🚢', '🚤', '⛵', '🏖️', '🏝️', '🗺️', '🧭', '🎒', '🏕️', '⛺', '🏔️', '🗻',
    
    // Emotions & Feelings
    '😊', '😄', '😃', '😁', '😆', '😅', '😂', '🤣', '😉', '😋', '😎', '🤩', '🥳', '😌', '😇', '🤗',
    
    // Motivation & Success
    '⭐', '💎', '🏆', '🥇', '🥈', '🥉', '🎖️', '🏅', '🎗️', '💫', '✨', '🌟', '💎', '🔮', '🎊', '🎉',
    
    // Daily Activities
    '☀️', '🌙', '⭐', '🌅', '🌄', '🌆', '🌃', '🌌', '☕', '🍵', '🥤', '🧃', '🍶', '🍷', '🍺', '🍸',
    
    // Technology & Innovation
    '🚀', '🛸', '🛰️', '🌍', '🌎', '🌏', '🌐', '🌍', '🔬', '🔭', '⚡', '💡', '🔋', '🔌', '📡', '🛰️',
    
    // Animals & Pets
    '🐕', '🐈', '🐦', '🐠', '🐢', '🦎', '🐍', '🐸', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐟', '🐬',
    
    // Weather & Seasons
    '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '🌪️', '🌈', '☔', '🌊', '💧',
    
    // Special & Unique
    '🎭', '🎪', '🎨', '🎬', '🎤', '🎧', '🎵', '🎶', '🎸', '🎹', '🎺', '🥁', '🎻', '🪕', '🪘', '🎼'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd({
        name: name.trim(),
        description: description.trim() || '', // Make description optional
        color: selectedColor,
        icon: selectedIcon
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setSelectedColor('0');
    setSelectedIcon('💪');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="relative p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles size={20} />
                  </motion.div>
                  <h2 className="text-xl font-bold">
                    {editingHabit ? 'Edit Habit' : 'Add New Habit'}
                  </h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <X size={20} />
                </motion.button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 overflow-y-auto pb-20">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Habit Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Morning Exercise"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                  required
                />
              </div>

              {/* Description Input - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your habit (optional)..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all resize-none"
                />
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose Color
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {colors.map((color) => (
                    <motion.button
                      key={color.id}
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedColor(color.id)}
                      className={`w-12 h-12 rounded-2xl ${color.class} border-4 transition-all ${
                        selectedColor === color.id 
                          ? 'border-white shadow-lg scale-110' 
                          : 'border-transparent hover:border-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose Icon <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="max-h-64 overflow-y-auto">
                  <div className="grid grid-cols-8 gap-3">
                    {icons.map((icon) => (
                      <motion.button
                        key={icon}
                        type="button"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedIcon(icon)}
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl transition-all ${
                          selectedIcon === icon 
                            ? 'bg-purple-500 text-white shadow-lg scale-110' 
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {icon}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

            </form>

            {/* Fixed Submit Button */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-200">
              <motion.button
                type="submit"
                disabled={!name.trim()}
                whileHover={{ scale: name.trim() ? 1.02 : 1 }}
                whileTap={{ scale: name.trim() ? 0.98 : 1 }}
                onClick={handleSubmit}
                className={`w-full py-4 font-bold rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-lg ${
                  name.trim() 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-xl' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Plus size={24} />
                {editingHabit ? 'Update Habit' : 'Add Habit'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddHabitModal; 