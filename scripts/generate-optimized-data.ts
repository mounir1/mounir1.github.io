/**
 * Generate Optimized Portfolio Data
 * Creates a comprehensive, optimized JSON file with all portfolio data
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { initialProjects } from '../src/data/initial-projects';
import { initialSkills } from '../src/data/initial-skills';

interface OptimizedPortfolioData {
  metadata: {
    name: string;
    version: string;
    lastUpdated: string;
    description: string;
    generatedBy: string;
  };
  models: {
    project: {
      schema: any;
      examples: any[];
    };
    skill: {
      schema: any;
      examples: any[];
    };
    experience: {
      schema: any;
      examples: any[];
    };
  };
  data: {
    projects: any[];
    skills: any[];
    experiences: any[];
    companies: any[];
    technologies: any[];
    modules: any[];
    integrations: any[];
  };
  statistics: {
    totalProjects: number;
    totalSkills: number;
    featuredProjects: number;
    featuredSkills: number;
    categories: {
      projects: string[];
      skills: string[];
    };
    technologies: string[];
  };
  relationships: {
    projectTechnologies: Array<{ projectId: string; technologies: string[] }>;
    skillProjects: Array<{ skillId: string; projects: string[] }>;
  };
}

function generateOptimizedData(): OptimizedPortfolioData {
  console.log('🔄 Generating optimized portfolio data...\n');

  // Load existing data if available
  let firebaseData: any = {};
  try {
    const exportPath = join(process.cwd(), 'portfolio-data-export.json');
    const exportContent = readFileSync(exportPath, 'utf-8');
    firebaseData = JSON.parse(exportContent);
    console.log('✅ Loaded Firebase export data');
  } catch (error) {
    console.log('⚠️  No Firebase export found, using initial data only');
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
  const allTechnologies = new Set<string>();
  allProjects.forEach(project => {
    if (Array.isArray(project.technologies)) {
      project.technologies.forEach(tech => allTechnologies.add(tech));
    }
  });

  // Extract categories
  const projectCategories = new Set<string>();
  allProjects.forEach(project => {
    if (project.category) projectCategories.add(project.category);
  });

  const skillCategories = new Set<string>();
  allSkills.forEach(skill => {
    if (skill.category) skillCategories.add(skill.category);
  });

  // Build relationships
  const projectTechnologies: Array<{ projectId: string; technologies: string[] }> = [];
  allProjects.forEach(project => {
    if (project.id && Array.isArray(project.technologies)) {
      projectTechnologies.push({
        projectId: project.id,
        technologies: project.technologies,
      });
    }
  });

  const skillProjects: Array<{ skillId: string; projects: string[] }> = [];
  allSkills.forEach(skill => {
    if (skill.id && Array.isArray(skill.projects)) {
      skillProjects.push({
        skillId: skill.id,
        projects: skill.projects,
      });
    }
  });

  // Generate optimized data structure
  const optimizedData: OptimizedPortfolioData = {
    metadata: {
      name: 'Portfolio Data - Optimized',
      version: '3.0.0',
      lastUpdated: new Date().toISOString(),
      description: 'Comprehensive portfolio data with optimized structure, models, and relationships',
      generatedBy: 'generate-optimized-data.ts',
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
    console.error('❌ Generation failed:', error);
    process.exit(1);
  }
}

main();

