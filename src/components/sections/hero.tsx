import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, Download, Sparkles } from 'lucide-react';
import { trackButtonClick } from '@/utils/analytics';
import { motion } from 'framer-motion';

export const Hero = () => {
  const handleDownloadCV = () => {
    trackButtonClick('download_cv', {
      location: 'hero_section',
      button_type: 'download',
    });

    const link = document.createElement('a');
    link.href = '/Mounir_CV_2025.pdf';
    link.download = 'Mounir_Abderrahmani_CV_2025.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewWork = () => {
    trackButtonClick('view_work', {
      location: 'hero_section',
      button_type: 'cta',
    });

    document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden py-12 sm:py-20"
    >
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-gradient-to-r from-purple-400/15 to-pink-400/15 blur-3xl sm:h-96 sm:w-96"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-gradient-to-r from-blue-400/15 to-cyan-400/15 blur-3xl sm:h-96 sm:w-96"
          animate={{
            x: [0, -30, 0],
            y: [0, 20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
        <motion.div
          className="absolute left-1/2 top-3/4 h-48 w-48 rounded-full bg-gradient-to-r from-emerald-400/10 to-teal-400/10 blur-3xl sm:h-64 sm:w-64"
          animate={{
            x: [0, 20, -20, 0],
            y: [0, -30, 0],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'linear',
          }}
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
            className="relative mx-auto mb-6 h-28 w-28 sm:mb-8 sm:h-32 sm:w-32 md:h-40 md:w-40"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              duration: 1,
              delay: 0.3,
              type: 'spring',
              stiffness: 200,
              damping: 15,
            }}
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-50 blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="relative rounded-full bg-white p-1.5 shadow-2xl backdrop-blur-sm dark:bg-gray-900 sm:p-2"
              whileHover={{
                scale: 1.05,
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 10 }}
            >
              <img
                src="/profile.webp"
                alt="Mounir Abderrahmani"
                className="h-full w-full rounded-full object-cover"
              />
            </motion.div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            className="space-y-4 sm:space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="space-y-3 sm:space-y-4">
              <motion.h1
                className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                <motion.span
                  className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  style={{
                    backgroundSize: '200% 200%',
                  }}
                >
                  Mounir Abderrahmani
                </motion.span>
              </motion.h1>

              <motion.div
                className="flex items-center justify-center gap-1 text-lg font-medium text-muted-foreground sm:gap-2 sm:text-xl md:text-2xl lg:text-3xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                <Sparkles className="h-5 w-5 animate-pulse text-primary sm:h-6 sm:w-6" />
                Full-Stack Developer & Data Engineer
                <Sparkles className="h-5 w-5 animate-pulse text-primary sm:h-6 sm:w-6" />
              </motion.div>
            </div>
          </motion.div>

          <p className="mx-auto max-w-2xl px-4 text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
            Transforming complex business challenges into elegant digital
            solutions. Specialized in{' '}
            <span className="font-semibold text-primary">
              React, Node.js, and enterprise integrations
            </span>
            with a proven track record of delivering
            <span className="font-semibold text-primary">
              {' '}
              scalable systems
            </span>{' '}
            that drive measurable business growth.
          </p>

          <div className="flex flex-col justify-center gap-3 pt-4 sm:flex-row sm:gap-4 lg:justify-start">
            <Button
              size="lg"
              className="px-6 py-3 text-base shadow-glow transition-all duration-300 hover:scale-105 hover:shadow-large sm:px-10 sm:py-4 sm:text-lg"
              onClick={handleViewWork}
            >
              <span>View My Work</span>
              <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-6 py-3 text-base transition-all duration-300 hover:scale-105 hover:bg-primary/5 sm:px-10 sm:py-4 sm:text-lg"
              onClick={handleDownloadCV}
            >
              <Download className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span>Download CV</span>
            </Button>
          </div>

          <motion.div
            className="flex flex-wrap items-center justify-center gap-4 pt-6 sm:gap-6 sm:pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 }}
          >
            <motion.div
              className="group text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300, damping: 10 }}
            >
              <div className="text-xl font-bold text-primary sm:text-2xl">
                10+
              </div>
              <div className="text-xs text-muted-foreground sm:text-sm">
                Years Experience
              </div>
            </motion.div>
            <div className="hidden h-8 w-px bg-border sm:block sm:h-12"></div>
            <motion.div
              className="group text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300, damping: 10 }}
            >
              <div className="text-xl font-bold text-primary sm:text-2xl">
                150+
              </div>
              <div className="text-xs text-muted-foreground sm:text-sm">
                Projects Completed
              </div>
            </motion.div>
            <div className="hidden h-8 w-px bg-border sm:block sm:h-12"></div>
            <motion.div
              className="group text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300, damping: 10 }}
            >
              <div className="text-xl font-bold text-primary sm:text-2xl">
                99%
              </div>
              <div className="text-xs text-muted-foreground sm:text-sm">
                Client Satisfaction
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
