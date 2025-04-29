/**
 * Dashboard Quick Actions JavaScript
 * Handles all interactive functionality for quick action cards and modals
 */

// Initialize on document load
document.addEventListener('DOMContentLoaded', function() {
  // Initialize all quick actions
  initQuickActions();
});

/**
 * Initialize all quick action cards and their functionality
 */
function initQuickActions() {
  // Find all quick action cards and make them interactive
  setupQuickActionCards();
}

/**
 * Setup quick action cards with click handlers
 */
function setupQuickActionCards() {
  // Find all quick action cards in the dashboard
  const actionCards = document.querySelectorAll('.action-card');
  
  actionCards.forEach(card => {
    // Add interactive class for styling
    card.classList.add('interactive');
    
    // Add hover animations
    card.addEventListener('mouseenter', () => {
      const icon = card.querySelector('.action-icon');
      if (icon) icon.classList.add('pulse');
    });
    
    card.addEventListener('mouseleave', () => {
      const icon = card.querySelector('.action-icon');
      if (icon) icon.classList.remove('pulse');
    });
    
    // Remove existing buttons that might interfere with new functionality
    const existingButton = card.querySelector('.join-quiz-btn');
    if (existingButton) {
      existingButton.remove();
    }
    
    // Add banner on top
    if (card.querySelector('.join-icon')) {
      addCardBanner(card, 'Quick Join');
      
      // Override click behavior to show join quiz popup
      card.addEventListener('click', showJoinQuizPopup);
    } else if (card.querySelector('.ai-icon')) {
      addCardBanner(card, 'AI-Powered');
      
      // Override click behavior to show AI quiz popup
      card.addEventListener('click', showAIQuizPopup);
    } else if (card.querySelector('.challenge-icon')) {
      addCardBanner(card, 'Live');
      
      // Override click behavior to show challenge popup
      card.addEventListener('click', showChallengePopup);
    }
  });
}

/**
 * Add a banner to a card
 */
function addCardBanner(card, text) {
  // Only add if not already present
  if (!card.querySelector('.action-banner')) {
    const banner = document.createElement('div');
    banner.className = 'action-banner';
    banner.textContent = text;
    card.appendChild(banner);
  }
}

/**
 * Show Join Quiz popup
 */
function showJoinQuizPopup(event) {
  // Prevent link navigation if there's a link
  if (event) event.preventDefault();
  
  // Show modal
  showQuickActionModal('info', 'Join a Quiz', `
    <div class="join-quiz-popup text-center">
      <p class="mb-4">Enter the 6-digit code provided by the quiz host to join.</p>
      <div class="join-code-input-container mb-4">
        <input type="text" class="form-control quick-code-input text-center" placeholder="Enter 6-digit code" maxlength="6">
      </div>
    </div>
  `,
  [
    {
      text: 'Join Quiz',
      class: 'btn-primary',
      icon: 'fa-sign-in-alt',
      callback: function() {
        const codeInput = document.querySelector('.quick-code-input');
        const code = codeInput?.value.trim().toUpperCase();
        
        if (!code || code.length !== 6) {
          showQuickActionModal('error', 'Invalid Code', 
            'Please enter a valid 6-character quiz code.',
            [{ text: 'Try Again', class: 'btn-primary', callback: showJoinQuizPopup }]
          );
          return;
        }
        
        // Show loading modal
        const loadingModal = showQuickActionModal('info', 'Searching for Quiz', `
          <div class="text-center">
            <div class="spinner-border text-primary mb-3" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p>Looking for quiz with code: <strong>${code}</strong></p>
          </div>
        `, [], false);
        
        // Simulate API call to find quiz
        setTimeout(() => {
          closeQuickActionModal();
          
          // Show successful match popup
          showQuickActionModal('success', 'Quiz Found!', 
            document.getElementById('joinQuizModalTemplate').innerHTML,
            [
              {
                text: 'Join Now',
                class: 'btn-success',
                icon: 'fa-sign-in-alt',
                callback: () => {
                  // Redirect to multiplayer page
                  window.location.href = `multiplayer.html?code=${code}`;
                }
              },
              {
                text: 'Cancel',
                class: 'btn-outline-secondary'
              }
            ]
          );
          
          // Update quiz details in the modal
          updateJoinQuizModalContent(code);
        }, 1500);
      }
    },
    {
      text: 'Cancel',
      class: 'btn-outline-secondary'
    }
  ]);
  
  // Focus the input field
  setTimeout(() => {
    const input = document.querySelector('.quick-code-input');
    if (input) input.focus();
  }, 300);
  
  // Add enter key support
  const input = document.querySelector('.quick-code-input');
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.querySelector('.quick-action-modal-footer .btn-primary').click();
      }
    });
  }
}

