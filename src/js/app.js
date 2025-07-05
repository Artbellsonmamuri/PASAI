// Application State
let appState = {
    currentPage: 1,
    disclosureData: {
        title: '',
        abstract: '',
        technicalDisclosure: '',
        claims: '',
        keywords: [],
        uploadedFiles: []
    },
    analysisData: {
        concepts: [],
        classifications: [],
        searchStrategies: []
    },
    searchData: {
        results: [],
        totalResults: 0,
        searchTime: 0
    },
    selectedDocuments: [],
    reportData: {
        novelty: '',
        inventiveStep: '',
        industrialApplication: '',
        recommendations: [],
        executiveSummary: ''
    }
};

// API Configuration
const API_CONFIG = {
    lens: {
        token: 'NHaWYJh7KXwYbJt4mNSPGvfMMYGPW3z1n8jXLh2FIvm39WgQjnUH',
        endpoint: 'https://api.lens.org/patent/search'
    },
    google: {
        apiKey: 'placeholder_key',
        cx: 'placeholder_cx'
    }
};

// Sample Data
const SAMPLE_DATA = {
    concepts: [
        { term: 'Water Filtration', score: 95 },
        { term: 'Agricultural Waste', score: 88 },
        { term: 'Modular Design', score: 82 },
        { term: 'Corn Cob Particles', score: 90 },
        { term: 'Contaminant Removal', score: 85 },
        { term: 'Biodegradable Filter', score: 78 }
    ],
    classifications: [
        { code: 'C02F1/28', desc: 'Treatment of water by adsorption' },
        { code: 'C02F1/44', desc: 'Treatment of water by filtration' },
        { code: 'C02F3/00', desc: 'Biological treatment of water' }
    ],
    searchStrategies: [
        {
            title: 'Primary Search Strategy',
            query: 'TI:(water filtration) AND AB:(agricultural waste OR corn cob)'
        },
        {
            title: 'Secondary Search Strategy',
            query: 'CL:(modular AND filter) AND (biodegradable OR organic)'
        },
        {
            title: 'Classification Search',
            query: 'IPC:(C02F1/28 OR C02F1/44) AND PD:[20150101 TO 20231231]'
        }
    ],
    patents: [
        {
            id: 'US10123456B2',
            title: 'Advanced Water Filtration System Using Agricultural Waste',
            abstract: 'A water filtration device comprising corn cob particles enclosed in a modular housing for removing contaminants from water sources. The system includes multiple filter stages with replaceable cartridges containing processed agricultural waste materials.',
            publicationDate: '2023-03-15',
            office: 'USPTO',
            relevanceScore: 95,
            concepts: ['water filtration', 'agricultural waste', 'corn cob', 'modular design']
        },
        {
            id: 'WO2022234567A1',
            title: 'Biodegradable Filter Media for Water Treatment',
            abstract: 'A filter system utilizing organic waste materials for water purification applications in rural environments. The invention provides an environmentally friendly solution for clean water access.',
            publicationDate: '2022-11-10',
            office: 'WIPO',
            relevanceScore: 88,
            concepts: ['biodegradable', 'filter media', 'organic waste', 'water treatment']
        },
        {
            id: 'EP3456789B1',
            title: 'Modular Water Purification Apparatus',
            abstract: 'A modular water purification system with replaceable filter cartridges for use in low-resource settings. The apparatus features a compact design suitable for portable applications.',
            publicationDate: '2023-01-20',
            office: 'EPO',
            relevanceScore: 82,
            concepts: ['modular', 'water purification', 'replaceable', 'low-resource']
        }
    ]
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadSavedData();
    // Initial form progress update
    setTimeout(updateFormProgress, 100);
});

function initializeApp() {
    // Set initial page
    showPage(1);
    updateProgressNav(1);
    
    // Initialize form validation
    setupFormValidation();
    
    // Setup auto-save
    setupAutoSave();
}

