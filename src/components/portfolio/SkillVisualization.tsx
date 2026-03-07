import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchField } from '@/components/ui/search-field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Trophy,
  Zap,
  Star,
  TrendingUp,
  Code2,
  Palette,
  Database,
  Globe,
  Filter,
  Search,
  SortAsc,
  X,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useAccessibility';
import { motion, AnimatePresence } from 'framer-motion';
import { trackButtonClick, trackSkillInteraction } from '@/utils/analytics';

// Skill data interface
export interface Skill {
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
  experience: string; // e.g., "3 years"
  description?: string;
  projects?: number;
  certifications?: string[];
  trending?: boolean;
  icon?: React.ReactNode;
  color?: string;
}

// Category data interface
interface SkillCategory {
  name: string;
  skills: Skill[];
  icon: React.ReactNode;
  color: string;
}

// Component props
export interface SkillVisualizationProps {
  skills?: Skill[];
  categories?: SkillCategory[];
  className?: string;
  showCategories?: boolean;
  showFilters?: boolean;
  showSearch?: boolean;
  defaultCategory?: string | null;
  layout?: 'grid' | 'list' | 'circles';
  sortBy?: 'level' | 'name' | 'experience'; // Fixed type definition
  sortOrder?: 'asc' | 'desc'; // Fixed type definition
  animationDuration?: number;
  enableClick?: boolean;
  enableHover?: boolean; // Added missing prop
  onSkillClick?: (skill: Skill) => void; // Added missing prop
  onSkillHover?: (skill: Skill) => void; // Added missing prop
}

// Category configuration
const CATEGORY_CONFIG = {
  frontend: {
    label: 'Frontend',
    icon: <Globe className="h-4 w-4" />,
    color: 'bg-blue-500',
    lightColor: 'bg-blue-100',
  },
  backend: {
    label: 'Backend',
    icon: <Database className="h-4 w-4" />,
    color: 'bg-green-500',
    lightColor: 'bg-green-100',
  },
  design: {
    label: 'Design',
    icon: <Palette className="h-4 w-4" />,
    color: 'bg-purple-500',
    lightColor: 'bg-purple-100',
  },
  tools: {
    label: 'Tools',
    icon: <Code2 className="h-4 w-4" />,
    color: 'bg-orange-500',
    lightColor: 'bg-orange-100',
  },
  languages: {
    label: 'Languages',
    icon: <Zap className="h-4 w-4" />,
    color: 'bg-red-500',
    lightColor: 'bg-red-100',
  },
  frameworks: {
    label: 'Frameworks',
    icon: <Star className="h-4 w-4" />,
    color: 'bg-indigo-500',
    lightColor: 'bg-indigo-100',
  },
};

// Skill-specific colors for more variety
const SKILL_COLORS: Record<string, string> = {
  // Frontend
  react: '#61DAFB',
  typescript: '#3178C6',
  nextjs: '#000000',
  tailwind: '#06B6D4',
  vue: '#4FC08D',
  angular: '#DD0031',

  // Backend & ETL
  nodejs: '#339933',
  python: '#3776AB',
  postgresql: '#336791',
  mongodb: '#47A248',
  kafka: '#231F20',
  airflow: '#00C7D4',

  // DevOps & Cloud
  docker: '#2496ED',
  aws: '#FF9900',
  firebase: '#FFCA28',
  kubernetes: '#326CE5',
  terraform: '#623CE4',
  jenkins: '#D24939',
};

// Progress ring component
interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showText?: boolean;
  animated?: boolean;
  duration?: number;
  className?: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#3b82f6',
  backgroundColor = '#e5e7eb',
  showText = true,
  animated = true,
  duration = 2000,
  className,
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference.toFixed(3);
  const strokeDashoffset = (
    circumference -
    (animatedProgress / 100) * circumference
  ).toFixed(3);

  useEffect(() => {
    if (prefersReducedMotion) {
      setAnimatedProgress(progress);
      return;
    }

    if (!animated) {
      setAnimatedProgress(progress);
      return;
    }

    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);

    return () => clearTimeout(timer);
  }, [progress, animated, prefersReducedMotion]);

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center',
        className
      )}
    >
      <svg width={size} height={size} className="-rotate-90 transform">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: prefersReducedMotion
              ? 'none'
              : `stroke-dashoffset ${duration}ms ease-in-out`,
          }}
        />
      </svg>

      {showText && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-foreground">
            {Math.round(animatedProgress)}%
          </span>
        </div>
      )}
    </div>
  );
};

