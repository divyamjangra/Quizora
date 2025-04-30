/**
 * Quizora Multiplayer Quiz JavaScript
 * Handles all interactive functionality for the multiplayer quiz experience
 */

// Global variables
let socket; // Socket.io connection
let quizData = {}; // Quiz data from server
let currentQuestionIndex = 0; // Current question index
let selectedAnswer = null; // User's selected answer
let timerInterval; // Timer interval reference
let isHost = false; // Whether current user is the host
let playerData = []; // Array of player data
let userProfile = { // User profile data
  username: '',
  avatar: '',
  score: 0,
  answers: []
};
let quizCode = '';
let timerDuration = 30; // Default timer duration in seconds

// AI Quiz Variables
let aiQuestions = [];
let aiDifficulty = 'medium';
let aiQuizTopic = 'General Knowledge';

// Predefined questions by category and difficulty (for AI quiz generation)
const predefinedQuestions = {
  Science: {
    easy: [
      {
        question: "What is the chemical symbol for water?",
        options: ["H2O", "CO2", "O2", "H2"],
        correct_answer: "H2O",
        explanation: "Water is made up of two hydrogen atoms and one oxygen atom."
      },
      {
        question: "The powerhouse of the cell is Mitochondria",
        options: ["True", "False", "Maybe", "I don't know"],
        correct_answer: "True",
        explanation: "Mitochondria generate the energy needed for cellular processes."
      },
      {
        question: "What planet is closest to the Sun?",
        options: ["Mercury", "Venus", "Earth", "Mars"],
        correct_answer: "Mercury",
        explanation: "Mercury is the closest planet to the Sun."
      }
    ],
    medium: [
      {
        question: "Which planet is known as the Red Planet?",
        options: ["Mars", "Earth", "Venus", "Saturn"],
        correct_answer: "Mars",
        explanation: "Mars is called the Red Planet because of the iron oxide (rust) on its surface."
      },
      {
        question: "What is the chemical formula for methane?",
        options: ["CH4", "CO2", "O2", "H2O"],
        correct_answer: "CH4",
        explanation: "Methane is a compound made up of one carbon atom and four hydrogen atoms."
      }
    ],
    hard: [
      {
        question: "What is the atomic number of carbon?",
        options: ["6", "12", "8", "14"],
        correct_answer: "6",
        explanation: "The atomic number of carbon is 6."
      }
    ]
  },
  History: {
    easy: [
      {
        question: "Who was the first president of the United States?",
        options: ["George Washington", "Thomas Jefferson", "Abraham Lincoln", "John Adams"],
        correct_answer: "George Washington",
        explanation: "George Washington was the first president of the United States, serving from 1789 to 1797."
      },
      {
        question: "What year did World War II end?",
        options: ["1945", "1918", "1939", "1961"],
        correct_answer: "1945",
        explanation: "World War II ended in 1945 with the defeat of Germany and Japan."
      }
    ],
    medium: [
      {
        question: "Who was the leader of Nazi Germany during World War II?",
        options: ["Adolf Hitler", "Joseph Stalin", "Winston Churchill", "Franklin D. Roosevelt"],
        correct_answer: "Adolf Hitler",
        explanation: "Adolf Hitler was the dictator of Nazi Germany from 1933 to 1945."
      }
    ]
  },
  Technology: {
    easy: [
      {
        question: "What does CPU stand for?",
        options: ["Central Processing Unit", "Computer Personal Unit", "Central Process Utility", "Central Processor Unanimity"],
        correct_answer: "Central Processing Unit",
        explanation: "CPU stands for Central Processing Unit, which is the primary component of a computer that performs most of the processing."
      }
    ],
    medium: [
      {
        question: "Which programming language was created by James Gosling at Sun Microsystems?",
        options: ["Java", "Python", "C++", "JavaScript"],
        correct_answer: "Java",
        explanation: "Java was created by James Gosling at Sun Microsystems in 1995."
      }
    ]
  },
  General_Knowledge: {
    easy: [
      {
        question: "Which planet is known as the Red Planet?",
        options: ["Mars", "Venus", "Jupiter", "Saturn"],
        correct_answer: "Mars",
        explanation: "Mars is called the Red Planet because of the iron oxide (rust) on its surface."
      }
    ],
    medium: [
      {
        question: "What is the capital of France?",
        options: ["Paris", "London", "Berlin", "Madrid"],
        correct_answer: "Paris",
        explanation: "Paris is the capital city of France."
      }
    ]
  }
};

