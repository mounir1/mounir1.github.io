// Analytics utility functions for modern web applications

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

/**
 * Core analytics tracking function
 * @param eventName - Name of the event to track
 * @param eventData - Additional data for the event
 */
export const trackEvent = (
  eventName: string,
  eventData: Record<string, unknown> = {}
) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      timestamp: Date.now(),
      page: window.location.pathname,
      ...eventData,
    });
  }
};

/**
 * Track button clicks with comprehensive data
 * @param buttonName - Name of the button
 * @param additionalData - Additional data to track
 */
export const trackButtonClick = (
  buttonName: string,
  additionalData: Record<string, unknown> = {}
) => {
  trackEvent('button_click', {
    category: 'engagement',
    label: buttonName,
    button_name: buttonName,
    button_location: additionalData.location || 'unknown',
    button_type: additionalData.type || 'primary',
    user_action: 'click',
    ...additionalData,
  });
};

/**
 * Track form submissions with comprehensive data
 * @param formName - Name of the form
 * @param additionalData - Additional data to track
 */
export const trackFormSubmit = (
  formName: string,
  additionalData: Record<string, unknown> = {}
) => {
  trackEvent('form_submit', {
    category: 'engagement',
    label: formName,
    form_name: formName,
    form_location: additionalData.location || 'unknown',
    form_status: additionalData.status || 'submitted',
    user_action: 'submit',
    ...additionalData,
  });
};

/**
 * Track page views with comprehensive data
 * @param pageName - Name of the page
 * @param additionalData - Additional data to track
 */
export const trackPageView = (
  pageName: string,
  additionalData: Record<string, unknown> = {}
) => {
  trackEvent('page_view', {
    category: 'navigation',
    label: pageName,
    page_name: pageName,
    page_url: window.location.href,
    page_title: document.title,
    referrer: document.referrer,
    ...additionalData,
  });
};

/**
 * Track skill interactions
 * @param skillName - Name of the skill
 * @param action - Action performed (click, hover, filter)
 * @param additionalData - Additional data to track
 */
export const trackSkillInteraction = (
  skillName: string,
  action: string,
  additionalData: Record<string, unknown> = {}
) => {
  trackEvent('skill_interaction', {
    category: 'skills',
    label: skillName,
    skill_name: skillName,
    action: action,
    skill_category: additionalData.category || 'unknown',
    skill_level: additionalData.level || 'unknown',
    ...additionalData,
  });
};

/**
 * Track project interactions
 * @param projectName - Name of the project
 * @param action - Action performed (view, click, filter)
 * @param additionalData - Additional data to track
 */
export const trackProjectInteraction = (
  projectName: string,
  action: string,
  additionalData: Record<string, unknown> = {}
) => {
  trackEvent('project_interaction', {
    category: 'projects',
    label: projectName,
    project_name: projectName,
    action: action,
    project_category: additionalData.category || 'unknown',
    project_status: additionalData.status || 'unknown',
    ...additionalData,
  });
};

/**
 * Track admin actions
 * @param action - Admin action performed
 * @param additionalData - Additional data to track
 */
export const trackAdminAction = (
  action: string,
  additionalData: Record<string, unknown> = {}
) => {
  trackEvent('admin_action', {
    category: 'admin',
    label: action,
    admin_action: action,
    admin_section: additionalData.section || 'unknown',
    admin_user: additionalData.user || 'unknown',
    ...additionalData,
  });
};

/**
 * Track error events
 * @param errorType - Type of error
 * @param errorMessage - Error message
 * @param additionalData - Additional data to track
 */
export const trackError = (
  errorType: string,
  errorMessage: string,
  additionalData: Record<string, unknown> = {}
) => {
  trackEvent('error', {
    category: 'error',
    label: errorType,
    error_type: errorType,
    error_message: errorMessage,
    error_location: additionalData.location || 'unknown',
    ...additionalData,
  });
};

/**
 * Initialize analytics tracking
 */
export const initializeAnalytics = () => {
  if (typeof window !== 'undefined') {
    // Initialize dataLayer if it doesn't exist
    if (!window.dataLayer) {
      window.dataLayer = [];
    }

    // Track initial page view
    trackPageView(window.location.pathname, {
      page_load_time: performance.now(),
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
    });
  }
};
