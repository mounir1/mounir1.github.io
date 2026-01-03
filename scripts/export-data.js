/**
 * Export All Firebase Data Script (Node.js compatible)
 * Downloads all data from Firestore collections and generates optimized JSON
 */

// Use ES modules for Firebase v9+
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Try to load dotenv if available
try {
  const dotenv = await import('dotenv');
  dotenv.config({ path: join(process.cwd(), '.env.local') });
  dotenv.config({ path: join(process.cwd(), '.env') });
} catch (e) {
  console.warn('dotenv not available, using process.env directly');
}

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const COLLECTIONS = [
  'projects',
  'skills',
  'experiences',
  'portfolio_config',
  'analytics',
  'adminUsers',
  'content',
];

async function exportAllData() {
  console.log('🔥 Initializing Firebase...');
  
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error('Firebase configuration is missing. Please check your .env file.');
  }

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log('📦 Starting data export...\n');

  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      version: '3.0.0',
      firebaseProjectId: firebaseConfig.projectId || '',
      collections: COLLECTIONS,
    },
    projects: [],
    skills: [],
    experiences: [],
    portfolioConfig: {},
    analytics: [],
    adminUsers: [],
    content: [],
    frontendData: {
      initialProjects: [],
      initialSkills: [],
    },
  };

  // Export each collection
  for (const collectionName of COLLECTIONS) {
    try {
      console.log(`📥 Exporting ${collectionName}...`);
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Convert Timestamps to ISO strings
      const sanitizedData = JSON.parse(
        JSON.stringify(data, (key, value) => {
          if (value && typeof value === 'object' && value.constructor?.name === 'Timestamp') {
            return value.toDate().toISOString();
          }
          return value;
        })
      );

      // Map to appropriate property
      switch (collectionName) {
        case 'projects':
          exportData.projects = sanitizedData;
          break;
        case 'skills':
          exportData.skills = sanitizedData;
          break;
        case 'experiences':
          exportData.experiences = sanitizedData;
          break;
        case 'portfolio_config':
          exportData.portfolioConfig = sanitizedData[0] || {};
          break;
        case 'analytics':
          exportData.analytics = sanitizedData;
          break;
        case 'adminUsers':
          exportData.adminUsers = sanitizedData;
          break;
        case 'content':
          exportData.content = sanitizedData;
          break;
      }

      console.log(`✅ Exported ${sanitizedData.length} documents from ${collectionName}`);
    } catch (error) {
      console.error(`❌ Error exporting ${collectionName}:`, error.message);
    }
  }

  // Load frontend data if available
  console.log('\n📂 Loading frontend data...');
  try {
    const projectsPath = join(process.cwd(), 'src/data/initial-projects.ts');
    const skillsPath = join(process.cwd(), 'src/data/initial-skills.ts');
    
    // Note: In a real scenario, you'd need to parse TypeScript files
    // For now, we'll just note that frontend data exists
    if (existsSync(projectsPath)) {
      console.log('✅ Found initial projects data');
    }
    if (existsSync(skillsPath)) {
      console.log('✅ Found initial skills data');
    }
  } catch (error) {
    console.warn('⚠️  Could not load some frontend data:', error.message);
  }

  return exportData;
}

async function main() {
  try {
    const data = await exportAllData();
    
    const outputPath = join(process.cwd(), 'portfolio-data-export.json');
    writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
    
    console.log('\n✨ Export complete!');
    console.log(`📄 Data saved to: ${outputPath}`);
    console.log(`\n📊 Summary:`);
    console.log(`   - Projects: ${data.projects.length}`);
    console.log(`   - Skills: ${data.skills.length}`);
    console.log(`   - Experiences: ${data.experiences.length}`);
    console.log(`   - Analytics: ${data.analytics.length}`);
    console.log(`   - Admin Users: ${data.adminUsers.length}`);
  } catch (error) {
    console.error('❌ Export failed:', error.message);
    process.exit(1);
  }
}

main();

