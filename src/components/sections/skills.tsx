import React, { useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSkillIcon } from '@/lib/skill-icons';
import { Code, Server, Cloud, Database, Globe, Layers } from 'lucide-react';
import { useInView, motion, useAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';

/* ───────── Animated progress bar ───────── */
const SkillBar = ({ name, level, index = 0 }: { name: string; level: number; index?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const isInView = useInView(ref, { once: true, margin: '-60px 0px -60px 0px' });

  useEffect(() => {
    if (isInView)
      controls.start({
        width: `${level}%`,
        opacity: 1,
        transition: { duration: 1.3, delay: (index * 90) / 1000, ease: [0.23, 1, 0.32, 1] },
      });
  }, [isInView, level, controls, index]);

  return (
    <motion.div
      ref={ref}
      className="space-y-2"
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: (index * 50) / 1000 }}
    >
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-medium text-foreground">
          <motion.span
            className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10"
            whileHover={{ scale: 1.15, rotate: 6 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            {getSkillIcon(name)}
          </motion.span>
          {name}
        </span>
        <motion.span
          className="rounded-full bg-muted/60 px-2 py-0.5 text-xs font-semibold text-muted-foreground"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ duration: 0.3, delay: (index * 80) / 1000 }}
        >
          {level}%
        </motion.span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-muted/40">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-primary/70"
          initial={{ width: '0%', opacity: 0.8 }}
          animate={controls}
          style={{ boxShadow: '0 0 8px hsl(var(--primary)/0.4)' }}
        />
      </div>
    </motion.div>
  );
};

/* ───────── Skills section ───────── */
export const Skills = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px 0px -80px 0px' });

  const skillCategories = [
    {
      icon: Code,
      title: 'Frontend Development',
      color: 'from-blue-500/10 to-cyan-500/10',
      skills: [
        { name: 'React / Next.js', level: 95 },
        { name: 'TypeScript', level: 90 },
        { name: 'JavaScript ES6+', level: 95 },
        { name: 'HTML5 / CSS3', level: 90 },
        { name: 'Tailwind CSS', level: 88 },
      ],
    },
    {
      icon: Server,
      title: 'Backend Development',
      color: 'from-green-500/10 to-emerald-500/10',
      skills: [
        { name: 'Node.js', level: 88 },
        { name: 'PHP / Laravel', level: 82 },
        { name: 'Python', level: 76 },
        { name: 'RESTful APIs', level: 92 },
        { name: 'GraphQL', level: 72 },
      ],
    },
    {
      icon: Cloud,
      title: 'Cloud & DevOps',
      color: 'from-purple-500/10 to-violet-500/10',
      skills: [
        { name: 'AWS', level: 80 },
        { name: 'Docker', level: 78 },
        { name: 'GitLab CI/CD', level: 85 },
        { name: 'Git', level: 92 },
        { name: 'Terraform', level: 70 },
      ],
    },
    {
      icon: Database,
      title: 'Data & Integration',
      color: 'from-orange-500/10 to-amber-500/10',
      skills: [
        { name: 'ETL Pipelines', level: 87 },
        { name: 'ERP / CRM Systems', level: 85 },
        { name: 'MongoDB', level: 82 },
        { name: 'PostgreSQL', level: 80 },
        { name: 'Firebase', level: 88 },
      ],
    },
  ];

  const languages = [
    { name: 'Amazigh', level: 'Native',       flag: '🔶' },
    { name: 'Arabic',  level: 'Native',       flag: '🇩🇿' },
    { name: 'English', level: 'Fluent',       flag: '🇺🇸' },
    { name: 'French',  level: 'Fluent',       flag: '🇫🇷' },
    { name: 'Turkish', level: 'Proficient',   flag: '🇹🇷' },
    { name: 'Russian', level: 'Intermediate', flag: '🇷🇺' },
  ];

  const technologies = [
    'React','Node.js','TypeScript','AWS','Docker','Magento 2',
    'ExtJS','Angular','Next.js','Python','PHP','MongoDB',
    'PostgreSQL','GitLab CI/CD','JIRA','Cegid ERP',
    'Tailwind CSS','REST APIs','Terraform','Kubernetes',
  ];

  return (
    <section
      ref={sectionRef}
      id="skills"
      className={cn(
        'relative scroll-mt-20 px-4 py-20 sm:px-6 md:py-28',
        'bg-gradient-to-br from-background via-background to-muted/20'
      )}
    >
      <div className="mx-auto max-w-6xl space-y-16">

        {/* Section header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-4xl font-bold text-transparent md:text-5xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Technical <span className="text-primary">Expertise</span>
          </motion.h2>
          <motion.p
            className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground"
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            A comprehensive toolkit built through years of hands-on experience and continuous learning
          </motion.p>
        </motion.div>

        {/* Core skill cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {skillCategories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="group h-full border border-border/30 bg-card/80 backdrop-blur-sm transition-all duration-500 hover:scale-[1.015] hover:shadow-xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className={cn(
                          'rounded-xl bg-gradient-to-br p-3 shadow-sm transition-all duration-300',
                          cat.color,
                          'group-hover:scale-110'
                        )}
                        whileHover={{ rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                      >
                        <Icon className="h-5 w-5 text-primary" />
                      </motion.div>
                      <CardTitle className="text-lg font-bold">{cat.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cat.skills.map((skill, si) => (
                      <SkillBar key={skill.name} name={skill.name} level={skill.level} index={si} />
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
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-0 bg-card/50 shadow-sm backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2.5">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold">Languages</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {languages.map((lang, i) => (
                  <motion.div
                    key={lang.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.3, delay: 0.25 + i * 0.05 }}
                    whileHover={{ y: -5, scale: 1.04 }}
                    className="group rounded-xl bg-muted/20 p-4 text-center transition-colors duration-300 hover:bg-muted/40"
                  >
                    <div className="mb-2 text-2xl transition-transform duration-300 group-hover:scale-110">
                      {lang.flag}
                    </div>
                    <div className="text-sm font-semibold">{lang.name}</div>
                    <div className="text-xs text-muted-foreground">{lang.level}</div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tech badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <Card className="border-0 bg-card/50 shadow-sm backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2.5">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold">Technologies &amp; Tools</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {technologies.map((tech, i) => (
                  <motion.div
                    key={tech}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.2, delay: 0.3 + i * 0.018 }}
                    whileHover={{ scale: 1.08 }}
                  >
                    <Badge
                      variant="outline"
                      className="flex cursor-default items-center gap-1.5 px-3 py-1.5 text-xs transition-all duration-300 hover:border-primary/40 hover:bg-primary/10 sm:text-sm"
                    >
                      <span className="flex h-3.5 w-3.5 items-center justify-center">
                        {getSkillIcon(tech)}
                      </span>
                      {tech}
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
