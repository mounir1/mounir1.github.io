# Data Export and Optimization Guide

## Overview

This guide explains how to export data from Firebase, generate optimized JSON files, and prepare for deployment.

## Quick Start

### 1. Export Data from Firebase

```bash
npm run export:data
```

This script will:
- Connect to your Firebase project (using `.env.local` credentials)
- Export all collections: projects, skills, experiences, etc.
- Save to `portfolio-data-export.json`

**Note:** If Firebase is not configured, it will generate data from local files only.

### 2. Generate Optimized Data

```bash
npm run generate:data
```

This script will:
- Load exported Firebase data (if available)
- Merge with local initial data files
- Create optimized structure with:
  - Data models and schemas
  - Relationships between entities
  - Statistics and analytics
- Save to `portfolio-data-optimized.json`

### 3. Export and Generate Together

```bash
npm run data:all
```

## Generated Files

### portfolio-data-export.json

Raw export from Firebase with all collections:
```json
{
  "metadata": {
    "exportDate": "2025-01-XX...",
    "version": "3.0.0",
    "firebaseProjectId": "..."
  },
  "projects": [...],
  "skills": [...],
  "experiences": [...],
  "portfolioConfig": {...},
  "analytics": [...],
  "adminUsers": [...],
  "content": [...]
}
```

### portfolio-data-optimized.json

Optimized structure with models:
```json
{
  "metadata": {...},
  "models": {
    "project": {
      "schema": {...},
      "examples": [...]
    },
    "skill": {
      "schema": {...},
      "examples": [...]
    },
    "experience": {
      "schema": {...},
      "examples": [...]
    }
  },
  "data": {
    "projects": [...],
    "skills": [...],
    "technologies": [...],
    ...
  },
  "statistics": {
    "totalProjects": 0,
    "totalSkills": 0,
    ...
  },
  "relationships": {
    "projectTechnologies": [...],
    "skillProjects": [...]
  }
}
```

## Models

Comprehensive models are defined in `src/lib/models/portfolio-models.ts`:

- **ProjectModel**: Complete project schema with validation
- **SkillModel**: Skill schema with levels and categories
- **ExperienceModel**: Work experience schema
- **PortfolioSettingsModel**: Portfolio configuration

## Scripts Location

- `scripts/export-data-simple.js` - Main export script (Node.js compatible)
- `scripts/generate-optimized-data.js` - Optimization script
- `scripts/deploy.sh` - Deployment script (Linux/Mac)
- `scripts/deploy.bat` - Deployment script (Windows)

## Troubleshooting

### Firebase Connection Issues

1. Check `.env.local` file exists and has correct credentials
2. Verify Firebase project ID matches
3. Ensure you have read permissions for Firestore collections

### Script Execution Errors

1. Ensure Node.js is installed (v18+)
2. Install dependencies: `npm install`
3. Check file permissions on scripts

### Data Not Exporting

- Script will fall back to local files if Firebase fails
- Check console output for specific error messages
- Verify network connection

## Integration with Build Process

The build process automatically includes data export:

```bash
npm run build:full
```

This runs:
1. `npm run data:all` - Export and optimize data
2. `npm run build:prod` - Build the application

## Next Steps

After generating optimized data:

1. Review `portfolio-data-optimized.json`
2. Use the models for validation
3. Build and deploy:
   ```bash
   npm run build:full
   npm run deploy:all
   ```

## File Structure

```
portfolio-data-export.json          # Raw Firebase export (gitignored)
portfolio-data-optimized.json       # Optimized data (gitignored)
src/lib/models/portfolio-models.ts  # TypeScript models
scripts/
  ├── export-data-simple.js        # Export script
  ├── generate-optimized-data.js    # Optimization script
  ├── deploy.sh                     # Deployment (Linux/Mac)
  └── deploy.bat                    # Deployment (Windows)
```

## Notes

- Export files are gitignored to avoid committing sensitive data
- Models include Zod validation schemas
- Relationships are automatically generated
- Statistics are calculated from the data

