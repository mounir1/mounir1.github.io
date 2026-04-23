import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ExternalLink, Github, Star, Database, Loader2 } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useEffect, useState, useRef } from 'react';
import { seedInitialData } from '@/lib/seed-data';
import { Signature } from '@/components/ui/signature';

export const Projects = () => {
  const { projects, featured, others, loading, error } = useProjects();
  const [isSeeding, setIsSeeding] = useState(false);
  const hasSeeded = useRef(false);

  useEffect(() => {
    // Auto-seed data if no projects exist and Firebase is available
    const autoSeed = async () => {
      if (
        !loading &&
        projects.length === 0 &&
        !error &&
        !hasSeeded.current &&
        !isSeeding
      ) {
        hasSeeded.current = true;
        setIsSeeding(true);

        try {
          const seeded = await seedInitialData();
          if (seeded) {
            // Wait for Firebase to sync, then reload
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } else {
            setIsSeeding(false);
          }
        } catch (err) {
          console.error('Seeding failed:', err);
          setIsSeeding(false);
        }
      }
    };

    autoSeed();
  }, [loading, projects.length, error, isSeeding]);

  // Show loading state
  if (loading || isSeeding) {
    return (
      <section
        id="projects"
        className="w-full bg-gradient-to-br from-background via-card/20 to-background px-4 py-20 md:px-6 lg:px-8"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-6 bg-gradient-primary bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
              Featured Projects
            </h2>
            <div className="flex items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>
                {isSeeding
                  ? 'Setting up your portfolio...'
                  : 'Loading projects...'}
              </span>
            </div>
            {isSeeding && (
              <p className="mt-2 text-sm text-muted-foreground">
                This may take a moment on first visit
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section
        id="projects"
        className="w-full bg-gradient-to-br from-background via-card/20 to-background px-4 py-20 md:px-6 lg:px-8"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-6 bg-gradient-primary bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
              Featured Projects
            </h2>
            <div className="text-muted-foreground">
              <Database className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p>Unable to load projects. Please check your connection.</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="projects"
      className="w-full bg-gradient-to-br from-background via-card/20 to-background px-4 py-20 md:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-6 bg-gradient-primary bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
            Featured Projects
          </h2>
          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-muted-foreground">
            Showcasing innovative solutions that drive business growth and
            deliver exceptional user experiences
          </p>
          <div className="mt-6 flex justify-center">
            <Signature size="sm" className="opacity-30" />
          </div>
        </div>

        {/* Featured Projects */}
        {featured.length > 0 && (
          <div className="mb-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featured.map(project => (
              <Card
                key={project.id}
                className="group overflow-hidden border-0 bg-card/50 shadow-medium backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-large"
              >
                <div className="relative overflow-hidden">
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                      <div className="text-4xl">{project.icon || '🚀'}</div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Company Logo */}
                  {project.logo && (
                    <div className="absolute left-4 top-4 rounded-lg bg-white/95 p-2 shadow-medium backdrop-blur-sm transition-transform duration-300 hover:scale-110">
                      <img
                        src={project.logo}
                        alt={`${project.title} logo`}
                        className="h-6 w-auto max-w-[80px] object-contain"
                      />
                    </div>
                  )}

                  <div className="absolute right-4 top-4">
                    <Badge className="bg-primary/90 text-primary-foreground shadow-glow">
                      <Star className="mr-1 h-3 w-3" />
                      Featured
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-xl transition-colors duration-300 group-hover:text-primary">
                    {project.title}
                  </CardTitle>
                  <CardDescription className="leading-relaxed text-muted-foreground">
                    {project.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.slice(0, 4).map(tech => (
                        <Badge
                          key={tech}
                          variant="outline"
                          className="text-xs transition-colors hover:bg-primary/10"
                        >
                          {tech}
                        </Badge>
                      ))}
                      {project.technologies.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.technologies.length - 4}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Project Stats */}
                  {project.achievements && project.achievements.length > 0 && (
                    <div className="border-t border-border/50 py-3">
                      <div className="mb-2 text-xs text-muted-foreground">
                        Key Achievement:
                      </div>
                      <div className="text-sm font-medium text-primary">
                        {project.achievements[0]}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    {project.liveUrl && (
                      <Button
                        size="sm"
                        className="flex-1 shadow-glow transition-all duration-300 hover:shadow-large"
                        asChild
                      >
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Demo
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Other Projects */}
        {others.length > 0 && (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="mb-4 text-2xl font-bold">More Projects</h3>
              <p className="text-muted-foreground">
                Additional projects showcasing diverse technical skills
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {others.map(project => (
                <Card
                  key={project.id}
                  className="hover:scale-102 group border-0 bg-card/30 shadow-medium backdrop-blur-sm transition-all duration-300 hover:shadow-large"
                >
                  <div className="flex">
                    <div className="h-32 w-32 flex-shrink-0">
                      {project.image ? (
                        <img
                          src={project.image}
                          alt={project.title}
                          className="h-full w-full rounded-l-lg object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-l-lg bg-gradient-to-br from-primary/20 to-primary/5">
                          <div className="text-2xl">{project.icon || '🚀'}</div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-6">
                      <div className="mb-2 flex items-start justify-between">
                        <CardTitle className="text-lg transition-colors group-hover:text-primary">
                          {project.title}
                        </CardTitle>
                        {project.logo && (
                          <img
                            src={project.logo}
                            alt=""
                            className="h-5 w-auto max-w-[60px] object-contain opacity-70"
                          />
                        )}
                      </div>
                      <CardDescription className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                        {project.description}
                      </CardDescription>
                      {project.technologies &&
                        project.technologies.length > 0 && (
                          <div className="mb-3 flex flex-wrap gap-1">
                            {project.technologies.slice(0, 3).map(tech => (
                              <Badge
                                key={tech}
                                variant="outline"
                                className="text-xs"
                              >
                                {tech}
                              </Badge>
                            ))}
                            {project.technologies.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{project.technologies.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      <div className="flex gap-2">
                        {project.liveUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            asChild
                          >
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="mr-1 h-3 w-3" />
                              View
                            </a>
                          </Button>
                        )}
                        {project.githubUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            asChild
                          >
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Github className="mr-1 h-3 w-3" />
                              Code
                            </a>
                          </Button>
                        )}
                        {project.demoUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            asChild
                          >
                            <a
                              href={project.demoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="mr-1 h-3 w-3" />
                              Demo
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {projects.length === 0 && !loading && !isSeeding && (
          <div className="py-16 text-center">
            <Database className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
            <h3 className="mb-2 text-xl font-semibold">No Projects Yet</h3>
            <p className="text-muted-foreground">
              Projects will be available soon. Check back later!
            </p>
          </div>
        )}

        {/* Professional Footer */}
        <div className="mt-16 border-t border-border/20 pt-8 text-center">
          <div className="mb-4 flex justify-center">
            <Signature size="md" className="opacity-40" />
          </div>
          <p className="text-sm text-muted-foreground">
            All projects are built with modern technologies and best practices
          </p>
        </div>
      </div>
    </section>
  );
};
