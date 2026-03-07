/**
 * Modern CSS Optimization Utilities
 * Implements critical CSS, modern CSS features, and optimization strategies
 */

// Critical CSS extraction and inlining
export class CriticalCSSManager {
  private criticalCSS: string = '';
  private nonCriticalCSS: string[] = [];
  private loadedStylesheets: Set<string> = new Set();

  constructor() {
    this.extractCriticalCSS();
  }

  private extractCriticalCSS() {
    // Extract above-the-fold CSS
    const criticalSelectors = [
      'body',
      'html',
      '.header',
      '.nav',
      '.hero',
      '.loading',
      '.spinner',
      '.btn-primary',
      '.btn-secondary',
      '.card',
      '.container',
      '.grid',
      '.flex',
      // Add more critical selectors based on your design
    ];

    // In a real implementation, you'd use tools like:
    // - Critical (npm package)
    // - Puppeteer to analyze above-the-fold content
    // - PostCSS plugins

    this.criticalCSS = this.generateCriticalCSS(criticalSelectors);
  }

  private generateCriticalCSS(selectors: string[]): string {
    // This is a simplified version - in production, use proper CSS extraction tools
    return `
      /* Critical CSS - Inlined */
      body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
      .loading { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
      .spinner { animation: spin 1s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
      .btn-primary { background: #3b82f6; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; }
      .card { background: white; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
      .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
      .grid { display: grid; gap: 1rem; }
      .flex { display: flex; }
    `;
  }

  public inlineCriticalCSS(): void {
    if (typeof document === 'undefined') return;

    const style = document.createElement('style');
    style.textContent = this.criticalCSS;
    style.setAttribute('data-critical', 'true');
    document.head.insertBefore(style, document.head.firstChild);
  }

  public async loadNonCriticalCSS(href: string): Promise<void> {
    if (this.loadedStylesheets.has(href)) return;

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.media = 'print'; // Load as print to avoid render blocking
      link.onload = () => {
        link.media = 'all'; // Switch to all media after load
        this.loadedStylesheets.add(href);
        resolve();
      };
      link.onerror = reject;

      document.head.appendChild(link);
    });
  }

  public preloadCSS(href: string): void {
    if (typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    link.onload = () => {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = href;
      document.head.appendChild(stylesheet);
    };

    document.head.appendChild(link);
  }
}

// Modern CSS features detection and fallbacks
export class ModernCSSFeatures {
  private supportCache: Map<string, boolean> = new Map();

  public checkSupport(feature: string): boolean {
    if (this.supportCache.has(feature)) {
      return this.supportCache.get(feature)!;
    }

    let supported = false;

    try {
      switch (feature) {
        case 'css-grid':
          supported = CSS.supports('display', 'grid');
          break;
        case 'css-flexbox':
          supported = CSS.supports('display', 'flex');
          break;
        case 'css-custom-properties':
          supported = CSS.supports('--custom', 'property');
          break;
        case 'css-container-queries':
          supported = CSS.supports('container-type', 'inline-size');
          break;
        case 'css-subgrid':
          supported = CSS.supports('grid-template-rows', 'subgrid');
          break;
        case 'css-cascade-layers':
          supported = CSS.supports('@layer', 'base');
          break;
        case 'css-nesting':
          supported = CSS.supports('selector(&)', '&:hover');
          break;
        case 'css-has':
          supported = CSS.supports('selector(:has(*))', ':has(*)');
          break;
        case 'css-logical-properties':
          supported = CSS.supports('margin-inline-start', '1rem');
          break;
        case 'css-aspect-ratio':
          supported = CSS.supports('aspect-ratio', '16/9');
          break;
        default:
          supported = false;
      }
    } catch (error) {
      supported = false;
    }

    this.supportCache.set(feature, supported);
    return supported;
  }

  public loadPolyfills(): Promise<void[]> {
    const polyfills: Promise<void>[] = [];

    // CSS Custom Properties polyfill for IE
    if (!this.checkSupport('css-custom-properties')) {
      polyfills.push(this.loadPolyfill('css-vars-ponyfill'));
    }

    // CSS Grid polyfill for older browsers
    if (!this.checkSupport('css-grid')) {
      polyfills.push(this.loadPolyfill('css-grid-polyfill'));
    }

    // Container Queries polyfill
    if (!this.checkSupport('css-container-queries')) {
      polyfills.push(this.loadPolyfill('container-query-polyfill'));
    }

    return Promise.all(polyfills);
  }

