#!/usr/bin/env node

// Manual script to upload projects to Firebase Firestore
// Run with: node scripts/upload-projects.js

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

// Firebase configuration (replace with your actual config)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Comprehensive project data from your CV and portfolio
const projects = [
  {
    title: "HoTech Systems - Enterprise Integration Platform",
    description: "Comprehensive enterprise integration platform with real-time data synchronization and advanced analytics dashboard.",
    longDescription: "Built a complete enterprise integration platform for HoTech Systems, featuring real-time data synchronization across multiple systems, advanced analytics dashboard, and automated workflow management. The platform handles over 10,000 transactions daily with 99.9% uptime. Implemented microservices architecture with Docker containers and Kubernetes orchestration.",
    category: "Enterprise Integration",
    status: "completed",
    achievements: [
      "Reduced data processing time by 75%",
      "Achieved 99.9% system uptime",
      "Integrated 15+ enterprise systems seamlessly",
      "Processed over 1M transactions monthly",
      "Implemented real-time monitoring dashboard",
      "Built automated failover mechanisms",
      "Reduced manual intervention by 90%"
    ],
    technologies: ["React", "Node.js", "TypeScript", "PostgreSQL", "Redis", "Docker", "AWS", "WebSocket", "Kubernetes", "Nginx"],
    tags: ["enterprise", "integration", "real-time", "scalable", "microservices", "b2b"],
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop",
    logo: "/hotech-logo.svg",
    liveUrl: "https://hotech.systems",
    githubUrl: "",
    demoUrl: "",
    featured: true,
    disabled: false,
    priority: 95,
    startDate: "2023-06-01",
    endDate: "2024-02-15",
    duration: "8 months",
    clientInfo: {
      name: "HoTech Systems",
      industry: "Technology Integration",
      size: "enterprise",
      location: "International",
      isPublic: true
    },
    metrics: {
      usersReached: 10000,
      performanceImprovement: "75% faster processing",
      uptime: "99.9%",
      customMetrics: {
        "transactions_monthly": 1000000,
        "systems_integrated": 15,
        "cost_savings": "40%"
      }
    },
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 5,
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
    logo: "https://technostationery.com/media/logo/default/logo_techno_2.png",
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
      isPublic: true
    },
    metrics: {
      usersReached: 5000,
      performanceImprovement: "300% sales increase",
      revenueImpact: "$500K+ annual revenue",
      customMetrics: {
        "cart_abandonment_reduction": "45%",
        "page_load_time": "2s",
        "payment_gateways": 5
      }
    },
    createdAt: Date.now() - 86400000 * 60,
    updatedAt: Date.now() - 86400000 * 10,
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
      isPublic: true
    },
    metrics: {
      performanceImprovement: "80% faster processing",
      uptime: "99.95%",
      customMetrics: {
        "daily_data_processed": "5TB",
        "accuracy_rate": "99.95%",
        "automation_level": "95%"
      }
    },
    createdAt: Date.now() - 86400000 * 45,
    updatedAt: Date.now() - 86400000 * 3,
  },
  {
    title: "Magento E-commerce Solutions",
    description: "Custom Magento development and optimization for enterprise e-commerce platforms with advanced features.",
    longDescription: "Developed and optimized multiple Magento e-commerce platforms for enterprise clients, featuring custom modules, payment integrations, inventory management, and performance optimizations. Specialized in Magento 2.x development with custom themes, extensions, and multi-store configurations. Implemented advanced SEO, caching strategies, and third-party integrations.",
    category: "E-commerce",
    status: "completed",
    achievements: [
      "Built 15+ custom Magento stores",
      "Improved site performance by 65%",
      "Integrated 10+ payment gateways",
      "Developed 25+ custom modules",
      "Managed multi-store configurations",
      "Implemented advanced SEO strategies",
      "Reduced server response time by 70%"
    ],
    technologies: ["Magento", "PHP", "MySQL", "JavaScript", "LESS", "XML", "Composer", "Redis", "Elasticsearch", "Varnish"],
    tags: ["magento", "ecommerce", "php", "enterprise", "optimization", "b2b", "b2c"],
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop",
    logo: "/magento-logo.svg",
    liveUrl: "",
    githubUrl: "",
    demoUrl: "",
    featured: true,
    disabled: false,
    priority: 87,
    startDate: "2021-06-01",
    endDate: "2022-12-30",
    duration: "18 months",
    clientInfo: {
      name: "Multiple Enterprise Clients",
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
        "performance_improvement": "65%"
      }
    },
    createdAt: Date.now() - 86400000 * 200,
    updatedAt: Date.now() - 86400000 * 30,
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
        "development_time_saved": "60%"
      }
    },
    createdAt: Date.now() - 86400000 * 90,
    updatedAt: Date.now() - 86400000 * 15,
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
      isPublic: true
    },
    metrics: {
      usersReached: 2000,
      performanceImprovement: "40% better learning outcomes",
      customMetrics: {
        "student_satisfaction": "98%",
        "active_students": 2000,
        "learning_improvement": "40%"
      }
    },
    createdAt: Date.now() - 86400000 * 75,
    updatedAt: Date.now() - 86400000 * 8,
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
    createdAt: Date.now() - 86400000 * 120,
    updatedAt: Date.now() - 86400000 * 20,
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
        "visualization_speed": "sub-second"
      }
    },
    createdAt: Date.now() - 86400000 * 100,
    updatedAt: Date.now() - 86400000 * 12,
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
      costSavings: "50% infrastructure cost reduction",
      customMetrics: {
        "code_lines_migrated": 500000,
        "scalability_improvement": "10x",
        "cost_reduction": "50%",
        "deployment_time_reduction": "80%"
      }
    },
    createdAt: Date.now() - 86400000 * 150,
    updatedAt: Date.now() - 86400000 * 25,
  },
  {
    title: "Mobile Banking Application",
    description: "Secure mobile banking app with biometric authentication, real-time transactions, and comprehensive financial management.",
    longDescription: "Developed a secure mobile banking application using React Native with advanced security features including biometric authentication, end-to-end encryption, and real-time fraud detection. Features include account management, money transfers, bill payments, investment tracking, and financial analytics.",
    category: "Mobile Application",
    status: "completed",
    achievements: [
      "Serves 25K+ active users",
      "Achieved 99.8% uptime",
      "Implemented biometric security",
      "Built real-time fraud detection",
      "Integrated with 10+ banks",
      "Achieved 4.8/5 app store rating",
      "Processed $10M+ in transactions"
    ],
    technologies: ["React Native", "Node.js", "PostgreSQL", "AWS", "Biometric APIs", "Encryption", "Push Notifications", "Redux"],
    tags: ["mobile", "banking", "security", "fintech", "react-native", "biometric"],
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop",
    liveUrl: "",
    githubUrl: "",
    demoUrl: "",
    featured: false,
    disabled: false,
    priority: 82,
    startDate: "2022-03-01",
    endDate: "2022-11-30",
    duration: "9 months",
    clientInfo: {
      name: "Financial Services Client",
      industry: "Banking & Finance",
      size: "enterprise",
      location: "International",
      isPublic: false
    },
    metrics: {
      usersReached: 25000,
      uptime: "99.8%",
      revenueImpact: "$10M+ transactions processed",
      customMetrics: {
        "app_rating": "4.8/5",
        "transaction_volume": "$10M+",
        "bank_integrations": 10
      }
    },
    createdAt: Date.now() - 86400000 * 180,
    updatedAt: Date.now() - 86400000 * 40,
  }
];

