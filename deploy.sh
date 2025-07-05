#!/bin/bash

# Patent Prior Art Search - Quick Deployment Script
# This script helps you quickly set up and deploy the application

echo "🚀 Patent Prior Art Search - Quick Deployment Setup"
echo "=================================================="

# Check if git is installed
if command -v git &> /dev/null; then
    echo "✅ Git is installed"
else
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if Node.js is installed
if command -v node &> /dev/null; then
    echo "✅ Node.js is installed ($(node --version))"
    NODE_AVAILABLE=true
else
    echo "⚠️  Node.js is not installed. You can still deploy as a static site."
    NODE_AVAILABLE=false
fi

# Check if npm is installed
if command -v npm &> /dev/null; then
    echo "✅ npm is installed ($(npm --version))"
    NPM_AVAILABLE=true
else
    echo "⚠️  npm is not installed"
    NPM_AVAILABLE=false
fi

echo ""
echo "🔧 Setup Options:"
echo "1. Local development (static server)"
echo "2. Local development (Node.js server)"
echo "3. Initialize Git repository"
echo "4. Setup environment variables"
echo "5. Deploy to Render.com (guide)"
echo "6. Deploy to GitHub Pages (guide)"
echo "7. Exit"
echo ""

read -p "Choose an option (1-7): " choice

case $choice in
    1)
        echo "🌐 Starting local static server..."
        if command -v python3 &> /dev/null; then
            echo "Using Python 3 HTTP server on port 8000"
            echo "Open http://localhost:8000 in your browser"
            python3 -m http.server 8000
        elif command -v python &> /dev/null; then
            echo "Using Python HTTP server on port 8000"
            echo "Open http://localhost:8000 in your browser"
            python -m http.server 8000
        elif command -v npx &> /dev/null; then
            echo "Using Node.js serve on port 8000"
            echo "Open http://localhost:8000 in your browser"
            npx serve . -p 8000
        else
            echo "❌ No suitable server found. Please install Python or Node.js."
        fi
        ;;
    2)
        if [ "$NODE_AVAILABLE" = true ] && [ "$NPM_AVAILABLE" = true ]; then
            echo "📦 Installing Node.js dependencies..."
            npm install
            echo "🚀 Starting Node.js server..."
            echo "Open http://localhost:3000 in your browser"
            npm start
        else
            echo "❌ Node.js or npm not available. Please install Node.js first."
        fi
        ;;
    3)
        echo "📁 Initializing Git repository..."
        if [ ! -d ".git" ]; then
            git init
            echo "✅ Git repository initialized"
        else
            echo "⚠️  Git repository already exists"
        fi

        # Create .env file from template
        if [ ! -f ".env" ]; then
            cp .env.template .env
            echo "✅ Created .env file from template"
            echo "📝 Please edit .env file with your API keys"
        fi

        read -p "Enter your GitHub repository URL (or press Enter to skip): " repo_url
        if [ ! -z "$repo_url" ]; then
            git remote add origin "$repo_url"
            echo "✅ Added remote origin: $repo_url"
        fi

        git add .
        git commit -m "Initial commit - Patent Prior Art Search Application"
        echo "✅ Initial commit created"

        if [ ! -z "$repo_url" ]; then
            read -p "Push to GitHub? (y/n): " push_confirm
            if [ "$push_confirm" = "y" ]; then
                git push -u origin main
                echo "✅ Pushed to GitHub"
            fi
        fi
        ;;
    4)
        echo "🔑 Setting up environment variables..."
        if [ ! -f ".env" ]; then
            cp .env.template .env
            echo "✅ Created .env file from template"
        fi

        echo "📝 Current environment variables:"
        cat .env
        echo ""
        echo "Please edit the .env file with your actual API keys:"
        echo "- LENS_TOKEN is already set"
        echo "- Add your GOOGLE_API_KEY and GOOGLE_CX if you have them"
        echo "- Set NODE_ENV to 'production' for production deployment"

        read -p "Open .env file for editing? (y/n): " edit_confirm
        if [ "$edit_confirm" = "y" ]; then
            if command -v nano &> /dev/null; then
                nano .env
            elif command -v vim &> /dev/null; then
                vim .env
            elif command -v code &> /dev/null; then
                code .env
            else
                echo "Please edit .env file manually with your preferred editor"
            fi
        fi
        ;;
    5)
        echo "🚀 Render.com Deployment Guide"
        echo "=============================

        1. Push your code to GitHub (use option 3 if not done yet)
        2. Go to https://render.com and sign up/login
        3. Click 'New' → 'Static Site'
        4. Connect your GitHub repository
        5. Configure:
           - Name: patent-prior-art-search
           - Build Command: echo 'Static site'
           - Publish Directory: ./
        6. Add environment variables:
           - LENS_TOKEN: NHaWYJh7KXwYbJt4mNSPGvfMMYGPW3z1n8jXLh2FIvm39WgQjnUH
           - GOOGLE_API_KEY: (your Google API key)
           - GOOGLE_CX: (your Google CX ID)
        7. Click 'Create Static Site'
        8. Your app will be available at https://patent-prior-art-search.onrender.com

        📖 See DEPLOYMENT.md for detailed instructions"
        ;;
    6)
        echo "🐙 GitHub Pages Deployment Guide"
        echo "==============================

        1. Push your code to GitHub (use option 3 if not done yet)
        2. Go to your repository on GitHub
        3. Click 'Settings' → 'Pages'
        4. Under 'Source', select 'Deploy from a branch'
        5. Select 'main' branch and '/ (root)' folder
        6. Click 'Save'
        7. Your app will be available at https://YOUR_USERNAME.github.io/REPO_NAME

        Note: GitHub Pages doesn't support server-side environment variables.
        Your API keys will be embedded in the client-side code.

        📖 See DEPLOYMENT.md for detailed instructions"
        ;;
    7)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid option. Please choose 1-7."
        ;;
esac