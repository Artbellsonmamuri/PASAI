// Application Data and Configuration
const APP_CONFIG = {
    lensApiConfig: {
        token: "NHaWYJh7KXwYbJt4mNSPGvfMMYGPW3z1n8jXLh2FIvm39WgQjnUH",
        endpoint: "https://api.lens.org/patent/search",
        rateLimit: 10,
        maxResults: 100
    },
    classificationCodes: {
        IPC: ["C02F1/00", "C02F1/28", "C02F1/44", "B01D39/00"],
        CPC: ["C02F1/001", "C02F1/281", "C02F1/442", "B01D39/005", "Y02A20/124"]
    },
    samplePatents: [
        {
            id: "US10234567B2",
            title: "Advanced Water Filtration System Using Ceramic Membranes",
            abstract: "A water filtration device comprising ceramic membrane filters with enhanced porosity for improved filtration efficiency in rural applications.",
            relevanceScore: 0.92,
            noveltyAssessment: "High overlap in filtration methodology, differs in membrane material composition"
        },
        {
            id: "WO2019123456A1", 
            title: "Biodegradable Water Filter with Agricultural Waste Components",
            abstract: "Water filtration system utilizing biodegradable materials including corn cob particles for sustainable water treatment applications.",
            relevanceScore: 0.89,
            noveltyAssessment: "Similar use of agricultural waste, differs in specific implementation and chemical treatment"
        },
        {
            id: "EP3456789B1",
            title: "Modular Water Treatment System for Remote Areas",
            abstract: "Modular water treatment apparatus designed for deployment in remote areas with minimal infrastructure requirements.",
            relevanceScore: 0.85,
            noveltyAssessment: "Overlapping modular design concept, differs in specific filtration technology and target applications"
        },
        {
            id: "US10567890B1",
            title: "Hybrid Filtration System with Multi-Stage Processing",
            abstract: "Water treatment system combining multiple filtration stages including pre-filtration, membrane filtration, and post-treatment for enhanced water quality.",
            relevanceScore: 0.81,
            noveltyAssessment: "Similar multi-stage approach, differs in specific membrane technology and control systems"
        },
        {
            id: "CN109876543A",
            title: "Portable Water Purification Device for Field Use",
            abstract: "Compact water purification apparatus designed for military and emergency applications with self-contained power supply.",
            relevanceScore: 0.78,
            noveltyAssessment: "Overlapping portable design concept, differs in power management and filtration efficiency"
        }
    ]
};

// Global Application State
let appState = {
    analysisComplete: false,
    searchExecuted: false,
    assessmentGenerated: false,
    extractedConcepts: [],
    generatedQueries: [],
    searchResults: [],
    topDocuments: [],
    assessmentData: null
};

// DOM Elements
const elements = {
    inventionTitle: document.getElementById('invention-title'),
    inventionAbstract: document.getElementById('invention-abstract'),
    detailedDescription: document.getElementById('detailed-description'),
    extractedKeywords: document.getElementById('extracted-keywords'),
    technicalConcepts: document.getElementById('technical-concepts'),
    classificationCodes: document.getElementById('classification-codes'),
    searchStrings: document.getElementById('search-strings'),
    startAnalysisBtn: document.getElementById('start-analysis'),
    patentResults: document.getElementById('patent-results'),
    generateReportBtn: document.getElementById('generate-report'),
    nlpIndicator: document.getElementById('nlp-indicator'),
    analysisIndicator: document.getElementById('analysis-indicator'),
    searchIndicator: document.getElementById('search-indicator'),
    assessmentIndicator: document.getElementById('assessment-indicator'),
    loadingOverlay: document.getElementById('loading-overlay'),
    loadingMessage: document.getElementById('loading-message')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing application...');
    initializeApp();
    setupEventListeners();
    startRealTimeAnalysis();
});