  private async loadPolyfill(name: string): Promise<void> {
    try {
      switch (name) {
        case 'css-vars-ponyfill':
          const { default: cssVars } = await import('css-vars-ponyfill');
          cssVars();
          break;
        case 'container-query-polyfill':
          await import('container-query-polyfill');
          break;
        default:
          console.warn(`Unknown polyfill: ${name}`);
      }
    } catch (error) {
      console.warn(`Failed to load polyfill ${name}:`, error);
    }
  }

  public generateFallbackCSS(): string {
    let fallbackCSS = '';

    // Flexbox fallbacks
    if (!this.checkSupport('css-flexbox')) {
      fallbackCSS += `
        .flex { display: table; width: 100%; }
        .flex > * { display: table-cell; vertical-align: top; }
      `;
    }

    // Grid fallbacks
    if (!this.checkSupport('css-grid')) {
      fallbackCSS += `
        .grid { display: block; }
        .grid > * { display: inline-block; vertical-align: top; width: calc(50% - 0.5rem); margin: 0.25rem; }
      `;
    }

    // Custom properties fallbacks
    if (!this.checkSupport('css-custom-properties')) {
      fallbackCSS += `
        :root {
          /* Fallback values */
        }
        .primary { color: #3b82f6; }
        .secondary { color: #6b7280; }
      `;
    }

    return fallbackCSS;
  }
}

// CSS-in-JS optimization utilities
export class CSSInJSOptimizer {
  private styleCache: Map<string, HTMLStyleElement> = new Map();
  private classNameCache: Map<string, string> = new Map();

  public createOptimizedStyles(
    styles: Record<string, any>
  ): Record<string, string> {
    const optimizedStyles: Record<string, string> = {};

    Object.entries(styles).forEach(([key, value]) => {
      const styleString = this.objectToCSS(value);
      const hash = this.generateHash(styleString);
      const className = `css-${hash}`;

      if (!this.classNameCache.has(styleString)) {
        this.injectStyles(className, styleString);
        this.classNameCache.set(styleString, className);
      }

      optimizedStyles[key] = this.classNameCache.get(styleString)!;
    });

    return optimizedStyles;
  }

