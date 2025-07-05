// PASAI - Patent Prior Art Search Application JavaScript
// Critical fixes for Technology Disclosure form functionality

// Application state
let appState = {
    currentStep: 1,
    keywords: [],
    claims: [],
    searchResults: [],
    formProgress: 0,
    formData: {
        title: '',
        abstract: '',
        disclosure: '',
        keywords: [],
        claims: []
    }
};

// Configuration from application data
const config = {
    titleMinChars: 10,
    titleMaxChars: 200,
    abstractMinWords: 150,
    abstractMaxWords: 300,
    disclosureMinChars: 500,
    maxKeywords: 10,
    maxClaims: 10,
    lensToken: 'NHaWYJh7KXwYbJt4mNSPGvfMMYGPW3z1n8jXLh2FIvm39WgQjnUH',
    lensUrl: 'https://api.lens.org/patent/search'
};

// DOM Elements
const elements = {
    // Form elements
    inventionTitle: document.getElementById('inventionTitle'),
    abstract: document.getElementById('abstract'),
    detailedDisclosure: document.getElementById('detailedDisclosure'),
    keywordInput: document.getElementById('keywordInput'),
    claimInput: document.getElementById('claimInput'),
    
    // Counter elements
    titleCharCount: document.getElementById('titleCharCount'),
    abstractWordCount: document.getElementById('abstractWordCount'),
    disclosureCharCount: document.getElementById('disclosureCharCount'),
    
    // Container elements
    keywordTags: document.getElementById('keywordTags'),
    claimList: document.getElementById('claimList'),
    
    // Progress elements
    progressFill: document.getElementById('progressFill'),
    progressPercentage: document.getElementById('progressPercentage'),
    
    // Button elements
    nextAnalyzeBtn: document.getElementById('nextAnalyzeBtn'),
    backToDisclosureBtn: document.getElementById('backToDisclosureBtn'),
    nextSearchBtn: document.getElementById('nextSearchBtn'),
    backToAnalysisBtn: document.getElementById('backToAnalysisBtn'),
    startSearchBtn: document.getElementById('startSearchBtn'),
    nextResultsBtn: document.getElementById('nextResultsBtn'),
    backToSearchBtn: document.getElementById('backToSearchBtn'),
    nextReportsBtn: document.getElementById('nextReportsBtn'),
    backToResultsBtn: document.getElementById('backToResultsBtn'),
    downloadReportBtn: document.getElementById('downloadReportBtn'),
    
    // Section elements
    sections: document.querySelectorAll('.section'),
    progressSteps: document.querySelectorAll('.progress-nav__step'),
    
    // Analysis elements
    extractedConcepts: document.getElementById('extractedConcepts'),
    searchStrings: document.getElementById('searchStrings'),
    
    // Search elements
    searchStatus: document.getElementById('searchStatus'),
    searchProgressFill: document.getElementById('searchProgressFill'),
    searchResultsPreview: document.getElementById('searchResultsPreview'),
    
    // Results elements
    resultsTable: document.getElementById('resultsTable'),
    
    // Reports elements
    reportPreview: document.getElementById('reportPreview')
};

// CRITICAL FIX 1: Character and Word Counting Functions
function updateCharacterCount(inputElement, displayElement, maxChars) {
    const currentCount = inputElement.value.length;
    displayElement.textContent = currentCount;
    
    // Update counter styling based on limits
    const counterContainer = displayElement.parentElement;
    counterContainer.classList.remove('over-limit', 'under-minimum', 'valid');
    
    if (currentCount > maxChars) {
        counterContainer.classList.add('over-limit');
    } else if (currentCount < (inputElement.dataset.minChars || 0)) {
        counterContainer.classList.add('under-minimum');
    } else if (currentCount >= (inputElement.dataset.minChars || 0)) {
        counterContainer.classList.add('valid');
    }
}

function updateWordCount(inputElement, displayElement, maxWords) {
    const text = inputElement.value.trim();
    const currentCount = text === '' ? 0 : text.split(/\s+/).length;
    displayElement.textContent = currentCount;
    
    // Update counter styling based on limits
    const counterContainer = displayElement.parentElement;
    counterContainer.classList.remove('over-limit', 'under-minimum', 'valid');
    
    if (currentCount > maxWords) {
        counterContainer.classList.add('over-limit');
    } else if (currentCount < (inputElement.dataset.minWords || 0)) {
        counterContainer.classList.add('under-minimum');
    } else if (currentCount >= (inputElement.dataset.minWords || 0)) {
        counterContainer.classList.add('valid');
    }
}