function initializeApp() {
    console.log('Setting up initial state...');
    
    // Initialize character counters
    updateCharacterCount('invention-title', 'title-count', 200);
    updateCharacterCount('invention-abstract', 'abstract-count', 500);
    updateCharacterCount('detailed-description', 'description-count', 2000);
    
    // Initialize concept chart
    initializeConceptChart();
    
    // Set initial status
    updateProcessingIndicator('nlp-indicator', 'AI Analysis: Active', true);
    updateProcessingIndicator('analysis-indicator', 'Processing: Standby', false);
    updateProcessingIndicator('search-indicator', 'Search Status: Ready', false);
    updateProcessingIndicator('assessment-indicator', 'Assessment: Pending', false);
    
    console.log('Application initialized successfully');
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Character counting
    elements.inventionTitle.addEventListener('input', () => {
        updateCharacterCount('invention-title', 'title-count', 200);
        performRealTimeAnalysis();
    });
    
    elements.inventionAbstract.addEventListener('input', () => {
        updateCharacterCount('invention-abstract', 'abstract-count', 500);
        performRealTimeAnalysis();
    });
    
    elements.detailedDescription.addEventListener('input', () => {
        updateCharacterCount('detailed-description', 'description-count', 2000);
        performRealTimeAnalysis();
    });
    
    // Analysis button
    elements.startAnalysisBtn.addEventListener('click', startAutomatedAnalysis);
    
    // Report generation
    elements.generateReportBtn.addEventListener('click', generateFullReport);
    
    // Export buttons
    document.getElementById('export-pdf').addEventListener('click', () => exportReport('pdf'));
    document.getElementById('export-word').addEventListener('click', () => exportReport('word'));
    
    console.log('Event listeners set up successfully');
}

function updateCharacterCount(inputId, countId, maxLength) {
    const input = document.getElementById(inputId);
    const counter = document.getElementById(countId);
    const currentLength = input.value.length;
    counter.textContent = currentLength;
    
    if (currentLength > maxLength * 0.9) {
        counter.style.color = 'var(--color-warning)';
    } else if (currentLength > maxLength) {
        counter.style.color = 'var(--color-error)';
    } else {
        counter.style.color = 'var(--color-text-secondary)';
    }
}

function startRealTimeAnalysis() {
    updateProcessingIndicator('nlp-indicator', 'AI Analysis: Active', true);
    performRealTimeAnalysis();
}

function performRealTimeAnalysis() {
    const title = elements.inventionTitle.value;
    const abstract = elements.inventionAbstract.value;
    const description = elements.detailedDescription.value;
    
    if (!title && !abstract && !description) {
        clearExtractedConcepts();
        return;
    }
    
    // Simulate NLP processing delay
    setTimeout(() => {
        try {
            const concepts = extractConcepts(title, abstract, description);
            displayExtractedConcepts(concepts);
            updateConceptChart(concepts);
            updateSemanticAnalysis(concepts);
        } catch (error) {
            console.error('Error in real-time analysis:', error);
        }
    }, 500);
}

function extractConcepts(title, abstract, description) {
    const fullText = `${title} ${abstract} ${description}`.toLowerCase();
    
    // Simulate advanced NLP concept extraction
    const keywords = extractKeywords(fullText);
    const technicalConcepts = extractTechnicalConcepts(fullText);
    const classifications = suggestClassifications(fullText);
    
    return {
        keywords,
        technicalConcepts,
        classifications,
        readinessScore: calculateReadinessScore(fullText),
        conceptClarity: calculateConceptClarity(fullText),
        technicalDepth: calculateTechnicalDepth(fullText)
    };
}

