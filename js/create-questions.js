/**
 * Question Creation Page JavaScript
 * Handles creation, editing, and management of quiz questions
 */

// Quiz configuration loaded from localStorage
let quizConfig = {};

// Current active question data
let currentQuestion = null;
let currentQuestionIndex = -1;
let currentQuestionType = 'multiple-choice';
let currentWizardStep = 1;

// Question list
let questions = [];

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    // Parse URL parameters for direct question type creation
    const urlParams = new URLSearchParams(window.location.search);
    const questionType = urlParams.get('type');
    const quizCode = urlParams.get('code');
    
    // Load quiz configuration from localStorage or show configuration wizard
    if (localStorage.getItem('quizConfig')) {
        loadQuizConfiguration();
        initializeUI();
        
        // Handle direct question creation from URL parameters
        if (questionType) {
            // Set the type from URL parameter
            currentQuestionType = questionType;
            // Create a new question of the specified type
            showQuestionForm(questionType);
            // Set appropriate button text
            document.getElementById('saveQuestionBtn').innerHTML = '<i class="bi bi-save me-2"></i>Save Question';
            // Enable the complete quiz button once we have at least one question
            document.getElementById('completeQuizBtn').disabled = false;
            // Hide empty state, show form
            document.getElementById('emptyState').style.display = 'none';
            document.getElementById('questionFormContainer').style.display = 'block';
        }
    } else {
        // If no configuration exists but we have URL parameters, create a default configuration
        if (questionType && quizCode) {
            createDefaultConfiguration(questionType, quizCode);
            initializeUI();
            showQuestionForm(questionType);
            // Hide empty state, show form
            document.getElementById('emptyState').style.display = 'none';
            document.getElementById('questionFormContainer').style.display = 'block';
    } else {
        showConfigurationWizard();
        }
    }
    
    // Setup event handlers
    setupEventHandlers();
    
    // Initialize theme based on localStorage or system preference
    initThemeToggle();
    
    // Initialize wizard if it exists
    initializeWizard();
    
    // Show welcome toast
    showToast('Welcome to the Quiz Creator!', 'success');
    
    // Initialize inline question type selection
    initInlineQuestionTypeSelection();
    
    // AI Quiz Generator Button
    const aiQuizBtn = document.getElementById('aiQuizBtn');
    if (aiQuizBtn) {
        aiQuizBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Load AI Quiz Manager script if not already loaded
            if (typeof showAIComingSoonPopup === 'function') {
                showAIComingSoonPopup();
            } else {
                // Load ai-quiz-manager.js if not loaded
                const script = document.createElement('script');
                script.src = 'js/ai-quiz-manager.js';
                script.onload = function() {
                    showAIComingSoonPopup();
                };
                document.body.appendChild(script);
            }
        });
    }
});

/**
 * Create a default configuration when directly accessing from URL parameters
 */
function createDefaultConfiguration(questionType, quizCode) {
    quizConfig = {
        title: 'My New Quiz',
        description: '',
        quizType: questionType,
        numQuestions: 10,
        timePerQuestion: 15,
        chatDuration: 10,
        maxParticipants: 20,
        allowLateJoin: true,
        showLeaderboard: true,
        requireNames: true,
        quizCode: quizCode
    };
    
    // Save configuration to localStorage
    localStorage.setItem('quizConfig', JSON.stringify(quizConfig));
}

/**
 * Load quiz configuration from localStorage
 */
function loadQuizConfiguration() {
    try {
        quizConfig = JSON.parse(localStorage.getItem('quizConfig'));
        if (!quizConfig) {
            throw new Error('No quiz configuration found');
        }
        
        // Create empty questions array if not exists
        if (!quizConfig.questions) {
            quizConfig.questions = [];
        } else {
            questions = quizConfig.questions;
        }
    } catch (error) {
        console.error('Error loading quiz configuration:', error);
        quizConfig = {
            title: 'My Quiz',
            description: '',
            quizType: 'multiple-choice',
            numQuestions: 10,
            timePerQuestion: 15,
            chatDuration: 10,
            maxParticipants: 20,
            allowLateJoin: true,
            showLeaderboard: true,
            requireNames: true,
            quizCode: generateQuizCode()
        };
    }
}

/**
 * Initialize UI components
 */
function initializeUI() {
    // Update quiz title in header
    document.querySelector('.quiz-title').textContent = quizConfig.title || 'Create Your Quiz';
    
    // Update quiz info in sidebar
    document.getElementById('quizTitle').textContent = quizConfig.title || 'Untitled Quiz';
    document.getElementById('quizType').textContent = getTitleForType(quizConfig.quizType);
    document.getElementById('quizDuration').textContent = getTimePerQuestionText(quizConfig.timePerQuestion);
    document.getElementById('chatDuration').textContent = getChatDurationText(quizConfig.chatDuration);
    
    // Update progress indicator
    updateProgress();
    
    // Update questions list
    updateQuestionsList();
    
    // Show empty state if no questions are being edited
    document.getElementById('emptyState').style.display = (currentQuestionIndex === -1) ? 'flex' : 'none';
    document.getElementById('questionFormContainer').style.display = (currentQuestionIndex === -1) ? 'none' : 'block';
}

/**
 * Setup event handlers
 */