/**
 * Show AI Quiz popup
 */
function showAIQuizPopup(event) {
  // Prevent link navigation if there's a link
  if (event) event.preventDefault();
  
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
}

/**
 * Show Challenge Friend popup
 */
function showChallengePopup(event) {
  // Prevent link navigation if there's a link
  if (event) event.preventDefault();
  
  // Show modal
  showQuickActionModal('info', 'Challenge a Friend', `
    <div class="challenge-friend-popup">
      <p class="mb-3">Select a friend to challenge to a quiz duel!</p>
      
      <div class="mb-3">
        <label for="friendSelect" class="form-label">Friend</label>
        <select class="form-select friend-select" id="friendSelect">
          <option value="" selected disabled>Select a friend...</option>
          <option value="friend1">Alex Stevens</option>
          <option value="friend2">Olivia Kim</option>
          <option value="friend3">John Smith</option>
        </select>
      </div>
      
      <div class="quiz-type-tabs mb-3">
        <div class="quiz-type-tab active" data-tab="existing">
          <i class="fas fa-list"></i> Existing Quiz
        </div>
        <div class="quiz-type-tab" data-tab="ai">
          <i class="fas fa-robot"></i> AI-Generated Quiz
        </div>
      </div>
      
      <div class="quiz-type-content" id="existing-tab-content">
        <div class="mb-3">
          <label for="quizSelect" class="form-label">Select Quiz</label>
          <select class="form-select quiz-select" id="quizSelect">
            <option value="" selected disabled>Choose your quiz...</option>
            <option value="web">Web Development Basics</option>
            <option value="js">JavaScript Fundamentals</option>
            <option value="python">Python for Beginners</option>
            <option value="history">World History</option>
          </select>
        </div>
        
        <div class="mb-3">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="useTimer" checked>
            <label class="form-check-label" for="useTimer">Use timer for questions</label>
          </div>
        </div>
        
        <div class="mb-3">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="allowHints">
            <label class="form-check-label" for="allowHints">Allow hints (costs points)</label>
          </div>
        </div>
      </div>
      
      <div class="quiz-type-content d-none" id="ai-tab-content">
        <div class="mb-3">
          <label for="aiChallengePrompt" class="form-label">AI Prompt <small class="text-muted">(Optional)</small></label>
          <textarea class="form-control ai-prompt" id="aiChallengePrompt" rows="2" 
            placeholder="Describe the quiz you want the AI to create for this challenge"></textarea>
        </div>
        
        <div class="row mb-3">
          <div class="col-6">
            <label for="aiChallengeTopic" class="form-label">Topic</label>
            <select class="form-select" id="aiChallengeTopic">
              <option value="" selected disabled>Select topic...</option>
              <option value="science">Science</option>
              <option value="history">History</option>
              <option value="geography">Geography</option>
              <option value="technology">Technology</option>
              <option value="custom">Custom (Use Prompt)</option>
            </select>
          </div>
          <div class="col-6">
            <label for="aiChallengeDifficulty" class="form-label">Difficulty</label>
            <select class="form-select" id="aiChallengeDifficulty">
              <option value="easy">Easy</option>
              <option value="medium" selected>Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
        
        <div class="row mb-3">
          <div class="col-6">
            <label for="aiChallengeQuestions" class="form-label">Questions</label>
            <select class="form-select" id="aiChallengeQuestions">
              <option value="5">5 Questions</option>
              <option value="10" selected>10 Questions</option>
              <option value="15">15 Questions</option>
            </select>
          </div>
          <div class="col-6">
            <label for="aiChallengeTime" class="form-label">Time Limit</label>
            <select class="form-select" id="aiChallengeTime">
              <option value="15">15 sec/question</option>
              <option value="30" selected>30 sec/question</option>
              <option value="60">60 sec/question</option>
              <option value="0">No limit</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="challenge-note mb-3">
        <div class="note-header">
          <i class="fas fa-info-circle"></i> Challenge Note
        </div>
        <textarea class="form-control" id="challengeNote" rows="2" 
          placeholder="Add a personal note to your friend (optional)"></textarea>
      </div>
    </div>
  `,
  [
    {
      text: 'Send Challenge',
      class: 'btn-primary',
      icon: 'fa-paper-plane',
      callback: function() {
        const friendSelect = document.getElementById('friendSelect');
        const activeTab = document.querySelector('.quiz-type-tab.active').getAttribute('data-tab');
        
        // Get selected friend
        const selectedFriend = friendSelect?.value;
        const friendName = selectedFriend ? friendSelect.options[friendSelect.selectedIndex].text : '';
        
        // Get challenge note
        const challengeNote = document.getElementById('challengeNote')?.value;
        
        // Validate friend selection
        if (!selectedFriend) {
          showQuickActionModal('warning', 'Select a Friend', 
            'Please select a friend to challenge.',
            [{ text: 'Try Again', class: 'btn-primary', callback: showChallengePopup }]
          );
          return;
        }
        
        let quizInfo = {};
        
        // Get quiz info based on active tab
        if (activeTab === 'existing') {
          const quizSelect = document.getElementById('quizSelect');
          const useTimer = document.getElementById('useTimer')?.checked;
          const allowHints = document.getElementById('allowHints')?.checked;
          
          const selectedQuiz = quizSelect?.value;
          const quizName = selectedQuiz ? quizSelect.options[quizSelect.selectedIndex].text : '';
          
          if (!selectedQuiz) {
            showQuickActionModal('warning', 'Select a Quiz', 
              'Please select a quiz for the challenge.',
              [{ text: 'Try Again', class: 'btn-primary', callback: showChallengePopup }]
            );
            return;
          }
          
          quizInfo = {
            type: 'existing',
            quizId: selectedQuiz,
            quizName: quizName,
            useTimer: useTimer,
            allowHints: allowHints
          };
        } else {
          // AI quiz tab
          const prompt = document.getElementById('aiChallengePrompt')?.value.trim();
          const topic = document.getElementById('aiChallengeTopic')?.value;
          const difficulty = document.getElementById('aiChallengeDifficulty')?.value || 'medium';
          const questionCount = document.getElementById('aiChallengeQuestions')?.value || '10';
          const timeLimit = document.getElementById('aiChallengeTime')?.value || '30';
          
          if (!topic && !prompt) {
            showQuickActionModal('warning', 'Topic or Prompt Required', 
              'Please select a topic or provide a prompt for the AI quiz.',
              [{ text: 'Try Again', class: 'btn-primary', callback: showChallengePopup }]
            );
            return;
          }
          
          quizInfo = {
            type: 'ai',
            prompt: prompt,
            topic: topic,
            difficulty: difficulty,
            questionCount: questionCount,
            timeLimit: timeLimit
          };
        }
        
        // Show loading modal
        const loadingModal = showQuickActionModal('info', 'Sending Challenge', `
          <div class="text-center">
            <div class="spinner-border text-primary mb-3" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p>Sending challenge to <strong>${friendName}</strong>...</p>
          </div>
        `, [], false);
        
        // Simulate API call
        setTimeout(() => {
          closeQuickActionModal();
          
          // Show challenge sent popup
          showQuickActionModal('success', 'Challenge Sent!', 
            document.getElementById('challengeFriendModalTemplate').innerHTML,
            [
              {
                text: 'View Challenge',
                class: 'btn-primary',
                icon: 'fa-eye',
                callback: () => {
                  window.location.href = 'multiplayer.html?challenge=pending';
                }
              },
              {
                text: 'Close',
                class: 'btn-outline-secondary'
              }
            ]
          );
          
          // Format quiz name for display
          let displayQuizName = '';
          if (quizInfo.type === 'existing') {
            displayQuizName = quizInfo.quizName;
          } else {
            displayQuizName = quizInfo.topic && quizInfo.topic !== 'custom' 
              ? `AI ${quizInfo.topic.charAt(0).toUpperCase() + quizInfo.topic.slice(1)} Quiz` 
              : 'AI-Generated Quiz';
          }
          
          // Update challenge details
          updateChallengeContent(friendName, displayQuizName);
        }, 1500);
      }
    },
    {
      text: 'Cancel',
      class: 'btn-outline-secondary'
    }
  ]);
  
  // Set up tab switching
  setTimeout(() => {
    const tabs = document.querySelectorAll('.quiz-type-tab');
    if (tabs.length) {
      tabs.forEach(tab => {
        tab.addEventListener('click', function() {
          // Remove active class from all tabs
          tabs.forEach(t => t.classList.remove('active'));
          
          // Add active class to clicked tab
          this.classList.add('active');
          
          // Hide all content
          document.querySelectorAll('.quiz-type-content').forEach(content => {
            content.classList.add('d-none');
          });
          
          // Show selected content
          const tabId = this.getAttribute('data-tab');
          document.getElementById(`${tabId}-tab-content`).classList.remove('d-none');
        });
      });
    }
  }, 300);
}

