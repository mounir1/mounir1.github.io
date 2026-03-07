/**
 * Professional Typography System
 * Advanced typography utilities, font loading, and text styling
 */

// Typography scale and hierarchy
export const typographyScale = {
  // Display text (for hero sections, large headings)
  display: {
    '2xl': {
      fontSize: '4.5rem', // 72px
      lineHeight: '1',
      letterSpacing: '-0.025em',
      fontWeight: '800',
    },
    xl: {
      fontSize: '3.75rem', // 60px
      lineHeight: '1',
      letterSpacing: '-0.025em',
      fontWeight: '800',
    },
    lg: {
      fontSize: '3rem', // 48px
      lineHeight: '1.1',
      letterSpacing: '-0.025em',
      fontWeight: '700',
    },
    md: {
      fontSize: '2.25rem', // 36px
      lineHeight: '1.2',
      letterSpacing: '-0.025em',
      fontWeight: '700',
    },
    sm: {
      fontSize: '1.875rem', // 30px
      lineHeight: '1.3',
      letterSpacing: '-0.025em',
      fontWeight: '600',
    },
  },

  // Headings (for section titles, card headers)
  heading: {
    h1: {
      fontSize: '2.25rem', // 36px
      lineHeight: '1.2',
      letterSpacing: '-0.025em',
      fontWeight: '700',
    },
    h2: {
      fontSize: '1.875rem', // 30px
      lineHeight: '1.3',
      letterSpacing: '-0.025em',
      fontWeight: '600',
    },
    h3: {
      fontSize: '1.5rem', // 24px
      lineHeight: '1.4',
      letterSpacing: '-0.025em',
      fontWeight: '600',
    },
    h4: {
      fontSize: '1.25rem', // 20px
      lineHeight: '1.4',
      letterSpacing: '0',
      fontWeight: '600',
    },
    h5: {
      fontSize: '1.125rem', // 18px
      lineHeight: '1.5',
      letterSpacing: '0',
      fontWeight: '500',
    },
    h6: {
      fontSize: '1rem', // 16px
      lineHeight: '1.5',
      letterSpacing: '0',
      fontWeight: '500',
    },
  },

  // Body text (for paragraphs, descriptions)
  body: {
    xl: {
      fontSize: '1.25rem', // 20px
      lineHeight: '1.7',
      letterSpacing: '0',
      fontWeight: '400',
    },
    lg: {
      fontSize: '1.125rem', // 18px
      lineHeight: '1.6',
      letterSpacing: '0',
      fontWeight: '400',
    },
    md: {
      fontSize: '1rem', // 16px
      lineHeight: '1.6',
      letterSpacing: '0',
      fontWeight: '400',
    },
    sm: {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.5',
      letterSpacing: '0',
      fontWeight: '400',
    },
    xs: {
      fontSize: '0.75rem', // 12px
      lineHeight: '1.4',
      letterSpacing: '0.025em',
      fontWeight: '400',
    },
  },

  // Labels and captions
  label: {
    lg: {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.4',
      letterSpacing: '0.025em',
      fontWeight: '500',
    },
    md: {
      fontSize: '0.75rem', // 12px
      lineHeight: '1.4',
      letterSpacing: '0.05em',
      fontWeight: '500',
    },
    sm: {
      fontSize: '0.6875rem', // 11px
      lineHeight: '1.3',
      letterSpacing: '0.05em',
      fontWeight: '500',
    },
  },

  // Code and monospace
  code: {
    lg: {
      fontSize: '1rem', // 16px
      lineHeight: '1.6',
      letterSpacing: '0',
      fontWeight: '400',
    },
    md: {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.5',
      letterSpacing: '0',
      fontWeight: '400',
    },
    sm: {
      fontSize: '0.75rem', // 12px
      lineHeight: '1.4',
      letterSpacing: '0',
      fontWeight: '400',
    },
  },
};

// Font families and loading
export const fontFamilies = {
  sans: {
    name: 'Inter',
    fallback: [
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'sans-serif',
    ],
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    styles: ['normal', 'italic'],
    display: 'swap',
  },

  serif: {
    name: 'Playfair Display',
    fallback: ['Georgia', 'Times New Roman', 'serif'],
    weights: [400, 500, 600, 700, 800, 900],
    styles: ['normal', 'italic'],
    display: 'swap',
  },

  mono: {
    name: 'JetBrains Mono',
    fallback: ['Fira Code', 'Monaco', 'Consolas', 'Courier New', 'monospace'],
    weights: [100, 200, 300, 400, 500, 600, 700, 800],
    styles: ['normal', 'italic'],
    display: 'swap',
  },

  display: {
    name: 'Cal Sans',
    fallback: ['Inter', 'system-ui', 'sans-serif'],
    weights: [400, 500, 600, 700],
    styles: ['normal'],
    display: 'swap',
  },
};

// Font loading utilities
export class FontLoader {
  private loadedFonts: Set<string> = new Set();
  private loadingPromises: Map<string, Promise<void>> = new Map();