// Initialize on document load
document.addEventListener('DOMContentLoaded', function() {
  // Check for URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.has('ai') && urlParams.get('ai') === 'true') {
    // User wants to use AI Quiz Generator - show coming soon popup
    setTimeout(() => {
      toggleAiQuizGenerator();
      // Load AI Quiz Manager script if not already loaded
      if (!document.querySelector('script[src="js/ai-quiz-manager.js"]')) {
        const script = document.createElement('script');
        script.src = 'js/ai-quiz-manager.js';
        document.body.appendChild(script);
      }
    }, 500);
  } else if (urlParams.has('host') && urlParams.get('host') === 'true') {
    // User is hosting a quiz
    isHost = true;
    const quizTitle = urlParams.get('title') || 'New Quiz';
    createQuiz(quizTitle);
  } else if (urlParams.has('code')) {
    // User is joining with a direct link
    const code = urlParams.get('code');
    showJoinQuizModal(code);
  } else {
    // Show join quiz modal by default
    showJoinQuizModal();
  }
  
  // Initialize all event listeners
  initializeEventListeners();
  
  // Initialize theme
  initializeTheme();
});

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
  const themeToggle = document.querySelector('.theme-toggle');
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
  document.querySelector('.theme-toggle').classList.toggle('active', isDarkTheme);
}

/**
 * Initialize Socket.io connection
 */
function initializeSocket() {
  // In a real application, connect to your actual server
  // For demo, we'll simulate socket events with timeouts
  console.log('Socket connection would be initialized in a real app');
  
  // Simulate socket events for demo purpose
  simulateSocketEvents();
}

/**
 * Simulate socket.io events for demo purposes
 * In a real application, you would use actual socket.io events
 */
