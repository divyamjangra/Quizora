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