  private objectToCSS(obj: Record<string, any>): string {
    return Object.entries(obj)
      .map(([prop, value]) => {
        const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${cssProp}: ${value};`;
      })
      .join(' ');
  }

  private generateHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private injectStyles(className: string, styles: string): void {
    if (typeof document === 'undefined') return;

    const styleId = `css-${className}`;
    if (this.styleCache.has(styleId)) return;

    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = `.${className} { ${styles} }`;
    document.head.appendChild(styleElement);

    this.styleCache.set(styleId, styleElement);
  }

  public cleanup(): void {
    this.styleCache.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    this.styleCache.clear();
    this.classNameCache.clear();
  }
}

// CSS performance monitoring
export class CSSPerformanceMonitor {
  private metrics: {
    totalStylesheets: number;
    totalCSSSize: number;
    renderBlockingCSS: number;
    unusedCSS: number;
    criticalCSS: number;
  } = {
    totalStylesheets: 0,
    totalCSSSize: 0,
    renderBlockingCSS: 0,
    unusedCSS: 0,
    criticalCSS: 0,
  };

  public analyzeCSS(): Promise<typeof this.metrics> {
    return new Promise(resolve => {
      if (typeof document === 'undefined') {
        resolve(this.metrics);
        return;
      }

      const stylesheets = Array.from(document.styleSheets);
      this.metrics.totalStylesheets = stylesheets.length;

      let totalSize = 0;
      let renderBlocking = 0;

      stylesheets.forEach(stylesheet => {
        try {
          if (stylesheet.href) {
            // Estimate size (in production, you'd measure actual transfer size)
            const rules = Array.from(stylesheet.cssRules || []);
            const estimatedSize = rules.length * 50; // Rough estimate
            totalSize += estimatedSize;

            // Check if render-blocking
            const link = document.querySelector(
              `link[href="${stylesheet.href}"]`
            ) as HTMLLinkElement;
            if (link && link.media !== 'print' && !link.hasAttribute('async')) {
              renderBlocking++;
            }
          }
        } catch (error) {
          // Cross-origin stylesheets may throw errors
          console.warn('Cannot analyze stylesheet:', error);
        }
      });

      this.metrics.totalCSSSize = totalSize;
      this.metrics.renderBlockingCSS = renderBlocking;

      // Analyze unused CSS (simplified - in production use tools like PurgeCSS)
      this.analyzeUnusedCSS().then(unusedSize => {
        this.metrics.unusedCSS = unusedSize;
        resolve(this.metrics);
      });
    });
  }

  private async analyzeUnusedCSS(): Promise<number> {
    // This is a simplified analysis
    // In production, use tools like:
    // - PurgeCSS
    // - UnCSS
    // - Chrome DevTools Coverage API

    if (typeof document === 'undefined') return 0;

    const allElements = document.querySelectorAll('*');
    const usedClasses = new Set<string>();

    allElements.forEach(element => {
      element.classList.forEach(className => {
        usedClasses.add(className);
      });
    });

    // Estimate unused CSS (very rough approximation)
    const totalClasses = document.styleSheets.length * 100; // Rough estimate
    const unusedClasses = Math.max(0, totalClasses - usedClasses.size);

    return unusedClasses * 30; // Rough size estimate per class
  }

  public getRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.metrics.renderBlockingCSS > 2) {
      recommendations.push('Reduce render-blocking CSS files');
    }

    if (this.metrics.unusedCSS > 10000) {
      recommendations.push('Remove unused CSS to reduce bundle size');
    }

    if (this.metrics.totalCSSSize > 100000) {
      recommendations.push('Consider code splitting CSS by route or component');
    }

    if (this.metrics.criticalCSS === 0) {
      recommendations.push(
        'Implement critical CSS inlining for faster initial render'
      );
    }

    return recommendations;
  }
}

// Utility functions
export const cssOptimization = {
  // Minify CSS string
  minifyCSS: (css: string): string => {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/;\s*}/g, '}') // Remove unnecessary semicolons
      .replace(/\s*{\s*/g, '{') // Clean up braces
      .replace(/\s*}\s*/g, '}')
      .replace(/\s*;\s*/g, ';') // Clean up semicolons
      .replace(/\s*,\s*/g, ',') // Clean up commas
      .trim();
  },

  // Generate CSS custom properties from theme
  generateCSSCustomProperties: (theme: Record<string, any>): string => {
    const flattenObject = (obj: any, prefix = ''): Record<string, string> => {
      const result: Record<string, string> = {};

      Object.entries(obj).forEach(([key, value]) => {
        const newKey = prefix ? `${prefix}-${key}` : key;

        if (typeof value === 'object' && value !== null) {
          Object.assign(result, flattenObject(value, newKey));
        } else {
          result[`--${newKey}`] = String(value);
        }
      });

      return result;
    };

    const properties = flattenObject(theme);
    return Object.entries(properties)
      .map(([key, value]) => `${key}: ${value};`)
      .join('\n');
  },

  // Optimize CSS for production
  optimizeForProduction: (css: string): string => {
    let optimized = cssOptimization.minifyCSS(css);

    // Remove unused vendor prefixes (simplified)
    optimized = optimized.replace(/-webkit-[^:]+:[^;]+;/g, '');
    optimized = optimized.replace(/-moz-[^:]+:[^;]+;/g, '');

    return optimized;
  },
};

// Initialize CSS optimization
export const initializeCSSOptimization = () => {
  const criticalCSS = new CriticalCSSManager();
  const modernCSS = new ModernCSSFeatures();
  const monitor = new CSSPerformanceMonitor();

  // Inline critical CSS
  criticalCSS.inlineCriticalCSS();

  // Load modern CSS polyfills if needed
  modernCSS.loadPolyfills();

  // Monitor CSS performance
  monitor.analyzeCSS().then(metrics => {
    console.log('CSS Performance Metrics:', metrics);
    const recommendations = monitor.getRecommendations();
    if (recommendations.length > 0) {
      console.log('CSS Optimization Recommendations:', recommendations);
    }
  });

  return {
    criticalCSS,
    modernCSS,
    monitor,
  };
};