async function clearExistingProjects() {
  console.log('🗑️  Clearing existing projects...');
  const querySnapshot = await getDocs(collection(db, 'projects'));
  const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
  console.log(`✅ Cleared ${querySnapshot.docs.length} existing projects`);
}

async function uploadProjects() {
  console.log('🚀 Starting project upload to Firebase Firestore...\n');

  try {
    // Optional: Clear existing projects (uncomment if needed)
    // await clearExistingProjects();

    console.log('📤 Uploading projects...');
    let successCount = 0;
    let errorCount = 0;

    for (const project of projects) {
      try {
        const docRef = await addDoc(collection(db, 'projects'), {
          ...project,
          version: 1,
          createdAt: project.createdAt || Date.now(),
          updatedAt: project.updatedAt || Date.now()
        });
        
        console.log(`✅ Uploaded: ${project.title} (ID: ${docRef.id})`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to upload: ${project.title}`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Upload Summary:');
    console.log(`✅ Successfully uploaded: ${successCount} projects`);
    console.log(`❌ Failed uploads: ${errorCount} projects`);
    console.log(`📁 Total projects: ${projects.length}`);

    if (successCount > 0) {
      console.log('\n🎉 Projects successfully uploaded to Firebase Firestore!');
      console.log('🌐 You can now view them in your portfolio application.');
      console.log('🔧 Admin dashboard: /admin');
    }

  } catch (error) {
    console.error('💥 Upload failed:', error.message);
    process.exit(1);
  }
}

// Run the upload
uploadProjects();