// CRITICAL FIX 2: Keywords System
function addKeyword(keyword) {
    keyword = keyword.trim();
    if (keyword === '' || appState.keywords.includes(keyword) || appState.keywords.length >= config.maxKeywords) {
        return false;
    }
    
    appState.keywords.push(keyword);
    renderKeywords();
    updateFormProgress();
    return true;
}

function removeKeyword(index) {
    appState.keywords.splice(index, 1);
    renderKeywords();
    updateFormProgress();
}

function renderKeywords() {
    elements.keywordTags.innerHTML = '';
    appState.keywords.forEach((keyword, index) => {
        const tag = document.createElement('div');
        tag.className = 'keyword-tag';
        tag.innerHTML = `
            <span>${keyword}</span>
            <button type="button" class="keyword-tag__remove" onclick="removeKeyword(${index})">×</button>
        `;
        elements.keywordTags.appendChild(tag);
    });
}

function handleKeywordInput(event) {
    const input = event.target;
    const value = input.value;
    
    // Check for Enter key (13) or Comma key (188)
    if (event.keyCode === 13 || event.keyCode === 188) {
        event.preventDefault();
        const keyword = value.replace(',', '').trim();
        if (addKeyword(keyword)) {
            input.value = '';
        }
    }
}

// CRITICAL FIX 3: Claims System
function addClaim(claim) {
    claim = claim.trim();
    if (claim === '' || appState.claims.includes(claim) || appState.claims.length >= config.maxClaims) {
        return false;
    }
    
    // Ensure claim ends with a period
    if (!claim.endsWith('.')) {
        claim += '.';
    }
    
    appState.claims.push(claim);
    renderClaims();
    updateFormProgress();
    return true;
}

function removeClaim(index) {
    appState.claims.splice(index, 1);
    renderClaims();
    updateFormProgress();
}

function renderClaims() {
    elements.claimList.innerHTML = '';
    appState.claims.forEach((claim, index) => {
        const claimItem = document.createElement('div');
        claimItem.className = 'claim-item';
        claimItem.innerHTML = `
            <span class="claim-number">${index + 1}.</span>
            <span class="claim-text">${claim}</span>
            <button type="button" class="claim-remove" onclick="removeClaim(${index})">×</button>
        `;
        elements.claimList.appendChild(claimItem);
    });
}

function handleClaimInput(event) {
    const input = event.target;
    const value = input.value;
    
    // Check for Enter key (13) or Period key (190)
    if (event.keyCode === 13 || event.keyCode === 190) {
        event.preventDefault();
        const claim = value.replace(/\.$/, '').trim();
        if (addClaim(claim)) {
            input.value = '';
        }
    }
}

// CRITICAL FIX 4: Form Progress Calculation
function calculateProgress() {
    let progress = 0;
    let totalFields = 3; // Title, Abstract, Disclosure are required
    
    // Check title (minimum 10 characters)
    const titleLength = elements.inventionTitle.value.length;
    if (titleLength >= config.titleMinChars) {
        progress += 1;
    }
    
    // Check abstract (minimum 150 words)
    const abstractText = elements.abstract.value.trim();
    const abstractWordCount = abstractText === '' ? 0 : abstractText.split(/\s+/).length;
    if (abstractWordCount >= config.abstractMinWords) {
        progress += 1;
    }
    
    // Check disclosure (minimum 500 characters)
    const disclosureLength = elements.detailedDisclosure.value.length;
    if (disclosureLength >= config.disclosureMinChars) {
        progress += 1;
    }
    
    const percentage = Math.round((progress / totalFields) * 100);
    appState.formProgress = percentage;
    
    return percentage;
}

function updateProgressBar() {
    const progress = calculateProgress();
    elements.progressFill.style.width = progress + '%';
    elements.progressPercentage.textContent = progress + '%';
}

// CRITICAL FIX 5: Form Validation and Button State
function validateForm() {
    const progress = calculateProgress();
    return progress === 100;
}

