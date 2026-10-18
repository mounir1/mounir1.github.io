#!/usr/bin/env node

// ESM: package.json declares "type": "module" — import instead of require.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

console.log('🚀 Building Mounir Abderrahmani Portfolio for Production...\n');

// Check if environment variables are set
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MEASUREMENT_ID'
];

console.log('📋 Checking environment variables...');
// loadEnv, not process.env: Vite reads .env.production itself, so an export in
// the shell was never what decided whether Firebase gets configured — the old
// check warned on every run on every machine, including the working ones.
const env = loadEnv('production', rootDir, 'VITE_');
const missingVars = requiredEnvVars.filter((varName) => !env[varName]);

if (missingVars.length > 0) {
  console.warn('⚠️  Warning: Missing environment variables:');
  missingVars.forEach(varName => console.warn(`   - ${varName}`));
  console.warn('   Portfolio will work in static mode without Firebase features.\n');
} else {
  console.log('✅ All Firebase environment variables are set.\n');
}

// Clean previous build (cross-platform — was `rm -rf dist`)
console.log('🧹 Cleaning previous build...');
fs.rmSync(path.join(rootDir, 'dist'), { recursive: true, force: true });

// Run type checking
console.log('🔍 Running TypeScript type checking...');
try {
  // The repo's own gate: tsconfig.json is a solution file of project references,
  // so `tsc --noEmit` validates nothing here — it needs --build.
  execSync('npm run type-check', { stdio: 'inherit' });
  console.log('✅ TypeScript check passed.\n');
} catch (error) {
  console.error('❌ TypeScript errors found. Please fix them before building.');
  process.exit(1);
}

// Run linting
console.log('🔧 Running ESLint...');
try {
  execSync('npm run lint', { stdio: 'inherit' });
  console.log('✅ Linting passed.\n');
} catch (error) {
  console.error('❌ Linting failed. Fix the errors before building for production.');
  process.exit(1);
}

// Build the project
console.log('🏗️  Building the project...');
try {
  execSync('npm run build:prod', { stdio: 'inherit' });
  console.log('✅ Build completed successfully.\n');
} catch (error) {
  console.error('❌ Build failed.');
  process.exit(1);
}

// Verify build output
console.log('🔍 Verifying build output...');
const distPath = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distPath, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('❌ Build verification failed: index.html not found.');
  process.exit(1);
}

const indexContent = fs.readFileSync(indexPath, 'utf8');
if (!indexContent.includes('Mounir Abderrahmani')) {
  console.error('❌ Build verification failed: Content not found in index.html.');
  process.exit(1);
}

// Verify PWA files
const requiredFiles = [
  'sw.js',
  'site.webmanifest', 
  'offline.html',
  'CNAME',
  'mounir-icon.svg'
];

console.log('🔍 Verifying PWA files...');
const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(distPath, file)));

if (missingFiles.length > 0) {
  console.warn('⚠️  Warning: Missing PWA files:');
  missingFiles.forEach(file => console.warn(`   - ${file}`));
  console.warn('   PWA features may not work correctly.\n');
} else {
  console.log('✅ All PWA files are present.');
}

console.log('✅ Build verification passed.\n');

// The guard for the Firebase critical-path rule (AGENTS.md decision 1a): a
// single static `import "@/lib/firebase"` above the fold puts ~500 kB back on
// first paint, and nothing else in this pipeline notices.
console.log('🩺 Measuring the critical path...');
try {
  execSync('npm run perf:critical-path', { stdio: 'inherit' });
  console.log('✅ Critical path within budget.\n');
} catch (error) {
  console.error('❌ Critical-path check failed — see the report above.');
  process.exit(1);
}

// Calculate build size (cross-platform — was `du -sh dist`)
const distDir = path.join(rootDir, 'dist');
const dirSize = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).reduce((total, entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return total + dirSize(full);
    return total + fs.statSync(full).size;
  }, 0);
const sizeMb = (dirSize(distDir) / (1024 * 1024)).toFixed(2);
console.log(`📊 Build size: ${sizeMb} MB\n`);

// Success message
console.log('🎉 Production build completed successfully!');
console.log('📁 Build output is in the "dist" directory.');
console.log('🚀 Ready for deployment to GitHub Pages or any static hosting service.');
console.log('\n📋 Next steps:');
console.log('   1. Test the build locally: npm run preview');
console.log('   2. Deploy to GitHub Pages: git push origin main');
console.log('   3. Or deploy manually: upload "dist" folder to your hosting service');
console.log('\n✨ Portfolio by Mounir Abderrahmani - Built with modern web technologies');