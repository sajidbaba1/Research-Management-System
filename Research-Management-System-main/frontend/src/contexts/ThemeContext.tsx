import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark') {
      setIsDark(true);
    } else if (savedTheme === 'light') {
      setIsDark(false);
    } else {
      setIsDark(prefersDark);
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.body.classList.add('dark');
      document.body.classList.remove('light');
      
      // Set CSS variables for dark mode
      document.documentElement.style.setProperty('--background', '15 23 42'); // slate-900
      document.documentElement.style.setProperty('--foreground', '248 250 252'); // slate-50
      document.documentElement.style.setProperty('--card', '30 41 59'); // slate-800
      document.documentElement.style.setProperty('--card-foreground', '248 250 252');
      document.documentElement.style.setProperty('--border', '51 65 85'); // slate-700
      document.documentElement.style.setProperty('--input', '51 65 85');
      document.documentElement.style.setProperty('--ring', '59 130 246'); // blue-500
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.body.classList.remove('dark');
      document.body.classList.add('light');
      
      // Set CSS variables for light mode
      document.documentElement.style.setProperty('--background', '255 255 255'); // white
      document.documentElement.style.setProperty('--foreground', '3 7 18'); // slate-900
      document.documentElement.style.setProperty('--card', '255 255 255');
      document.documentElement.style.setProperty('--card-foreground', '3 7 18');
      document.documentElement.style.setProperty('--border', '226 232 240'); // slate-200
      document.documentElement.style.setProperty('--input', '241 245 249'); // slate-100
      document.documentElement.style.setProperty('--ring', '59 130 246'); // blue-500
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const setTheme = (isDark: boolean) => {
    setIsDark(isDark);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
