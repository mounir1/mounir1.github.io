import { useEffect, useRef, useCallback, useState } from 'react';

// Event types for tracking
export interface UserEvent {
  id: string;
  type:
    | 'click'
    | 'scroll'
    | 'keypress'
    | 'focus'
    | 'form_submit'
    | 'page_view'
    | 'custom';
  timestamp: number;
  target?: string;
  value?: any;
  metadata?: Record<string, any>;
  sessionId: string;
  userId?: string;
}

export interface PageViewEvent extends UserEvent {
  type: 'page_view';
  path: string;
  referrer?: string;
  duration?: number;
}

export interface InteractionEvent extends UserEvent {
  type: 'click' | 'focus' | 'keypress';
  element: string;
  coordinates?: { x: number; y: number };
}

export interface ScrollEvent extends UserEvent {
  type: 'scroll';
  scrollDepth: number;
  maxScroll: number;
  direction: 'up' | 'down';
}

export interface FormEvent extends UserEvent {
  type: 'form_submit';
  formId: string;
  fields: Record<string, any>;
  validationErrors?: string[];
}

// Tracking configuration
export interface TrackingConfig {
  enabledEvents: UserEvent['type'][];
  sampleRate: number; // 0-1, percentage of events to track
  batchSize: number;
  batchInterval: number; // ms
  storage: 'memory' | 'localStorage' | 'custom';
  customStorage?: {
    store: (events: UserEvent[]) => Promise<void>;
    retrieve: () => Promise<UserEvent[]>;
  };
  onEventBatch?: (events: UserEvent[]) => void;
  privacy: {
    anonymizeIPs: boolean;
    excludeElements: string[]; // CSS selectors to exclude
    hashSensitiveData: boolean;
  };
}

// Default configuration
const DEFAULT_CONFIG: TrackingConfig = {
  enabledEvents: ['click', 'scroll', 'page_view', 'form_submit'],
  sampleRate: 1.0,
  batchSize: 50,
  batchInterval: 10000,
  storage: 'memory',
  privacy: {
    anonymizeIPs: true,
    excludeElements: ['.sensitive', '[data-private]'],
    hashSensitiveData: true,
  },
};

