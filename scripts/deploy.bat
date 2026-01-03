@echo off
REM Deployment Script for Portfolio (Windows)
REM Handles build, GitHub Pages, and Firebase deployment

echo 🚀 Starting deployment process...
echo.

REM Step 1: Export and optimize data
echo 📦 Step 1: Exporting and optimizing data...
call npm run data:all
if errorlevel 1 (
    echo ⚠️  Data export failed, continuing with build...
)

REM Step 2: Build project
echo 🔨 Step 2: Building project...
call npm run build:prod
if errorlevel 1 (
    echo ❌ Build failed!
    exit /b 1
)

REM Step 3: Deploy to GitHub Pages
if "%1"=="github" goto deploy_github
if "%1"=="all" goto deploy_github
goto skip_github

:deploy_github
echo 📤 Step 3: Deploying to GitHub Pages...
call npm run deploy:github
if errorlevel 1 (
    echo ⚠️  GitHub Pages deployment failed
)
goto skip_github

:skip_github

REM Step 4: Deploy to Firebase
if "%1"=="firebase" goto deploy_firebase
if "%1"=="all" goto deploy_firebase
goto end

:deploy_firebase
echo 🔥 Step 4: Deploying to Firebase...
call firebase deploy --only hosting
if errorlevel 1 (
    echo ⚠️  Firebase deployment failed
)
goto end

:end
echo.
echo ✅ Deployment process completed!

