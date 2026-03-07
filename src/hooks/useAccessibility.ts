import { useCallback, useEffect, useRef, useState, useId } from 'react';

// ARIA utilities
export interface AriaProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  'aria-disabled'?: boolean;
  'aria-required'?: boolean;
  'aria-invalid'?: boolean;
  'aria-live'?: 'off' | 'polite' | 'assertive';
  'aria-atomic'?: boolean;
  'aria-busy'?: boolean;
  'aria-controls'?: string;
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
  'aria-selected'?: boolean;
  'aria-checked'?: boolean;
  'aria-pressed'?: boolean;
  role?: string;
  tabIndex?: number;
}

// Focus management hook
export const useFocusManagement = () => {
  const focusHistoryRef = useRef<HTMLElement[]>([]);
  const trapContainerRef = useRef<HTMLElement | null>(null);

  // Store focus before component mounts
  const storeFocus = useCallback(() => {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement !== document.body) {
      focusHistoryRef.current.push(activeElement);
    }
  }, []);

  // Restore focus to previous element
  const restoreFocus = useCallback(() => {
    const lastFocused = focusHistoryRef.current.pop();
    if (lastFocused && lastFocused.focus) {
      setTimeout(() => lastFocused.focus(), 0);
    }
  }, []);

  // Focus first focusable element in container
  const focusFirst = useCallback((container?: HTMLElement) => {
    const target = container || trapContainerRef.current;
    if (!target) return;

    const focusableElements = getFocusableElements(target);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, []);

  // Focus last focusable element in container
  const focusLast = useCallback((container?: HTMLElement) => {
    const target = container || trapContainerRef.current;
    if (!target) return;

    const focusableElements = getFocusableElements(target);
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }
  }, []);

  /**
   * Traps focus within a given container.
   * @param container The container element to trap focus within.
   * @returns A cleanup function to remove the event listener.
   */
  const trapFocus = useCallback((container: HTMLElement) => {
    trapContainerRef.current = container;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements(container);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    storeFocus,
    restoreFocus,
    focusFirst,
    focusLast,
    trapFocus,
    focusHistory: focusHistoryRef.current,
  };
};

// Get focusable elements
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    'details',
    '[contenteditable="true"]',
  ].join(',');

  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    element => isVisible(element)
  );
}

// Check if element is visible
function isVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0'
  );
}

// Keyboard navigation hook
export const useKeyboardNavigation = (
  options: {
    onEscape?: () => void;
    onEnter?: () => void;
    onArrowUp?: () => void;
    onArrowDown?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
    onHome?: () => void;
    onEnd?: () => void;
    onTab?: (e: KeyboardEvent) => void;
    enabled?: boolean;
  } = {}
) => {
  const { enabled = true } = options;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          options.onEscape?.();
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          options.onEnter?.();
          break;
        case 'ArrowUp':
          e.preventDefault();
          options.onArrowUp?.();
          break;
        case 'ArrowDown':
          e.preventDefault();
          options.onArrowDown?.();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          options.onArrowLeft?.();
          break;
        case 'ArrowRight':
          e.preventDefault();
          options.onArrowRight?.();
          break;
        case 'Home':
          e.preventDefault();
          options.onHome?.();
          break;
        case 'End':
          e.preventDefault();
          options.onEnd?.();
          break;
        case 'Tab':
          options.onTab?.(e);
          break;
      }
    },
    [enabled, options]
  );

  return { handleKeyDown };
};

// Screen reader announcements hook
export const useScreenReader = () => {
  const [announcement, setAnnouncement] = useState('');
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  // Create live region for announcements
  useEffect(() => {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
    liveRegionRef.current = liveRegion;

    return () => {
      if (liveRegionRef.current) {
        document.body.removeChild(liveRegionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = announcement;
    }
  }, [announcement]);

  const announce = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      if (!liveRegionRef.current || !message.trim()) return;

      liveRegionRef.current.setAttribute('aria-live', priority);
      setAnnouncement(message);
    },
    []
  );

  const announceError = useCallback(
    (message: string) => {
      announce(`Error: ${message}`, 'assertive');
    },
    [announce]
  );

  const announceSuccess = useCallback(
    (message: string) => {
      announce(`Success: ${message}`, 'polite');
    },
    [announce]
  );

  const announceLoading = useCallback(
    (message: string = 'Loading') => {
      announce(message, 'polite');
    },
    [announce]
  );

  return {
    announce,
    announceError,
    announceSuccess,
    announceLoading,
  };
};

