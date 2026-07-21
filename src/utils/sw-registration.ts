// Service Worker Registration and Management
const SW_URL = '/sw.js';
const isProduction = import.meta.env.PROD;
const isDevelopment = import.meta.env.DEV;

interface ServiceWorkerMessage {
  type: string;
  payload?: unknown;
}

export class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private isSupported: boolean = false;
  private isRegistered: boolean = false;
  private updateAvailable: boolean = false;

  constructor() {
    this.isSupported = 'serviceWorker' in navigator;
  }

  // Register service worker
  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported) {
      console.log('Service Worker not supported');
      return null;
    }

    // Only register in production or if explicitly enabled in development
    if (!isProduction && !isDevelopment) {
      console.log('Service Worker registration skipped (not production)');
      return null;
    }

    try {
      console.log('Registering Service Worker...');
      
      this.registration = await navigator.serviceWorker.register(SW_URL, {
        scope: '/',
        updateViaCache: 'imports'
      });

      this.isRegistered = true;
      console.log('Service Worker registered successfully:', this.registration.scope);

      // Set up event listeners
      this.setupEventListeners();
      
      // Check for updates
      this.checkForUpdates();
      
      return this.registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  // Set up service worker event listeners
  private setupEventListeners(): void {
    if (!this.registration) return;

    // Listen for service worker updates
    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration!.installing;
      if (newWorker) {
        console.log('New Service Worker installing...');
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New Service Worker installed, update available');
            this.updateAvailable = true;
            this.notifyUpdateAvailable();
          }
        });
      }
    });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      this.handleMessage(event.data);
    });

    // Listen for controller changes (when new SW takes over)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service Worker controller changed');
      if (this.updateAvailable) {
        window.location.reload();
      }
    });
  }

  // Handle messages from service worker
  private handleMessage(message: ServiceWorkerMessage): void {
    console.log('Message from Service Worker:', message);
    
    switch (message.type) {
      case 'CACHE_UPDATED':
        console.log('Cache updated by Service Worker');
        break;
      case 'OFFLINE_READY':
        console.log('App ready for offline use');
        this.notifyOfflineReady();
        break;
      case 'UPDATE_AVAILABLE':
        this.updateAvailable = true;
        this.notifyUpdateAvailable();
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  // Check for service worker updates
  async checkForUpdates(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.update();
      console.log('Checked for Service Worker updates');
    } catch (error) {
      console.error('Failed to check for Service Worker updates:', error);
    }
  }

  // Send message to service worker
  sendMessage(message: ServiceWorkerMessage): void {
    if (!navigator.serviceWorker.controller) {
      console.warn('No active Service Worker to send message to');
      return;
    }

    navigator.serviceWorker.controller.postMessage(message);
  }

  // Skip waiting and activate new service worker
  skipWaiting(): void {
    if (!this.registration?.waiting) return;
    
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  // Update cache manually
  updateCache(): void {
    this.sendMessage({ type: 'UPDATE_CACHE' });
  }

  // Notify user that update is available
  private notifyUpdateAvailable(): void {
    // Dispatch custom event for UI components to listen to
    const event = new CustomEvent('sw-update-available', {
      detail: { registration: this.registration }
    });
    window.dispatchEvent(event);

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification('Update Available', {
        body: 'A new version of the portfolio is available. Refresh to update.',
        icon: '/mounir-icon.svg',
        tag: 'update-available'
      });
    }
  }

  // Notify user that app is ready for offline use
  private notifyOfflineReady(): void {
    const event = new CustomEvent('sw-offline-ready');
    window.dispatchEvent(event);
  }

  // Get registration status
  getStatus() {
    return {
      isSupported: this.isSupported,
      isRegistered: this.isRegistered,
      updateAvailable: this.updateAvailable,
      registration: this.registration
    };
  }

  // Unregister service worker (for development/testing)
  async unregister(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      const success = await this.registration.unregister();
      if (success) {
        console.log('Service Worker unregistered successfully');
        this.registration = null;
        this.isRegistered = false;
      }
      return success;
    } catch (error) {
      console.error('Failed to unregister Service Worker:', error);
      return false;
    }
  }
}

// Singleton instance
export const swManager = new ServiceWorkerManager();

// Helper functions for easy use
export const registerServiceWorker = () => swManager.register();
export const checkForUpdates = () => swManager.checkForUpdates();
export const skipWaiting = () => swManager.skipWaiting();
export const updateCache = () => swManager.updateCache();

// React hook for service worker status
import { useState, useEffect } from 'react';

export function useServiceWorker() {
  const [status, setStatus] = useState(swManager.getStatus());
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  useEffect(() => {
    // Register service worker on mount
    swManager.register();

    // Update status when events occur
    const updateStatus = () => setStatus(swManager.getStatus());

    // Listen for custom events
    const handleUpdateAvailable = () => {
      updateStatus();
      setShowUpdatePrompt(true);
    };

    const handleOfflineReady = () => {
      updateStatus();
      console.log('App ready for offline use');
    };

    window.addEventListener('sw-update-available', handleUpdateAvailable);
    window.addEventListener('sw-offline-ready', handleOfflineReady);

    // Check for updates periodically
    const updateInterval = setInterval(() => {
      swManager.checkForUpdates();
    }, 60000); // Check every minute

    return () => {
      window.removeEventListener('sw-update-available', handleUpdateAvailable);
      window.removeEventListener('sw-offline-ready', handleOfflineReady);
      clearInterval(updateInterval);
    };
  }, []);

  const installUpdate = () => {
    swManager.skipWaiting();
    setShowUpdatePrompt(false);
  };

  const dismissUpdate = () => {
    setShowUpdatePrompt(false);
  };

  return {
    ...status,
    showUpdatePrompt,
    installUpdate,
    dismissUpdate,
    checkForUpdates: () => swManager.checkForUpdates(),
    updateCache: () => swManager.updateCache()
  };
}

// Utility to request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'default') {
    return await Notification.requestPermission();
  }

  return Notification.permission;
}
