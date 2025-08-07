import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import HabitCard from './HabitCard';
import { Habit, HabitEntry } from '../types';

interface SortableHabitCardProps {
  habit: Habit;
  entry?: HabitEntry | null;
  onRatingChange: (habitId: string, rating: number) => void;
  onEdit?: (habit: Habit) => void;
  onDelete?: (habitId: string) => void;
  currentDate?: string;
  index: number;
}

const SortableHabitCard: React.FC<SortableHabitCardProps> = ({
  habit,
  entry,
  onRatingChange,
  onEdit,
  onDelete,
  currentDate,
  index
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'z-50 opacity-50 scale-105' : ''} cursor-grab active:cursor-grabbing transition-all duration-200`}
      {...attributes}
      {...listeners}
    >
      <HabitCard
        habit={habit}
        entry={entry}
        onRatingChange={onRatingChange}
        onEdit={onEdit}
        onDelete={onDelete}
        currentDate={currentDate}
      />
    </div>
  );
};

export default SortableHabitCard; 