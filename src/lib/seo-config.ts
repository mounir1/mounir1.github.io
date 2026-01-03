/**
 * SEO & Metadata Configuration
 * Optimized meta tags, structured data, and accessibility settings
 */

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  author: string;
  canonical: string;
  ogImage: string;
  ogUrl: string;
  twitterHandle: string;
  locale: string;
}

export interface StructuredData {
  "@context": string;
  "@type": string;
  [key: string]: unknown;
}

/**
 * Main portfolio SEO configuration
 */
export const portfolioSEO: SEOConfig = {
  title: "Mounir Abderrahmani | Full-Stack Developer & PIM Integration Specialist",
  description:
    "Expert full-stack developer specializing in PIM (Akeneo, Pimcore) & Magento 2 integrations. Solving complex enterprise integration challenges for global businesses.",
  keywords: [
    "Full-Stack Developer",
    "PIM Integration",
    "Akeneo Expert",
    "Pimcore Developer",
    "Magento 2 Integration",
    "Node.js Developer",
    "React Developer",
    "ETL Pipelines",
    "Enterprise Architecture",
    "Product Information Management",
    "eCommerce Solutions",
    "Web Developer",
    "TypeScript",
    "Freelance Developer",
    "Web Developer for Hire",
  ],
  author: "Mounir Abderrahmani",
  canonical: "https://mounir1.github.io",
  ogImage: "https://mounir1.github.io/og-image.jpg",
  ogUrl: "https://mounir1.github.io",
  twitterHandle: "@MounirAbderrah1",
  locale: "en_US",
};

/**
 * Page-specific SEO configurations
 */
export const pagesSEO: Record<string, Partial<SEOConfig>> = {
  home: {
    title: "Mounir Abderrahmani | Full-Stack Developer & PIM Specialist",
    description:
      "Expert in PIM integrations (Akeneo, Pimcore) and Magento 2. Bridging Product Information Management and eCommerce platforms.",
  },
  projects: {
    title: "Portfolio Projects | Mounir Abderrahmani",
    description:
      "View case studies and featured projects showcasing PIM integrations, Magento development, and enterprise solutions.",
  },
  pimExpertise: {
    title: "PIM & Integration Expertise | Mounir Abderrahmani",
    description:
      "Deep expertise in Akeneo, Pimcore, and Magento 2 integrations. ETL pipelines, data architecture, and multi-channel publishing.",
  },
  contact: {
    title: "Contact Mounir | Full-Stack Developer",
    description:
      "Get in touch for PIM consulting, Magento development, or enterprise integration projects.",
  },
};

/**
 * Schema.org structured data for Person
 */
export const getPersonSchema = (overrides: Record<string, unknown> = {}): StructuredData => ({
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Mounir Abderrahmani",
  url: "https://mounir1.github.io",
  image: "https://mounir1.github.io/mounir-avatar.jpg",
  description:
    "Full-Stack Developer & PIM Integration Specialist",
  jobTitle: "Senior Full-Stack Developer",
  sameAs: [
    "https://linkedin.com/in/mounir-abderrahmani",
    "https://github.com/mounir1",
    "https://twitter.com/MounirAbderrah1",
  ],
  email: "mounir.webdev@gmail.com",
  address: {
    "@type": "PostalAddress",
    addressCountry: "DZ",
    addressLocality: "Algiers",
  },
  knowsAbout: [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "Magento 2",
    "Akeneo",
    "Pimcore",
    "PostgreSQL",
    "Docker",
    "AWS",
  ],
  ...overrides,
});

/**
 * Schema.org structured data for breadcrumb navigation
 */
export const getBreadcrumbSchema = (items: Array<{ name: string; url: string }>): StructuredData => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

/**
 * Schema.org structured data for articles/case studies
 */
export const getArticleSchema = (article: {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  author: string;
  url: string;
}): StructuredData => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: article.title,
  description: article.description,
  image: article.image,
  datePublished: article.datePublished,
  author: {
    "@type": "Person",
    name: article.author,
    url: "https://mounir1.github.io",
  },
  url: article.url,
  publisher: {
    "@type": "Organization",
    name: "Mounir Abderrahmani",
    logo: {
      "@type": "ImageObject",
      url: "https://mounir1.github.io/logo.svg",
    },
  },
});

/**
 * OpenGraph meta tags generator
 */
export const getOpenGraphTags = (config: {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: string;
}): Record<string, string> => ({
  "og:title": config.title,
  "og:description": config.description,
  "og:image": config.image,
  "og:url": config.url,
  "og:type": config.type || "website",
  "og:site_name": "Mounir Abderrahmani",
});

