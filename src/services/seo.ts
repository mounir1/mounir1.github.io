import { siteConfig, navigationConfig, analyticsConfig, featureFlags } from './site';
import type { SEOMetadata, NavItem } from '@/types';

/**
 * SEO Service - Generate metadata for optimal search visibility
 */
export const seoService = {
  /**
   * Generate complete metadata object for a page
   */
  generateMetadata(overrides?: Partial<SEOMetadata>): SEOMetadata {
    return {
      title: siteConfig.title,
      description: siteConfig.description,
      keywords: siteConfig.keywords,
      ogImage: siteConfig.ogImage,
      alternateLanguages: siteConfig.alternateLanguages,
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      author: siteConfig.person.name,
      ...overrides,
    };
  },

  /**
   * Generate JSON-LD structured data for Person
   */
  generatePersonSchema() {
    const socialUrls = Object.values(siteConfig.social).filter((url): url is string => !!url);
    
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: siteConfig.person.name,
      jobTitle: siteConfig.person.role,
      description: siteConfig.description,
      url: siteConfig.url,
      image: siteConfig.ogImage,
      sameAs: socialUrls,
      worksFor: {
        '@type': 'Organization',
        name: 'Available for Hire',
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: siteConfig.person.location.split(',')[0],
        addressCountry: siteConfig.person.location.split(',')[1]?.trim() || '',
      },
      email: siteConfig.person.email,
      telephone: siteConfig.person.phone,
      knowsAbout: siteConfig.keywords.slice(0, 20),
      award: siteConfig.occupation,
    };
  },

  /**
   * Generate JSON-LD structured data for ProfessionalService
   */
  generateServiceSchema() {
    return {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      name: siteConfig.name,
      description: siteConfig.description,
      url: siteConfig.url,
      image: siteConfig.ogImage,
      priceRange: '$$$',
      address: {
        '@type': 'PostalAddress',
        addressLocality: siteConfig.person.location.split(',')[0],
        addressCountry: siteConfig.person.location.split(',')[1]?.trim() || '',
      },
      telephone: siteConfig.person.phone,
      email: siteConfig.person.email,
      makesOffer: siteConfig.services.map(service => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: service.name,
          description: service.description,
        },
      })),
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
    };
  },

  /**
   * Generate JSON-LD structured data for Website
   */
  generateWebsiteSchema() {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteConfig.name,
      description: siteConfig.description,
      url: siteConfig.url,
      publisher: {
        '@type': 'Person',
        name: siteConfig.person.name,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteConfig.url}/#search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
      inLanguage: siteConfig.language,
    };
  },

  /**
   * Generate all structured data scripts
   */
  getAllStructuredData(): string {
    const schemas = [
      this.generatePersonSchema(),
      this.generateServiceSchema(),
      this.generateWebsiteSchema(),
    ];
    
    return schemas.map(schema => 
      `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
    ).join('\n');
  },

  /**
   * Generate Open Graph metadata
   */
  generateOpenGraph(path?: string) {
    const url = path ? `${siteConfig.url}${path}` : siteConfig.url;
    
    return {
      'og:title': siteConfig.title,
      'og:description': siteConfig.description,
      'og:type': 'website',
      'og:url': url,
      'og:image': siteConfig.ogImage,
      'og:image:alt': `${siteConfig.person.name} - ${siteConfig.person.role}`,
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:secure_url': siteConfig.ogImage,
      'og:site_name': siteConfig.name,
      'og:locale': siteConfig.language,
    };
  },

  /**
   * Generate Twitter Card metadata
   */
  generateTwitterCard() {
    return {
      'twitter:card': 'summary_large_image',
      'twitter:title': siteConfig.title,
      'twitter:description': siteConfig.description,
      'twitter:image': siteConfig.ogImage,
      'twitter:creator': `@${siteConfig.social.twitter?.split('/').pop()}` || '@developer',
      'twitter:site': `@${siteConfig.social.twitter?.split('/').pop()}` || '@developer',
    };
  },

  /**
   * Generate canonical URL
   */
  generateCanonical(path?: string): string {
    return path ? `${siteConfig.url}${path}` : siteConfig.url;
  },

  /**
   * Generate hreflang tags for internationalization
   */
  generateHreflangTags(): Array<{ code: string; href: string }> {
    return siteConfig.alternateLanguages;
  },

  /**
   * Get navigation items with proper typing
   */
  getNavigation(): { main: NavItem[]; social: NavItem[] } {
    return {
      main: navigationConfig.mainNav,
      social: navigationConfig.socialNav,
    };
  },

  /**
   * Check if analytics is enabled
   */
  isAnalyticsEnabled(): boolean {
    return !!(
      analyticsConfig.googleAnalytics ||
      analyticsConfig.plausible ||
      analyticsConfig.posthog
    );
  },

  /**
   * Check if error tracking is enabled
   */
  isErrorTrackingEnabled(): boolean {
    return !!analyticsConfig.sentry;
  },
};

export default seoService;
