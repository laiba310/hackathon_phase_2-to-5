import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Standard indigo color palette
        indigo: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        // Standard slate color palette
        slate: {
          50: '#f8fafc',   // Default background color
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',   // Heading text color
          900: '#0f172a',   // Body text color
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',  // Indigo-600 as primary
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        background: {
          DEFAULT: '#f8fafc',  // slate-50 as background
        },
        card: {
          DEFAULT: '#ffffff',  // White for cards
        },
        text: {
          heading: '#1e293b',   // slate-800 for headings
          body: '#64748b',      // slate-500 for body text
        },
        status: {
          completed: '#22c55e',  // green-500 for completed tasks
          pending: '#f59e0b',    // amber-500 for pending tasks
          error: '#ef4444',      // red-500 for errors/delete
        },
        // Brand colors for "Black & Red" theme
        'brand-black': '#0A0A0A',       // Deep black background
        'brand-red': '#DC2626',         // Primary red accent (red-600)
        'brand-red-dark': '#991B1B',    // Darker red (red-800)
        'brand-red-light': '#EF4444',   // Lighter red (red-500)
        'brand-card': '#1A1A1A',        // Dark card background
        'brand-card-hover': '#262626',  // Card hover state
        'brand-gray': '#6B7280',        // Gray-500 for secondary text
        'brand-gray-light': '#9CA3AF',  // Gray-400 for muted text
        'brand-border': '#374151'       // Gray-700 for borders
      },
    },
  },
  plugins: [],
};
export default config;