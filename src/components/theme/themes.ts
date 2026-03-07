/**
 * Theme configuration and design tokens
 */

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface SemanticColors {
  success: ColorPalette;
  warning: ColorPalette;
  error: ColorPalette;
  info: ColorPalette;
}

export interface ThemeColors {
  primary: ColorPalette;
  secondary: ColorPalette;
  accent: ColorPalette;
  neutral: ColorPalette;
  semantic: SemanticColors;
}

export interface TypographyConfig {
  fontFamilies: {
    sans: string[];
    mono: string[];
    heading: string[];
  };
  fontSizes: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
  };
  fontWeights: {
    thin: number;
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
  };
  lineHeights: {
    tight: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
}

export interface SpacingConfig {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
}

export interface ShadowConfig {
  soft: string;
  medium: string;
  large: string;
  glow: string;
}

export interface AnimationConfig {
  durations: {
    fast: string;
    normal: string;
    slow: string;
  };
  easings: {
    easeInOut: string;
    easeOut: string;
    easeIn: string;
    bounce: string;
    spring: string;
  };
  presets: {
    fadeIn: string;
    slideUp: string;
    scaleIn: string;
    slideInRight: string;
  };
}

export interface ThemeConfig {
  name: string;
  displayName: string;
  colors: ThemeColors;
  typography: TypographyConfig;
  spacing: SpacingConfig;
  shadows: ShadowConfig;
  animations: AnimationConfig;
}

