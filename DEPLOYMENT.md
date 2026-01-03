# Deployment Guide

This guide covers building and deploying the portfolio to GitHub Pages and Firebase.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Firebase CLI** installed globally:
   ```bash
   npm install -g firebase-tools
   ```
3. **Git** configured
4. **Firebase project** set up with hosting enabled
5. **GitHub repository** with GitHub Pages enabled

## Environment Setup

1. Create `.env.local` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase (if not already done):
   ```bash
   firebase init hosting
   ```

## Data Export and Optimization

### Export Data from Firebase

```bash
npm run export:data
```

This will:
- Connect to Firebase
- Export all collections (projects, skills, experiences, etc.)
- Save to `portfolio-data-export.json`

### Generate Optimized Data

```bash
npm run generate:data
```

This will:
- Merge Firebase data with local initial data
- Create optimized structure with models and relationships
- Save to `portfolio-data-optimized.json`

### Export and Generate Together

```bash
npm run data:all
```

## Building

### Development Build

```bash
npm run build
```

### Production Build

```bash
npm run build:prod
```

### Full Build (with data export)

```bash
npm run build:full
```

This includes:
1. Data export and optimization
2. TypeScript compilation
3. Production build

## Deployment

### Deploy to GitHub Pages

```bash
npm run deploy:github
```

Or using the script:
```bash
# Linux/Mac
./scripts/deploy.sh github

# Windows
scripts\deploy.bat github
```

### Deploy to Firebase

```bash
npm run deploy:firebase
```

Or:
```bash
firebase deploy --only hosting
```

### Deploy to Both

```bash
npm run deploy:all
```

Or using the script:
```bash
# Linux/Mac
./scripts/deploy.sh all

# Windows
scripts\deploy.bat all
```

## Deployment Scripts

### Linux/Mac

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh [github|firebase|all]
```

### Windows

```cmd
scripts\deploy.bat [github|firebase|all]
```

## Manual Deployment Steps

### GitHub Pages

1. Build the project:
   ```bash
   npm run build:full
   ```

2. Deploy to GitHub Pages:
   ```bash
   gh-pages -d dist -t true
   ```

### Firebase

1. Build the project:
   ```bash
   npm run build:full
   ```

2. Deploy:
   ```bash
   firebase deploy --only hosting
   ```

## Troubleshooting

### Firebase Authentication Error

- Ensure you're logged in: `firebase login`
- Check your `.env.local` file has correct credentials
- Verify Firebase project ID matches

### GitHub Pages Not Updating

- Check GitHub Pages settings in repository
- Ensure `gh-pages` branch exists
- Verify `homepage` in `package.json` matches your GitHub Pages URL

### Build Errors

- Clear cache: `npm run clean`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run type-check`

### Data Export Fails

- Verify Firebase credentials in `.env.local`
- Check internet connection
- Ensure Firebase project has the required collections

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Portfolio

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build:full
      - run: npm run deploy:github
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - run: npm run deploy:firebase
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

## File Structure

After deployment, you'll have:

```
portfolio-data-export.json       # Raw Firebase export
portfolio-data-optimized.json    # Optimized data with models
dist/                            # Build output
```

## Notes

- Data export files are gitignored by default
- Build output (`dist/`) is also gitignored
- Firebase hosting configuration is in `firebase.json`
- GitHub Pages configuration is in `package.json` (homepage field)