function setupEventListeners() {
    // Navigation buttons
    document.getElementById('nextToAnalysis').addEventListener('click', () => {
        saveDisclosureData();
        showPage(2);
        startAnalysis();
    });
    
    document.getElementById('backToDisclosure').addEventListener('click', () => showPage(1));
    document.getElementById('startSearch').addEventListener('click', () => {
        showPage(3);
        startPriorArtSearch();
    });
    
    document.getElementById('backToAnalysis').addEventListener('click', () => showPage(2));
    document.getElementById('selectDocuments').addEventListener('click', () => {
        showPage(4);
        selectTopDocuments();
    });
    
    document.getElementById('backToSearch').addEventListener('click', () => showPage(3));
    document.getElementById('generateReport').addEventListener('click', () => {
        showPage(5);
        generateReport();
    });
    
    document.getElementById('backToSelection').addEventListener('click', () => showPage(4));
    document.getElementById('downloadReport').addEventListener('click', () => showPage(6));
    
    // Download buttons
    document.getElementById('downloadFullPDF').addEventListener('click', () => downloadPDF('full'));
    document.getElementById('downloadSummaryPDF').addEventListener('click', () => downloadPDF('summary'));
    document.getElementById('downloadDataJSON').addEventListener('click', () => downloadJSON());
    
    // New search buttons
    document.getElementById('startNewSearch').addEventListener('click', startNewSearch);
    document.getElementById('returnToDashboard').addEventListener('click', startNewSearch);
    
    // Form controls
    setupFormControls();
}

function setupFormControls() {
    // Character and word counters
    const titleInput = document.getElementById('inventionTitle');
    const abstractInput = document.getElementById('abstract');
    const disclosureInput = document.getElementById('technicalDisclosure');
    
    titleInput.addEventListener('input', function(e) {
        updateCharCounter(e);
        updateFormProgress();
    });
    
    abstractInput.addEventListener('input', function(e) {
        updateWordCounter(e);
        updateFormProgress();
    });
    
    disclosureInput.addEventListener('input', function(e) {
        updateCharCounter(e);
        updateFormProgress();
    });
    
    // Keywords input
    const keywordInput = document.getElementById('keywordInput');
    keywordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addKeyword();
        }
    });
    
    // Claims toggle
    document.getElementById('toggleClaims').addEventListener('click', toggleClaims);
    
    // File upload
    setupFileUpload();
}

function setupFileUpload() {
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('fileInput');
    
    fileUploadArea.addEventListener('click', () => fileInput.click());
    fileUploadArea.addEventListener('dragover', handleDragOver);
    fileUploadArea.addEventListener('drop', handleDrop);
    fileUploadArea.addEventListener('dragleave', handleDragLeave);
    
    fileInput.addEventListener('change', handleFileSelect);
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const files = e.dataTransfer.files;
    processFiles(files);
}

function handleFileSelect(e) {
    const files = e.target.files;
    processFiles(files);
}

function processFiles(files) {
    const supportedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    
    Array.from(files).forEach(file => {
        if (supportedTypes.includes(file.type)) {
            appState.disclosureData.uploadedFiles.push({
                name: file.name,
                size: file.size,
                type: file.type,
                id: generateId()
            });
        }
    });
    
    renderUploadedFiles();
    updateFormProgress();
}

function renderUploadedFiles() {
    const container = document.getElementById('uploadedFiles');
    container.innerHTML = '';
    
    appState.disclosureData.uploadedFiles.forEach(file => {
        const fileElement = document.createElement('div');
        fileElement.className = 'uploaded-file';
        fileElement.innerHTML = `
            <div class="file-info">
                <div class="file-icon">${getFileIcon(file.type)}</div>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
                </div>
            </div>
            <button type="button" class="file-remove" onclick="removeFile('${file.id}')">✕</button>
        `;
        container.appendChild(fileElement);
    });
}

function removeFile(fileId) {
    appState.disclosureData.uploadedFiles = appState.disclosureData.uploadedFiles.filter(f => f.id !== fileId);
    renderUploadedFiles();
    updateFormProgress();
}

