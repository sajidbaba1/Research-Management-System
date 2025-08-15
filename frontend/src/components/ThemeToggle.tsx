import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center justify-center p-3 rounded-xl transition-all duration-300 ease-in-out
        bg-white dark:bg-slate-800 
        border border-slate-200 dark:border-slate-700
        hover:bg-slate-100 dark:hover:bg-slate-700
        text-slate-700 dark:text-slate-300
        shadow-lg hover:shadow-xl
        focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
        focus:ring-offset-2 dark:focus:ring-offset-slate-900"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5">
        <Sun
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 ease-in-out transform
            ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}
            text-slate-600`}
        />
        <Moon
          className={`absolute inset-0 w-5 h-5 transition-all duration-300 ease-in-out transform
            ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}
            text-slate-400`}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
