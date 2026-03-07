import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ExternalLink,
  Github,
  Play,
  Star,
  Calendar,
  Users,
  Code2,
  Eye,
  Heart,
  Filter,
  Grid3X3,
  List,
  Search,
  TrendingUp,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useAccessibility';

// Project data interface
export interface Project {
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
  highlights?: string[];
  metrics?: {
    stars?: number;
    views?: number;
    likes?: number;
    downloads?: number;
  };
  awards?: string[];
  client?: string;
}

// Component props
export interface ProjectShowcaseProps {
  projects: Project[];
  className?: string;
  layout?: 'grid' | 'masonry' | 'list';
  showFilters?: boolean;
  showSearch?: boolean;
  enableHover3D?: boolean;
  cardAspectRatio?: 'square' | 'landscape' | 'portrait';
  columns?: number;
  onProjectClick?: (project: Project) => void;
  onProjectHover?: (project: Project | null) => void;
  sortBy?: 'year' | 'title' | 'popularity' | 'featured';
  sortOrder?: 'asc' | 'desc';
}

// Category configuration
const CATEGORY_CONFIG = {
  web: {
    label: 'Web Apps',
    color: 'bg-blue-500',
    lightColor: 'bg-blue-100',
    icon: <Code2 className="h-4 w-4" />,
  },
  mobile: {
    label: 'Mobile',
    color: 'bg-green-500',
    lightColor: 'bg-green-100',
    icon: <Code2 className="h-4 w-4" />,
  },
  desktop: {
    label: 'Desktop',
    color: 'bg-purple-500',
    lightColor: 'bg-purple-100',
    icon: <Code2 className="h-4 w-4" />,
  },
  ai: {
    label: 'AI/ML',
    color: 'bg-orange-500',
    lightColor: 'bg-orange-100',
    icon: <Code2 className="h-4 w-4" />,
  },
  blockchain: {
    label: 'Blockchain',
    color: 'bg-indigo-500',
    lightColor: 'bg-indigo-100',
    icon: <Code2 className="h-4 w-4" />,
  },
  game: {
    label: 'Games',
    color: 'bg-red-500',
    lightColor: 'bg-red-100',
    icon: <Code2 className="h-4 w-4" />,
  },
};

// 3D Card component with hover effects
interface ProjectCard3DProps {
  project: Project;
  aspectRatio: 'square' | 'landscape' | 'portrait';
  enableHover3D: boolean;
  onProjectClick?: (project: Project) => void;
  onProjectHover?: (project: Project | null) => void;
}