// Default theme configuration
export const defaultTheme: ThemeConfig = {
  name: 'default',
  displayName: 'Default',
  colors: {
    primary: {
      50: 'hsl(263, 100%, 97%)',
      100: 'hsl(263, 95%, 94%)',
      200: 'hsl(263, 90%, 88%)',
      300: 'hsl(263, 85%, 80%)',
      400: 'hsl(263, 80%, 70%)',
      500: 'hsl(263, 70%, 50.4%)',
      600: 'hsl(263, 75%, 45%)',
      700: 'hsl(263, 80%, 40%)',
      800: 'hsl(263, 85%, 35%)',
      900: 'hsl(263, 90%, 30%)',
      950: 'hsl(263, 95%, 20%)',
    },
    secondary: {
      50: 'hsl(220, 14.3%, 95.9%)',
      100: 'hsl(220, 14.3%, 91%)',
      200: 'hsl(220, 14.3%, 86%)',
      300: 'hsl(220, 14.3%, 76%)',
      400: 'hsl(220, 14.3%, 66%)',
      500: 'hsl(220, 14.3%, 56%)',
      600: 'hsl(220, 14.3%, 46%)',
      700: 'hsl(220, 14.3%, 36%)',
      800: 'hsl(220, 14.3%, 26%)',
      900: 'hsl(220, 14.3%, 16%)',
      950: 'hsl(220, 14.3%, 6%)',
    },
    accent: {
      50: 'hsl(263, 100%, 97%)',
      100: 'hsl(263, 95%, 94%)',
      200: 'hsl(263, 90%, 88%)',
      300: 'hsl(263, 85%, 80%)',
      400: 'hsl(263, 80%, 70%)',
      500: 'hsl(263, 70%, 50.4%)',
      600: 'hsl(263, 75%, 45%)',
      700: 'hsl(263, 80%, 40%)',
      800: 'hsl(263, 85%, 35%)',
      900: 'hsl(263, 90%, 30%)',
      950: 'hsl(263, 95%, 20%)',
    },
    neutral: {
      50: 'hsl(0, 0%, 98%)',
      100: 'hsl(0, 0%, 96%)',
      200: 'hsl(0, 0%, 90%)',
      300: 'hsl(0, 0%, 83%)',
      400: 'hsl(0, 0%, 64%)',
      500: 'hsl(0, 0%, 45%)',
      600: 'hsl(0, 0%, 32%)',
      700: 'hsl(0, 0%, 25%)',
      800: 'hsl(0, 0%, 15%)',
      900: 'hsl(0, 0%, 9%)',
      950: 'hsl(0, 0%, 4%)',
    },
    semantic: {
      success: {
        50: 'hsl(142, 76%, 96%)',
        100: 'hsl(149, 80%, 90%)',
        200: 'hsl(152, 81%, 80%)',
        300: 'hsl(156, 72%, 67%)',
        400: 'hsl(158, 64%, 52%)',
        500: 'hsl(160, 84%, 39%)',
        600: 'hsl(161, 94%, 30%)',
        700: 'hsl(163, 94%, 24%)',
        800: 'hsl(163, 88%, 20%)',
        900: 'hsl(164, 86%, 16%)',
        950: 'hsl(166, 91%, 9%)',
      },
      warning: {
        50: 'hsl(54, 92%, 95%)',
        100: 'hsl(55, 97%, 88%)',
        200: 'hsl(53, 98%, 77%)',
        300: 'hsl(50, 98%, 64%)',
        400: 'hsl(48, 96%, 53%)',
        500: 'hsl(45, 93%, 47%)',
        600: 'hsl(41, 96%, 40%)',
        700: 'hsl(35, 91%, 33%)',
        800: 'hsl(32, 81%, 29%)',
        900: 'hsl(28, 73%, 26%)',
        950: 'hsl(23, 83%, 14%)',
      },
      error: {
        50: 'hsl(0, 86%, 97%)',
        100: 'hsl(0, 93%, 94%)',
        200: 'hsl(0, 96%, 89%)',
        300: 'hsl(0, 94%, 82%)',
        400: 'hsl(0, 91%, 71%)',
        500: 'hsl(0, 84%, 60%)',
        600: 'hsl(0, 72%, 51%)',
        700: 'hsl(0, 74%, 42%)',
        800: 'hsl(0, 70%, 35%)',
        900: 'hsl(0, 63%, 31%)',
        950: 'hsl(0, 75%, 15%)',
      },
      info: {
        50: 'hsl(214, 100%, 97%)',
        100: 'hsl(214, 95%, 93%)',
        200: 'hsl(213, 97%, 87%)',
        300: 'hsl(212, 96%, 78%)',
        400: 'hsl(213, 94%, 68%)',
        500: 'hsl(217, 91%, 60%)',
        600: 'hsl(221, 83%, 53%)',
        700: 'hsl(224, 76%, 48%)',
        800: 'hsl(226, 71%, 40%)',
        900: 'hsl(224, 64%, 33%)',
        950: 'hsl(226, 55%, 21%)',
      },
    },
  },
  typography: {
    fontFamilies: {
      sans: ['Inter', 'Space Grotesk', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      heading: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
    },
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    fontWeights: {
      thin: 100,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '2.5rem',
    '3xl': '3rem',
    '4xl': '4rem',
    '5xl': '5rem',
    '6xl': '6rem',
  },
  shadows: {
    soft: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    medium: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    large: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    glow: '0 0 0 1px rgb(263 70% 50.4% / 0.1), 0 4px 16px rgb(263 70% 50.4% / 0.12)',
  },
  animations: {
    durations: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easings: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
    presets: {
      fadeIn: 'fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
      slideUp: 'slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      scaleIn: 'scaleIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
      slideInRight: 'slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
    },
  },
};

// Theme utilities
export const themeUtils = {
  /**
   * Get CSS custom property value
   */
  getCSSVariable: (name: string): string => {
    if (typeof window === 'undefined') return '';
    return getComputedStyle(document.documentElement)
      .getPropertyValue(`--${name}`)
      .trim();
  },

  /**
   * Set CSS custom property
   */
  setCSSVariable: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    document.documentElement.style.setProperty(`--${name}`, value);
  },

  /**
   * Apply theme configuration to CSS variables
   */
  applyThemeConfig: (config: Partial<ThemeConfig>): void => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;

    // Apply colors
    if (config.colors) {
      Object.entries(config.colors).forEach(([colorName, palette]) => {
        if (typeof palette === 'object' && palette !== null) {
          Object.entries(palette).forEach(([shade, value]) => {
            root.style.setProperty(`--color-${colorName}-${shade}`, value);
          });
        }
      });
    }

    // Apply spacing
    if (config.spacing) {
      Object.entries(config.spacing).forEach(([size, value]) => {
        root.style.setProperty(`--spacing-${size}`, value);
      });
    }

    // Apply shadows
    if (config.shadows) {
      Object.entries(config.shadows).forEach(([name, value]) => {
        root.style.setProperty(`--shadow-${name}`, value);
      });
    }

    // Apply animations
    if (config.animations) {
      if (config.animations.durations) {
        Object.entries(config.animations.durations).forEach(([name, value]) => {
          root.style.setProperty(`--duration-${name}`, value);
        });
      }
      if (config.animations.easings) {
        Object.entries(config.animations.easings).forEach(([name, value]) => {
          root.style.setProperty(`--easing-${name}`, value);
        });
      }
    }
  },
};