function extractKeywords(text) {
    const commonKeywords = [
        'system', 'method', 'device', 'apparatus', 'process', 'technology',
        'filter', 'membrane', 'water', 'treatment', 'purification', 'ceramic',
        'biodegradable', 'agricultural', 'modular', 'remote', 'efficiency',
        'sustainable', 'innovative', 'advanced', 'improved', 'enhanced'
    ];
    
    const words = text.split(/\s+/).filter(word => word.length > 3);
    const keywords = words.filter(word => 
        commonKeywords.includes(word) || 
        /^[a-z]+ing$/.test(word) || 
        /^[a-z]+tion$/.test(word)
    );
    
    return [...new Set(keywords)].slice(0, 10);
}

function extractTechnicalConcepts(text) {
    const concepts = [];
    const technicalTerms = [
        { term: 'filtration', confidence: 0.95 },
        { term: 'membrane technology', confidence: 0.88 },
        { term: 'water treatment', confidence: 0.92 },
        { term: 'purification process', confidence: 0.85 },
        { term: 'ceramic materials', confidence: 0.78 },
        { term: 'modular design', confidence: 0.82 }
    ];
    
    technicalTerms.forEach(item => {
        if (text.includes(item.term.toLowerCase())) {
            concepts.push(item);
        }
    });
    
    return concepts;
}

function suggestClassifications(text) {
    const suggestions = [];
    
    if (text.includes('water') || text.includes('filter')) {
        suggestions.push({ code: 'C02F1/00', description: 'Water treatment' });
        suggestions.push({ code: 'C02F1/28', description: 'Filtration' });
    }
    
    if (text.includes('membrane')) {
        suggestions.push({ code: 'B01D39/00', description: 'Membrane filtration' });
    }
    
    if (text.includes('ceramic')) {
        suggestions.push({ code: 'C02F1/281', description: 'Ceramic filtration' });
    }
    
    return suggestions;
}

function calculateReadinessScore(text) {
    const wordCount = text.split(/\s+/).length;
    const technicalTerms = extractTechnicalConcepts(text).length;
    const score = Math.min(95, (wordCount * 0.1) + (technicalTerms * 10));
    return Math.round(score);
}

function calculateConceptClarity(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
    const clarity = Math.max(60, 100 - (avgSentenceLength * 2));
    return Math.round(clarity);
}

function calculateTechnicalDepth(text) {
    const technicalWords = text.match(/\b\w+ing\b|\b\w+tion\b|\b\w+ment\b/g) || [];
    const depth = Math.min(95, technicalWords.length * 3 + 50);
    return Math.round(depth);
}

function displayExtractedConcepts(concepts) {
    // Display keywords
    elements.extractedKeywords.innerHTML = concepts.keywords
        .map(keyword => `<span class="keyword-tag">${keyword}</span>`)
        .join('');
    
    // Display technical concepts
    elements.technicalConcepts.innerHTML = concepts.technicalConcepts
        .map(concept => `
            <div class="concept-item">
                <span>${concept.term}</span>
                <span class="concept-confidence">${(concept.confidence * 100).toFixed(0)}%</span>
            </div>
        `).join('');
    
    // Display classification codes
    elements.classificationCodes.innerHTML = concepts.classifications
        .map(classification => `
            <div class="classification-item">
                <span>${classification.description}</span>
                <span class="classification-code">${classification.code}</span>
            </div>
        `).join('');
    
    appState.extractedConcepts = concepts;
}

function clearExtractedConcepts() {
    elements.extractedKeywords.innerHTML = '';
    elements.technicalConcepts.innerHTML = '';
    elements.classificationCodes.innerHTML = '';
    appState.extractedConcepts = [];
}