function simulateSocketEvents() {
  // Simulate player joining event
  setTimeout(() => {
    const mockPlayers = [
      { id: 'player1', username: 'Alex Johnson', avatar: 'https://via.placeholder.com/40', score: 0, progress: 0 },
      { id: 'player2', username: 'Sophia Lee', avatar: 'https://via.placeholder.com/40', score: 0, progress: 0 },
      { id: 'player3', username: 'Miguel Santos', avatar: 'https://via.placeholder.com/40', score: 0, progress: 0 }
    ];
    
    mockPlayers.forEach(player => {
      addPlayerToList(player);
      addSystemMessage(`${player.username} joined the quiz`);
    });
    
    updatePlayerCount();
  }, 1500);
  
  // Simulate chat messages
  setTimeout(() => {
    addChatMessage('Sophia Lee', 'Hello everyone! Good luck!', new Date());
  }, 3000);
  
  setTimeout(() => {
    addChatMessage('Miguel Santos', 'Thanks! Good luck to you too!', new Date());
  }, 5000);
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
  // Copy quiz code button
  const copyCodeBtn = document.getElementById('copyCodeBtn');
  if (copyCodeBtn) {
    copyCodeBtn.addEventListener('click', function() {
      copyQuizCode();
    });
  }
  
  // Start quiz button (host only)
  const startQuizBtn = document.getElementById('startQuizBtn');
  if (startQuizBtn) {
    startQuizBtn.addEventListener('click', function() {
      if (isHost) {
        startQuiz();
      }
    });
  }
  
  // Option selection in quiz
  const optionsContainer = document.getElementById('optionsContainer');
  if (optionsContainer) {
    optionsContainer.addEventListener('click', function(e) {
      const optionItem = e.target.closest('.option-item');
      if (optionItem && !optionItem.classList.contains('disabled')) {
        selectAnswer(optionItem);
      }
    });
  }
  
  // Chat input
  const chatInput = document.getElementById('chatInput');
  const sendChatBtn = document.getElementById('sendChatBtn');
  
  if (chatInput && sendChatBtn) {
    // Send on button click
    sendChatBtn.addEventListener('click', function() {
      sendChatMessage();
    });
    
    // Send on Enter key
    chatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendChatMessage();
      }
    });
  }
  
  // Join quiz form
  const joinQuizBtn = document.getElementById('joinQuizBtn');
  if (joinQuizBtn) {
    joinQuizBtn.addEventListener('click', function() {
      const codeInput = document.getElementById('quizCodeInput');
      const usernameInput = document.getElementById('usernameInput');
      
      if (codeInput.value.trim() === '') {
        showAlert('Please enter a quiz code', 'warning');
        return;
      }
      
      if (usernameInput.value.trim() === '') {
        showAlert('Please enter your name', 'warning');
        return;
      }
      
      joinQuiz(codeInput.value.trim(), usernameInput.value.trim());
    });
  }
  
  // Result action buttons
  const playAgainBtn = document.getElementById('playAgainBtn');
  if (playAgainBtn) {
    playAgainBtn.addEventListener('click', function() {
      // In a real app, this would send a request to play again
      window.location.reload();
    });
  }
  
  const shareResultsBtn = document.getElementById('shareResultsBtn');
  if (shareResultsBtn) {
    shareResultsBtn.addEventListener('click', function() {
      const shareModal = new bootstrap.Modal(document.getElementById('shareResultsModal'));
      shareModal.show();
    });
  }
  
  const backToDashboardBtn = document.getElementById('backToDashboardBtn');
  if (backToDashboardBtn) {
    backToDashboardBtn.addEventListener('click', function() {
      window.location.href = 'dashboard.html';
    });
  }
  
  // Share buttons
  const shareButtons = document.querySelectorAll('.share-btn');
  if (shareButtons) {
    shareButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const platform = this.getAttribute('data-platform');
        shareResults(platform);
      });
    });
  }
  
  // AI Quiz Button Event Listener
  const aiQuizToggleBtn = document.getElementById('aiQuizToggleBtn');
  if (aiQuizToggleBtn) {
    aiQuizToggleBtn.addEventListener('click', toggleAiQuizGenerator);
  }
  
  // AI Quiz Form Submission
  const aiQuizForm = document.getElementById('aiQuizForm');
  if (aiQuizForm) {
    aiQuizForm.addEventListener('submit', function(e) {
      e.preventDefault();
      generateAiQuiz();
    });
  }
}

/**
 * Create a new quiz (host only)
 */
function createQuiz(title) {
  isHost = true;
  
  // Generate a random quiz code
  quizCode = generateQuizCode();
  
  // In a real app, this would send a request to create a quiz on the server
  quizData = {
    id: Math.random().toString(36).substring(2, 10),
    code: quizCode,
    title: title,
    host: {
      id: 'host-' + Math.random().toString(36).substring(2, 10),
      username: 'You (Host)'
    },
    players: [],
    questions: [
      {
        id: 1,
        text: 'What does HTML stand for?',
        options: [
          { id: 'A', text: 'Hyper Text Markup Language' },
          { id: 'B', text: 'High Tech Multi Language' },
          { id: 'C', text: 'Hyper Transfer Markup Language' },
          { id: 'D', text: 'Home Text Markup Language' }
        ],
        correctAnswer: 'A',
        timer: 30
      },
      {
        id: 2,
        text: 'Which of the following is a JavaScript framework?',
        options: [
          { id: 'A', text: 'Django' },
          { id: 'B', text: 'React' },
          { id: 'C', text: 'Flask' },
          { id: 'D', text: 'Laravel' }
        ],
        correctAnswer: 'B',
        timer: 30
      },
      {
        id: 3,
        text: 'Which CSS property is used to change the text color of an element?',
        options: [
          { id: 'A', text: 'background-color' },
          { id: 'B', text: 'font-color' },
          { id: 'C', text: 'text-color' },
          { id: 'D', text: 'color' }
        ],
        correctAnswer: 'D',
        timer: 30
      }
    ],
    status: 'waiting', // waiting, active, completed
    createdAt: new Date().toISOString()
  };
  
  // Update UI
  document.getElementById('quizTitle').textContent = title;
  document.getElementById('quizCode').textContent = quizCode;
  
  // Show waiting room
  showWaitingRoom();
  
  // In a real app, initialize socket connection
  initializeSocket();
  
  // Add host to player list
  userProfile.username = 'You (Host)';
  userProfile.avatar = 'https://via.placeholder.com/40';
  
  addPlayerToList({
    id: quizData.host.id,
    username: userProfile.username,
    avatar: userProfile.avatar,
    score: 0,
    isHost: true
  });
  
  updatePlayerCount();
  
  // Show host controls
  if (document.getElementById('startQuizBtn')) {
    document.getElementById('startQuizBtn').style.display = 'inline-block';
  }
  
  // Add system message
  addSystemMessage('You created the quiz. Share the code with others to join!');
}

