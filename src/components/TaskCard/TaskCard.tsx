'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, CheckCircle, Circle } from 'lucide-react';
import { Task } from '@/lib/types';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (taskId: string | number) => void;
  onDelete: (taskId: string | number) => void;
  onEdit: (task: Task) => void;
}

// Function to get category color
const getCategoryColor = (category: string | undefined) => {
  if (!category) return 'bg-gray-800 border-gray-600 text-gray-300';

  switch (category) {
    case 'Design':
      return 'bg-cyan-500/10 border-cyan-400/30 text-cyan-400';
    case 'Work':
      return 'bg-blue-500/10 border-blue-400/30 text-blue-400';
    case 'Personal':
      return 'bg-indigo-500/10 border-indigo-400/30 text-indigo-400';
    case 'Urgent':
      return 'bg-red-500 border-red-400/50 text-white font-bold';
    default:
      return 'bg-gray-800 border-gray-600 text-gray-300';
  }
};

// Function to get priority color
const getPriorityColor = (priority: string | undefined) => {
  if (!priority) return 'bg-gray-800 border-gray-600 text-gray-300';

  switch (priority) {
    case 'low':
      return 'bg-green-500/10 border-green-400/30 text-green-400';
    case 'medium':
      return 'bg-yellow-500/10 border-yellow-400/30 text-yellow-400';
    case 'high':
      return 'bg-red-500/10 border-red-400/30 text-red-400';
    default:
      return 'bg-gray-800 border-gray-600 text-gray-300';
  }
};

// Function to render tags
const renderTags = (tags: string | undefined) => {
  if (!tags) return null;

  // Split tags by comma and trim whitespace
  const tagList = tags.split(',').map(tag => tag.trim()).filter(tag => tag);

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {tagList.map((tag, index) => (
        <span
          key={index}
          className="text-xs bg-gray-800 border border-gray-600 text-gray-300 px-2 py-1 rounded-full"
        >
          {tag}
        </span>
      ))}
    </div>
  );
};

export const TaskCard = ({ task, onToggleComplete, onDelete, onEdit }: TaskCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // Track deletion state

  // Handle delete with immediate feedback
  const handleDelete = async () => {
    setIsDeleting(true); // Show immediate feedback

    try {
      await onDelete(task.id); // Call the parent's delete function
      // Card will be hidden by parent component after successful deletion
    } catch (error) {
      console.error("Error deleting task:", error);
      setIsDeleting(false); // Revert to normal state if there's an error
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -5,
        boxShadow: "0 10px 30px -10px rgba(6, 182, 212, 0.3)"
      }}
      whileTap={{ scale: 0.98 }}
      className="bg-gray-800 p-5 rounded-lg shadow-sm border-2 border-cyan-400/30 hover:border-cyan-400/50 transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start">
        {/* Checkbox on left */}
        <button
          onClick={() => onToggleComplete(task.id)}
          className="mt-1 mr-3 focus:outline-none"
          aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
        >
          {task.completed ? (
            <CheckCircle className="w-5 h-5 text-cyan-400" fill="currentColor" />
          ) : (
            <Circle className="w-5 h-5 text-gray-500" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-lg ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className={`text-sm mt-1 ${task.completed ? 'text-gray-600' : 'text-gray-400'}`}>
              {task.description}
            </p>
          )}

          {/* Due date, priority, tags and category info */}
          <div className="flex flex-wrap gap-2 mt-2">
            {(task.dueDate || task.due_date) && (
              <span className="text-xs bg-gray-800 border border-gray-600 text-gray-300 px-2 py-1 rounded-full">
                {(() => {
                  const dateValue = task.dueDate || task.due_date;
                  if (dateValue) {
                    // Fix: Ensure the browser treats this as UTC so it converts to Local Time
                    const safeDateString = typeof dateValue === 'string' && dateValue.endsWith('Z') ? dateValue : `${dateValue}Z`;

                    const date = new Date(safeDateString);

                    // Double Check: If the date is invalid, fallback to original string
                    if (isNaN(date.getTime())) return typeof dateValue === 'string' ? dateValue : "Invalid Date";

                    return date.toLocaleString('en-US', {
                      month: 'numeric',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    });
                  }
                  return "No Due Date";
                })()}
              </span>
            )}
            {task.priority && (
              <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            )}
            {task.category && (
              <span className={`text-xs px-2 py-1 rounded-full border ${getCategoryColor(task.category)}`}>
                {task.category}
              </span>
            )}
            {renderTags(task.tags)}
          </div>

          {/* Status Badge */}
          {task.completed && (
            <span className="mt-2 inline-block bg-cyan-500/20 border border-cyan-400/50 text-cyan-400 px-3 py-1 rounded-full text-xs font-bold">
              Completed
            </span>
          )}
        </div>

        {/* Action buttons on right - visible on hover */}
        <div className={`flex space-x-2 ml-2 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-gray-400 hover:text-cyan-400 rounded-lg hover:bg-cyan-500/10 transition-colors"
            aria-label="Edit task"
            disabled={isDeleting}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className={`p-2 rounded-lg transition-colors ${isDeleting ? 'text-gray-600' : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'}`}
            aria-label="Delete task"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <div className="flex items-center">
                <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};