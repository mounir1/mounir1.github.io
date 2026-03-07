/**
 * Admin Skills Types
 */

import { BaseProps, Skill } from '@/types';

export interface SkillsTabProps extends BaseProps {
  skills?: Skill[];
  loading?: boolean;
  error?: string;
  onSkillCreate?: (skill: Partial<Skill>) => Promise<void>;
  onSkillUpdate?: (id: string, skill: Partial<Skill>) => Promise<void>;
  onSkillDelete?: (id: string) => Promise<void>;
}

export interface SkillFormProps extends BaseProps {
  skill?: Skill;
  onSubmit: (data: SkillInput) => Promise<void>;
  onCancel: () => void;
  mode: 'create' | 'edit';
  loading?: boolean;
}

export interface SkillCardProps extends BaseProps {
  skill: Skill;
  onEdit?: (skill: Skill) => void;
  onDelete?: (skill: Skill) => void;
  onToggleFeatured?: (skill: Skill) => void;
  showActions?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export interface SkillBulkActionsProps extends BaseProps {
  selectedSkills: Skill[];
  onBulkDelete?: (skills: Skill[]) => Promise<void>;
  onBulkToggleFeatured?: (skills: Skill[]) => Promise<void>;
  onBulkUpdateLevel?: (skills: Skill[], level: string) => Promise<void>;
  onBulkExport?: (skills: Skill[]) => void;
}

export interface SkillInput {
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  proficiency: number;
  experience: SkillExperience;
  featured: boolean;
  description?: string;
  icon?: string;
  color?: string;
  tags: string[];
  visibility: 'public' | 'private';
}

export interface SkillExperience {
  years: number;
  months: number;
  firstUsed?: Date;
  lastUsed?: Date;
}

export interface SkillFilters {
  category?: string[];
  level?: string[];
  featured?: boolean;
  visibility?: string[];
  tags?: string[];
  proficiencyRange?: [number, number];
}

export interface SkillSorting {
  field:
    | 'name'
    | 'category'
    | 'level'
    | 'proficiency'
    | 'createdAt'
    | 'updatedAt';
  direction: 'asc' | 'desc';
}
