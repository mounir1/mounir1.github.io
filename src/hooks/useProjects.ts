import { useEffect, useMemo, useState } from "react";
import { db, isFirebaseEnabled } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { initialProjects } from "@/data/initial-projects";

export type ProjectCategory = 
  | "Web Application"
  | "Mobile Application" 
  | "Enterprise Integration"
  | "E-commerce"
  | "Machine Learning"
  | "API Development"
  | "DevOps & Infrastructure"
  | "Hospitality Solutions"
  | "Education Technology"
  | "Training / Education"
  | "Data Platform"
  | "Other";

export type ProjectStatus = "completed" | "in-progress" | "in-development" | "active" | "maintenance" | "archived";

export interface ClientInfo {
  name: string;
  industry: string;
  size: "startup" | "small" | "medium" | "large" | "enterprise";
  location: string;
  website?: string;
  isPublic: boolean;
}

export interface ProjectMetrics {
  usersReached?: number;
  performanceImprovement?: string;
  revenueImpact?: string;
  uptime?: string;
  customMetrics?: Record<string, string | number | boolean>;
}

export interface ProjectInput {
  title: string;
  description: string;
  longDescription?: string;
  category: ProjectCategory;
  status: ProjectStatus;
  achievements: string[];
  technologies: string[];
  tags: string[];
  image?: string;
  logo?: string;
  icon?: string;
  liveUrl?: string;
  githubUrl?: string;
  demoUrl?: string;
  caseStudyUrl?: string;
  featured: boolean;
  disabled: boolean;
  priority: number;
  startDate?: string;
  endDate?: string;
  duration?: string;
  clientInfo?: ClientInfo;
  metrics?: ProjectMetrics;
  challenges?: string[];
  solutions?: string[];
  teamSize?: number;
  role?: string;
  createdAt: number;
  updatedAt: number;
  version?: number;
}

export interface Project extends ProjectInput {
  id: string;
}

export const PROJECTS_COLLECTION = "projects";

// Default project template
export const DEFAULT_PROJECT: Omit<ProjectInput, 'title' | 'description' | 'category'> = {
  longDescription: "",
  status: "completed",
  achievements: [],
  technologies: [],
  tags: [],
  image: "",
  logo: "",
  icon: "",
  liveUrl: "",
  githubUrl: "",
  demoUrl: "",
  caseStudyUrl: "",
  featured: false,
  disabled: false,
  priority: 50,
  startDate: "",
  endDate: "",
  duration: "",
  clientInfo: {
    name: "",
    industry: "",
    size: "medium",
    location: "",
    website: "",
    isPublic: true
  },
  metrics: {
    usersReached: 0,
    performanceImprovement: "",
    revenueImpact: "",
    uptime: "",
    customMetrics: {}
  },
  challenges: [],
  solutions: [],
  teamSize: 1,
  role: "Full-Stack Developer",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  version: 1
};

/**
 * @param adminMode — When true, includes disabled projects so the admin list
 * can show hidden entries and re-enable them. Public views (default) only
 * ever see non-disabled projects.
 */
export function useProjects(adminMode = false) {
  // Local fallback resolved during lazy state init — no synchronous setState
  // in the effect (react-hooks/set-state-in-effect) and no empty-state flash.
  const [projects, setProjects] = useState<Project[]>(() => {
    if (isFirebaseEnabled && db) return [];
    const local = initialProjects.map((project, index) => ({ id: `local-${index}`, ...project }));
    return adminMode ? local : local.filter(p => !p.disabled);
  });
  const [loading, setLoading] = useState(isFirebaseEnabled && !!db);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Local data already seeded via lazy init when Firebase is disabled
    if (!isFirebaseEnabled || !db) {
      console.log('Using local project data - Firebase disabled in development');
      return;
    }

    // Use Firebase in production. Admin mode must see disabled projects too —
    // otherwise hiding a project removes it from the admin list permanently.
    const q = adminMode
      ? query(
          collection(db, PROJECTS_COLLECTION),
          orderBy("priority", "desc"),
          orderBy("createdAt", "desc")
        )
      : query(
          collection(db, PROJECTS_COLLECTION),
          where("disabled", "==", false),
          orderBy("priority", "desc"),
          orderBy("createdAt", "desc")
        );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const projectsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Project[];
        
        setProjects(projectsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error fetching projects from Firebase:", err);
        console.log('Falling back to local project data');
        // Fallback to local data on Firebase error
        const localProjects: Project[] = initialProjects.map((project, index) => ({
          id: `fallback-${index}`,
          ...project
        }));
        setProjects(adminMode ? localProjects : localProjects.filter(p => !p.disabled));
        setLoading(false);
        setError(null);
      }
    );

    return () => unsubscribe();
  }, [adminMode]);

  const featured = useMemo(() => 
    projects.filter(project => project.featured && !project.disabled)
  , [projects]);

  const others = useMemo(() => 
    projects.filter(project => !project.featured && !project.disabled)
  , [projects]);

  return {
    projects,
    featured,
    others,
    loading,
    error
  };
}