function setupEventHandlers() {
    // Add new question button
    const addQuestionBtn = document.getElementById('addQuestionBtn');
    if (addQuestionBtn) {
        addQuestionBtn.addEventListener('click', function() {
            showInlineQuestionTypeSelection();
        });
        
        // Add ripple effect
        addQuestionBtn.addEventListener('mousedown', createRippleEffect);
    }
    
    // Add question from empty state
    const addQuestionEmptyBtn = document.getElementById('addQuestionEmptyBtn');
    if (addQuestionEmptyBtn) {
        addQuestionEmptyBtn.addEventListener('click', function() {
            showInlineQuestionTypeSelection();
        });
        addQuestionEmptyBtn.addEventListener('mousedown', createRippleEffect);
    }
    
    // Save question button
    const saveQuestionBtn = document.getElementById('saveQuestionBtn');
    if (saveQuestionBtn) {
        saveQuestionBtn.addEventListener('click', saveCurrentQuestion);
        saveQuestionBtn.addEventListener('mousedown', createRippleEffect);
    }
    
    // Complete quiz button
    const completeQuizBtn = document.getElementById('completeQuizBtn');
    if (completeQuizBtn) {
        completeQuizBtn.addEventListener('click', finalizeQuiz);
        completeQuizBtn.addEventListener('mousedown', createRippleEffect);
    }
    
    // Preview quiz button
    const previewQuizBtn = document.getElementById('previewQuizBtn');
    if (previewQuizBtn) {
        previewQuizBtn.addEventListener('click', previewQuiz);
        previewQuizBtn.addEventListener('mousedown', createRippleEffect);
    }
    
    // Configure quiz button in sidebar - Direct action instead of popup
    const configureQuizBtn = document.getElementById('configureQuizBtn');
    if (configureQuizBtn) {
        configureQuizBtn.addEventListener('click', function() {
            // Instead of showing the wizard, directly create a new question
            directlyConfigureQuiz();
        });
        // Add ripple effect for better visual feedback
        configureQuizBtn.addEventListener('mousedown', createRippleEffect);
    }
    
    // Setup copy code buttons
    setupCopyCodeButtons();
    
    // Host quiz button in completion modal
    document.getElementById('hostQuizBtn')?.addEventListener('click', hostQuiz);
    document.getElementById('hostQuizBtn')?.addEventListener('mousedown', createRippleEffect);
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

/**
 * Initialize wizard event handlers
 */
function initializeWizard() {
    const wizardContainer = document.getElementById('configWizardContainer');
    const wizard = document.getElementById('configWizard');
    const closeBtn = document.getElementById('closeWizardBtn');
    const prevBtn = document.getElementById('prevStepBtn');
    const nextBtn = document.getElementById('nextStepBtn');
    const steps = document.querySelectorAll('.wizard-step');
    
    if (!wizardContainer || !wizard) return;
    
    // Close wizard button
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            hideConfigurationWizard();
        });
    }
    
    // Previous step button
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            navigateWizard('prev');
        });
        prevBtn.addEventListener('mousedown', createRippleEffect);
    }
    
    // Next step button
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            navigateWizard('next');
        });
        nextBtn.addEventListener('mousedown', createRippleEffect);
    }
    
    // Step navigation
    steps.forEach(step => {
        step.addEventListener('click', function() {
            const stepNumber = parseInt(this.dataset.step);
            goToWizardStep(stepNumber);
        });
    });
    
    // Setup quiz type selection in wizard
    const quizTypeCards = document.querySelectorAll('.quiz-type-card');
    quizTypeCards.forEach(card => {
        card.addEventListener('click', function() {
            quizTypeCards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            quizConfig.quizType = this.dataset.type;
            updateSummary();
        });
    });
    
    // Setup timing options
    const timeOptions = document.querySelectorAll('.setting-option[data-value]');
    timeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const parentGroup = this.closest('.config-form-group');
            const isTimePerQuestion = parentGroup.querySelector('.config-label').textContent.includes('Time Per Question');
            
            // Remove selected class from siblings
            parentGroup.querySelectorAll('.setting-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Add selected class to clicked option
            this.classList.add('selected');
            
            // Update config
            const value = parseInt(this.dataset.value);
            if (isTimePerQuestion) {
                quizConfig.timePerQuestion = value;
            } else if (parentGroup.querySelector('.config-label').textContent.includes('Discussion Time')) {
                quizConfig.chatDuration = value;
            } else if (parentGroup.querySelector('.config-label').textContent.includes('Maximum Number of Participants')) {
                quizConfig.maxParticipants = value;
            }
            
            updateSummary();
        });
    });
    
    // Set up form fields to update config
    document.getElementById('quizTitleInput')?.addEventListener('input', function() {
        quizConfig.title = this.value;
        updateSummary();
    });
    
    document.getElementById('quizDescriptionInput')?.addEventListener('input', function() {
        quizConfig.description = this.value;
    });
    
    document.getElementById('numQuestionsInput')?.addEventListener('change', function() {
        quizConfig.numQuestions = parseInt(this.value);
        updateSummary();
    });
    
    // Set up option checkboxes
    document.getElementById('allowLateJoin')?.addEventListener('change', function() {
        quizConfig.allowLateJoin = this.checked;
    });
    
    document.getElementById('showLeaderboard')?.addEventListener('change', function() {
        quizConfig.showLeaderboard = this.checked;
    });
    
    document.getElementById('requireNames')?.addEventListener('change', function() {
        quizConfig.requireNames = this.checked;
    });
}

/**
 * Initialize the inline question type selection
 */
function initInlineQuestionTypeSelection() {
    const typeSelectionPills = document.querySelectorAll('.question-type-pill');
    
    typeSelectionPills.forEach(pill => {
        pill.addEventListener('click', function() {
            const questionType = this.dataset.type;
            
            // Update the selected pill
            typeSelectionPills.forEach(p => p.classList.remove('selected'));
            this.classList.add('selected');
            
            // Change the question type
            changeQuestionType(questionType);
            
            // Show animation
            const icon = this.querySelector('.question-type-icon-small');
            if (icon) {
                icon.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    icon.style.transform = '';
                }, 300);
            }
        });
    });
}

/**
 * Show inline question type selection
 */
function showInlineQuestionTypeSelection() {
    // Show the question form container
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('questionFormContainer').style.display = 'block';
    
    // If no question is currently being edited, prepare an empty form
    if (currentQuestionIndex === -1) {
        // Set default question type if not already set
        if (!currentQuestionType) {
            currentQuestionType = 'multiple-choice';
        }
        
        // Reset the form fields
        resetFormFields(currentQuestionType);
        
        // Set the question type title
        document.getElementById('questionTypeTitle').textContent = getTitleForType(currentQuestionType);
        
        // Change the type icon
        const typeIcon = document.querySelector('.type-icon i');
        if (typeIcon) {
            typeIcon.className = getIconClassForType(currentQuestionType);
        }
    }
    
    // Highlight the currently selected type
    const questionTypePills = document.querySelectorAll('.question-type-pill');
    questionTypePills.forEach(pill => {
        pill.classList.toggle('selected', pill.dataset.type === currentQuestionType);
    });
    
    // Focus on the question text field
    document.getElementById('questionText').focus();
}

/**
 * Navigate wizard forward or backward
 * @param {string} direction - 'next' or 'prev'
 */
