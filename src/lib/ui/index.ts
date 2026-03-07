/**
 * Professional UI Enhancement System Index
 * Centralized exports for all UI enhancement utilities
 */

// Design system
export * from './design-system';

// Micro-interactions and animations
export * from './micro-interactions';

// Typography system
export * from './typography';

// Initialize the complete UI system
export const initializeUISystem = async () => {
  const { initializeTypography } = await import('./typography');
  const { designSystemUtils } = await import('./design-system');

  // Initialize typography
  const fontLoader = await initializeTypography();

  // Generate and inject CSS custom properties
  const cssProperties = designSystemUtils.generateCSSCustomProperties();
  const style = document.createElement('style');
  style.textContent = `:root {\n${cssProperties}\n}`;
  document.head.appendChild(style);

  return {
    fontLoader,
    designSystemUtils,
  };
};
