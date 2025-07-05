const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

// Serve static files from the src directory
app.use(express.static(path.join(__dirname, 'src')));

// Handle SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Patent Prior Art Search Server running on port ${PORT}`);
    console.log(`📱 Application available at: http://localhost:${PORT}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔑 Lens API: ${process.env.LENS_TOKEN ? 'Configured' : 'Not configured'}`);
    console.log(`🔍 Google API: ${process.env.GOOGLE_API_KEY ? 'Configured' : 'Not configured'}`);
});
