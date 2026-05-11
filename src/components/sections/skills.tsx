import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Code, Server, Cloud, Database, Globe, Cpu, Layers, Wrench, Smartphone, Brain } from "lucide-react";
import { useSkills } from "@/hooks/useSkills";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "Frontend Development": Code,
  "Backend Development": Server,
  "Cloud & DevOps": Cloud,
  "Database": Database,
  "Mobile Development": Smartphone,
  "Machine Learning": Brain,
  "Design": Layers,
  "Tools": Wrench,
  "Frameworks": Cpu,
  "Languages": Globe,
  "Other": Cpu,
};

function SkillsSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="border-0 shadow-medium">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <Skeleton className="h-6 w-40" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export const Skills = () => {
  const { skills, skillsByCategory, loading } = useSkills();

  // Separate human languages from tech skills
  const languageSkills = skills.filter(
    (s) => s.category === "Languages" && !s.disabled
  );
  const techCategories = Object.entries(skillsByCategory).filter(
    ([cat]) => cat !== "Languages"
  );

  // Fallback static technologies list if skills empty
  const allTechNames = skills.length > 0
    ? [...new Set(skills.filter(s => s.category !== "Languages").map(s => s.name))]
    : ["React", "Node.js", "TypeScript", "AWS", "Docker", "Magento 2",
       "ExtJS", "Angular", "Next.js", "Python", "PHP", "MongoDB",
       "PostgreSQL", "GitLab CI/CD", "JIRA", "Cegid ERP"];

  const staticLanguages = [
    { name: "Amazigh", level: "Native", flag: "🔶" },
    { name: "Arabic",  level: "Native", flag: "🇩🇿" },
    { name: "English", level: "Fluent", flag: "🇺🇸" },
    { name: "French",  level: "Fluent", flag: "🇫🇷" },
    { name: "Turkish", level: "Proficient", flag: "🇹🇷" },
    { name: "Russian", level: "Intermediate", flag: "🇷🇺" },
  ];

  const displayLanguages =
    languageSkills.length > 0
      ? languageSkills.map((s) => ({
          name: s.name,
          level: s.languageLevel
            ? s.languageLevel.charAt(0).toUpperCase() + s.languageLevel.slice(1)
            : `${s.level}%`,
          flag: s.icon || "🌐",
        }))
      : staticLanguages;

  return (
    <section id="skills" className="py-24 px-6">
      <div className="max-w-6xl mx-auto space-y-20">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Technical <span className="text-primary">Expertise</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A comprehensive toolkit built through years of hands-on experience and continuous learning
          </p>
        </div>

        {/* Loading */}
        {loading && <SkillsSkeleton />}

        {/* Empty state */}
        {!loading && skills.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-5xl mb-4">🛠️</div>
            <p className="text-lg font-medium">No skills added yet</p>
            <p className="text-sm mt-1">Add skills via the Admin panel or upload seed data</p>
          </div>
        )}

        {/* Dynamic skill cards from Firebase */}
        {!loading && techCategories.length > 0 && (
          <div className="grid md:grid-cols-2 gap-8">
            {techCategories.map(([category, catSkills]) => {
              const Icon = CATEGORY_ICONS[category] || Cpu;
              return (
                <Card
                  key={category}
                  className="group hover:shadow-glow transition-all duration-500 hover:scale-[1.02] border-0 shadow-medium"
                >
                  <CardHeader className="pb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl font-bold">{category}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {catSkills.slice(0, 6).map((skill) => (
                      <div key={skill.id} className="space-y-1.5">
                        <div className="flex justify-between text-sm items-center">
                          <div className="flex items-center gap-2 font-medium">
                            {skill.icon && <span className="text-base">{skill.icon}</span>}
                            <span>{skill.name}</span>
                            {skill.trending && (
                              <Badge className="text-[10px] h-4 px-1.5 bg-orange-500/10 text-orange-600 border-orange-400/20">
                                Trending
                              </Badge>
                            )}
                          </div>
                          <span className="text-muted-foreground text-xs">
                            {skill.level}%
                            {skill.yearsOfExperience > 0 && (
                              <span className="ml-1 opacity-60">· {skill.yearsOfExperience}y</span>
                            )}
                          </span>
                        </div>
                        <Progress value={skill.level} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Fallback static skills if Firebase is empty */}
        {!loading && skills.length === 0 && (
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Code, title: "Frontend Development",
                skills: [
                  { name: "React/Next.js", level: 95 },
                  { name: "TypeScript", level: 90 },
                  { name: "JavaScript ES6+", level: 95 },
                  { name: "HTML5/CSS3", level: 90 },
                ],
              },
              {
                icon: Server, title: "Backend Development",
                skills: [
                  { name: "Node.js", level: 85 },
                  { name: "PHP", level: 80 },
                  { name: "Python", level: 75 },
                  { name: "Java", level: 70 },
                ],
              },
              {
                icon: Cloud, title: "Cloud & DevOps",
                skills: [
                  { name: "AWS", level: 80 },
                  { name: "Docker", level: 75 },
                  { name: "GitLab CI/CD", level: 85 },
                  { name: "Git", level: 90 },
                ],
              },
              {
                icon: Database, title: "Data & Integration",
                skills: [
                  { name: "API Development", level: 90 },
                  { name: "ETL Pipelines", level: 85 },
                  { name: "Machine Learning", level: 70 },
                  { name: "ERP/CRM Systems", level: 85 },
                ],
              },
            ].map((category) => {
              const Icon = category.icon;
              return (
                <Card
                  key={category.title}
                  className="group hover:shadow-glow transition-all duration-500 hover:scale-[1.02] border-0 shadow-medium"
                >
                  <CardHeader className="pb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl font-bold">{category.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {category.skills.map((skill) => (
                      <div key={skill.name} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{skill.name}</span>
                          <span className="text-muted-foreground">{skill.level}%</span>
                        </div>
                        <Progress value={skill.level} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Languages */}
        <Card className="shadow-medium border-0">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Languages</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {displayLanguages.map((lang, index) => (
                <div
                  key={index}
                  className="text-center p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group"
                >
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                    {lang.flag}
                  </div>
                  <div className="font-medium text-sm">{lang.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{lang.level}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tech Cloud */}
        <Card className="shadow-medium border-0">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Wrench className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Technologies & Tools</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {allTechNames.map((tech, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-sm py-2 px-4 hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 hover:scale-105"
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
