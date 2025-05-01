/**
 * Quiz Editor JavaScript
 * Handles the creation, editing, and management of quiz questions
 */

// Quiz data
let quizData = {
  id: null,
  title: 'Untitled Quiz',
  description: '',
  timePerQuestion: 20,
  chatDuration: 15,
  maxParticipants: 10,
  isPublic: true,
  requiresPassword: false,
  password: '',
  requiresApproval: false,
  quizCode: generateQuizCode(),
  questions: []
};

// Current question editing state
let currentQuestionIndex = -1;
let currentQuestionType = 'multiple-choice';
let previewQuestionIndex = 0;

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
  // First, check if we have quiz data in localStorage from the create-questions.html flow
  const storedQuizData = localStorage.getItem('currentQuizData');
  
  if (storedQuizData) {
    try {
      // Parse and use the quiz data from localStorage
      quizData = JSON.parse(storedQuizData);
      
      // Clear the localStorage entry to avoid reloading this data later
      localStorage.removeItem('currentQuizData');
      
      // Initialize UI with the loaded data
      initializeUI();
      updateQuestionsList();
      
      // Show a success message
      showToast('Quiz loaded successfully! You can now edit or host it.', 'success');
    } catch (error) {
      console.error('Error loading quiz data from localStorage:', error);
      // Continue with normal initialization
      checkUrlParams();
    }
  } else {
    // If no data in localStorage, check URL parameters
    checkUrlParams();
  }
  
  // Setup event listeners
  setupEventListeners();
  
  // Initialize theme
  initializeTheme();
  
  // Initialize enhanced UI
  initUI();
});

/**
 * Check URL parameters for quiz ID or new parameter
 */
function checkUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const isNewQuiz = urlParams.get('new') === 'true';
  const quizId = urlParams.get('id');
  
  if (quizId && !isNewQuiz) {
    // Load existing quiz data
    loadQuizData(quizId);
  } else {
    // Initialize new quiz
    initializeNewQuiz();
  }
  
  // Initialize UI
  initializeUI();
}

/**
 * Initialize a new quiz
 */
function initializeNewQuiz() {
  // Create a new quiz object
  quizData = {
    id: '',
    title: 'Untitled Quiz',
    description: '',
    questions: [],
    timePerQuestion: 20,
    chatDuration: 15,
    maxParticipants: 10,
    isPublic: true,
    password: '',
    requiresApproval: false,
    quizCode: generateQuizCode() // Ensure there's always a quiz code
  };
  
  // Update the UI
  initializeUI();
}

/**
 * Load existing quiz data
 */
function loadQuizData(quizId) {
  // In a real application, this would be an API call
  // For demo, we'll use localStorage
  
  try {
    const savedQuizzes = JSON.parse(localStorage.getItem('savedQuizzes')) || {};
    
    if (savedQuizzes[quizId]) {
      quizData = savedQuizzes[quizId];
      
      // Update UI with loaded data
      updateQuizInfoUI();
      updateQuestionsList();
      
      // Show toast notification
      showToast('Quiz loaded successfully', 'success');
    } else {
      showToast('Quiz not found', 'error');
      quizData.id = quizId; // Set the ID for saving later
    }
  } catch (error) {
    console.error('Error loading quiz data:', error);
    showToast('Failed to load quiz', 'error');
  }
}

/**
 * Initialize UI elements
 */
function initializeUI() {
  // Set initial question type
  changeQuestionType('multiple-choice');
  
  // Show empty state
  document.getElementById('emptyState').style.display = 'flex';
  document.getElementById('questionFormContainer').style.display = 'none';
  
  // Update quiz info display
  updateQuizInfoUI();
  
  // Update questions list
  updateQuestionsList();
}

/**
 * Update quiz information in the UI
 */
function updateQuizInfoUI() {
  // Update header title
  document.getElementById('headerQuizTitle').textContent = quizData.title;
  
  // Update sidebar info
  document.getElementById('quizTitle').textContent = quizData.title;
  document.getElementById('quizDuration').textContent = `${quizData.timePerQuestion} seconds per question`;
  document.getElementById('chatDuration').textContent = quizData.chatDuration > 0 ? 
    `${quizData.chatDuration} seconds discussion` : 'No discussion';
  document.getElementById('participantsLimit').textContent = quizData.maxParticipants > 0 ? 
    `Max ${quizData.maxParticipants} participants` : 'Unlimited participants';
  document.getElementById('accessType').textContent = quizData.isPublic ? 
    'Public access' : 'Private access (password required)';
    
  // Update questions count
  document.getElementById('questionsCount').textContent = quizData.questions.length;
  document.getElementById('questionsProgress').textContent = 
    `${quizData.questions.length}/${quizData.questions.length}`;
    
  // Show/hide empty questions message
  const emptyQuestionsMessage = document.getElementById('emptyQuestionsMessage');
  if (emptyQuestionsMessage) {
    emptyQuestionsMessage.style.display = quizData.questions.length === 0 ? 'flex' : 'none';
  }
}

/**
 * Update the questions list in the sidebar
 */
function updateQuestionsList() {
  const questionsList = document.getElementById('questionsList');
  
  // Clear the current list except the empty state message
  const emptyMessage = document.getElementById('emptyQuestionsMessage');
  questionsList.innerHTML = '';
  
  if (emptyMessage) {
    questionsList.appendChild(emptyMessage);
  }
  
  // Add questions to the list
  quizData.questions.forEach((question, index) => {
    const questionItem = document.createElement('li');
    questionItem.className = 'question-item';
    questionItem.setAttribute('data-index', index);
    
    if (index === currentQuestionIndex) {
      questionItem.classList.add('active');
    }
    
    const badgeType = getBadgeTypeClass(question.type);
    
    questionItem.innerHTML = `
      <div class="question-number">Q${index + 1}</div>
      <div class="question-info">
        <span class="question-type-badge ${badgeType}">${getQuestionTypeShortLabel(question.type)}</span>
        <div class="question-text">${truncateText(question.text, 50)}</div>
      </div>
      <div class="question-actions">
        <button class="question-action-btn edit-btn" title="Edit" data-action="edit" data-index="${index}">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="question-action-btn duplicate-btn" title="Duplicate" data-action="duplicate" data-index="${index}">
          <i class="bi bi-files"></i>
        </button>
        <button class="question-action-btn delete-btn" title="Delete" data-action="delete" data-index="${index}">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    `;
    
    questionsList.appendChild(questionItem);
    
    // Add click event to the question item
    questionItem.addEventListener('click', function(e) {
      // Don't trigger if clicking on an action button
      if (!e.target.closest('.question-action-btn')) {
        editQuestion(index);
      }
    });
  });
  
  // Add click events to action buttons
  document.querySelectorAll('.question-action-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent triggering parent click
      
      const action = this.getAttribute('data-action');
      const index = parseInt(this.getAttribute('data-index'));
      
      if (action === 'edit') {
        editQuestion(index);
      } else if (action === 'duplicate') {
        duplicateQuestion(index);
      } else if (action === 'delete') {
        deleteQuestion(index);
      }
    });
  });
  
  // Update empty state visibility
  if (emptyMessage) {
    emptyMessage.style.display = quizData.questions.length === 0 ? 'flex' : 'none';
  }
  
  // Update question count
  document.getElementById('questionsCount').textContent = quizData.questions.length;
  document.getElementById('questionsProgress').textContent = 
    `${quizData.questions.length}/${quizData.questions.length}`;
}

