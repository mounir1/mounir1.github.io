import { useMemo } from 'react';
import { Project } from '@/hooks/useProjects';
import { Skill } from '@/hooks/useSkills';

interface AdminStats {
  projects: {
    total: number;
    featured: number;
    active: number;
    categories: number;
    recentlyUpdated: number;
  };
  skills: {
    total: number;
    featured: number;
    byCategory: Record<string, number>;
  };
}

export const useAdminStats = (
  projects: Project[],
  skills: Skill[]
): AdminStats => {
  return useMemo(() => {
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const projectStats = {
      total: projects.length,
      featured: projects.filter(p => p.featured).length,
      active: projects.filter(p => !p.disabled).length,
      categories: [...new Set(projects.map(p => p.category))].length,
      recentlyUpdated: projects.filter(
        p => p.updatedAt && p.updatedAt > oneWeekAgo
      ).length,
    };

    const skillsByCategory = skills.reduce(
      (acc, skill) => {
        acc[skill.category] = (acc[skill.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const skillStats = {
      total: skills.length,
      featured: skills.filter(s => s.featured).length,
      byCategory: skillsByCategory,
    };

    return {
      projects: projectStats,
      skills: skillStats,
    };
  }, [projects, skills]);
};

export type { AdminStats };