/**
 * Twitter Card meta tags generator
 */
export const getTwitterCardTags = (config: {
  title: string;
  description: string;
  image: string;
  creator: string;
}): Record<string, string> => ({
  "twitter:card": "summary_large_image",
  "twitter:title": config.title,
  "twitter:description": config.description,
  "twitter:image": config.image,
  "twitter:creator": config.creator,
});

/**
 * Build complete meta tags object
 */
export const buildMetaTags = (config: {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url: string;
  author?: string;
  twitterHandle?: string;
}): Record<string, string> => {
  const tags: Record<string, string> = {
    charset: "UTF-8",
    viewport: "width=device-width, initial-scale=1.0",
    "X-UA-Compatible": "ie=edge",
    description: config.description,
    keywords: (config.keywords || []).join(", "),
    author: config.author || "Mounir Abderrahmani",
    "theme-color": "#000000",
  };

  // Add OpenGraph tags
  const ogTags = getOpenGraphTags({
    title: config.title,
    description: config.description,
    image: config.image || portfolioSEO.ogImage,
    url: config.url,
  });
  Object.assign(tags, ogTags);

  // Add Twitter Card tags
  const twitterTags = getTwitterCardTags({
    title: config.title,
    description: config.description,
    image: config.image || portfolioSEO.ogImage,
    creator: config.twitterHandle || "@MounirAbderrah1",
  });
  Object.assign(tags, twitterTags);

  return tags;
};

/**
 * Service worker meta tags for PWA
 */
export const getPWAMetaTags = (): Record<string, string> => ({
  "apple-mobile-web-app-capable": "yes",
  "apple-mobile-web-app-status-bar-style": "black-translucent",
  "apple-mobile-web-app-title": "Mounir Portfolio",
  "msapplication-TileColor": "#000000",
  "msapplication-config": "/browserconfig.xml",
});

/**
 * Preconnect and prefetch links for performance
 */
export const getPreloadLinks = (): Array<{
  rel: string;
  href: string;
  as?: string;
  crossOrigin?: string;
}> => [
  // DNS prefetch
  { rel: "dns-prefetch", href: "https://fonts.googleapis.com" },
  { rel: "dns-prefetch", href: "https://fonts.gstatic.com" },
  { rel: "dns-prefetch", href: "https://cdn.jsdelivr.net" },

  // Preconnect
  { rel: "preconnect", href: "https://fonts.googleapis.com", crossOrigin: "anonymous" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },

  // Prefetch
  { rel: "prefetch", href: "/images/hero-bg.jpg" },
  { rel: "prefetch", href: "/fonts/inter-var.woff2", as: "font", crossOrigin: "anonymous" },
];

/**
 * Accessibility configuration
 */
export const a11yConfig = {
  skipLinks: {
    mainContent: "Skip to main content",
    navigation: "Skip to navigation",
    footer: "Skip to footer",
  },
  ariaLabels: {
    navMenu: "Main navigation menu",
    mobileMenu: "Mobile navigation menu",
    search: "Search portfolio projects",
    themeToggle: "Toggle dark/light theme",
    contactForm: "Contact form",
    externalLink: "Opens in new window",
  },
  roles: {
    mainNav: "navigation",
    siteFooter: "contentinfo",
    pagination: "navigation",
  },
};

/**
 * JSON-LD structured data helper
 */
export const injectStructuredData = (data: StructuredData): void => {
  if (typeof document === "undefined") return;

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.innerHTML = JSON.stringify(data);
  document.head.appendChild(script);
};

/**
 * Set meta tags dynamically
 */
export const setMetaTags = (tags: Record<string, string>): void => {
  if (typeof document === "undefined") return;

  Object.entries(tags).forEach(([key, value]) => {
    // Handle special cases
    if (key === "charset") {
      const charset = document.querySelector("meta[charset]");
      if (charset) charset.setAttribute("charset", value);
    } else if (key === "viewport") {
      let viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        viewport = document.createElement("meta");
        viewport.setAttribute("name", "viewport");
        document.head.appendChild(viewport);
      }
      viewport.setAttribute("content", value);
    } else if (key === "title") {
      document.title = value;
    } else {
      // Handle property-based meta tags (OpenGraph, Twitter, etc.)
      const isProperty = key.startsWith("og:") || key.startsWith("twitter:");
      const attrName = isProperty ? "property" : "name";
      const selector = `meta[${attrName}="${key}"]`;

      let metaTag = document.querySelector(selector);
      if (!metaTag) {
        metaTag = document.createElement("meta");
        metaTag.setAttribute(attrName, key);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute("content", value);
    }
  });
};
