import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, TrendingUp, Sparkles, Star } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import HabitCard from './components/HabitCard';
import AddHabitModal from './components/AddHabitModal';
import MonthlyReview from './components/MonthlyReview';
import DatePickerModal from './components/DatePickerModal';
import FloatingCreature from './components/FloatingCreature';
import { Habit, HabitEntry, MonthlyStats } from './types';
import { storage } from './utils/storage';

function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [currentDate, setCurrentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isViewingCustomDate, setIsViewingCustomDate] = useState(false);
  const [isNewDay, setIsNewDay] = useState(false);
  const [isCreatureHappy, setIsCreatureHappy] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Check for date changes and update current date
  useEffect(() => {
    const checkDateChange = () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      if (today !== currentDate && !isViewingCustomDate) {
        setCurrentDate(today);
        setIsNewDay(true);
        // Hide the new day indicator after 5 seconds
        setTimeout(() => setIsNewDay(false), 5000);
      }
    };

    // Check immediately
    checkDateChange();

    // Set up interval to check every minute
    const interval = setInterval(checkDateChange, 60000);

    return () => clearInterval(interval);
  }, [currentDate, isViewingCustomDate]);

  const loadData = () => {
    const savedHabits = storage.getHabits();
    const savedEntries = storage.getEntries();
    setHabits(savedHabits);
    setEntries(savedEntries);
  };

  const saveHabits = (newHabits: Habit[]) => {
    storage.saveHabits(newHabits);
    setHabits(newHabits);
  };

  const saveEntries = (newEntries: HabitEntry[]) => {
    storage.saveEntries(newEntries);
    setEntries(newEntries);
  };

  const handleAddHabit = (habitData: Omit<Habit, 'id' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    saveHabits([...habits, newHabit]);
  };

  const handleEditHabit = (habitData: Omit<Habit, 'id' | 'createdAt'>) => {
    if (editingHabit) {
      const updatedHabits = habits.map(habit =>
        habit.id === editingHabit.id
          ? { ...habit, ...habitData }
          : habit
      );
      saveHabits(updatedHabits);
      setEditingHabit(null);
    }
  };

  const handleDeleteHabit = (habitId: string) => {
    const updatedHabits = habits.filter(habit => habit.id !== habitId);
    const updatedEntries = entries.filter(entry => entry.habitId !== habitId);
    saveHabits(updatedHabits);
    saveEntries(updatedEntries);
  };

  const handleRatingChange = (habitId: string, rating: number) => {
    const existingEntryIndex = entries.findIndex(
      entry => entry.habitId === habitId && entry.date === currentDate
    );

    let updatedEntries;
    if (existingEntryIndex >= 0) {
      updatedEntries = entries.map((entry, index) =>
        index === existingEntryIndex
          ? { ...entry, stars: rating }
          : entry
      );
    } else {
      const newEntry: HabitEntry = {
        id: Date.now().toString(),
        habitId,
        date: currentDate,
        stars: rating
      };
      updatedEntries = [...entries, newEntry];
    }

    saveEntries(updatedEntries);

    // Make creature happy when earning a star
    if (rating === 1) {
      setIsCreatureHappy(true);
      setTimeout(() => setIsCreatureHappy(false), 2000);
    }
  };

  const getMonthlyStats = (): MonthlyStats[] => {
    const startDate = startOfMonth(new Date());
    const endDate = endOfMonth(new Date());
    const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

    return habits.map(habit => {
      const habitEntries = entries.filter(
        entry => entry.habitId === habit.id && 
        daysInMonth.some(day => format(day, 'yyyy-MM-dd') === entry.date)
      );

      const totalDays = daysInMonth.length;
      const completedDays = habitEntries.length;
      const totalStars = habitEntries.reduce((sum, entry) => sum + entry.stars, 0);
      const averageStars = completedDays > 0 ? totalStars / completedDays : 0;
      const completionRate = (completedDays / totalDays) * 100;

      // Get recent entries (last 7 days) for attention tracking
      const recentEntries = entries
        .filter(entry => entry.habitId === habit.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 7);

      return {
        habitId: habit.id,
        habitName: habit.name,
        totalDays,
        completedDays,
        averageStars,
        totalStars,
        completionRate,
        recentEntries
      };
    });
  };

  const getAllTimeStats = (): MonthlyStats[] => {
    return habits.map(habit => {
      const habitEntries = entries.filter(entry => entry.habitId === habit.id);
      
      // Calculate total days since the habit was created
      const habitCreatedDate = habit.createdAt;
      const today = new Date();
      const totalDays = Math.ceil((today.getTime() - habitCreatedDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      const completedDays = habitEntries.length;
      const totalStars = habitEntries.reduce((sum, entry) => sum + entry.stars, 0);
      const averageStars = completedDays > 0 ? totalStars / completedDays : 0;
      const completionRate = (completedDays / totalDays) * 100;

      // Get recent entries (last 7 days) for attention tracking
      const recentEntries = entries
        .filter(entry => entry.habitId === habit.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 7);

      return {
        habitId: habit.id,
        habitName: habit.name,
        totalDays,
        completedDays,
        averageStars,
        totalStars,
        completionRate,
        recentEntries
      };
    });
  };

  const getEntryForHabit = (habitId: string): HabitEntry | null => {
    return entries.find(
      entry => entry.habitId === habitId && entry.date === currentDate
    ) || null;
  };

  const openEditModal = (habit: Habit) => {
    setEditingHabit(habit);
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setEditingHabit(null);
  };

  const handleDateSelect = (date: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    setCurrentDate(date);
    setIsViewingCustomDate(date !== today);
  };

  // Shooting star cursor effect
  useEffect(() => {
    const cursor = document.createElement('div');
    cursor.className = 'shooting-star-cursor';
    document.body.appendChild(cursor);

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    const updateCursor = () => {
      // Normal cursor speed - direct movement
      cursorX = mouseX;
      cursorY = mouseY;

      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
      
      requestAnimationFrame(updateCursor);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    document.addEventListener('mousemove', handleMouseMove);
    updateCursor();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.body.removeChild(cursor);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 1,
              height: Math.random() * 4 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`,
              boxShadow: `0 0 ${Math.random() * 10 + 5}px rgba(255, 255, 255, ${Math.random() * 0.5 + 0.3})`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0.2, 1, 0.2],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
        {/* Nebula clouds */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`nebula-${i}`}
            className="absolute rounded-full blur-3xl"
            style={{
              width: Math.random() * 300 + 200,
              height: Math.random() * 300 + 200,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, rgba(${Math.random() > 0.5 ? '147, 51, 234' : '59, 130, 246'}, 0.3), transparent)`,
            }}
            animate={{
              opacity: [0.1, 0.4, 0.1],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
                {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative text-center mb-6 w-full"
        >
          {/* Milky Way Background */}
          <div className="absolute inset-0 -top-5 -bottom-5 overflow-hidden rounded-3xl">
            {/* Galaxy core */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-slate-900/80 to-black rounded-3xl"></div>
            
            {/* Nebula clouds */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-indigo-600/30 via-purple-600/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-radial from-cyan-600/25 via-blue-600/15 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
              <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-radial from-violet-600/20 via-purple-600/10 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
              <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-radial from-slate-600/15 via-gray-600/10 to-transparent rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
            
            {/* Dense star field */}
            {[...Array(150)].map((_, i) => (
              <motion.div
                key={`milky-star-${i}`}
                className="absolute rounded-full"
                style={{
                  width: Math.random() * 2 + 0.5,
                  height: Math.random() * 2 + 0.5,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  background: Math.random() > 0.7 ? 'rgba(6, 182, 212, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                  opacity: Math.random() * 0.6 + 0.1,
                  boxShadow: `0 0 ${Math.random() * 8 + 3}px rgba(255, 255, 255, ${Math.random() * 0.4 + 0.2})`,
                }}
                animate={{
                  opacity: [0.1, 0.8, 0.1],
                  scale: [0.3, 1.1, 0.3],
                }}
                transition={{
                  duration: 4 + Math.random() * 6,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                }}
              />
            ))}
            
            {/* Bright stars */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={`bright-star-${i}`}
                className="absolute rounded-full"
                style={{
                  width: Math.random() * 3 + 1.5,
                  height: Math.random() * 3 + 1.5,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  background: Math.random() > 0.5 ? 'rgba(6, 182, 212, 1)' : 'rgba(255, 255, 255, 1)',
                  boxShadow: `0 0 ${Math.random() * 20 + 15}px rgba(6, 182, 212, 0.9), 0 0 ${Math.random() * 35 + 20}px rgba(6, 182, 212, 0.5), 0 0 ${Math.random() * 50 + 30}px rgba(6, 182, 212, 0.2)`,
                }}
                animate={{
                  opacity: [0.4, 1, 0.4],
                  scale: [0.7, 1.8, 0.7],
                }}
                transition={{
                  duration: 5 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 6,
                }}
              />
            ))}
            
            {/* Shooting stars */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`shooting-star-${i}`}
                className="absolute w-0.5 h-0.5 bg-cyan-300 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  boxShadow: '0 0 15px rgba(6, 182, 212, 1), 0 0 25px rgba(6, 182, 212, 0.6)',
                }}
                animate={{
                  x: [0, 300],
                  y: [0, 300],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 15,
                }}
              />
            ))}
          </div>
          <motion.div
            className="inline-flex items-center gap-3 relative z-10 py-4"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-cyan-400/30 to-blue-500/30 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-cyan-400/20">
              <Sparkles size={32} className="text-cyan-300" />
            </div>
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">
              Star Tracker
            </h1>
          </motion.div>
        </motion.div>
        
        <div className="text-center mb-6">
          <p className="inline-block text-cyan-200/90 text-lg px-6 py-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-sm rounded-2xl border border-cyan-400/20 shadow-lg">
            {currentDate === format(new Date(), 'yyyy-MM-dd') 
              ? "You're Already A Star, Tracking your Light will Help You Shine Brighter ✨"
              : `Exploring habits from ${format(new Date(currentDate), 'MMMM do, yyyy')} - you can edit past entries! ✨`
            }
          </p>
        </div>
        
        {/* New Day Indicator */}
        <AnimatePresence>
          {isNewDay && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 backdrop-blur-sm rounded-xl text-green-200 text-sm font-medium mb-4"
            >
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              New day - fresh start for your habits!
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Date Display */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <motion.button
            onClick={() => setIsDatePickerOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm rounded-2xl text-cyan-200 font-medium cursor-pointer hover:from-cyan-500/30 hover:to-blue-500/30 transition-all border border-cyan-400/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Calendar size={20} />
            {format(new Date(currentDate), 'EEEE, MMMM do, yyyy')}
          </motion.button>
          
          {isViewingCustomDate && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => {
                setCurrentDate(format(new Date(), 'yyyy-MM-dd'));
                setIsViewingCustomDate(false);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm rounded-xl text-emerald-200 text-sm font-medium hover:from-emerald-500/30 hover:to-teal-500/30 transition-all border border-emerald-400/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              Today
            </motion.button>
          )}
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg border border-cyan-400/30"
          >
            <Plus size={24} />
            Add New Habit
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsReviewModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 border border-purple-400/30"
          >
            <TrendingUp size={20} />
            Monthly Review
          </motion.button>
        </motion.div>

        {/* Habits Grid */}
        {habits.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <motion.div
              className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-cyan-400/30 to-blue-500/30 backdrop-blur-sm flex items-center justify-center border border-cyan-400/20"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Star size={48} className="text-cyan-300" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">No habits yet!</h3>
            <p className="text-cyan-200/80 mb-6">Begin your cosmic journey by adding your first habit to track your progress.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAddModalOpen(true)}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 border border-cyan-400/30"
            >
              Create Your First Habit
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {habits.map((habit, index) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <HabitCard
                    habit={habit}
                    entry={getEntryForHabit(habit.id)}
                    onRatingChange={handleRatingChange}
                    onEdit={openEditModal}
                    onDelete={handleDeleteHabit}
                    currentDate={currentDate}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <AddHabitModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onAdd={editingHabit ? handleEditHabit : handleAddHabit}
        editingHabit={editingHabit}
      />

      <MonthlyReview
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        stats={getMonthlyStats()}
        allTimeStats={getAllTimeStats()}
      />

      <DatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onDateSelect={handleDateSelect}
        currentDate={currentDate}
      />

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-8 left-8 z-40 w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-200 flex items-center justify-center border border-cyan-400/30"
      >
        <Plus size={28} />
      </motion.button>

      {/* Floating Creature */}
      <FloatingCreature 
        isHappy={isCreatureHappy}
        onAnimationComplete={() => {
          // Optional: Add any additional logic when animation completes
        }}
      />
    </div>
  );
}

export default App; 