function navigateWizard(direction) {
    const totalSteps = 5; // Total number of steps in the wizard
    
    // Calculate next step
    let nextStep = currentWizardStep;
    if (direction === 'next') {
        nextStep++;
        if (nextStep > totalSteps) {
            // Final step - complete wizard
            finalizeWizardConfig();
            return;
        }
    } else {
        nextStep--;
        if (nextStep < 1) nextStep = 1; // Don't go below step 1
    }
    
    // Validate current step before proceeding to next step
    if (direction === 'next' && !validateWizardStep(currentWizardStep)) {
        return;
    }
    
    // Update button text on final step
    if (nextStep === totalSteps) {
        document.getElementById('nextStepBtn').innerHTML = 'Finish <i class="bi bi-check-circle"></i>';
    } else {
        document.getElementById('nextStepBtn').innerHTML = 'Next <i class="bi bi-arrow-right"></i>';
    }
    
    // Update previous button visibility
    document.getElementById('prevStepBtn').style.visibility = nextStep === 1 ? 'hidden' : 'visible';
    
    // Navigate to the next step
    goToWizardStep(nextStep);
}

/**
 * Go to a specific wizard step
 * @param {number} stepNumber - The step number to go to
 */
function goToWizardStep(stepNumber) {
    // Validate current step before moving
    if (stepNumber > currentWizardStep && !validateWizardStep(currentWizardStep)) {
        return;
    }
    
    // Update current step
    currentWizardStep = stepNumber;
    
    // Update step indicators
    document.querySelectorAll('.wizard-step').forEach(step => {
        const stepNum = parseInt(step.dataset.step);
        step.classList.remove('active', 'completed');
        
        if (stepNum === currentWizardStep) {
            step.classList.add('active');
        } else if (stepNum < currentWizardStep) {
            step.classList.add('completed');
        }
    });
    
    // Show the correct step pane with animation
    document.querySelectorAll('.step-pane').forEach(pane => {
        pane.classList.remove('active');
        if (parseInt(pane.dataset.step) === currentWizardStep) {
            pane.classList.add('active');
            pane.classList.add('animate-in');
            setTimeout(() => {
                pane.classList.remove('animate-in');
            }, 500);
        }
    });
    
    // Fill form fields with existing data
    populateWizardFields();
    
    // Update the summary if on the summary step
    if (currentWizardStep === 5) {
        updateSummary();
    }
}

/**
 * Validate the current wizard step
 * @param {number} step - The step number to validate
 * @returns {boolean} - Whether the step is valid
 */
function validateWizardStep(step) {
    switch (step) {
        case 1: // Basic Info
            const title = document.getElementById('quizTitleInput').value.trim();
            if (!title) {
                showToast('Please enter a quiz title', 'error');
                document.getElementById('quizTitleInput').focus();
                return false;
            }
            return true;
        
        case 2: // Quiz Type
            return true; // Always valid, a type is always selected
        
        case 3: // Timing
        case 4: // Participants
            return true; // Always valid, defaults are selected
        
        default:
            return true;
    }
}

/**
 * Populate wizard fields with existing data
 */
function populateWizardFields() {
    switch (currentWizardStep) {
        case 1: // Basic Info
            document.getElementById('quizTitleInput').value = quizConfig.title || '';
            document.getElementById('quizDescriptionInput').value = quizConfig.description || '';
            document.getElementById('numQuestionsInput').value = quizConfig.numQuestions || 10;
            break;
        
        case 2: // Quiz Type
            document.querySelectorAll('.quiz-type-card').forEach(card => {
                card.classList.toggle('selected', card.dataset.type === quizConfig.quizType);
            });
            break;
        
        case 3: // Timing
            const timePerQuestionGroup = document.querySelector('.config-label:contains("Time Per Question")').closest('.config-form-group');
            if (timePerQuestionGroup) {
                timePerQuestionGroup.querySelectorAll('.setting-option').forEach(option => {
                    option.classList.toggle('selected', parseInt(option.dataset.value) === quizConfig.timePerQuestion);
                });
            }
            
            const chatDurationGroup = document.querySelector('.config-label:contains("Discussion Time")').closest('.config-form-group');
            if (chatDurationGroup) {
                chatDurationGroup.querySelectorAll('.setting-option').forEach(option => {
                    option.classList.toggle('selected', parseInt(option.dataset.value) === quizConfig.chatDuration);
                });
            }
            break;
        
        case 4: // Participants
            const participantsGroup = document.querySelector('.config-label:contains("Maximum Number")').closest('.config-form-group');
            if (participantsGroup) {
                participantsGroup.querySelectorAll('.setting-option').forEach(option => {
                    option.classList.toggle('selected', parseInt(option.dataset.value) === quizConfig.maxParticipants);
                });
            }
            
            document.getElementById('allowLateJoin').checked = quizConfig.allowLateJoin;
            document.getElementById('showLeaderboard').checked = quizConfig.showLeaderboard;
            document.getElementById('requireNames').checked = quizConfig.requireNames;
            break;
        
        case 5: // Summary
            updateSummary();
            break;
    }
}

/**
 * Update the summary step with current configuration
 */
function updateSummary() {
    document.getElementById('summaryTitle').textContent = quizConfig.title || 'Untitled Quiz';
    document.getElementById('summaryType').textContent = getTitleForType(quizConfig.quizType);
    document.getElementById('summaryQuestions').textContent = `${quizConfig.numQuestions} Questions`;
    document.getElementById('summaryTiming').textContent = `${quizConfig.timePerQuestion}s per question + ${quizConfig.chatDuration}s discussion`;
    document.getElementById('summaryParticipants').textContent = `Up to ${quizConfig.maxParticipants} participants`;
    document.getElementById('summaryQuizCode').textContent = quizConfig.quizCode || generateQuizCode();
}

/**
 * Finalize wizard configuration and proceed to question editor
 */
function finalizeWizardConfig() {
    // Ensure we have a quiz code
    if (!quizConfig.quizCode) {
        quizConfig.quizCode = generateQuizCode();
    }
    
    // Set creation timestamp
    quizConfig.createdAt = new Date().toISOString();
    
    // Save configuration to localStorage
    localStorage.setItem('quizConfig', JSON.stringify(quizConfig));
    
    // Hide wizard with animation
    hideConfigurationWizard();
    
    // Update UI with new configuration
    initializeUI();
    
    // Show success message
    showToast('Quiz configuration saved!', 'success');
}

/**
 * Show the configuration wizard
 * @param {boolean} edit - Whether we're editing an existing configuration
 */
function showConfigurationWizard(edit = false) {
    const wizardContainer = document.getElementById('configWizardContainer');
    const wizard = document.getElementById('configWizard');
    
    if (!wizardContainer || !wizard) return;
    
    // Reset wizard to first step
    currentWizardStep = 1;
    goToWizardStep(1);
    
    // Update previous button visibility
    document.getElementById('prevStepBtn').style.visibility = 'hidden';
    
    // Reset next button text
    document.getElementById('nextStepBtn').innerHTML = 'Next <i class="bi bi-arrow-right"></i>';
    
    // If editing, fill with existing configuration
    if (edit && quizConfig) {
        populateWizardFields();
    }
    
    // Show wizard with animation
    wizardContainer.style.display = 'flex';
    setTimeout(() => {
        wizardContainer.classList.add('active');
        wizard.classList.add('active');
    }, 10);
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
}

