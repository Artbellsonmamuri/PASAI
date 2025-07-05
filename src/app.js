class PatentPriorArtApp {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.formData = {
            title: '',
            abstract: '',
            disclosure: '',
            keywords: [],
            claims: [],
            files: []
        };
        this.searchResults = [];
        this.analysisResults = {};
        this.formValidation = {
            title: false,
            abstract: false,
            disclosure: false
        };
        
        // Form requirements
        this.requirements = {
            title: { min: 10, max: 200, required: true },
            abstract: { minWords: 150, maxWords: 300, required: true },
            disclosure: { min: 500, required: true },
            keywords: { max: 10, required: false },
            claims: { max: 10, required: false },
            files: { max: 20, required: false }
        };
        
        // Lens.org API token
        this.apiToken = 'NHaWYJh7KXwYbJt4mNSPGvfMMYGPW3z1n8jXLh2FIvm39WgQjnUH';
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupFileUpload();
        this.updateProgress();
        this.updateNavigationButtons();
    }
    
    setupEventListeners() {
        // Form field listeners
        document.getElementById('title').addEventListener('input', (e) => this.handleTitleInput(e));
        document.getElementById('abstract').addEventListener('input', (e) => this.handleAbstractInput(e));
        document.getElementById('disclosure').addEventListener('input', (e) => this.handleDisclosureInput(e));
        document.getElementById('keywords').addEventListener('keydown', (e) => this.handleKeywordsInput(e));
        document.getElementById('claims').addEventListener('keydown', (e) => this.handleClaimsInput(e));
        
        // Navigation listeners
        document.getElementById('nextBtn').addEventListener('click', () => this.nextStep());
        document.getElementById('prevBtn').addEventListener('click', () => this.prevStep());
        
        // Step navigation
        document.querySelectorAll('.step-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const step = parseInt(e.currentTarget.dataset.step);
                if (step <= this.currentStep || this.isStepAccessible(step)) {
                    this.goToStep(step);
                }
            });
        });
        
        // Report generation
        document.getElementById('generateReportBtn').addEventListener('click', () => this.generateReport());
        document.getElementById('downloadReportBtn').addEventListener('click', () => this.downloadReport());
    }
    
    setupFileUpload() {
        const uploadArea = document.getElementById('fileUploadArea');
        const fileInput = document.getElementById('fileInput');
        
        // Click to upload
        uploadArea.addEventListener('click', () => fileInput.click());
        
        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            this.handleFileUpload(e.dataTransfer.files);
        });
        
        // File input change
        fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });
    }
    
    handleTitleInput(e) {
        const value = e.target.value;
        const length = value.length;
        const counter = document.getElementById('titleCounter');
        const status = document.getElementById('titleStatus');
        
        counter.textContent = `${length}/${this.requirements.title.max} characters`;
        
        if (length >= this.requirements.title.min && length <= this.requirements.title.max) {
            status.textContent = 'Valid';
            status.className = 'validation-status valid';
            this.formData.title = value;
            this.formValidation.title = true;
        } else {
            status.textContent = length < this.requirements.title.min ? 'Too short' : 'Too long';
            status.className = 'validation-status invalid';
            this.formData.title = '';
            this.formValidation.title = false;
        }
        
        this.updateProgress();
    }
    
    handleAbstractInput(e) {
        const value = e.target.value;
        const words = value.trim().split(/\s+/).filter(word => word.length > 0);
        const wordCount = words.length;
        const counter = document.getElementById('abstractCounter');
        const status = document.getElementById('abstractStatus');
        
        counter.textContent = `${wordCount}/${this.requirements.abstract.maxWords} words`;
        
        if (wordCount >= this.requirements.abstract.minWords && wordCount <= this.requirements.abstract.maxWords) {
            status.textContent = 'Valid';
            status.className = 'validation-status valid';
            this.formData.abstract = value;
            this.formValidation.abstract = true;
        } else {
            status.textContent = wordCount < this.requirements.abstract.minWords ? 'Too few words' : 'Too many words';
            status.className = 'validation-status invalid';
            this.formData.abstract = '';
            this.formValidation.abstract = false;
        }
        
        this.updateProgress();
    }
    
    handleDisclosureInput(e) {
        const value = e.target.value;
        const length = value.length;
        const counter = document.getElementById('disclosureCounter');
        const status = document.getElementById('disclosureStatus');
        
        counter.textContent = `${length}/${this.requirements.disclosure.min}+ characters`;
        
        if (length >= this.requirements.disclosure.min) {
            status.textContent = 'Valid';
            status.className = 'validation-status valid';
            this.formData.disclosure = value;
            this.formValidation.disclosure = true;
        } else {
            status.textContent = 'Too short';
            status.className = 'validation-status invalid';
            this.formData.disclosure = '';
            this.formValidation.disclosure = false;
        }
        
        this.updateProgress();
    }
    
    handleKeywordsInput(e) {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const value = e.target.value.trim();
            if (value && this.formData.keywords.length < this.requirements.keywords.max) {
                if (!this.formData.keywords.includes(value)) {
                    this.formData.keywords.push(value);
                    this.updateKeywordsList();
                    e.target.value = '';
                }
            }
        }
    }
    
    handleClaimsInput(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const value = e.target.value.trim();
            if (value && this.formData.claims.length < this.requirements.claims.max) {
                // Ensure claim ends with a period
                const claim = value.endsWith('.') ? value : value + '.';
                if (!this.formData.claims.includes(claim)) {
                    this.formData.claims.push(claim);
                    this.updateClaimsList();
                    e.target.value = '';
                }
            }
        }
    }
    
    updateKeywordsList() {
        const container = document.getElementById('keywordsList');
        const counter = document.getElementById('keywordsCounter');
        
        container.innerHTML = '';
        this.formData.keywords.forEach((keyword, index) => {
            const tag = document.createElement('span');
            tag.className = 'keyword-tag';
            tag.innerHTML = `
                ${keyword}
                <button type="button" class="remove-btn" data-index="${index}">×</button>
            `;
            container.appendChild(tag);
        });
        
        counter.textContent = `${this.formData.keywords.length}/${this.requirements.keywords.max} keywords`;
        
        // Add remove listeners
        container.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.formData.keywords.splice(index, 1);
                this.updateKeywordsList();
            });
        });
    }
    
    updateClaimsList() {
        const container = document.getElementById('claimsList');
        const counter = document.getElementById('claimsCounter');
        
        container.innerHTML = '';
        this.formData.claims.forEach((claim, index) => {
            const tag = document.createElement('div');
            tag.className = 'claim-tag';
            tag.innerHTML = `
                ${claim}
                <button type="button" class="remove-btn" data-index="${index}">×</button>
            `;
            container.appendChild(tag);
        });
        
        counter.textContent = `${this.formData.claims.length}/${this.requirements.claims.max} claims`;
        
        // Add remove listeners
        container.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.formData.claims.splice(index, 1);
                this.updateClaimsList();
            });
        });
    }
    
    handleFileUpload(files) {
        Array.from(files).forEach(file => {
            if (this.validateFile(file)) {
                this.formData.files.push(file);
                this.updateFilesList();
            }
        });
    }
    
    validateFile(file) {
        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg', 'image/jpg', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        if (!allowedTypes.includes(file.type)) {
            alert('File type not supported. Please use PDF, DOCX, PNG, JPG, JPEG, or XLSX files.');
            return false;
        }
        
        if (file.size > maxSize) {
            alert('File size exceeds 10MB limit.');
            return false;
        }
        
        if (this.formData.files.length >= this.requirements.files.max) {
            alert('Maximum number of files reached.');
            return false;
        }
        
        return true;
    }
    
    updateFilesList() {
        const container = document.getElementById('uploadedFiles');
        
        container.innerHTML = '';
        this.formData.files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            const fileExtension = file.name.split('.').pop().toUpperCase();
            const fileSize = this.formatFileSize(file.size);
            
            fileItem.innerHTML = `
                <div class="file-info">
                    <div class="file-icon">${fileExtension}</div>
                    <div class="file-details">
                        <h4>${file.name}</h4>
                        <p>${fileSize}</p>
                    </div>
                </div>
                <button type="button" class="file-remove" data-index="${index}">Remove</button>
            `;
            
            container.appendChild(fileItem);
        });
        
        // Add remove listeners
        container.querySelectorAll('.file-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.formData.files.splice(index, 1);
                this.updateFilesList();
            });
        });
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    updateProgress() {
        // Check if all required fields are valid
        const allValid = this.formValidation.title && this.formValidation.abstract && this.formValidation.disclosure;
        const progress = allValid ? 100 : 0;
        
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = `${progress}% Complete`;
        
        this.updateNavigationButtons();
        
        return progress;
    }
    
    updateNavigationButtons() {
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');
        
        // Enable/disable previous button
        prevBtn.disabled = this.currentStep === 1;
        
        // Enable/disable next button based on step and completion
        if (this.currentStep === 1) {
            // Check if all required fields are valid
            const allValid = this.formValidation.title && this.formValidation.abstract && this.formValidation.disclosure;
            nextBtn.disabled = !allValid;
        } else {
            nextBtn.disabled = false;
        }
        
        // Update button text
        nextBtn.textContent = this.currentStep === this.totalSteps ? 'Complete' : 'Next';
    }
    
    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.goToStep(this.currentStep);
            
            // Trigger step-specific actions
            if (this.currentStep === 2) {
                this.performTechnologyAnalysis();
            } else if (this.currentStep === 3) {
                this.performPriorArtSearch();
            } else if (this.currentStep === 4) {
                this.displayTopResults();
            } else if (this.currentStep === 5) {
                this.prepareReportGeneration();
            }
        }
    }
    
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.goToStep(this.currentStep);
        }
    }
    
    goToStep(step) {
        // Hide all step contents
        document.querySelectorAll('.step-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Show selected step content
        document.getElementById(`step${step}`).classList.add('active');
        
        // Update step navigation
        document.querySelectorAll('.step-item').forEach(item => {
            item.classList.remove('active', 'completed');
            const itemStep = parseInt(item.dataset.step);
            if (itemStep === step) {
                item.classList.add('active');
            } else if (itemStep < step) {
                item.classList.add('completed');
            }
        });
        
        this.currentStep = step;
        this.updateNavigationButtons();
    }
    
    isStepAccessible(step) {
        // Only allow access to completed steps or next step
        return step <= this.currentStep + 1;
    }
    
    async performTechnologyAnalysis() {
        const steps = ['extractingConcepts', 'generatingQueries', 'preparingSearch'];
        
        for (let i = 0; i < steps.length; i++) {
            await this.simulateAnalysisStep(steps[i]);
        }
        
        // Show analysis results
        this.displayAnalysisResults();
    }
    
    async simulateAnalysisStep(stepId) {
        const step = document.getElementById(stepId);
        const icon = step.querySelector('.step-icon');
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mark as completed
        step.classList.add('completed');
        icon.textContent = '✓';
    }
    
    displayAnalysisResults() {
        const resultsContainer = document.getElementById('analysisResults');
        const conceptsList = document.getElementById('conceptsList');
        const queriesList = document.getElementById('queriesList');
        
        // Generate mock concepts based on form data
        const concepts = this.extractConcepts();
        const queries = this.generateSearchQueries(concepts);
        
        // Display concepts
        conceptsList.innerHTML = '';
        concepts.forEach(concept => {
            const tag = document.createElement('span');
            tag.className = 'concept-tag';
            tag.textContent = concept;
            conceptsList.appendChild(tag);
        });
        
        // Display queries
        queriesList.innerHTML = '';
        queries.forEach(query => {
            const tag = document.createElement('span');
            tag.className = 'query-tag';
            tag.textContent = query;
            queriesList.appendChild(tag);
        });
        
        resultsContainer.classList.remove('hidden');
    }
    
    extractConcepts() {
        const concepts = [];
        
        // Extract from title
        const titleWords = this.formData.title.toLowerCase().split(/\s+/).filter(word => word.length > 3);
        concepts.push(...titleWords);
        
        // Extract from keywords
        concepts.push(...this.formData.keywords);
        
        // Extract from abstract (key technical terms)
        const abstractWords = this.formData.abstract.toLowerCase().match(/\b\w{4,}\b/g) || [];
        const technicalTerms = abstractWords.filter(word => 
            word.includes('system') || word.includes('method') || word.includes('device') || 
            word.includes('process') || word.includes('apparatus') || word.includes('technology')
        );
        concepts.push(...technicalTerms.slice(0, 5));
        
        return [...new Set(concepts)].slice(0, 10); // Remove duplicates and limit
    }
    
    generateSearchQueries(concepts) {
        const queries = [];
        
        // Basic concept combinations
        if (concepts.length >= 2) {
            queries.push(`${concepts[0]} AND ${concepts[1]}`);
        }
        
        // Technology-specific queries
        concepts.forEach(concept => {
            queries.push(`${concept} AND (system OR method OR device)`);
        });
        
        // Patent-specific queries
        queries.push(`"${this.formData.title}" OR "${concepts[0]}"`);
        
        return queries.slice(0, 5); // Limit to 5 queries
    }
    
    async performPriorArtSearch() {
        const searchInfo = document.getElementById('searchInfo');
        const searchProgress = document.getElementById('searchProgress');
        
        // Simulate search progress
        for (let i = 0; i <= 100; i += 20) {
            searchProgress.textContent = `${i}% complete`;
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Simulate API call to Lens.org
        try {
            await this.searchLensAPI();
        } catch (error) {
            console.error('Search failed:', error);
            // Use mock data as fallback
            this.searchResults = this.generateMockSearchResults();
        }
        
        this.displaySearchResults();
    }
    
    async searchLensAPI() {
        // Mock API call - in real implementation, this would call Lens.org API
        const mockResults = this.generateMockSearchResults();
        this.searchResults = mockResults;
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    generateMockSearchResults() {
        return [
            {
                title: "Water Filtration System Using Agricultural Waste",
                publication_number: "US10123456B2",
                relevance_score: 0.95,
                abstract: "A water filtration system that utilizes agricultural waste materials to remove contaminants from water sources...",
                publication_date: "2023-01-15",
                inventors: ["Smith, J.", "Johnson, M."]
            },
            {
                title: "Modular Filtration Device for Rural Applications",
                publication_number: "EP2345678A1",
                relevance_score: 0.89,
                abstract: "A modular filtration device specifically designed for rural water treatment applications...",
                publication_date: "2022-11-20",
                inventors: ["Chen, L.", "Wilson, K."]
            },
            {
                title: "Bio-based Water Treatment Method",
                publication_number: "CN109876543B",
                relevance_score: 0.82,
                abstract: "A biological water treatment method using organic materials for contaminant removal...",
                publication_date: "2023-03-10",
                inventors: ["Liu, X.", "Zhang, Y."]
            },
            {
                title: "Sustainable Water Purification System",
                publication_number: "US20220334567A1",
                relevance_score: 0.78,
                abstract: "A sustainable water purification system incorporating renewable materials and energy sources...",
                publication_date: "2022-08-30",
                inventors: ["Brown, R.", "Davis, S."]
            },
            {
                title: "Portable Water Treatment Apparatus",
                publication_number: "JP2023123456A",
                relevance_score: 0.75,
                abstract: "A portable water treatment apparatus suitable for emergency and remote area applications...",
                publication_date: "2023-02-05",
                inventors: ["Tanaka, H.", "Yamamoto, K."]
            }
        ];
    }
    
    displaySearchResults() {
        const resultsContainer = document.getElementById('searchResults');
        const resultsList = document.getElementById('resultsList');
        
        resultsList.innerHTML = '';
        
        this.searchResults.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            
            resultItem.innerHTML = `
                <div class="result-header">
                    <h3 class="result-title">${result.title}</h3>
                    <span class="relevance-score">${Math.round(result.relevance_score * 100)}%</span>
                </div>
                <div class="result-meta">
                    <span>Publication: ${result.publication_number}</span>
                    <span>Date: ${result.publication_date}</span>
                    <span>Inventors: ${result.inventors.join(', ')}</span>
                </div>
                <p class="result-abstract">${result.abstract}</p>
            `;
            
            resultsList.appendChild(resultItem);
        });
        
        resultsContainer.classList.remove('hidden');
    }
    
    displayTopResults() {
        const rankingContainer = document.getElementById('resultsRanking');
        
        // Sort results by relevance score and take top 10
        const topResults = this.searchResults
            .sort((a, b) => b.relevance_score - a.relevance_score)
            .slice(0, 10);
        
        rankingContainer.innerHTML = '';
        
        topResults.forEach((result, index) => {
            const rankingItem = document.createElement('div');
            rankingItem.className = 'ranking-item';
            
            rankingItem.innerHTML = `
                <div class="ranking-number">${index + 1}</div>
                <div class="ranking-content">
                    <h4 class="ranking-title">${result.title}</h4>
                    <p class="ranking-meta">
                        ${result.publication_number} • 
                        Relevance: ${Math.round(result.relevance_score * 100)}% • 
                        ${result.publication_date}
                    </p>
                </div>
            `;
            
            rankingContainer.appendChild(rankingItem);
        });
    }
    
    prepareReportGeneration() {
        const patentsAnalyzed = document.getElementById('patentsAnalyzed');
        const relevanceScore = document.getElementById('relevanceScore');
        const noveltyAssessment = document.getElementById('noveltyAssessment');
        
        // Calculate statistics
        const totalPatents = this.searchResults.length;
        const avgRelevance = this.searchResults.reduce((sum, result) => sum + result.relevance_score, 0) / totalPatents;
        const maxRelevance = Math.max(...this.searchResults.map(r => r.relevance_score));
        
        patentsAnalyzed.textContent = totalPatents;
        relevanceScore.textContent = `${Math.round(avgRelevance * 100)}%`;
        
        // Simple novelty assessment
        if (maxRelevance < 0.7) {
            noveltyAssessment.textContent = 'High';
            noveltyAssessment.className = 'stat-value text-success';
        } else if (maxRelevance < 0.85) {
            noveltyAssessment.textContent = 'Medium';
            noveltyAssessment.className = 'stat-value text-warning';
        } else {
            noveltyAssessment.textContent = 'Low';
            noveltyAssessment.className = 'stat-value text-error';
        }
    }
    
    async generateReport() {
        const generateBtn = document.getElementById('generateReportBtn');
        const downloadBtn = document.getElementById('downloadReportBtn');
        const loadingOverlay = document.getElementById('loadingOverlay');
        
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';
        loadingOverlay.classList.remove('hidden');
        
        try {
            // Simulate report generation time
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Generate PDF report
            await this.createPDFReport();
            
            generateBtn.textContent = 'Report Generated';
            downloadBtn.disabled = false;
            
        } catch (error) {
            console.error('Report generation failed:', error);
            generateBtn.textContent = 'Generate PDF Report';
            generateBtn.disabled = false;
        } finally {
            loadingOverlay.classList.add('hidden');
        }
    }
    
    async createPDFReport() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Title
        doc.setFontSize(20);
        doc.text('Patent Prior Art Search Report', 20, 30);
        
        // Invention details
        doc.setFontSize(14);
        doc.text('Invention Title:', 20, 50);
        doc.setFontSize(12);
        doc.text(this.formData.title, 20, 60);
        
        doc.setFontSize(14);
        doc.text('Abstract:', 20, 80);
        doc.setFontSize(10);
        const abstractLines = doc.splitTextToSize(this.formData.abstract, 170);
        doc.text(abstractLines, 20, 90);
        
        // Search results
        doc.setFontSize(14);
        doc.text('Top Prior Art Results:', 20, 130);
        
        let yPosition = 140;
        const topResults = this.searchResults.slice(0, 5);
        
        topResults.forEach((result, index) => {
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
            
            doc.setFontSize(12);
            doc.text(`${index + 1}. ${result.title}`, 20, yPosition);
            doc.setFontSize(10);
            doc.text(`Publication: ${result.publication_number}`, 25, yPosition + 10);
            doc.text(`Relevance: ${Math.round(result.relevance_score * 100)}%`, 25, yPosition + 20);
            
            yPosition += 35;
        });
        
        // Save the PDF
        this.generatedReport = doc;
    }
    
    downloadReport() {
        if (this.generatedReport) {
            this.generatedReport.save('patent-prior-art-report.pdf');
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.patentApp = new PatentPriorArtApp();
});