/**
 * Get CSS class for question type badge
 */
function getBadgeTypeClass(type) {
  switch (type) {
    case 'multiple-choice': return 'mc';
    case 'true-false': return 'tf';
    case 'short-answer': return 'sa';
    case 'image-choice': return 'img';
    default: return '';
  }
}

/**
 * Get short label for question type
 */
function getQuestionTypeShortLabel(type) {
  switch (type) {
    case 'multiple-choice': return 'MC';
    case 'true-false': return 'T/F';
    case 'short-answer': return 'SA';
    case 'image-choice': return 'IMG';
    default: return type;
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Add question buttons
  document.getElementById('addQuestionBtn').addEventListener('click', addNewQuestion);
  document.getElementById('addQuestionEmptyBtn').addEventListener('click', addNewQuestion);
  
  // Save and cancel question buttons
  document.getElementById('saveQuestionBtn').addEventListener('click', saveQuestion);
  document.getElementById('cancelQuestionBtn').addEventListener('click', cancelEditQuestion);
  
  // Option management
  document.getElementById('addOptionBtn').addEventListener('click', addOption);
  
  // Add short answer option
  const addShortAnswerBtn = document.getElementById('addShortAnswerBtn');
  if (addShortAnswerBtn) {
    addShortAnswerBtn.addEventListener('click', addShortAnswer);
  }
  
  // Question type selection
  document.querySelectorAll('.question-type-pill').forEach(pill => {
    pill.addEventListener('click', function() {
      const type = this.getAttribute('data-type');
      changeQuestionType(type);
    });
  });
  
  // Remove option buttons - delegate to document for dynamically added elements
  document.addEventListener('click', function(e) {
    if (e.target.closest('[data-action="remove"]')) {
      e.preventDefault();
      const optionItem = e.target.closest('.option-item');
      if (optionItem) {
        optionItem.remove();
        reindexOptions();
      }
    }
    
    if (e.target.closest('[data-action="remove-sa"]')) {
      e.preventDefault();
      // Don't remove if it's the only one
      const container = document.getElementById('shortAnswerOptionsContainer');
      if (container.querySelectorAll('.input-group').length > 1) {
        const inputGroup = e.target.closest('.input-group');
        if (inputGroup) {
          inputGroup.remove();
          reindexShortAnswers();
        }
      } else {
        showToast('You must have at least one correct answer', 'warning');
      }
    }
  });
  
  // Edit title button
  document.getElementById('editTitleBtn').addEventListener('click', function() {
    const currentTitle = quizData.title;
    const newTitle = prompt('Enter quiz title:', currentTitle);
    
    if (newTitle && newTitle.trim() !== '') {
      quizData.title = newTitle.trim();
      document.getElementById('headerQuizTitle').textContent = quizData.title;
      document.getElementById('quizTitle').textContent = quizData.title;
    }
  });
  
  // Quiz settings button
  document.getElementById('quizSettingsBtn').addEventListener('click', openSettingsModal);
  
  // Save settings button
  document.getElementById('saveSettingsBtn').addEventListener('click', saveQuizSettings);
  
  // Access type radio buttons in settings
  document.getElementById('settingsAccessPrivate').addEventListener('change', togglePasswordField);
  document.getElementById('settingsAccessPublic').addEventListener('change', togglePasswordField);
  
  // Host quiz button
  document.getElementById('hostQuizBtn').addEventListener('click', openHostModal);
  
  // Start hosting button
  document.getElementById('startHostingBtn').addEventListener('click', startHostingQuiz);
  
  // Copy quiz code button
  document.getElementById('copyQuizCodeBtn').addEventListener('click', copyQuizCode);
  
  // Show/hide password button
  const showPasswordBtn = document.getElementById('showPasswordBtn');
  if (showPasswordBtn) {
    showPasswordBtn.addEventListener('click', togglePasswordVisibility);
  }
  
  // Copy password button
  const copyPasswordBtn = document.getElementById('copyPasswordBtn');
  if (copyPasswordBtn) {
    copyPasswordBtn.addEventListener('click', copyQuizPassword);
  }
  
  // Save quiz button
  document.getElementById('saveQuizBtn').addEventListener('click', saveQuiz);
  
  // Preview quiz button
  document.getElementById('previewQuizBtn').addEventListener('click', openPreviewModal);
  
  // Preview navigation buttons
  document.getElementById('prevPreviewBtn').addEventListener('click', showPreviousPreviewQuestion);
  document.getElementById('nextPreviewBtn').addEventListener('click', showNextPreviewQuestion);
  
  // Host from preview button
  document.getElementById('hostFromPreviewBtn').addEventListener('click', function() {
    // Save the quiz first
    saveQuiz();
    
    // Close preview modal
    const previewModal = bootstrap.Modal.getInstance(document.getElementById('previewQuizModal'));
    previewModal.hide();
    
    // Redirect to host page
    setTimeout(() => {
      window.location.href = `host-quiz.html?id=${quizData.id}&code=${quizData.quizCode}`;
    }, 500);
  });
  
  // Setup scroll event for the form container
  setupSaveButtonScrollEvent();
  
  // Add keyboard shortcut - Ctrl+S to save question
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (document.getElementById('questionFormContainer').style.display !== 'none') {
        saveQuestion();
      }
    }
    
    // Add Ctrl+Enter to add option for multiple choice
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      const multipleChoiceContainer = document.getElementById('multipleChoiceContainer');
      if (multipleChoiceContainer && multipleChoiceContainer.style.display !== 'none') {
        addOption();
        scrollToLastOption();
      }
    }
  });
}

/**
 * Initialize theme based on localStorage or system preference
 */
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme === 'dark' || 
     (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && !savedTheme)) {
    document.body.classList.add('dark-theme');
    
    // Update theme toggle position
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
      themeToggle.classList.add('active');
    }
  }
  
  // Add theme toggle listener
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
}

/**
 * Toggle between light and dark theme
 */
function toggleTheme() {
  const isDarkTheme = document.body.classList.toggle('dark-theme');
  localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
  
  // Update toggle position
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.classList.toggle('active', isDarkTheme);
  }
}

/**
 * Add a new question
 */
