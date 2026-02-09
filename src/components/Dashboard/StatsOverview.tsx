import { Task } from '@/lib/types';
import { Circle, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface StatsOverviewProps {
  tasks: Task[];
}

export default function StatsOverview({ tasks }: StatsOverviewProps) {
  // Calculate metrics
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const urgent = tasks.filter(t => t.category === 'Urgent' && !t.completed).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Total Tasks Card */}
      <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-600 hover:border-cyan-400/50 transition-all group shadow-lg shadow-cyan-500/10">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-400/30 group-hover:bg-cyan-500/20 transition-all">
            <Circle className="h-6 w-6 text-cyan-400" />
          </div>
          <h3 className="ml-3 text-sm font-semibold text-gray-300 uppercase tracking-wider">Total</h3>
        </div>
        <p className="mt-3 text-3xl font-bold text-white">{total}</p>
      </div>

      {/* Completed Tasks Card */}
      <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-600 hover:border-blue-400/50 transition-all group shadow-lg shadow-blue-500/10">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-400/30 group-hover:bg-blue-500/20 transition-all">
            <CheckCircle className="h-6 w-6 text-blue-400" />
          </div>
          <h3 className="ml-3 text-sm font-semibold text-gray-300 uppercase tracking-wider">Completed</h3>
        </div>
        <p className="mt-3 text-3xl font-bold text-white">{completed}</p>
      </div>

      {/* Pending Tasks Card */}
      <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-600 hover:border-indigo-400/50 transition-all group shadow-lg shadow-indigo-500/10">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-400/30 group-hover:bg-indigo-500/20 transition-all">
            <Clock className="h-6 w-6 text-indigo-400" />
          </div>
          <h3 className="ml-3 text-sm font-semibold text-gray-300 uppercase tracking-wider">Pending</h3>
        </div>
        <p className="mt-3 text-3xl font-bold text-white">{pending}</p>
      </div>

      {/* Urgent Tasks Card */}
      <div className="bg-gray-800 rounded-lg p-4 border-2 border-red-600/50 hover:border-red-400 transition-all group shadow-lg shadow-red-500/10">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-400/30 group-hover:bg-red-500/20 transition-all">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <h3 className="ml-3 text-sm font-semibold text-gray-300 uppercase tracking-wider">Urgent</h3>
        </div>
        <p className="mt-3 text-3xl font-bold text-white">{urgent}</p>
      </div>
    </div>
  );
}