/**
 * Hide the configuration wizard
 */
function hideConfigurationWizard() {
    const wizardContainer = document.getElementById('configWizardContainer');
    const wizard = document.getElementById('configWizard');
    
    if (!wizardContainer || !wizard) return;
    
    // Hide with animation
    wizard.classList.remove('active');
    wizardContainer.classList.remove('active');
    
    // Remove from DOM after animation completes
    setTimeout(() => {
        wizardContainer.style.display = 'none';
        document.body.style.overflow = '';
    }, 600);
}

/**
 * Setup copy code buttons functionality
 */
function setupCopyCodeButtons() {
    const copyCodeBtns = document.querySelectorAll('#copyCodeBtn, #copyFinalCodeBtn');
    
    copyCodeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const codeElement = this.closest('.quiz-code-display').querySelector('.quiz-code');
            const code = codeElement.textContent;
            
            // Copy to clipboard
            navigator.clipboard.writeText(code).then(() => {
                // Show success message
                showToast('Quiz code copied!', 'success');
            });
        });
    });
}

/**
 * Create a new question of the specified type
 * @param {string} type - The question type to create
 */
function createNewQuestion(type) {
    // Check if we're at the limit already
    if (questions.length >= quizConfig.numQuestions) {
        alert(`You've reached the maximum of ${quizConfig.numQuestions} questions for this quiz.`);
        return;
    }
    
    // Set the current question type
    setQuestionType(type);
    
    // Create a new question object based on type
    const questionTemplate = getQuestionTemplate(type);
    
    // Set as current question
    currentQuestion = JSON.parse(JSON.stringify(questionTemplate));
    currentQuestionIndex = -1; // New question, not yet in the array
    
    // Show the correct form
    showQuestionForm(type);
    
    // Clear form fields
    resetFormFields(type);
    
    // Hide the empty state
    document.getElementById('emptyQuestionState').classList.add('d-none');
}

/**
 * Get a template for the specified question type
 * @param {string} type - The question type
 * @returns {object} A question template object
 */
function getQuestionTemplate(type) {
    // Default templates for different question types
    const templates = {
        'multiple-choice': {
            type: 'multiple-choice',
            question: '',
            options: ['', '', '', ''],
            correctAnswer: null,
            difficulty: 'medium',
            timeLimit: null
        },
        'true-false': {
            type: 'true-false',
            question: '',
            correctAnswer: null,
            difficulty: 'medium',
            timeLimit: null
        },
        'short-answer': {
            type: 'short-answer',
            question: '',
            correctAnswer: '',
            acceptableAnswers: [],
            difficulty: 'medium',
            timeLimit: null
        },
        'matching': {
            type: 'matching',
            question: '',
            pairs: [
                { left: '', right: '' },
                { left: '', right: '' },
                { left: '', right: '' },
                { left: '', right: '' }
            ],
            difficulty: 'medium',
            timeLimit: null
        },
        'fill-blank': {
            type: 'fill-blank',
            question: '',
            blanks: [{ blank: '', answer: '' }],
            difficulty: 'medium',
            timeLimit: null
        },
        'ordering': {
            type: 'ordering',
            question: '',
            items: ['', '', '', ''],
            correctOrder: [0, 1, 2, 3],
            difficulty: 'medium',
            timeLimit: null
        }
    };
    
    return templates[type] || templates['multiple-choice'];
}

/**
 * Set the current question type and update the UI
 * @param {string} type - The question type to set
 */
function setQuestionType(type) {
    currentQuestionType = type;
    
    // Update the question type header
    const header = document.getElementById('currentTypeHeader');
    if (header) {
        // Update icon
        const iconElement = header.querySelector('.type-icon i');
        if (iconElement) {
            iconElement.className = getIconClassForType(type);
        }
        
        // Update title
        const titleElement = header.querySelector('h3');
        if (titleElement) {
            titleElement.textContent = getTitleForType(type);
        }
    }
}

/**
 * Get the Font Awesome icon class for a question type
 * @param {string} type - The question type
 * @returns {string} The icon class
 */
function getIconClassForType(type) {
    const icons = {
        'multiple-choice': 'fas fa-list-ul',
        'true-false': 'fas fa-toggle-on',
        'short-answer': 'fas fa-comment-dots',
        'matching': 'fas fa-exchange-alt',
        'fill-blank': 'fas fa-pencil-alt',
        'ordering': 'fas fa-sort-numeric-down'
    };
    
    return icons[type] || 'fas fa-question';
}

/**
 * Get the display title for a question type
 * @param {string} type - The question type
 * @returns {string} The display title
 */
function getTitleForType(type) {
    const titles = {
        'multiple-choice': 'Multiple Choice Question',
        'true-false': 'True/False Question',
        'short-answer': 'Short Answer Question',
        'matching': 'Matching Question',
        'fill-blank': 'Fill in the Blank Question',
        'ordering': 'Ordering Question'
    };
    
    return titles[type] || 'Question';
}

/**
 * Prepare the question form for a specific question type
 * @param {string} type - The question type to prepare the form for
 */
