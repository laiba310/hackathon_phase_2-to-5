"use client";

import { useEffect, useState, JSX } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import StatsOverview from "@/components/Dashboard/StatsOverview";
import { Task } from "@/lib/types";

export default function AnalyticsPage(): JSX.Element {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const fetchTasks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const res = await apiClient.get('/api/tasks');
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
          <p className="mt-6 text-lg font-medium text-white">Loading analytics...</p>
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

  // Calculate metrics for detailed stats
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Calculate category breakdown
  const categoryCounts: { [key: string]: number } = {};
  tasks.forEach(task => {
    if (task.category) {
      categoryCounts[task.category] = (categoryCounts[task.category] || 0) + 1;
    }
  });

  // Determine motivational message based on completion rate
  const getMotivationalMessage = () => {
    if (completionRate >= 80) return "Great job! Keep it up";
    if (completionRate >= 50) return "Good progress, keep going";
    if (completionRate >= 25) return "Making progress, stay focused";
    return "Focus more on completing tasks";
  };

  // Generate mock data for weekly activity
  const weeklyData = [
    { day: 'M', height: 'h-16' },
    { day: 'T', height: 'h-24' },
    { day: 'W', height: 'h-10' },
    { day: 'T', height: 'h-20' },
    { day: 'F', height: 'h-14' },
    { day: 'S', height: 'h-8' },
    { day: 'S', height: 'h-18' }
  ];

  return (
    <div className="max-w-4xl mx-auto w-full p-4">
      <h1 className="text-2xl font-bold text-white mb-6">Analytics Dashboard</h1>

      {/* Stats Overview */}
      <StatsOverview tasks={tasks} />

      {/* Main Grid - 3 column layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Card: Productivity Score (The Circle) */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-600 shadow-lg">
          <h2 className="text-lg font-semibold text-white mb-4">Productivity</h2>

          <div className="flex flex-col items-center">
            {/* Circular Progress Chart */}
            <div className="relative">
              <svg className="w-32 h-32" viewBox="0 0 100 100">
                {/* Background Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#374151" // gray-700 to match theme
                  strokeWidth="8"
                />
                {/* Progress Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#06b6d4" // cyan-500 to match theme
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="283" // circumference = 2 * π * r (2 * π * 45 ≈ 283)
                  strokeDashoffset={283 - (283 * completionRate) / 100}
                  transform="rotate(-90 50 50)" // Start from top
                />
              </svg>

              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-white">{completionRate}%</span>
              </div>
            </div>
            <p className="text-sm text-gray-300 mt-4">Task Completion Rate</p>
          </div>
        </div>

        {/* Middle Card: Weekly Activity (The "Bottom-to-Top" Bars) */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-600 shadow-lg">
          <h2 className="text-lg font-semibold text-white mb-4">Weekly Progress</h2>

          <div className="flex flex-col items-center">
            {/* Vertical Bars Container */}
            <div className="flex items-end justify-between h-32 px-2 w-full">
              {weeklyData.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className={`${item.height} w-3 rounded-t-md bg-cyan-400`}></div>
                  <span className="text-xs text-gray-400 mt-2">{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Card: Category Breakdown (The List) */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-600 shadow-lg">
          <h2 className="text-lg font-semibold text-white mb-4">Task Distribution</h2>
          <div className="space-y-4">
            {Object.entries(categoryCounts).map(([category, count]) => {
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

              // Assign different colors to different categories using the theme
              let barColor = "bg-cyan-400"; // Default to cyan
              if (category === "Urgent") barColor = "bg-red-400"; // red for urgent
              else if (category === "Work") barColor = "bg-blue-400"; // blue for work
              else if (category === "Personal") barColor = "bg-indigo-400"; // indigo for personal
              else if (category === "Design") barColor = "bg-cyan-400"; // cyan for design

              return (
                <div key={category} className="flex items-center justify-between">
                  <span className="capitalize text-white w-1/3">{category}</span>
                  <div className="w-1/2 mx-2 bg-gray-700 rounded-full h-1.5">
                    <div
                      className={`${barColor} h-1.5 rounded-full`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-white w-1/6 text-right">{count}</span>
                </div>
              );
            })}
            {Object.keys(categoryCounts).length === 0 && (
              <p className="text-gray-400 text-center py-4">No tasks to display</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}