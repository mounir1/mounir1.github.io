import React, { useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getSkillIcon } from '@/lib/skill-icons';
import { Code, Server, Cloud, Database, Globe, Users } from 'lucide-react';
import { useInView, motion, useAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';

const SkillProgress = ({
  name,
  level,
  index = 0,
}: {
  name: string;
  level: number;
  index?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const isInView = useInView(ref, {
    once: true,
    margin: '-80px 0px -80px 0px',
  });

  useEffect(() => {
    if (isInView) {
      const delay = index * 100; // Stagger animations
      controls.start({
        width: `${level}%`,
        opacity: 1,
        transition: {
          duration: 1.2,
          delay: delay / 1000,
          ease: [0.23, 1, 0.32, 1], // Custom easing for smoother animation
        },
      });
    }
  }, [isInView, level, controls, index]);

  return (
    <motion.div
      ref={ref}
      className="space-y-2 sm:space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: (index * 50) / 1000 }}
    >
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 sm:gap-3">
          <motion.div
            className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 p-1 sm:h-6 sm:w-6"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            {getSkillIcon(name)}
          </motion.div>
          <span className="text-sm font-medium text-foreground sm:text-base">
            {name}
          </span>
        </div>
        <motion.span
          className="rounded-full bg-secondary/30 px-1.5 py-0.5 text-xs font-semibold text-muted-foreground sm:px-2 sm:py-1"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ duration: 0.3, delay: (index * 80) / 1000 }}
        >
          {level}%
        </motion.span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-secondary/30 sm:h-2.5">
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-primary to-primary/80 shadow-sm"
          initial={{ width: '0%', opacity: 0.7 }}
          animate={controls}
          style={{
            boxShadow: '0 0 10px hsla(var(--primary), 0.3)',
          }}
        />
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-white/20 to-transparent"
          initial={{ width: '0%' }}
          animate={isInView ? { width: `${level}%` } : {}}
          transition={{
            duration: 1.2,
            delay: (index * 100) / 1000 + 0.2,
            ease: [0.23, 1, 0.32, 1],
          }}
        />
      </div>
    </motion.div>
  );
};

export const Skills = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, {
    once: true,
    margin: '-100px 0px -100px 0px',
  });

  useEffect(() => {
    if (isInView && sectionRef.current) {
      sectionRef.current.style.scrollMarginTop = '80px';
    }
  }, [isInView]);

  const skillCategories = [
    {
      icon: Code,
      title: 'Frontend Development',
      skills: [
        { name: 'React/Next.js', level: 95 },
        { name: 'TypeScript', level: 90 },
        { name: 'JavaScript ES6+', level: 95 },
        { name: 'HTML5/CSS3', level: 90 },
        { name: 'Tailwind CSS', level: 85 },
      ],
    },
    {
      icon: Server,
      title: 'Backend Development',
      skills: [
        { name: 'Node.js', level: 85 },
        { name: 'PHP', level: 80 },
        { name: 'Python', level: 75 },
        { name: 'Java', level: 70 },
        { name: 'RESTful APIs', level: 90 },
      ],
    },
    {
      icon: Cloud,
      title: 'Cloud & DevOps',
      skills: [
        { name: 'AWS', level: 80 },
        { name: 'Docker', level: 75 },
        { name: 'GitLab CI/CD', level: 85 },
        { name: 'Git', level: 90 },
        { name: 'Terraform', level: 70 },
      ],
    },
    {
      icon: Database,
      title: 'Data & Integration',
      skills: [
        { name: 'API Development', level: 90 },
        { name: 'ETL Pipelines', level: 85 },
        { name: 'Machine Learning', level: 70 },
        { name: 'ERP/CRM Systems', level: 85 },
        { name: 'MongoDB', level: 80 },
      ],
    },
  ];

  const languages = [
    { name: 'Amazigh', level: 'Native', flag: '🔶' },
    { name: 'Arabic', level: 'Native', flag: '🇩🇿' },
    { name: 'English', level: 'Fluent', flag: '🇺🇸' },
    { name: 'French', level: 'Fluent', flag: '🇫🇷' },
    { name: 'Turkish', level: 'Proficient', flag: '🇹🇷' },
    { name: 'Russian', level: 'Intermediate', flag: '🇷🇺' },
  ];

  const technologies = [
    'React',
    'Node.js',
    'TypeScript',
    'AWS',
    'Docker',
    'Magento 2',
    'ExtJS',
    'Angular',
    'Next.js',
    'Python',
    'PHP',
    'MongoDB',
    'PostgreSQL',
    'GitLab CI/CD',
    'JIRA',
    'Cegid ERP',
    'Tailwind CSS',
    'REST APIs',
    'Terraform',
    'Kubernetes',
  ];

  return (
    <section
      ref={sectionRef}
      id="skills"
      className={cn(
        'relative scroll-mt-20 px-4 py-16 sm:px-6 md:py-24',
        'bg-gradient-to-br from-background via-background to-muted/20'
      )}
    >
      <div className="mx-auto max-w-6xl space-y-12 md:space-y-20">
        <motion.div
          className="mb-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.h2
            className="mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-4xl font-bold text-transparent md:text-5xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Technical <span className="text-primary">Expertise</span>
          </motion.h2>
          <motion.p
            className="mx-auto max-w-2xl text-xl leading-relaxed text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            A comprehensive toolkit built through years of hands-on experience
            and continuous learning
          </motion.p>
          <motion.div
            className="absolute left-1/2 top-0 h-1 w-32 -translate-x-1/2 transform rounded-full bg-gradient-to-r from-primary/0 via-primary to-primary/0"
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1, delay: 0.6 }}
          />
        </motion.div>

        {/* Core Skills */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {skillCategories.map((category, index) => {
            const Icon = category.icon;
            const delay = index * 100;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: delay / 1000 }}
              >
                <Card className="modern-card group h-full border border-border/20 bg-card/80 backdrop-blur-md transition-all duration-500 hover:scale-[1.02] hover:shadow-glow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <motion.div
                        className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-3 shadow-sm transition-all duration-300 group-hover:from-primary/20 group-hover:to-primary/10"
                        whileHover={{ scale: 1.05, rotate: 3 }}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 10,
                        }}
                      >
                        <Icon className="h-5 w-5 text-primary drop-shadow-sm" />
                      </motion.div>
                      <CardTitle className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-lg font-bold text-transparent">
                        {category.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {category.skills.map((skill, skillIndex) => (
                      <SkillProgress
                        key={skillIndex}
                        name={skill.name}
                        level={skill.level}
                        index={skillIndex}
                      />
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Languages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-0 bg-card/50 shadow-sm backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-primary/10 p-2.5">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold">Languages</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {languages.map((lang, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                    className="group rounded-xl bg-muted/20 p-4 text-center transition-all duration-300 hover:bg-muted/40"
                    whileHover={{ y: -5, scale: 1.03 }}
                  >
                    <div className="mb-2 text-2xl transition-transform duration-300 group-hover:scale-110">
                      {lang.flag}
                    </div>
                    <div className="text-sm font-medium">{lang.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {lang.level}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Technologies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border-0 bg-card/50 shadow-sm backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-primary/10 p-2.5">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold">
                  Technologies & Tools
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {technologies.map((tech, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.2, delay: 0.3 + index * 0.02 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs shadow-sm transition-all duration-300 hover:border-primary/30 hover:bg-primary/10 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
                    >
                      <div className="flex h-3.5 w-3.5 items-center justify-center sm:h-4 sm:w-4">
                        {getSkillIcon(tech)}
                      </div>
                      <span>{tech}</span>
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};
