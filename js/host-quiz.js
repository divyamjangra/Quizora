document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const quizTitleHeader = document.getElementById('quizTitleHeader');
  const quizStatusIndicator = document.getElementById('quizStatusIndicator');
  const quizCodeDisplay = document.getElementById('quizCodeDisplay');
  const copyQuizCodeBtn = document.getElementById('copyQuizCodeBtn');
  const startQuizBtn = document.getElementById('startQuizBtn');
  const participantCount = document.getElementById('participantCount');
  const participantsList = document.getElementById('participantsList');
  const noParticipantsMessage = document.getElementById('noParticipantsMessage');
  const removeAllBtn = document.getElementById('removeAllBtn');
  
  // Quiz screens
  const waitingScreen = document.getElementById('waitingScreen');
  const quizScreen = document.getElementById('quizScreen');
  const resultsScreen = document.getElementById('resultsScreen');
  
  // Quiz info elements
  const questionCountInfo = document.getElementById('questionCountInfo');
  const timePerQuestionInfo = document.getElementById('timePerQuestionInfo');
  const chatDurationInfo = document.getElementById('chatDurationInfo');
  const maxParticipantsInfo = document.getElementById('maxParticipantsInfo');
  const accessTypeInfo = document.getElementById('accessTypeInfo');
  
  // Host control buttons
  const toggleMuteAllBtn = document.getElementById('toggleMuteAllBtn');
  const toggleLockRoomBtn = document.getElementById('toggleLockRoomBtn');
  
  // Quiz session state
  const quizState = {
    quizId: generateQuizId(),
    quizCode: generateQuizCode(),
    status: 'waiting', // waiting, active, completed, paused
    participants: [],
    currentQuestion: 0,
    totalQuestions: 10,
    timePerQuestion: 20,
    chatDuration: 15,
    maxParticipants: 10,
    isRoomLocked: false,
    isMuted: false,
    bannedUsers: [],
    questions: [],
    leaderboard: [],
    results: {}
  };
  
  // Initialize quiz when page loads
  initializeQuiz();
  
  // Initialize quiz data from URL parameters or local storage
  function initializeQuiz() {
    // Get quiz ID and code from URL if available
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('id');
    const quizCode = urlParams.get('code');
    
    console.log("Initializing quiz...");
    console.log("Quiz ID from URL:", quizId);
    console.log("Quiz Code from URL:", quizCode);
    
    // Always generate a new quiz code if not provided in URL
    if (!quizCode) {
      quizState.quizCode = generateQuizCode();
      console.log("Generated new quiz code:", quizState.quizCode);
    } else {
      quizState.quizCode = quizCode;
    }
    
    // Immediately update the quiz code display
    quizCodeDisplay.textContent = quizState.quizCode;
    
    if (quizId) {
      // Load quiz data from server or local storage
      console.log("Loading quiz data from ID:", quizId);
      loadQuizData(quizId);
    } else {
      console.log("No quiz ID found in URL parameters");
      
      // Try to load from localStorage as a fallback
      const savedQuizzes = JSON.parse(localStorage.getItem('savedQuizzes')) || {};
      const quizKeys = Object.keys(savedQuizzes);
      
      if (quizKeys.length > 0) {
        console.log("Loading most recent quiz from localStorage");
        const mostRecentQuizId = quizKeys[quizKeys.length - 1];
        console.log("Most recent quiz ID:", mostRecentQuizId);
        loadQuizData(mostRecentQuizId);
      } else {
        console.log("No saved quizzes found, showing warning");
        
        // Instead of immediately redirecting, show a warning message
        addSystemMessage("No quiz ID provided and no saved quizzes found. Create a quiz first or use a valid quiz ID.");
        
        // Disable the start button
        startQuizBtn.disabled = true;
        
        // Add a button to redirect to quiz creation
        const warningDiv = document.createElement('div');
        warningDiv.className = 'alert alert-warning mt-3';
        warningDiv.innerHTML = `
          <p>No quiz found to host. You need to create a quiz first.</p>
          <button class="btn btn-primary mt-2" id="createQuizRedirectBtn">Create a Quiz</button>
        `;
        
        // Add to DOM - find a good place to add this
        const waitingRoom = document.querySelector('.waiting-room');
        if (waitingRoom) {
          waitingRoom.prepend(warningDiv);
        }
        
        // Add click event to the button
        document.getElementById('createQuizRedirectBtn').addEventListener('click', function() {
          window.location.href = 'quiz-editor.html';
        });
      }
    }
  }
  
  // Load quiz data from server (or localStorage)
  function loadQuizData(quizId) {
    console.log("Loading quiz data for ID:", quizId);
    
    // Try to load from localStorage first
    const savedQuizzes = JSON.parse(localStorage.getItem('savedQuizzes')) || {};
    const quizData = savedQuizzes[quizId];
    
    if (quizData) {
      console.log("Quiz found in localStorage:", quizData);
      
      // Update quiz state with loaded data
      quizState.quizId = quizId;
      quizState.quizCode = quizData.quizCode || quizState.quizCode;
      quizState.quizTitle = quizData.title || "Untitled Quiz";
      quizState.totalQuestions = quizData.questions ? quizData.questions.length : 0;
      quizState.timePerQuestion = quizData.timePerQuestion || 20;
      quizState.chatDuration = quizData.chatDuration || 15;
      quizState.maxParticipants = quizData.maxParticipants || 10;
      quizState.accessType = quizData.isPublic ? "Public" : "Private (Password Required)";
      quizState.questions = quizData.questions || [];
      
      // Update UI with quiz data
      updateQuizInfo();
    } else {
      console.log("Quiz not found in localStorage, using default data");
      
      // Fallback to mock data if not found
      quizState.quizId = quizId;
      quizState.quizTitle = "Untitled Quiz";
      quizState.totalQuestions = 0;
      quizState.timePerQuestion = 20;
      quizState.chatDuration = 15;
      quizState.maxParticipants = 10;
      quizState.accessType = "Public";
      quizState.questions = [];
      
      // Update UI with quiz data
      updateQuizInfo();
      
      // Show a warning that the quiz couldn't be found
      addSystemMessage("Warning: Quiz data could not be found. Please check the quiz ID or create a new quiz.");
    }
  }
  
  // Update quiz information in the UI
  function updateQuizInfo() {
    quizTitleHeader.textContent = `Hosting: ${quizState.quizTitle}`;
    quizCodeDisplay.textContent = quizState.quizCode;
    questionCountInfo.textContent = quizState.totalQuestions;
    timePerQuestionInfo.textContent = `${quizState.timePerQuestion} seconds`;
    chatDurationInfo.textContent = quizState.chatDuration > 0 ? `${quizState.chatDuration} seconds` : 'No chat';
    maxParticipantsInfo.textContent = quizState.maxParticipants > 0 ? quizState.maxParticipants : 'Unlimited';
    accessTypeInfo.textContent = quizState.accessType;
    
    // Update start button based on question availability
    startQuizBtn.disabled = quizState.questions.length === 0;
  }
  
  // Generate a random quiz code (4 letters + 2 numbers)
  function generateQuizCode() {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const numbers = '23456789';
    let code = '';
    
    // Generate 4 random letters
    for (let i = 0; i < 4; i++) {
      code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    
    // Generate 2 random numbers
    for (let i = 0; i < 2; i++) {
      code += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    
    return code;
  }
  
  // Generate a unique quiz ID
  function generateQuizId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
  
  // Copy quiz code to clipboard
  copyQuizCodeBtn.addEventListener('click', function() {
    const quizCode = quizState.quizCode;
    const joinUrl = `${window.location.origin}/player-quiz.html`;
    const clipboardText = `Join my Quizora quiz with code: ${quizCode}\n\nVisit ${joinUrl} and enter the code to join!`;
    
    console.log("Copying to clipboard:", clipboardText);
    
    // Try the newer Clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(clipboardText)
        .then(() => {
          console.log("Copied successfully using Clipboard API");
          showCopySuccess();
        })
        .catch(err => {
          console.error('Failed to copy using Clipboard API:', err);
          fallbackCopyMethod(clipboardText);
        });
    } else {
      // Fall back to older methods
      fallbackCopyMethod(clipboardText);
    }
    
    function fallbackCopyMethod(text) {
      console.log("Using fallback copy method");
      
      try {
        // Create a temporary textarea
        const textArea = document.createElement('textarea');
        textArea.value = text;
        
        // Make it non-editable to avoid focus and style issues
        textArea.setAttribute('readonly', '');
        textArea.style.position = 'absolute';
        textArea.style.left = '-9999px';
        
        document.body.appendChild(textArea);
        
        // Select and copy
        textArea.select();
        const success = document.execCommand('copy');
        
        // Remove the textarea
        document.body.removeChild(textArea);
        
        if (success) {
          console.log("Copied successfully using fallback method");
          showCopySuccess();
        } else {
          console.error("Failed to copy using fallback method");
          showCopyError();
        }
      } catch (err) {
        console.error("Error using fallback copy method:", err);
        showCopyError();
      }
    }
    
    function showCopySuccess() {
      copyQuizCodeBtn.innerHTML = '<i class="bi bi-check"></i>';
      setTimeout(() => {
        copyQuizCodeBtn.innerHTML = '<i class="bi bi-clipboard"></i>';
      }, 2000);
      
      // Show toast or notification
      addSystemMessage(`Quiz code copied to clipboard!`);
    }
    
    function showCopyError() {
      // Show error state
      copyQuizCodeBtn.innerHTML = '<i class="bi bi-exclamation-triangle"></i>';
      setTimeout(() => {
        copyQuizCodeBtn.innerHTML = '<i class="bi bi-clipboard"></i>';
      }, 2000);
      
      // Manually display the code to the user
      alert(`Could not copy automatically. Please copy this code manually: ${quizCode}`);
    }
  });
  
  // Add participant to the quiz (mock function to simulate players joining)
  function addParticipant(name) {
    // Check if room is locked
    if (quizState.isRoomLocked) {
      console.log('Room is locked, cannot join');
      return;
    }
    
    // Check if max participants reached
    if (quizState.maxParticipants > 0 && quizState.participants.length >= quizState.maxParticipants) {
      console.log('Maximum participants reached');
      return;
    }
    
    // Create participant object
    const participant = {
      id: generateParticipantId(),
      name: name,
      score: 0,
      correctAnswers: 0,
      joinTime: new Date(),
      status: 'active' // active, inactive, removed, banned
    };
    
    // Add to quiz state
    quizState.participants.push(participant);
    
    // Update UI
    updateParticipantsList();
    
    // Add system message
    addSystemMessage(`${name} has joined the quiz`);
  }
  
  // Generate a unique participant ID
  function generateParticipantId() {
    return 'p_' + Math.random().toString(36).substring(2, 10);
  }
  
  // Update the participants list in the UI
  function updateParticipantsList() {
    // Update count
    participantCount.textContent = quizState.participants.length;
    
    // Show/hide no participants message
    if (quizState.participants.length === 0) {
      noParticipantsMessage.style.display = 'block';
      startQuizBtn.disabled = true;
    } else {
      noParticipantsMessage.style.display = 'none';
      startQuizBtn.disabled = false;
    }
    
    // Clear and rebuild list
    participantsList.innerHTML = '';
    quizState.participants.forEach(participant => {
      if (participant.status === 'active') {
        const participantEl = createParticipantElement(participant);
        participantsList.appendChild(participantEl);
      }
    });
  }
  
  // Create a participant element for the UI
  function createParticipantElement(participant) {
    const item = document.createElement('div');
    item.className = 'participant-item';
    item.dataset.participantId = participant.id;
    
    // Get initials for avatar
    const initials = participant.name.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
    
    item.innerHTML = `
      <div class="participant-name">
        <div class="participant-avatar">${initials}</div>
        <span>${participant.name}</span>
      </div>
      <div class="participant-actions">
        <button class="btn btn-sm btn-outline-warning warn-player-btn" title="Warn Player" data-participant-id="${participant.id}">
          <i class="bi bi-exclamation-triangle"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger remove-player-btn" title="Remove Player" data-participant-id="${participant.id}">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
    `;
    
    // Add event listeners to action buttons
    item.querySelector('.warn-player-btn').addEventListener('click', function() {
      showWarnPlayerModal(participant);
    });
    
    item.querySelector('.remove-player-btn').addEventListener('click', function() {
      showRemovePlayerModal(participant);
    });
    
    return item;
  }
  
  // Add a system message to the announcements area
  function addSystemMessage(message) {
    const systemMessages = document.getElementById('systemMessages');
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const messageEl = document.createElement('div');
    messageEl.className = 'chat-message system';
    messageEl.innerHTML = `
      <span class="message-time">${timeStr}</span>
      <div class="message-content">
        ${message}
      </div>
    `;
    
    systemMessages.appendChild(messageEl);
    systemMessages.scrollTop = systemMessages.scrollHeight;
  }
  
  // Show warning player modal
  function showWarnPlayerModal(participant) {
    const modal = new bootstrap.Modal(document.getElementById('warnPlayerModal'));
    document.getElementById('warnPlayerName').textContent = participant.name;
    
    // Store participant ID in the modal for reference
    document.getElementById('warnPlayerModal').dataset.participantId = participant.id;
    
    modal.show();
  }
  
  // Show remove player modal
  function showRemovePlayerModal(participant) {
    const modal = new bootstrap.Modal(document.getElementById('removePlayerModal'));
    document.getElementById('removePlayerName').textContent = participant.name;
    
    // Store participant ID in the modal for reference
    document.getElementById('removePlayerModal').dataset.participantId = participant.id;
    
    modal.show();
  }
  
  // Handle warn player confirmation
  document.getElementById('sendWarnBtn').addEventListener('click', function() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('warnPlayerModal'));
    const participantId = document.getElementById('warnPlayerModal').dataset.participantId;
    const warnReason = document.getElementById('warnReasonSelect').value;
    
    let warningMessage = '';
    
    if (warnReason === 'custom') {
      warningMessage = document.getElementById('customWarnMessage').value;
    } else {
      // Preset messages
      const messages = {
        'behavior': 'Please maintain appropriate behavior during the quiz.',
        'cheating': 'Suspected cheating detected. This activity is being monitored.',
        'disruption': 'Please avoid disrupting the quiz for other participants.'
      };
      warningMessage = messages[warnReason];
    }
    
    // Find participant
    const participant = quizState.participants.find(p => p.id === participantId);
    
    if (participant) {
      // In a real app, would send the warning to the specific participant
      console.log(`Warning sent to ${participant.name}: ${warningMessage}`);
      
      // Add system message
      addSystemMessage(`Warning sent to ${participant.name}`);
    }
    
    modal.hide();
  });
  
  // Handle remove player confirmation
  document.getElementById('confirmRemoveBtn').addEventListener('click', function() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('removePlayerModal'));
    const participantId = document.getElementById('removePlayerModal').dataset.participantId;
    const shouldBan = document.getElementById('banPlayerCheck').checked;
    
    // Find participant
    const participant = quizState.participants.find(p => p.id === participantId);
    
    if (participant) {
      // Remove participant
      participant.status = 'removed';
      
      // If ban is checked, add to banned list
      if (shouldBan) {
        quizState.bannedUsers.push(participant.id);
        participant.status = 'banned';
      }
      
      // Update UI
      updateParticipantsList();
      
      // Add system message
      addSystemMessage(`${participant.name} has been removed from the quiz`);
    }
    
    modal.hide();
  });
  
  // Handle remove all participants
  removeAllBtn.addEventListener('click', function() {
    if (quizState.participants.length === 0) return;
    
    if (confirm('Are you sure you want to remove all participants?')) {
      // Mark all participants as removed
      quizState.participants.forEach(participant => {
        participant.status = 'removed';
      });
      
      // Update UI
      updateParticipantsList();
      
      // Add system message
      addSystemMessage('All participants have been removed');
    }
  });
  
  // Toggle mute all players
  toggleMuteAllBtn.addEventListener('click', function() {
    quizState.isMuted = !quizState.isMuted;
    
    if (quizState.isMuted) {
      toggleMuteAllBtn.innerHTML = '<i class="bi bi-mic me-2"></i>Unmute All Players';
      toggleMuteAllBtn.classList.replace('btn-outline-primary', 'btn-primary');
      addSystemMessage('All participants have been muted');
    } else {
      toggleMuteAllBtn.innerHTML = '<i class="bi bi-mic-mute me-2"></i>Mute All Players';
      toggleMuteAllBtn.classList.replace('btn-primary', 'btn-outline-primary');
      addSystemMessage('All participants have been unmuted');
    }
  });
  
  // Toggle lock room
  toggleLockRoomBtn.addEventListener('click', function() {
    quizState.isRoomLocked = !quizState.isRoomLocked;
    
    if (quizState.isRoomLocked) {
      toggleLockRoomBtn.innerHTML = '<i class="bi bi-unlock me-2"></i>Unlock Room';
      toggleLockRoomBtn.classList.replace('btn-outline-primary', 'btn-primary');
      addSystemMessage('Room is now locked. No new participants can join.');
    } else {
      toggleLockRoomBtn.innerHTML = '<i class="bi bi-lock me-2"></i>Lock Room';
      toggleLockRoomBtn.classList.replace('btn-primary', 'btn-outline-primary');
      addSystemMessage('Room is now unlocked. New participants can join.');
    }
  });
  
  // Start quiz button click event
  startQuizBtn.addEventListener('click', function() {
    // Check if there are questions loaded
    if (!quizState.questions || quizState.questions.length === 0) {
      console.log("No questions found");
      alert('This quiz has no questions. Please add questions before starting.');
      return;
    }
    
    // Enable live test mode without participants for debugging
    const enableTestMode = true;
    
    if (quizState.participants.length === 0 && !enableTestMode) {
      console.log("No participants found");
      alert('You need at least one participant to start the quiz.');
      return;
    }
    
    console.log("Starting quiz...");
    
    // Lock the room when starting
    quizState.isRoomLocked = true;
    toggleLockRoomBtn.innerHTML = '<i class="bi bi-unlock me-2"></i>Unlock Room';
    toggleLockRoomBtn.classList.replace('btn-outline-primary', 'btn-primary');
    
    // Update quiz state
    quizState.status = 'active';
    quizState.currentQuestion = 0;
    
    console.log("Showing quiz screen...");
    
    // Update UI to show first question
    showQuizScreen();
    
    console.log("Loading first question...");
    loadQuestion(0);
    
    // Add system message
    addSystemMessage('Quiz has started!');
  });
  
  // Show quiz screen
  function showQuizScreen() {
    waitingScreen.classList.remove('active');
    quizScreen.classList.add('active');
    resultsScreen.classList.remove('active');
    
    quizStatusIndicator.textContent = 'In Progress';
    quizStatusIndicator.classList.replace('bg-warning', 'bg-success');
  }
  
  // Load question by index
  function loadQuestion(index) {
    if (index >= quizState.totalQuestions) {
      // End of quiz
      endQuiz();
      return;
    }
    
    console.log(`Loading question ${index + 1} of ${quizState.totalQuestions}`);
    
    // Update current question indicator
    document.getElementById('currentQuestionNumber').textContent = index + 1;
    document.getElementById('totalQuestions').textContent = quizState.totalQuestions;
    
    // Get the current question from the quiz data
    const question = quizState.questions[index];
    
    if (!question) {
      console.error("Question not found at index:", index);
      addSystemMessage(`Error: Could not load question ${index + 1}`);
      return;
    }
    
    console.log("Question data:", question);
    
    // Display the question
    document.getElementById('questionText').textContent = question.text;
    
    // Show question type
    let questionTypeLabel = "Multiple Choice";
    if (question.type === 'true-false') {
      questionTypeLabel = "True/False";
    } else if (question.type === 'short-answer') {
      questionTypeLabel = "Short Answer";
    }
    
    // Update question type info if the element exists
    const questionTypeInfo = document.getElementById('questionTypeInfo');
    if (questionTypeInfo) {
      questionTypeInfo.textContent = questionTypeLabel;
    }
    
    // Show question options if the element exists
    const questionOptions = document.getElementById('questionOptions');
    if (questionOptions) {
      questionOptions.innerHTML = ''; // Clear previous options
      
      if (question.type === 'multiple-choice') {
        // Show multiple choice options
        question.options.forEach((option, optionIndex) => {
          const isCorrect = optionIndex === question.correctOption;
          const optionItem = document.createElement('div');
          optionItem.className = 'option-item';
          optionItem.innerHTML = `
            <div class="d-flex align-items-center">
              <div class="option-marker">${String.fromCharCode(65 + optionIndex)}</div>
              <div class="option-text">${option}</div>
              ${isCorrect ? '<span class="badge bg-success ms-2">Correct</span>' : ''}
            </div>
          `;
          questionOptions.appendChild(optionItem);
        });
      } else if (question.type === 'true-false') {
        // Show true/false options
        const correctAnswer = question.correctAnswer === 'true';
        const options = [
          { text: 'True', isCorrect: correctAnswer },
          { text: 'False', isCorrect: !correctAnswer }
        ];
        
        options.forEach((option, optionIndex) => {
          const optionItem = document.createElement('div');
          optionItem.className = 'option-item';
          optionItem.innerHTML = `
            <div class="d-flex align-items-center">
              <div class="option-marker">${option.text[0]}</div>
              <div class="option-text">${option.text}</div>
              ${option.isCorrect ? '<span class="badge bg-success ms-2">Correct</span>' : ''}
            </div>
          `;
          questionOptions.appendChild(optionItem);
        });
      } else if (question.type === 'short-answer') {
        // Show short answer
        const answersList = document.createElement('div');
        answersList.className = 'short-answer-list';
        answersList.innerHTML = '<div class="mb-2">Correct Answers:</div>';
        
        const answerItems = document.createElement('ul');
        answerItems.className = 'list-group';
        
        question.correctAnswers.forEach(answer => {
          const item = document.createElement('li');
          item.className = 'list-group-item';
          item.textContent = answer;
          answerItems.appendChild(item);
        });
        
        answersList.appendChild(answerItems);
        questionOptions.appendChild(answersList);
      }
    }
    
    // Show explanation if available
    const explanationEl = document.getElementById('questionExplanation');
    if (explanationEl) {
      if (question.explanation) {
        explanationEl.textContent = question.explanation;
        explanationEl.parentElement.style.display = 'block';
      } else {
        explanationEl.parentElement.style.display = 'none';
      }
    }
    
    // Start timer
    startQuestionTimer(quizState.timePerQuestion);
    
    // Reset players answering progress
    document.getElementById('playersAnsweredCount').textContent = `0/${quizState.participants.filter(p => p.status === 'active').length}`;
    document.getElementById('playersAnsweredProgress').style.width = '0%';
    document.getElementById('playersAnsweredProgress').textContent = '0%';
    document.getElementById('playersAnsweringList').innerHTML = '';
    
    // In a real implementation, would notify all connected players about the new question
  }
  
  // Start the timer for current question
  function startQuestionTimer(seconds) {
    const timerEl = document.getElementById('questionTimer');
    timerEl.textContent = seconds;
    
    const timerId = setInterval(() => {
      seconds--;
      timerEl.textContent = seconds;
      
      if (seconds <= 0) {
        clearInterval(timerId);
        // Move to next question or chat break
        setTimeout(() => {
          if (quizState.chatDuration > 0) {
            // Show chat break if enabled
            showChatBreak();
          } else {
            // Move to next question directly
            loadQuestion(quizState.currentQuestion + 1);
          }
        }, 1000);
      }
    }, 1000);
    
    // Store timer ID in quiz state to be able to clear it if needed
    quizState.currentTimerId = timerId;
  }
  
  // Show chat break between questions
  function showChatBreak() {
    // In a real implementation, would show chat interface
    addSystemMessage(`Chat break started. ${quizState.chatDuration} seconds until next question.`);
    
    // Start chat timer
    let remainingSeconds = quizState.chatDuration;
    const chatTimerId = setInterval(() => {
      remainingSeconds--;
      
      if (remainingSeconds <= 0) {
        clearInterval(chatTimerId);
        
        // Move to next question
        quizState.currentQuestion++;
        loadQuestion(quizState.currentQuestion);
      }
    }, 1000);
    
    // Store chat timer ID in quiz state
    quizState.chatTimerId = chatTimerId;
  }
  
  // End the quiz
  function endQuiz() {
    // Clear any active timers
    if (quizState.currentTimerId) {
      clearInterval(quizState.currentTimerId);
    }
    if (quizState.chatTimerId) {
      clearInterval(quizState.chatTimerId);
    }
    
    // Update quiz state
    quizState.status = 'completed';
    
    // Show results screen
    showResultsScreen();
    
    // Add system message
    addSystemMessage('The quiz has ended. View the results screen for details.');
  }
  
  // Show results screen
  function showResultsScreen() {
    waitingScreen.classList.remove('active');
    quizScreen.classList.remove('active');
    resultsScreen.classList.add('active');
    
    quizStatusIndicator.textContent = 'Completed';
    quizStatusIndicator.classList.replace('bg-success', 'bg-info');
    
    // Update summary data
    document.getElementById('finalQuizTitle').textContent = quizState.quizTitle;
    document.getElementById('totalParticipantsValue').textContent = quizState.participants.filter(p => p.status === 'active').length;
    document.getElementById('totalQuestionsValue').textContent = quizState.totalQuestions;
    
    // In a real implementation, would calculate these values from actual data
    document.getElementById('avgScoreValue').textContent = '1520';
    document.getElementById('correctAnswersRateValue').textContent = '75%';
    
    // Would populate leaderboard and question analysis from actual results
    populateFinalLeaderboard();
    populateQuestionAnalysis();
  }
  // Populate final leaderboard
  function populateFinalLeaderboard() {
    const leaderboardList = document.getElementById('finalLeaderboardList');
    leaderboardList.innerHTML = '';
    
    // In a real implementation, would use actual participant scores
    // For this demo, generate some random results
    const leaderboardData = quizState.participants
      .filter(p => p.status === 'active')
      .map(p => {
        // Generate random score and correct answers
        const score = Math.floor(Math.random() * 2000) + 500;
        const correctAnswers = Math.floor(Math.random() * quizState.totalQuestions);
        
        return {
          id: p.id,
          name: p.name,
          score: score,
          correctAnswers: correctAnswers
        };
      })
      .sort((a, b) => b.score - a.score);
    
    // Store sorted leaderboard in quiz state
    quizState.leaderboard = leaderboardData;
    
    // Populate UI
    leaderboardData.forEach((player, index) => {
      const item = document.createElement('div');
      item.className = 'leaderboard-item';
      
      // Get initials for avatar
      const initials = player.name.split(' ')
        .map(word => word.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase();
      
      // Add ranking class for top 3
      let rankClass = '';
      if (index === 0) rankClass = 'top-1';
      else if (index === 1) rankClass = 'top-2';
      else if (index === 2) rankClass = 'top-3';
      
      item.innerHTML = `
        <div class="leaderboard-rank">
          <div class="rank-number ${rankClass}">${index + 1}</div>
          <div class="player-info">
            <div class="participant-avatar">${initials}</div>
            <span>${player.name}</span>
          </div>
        </div>
        <div class="player-score">
          ${player.score}
        </div>
      `;
      
      leaderboardList.appendChild(item);
    });
    
    // Update top performer data if there are participants
    if (leaderboardData.length > 0) {
      const topPlayer = leaderboardData[0];
      document.getElementById('topPlayerInitials').textContent = topPlayer.name.split(' ')
        .map(word => word.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase();
      document.getElementById('topPlayerName').textContent = topPlayer.name;
      document.getElementById('topPlayerCorrect').textContent = `${topPlayer.correctAnswers}/${quizState.totalQuestions}`;
      document.getElementById('topPlayerScore').textContent = topPlayer.score;
    }
  }
  
  // Populate question analysis
  function populateQuestionAnalysis() {
    const analysisContainer = document.getElementById('questionAnalysisList');
    analysisContainer.innerHTML = '';
    
    // In a real implementation, would use actual question and response data
    // For this demo, generate some random analysis data
    for (let i = 0; i < quizState.totalQuestions; i++) {
      const correctRate = Math.floor(Math.random() * 100);
      const avgTime = Math.floor(Math.random() * 15) + 5;
      
      const item = document.createElement('div');
      item.className = 'question-analysis-item p-3 border-bottom';
      
      item.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h6 class="mb-0">Question ${i + 1}</h6>
          <span class="badge ${correctRate > 70 ? 'bg-success' : correctRate > 40 ? 'bg-warning' : 'bg-danger'}">
            ${correctRate}% correct
          </span>
        </div>
        <p class="question-text-preview mb-2">Sample Question ${i + 1}</p>
        <div class="d-flex justify-content-between small text-muted">
          <span>Avg. answer time: ${avgTime} seconds</span>
          <a href="#" class="text-decoration-none">View details</a>
        </div>
      `;
      
      analysisContainer.appendChild(item);
    }
  }
  
  // Quiz navigation and control buttons
  document.getElementById('pauseQuizBtn').addEventListener('click', function() {
    if (quizState.status === 'active') {
      quizState.status = 'paused';
      this.innerHTML = '<i class="bi bi-play-fill me-2"></i>Resume Quiz';
      this.classList.replace('btn-warning', 'btn-success');
      
      // Pause any active timers
      if (quizState.currentTimerId) {
        clearInterval(quizState.currentTimerId);
      }
      if (quizState.chatTimerId) {
        clearInterval(quizState.chatTimerId);
      }
      
      quizStatusIndicator.textContent = 'Paused';
      quizStatusIndicator.classList.replace('bg-success', 'bg-warning');
      
      addSystemMessage('Quiz has been paused by the host');
    } else if (quizState.status === 'paused') {
      quizState.status = 'active';
      this.innerHTML = '<i class="bi bi-pause-fill me-2"></i>Pause Quiz';
      this.classList.replace('btn-success', 'btn-warning');
      
      // Resume timers (would need to implement proper timer resuming)
      
      quizStatusIndicator.textContent = 'In Progress';
      quizStatusIndicator.classList.replace('bg-warning', 'bg-success');
      
      addSystemMessage('Quiz has been resumed');
    }
  });
  
  document.getElementById('endQuizBtn').addEventListener('click', function() {
    const modal = new bootstrap.Modal(document.getElementById('endQuizConfirmModal'));
    modal.show();
  });
  
  document.getElementById('confirmEndQuizBtn').addEventListener('click', function() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('endQuizConfirmModal'));
    modal.hide();
    endQuiz();
  });
  
  // Host again button
  document.getElementById('hostAgainBtn').addEventListener('click', function() {
    // Reset quiz state
    quizState.status = 'waiting';
    quizState.currentQuestion = 0;
    quizState.leaderboard = [];
    
    // Show waiting screen
    waitingScreen.classList.add('active');
    quizScreen.classList.remove('active');
    resultsScreen.classList.remove('active');
    
    quizStatusIndicator.textContent = 'Waiting for players';
    quizStatusIndicator.classList.replace('bg-info', 'bg-warning');
    
    // Generate new quiz code
    quizState.quizCode = generateQuizCode();
    quizCodeDisplay.textContent = quizState.quizCode;
    
    // Reset participants (keeping existing ones marked as active)
    updateParticipantsList();
    
    addSystemMessage('New quiz session started. Waiting for players to join.');
  });
  
  document.getElementById('editAndHostBtn').addEventListener('click', function() {
    // Redirect to quiz editor with current quiz ID
    window.location.href = `quiz-editor.html?id=${quizState.quizId}`;
  });
  
  // Utility function to connect host-quiz.html to player-quiz.html (for demo)
  // Add mock participants for testing
  function addMockParticipants() {
    const mockNames = [
      'John Smith', 'Emma Wilson', 'Michael Brown', 'Sophia Davis',
      'Robert Johnson', 'Olivia Jones', 'William Miller', 'Ava Martinez'
    ];
    
    // Add 3 random participants initially
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * mockNames.length);
      const name = mockNames.splice(randomIndex, 1)[0];
      addParticipant(name);
    }
    
    // Add more participants over time
    setTimeout(() => {
      if (mockNames.length > 0 && !quizState.isRoomLocked && quizState.status === 'waiting') {
        const randomIndex = Math.floor(Math.random() * mockNames.length);
        const name = mockNames.splice(randomIndex, 1)[0];
        addParticipant(name);
      }
    }, 5000);
  }
  
  // For demo purposes, add mock participants
  setTimeout(addMockParticipants, 1000);
  
  // Handle custom warning message toggle
  document.getElementById('warnReasonSelect').addEventListener('change', function() {
    const customMessageContainer = document.getElementById('customWarnMessageContainer');
    if (this.value === 'custom') {
      customMessageContainer.style.display = 'block';
    } else {
      customMessageContainer.style.display = 'none';
    }
  });
  
  // Share results button
  document.getElementById('shareResultsBtn').addEventListener('click', function() {
    // In a real implementation, would generate a shareable link
    alert('Quiz results link copied to clipboard!');
  });
  
  // Download results as CSV
  document.getElementById('downloadResultsBtn').addEventListener('click', function() {
    // In a real implementation, would generate and download CSV file
    alert('Quiz results would be downloaded as CSV');
  });
  
  // New quiz button
  document.getElementById('newQuizBtn').addEventListener('click', function() {
    window.location.href = 'quiz-editor.html';
  });
  
  // Add mock participant button
  const addMockParticipantBtn = document.getElementById('addMockParticipantBtn');
  if (addMockParticipantBtn) {
    addMockParticipantBtn.addEventListener('click', function() {
      // Generate a random name
      const firstNames = ['John', 'Jane', 'Michael', 'Emma', 'David', 'Sarah', 'Robert', 'Emily'];
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson'];
      
      const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const fullName = `${randomFirstName} ${randomLastName}`;
      
      // Add the participant
      addParticipant(fullName);
      
      console.log(`Added mock participant: ${fullName}`);
    });
  }
}); 
