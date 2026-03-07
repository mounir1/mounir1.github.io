/**
 * Professional Experience Timeline Component
 * Vertical timeline with company logos, scroll-triggered animations, and expandable sections
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Award,
  ExternalLink,
  Building2,
  Clock,
} from 'lucide-react';

// Experience data interface
export interface Experience {
  id: string;
  company: string;
  position: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  location?: string;
  type: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
  skills: string[];
  achievements: string[];
  companyLogo?: string;
  companyUrl?: string;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: Date;
    url?: string;
  }>;
}

interface ExperienceTimelineProps {
  experiences: Experience[];
  className?: string;
  showAnimations?: boolean;
  compactMode?: boolean;
}

// Individual timeline item component
interface TimelineItemProps {
  experience: Experience;
  index: number;
  isLast: boolean;
  showAnimations: boolean;
  compactMode: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  experience,
  index,
  isLast,
  showAnimations,
  compactMode,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(!showAnimations);
  const itemRef = useRef<HTMLDivElement>(null);

  // Intersection observer for scroll animations
  useEffect(() => {
    if (!showAnimations) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 200);
        }
      },
      { threshold: 0.2 }
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => observer.disconnect();
  }, [showAnimations, index]);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  const calculateDuration = (): string => {
    const start = experience.startDate;
    const end = experience.endDate || new Date();

    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());

    if (months < 12) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    }

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    let duration = `${years} year${years !== 1 ? 's' : ''}`;
    if (remainingMonths > 0) {
      duration += ` ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    }

    return duration;
  };

  const getTypeColor = (type: Experience['type']): string => {
    const colors = {
      'full-time': 'bg-blue-100 text-blue-800 border-blue-200',
      'part-time': 'bg-green-100 text-green-800 border-green-200',
      contract: 'bg-purple-100 text-purple-800 border-purple-200',
      freelance: 'bg-orange-100 text-orange-800 border-orange-200',
      internship: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[type] || colors['full-time'];
  };

  return (
    <div
      ref={itemRef}
      className={cn(
        'relative flex gap-6 pb-8',
        !isLast && 'ml-6 border-l-2 border-muted',
        showAnimations && !isVisible && 'translate-y-8 opacity-0',
        showAnimations &&
          isVisible &&
          'translate-y-0 opacity-100 transition-all duration-700 ease-out'
      )}
    >
      {/* Timeline dot and line */}
      <div className="relative flex-shrink-0">
        <div
          className={cn(
            'absolute -left-[25px] top-2 flex h-12 w-12 items-center justify-center rounded-full border-4 border-background shadow-lg transition-all duration-300',
            experience.current
              ? 'animate-pulse bg-primary text-primary-foreground'
              : 'bg-card hover:scale-110'
          )}
        >
          {experience.companyLogo ? (
            <img
              src={experience.companyLogo}
              alt={`${experience.company} logo`}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <Building2 className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <Card
          className={cn(
            'transition-all duration-300 hover:shadow-lg',
            compactMode ? 'p-4' : 'p-6'
          )}
        >
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="truncate text-lg font-semibold text-foreground">
                    {experience.position}
                  </h3>
                  {experience.current && (
                    <Badge
                      variant="default"
                      className="border-green-200 bg-green-100 text-green-800"
                    >
                      Current
                    </Badge>
                  )}
                </div>

                <div className="mb-2 flex items-center gap-2">
                  {experience.companyUrl ? (
                    <a
                      href={experience.companyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-medium text-primary hover:underline"
                    >
                      {experience.company}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="font-medium text-muted-foreground">
                      {experience.company}
                    </span>
                  )}

                  <Badge className={getTypeColor(experience.type)}>
                    {experience.type.replace('-', ' ')}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDate(experience.startDate)} -{' '}
                      {experience.current
                        ? 'Present'
                        : formatDate(experience.endDate!)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{calculateDuration()}</span>
                  </div>

                  {experience.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{experience.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {!compactMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex-shrink-0"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <p className="mb-4 leading-relaxed text-muted-foreground">
              {experience.description}
            </p>

            {/* Skills */}
            {experience.skills.length > 0 && (
              <div className="mb-4">
                <h4 className="mb-2 text-sm font-medium text-foreground">
                  Technologies & Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {experience.skills.map((skill, skillIndex) => (
                    <Badge
                      key={skillIndex}
                      variant="secondary"
                      className="text-xs"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Expandable content */}
            {(isExpanded || compactMode) && (
              <div className="space-y-4 duration-300 animate-in slide-in-from-top-2">
                {/* Achievements */}
                {experience.achievements.length > 0 && (
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                      <Award className="h-4 w-4" />
                      Key Achievements
                    </h4>
                    <ul className="space-y-1">
                      {experience.achievements.map(
                        (achievement, achievementIndex) => (
                          <li
                            key={achievementIndex}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                            {achievement}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {/* Projects */}
                {experience.projects && experience.projects.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-foreground">
                      Notable Projects
                    </h4>
                    <div className="space-y-3">
                      {experience.projects.map((project, projectIndex) => (
                        <div
                          key={projectIndex}
                          className="border-l-2 border-muted pl-3"
                        >
                          <h5 className="text-sm font-medium text-foreground">
                            {project.name}
                          </h5>
                          <p className="mb-2 text-xs text-muted-foreground">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {project.technologies.map((tech, techIndex) => (
                              <Badge
                                key={techIndex}
                                variant="outline"
                                className="px-1 py-0 text-xs"
                              >
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {experience.certifications &&
                  experience.certifications.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-foreground">
                        Certifications
                      </h4>
                      <div className="space-y-2">
                        {experience.certifications.map((cert, certIndex) => (
                          <div
                            key={certIndex}
                            className="flex items-center justify-between"
                          >
                            <div>
                              <span className="text-sm font-medium text-foreground">
                                {cert.name}
                              </span>
                              <span className="ml-2 text-xs text-muted-foreground">
                                by {cert.issuer}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {formatDate(cert.date)}
                              </span>
                              {cert.url && (
                                <a
                                  href={cert.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-primary/80"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Main timeline component
export const ExperienceTimeline: React.FC<ExperienceTimelineProps> = ({
  experiences,
  className,
  showAnimations = true,
  compactMode = false,
}) => {
  const [filter, setFilter] = useState<'all' | Experience['type']>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Sort and filter experiences
  const processedExperiences = React.useMemo(() => {
    let filtered = experiences;

    if (filter !== 'all') {
      filtered = experiences.filter(exp => exp.type === filter);
    }

    return filtered.sort((a, b) => {
      const dateA = a.startDate.getTime();
      const dateB = b.startDate.getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [experiences, filter, sortOrder]);

  const experienceTypes = Array.from(new Set(experiences.map(exp => exp.type)));

  return (
    <div className={cn('mx-auto w-full max-w-4xl', className)}>
      {/* Header */}
      <div className="mb-8">
        <h2 className="mb-4 text-3xl font-bold text-foreground">
          Professional Experience
        </h2>
        <p className="mb-6 text-muted-foreground">
          My career journey and professional growth over the years
        </p>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Filter:</span>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as typeof filter)}
              className="rounded-md border border-input bg-background px-2 py-1 text-sm"
            >
              <option value="all">All Types</option>
              {experienceTypes.map(type => (
                <option key={type} value={type}>
                  {type
                    .replace('-', ' ')
                    .replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Sort:</span>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as typeof sortOrder)}
              className="rounded-md border border-input bg-background px-2 py-1 text-sm"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {processedExperiences.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              No experiences found for the selected filter.
            </p>
          </div>
        ) : (
          processedExperiences.map((experience, index) => (
            <TimelineItem
              key={experience.id}
              experience={experience}
              index={index}
              isLast={index === processedExperiences.length - 1}
              showAnimations={showAnimations}
              compactMode={compactMode}
            />
          ))
        )}
      </div>

      {/* Summary */}
      <div className="mt-12 rounded-lg bg-muted/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          Career Summary
        </h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {experiences.length}
            </div>
            <div className="text-sm text-muted-foreground">Positions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {Array.from(new Set(experiences.map(exp => exp.company))).length}
            </div>
            <div className="text-sm text-muted-foreground">Companies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {
                Array.from(new Set(experiences.flatMap(exp => exp.skills)))
                  .length
              }
            </div>
            <div className="text-sm text-muted-foreground">Technologies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {Math.ceil(
                (new Date().getTime() -
                  Math.min(
                    ...experiences.map(exp => exp.startDate.getTime())
                  )) /
                  (1000 * 60 * 60 * 24 * 365)
              )}
            </div>
            <div className="text-sm text-muted-foreground">Years</div>
          </div>
        </div>
      </div>
    </div>
  );
};
