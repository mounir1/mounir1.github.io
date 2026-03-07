import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  Filter,
  Grid3X3,
  Grid,
  List,
  ExternalLink,
  Github,
  Calendar,
  Star,
  Heart,
  Eye,
  Zap,
  Award,
  Users,
  Clock,
  Code2,
  Smartphone,
  Monitor,
  Bot,
  Coins,
  Gamepad2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useAccessibility';
import { trackProjectInteraction } from '@/utils/analytics';

// Project interface extending the existing one
export interface GalleryProject {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  image: string;
  category: 'web' | 'mobile' | 'desktop' | 'ai' | 'blockchain' | 'game';
  technologies: string[];
  demoUrl?: string;
  githubUrl?: string;
  status: 'completed' | 'in-progress' | 'archived';
  featured?: boolean;
  year: number;
  teamSize?: number;
  duration?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  metrics?: {
    stars?: number;
    views?: number;
    likes?: number;
    downloads?: number;
  };
  awards?: string[];
  tags?: string[];
  colors?: {
    primary: string;
    secondary: string;
  };
}

// Filter configuration
const CATEGORY_FILTERS = {
  web: {
    label: 'Web Apps',
    color: 'bg-blue-500',
    icon: <Monitor className="h-4 w-4" />,
    count: 0,
  },
  mobile: {
    label: 'Mobile',
    color: 'bg-green-500',
    icon: <Smartphone className="h-4 w-4" />,
    count: 0,
  },
  desktop: {
    label: 'Desktop',
    color: 'bg-purple-500',
    icon: <Grid3X3 className="h-4 w-4" />,
    count: 0,
  },
  ai: {
    label: 'AI/ML',
    color: 'bg-orange-500',
    icon: <Bot className="h-4 w-4" />,
    count: 0,
  },
  blockchain: {
    label: 'Blockchain',
    color: 'bg-indigo-500',
    icon: <Coins className="h-4 w-4" />,
    count: 0,
  },
  game: {
    label: 'Games',
    color: 'bg-red-500',
    icon: <Gamepad2 className="h-4 w-4" />,
    count: 0,
  },
};

const STATUS_FILTERS = {
  completed: { label: 'Completed', color: 'bg-green-500', count: 0 },
  'in-progress': { label: 'In Progress', color: 'bg-yellow-500', count: 0 },
  archived: { label: 'Archived', color: 'bg-gray-500', count: 0 },
};

const DIFFICULTY_FILTERS = {
  beginner: { label: 'Beginner', color: 'bg-emerald-500', count: 0 },
  intermediate: { label: 'Intermediate', color: 'bg-amber-500', count: 0 },
  advanced: { label: 'Advanced', color: 'bg-rose-500', count: 0 },
};

// Layout options
export type LayoutType = 'isotope' | 'grid' | 'masonry' | 'list';

// Component props
export interface FilterableProjectGalleryProps {
  projects: GalleryProject[];
  className?: string;
  defaultLayout?: LayoutType;
  enableSearch?: boolean;
  enableFilters?: boolean;
  enableSorting?: boolean;
  animationDuration?: number;
  onProjectClick?: (project: GalleryProject) => void;
  onProjectHover?: (project: GalleryProject | null) => void;
}

// Individual project card component
interface ProjectCardProps {
  project: GalleryProject;
  layout: LayoutType;
  style?: React.CSSProperties;
  onProjectClick?: (project: GalleryProject) => void;
  onProjectHover?: (project: GalleryProject | null) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  layout,
  style,
  onProjectClick,
  onProjectHover,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const category = CATEGORY_FILTERS[project.category];

  const handleMouseEnter = () => {
    setIsHovered(true);
    onProjectHover?.(project);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onProjectHover?.(null);
  };

  const handleClick = () => {
    onProjectClick?.(project);
  };