function getFileIcon(type) {
    const icons = {
        'application/pdf': '📄',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
        'image/png': '🖼️',
        'image/jpeg': '🖼️',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊'
    };
    return icons[type] || '📄';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function updateCharCounter(e) {
    const input = e.target;
    const counterId = input.id === 'inventionTitle' ? 'titleCounter' : 'disclosureCounter';
    const counter = document.getElementById(counterId);
    if (counter) {
        counter.textContent = input.value.length;
    }
}

function updateWordCounter(e) {
    const input = e.target;
    const words = input.value.trim() ? input.value.trim().split(/\s+/).filter(w => w.length > 0) : [];
    const counter = document.getElementById('abstractCounter');
    if (counter) {
        counter.textContent = words.length;
    }
}

function addKeyword() {
    const input = document.getElementById('keywordInput');
    const keyword = input.value.trim();
    
    if (keyword && appState.disclosureData.keywords.length < 10 && !appState.disclosureData.keywords.includes(keyword)) {
        appState.disclosureData.keywords.push(keyword);
        input.value = '';
        renderKeywords();
        updateFormProgress();
    }
}

function renderKeywords() {
    const container = document.getElementById('keywordsList');
    container.innerHTML = '';
    
    appState.disclosureData.keywords.forEach(keyword => {
        const keywordElement = document.createElement('div');
        keywordElement.className = 'keyword-tag';
        keywordElement.innerHTML = `
            ${keyword}
            <button type="button" class="keyword-remove" onclick="removeKeyword('${keyword}')">✕</button>
        `;
        container.appendChild(keywordElement);
    });
}

function removeKeyword(keyword) {
    appState.disclosureData.keywords = appState.disclosureData.keywords.filter(k => k !== keyword);
    renderKeywords();
    updateFormProgress();
}

function toggleClaims() {
    const section = document.getElementById('claimsSection');
    const button = document.getElementById('toggleClaims');
    
    if (section.classList.contains('hidden')) {
        section.classList.remove('hidden');
        button.textContent = 'Hide Claims';
    } else {
        section.classList.add('hidden');
        button.textContent = 'Add Claims';
    }
}

function setupFormValidation() {
    const form = document.getElementById('disclosureForm');
    const inputs = form.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('input', updateFormProgress);
        input.addEventListener('blur', updateFormProgress);
    });
}

function updateFormProgress() {
    const titleElement = document.getElementById('inventionTitle');
    const abstractElement = document.getElementById('abstract');
    const disclosureElement = document.getElementById('technicalDisclosure');
    
    if (!titleElement || !abstractElement || !disclosureElement) {
        return;
    }
    
    const title = titleElement.value.trim();
    const abstract = abstractElement.value.trim();
    const disclosure = disclosureElement.value.trim();
    
    const titleValid = title.length > 0 && title.length <= 200;
    const abstractWords = abstract ? abstract.split(/\s+/).filter(w => w.length > 0) : [];
    const abstractValid = abstractWords.length >= 150 && abstractWords.length <= 300;
    const disclosureValid = disclosure.length >= 500;
    
    const requiredFields = [titleValid, abstractValid, disclosureValid];
    const completedFields = requiredFields.filter(Boolean).length;
    const totalFields = requiredFields.length;
    
    const progress = (completedFields / totalFields) * 100;
    
    const progressFill = document.getElementById('formProgress');
    const progressText = document.getElementById('progressText');
    const nextButton = document.getElementById('nextToAnalysis');
    
    if (progressFill) progressFill.style.width = `${progress}%`;
    if (progressText) progressText.textContent = `${Math.round(progress)}%`;
    if (nextButton) nextButton.disabled = progress < 100;
    
    // Update app state
    appState.disclosureData.title = title;
    appState.disclosureData.abstract = abstract;
    appState.disclosureData.technicalDisclosure = disclosure;
    
    const claimsElement = document.getElementById('initialClaims');
    if (claimsElement) {
        appState.disclosureData.claims = claimsElement.value;
    }
}

function saveDisclosureData() {
    updateFormProgress();
    // Auto-save is handled by setupAutoSave
}