function updateConceptChart(concepts) {
    const ctx = document.getElementById('concept-chart').getContext('2d');
    
    if (window.conceptChart) {
        window.conceptChart.destroy();
    }
    
    window.conceptChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Keywords', 'Technical Terms', 'Classifications'],
            datasets: [{
                data: [
                    concepts.keywords.length,
                    concepts.technicalConcepts.length,
                    concepts.classifications.length
                ],
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateSemanticAnalysis(concepts) {
    document.getElementById('readiness-score').textContent = `${concepts.readinessScore}%`;
    document.getElementById('concept-clarity').textContent = `${concepts.conceptClarity}%`;
    document.getElementById('technical-depth').textContent = `${concepts.technicalDepth}%`;
}

function initializeConceptChart() {
    const ctx = document.getElementById('concept-chart').getContext('2d');
    window.conceptChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Keywords', 'Technical Terms', 'Classifications'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateProcessingIndicator(indicatorId, message, isActive) {
    const indicator = document.getElementById(indicatorId);
    if (!indicator) return;
    
    const light = indicator.querySelector('.indicator-light');
    const text = indicator.querySelector('span:last-child');
    
    if (text) text.textContent = message;
    
    if (light) {
        if (isActive) {
            light.classList.add('active');
        } else {
            light.classList.remove('active');
        }
    }
}

async function startAutomatedAnalysis() {
    console.log('Starting automated analysis...');
    
    if (!appState.extractedConcepts.keywords || appState.extractedConcepts.keywords.length === 0) {
        alert('Please enter some invention details first.');
        return;
    }
    
    try {
        showLoading('Starting automated analysis...');
        updateProcessingIndicator('analysis-indicator', 'Processing: Active', true);
        
        // Step 1: Generate search queries
        console.log('Step 1: Generating search queries...');
        await generateSearchQueries();
        
        // Step 2: Execute searches
        console.log('Step 2: Executing searches...');
        await executeSearches();
        
        // Step 3: Rank and select results
        console.log('Step 3: Ranking and selecting results...');
        await rankAndSelectResults();
        
        // Step 4: Generate assessment
        console.log('Step 4: Generating assessment...');
        await generateAssessment();
        
        appState.analysisComplete = true;
        elements.generateReportBtn.disabled = false;
        document.getElementById('export-pdf').disabled = false;
        document.getElementById('export-word').disabled = false;
        
        updateProcessingIndicator('analysis-indicator', 'Processing: Complete', false);
        
        console.log('Analysis completed successfully');
        
    } catch (error) {
        console.error('Analysis failed:', error);
        alert('Analysis failed. Please try again.');
        updateProcessingIndicator('analysis-indicator', 'Processing: Failed', false);
    } finally {
        hideLoading();
    }
}

async function generateSearchQueries() {
    updateLoadingMessage('Generating optimized search queries...');
    
    const concepts = appState.extractedConcepts;
    const queries = [];
    
    // Generate Boolean queries based on extracted concepts
    if (concepts.keywords.length > 0) {
        queries.push({
            label: 'Keyword-based Query',
            query: concepts.keywords.slice(0, 3).join(' AND '),
            type: 'boolean'
        });
    }
    
    if (concepts.technicalConcepts.length > 0) {
        queries.push({
            label: 'Technical Concept Query',
            query: concepts.technicalConcepts.slice(0, 2).map(c => `"${c.term}"`).join(' OR '),
            type: 'phrase'
        });
    }
    
    if (concepts.classifications.length > 0) {
        queries.push({
            label: 'Classification Query',
            query: concepts.classifications.slice(0, 2).map(c => c.code).join(' OR '),
            type: 'classification'
        });
    }
    
    // Combined query
    queries.push({
        label: 'Combined Query',
        query: `(${concepts.keywords.slice(0, 2).join(' AND ')}) AND (${concepts.technicalConcepts.slice(0, 1).map(c => `"${c.term}"`).join(' OR ')})`,
        type: 'combined'
    });
    
    appState.generatedQueries = queries;
    displayGeneratedQueries(queries);
    
    await delay(1000);
}

function displayGeneratedQueries(queries) {
    elements.searchStrings.innerHTML = queries.map(query => `
        <div class="search-query">
            <span class="query-label">${query.label}:</span>
            <div>${query.query}</div>
        </div>
    `).join('');
}

async function executeSearches() {
    updateLoadingMessage('Executing searches against patent databases...');
    updateProcessingIndicator('search-indicator', 'Search Status: Active', true);
    
    // Update progress steps
    updateStep('step-generate', 'completed');
    updateStep('step-search', 'active');
    
    try {
        const allResults = [];
        
        for (let i = 0; i < appState.generatedQueries.length; i++) {
            const query = appState.generatedQueries[i];
            updateLoadingMessage(`Executing search ${i + 1}/${appState.generatedQueries.length}...`);
            
            const results = await simulateLensApiCall(query);
            allResults.push(...results);
            
            await delay(500);
        }
        
        // Remove duplicates and consolidate
        const uniqueResults = consolidateResults(allResults);
        appState.searchResults = uniqueResults;
        
        // Update statistics
        document.getElementById('total-results').textContent = uniqueResults.length;
        document.getElementById('queries-executed').textContent = appState.generatedQueries.length;
        
        updateStep('step-search', 'completed');
        await delay(500);
        
        console.log('Search execution completed');
        
    } catch (error) {
        console.error('Search execution failed:', error);
        throw error;
    }
}

async function simulateLensApiCall(query) {
    // Simulate API delay
    await delay(1000);
    
    // Return sample patents with some variation
    const basePatents = [...APP_CONFIG.samplePatents];
    
    // Add some variation based on query type
    return basePatents.map(patent => ({
        ...patent,
        relevanceScore: Math.max(0.7, patent.relevanceScore + (Math.random() - 0.5) * 0.1),
        queryType: query.type
    }));
}

function consolidateResults(results) {
    const seen = new Set();
    const consolidated = [];
    
    for (const result of results) {
        if (!seen.has(result.id)) {
            seen.add(result.id);
            consolidated.push(result);
        }
    }
    
    return consolidated.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

async function rankAndSelectResults() {
    updateLoadingMessage('Ranking results by relevance...');
    updateStep('step-rank', 'active');
    
    // Simulate semantic similarity calculation
    const rankedResults = appState.searchResults.map(result => ({
        ...result,
        semanticScore: calculateSemanticSimilarity(result),
        finalScore: (result.relevanceScore + calculateSemanticSimilarity(result)) / 2
    }));
    
    rankedResults.sort((a, b) => b.finalScore - a.finalScore);
    
    // Select top 10
    appState.topDocuments = rankedResults.slice(0, 10);
    
    updateStep('step-rank', 'completed');
    updateStep('step-select', 'active');
    
    displayTopResults(appState.topDocuments);
    
    // Update statistics
    const avgRelevance = appState.topDocuments.reduce((sum, doc) => sum + doc.finalScore, 0) / appState.topDocuments.length;
    document.getElementById('avg-relevance').textContent = `${(avgRelevance * 100).toFixed(1)}%`;
    
    updateStep('step-select', 'completed');
    await delay(500);
}

function calculateSemanticSimilarity(patent) {
    const concepts = appState.extractedConcepts;
    const patentText = `${patent.title} ${patent.abstract}`.toLowerCase();
    
    let score = 0;
    let matches = 0;
    
    concepts.keywords.forEach(keyword => {
        if (patentText.includes(keyword.toLowerCase())) {
            score += 0.1;
            matches++;
        }
    });
    
    concepts.technicalConcepts.forEach(concept => {
        if (patentText.includes(concept.term.toLowerCase())) {
            score += 0.2;
            matches++;
        }
    });
    
    return Math.min(1.0, score + (matches * 0.05));
}

function displayTopResults(results) {
    elements.patentResults.innerHTML = results.map((patent, index) => `
        <div class="patent-item">
            <div class="patent-header">
                <span class="patent-id">${patent.id}</span>
                <span class="relevance-score">${(patent.finalScore * 100).toFixed(1)}%</span>
            </div>
            <h4 class="patent-title">${patent.title}</h4>
            <p class="patent-abstract">${patent.abstract}</p>
            <div class="patent-analysis">
                <div class="analysis-label">Novelty Assessment:</div>
                <div>${patent.noveltyAssessment}</div>
            </div>
        </div>
    `).join('');
}

async function generateAssessment() {
    updateLoadingMessage('Generating AI assessment report...');
    updateProcessingIndicator('assessment-indicator', 'Assessment: Generating', true);
    
    const assessment = await performAutomatedAssessment();
    appState.assessmentData = assessment;
    
    displayAssessmentResults(assessment);
    generateRecommendations(assessment);
    
    updateProcessingIndicator('assessment-indicator', 'Assessment: Complete', false);
    await delay(1000);
}

async function performAutomatedAssessment() {
    await delay(2000);
    
    const concepts = appState.extractedConcepts;
    const topDocs = appState.topDocuments;
    
    // Simulate AI assessment
    const novelty = assessNovelty(concepts, topDocs);
    const inventiveness = assessInventiveness(concepts, topDocs);
    const applicability = assessApplicability(concepts);
    
    return { novelty, inventiveness, applicability };
}

function assessNovelty(concepts, topDocs) {
    const overlapScore = topDocs.reduce((sum, doc) => sum + doc.finalScore, 0) / topDocs.length;
    const noveltyScore = Math.max(0.3, 1 - overlapScore);
    
    let rating, details;
    if (noveltyScore > 0.7) {
        rating = 'High';
        details = 'Significant novel features identified. Low overlap with existing prior art.';
    } else if (noveltyScore > 0.5) {
        rating = 'Medium';
        details = 'Some novel aspects present. Moderate overlap with prior art requires careful claim drafting.';
    } else {
        rating = 'Low';
        details = 'High overlap with existing prior art. Consider focusing on specific differentiating features.';
    }
    
    return { score: noveltyScore, rating, details };
}

function assessInventiveness(concepts, topDocs) {
    const technicalDepth = concepts.technicalDepth / 100;
    const priorArtDensity = topDocs.length / 20;
    const inventivenessScore = Math.max(0.2, technicalDepth - (priorArtDensity * 0.3));
    
    let rating, details;
    if (inventivenessScore > 0.6) {
        rating = 'High';
        details = 'Strong inventive step evident. Combination of features appears non-obvious.';
    } else if (inventivenessScore > 0.4) {
        rating = 'Medium';
        details = 'Moderate inventive step. Some obvious combinations present but novel aspects identified.';
    } else {
        rating = 'Low';
        details = 'Potential obviousness concerns. Consider emphasizing unexpected results or advantages.';
    }
    
    return { score: inventivenessScore, rating, details };
}

function assessApplicability(concepts) {
    const applicabilityScore = Math.min(1.0, concepts.readinessScore / 100 + 0.2);
    
    let rating, details;
    if (applicabilityScore > 0.8) {
        rating = 'High';
        details = 'Clear industrial application with practical implementation pathway.';
    } else if (applicabilityScore > 0.6) {
        rating = 'Medium';
        details = 'Industrial applicability present but may require additional development details.';
    } else {
        rating = 'Low';
        details = 'Limited industrial applicability evident. Consider providing more implementation details.';
    }
    
    return { score: applicabilityScore, rating, details };
}

function displayAssessmentResults(assessment) {
    // Novelty
    const noveltyScore = document.getElementById('novelty-score');
    const noveltyDetails = document.getElementById('novelty-details');
    noveltyScore.textContent = assessment.novelty.rating;
    noveltyScore.className = `assessment-score ${assessment.novelty.rating.toLowerCase()}`;
    noveltyDetails.innerHTML = `<p>${assessment.novelty.details}</p>`;
    
    // Inventiveness
    const inventivenessScore = document.getElementById('inventiveness-score');
    const inventivenessDetails = document.getElementById('inventiveness-details');
    inventivenessScore.textContent = assessment.inventiveness.rating;
    inventivenessScore.className = `assessment-score ${assessment.inventiveness.rating.toLowerCase()}`;
    inventivenessDetails.innerHTML = `<p>${assessment.inventiveness.details}</p>`;
    
    // Applicability
    const applicabilityScore = document.getElementById('applicability-score');
    const applicabilityDetails = document.getElementById('applicability-details');
    applicabilityScore.textContent = assessment.applicability.rating;
    applicabilityScore.className = `assessment-score ${assessment.applicability.rating.toLowerCase()}`;
    applicabilityDetails.innerHTML = `<p>${assessment.applicability.details}</p>`;
}

function generateRecommendations(assessment) {
    const recommendations = [];
    
    if (assessment.novelty.rating === 'Low') {
        recommendations.push({
            priority: 'High Priority',
            text: 'Focus on unique technical features and differentiating aspects in claim drafting. Consider narrower claim scope to avoid prior art overlap.'
        });
    }
    
    if (assessment.inventiveness.rating === 'Low') {
        recommendations.push({
            priority: 'High Priority',
            text: 'Emphasize unexpected results, technical advantages, or synergistic effects in the patent specification to strengthen inventive step.'
        });
    }
    
    if (assessment.applicability.rating === 'Low') {
        recommendations.push({
            priority: 'Medium Priority',
            text: 'Provide more detailed implementation examples and practical applications to strengthen industrial applicability.'
        });
    }
    
    // General recommendations
    recommendations.push({
        priority: 'Medium Priority',
        text: 'Consider conducting additional prior art searches in related technical fields to ensure comprehensive coverage.'
    });
    
    recommendations.push({
        priority: 'Low Priority',
        text: 'Explore potential continuation or divisional applications to protect various aspects of the invention.'
    });
    
    displayRecommendations(recommendations);
}

function displayRecommendations(recommendations) {
    const recommendationList = document.getElementById('ai-recommendations');
    recommendationList.innerHTML = recommendations.map(rec => `
        <div class="recommendation-item">
            <div class="recommendation-priority">${rec.priority}</div>
            <div class="recommendation-text">${rec.text}</div>
        </div>
    `).join('');
}

function updateStep(stepId, status) {
    const step = document.getElementById(stepId);
    if (step) {
        step.classList.remove('active', 'completed');
        step.classList.add(status);
    }
}

function generateFullReport() {
    if (!appState.assessmentData) {
        alert('Please complete the automated analysis first.');
        return;
    }
    
    alert('Full report generated successfully! In a production environment, this would generate a comprehensive PDF report with all analysis results and recommendations.');
}

function exportReport(format) {
    alert(`Export to ${format.toUpperCase()} functionality would be implemented here. The report would include all analysis results, patent comparisons, and strategic recommendations.`);
}

function showLoading(message) {
    if (elements.loadingOverlay) {
        elements.loadingOverlay.classList.remove('hidden');
    }
    if (elements.loadingMessage) {
        elements.loadingMessage.textContent = message;
    }
}

function hideLoading() {
    if (elements.loadingOverlay) {
        elements.loadingOverlay.classList.add('hidden');
    }
}

function updateLoadingMessage(message) {
    if (elements.loadingMessage) {
        elements.loadingMessage.textContent = message;
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Auto-save functionality
function setupAutoSave() {
    const autoSaveInterval = 30000; // 30 seconds
    
    setInterval(() => {
        if (elements.inventionTitle && elements.inventionAbstract && elements.detailedDescription) {
            const data = {
                title: elements.inventionTitle.value,
                abstract: elements.inventionAbstract.value,
                description: elements.detailedDescription.value,
                timestamp: new Date().toISOString()
            };
            
            console.log('Auto-saved:', data);
        }
    }, autoSaveInterval);
}

// Initialize auto-save when the app loads
setupAutoSave();