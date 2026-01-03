#!/bin/bash

# Deployment Script for Portfolio
# Handles build, GitHub Pages, and Firebase deployment

set -e  # Exit on error

echo "🚀 Starting deployment process..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Export and optimize data
echo -e "${BLUE}📦 Step 1: Exporting and optimizing data...${NC}"
npm run data:all || {
    echo -e "${YELLOW}⚠️  Data export failed, continuing with build...${NC}"
}

# Step 2: Build project
echo -e "${BLUE}🔨 Step 2: Building project...${NC}"
npm run build:prod || {
    echo -e "${YELLOW}❌ Build failed!${NC}"
    exit 1
}

# Step 3: Deploy to GitHub Pages
if [ "$1" = "github" ] || [ "$1" = "all" ]; then
    echo -e "${BLUE}📤 Step 3: Deploying to GitHub Pages...${NC}"
    npm run deploy:github || {
        echo -e "${YELLOW}⚠️  GitHub Pages deployment failed${NC}"
    }
fi

# Step 4: Deploy to Firebase
if [ "$1" = "firebase" ] || [ "$1" = "all" ]; then
    echo -e "${BLUE}🔥 Step 4: Deploying to Firebase...${NC}"
    firebase deploy --only hosting || {
        echo -e "${YELLOW}⚠️  Firebase deployment failed${NC}"
    }
fi

echo ""
echo -e "${GREEN}✅ Deployment process completed!${NC}"