function addNewQuestion() {
  // Reset form
  document.getElementById('questionForm').reset();
  
  // Clear options and answers
  document.getElementById('optionsContainer').innerHTML = '';
  document.getElementById('shortAnswerOptionsContainer').innerHTML = '';
  
  // Set default type
  changeQuestionType('multiple-choice');
  
  // Add default options for multiple choice
  addOption();
  addOption();
  
  // Add default option for short answer
  addShortAnswer();
  
  // Set default points
  document.getElementById('pointsValue').value = '2';
  
  // Update form title
  document.getElementById('questionTypeTitle').textContent = getQuestionTypeTitle('multiple-choice');
  
  // Hide empty state, show form
  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('questionFormContainer').style.display = 'block';
  
  // Reset current index
  currentQuestionIndex = -1;
  
  // Scroll to top of form
  const formContainer = document.getElementById('questionFormContainer');
  if (formContainer) {
    formContainer.scrollTop = 0;
  }
}

/**
 * Reset form fields
 */
function resetFormFields() {
  // Reset question text
  document.getElementById('questionText').value = '';
  
  // Reset multiple choice options
  const optionsContainer = document.getElementById('optionsContainer');
  const options = optionsContainer.querySelectorAll('.option-item');
  
  // Keep first 4 options, remove the rest
  options.forEach((option, index) => {
    if (index < 4) {
      const input = option.querySelector('input[type="text"]');
      if (input) input.value = '';
    } else {
      option.remove();
    }
  });
  
  // Set first option as correct
  const radioButtons = optionsContainer.querySelectorAll('input[type="radio"]');
  if (radioButtons.length > 0) {
    radioButtons[0].checked = true;
  }
  
  // Reset true/false selection
  document.getElementById('tfTrue').checked = true;
  
  // Reset short answer
  const shortAnswerContainer = document.getElementById('shortAnswerOptionsContainer');
  if (shortAnswerContainer) {
    // Clear all but first input
    const shortAnswerInputs = shortAnswerContainer.querySelectorAll('.input-group');
    shortAnswerInputs.forEach((input, index) => {
      if (index === 0) {
        const textInput = input.querySelector('input[type="text"]');
        if (textInput) textInput.value = '';
      } else {
        input.remove();
      }
    });
  }
  
  // Reset case sensitivity and exact match
  document.getElementById('caseSensitive').checked = false;
  document.getElementById('exactMatch').checked = true;
  
  // Reset explanation
  document.getElementById('explanationText').value = '';
  
  // Reset points
  document.getElementById('pointsValue').value = '2';
}

/**
 * Edit an existing question
 */
function editQuestion(index) {
  if (index >= 0 && index < quizData.questions.length) {
    const question = quizData.questions[index];
    
    // Set form values
    document.getElementById('questionText').value = question.text;
    document.getElementById('explanationText').value = question.explanation || '';
    document.getElementById('pointsValue').value = question.points || 2;
    
    // Set question type
    changeQuestionType(question.type);
    
    // Clear existing options
    document.getElementById('optionsContainer').innerHTML = '';
    document.getElementById('shortAnswerOptionsContainer').innerHTML = '';
    
    // Add type-specific options
    if (question.type === 'multiple-choice') {
      // Add each option
      question.options.forEach((option, optIndex) => {
        addOption();
        
        // Get the last added option
        const optionItems = document.querySelectorAll('.option-item');
        const lastOption = optionItems[optionItems.length - 1];
        
        // Set text value
        lastOption.querySelector('input[type="text"]').value = option;
        
        // Check correct option
        if (optIndex === question.correctOption) {
          lastOption.querySelector('input[type="radio"]').checked = true;
        }
      });
    } else if (question.type === 'true-false') {
      // Set true/false
      if (question.correctAnswer === 'true') {
        document.getElementById('tfTrue').checked = true;
      } else {
        document.getElementById('tfFalse').checked = true;
      }
    } else if (question.type === 'short-answer') {
      // Add each correct answer
      question.correctAnswers.forEach(answer => {
        addShortAnswer();
        
        // Get the last added answer
        const answerItems = document.querySelectorAll('#shortAnswerOptionsContainer .input-group');
        const lastAnswer = answerItems[answerItems.length - 1];
        
        // Set text value
        lastAnswer.querySelector('input[type="text"]').value = answer;
      });
      
      // Set matching options
      document.getElementById('caseSensitive').checked = question.caseSensitive || false;
      document.getElementById('exactMatch').checked = question.exactMatch || false;
    }
    
    // Hide empty state, show form
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('questionFormContainer').style.display = 'block';
    
    // Set current index
    currentQuestionIndex = index;
    
    // Scroll to top of form
    const formContainer = document.getElementById('questionFormContainer');
    if (formContainer) {
      formContainer.scrollTop = 0;
    }
  }
}

/**
 * Populate form fields with question data
 */
function populateFormFields(question) {
  // Set question text
  document.getElementById('questionText').value = question.text;
  
  // Set explanation
  document.getElementById('explanationText').value = question.explanation || '';
  
  // Set points
  document.getElementById('pointsValue').value = question.points.toString();
  
  // Type-specific fields
  if (question.type === 'multiple-choice') {
    // Clear existing options
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    // Add each option
    question.options.forEach((option, index) => {
      const optionItem = document.createElement('div');
      optionItem.className = 'option-item';
      optionItem.innerHTML = `
        <div class="input-group mb-3">
          <span class="input-group-text">
            <input class="form-check-input mt-0" type="radio" name="correctOption" value="${index}" ${question.correctOption === index ? 'checked' : ''}>
          </span>
          <input type="text" class="form-control" placeholder="Option ${index + 1}" name="mcOption" value="${option}">
          <button type="button" class="option-action" data-action="remove">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      `;
      optionsContainer.appendChild(optionItem);
    });
  } else if (question.type === 'true-false') {
    // Set true/false option
    if (question.correctAnswer === 'true') {
      document.getElementById('tfTrue').checked = true;
    } else {
      document.getElementById('tfFalse').checked = true;
    }
  } else if (question.type === 'short-answer') {
    // Clear existing options
    const shortAnswerContainer = document.getElementById('shortAnswerOptionsContainer');
    shortAnswerContainer.innerHTML = '';
    
    // Add each correct answer
    question.correctAnswers.forEach(answer => {
      const answerItem = document.createElement('div');
      answerItem.className = 'input-group mb-2';
      answerItem.innerHTML = `
        <input type="text" class="form-control" placeholder="Correct answer" name="saCorrectAnswer" value="${answer}">
        <button type="button" class="option-action" data-action="remove-sa">
          <i class="bi bi-trash"></i>
        </button>
      `;
      shortAnswerContainer.appendChild(answerItem);
    });
    
    // Set case sensitivity and exact match
    document.getElementById('caseSensitive').checked = question.caseSensitive || false;
    document.getElementById('exactMatch').checked = question.exactMatch !== false; // Default true
  }
}

/**
 * Add an option to multiple choice question
 */