function showPage(pageNum) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    
    // Show target page
    const targetPage = document.getElementById(`page-${pageNum}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update navigation
    updateProgressNav(pageNum);
    appState.currentPage = pageNum;
    
    // Scroll to top
    window.scrollTo(0, 0);
}

function updateProgressNav(currentPage) {
    const steps = document.querySelectorAll('.step');
    
    steps.forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNum === currentPage) {
            step.classList.add('active');
        } else if (stepNum < currentPage) {
            step.classList.add('completed');
        }
    });
}

function startAnalysis() {
    const conceptProgress = document.getElementById('conceptProgress');
    const classificationProgress = document.getElementById('classificationProgress');
    const strategyProgress = document.getElementById('strategyProgress');
    
    // Reset progress
    conceptProgress.querySelector('.progress-fill').style.width = '0%';
    classificationProgress.querySelector('.progress-fill').style.width = '0%';
    strategyProgress.querySelector('.progress-fill').style.width = '0%';
    
    // Start concept extraction
    animateProgress(conceptProgress.querySelector('.progress-fill'), 3000, () => {
        conceptProgress.querySelector('.status-text').textContent = 'Concept extraction complete';
        document.getElementById('conceptResults').classList.remove('hidden');
        renderConcepts();
        
        // Start classification
        animateProgress(classificationProgress.querySelector('.progress-fill'), 2000, () => {
            classificationProgress.querySelector('.status-text').textContent = 'Classification mapping complete';
            document.getElementById('classificationResults').classList.remove('hidden');
            renderClassifications();
            
            // Start strategy generation
            animateProgress(strategyProgress.querySelector('.progress-fill'), 2000, () => {
                strategyProgress.querySelector('.status-text').textContent = 'Search strategies generated';
                document.getElementById('strategyResults').classList.remove('hidden');
                renderStrategies();
                
                // Enable next button
                document.getElementById('startSearch').disabled = false;
            });
        });
    });
}

function animateProgress(element, duration, callback) {
    let start = 0;
    const increment = 100 / (duration / 50);
    
    const timer = setInterval(() => {
        start += increment;
        element.style.width = `${Math.min(start, 100)}%`;
        
        if (start >= 100) {
            clearInterval(timer);
            if (callback) callback();
        }
    }, 50);
}

function renderConcepts() {
    const container = document.getElementById('conceptGrid');
    container.innerHTML = '';
    
    appState.analysisData.concepts = SAMPLE_DATA.concepts;
    
    SAMPLE_DATA.concepts.forEach(concept => {
        const conceptElement = document.createElement('div');
        conceptElement.className = 'concept-item';
        conceptElement.innerHTML = `
            <div class="concept-term">${concept.term}</div>
            <div class="concept-score">${concept.score}% relevance</div>
        `;
        container.appendChild(conceptElement);
    });
}

function renderClassifications() {
    const container = document.getElementById('classificationGrid');
    container.innerHTML = '';
    
    appState.analysisData.classifications = SAMPLE_DATA.classifications;
    
    SAMPLE_DATA.classifications.forEach(classification => {
        const classificationElement = document.createElement('div');
        classificationElement.className = 'classification-item';
        classificationElement.innerHTML = `
            <div class="classification-code">${classification.code}</div>
            <div class="classification-desc">${classification.desc}</div>
        `;
        container.appendChild(classificationElement);
    });
}

function renderStrategies() {
    const container = document.getElementById('strategyList');
    container.innerHTML = '';
    
    appState.analysisData.searchStrategies = SAMPLE_DATA.searchStrategies;
    
    SAMPLE_DATA.searchStrategies.forEach(strategy => {
        const strategyElement = document.createElement('div');
        strategyElement.className = 'strategy-item';
        strategyElement.innerHTML = `
            <div class="strategy-title">${strategy.title}</div>
            <div class="strategy-query">${strategy.query}</div>
        `;
        container.appendChild(strategyElement);
    });
}

function startPriorArtSearch() {
    const lensProgress = document.getElementById('lensProgress');
    const googleProgress = document.getElementById('googleProgress');
    const lensResults = document.getElementById('lensResults');
    const googleResults = document.getElementById('googleResults');
    const totalResults = document.getElementById('totalResults');
    const searchTime = document.getElementById('searchTime');
    
    // Reset progress and results
    lensProgress.style.width = '0%';
    googleProgress.style.width = '0%';
    lensResults.textContent = '0';
    googleResults.textContent = '0';
    totalResults.textContent = '0';
    appState.searchData.totalResults = 0;
    
    // Start timer
    const startTime = Date.now();
    const timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        searchTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
    
    // Simulate Lens.org search
    animateProgress(lensProgress, 8000, () => {
        const results = Math.floor(Math.random() * 50) + 20;
        lensResults.textContent = results;
        appState.searchData.totalResults += results;
        totalResults.textContent = appState.searchData.totalResults;
    });
    
    // Simulate Google search
    setTimeout(() => {
        animateProgress(googleProgress, 6000, () => {
            const results = Math.floor(Math.random() * 30) + 15;
            googleResults.textContent = results;
            appState.searchData.totalResults += results;
            totalResults.textContent = appState.searchData.totalResults;
            
            // Complete search
            clearInterval(timer);
            renderSearchResults();
            document.getElementById('selectDocuments').disabled = false;
        });
    }, 3000);
}

function renderSearchResults() {
    const container = document.getElementById('searchResults');
    container.innerHTML = '';
    
    // Generate more sample results
    const allResults = [];
    for (let i = 0; i < 20; i++) {
        const basePatent = SAMPLE_DATA.patents[i % SAMPLE_DATA.patents.length];
        allResults.push({
            ...basePatent,
            id: `${basePatent.id.slice(0, -2)}${String(i).padStart(2, '0')}`,
            relevanceScore: Math.max(60, basePatent.relevanceScore - (i * 2))
        });
    }
    
    appState.searchData.results = allResults;
    
    allResults.forEach(result => {
        const resultElement = document.createElement('div');
        resultElement.className = 'result-item';
        resultElement.innerHTML = `
            <div class="result-header">
                <div class="result-id">${result.id}</div>
                <div class="result-title">${result.title}</div>
                <div class="result-meta">
                    <span>${result.office}</span>
                    <span>${result.publicationDate}</span>
                </div>
            </div>
            <div class="result-abstract">${result.abstract}</div>
            <div class="result-footer">
                <div class="relevance-score">${result.relevanceScore}%</div>
            </div>
        `;
        container.appendChild(resultElement);
    });
}

function selectTopDocuments() {
    // Sort by relevance and select top 10
    const sortedResults = appState.searchData.results
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 10);
    
    appState.selectedDocuments = sortedResults.map((doc, index) => ({
        ...doc,
        rank: index + 1,
        similarity: Math.max(70, doc.relevanceScore - 5),
        features: doc.concepts || []
    }));
    
    // Update closest match
    const closestMatch = document.getElementById('closestMatch');
    if (closestMatch && appState.selectedDocuments.length > 0) {
        closestMatch.textContent = appState.selectedDocuments[0].id;
    }
    
    renderSelectedDocuments();
}

function renderSelectedDocuments() {
    const container = document.getElementById('selectedDocuments');
    container.innerHTML = '';
    
    appState.selectedDocuments.forEach(doc => {
        const docElement = document.createElement('div');
        docElement.className = 'selected-document';
        docElement.innerHTML = `
            <div class="document-rank ${doc.rank === 1 ? 'closest' : ''}">${doc.rank}</div>
            <div class="document-content">
                <div class="document-similarity">${doc.similarity}% similar</div>
                <div class="result-header">
                    <div class="result-id">${doc.id}</div>
                    <div class="result-title">${doc.title}</div>
                    <div class="result-meta">
                        <span>${doc.office}</span>
                        <span>${doc.publicationDate}</span>
                    </div>
                </div>
                <div class="result-abstract">${doc.abstract}</div>
                <div class="document-features">
                    <div class="features-title">Key Features:</div>
                    <div class="features-list">
                        ${doc.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
        container.appendChild(docElement);
    });
}

