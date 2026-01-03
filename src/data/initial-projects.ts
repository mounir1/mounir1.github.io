import type { ProjectInput } from "@/hooks/useProjects";

export const initialProjects: ProjectInput[] = [
  {
    title: "Odoo ERP Enterprise Implementation",
    description: "Full-scale Odoo ERP implementation for a manufacturing giant, integrating Inventory, Manufacturing, Accounting, and CRM modules.",
    longDescription: "Architected and deployed a comprehensive Odoo Enterprise solution for a multi-national manufacturing corporation. The system integrates complex manufacturing workflows (MRP II) with real-time inventory tracking, multi-currency accounting, and a custom CRM. Implemented automated quality control checkpoints and IoT integration for machine monitoring. The solution handles over 50,000 daily stock moves and synchronizes data across 12 global warehouses.",
    category: "ERP Solutions",
    status: "completed",
    achievements: [
      "Unified 12 global warehouses",
      "Reduced inventory discrepancy by 98%",
      "Automated 85% of accounting entries",
      "Integrated IoT sensors for real-time monitoring",
      "Customized 20+ Odoo modules",
      "Migrated 5M+ historical records",
      "Achieved ROI in 8 months"
    ],
    technologies: ["Python", "Odoo 17", "PostgreSQL", "Docker", "Redis", "Nginx", "Linux", "XML-RPC", "React", "AWS"],
    tags: ["erp", "odoo", "python", "enterprise", "manufacturing", "iot"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    logo: "/odoo-logo.svg",
    icon: "🏭",
    liveUrl: "",
    githubUrl: "",
    demoUrl: "",
    caseStudyUrl: "",
    featured: true,
    disabled: false,
    priority: 100,
    startDate: "2023-01-01",
    endDate: "2023-12-30",
    duration: "12 months",
    clientInfo: {
      name: "Global Manufacturing Corp",
      industry: "Manufacturing",
      size: "enterprise",
      location: "International",
      isPublic: false
    },
    metrics: {
      usersReached: 1200,
      performanceImprovement: "40% efficiency gain",
      revenueImpact: "$3M+ annual savings",
      customMetrics: {
        daily_stock_moves: 50000,
        warehouses_connected: 12,
        modules_customized: 20,
        data_records_migrated: "5M+"
      }
    },
    challenges: [
      "Legacy system data fragmentation",
      "Complex multi-currency consolidation",
      "Real-time synchronization latency",
      "User adoption across different cultures"
    ],
    solutions: [
      "Custom ETL pipeline for data migration",
      "Distributed architecture with read replicas",
      "Progressive Web App for warehouse staff",
      "Automated testing suite for custom modules"
    ],
    teamSize: 12,
    role: "Lead ERP Architect",
    createdAt: 1704067200000,
    updatedAt: 1706745600000,
    version: 1
  },
  {
    title: "Cegid Retail & POS Architecture",
    description: "Omnichannel retail management solution using Cegid Retail Y2, connecting physical stores with e-commerce platforms.",
    longDescription: "Designed and implemented a unified retail architecture for a luxury fashion retailer with 50+ stores. Leveraged Cegid Retail Y2 to synchronize POS data, inventory, and customer loyalty programs in real-time. Developed custom middleware to bridge Cegid with Shopify Plus, enabling Click & Collect, Ship from Store, and unified customer profiles. The system processes high-volume transactions with zero downtime during peak seasons.",
    category: "Retail Solutions",
    status: "completed",
    achievements: [
      "Connected 50+ physical stores",
      "Enabled real-time omnichannel inventory",
      "Reduced stockouts by 60%",
      "Unified customer loyalty program",
      "Zero downtime during Black Friday",
      "Automated replenishment workflows",
      "Integrated mobile POS for staff"
    ],
    technologies: ["Cegid Retail Y2", ".NET", "SQL Server", "Azure", "Shopify API", "Node.js", "React Native", "Redis"],
    tags: ["retail", "cegid", "pos", "omnichannel", "ecommerce", "integration"],
    image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800&h=600&fit=crop",
    logo: "/cegid-logo.svg",
    icon: "🛍️",
    liveUrl: "",
    githubUrl: "",
    demoUrl: "",
    caseStudyUrl: "",
    featured: true,
    disabled: false,
    priority: 95,
    startDate: "2023-04-01",
    endDate: "2023-11-30",
    duration: "8 months",
    clientInfo: {
      name: "Luxury Fashion Brand",
      industry: "Retail",
      size: "enterprise",
      location: "Europe",
      isPublic: false
    },
    metrics: {
      usersReached: 500,
      performanceImprovement: "60% less stockouts",
      revenueImpact: "25% sales increase",
      customMetrics: {
        stores_connected: 50,
        transactions_peak_hour: 5000,
        inventory_accuracy: "99.8%",
        omnichannel_orders: "30%"
      }
    },
    teamSize: 8,
    role: "Technical Lead",
    createdAt: 1701475200000,
    updatedAt: 1705881600000,
    version: 1
  },
  {
    title: "Otello Hotel Management System",
    description: "Next-gen Property Management System (PMS) for a hotel chain, featuring booking engine, housekeeping, and revenue management.",
    longDescription: "Deployed a customized Otello PMS for a boutique hotel chain, revolutionizing their guest experience and operational efficiency. The system features a custom booking engine with dynamic pricing, a mobile app for contactless check-in/out, and a housekeeping management module. Includes a state-of-the-art task management system and precise time-tracking utilities that streamline staff operations. The system is a perfect, awesome solution for modern hospitality management. Integrated with channel managers (Booking.com, Expedia) and payment gateways. The solution improved occupancy rates by 15% through AI-driven revenue management.",
    category: "Hospitality Solutions",
    status: "completed",
    achievements: [
      "Increased occupancy by 15%",
      "Enabled contactless check-in",
      "Automated housekeeping schedules",
      "Real-time channel synchronization",
      "Integrated payment processing",
      "AI-driven dynamic pricing",
      "Reduced front-desk workload by 40%"
    ],
    technologies: ["Otello PMS", "React", "Node.js", "GraphQL", "PostgreSQL", "AWS Lambda", "Stripe", "Twilio"],
    tags: ["hospitality", "pms", "booking", "hotel", "saas", "automation"],
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
    logo: "/otello-logo.svg",
    icon: "hotel",
    liveUrl: "",
    githubUrl: "",
    demoUrl: "",
    caseStudyUrl: "",
    featured: true,
    disabled: false,
    priority: 90,
    startDate: "2023-06-01",
    endDate: "2024-01-15",
    duration: "7 months",
    clientInfo: {
      name: "Boutique Hotel Group",
      industry: "Hospitality",
      size: "medium",
      location: "Mediterranean",
      isPublic: false
    },
    metrics: {
      usersReached: 200,
      performanceImprovement: "40% efficiency boost",
      revenueImpact: "15% revenue growth",
      customMetrics: {
        rooms_managed: 500,
        bookings_monthly: 2000,
        checkin_time_reduction: "70%",
        ota_sync_speed: "<2s"
      }
    },
    teamSize: 6,
    role: "Solution Architect",
    createdAt: 1698883200000,
    updatedAt: 1706140800000,
    version: 1
  },
  {
    title: "Moodle LMS & E-Learning Ecosystem",
    description: "Enterprise-grade Learning Management System serving 50,000+ students with custom modules and high-availability infrastructure.",
    longDescription: "Architected a scalable Moodle LMS environment for a major university. The solution includes a high-availability server cluster (Ubuntu/Nginx/PHP-FPM), custom plugin development for advanced grading and attendance, and integration with Microsoft Teams for live classes. Implemented a video streaming server for on-demand content and a gamification module to boost student engagement.",
    category: "Education Technology",
    status: "completed",
    achievements: [
      "Supports 50,000+ concurrent users",
      "Developed 5 custom Moodle plugins",
      "99.99% uptime during exam periods",
      "Integrated live video classrooms",
      "Automated certificate generation",
      "Optimized database for high load",
      "Mobile-friendly responsive theme"
    ],
    technologies: ["Moodle", "PHP", "MariaDB", "Redis", "Linux (Ubuntu)", "Nginx", "JavaScript", "SCORM", "WebRTC"],
    tags: ["edtech", "moodle", "lms", "php", "education", "server-admin"],
    image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=600&fit=crop",
    logo: "/moodle-logo.svg",
    icon: "🎓",
    liveUrl: "",
    githubUrl: "",
    demoUrl: "",
    caseStudyUrl: "",
    featured: true,
    disabled: false,
    priority: 88,
    startDate: "2022-09-01",
    endDate: "2023-03-30",
    duration: "7 months",
    clientInfo: {
      name: "National University",
      industry: "Education",
      size: "enterprise",
      location: "North Africa",
      isPublic: false
    },
    metrics: {
      usersReached: 50000,
      performanceImprovement: "99.99% uptime",
      customMetrics: {
        concurrent_users: 5000,
        courses_hosted: 1200,
        daily_logins: 25000,
        plugins_developed: 5
      }
    },
    challenges: [
      "High concurrency during exams",
      "Complex gradebook calculations",
      "Video bandwidth optimization",
      "Legacy data migration"
    ],
    solutions: [
      "Redis caching layer implementation",
      "Database sharding strategy",
      "CDN integration for media",
      "Custom import scripts"
    ],
    teamSize: 5,
    role: "Lead LMS Developer",
    createdAt: 1688169600000,
    updatedAt: 1703980800000,
    version: 1
  },
  {
    title: "OpenProject Enterprise Management",
    description: "Customized OpenProject deployment for a construction firm, featuring Gantt charts, resource planning, and cost tracking.",
    longDescription: "Implemented a tailored OpenProject solution for a large-scale construction company. The platform manages complex multi-year projects with advanced Gantt charts, resource allocation, and budget tracking. Developed custom plugins for construction-specific workflows (RFIs, Submittals) and integrated with BIM software. The system ensures projects stay on schedule and within budget.",
    category: "Project Management",
    status: "completed",
    achievements: [
      "Managed $500M+ in project value",
      "Reduced project delays by 25%",
      "Real-time budget tracking",
      "Integrated BIM model viewer",
      "Custom workflow automation",
      "Mobile app for field reports",
      "Automated stakeholder reporting"
    ],
    technologies: ["OpenProject", "Ruby on Rails", "Angular", "PostgreSQL", "Docker", "Linux", "BIM API"],
    tags: ["project-management", "openproject", "construction", "ruby", "angular", "enterprise"],
    image: "https://images.unsplash.com/photo-1507537297725-24a1c434c175?w=800&h=600&fit=crop",
    logo: "/openproject-logo.svg",
    icon: "📊",
    liveUrl: "",
    githubUrl: "",
    demoUrl: "",
    caseStudyUrl: "",
    featured: false,
    disabled: false,
    priority: 85,
    startDate: "2023-02-01",
    endDate: "2023-08-30",
    duration: "7 months",
    clientInfo: {
      name: "Construction Giants Ltd",
      industry: "Construction",
      size: "large",
      location: "Middle East",
      isPublic: false
    },
    metrics: {
      usersReached: 300,
      performanceImprovement: "25% fewer delays",
      revenueImpact: "10% cost reduction",
      customMetrics: {
        projects_managed: 45,
        budget_tracked: "$500M+",
        rfis_processed: 5000,
        field_reports_daily: 150
      }
    },
    teamSize: 4,
    role: "System Integrator",
    createdAt: 1695945600000,
    updatedAt: 1704931200000,
    version: 1
  },
  {
    title: "Jira Service Management Enterprise",
    description: "Enterprise-wide Jira Service Management implementation for IT service delivery, automating incidents, changes, and problems.",
    longDescription: "Rolled out Jira Service Management (JSM) for a financial institution's IT department. Configured complex workflows for Incident, Problem, and Change Management following ITIL best practices. Implemented automation rules to triage tickets, SLA monitoring, and a self-service portal with a knowledge base. Integrated with Slack for notifications and monitoring tools for auto-ticket creation.",
    category: "ITSM Solutions",
    status: "completed",
    achievements: [
      "Reduced MTTR by 50%",
      "Automated 60% of ticket routing",
      "Implemented ITIL best practices",
      "Created 500+ knowledge articles",
      "Integrated monitoring alerts",
      "95% SLA compliance achieved",
      "Seamless Slack integration"
    ],
    technologies: ["Jira Service Management", "Groovy (ScriptRunner)", "Automation for Jira", "Slack API", "Rest API"],
    tags: ["jira", "itsm", "automation", "itil", "workflow", "enterprise"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    logo: "/jira-logo.svg",
    icon: "🎫",
    liveUrl: "",
    githubUrl: "",
    demoUrl: "",
    caseStudyUrl: "",
    featured: false,
    disabled: false,
    priority: 82,
    startDate: "2023-08-01",
    endDate: "2024-02-01",
    duration: "6 months",
    clientInfo: {
      name: "FinTech Solutions",
      industry: "Finance",
      size: "large",
      location: "Remote",
      isPublic: false
    },
    metrics: {
      usersReached: 2000,
      performanceImprovement: "50% faster resolution",
      customMetrics: {
        tickets_monthly: 3000,
        automation_rate: "60%",
        sla_compliance: "95%",
        kb_articles: 500
      }
    },
    teamSize: 3,
    role: "Atlassian Consultant",
    createdAt: 1704067200000,
    updatedAt: 1719705600000,
    version: 1
  },
  {
    title: "Server Infrastructure & Cloud DevOps",
    description: "High-performance server infrastructure setup and management using Linux, Docker, and Kubernetes for scalable applications.",
    longDescription: "Designed and managed the complete server infrastructure for a SaaS platform. Migrated legacy monolithic applications to a microservices architecture using Docker and Kubernetes. Implemented CI/CD pipelines with GitHub Actions, automated backups, and comprehensive monitoring with Prometheus and Grafana. Hardened security with firewalls, VPNs, and regular audits.",
    category: "DevOps & Infrastructure",
    status: "active",
    achievements: [
      "99.999% system availability",
      "Automated CI/CD pipelines",
      "Reduced server costs by 30%",
      "Implemented zero-trust security",
      "Scalable Kubernetes cluster",
      "Real-time monitoring dashboard",
      "Disaster recovery plan tested"
    ],
    technologies: ["Linux", "Docker", "Kubernetes", "AWS", "Terraform", "Ansible", "Nginx", "Prometheus", "Grafana", "Bash"],
    tags: ["devops", "infrastructure", "linux", "cloud", "security", "kubernetes"],
    image: "https://images.unsplash.com/photo-1558494949-ef526b0042a0?w=800&h=600&fit=crop",
    logo: "/server-logo.svg",
    icon: "🖥️",
    liveUrl: "",
    githubUrl: "",
    demoUrl: "",
    caseStudyUrl: "",
    featured: true,
    disabled: false,
    priority: 80,
    startDate: "2022-01-01",
    endDate: "2024-03-01",
    duration: "Ongoing",
    clientInfo: {
      name: "SaaS Tech Corp",
      industry: "Technology",
      size: "medium",
      location: "International",
      isPublic: false
    },
    metrics: {
      performanceImprovement: "30% cost reduction",
      uptime: "99.999%",
      customMetrics: {
        containers_managed: 200,
        deployments_daily: 15,
        backup_success_rate: "100%",
        security_incidents: 0
      }
    },
    teamSize: 4,
    role: "Lead DevOps Engineer",
    createdAt: 1675209600000,
    updatedAt: 1701388800000,
    version: 1
  }
];