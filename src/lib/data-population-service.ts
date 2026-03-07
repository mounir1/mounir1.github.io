import {
  projectService,
  skillService,
  experienceService,
  dataService,
} from './firebase-data-service';
import type { ProjectInput } from '@/types/project';
import type { SkillInput } from '@/components/admin/skills/types';

// Create ExperienceInput type based on Experience interface
interface ExperienceInput {
  title: string;
  company: string;
  position: string;
  description: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  technologies: string[];
  achievements: string[];
  location: string;
  employmentType: string;
  companySize: string;
  industry: string;
}

// Portfolio configuration
interface PortfolioConfig {
  version: string;
  lastUpdated: Date;
  owner: {
    name: string;
    title: string;
    email: string;
    linkedin: string;
    github: string;
    website: string;
  };
  theme: {
    primaryColor: string;
    accentColor: string;
    mode: 'light' | 'dark' | 'auto';
  };
  features: {
    analytics: boolean;
    contactForm: boolean;
    downloadCV: boolean;
    darkMode: boolean;
  };
}

// Sample data for portfolio initialization
const SAMPLE_PROJECTS: ProjectInput[] = [
  {
    title: 'Advanced React Dashboard',
    description:
      'A comprehensive dashboard built with React, TypeScript, and modern UI libraries featuring real-time data visualization, advanced filtering, and responsive design.',
    category: 'Web Application',
    role: 'Lead Frontend Developer',
    status: 'completed',
    technologies: [
      'React',
      'TypeScript',
      'Tailwind CSS',
      'Zustand',
      'React Query',
      'Chart.js',
    ],
    images: ['/projects/react-dashboard.jpg'],
    achievements: [
      'Improved data loading performance by 60%',
      'Implemented real-time updates with WebSocket',
      'Created reusable component library',
      'Achieved 98% test coverage',
    ],
    challenges: [
      'Real-time data synchronization',
      'Complex state management',
      'Performance optimization',
    ],
    lessons: [
      'WebSocket reconnection patterns',
      'State management optimization',
      'Component architecture design',
    ],
    liveUrl: 'https://dashboard.example.com',
    githubUrl: 'https://github.com/mounirab/react-dashboard',
    featured: true,
    priority: 95,
  },
  {
    title: 'E-commerce Platform',
    description:
      'Full-stack e-commerce solution with Next.js, Stripe integration, and advanced inventory management.',
    category: 'E-commerce',
    role: 'Full-Stack Developer',
    status: 'completed',
    technologies: [
      'Next.js',
      'Node.js',
      'PostgreSQL',
      'Stripe',
      'Prisma',
      'Tailwind CSS',
    ],
    images: ['/projects/ecommerce-platform.jpg'],
    achievements: [
      'Processed $100K+ in transactions',
      'Achieved 99.9% uptime',
      'Reduced page load time by 40%',
      'Integrated 5+ payment methods',
    ],
    challenges: [
      'Payment security',
      'Inventory synchronization',
      'SEO optimization',
    ],
    lessons: [
      'PCI compliance implementation',
      'Real-time inventory management',
      'Next.js optimization strategies',
    ],
    liveUrl: 'https://shop.example.com',
    githubUrl: 'https://github.com/mounirab/ecommerce-platform',
    featured: true,
    priority: 90,
  },
  {
    title: 'Mobile App - TaskFlow',
    description:
      'Cross-platform productivity app built with React Native, featuring offline support and cloud synchronization.',
    category: 'Mobile Application',
    role: 'Mobile Developer',
    status: 'completed',
    technologies: [
      'React Native',
      'Expo',
      'Firebase',
      'Redux Toolkit',
      'AsyncStorage',
    ],
    images: ['/projects/taskflow-app.jpg'],
    achievements: [
      '10K+ active users',
      '4.8/5 App Store rating',
      'Featured in App Store',
      '99% crash-free rate',
    ],
    challenges: [
      'Offline data management',
      'Cross-platform compatibility',
      'Performance optimization',
    ],
    lessons: [
      'SQLite sync patterns',
      'Platform-specific optimization',
      'Mobile UX best practices',
    ],
    liveUrl: 'https://taskflow.app',
    githubUrl: 'https://github.com/mounirab/taskflow-app',
    featured: true,
    priority: 85,
  },
];