  async loadFont(
    fontFamily: keyof typeof fontFamilies,
    weights?: number[]
  ): Promise<void> {
    const font = fontFamilies[fontFamily];
    const fontKey = `${font.name}-${weights?.join(',') || 'all'}`;

    if (this.loadedFonts.has(fontKey)) {
      return;
    }

    if (this.loadingPromises.has(fontKey)) {
      return this.loadingPromises.get(fontKey);
    }

    const loadPromise = this.loadFontFromGoogle(font, weights);
    this.loadingPromises.set(fontKey, loadPromise);

    try {
      await loadPromise;
      this.loadedFonts.add(fontKey);
    } catch (error) {
      console.warn(`Failed to load font ${font.name}:`, error);
    } finally {
      this.loadingPromises.delete(fontKey);
    }
  }

  private async loadFontFromGoogle(
    font: (typeof fontFamilies)[keyof typeof fontFamilies],
    weights?: number[]
  ): Promise<void> {
    const weightsToLoad = weights || font.weights;
    const weightString = weightsToLoad.join(';');
    const styleString = font.styles.includes('italic') ? 'ital,' : '';

    const fontUrl = `https://fonts.googleapis.com/css2?family=${font.name.replace(' ', '+')}:${styleString}wght@${weightString}&display=${font.display}`;

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fontUrl;
      link.onload = () => resolve();
      link.onerror = () =>
        reject(new Error(`Failed to load font: ${font.name}`));

      document.head.appendChild(link);
    });
  }

  async preloadFonts(): Promise<void> {
    const promises = [
      this.loadFont('sans', [400, 500, 600, 700]),
      this.loadFont('display', [600, 700]),
    ];

    await Promise.allSettled(promises);
  }

  getFontStack(fontFamily: keyof typeof fontFamilies): string {
    const font = fontFamilies[fontFamily];
    return [font.name, ...font.fallback]
      .map(f => (f.includes(' ') ? `"${f}"` : f))
      .join(', ');
  }
}

// Typography utility classes
export const typographyClasses = {
  // Font families
  fontSans: 'font-sans',
  fontSerif: 'font-serif',
  fontMono: 'font-mono',
  fontDisplay: 'font-display',

  // Font weights
  fontThin: 'font-thin',
  fontExtralight: 'font-extralight',
  fontLight: 'font-light',
  fontNormal: 'font-normal',
  fontMedium: 'font-medium',
  fontSemibold: 'font-semibold',
  fontBold: 'font-bold',
  fontExtrabold: 'font-extrabold',
  fontBlack: 'font-black',

  // Font styles
  italic: 'italic',
  notItalic: 'not-italic',

  // Text alignment
  textLeft: 'text-left',
  textCenter: 'text-center',
  textRight: 'text-right',
  textJustify: 'text-justify',

  // Text decoration
  underline: 'underline',
  overline: 'overline',
  lineThrough: 'line-through',
  noUnderline: 'no-underline',

  // Text transform
  uppercase: 'uppercase',
  lowercase: 'lowercase',
  capitalize: 'capitalize',
  normalCase: 'normal-case',

  // Text overflow
  truncate: 'truncate',
  textEllipsis: 'text-ellipsis',
  textClip: 'text-clip',

  // Whitespace
  whitespaceNormal: 'whitespace-normal',
  whitespaceNowrap: 'whitespace-nowrap',
  whitespacePre: 'whitespace-pre',
  whitespacePreLine: 'whitespace-pre-line',
  whitespacePreWrap: 'whitespace-pre-wrap',

  // Word break
  breakNormal: 'break-normal',
  breakWords: 'break-words',
  breakAll: 'break-all',
};

// Advanced text effects
export const textEffects = {
  // Gradient text
  gradientText: {
    primary:
      'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
    secondary:
      'bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent',
    rainbow:
      'bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent',
    sunset:
      'bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent',
    ocean:
      'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent',
  },

  // Text shadows
  textShadow: {
    sm: 'drop-shadow-sm',
    base: 'drop-shadow',
    md: 'drop-shadow-md',
    lg: 'drop-shadow-lg',
    xl: 'drop-shadow-xl',
    '2xl': 'drop-shadow-2xl',
    none: 'drop-shadow-none',
  },

  // Text glow effects
  textGlow: {
    primary: 'text-primary drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]',
    secondary: 'text-secondary drop-shadow-[0_0_10px_rgba(107,114,128,0.5)]',
    success: 'text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]',
    warning: 'text-yellow-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]',
    error: 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]',
  },
};

// Responsive typography utilities
export const responsiveTypography = {
  // Responsive font sizes
  responsive: {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl',
    '2xl': 'text-2xl sm:text-3xl',
    '3xl': 'text-3xl sm:text-4xl',
    '4xl': 'text-4xl sm:text-5xl',
    '5xl': 'text-5xl sm:text-6xl',
  },

  // Responsive line heights
  responsiveLeading: {
    tight: 'leading-tight sm:leading-snug',
    normal: 'leading-normal sm:leading-relaxed',
    relaxed: 'leading-relaxed sm:leading-loose',
  },
};

