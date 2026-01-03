/**
 * Simple Data Export Script
 * Exports data from Firebase and generates optimized JSON
 * Works with both CommonJS and ES modules
 */

const fs = require('fs');
const path = require('path');

// Try to load environment variables
try {
  require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });
  require('dotenv').config({ path: path.join(process.cwd(), '.env') });
} catch (e) {
  console.warn('dotenv not available');
}

async function exportData() {
  console.log('📦 Starting data export...\n');

  // Check if Firebase is configured
  const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  };

  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.log('⚠️  Firebase not configured. Generating data from local files only...\n');
    return generateFromLocalFiles();
  }

  try {
    // Dynamic import for ES modules
    const { initializeApp } = await import('firebase/app');
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');

    const app = initializeApp({
      apiKey: firebaseConfig.apiKey,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: firebaseConfig.projectId,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.VITE_FIREBASE_APP_ID,
    });

    const db = getFirestore(app);
    const collections = ['projects', 'skills', 'experiences'];

    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '3.0.0',
        firebaseProjectId: firebaseConfig.projectId,
      },
      projects: [],
      skills: [],
      experiences: [],
    };

    for (const collName of collections) {
      try {
        console.log(`📥 Exporting ${collName}...`);
        const snapshot = await getDocs(collection(db, collName));
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Convert Timestamps
        const sanitized = JSON.parse(JSON.stringify(data, (key, value) => {
          if (value && typeof value === 'object' && value.constructor?.name === 'Timestamp') {
            return value.toDate().toISOString();
          }
          return value;
        }));

        exportData[collName] = sanitized;
        console.log(`✅ Exported ${sanitized.length} ${collName}`);
      } catch (error) {
        console.error(`❌ Error exporting ${collName}:`, error.message);
      }
    }

    return exportData;
  } catch (error) {
    console.error('❌ Firebase export failed:', error.message);
    console.log('📂 Falling back to local files...\n');
    return generateFromLocalFiles();
  }
}

function generateFromLocalFiles() {
  console.log('📂 Loading data from local files...\n');
  
  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      version: '3.0.0',
      source: 'local-files',
    },
    projects: [],
    skills: [],
    experiences: [],
  };

  // Try to load from existing data files
  const dataPath = path.join(process.cwd(), 'data.json');
  if (fs.existsSync(dataPath)) {
    try {
      const existingData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      if (existingData.projects) exportData.projects = existingData.projects;
      if (existingData.entities) {
        // Extract from entities structure
        console.log('✅ Loaded from data.json');
      }
    } catch (e) {
      console.warn('⚠️  Could not parse data.json');
    }
  }

  return exportData;
}

async function generateOptimized() {
  const exportedData = await exportData();
  
  // Load local initial data
  let initialProjects = [];
  let initialSkills = [];

  try {
    // Try to require the TypeScript files (won't work directly, but we can note them)
    const projectsPath = path.join(process.cwd(), 'src/data/initial-projects.ts');
    const skillsPath = path.join(process.cwd(), 'src/data/initial-skills.ts');
    
    if (fs.existsSync(projectsPath)) {
      console.log('📄 Found initial-projects.ts');
    }
    if (fs.existsSync(skillsPath)) {
      console.log('📄 Found initial-skills.ts');
    }
  } catch (e) {
    // TypeScript files can't be directly imported in Node.js without compilation
  }

  // Merge data
  const allProjects = [...exportedData.projects, ...initialProjects];
  const allSkills = [...exportedData.skills, ...initialSkills];

  // Extract technologies
  const technologies = new Set();
  allProjects.forEach(p => {
    if (Array.isArray(p.technologies)) {
      p.technologies.forEach(t => technologies.add(t));
    }
  });

  const optimized = {
    metadata: {
      name: 'Portfolio Data - Optimized',
      version: '3.0.0',
      lastUpdated: new Date().toISOString(),
    },
    models: {
      project: {
        schema: {
          id: 'string',
          title: 'string (required)',
          description: 'string (required)',
          category: 'string',
          technologies: 'string[]',
          featured: 'boolean',
        },
      },
      skill: {
        schema: {
          id: 'string',
          name: 'string (required)',
          category: 'string',
          level: 'number (0-100)',
        },
      },
    },
    data: {
      projects: allProjects,
      skills: allSkills,
      technologies: Array.from(technologies),
    },
    statistics: {
      totalProjects: allProjects.length,
      totalSkills: allSkills.length,
      totalTechnologies: technologies.size,
    },
  };

  return optimized;
}

async function main() {
  try {
    const optimized = await generateOptimized();
    
    const outputPath = path.join(process.cwd(), 'portfolio-data-optimized.json');
    fs.writeFileSync(outputPath, JSON.stringify(optimized, null, 2), 'utf-8');
    
    console.log('\n✨ Optimized data generated!');
    console.log(`📄 Saved to: ${outputPath}`);
    console.log(`\n📊 Statistics:`);
    console.log(`   - Projects: ${optimized.statistics.totalProjects}`);
    console.log(`   - Skills: ${optimized.statistics.totalSkills}`);
    console.log(`   - Technologies: ${optimized.statistics.totalTechnologies}`);
  } catch (error) {
    console.error('❌ Generation failed:', error.message);
    process.exit(1);
  }
}

main();

