import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar, MapPin, TrendingUp, Users, Award, Code } from 'lucide-react';
import { Signature } from '@/components/ui/signature';

const experiences = [
  {
    id: 1,
    title: 'Senior Full-Stack Developer',
    company: 'Freelance',
    location: 'Remote',
    period: '2020 - Present',
    type: 'Freelance',
    description:
      'Leading full-stack development projects for international clients, specializing in enterprise solutions and modern web applications. Delivering scalable, high-performance solutions that drive business growth.',
    achievements: [
      'Delivered 50+ successful projects with 98% client satisfaction',
      'Built scalable applications serving 100K+ users',
      'Reduced client development costs by average 40%',
      'Mentored 20+ junior developers across various projects',
    ],
    technologies: [
      'React',
      'Node.js',
      'TypeScript',
      'AWS',
      'Docker',
      'Firebase',
      'PostgreSQL',
      'MongoDB',
    ],
    current: true,
  },
  {
    id: 2,
    title: 'Lead Software Engineer',
    company: 'TechnoSolutions',
    location: 'Algiers, Algeria',
    period: '2018 - 2019',
    type: 'Full-time',
    description:
      'Led a team of 8 developers in building enterprise-grade applications and managing complex software architecture decisions. Focused on scalable solutions and team development.',
    achievements: [
      'Increased team productivity by 60%',
      'Implemented CI/CD pipelines reducing deployment time by 80%',
      'Architected microservices handling 1M+ requests daily',
      'Established coding standards and best practices',
    ],
    technologies: [
      'Vue.js',
      'Laravel',
      'MySQL',
      'Redis',
      'Docker',
      'Jenkins',
      'AWS',
      'Nginx',
    ],
    current: false,
  },
  {
    id: 3,
    title: 'Full-Stack Developer',
    company: 'Digital Innovations',
    location: 'Algiers, Algeria',
    period: '2016 - 2018',
    type: 'Full-time',
    description:
      'Developed web applications and mobile solutions for various industries including e-commerce, healthcare, and education. Focused on creating user-centric solutions with modern technologies.',
    achievements: [
      'Built 25+ web applications from scratch',
      'Improved application performance by average 70%',
      'Integrated 15+ third-party APIs and services',
      'Trained team members on modern development practices',
    ],
    technologies: [
      'JavaScript',
      'PHP',
      'MySQL',
      'Bootstrap',
      'jQuery',
      'REST APIs',
      'Git',
      'Linux',
    ],
    current: false,
  },
];

export const Experience = () => {
  return (
    <section
      id="experience"
      className="bg-gradient-to-br from-card/20 via-background to-card/20 px-6 py-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="mb-6 bg-gradient-primary bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
            Professional Experience
          </h2>
          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-muted-foreground">
            A journey of continuous learning, innovation, and delivering
            exceptional results across diverse projects and technologies
          </p>
          <div className="mt-6 flex justify-center">
            <Signature size="sm" className="opacity-30" />
          </div>
        </div>

        <div className="space-y-8">
          {experiences.map((experience, index) => (
            <Card
              key={experience.id}
              className="group overflow-hidden border-0 bg-card/50 shadow-medium backdrop-blur-sm transition-all duration-500 hover:shadow-large"
            >
              <div className="flex">
                {/* Timeline indicator */}
                <div className="ml-6 mr-6 mt-6 flex flex-col items-center">
                  <div
                    className={`h-4 w-4 rounded-full border-2 ${experience.current ? 'border-primary bg-primary shadow-glow' : 'border-primary/50 bg-background'} transition-all duration-300 group-hover:scale-125`}
                  />
                  {index < experiences.length - 1 && (
                    <div className="mt-2 h-full w-0.5 bg-gradient-to-b from-primary/50 to-transparent" />
                  )}
                </div>

                <div className="flex-1 py-6 pr-6">
                  <CardHeader className="pb-4">
                    <div className="mb-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <CardTitle className="text-2xl transition-colors duration-300 group-hover:text-primary">
                        {experience.title}
                      </CardTitle>
                      {experience.current && (
                        <Badge className="w-fit border-green-500/20 bg-green-500/10 text-green-600 shadow-glow">
                          <TrendingUp className="mr-1 h-3 w-3" />
                          Current
                        </Badge>
                      )}
                    </div>

                    <div className="mb-3 flex flex-wrap items-center gap-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-foreground">
                          {experience.company}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{experience.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{experience.period}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {experience.type}
                      </Badge>
                    </div>

                    <CardDescription className="text-base leading-relaxed">
                      {experience.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Key Achievements */}
                    <div>
                      <h4 className="mb-3 flex items-center gap-2 font-semibold">
                        <Users className="h-4 w-4 text-primary" />
                        Key Achievements
                      </h4>
                      <div className="grid gap-2 md:grid-cols-2">
                        {experience.achievements.map((achievement, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 text-sm"
                          >
                            <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                            <span className="text-muted-foreground">
                              {achievement}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Technologies */}
                    <div>
                      <h4 className="mb-3 flex items-center gap-2 font-semibold">
                        <Code className="h-4 w-4 text-primary" />
                        Technologies Used
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {experience.technologies.map(tech => (
                          <Badge
                            key={tech}
                            variant="outline"
                            className="transition-colors hover:bg-primary/10"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-4">
          <div className="rounded-2xl border border-border/50 bg-card/30 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:shadow-medium">
            <div className="mb-2 text-3xl font-bold text-primary">10+</div>
            <div className="text-sm text-muted-foreground">
              Years Experience
            </div>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card/30 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:shadow-medium">
            <div className="mb-2 text-3xl font-bold text-primary">150+</div>
            <div className="text-sm text-muted-foreground">
              Projects Completed
            </div>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card/30 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:shadow-medium">
            <div className="mb-2 text-3xl font-bold text-primary">20+</div>
            <div className="text-sm text-muted-foreground">
              Technologies Mastered
            </div>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card/30 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:shadow-medium">
            <div className="mb-2 text-3xl font-bold text-primary">10K+</div>
            <div className="text-sm text-muted-foreground">Users Served</div>
          </div>
        </div>

        {/* Professional Footer */}
        <div className="mt-16 border-t border-border/20 pt-8 text-center">
          <div className="mb-4 flex justify-center">
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
