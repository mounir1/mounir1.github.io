import { useEffect, useRef, useCallback, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

// Auto-save configuration
export interface AutoSaveConfig {
  key: string; // Unique key for storage
  interval?: number; // Save interval in milliseconds (default: 2000)
  storage?: 'localStorage' | 'sessionStorage' | 'custom';
  customStorage?: {
    getItem: (key: string) => Promise<string | null> | string | null;
    setItem: (key: string, value: string) => Promise<void> | void;
    removeItem: (key: string) => Promise<void> | void;
  };
  enabled?: boolean; // Enable/disable auto-save
  debounce?: boolean; // Debounce saves (default: true)
  compression?: boolean; // Compress data before saving
  encryption?: boolean; // Encrypt data (basic)
  maxRetries?: number; // Max retry attempts for failed saves
  onSave?: (data: any, key: string) => void;
  onRestore?: (data: any, key: string) => void;
  onError?: (error: Error, operation: 'save' | 'restore') => void;
  transform?: {
    serialize?: (data: any) => any;
    deserialize?: (data: any) => any;
  };
}

// Auto-save status
export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'restored';

// Auto-save return type
export interface UseAutoSaveReturn {
  status: AutoSaveStatus;
  lastSaved: Date | null;
  save: () => Promise<void>;
  restore: () => Promise<void>;
  clear: () => Promise<void>;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

// Storage utilities
class StorageManager {
  private config: AutoSaveConfig;

  constructor(config: AutoSaveConfig) {
    this.config = config;
  }

  async getItem(key: string): Promise<string | null> {
    try {
      if (this.config.customStorage) {
        return await this.config.customStorage.getItem(key);
      }

      const storage =
        this.config.storage === 'sessionStorage'
          ? sessionStorage
          : localStorage;
      return storage.getItem(key);
    } catch (error) {
      console.error('Failed to get item from storage:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (this.config.customStorage) {
        await this.config.customStorage.setItem(key, value);
        return;
      }

      const storage =
        this.config.storage === 'sessionStorage'
          ? sessionStorage
          : localStorage;
      storage.setItem(key, value);
    } catch (error) {
      console.error('Failed to set item in storage:', error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (this.config.customStorage) {
        await this.config.customStorage.removeItem(key);
        return;
      }

      const storage =
        this.config.storage === 'sessionStorage'
          ? sessionStorage
          : localStorage;
      storage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove item from storage:', error);
      throw error;
    }
  }
}

// Compression utility (simple)
function compress(data: string): string {
  // Simple compression - in a real app, use a proper compression library
  return btoa(data);
}

function decompress(data: string): string {
  try {
    return atob(data);
  } catch {
    return data; // Return as-is if decompression fails
  }
}

// Simple encryption utility (NOT for production)
function encrypt(data: string, key: string = 'default'): string {
  // Very basic encryption - use a proper encryption library in production
  return btoa(data + key);
}

function decrypt(data: string, key: string = 'default'): string {
  try {
    const decrypted = atob(data);
    return decrypted.slice(0, -key.length);
  } catch {
    return data;
  }
}

// Main auto-save hook
export const useAutoSave = <T extends Record<string, any>>(
  form: UseFormReturn<T>,
  config: AutoSaveConfig
): UseAutoSaveReturn => {
  const {
    key,
    interval = 2000,
    enabled = true,
    debounce = true,
    compression = false,
    encryption = false,
    maxRetries = 3,
    onSave,
    onRestore,
    onError,
    transform,
  } = config;

  // State
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isEnabled, setIsEnabledState] = useState(enabled);

  // Refs
  const timerRef = useRef<NodeJS.Timeout>();
  const storageManager = useRef(new StorageManager(config));
  const lastDataRef = useRef<string>('');
  const retryCountRef = useRef(0);

  // Watch form values
  const watchedValues = form.watch();
  const {
    formState: { isDirty },
  } = form;

  // Serialize data
  const serializeData = useCallback(
    (data: T): string => {
      try {
        const serialized = transform?.serialize
          ? transform.serialize(data)
          : data;
        let jsonString = JSON.stringify({
          data: serialized,
          timestamp: new Date().toISOString(),
          version: '1.0',
        });

        if (compression) {
          jsonString = compress(jsonString);
        }

        if (encryption) {
          jsonString = encrypt(jsonString, key);
        }

        return jsonString;
      } catch (error) {
        throw new Error(`Failed to serialize data: ${error}`);
      }
    },
    [transform, compression, encryption, key]
  );

  // Deserialize data
  const deserializeData = useCallback(
    (serializedData: string): T | null => {
      try {
        let jsonString = serializedData;

        if (encryption) {
          jsonString = decrypt(jsonString, key);
        }

        if (compression) {
          jsonString = decompress(jsonString);
        }

        const parsed = JSON.parse(jsonString);
        const data = transform?.deserialize
          ? transform.deserialize(parsed.data)
          : parsed.data;

        return data as T;
      } catch (error) {
        console.error('Failed to deserialize data:', error);
        return null;
      }
    },
    [transform, compression, encryption, key]
  );

  // Save function
  const save = useCallback(async (): Promise<void> => {
    if (!isEnabled) return;

    try {
      setStatus('saving');
      const currentData = form.getValues();
      const serializedData = serializeData(currentData);

      // Skip if data hasn't changed
      if (serializedData === lastDataRef.current) {
        setStatus('idle');
        return;
      }

      await storageManager.current.setItem(key, serializedData);

      lastDataRef.current = serializedData;
      setLastSaved(new Date());
      setStatus('saved');
      retryCountRef.current = 0;

      onSave?.(currentData, key);

      // Reset status after delay
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      console.error('Auto-save failed:', error);
      setStatus('error');

      onError?.(error as Error, 'save');

      // Retry logic
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        setTimeout(() => save(), 1000 * retryCountRef.current);
      } else {
        setTimeout(() => setStatus('idle'), 3000);
      }
    }
  }, [isEnabled, form, serializeData, key, onSave, onError, maxRetries]);

  // Restore function
  const restore = useCallback(async (): Promise<void> => {
    try {
      const savedData = await storageManager.current.getItem(key);
      if (!savedData) return;

      const data = deserializeData(savedData);
      if (!data) return;

      form.reset(data);
      lastDataRef.current = savedData;
      setStatus('restored');

      onRestore?.(data, key);

      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to restore auto-saved data:', error);
      onError?.(error as Error, 'restore');
    }
  }, [key, deserializeData, form, onRestore, onError]);

  // Clear function
  const clear = useCallback(async (): Promise<void> => {
    try {
      await storageManager.current.removeItem(key);
      lastDataRef.current = '';
      setLastSaved(null);
    } catch (error) {
      console.error('Failed to clear auto-saved data:', error);
    }
  }, [key]);

  // Set enabled state
  const setEnabled = useCallback((enabled: boolean) => {
    setIsEnabledState(enabled);
    if (!enabled && timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (!isEnabled || !isDirty) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (debounce) {
      timerRef.current = setTimeout(() => {
        save();
      }, interval);
    } else {
      save();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [watchedValues, isEnabled, isDirty, debounce, interval, save]);

  // Restore on mount
  useEffect(() => {
    if (isEnabled) {
      restore();
    }
  }, [isEnabled, restore]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    status,
    lastSaved,
    save,
    restore,
    clear,
    isEnabled,
    setEnabled,
  };
};

// Utility hook for form auto-save with default configuration
export const useFormAutoSave = <T extends Record<string, any>>(
  form: UseFormReturn<T>,
  key: string,
  options?: Partial<AutoSaveConfig>
): UseAutoSaveReturn => {
  const config: AutoSaveConfig = {
    key: `form-autosave-${key}`,
    interval: 2000,
    storage: 'localStorage',
    enabled: true,
    debounce: true,
    compression: false,
    encryption: false,
    maxRetries: 3,
    ...options,
  };

  return useAutoSave(form, config);
};

// Hook for auto-save with visual feedback
export const useAutoSaveWithStatus = <T extends Record<string, any>>(
  form: UseFormReturn<T>,
  key: string,
  options?: Partial<AutoSaveConfig>
) => {
  const autoSave = useFormAutoSave(form, key, options);

  const getStatusMessage = useCallback((): string => {
    switch (autoSave.status) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Saved';
      case 'error':
        return 'Save failed';
      case 'restored':
        return 'Restored from auto-save';
      default:
        return '';
    }
  }, [autoSave.status]);

  const getStatusColor = useCallback((): string => {
    switch (autoSave.status) {
      case 'saving':
        return 'text-blue-500';
      case 'saved':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'restored':
        return 'text-orange-500';
      default:
        return 'text-muted-foreground';
    }
  }, [autoSave.status]);

  return {
    ...autoSave,
    statusMessage: getStatusMessage(),
    statusColor: getStatusColor(),
  };
};

export default useAutoSave;
