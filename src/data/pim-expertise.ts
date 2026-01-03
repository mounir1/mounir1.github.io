/**
 * PIM & Integration Expertise Data
 * Showcases experience with Product Information Management platforms
 * and enterprise integration solutions
 */

export interface PIMExpertise {
  platform: string;
  level: "Expert" | "Advanced" | "Proficient";
  experience: string; // e.g., "2+ years"
  description: string;
  keyFeatures: string[];
  successMetrics: {
    label: string;
    value: string;
  }[];
  caseStudies?: string[];
  integratedWith: string[];
  logo: string;
  icon: string;
  color: string;
}

export const pimExpertise: PIMExpertise[] = [
  {
    platform: "Akeneo",
    level: "Expert",
    experience: "2.5+ years",
    description:
      "Enterprise-grade PIM platform expertise covering full implementation cycle, from data migration to API integrations with e-commerce systems. Specialized in custom attribute management, workflow automation, and multi-channel publishing.",
    keyFeatures: [
      "Full attribute setup & taxonomy management",
      "Custom API development & webhooks",
      "ETL pipeline integration",
      "Multi-channel publishing workflows",
      "Performance optimization (handling 100k+ SKUs)",
      "Custom bundle/asset management",
      "User role & permission configuration",
      "Data validation & quality rules",
    ],
    successMetrics: [
      { label: "SKUs managed", value: "250K+" },
      { label: "Channels synchronized", value: "8+" },
      { label: "Data quality improvement", value: "95%+" },
      { label: "Time saved (monthly)", value: "120 hours" },
    ],
    caseStudies: ["akeneo-magento-integration", "akeneo-omnichannel-setup"],
    integratedWith: ["Magento 2", "Shopify", "WooCommerce", "SAP", "NetSuite"],
    logo: "/logos/akeneo-logo.svg",
    icon: "📦",
    color: "#00A99D",
  },
  {
    platform: "Pimcore",
    level: "Advanced",
    experience: "1.5+ years",
    description:
      "Headless commerce and MDM (Master Data Management) solution expertise. Specialized in building complex data models, asset management systems, and multi-tenant configurations for enterprise clients.",
    keyFeatures: [
      "Data model design & object structure",
      "API & GraphQL endpoint configuration",
      "Asset DAM (Digital Asset Management)",
      "Workflow & notification automation",
      "Search optimization (Elasticsearch)",
      "Custom class & field type development",
      "Portal configuration for non-technical users",
      "Performance tuning for large datasets",
    ],
    successMetrics: [
      { label: "Data objects", value: "500K+" },
      { label: "API endpoints", value: "50+" },
      { label: "Asset storage", value: "2TB" },
      { label: "Request latency", value: "<100ms" },
    ],
    caseStudies: ["pimcore-mdm-setup", "pimcore-ecommerce-migration"],
    integratedWith: ["Magento 2", "Shopware", "custom eCommerce", "ERP systems"],
    logo: "/logos/pimcore-logo.svg",
    icon: "🏗️",
    color: "#EB6C1D",
  },
  {
    platform: "Magento 2 Integration",
    level: "Expert",
    experience: "3+ years",
    description:
      "Deep expertise in integrating PIM solutions with Magento 2. Specialized in creating seamless data flows, attribute mapping, inventory synchronization, and performance optimization at scale.",
    keyFeatures: [
      "Custom attribute management & mapping",
      "Configurable & bundle product automation",
      "Inventory & stock sync automation",
      "Extension development (modules & plugins)",
      "Custom attribute backend models",
      "Event-driven architecture patterns",
      "GraphQL schema customization",
      "Performance optimization & caching strategies",
    ],
    successMetrics: [
      { label: "Products synced", value: "200K+" },
      { label: "Sync frequency", value: "Real-time" },
      { label: "Magento performance", value: "Improved 45%" },
      { label: "Extension uptime", value: "99.95%" },
    ],
    caseStudies: ["magento-akeneo-sync", "magento-multichannel-catalog"],
    integratedWith: ["Akeneo", "Pimcore", "custom ERP", "WMS systems"],
    logo: "/logos/magento-logo.svg",
    icon: "🛒",
    color: "#EB5100",
  },
];

export interface ETLPipeline {
  name: string;
  description: string;
  tools: string[];
  features: string[];
  useCases: string[];
  icon: string;
}

export const etlExpertise: ETLPipeline[] = [
  {
    name: "Data Synchronization Pipelines",
    description:
      "Real-time and batch data pipelines connecting PIM platforms with e-commerce, ERP, and marketing systems",
    tools: [
      "Node.js",
      "Apache Kafka",
      "AWS Lambda",
      "RabbitMQ",
      "Custom webhooks",
    ],
    features: [
      "Real-time data sync",
      "Batch processing",
      "Error handling & retry logic",
      "Data transformation & mapping",
      "Audit logging & monitoring",
      "Rollback mechanisms",
    ],
    useCases: [
      "Product catalog sync from PIM → eCommerce",
      "Inventory updates from WMS → Magento",
      "Customer data flow from CRM → PIM",
    ],
    icon: "⚡",
  },
  {
    name: "Data Migration & Enrichment",
    description:
      "Complex data migration projects from legacy systems to modern PIM solutions with validation and enrichment",
    tools: ["Node.js", "Python", "Pandas", "PostgreSQL", "ElasticSearch"],
    features: [
      "Legacy data extraction",
      "Data cleaning & validation",
      "Mapping & transformation rules",
      "Duplicate detection",
      "Data enrichment automation",
      "Rollback procedures",
    ],
    useCases: [
      "ERP → Akeneo data migration",
      "Multi-source product consolidation",
      "Master data cleanup & standardization",
    ],
    icon: "📊",
  },
  {
    name: "Multi-Channel Publishing",
    description:
      "Automated product information distribution across multiple sales channels with format adaptation",
    tools: [
      "Akeneo API",
      "Pimcore GraphQL",
      "Node.js",
      "Message queues",
      "API orchestration",
    ],
    features: [
      "Channel-specific attribute selection",
      "Format & compliance conversion",
      "Scheduled publishing",
      "Feed generation (CSV, XML, JSON)",
      "Channel-specific validation",
      "Performance monitoring",
    ],
    useCases: [
      "Product feed to Google Merchant Center",
      "Marketplace integrations (Amazon, Shopee)",
      "B2B portal data feeds",
    ],
    icon: "🌐",
  },
];

