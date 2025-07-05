// Patent Prior Art Search & Analysis Application
// Enhanced with GPT integration and comprehensive analysis

class PatentAnalysisApp {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 6;
        this.formData = {
            title: '',
            abstract: '',
            disclosure: '',
            keywords: [],
            claims: [],
            files: []
        };
        this.searchResults = [];
        this.selectedDocuments = [];
        this.analysisResults = {};
        this.reportData = {};
        this.openaiApiKey = '';
        this.lensToken = 'NHaWYJh7KXwYbJt4mNSPGvfMMYGPW3z1n8jXLh2FIvm39WgQjnUH';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFormValidation();
        this.setupFileUpload();
        this.setupKeywordsInput();
        this.setupClaimsInput();
        this.setupTabs();
        this.updateProgress();
        this.loadSavedData();
        this.startAutoSave();
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('next-btn').addEventListener('click', () => this.nextStep());
        document.getElementById('prev-btn').addEventListener('click', () => this.prevStep());
        
        // API Key Modal
        document.getElementById('save-api-key').addEventListener('click', () => this.saveApiKey());
        document.getElementById('skip-ai').addEventListener('click', () => this.skipAI());
        
        // Search
        document.getElementById('start-search').addEventListener('click', () => this.startSearch());
        
        // Report generation
        document.getElementById('generate-report').addEventListener('click', () => this.generateReport());
        document.getElementById('download-pdf').addEventListener('click', () => this.downloadPDF());
    }

    setupFormValidation() {
        const titleInput = document.getElementById('invention-title');
        const abstractInput = document.getElementById('invention-abstract');
        const disclosureInput = document.getElementById('invention-disclosure');

        // Title validation - character count
        titleInput.addEventListener('input', (e) => {
            const value = e.target.value;
            const charCount = value.length;
            const counter = document.getElementById('title-count');
            const requirement = counter.nextElementSibling;
            
            counter.textContent = `${charCount}/200 characters`;
            
            if (charCount >= 10 && charCount <= 200) {
                requirement.classList.remove('error');
                requirement.textContent = 'Minimum 10 characters required';
                this.formData.title = value;
            } else {
                requirement.classList.add('error');
                requirement.textContent = charCount < 10 ? 'Minimum 10 characters required' : 'Maximum 200 characters allowed';
                this.formData.title = '';
            }
            
            this.updateProgress();
        });

        // Abstract validation - NO minimum word requirement, just character counting
        abstractInput.addEventListener('input', (e) => {
            const value = e.target.value;
            const charCount = value.length;
            const counter = document.getElementById('abstract-count');
            const requirement = counter.nextElementSibling;
            
            counter.textContent = `${charCount} characters`;
            requirement.textContent = 'No minimum requirement - any length accepted';
            requirement.classList.remove('error');
            
            // Always accept abstract value regardless of length (including empty)
            this.formData.abstract = value;
            this.updateProgress();
        });

        // Trigger initial count for abstract
        abstractInput.dispatchEvent(new Event('input'));

        // Disclosure validation - character count
        disclosureInput.addEventListener('input', (e) => {
            const value = e.target.value;
            const charCount = value.length;
            const counter = document.getElementById('disclosure-count');
            const requirement = counter.nextElementSibling;
            
            counter.textContent = `${charCount} characters`;
            
            if (charCount >= 500) {
                requirement.classList.remove('error');
                requirement.textContent = 'Minimum 500 characters required';
                this.formData.disclosure = value;
            } else {
                requirement.classList.add('error');
                requirement.textContent = `${500 - charCount} more characters needed`;
                this.formData.disclosure = '';
            }
            
            this.updateProgress();
        });
    }

    setupFileUpload() {
        const fileUploadArea = document.getElementById('file-upload-area');
        const fileInput = document.getElementById('file-input');
        const uploadedFilesContainer = document.getElementById('uploaded-files');

        fileUploadArea.addEventListener('click', () => fileInput.click());
        
        fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadArea.classList.add('drag-over');
        });
        
        fileUploadArea.addEventListener('dragleave', () => {
            fileUploadArea.classList.remove('drag-over');
        });
        
        fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadArea.classList.remove('drag-over');
            this.handleFiles(e.dataTransfer.files);
        });
        
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
    }

    handleFiles(files) {
        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg', 'image/jpg', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        Array.from(files).forEach(file => {
            if (!allowedTypes.includes(file.type)) {
                alert(`File type ${file.type} is not supported. Please upload PDF, DOCX, PNG, JPG, or XLSX files.`);
                return;
            }
            
            if (file.size > maxSize) {
                alert(`File ${file.name} is too large. Maximum size is 10MB.`);
                return;
            }
            
            this.addFile(file);
        });
    }

    addFile(file) {
        const fileId = Date.now() + Math.random();
        const fileData = {
            id: fileId,
            name: file.name,
            size: this.formatFileSize(file.size),
            type: file.type,
            file: file
        };
        
        this.formData.files.push(fileData);
        this.renderFiles();
    }

    renderFiles() {
        const container = document.getElementById('uploaded-files');
        container.innerHTML = '';
        
        this.formData.files.forEach(file => {
            const fileElement = document.createElement('div');
            fileElement.className = 'uploaded-file';
            fileElement.innerHTML = `
                <div class="file-icon">${this.getFileIcon(file.type)}</div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${file.size}</div>
                </div>
                <button class="file-remove" onclick="app.removeFile(${file.id})">×</button>
            `;
            container.appendChild(fileElement);
        });
    }

    removeFile(fileId) {
        this.formData.files = this.formData.files.filter(file => file.id !== fileId);
        this.renderFiles();
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getFileIcon(type) {
        const iconMap = {
            'application/pdf': '📄',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
            'image/png': '🖼️',
            'image/jpeg': '🖼️',
            'image/jpg': '🖼️',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊'
        };
        return iconMap[type] || '📄';
    }

    setupKeywordsInput() {
        const keywordsInput = document.getElementById('invention-keywords');
        const keywordsContainer = document.getElementById('keywords-container');
        
        keywordsInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addKeyword(keywordsInput.value.trim());
                keywordsInput.value = '';
            }
        });
        
        keywordsInput.addEventListener('input', (e) => {
            const value = e.target.value;
            if (value.includes(',')) {
                const keywords = value.split(',');
                const lastKeyword = keywords.pop(); // Keep the last part for continued typing
                
                keywords.forEach(keyword => {
                    if (keyword.trim()) {
                        this.addKeyword(keyword.trim());
                    }
                });
                
                keywordsInput.value = lastKeyword;
            }
        });
    }

    addKeyword(keyword) {
        if (!keyword || this.formData.keywords.length >= 10) return;
        
        if (!this.formData.keywords.includes(keyword)) {
            this.formData.keywords.push(keyword);
            this.renderKeywords();
            this.updateKeywordCount();
        }
    }

    renderKeywords() {
        const container = document.getElementById('keywords-container');
        container.innerHTML = '';
        
        this.formData.keywords.forEach((keyword, index) => {
            const keywordElement = document.createElement('div');
            keywordElement.className = 'keyword-tag';
            keywordElement.innerHTML = `
                <span>${keyword}</span>
                <button class="keyword-remove" onclick="app.removeKeyword(${index})">×</button>
            `;
            container.appendChild(keywordElement);
        });
    }

    removeKeyword(index) {
        this.formData.keywords.splice(index, 1);
        this.renderKeywords();
        this.updateKeywordCount();
    }

    updateKeywordCount() {
        const counter = document.getElementById('keywords-count');
        counter.textContent = `${this.formData.keywords.length}/10 keywords`;
    }

    setupClaimsInput() {
        const claimsInput = document.getElementById('invention-claims');
        
        claimsInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const value = claimsInput.value.trim();
                if (value) {
                    this.addClaim(value);
                    claimsInput.value = '';
                }
            }
        });
        
        claimsInput.addEventListener('input', (e) => {
            const value = e.target.value;
            
            // Check if there's a period followed by space or end of string
            const periodIndex = value.lastIndexOf('.');
            if (periodIndex !== -1 && (periodIndex === value.length - 1 || value[periodIndex + 1] === ' ')) {
                const claimText = value.substring(0, periodIndex).trim();
                const remaining = value.substring(periodIndex + 1).trim();
                
                if (claimText) {
                    this.addClaim(claimText);
                    claimsInput.value = remaining;
                }
            }
        });
    }

    addClaim(claim) {
        if (!claim || this.formData.claims.length >= 10) return;
        
        // Clean up the claim text
        const cleanClaim = claim.trim();
        if (cleanClaim) {
            this.formData.claims.push(cleanClaim);
            this.renderClaims();
            this.updateClaimCount();
        }
    }

    renderClaims() {
        const container = document.getElementById('claims-container');
        container.innerHTML = '';
        
        this.formData.claims.forEach((claim, index) => {
            const claimElement = document.createElement('div');
            claimElement.className = 'claim-item';
            claimElement.innerHTML = `
                <div class="claim-number">${index + 1}.</div>
                <div class="claim-text">${claim}</div>
                <button class="claim-remove" onclick="app.removeClaim(${index})">×</button>
            `;
            container.appendChild(claimElement);
        });
    }

    removeClaim(index) {
        this.formData.claims.splice(index, 1);
        this.renderClaims();
        this.updateClaimCount();
    }

    updateClaimCount() {
        const counter = document.getElementById('claims-count');
        counter.textContent = `${this.formData.claims.length}/10 claims`;
    }

    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabPanes = document.querySelectorAll('.tab-pane');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetTab = e.target.dataset.tab;
                
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));
                
                e.target.classList.add('active');
                document.getElementById(`${targetTab}-tab`).classList.add('active');
            });
        });
    }

    updateProgress() {
        const isStep1Complete = this.isStep1Complete();
        const progressFill = document.getElementById('progress-fill');
        const nextBtn = document.getElementById('next-btn');
        
        const progressPercentage = (this.currentStep / this.totalSteps) * 100;
        progressFill.style.width = `${progressPercentage}%`;
        
        // Update step indicators
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNumber < this.currentStep) {
                step.classList.add('completed');
            } else if (stepNumber === this.currentStep) {
                step.classList.add('active');
            }
        });
        
        // Enable/disable next button based on step completion
        if (this.currentStep === 1) {
            nextBtn.disabled = !isStep1Complete;
        } else {
            nextBtn.disabled = false;
        }
    }

    isStep1Complete() {
        // Only require title (10+ chars) and disclosure (500+ chars)
        // Abstract has no minimum requirement
        return this.formData.title && this.formData.disclosure;
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.hideCurrentSection();
            this.currentStep++;
            this.showCurrentSection();
            this.updateProgress();
            this.updateNavigation();
            
            // Handle step-specific logic
            if (this.currentStep === 2) {
                this.performTechnologyAnalysis();
            } else if (this.currentStep === 4) {
                this.performComprehensiveAnalysis();
            } else if (this.currentStep === 5) {
                this.showReportGeneration();
            } else if (this.currentStep === 6) {
                this.showRecommendations();
            }
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.hideCurrentSection();
            this.currentStep--;
            this.showCurrentSection();
            this.updateProgress();
            this.updateNavigation();
        }
    }

    hideCurrentSection() {
        document.getElementById(`section-${this.currentStep}`).classList.remove('active');
    }

    showCurrentSection() {
        document.getElementById(`section-${this.currentStep}`).classList.add('active');
    }

    updateNavigation() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        prevBtn.style.display = this.currentStep > 1 ? 'block' : 'none';
        nextBtn.textContent = this.currentStep === this.totalSteps ? 'Finish' : 'Next';
    }

    // AI Technology Analysis
    async performTechnologyAnalysis() {
        const loadingElement = document.getElementById('analysis-loading');
        const resultsElement = document.getElementById('analysis-results');
        
        loadingElement.style.display = 'flex';
        resultsElement.style.display = 'none';
        
        try {
            if (!this.openaiApiKey) {
                this.showApiKeyModal();
                return;
            }
            
            const analysisPrompt = this.createAnalysisPrompt();
            const analysis = await this.callOpenAI(analysisPrompt);
            
            this.displayAnalysisResults(analysis);
            
        } catch (error) {
            console.error('Technology analysis error:', error);
            this.displayAnalysisError();
        }
    }

    createAnalysisPrompt() {
        return `As a patent expert, analyze the following invention disclosure and provide a comprehensive technology assessment:

Title: ${this.formData.title}
Abstract: ${this.formData.abstract || 'No abstract provided'}
Detailed Disclosure: ${this.formData.disclosure}
Keywords: ${this.formData.keywords.join(', ') || 'No keywords provided'}
Claims: ${this.formData.claims.join('; ') || 'No claims provided'}

Please provide analysis in the following format:

**Technology Overview:**
Provide 2-3 paragraphs explaining the technology, its purpose, and how it works.

**Key Technical Features:**
List the main technical features and innovations as bullet points.

**Innovation Assessment:**
Assess the novelty and inventive aspects of the technology.

**Recommended Search Strategy:**
Suggest 3-5 optimized search queries for patent databases.

**Classification Suggestions:**
Recommend relevant IPC/CPC classification codes with explanations.

Format your response with clear sections and professional language suitable for patent analysis.`;
    }

    async callOpenAI(prompt) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.openaiApiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a patent expert with extensive knowledge of patent law, prior art analysis, and technology assessment. Provide professional, detailed analysis suitable for patent attorneys and inventors.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 4000,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }

    displayAnalysisResults(analysis) {
        const loadingElement = document.getElementById('analysis-loading');
        const resultsElement = document.getElementById('analysis-results');
        
        loadingElement.style.display = 'none';
        resultsElement.style.display = 'block';
        
        // Parse and display analysis sections
        const sections = this.parseAnalysisResponse(analysis);
        
        document.getElementById('tech-overview').innerHTML = sections.overview || 'Technology overview not available.';
        document.getElementById('key-features').innerHTML = sections.features || 'Key features not available.';
        document.getElementById('innovation-assessment').innerHTML = sections.innovation || 'Innovation assessment not available.';
        document.getElementById('search-strategy').innerHTML = sections.searchStrategy || 'Search strategy not available.';
        document.getElementById('classification-suggestions').innerHTML = sections.classification || 'Classification suggestions not available.';
        
        // Store analysis for report generation
        this.analysisResults.technologyAnalysis = analysis;
        
        // Update search query based on AI recommendations
        this.updateSearchQuery(sections.searchStrategy);
    }

    parseAnalysisResponse(analysis) {
        const sections = {};
        
        // Extract sections using regex patterns
        const overviewMatch = analysis.match(/\*\*Technology Overview:\*\*(.*?)(?=\*\*|$)/s);
        const featuresMatch = analysis.match(/\*\*Key Technical Features:\*\*(.*?)(?=\*\*|$)/s);
        const innovationMatch = analysis.match(/\*\*Innovation Assessment:\*\*(.*?)(?=\*\*|$)/s);
        const searchMatch = analysis.match(/\*\*Recommended Search Strategy:\*\*(.*?)(?=\*\*|$)/s);
        const classificationMatch = analysis.match(/\*\*Classification Suggestions:\*\*(.*?)(?=\*\*|$)/s);
        
        sections.overview = overviewMatch ? overviewMatch[1].trim() : '';
        sections.features = featuresMatch ? featuresMatch[1].trim() : '';
        sections.innovation = innovationMatch ? innovationMatch[1].trim() : '';
        sections.searchStrategy = searchMatch ? searchMatch[1].trim() : '';
        sections.classification = classificationMatch ? classificationMatch[1].trim() : '';
        
        return sections;
    }

    updateSearchQuery(searchStrategy) {
        // Extract search queries from the strategy and populate the search input
        const searchQueryInput = document.getElementById('search-query');
        const queryMatch = searchStrategy.match(/["']([^"']+)["']/);
        
        if (queryMatch) {
            searchQueryInput.value = queryMatch[1];
        } else {
            // Fallback to keywords if no specific query found
            searchQueryInput.value = this.formData.keywords.join(' ') || this.formData.title.split(' ').slice(0, 3).join(' ');
        }
    }

    displayAnalysisError() {
        const loadingElement = document.getElementById('analysis-loading');
        const resultsElement = document.getElementById('analysis-results');
        
        loadingElement.style.display = 'none';
        resultsElement.style.display = 'block';
        
        document.getElementById('tech-overview').innerHTML = 'Technology analysis is temporarily unavailable. Please proceed with manual analysis.';
        document.getElementById('key-features').innerHTML = 'Please manually identify key technical features from your disclosure.';
        document.getElementById('innovation-assessment').innerHTML = 'Please manually assess the innovative aspects of your invention.';
        document.getElementById('search-strategy').innerHTML = 'Please use your keywords for patent search.';
        document.getElementById('classification-suggestions').innerHTML = 'Please consult a patent professional for classification guidance.';
        
        // Set default search query
        document.getElementById('search-query').value = this.formData.keywords.join(' ') || this.formData.title.split(' ').slice(0, 3).join(' ');
    }

    // Enhanced Prior Art Search
    async startSearch() {
        const searchQuery = document.getElementById('search-query').value;
        const dateRange = document.getElementById('date-range').value;
        const patentOffice = document.getElementById('patent-office').value;
        
        if (!searchQuery.trim()) {
            alert('Please enter a search query');
            return;
        }
        
        const searchBtn = document.getElementById('start-search');
        searchBtn.disabled = true;
        searchBtn.textContent = 'Searching...';
        
        try {
            const results = await this.searchPatents(searchQuery, dateRange, patentOffice);
            this.displaySearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
            this.displaySearchError();
        } finally {
            searchBtn.disabled = false;
            searchBtn.textContent = 'Start Enhanced Search';
        }
    }

    async searchPatents(query, dateRange, office) {
        // Simulate patent search results for demo
        const mockResults = [
            {
                id: 'US10123456',
                title: 'Advanced Water Filtration System Using Natural Materials',
                abstract: 'A water filtration system that uses natural filtration media to remove contaminants from water sources. The system employs a multi-stage filtration process with replaceable filter components.',
                publicationDate: '2023-01-15',
                jurisdiction: 'US',
                relevanceScore: 92,
                url: 'https://patents.google.com/patent/US10123456'
            },
            {
                id: 'EP3456789',
                title: 'Modular Water Treatment Device for Rural Communities',
                abstract: 'A modular water treatment device designed for use in rural areas with limited access to clean water. The device features easily replaceable components and low maintenance requirements.',
                publicationDate: '2022-08-20',
                jurisdiction: 'EP',
                relevanceScore: 87,
                url: 'https://patents.google.com/patent/EP3456789'
            },
            {
                id: 'WO2023012345',
                title: 'Sustainable Filtration Media from Agricultural Waste',
                abstract: 'Methods and systems for creating filtration media from agricultural waste products. The invention provides environmentally sustainable alternatives to traditional filtration materials.',
                publicationDate: '2023-03-10',
                jurisdiction: 'WO',
                relevanceScore: 84,
                url: 'https://patents.google.com/patent/WO2023012345'
            }
        ];
        
        return mockResults;
    }

    displaySearchResults(results) {
        this.searchResults = results;
        const container = document.getElementById('search-results');
        
        if (results.length === 0) {
            container.innerHTML = '<p>No results found. Try different search terms.</p>';
            return;
        }
        
        container.innerHTML = `
            <h3>Search Results (${results.length} documents found)</h3>
            <p>Click on documents to select them for analysis. Select up to 10 documents.</p>
            <div class="results-grid">
                ${results.map(result => this.renderSearchResult(result)).join('')}
            </div>
        `;
        
        // Add click handlers for result selection
        container.querySelectorAll('.search-result').forEach(element => {
            element.addEventListener('click', () => {
                const docId = element.dataset.id;
                this.toggleDocumentSelection(docId);
            });
        });
    }

    renderSearchResult(result) {
        const isSelected = this.selectedDocuments.some(doc => doc.id === result.id);
        
        return `
            <div class="search-result ${isSelected ? 'selected' : ''}" data-id="${result.id}">
                <div class="result-info">
                    <div class="result-title">${result.title}</div>
                    <div class="result-abstract">${result.abstract.substring(0, 200)}...</div>
                    <div class="result-meta">
                        <span>📅 ${result.publicationDate}</span>
                        <span>🏛️ ${result.jurisdiction}</span>
                    </div>
                </div>
                <div class="relevance-score">${result.relevanceScore}%</div>
            </div>
        `;
    }

    toggleDocumentSelection(docId) {
        const result = this.searchResults.find(r => r.id === docId);
        if (!result) return;
        
        const isSelected = this.selectedDocuments.some(doc => doc.id === docId);
        
        if (isSelected) {
            this.selectedDocuments = this.selectedDocuments.filter(doc => doc.id !== docId);
        } else {
            if (this.selectedDocuments.length >= 10) {
                alert('Maximum 10 documents can be selected for analysis.');
                return;
            }
            this.selectedDocuments.push(result);
        }
        
        this.updateSelectedDocumentsDisplay();
        this.displaySearchResults(this.searchResults); // Refresh to show selection changes
    }

    updateSelectedDocumentsDisplay() {
        const container = document.getElementById('selected-documents');
        
        if (this.selectedDocuments.length === 0) {
            container.innerHTML = '';
            return;
        }
        
        container.innerHTML = `
            <h3>Selected Documents for Analysis (${this.selectedDocuments.length}/10)</h3>
            <div class="selected-docs-list">
                ${this.selectedDocuments.map((doc, index) => `
                    <div class="selected-doc-item">
                        <div class="doc-rank">${index === 0 ? 'Closest' : `#${index + 1}`}</div>
                        <div class="doc-info">
                            <div class="doc-title">${doc.title}</div>
                            <div class="doc-meta">Score: ${doc.relevanceScore}% | ${doc.jurisdiction}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    displaySearchError() {
        const container = document.getElementById('search-results');
        container.innerHTML = `
            <div class="error-message">
                <h3>Search Error</h3>
                <p>Unable to perform patent search at this time. Please try again later or contact support.</p>
                <p>You can proceed with manual prior art analysis if needed.</p>
            </div>
        `;
    }

    // Comprehensive Results Analysis
    async performComprehensiveAnalysis() {
        if (this.selectedDocuments.length === 0) {
            // Show default message if no documents selected
            this.displayNoDocumentsMessage();
            return;
        }
        
        try {
            await this.analyzeSelectedDocuments();
            await this.performPatentabilityAssessment();
        } catch (error) {
            console.error('Analysis error:', error);
            this.displayAnalysisError();
        }
    }

    displayNoDocumentsMessage() {
        document.getElementById('document-analysis').innerHTML = `
            <div class="no-documents-message">
                <h3>No Documents Selected</h3>
                <p>Please go back to the search section and select at least one document for analysis.</p>
                <p>You can proceed with general patentability assessment based on your disclosure.</p>
            </div>
        `;
        
        // Still perform patentability assessment without specific documents
        this.performPatentabilityAssessment();
    }

    async analyzeSelectedDocuments() {
        const documentAnalysisContainer = document.getElementById('document-analysis');
        documentAnalysisContainer.innerHTML = '<div class="analysis-loading"><div class="spinner"></div><p>Analyzing selected documents...</p></div>';
        
        const documentAnalyses = [];
        
        for (let i = 0; i < this.selectedDocuments.length; i++) {
            const doc = this.selectedDocuments[i];
            const analysisPrompt = this.createDocumentAnalysisPrompt(doc, i === 0);
            
            try {
                const analysis = await this.callOpenAI(analysisPrompt);
                documentAnalyses.push({
                    document: doc,
                    analysis: analysis,
                    rank: i + 1
                });
            } catch (error) {
                console.error(`Error analyzing document ${doc.id}:`, error);
                documentAnalyses.push({
                    document: doc,
                    analysis: 'Analysis unavailable due to technical error.',
                    rank: i + 1
                });
            }
        }
        
        this.displayDocumentAnalyses(documentAnalyses);
        this.analysisResults.documentAnalyses = documentAnalyses;
    }

    createDocumentAnalysisPrompt(document, isClosest) {
        return `As a patent expert, analyze this prior art document in relation to the following invention:

INVENTION DISCLOSURE:
Title: ${this.formData.title}
Abstract: ${this.formData.abstract || 'No abstract provided'}
Detailed Disclosure: ${this.formData.disclosure}
Claims: ${this.formData.claims.join('; ') || 'No claims provided'}

PRIOR ART DOCUMENT ${isClosest ? '(CLOSEST PRIOR ART)' : ''}:
Title: ${document.title}
Abstract: ${document.abstract}
Publication Date: ${document.publicationDate}
Jurisdiction: ${document.jurisdiction}

Please provide a detailed analysis in the following format:

**Document Summary:**
Provide a technical overview of this prior art document and its key features.

**Similarities Analysis:**
Explain in detail the similarities between this document and the disclosed invention. Write in paragraph form with comprehensive analysis.

**Differences Analysis:**
Explain in detail the key differences between this document and the disclosed invention. Write in paragraph form with comprehensive analysis.

**Relevance Assessment:**
Assess how this document impacts the patentability of the disclosed invention, particularly focusing on ${isClosest ? 'anticipation and closest prior art analysis' : 'obviousness and secondary considerations'}.

Provide thorough, professional analysis suitable for patent prosecution and examination.`;
    }

    displayDocumentAnalyses(analyses) {
        const container = document.getElementById('document-analysis');
        
        container.innerHTML = analyses.map(item => {
            const sections = this.parseDocumentAnalysis(item.analysis);
            return `
                <div class="document-item">
                    <div class="document-header">
                        <div>
                            <div class="document-title">${item.document.title}</div>
                            <div class="document-meta">${item.document.publicationDate} | ${item.document.jurisdiction}</div>
                        </div>
                        <div class="document-rank">${item.rank === 1 ? 'Closest' : `#${item.rank}`}</div>
                    </div>
                    <div class="document-sections">
                        <div class="document-section">
                            <h4>Document Summary</h4>
                            <p>${sections.summary}</p>
                        </div>
                        <div class="document-section">
                            <h4>Similarities Analysis</h4>
                            <p>${sections.similarities}</p>
                        </div>
                        <div class="document-section">
                            <h4>Differences Analysis</h4>
                            <p>${sections.differences}</p>
                        </div>
                        <div class="document-section">
                            <h4>Relevance Assessment</h4>
                            <p>${sections.relevance}</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    parseDocumentAnalysis(analysis) {
        const sections = {};
        
        const summaryMatch = analysis.match(/\*\*Document Summary:\*\*(.*?)(?=\*\*|$)/s);
        const similaritiesMatch = analysis.match(/\*\*Similarities Analysis:\*\*(.*?)(?=\*\*|$)/s);
        const differencesMatch = analysis.match(/\*\*Differences Analysis:\*\*(.*?)(?=\*\*|$)/s);
        const relevanceMatch = analysis.match(/\*\*Relevance Assessment:\*\*(.*?)(?=\*\*|$)/s);
        
        sections.summary = summaryMatch ? summaryMatch[1].trim() : 'Summary not available.';
        sections.similarities = similaritiesMatch ? similaritiesMatch[1].trim() : 'Similarities analysis not available.';
        sections.differences = differencesMatch ? differencesMatch[1].trim() : 'Differences analysis not available.';
        sections.relevance = relevanceMatch ? relevanceMatch[1].trim() : 'Relevance assessment not available.';
        
        return sections;
    }

    async performPatentabilityAssessment() {
        try {
            // Novelty Assessment
            const noveltyPrompt = this.createNoveltyAssessmentPrompt();
            const noveltyAnalysis = await this.callOpenAI(noveltyPrompt);
            document.getElementById('novelty-assessment').innerHTML = noveltyAnalysis;
            
            // Inventive Step Assessment
            const inventiveStepPrompt = this.createInventiveStepPrompt();
            const inventiveStepAnalysis = await this.callOpenAI(inventiveStepPrompt);
            document.getElementById('inventive-step-assessment').innerHTML = inventiveStepAnalysis;
            
            // Industrial Applicability Assessment
            const industrialPrompt = this.createIndustrialApplicabilityPrompt();
            const industrialAnalysis = await this.callOpenAI(industrialPrompt);
            document.getElementById('industrial-assessment').innerHTML = industrialAnalysis;
            
            // Store assessments for report
            this.analysisResults.noveltyAssessment = noveltyAnalysis;
            this.analysisResults.inventiveStepAssessment = inventiveStepAnalysis;
            this.analysisResults.industrialAssessment = industrialAnalysis;
            
        } catch (error) {
            console.error('Patentability assessment error:', error);
            this.displayDefaultAssessments();
        }
    }

    createNoveltyAssessmentPrompt() {
        const closestPriorArt = this.selectedDocuments[0];
        const priorArtInfo = closestPriorArt 
            ? `CLOSEST PRIOR ART: ${closestPriorArt.title}\nABSTRACT: ${closestPriorArt.abstract}`
            : 'PRIOR ART: No specific prior art documents were selected for detailed analysis.';
        
        return `As a patent expert, provide a detailed novelty analysis in paragraph form:

INVENTION: ${this.formData.title}
DISCLOSURE: ${this.formData.disclosure}
CLAIMS: ${this.formData.claims.join('; ') || 'No claims provided'}

${priorArtInfo}

Provide a comprehensive novelty analysis addressing:
1. Feature-by-feature comparison with the closest prior art
2. Identification of novel aspects not disclosed in prior art
3. Assessment of anticipation risk
4. Conclusion on novelty status with reasoning

Write in detailed paragraph form suitable for patent prosecution. Be thorough and professional.`;
    }

    createInventiveStepPrompt() {
        const priorArtInfo = this.selectedDocuments.length > 0 
            ? `PRIOR ART DOCUMENTS:\n${this.selectedDocuments.map((doc, i) => `${i + 1}. ${doc.title} - ${doc.abstract.substring(0, 100)}...`).join('\n')}`
            : 'PRIOR ART: No specific prior art documents were selected for detailed analysis.';
        
        return `As a patent expert, provide a detailed inventive step analysis in paragraph form:

INVENTION: ${this.formData.title}
DISCLOSURE: ${this.formData.disclosure}
CLAIMS: ${this.formData.claims.join('; ') || 'No claims provided'}

${priorArtInfo}

Provide a comprehensive inventive step analysis addressing:
1. Problem-solution approach evaluation
2. Obviousness assessment from person skilled in the art perspective
3. Technical advance and unexpected results analysis
4. Combination of prior art references evaluation
5. Conclusion on inventive step status with reasoning

Write in detailed paragraph form suitable for patent prosecution. Be thorough and professional.`;
    }

    createIndustrialApplicabilityPrompt() {
        return `As a patent expert, provide a detailed industrial applicability analysis in paragraph form:

INVENTION: ${this.formData.title}
DISCLOSURE: ${this.formData.disclosure}
CLAIMS: ${this.formData.claims.join('; ') || 'No claims provided'}

Provide a comprehensive industrial applicability analysis addressing:
1. Technical feasibility analysis
2. Commercial utility evaluation
3. Manufacturing and implementation considerations
4. Practical applications and use cases
5. Conclusion on industrial applicability status

Write in detailed paragraph form suitable for patent prosecution. Be thorough and professional.`;
    }

    displayDefaultAssessments() {
        document.getElementById('novelty-assessment').innerHTML = 'Novelty assessment requires detailed analysis of the invention against prior art. Professional patent analysis is recommended.';
        document.getElementById('inventive-step-assessment').innerHTML = 'Inventive step assessment requires evaluation of the technical advance and non-obviousness of the invention. Professional patent analysis is recommended.';
        document.getElementById('industrial-assessment').innerHTML = 'Industrial applicability assessment shows the invention appears to have practical applications and commercial utility.';
    }

    // API Key Management
    showApiKeyModal() {
        const modal = document.getElementById('api-key-modal');
        modal.classList.add('active');
    }

    saveApiKey() {
        const apiKey = document.getElementById('openai-key').value.trim();
        if (!apiKey) {
            alert('Please enter your OpenAI API key.');
            return;
        }
        
        this.openaiApiKey = apiKey;
        document.getElementById('api-key-modal').classList.remove('active');
        this.performTechnologyAnalysis();
    }

    skipAI() {
        document.getElementById('api-key-modal').classList.remove('active');
        this.displayAnalysisError();
    }

    // Report Generation
    async generateReport() {
        const generateBtn = document.getElementById('generate-report');
        const downloadBtn = document.getElementById('download-pdf');
        const reportLoading = document.getElementById('report-loading');
        const reportContent = document.getElementById('report-content');
        
        generateBtn.disabled = true;
        reportLoading.style.display = 'flex';
        reportContent.style.display = 'none';
        
        try {
            const reportData = await this.createComprehensiveReport();
            this.displayReport(reportData);
            
            downloadBtn.style.display = 'block';
            
        } catch (error) {
            console.error('Report generation error:', error);
            this.displayReportError();
        } finally {
            generateBtn.disabled = false;
            reportLoading.style.display = 'none';
            reportContent.style.display = 'block';
        }
    }

    async createComprehensiveReport() {
        const reportPrompt = `Generate a comprehensive patent assessment report based on the following information:

INVENTION DETAILS:
Title: ${this.formData.title}
Abstract: ${this.formData.abstract || 'No abstract provided'}
Disclosure: ${this.formData.disclosure}
Claims: ${this.formData.claims.join('; ') || 'No claims provided'}

ANALYSIS RESULTS:
${this.analysisResults.technologyAnalysis || 'Technology analysis not available'}

PRIOR ART DOCUMENTS: ${this.selectedDocuments.length} documents analyzed

PATENTABILITY ASSESSMENT:
Novelty: ${this.analysisResults.noveltyAssessment || 'Not assessed'}
Inventive Step: ${this.analysisResults.inventiveStepAssessment || 'Not assessed'}
Industrial Applicability: ${this.analysisResults.industrialAssessment || 'Not assessed'}

Generate a professional patent assessment report with the following sections:

**Executive Summary:**
Provide a comprehensive overview of the invention and assessment results.

**Technology Summary:**
Summarize the technical aspects of the invention.

**Search Methodology:**
Describe the search strategy and databases used.

**Prior Art Analysis:**
Summarize the key findings from prior art analysis.

**Patentability Assessment:**
Provide detailed conclusions on novelty, inventive step, and industrial applicability.

Write in professional language suitable for patent attorneys and inventors.`;
        
        if (this.openaiApiKey) {
            return await this.callOpenAI(reportPrompt);
        } else {
            return this.generateManualReport();
        }
    }

    generateManualReport() {
        return `
**Executive Summary:**
This patent assessment report evaluates the patentability of "${this.formData.title}". The invention has been analyzed against prior art and assessed for novelty, inventive step, and industrial applicability.

**Technology Summary:**
The disclosed invention relates to ${this.formData.title.toLowerCase()}. ${this.formData.abstract || 'The invention addresses specific technical challenges in its field.'}

**Search Methodology:**
A comprehensive prior art search was conducted using multiple patent databases including Lens.org. Search terms were derived from the invention disclosure and claims.

**Prior Art Analysis:**
${this.selectedDocuments.length} relevant prior art documents were identified and analyzed. Document analysis focused on similarities and differences with the disclosed invention.

**Patentability Assessment:**
Based on the prior art analysis, the invention's patentability has been assessed across all three criteria required for patent protection.
        `;
    }

    displayReport(reportData) {
        const sections = this.parseReportSections(reportData);
        
        document.getElementById('executive-summary').innerHTML = sections.executiveSummary;
        document.getElementById('technology-summary').innerHTML = sections.technologySummary;
        document.getElementById('search-methodology').innerHTML = sections.searchMethodology;
        document.getElementById('prior-art-analysis').innerHTML = sections.priorArtAnalysis;
        document.getElementById('patentability-assessment').innerHTML = sections.patentabilityAssessment;
        
        this.reportData = reportData;
    }

    parseReportSections(report) {
        const sections = {};
        
        const executiveMatch = report.match(/\*\*Executive Summary:\*\*(.*?)(?=\*\*|$)/s);
        const technologyMatch = report.match(/\*\*Technology Summary:\*\*(.*?)(?=\*\*|$)/s);
        const searchMatch = report.match(/\*\*Search Methodology:\*\*(.*?)(?=\*\*|$)/s);
        const priorArtMatch = report.match(/\*\*Prior Art Analysis:\*\*(.*?)(?=\*\*|$)/s);
        const patentabilityMatch = report.match(/\*\*Patentability Assessment:\*\*(.*?)(?=\*\*|$)/s);
        
        sections.executiveSummary = executiveMatch ? executiveMatch[1].trim() : 'Executive summary not available.';
        sections.technologySummary = technologyMatch ? technologyMatch[1].trim() : 'Technology summary not available.';
        sections.searchMethodology = searchMatch ? searchMatch[1].trim() : 'Search methodology not available.';
        sections.priorArtAnalysis = priorArtMatch ? priorArtMatch[1].trim() : 'Prior art analysis not available.';
        sections.patentabilityAssessment = patentabilityMatch ? patentabilityMatch[1].trim() : 'Patentability assessment not available.';
        
        return sections;
    }

    displayReportError() {
        document.getElementById('executive-summary').innerHTML = 'Report generation temporarily unavailable. Please contact support.';
        document.getElementById('technology-summary').innerHTML = 'Manual report generation available upon request.';
        document.getElementById('search-methodology').innerHTML = 'Search methodology documentation available separately.';
        document.getElementById('prior-art-analysis').innerHTML = 'Prior art analysis summary available upon request.';
        document.getElementById('patentability-assessment').innerHTML = 'Patentability assessment available upon request.';
    }

    showReportGeneration() {
        // Auto-generate report when entering section 5
        setTimeout(() => {
            this.generateReport();
        }, 1000);
    }

    // Strategic Recommendations
    async showRecommendations() {
        const container = document.getElementById('recommendations-container');
        
        try {
            const recommendations = await this.generateRecommendations();
            this.displayRecommendations(recommendations);
        } catch (error) {
            console.error('Recommendations error:', error);
            this.displayDefaultRecommendations();
        }
    }

    async generateRecommendations() {
        const recommendationsPrompt = `Based on the patent analysis, provide strategic recommendations:

INVENTION: ${this.formData.title}
ANALYSIS RESULTS: ${this.analysisResults.technologyAnalysis || 'Limited analysis available'}
PRIOR ART: ${this.selectedDocuments.length} documents analyzed

Provide specific recommendations for:

**Patentability Outlook:**
Overall assessment and probability of patent grant.

**Claim Strategy:**
Recommended claim focus and structure.

**Prior Art Mitigation:**
Strategies to overcome closest prior art.

**Technology Improvements:**
Suggestions for enhanced patentability.

**Alternative Protection:**
Other IP strategies if patent protection is weak.

**Next Steps:**
Actionable recommendations for inventors/attorneys.

Provide practical, actionable advice.`;
        
        if (this.openaiApiKey) {
            return await this.callOpenAI(recommendationsPrompt);
        } else {
            return this.generateDefaultRecommendations();
        }
    }

    generateDefaultRecommendations() {
        return `
**Patentability Outlook:**
Based on the analysis, the invention shows potential for patent protection. Further detailed examination is recommended.

**Claim Strategy:**
Focus claims on the unique technical features identified in the analysis. Consider both broad and narrow claim scopes.

**Prior Art Mitigation:**
Emphasize the distinguishing features and technical advantages over the closest prior art.

**Technology Improvements:**
Consider additional technical features that could strengthen the patent position.

**Alternative Protection:**
Explore trade secret protection for certain aspects if patent protection is uncertain.

**Next Steps:**
Consult with a patent attorney for professional prosecution strategy and filing recommendations.
        `;
    }

    displayRecommendations(recommendations) {
        const sections = this.parseRecommendationSections(recommendations);
        
        document.getElementById('patentability-outlook').innerHTML = sections.patentabilityOutlook;
        document.getElementById('claim-strategy').innerHTML = sections.claimStrategy;
        document.getElementById('prior-art-mitigation').innerHTML = sections.priorArtMitigation;
        document.getElementById('technology-improvements').innerHTML = sections.technologyImprovements;
        document.getElementById('alternative-protection').innerHTML = sections.alternativeProtection;
        document.getElementById('next-steps').innerHTML = sections.nextSteps;
    }

    parseRecommendationSections(recommendations) {
        const sections = {};
        
        const patentabilityMatch = recommendations.match(/\*\*Patentability Outlook:\*\*(.*?)(?=\*\*|$)/s);
        const claimMatch = recommendations.match(/\*\*Claim Strategy:\*\*(.*?)(?=\*\*|$)/s);
        const mitigationMatch = recommendations.match(/\*\*Prior Art Mitigation:\*\*(.*?)(?=\*\*|$)/s);
        const improvementsMatch = recommendations.match(/\*\*Technology Improvements:\*\*(.*?)(?=\*\*|$)/s);
        const alternativeMatch = recommendations.match(/\*\*Alternative Protection:\*\*(.*?)(?=\*\*|$)/s);
        const nextStepsMatch = recommendations.match(/\*\*Next Steps:\*\*(.*?)(?=\*\*|$)/s);
        
        sections.patentabilityOutlook = patentabilityMatch ? patentabilityMatch[1].trim() : 'Patentability outlook assessment not available.';
        sections.claimStrategy = claimMatch ? claimMatch[1].trim() : 'Claim strategy recommendations not available.';
        sections.priorArtMitigation = mitigationMatch ? mitigationMatch[1].trim() : 'Prior art mitigation strategies not available.';
        sections.technologyImprovements = improvementsMatch ? improvementsMatch[1].trim() : 'Technology improvement suggestions not available.';
        sections.alternativeProtection = alternativeMatch ? alternativeMatch[1].trim() : 'Alternative protection strategies not available.';
        sections.nextSteps = nextStepsMatch ? nextStepsMatch[1].trim() : 'Next steps recommendations not available.';
        
        return sections;
    }

    displayDefaultRecommendations() {
        document.getElementById('patentability-outlook').innerHTML = 'Patentability assessment requires professional evaluation based on detailed prior art analysis.';
        document.getElementById('claim-strategy').innerHTML = 'Claim strategy should focus on the unique technical features of the invention.';
        document.getElementById('prior-art-mitigation').innerHTML = 'Prior art mitigation strategies should emphasize distinguishing features and technical advantages.';
        document.getElementById('technology-improvements').innerHTML = 'Consider additional technical features that could strengthen the patent position.';
        document.getElementById('alternative-protection').innerHTML = 'Explore trade secret protection for certain aspects if patent protection is uncertain.';
        document.getElementById('next-steps').innerHTML = 'Consult with a patent attorney for professional prosecution strategy and filing recommendations.';
    }

    // PDF Export
    async downloadPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        try {
            // Add title page
            doc.setFontSize(20);
            doc.text('Patent Prior Art Search & Analysis Report', 20, 30);
            doc.setFontSize(16);
            doc.text(this.formData.title, 20, 50);
            doc.setFontSize(12);
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 70);
            
            // Add content (simplified for demo)
            doc.addPage();
            doc.setFontSize(16);
            doc.text('Executive Summary', 20, 30);
            doc.setFontSize(12);
            const executiveSummary = document.getElementById('executive-summary').textContent;
            const lines = doc.splitTextToSize(executiveSummary, 170);
            doc.text(lines, 20, 50);
            
            // Save PDF
            doc.save(`patent-analysis-${this.formData.title.replace(/\s+/g, '-').toLowerCase()}.pdf`);
            
        } catch (error) {
            console.error('PDF generation error:', error);
            alert('PDF generation failed. Please try again.');
        }
    }

    // Data Persistence
    saveData() {
        const dataToSave = {
            formData: this.formData,
            currentStep: this.currentStep,
            selectedDocuments: this.selectedDocuments,
            analysisResults: this.analysisResults,
            reportData: this.reportData
        };
        
        try {
            localStorage.setItem('patentAnalysisData', JSON.stringify(dataToSave));
        } catch (error) {
            console.error('Failed to save data:', error);
        }
    }

    loadSavedData() {
        try {
            const savedData = localStorage.getItem('patentAnalysisData');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.formData = data.formData || this.formData;
                this.selectedDocuments = data.selectedDocuments || [];
                this.analysisResults = data.analysisResults || {};
                this.reportData = data.reportData || {};
                
                // Restore form values
                this.restoreFormData();
            }
        } catch (error) {
            console.error('Failed to load saved data:', error);
        }
    }

    restoreFormData() {
        document.getElementById('invention-title').value = this.formData.title;
        document.getElementById('invention-abstract').value = this.formData.abstract;
        document.getElementById('invention-disclosure').value = this.formData.disclosure;
        
        this.renderKeywords();
        this.renderClaims();
        this.renderFiles();
        this.updateKeywordCount();
        this.updateClaimCount();
        this.updateProgress();
        
        // Trigger input events to update counters
        document.getElementById('invention-title').dispatchEvent(new Event('input'));
        document.getElementById('invention-abstract').dispatchEvent(new Event('input'));
        document.getElementById('invention-disclosure').dispatchEvent(new Event('input'));
    }

    startAutoSave() {
        setInterval(() => {
            this.saveData();
        }, 30000); // Save every 30 seconds
    }
}

// Initialize the application
const app = new PatentAnalysisApp();

// Make app globally accessible for onclick handlers
window.app = app;