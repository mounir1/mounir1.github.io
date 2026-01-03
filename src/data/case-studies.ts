/**
 * Case Studies & Featured Projects
 * Production-ready case study data showcasing PIM & integration expertise
 */

export interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  description: string;
  category:
    | "PIM Integration"
    | "Magento Development"
    | "Data Architecture"
    | "Enterprise Integration";
  client: string;
  duration: string;
  teamSize: number;
  technologies: string[];
  challenges: string[];
  solutions: string[];
  results: {
    metric: string;
    value: string;
    icon: string;
  }[];
  testimonial?: {
    quote: string;
    author: string;
    role: string;
    company: string;
  };
  images?: string[];
  featured: boolean;
  priority: number;
}

export const caseStudies: CaseStudy[] = [
  {
    id: "akeneo-magento-enterprise",
    title: "Enterprise Akeneo → Magento 2 Integration (250K SKUs)",
    slug: "akeneo-magento-enterprise",
    description:
      "Complete PIM integration connecting Akeneo to Magento 2 for a major European retailer managing 250K+ products across 8 channels",
    category: "PIM Integration",
    client: "European Multi-Channel Retailer",
    duration: "6 months",
    teamSize: 1,
    technologies: [
      "Akeneo API",
      "Node.js",
      "Express.js",
      "PostgreSQL",
      "Redis",
      "RabbitMQ",
      "Magento 2",
      "Docker",
    ],
    challenges: [
      "Managing 250K+ products with complex attributes",
      "Real-time synchronization requirements",
      "Multi-channel publishing with format variations",
      "Legacy data migration without downtime",
      "Performance optimization under load",
    ],
    solutions: [
      "Built custom ETL pipeline using RabbitMQ for async processing",
      "Implemented Redis caching for attribute lookups (90% hit rate)",
      "Created intelligent attribute mapping system supporting 500+ custom attributes",
      "Developed webhook-based real-time sync with fallback batch jobs",
      "Optimized Magento API calls with bulk operations",
    ],
    results: [
      {
        metric: "Products synchronized",
        value: "250K+",
        icon: "📦",
      },
      {
        metric: "Sync latency",
        value: "<5min",
        icon: "⚡",
      },
      {
        metric: "Data accuracy",
        value: "99.8%",
        icon: "✅",
      },
      {
        metric: "Manual work reduction",
        value: "95%",
        icon: "🎯",
      },
      {
        metric: "System uptime",
        value: "99.95%",
        icon: "🛡️",
      },
    ],
    testimonial: {
      quote:
        "The integration was seamless and has transformed our product data operations. What used to take days now happens in minutes.",
      author: "Product Operations Director",
      role: "Director of Product Operations",
      company: "European Multi-Channel Retailer",
    },
    featured: true,
    priority: 100,
  },
  {
    id: "pimcore-mdm-implementation",
    title: "Pimcore Master Data Management System Setup",
    slug: "pimcore-mdm-implementation",
    description:
      "Designed and implemented a comprehensive master data management system using Pimcore for a global B2B enterprise with 500K+ data objects",
    category: "Data Architecture",
    client: "Global B2B Enterprise",
    duration: "8 months",
    teamSize: 1,
    technologies: [
      "Pimcore",
      "GraphQL",
      "Node.js",
      "ElasticSearch",
      "PostgreSQL",
      "Docker",
      "Kubernetes",
    ],
    challenges: [
      "Designing complex multi-tenant data models",
      "Handling 500K+ interdependent data objects",
      "Enabling non-technical user access",
      "Real-time search across millions of records",
      "Maintaining data integrity and relationships",
    ],
    solutions: [
      "Built modular data object classes with inheritance patterns",
      "Implemented ElasticSearch for instant search across 500K+ objects",
      "Created intuitive web portal for non-technical users",
      "Developed custom GraphQL endpoints for partners",
      "Automated data validation rules and workflows",
    ],
    results: [
      {
        metric: "Data objects managed",
        value: "500K+",
        icon: "🏗️",
      },
      {
        metric: "Search latency",
        value: "<100ms",
        icon: "⚡",
      },
      {
        metric: "Portal users",
        value: "150+",
        icon: "👥",
      },
      {
        metric: "Data validation rules",
        value: "200+",
        icon: "🔍",
      },
      {
        metric: "API endpoints",
        value: "50+",
        icon: "🌐",
      },
    ],
    featured: true,
    priority: 95,
  },
  {
    id: "multi-channel-sync",
    title: "Multi-Channel Product Publishing Pipeline",
    slug: "multi-channel-sync",
    description:
      "Built an automated multi-channel publishing system syncing products to 8+ platforms (Amazon, eBay, Marketplace) with format adaptation",
    category: "Enterprise Integration",
    client: "Global eCommerce Company",
    duration: "4 months",
    teamSize: 1,
    technologies: [
      "Node.js",
      "Kafka",
      "PostgreSQL",
      "S3",
      "Lambda",
      "TypeScript",
    ],
    challenges: [
      "Supporting 8+ channels with different requirements",
      "Handling high-volume product updates (100K+ daily)",
      "Format conversion and validation per channel",
      "Monitoring and error recovery",
      "Cost optimization",
    ],
    solutions: [
      "Apache Kafka event streaming for reliable delivery",
      "Channel-specific validators and format transformers",
      "AWS Lambda for serverless scaling",
      "Comprehensive monitoring with alert system",
      "Dead-letter queue for failed messages",
    ],
    results: [
      {
        metric: "Channels supported",
        value: "8+",
        icon: "🌐",
      },
      {
        metric: "Products/day",
        value: "100K+",
        icon: "📈",
      },
      {
        metric: "Delivery rate",
        value: "99.9%",
        icon: "✅",
      },
      {
        metric: "Cost reduction",
        value: "60%",
        icon: "💰",
      },
      {
        metric: "Processing latency",
        value: "<2min",
        icon: "⚡",
      },
    ],
    featured: true,
    priority: 90,
  },
  {
    id: "custom-pim-connector",
    title: "Custom PIM Connector for Legacy ERP System",
    slug: "custom-pim-connector",
    description:
      "Built bridge middleware connecting legacy ERP system to modern Akeneo PIM with bidirectional sync and complex business logic",
    category: "PIM Integration",
    client: "Industrial Manufacturing Company",
    duration: "5 months",
    teamSize: 1,
    technologies: [
      "Node.js",
      "Express.js",
      "TypeScript",
      "PostgreSQL",
      "Akeneo API",
      "SOAP/XML",
    ],
    challenges: [
      "Legacy ERP API limitations",
      "Complex attribute mapping rules",
      "Data transformation logic",
      "Maintaining backward compatibility",
      "Error handling and reconciliation",
    ],
    solutions: [
      "Built translation layer for legacy API communication",
      "Implemented configurable mapping engine",
      "Created reconciliation dashboard",
      "Developed comprehensive logging system",
      "Built automated error recovery workflows",
    ],
    results: [
      {
        metric: "SKUs synced",
        value: "150K+",
        icon: "📦",
      },
      {
        metric: "Mapping rules",
        value: "300+",
        icon: "🔗",
      },
      {
        metric: "Error rate",
        value: "<0.1%",
        icon: "✅",
      },
      {
        metric: "Manual intervention reduction",
        value: "85%",
        icon: "🎯",
      },
    ],
    featured: false,
    priority: 80,
  },
];