const ProjectCard3D: React.FC<ProjectCard3DProps> = ({
  project,
  aspectRatio,
  enableHover3D,
  onProjectClick,
  onProjectHover,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!enableHover3D || prefersReducedMotion || !cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      setMousePosition({
        x: (x - centerX) / centerX,
        y: (y - centerY) / centerY,
      });
    },
    [enableHover3D, prefersReducedMotion]
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
    onProjectHover?.(project);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
    onProjectHover?.(null);
  };

  const handleClick = () => {
    onProjectClick?.(project);
  };

  const category = CATEGORY_CONFIG[project.category];

  // Calculate 3D transform
  const transform3D =
    enableHover3D && !prefersReducedMotion && isHovered
      ? `perspective(1000px) rotateY(${mousePosition.x * 10}deg) rotateX(${-mousePosition.y * 10}deg) translateZ(20px)`
      : 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px)';

  const aspectRatioClasses = {
    square: 'aspect-square',
    landscape: 'aspect-video',
    portrait: 'aspect-[3/4]',
  };

  return (
    <div
      ref={cardRef}
      className="perspective-1000 group cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <Card
        className={cn(
          'relative transform-gpu overflow-hidden border-0 shadow-lg transition-all duration-500 ease-out',
          'hover:shadow-2xl',
          isHovered && enableHover3D && 'shadow-3xl'
        )}
        style={{
          transform: transform3D,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Background Image */}
        <div
          className={cn(
            'relative overflow-hidden',
            aspectRatioClasses[aspectRatio]
          )}
        >
          <img
            src={project.image}
            alt={project.title}
            className={cn(
              'h-full w-full object-cover transition-all duration-700',
              isHovered ? 'scale-110' : 'scale-100'
            )}
          />

          {/* Overlay Gradient */}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent',
              'transition-opacity duration-300',
              isHovered ? 'opacity-90' : 'opacity-60'
            )}
          />

          {/* Status Badge */}
          <div className="absolute left-4 top-4">
            <Badge
              variant={project.status === 'completed' ? 'default' : 'secondary'}
              className="border-white/30 bg-white/20 text-white backdrop-blur-sm"
            >
              {project.status === 'completed' && '✓ '}
              {project.status === 'in-progress' && '🔄 '}
              {project.status === 'archived' && '📦 '}
              {project.status.replace('-', ' ')}
            </Badge>
          </div>

          {/* Featured Badge */}
          {project.featured && (
            <div className="absolute right-4 top-4">
              <Badge
                variant="default"
                className="bg-yellow-500/90 text-white backdrop-blur-sm"
              >
                <Star className="mr-1 h-3 w-3" />
                Featured
              </Badge>
            </div>
          )}

          {/* Awards */}
          {project.awards && project.awards.length > 0 && (
            <div className="absolute right-4 top-16">
              <Badge
                variant="default"
                className="bg-purple-500/90 text-white backdrop-blur-sm"
              >
                <Award className="mr-1 h-3 w-3" />
                {project.awards.length} Award
                {project.awards.length > 1 ? 's' : ''}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="space-y-4 p-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-heading text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                {project.title}
              </h3>
              <Badge
                variant="outline"
                className={cn(category.lightColor, 'text-xs')}
              >
                {category.icon}
                <span className="ml-1">{category.label}</span>
              </Badge>
            </div>

            <p className="line-clamp-2 text-sm text-muted-foreground">
              {project.description}
            </p>
          </div>

          {/* Meta Information */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {project.year}
            </div>
            {project.teamSize && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {project.teamSize} member{project.teamSize > 1 ? 's' : ''}
              </div>
            )}
            {project.duration && (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {project.duration}
              </div>
            )}
          </div>

          {/* Technologies */}
          <div className="flex flex-wrap gap-1">
            {project.technologies.slice(0, 4).map(tech => (
              <Badge key={tech} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
            {project.technologies.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{project.technologies.length - 4} more
              </Badge>
            )}
          </div>

          {/* Metrics */}
          {project.metrics && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {project.metrics.stars && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {project.metrics.stars}
                </div>
              )}
              {project.metrics.views && (
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {project.metrics.views.toLocaleString()}
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

        {/* Hover Overlay */}
        <div
          className={cn(
            'absolute inset-0 bg-primary/5 backdrop-blur-sm',
            'flex items-center justify-center gap-3',
            'transform transition-all duration-300',
            isHovered
              ? 'translate-y-0 opacity-100'
              : 'pointer-events-none translate-y-4 opacity-0'
          )}
        >
          {project.demoUrl && (
            <Button
              size="sm"
              className="bg-white/90 shadow-lg backdrop-blur-sm hover:bg-white"
            >
              <Play className="mr-2 h-4 w-4" />
              Demo
            </Button>
          )}
          {project.githubUrl && (
            <Button
              size="sm"
              variant="outline"
              className="bg-white/90 shadow-lg backdrop-blur-sm hover:bg-white"
            >
              <Github className="mr-2 h-4 w-4" />
              Code
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="bg-white/90 shadow-lg backdrop-blur-sm hover:bg-white"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Details
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Main project showcase component
export const ProjectShowcase: React.FC<ProjectShowcaseProps> = ({
  projects,
  className,
  layout = 'grid',
  showFilters = true,
  showSearch = true,
  enableHover3D = true,
  cardAspectRatio = 'landscape',
  columns = 3,
  onProjectClick,
  onProjectHover,
  sortBy = 'featured',
  sortOrder = 'desc',
}) => {
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSort, setCurrentSort] = useState({
    by: sortBy,
    order: sortOrder,
  });
  const [currentLayout, setCurrentLayout] = useState(layout);

  // Filter and sort projects
  useEffect(() => {
    let filtered = [...projects];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(
        project => project.category === selectedCategory
      );
    }

    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter(project => project.status === selectedStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        project =>
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          project.technologies.some(tech =>
            tech.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Sort projects
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (currentSort.by) {
        case 'year':
          comparison = a.year - b.year;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'popularity':
          const aPopularity = (a.metrics?.stars || 0) + (a.metrics?.views || 0);
          const bPopularity = (b.metrics?.stars || 0) + (b.metrics?.views || 0);
          comparison = aPopularity - bPopularity;
          break;
        case 'featured':
          comparison = (a.featured ? 1 : 0) - (b.featured ? 1 : 0);
          break;
      }

      return currentSort.order === 'desc' ? -comparison : comparison;
    });

    setFilteredProjects(filtered);
  }, [projects, selectedCategory, selectedStatus, searchTerm, currentSort]);

  // Get unique categories and statuses
  const categories = Array.from(
    new Set(projects.map(project => project.category))
  );
  const statuses = Array.from(new Set(projects.map(project => project.status)));

  // Layout classes
  const layoutClasses = {
    grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-6`,
    masonry: 'columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6',
    list: 'space-y-6',
  };

  return (
    <div className={cn('space-y-8', className)}>
      {/* Controls */}
      {(showFilters || showSearch) && (
        <div className="space-y-6">
          {/* Search */}
          {showSearch && (
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          {/* Filters and Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Category Filter */}
            {showFilters && (
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === null ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                  >
                    All Categories
                  </Button>
                  {categories.map(category => {
                    const config = CATEGORY_CONFIG[category];
                    return (
                      <Button
                        key={category}
                        variant={
                          selectedCategory === category ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className="gap-2"
                      >
                        {config.icon}
                        {config.label}
                      </Button>
                    );
                  })}
                </div>

                {/* Status Filter */}
                <div className="flex gap-2">
                  <Button
                    variant={selectedStatus === null ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedStatus(null)}
                  >
                    All Status
                  </Button>
                  {statuses.map(status => (
                    <Button
                      key={status}
                      variant={
                        selectedStatus === status ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => setSelectedStatus(status)}
                    >
                      {status.replace('-', ' ')}
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
                  variant={currentLayout === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentLayout('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={currentLayout === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentLayout('list')}
                  className="rounded-none border-x"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={currentLayout === 'masonry' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentLayout('masonry')}
                  className="rounded-l-none"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              {/* Sort */}
              <select
                value={`${currentSort.by}-${currentSort.order}`}
                onChange={e => {
                  const [by, order] = e.target.value.split('-') as [
                    typeof sortBy,
                    typeof sortOrder,
                  ];
                  setCurrentSort({ by, order });
                }}
                className="rounded border px-3 py-1 text-sm focus:border-transparent focus:ring-2 focus:ring-primary"
              >
                <option value="featured-desc">Featured First</option>
                <option value="year-desc">Newest First</option>
                <option value="year-asc">Oldest First</option>
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
                <option value="popularity-desc">Most Popular</option>
                <option value="popularity-asc">Least Popular</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <div className={layoutClasses[currentLayout]}>
        {filteredProjects.map(project => (
          <ProjectCard3D
            key={project.id}
            project={project}
            aspectRatio={cardAspectRatio}
            enableHover3D={enableHover3D}
            onProjectClick={onProjectClick}
            onProjectHover={onProjectHover}
          />
        ))}
      </div>

      {/* Empty state */}
      {filteredProjects.length === 0 && (
        <div className="py-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Search className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">No projects found</h3>
          <p className="mb-6 text-muted-foreground">
            Try adjusting your search terms or category filters.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory(null);
              setSelectedStatus(null);
            }}
          >
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
        <span>{categories.length} categories</span>
        <span>•</span>
        <span>{projects.filter(p => p.featured).length} featured</span>
      </div>
    </div>
  );
};

export default ProjectShowcase;