/**
 * Join an existing quiz as a player
 */
function joinQuiz(quizCode, username) {
  // In a real app, this would send a request to join a quiz on the server
  // For demo, we'll simulate joining
  
  // Update user profile
  userProfile.username = username;
  userProfile.avatar = 'https://via.placeholder.com/40'; // Default avatar
  
  // Update UI
  document.getElementById('quizTitle').textContent = 'Web Development Quiz'; // Demo title
  document.getElementById('quizCode').textContent = quizCode;
  
  // Close modal if open
  const joinModal = bootstrap.Modal.getInstance(document.getElementById('joinQuizModal'));
  if (joinModal) {
    joinModal.hide();
  }
  
  // Show waiting room
  showWaitingRoom();
  
  // In a real app, initialize socket connection
  initializeSocket();
  
  // Add user to player list
  const userId = 'player-' + Math.random().toString(36).substring(2, 10);
  
  addPlayerToList({
    id: userId,
    username: userProfile.username,
    avatar: userProfile.avatar,
    score: 0
  });
  
  updatePlayerCount();
  
  // Add system message
  addSystemMessage('You joined the quiz. Waiting for the host to start...');
  
  // Simulate host starting the quiz after a delay (for demo)
  if (!isHost) {
    setTimeout(() => {
      startQuiz();
    }, 8000);
  }
}

/**
 * Generate a random 6-character quiz code
 */