/**
 * Show AI-generated quiz preview
 */
function showQuizPreview(topic, difficulty, questionCount, prompt, questionType, includeExplanations) {
  const quizPreviewContent = document.getElementById('quizPreviewModalTemplate').innerHTML;
  
  showQuickActionModal('success', 'Quiz Generated Successfully!', 
    quizPreviewContent,
    [
      {
        text: 'Edit Questions',
        class: 'btn-primary',
        icon: 'fa-edit',
        callback: () => {
          // Redirect to question editor
          window.location.href = `create-questions.html?topic=${topic}&difficulty=${difficulty}&count=${questionCount}`;
        }
      },
      {
        text: 'Host Now',
        class: 'btn-success',
        icon: 'fa-play',
        callback: () => {
          // Redirect to multiplayer
          window.location.href = `multiplayer.html?host=true&ai=true&topic=${topic}`;
        }
      },
      {
        text: 'Save for Later',
        class: 'btn-outline-secondary',
        icon: 'fa-save'
      }
    ]
  );
  
  // Update quiz details in the modal
  updateQuizPreviewContent(topic, difficulty, questionCount, prompt, questionType);
}

/**
 * Update join quiz modal content with quiz details
 */
function updateJoinQuizModalContent(code) {
  // These details would normally come from the server
  // Simulating for demo purposes
  const quizDetails = {
    name: 'Web Development Fundamentals',
    host: 'Alex Stevens',
    players: 5,
    maxPlayers: 10,
    difficulty: 'Medium',
    estimatedTime: '15 minutes'
  };
  
  // Update quiz details in the modal
  const modal = document.querySelector('.quick-action-modal');
  if (!modal) return;
  
  const quizName = modal.querySelector('.quiz-name');
  const hostName = modal.querySelector('.host-name');
  const playerCount = modal.querySelector('.player-count');
  
  if (quizName) quizName.textContent = quizDetails.name;
  if (hostName) hostName.textContent = quizDetails.host;
  if (playerCount) playerCount.textContent = quizDetails.players;
}