function generateReport() {
    const reportProgress = document.getElementById('reportProgress');
    const reportPreview = document.getElementById('reportPreview');
    
    // Reset progress
    reportProgress.querySelector('.progress-fill').style.width = '0%';
    
    // Animate report generation
    animateProgress(reportProgress.querySelector('.progress-fill'), 3000, () => {
        reportProgress.classList.add('hidden');
        reportPreview.classList.remove('hidden');
        
        // Populate report data
        generateReportContent();
        document.getElementById('downloadReport').disabled = false;
    });
}

function generateReportContent() {
    const currentDate = new Date().toLocaleDateString();
    document.getElementById('reportDate').textContent = currentDate;
    document.getElementById('reportTitle').textContent = appState.disclosureData.title;
    
    // Generate assessment scores
    const noveltyScore = assessNovelty();
    const inventiveScore = assessInventiveStep();
    const industrialScore = assessIndustrialApplication();
    
    document.getElementById('noveltyScore').textContent = noveltyScore;
    document.getElementById('inventiveScore').textContent = inventiveScore;
    document.getElementById('industrialScore').textContent = industrialScore;
    
    // Apply score styling
    applyScoreClass('noveltyScore', noveltyScore);
    applyScoreClass('inventiveScore', inventiveScore);
    applyScoreClass('industrialScore', industrialScore);
    
    // Generate executive summary
    const executiveSummary = generateExecutiveSummary(noveltyScore, inventiveScore, industrialScore);
    document.getElementById('executiveSummary').innerHTML = executiveSummary;
    
    // Generate recommendations
    const recommendations = generateRecommendations(noveltyScore, inventiveScore, industrialScore);
    document.getElementById('recommendations').innerHTML = recommendations;
    
    // Store report data
    appState.reportData = {
        novelty: noveltyScore,
        inventiveStep: inventiveScore,
        industrialApplication: industrialScore,
        recommendations: recommendations,
        executiveSummary: executiveSummary
    };
}

