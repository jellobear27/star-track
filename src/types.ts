export interface Habit {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  createdAt: Date;
}

export interface HabitEntry {
  id: string;
  habitId: string;
  date: string;
  stars: number;
  notes?: string;
}

export interface MonthlyStats {
  habitId: string;
  habitName: string;
  totalDays: number;
  completedDays: number;
  averageStars: number;
  totalStars: number;
  completionRate: number;
  recentEntries: HabitEntry[];
}

export interface ChartData {
  name: string;
  completed: number;
  missed: number;
  averageStars: number;
  color: string;
} 