/**
 * Update AI quiz preview content with details
 */
function updateQuizPreviewContent(topic, difficulty, questionCount, prompt, questionType) {
  const modal = document.querySelector('.quick-action-modal');
  if (!modal) return;
  
  // Topics to nice titles mapping
  const topicTitles = {
    'science': 'Science Wonders',
    'history': 'Journey Through Time',
    'geography': 'World Explorer',
    'literature': 'Literary Masterpieces',
    'technology': 'Tech & Innovation'
  };
  
  // Update quiz details
  const quizTitle = modal.querySelector('.quiz-title');
  const difficultyBadge = modal.querySelector('.difficulty-badge');
  const questionCountElem = modal.querySelector('.question-count');
  const timeEstimate = modal.querySelector('.time-estimate');
  const pointsValue = modal.querySelector('.points-value');
  
  if (quizTitle) quizTitle.textContent = topicTitles[topic] || topic.charAt(0).toUpperCase() + topic.slice(1);
  if (difficultyBadge) difficultyBadge.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  if (questionCountElem) questionCountElem.textContent = questionCount;
  if (timeEstimate) timeEstimate.textContent = questionCount * 1.5; // Estimate 1.5 min per question
  if (pointsValue) pointsValue.textContent = questionCount * 100; // 100 points per question
  
  // Update sample question based on topic
  updateSampleQuestion(topic, modal);
}

/**
 * Update challenge content with friend details
 */
function updateChallengeContent(friendName, quizName) {
  const modal = document.querySelector('.quick-action-modal');
  if (!modal) return;
  
  const receiverName = modal.querySelector('.receiver-name');
  const challengeMessage = modal.querySelector('.challenge-message');
  const challengeSubtext = modal.querySelector('.challenge-subtext');
  
  if (receiverName) receiverName.textContent = friendName;
  if (challengeMessage) challengeMessage.textContent = 'Challenge sent successfully!';
  if (challengeSubtext) {
    challengeSubtext.textContent = `${friendName} will receive a notification to join "${quizName}"`;
  }
}

/**
 * Update sample question based on topic
 */
