@echo off
echo 🚀 Patent Prior Art Search - Quick Deployment Setup
echo ==================================================

REM Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed. Please install Git first.
    pause
    exit /b 1
) else (
    echo ✅ Git is installed
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Node.js is not installed. You can still deploy as a static site.
    set NODE_AVAILABLE=false
) else (
    echo ✅ Node.js is installed
    set NODE_AVAILABLE=true
)

echo.
echo 🔧 Setup Options:
echo 1. Local development (static server)
echo 2. Local development (Node.js server)
echo 3. Initialize Git repository
echo 4. Setup environment variables
echo 5. Deploy to Render.com (guide)
echo 6. Deploy to GitHub Pages (guide)
echo 7. Exit
echo.

set /p choice="Choose an option (1-7): "

if "%choice%"=="1" (
    echo 🌐 Starting local static server...
    python -m http.server 8000
    if %errorlevel% neq 0 (
        echo ❌ Python not found. Please install Python or Node.js.
        pause
    )
) else if "%choice%"=="2" (
    if "%NODE_AVAILABLE%"=="true" (
        echo 📦 Installing Node.js dependencies...
        npm install
        echo 🚀 Starting Node.js server...
        echo Open http://localhost:3000 in your browser
        npm start
    ) else (
        echo ❌ Node.js not available. Please install Node.js first.
        pause
    )
) else if "%choice%"=="3" (
    echo 📁 Initializing Git repository...
    if not exist ".git" (
        git init
        echo ✅ Git repository initialized
    ) else (
        echo ⚠️  Git repository already exists
    )

    if not exist ".env" (
        copy .env.template .env
        echo ✅ Created .env file from template
        echo 📝 Please edit .env file with your API keys
    )

    set /p repo_url="Enter your GitHub repository URL (or press Enter to skip): "
    if not "%repo_url%"=="" (
        git remote add origin "%repo_url%"
        echo ✅ Added remote origin: %repo_url%
    )

    git add .
    git commit -m "Initial commit - Patent Prior Art Search Application"
    echo ✅ Initial commit created

    if not "%repo_url%"=="" (
        set /p push_confirm="Push to GitHub? (y/n): "
        if "%push_confirm%"=="y" (
            git push -u origin main
            echo ✅ Pushed to GitHub
        )
    )
) else if "%choice%"=="4" (
    echo 🔑 Setting up environment variables...
    if not exist ".env" (
        copy .env.template .env
        echo ✅ Created .env file from template
    )

    echo 📝 Please edit the .env file with your actual API keys
    notepad .env
) else if "%choice%"=="5" (
    echo 🚀 Render.com Deployment Guide
    echo =============================
    echo.
    echo 1. Push your code to GitHub (use option 3 if not done yet)
    echo 2. Go to https://render.com and sign up/login
    echo 3. Click 'New' → 'Static Site'
    echo 4. Connect your GitHub repository
    echo 5. Configure deployment settings
    echo 6. Add environment variables
    echo 7. Deploy
    echo.
    echo 📖 See DEPLOYMENT.md for detailed instructions
    pause
) else if "%choice%"=="6" (
    echo 🐙 GitHub Pages Deployment Guide
    echo ==============================
    echo.
    echo 1. Push your code to GitHub
    echo 2. Enable GitHub Pages in repository settings
    echo 3. Configure Pages settings
    echo 4. Access your deployed app
    echo.
    echo 📖 See DEPLOYMENT.md for detailed instructions
    pause
) else if "%choice%"=="7" (
    echo 👋 Goodbye!
    exit /b 0
) else (
    echo ❌ Invalid option. Please choose 1-7.
    pause
)