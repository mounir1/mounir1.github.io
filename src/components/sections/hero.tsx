import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, Download, Sparkles } from 'lucide-react';
import { trackButtonClick } from '@/utils/analytics';
import { motion } from 'framer-motion';

export const Hero = () => {
  const handleDownloadCV = () => {
    trackButtonClick('download_cv', { location: 'hero_section', button_type: 'download' });
    const link = document.createElement('a');
    link.href = '/Mounir_CV_2025.pdf';
    link.download = 'Mounir_Abderrahmani_CV_2025.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewWork = () => {
    trackButtonClick('view_work', { location: 'hero_section', button_type: 'cta' });
    document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden py-12 sm:py-20"
    >
      {/* Animated blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-gradient-to-r from-purple-400/20 to-pink-400/20 blur-3xl sm:h-96 sm:w-96"
          animate={{ x: [0, 40, 0], y: [0, -25, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-gradient-to-r from-blue-400/20 to-cyan-400/20 blur-3xl sm:h-96 sm:w-96"
          animate={{ x: [0, -35, 0], y: [0, 25, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute left-1/2 top-3/4 h-56 w-56 rounded-full bg-gradient-to-r from-emerald-400/15 to-teal-400/15 blur-3xl sm:h-72 sm:w-72"
          animate={{ x: [0, 25, -25, 0], y: [0, -35, 0], rotate: [0, 360] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          className="mx-auto max-w-4xl space-y-6 text-center sm:space-y-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Profile Image */}
          <motion.div
            className="relative mx-auto h-28 w-28 sm:h-36 sm:w-36 md:h-44 md:w-44"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-50 blur-xl"
              animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.85, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="relative rounded-full bg-white p-1.5 shadow-2xl backdrop-blur-sm dark:bg-gray-900 sm:p-2"
              whileHover={{ scale: 1.06 }}
              transition={{ type: 'spring', stiffness: 300, damping: 12 }}
            >
              <img
                src="/profile.webp"
                alt="Mounir Abderrahmani – Full-Stack Developer"
                className="h-full w-full rounded-full object-cover"
                loading="eager"
              />
            </motion.div>
          </motion.div>

          {/* Name & title */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <motion.h1
              className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-7xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent"
                style={{ backgroundSize: '200% 200%' }}>
                Mounir Abderrahmani
              </span>
            </motion.h1>

            <motion.div
              className="flex items-center justify-center gap-2 text-lg font-medium text-muted-foreground sm:text-xl md:text-2xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <Sparkles className="h-5 w-5 animate-pulse text-primary" />
              Full-Stack Developer &amp; Data Engineer
              <Sparkles className="h-5 w-5 animate-pulse text-primary" />
            </motion.div>
          </motion.div>

          <motion.p
            className="mx-auto max-w-2xl px-4 text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.1 }}
          >
            Transforming complex business challenges into elegant digital solutions. Specialised in{' '}
            <span className="font-semibold text-primary">React, Node.js, and enterprise integrations</span>{' '}
            with a proven track record of delivering{' '}
            <span className="font-semibold text-primary">scalable systems</span>{' '}
            that drive measurable business growth.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row sm:gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <Button
              size="lg"
              className="w-full max-w-xs px-8 py-3 text-base shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl sm:w-auto sm:px-10 sm:text-lg"
              onClick={handleViewWork}
            >
              View My Work
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full max-w-xs px-8 py-3 text-base transition-all duration-300 hover:scale-105 hover:bg-primary/5 sm:w-auto sm:px-10 sm:text-lg"
              onClick={handleDownloadCV}
            >
              <Download className="mr-2 h-5 w-5" />
              Download CV
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-6 pt-4 sm:gap-10 sm:pt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          >
            {[
              { value: '10+', label: 'Years Experience' },
              { value: '150+', label: 'Projects Delivered' },
              { value: '99%', label: 'Client Satisfaction' },
            ].map((stat, i) => (
              <React.Fragment key={stat.label}>
                {i > 0 && <div className="hidden h-10 w-px bg-border sm:block" />}
                <motion.div
                  className="text-center"
                  whileHover={{ scale: 1.08 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 12 }}
                >
                  <div className="text-2xl font-bold text-primary sm:text-3xl">{stat.value}</div>
                  <div className="text-xs text-muted-foreground sm:text-sm">{stat.label}</div>
                </motion.div>
              </React.Fragment>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
