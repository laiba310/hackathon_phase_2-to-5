// frontend/src/app/dashboard/page.tsx
"use client";

import { useEffect, useState, useRef, JSX } from "react";
import { useRouter } from "next/navigation";
import { Plus, Bell, BellOff } from "lucide-react"; // optional; remove if not installed
import apiClient from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/Button/Button";
import { TaskCard } from "@/components/TaskCard/TaskCard";
import { TaskForm } from "@/components/TaskForm/TaskForm";
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from "@/lib/types";
import StatsOverview from "@/components/Dashboard/StatsOverview";

export default function DashboardPage(): JSX.Element {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedPriority, setSelectedPriority] = useState<string>("All"); // New: Filter by priority
  const [sortBy, setSortBy] = useState('newest'); // Default: Newest created
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const notifiedTasksRef = useRef<Map<number, { notifiedAt15: boolean, notifiedAt10: boolean, notifiedAt5: boolean, notifiedAt2: boolean, soundPlayedAt15: boolean, soundPlayedAt10: boolean, soundPlayedAt5: boolean, soundPlayedAt2: boolean }>>(new Map());
  const reminderIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // State to track which alarms are playing
  const [playingAlarms, setPlayingAlarms] = useState<Set<number>>(new Set());

  // Function to play notification sound
  const playNotificationSound = (taskId: number) => {
    // Check if this task already has an alarm playing
    if (playingAlarms.has(taskId)) {
      return; // Don't start another alarm for the same task
    }

    try {
      // Create audio context and generate a beeping alarm sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Create oscillators for the alarm sound
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Set different frequencies for a more noticeable sound
      oscillator1.type = 'sine';
      oscillator1.frequency.value = 1000; // Higher frequency
      oscillator2.type = 'sine';
      oscillator2.frequency.value = 1300; // Higher frequency for harmony

      // Create a beeping pattern by modulating the gain
      const now = audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now); // Start silent

      // Create a beeping pattern: beep for 0.3s, pause for 0.3s
      let time = now;
      for (let i = 0; i < 100; i++) { // Repeat for a long time
        // Beep phase (0.3 seconds)
        gainNode.gain.setValueAtTime(0.3, time);
        gainNode.gain.setValueAtTime(0.3, time + 0.3);
        // Pause phase (0.3 seconds)
        gainNode.gain.setValueAtTime(0, time + 0.3);
        gainNode.gain.setValueAtTime(0, time + 0.6);
        time += 0.6; // Next cycle
      }

      // Start the oscillators
      oscillator1.start();
      oscillator2.start();

      // Add the task ID to the playing alarms set
      setPlayingAlarms(prev => new Set(prev).add(taskId));

      // Store references to stop the alarm later
      (window as any).alarmRefs = (window as any).alarmRefs || {};
      (window as any).alarmRefs[taskId] = {
        audioContext,
        oscillators: [oscillator1, oscillator2],
        gainNode,
        stop: () => {
          try {
            // Stop the oscillators
            oscillator1.stop();
            oscillator2.stop();
          } catch (e) {
            // Ignore errors if oscillators are already stopped
          }
          // Remove from playing alarms
          setPlayingAlarms(prev => {
            const newSet = new Set(prev);
            newSet.delete(taskId);
            return newSet;
          });
        }
      };
    } catch (e) {
      console.log("Audio play failed:", e);
    }
  };

  // Function to stop an alarm for a specific task
  const stopAlarm = (taskId: number) => {
    const alarmRef = (window as any).alarmRefs?.[taskId];
    if (alarmRef) {
      alarmRef.stop();
      delete (window as any).alarmRefs[taskId];
    }
  };
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  // Check auth status on mount
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchTasks();
    }
  }, [user, authLoading, router]);

  // Fetch tasks when filters change
  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, selectedPriority, searchQuery, sortBy]);

  // Request notification permission and set up reminder system
  useEffect(() => {
    const setupNotifications = async () => {
      if (!("Notification" in window)) {
        console.log("Browser does not support notifications");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
        console.log("Notification permission granted");
      } else {
        console.log("Notification permission denied or dismissed");
      }
    };

    setupNotifications();

    // Clean up interval on unmount
    return () => {
      if (reminderIntervalRef.current) {
        clearInterval(reminderIntervalRef.current);
      }
    };
  }, []);

  // Set up reminder checking interval
  useEffect(() => {
    if (notificationsEnabled && tasks.length > 0) {
      // Clear any existing interval
      if (reminderIntervalRef.current) {
        clearInterval(reminderIntervalRef.current);
      }

      // Set up new interval to check reminders every 10 seconds for faster testing
      reminderIntervalRef.current = setInterval(() => {
        checkReminders();
      }, 10000); // 10 seconds

      // Run check immediately on mount
      checkReminders();
    }

    return () => {
      if (reminderIntervalRef.current) {
        clearInterval(reminderIntervalRef.current);
      }

      // Stop all playing alarms when component unmounts
      playingAlarms.forEach(taskId => {
        stopAlarm(taskId);
      });
    };
  }, [notificationsEnabled, tasks, playingAlarms]);

  // Function to check for upcoming tasks and send notifications
  const checkReminders = () => {
    if (!notificationsEnabled) return;

    const now = new Date().getTime();

    tasks.forEach(task => {
      // Skip if task is completed or doesn't have a due date
      if (task.completed || !task.due_date) return;

      // Safe parsing logic - treat the string as UTC to convert to user's local time
      const rawDate = task.due_date;
      const safeDate = typeof rawDate === 'string' && rawDate.endsWith('Z') ? rawDate : `${rawDate}Z`;
      const taskTime = new Date(safeDate).getTime();

      // Calculate the difference in minutes
      const diffInMinutes = (taskTime - now) / 1000 / 60;

      // Check for multiple reminder intervals: 15, 10, and 5 minutes before due
      if (diffInMinutes > 0) {
        // Check if we've already notified about this task at specific intervals
        const taskId = Number(task.id);
        const notifiedTask = notifiedTasksRef.current.get(taskId) || { notifiedAt15: false, notifiedAt10: false, notifiedAt5: false, notifiedAt2: false, soundPlayedAt15: false, soundPlayedAt10: false, soundPlayedAt5: false, soundPlayedAt2: false };

        // Send notification 15 minutes before due (when between 14:01 and 15:00 minutes remaining)
        if (diffInMinutes <= 15 && diffInMinutes > 14 && !notifiedTask.notifiedAt15) {
          notifiedTask.notifiedAt15 = true;
          notifiedTask.soundPlayedAt15 = true;
          notifiedTasksRef.current.set(taskId, notifiedTask);

          // Create notification with event to stop alarm when closed
          const notification = new Notification(`Reminder: ${task.title}`, {
            body: "This task is due in 15 minutes!",
            icon: "/favicon.ico",
            requireInteraction: true
          });

          // Play notification sound that loops until stopped
          playNotificationSound(taskId);

          // Stop alarm when notification is closed by user
          notification.onclose = () => {
            stopAlarm(taskId);
          };
        }

        // Send notification 10 minutes before due (when between 9:01 and 10:00 minutes remaining)
        if (diffInMinutes <= 10 && diffInMinutes > 9 && !notifiedTask.notifiedAt10) {
          notifiedTask.notifiedAt10 = true;
          notifiedTask.soundPlayedAt10 = true;
          notifiedTasksRef.current.set(taskId, notifiedTask);

          // Create notification with event to stop alarm when closed
          const notification = new Notification(`Reminder: ${task.title}`, {
            body: "This task is due in 10 minutes!",
            icon: "/favicon.ico",
            requireInteraction: true
          });

          // Play notification sound that loops until stopped
          playNotificationSound(taskId);

          // Stop alarm when notification is closed by user
          notification.onclose = () => {
            stopAlarm(taskId);
          };
        }

        // Send notification 5 minutes before due (when between 4:01 and 5:00 minutes remaining)
        if (diffInMinutes <= 5 && diffInMinutes > 4 && !notifiedTask.notifiedAt5) {
          notifiedTask.notifiedAt5 = true;
          notifiedTask.soundPlayedAt5 = true;
          notifiedTasksRef.current.set(taskId, notifiedTask);

          // Create notification with event to stop alarm when closed
          const notification = new Notification(`Reminder: ${task.title}`, {
            body: "This task is due in 5 minutes!",
            icon: "/favicon.ico",
            requireInteraction: true
          });

          // Play notification sound that loops until stopped
          playNotificationSound(taskId);

          // Stop alarm when notification is closed by user
          notification.onclose = () => {
            stopAlarm(taskId);
          };
        }

        // Send notification 2 minutes before due (when between 1:01 and 2:00 minutes remaining)
        if (diffInMinutes <= 2 && diffInMinutes > 1 && !notifiedTask.notifiedAt2) {
          notifiedTask.notifiedAt2 = true;
          notifiedTask.soundPlayedAt2 = true;
          notifiedTasksRef.current.set(taskId, notifiedTask);

          // Create notification with event to stop alarm when closed
          const notification = new Notification(`Reminder: ${task.title}`, {
            body: "This task is due in 2 minutes!",
            icon: "/favicon.ico",
            requireInteraction: true
          });

          // Play notification sound that loops until stopped
          playNotificationSound(taskId);

          // Stop alarm when notification is closed by user
          notification.onclose = () => {
            stopAlarm(taskId);
          };
        }
      }
    });
  };

  const fetchTasks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Build query parameters based on current filters
      const queryParams = new URLSearchParams();
      if (selectedPriority !== "All") {
        queryParams.append('priority', selectedPriority);
      }
      if (searchQuery) {
        queryParams.append('search', searchQuery);
      }
      if (sortBy === 'priority') {
        queryParams.append('sort_by', 'priority');
      } else if (sortBy.startsWith('date')) {
        queryParams.append('sort_by', 'due_date');
      }

      const queryString = queryParams.toString();
      const url = `/api/tasks${queryString ? '?' + queryString : ''}`;

      const res = await apiClient.get(url);
      setTasks(res.data ?? []);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching tasks:", err);
      // The API client's response interceptor will handle 401 errors
      if (err.response?.status === 401) {
        // Token is invalid or expired, logout the user
        router.push("/login");
      } else {
        setError(err.message || "Failed to fetch tasks");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (taskData: any) => {
    if (!user) {
      setError("User not authenticated");
      return;
    }
    try {
      // Ensure due_date field is properly named for backend compatibility
      const formattedTaskData = {
        ...taskData
      };

      const res = await apiClient.post('/api/tasks', formattedTaskData);
      setTasks((prev) => [...prev, res.data]);
    } catch (err: any) {
      console.error("Error adding task:", err);
      setError(err.message || "Failed to add task");
    }
  };

  const handleUpdateTask = async (taskData: any) => {
    if (!editingTask || !user) return;
    try {
      const res = await apiClient.put(`/api/tasks/${editingTask.id}`, taskData);
      setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? res.data : t)));
      setEditingTask(null);
    } catch (err: any) {
      console.error("Error updating task:", err);
      setError(err.message || "Failed to update task");
    }
  };

  const toggleTaskCompletion = async (taskId: number) => {
    if (!user) return;
    try {
      // optimistic update
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)));
      const res = await apiClient.patch(`/api/tasks/${taskId}/complete`);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? res.data : t)));
    } catch (err: any) {
      // revert
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)));
      console.error("Error updating task completion:", err);
      setError(err.message || "Failed to update task completion");
    }
  };

  const deleteTask = async (taskId: number) => {
    if (!user) return;
    try {
      await apiClient.delete(`/api/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err: any) {
      console.error("Error deleting task:", err);
      setError(err.message || "Failed to delete task");
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-8 h-8 bg-cyan-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-6 text-lg font-bold text-white">Loading your tasks...</p>
          <div className="mt-4 flex space-x-2">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-black text-white pl-16 md:pl-0">My Tasks</h1>
          {notificationsEnabled ? (
            <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 border border-green-500/30 px-3 py-1 rounded-lg" title="Notifications Active">
              <Bell className="w-5 h-5" />
              <span>Notifications Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-800 border border-gray-600 px-3 py-1 rounded-lg" title="Notifications Disabled">
              <BellOff className="w-5 h-5" />
              <span>Notifications Disabled</span>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            onClick={() => {
              setEditingTask(null);
              setShowTaskForm(true);
            }}
            className="w-full sm:w-auto gradient-red text-white font-bold px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-brand-red/50 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <span className="flex items-center gap-2 justify-center">
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </span>
          </button>
        </div>
      </div>

           {/* Stats Overview */}
      <StatsOverview tasks={tasks} />

      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full bg-gray-800 text-white border-2 border-gray-600 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-0 focus:border-cyan-400 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <div className="relative w-full md:w-72">
          <select
            className="w-full bg-gray-800 text-white border-2 border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-0 focus:border-cyan-400 hover:border-cyan-400/50 appearance-none pr-10 truncate transition-all"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
            <option value="Urgent">Urgent</option>
            <option value="Design">Design</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <select
            className="w-full bg-gray-800 text-white border-2 border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-0 focus:border-cyan-400 hover:border-cyan-400/50 appearance-none pr-10 truncate transition-all"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <select
            className="w-full bg-gray-800 text-white border-2 border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-0 focus:border-cyan-400 hover:border-cyan-400/50 appearance-none pr-10 truncate transition-all"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest Created</option>
            <option value="date_asc">Due Date: Soonest</option>
            <option value="date_desc">Due Date: Latest</option>
            <option value="priority">Priority: High to Low</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border-2 border-red-400/50 text-red-300 rounded-lg flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
          {error}
        </div>
      )}

      {/* Filter and sort the tasks based on search query, selected category, and sort option */}
      {(() => {
        const filteredTasks = tasks.filter(task => {
          const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                               (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
          const matchesCategory = selectedCategory === "All" || task.category === selectedCategory;
          const matchesPriority = selectedPriority === "All" || task.priority === selectedPriority;
          return matchesSearch && matchesCategory && matchesPriority;
        });

        // Define priority order for sorting
        const priorityOrder: { [key: string]: number } = { "Urgent": 3, "Work": 2, "Personal": 1, "Design": 1 };
        const priorityLevel: { [key: string]: number } = { "high": 3, "medium": 2, "low": 1 };

        // Sort the filtered tasks based on the selected sort option
        const sortedTasks = [...filteredTasks].sort((a, b) => {
          if (sortBy === 'date_asc') {
            // Sort by due date: Soonest first
            if (!a.due_date) return 1; // Tasks without due date go last
            if (!b.due_date) return -1;
            return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          }
          if (sortBy === 'date_desc') {
            // Sort by due date: Latest first
            if (!a.due_date) return 1; // Tasks without due date go last
            if (!b.due_date) return -1;
            return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
          }
          if (sortBy === 'priority') {
            // Sort by priority: High to Low
            const aPriority = a.priority ? priorityLevel[a.priority] || 0 : 0;
            const bPriority = b.priority ? priorityLevel[b.priority] || 0 : 0;
            if (bPriority !== aPriority) {
              return bPriority - aPriority; // Sort by priority first
            }
            // If priorities are equal, sort by due date
            if (!a.due_date) return 1;
            if (!b.due_date) return -1;
            return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          }
          // Default: Newest first (by ID)
          return Number(b.id) - Number(a.id);
        });

        return (
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {sortedTasks.length > 0 ? (
              <AnimatePresence>
                {sortedTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <TaskCard
                      task={{...task, createdAt: task.createdAt}}
                      onToggleComplete={(taskId) => { toggleTaskCompletion(typeof taskId === 'number' ? taskId : parseInt(taskId)); }}
                      onDelete={(taskId) => { deleteTask(typeof taskId === 'number' ? taskId : parseInt(taskId)); }}
                      onEdit={handleEditTask}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="text-center py-12 col-span-full">
                <div className="bg-gray-800 border-2 border-gray-600 rounded-lg p-8">
                  {tasks.length > 0 ? (
                    <p className="text-gray-400">No tasks found matching your search.</p>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-red-900/20 border-2 border-red-400/50 flex items-center justify-center">
                        <Plus className="w-8 h-8 text-red-400" />
                      </div>
                      <p className="text-gray-400">No tasks yet. Add your first task!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Task form modal / drawer placeholder */}
      <TaskForm
        isOpen={showTaskForm}
        onClose={() => {
          setShowTaskForm(false);
          setEditingTask(null);
        }}
        onSubmit={async (payload) => {
          if (editingTask) {
            await handleUpdateTask(payload as Partial<Task>);
            window.location.reload(); // Refresh the page to show updated task
          }
          else {
            await handleAddTask({ ...payload, completed: false } as Omit<Task, "id" | "created_at" | "updated_at" | "user_id">);
            window.location.reload(); // Refresh the page to show added task
          }
        }}
        initialData={editingTask ? { ...editingTask, description: editingTask.description ?? undefined } : undefined}
      />
    </div>
  );
}