function assessNovelty() {
    if (appState.selectedDocuments.length === 0) return 'High';
    const closestSimilarity = appState.selectedDocuments[0].similarity;
    if (closestSimilarity >= 90) return 'Low';
    if (closestSimilarity >= 80) return 'Medium';
    return 'High';
}

function assessInventiveStep() {
    if (appState.selectedDocuments.length === 0) return 'High';
    const topSimilarities = appState.selectedDocuments.slice(0, 3).map(d => d.similarity);
    const averageSimilarity = topSimilarities.reduce((a, b) => a + b, 0) / topSimilarities.length;
    
    if (averageSimilarity >= 85) return 'Low';
    if (averageSimilarity >= 75) return 'Medium';
    return 'High';
}

function assessIndustrialApplication() {
    // For water filtration technology, industrial applicability is typically high
    return 'High';
}

function applyScoreClass(elementId, score) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('high', 'medium', 'low');
        element.classList.add(score.toLowerCase());
    }
}

function generateExecutiveSummary(novelty, inventive, industrial) {
    return `
        <p>This patent prior art analysis examined <strong>${appState.selectedDocuments.length}</strong> relevant prior art documents 
        against the disclosed invention "${appState.disclosureData.title}".</p>
        
        <p><strong>Key Findings:</strong></p>
        <ul>
            <li>Novelty Assessment: <strong>${novelty}</strong> - ${getNoveltyExplanation(novelty)}</li>
            <li>Inventive Step: <strong>${inventive}</strong> - ${getInventiveExplanation(inventive)}</li>
            <li>Industrial Applicability: <strong>${industrial}</strong> - ${getIndustrialExplanation(industrial)}</li>
        </ul>
        
        <p>The closest prior art document is <strong>${appState.selectedDocuments.length > 0 ? appState.selectedDocuments[0].id : 'N/A'}</strong> 
        with ${appState.selectedDocuments.length > 0 ? appState.selectedDocuments[0].similarity : 0}% similarity to the disclosed invention.</p>
    `;
}

function getNoveltyExplanation(novelty) {
    const explanations = {
        'High': 'The invention shows significant novel features not disclosed in individual prior art documents.',
        'Medium': 'The invention has some novel aspects but shares substantial features with existing prior art.',
        'Low': 'The invention is substantially similar to existing prior art, raising novelty concerns.'
    };
    return explanations[novelty];
}