// ARIA utilities
export const useAriaAttributes = () => {
  const reactUseId = useId();
  const generateId = useCallback(
    (prefix: string = 'element') => {
      return `${prefix}-${reactUseId}`;
    },
    [reactUseId]
  );

  const createAriaProps = useCallback(
    (config: {
      label?: string;
      labelledBy?: string;
      describedBy?: string;
      required?: boolean;
      invalid?: boolean;
      disabled?: boolean;
      expanded?: boolean;
      selected?: boolean;
      checked?: boolean;
      pressed?: boolean;
      current?: AriaProps['aria-current'];
      controls?: string;
      live?: AriaProps['aria-live'];
      role?: string;
      hidden?: boolean;
    }): AriaProps => {
      const props: AriaProps = {};

      if (config.label) props['aria-label'] = config.label;
      if (config.labelledBy) props['aria-labelledby'] = config.labelledBy;
      if (config.describedBy) props['aria-describedby'] = config.describedBy;
      if (config.required !== undefined)
        props['aria-required'] = config.required;
      if (config.invalid !== undefined) props['aria-invalid'] = config.invalid;
      if (config.disabled !== undefined)
        props['aria-disabled'] = config.disabled;
      if (config.expanded !== undefined)
        props['aria-expanded'] = config.expanded;
      if (config.selected !== undefined)
        props['aria-selected'] = config.selected;
      if (config.checked !== undefined) props['aria-checked'] = config.checked;
      if (config.pressed !== undefined) props['aria-pressed'] = config.pressed;
      if (config.current !== undefined) props['aria-current'] = config.current;
      if (config.controls) props['aria-controls'] = config.controls;
      if (config.live) props['aria-live'] = config.live;
      if (config.role) props.role = config.role;
      if (config.hidden !== undefined) props['aria-hidden'] = config.hidden;

      return props;
    },
    []
  );

  return {
    generateId,
    createAriaProps,
  };
};

// Skip link hook
export const useSkipLinks = () => {
  const [skipLinks, setSkipLinks] = useState<
    Array<{
      id: string;
      label: string;
      target: string;
    }>
  >([]);

  const addSkipLink = useCallback(
    (id: string, label: string, target: string) => {
      setSkipLinks(prev => {
        const exists = prev.find(link => link.id === id);
        if (exists) return prev;
        return [...prev, { id, label, target }];
      });
    },
    []
  );

  const removeSkipLink = useCallback((id: string) => {
    setSkipLinks(prev => prev.filter(link => link.id !== id));
  }, []);

  const skipTo = useCallback((target: string) => {
    const element = document.getElementById(target);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return {
    skipLinks,
    addSkipLink,
    removeSkipLink,
    skipTo,
  };
};

// Reduced motion preference
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
};

// High contrast preference
export const useHighContrast = () => {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setPrefersHighContrast(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersHighContrast;
};

// Color scheme preference
export const useColorScheme = () => {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark' | 'auto'>(
    'auto'
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setColorScheme(mediaQuery.matches ? 'dark' : 'light');

    const handler = (e: MediaQueryListEvent) => {
      setColorScheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return colorScheme;
};

export const useRovingTabIndex = (
  containerRef: React.RefObject<HTMLElement>
) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!containerRef.current) return;
      const focusableElements = getFocusableElements(containerRef.current);
      if (focusableElements.length === 0) return;

      let newIndex = activeIndex;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        newIndex = (activeIndex + 1) % focusableElements.length;
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        newIndex =
          (activeIndex - 1 + focusableElements.length) %
          focusableElements.length;
      }

      if (newIndex !== activeIndex) {
        event.preventDefault();
        focusableElements[newIndex].focus();
        setActiveIndex(newIndex);
      }
    },
    [activeIndex, containerRef]
  );

  useEffect(() => {
    if (!containerRef.current) return;
    const focusableElements = getFocusableElements(containerRef.current);
    focusableElements.forEach((element, index) => {
      element.tabIndex = index === activeIndex ? 0 : -1;
    });
  }, [activeIndex, containerRef]);

  return { activeIndex, handleKeyDown };
};

export default {
  useFocusManagement,
  useKeyboardNavigation,
  useScreenReader,
  useAriaAttributes,
  useSkipLinks,
  useReducedMotion,
  useHighContrast,
  useColorScheme,
  useRovingTabIndex,
};