function addOption() {
  const optionsContainer = document.getElementById('optionsContainer');
  const optionCount = optionsContainer.querySelectorAll('.option-item').length;
  
  // Limit to 6 options
  if (optionCount >= 6) {
    showToast('Maximum of 6 options allowed', 'warning');
    return;
  }
  
  const optionIndex = optionCount;
  const optionItem = document.createElement('div');
  optionItem.className = 'option-item';
  optionItem.innerHTML = `
    <div class="input-group mb-3">
      <span class="input-group-text">
        <input class="form-check-input mt-0" type="radio" name="correctOption" value="${optionIndex}">
      </span>
      <input type="text" class="form-control" placeholder="Option ${optionIndex + 1}" name="mcOption">
      <button type="button" class="option-action" data-action="remove">
        <i class="bi bi-trash"></i>
      </button>
    </div>
  `;
  
  optionsContainer.appendChild(optionItem);
  
  // Add event listener to remove button
  optionItem.querySelector('[data-action="remove"]').addEventListener('click', function() {
    optionItem.remove();
    reindexOptions();
  });

  // Scroll to make the new option visible if needed
  scrollToLastOption();
}

/**
 * Add a short answer option
 */
function addShortAnswer() {
  const shortAnswerContainer = document.getElementById('shortAnswerOptionsContainer');
  const answerCount = shortAnswerContainer.querySelectorAll('.input-group').length;
  
  const answerItem = document.createElement('div');
  answerItem.className = 'input-group mb-2';
  answerItem.innerHTML = `
    <input type="text" class="form-control" placeholder="Correct answer" name="saCorrectAnswer">
    <button type="button" class="option-action" data-action="remove-sa">
      <i class="bi bi-trash"></i>
    </button>
  `;
  
  shortAnswerContainer.appendChild(answerItem);
  
  // Add event listener to remove button
  answerItem.querySelector('[data-action="remove-sa"]').addEventListener('click', function() {
    answerItem.remove();
    reindexShortAnswers();
  });

  // Scroll to make the new answer option visible if needed
  scrollToLastOption();
}

/**
 * Scroll to make the last option visible (used after adding options)
 */
function scrollToLastOption() {
  const formContainer = document.getElementById('questionFormContainer');
  if (formContainer) {
    // We wait a tiny bit for the DOM to update before scrolling
    setTimeout(() => {
      // Get either the last multiple choice option or the last short answer option, whichever is visible
      const lastOption = document.querySelector('#optionsContainer .option-item:last-child') || 
                          document.querySelector('#shortAnswerOptionsContainer .input-group:last-child');
      
      if (lastOption) {
        const optionBottom = lastOption.offsetTop + lastOption.offsetHeight;
        const formHeight = formContainer.clientHeight;
        const currentScroll = formContainer.scrollTop;
        
        // Only scroll if the new option isn't fully visible
        if (optionBottom > currentScroll + formHeight - 100) { // leave some space at bottom
          formContainer.scrollTop = optionBottom - formHeight + 150;
        }
      }
    }, 10);
  }
}

/**
 * Change the current question type
 */
function changeQuestionType(type) {
  // Update current type
  currentQuestionType = type;
  
  // Update question type title
  document.getElementById('questionTypeTitle').textContent = getQuestionTypeTitle(type);
  
  // Update type pill selection
  document.querySelectorAll('.question-type-pill').forEach(pill => {
    pill.classList.remove('selected');
    if (pill.getAttribute('data-type') === type) {
      pill.classList.add('selected');
    }
  });
  
  // Show/hide appropriate form sections
  document.getElementById('multipleChoiceContainer').style.display = type === 'multiple-choice' ? 'block' : 'none';
  document.getElementById('trueFalseContainer').style.display = type === 'true-false' ? 'block' : 'none';
  document.getElementById('shortAnswerContainer').style.display = type === 'short-answer' ? 'block' : 'none';
  document.getElementById('imageChoiceContainer').style.display = type === 'image-choice' ? 'block' : 'none';
}

/**
 * Get full title for question type
 */
function getQuestionTypeTitle(type) {
  switch (type) {
    case 'multiple-choice': return 'Multiple Choice Question';
    case 'true-false': return 'True/False Question';
    case 'short-answer': return 'Short Answer Question';
    case 'image-choice': return 'Image Choice Question';
    default: return type;
  }
}

/**
 * Save the current question
 */
function saveQuestion() {
  // Validate form
  if (!validateQuestionForm()) {
    return;
  }
  
  // Collect question data
  const questionData = collectQuestionData();
  
  // Check if editing existing or creating new
  if (currentQuestionIndex >= 0) {
    // Updating existing question
    quizData.questions[currentQuestionIndex] = questionData;
  } else {
    // Adding new question
    quizData.questions.push(questionData);
  }
  
  // Update UI
  updateQuestionsList();
  updateQuestionsCount();
  
  // Show success message
  showToast('Question saved successfully!');
  
  // Reset state
  currentQuestionIndex = -1;
  
  // Clear form or go back to empty state if no questions
  if (quizData.questions.length === 0) {
    document.getElementById('questionFormContainer').style.display = 'none';
    document.getElementById('emptyState').style.display = 'flex';
  } else {
    // Reset form but keep it visible for another question
    resetFormFields();
    
    // Scroll form back to top for next question
    const formContainer = document.getElementById('questionFormContainer');
    if (formContainer) {
      formContainer.scrollTop = 0;
    }
  }
}

/**
 * Ensure the save button is visible when scrolling to the bottom of the form
 * Add this to setupEventListeners
 */
function setupSaveButtonScrollEvent() {
  const formContainer = document.getElementById('questionFormContainer');
  if (formContainer) {
    formContainer.addEventListener('scroll', function() {
      // Calculate if we're near the bottom of the form content
      const scrollHeight = formContainer.scrollHeight;
      const scrollTop = formContainer.scrollTop;
      const clientHeight = formContainer.clientHeight;
      
      // If we're within 50px of the bottom
      if (scrollHeight - scrollTop - clientHeight < 50) {
        // We're at the bottom, show the full action buttons
        document.querySelector('.form-actions').classList.add('fully-visible');
      } else {
        document.querySelector('.form-actions').classList.remove('fully-visible');
      }
    });
  }
}

/**
 * Function to scroll to the save button area
 */
function scrollToSaveButton() {
  const formContainer = document.getElementById('questionFormContainer');
  if (formContainer) {
    formContainer.scrollTop = formContainer.scrollHeight;
  }
}

/**
 * Cancel editing the current question
 */
function cancelEditQuestion() {
  // Show empty state and hide form
  document.getElementById('emptyState').style.display = 'flex';
  document.getElementById('questionFormContainer').style.display = 'none';
  
  // Reset current question index
  currentQuestionIndex = -1;
}

/**
 * Validate the question form
 */