function getInventiveExplanation(inventive) {
    const explanations = {
        'High': 'The invention demonstrates clear inventive step with unexpected technical effects.',
        'Medium': 'The invention shows some inventive merit but may face obviousness challenges.',
        'Low': 'The invention may be obvious in light of the combination of prior art documents.'
    };
    return explanations[inventive];
}

function getIndustrialExplanation(industrial) {
    const explanations = {
        'High': 'The invention is clearly applicable in industrial and commercial settings.',
        'Medium': 'The invention has practical applications with some limitations.',
        'Low': 'The industrial applicability of the invention is questionable.'
    };
    return explanations[industrial];
}

function generateRecommendations(novelty, inventive, industrial) {
    const recommendations = [];
    
    if (novelty === 'Low') {
        recommendations.push('Focus on unique technical features that differentiate from closest prior art');
        recommendations.push('Consider narrowing claims to emphasize novel aspects');
    }
    
    if (inventive === 'Low') {
        recommendations.push('Strengthen technical effect descriptions and unexpected advantages');
        recommendations.push('Consider secondary indicia of non-obviousness');
    }
    
    if (industrial === 'Medium') {
        recommendations.push('Provide more detailed examples of practical applications');
    }
    
    // General recommendations
    recommendations.push('Conduct additional prior art searches in related technical fields');
    recommendations.push('Consider filing continuation applications for different aspects');
    
    return '<ul>' + recommendations.map(rec => `<li>${rec}</li>`).join('') + '</ul>';
}

function downloadPDF(type) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Set up document
    doc.setFontSize(20);
    doc.text('Patent Prior Art Analysis Report', 20, 30);
    
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);
    doc.text(`Invention: ${appState.disclosureData.title}`, 20, 55);
    
    let y = 75;
    
    if (type === 'full') {
        // Executive Summary
        doc.setFontSize(16);
        doc.text('Executive Summary', 20, y);
        y += 15;
        
        doc.setFontSize(10);
        const summaryText = appState.reportData.executiveSummary.replace(/<[^>]*>/g, '');
        const summaryLines = doc.splitTextToSize(summaryText, 170);
        doc.text(summaryLines, 20, y);
        y += summaryLines.length * 5 + 10;
        
        // Patentability Assessment
        doc.setFontSize(16);
        doc.text('Patentability Assessment', 20, y);
        y += 15;
        
        doc.setFontSize(10);
        doc.text(`Novelty: ${appState.reportData.novelty}`, 20, y);
        y += 8;
        doc.text(`Inventive Step: ${appState.reportData.inventiveStep}`, 20, y);
        y += 8;
        doc.text(`Industrial Application: ${appState.reportData.industrialApplication}`, 20, y);
        y += 15;
        
        // Prior Art Documents
        doc.setFontSize(16);
        doc.text('Top 10 Prior Art Documents', 20, y);
        y += 15;
        
        appState.selectedDocuments.forEach((doc_item, index) => {
            if (y > 250) {
                doc.addPage();
                y = 20;
            }
            
            doc.setFontSize(12);
            doc.text(`${index + 1}. ${doc_item.id}`, 20, y);
            y += 8;
            
            doc.setFontSize(10);
            doc.text(`Title: ${doc_item.title}`, 25, y);
            y += 6;
            doc.text(`Similarity: ${doc_item.similarity}%`, 25, y);
            y += 6;
            doc.text(`Publication: ${doc_item.publicationDate}`, 25, y);
            y += 10;
        });
        
        // Recommendations
        if (y > 220) {
            doc.addPage();
            y = 20;
        }
        
        doc.setFontSize(16);
        doc.text('Recommendations', 20, y);
        y += 15;
        
        doc.setFontSize(10);
        const recText = appState.reportData.recommendations.replace(/<[^>]*>/g, '');
        const recLines = doc.splitTextToSize(recText, 170);
        doc.text(recLines, 20, y);
    } else {
        // Summary only
        doc.setFontSize(16);
        doc.text('Executive Summary', 20, y);
        y += 15;
        
        doc.setFontSize(10);
        const summaryText = appState.reportData.executiveSummary.replace(/<[^>]*>/g, '');
        const summaryLines = doc.splitTextToSize(summaryText, 170);
        doc.text(summaryLines, 20, y);
    }
    
    // Save the PDF
    const filename = type === 'full' ? 'patent-analysis-full.pdf' : 'patent-analysis-summary.pdf';
    doc.save(filename);
    
    // Update download stats
    updateDownloadStats();
}