function showQuestionForm(type) {
    // Update the question type pills
    document.querySelectorAll('.question-type-pill').forEach(pill => {
        pill.classList.remove('selected');
        if (pill.getAttribute('data-type') === type) {
            pill.classList.add('selected');
        }
    });
    
    // Set current question type
    currentQuestionType = type;
    
    // Update type title
    const typeTitle = document.getElementById('questionTypeTitle');
    if (typeTitle) {
        typeTitle.textContent = getTitleForType(type);
    }
    
    // Show the appropriate form containers based on type
    const multipleChoiceContainer = document.getElementById('multipleChoiceContainer');
    const trueFalseContainer = document.getElementById('trueFalseContainer');
    const shortAnswerContainer = document.getElementById('shortAnswerContainer');
    const imageChoiceContainer = document.getElementById('imageChoiceContainer');
    
    // Hide all containers first
    if (multipleChoiceContainer) multipleChoiceContainer.style.display = 'none';
    if (trueFalseContainer) trueFalseContainer.style.display = 'none';
    if (shortAnswerContainer) shortAnswerContainer.style.display = 'none';
    if (imageChoiceContainer) imageChoiceContainer.style.display = 'none';
    
    // Show the appropriate container
    if (type === 'multiple-choice' && multipleChoiceContainer) {
        multipleChoiceContainer.style.display = 'block';
        
        // Ensure we have at least 2 options
        const optionsContainer = document.getElementById('optionsContainer');
        if (optionsContainer && optionsContainer.querySelectorAll('.option-item').length < 2) {
            // Add default options if none exist
            if (optionsContainer.querySelectorAll('.option-item').length === 0) {
                addOption();
                addOption();
            }
        }
    } else if (type === 'true-false' && trueFalseContainer) {
        trueFalseContainer.style.display = 'block';
    } else if (type === 'short-answer' && shortAnswerContainer) {
        shortAnswerContainer.style.display = 'block';
        
        // Ensure we have at least one answer field
        const answerContainer = document.getElementById('shortAnswerOptionsContainer');
        if (answerContainer && answerContainer.querySelectorAll('.input-group').length === 0) {
            addShortAnswer();
        }
    } else if (type === 'image-choice' && imageChoiceContainer) {
        imageChoiceContainer.style.display = 'block';
    }
}

/**
 * Reset the form fields for a specific question type
 * @param {string} type - The question type
 */
function resetFormFields(type) {
    if (type === 'multiple-choice') {
        document.getElementById('mcQuestion').value = '';
        document.querySelectorAll('.option-item input[type="text"]').forEach(input => {
            input.value = '';
        });
        document.querySelectorAll('input[name="mcCorrectAnswer"]').forEach(radio => {
            radio.checked = false;
        });
        document.getElementById('questionDifficulty').value = 'medium';
        document.getElementById('questionTime').value = '';
    }
    // Other question types would have similar reset functions
}

/**
 * Save the current question
 */
function saveCurrentQuestion() {
    // Validate question before saving
    if (!validateCurrentQuestion()) {
        return false;
    }
    
    // Collect form data for the current question
    const questionData = collectFormData();
    
    // Add or update question in the questions array
    if (currentQuestionIndex >= 0) {
        // Update existing question
        questions[currentQuestionIndex] = questionData;
    } else {
        // Add new question
        questions.push(questionData);
        currentQuestionIndex = questions.length - 1;
    }
    
    // Update the quizConfig with the latest questions array
    quizConfig.questions = questions;
    
    // Save updated configuration
    localStorage.setItem('quizConfig', JSON.stringify(quizConfig));
    
    // Update the questions list in the sidebar
    updateQuestionsList();
    
    // Update progress
    updateProgress();
    
    // Enable complete button if we have at least one question
    if (questions.length > 0) {
        document.getElementById('completeQuizBtn').disabled = false;
    }
    
    // Show success message
    showToast('Question saved successfully!', 'success');
    
    // Check if quiz is complete (all required questions added)
    const remainingQuestions = quizConfig.numQuestions - questions.length;
    if (remainingQuestions <= 0) {
        // Offer to complete the quiz
        showCompletionConfirmation();
    } else {
        // Clear form for next question
        resetFormFields(currentQuestionType);
        // Show toast with remaining questions
        showToast(`Question saved! ${remainingQuestions} more ${remainingQuestions === 1 ? 'question' : 'questions'} to go.`, 'success');
    }
    
    return true;
}

/**
 * Show a confirmation dialog to complete the quiz or add more questions
 */
