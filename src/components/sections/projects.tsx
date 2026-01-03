import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Github, Star, Database, Loader2 } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useEffect, useState, useRef } from "react";
import { seedInitialData } from "@/lib/seed-data";
import { Signature } from "@/components/ui/signature";

export const Projects = () => {
  const { projects, featured, others, loading, error } = useProjects();
  const [isSeeding, setIsSeeding] = useState(false);
  const hasSeeded = useRef(false);

  useEffect(() => {
    // Auto-seed data if no projects exist and Firebase is available
    const autoSeed = async () => {
      if (!loading && projects.length === 0 && !error && !hasSeeded.current && !isSeeding) {
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
          console.error("Seeding failed:", err);
          setIsSeeding(false);
        }
      }
    };

    autoSeed();
  }, [loading, projects.length, error, isSeeding]);

  // Show loading state
  if (loading || isSeeding) {
    return (
      <section id="projects" className="py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-br from-background via-card/20 to-background w-full">
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Featured Projects
            </h2>
            <div className="flex items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{isSeeding ? "Setting up your portfolio..." : "Loading projects..."}</span>
            </div>
            {isSeeding && (
              <p className="text-sm text-muted-foreground mt-2">
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
      <section id="projects" className="py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-br from-background via-card/20 to-background w-full">
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Featured Projects
            </h2>
            <div className="text-muted-foreground">
              <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
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
    <section id="projects" className="py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-br from-background via-card/20 to-background w-full">
      <div className="w-full max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Featured Projects
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Showcasing innovative solutions that drive business growth and deliver exceptional user experiences
          </p>
          <div className="flex justify-center mt-6">
            <Signature size="sm" className="opacity-30" />
          </div>
        </div>

        {/* Featured Projects */}
        {featured.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {featured.map((project) => (
              <Card key={project.id} className="group overflow-hidden border-0 shadow-medium hover:shadow-large transition-all duration-500 hover:scale-105 bg-card/50 backdrop-blur-sm">
                <div className="relative overflow-hidden">
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <div className="text-4xl">{project.icon || "🚀"}</div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Company Logo */}
                  {project.logo && (
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-medium hover:scale-110 transition-transform duration-300">
                      <img
                        src={project.logo}
                        alt={`${project.title} logo`}
                        className="h-6 w-auto max-w-[80px] object-contain"
                      />
                    </div>
                  )}

                  <div className="absolute top-4 right-4">
                    <Badge className="bg-primary/90 text-primary-foreground shadow-glow">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
                    {project.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {project.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.slice(0, 4).map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs hover:bg-primary/10 transition-colors">
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
                    <div className="py-3 border-t border-border/50">
                      <div className="text-xs text-muted-foreground mb-2">Key Achievement:</div>
                      <div className="text-sm font-medium text-primary">
                        {project.achievements[0]}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    {project.liveUrl && (
                      <Button size="sm" className="flex-1 shadow-glow hover:shadow-large transition-all duration-300" asChild>
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
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
              <h3 className="text-2xl font-bold mb-4">More Projects</h3>
              <p className="text-muted-foreground">Additional projects showcasing diverse technical skills</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {others.map((project) => (
                <Card key={project.id} className="group border-0 shadow-medium hover:shadow-large transition-all duration-300 hover:scale-102 bg-card/30 backdrop-blur-sm">
                  <div className="flex">
                    <div className="w-32 h-32 flex-shrink-0">
                      {project.image ? (
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover rounded-l-lg transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 rounded-l-lg flex items-center justify-center">
                          <div className="text-2xl">{project.icon || "🚀"}</div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
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
                      <CardDescription className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {project.description}
                      </CardDescription>
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {project.technologies.slice(0, 3).map((tech) => (
                            <Badge key={tech} variant="outline" className="text-xs">
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
                          <Button size="sm" variant="outline" className="text-xs" asChild>
                            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View
                            </a>
                          </Button>
                        )}
                        {project.githubUrl && (
                          <Button size="sm" variant="outline" className="text-xs" asChild>
                            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                              <Github className="w-3 h-3 mr-1" />
                              Code
                            </a>
                          </Button>
                        )}
                        {project.demoUrl && (
                          <Button size="sm" variant="outline" className="text-xs" asChild>
                            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3 h-3 mr-1" />
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
          <div className="text-center py-16">
            <Database className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground">
              Projects will be available soon. Check back later!
            </p>
          </div>
        )}

        {/* Professional Footer */}
        <div className="text-center mt-16 pt-8 border-t border-border/20">
          <div className="flex justify-center mb-4">
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