function toggleNextButton() {
    const isValid = validateForm();
    elements.nextAnalyzeBtn.disabled = !isValid;
    
    if (isValid) {
        elements.nextAnalyzeBtn.classList.remove('disabled');
    } else {
        elements.nextAnalyzeBtn.classList.add('disabled');
    }
}

// Navigation Functions
function showSection(sectionNumber) {
    // Hide all sections
    elements.sections.forEach(section => section.classList.remove('active'));
    elements.progressSteps.forEach(step => step.classList.remove('active'));
    
    // Show target section
    const targetSection = document.getElementById(`section-${sectionNumber}`);
    const targetStep = document.querySelector(`[data-step="${sectionNumber}"]`);
    
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    if (targetStep) {
        targetStep.classList.add('active');
    }
    
    // Mark completed steps
    elements.progressSteps.forEach((step, index) => {
        if (index < sectionNumber - 1) {
            step.classList.add('completed');
        } else {
            step.classList.remove('completed');
        }
    });
    
    appState.currentStep = sectionNumber;
}

// Analysis Functions
function extractConcepts() {
    const concepts = [];
    
    // Extract from title
    const titleWords = elements.inventionTitle.value.split(/\s+/).filter(word => word.length > 3);
    concepts.push(...titleWords);
    
    // Extract from abstract
    const abstractWords = elements.abstract.value.split(/\s+/).filter(word => word.length > 4);
    concepts.push(...abstractWords.slice(0, 10));
    
    // Add keywords
    concepts.push(...appState.keywords);
    
    // Remove duplicates and return unique concepts
    return [...new Set(concepts)].slice(0, 15);
}

function generateSearchStrings() {
    const concepts = extractConcepts();
    const searchStrings = [];
    
    // Generate different search combinations
    if (concepts.length >= 3) {
        searchStrings.push(concepts.slice(0, 3).join(' AND '));
        searchStrings.push(concepts.slice(0, 5).join(' OR '));
        searchStrings.push(`"${concepts[0]}" AND "${concepts[1]}"`);
    }
    
    return searchStrings;
}

function runAnalysis() {
    const concepts = extractConcepts();
    const searchStrings = generateSearchStrings();
    
    // Display extracted concepts
    elements.extractedConcepts.innerHTML = '';
    concepts.forEach(concept => {
        const tag = document.createElement('span');
        tag.className = 'concept-tag';
        tag.textContent = concept;
        elements.extractedConcepts.appendChild(tag);
    });
    
    // Display search strings
    elements.searchStrings.innerHTML = '';
    searchStrings.forEach(searchString => {
        const div = document.createElement('div');
        div.className = 'search-string';
        div.textContent = searchString;
        elements.searchStrings.appendChild(div);
    });
}

// Search Functions
function simulateSearch() {
    let progress = 0;
    elements.searchStatus.textContent = 'Searching patent databases...';
    elements.startSearchBtn.disabled = true;
    
    const interval = setInterval(() => {
        progress += 10;
        elements.searchProgressFill.style.width = progress + '%';
        
        if (progress >= 100) {
            clearInterval(interval);
            elements.searchStatus.textContent = 'Search completed!';
            elements.nextResultsBtn.disabled = false;
            displaySearchResults();
        }
    }, 300);
}

function displaySearchResults() {
    const sampleResults = [
        { title: 'Water filtration system using natural materials', relevance: 95, year: 2018 },
        { title: 'Biodegradable filter media for water treatment', relevance: 88, year: 2019 },
        { title: 'Agricultural waste-based filtration apparatus', relevance: 82, year: 2020 },
        { title: 'Sustainable water purification device', relevance: 78, year: 2017 },
        { title: 'Eco-friendly water treatment system', relevance: 74, year: 2021 }
    ];
    
    let html = '<h4>Search Results Preview</h4>';
    sampleResults.forEach((result, index) => {
        html += `
            <div class="search-result-item">
                <strong>${index + 1}. ${result.title}</strong><br>
                <small>Relevance: ${result.relevance}% | Year: ${result.year}</small>
            </div>
        `;
    });
    
    elements.searchResultsPreview.innerHTML = html;
}

