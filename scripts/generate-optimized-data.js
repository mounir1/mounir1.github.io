/**
 * Generate Optimized Portfolio Data (Node.js ESM compatible)
 * Creates a comprehensive, optimized JSON file with all portfolio data
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// Try to load initial data
let initialProjects = [];
let initialSkills = [];

try {
  // Try to read from existing JSON if available
  const projectsPath = join(process.cwd(), 'portfolio-data-export.json');
  if (existsSync(projectsPath)) {
    const exportData = JSON.parse(readFileSync(projectsPath, 'utf-8'));
    initialProjects = exportData.projects || [];
    initialSkills = exportData.skills || [];
  }
} catch (error) {
  console.warn('⚠️  Could not load export data:', error.message);
}

function generateOptimizedData() {
  console.log('🔄 Generating optimized portfolio data...\n');

  // Load existing data if available
  let firebaseData = {};
  try {
    const exportPath = join(process.cwd(), 'portfolio-data-export.json');
    if (existsSync(exportPath)) {
      const exportContent = readFileSync(exportPath, 'utf-8');
      firebaseData = JSON.parse(exportContent);
      console.log('✅ Loaded Firebase export data');
    }
  } catch (error) {
    console.log('⚠️  No Firebase export found, using available data only');
  }

  // Merge Firebase data with initial data
  const allProjects = [
    ...(firebaseData.projects || []),
    ...initialProjects,
  ].filter((project, index, self) => 
    index === self.findIndex(p => p.title === project.title)
  );

  const allSkills = [
    ...(firebaseData.skills || []),
    ...initialSkills,
  ].filter((skill, index, self) => 
    index === self.findIndex(s => s.name === skill.name)
  );

  // Extract unique technologies
  const allTechnologies = new Set();
  allProjects.forEach(project => {
    if (Array.isArray(project.technologies)) {
      project.technologies.forEach(tech => allTechnologies.add(tech));
    }
  });

  // Extract categories
  const projectCategories = new Set();
  allProjects.forEach(project => {
    if (project.category) projectCategories.add(project.category);
  });

  const skillCategories = new Set();
  allSkills.forEach(skill => {
    if (skill.category) skillCategories.add(skill.category);
  });

  // Build relationships
  const projectTechnologies = [];
  allProjects.forEach(project => {
    if (project.id && Array.isArray(project.technologies)) {
      projectTechnologies.push({
        projectId: project.id,
        technologies: project.technologies,
      });
    }
  });

  const skillProjects = [];
  allSkills.forEach(skill => {
    if (skill.id && Array.isArray(skill.projects)) {
      skillProjects.push({
        skillId: skill.id,
        projects: skill.projects,
      });
    }
  });

  // Generate optimized data structure
  const optimizedData = {
    metadata: {
      name: 'Portfolio Data - Optimized',
      version: '3.0.0',
      lastUpdated: new Date().toISOString(),
      description: 'Comprehensive portfolio data with optimized structure, models, and relationships',
      generatedBy: 'generate-optimized-data.js',
    },
    models: {
      project: {
        schema: {
          id: 'string (optional)',
          title: 'string (required)',
          description: 'string (required)',
          longDescription: 'string (optional)',
          category: 'string (required)',
          status: 'string (completed|in-progress|maintenance|archived)',
          priority: 'number (0-100)',
          technologies: 'string[] (required)',
          role: 'string',
          achievements: 'string[]',
          challenges: 'string[]',
          solutions: 'string[]',
          tags: 'string[]',
          image: 'string (url)',
          logo: 'string (url)',
          icon: 'string',
          images: 'string[]',
          liveUrl: 'string (url)',
          githubUrl: 'string (url)',
          demoUrl: 'string (url)',
          caseStudyUrl: 'string (url)',
          startDate: 'string',
          endDate: 'string',
          duration: 'string',
          teamSize: 'number',
          featured: 'boolean',
          disabled: 'boolean',
          visibility: 'string (public|private|draft)',
          clientInfo: 'object (optional)',
          metrics: 'object (optional)',
          createdAt: 'number|string',
          updatedAt: 'number|string',
          version: 'number',
        },
        examples: allProjects.slice(0, 3),
      },
      skill: {
        schema: {
          id: 'string (optional)',
          name: 'string (required)',
          category: 'string (required)',
          level: 'number (0-100)',
          description: 'string (optional)',
          icon: 'string',
          color: 'string',
          featured: 'boolean',
          yearsOfExperience: 'number',
          certifications: 'string[]',
          projects: 'string[]',
          createdAt: 'number|string',
          updatedAt: 'number|string',
        },
        examples: allSkills.slice(0, 3),
      },
      experience: {
        schema: {
          id: 'string (optional)',
          company: 'string (required)',
          position: 'string (required)',
          description: 'string (required)',
          startDate: 'string (required)',
          endDate: 'string (optional)',
          location: 'string',
          technologies: 'string[]',
          achievements: 'string[]',
          industry: 'string',
          featured: 'boolean',
          createdAt: 'number|string',
          updatedAt: 'number|string',
        },
        examples: firebaseData.experiences?.slice(0, 3) || [],
      },
    },
    data: {
      projects: allProjects,
      skills: allSkills,
      experiences: firebaseData.experiences || [],
      companies: firebaseData.entities?.companies || [],
      technologies: Array.from(allTechnologies).map(tech => ({
        id: tech.toLowerCase().replace(/\s+/g, '-'),
        name: tech,
        category: 'Technology',
      })),
      modules: firebaseData.entities?.modules || [],
      integrations: firebaseData.integrations || [],
    },
    statistics: {
      totalProjects: allProjects.length,
      totalSkills: allSkills.length,
      featuredProjects: allProjects.filter(p => p.featured).length,
      featuredSkills: allSkills.filter(s => s.featured).length,
      categories: {
        projects: Array.from(projectCategories),
        skills: Array.from(skillCategories),
      },
      technologies: Array.from(allTechnologies),
    },
    relationships: {
      projectTechnologies,
      skillProjects,
    },
  };

  return optimizedData;
}

function main() {
  try {
    const data = generateOptimizedData();
    
    const outputPath = join(process.cwd(), 'portfolio-data-optimized.json');
    writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
    
    console.log('\n✨ Optimized data generated!');
    console.log(`📄 Saved to: ${outputPath}`);
    console.log(`\n📊 Statistics:`);
    console.log(`   - Projects: ${data.statistics.totalProjects}`);
    console.log(`   - Skills: ${data.statistics.totalSkills}`);
    console.log(`   - Featured Projects: ${data.statistics.featuredProjects}`);
    console.log(`   - Featured Skills: ${data.statistics.featuredSkills}`);
    console.log(`   - Technologies: ${data.statistics.technologies.length}`);
    console.log(`   - Project Categories: ${data.statistics.categories.projects.length}`);
    console.log(`   - Skill Categories: ${data.statistics.categories.skills.length}`);
  } catch (error) {
    console.error('❌ Generation failed:', error.message);
    process.exit(1);
  }
}

main();