function updateSampleQuestion(topic, modal) {
  const sampleQuestions = {
    'science': {
      question: 'Which of these elements has the highest atomic number?',
      options: ['A) Carbon', 'B) Oxygen', 'C) Iron', 'D) Gold']
    },
    'history': {
      question: 'Which ancient civilization built the Machu Picchu complex in Peru?',
      options: ['A) Maya', 'B) Aztec', 'C) Inca', 'D) Olmec']
    },
    'geography': {
      question: 'Which of these countries is NOT in the Southern Hemisphere?',
      options: ['A) Australia', 'B) Mexico', 'C) Brazil', 'D) South Africa']
    },
    'literature': {
      question: 'Who wrote the novel "Pride and Prejudice"?',
      options: ['A) Jane Austen', 'B) Charles Dickens', 'C) Emily Brontë', 'D) Leo Tolstoy']
    },
    'technology': {
      question: 'What programming language was used to create the first website?',
      options: ['A) HTML', 'B) JavaScript', 'C) PHP', 'D) Python']
    }
  };
  
  // Default sample question if topic not found
  const defaultSample = {
    question: 'What is the primary programming language used in web development?',
    options: ['A) JavaScript', 'B) Python', 'C) Java', 'D) C++']
  };
  
  const sample = sampleQuestions[topic] || defaultSample;
  
  const sampleQuestion = modal.querySelector('.sample-question');
  const sampleOptions = modal.querySelector('.sample-options');
  
  if (sampleQuestion) sampleQuestion.textContent = sample.question;
  
  if (sampleOptions) {
    sampleOptions.innerHTML = '';
    sample.options.forEach(option => {
      const optionElement = document.createElement('div');
      optionElement.className = 'sample-option';
      optionElement.textContent = option;
      sampleOptions.appendChild(optionElement);
    });
  }
}

/**
 * Show a quick action modal with custom content
 */
function showQuickActionModal(type, title, content, buttons = [], closable = true) {
  // Remove any existing modal
  closeQuickActionModal();
  
  // Create modal container
  const modalContainer = document.createElement('div');
  modalContainer.className = 'quick-action-modal';
  
  // Set icon based on type
  let icon = 'fa-info-circle';
  let colorClass = 'text-info';
  
  switch (type) {
    case 'success':
      icon = 'fa-check-circle';
      colorClass = 'text-success';
      break;
    case 'warning':
      icon = 'fa-exclamation-triangle';
      colorClass = 'text-warning';
      break;
    case 'error':
      icon = 'fa-times-circle';
      colorClass = 'text-danger';
      break;
  }
  
  // Create modal content
  modalContainer.innerHTML = `
    <div class="quick-action-modal-content">
      <div class="quick-action-modal-header">
        <h5 class="quick-action-modal-title">
          <i class="fas ${icon} ${colorClass} me-2"></i> ${title}
        </h5>
        ${closable ? '<button class="quick-action-modal-close"><i class="fas fa-times"></i></button>' : ''}
      </div>
      <div class="quick-action-modal-body">
        ${content}
      </div>
      ${buttons.length > 0 ? '<div class="quick-action-modal-footer"></div>' : ''}
    </div>
  `;
  
  // Add buttons if provided
  if (buttons.length > 0) {
    const footer = modalContainer.querySelector('.quick-action-modal-footer');
    
    buttons.forEach(button => {
      const btn = document.createElement('button');
      btn.className = `btn ${button.class}`;
      
      btn.innerHTML = button.icon ? `<i class="fas ${button.icon} me-1"></i> ${button.text}` : button.text;
      
      if (button.callback) {
        btn.addEventListener('click', () => {
          closeQuickActionModal();
          button.callback();
        });
      } else {
        btn.addEventListener('click', closeQuickActionModal);
      }
      
      footer.appendChild(btn);
    });
  }
  
  // Add close button event
  if (closable) {
    const closeBtn = modalContainer.querySelector('.quick-action-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeQuickActionModal);
    }
    
    // Close on click outside
    modalContainer.addEventListener('click', (e) => {
      if (e.target === modalContainer) {
        closeQuickActionModal();
      }
    });
  }
  
  // Add to DOM
  document.body.appendChild(modalContainer);
  
  // Show modal with animation
  setTimeout(() => {
    modalContainer.classList.add('show');
  }, 10);
  
  return modalContainer;
}

/**
 * Close the quick action modal
 */
function closeQuickActionModal() {
  const modal = document.querySelector('.quick-action-modal');
  
  if (modal) {
    modal.classList.remove('show');
    
    // Remove after animation completes
    setTimeout(() => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 300);
  }
} 
