import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth } from 'date-fns';

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDateSelect: (date: string) => void;
  currentDate: string;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({
  isOpen,
  onClose,
  onDateSelect,
  currentDate
}) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const today = new Date();
  const currentDateObj = new Date(currentDate);

  const startDate = startOfMonth(selectedMonth);
  const endDate = endOfMonth(selectedMonth);
  const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

  // Get days from previous month to fill the first week
  const firstDayOfWeek = startDate.getDay();
  const daysFromPrevMonth = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    daysFromPrevMonth.push(subMonths(startDate, 1).setDate(endOfMonth(subMonths(startDate, 1)).getDate() - i));
  }

  // Get days from next month to fill the last week
  const lastDayOfWeek = endDate.getDay();
  const daysFromNextMonth = [];
  for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
    daysFromNextMonth.push(addMonths(startDate, 1).setDate(i));
  }

  const allDays = [...daysFromPrevMonth, ...daysInMonth.map(d => d.getTime()), ...daysFromNextMonth];

  const handleDateSelect = (date: Date) => {
    onDateSelect(format(date, 'yyyy-MM-dd'));
    onClose();
  };

  const goToPreviousMonth = () => {
    setSelectedMonth(subMonths(selectedMonth, 1));
  };

  const goToNextMonth = () => {
    setSelectedMonth(addMonths(selectedMonth, 1));
  };

  const goToToday = () => {
    setSelectedMonth(today);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Calendar size={20} />
                  </div>
                  <h2 className="text-xl font-bold">Select Date</h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <X size={20} />
                </motion.button>
              </div>
            </div>

            {/* Calendar */}
            <div className="p-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={goToPreviousMonth}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <ChevronLeft size={20} />
                </motion.button>
                
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-800">
                    {format(selectedMonth, 'MMMM yyyy')}
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goToToday}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Today
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={goToNextMonth}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <ChevronRight size={20} />
                </motion.button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {allDays.map((dayTimestamp, index) => {
                  const day = new Date(dayTimestamp);
                  const isCurrentMonth = isSameMonth(day, selectedMonth);
                  const isSelected = isSameDay(day, currentDateObj);
                  const isTodayDate = isToday(day);
                  const isFuture = day > today;

                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: isFuture ? 1 : 1.1 }}
                      whileTap={{ scale: isFuture ? 1 : 0.9 }}
                      onClick={() => !isFuture && handleDateSelect(day)}
                      disabled={isFuture}
                      className={`
                        w-10 h-10 rounded-full text-sm font-medium transition-all
                        ${isFuture 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : isSelected
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                            : isTodayDate
                              ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                              : isCurrentMonth
                                ? 'text-gray-700 hover:bg-gray-100'
                                : 'text-gray-400 hover:bg-gray-50'
                        }
                      `}
                    >
                      {format(day, 'd')}
                    </motion.button>
                  );
                })}
              </div>

              {/* Current Date Display */}
              <div className="mt-6 p-4 bg-gray-50 rounded-2xl">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Currently viewing:</p>
                  <p className="text-lg font-bold text-gray-800">
                    {format(currentDateObj, 'EEEE, MMMM do, yyyy')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DatePickerModal; 