import * as React from 'react';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  enableColorSchemeChange?: boolean;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'dark' | 'light';
  systemTheme: 'dark' | 'light';
  toggleTheme: () => void;
  isSystemTheme: boolean;
  isTransitioning: boolean;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  actualTheme: 'light',
  systemTheme: 'light',
  toggleTheme: () => null,
  isSystemTheme: true,
  isTransitioning: false,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  enableSystem = true,
  disableTransitionOnChange = false,
  enableColorSchemeChange = true,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme;

    try {
      const storedTheme = localStorage.getItem(storageKey);
      return storedTheme ? (storedTheme as Theme) : defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  const [actualTheme, setActualTheme] = React.useState<'dark' | 'light'>(
    'light'
  );
  const [systemTheme, setSystemTheme] = React.useState<'dark' | 'light'>(
    'light'
  );
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  // Initialize system theme detection and setup listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const currentSystemTheme = mediaQuery.matches ? 'dark' : 'light';
    setSystemTheme(currentSystemTheme);

    // Listen for system theme changes
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
      if (theme === 'system') {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme changes with smooth transitions
  const applyTheme = useCallback(
    (newTheme: 'dark' | 'light') => {
      if (typeof window === 'undefined') return;

      const root = window.document.documentElement;

      // Handle transitions
      if (!disableTransitionOnChange) {
        setIsTransitioning(true);

        // Add transition class for smooth theme switching
        root.style.setProperty('--theme-transition-duration', '300ms');
        root.classList.add('theme-transitioning');

        // Remove transition class after animation
        setTimeout(() => {
          root.classList.remove('theme-transitioning');
          setIsTransitioning(false);
          // Reset transition duration
          root.style.setProperty('--theme-transition-duration', '0ms');
        }, 300);
      }

      // Remove existing theme classes
      root.classList.remove('light', 'dark');

      // Add new theme class
      root.classList.add(newTheme);

      // Update color scheme meta tag for system integration
      if (enableColorSchemeChange) {
        let metaColorScheme = document.querySelector(
          'meta[name="color-scheme"]'
        );
        if (!metaColorScheme) {
          metaColorScheme = document.createElement('meta');
          metaColorScheme.name = 'color-scheme';
          document.head.appendChild(metaColorScheme);
        }
        metaColorScheme.setAttribute('content', newTheme);
      }

      // Update theme-color meta tag for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      const themeColor = newTheme === 'dark' ? '#0f172a' : '#ffffff';
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', themeColor);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'theme-color';
        meta.content = themeColor;
        document.head.appendChild(meta);
      }

      setActualTheme(newTheme);
    },
    [disableTransitionOnChange, enableColorSchemeChange]
  );

  // Update actual theme when theme or systemTheme changes
  useEffect(() => {
    const resolvedTheme = theme === 'system' ? systemTheme : theme;
    setActualTheme(resolvedTheme);
    applyTheme(resolvedTheme);
  }, [theme, systemTheme, applyTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !enableSystem) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      setSystemTheme(newSystemTheme);
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () =>
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [enableSystem]);

  // Enhanced theme setter with persistence
  const handleSetTheme = useCallback(
    (newTheme: Theme) => {
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.setItem(storageKey, newTheme);
        } catch (error) {
          console.warn('Failed to save theme to localStorage:', error);
        }
      }
      setTheme(newTheme);
    },
    [storageKey]
  );

  const toggleTheme = useCallback(() => {
    const themes: Theme[] = ['light', 'dark'];
    const currentIndex = themes.indexOf(actualTheme as 'light' | 'dark');
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  }, [actualTheme]);

  const value = {
    theme,
    setTheme: handleSetTheme,
    actualTheme,
    systemTheme,
    toggleTheme,
    isSystemTheme: theme === 'system',
    isTransitioning,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