// Typography component generator
export const createTypographyComponent = (
  element: keyof JSX.IntrinsicElements,
  variant: string,
  className?: string
) => {
  const Component = ({ children, ...props }: any) => {
    const Element = element as any;
    return (
      <Element className={`${variant} ${className || ''}`} {...props}>
        {children}
      </Element>
    );
  };

  Component.displayName = `Typography${element.charAt(0).toUpperCase() + element.slice(1)}`;
  return Component;
};

// Pre-built typography components
export const Typography = {
  // Display components
  DisplayXL: createTypographyComponent(
    'h1',
    'text-6xl font-extrabold leading-none tracking-tight'
  ),
  DisplayLG: createTypographyComponent(
    'h1',
    'text-5xl font-bold leading-tight tracking-tight'
  ),
  DisplayMD: createTypographyComponent(
    'h1',
    'text-4xl font-bold leading-tight tracking-tight'
  ),
  DisplaySM: createTypographyComponent(
    'h1',
    'text-3xl font-semibold leading-tight tracking-tight'
  ),

  // Heading components
  H1: createTypographyComponent(
    'h1',
    'text-4xl font-bold leading-tight tracking-tight'
  ),
  H2: createTypographyComponent(
    'h2',
    'text-3xl font-semibold leading-tight tracking-tight'
  ),
  H3: createTypographyComponent(
    'h3',
    'text-2xl font-semibold leading-tight tracking-tight'
  ),
  H4: createTypographyComponent('h4', 'text-xl font-semibold leading-snug'),
  H5: createTypographyComponent('h5', 'text-lg font-medium leading-snug'),
  H6: createTypographyComponent('h6', 'text-base font-medium leading-snug'),

  // Body components
  BodyXL: createTypographyComponent('p', 'text-xl leading-relaxed'),
  BodyLG: createTypographyComponent('p', 'text-lg leading-relaxed'),
  Body: createTypographyComponent('p', 'text-base leading-normal'),
  BodySM: createTypographyComponent('p', 'text-sm leading-normal'),
  BodyXS: createTypographyComponent('p', 'text-xs leading-normal'),

  // Label components
  LabelLG: createTypographyComponent(
    'label',
    'text-sm font-medium leading-none'
  ),
  Label: createTypographyComponent(
    'label',
    'text-xs font-medium leading-none tracking-wide'
  ),
  LabelSM: createTypographyComponent(
    'label',
    'text-xs font-medium leading-none tracking-wider'
  ),

  // Code components
  Code: createTypographyComponent(
    'code',
    'font-mono text-sm bg-muted px-1 py-0.5 rounded'
  ),
  CodeBlock: createTypographyComponent(
    'pre',
    'font-mono text-sm bg-muted p-4 rounded-lg overflow-x-auto'
  ),

  // Special components
  Lead: createTypographyComponent(
    'p',
    'text-xl text-muted-foreground leading-relaxed'
  ),
  Muted: createTypographyComponent('p', 'text-sm text-muted-foreground'),
  Small: createTypographyComponent('small', 'text-xs text-muted-foreground'),
  Quote: createTypographyComponent(
    'blockquote',
    'border-l-4 border-primary pl-4 italic text-muted-foreground'
  ),
};

// Typography utilities
export const typographyUtils = {
  // Calculate optimal line height
  calculateLineHeight: (fontSize: number): number => {
    if (fontSize <= 14) return 1.5;
    if (fontSize <= 18) return 1.4;
    if (fontSize <= 24) return 1.3;
    if (fontSize <= 36) return 1.2;
    return 1.1;
  },

  // Calculate optimal letter spacing
  calculateLetterSpacing: (fontSize: number): string => {
    if (fontSize >= 48) return '-0.025em';
    if (fontSize >= 24) return '-0.015em';
    if (fontSize <= 12) return '0.025em';
    return '0em';
  },

  // Generate font size scale
  generateFontScale: (baseSize = 16, ratio = 1.25): number[] => {
    const sizes = [baseSize];

    // Generate larger sizes
    for (let i = 1; i <= 8; i++) {
      sizes.push(Math.round(baseSize * Math.pow(ratio, i)));
    }

    // Generate smaller sizes
    for (let i = 1; i <= 3; i++) {
      sizes.unshift(Math.round(baseSize / Math.pow(ratio, i)));
    }

    return sizes.sort((a, b) => a - b);
  },

  // Check text contrast ratio
  checkContrast: (foreground: string, background: string): number => {
    // Simplified contrast calculation
    // In production, use a proper color contrast library
    const getLuminance = (color: string): number => {
      // This is a simplified version - use a proper color library in production
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;

      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);

    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  },
};

// Initialize typography system
export const initializeTypography = async (): Promise<FontLoader> => {
  const fontLoader = new FontLoader();

  // Preload critical fonts
  await fontLoader.preloadFonts();

  // Add font CSS custom properties
  const root = document.documentElement;
  Object.entries(fontFamilies).forEach(([key, font]) => {
    root.style.setProperty(
      `--font-${key}`,
      fontLoader.getFontStack(key as keyof typeof fontFamilies)
    );
  });

  return fontLoader;
};