export interface CompanyPartner {
  name: string;
  description: string;
  expertise: string[];
  collaboration: string;
  icon: string;
  color: string;
  website?: string;
}

export const companyPartners: CompanyPartner[] = [
  {
    name: "Vaimo",
    description:
      "Leading Magento and PIM implementation partner providing enterprise solutions across Europe",
    expertise: ["Magento implementation", "PIM consulting", "Integration architecture"],
    collaboration:
      "Partnered on multiple PIM integration projects with complex enterprise requirements",
    icon: "🤝",
    color: "#0066cc",
    website: "https://Vaimo.se",
  },
  {
    name: "Scandiweb",
    description:
      "Innovative Magento specialist and digital transformation agency",
    expertise: [
      "Magento 2 development",
      "Custom integrations",
      "Digital transformation",
    ],
    collaboration:
      "Collaborated on Magento optimization and integration architecture",
    icon: "🌟",
    color: "#FF6B35",
    website: "https://scandiweb.com",
  },
];

export interface TechStack {
  category: string;
  technologies: {
    name: string;
    proficiency: "Expert" | "Advanced" | "Proficient";
    yearsExperience: number;
    relevance: string[];
  }[];
}

export const integrationTechStack: TechStack[] = [
  {
    category: "Backend & APIs",
    technologies: [
      {
        name: "Node.js",
        proficiency: "Expert",
        yearsExperience: 5,
        relevance: ["API development", "ETL pipelines", "Real-time sync"],
      },
      {
        name: "TypeScript",
        proficiency: "Expert",
        yearsExperience: 4,
        relevance: ["Type safety", "Large-scale apps", "Maintainability"],
      },
      {
        name: "Express.js",
        proficiency: "Expert",
        yearsExperience: 5,
        relevance: ["REST APIs", "Middleware", "Route handling"],
      },
      {
        name: "GraphQL",
        proficiency: "Advanced",
        yearsExperience: 2,
        relevance: ["Data fetching", "API efficiency", "Pimcore integration"],
      },
    ],
  },
  {
    category: "PIM & Integration Platforms",
    technologies: [
      {
        name: "Akeneo API",
        proficiency: "Expert",
        yearsExperience: 3,
        relevance: ["Product sync", "Webhook integration", "Custom extensions"],
      },
      {
        name: "Pimcore API",
        proficiency: "Advanced",
        yearsExperience: 2,
        relevance: ["Data models", "Asset management", "Workflow automation"],
      },
      {
        name: "Magento 2 API",
        proficiency: "Expert",
        yearsExperience: 3,
        relevance: [
          "Product management",
          "Custom attributes",
          "Extension development",
        ],
      },
    ],
  },
  {
    category: "Message Queues & Streaming",
    technologies: [
      {
        name: "Apache Kafka",
        proficiency: "Advanced",
        yearsExperience: 2,
        relevance: ["Real-time sync", "Event streaming", "Scalable pipelines"],
      },
      {
        name: "RabbitMQ",
        proficiency: "Advanced",
        yearsExperience: 3,
        relevance: ["Async processing", "Job scheduling", "Reliability"],
      },
    ],
  },
  {
    category: "Databases & Data",
    technologies: [
      {
        name: "PostgreSQL",
        proficiency: "Expert",
        yearsExperience: 5,
        relevance: ["Data modeling", "Indexing", "Complex queries"],
      },
      {
        name: "MongoDB",
        proficiency: "Advanced",
        yearsExperience: 3,
        relevance: ["Document storage", "Flexible schema", "Scalability"],
      },
      {
        name: "ElasticSearch",
        proficiency: "Advanced",
        yearsExperience: 2,
        relevance: ["Full-text search", "Analytics", "Performance"],
      },
      {
        name: "Redis",
        proficiency: "Advanced",
        yearsExperience: 3,
        relevance: ["Caching", "Session management", "Real-time data"],
      },
    ],
  },
  {
    category: "Cloud & Infrastructure",
    technologies: [
      {
        name: "AWS",
        proficiency: "Advanced",
        yearsExperience: 3,
        relevance: ["Lambda", "RDS", "SQS", "Deployment"],
      },
      {
        name: "Docker & Kubernetes",
        proficiency: "Advanced",
        yearsExperience: 3,
        relevance: ["Containerization", "Orchestration", "Scaling"],
      },
    ],
  },
];
