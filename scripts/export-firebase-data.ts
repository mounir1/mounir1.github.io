/**
 * Export All Firebase Data Script
 * Downloads all data from Firestore collections and generates optimized JSON
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { writeFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: join(process.cwd(), '.env.local') });
dotenv.config({ path: join(process.cwd(), '.env') });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Collections to export
const COLLECTIONS = [
  'projects',
  'skills',
  'experiences',
  'portfolio_config',
  'analytics',
  'adminUsers',
  'content',
];

interface ExportData {
  metadata: {
    exportDate: string;
    version: string;
    firebaseProjectId: string;
    collections: string[];
  };
  projects: any[];
  skills: any[];
  experiences: any[];
  portfolioConfig: any;
  analytics: any[];
  adminUsers: any[];
  content: any[];
  frontendData: {
    initialProjects: any[];
    initialSkills: any[];
    caseStudies: any[];
    pimExpertise: any[];
  };
}

async function exportAllData(): Promise<ExportData> {
  console.log('🔥 Initializing Firebase...');
  
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error('Firebase configuration is missing. Please check your .env file.');
  }

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log('📦 Starting data export...\n');

  const exportData: ExportData = {
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
      caseStudies: [],
      pimExpertise: [],
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
      console.error(`❌ Error exporting ${collectionName}:`, error);
    }
  }

  // Load frontend data
  console.log('\n📂 Loading frontend data...');
  try {
    const { initialProjects } = await import('../src/data/initial-projects.ts');
    const { initialSkills } = await import('../src/data/initial-skills.ts');
    const { caseStudies } = await import('../src/data/case-studies.ts');
    const { pimExpertiseData } = await import('../src/data/pim-expertise.ts');

    exportData.frontendData.initialProjects = initialProjects as any[];
    exportData.frontendData.initialSkills = initialSkills as any[];
    exportData.frontendData.caseStudies = caseStudies as any[];
    exportData.frontendData.pimExpertise = pimExpertiseData as any[];

    console.log('✅ Loaded frontend data');
  } catch (error) {
    console.warn('⚠️  Could not load some frontend data:', error);
  }

  return exportData;
}

async function main() {
  try {
    const data = await exportAllData();
    
    // Generate optimized JSON
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
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

main();