function showCompletionConfirmation() {
    const modalHTML = `
        <div class="completion-confirmation-modal">
            <div class="completion-icon">
                <i class="bi bi-check-circle"></i>
            </div>
            <h4 class="completion-title">Quiz Ready!</h4>
            <p class="completion-message">
                You've added all the required questions for this quiz. Would you like to finalize the quiz, or add more questions?
            </p>
            <div class="completion-actions">
                <button class="btn btn-outline-secondary continue-adding-btn">
                    <i class="bi bi-plus-circle me-2"></i>Add More Questions
                </button>
                <button class="btn btn-primary finalize-quiz-btn">
                    <i class="bi bi-check2-circle me-2"></i>Finalize Quiz
                </button>
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.continue-adding-btn').addEventListener('click', function() {
        document.body.removeChild(modal);
        resetFormFields(currentQuestionType);
    });
    
    modal.querySelector('.finalize-quiz-btn').addEventListener('click', function() {
        document.body.removeChild(modal);
        finalizeQuiz();
    });
}

/**
 * Collect form data based on the current question type
 */
function collectFormData() {
    const questionText = document.getElementById('questionText').value.trim();
    const explanationText = document.getElementById('explanationText').value.trim();
    const questionData = {
        type: currentQuestionType,
        text: questionText,
        explanation: explanationText,
        points: 2 // Default points value
    };
    
    // Collect type-specific data
    if (currentQuestionType === 'multiple-choice') {
        const optionsContainer = document.getElementById('optionsContainer');
        const optionInputs = optionsContainer.querySelectorAll('input[type="text"]');
        const correctOptionRadio = optionsContainer.querySelector('input[type="radio"]:checked');
        
        // Collect options
        const options = Array.from(optionInputs).map(input => input.value.trim());
        
        // Determine correct option
        const correctOption = correctOptionRadio ? parseInt(correctOptionRadio.value) : 0;
        
        questionData.options = options;
        questionData.correctOption = correctOption;
    } else if (currentQuestionType === 'true-false') {
        // Determine if True is the correct answer
        const isTrueCorrect = document.getElementById('tfTrue').checked;
        questionData.correctAnswer = isTrueCorrect ? 'true' : 'false';
    } else if (currentQuestionType === 'short-answer') {
        const container = document.getElementById('shortAnswerOptionsContainer');
        const answerInputs = container.querySelectorAll('input[type="text"]');
        
        // Collect acceptable answers
        const answers = Array.from(answerInputs).map(input => input.value.trim());
        
        questionData.correctAnswers = answers;
        questionData.caseSensitive = document.getElementById('caseSensitive')?.checked || false;
        questionData.exactMatch = document.getElementById('exactMatch')?.checked || true;
    }
    
    return questionData;
}

/**
 * Validate the current question before saving
 * @returns {boolean} Whether the question is valid
 */
function validateCurrentQuestion() {
    if (currentQuestionType === 'multiple-choice') {
        const questionText = document.getElementById('mcQuestion').value.trim();
        if (!questionText) {
            alert('Please enter a question');
            return false;
        }
        
        let hasEmptyOption = false;
        document.querySelectorAll('.option-item input[type="text"]').forEach(input => {
            if (!input.value.trim()) {
                hasEmptyOption = true;
            }
        });
        
        if (hasEmptyOption) {
            alert('Please fill in all options');
            return false;
        }
        
        const correctAnswer = document.querySelector('input[name="mcCorrectAnswer"]:checked');
        if (!correctAnswer) {
            alert('Please select the correct answer');
            return false;
        }
    }
    // Other question types would have similar validation
    
    return true;
}

/**
 * Update the questions list in the sidebar
 */
function updateQuestionsList() {
    const questionsList = document.getElementById('questionsList');
    
    // Clear the list
    questionsList.innerHTML = '';
    
    if (questions.length === 0) {
        // Show empty state
        questionsList.innerHTML = `
            <li class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-question-circle"></i>
                </div>
                <p>Click the "Add" button to create your first question</p>
            </li>
        `;
        return;
    }
    
    // Add each question to the list
    questions.forEach((question, index) => {
        const li = document.createElement('li');
        li.className = index === currentQuestionIndex ? 'active' : '';
        li.innerHTML = `
            <div class="question-item">
                <div class="question-number">${index + 1}</div>
                <div class="question-preview">${truncateText(question.question, 40)}</div>
                <div class="question-type-icon">
                    <i class="${getIconClassForType(question.type)}"></i>
                </div>
            </div>
        `;
        
        // Add click handler to edit the question
        li.addEventListener('click', () => {
            editQuestion(index);
        });
        
        questionsList.appendChild(li);
    });
    
    // Update the finish button status
    document.getElementById('completeQuizBtn').disabled = questions.length < quizConfig.numQuestions;
}

/**
 * Truncate text to a specific length with ellipsis
 * @param {string} text - The text to truncate
 * @param {number} maxLength - The maximum length
 * @returns {string} The truncated text
 */
function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

/**
 * Edit an existing question
 * @param {number} index - The index of the question to edit
 */
function editQuestion(index) {
    if (index < 0 || index >= questions.length) return;
    
    // Set current question
    currentQuestion = questions[index];
    currentQuestionIndex = index;
    
    // Set question type
    setQuestionType(currentQuestion.type);
    
    // Show form
    showQuestionForm(currentQuestion.type);
    
    // Hide the empty state
    document.getElementById('emptyQuestionState').classList.add('d-none');
    
    // Populate form fields
    populateFormFields();
    
    // Update questions list to highlight the current question
    updateQuestionsList();
}

/**
 * Populate form fields with current question data
 */
function populateFormFields() {
    if (currentQuestionType === 'multiple-choice') {
        document.getElementById('mcQuestion').value = currentQuestion.question || '';
        
        // Set options
        const optionInputs = document.querySelectorAll('.option-item input[type="text"]');
        currentQuestion.options.forEach((option, i) => {
            if (i < optionInputs.length) {
                optionInputs[i].value = option;
            }
        });
        
        // Set correct answer
        if (currentQuestion.correctAnswer !== null) {
            const radio = document.querySelector(`input[name="mcCorrectAnswer"][value="${currentQuestion.correctAnswer}"]`);
            if (radio) radio.checked = true;
        }
        
        // Set difficulty and time limit
        document.getElementById('questionDifficulty').value = currentQuestion.difficulty || 'medium';
        document.getElementById('questionTime').value = currentQuestion.timeLimit || '';
    }
    // Other question types would have similar population
}

/**
 * Change the current question type
 * @param {string} newType - The new question type
 */
function changeQuestionType(newType) {
    if (newType === currentQuestionType) return;
    
    // Ask for confirmation if there's data in the current form
    if (hasFormData() && !confirm('Changing question type will reset your current question data. Continue?')) {
        return;
    }
    
    // Change type
    setQuestionType(newType);
    
    // Create new question object of the new type
    const questionTemplate = getQuestionTemplate(newType);
    
    // Preserve question text if possible
    if (currentQuestion && currentQuestion.question) {
        questionTemplate.question = currentQuestion.question;
    }
    
    // Set as current question
    currentQuestion = questionTemplate;
    
    // Show the correct form
    showQuestionForm(newType);
    
    // Populate with any preserved data
    populateFormFields();
}

/**
 * Check if there's data in the current form
 * @returns {boolean} Whether there's form data
 */
function hasFormData() {
    if (currentQuestionType === 'multiple-choice') {
        if (document.getElementById('mcQuestion').value.trim()) return true;
        
        let hasData = false;
        document.querySelectorAll('.option-item input[type="text"]').forEach(input => {
            if (input.value.trim()) hasData = true;
        });
        
        return hasData;
    }
    
    return false;
}

/**
 * Update progress indicators
 */
function updateProgress() {
    const progressEl = document.getElementById('questionsProgress');
    if (progressEl) {
        progressEl.textContent = `${questions.length}/${quizConfig.numQuestions}`;
    }
}

/**
 * Finalize the quiz and redirect to the quiz editor for further editing or hosting
 */
function finalizeQuiz() {
    // Make sure we have at least one question
    if (questions.length === 0) {
        showToast('Please add at least one question before finalizing', 'error');
        return;
    }
    
    // Show loading animation
    showLoading('Finalizing your quiz...');
    
    // Update quiz configuration with final question count
    quizConfig.questions = questions;
    quizConfig.totalQuestions = questions.length;
    
    // Save the final quiz configuration
    localStorage.setItem('quizConfig', JSON.stringify(quizConfig));
    localStorage.setItem('editingQuiz', 'true');
    
    // Prepare data for quiz-editor.js
    const quizEditorData = {
        id: null,
        title: quizConfig.title,
        description: quizConfig.description || '',
        timePerQuestion: parseInt(quizConfig.timePerQuestion),
        chatDuration: parseInt(quizConfig.chatDuration),
        maxParticipants: parseInt(quizConfig.maxParticipants),
        isPublic: true,
        requiresPassword: false,
        password: '',
        requiresApproval: false,
        quizCode: quizConfig.quizCode,
        questions: questions
    };
    
    // Store the quiz data for the editor
    localStorage.setItem('currentQuizData', JSON.stringify(quizEditorData));
    
    // Short delay to show loading animation
    setTimeout(() => {
        // Redirect to the quiz editor page
        window.location.href = `quiz-editor.html?id=${quizConfig.quizCode}`;
    }, 1500);
}

/**
 * Calculate and update quiz statistics in the completion modal
 */
function updateQuizStatistics() {
    // Question count
    const questionCount = questions.length;
    document.getElementById('questionCountStat').textContent = questionCount;
    
    // Estimated time (in minutes)
    const questionTime = parseInt(quizConfig.timePerQuestion);
    const chatTime = parseInt(quizConfig.chatDuration);
    const totalTimeSeconds = (questionTime + chatTime) * questionCount;
    const estimatedMinutes = Math.ceil(totalTimeSeconds / 60);
    document.getElementById('estimatedTimeStat').textContent = estimatedMinutes;
    
    // Add animation to the stats
    animateStats();
}

/**
 * Animate statistics with a counting effect
 */
function animateStats() {
    const statValues = document.querySelectorAll('.stat-value');
    
    statValues.forEach(stat => {
        if (stat.id === 'questionCountStat' || stat.id === 'estimatedTimeStat') {
            const finalValue = parseInt(stat.textContent);
            let startValue = 0;
            const duration = 1500;
            const step = Math.ceil(finalValue / (duration / 50));
            
            const counter = setInterval(() => {
                startValue += step;
                if (startValue >= finalValue) {
                    stat.textContent = finalValue;
                    clearInterval(counter);
                } else {
                    stat.textContent = startValue;
                }
            }, 50);
        }
    });
}

/**
 * Enhanced version of show completion modal
 */
function showCompletionModal() {
    // Show completion modal with enhanced animation
    const completeModal = new bootstrap.Modal(document.getElementById('quizCompleteModal'));
    completeModal.show();
    
    // Create confetti effect
    createConfettiEffect();
    
    // Add pulsing animation to host quiz button
    const hostBtn = document.getElementById('hostQuizBtn');
    if (hostBtn) {
        hostBtn.classList.add('pulsing-btn');
    }
    
    // Play success sound if available
    const successSound = document.getElementById('successSound');
    if (successSound) {
        successSound.play().catch(e => console.warn('Could not play success sound', e));
    }
    
    // Update theme-specific elements in the modal
    const isDarkTheme = document.body.classList.contains('dark-theme');
    updateModalTheme(document.getElementById('quizCompleteModal'));
    
    // Set up copy button handlers
    document.getElementById('copyCodeBtn').addEventListener('click', function() {
        const code = document.getElementById('quizCodeDisplay').textContent;
        navigator.clipboard.writeText(code).then(() => {
            showToast('Quiz code copied to clipboard!', 'success');
            this.innerHTML = '<i class="bi bi-check-circle me-1"></i>Copied!';
            setTimeout(() => {
                this.innerHTML = '<i class="bi bi-clipboard me-1"></i>Copy Code';
            }, 2000);
        });
    });
    
    // Set up share buttons
    setupShareButtons();
}

/**
 * Setup share button functionality
 */
function setupShareButtons() {
    const shareButtons = document.querySelectorAll('.share-buttons .btn');
    const quizCode = document.getElementById('quizCodeDisplay').textContent;
    const shareUrl = `${window.location.origin}/multiplayer.html?quiz=${quizCode}`;
    const shareText = `Join my quiz on Quizora! Use code: ${quizCode}`;
    
    shareButtons.forEach(button => {
        button.addEventListener('mousedown', createRippleEffect);
        
        button.addEventListener('click', function() {
            const icon = this.querySelector('i');
            const platform = icon.className;
            
            if (platform.includes('facebook')) {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
            } else if (platform.includes('twitter')) {
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
            } else if (platform.includes('whatsapp')) {
                window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
            } else if (platform.includes('envelope')) {
                window.location.href = `mailto:?subject=Join my quiz on Quizora&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
            } else if (platform.includes('link')) {
                navigator.clipboard.writeText(shareUrl).then(() => {
                    showToast('Quiz link copied to clipboard!', 'success');
                });
            }
        });
    });
}

