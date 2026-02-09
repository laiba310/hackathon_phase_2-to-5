'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Task } from '@/lib/types';
import { Button } from '@/components/Button/Button';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: Omit<Task, 'id' | 'completed' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Partial<Task>;
}

export const TaskForm = ({ isOpen, onClose, onSubmit, initialData }: TaskFormProps) => {
  // Helper function to convert date to local format for datetime input
  const formatDateForInput = (date: Date | string | null | undefined): string => {
    if (!date) return '';

    const dateObj = new Date(date);

    // Get timezone offset in milliseconds
    const offset = dateObj.getTimezoneOffset() * 60000;
    // Create a new date adjusted for local timezone
    const localDate = new Date(dateObj.getTime() - offset);
    // Format as YYYY-MM-DDTHH:mm for datetime-local input
    return localDate.toISOString().slice(0, 16);
  };

  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [dueDate, setDueDate] = useState<string>(initialData?.dueDate ? formatDateForInput(initialData.dueDate) : '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(initialData?.priority || 'medium');
  const [tags, setTags] = useState(initialData?.tags || '');
  const [isRecurring, setIsRecurring] = useState(initialData?.is_recurring || false);
  const [recurringRule, setRecurringRule] = useState(initialData?.recurring_rule || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  // Update form fields when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setDueDate(initialData.dueDate ? formatDateForInput(initialData.dueDate) : '');
      setCategory(initialData.category || '');
      setPriority(initialData.priority || 'medium');
      setTags(initialData.tags || '');
      setIsRecurring(initialData.is_recurring || false);
      setRecurringRule(initialData.recurring_rule || '');
    } else {
      // Reset form when no initial data is provided
      setTitle('');
      setDescription('');
      setDueDate('');
      setCategory('');
      setPriority('medium');
      setTags('');
      setIsRecurring(false);
      setRecurringRule('');
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (title.length < 1 || title.length > 200) {
      setError('Title must be between 1 and 200 characters');
      return;
    }

    setError('');

    // Set loading state
    setIsLoading(true);

    // Create payload with backend field naming (due_date)
    const payload: any = {
      title: title.trim(),
      description: description.trim(),
      // Send null for due_date if not provided, not empty string
      // Format date to preserve user's local time without timezone conversion
      due_date: dueDate && dueDate.trim() !== "" ? new Date(dueDate).toISOString().slice(0, 19).replace('T', ' ') : null,
      // Ensure category defaults to "Personal" if not provided
      category: category || "Personal",
      priority: priority,
      tags: tags,
      is_recurring: isRecurring,
      recurring_rule: isRecurring ? recurringRule : null
    };

    // Explicitly log the payload before sending as required by the fix
    console.log("PAYLOAD SENDING:", payload);

    try {
      // Pass the properly formatted payload to the parent component
      await onSubmit(payload as Omit<Task, 'id' | 'completed' | 'createdAt' | 'updatedAt'>);

      // Reset form after submission
      setTitle('');
      setDescription('');
      setDueDate('');
      setCategory('');
      setPriority('medium');
      setTags('');
      setIsRecurring(false);
      setRecurringRule('');

      // Force close the modal immediately after success
      onClose();

      // Force refresh the page
      window.location.reload();
    } catch (error) {
      console.error("Error saving task:", error);
      setError('Failed to save task. Please try again.');
      // Reset loading state if there's an error
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    // Reset form when closing
    setTitle(initialData?.title || '');
    setDescription(initialData?.description || '');
    setDueDate(initialData?.dueDate ? formatDateForInput(initialData.dueDate) : '');
    setCategory(initialData?.category || '');
    setPriority(initialData?.priority || 'medium');
    setTags(initialData?.tags || '');
    setIsRecurring(initialData?.is_recurring || false);
    setRecurringRule(initialData?.recurring_rule || '');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-sm">
      <div className="bg-gray-800 border-2 border-cyan-400/50 rounded-lg shadow-2xl shadow-cyan-500/20 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b-2 border-cyan-400/30">
          <h2 className="text-lg font-bold text-white">
            {initialData ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-cyan-400 transition-colors"
            aria-label="Close form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-400/50 text-red-400 rounded-lg text-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-900 text-white border-2 border-gray-600 p-3 rounded-lg focus:ring-0 focus:border-cyan-400 transition-all"
              placeholder="Enter task title"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">Between 1 and 200 characters</p>
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-900 text-white border-2 border-gray-600 p-3 rounded-lg focus:ring-0 focus:border-cyan-400 transition-all"
              placeholder="Enter task description (optional)"
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="dueDate" className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
              Due Date & Time
            </label>
            <input
              type="datetime-local"
              id="dueDate"
              value={dueDate || ""}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-gray-900 text-white border-2 border-gray-600 p-3 rounded-lg focus:ring-0 focus:border-cyan-400 transition-all"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
              Priority
            </label>
            <div className="flex flex-wrap gap-2">
              {(['low', 'medium', 'high'] as const).map((prio) => (
                <label
                  key={prio}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm cursor-pointer border-2 transition-all ${
                    priority === prio
                      ? prio === 'low' ? 'bg-green-500/20 border-green-400/50 text-green-400'
                        : prio === 'medium' ? 'bg-yellow-500/20 border-yellow-400/50 text-yellow-400'
                        : 'bg-red-500/20 border-red-400/50 text-red-400' // high
                      : 'bg-gray-900 border-gray-600 text-gray-400 hover:border-cyan-400/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={prio}
                    checked={priority === prio}
                    onChange={() => setPriority(prio)}
                    className="sr-only"
                  />
                  {prio.charAt(0).toUpperCase() + prio.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="tags" className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
              Tags
            </label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-gray-900 text-white border-2 border-gray-600 p-3 rounded-lg focus:ring-0 focus:border-cyan-400 transition-all"
              placeholder="Enter tags separated by commas (e.g. work, urgent)"
            />
          </div>

          <div className="mb-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="form-checkbox h-4 w-4 text-cyan-400 focus:ring-cyan-400 border-gray-600 bg-gray-900"
              />
              <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Recurring Task</span>
            </label>
          </div>

          {isRecurring && (
            <div className="mb-4">
              <label htmlFor="recurringRule" className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                Recurring Rule
              </label>
              <input
                type="text"
                id="recurringRule"
                value={recurringRule}
                onChange={(e) => setRecurringRule(e.target.value)}
                className="w-full bg-gray-900 text-white border-2 border-gray-600 p-3 rounded-lg focus:ring-0 focus:border-cyan-400 transition-all"
                placeholder="e.g. daily, weekly, monthly"
              />
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {['Design', 'Work', 'Personal', 'Urgent'].map((cat) => (
                <label
                  key={cat}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm cursor-pointer border-2 transition-all ${
                    category === cat
                      ? cat === 'Design' ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-400'
                        : cat === 'Work' ? 'bg-blue-500/20 border-blue-400/50 text-blue-400'
                        : cat === 'Personal' ? 'bg-indigo-500/20 border-indigo-400/50 text-indigo-400'
                        : 'bg-red-500 border-red-400 text-white' // Urgent
                      : 'bg-gray-900 border-gray-600 text-gray-400 hover:border-cyan-400/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat}
                    checked={category === cat}
                    onChange={() => setCategory(cat)}
                    className="sr-only"
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t-2 border-cyan-400/30">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-6 py-3 bg-gray-900 border-2 border-gray-600 text-gray-300 rounded-lg hover:border-cyan-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-3 rounded-lg font-bold transition-all ${
                isLoading
                  ? 'bg-gray-800 border-2 border-gray-600 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-95'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                initialData ? 'Save Changes' : 'Save Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};