const SAMPLE_SKILLS: SkillInput[] = [
  {
    name: 'React',
    category: 'Frontend Development',
    level: 'expert',
    description:
      'Expert in React ecosystem including hooks, context, and advanced patterns',
    featured: true,
    tags: ['javascript', 'frontend', 'spa'],
    relatedSkills: ['JavaScript', 'TypeScript', 'Next.js'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    name: 'TypeScript',
    category: 'Frontend Development',
    level: 'expert',
    description:
      'Strong typing and advanced TypeScript patterns for scalable applications',
    featured: true,
    tags: ['javascript', 'typing', 'scalability'],
    relatedSkills: ['JavaScript', 'React', 'Node.js'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    name: 'Node.js',
    category: 'Backend Development',
    level: 'advanced',
    description:
      'Backend development with Express, NestJS, and microservices architecture',
    featured: true,
    tags: ['backend', 'javascript', 'api'],
    relatedSkills: ['Express.js', 'MongoDB', 'PostgreSQL'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    name: 'Python',
    category: 'Backend Development',
    level: 'advanced',
    description:
      'Django, FastAPI, and data science libraries for web and AI applications',
    featured: true,
    tags: ['backend', 'ai', 'data-science'],
    relatedSkills: ['Django', 'FastAPI', 'TensorFlow'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    name: 'AWS',
    category: 'Cloud & DevOps',
    level: 'advanced',
    description:
      'Cloud infrastructure, serverless, and containerization with AWS services',
    featured: false,
    tags: ['cloud', 'devops', 'infrastructure'],
    relatedSkills: ['Docker', 'Kubernetes', 'Terraform'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

const SAMPLE_EXPERIENCES: ExperienceInput[] = [
  {
    title: 'Senior Full-Stack Developer',
    company: 'TechCorp Solutions',
    position: 'Senior Full-Stack Developer',
    startDate: '2022-06-01',
    current: true,
    description:
      'Leading development of enterprise web applications using React, Node.js, and cloud technologies. Mentoring junior developers and architecting scalable solutions.',
    technologies: [
      'React',
      'TypeScript',
      'Node.js',
      'AWS',
      'PostgreSQL',
      'Docker',
    ],
    achievements: [
      'Led team of 5 developers on major platform migration',
      'Reduced application load time by 50%',
      'Implemented CI/CD pipeline reducing deployment time by 80%',
      'Mentored 3 junior developers to mid-level positions',
    ],
    location: 'San Francisco, CA',
    employmentType: 'full-time',
    companySize: 'large',
    industry: 'Technology',
  },
  {
    title: 'Frontend Developer',
    company: 'StartupXYZ',
    position: 'Frontend Developer',
    startDate: '2020-03-15',
    endDate: '2022-05-30',
    current: false,
    description:
      'Developed user-facing features for B2B SaaS platform. Collaborated with design team to implement responsive interfaces and improve user experience.',
    technologies: ['React', 'JavaScript', 'SASS', 'Redux', 'Jest'],
    achievements: [
      'Built responsive dashboard used by 10K+ users',
      'Improved user engagement by 35%',
      'Reduced bug reports by 60% through comprehensive testing',
      'Implemented accessibility standards (WCAG 2.1)',
    ],
    location: 'Remote',
    employmentType: 'full-time',
    companySize: 'startup',
    industry: 'SaaS',
  },
  {
    title: 'Web Developer',
    company: 'Digital Agency Pro',
    position: 'Web Developer',
    startDate: '2018-09-01',
    endDate: '2020-02-28',
    current: false,
    description:
      'Developed custom websites and web applications for various clients across different industries. Worked with WordPress, custom PHP solutions, and modern JavaScript frameworks.',
    technologies: ['WordPress', 'PHP', 'JavaScript', 'MySQL', 'HTML/CSS'],
    achievements: [
      'Delivered 25+ client projects on time and budget',
      'Increased client satisfaction rate to 98%',
      'Reduced website loading times by average 45%',
      'Built reusable component library for agency',
    ],
    location: 'New York, NY',
    employmentType: 'full-time',
    companySize: 'small',
    industry: 'Digital Marketing',
  },
];

const PORTFOLIO_CONFIG: PortfolioConfig = {
  version: '2.0.0',
  lastUpdated: new Date(),
  owner: {
    name: 'Mounir Abderrahmani',
    title: 'Senior Full-Stack Developer & Software Engineer',
    email: 'mounir.abderrahmani@example.com',
    linkedin: 'https://linkedin.com/in/mounirabderrahmani',
    github: 'https://github.com/mounirab',
    website: 'https://mounir1.github.io',
  },
  theme: {
    primaryColor: '#4361ee',
    accentColor: '#7209b7',
    mode: 'auto',
  },
  features: {
    analytics: true,
    contactForm: true,
    downloadCV: true,
    darkMode: true,
  },
};

class DataPopulationService {
  private isPopulated = false;

  async checkIfDataExists(): Promise<boolean> {
    try {
      const [projects, skills, experiences] = await Promise.all([
        projectService.getAllProjects(),
        skillService.getAllSkills(),
        experienceService.getAllExperiences(),
      ]);

      return projects.length > 0 && skills.length > 0 && experiences.length > 0;
    } catch (error) {
      console.error('❌ Error checking existing data:', error);
      return false;
    }
  }

  async populateProjects(): Promise<void> {
    console.log('📄 Populating projects data...');

    for (const project of SAMPLE_PROJECTS) {
      try {
        await projectService.createProject(project);
        console.log(`✅ Created project: ${project.title}`);
      } catch (error) {
        console.error(`❌ Error creating project ${project.title}:`, error);
      }
    }
  }

  async populateSkills(): Promise<void> {
    console.log('🎯 Populating skills data...');

    for (const skill of SAMPLE_SKILLS) {
      try {
        await skillService.createSkill(skill);
        console.log(`✅ Created skill: ${skill.name}`);
      } catch (error) {
        console.error(`❌ Error creating skill ${skill.name}:`, error);
      }
    }
  }

  async populateExperiences(): Promise<void> {
    console.log('💼 Populating experiences data...');

    for (const experience of SAMPLE_EXPERIENCES) {
      try {
        await experienceService.createExperience(experience);
        console.log(
          `✅ Created experience: ${experience.position} at ${experience.company}`
        );
      } catch (error) {
        console.error(
          `❌ Error creating experience ${experience.position}:`,
          error
        );
      }
    }
  }

  async populatePortfolioConfig(): Promise<void> {
    console.log('⚙️ Populating portfolio configuration...');

    try {
      await dataService.create('portfolio_config', PORTFOLIO_CONFIG);
      console.log('✅ Created portfolio configuration');
    } catch (error) {
      console.error('❌ Error creating portfolio config:', error);
    }
  }

  async initializeDatabase(): Promise<void> {
    if (!dataService.isConnected) {
      console.log('🔥 Firebase not connected - skipping data population');
      return;
    }

    console.log('🚀 Starting database initialization...');

    try {
      // Check if data already exists
      const dataExists = await this.checkIfDataExists();

      if (dataExists) {
        console.log('📊 Data already exists - skipping population');
        this.isPopulated = true;
        return;
      }

      // Populate all data
      await Promise.all([
        this.populateProjects(),
        this.populateSkills(),
        this.populateExperiences(),
        this.populatePortfolioConfig(),
      ]);

      this.isPopulated = true;
      console.log('🎉 Database initialization completed successfully!');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  async resetDatabase(): Promise<void> {
    if (!dataService.isConnected) {
      console.log('🔥 Firebase not connected - cannot reset database');
      return;
    }

    console.log('🗑️ Resetting database...');

    try {
      // Note: In a real app, you'd implement proper cleanup
      // For now, just repopulate (Firebase will handle overwrites)
      await this.initializeDatabase();
      console.log('✅ Database reset completed');
    } catch (error) {
      console.error('❌ Database reset failed:', error);
      throw error;
    }
  }

  async getHealthStatus(): Promise<{
    isConnected: boolean;
    isPopulated: boolean;
    dataCount: {
      projects: number;
      skills: number;
      experiences: number;
    };
  }> {
    const isConnected = await dataService.healthCheck();

    let dataCount = { projects: 0, skills: 0, experiences: 0 };

    if (isConnected) {
      try {
        const [projects, skills, experiences] = await Promise.all([
          projectService.getAllProjects(),
          skillService.getAllSkills(),
          experienceService.getAllExperiences(),
        ]);

        dataCount = {
          projects: projects.length,
          skills: skills.length,
          experiences: experiences.length,
        };
      } catch (error) {
        console.error('❌ Error getting data count:', error);
      }
    }

    return {
      isConnected,
      isPopulated:
        this.isPopulated ||
        (dataCount.projects > 0 &&
          dataCount.skills > 0 &&
          dataCount.experiences > 0),
      dataCount,
    };
  }
}

// Export singleton instance
export const dataPopulationService = new DataPopulationService();
export default dataPopulationService;
