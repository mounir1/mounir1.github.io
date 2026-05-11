import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, TrendingUp, Users, Award, Code, Wifi, WifiOff } from "lucide-react";
import { Signature } from "@/components/ui/signature";
import { useExperience } from "@/hooks/useExperience";

function ExperienceSkeleton() {
  return (
    <Card className="border-0 shadow-medium bg-card/50 overflow-hidden">
      <div className="flex">
        <div className="flex flex-col items-center mr-6 ml-6 mt-6">
          <Skeleton className="w-4 h-4 rounded-full" />
          <Skeleton className="w-0.5 h-32 mt-2" />
        </div>
        <div className="flex-1 py-6 pr-6 space-y-4">
          <Skeleton className="h-7 w-2/3" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export const Experience = () => {
  const { experiences, loading } = useExperience();

  return (
    <section id="experience" className="py-20 px-6 bg-gradient-to-br from-card/20 via-background to-card/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Professional Experience
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A journey of continuous learning, innovation, and delivering exceptional results across diverse projects and technologies
          </p>
          <div className="flex justify-center mt-6">
            <Signature size="sm" className="opacity-30" />
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => <ExperienceSkeleton key={i} />)}
          </div>
        )}

        {/* Empty State */}
        {!loading && experiences.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-lg font-medium">No experience entries yet</p>
            <p className="text-sm mt-1">Add your experience via the Admin panel</p>
          </div>
        )}

        {/* Experience List */}
        {!loading && experiences.length > 0 && (
          <div className="space-y-8">
            {experiences.map((experience, index) => (
              <Card
                key={experience.id}
                className="group border-0 shadow-medium hover:shadow-large transition-all duration-500 bg-card/50 backdrop-blur-sm overflow-hidden"
              >
                <div className="flex">
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center mr-6 ml-6 mt-6">
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        experience.current
                          ? "bg-primary border-primary shadow-glow"
                          : "bg-background border-primary/50"
                      } transition-all duration-300 group-hover:scale-125`}
                    />
                    {index < experiences.length - 1 && (
                      <div className="w-0.5 h-full bg-gradient-to-b from-primary/50 to-transparent mt-2" />
                    )}
                  </div>

                  <div className="flex-1 py-6 pr-6">
                    <CardHeader className="pb-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                        <div className="flex items-center gap-3">
                          {experience.icon && (
                            <span className="text-2xl">{experience.icon}</span>
                          )}
                          <CardTitle className="text-2xl group-hover:text-primary transition-colors duration-300">
                            {experience.title}
                          </CardTitle>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {experience.current && (
                            <Badge className="w-fit bg-green-500/10 text-green-600 border-green-500/20 shadow-glow">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Current
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs capitalize">
                            {experience.type}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-3">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-primary" />
                          {experience.companyUrl ? (
                            <a
                              href={experience.companyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-foreground hover:text-primary transition-colors"
                            >
                              {experience.company}
                            </a>
                          ) : (
                            <span className="font-semibold text-foreground">{experience.company}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{experience.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {experience.startDate
                              ? new Date(experience.startDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })
                              : ""}
                            {" — "}
                            {experience.current
                              ? "Present"
                              : experience.endDate
                              ? new Date(experience.endDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })
                              : ""}
                          </span>
                        </div>
                      </div>

                      <CardDescription className="text-base leading-relaxed">
                        {experience.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      {/* Key Achievements */}
                      {experience.achievements && experience.achievements.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            Key Achievements
                          </h4>
                          <div className="grid md:grid-cols-2 gap-2">
                            {experience.achievements.map((achievement, i) => (
                              <div key={i} className="flex items-start gap-2 text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                <span className="text-muted-foreground">{achievement}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Technologies */}
                      {experience.technologies && experience.technologies.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Code className="w-4 h-4 text-primary" />
                            Technologies Used
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {experience.technologies.map((tech) => (
                              <Badge
                                key={tech}
                                variant="outline"
                                className="hover:bg-primary/10 transition-colors"
                              >
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "10+", label: "Years Experience" },
            { value: "150+", label: "Projects Completed" },
            { value: "20+", label: "Technologies Mastered" },
            { value: "10K+", label: "Users Served" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center p-6 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/50 hover:shadow-medium transition-all duration-300"
            >
              <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-border/20">
          <div className="flex justify-center mb-4">
            <Signature size="md" className="opacity-40" />
          </div>
          <p className="text-sm text-muted-foreground">
            Committed to delivering excellence in every project
          </p>
        </div>
      </div>
    </section>
  );
};
