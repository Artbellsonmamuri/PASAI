# Patent Prior Art Search Application (PASAI)

A comprehensive web application for automated patent prior art search and analysis, featuring AI-powered technology disclosure analysis, real-time patent database searching, and professional report generation.

## Features

### 🔍 **Step-by-Step Workflow**
1. **Technology Disclosure** - Input invention details with real-time validation
2. **Technology Analysis** - AI-powered concept extraction and search query generation
3. **Prior Art Search** - Automated search through global patent databases
4. **Results Analysis** - Intelligent ranking and selection of top 10 most relevant patents
5. **Report Generation** - Professional PDF reports with novelty, inventive step, and industrial applicability analysis

### 📝 **Advanced Form Features**
- **Real-time character/word counting** for all input fields
- **Smart keyword input** - Press Enter or Comma to add keywords
- **Claims management** - Single sentence claims added with Enter or Period
- **File upload system** - Drag-and-drop support for PDF, DOCX, PNG, JPG, XLSX
- **Progressive validation** - Form completion tracking with visual progress bar
- **Auto-save functionality** - Never lose your work

### 🔄 **API Integration**
- **Lens.org Patent Database** - Real-time search across 115+ million patents
- **Bearer token authentication** - Secure API access
- **Rate limiting compliance** - Optimized for API usage limits
- **Comprehensive error handling** - Robust error management and retry logic

### 📊 **Professional Reporting**
- **PDF generation** - Export-ready reports with professional formatting
- **Novelty analysis** - Automated identification of unique invention aspects
- **Inventive step assessment** - Obviousness evaluation against prior art
- **Industrial applicability** - Commercial viability analysis
- **Actionable recommendations** - Strategic guidance for patent prosecution

## Quick Start

### Option 1: Static Site Deployment (Recommended)
```bash
# Clone or download the repository
git clone https://github.com/your-username/patent-prior-art-search.git
cd patent-prior-art-search

# For local development
python -m http.server 8000
# or
npx serve .

# Open http://localhost:8000 in your browser
```

### Option 2: Node.js Deployment
```bash
# Install dependencies
npm install

# Start the server
npm start

# Open http://localhost:3000 in your browser
```

## Deployment

### Render Deployment
1. Connect your GitHub repository to Render
2. Create a new **Static Site** or **Web Service**
3. Set environment variables:
   - `LENS_TOKEN`: Your Lens.org API token
   - `GOOGLE_API_KEY`: Google Custom Search API key (optional)
   - `GOOGLE_CX`: Google Custom Search Engine ID (optional)
4. Deploy automatically with `render.yaml` configuration

### GitHub Pages Deployment
1. Enable GitHub Pages in repository settings
2. Set source to `main` branch and `/` root directory
3. Add a `404.html` file copying `index.html` for SPA routing
4. Access via `https://your-username.github.io/patent-prior-art-search`

## Configuration

### API Keys Setup
Edit the configuration in `app.js`:

```javascript
// Lens.org API Configuration
this.apiToken = 'YOUR_LENS_API_TOKEN_HERE';

// Google Custom Search (Optional)
this.googleApiKey = 'YOUR_GOOGLE_API_KEY';
this.googleCx = 'YOUR_GOOGLE_CX_ID';
```

### Environment Variables
For production deployment, set these environment variables:
- `LENS_TOKEN`: Your Lens.org API token
- `GOOGLE_API_KEY`: Google Custom Search API key
- `GOOGLE_CX`: Google Custom Search Engine ID

## API Integration

### Lens.org Patent Database
- **Endpoint**: `https://api.lens.org/patent/search`
- **Authentication**: Bearer token in Authorization header
- **Rate Limit**: 10 requests per minute (free tier)
- **Coverage**: 115+ million patents from 95+ jurisdictions

### Google Custom Search (Optional)
- **Endpoint**: `https://www.googleapis.com/customsearch/v1`
- **Authentication**: API key parameter
- **Usage**: Supplemental search for non-patent literature
- **Rate Limit**: 100 queries per day (free tier)

## File Structure

```
patent-prior-art-search/
├── index.html              # Main application HTML
├── style.css               # Application styling
├── app.js                  # Core application logic
├── package.json            # Node.js dependencies
├── render.yaml             # Render deployment configuration
├── README.md               # This file
└── assets/                 # Static assets (if any)
```

## Form Validation Requirements

### Required Fields
- **Title**: 10-200 characters
- **Abstract**: 150-300 words
- **Detailed Disclosure**: 500+ characters

### Optional Fields
- **Keywords**: Up to 10 keywords (Enter or Comma to add)
- **Claims**: Up to 10 single-sentence claims (Enter or Period to add)
- **Files**: Up to 20 files (PDF, DOCX, PNG, JPG, XLSX, max 10MB each)

### Progress Calculation
Form completion percentage = (Valid required fields / Total required fields) × 100
Next button enabled only when progress reaches 100%

## Troubleshooting

### Common Issues

**1. Word/Character Counting Not Working**
- Ensure all event listeners are properly attached
- Check browser console for JavaScript errors
- Verify form field IDs match JavaScript selectors

**2. File Upload Not Functioning**
- Confirm drag-and-drop area is visible
- Check file type and size restrictions
- Verify file input element is present in DOM

**3. Next Button Disabled**
- Check form validation logic
- Ensure all required fields meet minimum requirements
- Verify progress calculation is updating correctly

**4. API Integration Issues**
- Confirm API token is correctly set
- Check network requests in browser DevTools
- Verify CORS settings and rate limits

### Browser Compatibility
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Development

### Local Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Testing
```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please:
1. Check the troubleshooting section above
2. Review the GitHub Issues page
3. Contact the development team

## Changelog

### v1.0.0
- Initial release with complete workflow implementation
- Real-time form validation and progress tracking
- File upload with drag-and-drop support
- Lens.org API integration
- Professional PDF report generation
- Responsive design and accessibility features

## Roadmap

### Upcoming Features
- Advanced AI-powered similarity analysis
- Multi-language support for international patents
- Integration with additional patent databases
- Team collaboration features
- Advanced analytics and reporting dashboard
- Mobile app companion

### Known Limitations
- Google Custom Search requires valid API key and CX ID
- Rate limiting applies to API requests
- File uploads are processed client-side only
- PDF generation is client-side with size limitations

## Security

- All API tokens should be stored as environment variables
- Client-side processing ensures data privacy
- No sensitive data is transmitted to unauthorized servers
- HTTPS recommended for production deployment

## Performance

- Optimized for desktop and tablet devices
- Efficient client-side processing
- Minimal API calls with smart caching
- Progressive loading for better user experience

---

**Built with ❤️ for the intellectual property community**