// User interaction tracking hook
export const useUserTracking = (config: Partial<TrackingConfig> = {}) => {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const [events, setEvents] = useState<UserEvent[]>([]);
  const [sessionId] = useState(() => generateSessionId());
  const [isTracking, setIsTracking] = useState(true);

  const eventQueue = useRef<UserEvent[]>([]);
  const batchTimer = useRef<NodeJS.Timeout>();
  const lastScrollDepth = useRef(0);
  const pageStartTime = useRef(Date.now());
  const currentPath = useRef(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  // Generate unique session ID
  function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate unique event ID
  const generateEventId = useCallback((): string => {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Check if element should be tracked
  const shouldTrackElement = useCallback(
    (element: Element): boolean => {
      for (const selector of fullConfig.privacy.excludeElements) {
        if (element.matches(selector)) return false;
      }
      return true;
    },
    [fullConfig.privacy.excludeElements]
  );

  // Sample rate check
  const shouldSample = useCallback((): boolean => {
    return Math.random() < fullConfig.sampleRate;
  }, [fullConfig.sampleRate]);

  // Add event to queue
  const trackEvent = useCallback(
    (event: Omit<UserEvent, 'id' | 'sessionId' | 'timestamp'>) => {
      if (!isTracking || !shouldSample()) return;

      const fullEvent: UserEvent = {
        ...event,
        id: generateEventId(),
        sessionId,
        timestamp: Date.now(),
      };

      eventQueue.current.push(fullEvent);
      setEvents(prev => [...prev, fullEvent]);

      // Batch processing
      if (eventQueue.current.length >= fullConfig.batchSize) {
        processBatch();
      }
    },
    [isTracking, shouldSample, generateEventId, sessionId, fullConfig.batchSize]
  );

  // Process event batch
  const processBatch = useCallback(() => {
    if (eventQueue.current.length === 0) return;

    const batch = [...eventQueue.current];
    eventQueue.current = [];

    // Store or send batch
    if (fullConfig.storage === 'localStorage') {
      try {
        const existing = JSON.parse(
          localStorage.getItem('user_tracking_events') || '[]'
        );
        localStorage.setItem(
          'user_tracking_events',
          JSON.stringify([...existing, ...batch])
        );
      } catch (error) {
        console.error('Failed to store tracking events:', error);
      }
    } else if (fullConfig.customStorage) {
      fullConfig.customStorage.store(batch).catch(console.error);
    }

    fullConfig.onEventBatch?.(batch);
  }, [fullConfig]);

  // Set up batch timer
  useEffect(() => {
    batchTimer.current = setInterval(processBatch, fullConfig.batchInterval);
    return () => {
      if (batchTimer.current) {
        clearInterval(batchTimer.current);
        processBatch(); // Process remaining events
      }
    };
  }, [processBatch, fullConfig.batchInterval]);

  // Track page views
  useEffect(() => {
    if (!fullConfig.enabledEvents.includes('page_view')) return;

    const trackPageView = () => {
      const now = Date.now();
      const duration = now - pageStartTime.current;

      trackEvent({
        type: 'page_view',
        path: window.location.pathname,
        referrer: document.referrer,
        duration,
        metadata: {
          title: document.title,
          userAgent: navigator.userAgent,
          screenResolution: `${screen.width}x${screen.height}`,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
        },
      } as PageViewEvent);

      pageStartTime.current = now;
      currentPath.current = window.location.pathname;
    };

    trackPageView();

    // Track navigation changes
    const handlePopState = () => {
      if (currentPath.current !== window.location.pathname) {
        trackPageView();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [trackEvent, fullConfig.enabledEvents]);

  // Track clicks
  useEffect(() => {
    if (!fullConfig.enabledEvents.includes('click')) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!shouldTrackElement(target)) return;

      const elementSelector = getElementSelector(target);

      trackEvent({
        type: 'click',
        target: elementSelector,
        element: target.tagName.toLowerCase(),
        coordinates: { x: e.clientX, y: e.clientY },
        metadata: {
          text: target.textContent?.slice(0, 100),
          href: (target as HTMLAnchorElement).href,
          id: target.id,
          className: target.className,
        },
      } as InteractionEvent);
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [trackEvent, fullConfig.enabledEvents, shouldTrackElement]);

  // Track scrolling
  useEffect(() => {
    if (!fullConfig.enabledEvents.includes('scroll')) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop =
            window.pageYOffset || document.documentElement.scrollTop;
          const documentHeight =
            document.documentElement.scrollHeight - window.innerHeight;
          const scrollDepth = Math.round((scrollTop / documentHeight) * 100);

          if (Math.abs(scrollDepth - lastScrollDepth.current) >= 10) {
            trackEvent({
              type: 'scroll',
              scrollDepth,
              maxScroll: documentHeight,
              direction: scrollDepth > lastScrollDepth.current ? 'down' : 'up',
              metadata: {
                scrollTop,
                documentHeight: document.documentElement.scrollHeight,
                viewportHeight: window.innerHeight,
              },
            } as ScrollEvent);

            lastScrollDepth.current = scrollDepth;
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackEvent, fullConfig.enabledEvents]);

  // Track form submissions
  useEffect(() => {
    if (!fullConfig.enabledEvents.includes('form_submit')) return;

    const handleFormSubmit = (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement;
      if (!shouldTrackElement(form)) return;

      const formData = new FormData(form);
      const fields: Record<string, any> = {};

      for (const [key, value] of formData.entries()) {
        // Hash sensitive data if configured
        if (fullConfig.privacy.hashSensitiveData && isSensitiveField(key)) {
          fields[key] = hashString(value.toString());
        } else {
          fields[key] = value;
        }
      }

      trackEvent({
        type: 'form_submit',
        formId: form.id || getElementSelector(form),
        fields,
        metadata: {
          action: form.action,
          method: form.method,
          fieldCount: Object.keys(fields).length,
        },
      } as FormEvent);
    };

    document.addEventListener('submit', handleFormSubmit, true);
    return () => document.removeEventListener('submit', handleFormSubmit, true);
  }, [
    trackEvent,
    fullConfig.enabledEvents,
    fullConfig.privacy.hashSensitiveData,
    shouldTrackElement,
  ]);

  // Track keyboard interactions
  useEffect(() => {
    if (!fullConfig.enabledEvents.includes('keypress')) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      const target = e.target as Element;
      if (!shouldTrackElement(target)) return;

      // Only track significant keys
      if (['Enter', 'Escape', 'Tab', ' '].includes(e.key)) {
        trackEvent({
          type: 'keypress',
          target: getElementSelector(target),
          value: e.key,
          metadata: {
            altKey: e.altKey,
            ctrlKey: e.ctrlKey,
            shiftKey: e.shiftKey,
            metaKey: e.metaKey,
          },
        });
      }
    };

    document.addEventListener('keydown', handleKeyPress, true);
    return () => document.removeEventListener('keydown', handleKeyPress, true);
  }, [trackEvent, fullConfig.enabledEvents, shouldTrackElement]);

  // Get element selector
  function getElementSelector(element: Element): string {
    if (element.id) return `#${element.id}`;

    let selector = element.tagName.toLowerCase();
    if (element.className) {
      selector += `.${element.className.split(' ').join('.')}`;
    }

    return selector;
  }

  // Check if field contains sensitive data
  function isSensitiveField(fieldName: string): boolean {
    const sensitivePatterns = [
      /password/i,
      /ssn/i,
      /social.security/i,
      /credit.card/i,
      /card.number/i,
      /cvv/i,
      /security.code/i,
    ];

    return sensitivePatterns.some(pattern => pattern.test(fieldName));
  }

  // Simple hash function
  function hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return `hash_${Math.abs(hash)}`;
  }

  // Export data
  const exportEvents = useCallback((): UserEvent[] => {
    return [...events];
  }, [events]);

  // Clear data
  const clearEvents = useCallback(() => {
    setEvents([]);
    eventQueue.current = [];

    if (fullConfig.storage === 'localStorage') {
      localStorage.removeItem('user_tracking_events');
    }
  }, [fullConfig.storage]);

  // Analytics helpers
  const getEventStats = useCallback(() => {
    const stats = events.reduce(
      (acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const totalEvents = events.length;
    const uniquePages = new Set(
      events
        .filter(e => e.type === 'page_view')
        .map(e => (e as PageViewEvent).path)
    ).size;

    return {
      totalEvents,
      eventsByType: stats,
      uniquePages,
      sessionDuration: Date.now() - pageStartTime.current,
      sessionId,
    };
  }, [events, sessionId]);

  return {
    events,
    sessionId,
    isTracking,
    setIsTracking,
    trackEvent,
    exportEvents,
    clearEvents,
    getEventStats,
    processBatch,
  };
};

export default useUserTracking;
