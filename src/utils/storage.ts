import { Habit, HabitEntry } from '../types';

const HABITS_KEY = 'habit-tracker-habits';
const ENTRIES_KEY = 'habit-tracker-entries';

export const storage = {
  // Habits
  getHabits: (): Habit[] => {
    try {
      const habits = localStorage.getItem(HABITS_KEY);
      return habits ? JSON.parse(habits).map((habit: any) => ({
        ...habit,
        createdAt: new Date(habit.createdAt)
      })) : [];
    } catch {
      return [];
    }
  },

  saveHabits: (habits: Habit[]): void => {
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  },

  // Entries
  getEntries: (): HabitEntry[] => {
    try {
      const entries = localStorage.getItem(ENTRIES_KEY);
      return entries ? JSON.parse(entries) : [];
    } catch {
      return [];
    }
  },

  saveEntries: (entries: HabitEntry[]): void => {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  },

  // Helper functions
  getEntriesForDate: (date: string): HabitEntry[] => {
    const entries = storage.getEntries();
    return entries.filter(entry => entry.date === date);
  },

  getEntriesForHabit: (habitId: string): HabitEntry[] => {
    const entries = storage.getEntries();
    return entries.filter(entry => entry.habitId === habitId);
  },

  getEntryForHabitAndDate: (habitId: string, date: string): HabitEntry | null => {
    const entries = storage.getEntries();
    return entries.find(entry => entry.habitId === habitId && entry.date === date) || null;
  }
}; 