function validateQuestionForm() {
  const questionText = document.getElementById('questionText').value.trim();
  
  if (!questionText) {
    showToast('Please enter a question', 'error');
    return false;
  }
  
  if (currentQuestionType === 'multiple-choice') {
    const optionsContainer = document.getElementById('optionsContainer');
    const options = optionsContainer.querySelectorAll('input[type="text"]');
    
    // Check if we have at least 2 options
    if (options.length < 2) {
      showToast('Please add at least 2 options', 'error');
      return false;
    }
    
    // Check if all options have text
    let emptyOptions = false;
    options.forEach(option => {
      if (!option.value.trim()) {
        emptyOptions = true;
      }
    });
    
    if (emptyOptions) {
      showToast('Please fill in all options', 'error');
      return false;
    }
    
    // Check if a correct answer is selected
    const correctOption = optionsContainer.querySelector('input[type="radio"]:checked');
    if (!correctOption) {
      showToast('Please select a correct answer', 'error');
      return false;
    }
  } else if (currentQuestionType === 'short-answer') {
    const container = document.getElementById('shortAnswerOptionsContainer');
    const answers = container.querySelectorAll('input[type="text"]');
    
    // Check if we have at least 1 correct answer
    if (answers.length < 1) {
      showToast('Please add at least 1 correct answer', 'error');
      return false;
    }
    
    // Check if all answers have text
    let emptyAnswers = false;
    answers.forEach(answer => {
      if (!answer.value.trim()) {
        emptyAnswers = true;
      }
    });
    
    if (emptyAnswers) {
      showToast('Please fill in all correct answers', 'error');
      return false;
    }
  }
  
  return true;
}

/**
 * Collect question data from the form
 */
function collectQuestionData() {
  const questionText = document.getElementById('questionText').value.trim();
  const explanation = document.getElementById('explanationText').value.trim();
  const points = parseInt(document.getElementById('pointsValue').value);
  
  const questionData = {
    type: currentQuestionType,
    text: questionText,
    explanation: explanation,
    points: points
  };
  
  if (currentQuestionType === 'multiple-choice') {
    const optionsContainer = document.getElementById('optionsContainer');
    const optionInputs = optionsContainer.querySelectorAll('input[type="text"]');
    const correctOptionRadio = optionsContainer.querySelector('input[type="radio"]:checked');
    
    const options = Array.from(optionInputs).map(input => input.value.trim());
    const correctOption = correctOptionRadio ? parseInt(correctOptionRadio.value) : 0;
    
    questionData.options = options;
    questionData.correctOption = correctOption;
  } else if (currentQuestionType === 'true-false') {
    const isTrueCorrect = document.getElementById('tfTrue').checked;
    questionData.correctAnswer = isTrueCorrect ? 'true' : 'false';
  } else if (currentQuestionType === 'short-answer') {
    const container = document.getElementById('shortAnswerOptionsContainer');
    const answerInputs = container.querySelectorAll('input[type="text"]');
    
    const answers = Array.from(answerInputs).map(input => input.value.trim());
    
    questionData.correctAnswers = answers;
    questionData.caseSensitive = document.getElementById('caseSensitive').checked;
    questionData.exactMatch = document.getElementById('exactMatch').checked;
  }
  
  return questionData;
}

/**
 * Duplicate a question
 */
function duplicateQuestion(index) {
  if (index >= 0 && index < quizData.questions.length) {
    // Get the question to duplicate
    const original = quizData.questions[index];
    
    // Create a deep copy
    const duplicate = JSON.parse(JSON.stringify(original));
    
    // Add "(Copy)" to the question text
    duplicate.text += ' (Copy)';
    
    // Add to the quiz
    quizData.questions.push(duplicate);
    
    // Update the UI
    updateQuestionsList();
    
    // Show success message
    showToast('Question duplicated', 'success');
  }
}

/**
 * Delete a question
 */
function deleteQuestion(index) {
  if (index >= 0 && index < quizData.questions.length) {
    // Confirm deletion
    if (confirm(`Are you sure you want to delete question ${index + 1}?`)) {
      // Remove the question
      quizData.questions.splice(index, 1);
      
      // Update the UI
      updateQuestionsList();
      
      // Show success message
      showToast('Question deleted', 'success');
      
      // If editing this question, close the form
      if (currentQuestionIndex === index) {
        document.getElementById('emptyState').style.display = 'flex';
        document.getElementById('questionFormContainer').style.display = 'none';
        currentQuestionIndex = -1;
      } else if (currentQuestionIndex > index) {
        // Update current question index if needed
        currentQuestionIndex--;
      }
    }
  }
}

/**
 * Open quiz settings modal
 */
function openSettingsModal() {
  // Populate form with current settings
  document.getElementById('settingsQuizTitle').value = quizData.title;
  document.getElementById('settingsQuizDescription').value = quizData.description || '';
  document.getElementById('settingsTimePerQuestion').value = quizData.timePerQuestion.toString();
  document.getElementById('settingsMaxParticipants').value = quizData.maxParticipants.toString();
  document.getElementById('settingsChatDuration').value = quizData.chatDuration.toString();
  
  // Set access type
  if (quizData.isPublic) {
    document.getElementById('settingsAccessPublic').checked = true;
  } else {
    document.getElementById('settingsAccessPrivate').checked = true;
  }
  
  // Set password field
  const passwordContainer = document.getElementById('settingsPasswordContainer');
  passwordContainer.style.display = quizData.isPublic ? 'none' : 'block';
  
  if (!quizData.isPublic) {
    document.getElementById('settingsQuizPassword').value = quizData.password || '';
  }
  
  // Set approval toggle
  document.getElementById('settingsRequireApproval').checked = quizData.requiresApproval;
  
  // Show the modal
  const settingsModal = new bootstrap.Modal(document.getElementById('quizSettingsModal'));
  settingsModal.show();
}

/**
 * Toggle password field visibility based on access type
 */
function togglePasswordField() {
  const isPrivate = document.getElementById('settingsAccessPrivate').checked;
  const passwordContainer = document.getElementById('settingsPasswordContainer');
  
  passwordContainer.style.display = isPrivate ? 'block' : 'none';
}

/**
 * Save quiz settings
 */
function saveQuizSettings() {
  // Get form values
  const title = document.getElementById('settingsQuizTitle').value.trim();
  const description = document.getElementById('settingsQuizDescription').value.trim();
  const timePerQuestion = parseInt(document.getElementById('settingsTimePerQuestion').value);
  const maxParticipants = parseInt(document.getElementById('settingsMaxParticipants').value);
  const chatDuration = parseInt(document.getElementById('settingsChatDuration').value);
  const isPublic = document.getElementById('settingsAccessPublic').checked;
  const requiresApproval = document.getElementById('settingsRequireApproval').checked;
  
  // Validate
  if (!title) {
    showToast('Please enter a quiz title', 'error');
    return;
  }
  
  // Get password if private
  let password = '';
  if (!isPublic) {
    password = document.getElementById('settingsQuizPassword').value.trim();
    if (!password) {
      showToast('Please enter a password for private access', 'error');
      return;
    }
  }
  
  // Update quiz data
  quizData.title = title;
  quizData.description = description;
  quizData.timePerQuestion = timePerQuestion;
  quizData.maxParticipants = maxParticipants;
  quizData.chatDuration = chatDuration;
  quizData.isPublic = isPublic;
  quizData.requiresPassword = !isPublic;
  quizData.password = password;
  quizData.requiresApproval = requiresApproval;
  
  // Update UI
  updateQuizInfoUI();
  
  // Close the modal
  const settingsModal = bootstrap.Modal.getInstance(document.getElementById('quizSettingsModal'));
  settingsModal.hide();
  
  // Show success message
  showToast('Quiz settings saved', 'success');
}

