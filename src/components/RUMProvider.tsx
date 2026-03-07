import React, { createContext, useContext, useEffect, useRef } from 'react';
import RealUserMonitoring from '../utils/rum-monitor';
import type { RUMConfig, PerformanceData } from '../utils/rum-monitor';

interface RUMContextValue {
  rum: RealUserMonitoring | null;
  recordMetric: (name: string, value: number) => void;
  recordCustomMetric: (name: string, value: any) => void;
  recordError: (error: { message: string; stack?: string }) => void;
  getPerformanceData: () => PerformanceData | null;
}

const RUMContext = createContext<RUMContextValue>({
  rum: null,
  recordMetric: () => {},
  recordCustomMetric: () => {},
  recordError: () => {},
  getPerformanceData: () => null,
});

interface RUMProviderProps {
  children: React.ReactNode;
  config?: RUMConfig;
  enabled?: boolean;
}

// Default RUM configuration
const defaultRUMConfig: RUMConfig = {
  apiEndpoint: process.env.VITE_RUM_API_ENDPOINT || '/api/rum',
  sampleRate: 1.0,
  enableConsoleLogging: process.env.NODE_ENV !== 'production',
  enableLocalStorage: true,
};

export const RUMProvider: React.FC<RUMProviderProps> = ({
  children,
  config = {},
  enabled = true,
}) => {
  const rumRef = useRef<RealUserMonitoring | null>(null);

  useEffect(() => {
    // Merge default config with provided config
    const mergedConfig = {
      ...defaultRUMConfig,
      ...config,
    };
    if (!enabled) return;

    // Initialize RUM monitoring
    const rumConfig: RUMConfig = {
      sampleRate: 0.1, // Sample 10% of users in production
      enableConsoleLogging: process.env.NODE_ENV === 'development',
      enableLocalStorage: true,
      apiEndpoint: process.env.VITE_RUM_API_ENDPOINT,
      apiKey: process.env.VITE_RUM_API_KEY,
      ...config,
    };

    rumRef.current = RealUserMonitoring.initialize(rumConfig);

    // Record initial page load metrics
    rumRef.current.recordCustomMetric('PageLoadTime', Date.now());
    rumRef.current.recordCustomMetric('UserAgent', navigator.userAgent);
    rumRef.current.recordCustomMetric('Viewport', {
      width: window.innerWidth,
      height: window.innerHeight,
    });
    rumRef.current.recordCustomMetric('Screen', {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
    });

    // Track React-specific metrics
    if (process.env.NODE_ENV === 'development') {
      rumRef.current.recordCustomMetric('ReactVersion', React.version);
      rumRef.current.recordCustomMetric('Environment', 'development');
    } else {
      rumRef.current.recordCustomMetric('Environment', 'production');
    }

    return () => {
      // Send final data on cleanup
      if (rumRef.current) {
        rumRef.current.sendData(true);
      }
    };
  }, [enabled, config]);

  const recordMetric = (name: string, value: number) => {
    if (rumRef.current) {
      rumRef.current.recordMetric(name, value);
    }
  };

  const recordCustomMetric = (name: string, value: any) => {
    if (rumRef.current) {
      rumRef.current.recordCustomMetric(name, value);
    }
  };

  const recordError = (error: { message: string; stack?: string }) => {
    if (rumRef.current) {
      rumRef.current.recordError({
        ...error,
        timestamp: Date.now(),
      });
    }
  };

  const getPerformanceData = (): PerformanceData | null => {
    return rumRef.current ? rumRef.current.getPerformanceData() : null;
  };

  const contextValue: RUMContextValue = {
    rum: rumRef.current,
    recordMetric,
    recordCustomMetric,
    recordError,
    getPerformanceData,
  };

  return (
    <RUMContext.Provider value={contextValue}>{children}</RUMContext.Provider>
  );
};

export const useRUM = (): RUMContextValue => {
  const context = useContext(RUMContext);
  if (!context) {
    throw new Error('useRUM must be used within a RUMProvider');
  }
  return context;
};

// HOC for tracking component performance
export function withRUMTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const TrackedComponent: React.FC<P> = props => {
    const { recordMetric, recordCustomMetric } = useRUM();
    const renderStartRef = useRef<number>(0);
    const mountTimeRef = useRef<number>(0);

    useEffect(() => {
      // Record component mount time
      mountTimeRef.current = Date.now();
      recordCustomMetric(
        `${componentName || WrappedComponent.name}_MountTime`,
        mountTimeRef.current
      );

      return () => {
        // Record component unmount time
        const unmountTime = Date.now();
        const lifespan = unmountTime - mountTimeRef.current;
        recordMetric(
          `${componentName || WrappedComponent.name}_Lifespan`,
          lifespan
        );
      };
    }, [recordMetric, recordCustomMetric]);

    useEffect(() => {
      // Record render time
      const renderTime = Date.now() - renderStartRef.current;
      if (renderTime > 0) {
        recordMetric(
          `${componentName || WrappedComponent.name}_RenderTime`,
          renderTime
        );
      }
    });

    // Record render start time
    renderStartRef.current = Date.now();

    return <WrappedComponent {...props} />;
  };

  TrackedComponent.displayName = `withRUMTracking(${componentName || WrappedComponent.displayName || WrappedComponent.name})`;

  return TrackedComponent;
}

// Hook for tracking custom interactions
export const useRUMInteraction = () => {
  const { recordMetric, recordCustomMetric } = useRUM();

  const trackInteraction = (name: string, startTime?: number) => {
    const endTime = Date.now();
    const duration = startTime ? endTime - startTime : 0;

    recordCustomMetric(`Interaction_${name}`, {
      timestamp: endTime,
      duration: duration,
    });

    if (duration > 0) {
      recordMetric(`Interaction_${name}_Duration`, duration);
    }
  };

  const trackClick = (elementName: string) => {
    recordCustomMetric(`Click_${elementName}`, Date.now());
  };

  const trackNavigation = (from: string, to: string) => {
    recordCustomMetric('Navigation', {
      from,
      to,
      timestamp: Date.now(),
    });
  };

  const trackFormSubmission = (
    formName: string,
    success: boolean,
    duration?: number
  ) => {
    recordCustomMetric(`Form_${formName}`, {
      success,
      timestamp: Date.now(),
      duration,
    });
  };

  return {
    trackInteraction,
    trackClick,
    trackNavigation,
    trackFormSubmission,
  };
};
