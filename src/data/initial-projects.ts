import { ProjectInput } from "@/hooks/useProjects";

export const initialProjects: ProjectInput[] = [
  {
    title: "HoTech Systems - Hospitality Digital Transformation Platform",
    description: "Digital transformation platform for the hospitality industry — Otello GEM guest experience management, DashBoss real-time operations dashboard, and GuestApp mobile engagement. Powering 300,000+ hotel rooms across 10+ countries.",
    longDescription: "Led full-stack development and enterprise integration for HoTech Systems, a global hospitality technology leader with 20+ years of experience and 2,000+ client installations worldwide. Built and integrated three flagship products: Otello GEM (Guest Experience Management) for touchless personalized guest journeys and real-time revenue optimization; DashBoss, a real-time mobile operations dashboard for department-level KPI monitoring; and GuestApp, the guest-facing mobile platform for customizing travel experiences. Implemented 100% integration capability with existing hotel systems, serving 120,000+ active users across 10+ countries and 300,000+ hotel rooms.",
    category: "Enterprise Integration",
    status: "completed",
    achievements: [
      "Integrated platform powers 300,000+ hotel rooms globally",
      "Serving 120,000+ active users across 10+ countries",
      "2,000+ successful client installations worldwide",
      "Implemented touchless/contactless guest journey system",
      "Built Otello GEM for real-time guest experience & revenue optimization",
      "Developed DashBoss real-time mobile KPI dashboard",
      "Delivered GuestApp for personalized guest engagement",
      "Achieved 100% integration with existing hotel management systems",
      "20+ year platform with 99.9% uptime SLA",
      "Reduced data processing time by 75%"
    ],
    technologies: ["React", "Node.js", "TypeScript", "PostgreSQL", "Redis", "Docker", "AWS", "WebSocket", "Kubernetes", "Nginx", "REST APIs", "Mobile PWA"],
    tags: ["hospitality", "enterprise", "integration", "real-time", "scalable", "microservices", "b2b", "saas", "hotel-tech", "guest-experience"],
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop",
    logo: "/hotech-logo.svg",
    icon: "🏨",
    liveUrl: "https://hotech.systems",
    githubUrl: "",
    demoUrl: "https://en.hotech.systems",
    caseStudyUrl: "https://hotech.systems/about-hotech",
    featured: true,
    disabled: false,
    priority: 98,
    startDate: "2023-06-01",
    endDate: "2024-02-15",
    duration: "8 months",
    clientInfo: {
      name: "HoTech Systems",
      industry: "Hospitality Technology",
      size: "enterprise",
      location: "International (10+ countries)",
      website: "https://hotech.systems",
      isPublic: true
    },
    metrics: {
      usersReached: 120000,
      performanceImprovement: "75% faster processing",
      revenueImpact: "Revenue optimization for 300K+ rooms",
      uptime: "99.9%",
      customMetrics: {
        "hotel_rooms_managed": "300,000+",
        "active_users": "120,000+",
        "countries_served": "10+",
        "client_installations": "2,000+",
        "years_in_operation": "20+",
        "systems_integrated": 15,
        "automation_level": "90%"
      }
    },
    challenges: [
      "Integrating with 100+ diverse legacy hotel management systems",
      "Real-time data synchronization for 300K+ rooms simultaneously",
      "Building touchless contactless guest journey across all touchpoints",
      "Multi-country, multi-language deployment at scale",
      "Revenue optimization with real-time analytics across departments"
    ],
    solutions: [
      "Built universal hotel systems integration layer with REST & WebSocket APIs",
      "Implemented event-driven microservices for real-time room/guest data sync",
      "Developed Otello GEM for end-to-end personalized touchless guest journeys",
      "Created DashBoss real-time mobile dashboard for department-level KPIs",
      "Designed GuestApp PWA for mobile-first guest engagement and customization"
    ],
    teamSize: 5,
    role: "Lead Full-Stack Developer & Integration Architect",
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 5,
    version: 2
  },
  {
    title: "TechnoStationery E-commerce Platform",
    description: "Modern e-commerce platform with advanced inventory management, multi-payment gateway integration, and real-time analytics.",
    longDescription: "Developed a comprehensive e-commerce solution for TechnoStationery with advanced features including inventory management, multi-payment gateway integration, customer analytics, and automated order processing. The platform supports multiple currencies and languages with real-time inventory tracking and automated reorder points.",
    category: "E-commerce",
    status: "completed",
    achievements: [
      "Increased online sales by 300%",
      "Reduced cart abandonment by 45%",
      "Implemented multi-currency support",
      "Achieved 2-second page load times",
      "Integrated 5+ payment gateways",
      "Built automated inventory management",
      "Implemented customer loyalty program"
    ],
    technologies: ["React", "Next.js", "Stripe", "PayPal", "MongoDB", "Node.js", "Tailwind CSS", "Vercel", "Algolia", "SendGrid"],
    tags: ["ecommerce", "payments", "inventory", "analytics", "responsive", "b2c"],
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
    logo: "/technostationery-logo.svg",
    icon: "🛒",
    liveUrl: "https://technostationery.com",
    githubUrl: "",
    demoUrl: "",
    featured: true,
    disabled: false,
    priority: 90,
    startDate: "2023-03-01",
    endDate: "2023-08-30",
    duration: "6 months",
    clientInfo: {
      name: "TechnoStationery",
      industry: "Office Supplies & Stationery",
      size: "medium",
      location: "Algeria",
      website: "https://technostationery.com",
      isPublic: true
    },
    metrics: {
      usersReached: 5000,
      performanceImprovement: "300% sales increase",
      revenueImpact: "$500K+ annual revenue",
      customMetrics: {
        "cart_abandonment_reduction": "45%",
        "page_load_time": "2s",
        "payment_gateways": 5,
        "inventory_automation": "95%"
      }
    },
    challenges: [
      "Complex inventory management across multiple warehouses",
      "Integration with legacy accounting systems",
      "Multi-currency and multi-language support",
      "Real-time inventory synchronization"
    ],
    solutions: [
      "Built centralized inventory management system",
      "Created API bridges for legacy system integration",
      "Implemented i18n with dynamic currency conversion",
      "Developed real-time WebSocket inventory updates"
    ],
    teamSize: 3,
    role: "Full-Stack Developer & Project Lead",
    createdAt: Date.now() - 86400000 * 60,
    updatedAt: Date.now() - 86400000 * 10,
    version: 1
  },
  {
    title: "MAB Modules — Magento / Adobe Commerce Extension Library",
    description: "Open-source library of production-ready Magento 2 / Adobe Commerce modules. Covers checkout optimization, B2B workflows, custom payment integrations, and performance enhancements — published at mab-modules.github.io.",
    longDescription: "MAB Modules is an open-source collection of professional-grade Magento 2 and Adobe Commerce extensions built for real-world enterprise deployments. Each module is built with clean architecture, fully tested, and designed to drop into any Adobe Commerce installation without conflicts. The library covers checkout UX improvements, B2B quote and approval workflows, custom payment provider integrations, multi-store catalog management, advanced SEO tooling, and performance optimization utilities. All modules follow Adobe Commerce coding standards and are distributed with full documentation at mab-modules.github.io.",
    category: "E-commerce",
    status: "maintenance",
    achievements: [
      "Published open-source Adobe Commerce module library at mab-modules.github.io",
      "Built production-grade checkout optimization modules",
      "Developed B2B quote & approval workflow extensions",
      "Created custom payment gateway integration modules",
      "Implemented advanced SEO & sitemap generation modules",
      "All modules follow Adobe Commerce coding standards",
      "Actively maintained with Magento 2.x / Adobe Commerce compatibility"
    ],
    technologies: ["Magento 2", "Adobe Commerce", "PHP", "XML", "JavaScript", "LESS", "Composer", "PHPUnit", "MySQL", "GraphQL"],
    tags: ["magento", "adobe-commerce", "modules", "open-source", "ecommerce", "extensions", "php", "b2b"],
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop",
    logo: "/magento-logo.svg",
    icon: "🧩",
    liveUrl: "https://mab-modules.github.io",
    githubUrl: "https://github.com/mab-modules",
    demoUrl: "https://mab-modules.github.io",
    caseStudyUrl: "",
    featured: true,
    disabled: false,
    priority: 92,
    startDate: "2022-01-01",
    endDate: "",
    duration: "Ongoing",
    clientInfo: {
      name: "Open Source Community",
      industry: "E-commerce / Adobe Commerce Ecosystem",
      size: "enterprise",
      location: "International",
      website: "https://mab-modules.github.io",
      isPublic: true
    },
    metrics: {
      performanceImprovement: "Checkout conversion improvements",
      customMetrics: {
        "module_types": "Checkout, B2B, Payments, SEO, Performance",
        "platform": "Adobe Commerce / Magento 2.x",
        "distribution": "mab-modules.github.io",
        "standard": "Adobe Commerce Coding Standards"
      }
    },
    challenges: [
      "Maintaining compatibility across multiple Adobe Commerce versions",
      "Conflict-free integration with third-party extensions",
      "Complex B2B workflow requirements across diverse client setups",
      "Keeping documentation current for all module releases"
    ],
    solutions: [
      "Built version-aware compatibility layer for Magento 2.3 through Adobe Commerce 2.4.x",
      "Used dependency injection and event/plugin architecture for conflict-free modules",
      "Modular design with separate packages per business domain",
      "Auto-generated API docs and README per module at mab-modules.github.io"
    ],
    teamSize: 2,
    role: "Lead Developer & Maintainer",
    createdAt: Date.now() - 86400000 * 180,
    updatedAt: Date.now() - 86400000 * 2,
    version: 1
  },
  {
    title: "ETL Data Processing Platform",
    description: "High-performance ETL platform for processing large datasets with automated data validation and transformation pipelines.",
    longDescription: "Built a robust ETL (Extract, Transform, Load) platform capable of processing terabytes of data daily. Features include automated data validation, transformation pipelines, error handling, and comprehensive monitoring with alerting systems. Implemented using Apache Airflow for workflow orchestration and Kubernetes for scalable processing.",
    category: "DevOps & Infrastructure",
    status: "completed",
    achievements: [
      "Processes 5TB+ data daily",
      "Reduced processing time by 80%",
      "Implemented automated error recovery",
      "Built comprehensive monitoring system",
      "Achieved 99.95% data accuracy",
      "Automated 95% of data workflows",
      "Reduced manual data processing by 90%"
    ],
    technologies: ["Python", "Apache Airflow", "PostgreSQL", "Redis", "Docker", "Kubernetes", "Grafana", "Prometheus", "Apache Spark", "Elasticsearch"],
    tags: ["etl", "big-data", "automation", "monitoring", "scalable", "data-engineering"],
    image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&h=600&fit=crop",
    logo: "/etl-platform-logo.svg",
    icon: "⚡",
    liveUrl: "https://etl.techno-dz.com",
    githubUrl: "",
    demoUrl: "",
    featured: true,
    disabled: false,
    priority: 85,
    startDate: "2023-09-01",
    endDate: "2024-01-15",
    duration: "4.5 months",
    clientInfo: {
      name: "Techno DZ",
      industry: "Data Processing",
      size: "medium",
      location: "Algeria",
      website: "https://etl.techno-dz.com",
      isPublic: true
    },
    metrics: {
      performanceImprovement: "80% faster processing",
      uptime: "99.95%",
      customMetrics: {
        "daily_data_processed": "5TB",
        "accuracy_rate": "99.95%",
        "automation_level": "95%",
        "processing_speed_improvement": "80%"
      }
    },
    challenges: [
      "Processing massive datasets efficiently",
      "Ensuring data quality and accuracy",
      "Handling various data formats and sources",
      "Scaling processing power dynamically"
    ],
    solutions: [
      "Implemented Apache Spark for distributed processing",
      "Built comprehensive data validation pipelines",
      "Created flexible data transformation modules",
      "Used Kubernetes for auto-scaling processing nodes"
    ],
    teamSize: 4,
    role: "Data Engineer & DevOps Specialist",
    createdAt: Date.now() - 86400000 * 45,
    updatedAt: Date.now() - 86400000 * 3,
    version: 1
  },
  {
    title: "Adobe Commerce (Magento) — Enterprise E-commerce Solutions",
    description: "Custom Adobe Commerce (Magento) development and optimization for enterprise e-commerce platforms. 15+ stores built, 25+ custom modules, 10+ payment gateways — powered by Adobe's leading commerce platform.",
    longDescription: "Developed and optimized 15+ enterprise Adobe Commerce (Magento 2.x) e-commerce platforms for B2B and B2C clients, leveraging Adobe's industry-leading commerce infrastructure. Built custom extensions, payment integrations, inventory management systems, and performance optimization layers. Specialized in Magento 2.x to Adobe Commerce migrations, custom theme development, multi-store configurations, and advanced SEO strategies. Implemented Adobe-recommended caching with Varnish, Elasticsearch full-text search, and Redis session management for high-traffic stores.",
    category: "E-commerce",
    status: "completed",
    achievements: [
      "Built 15+ enterprise Adobe Commerce / Magento stores",
      "Improved site performance by 65% with Varnish + Redis caching",
      "Integrated 10+ payment gateways (Stripe, PayPal, local processors)",
      "Developed 25+ custom Adobe Commerce modules and extensions",
      "Managed complex multi-store, multi-language configurations",
      "Implemented advanced SEO resulting in 200% organic traffic increase",
      "Reduced server response time by 70% through optimization",
      "Completed Magento 1.x to Adobe Commerce 2.x migrations"
    ],
    technologies: ["Adobe Commerce", "Magento 2.x", "PHP", "MySQL", "JavaScript", "LESS", "XML", "Composer", "Redis", "Elasticsearch", "Varnish", "GraphQL"],
    tags: ["adobe-commerce", "magento", "ecommerce", "php", "enterprise", "optimization", "b2b", "b2c", "adobe"],
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop",
    logo: "/magento-logo.svg",
    icon: "🛍️",
    liveUrl: "https://business.adobe.com/products/magento/magento-commerce.html",
    githubUrl: "",
    demoUrl: "",
    caseStudyUrl: "",
    featured: true,
    disabled: false,
    priority: 87,
    startDate: "2021-06-01",
    endDate: "2022-12-30",
    duration: "18 months",
    clientInfo: {
      name: "Multiple Enterprise Clients (Adobe Commerce)",
      industry: "E-commerce",
      size: "enterprise",
      location: "International",
      isPublic: false
    },
    metrics: {
      usersReached: 50000,
      performanceImprovement: "65% faster loading",
      customMetrics: {
        "stores_built": 15,
        "custom_modules": 25,
        "payment_gateways": 10,
        "performance_improvement": "65%",
        "seo_improvement": "200%",
        "platform": "Adobe Commerce (Magento)"
      }
    },
    challenges: [
      "Legacy Magento 1.x to Adobe Commerce 2.x migrations at scale",
      "Performance optimization for large product catalogs (100K+ SKUs)",
      "Complex B2B pricing, quoting, and approval workflow requirements",
      "Multi-store and multi-language global deployments"
    ],
    solutions: [
      "Developed automated Magento 1.x to Adobe Commerce 2.x migration scripts",
      "Implemented full-page caching with Varnish + Redis for sub-200ms response",
      "Built custom B2B Adobe Commerce modules with approval workflows",
      "Created scalable multi-store architecture with shared catalog management"
    ],
    teamSize: 6,
    role: "Senior Adobe Commerce Developer & Technical Lead",
    createdAt: Date.now() - 86400000 * 200,
    updatedAt: Date.now() - 86400000 * 30,
    version: 2
  },
  {
    title: "JSKit Development Toolkit",
    description: "Comprehensive JavaScript development toolkit with code generators, testing utilities, and performance optimization tools.",
    longDescription: "Created a complete JavaScript development toolkit that includes code generators, automated testing utilities, performance optimization tools, and debugging helpers. Used by 500+ developers worldwide for rapid application development. Features include React component generators, API client generators, testing boilerplates, and performance monitoring tools.",
    category: "Web Application",
    status: "maintenance",
    achievements: [
      "Used by 500+ developers globally",
      "Reduced development time by 60%",
      "Generated 10,000+ code snippets",
      "Integrated with popular IDEs",
      "Maintained 95% user satisfaction",
      "Built CLI tools for automation",
      "Created comprehensive documentation"
    ],
    technologies: ["JavaScript", "TypeScript", "Node.js", "Webpack", "Babel", "Jest", "ESLint", "Prettier", "CLI", "NPM"],
    tags: ["toolkit", "development", "automation", "testing", "productivity", "open-source"],
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop",
    logo: "/jskit-logo.svg",
    icon: "🔧",
    liveUrl: "https://jskit-app.web.app",
    githubUrl: "https://github.com/mounir1/jskit",
    demoUrl: "https://jskit-app.web.app/demo",
    featured: false,
    disabled: false,
    priority: 75,
    startDate: "2022-11-01",
    endDate: "2023-05-30",
    duration: "7 months",
    metrics: {
      usersReached: 500,
      performanceImprovement: "60% faster development",
      customMetrics: {
        "code_snippets_generated": 10000,
        "user_satisfaction": "95%",
        "development_time_saved": "60%",
        "ide_integrations": 5
      }
    },
    challenges: [
      "Creating flexible code generation templates",
      "Supporting multiple JavaScript frameworks",
      "Maintaining compatibility across different environments",
      "Building intuitive CLI interface"
    ],
    solutions: [
      "Developed modular template system with customization",
      "Built framework-agnostic core with plugins",
      "Implemented comprehensive testing across environments",
      "Created interactive CLI with helpful prompts"
    ],
    teamSize: 2,
    role: "Lead Developer & Product Owner",
    createdAt: Date.now() - 86400000 * 90,
    updatedAt: Date.now() - 86400000 * 15,
    version: 1
  },
  {
    title: "Noor Al Maarifa Educational Platform",
    description: "Interactive educational platform with course management, student tracking, and advanced learning analytics.",
    longDescription: "Developed a comprehensive educational platform for Noor Al Maarifa featuring course management, student progress tracking, interactive learning modules, and advanced analytics. The platform serves 2000+ students with personalized learning paths, real-time collaboration tools, and automated assessment systems.",
    category: "Web Application",
    status: "completed",
    achievements: [
      "Serves 2000+ active students",
      "Improved learning outcomes by 40%",
      "Implemented personalized learning paths",
      "Built interactive assessment system",
      "Achieved 98% student satisfaction",
      "Created mobile-responsive design",
      "Integrated video conferencing"
    ],
    technologies: ["React", "Firebase", "Node.js", "Express", "MongoDB", "Socket.io", "Chart.js", "Material-UI", "WebRTC", "PWA"],
    tags: ["education", "learning", "analytics", "interactive", "scalable", "mobile"],
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop",
    logo: "/noor-almaarifa-logo.svg",
    icon: "📚",
    liveUrl: "https://www.nooralmaarifa.com",
    githubUrl: "",
    demoUrl: "",
    featured: false,
    disabled: false,
    priority: 80,
    startDate: "2023-01-15",
    endDate: "2023-07-30",
    duration: "6.5 months",
    clientInfo: {
      name: "Noor Al Maarifa",
      industry: "Education",
      size: "medium",
      location: "Algeria",
      website: "https://www.nooralmaarifa.com",
      isPublic: true
    },
    metrics: {
      usersReached: 2000,
      performanceImprovement: "40% better learning outcomes",
      customMetrics: {
        "student_satisfaction": "98%",
        "active_students": 2000,
        "learning_improvement": "40%",
        "course_completion_rate": "85%"
      }
    },
    challenges: [
      "Creating engaging interactive learning content",
      "Implementing real-time collaboration features",
      "Building comprehensive analytics dashboard",
      "Ensuring mobile accessibility"
    ],
    solutions: [
      "Developed interactive multimedia content system",
      "Integrated WebRTC for real-time communication",
      "Built advanced analytics with Chart.js and D3",
      "Implemented PWA for mobile-first experience"
    ],
    teamSize: 4,
    role: "Full-Stack Developer & UX Designer",
    createdAt: Date.now() - 86400000 * 75,
    updatedAt: Date.now() - 86400000 * 8,
    version: 1
  },
  {
    title: "IT Collaborator Project Management",
    description: "Advanced project management platform with team collaboration, time tracking, and automated reporting features.",
    longDescription: "Built a sophisticated project management platform for IT teams featuring real-time collaboration, advanced time tracking, automated reporting, resource allocation, and integration with popular development tools. Used by 50+ companies with features like Gantt charts, Kanban boards, and automated notifications.",
    category: "Web Application",
    status: "completed",
    achievements: [
      "Used by 50+ companies",
      "Improved team productivity by 55%",
      "Automated 80% of reporting tasks",
      "Integrated with 20+ dev tools",
      "Reduced project delays by 35%",
      "Built real-time collaboration features",
      "Implemented advanced analytics"
    ],
    technologies: ["Vue.js", "Laravel", "MySQL", "Redis", "Docker", "GitLab CI", "Slack API", "Jira API", "WebSocket", "Chart.js"],
    tags: ["project-management", "collaboration", "automation", "integration", "productivity", "saas"],
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
    logo: "/it-collaborator-logo.svg",
    icon: "👥",
    liveUrl: "https://it-collaborator-techno.web.app",
    githubUrl: "",
    demoUrl: "https://it-collaborator-techno.web.app/demo",
    featured: false,
    disabled: false,
    priority: 70,
    startDate: "2022-08-01",
    endDate: "2023-02-28",
    duration: "7 months",
    metrics: {
      usersReached: 1000,
      performanceImprovement: "55% productivity increase",
      customMetrics: {
        "companies_using": 50,
        "productivity_increase": "55%",
        "reporting_automation": "80%",
        "project_delay_reduction": "35%"
      }
    },
    challenges: [
      "Integrating with multiple third-party tools",
      "Building real-time collaboration features",
      "Creating intuitive project visualization",
      "Implementing complex permission systems"
    ],
    solutions: [
      "Built unified API gateway for tool integrations",
      "Implemented WebSocket-based real-time updates",
      "Created interactive Gantt and Kanban components",
      "Developed role-based access control system"
    ],
    teamSize: 5,
    role: "Frontend Lead & Integration Specialist",
    createdAt: Date.now() - 86400000 * 120,
    updatedAt: Date.now() - 86400000 * 20,
    version: 1
  },
  {
    title: "Real-time Analytics Dashboard",
    description: "High-performance analytics dashboard with real-time data visualization and customizable reporting features.",
    longDescription: "Developed a comprehensive analytics dashboard that processes real-time data streams and provides interactive visualizations. Features include customizable dashboards, automated alerts, data export capabilities, and multi-tenant architecture. Built with modern data visualization libraries and optimized for high-frequency data updates.",
    category: "Web Application",
    status: "completed",
    achievements: [
      "Processes 1M+ events per minute",
      "Sub-second data visualization",
      "Built 50+ chart types",
      "Implemented real-time alerts",
      "Supports multi-tenant architecture",
      "Created custom visualization library",
      "Optimized for mobile devices"
    ],
    technologies: ["React", "D3.js", "WebSocket", "InfluxDB", "Grafana", "Node.js", "Kafka", "Docker", "TypeScript", "Material-UI"],
    tags: ["analytics", "real-time", "visualization", "dashboard", "performance", "big-data"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    icon: "📊",
    liveUrl: "",
    githubUrl: "https://github.com/mounir1/analytics-dashboard",
    demoUrl: "",
    featured: false,
    disabled: false,
    priority: 65,
    startDate: "2023-04-01",
    endDate: "2023-09-15",
    duration: "5.5 months",
    metrics: {
      performanceImprovement: "Sub-second visualization",
      customMetrics: {
        "events_per_minute": 1000000,
        "chart_types": 50,
        "visualization_speed": "sub-second",
        "data_retention": "1_year"
      }
    },
    challenges: [
      "Handling high-frequency data streams",
      "Creating responsive visualizations",
      "Implementing real-time alerts",
      "Optimizing for large datasets"
    ],
    solutions: [
      "Implemented data streaming with Kafka",
      "Built custom React visualization components",
      "Created rule-based alerting system",
      "Used data aggregation and sampling techniques"
    ],
    teamSize: 3,
    role: "Frontend Developer & Data Visualization Specialist",
    createdAt: Date.now() - 86400000 * 100,
    updatedAt: Date.now() - 86400000 * 12,
    version: 1
  },
  {
    title: "Microservices Architecture Migration",
    description: "Complete migration of monolithic application to microservices architecture with improved scalability and performance.",
    longDescription: "Led the migration of a large monolithic application to microservices architecture, implementing containerization, service mesh, API gateway, and comprehensive monitoring. Resulted in 10x improved scalability and 50% cost reduction. Implemented using Docker, Kubernetes, and modern DevOps practices.",
    category: "DevOps & Infrastructure",
    status: "completed",
    achievements: [
      "Migrated 500K+ lines of code",
      "Improved scalability by 10x",
      "Reduced infrastructure costs by 50%",
      "Implemented zero-downtime deployments",
      "Built comprehensive monitoring",
      "Automated CI/CD pipelines",
      "Reduced deployment time by 80%"
    ],
    technologies: ["Docker", "Kubernetes", "Istio", "Kong", "Prometheus", "Grafana", "Jenkins", "Terraform", "AWS", "Microservices"],
    tags: ["microservices", "migration", "scalability", "devops", "kubernetes", "cloud"],
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop",
    icon: "🔄",
    liveUrl: "",
    githubUrl: "",
    demoUrl: "",
    featured: false,
    disabled: false,
    priority: 60,
    startDate: "2022-10-01",
    endDate: "2023-06-30",
    duration: "9 months",
    metrics: {
      performanceImprovement: "10x scalability improvement",
      customMetrics: {
        "code_lines_migrated": 500000,
        "scalability_improvement": "10x",
        "cost_reduction": "50%",
        "deployment_time_reduction": "80%"
      }
    },
    challenges: [
      "Breaking down monolithic codebase",
      "Maintaining data consistency",
      "Implementing service communication",
      "Ensuring zero-downtime migration"
    ],
    solutions: [
      "Applied domain-driven design principles",
      "Implemented event sourcing and CQRS patterns",
      "Built service mesh with Istio",
      "Used blue-green deployment strategy"
    ],
    teamSize: 8,
    role: "DevOps Lead & Migration Architect",
    createdAt: Date.now() - 86400000 * 150,
    updatedAt: Date.now() - 86400000 * 25,
    version: 1
  }
];