/**
 * Enhanced confetti effect with multiple colors
 */
function createConfettiEffect() {
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    document.body.appendChild(confettiContainer);
    
    // Define confetti colors - use theme-aware colors
    const isDarkTheme = document.body.classList.contains('dark-theme');
    const colors = isDarkTheme ? 
        ['#5e7bff', '#879fff', '#ff8585', '#53eaa0', '#ffffff'] :
        ['#4e6fff', '#ff7070', '#43e695', '#6a11cb', '#2575fc'];
    
    // Create confetti pieces
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        // Random confetti properties
        const size = Math.random() * 10 + 5;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100;
        const delay = Math.random() * 3;
        const duration = Math.random() * 3 + 3;
        
        // Random shape
        const shape = Math.floor(Math.random() * 3);
        if (shape === 0) {
            // Circle
            confetti.style.borderRadius = '50%';
        } else if (shape === 1) {
            // Rectangle
            confetti.style.borderRadius = '2px';
        } else {
            // Star
            confetti.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
        }
        
        // Apply styles
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;
        confetti.style.backgroundColor = color;
        confetti.style.left = `${left}%`;
        confetti.style.animationDelay = `${delay}s`;
        confetti.style.animationDuration = `${duration}s`;
        
        confettiContainer.appendChild(confetti);
    }
    
    // Remove confetti after animation completes
    setTimeout(() => {
        confettiContainer.remove();
    }, 6000);
}

/**
 * Generate a random quiz code
 * @returns {string} - A 6-character alphanumeric code
 */
function generateQuizCode() {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing characters like I,O,0,1
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

/**
 * Host the quiz by redirecting to multiplayer.html with quiz data
 */
function hostQuiz() {
    // Show fancy loading with custom message
    showLoading('Preparing your multiplayer quiz experience...');
    
    // Simulate loading process with step messages
    const loadingMessages = [
        'Setting up quiz environment...',
        'Generating unique session...',
        'Preparing host interface...',
        'Finalizing game setup...',
        'Ready to launch!'
    ];
    
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
        if (messageIndex < loadingMessages.length) {
            document.querySelector('.loading-content p').textContent = loadingMessages[messageIndex];
            messageIndex++;
        } else {
            clearInterval(messageInterval);
            // Redirect to multiplayer page with quiz data
            window.location.href = `multiplayer.html?quiz=${quizConfig.quizCode}`;
        }
    }, 800);
}

/**
 * Show loading overlay with animation
 * @param {string} message - The loading message to display
 */
