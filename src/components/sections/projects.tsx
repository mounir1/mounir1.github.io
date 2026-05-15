import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Github, Star, Search, Filter, X } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useState, useMemo, useEffect } from "react";

const CATEGORIES = [
  "All",
  "Enterprise Integration",
  "Web Application",
  "E-commerce",
  "Mobile Application",
  "Machine Learning",
  "API Development",
  "DevOps & Infrastructure",
  "Other",
];

function ProjectSkeleton() {
  return (
    <Card className="border-0 shadow-medium bg-card/50 overflow-hidden">
      <Skeleton className="w-full h-48" />
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="h-8 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

export const Projects = () => {
  const { projects, featured, others, loading } = useProjects();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => { setShowAll(false); }, [activeCategory, search]);

  // Filtered lists
  const filteredFeatured = useMemo(() => {
    return featured.filter((p) => {
      const matchCat = activeCategory === "All" || p.category === activeCategory;
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        (p.technologies || []).some((t) =>
          t.toLowerCase().includes(search.toLowerCase())
        );
      return matchCat && matchSearch;
    });
  }, [featured, activeCategory, search]);

  const filteredOthers = useMemo(() => {
    return others.filter((p) => {
      const matchCat = activeCategory === "All" || p.category === activeCategory;
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        (p.technologies || []).some((t) =>
          t.toLowerCase().includes(search.toLowerCase())
        );
      return matchCat && matchSearch;
    });
  }, [others, activeCategory, search]);

  const visibleOthers = showAll ? filteredOthers : filteredOthers.slice(0, 4);
  const hasFilters = search !== "" || activeCategory !== "All";
  const totalVisible = filteredFeatured.length + filteredOthers.length;

  return (
    <section id="projects" className="py-20 px-6 bg-gradient-to-br from-background via-card/20 to-background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="bg-primary/10 text-primary border-primary/20 text-sm px-4 py-1.5 mb-4">
            Portfolio
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Featured Projects
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Showcasing innovative solutions that drive business growth and deliver exceptional user experiences
          </p>
        </div>

        {/* Search + Filter Bar */}
        <div className="mb-10 space-y-4">
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects, technologies…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground border-primary shadow-glow"
                    : "bg-card/50 text-muted-foreground border-border/50 hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Active filter indicator */}
          {hasFilters && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
              <span>
                Showing {totalVisible} project{totalVisible !== 1 ? "s" : ""}
              </span>
              <button
                onClick={() => { setSearch(""); setActiveCategory("All"); }}
                className="text-primary hover:underline ml-1"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[...Array(6)].map((_, i) => <ProjectSkeleton key={i} />)}
          </div>
        )}

        {/* No results */}
        {!loading && totalVisible === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-medium">No projects found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
            <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setActiveCategory("All"); }}>
              Clear filters
            </Button>
          </div>
        )}

        {/* Featured Projects */}
        {!loading && filteredFeatured.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredFeatured.map((project) => (
              <Card
                key={project.id}
                className="group overflow-hidden border-0 shadow-medium hover:shadow-large transition-all duration-500 hover:scale-[1.02] bg-card/50 backdrop-blur-sm"
              >
                {/* Image */}
                <div className="relative overflow-hidden">
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <div className="text-5xl">{project.icon || "🚀"}</div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {project.logo && (
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-medium hover:scale-110 transition-transform duration-300">
                      <img
                        src={project.logo}
                        alt={`${project.title} logo`}
                        className="h-6 w-auto max-w-[80px] object-contain"
                      />
                    </div>
                  )}

                  <div className="absolute top-4 right-4 flex flex-col gap-1 items-end">
                    <Badge className="bg-primary/90 text-primary-foreground shadow-glow">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                    {project.status && project.status !== "completed" && (
                      <Badge
                        variant="outline"
                        className="bg-background/80 text-xs capitalize"
                      >
                        {project.status}
                      </Badge>
                    )}
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300 leading-tight">
                      {project.title}
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="w-fit text-xs">
                    {project.category}
                  </Badge>
                  <CardDescription className="text-muted-foreground leading-relaxed mt-1">
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

                  {project.achievements && project.achievements.length > 0 && (
                    <div className="py-3 border-t border-border/50">
                      <div className="text-xs text-muted-foreground mb-1">Key Achievement</div>
                      <div className="text-sm font-medium text-primary leading-snug">
                        {project.achievements[0]}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-1">
                    {project.liveUrl && (
                      <Button size="sm" className="flex-1 shadow-glow hover:shadow-large transition-all duration-300" asChild>
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Live
                        </a>
                      </Button>
                    )}
                    {project.demoUrl && !project.liveUrl && (
                      <Button size="sm" className="flex-1 shadow-glow" asChild>
                        <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Demo
                        </a>
                      </Button>
                    )}
                    {project.githubUrl && (
                      <Button size="sm" variant="outline" className="hover:bg-primary/10 transition-colors" asChild>
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="w-4 h-4" />
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
        {!loading && filteredOthers.length > 0 && (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">More Projects</h3>
              <p className="text-muted-foreground">Additional projects showcasing diverse technical skills</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {visibleOthers.map((project) => (
                <Card
                  key={project.id}
                  className="group border-0 shadow-medium hover:shadow-large transition-all duration-300 hover:scale-[1.01] bg-card/30 backdrop-blur-sm"
                >
                  <div className="flex">
                    <div className="w-28 h-28 flex-shrink-0">
                      {project.image ? (
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover rounded-l-lg transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 rounded-l-lg flex items-center justify-center">
                          <div className="text-2xl">{project.icon || "🚀"}</div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between mb-1 gap-2">
                        <CardTitle className="text-base group-hover:text-primary transition-colors leading-tight">
                          {project.title}
                        </CardTitle>
                        {project.logo && (
                          <img
                            src={project.logo}
                            alt=""
                            className="h-5 w-auto max-w-[55px] object-contain opacity-70 shrink-0"
                          />
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs mb-2">
                        {project.category}
                      </Badge>
                      <CardDescription className="text-xs text-muted-foreground mb-3 line-clamp-2">
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
                          <Button size="sm" variant="outline" className="text-xs h-7 px-2" asChild>
                            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View
                            </a>
                          </Button>
                        )}
                        {project.githubUrl && (
                          <Button size="sm" variant="outline" className="text-xs h-7 px-2" asChild>
                            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                              <Github className="w-3 h-3 mr-1" />
                              Code
                            </a>
                          </Button>
                        )}
                        {project.demoUrl && (
                          <Button size="sm" variant="outline" className="text-xs h-7 px-2" asChild>
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

            {/* Show more / less */}
            {filteredOthers.length > 4 && (
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAll((v) => !v)}
                  className="hover:bg-primary/10 transition-colors"
                >
                  {showAll
                    ? "Show Less"
                    : `Show ${filteredOthers.length - 4} More Projects`}
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-16 pt-8 border-t border-border/20">
          <p className="text-sm text-muted-foreground">
            {projects.length > 0
              ? `${projects.length} projects · All built with modern technologies and best practices`
              : "All projects are built with modern technologies and best practices"}
          </p>
        </div>
      </div>
    </section>
  );
};
