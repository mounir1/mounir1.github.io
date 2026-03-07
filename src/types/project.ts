export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  category: string;
  role: string;
  technologies: string[];
  status: string;
  priority: number;
  startDate?: string;
  endDate?: string;
  duration?: string;
  githubUrl?: string;
  liveUrl?: string;
  demoUrl?: string;
  caseStudyUrl?: string;
  images?: string[];
  image?: string; // For backward compatibility
  logo?: string;
  icon?: string;
  achievements?: string[];
  challenges?: string[];
  lessons?: string[];
  solutions?: string[];
  collaborators?: string[];
  tags?: string[];
  teamSize?: number;
  featured?: boolean;
  createdAt: number;
  updatedAt: number;
  disabled?: boolean;
  version?: number;
  // Client info
  clientInfo?: {
    name: string;
    industry: string;
    size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
    location: string;
    website?: string;
    isPublic: boolean;
  };
  // Project metrics
  metrics?: {
    usersReached?: number;
    performanceImprovement?: string;
    revenueImpact?: string;
    uptime?: string;
    customMetrics?: Record<string, string | number>;
  };
}

export interface ProjectInput {
  title: string;
  description: string;
  longDescription?: string;
  category: string;
  role: string;
  technologies: string[];
  status: string;
  priority: number;
  startDate?: string;
  endDate?: string;
  duration?: string;
  githubUrl?: string;
  liveUrl?: string;
  demoUrl?: string;
  caseStudyUrl?: string;
  images?: string[];
  image?: string;
  logo?: string;
  icon?: string;
  achievements?: string[];
  challenges?: string[];
  lessons?: string[];
  solutions?: string[];
  collaborators?: string[];
  tags?: string[];
  teamSize?: number;
  featured?: boolean;
  disabled?: boolean;
  version?: number;
  createdAt?: number;
  updatedAt?: number;
  clientInfo?: {
    name: string;
    industry: string;
    size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
    location: string;
    website?: string;
    isPublic: boolean;
  };
  metrics?: {
    usersReached?: number;
    performanceImprovement?: string;
    revenueImpact?: string;
    uptime?: string;
    customMetrics?: Record<string, string | number>;
  };
}
