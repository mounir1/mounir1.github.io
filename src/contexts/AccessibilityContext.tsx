import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  useReducedMotion,
  useHighContrast,
  useColorScheme,
  useScreenReader,
  useSkipLinks,
} from '@/hooks/useAccessibility';

// Accessibility preferences
export interface AccessibilityPreferences {
  // Visual preferences
  reducedMotion: boolean;
  highContrast: boolean;
  colorScheme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';

  // Interaction preferences
  keyboardNavigation: boolean;
  screenReader: boolean;
  focusVisible: boolean;
  skipLinks: boolean;

  // Content preferences
  captions: boolean;
  audioDescriptions: boolean;
  simplifiedInterface: boolean;

  // Animation preferences
  autoplayMedia: boolean;
  parallaxEffects: boolean;
  backgroundAnimations: boolean;
}

// Accessibility context type
interface AccessibilityContextType {
  preferences: AccessibilityPreferences;
  updatePreference: <K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K]
  ) => void;
  resetPreferences: () => void;

  // Global accessibility state
  announcements: string[];
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  skipLinks: Array<{ id: string; label: string; target: string }>;

  // Utility functions
  isKeyboardUser: boolean;
  setIsKeyboardUser: (value: boolean) => void;
  hasScreenReader: boolean;
}

// Default preferences
const defaultPreferences: AccessibilityPreferences = {
  reducedMotion: false,
  highContrast: false,
  colorScheme: 'auto',
  fontSize: 'medium',
  keyboardNavigation: true,
  screenReader: false,
  focusVisible: true,
  skipLinks: true,
  captions: false,
  audioDescriptions: false,
  simplifiedInterface: false,
  autoplayMedia: false,
  parallaxEffects: true,
  backgroundAnimations: true,
};

// Create context
const AccessibilityContext = createContext<AccessibilityContextType | null>(
  null
);

// Storage key
const PREFERENCES_KEY = 'accessibility-preferences';

// Provider component
export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [preferences, setPreferences] =
    useState<AccessibilityPreferences>(defaultPreferences);
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);
  const [hasScreenReader, setHasScreenReader] = useState(false);

  // System preferences
  const systemReducedMotion = useReducedMotion();
  const systemHighContrast = useHighContrast();
  const systemColorScheme = useColorScheme();

  // Screen reader and skip links
  const { announce, announcements } = useScreenReader();
  const { skipLinks } = useSkipLinks();

  // Load saved preferences on mount
  useEffect(() => {
    try {
      const savedPreferences = localStorage.getItem(PREFERENCES_KEY);
      if (savedPreferences) {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('Failed to load accessibility preferences:', error);
    }
  }, []);

  // Apply system preferences
  useEffect(() => {
    setPreferences(prev => ({
      ...prev,
      reducedMotion: systemReducedMotion || prev.reducedMotion,
      highContrast: systemHighContrast || prev.highContrast,
      colorScheme:
        prev.colorScheme === 'auto' ? systemColorScheme : prev.colorScheme,
    }));
  }, [systemReducedMotion, systemHighContrast, systemColorScheme]);

  // Detect keyboard usage
  useEffect(() => {
    let keyboardUsed = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && !keyboardUsed) {
        keyboardUsed = true;
        setIsKeyboardUser(true);
        document.removeEventListener('keydown', handleKeyDown);
      }
    };

    const handleMouseDown = () => {
      if (keyboardUsed) {
        setIsKeyboardUser(false);
        keyboardUsed = false;
        document.addEventListener('keydown', handleKeyDown);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Detect screen reader
  useEffect(() => {
    const detectScreenReader = () => {
      // Check for common screen reader indicators
      const hasAriaLive = document.querySelector('[aria-live]');
      const hasAriaLabel = document.querySelector('[aria-label]');
      const hasAriaDescribedBy = document.querySelector('[aria-describedby]');

      // Check for screen reader specific user agents or features
      const userAgent = navigator.userAgent.toLowerCase();
      const hasScreenReaderUA = /jaws|nvda|narrator|voiceover|talkback/.test(
        userAgent
      );

      setHasScreenReader(
        hasScreenReaderUA ||
          !!(hasAriaLive || hasAriaLabel || hasAriaDescribedBy)
      );
    };

    // Check after a short delay to allow DOM to settle
    setTimeout(detectScreenReader, 1000);
  }, []);

  // Update preference function
  const updatePreference = useCallback(
    <K extends keyof AccessibilityPreferences>(
      key: K,
      value: AccessibilityPreferences[K]
    ) => {
      setPreferences(prev => {
        const updated = { ...prev, [key]: value };

        // Save to localStorage
        try {
          localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
        } catch (error) {
          console.error('Failed to save accessibility preferences:', error);
        }

        return updated;
      });
    },
    []
  );

  // Reset preferences
  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
    try {
      localStorage.removeItem(PREFERENCES_KEY);
    } catch (error) {
      console.error('Failed to clear accessibility preferences:', error);
    }
  }, []);

  // Apply CSS custom properties based on preferences
  useEffect(() => {
    const root = document.documentElement;

    // Font size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
      'extra-large': '20px',
    };
    root.style.setProperty(
      '--base-font-size',
      fontSizeMap[preferences.fontSize]
    );

    // Reduced motion
    root.style.setProperty(
      '--animation-duration',
      preferences.reducedMotion ? '0ms' : '300ms'
    );

    // High contrast
    if (preferences.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Color scheme
    root.setAttribute('data-color-scheme', preferences.colorScheme);

    // Keyboard navigation
    if (preferences.keyboardNavigation) {
      root.classList.add('keyboard-navigation');
    } else {
      root.classList.remove('keyboard-navigation');
    }

    // Focus visible
    if (preferences.focusVisible) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }
  }, [preferences]);

  // Context value
  const contextValue: AccessibilityContextType = {
    preferences,
    updatePreference,
    resetPreferences,
    announcements,
    announce,
    skipLinks,
    isKeyboardUser,
    setIsKeyboardUser,
    hasScreenReader,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
};

// Hook to use accessibility context
export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);

  if (!context) {
    throw new Error(
      'useAccessibility must be used within an AccessibilityProvider'
    );
  }

  return context;
};

// Convenience hooks
export const useAccessibilityPreferences = () => {
  const { preferences, updatePreference, resetPreferences } =
    useAccessibility();
  return { preferences, updatePreference, resetPreferences };
};

export const useAccessibilityAnnouncements = () => {
  const { announcements, announce } = useAccessibility();
  return { announcements, announce };
};

export const useKeyboardDetection = () => {
  const { isKeyboardUser, setIsKeyboardUser } = useAccessibility();
  return { isKeyboardUser, setIsKeyboardUser };
};

export const useScreenReaderDetection = () => {
  const { hasScreenReader } = useAccessibility();
  return hasScreenReader;
};

// Export the context itself
export { AccessibilityContext };

export default AccessibilityProvider;
