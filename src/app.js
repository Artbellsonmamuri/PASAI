// PASAI Security Fix Application
class SecurityFixApp {
    constructor() {
        this.currentSolution = null;
        this.currentStep = 0;
        this.solutions = {
            'build-time': {
                id: 'build-time',
                name: 'Build-time Environment Variable Replacement',
                description: 'Replace placeholders with environment variables during the build process',
                securityLevel: 'Medium',
                complexity: 'Low',
                recommended: true,
                steps: [
                    {
                        title: 'Remove hardcoded API key from source code',
                        description: 'Replace the hardcoded API key with a placeholder that will be replaced during build time.',
                        code: `// Before (INSECURE)
const OPENAI_API_KEY = 'sk-proj-6dAmE0YjsEjjLDz4FtJ_9eIw06...';

// After (SECURE)
const OPENAI_API_KEY = '__OPENAI_API_KEY__';`
                    },
                    {
                        title: 'Create build script to replace placeholders',
                        description: 'Create a Node.js script that will replace placeholders with environment variables during the build process.',
                        code: `// Save as inject-env.js
const fs = require('fs');
const path = require('path');

// Read the built app.js file
const appJsPath = path.join(__dirname, 'src', 'app.js');
let content = fs.readFileSync(appJsPath, 'utf8');

// Replace placeholders with environment variables
content = content.replace(/__OPENAI_API_KEY__/g, process.env.OPENAI_API_KEY || '');
content = content.replace(/__LENS_TOKEN__/g, process.env.LENS_TOKEN || '');
content = content.replace(/__GOOGLE_API_KEY__/g, process.env.GOOGLE_API_KEY || '');

// Write the updated content back
fs.writeFileSync(appJsPath, content);
console.log('Environment variables injected successfully!');`
                    },
                    {
                        title: 'Configure Render environment variables',
                        description: 'Set up environment variables in your Render dashboard under Environment tab.',
                        code: `Environment Variables to Set:
- OPENAI_API_KEY: Your OpenAI API key
- LENS_TOKEN: Your Lens.org API token
- GOOGLE_API_KEY: Your Google Custom Search API key
- GOOGLE_CX: Your Google Custom Search Engine ID`
                    },
                    {
                        title: 'Update package.json build command',
                        description: 'Modify your package.json to run the environment injection script during build.',
                        code: `{
  "scripts": {
    "build": "node inject-env.js && npm run build-original",
    "build-original": "react-scripts build"
  }
}`
                    },
                    {
                        title: 'Deploy and verify',
                        description: 'Deploy your application and verify that environment variables are properly injected.',
                        code: `// Render Build Command:
node inject-env.js && npm run build-original

// Start Command:
serve -s build`
                    }
                ]
            },
            'runtime': {
                id: 'runtime',
                name: 'Runtime Configuration File',
                description: 'Generate configuration file at container startup with environment variables',
                securityLevel: 'Medium',
                complexity: 'Medium',
                recommended: true,
                steps: [
                    {
                        title: 'Create configuration template',
                        description: 'Create a template for generating configuration files at runtime.',
                        code: `// Create config-template.js
window.ENV_CONFIG = {
  OPENAI_API_KEY: '__OPENAI_API_KEY__',
  LENS_TOKEN: '__LENS_TOKEN__',
  GOOGLE_API_KEY: '__GOOGLE_API_KEY__',
  GOOGLE_CX: '__GOOGLE_CX__'
};`
                    },
                    {
                        title: 'Add startup script to generate config',
                        description: 'Create a shell script that generates the configuration file at container startup.',
                        code: `#!/bin/sh
# Save as generate-config.sh

# Generate config.js with environment variables
cat > ./src/config.js << EOF
window.ENV_CONFIG = {
  OPENAI_API_KEY: '\${OPENAI_API_KEY}',
  LENS_TOKEN: '\${LENS_TOKEN}',
  GOOGLE_API_KEY: '\${GOOGLE_API_KEY}',
  GOOGLE_CX: '\${GOOGLE_CX}'
};
EOF

echo "Configuration file generated successfully!"`
                    },
                    {
                        title: 'Modify application to load config at runtime',
                        description: 'Update your application to load the configuration file and use environment variables.',
                        code: `// Create ConfigManager class
class ConfigManager {
  constructor() {
    this.config = window.ENV_CONFIG || {};
  }

  getOpenAIKey() {
    return this.config.OPENAI_API_KEY || '__OPENAI_API_KEY__';
  }

  getLensToken() {
    return this.config.LENS_TOKEN || '__LENS_TOKEN__';
  }

  getGoogleAPIKey() {
    return this.config.GOOGLE_API_KEY || '__GOOGLE_API_KEY__';
  }

  isConfigured() {
    return this.getOpenAIKey() !== '__OPENAI_API_KEY__';
  }
}

const config = new ConfigManager();`
                    },
                    {
                        title: 'Configure Docker/Render deployment',
                        description: 'Update your deployment configuration to run the startup script.',
                        code: `# In your Dockerfile or Render configuration:
# Make the script executable
chmod +x generate-config.sh

# Run the script before starting the app
./generate-config.sh && serve -s build`
                    },
                    {
                        title: 'Test runtime variable injection',
                        description: 'Deploy and test that environment variables are properly loaded at runtime.',
                        code: `// Test in browser console:
console.log('Config loaded:', window.ENV_CONFIG);
console.log('OpenAI Key configured:', config.isConfigured());

// Render Start Command:
./generate-config.sh && serve -s build`
                    }
                ]
            },
            'proxy': {
                id: 'proxy',
                name: 'Backend Proxy Server',
                description: 'Create a backend service to proxy OpenAI API calls',
                securityLevel: 'High',
                complexity: 'High',
                recommended: false,
                steps: [
                    {
                        title: 'Create backend proxy service',
                        description: 'Set up a separate backend service to handle API calls securely.',
                        code: `// backend/server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post('/api/openai', async (req, res) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      req.body,
      {
        headers: {
          'Authorization': \`Bearer \${OPENAI_API_KEY}\`,
          'Content-Type': 'application/json'
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(process.env.PORT || 3001);`
                    },
                    {
                        title: 'Implement authentication',
                        description: 'Add authentication to secure your proxy endpoints.',
                        code: `// Add JWT authentication middleware
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Protected route
app.post('/api/openai', authenticateToken, async (req, res) => {
  // ... API proxy logic
});`
                    },
                    {
                        title: 'Update frontend to use proxy',
                        description: 'Modify your frontend to make API calls through your proxy server.',
                        code: `// Frontend API client
class APIClient {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    this.token = localStorage.getItem('authToken');
  }

  async callOpenAI(messages) {
    const response = await fetch(\`\${this.baseURL}/api/openai\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${this.token}\`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages
      })
    });

    return response.json();
  }
}

const apiClient = new APIClient();`
                    },
                    {
                        title: 'Deploy backend service',
                        description: 'Deploy your backend proxy service to a secure environment.',
                        code: `# Deploy backend to Render/Heroku/etc.
# Set environment variables:
- OPENAI_API_KEY: Your OpenAI API key
- JWT_SECRET: Your JWT secret key
- CORS_ORIGIN: Your frontend domain

# package.json
{
  "scripts": {
    "start": "node server.js"
  }
}`
                    },
                    {
                        title: 'Configure CORS and security',
                        description: 'Set up proper CORS policies and security headers.',
                        code: `// Enhanced security configuration
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));`
                    }
                ]
            }
        };

        this.codeExamples = {
            'build-script': `const fs = require('fs');
const path = require('path');

// Read the built app.js file
const appJsPath = path.join(__dirname, 'src', 'app.js');
let content = fs.readFileSync(appJsPath, 'utf8');

// Replace placeholders with environment variables
content = content.replace(/__OPENAI_API_KEY__/g, process.env.OPENAI_API_KEY || '');
content = content.replace(/__LENS_TOKEN__/g, process.env.LENS_TOKEN || '');
content = content.replace(/__GOOGLE_API_KEY__/g, process.env.GOOGLE_API_KEY || '');

// Write the updated content back
fs.writeFileSync(appJsPath, content);
console.log('Environment variables injected successfully!');`,
            'runtime-script': `#!/bin/sh

# Generate config.js with environment variables
cat > ./src/config.js << EOF
window.ENV_CONFIG = {
  OPENAI_API_KEY: '\${OPENAI_API_KEY}',
  LENS_TOKEN: '\${LENS_TOKEN}',
  GOOGLE_API_KEY: '\${GOOGLE_API_KEY}',
  GOOGLE_CX: '\${GOOGLE_CX}'
};
EOF

echo "Configuration file generated successfully!"`,
            'secure-app': `// Secure way to access environment variables
class ConfigManager {
  constructor() {
    this.config = window.ENV_CONFIG || {};
  }

  getOpenAIKey() {
    return this.config.OPENAI_API_KEY || '__OPENAI_API_KEY__';
  }

  getLensToken() {
    return this.config.LENS_TOKEN || '__LENS_TOKEN__';
  }

  getGoogleAPIKey() {
    return this.config.GOOGLE_API_KEY || '__GOOGLE_API_KEY__';
  }

  isConfigured() {
    return this.getOpenAIKey() !== '__OPENAI_API_KEY__';
  }
}

const config = new ConfigManager();`
        };

        this.envVars = [
            {
                name: 'OPENAI_API_KEY',
                value: 'sk-proj-6dAmE0YjsEjjLDz4FtJ_9eIw06...',
                description: 'OpenAI API key for ChatGPT integration'
            },
            {
                name: 'LENS_TOKEN',
                value: 'NHaWYJh7KXwYbJt4mNSPGvfMMY...',
                description: 'Lens.org API token for patent search'
            },
            {
                name: 'GOOGLE_API_KEY',
                value: 'AIzaSyCxt5t_PCZpgPL-c08idL...',
                description: 'Google Custom Search API key'
            },
            {
                name: 'GOOGLE_CX',
                value: 'e5fd499e13faf45be',
                description: 'Google Custom Search Engine ID'
            }
        ];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCodeExamples();
        this.loadEnvironmentVariables();
        this.updateSecurityStatus();
    }

