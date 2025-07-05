# Deployment Guide - Patent Prior Art Search Application

This guide provides step-by-step instructions for deploying the Patent Prior Art Search application on various platforms.

## Prerequisites

- Git installed on your system
- Node.js 18+ (for Node.js deployment option)
- Your Lens.org API token: `NHaWYJh7KXwYbJt4mNSPGvfMMYGPW3z1n8jXLh2FIvm39WgQjnUH`
- Optional: Google Custom Search API key and CX ID

## Quick Start - Local Development

### Option 1: Simple Static Server (Recommended for testing)
```bash
# Download and extract the application files
# Open terminal in the application directory

# Using Python (if installed)
python -m http.server 8000

# Using Node.js
npx serve . -p 8000

# Using PHP (if installed)
php -S localhost:8000

# Open browser to http://localhost:8000
```

### Option 2: Node.js Server
```bash
# Install dependencies
npm install

# Start the server
npm start

# Open browser to http://localhost:3000
```

## Platform-Specific Deployment

### 1. Render.com Deployment (Recommended)

**Step 1: Prepare Repository**
```bash
# Upload your files to a GitHub repository
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/patent-prior-art-search.git
git push -u origin main
```

**Step 2: Deploy to Render**
1. Go to [Render.com](https://render.com) and sign up/login
2. Click "New" → "Static Site"
3. Connect your GitHub repository
4. Configure the deployment:
   - **Name**: `patent-prior-art-search`
   - **Root Directory**: `/` (leave empty)
   - **Build Command**: `echo "Static site - no build needed"`
   - **Publish Directory**: `./`
5. Add environment variables:
   - `LENS_TOKEN`: `NHaWYJh7KXwYbJt4mNSPGvfMMYGPW3z1n8jXLh2FIvm39WgQjnUH`
   - `GOOGLE_API_KEY`: (your Google API key - optional)
   - `GOOGLE_CX`: (your Google CX ID - optional)
6. Click "Create Static Site"

**Step 3: Access Your Application**
- Your app will be available at `https://patent-prior-art-search.onrender.com`
- Automatic deployments on every Git push

### 2. GitHub Pages Deployment

**Step 1: Prepare Repository**
```bash
# Create a new repository on GitHub
# Upload your files to the repository
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/patent-prior-art-search.git
git push -u origin main
```

**Step 2: Enable GitHub Pages**
1. Go to your repository on GitHub
2. Click "Settings" → "Pages"
3. Under "Source", select "Deploy from a branch"
4. Select "main" branch and "/ (root)" folder
5. Click "Save"

**Step 3: Access Your Application**
- Your app will be available at `https://YOUR_USERNAME.github.io/patent-prior-art-search`
- Updates automatically on every push to main branch

### 3. Netlify Deployment

**Step 1: Prepare Repository**
```bash
# Same as GitHub Pages preparation
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/patent-prior-art-search.git
git push -u origin main
```

**Step 2: Deploy to Netlify**
1. Go to [Netlify.com](https://netlify.com) and sign up/login
2. Click "New site from Git"
3. Connect your GitHub repository
4. Configure build settings:
   - **Build command**: `echo "Static site"`
   - **Publish directory**: `./`
5. Add environment variables in Site settings → Environment variables:
   - `LENS_TOKEN`: `NHaWYJh7KXwYbJt4mNSPGvfMMYGPW3z1n8jXLh2FIvm39WgQjnUH`
   - `GOOGLE_API_KEY`: (optional)
   - `GOOGLE_CX`: (optional)
6. Click "Deploy site"

### 4. Vercel Deployment

**Step 1: Prepare Repository**
```bash
# Same as above
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/patent-prior-art-search.git
git push -u origin main
```

**Step 2: Deploy to Vercel**
1. Go to [Vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Other
   - **Build Command**: `echo "Static site"`
   - **Output Directory**: `./`
5. Add environment variables:
   - `LENS_TOKEN`: `NHaWYJh7KXwYbJt4mNSPGvfMMYGPW3z1n8jXLh2FIvm39WgQjnUH`
   - `GOOGLE_API_KEY`: (optional)
   - `GOOGLE_CX`: (optional)
6. Click "Deploy"

### 5. Heroku Deployment (Node.js)

**Step 1: Prepare for Heroku**
```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create Heroku app
heroku create patent-prior-art-search

# Set environment variables
heroku config:set LENS_TOKEN=NHaWYJh7KXwYbJt4mNSPGvfMMYGPW3z1n8jXLh2FIvm39WgQjnUH
heroku config:set NODE_ENV=production
heroku config:set GOOGLE_API_KEY=your_google_api_key
heroku config:set GOOGLE_CX=your_google_cx_id
```

**Step 2: Deploy**
```bash
# Deploy to Heroku
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# Open your app
heroku open
```

## Environment Variables Configuration

### Required Variables
- `LENS_TOKEN`: Your Lens.org API token (already provided)

### Optional Variables
- `GOOGLE_API_KEY`: Google Custom Search API key
- `GOOGLE_CX`: Google Custom Search Engine ID
- `NODE_ENV`: Set to "production" for production deployments
- `PORT`: Server port (automatically set by most platforms)

## Troubleshooting

### Common Issues

**1. Application not loading**
- Check that all files are uploaded correctly
- Verify that `index.html` is in the root directory
- Check browser console for errors

**2. API not working**
- Verify that environment variables are set correctly
- Check that API tokens are valid
- Ensure CORS is properly configured

**3. Form validation not working**
- Check that JavaScript files are loading correctly
- Verify that all DOM elements have correct IDs
- Check browser console for JavaScript errors

**4. File upload not working**
- Ensure file input elements are present
- Check file size and type restrictions
- Verify drag-and-drop functionality

### Platform-Specific Issues

**Render.com**
- Static sites don't support server-side environment variables in client-side code
- Use build-time environment variable injection if needed

**GitHub Pages**
- No server-side processing available
- API keys must be embedded in client-side code (use with caution)
- HTTPS only for secure API calls

**Netlify**
- Functions available for server-side processing if needed
- Environment variables available in build process

**Vercel**
- Serverless functions available for API endpoints
- Automatic HTTPS and global CDN

**Heroku**
- Requires Node.js server configuration
- Automatic sleep after 30 minutes of inactivity (free tier)

## Security Considerations

### API Key Security
- Never expose API keys in client-side code for production
- Use environment variables for all sensitive data
- Consider using server-side proxy for API calls
- Implement proper CORS headers

### Content Security Policy
- CSP headers are configured in `render.yaml` and `server.js`
- Adjust CSP settings based on your requirements
- Test thoroughly after making security changes

### HTTPS Requirements
- All production deployments should use HTTPS
- Required for secure API calls
- Most platforms provide automatic HTTPS

## Performance Optimization

### Client-Side Optimization
- Minimize API calls with intelligent caching
- Implement lazy loading for large datasets
- Optimize images and assets
- Use compression for static assets

### Server-Side Optimization (Node.js)
- Enable gzip compression
- Implement proper caching headers
- Use CDN for static assets
- Monitor performance metrics

## Monitoring and Maintenance

### Application Monitoring
- Check application logs regularly
- Monitor API usage and rate limits
- Track user engagement and errors
- Set up uptime monitoring

### Regular Updates
- Keep dependencies updated
- Monitor for security vulnerabilities
- Update API tokens as needed
- Test functionality after updates

## Support and Resources

### Documentation
- [Render.com Documentation](https://render.com/docs)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Netlify Documentation](https://docs.netlify.com)
- [Vercel Documentation](https://vercel.com/docs)
- [Heroku Documentation](https://devcenter.heroku.com)

### API Resources
- [Lens.org API Documentation](https://docs.api.lens.org)
- [Google Custom Search API Documentation](https://developers.google.com/custom-search)

### Community Support
- GitHub Issues for bug reports
- Stack Overflow for technical questions
- Platform-specific support channels

---

**Choose the deployment option that best fits your needs. Render.com is recommended for its simplicity and reliability.**