export interface ServiceOffering {
  id: string;
  name: string;
  description: string;
  icon: string;
  features: string[];
  technologies: string[];
  timeline: string;
  price: "Consultation" | "Custom Quote";
}

export const serviceOfferings: ServiceOffering[] = [
  {
    id: "pim-audit-optimization",
    name: "PIM Audit & Optimization",
    description:
      "Comprehensive audit of your current PIM implementation with optimization recommendations and quick wins",
    icon: "🔍",
    features: [
      "System audit & analysis",
      "Performance evaluation",
      "Best practices review",
      "Optimization roadmap",
      "Quick win implementation",
    ],
    technologies: ["Akeneo", "Pimcore", "Custom analysis"],
    timeline: "2-4 weeks",
    price: "Consultation",
  },
  {
    id: "integration-architecture",
    name: "Integration Architecture Design",
    description:
      "Design scalable integration architecture connecting your PIM with eCommerce, ERP, and marketing systems",
    icon: "🏗️",
    features: [
      "Architecture design",
      "Technology selection",
      "Data flow mapping",
      "Security & compliance review",
      "Cost estimation",
    ],
    technologies: [
      "AWS",
      "Kafka",
      "Node.js",
      "Docker",
      "Various APIs",
    ],
    timeline: "3-6 weeks",
    price: "Custom Quote",
  },
  {
    id: "pim-implementation",
    name: "PIM Implementation & Migration",
    description:
      "Full implementation of Akeneo or Pimcore with data migration from legacy systems",
    icon: "🚀",
    features: [
      "System setup & configuration",
      "Data migration",
      "Integrations setup",
      "User training",
      "Go-live support",
    ],
    technologies: [
      "Akeneo",
      "Pimcore",
      "Node.js",
      "Docker",
      "PostgreSQL",
    ],
    timeline: "4-8 months",
    price: "Custom Quote",
  },
  {
    id: "magento-integration",
    name: "Magento 2 Integration Services",
    description:
      "Custom Magento 2 extensions and integrations with PIM platforms for seamless product data sync",
    icon: "🛒",
    features: [
      "Extension development",
      "API customization",
      "Custom attribute setup",
      "Performance optimization",
      "Support & maintenance",
    ],
    technologies: [
      "Magento 2",
      "PHP",
      "GraphQL",
      "MySQL",
      "REST APIs",
    ],
    timeline: "2-6 months",
    price: "Custom Quote",
  },
  {
    id: "etl-pipeline-development",
    name: "ETL Pipeline Development",
    description:
      "Build robust ETL pipelines for real-time and batch data synchronization between systems",
    icon: "⚡",
    features: [
      "Pipeline design",
      "Real-time sync setup",
      "Error handling & monitoring",
      "Performance optimization",
      "Maintenance & support",
    ],
    technologies: [
      "Node.js",
      "Kafka",
      "RabbitMQ",
      "PostgreSQL",
      "AWS Lambda",
    ],
    timeline: "4-12 weeks",
    price: "Custom Quote",
  },
  {
    id: "data-governance",
    name: "Data Governance & Quality",
    description:
      "Implement data quality frameworks, validation rules, and master data governance practices",
    icon: "🛡️",
    features: [
      "Data quality assessment",
      "Governance framework",
      "Validation rules setup",
      "Monitoring & alerts",
      "Team training",
    ],
    technologies: [
      "Akeneo",
      "Pimcore",
      "ElasticSearch",
      "PostgreSQL",
      "Custom tools",
    ],
    timeline: "3-8 weeks",
    price: "Custom Quote",
  },
];