    setupEventListeners() {
        // Solution selection
        document.querySelectorAll('.solution-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const solutionCard = e.target.closest('.solution-card');
                const solutionId = solutionCard.dataset.solution;
                this.selectSolution(solutionId);
            });
        });

        // Tab switching
        document.querySelectorAll('.tab-header').forEach(header => {
            header.addEventListener('click', (e) => {
                const tabId = e.target.dataset.tab;
                this.switchTab(tabId);
            });
        });

        // Copy buttons
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const codeType = e.target.dataset.copy;
                this.copyCode(codeType, e.target);
            });
        });

        // Step navigation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('next-step-btn')) {
                this.nextStep();
            } else if (e.target.classList.contains('prev-step-btn')) {
                this.prevStep();
            }
        });
    }

    selectSolution(solutionId) {
        this.currentSolution = solutionId;
        this.currentStep = 0;
        this.showImplementationSection();
        this.loadImplementationSteps();
        this.updateProgress();
    }

    showImplementationSection() {
        document.getElementById('implementationSection').classList.remove('hidden');
        document.getElementById('codeExamplesSection').classList.remove('hidden');
        document.getElementById('envVarsSection').classList.remove('hidden');
        
        // Smooth scroll to implementation section
        document.getElementById('implementationSection').scrollIntoView({
            behavior: 'smooth'
        });
    }

    loadImplementationSteps() {
        const solution = this.solutions[this.currentSolution];
        const container = document.getElementById('implementationContent');
        
        container.innerHTML = '';
        
        solution.steps.forEach((step, index) => {
            const stepElement = document.createElement('div');
            stepElement.className = 'implementation-step';
            stepElement.innerHTML = `
                <div class="step-header">
                    <div class="step-number ${index < this.currentStep ? 'completed' : ''}" data-step="${index}">
                        ${index + 1}
                    </div>
                    <h3 class="step-title">${step.title}</h3>
                </div>
                <div class="step-description">${step.description}</div>
                ${step.code ? `
                    <pre class="code-block"><code>${step.code}</code></pre>
                ` : ''}
                <div class="step-actions">
                    ${index > 0 ? '<button class="btn btn--outline prev-step-btn">Previous</button>' : ''}
                    ${index < solution.steps.length - 1 ? '<button class="btn btn--primary next-step-btn">Next Step</button>' : '<button class="btn btn--primary next-step-btn">Complete</button>'}
                </div>
            `;
            container.appendChild(stepElement);
        });
    }

    nextStep() {
        const solution = this.solutions[this.currentSolution];
        if (this.currentStep < solution.steps.length - 1) {
            this.currentStep++;
            this.updateProgress();
            this.updateStepNumbers();
        } else {
            this.completeSolution();
        }
    }

    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateProgress();
            this.updateStepNumbers();
        }
    }

    updateProgress() {
        const solution = this.solutions[this.currentSolution];
        const progress = ((this.currentStep + 1) / solution.steps.length) * 100;
        
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = `Step ${this.currentStep + 1} of ${solution.steps.length}`;
    }

    updateStepNumbers() {
        document.querySelectorAll('.step-number').forEach((number, index) => {
            if (index <= this.currentStep) {
                number.classList.add('completed');
            } else {
                number.classList.remove('completed');
            }
        });
    }

    completeSolution() {
        this.updateSecurityStatus('fixed');
        alert('Congratulations! You have successfully implemented the security fix. Your API keys are now properly protected.');
    }

    switchTab(tabId) {
        // Update tab headers
        document.querySelectorAll('.tab-header').forEach(header => {
            header.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

        // Update tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.querySelector(`.tab-content[data-tab="${tabId}"]`).classList.add('active');
    }

    loadCodeExamples() {
        Object.entries(this.codeExamples).forEach(([key, code]) => {
            const element = document.getElementById(`${key.replace('-', '')}Code`);
            if (element) {
                element.textContent = code;
            }
        });
    }

    loadEnvironmentVariables() {
        const container = document.getElementById('envVarsList');
        container.innerHTML = '';

        this.envVars.forEach(envVar => {
            const element = document.createElement('div');
            element.className = 'env-var-item';
            element.innerHTML = `
                <div class="env-var-info">
                    <div class="env-var-name">${envVar.name}</div>
                    <div class="env-var-description">${envVar.description}</div>
                </div>
                <div class="env-var-value" title="${envVar.value}">${envVar.value}</div>
            `;
            container.appendChild(element);
        });
    }

    copyCode(codeType, button) {
        const code = this.codeExamples[codeType];
        if (code) {
            navigator.clipboard.writeText(code).then(() => {
                button.classList.add('copied');
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.classList.remove('copied');
                    button.textContent = 'Copy';
                }, 2000);
            });
        }
    }

    updateSecurityStatus(status = 'vulnerable') {
        const statusElement = document.getElementById('securityStatus');
        if (status === 'fixed') {
            statusElement.innerHTML = `
                <span class="status status--success">
                    <span class="status-indicator"></span>
                    API Keys Secured
                </span>
            `;
        } else {
            statusElement.innerHTML = `
                <span class="status status--error">
                    <span class="status-indicator"></span>
                    API Key Exposed in Source Code
                </span>
            `;
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SecurityFixApp();
});

// Additional utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Add fade-in animation to sections
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});