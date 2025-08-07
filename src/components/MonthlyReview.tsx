import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area } from 'recharts';
import { TrendingUp, Calendar, Star, Target } from 'lucide-react';
import { MonthlyStats, ChartData } from '../types';

interface MonthlyReviewProps {
  isOpen: boolean;
  stats: MonthlyStats[];
  allTimeStats: MonthlyStats[];
  onClose: () => void;
}

const MonthlyReview: React.FC<MonthlyReviewProps> = ({ isOpen, stats, allTimeStats, onClose }) => {
  const [viewMode, setViewMode] = useState<'month' | 'allTime'>('month');
  const [chartType, setChartType] = useState<'candlestick' | 'top10' | 'summary'>('top10');
  const [sortBy, setSortBy] = useState<'performance' | 'name' | 'completion'>('performance');
  
  const currentStats = viewMode === 'month' ? stats : allTimeStats;
  // Sort and filter data based on chart type
  const sortedStats = [...currentStats].sort((a, b) => {
    switch (sortBy) {
      case 'performance':
        return b.averageStars - a.averageStars;
      case 'completion':
        return b.completionRate - a.completionRate;
      case 'name':
        return a.habitName.localeCompare(b.habitName);
      default:
        return 0;
    }
  });

  const displayStats = chartType === 'top10' ? sortedStats.slice(0, 10) : sortedStats;

  const chartData: ChartData[] = displayStats.map(stat => ({
    name: stat.habitName,
    completed: stat.completedDays,
    missed: stat.totalDays - stat.completedDays,
    averageStars: Math.round(stat.averageStars * 100) / 100,
    color: getHabitColor(stat.habitId),
    // Candlestick data
    high: stat.completedDays,
    low: 0,
    open: Math.max(0, stat.completedDays - 1),
    close: stat.completedDays,
    volume: stat.totalDays
  }));

  const pieData = currentStats.map(stat => ({
    name: stat.habitName,
    value: stat.completionRate,
    color: getHabitColor(stat.habitId)
  }));

  const topHabits = [...currentStats].sort((a, b) => b.averageStars - a.averageStars).slice(0, 3);
  
  // Filter habits that need attention based on recent performance
  const needsImprovement = currentStats
    .filter(stat => {
      // Get the last 3 days of entries for this habit
      const habitEntries = viewMode === 'month' 
        ? stats.find(s => s.habitId === stat.habitId)?.recentEntries || []
        : allTimeStats.find(s => s.habitId === stat.habitId)?.recentEntries || [];
      
      // Check if the habit has been missing stars for 3 consecutive days
      const lastThreeDays = habitEntries.slice(-3);
      const hasThreeConsecutiveMisses = lastThreeDays.length === 3 && 
        lastThreeDays.every(entry => entry.stars === 0);
      
      // Check if the habit has been missing stars for 2 consecutive days (warning state)
      const lastTwoDays = habitEntries.slice(-2);
      const hasTwoConsecutiveMisses = lastTwoDays.length === 2 && 
        lastTwoDays.every(entry => entry.stars === 0);
      
      return hasTwoConsecutiveMisses && !hasThreeConsecutiveMisses;
    })
    .sort((a, b) => a.averageStars - b.averageStars)
    .slice(0, 3);

  function getHabitColor(habitId: string): string {
    const colors = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6'];
    const index = parseInt(habitId) % colors.length;
    return colors[index];
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-200">
          <p className="font-bold text-gray-800">{label}</p>
          <p className="text-green-600">High: {data.high} stars</p>
          <p className="text-blue-600">Open: {data.open} stars</p>
          <p className="text-purple-600">Close: {data.close} stars</p>
          <p className="text-red-600">Low: {data.low} stars</p>
          <p className="text-yellow-600">Total Days: {data.volume} days</p>
          <p className="text-gray-600">Success Rate: {((data.close / data.volume) * 100).toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  if (!isOpen) return null;

  return (
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
        className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <TrendingUp size={24} />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold">Habit Review</h2>
                <p className="text-white/80">
                  {viewMode === 'month' ? 'Your habit progress this month' : 'Your all-time habit progress'}
                </p>
              </div>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/20 rounded-2xl px-3 py-2">
                <span className="text-white text-sm font-medium">View:</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1 rounded-xl text-sm font-medium transition-all ${
                    viewMode === 'month'
                      ? 'bg-white text-purple-600 shadow-lg'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  This Month
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('allTime')}
                  className={`px-3 py-1 rounded-xl text-sm font-medium transition-all ${
                    viewMode === 'allTime'
                      ? 'bg-white text-purple-600 shadow-lg'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  All Time
                </motion.button>
              </div>
              
              {/* Chart Type Toggle */}
              <div className="flex items-center gap-2 bg-white/20 rounded-2xl px-3 py-2">
                <span className="text-white text-sm font-medium">Chart:</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setChartType('top10')}
                  className={`px-3 py-1 rounded-xl text-sm font-medium transition-all ${
                    chartType === 'top10'
                      ? 'bg-white text-purple-600 shadow-lg'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Top 10
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setChartType('candlestick')}
                  className={`px-3 py-1 rounded-xl text-sm font-medium transition-all ${
                    chartType === 'candlestick'
                      ? 'bg-white text-purple-600 shadow-lg'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  All Habits
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setChartType('summary')}
                  className={`px-3 py-1 rounded-xl text-sm font-medium transition-all ${
                    chartType === 'summary'
                      ? 'bg-white text-purple-600 shadow-lg'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Summary
                </motion.button>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              ✕
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Charts */}
            <div className="space-y-6">
              {/* Dynamic Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-3xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Calendar size={20} />
                    {chartType === 'top10' && 'Top 10 Performing Habits'}
                    {chartType === 'candlestick' && 'All Habits Performance'}
                    {chartType === 'summary' && 'Habit Performance Summary'}
                  </h3>
                  
                  {/* Sort Controls */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Sort by:</span>
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-1 rounded-lg border border-gray-300 text-sm bg-white"
                    >
                      <option value="performance">Performance</option>
                      <option value="completion">Completion Rate</option>
                      <option value="name">Name</option>
                    </select>
                  </div>
                </div>

                {chartType === 'summary' ? (
                  // Summary view - better for 30+ habits
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentStats.map((stat, index) => (
                      <motion.div
                        key={stat.habitId}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-800 truncate">{stat.habitName}</h4>
                          <span className="text-sm text-gray-500">#{index + 1}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Stars:</span>
                            <span className="font-semibold text-green-600">{stat.completedDays} ⭐</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Rate:</span>
                            <span className="font-semibold text-blue-600">{stat.completionRate.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all"
                              style={{ width: `${stat.completionRate}%` }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  // Candlestick chart for Top 10 or All Habits
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: chartType === 'candlestick' ? 10 : 12, fill: '#6b7280' }}
                        axisLine={{ stroke: '#d1d5db' }}
                        angle={chartType === 'candlestick' ? -45 : 0}
                        textAnchor={chartType === 'candlestick' ? 'end' : 'middle'}
                        height={chartType === 'candlestick' ? 80 : 60}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        axisLine={{ stroke: '#d1d5db' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      
                      {/* Candlestick body - main performance bar */}
                      <Bar 
                        dataKey="close" 
                        fill="#10b981" 
                        radius={[2, 2, 0, 0]}
                        stroke="#059669"
                        strokeWidth={1}
                      />
                      
                      {/* High-Low range indicator */}
                      <Area
                        dataKey="high"
                        fill="none"
                        stroke="#059669"
                        strokeWidth={2}
                        strokeDasharray="3 3"
                      />
                      
                      {/* Volume indicator (total days) */}
                      <Bar 
                        dataKey="volume" 
                        fill="rgba(59, 130, 246, 0.1)" 
                        radius={[0, 0, 2, 2]}
                        stroke="#3b82f6"
                        strokeWidth={1}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </motion.div>

              {/* Pie Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-50 rounded-3xl p-6"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Target size={20} />
                  Success Rate Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Stats and Insights */}
            <div className="space-y-6">
              {/* Top Performers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-6"
              >
                <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                  <Star size={20} />
                  Top Performing Habits
                </h3>
                <div className="space-y-3">
                  {topHabits.map((habit, index) => (
                    <motion.div
                      key={habit.habitId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-white rounded-2xl shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{habit.habitName}</p>
                          <p className="text-sm text-gray-600">{habit.completedDays}/{habit.totalDays} star days</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{habit.completedDays} ⭐</p>
                        <p className="text-xs text-gray-500">{habit.completionRate.toFixed(1)}% success</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Needs Improvement */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-6"
              >
                <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
                  <Target size={20} />
                  {needsImprovement.length > 0 
                    ? 'Habits Missing Stars (2+ Days)' 
                    : 'All Habits on Track! 🎉'
                  }
                </h3>
                <div className="space-y-3">
                  {needsImprovement.length > 0 ? (
                    needsImprovement.map((habit, index) => (
                      <motion.div
                        key={habit.habitId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-white rounded-2xl shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{habit.habitName}</p>
                            <p className="text-sm text-gray-600">{habit.completedDays}/{habit.totalDays} star days</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-600">{habit.completedDays} ⭐</p>
                          <p className="text-xs text-gray-500">{habit.completionRate.toFixed(1)}% success</p>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-2xl">🎉</span>
                      </div>
                      <p className="text-gray-600 font-medium">Great job! All your habits are on track.</p>
                      <p className="text-gray-500 text-sm mt-1">Keep up the amazing work!</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Overall Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-6"
              >
                <h3 className="text-lg font-bold text-purple-800 mb-4">Monthly Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white rounded-2xl">
                    <p className="text-2xl font-bold text-purple-600">
                      {currentStats.reduce((sum, stat) => sum + stat.completedDays, 0)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {viewMode === 'month' ? 'Total Star Days' : 'Total All-Time Stars'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-2xl">
                    <p className="text-2xl font-bold text-purple-600">
                      {currentStats.length > 0 
                        ? (currentStats.reduce((sum, stat) => sum + stat.completionRate, 0) / currentStats.length).toFixed(1)
                        : '0'
                      }%
                    </p>
                    <p className="text-sm text-gray-600">Average Success Rate</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MonthlyReview; 