function showLoading(message) {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
        <div class="loading-content">
            <div class="spinner-container">
                <div class="spinner"></div>
            </div>
            <p>${message}</p>
        </div>
    `;
    document.body.appendChild(overlay);
    
    // Prevent scrolling while loading
    document.body.style.overflow = 'hidden';
    
    // Fade in effect
    overlay.style.opacity = '0';
    setTimeout(() => {
        overlay.style.transition = 'opacity 0.3s ease';
        overlay.style.opacity = '1';
    }, 10);
}

/**
 * Preview the quiz
 */
function previewQuiz() {
    // Save current state to localStorage
    if (questions.length > 0) {
        quizConfig.questions = questions;
        localStorage.setItem('quizConfig', JSON.stringify(quizConfig));
        
        // Open preview in new tab
        window.open(`preview-quiz.html?code=${quizConfig.quizCode}`, '_blank');
    } else {
        alert('Please create at least one question before previewing.');
    }
}

/**
 * Helper function to get participant limit text
 */
function getParticipantLimitText(limit) {
    if (limit === 'unlimited') return 'Unlimited participants';
    return `${limit} participants`;
}

/**
 * Helper function to get time per question text
 */
function getTimePerQuestionText(time) {
    if (time === 'unlimited') return 'No time limit';
    return `${time} seconds`;
}

/**
 * Helper function to get chat duration text
 */
function getChatDurationText(duration) {
    if (duration === 0) return 'No chat';
    if (duration === 60) return '1min chat';
    if (duration === 120) return '2min chat';
    return `${duration}s chat`;
}

/**
 * Initialize UI theme toggle functionality
 */
function initThemeToggle() {
    const themeToggle = document.createElement('div');
    themeToggle.className = 'theme-toggle-wrapper d-flex align-items-center';
    themeToggle.innerHTML = `
        <div class="theme-toggle">
            <i class="bi bi-sun-fill light-icon"></i>
            <i class="bi bi-moon-fill dark-icon"></i>
            <div class="toggle-circle"></div>
        </div>
    `;
    
    // Insert theme toggle before the quiz progress
    const headerContainer = document.querySelector('.quiz-creator-header .container');
    const progressDiv = document.querySelector('.quiz-progress');
    if (headerContainer && progressDiv) {
        headerContainer.insertBefore(themeToggle, progressDiv);
    }
    
    // Add event listener to theme toggle
    themeToggle.querySelector('.theme-toggle').addEventListener('click', toggleTheme);
    
    // Check for saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-theme');
    }
}

/**
 * Toggle between light and dark theme - enhanced to update modals
 */
function toggleTheme() {
    const isDarkTheme = document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
    
    // Show theme change toast
    showToast(`Switched to ${isDarkTheme ? 'dark' : 'light'} theme`, 'success');
    
    // Update UI elements that need theme-specific adjustments
    updateThemeSpecificUI(isDarkTheme);
    
    // Update the wizard if visible
    const wizardContainer = document.getElementById('configWizardContainer');
    if (wizardContainer && wizardContainer.classList.contains('active')) {
        // No specific updates needed, CSS variables handle most of it
        updateSummary(); // Refresh summary with correct theming
    }
    
    // Update any open modals
    const openModals = document.querySelectorAll('.modal.show');
    openModals.forEach(modal => {
        updateModalTheme(modal);
    });
}

/**
 * Update UI elements that need theme-specific adjustments
 */
function updateThemeSpecificUI(isDarkTheme) {
    // Update code editor if available
    const codeEditors = document.querySelectorAll('.code-editor');
    if (codeEditors.length > 0) {
        codeEditors.forEach(editor => {
            editor.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
        });
    }
    
    // Update charts if available
    const charts = document.querySelectorAll('.chart-container canvas');
    if (charts.length > 0 && window.Chart) {
        charts.forEach(chart => {
            const chartInstance = Chart.getChart(chart);
            if (chartInstance) {
                chartInstance.options.plugins.tooltip.backgroundColor = isDarkTheme ? '#2a2a45' : '#fff';
                chartInstance.options.plugins.tooltip.titleColor = isDarkTheme ? '#fff' : '#333';
                chartInstance.options.plugins.tooltip.bodyColor = isDarkTheme ? '#e6e6e6' : '#666';
                chartInstance.options.plugins.tooltip.borderColor = isDarkTheme ? '#3a3a55' : '#ddd';
                chartInstance.update();
            }
        });
    }
}

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Toast type (success, error)
 */
function showToast(message, type = 'success') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}"></i>
        </div>
        <div class="toast-message">${message}</div>
        <button class="toast-close"><i class="bi bi-x"></i></button>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Add close event
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.remove();
    });
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

/**
 * Create ripple effect on button click
 * @param {Event} e - Mouse event
 */
function createRippleEffect(e) {
    const button = e.currentTarget;
    
    const ripple = document.createElement('span');
    ripple.classList.add('ripple-effect');
    
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

/**
 * Handle keyboard shortcuts
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + S to save current question
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (currentQuestionIndex !== -1) {
            saveCurrentQuestion();
            showToast('Question saved with keyboard shortcut (Ctrl+S)', 'success');
        }
    }
    
    // Ctrl/Cmd + N for new question
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        showInlineQuestionTypeSelection();
        showToast('New question shortcut activated (Ctrl+N)', 'success');
    }
    
    // Ctrl/Cmd + P for preview
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        previewQuiz();
        showToast('Preview shortcut activated (Ctrl+P)', 'success');
    }
    
    // Ctrl/Cmd + Enter to finalize quiz
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        finalizeQuiz();
    }
}

/**
 * Directly configure quiz and move to question creation
 * without showing the configuration wizard
 */
function directlyConfigureQuiz() {
    // If we don't have a configuration yet, create a default one
    if (!quizConfig) {
        quizConfig = {
            title: 'My Quiz',
            description: '',
            quizType: 'multiple-choice',
            numQuestions: 10,
            timePerQuestion: 15,
            chatDuration: 10,
            maxParticipants: 20,
            allowLateJoin: true,
            showLeaderboard: true,
            requireNames: true,
            quizCode: generateQuizCode(),
            createdAt: new Date().toISOString()
        };
    }
    
    // Save configuration to localStorage
    localStorage.setItem('quizConfig', JSON.stringify(quizConfig));
    
    // Show inline question type selection instead of creating a new question directly
    showInlineQuestionTypeSelection();
    
    // Set current question type to match config
    currentQuestionType = quizConfig.quizType || 'multiple-choice';
    
    // Update question type pills to match current type
    document.querySelectorAll('.question-type-pill').forEach(pill => {
        pill.classList.toggle('selected', pill.dataset.type === currentQuestionType);
    });
    
    // Show toast notification
    showToast('Create your first question!', 'success');
    
    // Update UI with configuration
    initializeUI();
} 