  if (layout === 'list') {
    return (
      <Card
        className={cn(
          'cursor-pointer transition-all duration-300',
          'hover:scale-[1.02] hover:shadow-lg',
          isHovered && 'shadow-xl'
        )}
        style={style}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <CardContent className="p-0">
          <div className="flex gap-6">
            {/* Image */}
            <div className="relative h-32 w-48 overflow-hidden rounded-l-lg">
              <img
                src={project.image}
                alt={project.title}
                className={cn(
                  'h-full w-full object-cover transition-transform duration-500',
                  isHovered && !prefersReducedMotion ? 'scale-110' : 'scale-100'
                )}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30" />

              {/* Status badge */}
              <div className="absolute left-2 top-2">
                <Badge variant="secondary" className="text-xs">
                  {project.status.replace('-', ' ')}
                </Badge>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-4 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="mb-2 font-heading text-xl font-bold">
                    {project.title}
                  </h3>
                  <p className="font-sans text-muted-foreground">
                    {project.description}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(category.color, 'text-white')}
                >
                  {category.icon}
                  <span className="ml-1">{category.label}</span>
                </Badge>
              </div>

              {/* Technologies */}
              <div className="flex flex-wrap gap-1">
                {project.technologies.slice(0, 6).map(tech => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
                {project.technologies.length > 6 && (
                  <Badge variant="outline" className="text-xs">
                    +{project.technologies.length - 6}
                  </Badge>
                )}
              </div>

              {/* Meta info */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {project.year}
                </div>
                {project.teamSize && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {project.teamSize}
                  </div>
                )}
                {project.metrics?.stars && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {project.metrics.stars}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Card layout (isotope, grid, masonry)
  return (
    <Card
      className={cn(
        'group cursor-pointer overflow-hidden transition-all duration-500',
        'hover:-translate-y-2 hover:shadow-xl',
        isHovered && 'shadow-2xl'
      )}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className={cn(
            'h-full w-full object-cover transition-transform duration-700',
            isHovered && !prefersReducedMotion ? 'scale-110' : 'scale-100'
          )}
        />

        {/* Overlay */}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent',
            'transition-opacity duration-300',
            isHovered ? 'opacity-90' : 'opacity-60'
          )}
        />

        {/* Badges */}
        <div className="absolute left-3 top-3 space-y-2">
          <Badge
            variant="secondary"
            className="bg-white/20 text-white backdrop-blur-sm"
          >
            {project.status.replace('-', ' ')}
          </Badge>
          {project.featured && (
            <Badge
              variant="default"
              className="bg-yellow-500/90 text-white backdrop-blur-sm"
            >
              <Star className="mr-1 h-3 w-3" />
              Featured
            </Badge>
          )}
        </div>

        {/* Action buttons */}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center gap-3',
            'transition-all duration-300',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
        >
          {project.demoUrl && (
            <Button
              size="sm"
              className="bg-white/90 text-black backdrop-blur-sm hover:bg-white"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Demo
            </Button>
          )}
          {project.githubUrl && (
            <Button
              size="sm"
              variant="outline"
              className="border-white/50 bg-white/90 text-black backdrop-blur-sm hover:bg-white"
            >
              <Github className="mr-2 h-4 w-4" />
              Code
            </Button>
          )}
        </div>
      </div>

      <CardContent className="space-y-3 p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold transition-colors group-hover:text-primary">
            {project.title}
          </h3>
          <Badge
            variant="outline"
            className={cn(category.color, 'text-xs text-white')}
          >
            {category.icon}
          </Badge>
        </div>

        {/* Description */}
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {project.description}
        </p>

        {/* Technologies */}
        <div className="flex flex-wrap gap-1">
          {project.technologies.slice(0, 3).map(tech => (
            <Badge key={tech} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
          {project.technologies.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{project.technologies.length - 3}
            </Badge>
          )}
        </div>

        {/* Metrics */}
        {project.metrics && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {project.metrics.stars && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {project.metrics.stars}
              </div>
            )}
            {project.metrics.views && (
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {project.metrics.views}
              </div>
            )}
            {project.metrics.likes && (
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {project.metrics.likes}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Main component
export const FilterableProjectGallery: React.FC<
  FilterableProjectGalleryProps
> = ({
  projects,
  className,
  defaultLayout = 'isotope',
  enableSearch = true,
  enableFilters = true,
  enableSorting = true,
  animationDuration = 600,
  onProjectClick,
  onProjectHover,
}) => {
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(
    null
  );
  const [layout, setLayout] = useState<LayoutType>(defaultLayout);
  const [sortBy, setSortBy] = useState<
    'title' | 'year' | 'popularity' | 'featured'
  >('featured');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isAnimating, setIsAnimating] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Calculate filter counts
  const updateFilterCounts = useCallback(() => {
    const categoryCount = { ...CATEGORY_FILTERS };
    const statusCount = { ...STATUS_FILTERS };
    const difficultyCount = { ...DIFFICULTY_FILTERS };

    projects.forEach(project => {
      categoryCount[project.category].count++;
      statusCount[project.status].count++;
      if (project.difficulty) {
        difficultyCount[project.difficulty].count++;
      }
    });

    return { categoryCount, statusCount, difficultyCount };
  }, [projects]);

  const { categoryCount, statusCount, difficultyCount } = updateFilterCounts();

  // Filter and sort projects
  useEffect(() => {
    let filtered = [...projects];

    // Apply filters
    if (selectedCategory) {
      filtered = filtered.filter(
        project => project.category === selectedCategory
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter(project => project.status === selectedStatus);
    }

    if (selectedDifficulty) {
      filtered = filtered.filter(
        project => project.difficulty === selectedDifficulty
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        project =>
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          project.technologies.some(tech =>
            tech.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          project.tags?.some(tag =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Sort projects
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'year':
          comparison = a.year - b.year;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'popularity':
          const aPopularity =
            (a.metrics?.stars || 0) +
            (a.metrics?.views || 0) +
            (a.metrics?.likes || 0);
          const bPopularity =
            (b.metrics?.stars || 0) +
            (b.metrics?.views || 0) +
            (b.metrics?.likes || 0);
          comparison = aPopularity - bPopularity;
          break;
        case 'featured':
          comparison = (a.featured ? 1 : 0) - (b.featured ? 1 : 0);
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Animate transition if not reduced motion
    if (!prefersReducedMotion) {
      setIsAnimating(true);
      setTimeout(() => {
        setFilteredProjects(filtered);
        setIsAnimating(false);
      }, animationDuration / 2);
    } else {
      setFilteredProjects(filtered);
    }
  }, [
    projects,
    selectedCategory,
    selectedStatus,
    selectedDifficulty,
    searchTerm,
    sortBy,
    sortOrder,
    animationDuration,
    prefersReducedMotion,
  ]);

  // Layout classes
  const getLayoutClasses = () => {
    switch (layout) {
      case 'isotope':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
      case 'grid':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
      case 'masonry':
        return 'columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6';
      case 'list':
        return 'space-y-4';
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setSelectedStatus(null);
    setSelectedDifficulty(null);
  };

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: string) => {
    trackProjectInteraction('filter_change', 'filter', {
      filter_type: filterType,
      filter_value: value,
      location: 'project_gallery',
    });
  };

  // Handle layout change
  const handleLayoutChange = (newLayout: LayoutType) => {
    setLayout(newLayout);
    trackProjectInteraction('layout_change', 'layout', {
      layout_type: newLayout,
      location: 'project_gallery',
    });
  };

  // Handle sort change
  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy as any);
    setSortOrder(newSortOrder as any);
    trackProjectInteraction('sort_change', 'sort', {
      sort_by: newSortBy,
      sort_order: newSortOrder,
      location: 'project_gallery',
    });
  };

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      trackProjectInteraction('search', 'search', {
        search_term: value,
        results_count: filteredProjects.length,
        location: 'project_gallery',
      });
    }
  };

  // Handle project click
  const handleProjectClick = (project: GalleryProject) => {
    trackProjectInteraction('project_click', 'click', {
      project_name: project.title,
      project_category: project.category,
      project_status: project.status,
      location: 'project_gallery',
    });
  };

  return (
    <div className={cn('space-y-8', className)}>
      {/* Search and Controls */}
      <div className="space-y-6">
        {/* Search */}
        {enableSearch && (
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search projects, technologies, or tags..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                if (e.target.value.trim()) {
                  trackProjectInteraction('search', 'search', {
                    search_term: e.target.value,
                    location: 'project_gallery',
                  });
                }
              }}
              className="pl-10"
            />
          </div>
        )}

        {/* Filters and Layout Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Filters */}
          {enableFilters && (
            <div className="flex flex-wrap items-center gap-4">
              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(null);
                    trackProjectInteraction('filter_clear', 'filter', {
                      filter_type: 'category',
                      location: 'project_gallery',
                    });
                  }}
                >
                  All Categories
                </Button>
                {Object.entries(categoryCount).map(([key, config]) => (
                  <Button
                    key={key}
                    variant={selectedCategory === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSelectedCategory(key);
                      trackProjectInteraction('filter_change', 'filter', {
                        filter_type: 'category',
                        filter_value: key,
                        location: 'project_gallery',
                      });
                    }}
                    className="gap-2"
                  >
                    {config.icon}
                    {config.label}
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {config.count}
                    </Badge>
                  </Button>
                ))}
              </div>

              {/* Status Filters */}
              <div className="flex gap-2">
                {Object.entries(statusCount).map(([key, config]) => (
                  <Button
                    key={key}
                    variant={selectedStatus === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() =>
                      setSelectedStatus(selectedStatus === key ? null : key)
                    }
                  >
                    {config.label}
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {config.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Layout and Sort Controls */}
          <div className="flex items-center gap-4">
            {/* Layout Toggle */}
            <div className="flex rounded-lg border bg-background">
              <Button
                variant={layout === 'isotope' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setLayout('isotope');
                  trackProjectInteraction('layout_change', 'layout', {
                    layout_type: 'isotope',
                    location: 'project_gallery',
                  });
                }}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={layout === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setLayout('grid');
                  trackProjectInteraction('layout_change', 'layout', {
                    layout_type: 'grid',
                    location: 'project_gallery',
                  });
                }}
                className="rounded-none border-x"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={layout === 'masonry' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setLayout('masonry');
                  trackProjectInteraction('layout_change', 'layout', {
                    layout_type: 'masonry',
                    location: 'project_gallery',
                  });
                }}
                className="rounded-none border-x"
              >
                <Filter className="h-4 w-4" />
              </Button>
              <Button
                variant={layout === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setLayout('list');
                  trackProjectInteraction('layout_change', 'layout', {
                    layout_type: 'list',
                    location: 'project_gallery',
                  });
                }}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Sort Control */}
            {enableSorting && (
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={e => {
                  const [by, order] = e.target.value.split('-') as [
                    typeof sortBy,
                    typeof sortOrder,
                  ];
                  setSortBy(by);
                  setSortOrder(order);
                  trackProjectInteraction('sort_change', 'sort', {
                    sort_by: by,
                    sort_order: order,
                    location: 'project_gallery',
                  });
                }}
                className="rounded-lg border px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-primary"
              >
                <option value="featured-desc">Featured First</option>
                <option value="year-desc">Newest First</option>
                <option value="year-asc">Oldest First</option>
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
                <option value="popularity-desc">Most Popular</option>
                <option value="popularity-asc">Least Popular</option>
              </select>
            )}
          </div>
        </div>

        {/* Active Filters */}
        {(selectedCategory ||
          selectedStatus ||
          selectedDifficulty ||
          searchTerm) && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Active filters:
            </span>
            {selectedCategory && (
              <Badge variant="secondary" className="gap-1">
                {
                  categoryCount[selectedCategory as keyof typeof categoryCount]
                    .label
                }
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="ml-1 rounded hover:bg-background/20"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedStatus && (
              <Badge variant="secondary" className="gap-1">
                {statusCount[selectedStatus as keyof typeof statusCount].label}
                <button
                  onClick={() => setSelectedStatus(null)}
                  className="ml-1 rounded hover:bg-background/20"
                >
                  ×
                </button>
              </Badge>
            )}
            {searchTerm && (
              <Badge variant="secondary" className="gap-1">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-1 rounded hover:bg-background/20"
                >
                  ×
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs"
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Projects Gallery */}
      <div
        ref={containerRef}
        className={cn(
          getLayoutClasses(),
          'transition-all duration-500',
          isAnimating && 'opacity-50'
        )}
      >
        {filteredProjects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            layout={layout}
            style={{
              animationDelay: !prefersReducedMotion ? `${index * 50}ms` : '0ms',
            }}
            onProjectClick={onProjectClick}
            onProjectHover={onProjectHover}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="py-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Search className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">No projects found</h3>
          <p className="mb-6 text-muted-foreground">
            Try adjusting your search terms or filters to find what you're
            looking for.
          </p>
          <Button variant="outline" onClick={clearAllFilters}>
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-center gap-4 border-t pt-6 text-sm text-muted-foreground">
        <span>
          {filteredProjects.length} project
          {filteredProjects.length !== 1 ? 's' : ''} shown
        </span>
        <span>•</span>
        <span>{projects.length} total</span>
        <span>•</span>
        <span>{Object.keys(categoryCount).length} categories</span>
        <span>•</span>
        <span>{projects.filter(p => p.featured).length} featured</span>
      </div>
    </div>
  );
};

// Export component interface for external usage
export interface FilterableProjectGalleryInterface {
  projects: GalleryProject[];
  className?: string;
  defaultLayout?: LayoutType;
  enableSearch?: boolean;
  enableFilters?: boolean;
  enableSorting?: boolean;
  animationDuration?: number;
  onProjectClick?: (project: GalleryProject) => void;
  onProjectHover?: (project: GalleryProject | null) => void;
}

export default FilterableProjectGallery;