// Individual skill card component
const SkillCard: React.FC<{
  skill: Skill;
  category: typeof CATEGORY_CONFIG.frontend;
  layout: 'grid' | 'list' | 'circles';
  animationDuration: number;
  enableClick: boolean;
  enableHover?: boolean; // Added missing prop
  onSkillClick?: (skill: Skill) => void; // Added missing prop
  onSkillHover?: (skill: Skill) => void; // Added missing prop
}> = ({
  skill,
  category,
  layout,
  animationDuration,
  enableClick,
  enableHover,
  onSkillClick,
  onSkillHover,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const reducedMotion = useReducedMotion();

  const handleMouseEnter = () => {
    if (enableHover) {
      // Only set hover state if enableHover is true
      setIsHovered(true);
      if (onSkillHover) {
        onSkillHover(skill);
      }
    }
  };

  const handleMouseLeave = () => {
    if (enableHover) {
      // Only set hover state if enableHover is true
      setIsHovered(false);
    }
  };

  const handleClick = () => {
    if (enableClick) {
      // Handle click event if needed
      trackButtonClick('skill_card_click', { skill: skill.name });
      if (onSkillClick) {
        onSkillClick(skill);
      }
    }
  };

  return (
    <div>
      <Card
        className={cn(
          'border-border/50 transition-all duration-200 hover:shadow-md',
          enableClick && 'cursor-pointer',
          isHovered && enableHover && 'border-primary/20 shadow-lg',
          layout === 'list' && 'flex items-center'
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <CardContent
          className={cn(
            'p-4',
            layout === 'list' && 'flex w-full items-center space-x-4'
          )}
        >
          <div
            className={cn(
              layout === 'grid' && 'flex flex-col items-center space-y-4',
              layout === 'list' && 'flex flex-1 items-center space-x-4'
            )}
          >
            {/* Progress Ring */}
            <ProgressRing
              progress={skill.level}
              color={
                skill.color ||
                SKILL_COLORS[skill.id] ||
                category.color.replace('bg-', '#')
              }
              animated={true}
              duration={animationDuration}
              size={layout === 'list' ? 60 : 80}
            />

            {/* Skill Info */}
            <div
              className={cn(
                layout === 'grid' && 'text-center',
                layout === 'list' && 'flex-1'
              )}
            >
              <div className="mb-1 flex items-center justify-center gap-2 md:justify-start">
                {category.icon}
                <h3 className="font-semibold">{skill.name}</h3>
                {skill.trending && (
                  <Badge variant="secondary" className="px-1.5 py-0.5">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    <span className="text-xs">Trending</span>
                  </Badge>
                )}
              </div>

              <p className="mb-2 line-clamp-2 text-center text-sm text-muted-foreground md:text-left">
                {skill.description}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground md:justify-start">
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  <span>{skill.experience}</span>
                </div>

                {skill.projects && (
                  <Badge variant="outline" className="px-1.5 py-0.5 text-xs">
                    {skill.projects} projects
                  </Badge>
                )}
              </div>

              {skill.certifications && skill.certifications.length > 0 && (
                <div className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground md:justify-start">
                  <Trophy className="h-3 w-3" />
                  <span>
                    {skill.certifications.length} cert
                    {skill.certifications.length > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main skill visualization component
export const SkillVisualization: React.FC<SkillVisualizationProps> = ({
  skills: externalSkills,
  categories: externalCategories,
  className,
  showCategories = true,
  showFilters = true,
  showSearch = true,
  defaultCategory = 'frontend', // Changed default to show frontend first instead of all
  layout = 'grid',
  sortBy: initialSortBy = 'level',
  sortOrder: initialSortOrder = 'desc',
  animationDuration = 500,
  enableClick = false,
  enableHover = true,
  onSkillClick,
  onSkillHover,
}) => {
  // Handle either skills array or categories array
  const allSkills = externalCategories
    ? externalCategories.flatMap(cat => cat.skills)
    : externalSkills || [];
  const [filteredSkills, setFilteredSkills] = useState(allSkills);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    defaultCategory
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSort, setCurrentSort] = useState({
    by: initialSortBy,
    order: initialSortOrder,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter and sort skills
  useEffect(() => {
    let filtered = [...allSkills];

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(skill => skill.category === selectedCategory);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        skill =>
          skill.name.toLowerCase().includes(searchLower) ||
          skill.description?.toLowerCase().includes(searchLower) ||
          skill.category.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (currentSort.by) {
        case 'level':
          aValue = a.level;
          bValue = b.level;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'experience':
          aValue = a.experience;
          bValue = b.experience;
          break;
        default:
          aValue = a.level;
          bValue = b.level;
      }

      if (currentSort.order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredSkills(filtered);
  }, [allSkills, selectedCategory, searchTerm, currentSort]);

  // Get available categories
  const availableCategories = useMemo(() => {
    const categories = [...new Set(allSkills.map(skill => skill.category))];
    return categories.map(cat => ({
      value: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
      count: allSkills.filter(skill => skill.category === cat).length,
    }));
  }, [allSkills]);

  // Layout classes
  const layoutClasses = {
    grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
    list: 'space-y-3',
    circles:
      'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6',
  };

  // Handle category change
  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    trackSkillInteraction('category_filter', 'filter', {
      category: category || 'all',
      skills_count: filteredSkills.length,
    });
  };

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      trackSkillInteraction('search', 'search', {
        search_term: value,
        results_count: filteredSkills.length,
      });
    }
  };

  // Handle sort change
  const handleSortChange = (sortBy: string, sortOrder: string) => {
    setCurrentSort({ by: sortBy as any, order: sortOrder as any });
    trackSkillInteraction('sort', 'sort', {
      sort_by: sortBy,
      sort_order: sortOrder,
    });
  };

  return (
    <div className={cn('space-y-6', className)} ref={containerRef}>
      {/* Filters and Controls */}
      {(showFilters || showSearch) && (
        <div className="space-y-4">
          {/* Mobile Filter Toggle */}
          <div className="md:hidden">
            <Button
              variant="outline"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="w-full"
            >
              <Filter className="mr-2 h-4 w-4" />
              {showMobileFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>

          {/* Desktop Filters */}
          <div
            className={cn(
              'space-y-4',
              showMobileFilters ? 'block' : 'hidden md:block'
            )}
          >
            {/* Search */}
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <Input
                  placeholder="Search skills..."
                  value={searchTerm}
                  onChange={e => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {/* Category and Sort Controls */}
            <div className="flex flex-col gap-4 sm:flex-row">
              {/* Category Filter */}
              {showCategories && availableCategories.length > 0 && (
                <div className="flex-1">
                  <Select
                    value={selectedCategory || ''}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">
                        All Categories ({allSkills.length})
                      </SelectItem>
                      {availableCategories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label} ({category.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Sort Control */}
              <div className="flex gap-2">
                <Select
                  value={currentSort.by}
                  onValueChange={value =>
                    handleSortChange(value, currentSort.order)
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="level">Level</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="experience">Experience</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    handleSortChange(
                      currentSort.by,
                      currentSort.order === 'asc' ? 'desc' : 'asc'
                    )
                  }
                >
                  {currentSort.order === 'asc' ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {filteredSkills.length} of {allSkills.length} skills
                {selectedCategory && ` in ${selectedCategory}`}
                {searchTerm && ` matching "${searchTerm}"`}
              </span>
              {filteredSkills.length > 0 && (
                <span>
                  Sorted by {currentSort.by} ({currentSort.order})
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Skills Grid */}
      <div
        className={cn(
          layoutClasses[layout],
          'transition-all duration-300 ease-out'
        )}
      >
        {filteredSkills.length > 0 ? (
          filteredSkills.map((skill, index) => {
            // Get category configuration
            const categoryKey = skill.category as keyof typeof CATEGORY_CONFIG;
            const category = CATEGORY_CONFIG[categoryKey] || {
              label: skill.category,
              icon: <Code2 className="h-4 w-4" />,
              color: 'bg-gray-500',
              lightColor: 'bg-gray-100',
            };

            return (
              <div
                key={`${skill.id}-${index}`}
                className="transition-all duration-200 ease-out"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <SkillCard
                  skill={skill}
                  category={category}
                  layout={layout}
                  enableHover={enableHover}
                  enableClick={enableClick}
                  onSkillClick={onSkillClick}
                  onSkillHover={onSkillHover}
                  animationDuration={animationDuration}
                />
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center">
            <div className="space-y-4">
              <Search className="mx-auto h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  No skills found
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? `No skills match "${searchTerm}". Try adjusting your search.`
                    : 'No skills available in this category.'}
                </p>
              </div>
              {(searchTerm || selectedCategory) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory(null);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillVisualization;
