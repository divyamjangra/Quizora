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
 // Show waiting screen
  function showWaitingScreen() {
    joinScreen.classList.remove('active');
    waitingScreen.classList.add('active');
    quizActiveScreen.classList.remove('active');
    chatScreen.classList.remove('active');
    resultsScreen.classList.remove('active');
    
    // Update waiting screen UI
    waitingQuizTitle.textContent = quizState.title;
    participantCount.textContent = quizState.participants.length;
    
    // Update participants list
    updateWaitingParticipantsList();
  }
  
  // Update waiting participants list
  function updateWaitingParticipantsList() {
    waitingParticipantsList.innerHTML = '';
    
    quizState.participants.forEach((participant, index) => {
      const item = document.createElement('div');
      item.className = 'd-flex align-items-center mb-2';
      
      // Get initials for avatar
      const initials = participant.name.split(' ')
        .map(word => word.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase();
      
      // Highlight current player
      const isCurrentPlayer = participant.id === playerState.id;
      
      item.innerHTML = `
        <div class="me-2" style="width: 32px; height: 32px; background-color: ${isCurrentPlayer ? '#e7f0ff' : '#f0f0f0'}; 
          border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600;">
          ${initials}
        </div>
        <div>${participant.name} ${isCurrentPlayer ? '(You)' : ''}</div>
      `;
      
      waitingParticipantsList.appendChild(item);
    });
  }
  
  // Simulate quiz starting (for mock implementation)
  function simulateQuizStart() {
    quizState.status = 'active';
    headerQuizInfo.innerHTML = `
      <div>
        <strong>${quizState.title}</strong>
        <span class="badge bg-success ms-2">Active</span>
      </div>
    `;
    
    showQuizActiveScreen();
    loadQuestion(0);
  }
  
  // Show quiz active screen
  function showQuizActiveScreen() {
    joinScreen.classList.remove('active');
    waitingScreen.classList.remove('active');
    quizActiveScreen.classList.add('active');
    chatScreen.classList.remove('active');
    resultsScreen.classList.remove('active');
  }
  
  // Load question
  function loadQuestion(questionIndex) {
    if (questionIndex >= quizState.totalQuestions) {
      // Quiz is finished
      showResultsScreen();
      return;
    }
    
    // Update player state
    playerState.currentQuestion = questionIndex;
    playerState.answeredCurrentQuestion = false;
    playerState.selectedOption = null;
    
    // Update UI
    currentQuestionNumber.textContent = questionIndex + 1;
    totalQuestions.textContent = quizState.totalQuestions;
    
    // Reset the question container
    feedbackMessage.classList.add('d-none');
    answerExplanation.classList.add('d-none');
    
    // Get the actual question from the quiz
    const question = quizState.questions[questionIndex];
    
    if (!question) {
      console.error("Question not found at index:", questionIndex);
      return;
    }
    
    console.log("Loading question:", question);
    
    // Populate question
    questionText.textContent = question.text;
    
    // Generate options based on question type
    generateOptions(question);
    
    // Start question timer
    startQuestionTimer(quizState.timePerQuestion);
    
    // Record response start time
    playerState.responseStartTime = Date.now();
  }
  
  // Generate options for current question based on the question type
  function generateOptions(question) {
    optionsContainer.innerHTML = '';
    
    if (question.type === 'multiple-choice') {
      // Multiple choice questions
      question.options.forEach((option, index) => {
        const optionItem = document.createElement('div');
        optionItem.className = 'option-item';
        optionItem.dataset.option = String.fromCharCode(65 + index); // A, B, C, D
        optionItem.dataset.index = index;
        
        optionItem.innerHTML = `
          <div class="option-content">
            <div class="option-marker">${String.fromCharCode(65 + index)}</div>
            <div class="option-text">${option}</div>
          </div>
        `;
        
        // Add click handler
        optionItem.addEventListener('click', function() {
          if (playerState.answeredCurrentQuestion) return;
          
          selectOption(this, index, question.correctOption);
        });
        
        optionsContainer.appendChild(optionItem);
      });
    } else if (question.type === 'true-false') {
      // True/False questions
      const options = ['True', 'False'];
      options.forEach((option, index) => {
        const optionItem = document.createElement('div');
        optionItem.className = 'option-item';
        optionItem.dataset.option = option;
        optionItem.dataset.index = index;
        
        optionItem.innerHTML = `
          <div class="option-content">
            <div class="option-marker">${index === 0 ? 'T' : 'F'}</div>
            <div class="option-text">${option}</div>
          </div>
        `;
        
        // Add click handler
        optionItem.addEventListener('click', function() {
          if (playerState.answeredCurrentQuestion) return;
          
          const correctAnswer = question.correctAnswer === 'true' ? 0 : 1;
          selectOption(this, index, correctAnswer);
        });
        
        optionsContainer.appendChild(optionItem);
      });
    } else if (question.type === 'short-answer') {
      // Short answer questions
      const answerInput = document.createElement('div');
      answerInput.className = 'short-answer-input mt-3 mb-4';
      answerInput.innerHTML = `
        <input type="text" class="form-control" id="shortAnswerInput" placeholder="Type your answer here">
        <button class="btn btn-primary mt-2" id="submitShortAnswer">Submit Answer</button>
      `;
      
      optionsContainer.appendChild(answerInput);
      
      // Add submit handler
      document.getElementById('submitShortAnswer').addEventListener('click', function() {
        if (playerState.answeredCurrentQuestion) return;
        
        const input = document.getElementById('shortAnswerInput');
        const answer = input.value.trim();
        
        if (!answer) {
          alert('Please enter an answer');
          return;
        }
        
        // Check if the answer is correct
        const isCorrect = checkShortAnswer(answer, question);
        
        // Create a feedback display
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = `alert ${isCorrect ? 'alert-success' : 'alert-danger'} mt-3`;
        feedbackDiv.innerHTML = `
          <strong>${isCorrect ? 'Correct!' : 'Incorrect!'}</strong>
          <p>Your answer: ${answer}</p>
          <p>Accepted answers: ${question.correctAnswers.join(', ')}</p>
        `;
        
        // Add to DOM after the input
        answerInput.appendChild(feedbackDiv);
        
        // Update player state
        updatePlayerScoreAndFeedback(isCorrect);
        
        // Show explanation if there is one
        if (question.explanation) {
          showExplanation(-1); // No specific correct option to highlight for short answer
        }
      });
    }
  }
  
  // Check if a short answer is correct
  function checkShortAnswer(answer, question) {
    const userAnswer = question.caseSensitive ? answer : answer.toLowerCase();
    
    for (let correctAnswer of question.correctAnswers) {
      const correctOption = question.caseSensitive ? correctAnswer : correctAnswer.toLowerCase();
      
      if (question.exactMatch) {
        if (userAnswer === correctOption) return true;
      } else {
        if (userAnswer.includes(correctOption) || correctOption.includes(userAnswer)) return true;
      }
    }
    
    return false;
  }
  
  // Select an option
  function selectOption(optionElement, selectedIndex, correctIndex) {
    // Mark option as selected
    optionElement.classList.add('selected');
    
    // Check if answer is correct
    const isCorrect = selectedIndex === correctIndex;
    
    // Update player score and feedback
    updatePlayerScoreAndFeedback(isCorrect);
    
    // Show correct/incorrect indicators
    setTimeout(() => {
      // Mark selected option as correct or incorrect
      if (isCorrect) {
        optionElement.classList.add('correct');
      } else {
        optionElement.classList.add('incorrect');
        
        // Find and highlight the correct option
        const options = optionsContainer.querySelectorAll('.option-item');
        options.forEach(option => {
          if (parseInt(option.dataset.index) === correctIndex) {
            option.classList.add('correct');
          }
        });
      }
      
      // Show explanation if available
      const currentQuestion = quizState.questions[playerState.currentQuestion];
      if (currentQuestion && currentQuestion.explanation) {
        showExplanation(correctIndex);
      }
      
      // Move to next question or chat after delay
      setTimeout(() => {
        // In a real implementation, would wait for all players or a timeout
        // For this simulation, just move to the next step
        
        if (quizState.chatDuration > 0) {
          // Show chat screen if enabled
          showChatScreen();
          startChatTimer(quizState.chatDuration);
        } else {
          // Move directly to next question
          loadQuestion(playerState.currentQuestion + 1);
        }
      }, 4000); // Show result for 4 seconds before moving on
    }, 500); // Short delay before showing the result
  }
  
  // Start question timer
  function startQuestionTimer(seconds) {
    const timerEl = questionTimer;
    timerEl.textContent = seconds;
    
    // Reset timer progress bar
    timerProgress.style.width = '100%';
    
    // Calculate time step for progress bar
    const progressStep = 100 / seconds;
    
    const timerId = setInterval(() => {
      seconds--;
      timerEl.textContent = seconds;
      
      // Update progress bar
      timerProgress.style.width = `${progressStep * seconds}%`;
      
      if (seconds <= 5) {
        timerProgress.style.backgroundColor = '#dc3545'; // Red for last 5 seconds
      }
      
      if (seconds <= 0) {
        clearInterval(timerId);
        
        // If player hasn't answered, record as timeout
        if (!playerState.answeredCurrentQuestion) {
          // Get mock question to determine correct answer
          const mockQuestion = generateMockQuestion(playerState.currentQuestion);
          
          playerState.answers.push({
            questionIndex: playerState.currentQuestion,
            selectedOption: null,
            correctOption: mockQuestion.correctOption,
            isCorrect: false,
            responseTime: quizState.timePerQuestion
          });
          
          playerState.wrongCount++;
          
          // Show timeout message
          feedbackMessage.innerHTML = `
            <div class="alert alert-warning">
              <i class="bi bi-clock me-2"></i>Time's up! The correct answer is ${String.fromCharCode(65 + mockQuestion.correctOption)}.
            </div>
          `;
          feedbackMessage.classList.remove('d-none');
          
          // Highlight correct answer
          const correctOption = optionsContainer.querySelector(`[data-index="${mockQuestion.correctOption}"]`);
          if (correctOption) {
            correctOption.classList.add('correct');
          }
          
          // Show explanation
          showExplanation(mockQuestion.correctOption);
        }
        
        // In a real implementation, would wait for all players or server signal
        // For mock purposes, show chat or next question after a delay
        setTimeout(() => {
          if (quizState.chatDuration > 0) {
            showChatScreen();
          } else {
            loadQuestion(playerState.currentQuestion + 1);
          }
        }, 3000);
      }
    }, 1000);
    
    // Store timer ID to clear if needed
    playerState.currentTimerId = timerId;
  }
  
  // Show explanation for correct answer
  function showExplanation(correctIndex) {
    const mockQuestion = generateMockQuestion(playerState.currentQuestion);
    
    answerExplanation.innerHTML = `
      <h6>Explanation</h6>
      <p>${mockQuestion.explanation}</p>
    `;
    answerExplanation.classList.remove('d-none');
  }
    
  // Update leaderboard
  function updateLeaderboard() {
    // Generate mock leaderboard data - in a real implementation, this would come from the server
    const mockLeaderboard = [
      { id: 'p1', name: 'John Doe', score: Math.floor(Math.random() * 3000) + 2000 },
      { id: 'p2', name: 'Jane Smith', score: Math.floor(Math.random() * 3000) + 1000 },
      { id: 'p3', name: 'Michael Johnson', score: Math.floor(Math.random() * 2000) + 1000 },
      { id: playerState.id, name: playerState.name, score: playerState.score }
    ];
    
    // Sort by score (highest first)
    mockLeaderboard.sort((a, b) => b.score - a.score);
    
    // Find player's rank
    const playerRankIndex = mockLeaderboard.findIndex(p => p.id === playerState.id);
    playerState.rank = playerRankIndex + 1;
    
    // Update UI
    playerRank.textContent = playerState.rank;
    playerNameDisplay.textContent = `${playerState.name} (You)`;
    playerScore.textContent = playerState.score;
    leaderboardPlayerCount.textContent = mockLeaderboard.length;
    
    // Create leaderboard list
    leaderboardList.innerHTML = '';
    mockLeaderboard.forEach((player, index) => {
      // Only show top 5
      if (index < 5) {
        const item = document.createElement('div');
        item.className = `leaderboard-item ${player.id === playerState.id ? 'current-player' : ''}`;
        
        let positionClass = '';
        if (index === 0) positionClass = 'position-1';
        else if (index === 1) positionClass = 'position-2';
        else if (index === 2) positionClass = 'position-3';
        
        // Get initials for avatar
        const initials = player.name.split(' ')
          .map(word => word.charAt(0))
          .join('')
          .substring(0, 2)
          .toUpperCase();
        
        item.innerHTML = `
          <div class="player-info">
            <div class="player-position ${positionClass}">${index + 1}</div>
            <div>${player.name} ${player.id === playerState.id ? '(You)' : ''}</div>
          </div>
          <div class="player-score">${player.score}</div>
        `;
        
        leaderboardList.appendChild(item);
      }
    });
    
    // Store for chat screen
    quizState.leaderboard = mockLeaderboard;
  }
  
  // Show chat screen
  function showChatScreen() {
    joinScreen.classList.remove('active');
    waitingScreen.classList.remove('active');
    quizActiveScreen.classList.remove('active');
    chatScreen.classList.add('active');
    resultsScreen.classList.remove('active');
    
    // Update chat screen leaderboard
    updateChatLeaderboard();
    
    // Start chat timer
    startChatTimer(quizState.chatDuration);
  }
  
  // Update chat screen leaderboard
  function updateChatLeaderboard() {
    chatLeaderboardList.innerHTML = '';
    
    quizState.leaderboard.forEach((player, index) => {
      const item = document.createElement('div');
      item.className = `leaderboard-item ${player.id === playerState.id ? 'current-player' : ''}`;
      
      let positionClass = '';
      if (index === 0) positionClass = 'position-1';
      else if (index === 1) positionClass = 'position-2';
      else if (index === 2) positionClass = 'position-3';
      
      item.innerHTML = `
        <div class="player-info">
          <div class="player-position ${positionClass}">${index + 1}</div>
          <div>${player.name} ${player.id === playerState.id ? '(You)' : ''}</div>
        </div>
        <div class="player-score">${player.score}</div>
      `;
      
      chatLeaderboardList.appendChild(item);
    });
  }
  
  // Start chat timer
  function startChatTimer(seconds) {
    const timerEl = chatTimer;
    timerEl.textContent = seconds;
    
    const timerId = setInterval(() => {
      seconds--;
      timerEl.textContent = seconds;
      
      if (seconds <= 0) {
        clearInterval(timerId);
        
        // Move to next question
        loadQuestion(playerState.currentQuestion + 1);
      }
    }, 1000);
    
    // Store chat timer ID
    playerState.chatTimerId = timerId;
  }
  
  // Send chat message
  sendChatBtn.addEventListener('click', function() {
    sendChatMessage();
  });
  
  chatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendChatMessage();
    }
  });
  
  function sendChatMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add message to chat
    addChatMessage(playerState.name, message, true);
    
    // Clear input
    chatInput.value = '';
    
    // In a real implementation, would send message to server
    // For mock purposes, simulate receiving messages from other players
    setTimeout(() => {
      const mockResponses = [
        'Good job everyone!',
        'That was a tough question!',
        'I think the next one will be harder',
        'I\'m doing well so far!',
        'Good luck on the next question!'
      ];
      
      const randomPlayer = quizState.participants.find(p => p.id !== playerState.id);
      if (randomPlayer) {
        const randomMessage = mockResponses[Math.floor(Math.random() * mockResponses.length)];
        addChatMessage(randomPlayer.name, randomMessage, false);
      }
    }, Math.random() * 2000 + 500);
  }
  
  // Add chat message to UI
  function addChatMessage(sender, content, isSelf) {
    const message = document.createElement('div');
    message.className = `chat-message ${isSelf ? 'self' : 'other'}`;
    
    if (!isSelf) {
      message.innerHTML = `
        <div class="sender-name">${sender}</div>
        <div class="message-content">${content}</div>
      `;
    } else {
      message.innerHTML = `
        <div class="message-content">${content}</div>
      `;
    }
    
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Show results screen
  function showResultsScreen() {
    joinScreen.classList.remove('active');
    waitingScreen.classList.remove('active');
    quizActiveScreen.classList.remove('active');
    chatScreen.classList.remove('active');
    resultsScreen.classList.add('active');
    
    // Update header status
    headerQuizInfo.innerHTML = `
      <div>
        <strong>${quizState.title}</strong>
        <span class="badge bg-info ms-2">Completed</span>
      </div>
    `;
    
    // Update results
    finalScore.textContent = playerState.score;
    correctAnswers.textContent = playerState.correctCount;
    wrongAnswers.textContent = playerState.wrongCount;
    averageTime.textContent = playerState.averageResponseTime.toFixed(1) + 's';
    
    // Populate final leaderboard
    finalLeaderboardList.innerHTML = '';
    
    quizState.leaderboard.forEach((player, index) => {
      const item = document.createElement('div');
      item.className = `leaderboard-item ${player.id === playerState.id ? 'current-player' : ''}`;
      
      let positionClass = '';
      if (index === 0) positionClass = 'position-1';
      else if (index === 1) positionClass = 'position-2';
      else if (index === 2) positionClass = 'position-3';
      
      // Get initials for avatar
      const initials = player.name.split(' ')
        .map(word => word.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase();
      
      item.innerHTML = `
        <div class="player-info">
          <div class="player-position ${positionClass}">${index + 1}</div>
          <div>${player.name} ${player.id === playerState.id ? '(You)' : ''}</div>
        </div>
        <div class="player-score">${player.score}</div>
      `;
      
      finalLeaderboardList.appendChild(item);
    });
  }
  
  // Leave quiz button
  leaveQuizBtn.addEventListener('click', function() {
    const modal = new bootstrap.Modal(document.getElementById('leaveConfirmModal'));
    modal.show();
  });
  
  // Confirm leave quiz
  document.getElementById('confirmLeaveBtn').addEventListener('click', function() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('leaveConfirmModal'));
    modal.hide();
    
    // Reset player state
    playerState.isJoined = false;
    playerState.score = 0;
    playerState.rank = 0;
    playerState.answers = [];
    playerState.correctCount = 0;
    playerState.wrongCount = 0;
    playerState.averageResponseTime = 0;
    playerState.currentQuestion = 0;
    
    // Hide leave button
    leaveQuizBtn.classList.add('d-none');
    
    // Show join screen
    joinScreen.classList.add('active');
    waitingScreen.classList.remove('active');
    quizActiveScreen.classList.remove('active');
    chatScreen.classList.remove('active');
    resultsScreen.classList.remove('active');
    
    // Clear header quiz info
    headerQuizInfo.innerHTML = '';
  });
  
  // Share results button
  shareResultsBtn.addEventListener('click', function() {
    // In a real implementation, would generate and share a results URL
    alert('Your results have been copied to clipboard!');
  });
  
  // Join another quiz button
  joinAnotherBtn.addEventListener('click', function() {
    // Reset player state
    playerState.isJoined = false;
    playerState.score = 0;
    playerState.rank = 0;
    playerState.answers = [];
    playerState.correctCount = 0;
    playerState.wrongCount = 0;
    playerState.averageResponseTime = 0;
    playerState.currentQuestion = 0;
    
    // Show join screen
    joinScreen.classList.add('active');
    waitingScreen.classList.remove('active');
    quizActiveScreen.classList.remove('active');
    chatScreen.classList.remove('active');
    resultsScreen.classList.remove('active');
    
    // Clear inputs
    playerNameInput.value = playerState.name; // Keep the name
    codeInputs.forEach(input => input.value = '');
    codeInputs[0].focus();
    
    // Clear header quiz info
    headerQuizInfo.innerHTML = '';
  });
  
  // Theme toggle (dark/light mode)
  document.getElementById('themeToggle').addEventListener('click', function() {
    document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    
    // Store preference
    localStorage.setItem('theme', document.body.dataset.theme);
  });
  
  // Initialize theme
  function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.body.dataset.theme = savedTheme;
    }
  }
  
  // Initialize the app
  initTheme();

  // Update player score and provide feedback after answering
  function updatePlayerScoreAndFeedback(isCorrect) {
    // Mark as answered
    playerState.answeredCurrentQuestion = true;
    
    // Record the result
    if (isCorrect) {
      playerState.correctCount++;
      
      // Calculate points based on speed (faster = more points)
      const responseTime = (Date.now() - playerState.responseStartTime) / 1000;
      const timeBonus = Math.max(0, 1 - (responseTime / quizState.timePerQuestion));
      
      // Get question points
      const question = quizState.questions[playerState.currentQuestion];
      const basePoints = question.points || 1;
      
      // Calculate total points (base + speed bonus)
      const points = Math.round(basePoints * (1 + timeBonus));
      
      // Add to score
      playerState.score += points;
      
      // Show feedback
      feedbackMessage.className = 'feedback-message alert alert-success';
      feedbackMessage.innerHTML = `
        <strong>Correct!</strong> +${points} points
        <div class="small mt-1">Answered in ${responseTime.toFixed(1)} seconds</div>
      `;
    } else {
      playerState.wrongCount++;
      
      // Show feedback
      feedbackMessage.className = 'feedback-message alert alert-danger';
      feedbackMessage.innerHTML = `
        <strong>Incorrect!</strong> +0 points
      `;
    }
    
    feedbackMessage.classList.remove('d-none');
    
    // Update leaderboard
    const playerInLeaderboard = quizState.participants.find(p => p.id === playerState.id);
    if (playerInLeaderboard) {
      playerInLeaderboard.score = playerState.score;
    }
    
    updateLeaderboard();
  }
}); 
                        
