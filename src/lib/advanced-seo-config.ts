/**
 * Advanced SEO Configuration for Maximum Google Ranking
 * @author Mounir Abderrahmani
 * @description Complete SEO optimization to rank #1 for "Mounir Abderrahmani" and related searches
 * 
 * Target Keywords:
 * - Primary: "Mounir Abderrahmani", "Mounir Abderrahmani developer", "Mounir Abderrahmani portfolio"
 * - Secondary: "Senior Full-Stack Developer Algeria", "React Developer Algiers", "PIM Integration Specialist"
 * - Long-tail: "Hire Full-Stack Developer Algeria", "Remote React Developer North Africa"
 */

export interface AdvancedSEOConfig {
  // Basic Information
  person: {
    name: string;
    alternateNames: string[];
    jobTitles: string[];
    email: string;
    phone: string;
    website: string;
  };
  
  // Location Information
  location: {
    city: string;
    region: string;
    country: string;
    countryCode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  
  // Professional Information
  professional: {
    yearsOfExperience: number;
    specializations: string[];
    industries: string[];
    languages: string[];
    availability: string;
  };
  
  // Social Media Profiles
  social: {
    github: string;
    linkedin: string;
    twitter: string;
    facebook: string;
    instagram: string;
    youtube: string;
    medium: string;
    devto: string;
    stackoverflow: string;
    codepen: string;
    gitlab: string;
    bitbucket: string;
  };
  
  // Keywords Strategy
  keywords: {
    primary: string[];
    secondary: string[];
    longTail: string[];
    technical: string[];
    location: string[];
    services: string[];
  };
}

export const advancedSEOConfig: AdvancedSEOConfig = {
  person: {
    name: 'Mounir Abderrahmani',
    alternateNames: [
      'Mounir Abderrahmani',
      'Mounir A.',
      'Mounir WebDev',
      'mounir1',
      'Mounir Developer',
      'Mounir Full Stack',
      'Mounir PIM Specialist',
      'Mounir Magento Expert',
    ],
    jobTitles: [
      'Senior Full-Stack Developer',
      'Software Engineer',
      'PIM Integration Specialist',
      'Magento 2 Developer',
      'React Developer',
      'Node.js Developer',
      'Enterprise Solutions Architect',
      'E-commerce Developer',
      'Freelance Developer',
      'Technical Consultant',
    ],
    email: 'mounir.webdev@gmail.com',
    phone: '+213 674 094 855',
    website: 'https://mounir1.github.io',
  },
  
  location: {
    city: 'Algiers',
    region: 'Algiers Province',
    country: 'Algeria',
    countryCode: 'DZ',
    coordinates: {
      latitude: 36.7538,
      longitude: 3.0588,
    },
  },
  
  professional: {
    yearsOfExperience: 10,
    specializations: [
      'Full-Stack Development',
      'PIM Integration (Akeneo, Pimcore)',
      'Magento 2 Development',
      'React & React Native',
      'Node.js Backend Development',
      'Enterprise Application Integration',
      'E-commerce Solutions',
      'ETL Pipeline Development',
      'Cloud Architecture (AWS, GCP)',
      'DevOps & CI/CD',
    ],
    industries: [
      'E-commerce',
      'Retail',
      'Technology',
      'Finance',
      'Healthcare',
      'Education',
      'Manufacturing',
      'Hospitality',
    ],
    languages: [
      'Arabic (Native)',
      'English (Fluent)',
      'French (Fluent)',
      'Turkish (Intermediate)',
    ],
    availability: 'Available for freelance and full-time opportunities',
  },
  
  social: {
    github: 'https://github.com/mounir1',
    linkedin: 'https://www.linkedin.com/in/mounir1badi/',
    twitter: 'https://x.com/Mounir1badi',
    facebook: 'https://www.facebook.com/mounir.abderrahmani',
    instagram: 'https://www.instagram.com/mounir1badi',
    youtube: 'https://www.youtube.com/@mounir1badi',
    medium: 'https://medium.com/@mounir.webdev',
    devto: 'https://dev.to/mounir1',
    stackoverflow: 'https://stackoverflow.com/users/mounir1',
    codepen: 'https://codepen.io/mounir1',
    gitlab: 'https://gitlab.com/mounir1',
    bitbucket: 'https://bitbucket.org/mounir1',
  },
  
  keywords: {
    primary: [
      'Mounir Abderrahmani',
      'Mounir Abderrahmani developer',
      'Mounir Abderrahmani portfolio',
      'Mounir Abderrahmani GitHub',
      'Mounir Abderrahmani LinkedIn',
      'Mounir Abderrahmani Algeria',
      'Mounir Abderrahmani Full Stack Developer',
      'Mounir Abderrahmani PIM Specialist',
    ],
    secondary: [
      'Senior Full-Stack Developer Algeria',
      'React Developer Algiers',
      'Node.js Developer North Africa',
      'Magento 2 Developer Algeria',
      'PIM Integration Specialist',
      'Akeneo Expert Developer',
      'Pimcore Developer',
      'Enterprise Integration Developer',
      'E-commerce Developer Algeria',
      'Freelance Developer Algiers',
    ],
    longTail: [
      'Hire Full-Stack Developer Algeria',
      'Remote React Developer North Africa',
      'PIM integration consultant Algeria',
      'Magento 2 developer for hire',
      'Enterprise application developer Algeria',
      'Best Full-Stack developer in Algiers',
      'Experienced React developer remote',
      'Senior software engineer Algeria',
      'Full-stack developer 10 years experience',
      'E-commerce integration specialist',
    ],
    technical: [
      'React',
      'React.js',
      'React Native',
      'Next.js',
      'Node.js',
      'Express.js',
      'TypeScript',
      'JavaScript',
      'Python',
      'PHP',
      'Magento 2',
      'Adobe Commerce',
      'Akeneo PIM',
      'Pimcore',
      'PostgreSQL',
      'MySQL',
      'MongoDB',
      'Redis',
      'Elasticsearch',
      'RabbitMQ',
      'Apache Kafka',
      'Docker',
      'Kubernetes',
      'AWS',
      'Google Cloud',
      'Azure',
      'CI/CD',
      'Jenkins',
      'GitHub Actions',
      'GitLab CI',
      'REST API',
      'GraphQL',
      'Microservices',
      'Serverless',
      'Lambda Functions',
      'ETL',
      'Data Integration',
      'API Integration',
    ],
    location: [
      'Algeria',
      'Algiers',
      'North Africa',
      'MENA region',
      'Remote worldwide',
      'Europe timezone',
      'GMT+1',
    ],
    services: [
      'Full-Stack Development',
      'Frontend Development',
      'Backend Development',
      'PIM Integration',
      'Magento Development',
      'E-commerce Solutions',
      'Enterprise Integration',
      'API Development',
      'Cloud Migration',
      'DevOps Consulting',
      'Technical Consulting',
      'Code Review',
      'Performance Optimization',
      'System Architecture',
      'Database Design',
      'Mobile App Development',
      'Progressive Web Apps',
      'Headless Commerce',
      'Multi-channel Publishing',
      'Data Migration',
    ],
  },
};

/**
 * Generate comprehensive meta keywords string
 */
export const generateMetaKeywords = (): string => {
  const { keywords } = advancedSEOConfig;
  const allKeywords = [
    ...keywords.primary,
    ...keywords.secondary,
    ...keywords.longTail,
    ...keywords.technical,
    ...keywords.location,
    ...keywords.services,
  ];
  
  // Remove duplicates and join
  return [...new Set(allKeywords)].join(', ');
};

/**
 * Generate all alternate names variations
 */
export const generateAlternateNames = (): string[] => {
  return advancedSEOConfig.person.alternateNames;
};

/**
 * Generate location-based keywords
 */
export const generateLocationKeywords = (): string[] => {
  const { location, keywords } = advancedSEOConfig;
  const locationVariations = [
    `${location.city}`,
    `${location.city} ${location.country}`,
    `${location.city} developer`,
    `${location.city} Full-Stack Developer`,
    `${location.country} developer`,
    `${location.country} Full-Stack Developer`,
    `${location.region}`,
    `North Africa developer`,
    `MENA region developer`,
    ...keywords.location,
  ];
  
  return [...new Set(locationVariations)];
};

/**
 * Generate job title variations
 */
export const generateJobTitleVariiations = (): string[] => {
  return advancedSEOConfig.person.jobTitles;
};

/**
 * Get all social profiles for sameAs property
 */
export const getAllSocialProfiles = (): string[] => {
  const { social } = advancedSEOConfig;
  return Object.values(social).filter(Boolean);
};

/**
 * Generate comprehensive description variations
 */
export const generateDescriptionVariations = (): string[] => {
  const { person, professional, location } = advancedSEOConfig;
  
  return [
    // Primary description
    `Mounir Abderrahmani - Senior Full-Stack Developer with ${professional.yearsOfExperience}+ years of experience specializing in React, Node.js, PIM integration (Akeneo, Pimcore), and Magento 2. Based in ${location.city}, ${location.country}. Available for remote work worldwide.`,
    
    // Secondary description
    `Award-winning Senior Full-Stack Developer ${person.name} with expertise in enterprise integration, e-commerce solutions, and modern web technologies. ${professional.yearsOfExperience}+ years building scalable applications for global clients.`,
    
    // Technical description
    `Expert Full-Stack Developer specializing in React, Node.js, TypeScript, Magento 2, Akeneo PIM, and cloud architecture. ${professional.yearsOfExperience}+ years of experience delivering enterprise-grade solutions for e-commerce, finance, and technology sectors.`,
    
    // Location-based description
    `Top-rated Full-Stack Developer in ${location.city}, ${location.country}. ${person.name} provides expert web development services including React, Node.js, PIM integration, and Magento development. Remote work available worldwide.`,
    
    // Services description
    `Professional Full-Stack Development services by ${person.name}. Specializing in PIM integration, Magento 2, React, Node.js, enterprise applications, and e-commerce solutions. ${professional.yearsOfExperience}+ years of experience. Contact: ${person.email}`,
  ];
};

/**
 * Get primary description (most optimized)
 */
export const getPrimaryDescription = (): string => {
  return generateDescriptionVariations()[0];
};

/**
 * Generate title variations for different pages
 */
export const generateTitleVariations = (): Record<string, string> => {
  const { person } = advancedSEOConfig;
  
  return {
    home: `${person.name} | Senior Full-Stack Developer & Software Engineer | ${person.location.city}`,
    about: `About ${person.name} | Full-Stack Developer Portfolio | ${person.yearsOfExperience}+ Years Experience`,
    projects: `Projects by ${person.name} | Full-Stack Development Portfolio | React, Node.js, Magento`,
    skills: `Technical Skills | ${person.name} | React, Node.js, PIM, Magento Expert`,
    experience: `Work Experience | ${person.name} | Senior Full-Stack Developer`,
    contact: `Contact ${person.name} | Hire Full-Stack Developer | Freelance Available`,
    blog: `Tech Blog | ${person.name} | Full-Stack Development Insights`,
    services: `Development Services | ${person.name} | PIM Integration, Magento, React`,
    pim: `PIM Integration Services | ${person.name} | Akeneo & Pimcore Expert`,
    magento: `Magento 2 Development | ${person.name} | Certified Developer`,
  };
};

export default advancedSEOConfig;
