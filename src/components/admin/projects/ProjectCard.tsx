import React, { useState } from "react";
import { type Project } from "@/hooks/useProjects";
import { format } from "date-fns";

import {
  Database,
  Star,
  Eye,
  EyeOff,
  Edit,
  MoreHorizontal,
  Globe,
  Github,
  Calendar,
  Users,
  Trophy,
  Clock,
  CheckCircle2,
  AlertCircle,
  Pause,
  Archive,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProjectCardProps {
  project: Project;
  viewMode: "grid" | "list";
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  onEdit?: () => void;
  onView?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onToggleFeatured?: () => void;
  onToggleVisibility?: () => void;
  className?: string;
}

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    label: "Completed"
  },
  "in-progress": {
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    label: "In Progress"
  },
  maintenance: {
    icon: Pause,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
    label: "Maintenance"
  },
  archived: {
    icon: Archive,
    color: "text-gray-600",
    bgColor: "bg-gray-50 dark:bg-gray-950/20",
    label: "Archived"
  }
};

export const ProjectCard = React.memo(function ProjectCard({
  project,
  viewMode,
  selected = false,
  onSelect,
  onEdit,
  onView,
  onDelete,
  onDuplicate,
  onToggleFeatured,
  onToggleVisibility,
  className = "",
}: ProjectCardProps) {
  const [imageError, setImageError] = useState(false);

  const statusInfo = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.completed;
  const StatusIcon = statusInfo.icon;

  const handleImageError = () => {
    setImageError(true);
  };

  if (viewMode === "list") {
    return (
      <Card className={`transition-all duration-200 hover:shadow-md ${selected ? "ring-2 ring-primary" : ""
        } ${project.disabled ? "opacity-60" : ""} ${project.featured ? "bg-yellow-50/30 dark:bg-yellow-950/20" : ""
        } ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Selection Checkbox */}
            {onSelect && (
              <Checkbox
                checked={selected}
                onCheckedChange={onSelect}
                className="mt-1"
              />
            )}

            {/* Project Image/Logo */}
            <div className="w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden bg-muted flex items-center justify-center">
              {project.image && !imageError ? (
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                  loading="lazy"
                />
              ) : project.logo && !imageError ? (
                <img
                  src={project.logo}
                  alt={project.title}
                  className="w-full h-full object-contain p-2"
                  onError={handleImageError}
                  loading="lazy"
                />
              ) : (
                <Database className="h-8 w-8 text-muted-foreground" />
              )}
            </div>

            {/* Project Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg truncate">{project.title}</h3>
                    {project.featured && (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                    )}
                    {project.disabled && (
                      <EyeOff className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>

                  <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                    {project.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                      <span>{statusInfo.label}</span>
                    </div>

                    <Badge variant="outline" className="capitalize">
                      {project.category}
                    </Badge>

                    {project.teamSize && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{project.teamSize} {project.teamSize === 1 ? 'person' : 'people'}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(project.updatedAt), "MMM dd, yyyy")}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  {project.liveUrl && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                              <Globe className="h-4 w-4" />
                            </a>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View Live Site</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {project.githubUrl && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                              <Github className="h-4 w-4" />
                            </a>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View Source Code</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {onEdit && (
                    <Button variant="ghost" size="sm" onClick={onEdit}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onView && (
                        <DropdownMenuItem onClick={onView}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={onEdit}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Project
                        </DropdownMenuItem>
                      )}
                      {onDuplicate && (
                        <DropdownMenuItem onClick={onDuplicate}>
                          <Database className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {onToggleFeatured && (
                        <DropdownMenuItem onClick={onToggleFeatured}>
                          <Star className={`h-4 w-4 mr-2 ${project.featured ? 'fill-current' : ''}`} />
                          {project.featured ? 'Unfeature' : 'Feature'}
                        </DropdownMenuItem>
                      )}
                      {onToggleVisibility && (
                        <DropdownMenuItem onClick={onToggleVisibility}>
                          {project.disabled ? (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Show Project
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Hide Project
                            </>
                          )}
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={onDelete} className="text-destructive">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Delete Project
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>

          {/* Technologies */}
          <div className="flex flex-wrap gap-1 mt-3 ml-20">
            {project.technologies.slice(0, 6).map((tech, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
            {project.technologies.length > 6 && (
              <Badge variant="secondary" className="text-xs">
                +{project.technologies.length - 6} more
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card className={`transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${selected ? "ring-2 ring-primary" : ""
      } ${project.disabled ? "opacity-60" : ""} ${project.featured ? "bg-yellow-50/30 dark:bg-yellow-950/20" : ""
      } ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {onSelect && (
              <Checkbox
                checked={selected}
                onCheckedChange={onSelect}
              />
            )}

            <div className="w-8 h-8 rounded-md flex-shrink-0 overflow-hidden bg-muted flex items-center justify-center">
              {project.logo && !imageError ? (
                <img
                  src={project.logo}
                  alt={project.title}
                  className="w-full h-full object-contain p-1"
                  onError={handleImageError}
                  loading="lazy"
                />
              ) : (
                <Database className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={onView}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Project
                </DropdownMenuItem>
              )}
              {onDuplicate && (
                <DropdownMenuItem onClick={onDuplicate}>
                  <Database className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onToggleFeatured && (
                <DropdownMenuItem onClick={onToggleFeatured}>
                  <Star className={`h-4 w-4 mr-2 ${project.featured ? 'fill-current' : ''}`} />
                  {project.featured ? 'Unfeature' : 'Feature'}
                </DropdownMenuItem>
              )}
              {onToggleVisibility && (
                <DropdownMenuItem onClick={onToggleVisibility}>
                  {project.disabled ? (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show Project
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Project
                    </>
                  )}
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Delete Project
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <CardTitle className="text-lg leading-tight">
          <div className="flex items-center gap-2">
            <span className="truncate">{project.title}</span>
            {project.featured && (
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
            )}
            {project.disabled && (
              <EyeOff className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Project Image */}
        {project.image && !imageError && (
          <div className="w-full h-32 rounded-md overflow-hidden bg-muted">
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover"
              onError={handleImageError}
              loading="lazy"
            />
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3">
          {project.description}
        </p>

        {/* Status and Category */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${statusInfo.bgColor}`}>
            <StatusIcon className={`h-3 w-3 ${statusInfo.color}`} />
            <span className={statusInfo.color}>{statusInfo.label}</span>
          </div>

          <Badge variant="outline" className="text-xs capitalize">
            {project.category}
          </Badge>
        </div>

        {/* Technologies */}
        <div className="flex flex-wrap gap-1">
          {project.technologies.slice(0, 4).map((tech, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
          {project.technologies.length > 4 && (
            <Badge variant="secondary" className="text-xs">
              +{project.technologies.length - 4}
            </Badge>
          )}
        </div>

        {/* Achievements */}
        {project.achievements && project.achievements.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Trophy className="h-3 w-3" />
            <span>{project.achievements.length} achievement{project.achievements.length !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Links */}
        <div className="flex items-center gap-2">
          {project.liveUrl && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View Live Site</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {project.githubUrl && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View Source Code</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit} className="ml-auto">
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(project.updatedAt), "MMM dd")}</span>
          </div>

          {project.teamSize && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{project.teamSize}</span>
            </div>
          )}

          <div className="text-right">
            Priority: {project.priority}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});