function downloadJSON() {
    const data = {
        disclosure: appState.disclosureData,
        analysis: appState.analysisData,
        searchResults: appState.searchData,
        selectedDocuments: appState.selectedDocuments,
        report: appState.reportData,
        timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'patent-analysis-data.json';
    a.click();
    URL.revokeObjectURL(url);
    
    updateDownloadStats();
}

function updateDownloadStats() {
    const docCount = document.getElementById('finalDocCount');
    const pageCount = document.getElementById('finalPageCount');
    const recCount = document.getElementById('finalRecommendations');
    
    if (docCount) docCount.textContent = appState.selectedDocuments.length;
    if (pageCount) pageCount.textContent = '15-20';
    if (recCount) recCount.textContent = '5-7';
}

function startNewSearch() {
    // Reset application state
    appState = {
        currentPage: 1,
        disclosureData: {
            title: '',
            abstract: '',
            technicalDisclosure: '',
            claims: '',
            keywords: [],
            uploadedFiles: []
        },
        analysisData: {
            concepts: [],
            classifications: [],
            searchStrategies: []
        },
        searchData: {
            results: [],
            totalResults: 0,
            searchTime: 0
        },
        selectedDocuments: [],
        reportData: {
            novelty: '',
            inventiveStep: '',
            industrialApplication: '',
            recommendations: [],
            executiveSummary: ''
        }
    };
    
    // Reset form
    const form = document.getElementById('disclosureForm');
    if (form) form.reset();
    
    const keywordsList = document.getElementById('keywordsList');
    if (keywordsList) keywordsList.innerHTML = '';
    
    const uploadedFiles = document.getElementById('uploadedFiles');
    if (uploadedFiles) uploadedFiles.innerHTML = '';
    
    // Reset counters
    const elements = {
        'titleCounter': '0',
        'abstractCounter': '0',
        'disclosureCounter': '0',
        'progressText': '0%'
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
    
    // Reset progress bar
    const formProgress = document.getElementById('formProgress');
    if (formProgress) formProgress.style.width = '0%';
    
    // Reset buttons
    const nextButton = document.getElementById('nextToAnalysis');
    if (nextButton) nextButton.disabled = true;
    
    // Go to first page
    showPage(1);
}

function setupAutoSave() {
    setInterval(() => {
        if (appState.currentPage === 1) {
            saveToStorage();
        }
    }, 30000); // Auto-save every 30 seconds
}

function saveToStorage() {
    // Note: Using a simple object instead of localStorage due to sandbox restrictions
    window.tempStorage = JSON.stringify(appState);
}

function loadSavedData() {
    // Note: In a real application, this would load from localStorage
    if (window.tempStorage) {
        try {
            const savedState = JSON.parse(window.tempStorage);
            // Merge saved state with current state
            Object.assign(appState, savedState);
            
            // Restore form values
            const elements = {
                'inventionTitle': appState.disclosureData.title,
                'abstract': appState.disclosureData.abstract,
                'technicalDisclosure': appState.disclosureData.technicalDisclosure,
                'initialClaims': appState.disclosureData.claims
            };
            
            Object.entries(elements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element && value) element.value = value;
            });
            
            // Restore keywords and files
            renderKeywords();
            renderUploadedFiles();
            
            // Update counters
            setTimeout(updateFormProgress, 100);
        } catch (e) {
            console.log('No saved data found or invalid format');
        }
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Export functions for global access
window.removeFile = removeFile;
window.removeKeyword = removeKeyword;