/**
 * Open the host quiz modal
 */
function openHostModal() {
  // Check if the quiz has questions
  if (quizData.questions.length === 0) {
    showToast('Please add at least one question before hosting', 'error');
    return;
  }
  
  // Update modal content
  document.getElementById('quizCodeDisplay').textContent = quizData.quizCode;
  
  // Update privacy settings
  const publicSetting = document.getElementById('privacySettingPublic');
  const privateSetting = document.getElementById('privacySettingPrivate');
  const approvalSection = document.getElementById('approvalSection');
  
  publicSetting.style.display = quizData.isPublic ? 'flex' : 'none';
  privateSetting.style.display = quizData.isPublic ? 'none' : 'flex';
  
  // Update password display
  if (!quizData.isPublic) {
    document.getElementById('passwordDisplay').value = quizData.password;
  }
  
  // Update approval section
  approvalSection.style.display = quizData.requiresApproval ? 'block' : 'none';
  
  // Show the modal
  const hostModal = new bootstrap.Modal(document.getElementById('hostQuizModal'));
  hostModal.show();
}

/**
 * Copy quiz code to clipboard
 */
function copyQuizCode() {
  const code = document.getElementById('quizCodeDisplay').textContent;
  
  navigator.clipboard.writeText(code).then(function() {
    showToast('Quiz code copied to clipboard', 'success');
  }, function() {
    showToast('Failed to copy quiz code', 'error');
  });
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility() {
  const passwordInput = document.getElementById('passwordDisplay');
  const button = document.getElementById('showPasswordBtn');
  
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    button.innerHTML = '<i class="bi bi-eye-slash"></i>';
  } else {
    passwordInput.type = 'password';
    button.innerHTML = '<i class="bi bi-eye"></i>';
  }
}

/**
 * Copy quiz password to clipboard
 */
function copyQuizPassword() {
  const password = document.getElementById('passwordDisplay').value;
  
  navigator.clipboard.writeText(password).then(function() {
    showToast('Password copied to clipboard', 'success');
  }, function() {
    showToast('Failed to copy password', 'error');
  });
}

/**
 * Save the quiz
 */
function saveQuiz() {
  // Check if quiz has a title
  if (!quizData.title || quizData.title === 'Untitled Quiz') {
    showToast('Please set a quiz title in settings', 'warning');
    setTimeout(() => {
      openSettingsModal();
    }, 1000);
    return;
  }
  
  // Generate ID if not exists
  if (!quizData.id) {
    quizData.id = generateQuizId();
  }
  
  // Generate quiz code if not exists
  if (!quizData.quizCode) {
    quizData.quizCode = generateQuizCode();
  }
  
  // In a real application, this would be an API call
  // For demo, we'll use localStorage
  try {
    const savedQuizzes = JSON.parse(localStorage.getItem('savedQuizzes')) || {};
    savedQuizzes[quizData.id] = quizData;
    localStorage.setItem('savedQuizzes', JSON.stringify(savedQuizzes));
    
    showToast('Quiz saved successfully', 'success');
  } catch (error) {
    console.error('Error saving quiz:', error);
    showToast('Failed to save quiz', 'error');
  }
}

/**
 * Start hosting the quiz
 */
function startHostingQuiz() {
  // Check if we have a quiz ID
  if (!quizData.id) {
    // Generate new ID if not exists
    quizData.id = generateQuizId();
  }
  
  // Ensure we have a quiz code
  if (!quizData.quizCode) {
    quizData.quizCode = generateQuizCode();
  }
  
  console.log("Starting to host quiz with ID:", quizData.id);
  console.log("Quiz code:", quizData.quizCode);
  
  // Save the quiz first to ensure all data is stored
  saveQuiz();
  
  // Redirect to quiz host page with the quiz ID and code
  window.location.href = `host-quiz.html?id=${quizData.id}&code=${quizData.quizCode}`;
}

/**
 * Open the quiz preview modal
 */
function openPreviewModal() {
  // Update preview info
  document.getElementById('previewQuizTitle').textContent = quizData.title;
  document.getElementById('previewQuestionCount').textContent = quizData.questions.length;
  document.getElementById('previewMaxParticipants').textContent = quizData.maxParticipants > 0 ? 
    quizData.maxParticipants : 'Unlimited';
  
  // Calculate estimated time
  const questionTime = quizData.timePerQuestion;
  const chatTime = quizData.chatDuration;
  const totalTime = (questionTime + chatTime) * quizData.questions.length;
  const minutes = Math.ceil(totalTime / 60);
  document.getElementById('previewTimeEstimate').textContent = minutes;
  
  // Hide navigation if no questions
  const previewNavigation = document.getElementById('previewNavigation');
  previewNavigation.style.display = quizData.questions.length > 0 ? 'flex' : 'none';
  
  // Show empty state if no questions
  const previewEmptyState = document.getElementById('previewEmptyState');
  previewEmptyState.style.display = quizData.questions.length === 0 ? 'flex' : 'none';
  
  // Load questions for preview
  loadPreviewQuestions();
  
  // Reset current preview index
  previewQuestionIndex = 0;
  updatePreviewPagination();
  
  // Show the modal
  const previewModal = new bootstrap.Modal(document.getElementById('previewQuizModal'));
  previewModal.show();
}

/**
 * Load questions for preview
 */
function loadPreviewQuestions() {
  const container = document.getElementById('previewQuestionContainer');
  
  // Remove any existing questions except empty state
  const emptyState = document.getElementById('previewEmptyState');
  container.innerHTML = '';
  container.appendChild(emptyState);
  
  // If no questions, show empty state
  if (quizData.questions.length === 0) {
    return;
  }
  
  // Add each question
  quizData.questions.forEach((question, index) => {
    const questionItem = document.createElement('div');
    questionItem.className = 'preview-question-item';
    questionItem.id = `previewQuestion${index}`;
    
    // First question is active
    if (index === 0) {
      questionItem.classList.add('active');
    }
    
    let optionsHtml = '';
    
    if (question.type === 'multiple-choice') {
      optionsHtml = '<div class="preview-options">';
      question.options.forEach((option, optIndex) => {
        optionsHtml += `
          <div class="preview-option" data-option="${optIndex}">
            ${option}
          </div>
        `;
      });
      optionsHtml += '</div>';
    } else if (question.type === 'true-false') {
      optionsHtml = `
        <div class="preview-options">
          <div class="preview-option" data-option="true">True</div>
          <div class="preview-option" data-option="false">False</div>
        </div>
      `;
    } else if (question.type === 'short-answer') {
      optionsHtml = `
        <div class="short-answer-input mt-3 mb-4">
          <input type="text" class="form-control" placeholder="Type your answer here" disabled>
          <div class="form-text">
            In the actual quiz, participants will type their answer here.
          </div>
        </div>
      `;
    }
    
    let explanationHtml = '';
    if (question.explanation) {
      explanationHtml = `        <div class="preview-explanation">
          <div class="preview-explanation-title">Explanation:</div>
          <div class="preview-explanation-text">${question.explanation}</div>
        </div>
      `;
    }
    
    questionItem.innerHTML = `
      <div class="preview-question-header">
        <div class="preview-question-number">Question ${index + 1} of ${quizData.questions.length}</div>
        <div class="preview-question-type">${getQuestionTypeTitle(question.type)}</div>
      </div>
      <div class="preview-question-text">${question.text}</div>
      ${optionsHtml}
      ${explanationHtml}
    `;
    
    container.appendChild(questionItem);
  });
}

