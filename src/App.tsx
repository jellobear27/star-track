import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, TrendingUp, Sparkles, Star } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import HabitCard from './components/HabitCard';
import AddHabitModal from './components/AddHabitModal';
import MonthlyReview from './components/MonthlyReview';
import FloatingCreature from './components/FloatingCreature';
import { Habit, HabitEntry, MonthlyStats } from './types';
import { storage } from './utils/storage';

function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [currentDate, setCurrentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isNewDay, setIsNewDay] = useState(false);
  const [isCreatureHappy, setIsCreatureHappy] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Check for date changes and update current date
  useEffect(() => {
    const checkDateChange = () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      if (today !== currentDate) {
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
  }, [currentDate]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400">
      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
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
          className="text-center mb-8"
        >
          <motion.div
            className="inline-flex items-center gap-3 mb-4"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
              <Sparkles size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">
              Habit Tracker
            </h1>
          </motion.div>
          <p className="text-white/90 text-lg mb-6">
            Earn a star each day you complete your habits! ⭐
          </p>
          
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
          <motion.div
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-2xl text-white font-medium"
            whileHover={{ scale: 1.05 }}
          >
            <Calendar size={20} />
            {format(new Date(), 'EEEE, MMMM do, yyyy')}
          </motion.div>
        </motion.div>

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
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
          >
            <Plus size={24} />
            Add New Habit
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsReviewModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
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
              className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Star size={48} className="text-white" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">No habits yet!</h3>
            <p className="text-white/80 mb-6">Start by adding your first habit to track your progress.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAddModalOpen(true)}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
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

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-8 left-8 z-40 w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-200 flex items-center justify-center"
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