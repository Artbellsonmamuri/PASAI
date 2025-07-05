#!/bin/bash

# Patent Prior Art Search - Application Verification Script
# This script helps verify that all components are working correctly

echo "🔍 Patent Prior Art Search - Application Verification"
echo "=================================================="

# Test 1: Check if all required files exist
echo "📁 Checking file structure..."
required_files=("index.html" "style.css" "app.js" "package.json" "README.md")
missing_files=()

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file is missing"
        missing_files+=("$file")
    fi
done

# Test 2: Check if Node.js files are valid
echo ""
echo "🔧 Checking Node.js configuration..."
if [ -f "package.json" ]; then
    if command -v node &> /dev/null; then
        node -e "console.log('✅ Node.js is working')"
        if command -v npm &> /dev/null; then
            npm --version > /dev/null
            echo "✅ npm is working"
        else
            echo "❌ npm is not available"
        fi
    else
        echo "⚠️  Node.js is not installed (not required for static deployment)"
    fi
else
    echo "❌ package.json not found"
fi

# Test 3: Check environment variables
echo ""
echo "🔑 Checking environment variables..."
if [ -f ".env" ]; then
    if grep -q "LENS_TOKEN" .env; then
        echo "✅ LENS_TOKEN found in .env"
    else
        echo "❌ LENS_TOKEN not found in .env"
    fi

    if grep -q "GOOGLE_API_KEY" .env; then
        echo "✅ GOOGLE_API_KEY found in .env"
    else
        echo "⚠️  GOOGLE_API_KEY not found in .env (optional)"
    fi
else
    echo "⚠️  .env file not found (copy from .env.template)"
fi

# Test 4: Check if application can be served locally
echo ""
echo "🌐 Testing local server capability..."
if command -v python3 &> /dev/null; then
    echo "✅ Python 3 available for local server"
elif command -v python &> /dev/null; then
    echo "✅ Python available for local server"
elif command -v node &> /dev/null; then
    echo "✅ Node.js available for local server"
else
    echo "❌ No suitable server found for local testing"
fi

# Test 5: Check Git repository status
echo ""
echo "📂 Checking Git repository status..."
if [ -d ".git" ]; then
    echo "✅ Git repository initialized"
    if git remote get-url origin &> /dev/null; then
        echo "✅ Remote origin configured: $(git remote get-url origin)"
    else
        echo "⚠️  No remote origin configured"
    fi
else
    echo "⚠️  Git repository not initialized"
fi

# Summary
echo ""
echo "📋 Verification Summary:"
echo "======================"

if [ ${#missing_files[@]} -eq 0 ]; then
    echo "✅ All required files are present"
else
    echo "❌ Missing files: ${missing_files[*]}"
fi

echo ""
echo "🚀 Next Steps:"
echo "1. If files are missing, download them from the web app generator"
echo "2. Copy .env.template to .env and configure API keys"
echo "3. Test locally with: python -m http.server 8000"
echo "4. Deploy to your chosen platform (see DEPLOYMENT.md)"
echo ""
echo "📖 For detailed instructions, see README.md and DEPLOYMENT.md"
echo "🛠️  For quick setup, run: ./deploy.sh (Linux/Mac) or deploy.bat (Windows)"