/**
 * Show the next question in preview
 */
function showNextPreviewQuestion() {
  if (previewQuestionIndex < quizData.questions.length - 1) {
    // Hide current question
    document.getElementById(`previewQuestion${previewQuestionIndex}`).classList.remove('active');
    
    // Increment index
    previewQuestionIndex++;
    
    // Show next question
    document.getElementById(`previewQuestion${previewQuestionIndex}`).classList.add('active');
    
    // Update pagination
    updatePreviewPagination();
  }
}

/**
 * Show the previous question in preview
 */
function showPreviousPreviewQuestion() {
  if (previewQuestionIndex > 0) {
    // Hide current question
    document.getElementById(`previewQuestion${previewQuestionIndex}`).classList.remove('active');
    
    // Decrement index
    previewQuestionIndex--;
    
    // Show previous question
    document.getElementById(`previewQuestion${previewQuestionIndex}`).classList.add('active');
    
    // Update pagination
    updatePreviewPagination();
  }
}

/**
 * Update the preview pagination display
 */
function updatePreviewPagination() {
  const pagination = document.getElementById('previewPagination');
  pagination.textContent = `Question ${previewQuestionIndex + 1} of ${quizData.questions.length}`;
  
  // Enable/disable navigation buttons
  document.getElementById('prevPreviewBtn').disabled = previewQuestionIndex === 0;
  document.getElementById('nextPreviewBtn').disabled = previewQuestionIndex === quizData.questions.length - 1;
}

/**
 * Generate a random quiz code
 */
function generateQuizCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars.charAt(randomIndex);
  }
  
  return code;
}

/**
 * Generate a unique quiz ID
 */
