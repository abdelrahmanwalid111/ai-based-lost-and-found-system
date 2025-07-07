"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  surfaceHover: string;
  
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  
  // Brand colors
  primary: string;
  primaryHover: string;
  primaryText: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Border colors
  border: string;
  borderLight: string;
  
  // Shadow
  shadow: string;
}

const lightTheme: ThemeColors = {
  background: '#f9fafb',
  surface: '#ffffff',
  surfaceHover: '#f3f4f6',
  
  textPrimary: '#111827',
  textSecondary: '#374151',
  textMuted: '#6b7280',
  
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  primaryText: '#ffffff',
  
  success: '#16a34a',
  warning: '#f59e0b',
  error: '#dc2626',
  info: '#0ea5e9',
  
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  
  shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
};

const darkTheme: ThemeColors = {
  background: '#0f172a',
  surface: '#1e293b',
  surfaceHover: '#334155',
  
  textPrimary: '#f8fafc',
  textSecondary: '#e2e8f0',
  textMuted: '#94a3b8',
  
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  primaryText: '#ffffff',
  
  success: '#22c55e',
  warning: '#fbbf24',
  error: '#ef4444',
  info: '#06b6d4',
  
  border: '#334155',
  borderLight: '#475569',
  
  shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
};

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isHydrated: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Function to get initial theme without causing hydration mismatch
const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'light'; // Default for SSR
  }
  
  try {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }
    
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  } catch (error) {
    return 'light';
  }
};

// Function to apply theme immediately to DOM
const applyThemeToDOM = (theme: Theme) => {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  const body = document.body;
  
  if (theme === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
    body.style.backgroundColor = '#0f172a';
    body.style.color = '#f8fafc';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
    body.style.backgroundColor = '#f9fafb';
    body.style.color = '#111827';
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Only get initial theme on client side to prevent hydration mismatch
    if (typeof window !== 'undefined') {
      return getInitialTheme();
    }
    return 'light';
  });
  const [isHydrated, setIsHydrated] = useState(false);

  // Apply theme immediately on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initialTheme = getInitialTheme();
      setThemeState(initialTheme);
      applyThemeToDOM(initialTheme);
      setIsHydrated(true);
    }
  }, []);

  // Handle theme changes
  useEffect(() => {
    if (!isHydrated) return;
    
    // Save theme preference
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
    
    // Apply theme to DOM
    applyThemeToDOM(theme);
  }, [theme, isHydrated]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const colors = theme === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme, isHydrated }}>
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