function displayResultsTable() {
    const results = [
        { rank: 1, title: 'Water filtration system using natural materials', relevance: 95, year: 2018, status: 'Granted' },
        { rank: 2, title: 'Biodegradable filter media for water treatment', relevance: 88, year: 2019, status: 'Pending' },
        { rank: 3, title: 'Agricultural waste-based filtration apparatus', relevance: 82, year: 2020, status: 'Granted' },
        { rank: 4, title: 'Sustainable water purification device', relevance: 78, year: 2017, status: 'Granted' },
        { rank: 5, title: 'Eco-friendly water treatment system', relevance: 74, year: 2021, status: 'Pending' }
    ];
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Title</th>
                    <th>Relevance</th>
                    <th>Year</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    results.forEach(result => {
        html += `
            <tr>
                <td>${result.rank}</td>
                <td>${result.title}</td>
                <td>${result.relevance}%</td>
                <td>${result.year}</td>
                <td><span class="status status--${result.status === 'Granted' ? 'success' : 'warning'}">${result.status}</span></td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    elements.resultsTable.innerHTML = html;
}

function generateReport() {
    const reportData = {
        title: elements.inventionTitle.value,
        abstract: elements.abstract.value,
        keywords: appState.keywords,
        claims: appState.claims,
        searchDate: new Date().toLocaleDateString(),
        totalResults: 50,
        relevantResults: 15
    };
    
    // Simulate PDF generation
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PASAI_Report_${reportData.title.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Event Listeners Setup
function setupEventListeners() {
    // CRITICAL: Character and word counting with 'input' events
    elements.inventionTitle.addEventListener('input', function() {
        updateCharacterCount(this, elements.titleCharCount, config.titleMaxChars);
        updateProgressBar();
        toggleNextButton();
    });
    
    elements.abstract.addEventListener('input', function() {
        updateWordCount(this, elements.abstractWordCount, config.abstractMaxWords);
        updateProgressBar();
        toggleNextButton();
    });
    
    elements.detailedDisclosure.addEventListener('input', function() {
        updateCharacterCount(this, elements.disclosureCharCount, config.disclosureMinChars);
        updateProgressBar();
        toggleNextButton();
    });
    
    // CRITICAL: Keywords input with keydown events
    elements.keywordInput.addEventListener('keydown', handleKeywordInput);
    
    // CRITICAL: Claims input with keydown events
    elements.claimInput.addEventListener('keydown', handleClaimInput);
    
    // Navigation buttons
    elements.nextAnalyzeBtn.addEventListener('click', function() {
        runAnalysis();
        showSection(2);
    });
    
    elements.backToDisclosureBtn.addEventListener('click', () => showSection(1));
    elements.nextSearchBtn.addEventListener('click', () => showSection(3));
    elements.backToAnalysisBtn.addEventListener('click', () => showSection(2));
    
    elements.startSearchBtn.addEventListener('click', simulateSearch);
    elements.nextResultsBtn.addEventListener('click', function() {
        displayResultsTable();
        showSection(4);
    });
    
    elements.backToSearchBtn.addEventListener('click', () => showSection(3));
    elements.nextReportsBtn.addEventListener('click', () => showSection(5));
    elements.backToResultsBtn.addEventListener('click', () => showSection(4));
    
    elements.downloadReportBtn.addEventListener('click', generateReport);
}

// Initialize Application
function initializeApp() {
    // Set minimum requirements as data attributes
    elements.inventionTitle.dataset.minChars = config.titleMinChars;
    elements.abstract.dataset.minWords = config.abstractMinWords;
    elements.detailedDisclosure.dataset.minChars = config.disclosureMinChars;
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize counters
    updateCharacterCount(elements.inventionTitle, elements.titleCharCount, config.titleMaxChars);
    updateWordCount(elements.abstract, elements.abstractWordCount, config.abstractMaxWords);
    updateCharacterCount(elements.detailedDisclosure, elements.disclosureCharCount, config.disclosureMinChars);
    
    // Initialize progress
    updateProgressBar();
    toggleNextButton();
    
    // Show first section
    showSection(1);
    
    console.log('PASAI Application initialized successfully');
}

// Global functions for onclick handlers
window.removeKeyword = removeKeyword;
window.removeClaim = removeClaim;

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);
