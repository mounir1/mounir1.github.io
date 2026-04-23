/**
 * Theme system exports
 */

// Core theme provider and hooks
export { ThemeProvider } from './theme-provider';
export {
  useTheme,
  usePrefersDarkMode,
  useThemeVariables,
  useThemePersistence,
} from './use-theme';

// Theme toggle component
export { ThemeToggle } from './theme-toggle';

// Theme configuration and utilities
export {
  defaultTheme,
  themeUtils,
  type ThemeMode,
  type ThemeConfig,
  type ColorPalette,
  type SemanticColors,
  type ThemeColors,
  type TypographyConfig,
  type SpacingConfig,
  type ShadowConfig,
  type AnimationConfig,
} from './themes';

// Re-export the main hook for convenience
export { useTheme as useThemeProvider } from './theme-provider';
