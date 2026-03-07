import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Code2,
  Database,
  Palette,
  Globe,
  Zap,
  Star,
  Trophy,
  TrendingUp,
  Calendar,
  Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { themes } from '@/constants/themes';
import { useCustomTheme } from '@/contexts/CustomThemeProvider';

// Skill interface
export interface CompactSkill {
  id: string;
  name: string;
  category:
    | 'frontend'
    | 'backend'
    | 'design'
    | 'tools'
    | 'languages'
    | 'frameworks';
  level: number; // 0-100
  experience: string;
  description: string;
  projects?: number;
  certifications?: string[];
  trending?: boolean;
  color?: string;
  yearsOfExperience?: number;
  lastUsed?: string;
  proficiency?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

// Category configuration
const CATEGORIES = {
  frontend: {
    label: 'Frontend',
    icon: <Globe className="h-4 w-4" />,
  },
  backend: {
    label: 'Backend',
    icon: <Database className="h-4 w-4" />,
  },
  design: {
    label: 'Design',
    icon: <Palette className="h-4 w-4" />,
  },
  tools: {
    label: 'Tools',
    icon: <Code2 className="h-4 w-4" />,
  },
  languages: {
    label: 'Languages',
    icon: <Zap className="h-4 w-4" />,
  },
  frameworks: {
    label: 'Frameworks',
    icon: <Star className="h-4 w-4" />,
  },
};

// Default skills data
const DEFAULT_SKILLS: CompactSkill[] = [
  // Frontend
  {
    id: 'react',
    name: 'React',
    category: 'frontend',
    level: 95,
    experience: '5+ years',
    description:
      'Advanced React development with hooks, context, and modern patterns',
    projects: 25,
    certifications: ['React Professional'],
    trending: true,
    yearsOfExperience: 5,
    lastUsed: 'Currently using',
    proficiency: 'Expert',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    category: 'frontend',
    level: 90,
    experience: '4+ years',
    description:
      'Type-safe JavaScript development with advanced TypeScript features',
    projects: 20,
    yearsOfExperience: 4,
    lastUsed: 'Currently using',
    proficiency: 'Expert',
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    category: 'frameworks',
    level: 88,
    experience: '3+ years',
    description: 'Full-stack React framework with SSR, SSG, and API routes',
    projects: 15,
    trending: true,
    yearsOfExperience: 3,
    lastUsed: 'Currently using',
    proficiency: 'Advanced',
  },
  {
    id: 'tailwind',
    name: 'Tailwind CSS',
    category: 'design',
    level: 92,
    experience: '3+ years',
    description: 'Utility-first CSS framework for rapid UI development',
    projects: 18,
    yearsOfExperience: 3,
    lastUsed: 'Currently using',
    proficiency: 'Expert',
  },

  // Backend
  {
    id: 'nodejs',
    name: 'Node.js',
    category: 'backend',
    level: 85,
    experience: '4+ years',
    description: 'Server-side JavaScript runtime for scalable applications',
    projects: 22,
    yearsOfExperience: 4,
    lastUsed: 'Currently using',
    proficiency: 'Advanced',
  },
  {
    id: 'python',
    name: 'Python',
    category: 'languages',
    level: 80,
    experience: '3+ years',
    description:
      'Versatile programming language for web development and data processing',
    projects: 12,
    yearsOfExperience: 3,
    lastUsed: 'Last month',
    proficiency: 'Advanced',
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    category: 'backend',
    level: 82,
    experience: '3+ years',
    description:
      'Advanced relational database with complex queries and optimization',
    projects: 16,
    yearsOfExperience: 3,
    lastUsed: 'Currently using',
    proficiency: 'Advanced',
  },

  // Tools
  {
    id: 'docker',
    name: 'Docker',
    category: 'tools',
    level: 78,
    experience: '2+ years',
    description:
      'Containerization platform for consistent development and deployment',
    projects: 14,
    yearsOfExperience: 2,
    lastUsed: 'Currently using',
    proficiency: 'Intermediate',
  },
  {
    id: 'aws',
    name: 'AWS',
    category: 'tools',
    level: 75,
    experience: '2+ years',
    description: 'Cloud computing services for scalable infrastructure',
    projects: 10,
    certifications: ['AWS Solutions Architect'],
    yearsOfExperience: 2,
    lastUsed: 'Currently using',
    proficiency: 'Intermediate',
  },
];

// Compact skill card component
const CompactSkillCard: React.FC<{
  skill: CompactSkill;
  category: any;
  color: string;
}> = ({ skill, category, color }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card
      className="cursor-pointer border-l-4 transition-all duration-200 hover:shadow-md"
      style={{ borderLeftColor: color }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {React.cloneElement(category.icon, { style: { color } })}
              <h3 className="text-sm font-semibold">{skill.name}</h3>
              {skill.trending && (
                <Badge variant="secondary" className="px-1.5 py-0.5 text-xs">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  Hot
                </Badge>
              )}
            </div>
            <div className="text-right">
              <div className="text-xs font-medium">{skill.level}%</div>
              <div className="text-xs text-muted-foreground">
                {skill.proficiency}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <Progress value={skill.level} className="h-2" />

          {/* Basic Info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{skill.experience}</span>
              </div>
              {skill.projects && (
                <div className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  <span>{skill.projects} projects</span>
                </div>
              )}
            </div>
            <div className="text-xs">{skill.lastUsed}</div>
          </div>

          {/* Expanded Details */}
          {isExpanded && (
            <div className="space-y-2 border-t border-border/50 pt-2">
              <p className="text-sm text-muted-foreground">
                {skill.description}
              </p>

              {skill.certifications && skill.certifications.length > 0 && (
                <div className="flex items-center gap-2">
                  <Trophy className="h-3 w-3 text-yellow-500" />
                  <div className="flex flex-wrap gap-1">
                    {skill.certifications.map((cert, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="px-1.5 py-0.5 text-xs"
                      >
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Main component props
export interface CompactSkillsSectionProps {
  skills?: CompactSkill[];
  className?: string;
  showHeader?: boolean;
  defaultTab?: string;
}

// Main compact skills section component
export const CompactSkillsSection: React.FC<CompactSkillsSectionProps> = ({
  skills = DEFAULT_SKILLS,
  className,
  showHeader = true,
  defaultTab = 'frontend',
}) => {
  const { theme } = useCustomTheme();
  const currentTheme = themes[theme];
  // Group skills by category
  const skillsByCategory = useMemo(() => {
    const grouped = skills.reduce(
      (acc, skill) => {
        if (!acc[skill.category]) {
          acc[skill.category] = [];
        }
        acc[skill.category].push(skill);
        return acc;
      },
      {} as Record<string, CompactSkill[]>
    );

    // Sort skills within each category by level (descending)
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => b.level - a.level);
    });

    return grouped;
  }, [skills]);

  // Get available categories
  const availableCategories = Object.keys(skillsByCategory).filter(
    category => skillsByCategory[category].length > 0
  );

  // Calculate category stats
  const categoryStats = useMemo(() => {
    return availableCategories.reduce(
      (acc, category) => {
        const categorySkills = skillsByCategory[category];
        const avgLevel =
          categorySkills.reduce((sum, skill) => sum + skill.level, 0) /
          categorySkills.length;
        const totalProjects = categorySkills.reduce(
          (sum, skill) => sum + (skill.projects || 0),
          0
        );

        acc[category] = {
          count: categorySkills.length,
          avgLevel: Math.round(avgLevel),
          totalProjects,
          expertSkills: categorySkills.filter(s => s.level >= 90).length,
        };
        return acc;
      },
      {} as Record<string, any>
    );
  }, [skillsByCategory, availableCategories]);

  return (
    <section className={cn('px-4 py-16', className)}>
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        {showHeader && (
          <div className="mb-12 text-center">
            <div className="mb-4 flex items-center justify-center gap-4">
              <h2 className="text-3xl font-bold">Technical Skills</h2>
            </div>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              A comprehensive overview of my technical expertise across
              different domains
            </p>
          </div>
        )}

        {/* Skills Tabs */}
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="relative w-full overflow-x-auto whitespace-nowrap">
            {availableCategories.map(category => {
              const config = CATEGORIES[category as keyof typeof CATEGORIES];
              const stats = categoryStats[category];

              return (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="flex flex-col items-center gap-1 p-3"
                >
                  <div className="flex items-center gap-1">
                    {config.icon}
                    <span className="hidden sm:inline">{config.label}</span>
                  </div>
                  <Badge variant="secondary" className="px-1.5 py-0.5 text-xs">
                    {stats.count}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Tab Content */}
          {availableCategories.map(category => {
            const config = CATEGORIES[category as keyof typeof CATEGORIES];
            const categorySkills = skillsByCategory[category];
            const stats = categoryStats[category];
            const color =
              currentTheme.categories[
                category as keyof typeof currentTheme.categories
              ];

            return (
              <TabsContent
                key={category}
                value={category}
                className="space-y-6"
              >
                {/* Category Header */}
                <Card style={{ borderLeftColor: color }} className="border-l-4">
                  <CardHeader className="pb-4">
                    <CardTitle
                      className="flex items-center gap-2"
                      style={{ color }}
                    >
                      {config.icon}
                      {config.label} Skills
                    </CardTitle>
                    <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {stats.count}
                        </div>
                        <div className="text-muted-foreground">Skills</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {stats.avgLevel}%
                        </div>
                        <div className="text-muted-foreground">Avg Level</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {stats.totalProjects}
                        </div>
                        <div className="text-muted-foreground">Projects</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {stats.expertSkills}
                        </div>
                        <div className="text-muted-foreground">
                          Expert Level
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Skills Grid */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categorySkills.map(skill => (
                    <CompactSkillCard
                      key={skill.id}
                      skill={skill}
                      category={config}
                      color={color}
                    />
                  ))}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </section>
  );
};

export default CompactSkillsSection;
