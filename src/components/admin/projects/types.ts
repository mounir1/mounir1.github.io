/**
 * Admin Projects Types
 */

import { BaseProps, Project } from '@/types';

export interface ProjectsTabProps extends BaseProps {
  projects?: Project[];
  loading?: boolean;
  error?: string;
  onProjectCreate?: (project: Partial<Project>) => Promise<void>;
  onProjectUpdate?: (id: string, project: Partial<Project>) => Promise<void>;
  onProjectDelete?: (id: string) => Promise<void>;
}

export interface ProjectFormProps extends BaseProps {
  project?: Project;
  onSubmit: (data: ProjectInput) => Promise<void>;
  onCancel: () => void;
  mode: 'create' | 'edit';
  loading?: boolean;
}

export interface ProjectCardProps extends BaseProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onToggleFeatured?: (project: Project) => void;
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export interface ProjectBulkActionsProps extends BaseProps {
  selectedProjects: Project[];
  onBulkDelete?: (projects: Project[]) => Promise<void>;
  onBulkToggleFeatured?: (projects: Project[]) => Promise<void>;
  onBulkUpdateStatus?: (projects: Project[], status: string) => Promise<void>;
  onBulkExport?: (projects: Project[]) => void;
}

export interface ProjectInput {
  title: string;
  description: string;
  longDescription?: string;
  technologies: string[];
  category: string;
  status: string;
  priority: number;
  featured: boolean;
  images: ProjectImage[];
  links: ProjectLink[];
  tags: string[];
  visibility: 'public' | 'private' | 'draft';
  seo?: ProjectSEO;
}

export interface ProjectImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  primary?: boolean;
}

export interface ProjectLink {
  id: string;
  type: 'demo' | 'source' | 'documentation' | 'other';
  url: string;
  label: string;
}

export interface ProjectSEO {
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];
}

export interface ProjectFilters {
  status?: string[];
  category?: string[];
  featured?: boolean;
  visibility?: string[];
  technologies?: string[];
  tags?: string[];
}

export interface ProjectSorting {
  field: 'title' | 'createdAt' | 'updatedAt' | 'priority' | 'status';
  direction: 'asc' | 'desc';
}