function generateQuizId() {
  return 'quiz_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Truncate text to a specified length
 */
function truncateText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substr(0, maxLength) + '...';
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
  // Check if toast container exists
  let toastContainer = document.querySelector('.toast-container');
  
  if (!toastContainer) {
    // Create toast container
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toastId = 'toast-' + Date.now();
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'bg-danger' : type === 'warning' ? 'bg-warning' : 'bg-success'} text-white`;
  toast.id = toastId;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  
  toast.innerHTML = `
    <div class="toast-header ${type === 'error' ? 'bg-danger' : type === 'warning' ? 'bg-warning' : 'bg-success'} text-white">
      <strong class="me-auto">
        ${type === 'error' ? '<i class="bi bi-exclamation-triangle"></i> Error' : 
         type === 'warning' ? '<i class="bi bi-exclamation-circle"></i> Warning' : 
         '<i class="bi bi-check-circle"></i> Success'}
      </strong>
      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
      ${message}
    </div>
  `;
  
  toastContainer.appendChild(toast);
  
  // Initialize and show toast
  const bsToast = new bootstrap.Toast(toast, {
    autohide: true,
    delay: 3000
  });
  
  bsToast.show();
  
  // Remove toast after it's hidden
  toast.addEventListener('hidden.bs.toast', function() {
    toast.remove();
  });
}

/**
 * Reindex options after deletion
 */
function reindexOptions() {
  const optionsContainer = document.getElementById('optionsContainer');
  const optionItems = optionsContainer.querySelectorAll('.option-item');
  
  optionItems.forEach((item, index) => {
    const radio = item.querySelector('input[type="radio"]');
    const input = item.querySelector('input[type="text"]');
    
    radio.value = index;
    input.placeholder = `Option ${index + 1}`;
  });
}

/**
 * Reindex short answers after deletion
 */
function reindexShortAnswers() {
  const container = document.getElementById('shortAnswerOptionsContainer');
  const answers = container.querySelectorAll('.input-group');
  
  answers.forEach((answer, index) => {
    const textInput = answer.querySelector('input[type="text"]');
    if (index === 0) {
      textInput.placeholder = "Correct answer";
    } else {
      textInput.placeholder = `Alternative answer ${index}`;
    }
  });
}

// Theme toggle functionality
function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;
    
    // Check for saved theme
    const savedTheme = localStorage.getItem('quizora-theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.classList.add('dark');
    }
    
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
        this.classList.toggle('dark');
        
        // Save preference
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('quizora-theme', isDark ? 'dark' : 'light');
    });
}

// Settings toggle in sidebar
function initSettingsToggle() {
    const settingsTitle = document.querySelector('.settings-title');
    const settingsContent = document.querySelector('.settings-content');
    const toggleBtn = document.querySelector('.toggle-btn');
    
    if (!settingsTitle || !settingsContent || !toggleBtn) return;
    
    // Check if settings should be collapsed (from localStorage)
    const isCollapsed = localStorage.getItem('quizora-settings-collapsed') === 'true';
    if (isCollapsed) {
        settingsContent.style.display = 'none';
        toggleBtn.classList.add('collapsed');
    }
    
    settingsTitle.addEventListener('click', function() {
        if (settingsContent.style.display === 'none') {
            settingsContent.style.display = 'block';
            toggleBtn.classList.remove('collapsed');
            localStorage.setItem('quizora-settings-collapsed', 'false');
        } else {
            settingsContent.style.display = 'none';
            toggleBtn.classList.add('collapsed');
            localStorage.setItem('quizora-settings-collapsed', 'true');
        }
    });
}

// Preview button functionality
function initPreviewButton() {
    const previewBtn = document.getElementById('previewBtn');
    if (!previewBtn) return;
    
    previewBtn.addEventListener('click', function() {
        // Get current questions
        const questions = getCurrentQuizQuestions();
        if (questions.length === 0) {
            showToast('Please add at least one question before previewing', 'warning');
            return;
        }
        
        // Populate preview modal
        populatePreviewModal(questions);
        
        // Show modal
        const previewModal = new bootstrap.Modal(document.getElementById('previewQuizModal'));
        previewModal.show();
    });
}

function populatePreviewModal(questions) {
    const previewContainer = document.querySelector('.preview-quiz-carousel');
    const paginationElement = document.querySelector('.preview-pagination');
    const prevButton = document.querySelector('.preview-prev-btn');
    const nextButton = document.querySelector('.preview-next-btn');
    
    if (!previewContainer || !paginationElement) return;
    
    // Clear previous content
    previewContainer.innerHTML = '';
    
    // Current question index
    let currentIndex = 0;
    
    // Update pagination
    function updatePagination() {
        paginationElement.textContent = `Question ${currentIndex + 1} of ${questions.length}`;
    }
    
    // Show current question
    function showCurrentQuestion() {
        // Clear container
        previewContainer.innerHTML = '';
        
        const question = questions[currentIndex];
        const questionElement = document.createElement('div');
        questionElement.className = 'preview-question';
        
        // Question content
        let questionContent = `
            <h4 class="mb-3">${question.text}</h4>
            <div class="d-flex justify-content-between mb-4">
                <span class="badge bg-primary">${getQuestionTypeLabel(question.type)}</span>
                <span class="badge bg-secondary">${question.points} points</span>
            </div>
        `;
        
        // Options based on question type
        if (question.type === 'mc') {
            questionContent += '<div class="preview-options">';
            question.options.forEach((option, index) => {
                const isCorrect = question.answers.includes(index.toString());
                questionContent += `
                    <div class="form-check mb-2">
                        <input class="form-check-input" type="radio" disabled>
                        <label class="form-check-label ${isCorrect ? 'text-success fw-bold' : ''}">
                            ${option} ${isCorrect ? '<i class="bi bi-check-circle-fill text-success ms-2"></i>' : ''}
                        </label>
                    </div>
                `;
            });
            questionContent += '</div>';
        } else if (question.type === 'tf') {
            const correctAnswer = question.answers[0];
            questionContent += `
                <div class="preview-options">
                    <div class="form-check mb-2">
                        <input class="form-check-input" type="radio" disabled>
                        <label class="form-check-label ${correctAnswer === 'true' ? 'text-success fw-bold' : ''}">
                            True ${correctAnswer === 'true' ? '<i class="bi bi-check-circle-fill text-success ms-2"></i>' : ''}
                        </label>
                    </div>
                    <div class="form-check mb-2">
                        <input class="form-check-input" type="radio" disabled>
                        <label class="form-check-label ${correctAnswer === 'false' ? 'text-success fw-bold' : ''}">
                            False ${correctAnswer === 'false' ? '<i class="bi bi-check-circle-fill text-success ms-2"></i>' : ''}
                        </label>
                    </div>
                </div>
            `;
        } else if (question.type === 'sa') {
            questionContent += '<div class="preview-short-answers">';
            questionContent += '<p class="text-muted mb-2">Accepted answers:</p>';
            questionContent += '<ul class="list-group">';
            question.shortAnswers.forEach(answer => {
                questionContent += `<li class="list-group-item">${answer}</li>`;
            });
            questionContent += '</ul></div>';
        }
        
        questionElement.innerHTML = questionContent;
        previewContainer.appendChild(questionElement);
        
        // Update pagination
        updatePagination();
    }
    
    // Navigation event listeners
    if (prevButton) {
        prevButton.addEventListener('click', function() {
            if (currentIndex > 0) {
                currentIndex--;
                showCurrentQuestion();
            }
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            if (currentIndex < questions.length - 1) {
                currentIndex++;
                showCurrentQuestion();
            }
        });
    }
    
    // Initial display
    if (questions.length > 0) {
        showCurrentQuestion();
    } else {
        previewContainer.innerHTML = `
            <div class="preview-empty-state">
                <i class="bi bi-exclamation-circle"></i>
                <p>No questions to preview</p>
                <small>Add some questions to your quiz first</small>
            </div>
        `;
    }
}

function getQuestionTypeLabel(type) {
    switch(type) {
        case 'mc': return 'Multiple Choice';
        case 'tf': return 'True/False';
        case 'sa': return 'Short Answer';
        default: return 'Unknown Type';
    }
}

// Apply settings from sidebar to quiz
function applyQuizSettings() {
    const title = document.getElementById('quizTitle').value;
    const description = document.getElementById('quizDescription').value;
    const timePerQuestion = document.getElementById('timePerQuestion').value;
    const maxParticipants = document.getElementById('maxParticipants').value;
    const chatDuration = document.getElementById('chatDuration').value;
    const accessType = document.querySelector('input[name="accessType"]:checked').value;
    const requireApproval = document.getElementById('requireApproval').checked;
    
    // Update quiz object
    quizData.title = title;
    quizData.description = description;
    quizData.timePerQuestion = parseInt(timePerQuestion) || 30;
    quizData.maxParticipants = parseInt(maxParticipants) || 50;
    quizData.chatDuration = parseInt(chatDuration) || 5;
    quizData.accessType = accessType;
    quizData.requireApproval = requireApproval;
    
    // Update UI elements
    document.getElementById('quizTitleDisplay').textContent = title || 'Untitled Quiz';
    
    // Save to localStorage
    saveQuizToLocalStorage();
    
    showToast('Quiz settings updated', 'success');
}

// Initialize event listeners for settings form
function initSettingsForm() {
    const settingsForm = document.getElementById('quizSettingsForm');
    if (!settingsForm) return;
    
    const settingsInputs = settingsForm.querySelectorAll('input, textarea, select');
    settingsInputs.forEach(input => {
        input.addEventListener('change', function() {
            applyQuizSettings();
        });
    });
    
    // Initialize settings with quiz data
    populateSettingsForm();
}

// Populate settings form with quiz data
function populateSettingsForm() {
    if (!quizData) return;
    
    document.getElementById('quizTitle').value = quizData.title || '';
    document.getElementById('quizDescription').value = quizData.description || '';
    document.getElementById('timePerQuestion').value = quizData.timePerQuestion || 30;
    document.getElementById('maxParticipants').value = quizData.maxParticipants || 50;
    document.getElementById('chatDuration').value = quizData.chatDuration || 5;
    
    // Set access type
    const accessType = quizData.accessType || 'public';
    document.querySelector(`input[name="accessType"][value="${accessType}"]`).checked = true;
    
    // Set require approval
    document.getElementById('requireApproval').checked = quizData.requireApproval || false;
}

// Initialize all UI components
function initUI() {
    initThemeToggle();
    initSettingsToggle();
    initPreviewButton();
    initSettingsForm();
    
    // Make form actions sticky on scroll
    const formActions = document.querySelector('.form-actions');
    if (formActions) {
        window.addEventListener('scroll', function() {
            const questionEditor = document.querySelector('.question-editor');
            if (!questionEditor) return;
            
            const editorBottom = questionEditor.getBoundingClientRect().bottom;
            const windowHeight = window.innerHeight;
            
            if (editorBottom < windowHeight) {
                formActions.style.position = 'relative';
            } else {
                formActions.style.position = 'sticky';
            }
        });
    }
} 
