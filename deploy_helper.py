#!/usr/bin/env python3
"""
PASAI Complete - Deployment Helper Script
Helps with local testing and deployment preparation
"""

import os
import sys
import subprocess
import webbrowser
import zipfile
from pathlib import Path

def check_requirements():
    """Check if required tools are available"""
    print("🔍 Checking requirements...")

    # Check Python
    python_version = sys.version_info
    if python_version.major >= 3 and python_version.minor >= 6:
        print(f"✅ Python {python_version.major}.{python_version.minor}.{python_version.micro}")
    else:
        print("❌ Python 3.6+ required")
        return False

    # Check if Node.js is available (optional)
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Node.js {result.stdout.strip()}")
        else:
            print("⚠️  Node.js not found (optional)")
    except FileNotFoundError:
        print("⚠️  Node.js not found (optional)")

    return True

def start_local_server():
    """Start local development server"""
    print("🚀 Starting local server...")

    try:
        # Try Python's built-in server first
        import http.server
        import socketserver
        import threading

        PORT = 8080
        Handler = http.server.SimpleHTTPRequestHandler

        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"📱 Server running at: http://localhost:{PORT}")
            print("📱 Application URL: http://localhost:8080/index.html")
            print("🔄 Press Ctrl+C to stop server")

            # Open browser automatically
            webbrowser.open(f'http://localhost:{PORT}/index.html')

            httpd.serve_forever()

    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        print("💡 Try: python -m http.server 8080")

def create_zip_package():
    """Create deployment zip package"""
    print("📦 Creating deployment package...")

    files_to_include = [
        'index.html',
        'style.css', 
        'app.js',
        'package.json',
        'render.yaml',
        'netlify.toml',
        'README.md'
    ]

    zip_filename = 'PASAI-Complete-v1.0.zip'

    try:
        with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for file in files_to_include:
                if os.path.exists(file):
                    zipf.write(file)
                    print(f"✅ Added: {file}")
                else:
                    print(f"⚠️  Missing: {file}")

        print(f"📦 Package created: {zip_filename}")
        print(f"📊 Package size: {os.path.getsize(zip_filename) / 1024:.1f} KB")

    except Exception as e:
        print(f"❌ Error creating package: {e}")

def show_deployment_options():
    """Show deployment instructions"""
    print("\n🌐 Deployment Options:")
    print("=" * 50)

    print("\n1️⃣  Render.com (Recommended)")
    print("   • Create GitHub repo and upload files")
    print("   • Connect to Render.com")
    print("   • Create 'Static Site' service")
    print("   • Auto-deploys with render.yaml")

    print("\n2️⃣  Netlify")
    print("   • Upload files to GitHub")
    print("   • Connect to Netlify") 
    print("   • Uses netlify.toml configuration")
    print("   • Free SSL and global CDN")

    print("\n3️⃣  GitHub Pages")
    print("   • Upload files to GitHub repo")
    print("   • Enable Pages in repo settings")
    print("   • Select main branch as source")

    print("\n4️⃣  Vercel")
    print("   • Connect GitHub repo to Vercel")
    print("   • Automatic deployment")
    print("   • Zero configuration needed")

def main():
    """Main function"""
    print("🔬 PASAI Complete - Deployment Helper")
    print("=" * 40)

    if not check_requirements():
        sys.exit(1)

    while True:
        print("\n📋 Available Actions:")
        print("1. Start local server for testing")
        print("2. Create deployment ZIP package") 
        print("3. Show deployment options")
        print("4. Exit")

        choice = input("\n👉 Enter your choice (1-4): ").strip()

        if choice == '1':
            start_local_server()
        elif choice == '2':
            create_zip_package()
        elif choice == '3':
            show_deployment_options()
        elif choice == '4':
            print("👋 Goodbye!")
            break
        else:
            print("❌ Invalid choice. Please enter 1-4.")

if __name__ == "__main__":
    main()
