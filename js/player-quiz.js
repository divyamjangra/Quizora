document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const joinScreen = document.getElementById('joinScreen');
  const waitingScreen = document.getElementById('waitingScreen');
  const quizActiveScreen = document.getElementById('quizActiveScreen');
  const chatScreen = document.getElementById('chatScreen');
  const resultsScreen = document.getElementById('resultsScreen');
  
  const playerNameInput = document.getElementById('playerName');
  const codeInputs = [
    document.getElementById('codeInput1'),
    document.getElementById('codeInput2'),
    document.getElementById('codeInput3'),
    document.getElementById('codeInput4'),
    document.getElementById('codeInput5'),
    document.getElementById('codeInput6')
  ];
  const passwordContainer = document.getElementById('passwordContainer');
  const quizPasswordInput = document.getElementById('quizPassword');
  const joinQuizBtn = document.getElementById('joinQuizBtn');
  
  const waitingQuizTitle = document.getElementById('waitingQuizTitle');
  const participantCount = document.getElementById('participantCount');
  const waitingParticipantsList = document.getElementById('waitingParticipantsList');
  
  const currentQuestionNumber = document.getElementById('currentQuestionNumber');
  const totalQuestions = document.getElementById('totalQuestions');
  const questionTimer = document.getElementById('questionTimer');
  const timerProgress = document.getElementById('timerProgress');
  const questionText = document.getElementById('questionText');
  const optionsContainer = document.getElementById('optionsContainer');
  const feedbackMessage = document.getElementById('feedbackMessage');
  const answerExplanation = document.getElementById('answerExplanation');
  
  const playerRank = document.getElementById('playerRank');
  const playerNameDisplay = document.getElementById('playerNameDisplay');
  const playerScore = document.getElementById('playerScore');
  const leaderboardList = document.getElementById('leaderboardList');
  const leaderboardPlayerCount = document.getElementById('leaderboardPlayerCount');
  
  const chatMessages = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const sendChatBtn = document.getElementById('sendChatBtn');
  const chatTimer = document.getElementById('chatTimer');
  const chatLeaderboardList = document.getElementById('chatLeaderboardList');
  
  const finalScore = document.getElementById('finalScore');
  const correctAnswers = document.getElementById('correctAnswers');
  const wrongAnswers = document.getElementById('wrongAnswers');
  const averageTime = document.getElementById('averageTime');
  const finalLeaderboardList = document.getElementById('finalLeaderboardList');
  
  const headerQuizInfo = document.getElementById('headerQuizInfo');
  const leaveQuizBtn = document.getElementById('leaveQuizBtn');
  const shareResultsBtn = document.getElementById('shareResultsBtn');
  const joinAnotherBtn = document.getElementById('joinAnotherBtn');
  
  // Player state
  const playerState = {
    id: generatePlayerId(),
    name: '',
    quizCode: '',
    quizId: '',
    isJoined: false,
    score: 0,
    rank: 0,
    answers: [],
    correctCount: 0,
    wrongCount: 0,
    averageResponseTime: 0,
    totalQuestions: 0,
    currentQuestion: 0,
    selectedOption: null,
    answeredCurrentQuestion: false,
    responseStartTime: 0,
    responseTimes: []
  };
  
  // Quiz state - populated when joining
  const quizState = {
    id: '',
    code: '',
    title: '',
    host: '',
    status: 'waiting', // waiting, active, completed, paused
    isPrivate: false,
    timePerQuestion: 20,
    chatDuration: 15,
    maxParticipants: 0,
    totalQuestions: 0,
    currentQuestion: 0,
    participants: [],
    leaderboard: []
  };
  
  // Setup code input fields (auto-tab between fields)
  codeInputs.forEach((input, index) => {
    input.addEventListener('input', function(e) {
      this.value = this.value.toUpperCase();
      
      if (this.value && index < codeInputs.length - 1) {
        codeInputs[index + 1].focus();
      }
    });
    
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Backspace' && !this.value && index > 0) {
        codeInputs[index - 1].focus();
      }
    });
  });
  
  // Check for password requirements when entering the quiz code
  codeInputs[codeInputs.length - 1].addEventListener('input', function() {
    if (this.value) {
      // Get full code
      const fullCode = codeInputs.map(input => input.value).join('');
      if (fullCode.length === 6) {
        // Look up the quiz code
        checkQuizCodeAndPasswordRequirement(fullCode);
      }
    }
  });
  
  // Check if a quiz code exists and if it requires a password
  function checkQuizCodeAndPasswordRequirement(code) {
    // Get all saved quizzes
    const savedQuizzes = JSON.parse(localStorage.getItem('savedQuizzes')) || {};
    
    // Find the quiz with matching code
    let foundQuiz = null;
    
    for (const id in savedQuizzes) {
      const quiz = savedQuizzes[id];
      if (quiz.quizCode === code) {
        foundQuiz = quiz;
        break;
      }
    }
    
    if (foundQuiz) {
      // Show/hide password field based on privacy setting
      if (!foundQuiz.isPublic) {
        passwordContainer.classList.remove('d-none');
      } else {
        passwordContainer.classList.add('d-none');
      }
    } else {
      // If not found, hide password field (will show error when trying to join)
      passwordContainer.classList.add('d-none');
    }
  }
  
  // Join Quiz button
  joinQuizBtn.addEventListener('click', function() {
    // Validate player name
    if (!playerNameInput.value.trim()) {
      alert('Please enter your name');
      playerNameInput.focus();
      return;
    }
    
    // Validate quiz code
    const quizCode = codeInputs.map(input => input.value).join('');
    if (quizCode.length !== 6) {
      alert('Please enter a valid 6-character quiz code');
      codeInputs[0].focus();
      return;
    }
    
    // Check if password is needed and provided
    if (passwordContainer.classList.contains('d-none') === false && !quizPasswordInput.value) {
      alert('Please enter the quiz password');
      quizPasswordInput.focus();
      return;
    }
    
    // Set player info
    playerState.name = playerNameInput.value.trim();
    playerState.quizCode = quizCode;
    
    // Attempt to join quiz
    joinQuiz(quizCode);
  });
  
  // Generate a unique player ID
  function generatePlayerId() {
    return 'player_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
  }
  
  // Join quiz function
  function joinQuiz(quizCode) {
    // Look up the quiz in localStorage by code
    console.log("Attempting to join quiz with code:", quizCode);
    
    // Get all saved quizzes
    const savedQuizzes = JSON.parse(localStorage.getItem('savedQuizzes')) || {};
    
    // Find the quiz with matching code
    let foundQuiz = null;
    let quizId = null;
    
    for (const id in savedQuizzes) {
      const quiz = savedQuizzes[id];
      if (quiz.quizCode === quizCode) {
        foundQuiz = quiz;
        quizId = id;
        break;
      }
    }
    
    if (!foundQuiz) {
      alert("Quiz not found. Please check the code and try again.");
      return;
    }
    
    console.log("Found quiz:", foundQuiz);
    
    // Set up quiz state from found quiz
    quizState.id = quizId;
    quizState.code = quizCode;
    quizState.title = foundQuiz.title || "Untitled Quiz";
    quizState.host = "Quiz Host"; // In a real app, this would be the host's name
    quizState.status = "waiting";
    quizState.isPrivate = !foundQuiz.isPublic;
    quizState.timePerQuestion = foundQuiz.timePerQuestion || 20;
    quizState.chatDuration = foundQuiz.chatDuration || 15;
    quizState.maxParticipants = foundQuiz.maxParticipants || 10;
    quizState.totalQuestions = foundQuiz.questions ? foundQuiz.questions.length : 0;
    quizState.currentQuestion = 0;
    quizState.questions = foundQuiz.questions || [];
    
    // If no questions, show an error
    if (quizState.totalQuestions === 0) {
      alert("This quiz doesn't have any questions yet.");
      return;
    }
    
    // Check if the quiz requires a password
    if (quizState.isPrivate) {
      const password = quizPasswordInput.value;
      if (password !== foundQuiz.password) {
        alert("Incorrect password. Please check and try again.");
        return;
      }
    }
    
    // Mock some participants for demo
    quizState.participants = [
      { id: 'p1', name: 'John Doe', score: 0 },
      { id: 'p2', name: 'Jane Smith', score: 0 },
      { id: 'p3', name: 'Michael Johnson', score: 0 }
    ];
    
    // Add current player to participants
    quizState.participants.push({
      id: playerState.id,
      name: playerState.name,
      score: 0
    });
    
    // Update player state
    playerState.isJoined = true;
    playerState.quizId = quizState.id;
    playerState.totalQuestions = quizState.totalQuestions;
    
    // Update UI
    showWaitingScreen();
    
    // Show leave button
    leaveQuizBtn.classList.remove('d-none');
    
    // Update header quiz info
    headerQuizInfo.innerHTML = `
      <div>
        <strong>${quizState.title}</strong>
        <span class="badge bg-warning ms-2">Waiting</span>
      </div>
    `;
    
    // In a real implementation, would establish WebSocket connection for real-time updates
    // For mock purposes, simulate quiz starting after a delay
    setTimeout(simulateQuizStart, 5000);
  }
