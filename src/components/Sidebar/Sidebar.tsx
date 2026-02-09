'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, LogOut, LayoutDashboard, Settings, Calendar, BarChart2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import logo from '../../images/todo.jpg';

interface SidebarProps {
  userId: string;
}

export const Sidebar = ({ userId }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout, isLoggingOut } = useAuth();
  const pathname = usePathname(); // To determine active link

  const handleLogout = () => {
    logout();
  };

  // Function to check if a link is active
  const isActiveLink = (path: string) => {
    return pathname === path;
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-cyan-500 text-white shadow-lg shadow-cyan-500/50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-80 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-40 h-screen bg-gray-900 text-gray-400 p-6 border-r-2 border-cyan-400/30 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 w-64 max-w-xs md:w-64`}
      >
        <div className="flex md:hidden justify-between items-center mb-8">
          <div className="flex flex-row items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-50"></div>
              <Image src={logo} width={40} height={40} alt="Logo" className="relative" />
            </div>
            <h1 className="text-lg font-black text-gradient-cyan tracking-tight"> Forge Flow</h1>
          </div>
        </div>
        <div className="hidden md:flex flex-row items-center gap-3 mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-50"></div>
            <Image src={logo} width={50} height={50} alt="Logo" className="relative" />
          </div>
          <h1 className="text-xl font-black text-gradient-cyan tracking-tight">TASK FORGE</h1>
        </div>

        <nav>
          <ul>
            <li className="mb-2 relative">
              <Link
                href={`/dashboard`}
                className={`flex items-center p-3 rounded-lg transition-all duration-300 ease-in-out group ${
                  isActiveLink('/dashboard')
                    ? 'bg-cyan-500/20 text-white font-bold border border-cyan-400/50 shadow-lg shadow-cyan-500/20'
                    : 'hover:bg-gray-800 hover:text-gray-200 border border-transparent'
                }`}
              >
                {isActiveLink('/dashboard') && (
                  <span className="absolute left-0 w-1 h-full bg-cyan-400 rounded-r-full shadow-lg shadow-cyan-500/50"></span>
                )}
                <LayoutDashboard size={20} className={`w-5 h-5 mr-3 ${isActiveLink('/dashboard') ? 'text-cyan-400' : 'text-gray-400 group-hover:text-cyan-400'}`} />
                <span>Dashboard</span>
              </Link>
            </li>
            <li className="mb-2 relative">
              <Link
                href="/analytics"
                className={`flex items-center p-3 rounded-lg transition-all duration-300 ease-in-out group ${
                  isActiveLink('/analytics')
                    ? 'bg-cyan-500/20 text-white font-bold border border-cyan-400/50 shadow-lg shadow-cyan-500/20'
                    : 'hover:bg-gray-800 hover:text-gray-200 border border-transparent'
                }`}
              >
                {isActiveLink('/analytics') && (
                  <span className="absolute left-0 w-1 h-full bg-cyan-400 rounded-r-full shadow-lg shadow-cyan-500/50"></span>
                )}
                <BarChart2 size={20} className={`w-5 h-5 mr-3 ${isActiveLink('/analytics') ? 'text-cyan-400' : 'text-gray-400 group-hover:text-cyan-400'}`} />
                <span>Analytics</span>
              </Link>
            </li>
            <li className="mb-2 relative">
              <Link
                href="/schedule"
                className={`flex items-center p-3 rounded-lg transition-all duration-300 ease-in-out group ${
                  isActiveLink('/schedule')
                    ? 'bg-cyan-500/20 text-white font-bold border border-cyan-400/50 shadow-lg shadow-cyan-500/20'
                    : 'hover:bg-gray-800 hover:text-gray-200 border border-transparent'
                }`}
              >
                {isActiveLink('/schedule') && (
                  <span className="absolute left-0 w-1 h-full bg-cyan-400 rounded-r-full shadow-lg shadow-cyan-500/50"></span>
                )}
                <Calendar size={20} className={`w-5 h-5 mr-3 ${isActiveLink('/schedule') ? 'text-cyan-400' : 'text-gray-400 group-hover:text-cyan-400'}`} />
                <span>Schedule</span>
              </Link>
            </li>
            <li className="mb-2 relative">
              <Link
                href="/settings"
                className={`flex items-center p-3 rounded-lg transition-all duration-300 ease-in-out group ${
                  isActiveLink('/settings')
                    ? 'bg-cyan-500/20 text-white font-bold border border-cyan-400/50 shadow-lg shadow-cyan-500/20'
                    : 'hover:bg-gray-800 hover:text-gray-200 border border-transparent'
                }`}
              >
                {isActiveLink('/settings') && (
                  <span className="absolute left-0 w-1 h-full bg-cyan-400 rounded-r-full shadow-lg shadow-cyan-500/50"></span>
                )}
                <Settings size={20} className={`w-5 h-5 mr-3 ${isActiveLink('/settings') ? 'text-cyan-400' : 'text-gray-400 group-hover:text-cyan-400'}`} />
                <span>Settings</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`w-full flex items-center justify-center p-3 font-bold rounded-lg transition-all transform ${
              isLoggingOut
                ? 'bg-gray-700 border-2 border-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-95'
            }`}
          >
            {isLoggingOut ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Logging Out...</span>
              </div>
            ) : (
              <>
                <LogOut className="w-5 h-5 mr-2" />
                <span>Logout</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};