function generateQuizCode() {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar-looking characters
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Copy quiz code to clipboard
 */
function copyQuizCode() {
  const quizCode = document.getElementById('quizCode').textContent;
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(quizCode)
      .then(() => {
        showAlert('Quiz code copied to clipboard!', 'success');
        
        // Show visual feedback
        const copyBtn = document.getElementById('copyCodeBtn');
        const originalIcon = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="bi bi-check"></i>';
        
        setTimeout(() => {
          copyBtn.innerHTML = originalIcon;
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy quiz code: ', err);
        showAlert('Failed to copy quiz code', 'danger');
      });
  } else {
    // Fallback for browsers that don't support clipboard API
    const tempInput = document.createElement('input');
    tempInput.value = quizCode;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    showAlert('Quiz code copied to clipboard!', 'success');
  }
}

/**
 * Start the quiz (host only in a real app)
 */
function startQuiz() {
  // In a real app, this would send a request to start the quiz on the server
  
  // Hide waiting room and show quiz content
  document.getElementById('waitingRoom').classList.add('d-none');
  document.getElementById('quizContent').classList.remove('d-none');
  
  // Reset quiz state
  currentQuestionIndex = 0;
  userProfile.score = 0;
  userProfile.answers = [];
  
  // Load first question
  loadQuestion(currentQuestionIndex);
  
  // Add system message
  addSystemMessage('Quiz has started! Good luck!');
}

/**
 * Load a question by index
 */
function loadQuestion(index) {
  // In a real app, this would get the current question from the server
  // For demo, we'll use the local quizData
  
  const question = quizData.questions[index] || {
    id: index + 1,
    text: 'Sample question ' + (index + 1) + '?',
    options: [
      { id: 'A', text: 'Option A' },
      { id: 'B', text: 'Option B' },
      { id: 'C', text: 'Option C' },
      { id: 'D', text: 'Option D' }
    ],
    correctAnswer: 'A',
    timer: 30
  };
  
  // Update UI with question data
  document.getElementById('questionNumber').textContent = `Question ${index + 1}`;
  document.getElementById('questionText').textContent = question.text;
  document.getElementById('currentQuestionIndex').textContent = index + 1;
  document.getElementById('totalQuestions').textContent = quizData.questions.length || 3;
  
  // Clear previous options and add new ones
  const optionsContainer = document.getElementById('optionsContainer');
  optionsContainer.innerHTML = '';
  
  question.options.forEach(option => {
    const optionElement = document.createElement('div');
    optionElement.className = 'option-item';
    optionElement.setAttribute('data-option', option.id);
    
    optionElement.innerHTML = `
      <div class="option-prefix">${option.id}</div>
      <div class="option-text">${option.text}</div>
    `;
    
    optionsContainer.appendChild(optionElement);
  });
  
  // Reset selected answer
  selectedAnswer = null;
  
  // Start timer
  timerDuration = question.timer || 30;
  startTimer();
  
  // Update players answered count
  document.getElementById('answersCount').textContent = '0';
}

/**
 * Start the question timer
 */
function startTimer() {
  // Clear any existing interval
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  const timerElement = document.getElementById('timer');
  let timeLeft = timerDuration;
  
  // Set initial value
  timerElement.textContent = timeLeft;
  
  // Remove any existing timer classes
  const timerContainer = document.getElementById('quizTimer');
  timerContainer.classList.remove('timer-warning', 'timer-danger');
  
  timerInterval = setInterval(() => {
    timeLeft--;
    timerElement.textContent = timeLeft;
    
    // Add warning class when less than 10 seconds
    if (timeLeft <= 10 && timeLeft > 5) {
      timerContainer.classList.add('timer-warning');
    }
    
    // Add danger class when less than 5 seconds
    if (timeLeft <= 5) {
      timerContainer.classList.remove('timer-warning');
      timerContainer.classList.add('timer-danger');
    }
    
    // Time's up
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      handleTimesUp();
    }
  }, 1000);
}

/**
 * Handle when time is up for a question
 */
function handleTimesUp() {
  // Disable all options
  const options = document.querySelectorAll('.option-item');
  options.forEach(option => {
    option.classList.add('disabled');
  });
  
  // If no answer selected, mark correct answer
  if (!selectedAnswer) {
    // Record no answer
    userProfile.answers.push({
      questionId: quizData.questions[currentQuestionIndex].id,
      selectedOption: null,
      isCorrect: false,
      timeLeft: 0
    });
    
    // Show correct answer
    showCorrectAnswer();
  }
  
  // Add system message
  addSystemMessage(`Time's up for question ${currentQuestionIndex + 1}!`);
  
  // Move to next question after delay
  setTimeout(() => {
    moveToNextQuestion();
  }, 2000);
}

/**
 * Select an answer
 */
function selectAnswer(optionElement) {
  // Prevent multiple selections
  if (selectedAnswer) return;
  
  // Get the selected option
  const selectedOption = optionElement.getAttribute('data-option');
  selectedAnswer = selectedOption;
  
  // Mark selected option
  const options = document.querySelectorAll('.option-item');
  options.forEach(option => {
    option.classList.remove('selected');
    option.classList.add('disabled');
  });
  
  optionElement.classList.add('selected');
  
  // Create ripple effect
  createRippleEffect(optionElement);
  
  // Get the correct answer (in a real app, this would come from the server)
  const correctAnswer = quizData.questions[currentQuestionIndex].correctAnswer || 'A';
  
  // Check if answer is correct
  const isCorrect = selectedOption === correctAnswer;
  
  // Record answer
  userProfile.answers.push({
    questionId: quizData.questions[currentQuestionIndex].id,
    selectedOption: selectedOption,
    isCorrect: isCorrect,
    timeLeft: parseInt(document.getElementById('timer').textContent)
  });
  
  // Update score if correct
  if (isCorrect) {
    // Score based on time left (faster answers get more points)
    const timeLeft = parseInt(document.getElementById('timer').textContent);
    const points = 100 + (timeLeft * 10); // Base 100 points + 10 per second left
    userProfile.score += points;
  }
  
  // Show if answer is correct or incorrect
  setTimeout(() => {
    showAnswerResult(optionElement, isCorrect, correctAnswer);
  }, 500);
  
  // Move to next question after delay
  setTimeout(() => {
    moveToNextQuestion();
  }, 3000);
  
  // Update player progress in the list
  updatePlayerProgress(
    userProfile.username, 
    quizData.questions[currentQuestionIndex].id,
    selectedOption,
    (currentQuestionIndex + 1) / quizData.questions.length
  );
  
  // Update answers count (in a real app, this would come from the server)
  const currentCount = parseInt(document.getElementById('answersCount').textContent);
  document.getElementById('answersCount').textContent = currentCount + 1;
}

/**
 * Create ripple effect on option selection
 */
function createRippleEffect(element) {
  const ripple = document.createElement('span');
  ripple.classList.add('ripple');
  
  // Get click position relative to the element
  const rect = element.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  
  element.appendChild(ripple);
  
  // Remove after animation completes
  setTimeout(() => {
    ripple.remove();
  }, 600);
}

/**
 * Show the result of the answer selection
 */
function showAnswerResult(selectedElement, isCorrect, correctAnswer) {
  // Stop the timer
  clearInterval(timerInterval);
  
  if (isCorrect) {
    // Correct answer
    selectedElement.classList.add('correct', 'animate-correct');
    showAlert('Correct! +' + (100 + parseInt(document.getElementById('timer').textContent) * 10) + ' points', 'success');
  } else {
    // Incorrect answer
    selectedElement.classList.add('incorrect', 'animate-incorrect');
    
    // Show the correct answer
    const correctElement = document.querySelector(`.option-item[data-option="${correctAnswer}"]`);
    if (correctElement) {
      correctElement.classList.add('correct');
    }
    
    showAlert('Incorrect! The correct answer is ' + correctAnswer, 'danger');
  }
}

/**
 * Show correct answer when no answer is selected
 */
function showCorrectAnswer() {
  const correctAnswer = quizData.questions[currentQuestionIndex].correctAnswer || 'A';
  const correctElement = document.querySelector(`.option-item[data-option="${correctAnswer}"]`);
  if (correctElement) {
    correctElement.classList.add('correct');
  }
  
  showAlert('Time\'s up! The correct answer is ' + correctAnswer, 'warning');
}

/**
 * Move to the next question or end the quiz
 */
function moveToNextQuestion() {
  currentQuestionIndex++;
  
  // Check if there are more questions
  if (currentQuestionIndex < (quizData.questions.length || 3)) {
    // Load next question
    loadQuestion(currentQuestionIndex);
  } else {
    // End of quiz
    endQuiz();
  }
}

/**
 * End the quiz and show results
 */
function endQuiz() {
  // In a real app, this would send a request to end the quiz on the server
  
  // Hide quiz content and show results
  document.getElementById('quizContent').classList.add('d-none');
  document.getElementById('quizResults').classList.remove('d-none');
  
  // Update results UI
  document.getElementById('totalQuestionsResult').textContent = quizData.questions.length || 3;
  
  const correctAnswers = userProfile.answers.filter(answer => answer.isCorrect).length;
  document.getElementById('correctAnswersResult').textContent = correctAnswers;
  
  document.getElementById('totalPlayersResult').textContent = document.querySelectorAll('.player-item').length;
  
  // Determine rank (in a real app, this would come from the server)
  // For demo, we'll assume the user is 3rd
  document.getElementById('yourRankResult').textContent = '2nd';
  
  // Update winner display (in a real app, this would come from the server)
  // For demo, we'll use a mock winner
  document.getElementById('winnerName').textContent = 'Sophia Lee';
  document.getElementById('winnerScore').textContent = '920';
  
  // Update share modal
  document.getElementById('sharedQuizTitle').textContent = quizData.title || 'Web Development Quiz';
  document.getElementById('sharedCorrectAnswers').textContent = `${correctAnswers}/${quizData.questions.length || 3}`;
  document.getElementById('sharedRank').textContent = '2nd';
  document.getElementById('sharedTotalPlayers').textContent = document.querySelectorAll('.player-item').length;
  
  // Add system message
  addSystemMessage('Quiz completed! Check out the results.');
  
  // Update player list to final results
  updateFinalResults();
}

/**
 * Update player list to show final results
 */
function updateFinalResults() {
  // In a real app, this would get the final results from the server
  // For demo, we'll use mock data
  
  const playersList = document.getElementById('playersList');
  playersList.innerHTML = '';
  
  const mockResults = [
    { id: 'player2', username: 'Sophia Lee', avatar: 'https://via.placeholder.com/40', score: 920, rank: 1 },
    { id: 'host', username: userProfile.username, avatar: userProfile.avatar, score: userProfile.score || 750, rank: 2 },
    { id: 'player1', username: 'Alex Johnson', avatar: 'https://via.placeholder.com/40', score: 680, rank: 3 },
    { id: 'player3', username: 'Miguel Santos', avatar: 'https://via.placeholder.com/40', score: 520, rank: 4 }
  ];
  
  mockResults.forEach(player => {
    const playerItem = document.createElement('li');
    playerItem.className = 'player-item';
    playerItem.setAttribute('data-player-id', player.id);
    
    const isCurrentUser = player.username === userProfile.username;
    
    playerItem.innerHTML = `
      <div class="player-rank">#${player.rank}</div>
      <img src="${player.avatar}" alt="${player.username}" class="player-avatar">
      <div class="player-info">
        <h6>${player.username} ${isCurrentUser ? '<span class="badge bg-primary">You</span>' : ''}</h6>
      </div>
      <div class="player-score">${player.score}</div>
    `;
    
    playersList.appendChild(playerItem);
  });
}

/**
 * Share results to social media or email
 */
function shareResults(platform) {
  const quizTitle = quizData.title || 'Web Development Quiz';
  const score = document.getElementById('correctAnswersResult').textContent;
  const total = document.getElementById('totalQuestionsResult').textContent;
  const shareUrl = `https://quizora.com/q/${quizCode}`;
  
  const shareText = `I scored ${score}/${total} on the "${quizTitle}" quiz with Quizora!`;
  
  let url = '';
  
  switch(platform) {
    case 'facebook':
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
      break;
    case 'twitter':
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
      break;
    case 'whatsapp':
      url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
      break;
    case 'email':
      url = `mailto:?subject=${encodeURIComponent('My Quizora Quiz Results')}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
      break;
    default:
      console.error('Unknown platform:', platform);
      return;
  }
  
  // Open the share URL in a new window
  window.open(url, '_blank');
  
  // Show confirmation
  showAlert(`Shared to ${platform}!`, 'success');
}

/**
 * Show quiz content (questions)
 */
function showQuizContent() {
  document.getElementById('waitingRoom').classList.add('d-none');
  document.getElementById('quizContent').classList.remove('d-none');
  document.getElementById('quizResults').classList.add('d-none');
}

/**
 * Show waiting room
 */
function showWaitingRoom() {
  document.getElementById('waitingRoom').classList.remove('d-none');
  document.getElementById('quizContent').classList.add('d-none');
  document.getElementById('quizResults').classList.add('d-none');
}

/**
 * Add a player to the players list
 */
function addPlayerToList(player) {
  const playersList = document.getElementById('playersList');
  
  // Check if player already exists
  const existingPlayer = document.querySelector(`[data-player-id="${player.id}"]`);
  if (existingPlayer) return;
  
  const playerItem = document.createElement('li');
  playerItem.className = 'player-item';
  playerItem.setAttribute('data-player-id', player.id);
  
  playerItem.innerHTML = `
    <div class="player-rank">#${playersList.children.length + 1}</div>
    <img src="${player.avatar}" alt="${player.username}" class="player-avatar">
    <div class="player-info">
      <h6>${player.username} ${player.isHost ? '<span class="badge bg-warning text-dark">Host</span>' : ''}</h6>
      <div class="progress" style="height: 5px; width: 100%;">
        <div class="progress-bar bg-success" style="width: 0%;" data-progress="0"></div>
      </div>
    </div>
    <div class="player-score">${player.score || 0}</div>
  `;
  
  playersList.appendChild(playerItem);
  playerData.push(player);
}

/**
 * Update a player's progress in the quiz
 */
function updatePlayerProgress(username, questionId, answer, progress) {
  const playerItem = Array.from(document.querySelectorAll('.player-item')).find(
    item => item.querySelector('h6').textContent.includes(username)
  );
  
  if (playerItem) {
    const progressBar = playerItem.querySelector('.progress-bar');
    progressBar.style.width = `${progress * 100}%`;
    progressBar.setAttribute('data-progress', progress);
    
    // In a real app, this would be sent to the server
    // to update other users about this player's progress
  }
}

/**
 * Update the player count display
 */
function updatePlayerCount() {
  const count = document.querySelectorAll('.player-item').length;
  document.getElementById('playerCount').textContent = count;
  document.getElementById('playersListCount').textContent = count;
}

/**
 * Add a system message to the chat
 */
function addSystemMessage(message) {
  const chatMessages = document.getElementById('chatMessages');
  
  const messageElement = document.createElement('div');
  messageElement.className = 'chat-message system-message';
  
  messageElement.innerHTML = `
    <div class="message-content">
      <p>${message}</p>
    </div>
    <div class="message-time">${formatMessageTime(new Date())}</div>
  `;
  
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Add a chat message
 */
function addChatMessage(sender, message, time) {
  const chatMessages = document.getElementById('chatMessages');
  
  const messageElement = document.createElement('div');
  messageElement.className = 'chat-message';
  
  const isCurrentUser = sender === userProfile.username;
  if (isCurrentUser) {
    messageElement.classList.add('current-user');
  }
  
  messageElement.innerHTML = `
    <div class="message-sender">${sender}</div>
    <div class="message-content">
      <p>${message}</p>
    </div>
    <div class="message-time">${formatMessageTime(time)}</div>
  `;
  
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Send a chat message
 */
function sendChatMessage() {
  const chatInput = document.getElementById('chatInput');
  const message = chatInput.value.trim();
  
  if (message === '') return;
  
  // Clear input
  chatInput.value = '';
  
  // Add message to chat
  addChatMessage(userProfile.username, message, new Date());
  
  // In a real app, this would send the message to the server
}

/**
 * Format message time
 */
function formatMessageTime(timestamp) {
  const now = new Date();
  const messageTime = new Date(timestamp);
  
  // If same day, show only time
  if (now.toDateString() === messageTime.toDateString()) {
    return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Otherwise show date and time
  return messageTime.toLocaleString([], { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

/**
 * Show join quiz modal
 */
function showJoinQuizModal(code = '') {
  const joinModal = new bootstrap.Modal(document.getElementById('joinQuizModal'));
  joinModal.show();
  
  if (code) {
    document.getElementById('quizCodeInput').value = code;
  }
}

/**
 * Show an alert/toast notification
 */
function showAlert(message, type = 'info') {
  const toastContainer = document.getElementById('toastContainer');
  
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-white bg-${type} border-0`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;
  
  toastContainer.appendChild(toast);
  
  const bsToast = new bootstrap.Toast(toast, {
    autohide: true,
    delay: 3000
  });
  
  bsToast.show();
  
  // Remove from DOM after hidden
  toast.addEventListener('hidden.bs.toast', function() {
    toast.remove();
  });
}

/**
 * Toggles the AI Quiz Generator card visibility
 */
function toggleAiQuizGenerator() {
  const waitingRoom = document.getElementById('waitingRoom');
  const aiQuizGenerator = document.getElementById('aiQuizGenerator');
  const quizContent = document.getElementById('quizContent');
  const quizResults = document.getElementById('quizResults');
  
  if (waitingRoom) waitingRoom.classList.add('d-none');
  if (quizContent) quizContent.classList.add('d-none');
  if (quizResults) quizResults.classList.add('d-none');
  
  // Show AI Quiz Generator
  if (aiQuizGenerator) {
    aiQuizGenerator.classList.remove('d-none');
    
    // Add click event for the AI button if not already added
    const aiButton = aiQuizGenerator.querySelector('.ai-btn');
    if (aiButton && !aiButton.hasAttribute('data-listener-added')) {
      aiButton.setAttribute('data-listener-added', 'true');
      
      // Use the Coming Soon popup from ai-quiz-manager.js
      aiButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Call the show popup function from ai-quiz-manager.js
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
  }
}

/**
 * Generate an AI quiz - now shows the Coming Soon popup
 */
function generateAiQuiz() {
  // Call the showAIComingSoonPopup function instead of generating a quiz
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
} 
