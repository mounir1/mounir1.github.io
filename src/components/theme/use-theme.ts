import { useTheme as useThemeProvider } from './theme-provider';
import { useEffect, useState } from 'react';

/**
 * Enhanced theme hook with additional utilities
 */
export function useTheme() {
  const themeContext = useThemeProvider();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return {
    ...themeContext,
    mounted,
  };
}

/**
 * Hook to detect if user prefers dark mode
 */
export function usePrefersDarkMode() {
  const [prefersDark, setPrefersDark] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setPrefersDark(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersDark;
}

/**
 * Hook to get theme-aware CSS variables
 */
export function useThemeVariables() {
  const { actualTheme } = useTheme();

  return {
    isDark: actualTheme === 'dark',
    isLight: actualTheme === 'light',

    // CSS variable getters
    getColor: (colorName: string) => {
      if (typeof window === 'undefined') return '';
      return getComputedStyle(document.documentElement)
        .getPropertyValue(`--${colorName}`)
        .trim();
    },

    // Theme-specific values
    glassBackground:
      actualTheme === 'dark'
        ? 'rgba(15, 23, 42, 0.7)'
        : 'rgba(255, 255, 255, 0.7)',

    cardBackground:
      actualTheme === 'dark'
        ? 'rgba(30, 41, 59, 0.8)'
        : 'rgba(255, 255, 255, 0.9)',

    borderColor:
      actualTheme === 'dark'
        ? 'rgba(148, 163, 184, 0.1)'
        : 'rgba(15, 23, 42, 0.1)',
  };
}

/**
 * Hook for theme persistence utilities
 */
export function useThemePersistence(storageKey = 'theme-preference') {
  const { theme, setTheme } = useTheme();

  const saveThemePreference = (newTheme: 'light' | 'dark' | 'system') => {
    try {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  };

  const loadThemePreference = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        setTheme(saved as 'light' | 'dark' | 'system');
      }
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
    }
  };

  const clearThemePreference = () => {
    try {
      localStorage.removeItem(storageKey);
      setTheme('system');
    } catch (error) {
      console.warn('Failed to clear theme preference:', error);
    }
  };

  return {
    currentTheme: theme,
    saveThemePreference,
    loadThemePreference,
    clearThemePreference,
  };
}
