// DOM Elements
const myQuizzesList = document.getElementById('myQuizzesList');
const recentQuizzesList = document.getElementById('recentQuizzesList');
const favoriteQuizzesList = document.getElementById('favoriteQuizzesList');
const createQuizBtn = document.getElementById('createQuizBtn');
const searchQuizzesInput = document.getElementById('searchQuizzes');
const continueBtn = document.getElementById('continueBtn');
const creationMethodCards = document.querySelectorAll('.creation-method-card');
const creationMethodInput = document.getElementById('creationMethod');
const copyDetailsCodeBtn = document.getElementById('copyDetailsCodeBtn');
const playQuizBtn = document.getElementById('playQuizBtn');
const editQuizBtn = document.getElementById('editQuizBtn');
const duplicateQuizBtn = document.getElementById('duplicateQuizBtn');
const exportQuizBtn = document.getElementById('exportQuizBtn');
const deleteQuizBtn = document.getElementById('deleteQuizBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// Current quiz being viewed/edited
let currentQuizId = null;

// Check if user is logged in
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = 'auth.html';
      return;
    }

    // Load user data and quizzes
    await loadUserData();
    await loadMyQuizzes();
    await loadRecentQuizzes();
    await loadFavoriteQuizzes();
  } catch (error) {
    console.error('Error initializing my quizzes page:', error);
    showAlert('Error loading quizzes. Please try again later.', 'danger');
  }
});

// Load user data
async function loadUserData() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/user/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    const userData = await response.json();
    
    // Update username in top bar
    document.querySelector('.username').textContent = userData.displayName || 'My Profile';
    
    // Update profile image if available
    if (userData.avatarUrl) {
      document.querySelector('.profile-icon').src = userData.avatarUrl;
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    showAlert('Error loading user data', 'danger');
  }
}

// Load user's created quizzes
async function loadMyQuizzes() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/quiz/user/myquizzes', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch quizzes');
    }

    const quizzes = await response.json();
    
    // Clear loading state
    myQuizzesList.innerHTML = '';
    
    if (quizzes.length === 0) {
      myQuizzesList.innerHTML = `
        <div class="col-12">
          <div class="empty-state">
            <div class="empty-state-icon">
              <i class="fas fa-layer-group"></i>
            </div>
            <h4>No Quizzes Yet</h4>
            <p>Create your first quiz to get started</p>
            <button class="btn btn-primary" id="emptyStateCreateBtn">
              <i class="fas fa-plus me-2"></i>Create New Quiz
            </button>
          </div>
        </div>
      `;
      
      // Add event listener to create button
      const emptyStateCreateBtn = document.getElementById('emptyStateCreateBtn');
      if (emptyStateCreateBtn) {
        emptyStateCreateBtn.addEventListener('click', showCreateQuizModal);
      }
      
      return;
    }
    
    // Display quizzes
    quizzes.forEach(quiz => {
      const quizCard = createQuizCard(quiz);
      myQuizzesList.appendChild(quizCard);
    });
  } catch (error) {
    console.error('Error loading quizzes:', error);
    myQuizzesList.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger" role="alert">
          Could not load quizzes. Please try again later.
        </div>
      </div>
    `;
  }
}

// Load recently played quizzes
async function loadRecentQuizzes() {
  try {
    // In a real app, this would fetch from API
    // For now, show placeholder
    
    recentQuizzesList.innerHTML = `
      <div class="col-12">
        <div class="empty-state">
          <div class="empty-state-icon">
            <i class="fas fa-history"></i>
          </div>
          <h4>No Recent Activity</h4>
          <p>Quizzes you've played recently will appear here</p>
          <button class="btn btn-primary" id="browseQuizzesBtn">
            <i class="fas fa-search me-2"></i>Browse Quizzes
          </button>
        </div>
      </div>
    `;
    
    // Add event listener to browse button
    const browseQuizzesBtn = document.getElementById('browseQuizzesBtn');
    if (browseQuizzesBtn) {
      browseQuizzesBtn.addEventListener('click', () => {
        window.location.href = 'home.html';
      });
    }
  } catch (error) {
    console.error('Error loading recent quizzes:', error);
    recentQuizzesList.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger" role="alert">
          Could not load recent quizzes. Please try again later.
        </div>
      </div>
    `;
  }
}

// Load favorite quizzes
async function loadFavoriteQuizzes() {
  try {
    // In a real app, this would fetch from API
    // For now, show placeholder
    
    favoriteQuizzesList.innerHTML = `
      <div class="col-12">
        <div class="empty-state">
          <div class="empty-state-icon">
            <i class="fas fa-star"></i>
          </div>
          <h4>No Favorites Yet</h4>
          <p>Star your favorite quizzes to find them easily</p>
          <button class="btn btn-primary" id="browseFavoritesBtn">
            <i class="fas fa-search me-2"></i>Browse Quizzes
          </button>
        </div>
      </div>
    `;
    
    // Add event listener to browse button
    const browseFavoritesBtn = document.getElementById('browseFavoritesBtn');
    if (browseFavoritesBtn) {
      browseFavoritesBtn.addEventListener('click', () => {
        window.location.href = 'home.html';
      });
    }
  } catch (error) {
    console.error('Error loading favorite quizzes:', error);
    favoriteQuizzesList.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger" role="alert">
          Could not load favorite quizzes. Please try again later.
        </div>
      </div>
    `;
  }
}

// Create a quiz card element
function createQuizCard(quiz) {
  const cardCol = document.createElement('div');
  cardCol.className = 'col';
  
  const categoryColors = {
    'general': '#6c757d',
    'science': '#28a745',
    'history': '#dc3545',
    'geography': '#17a2b8',
    'entertainment': '#e83e8c',
    'sports': '#fd7e14',
    'literature': '#6f42c1',
    'technology': '#007bff',
    'art': '#20c997',
    'music': '#6610f2',
    'custom': '#6c757d'
  };
  
  const categoryColor = categoryColors[quiz.category] || categoryColors.custom;
  
  cardCol.innerHTML = `
    <div class="quiz-card" data-quiz-id="${quiz.id}">
      <div class="quiz-card-header" style="background-color: ${categoryColor}40;">
        <div class="quiz-options">
          <button class="btn btn-sm btn-light quiz-option-btn">
            <i class="fas fa-ellipsis-v"></i>
          </button>
          <div class="quiz-options-menu">
            <a href="#" class="quiz-option-item play-quiz" data-quiz-id="${quiz.id}">
              <i class="fas fa-play"></i> Play
            </a>
            <a href="#" class="quiz-option-item edit-quiz" data-quiz-id="${quiz.id}">
              <i class="fas fa-edit"></i> Edit
            </a>
            <a href="#" class="quiz-option-item duplicate-quiz" data-quiz-id="${quiz.id}">
              <i class="fas fa-copy"></i> Duplicate
            </a>
            <div class="quiz-option-divider"></div>
            <a href="#" class="quiz-option-item delete-quiz text-danger" data-quiz-id="${quiz.id}">
              <i class="fas fa-trash"></i> Delete
            </a>
          </div>
        </div>
        <span class="quiz-category">${quiz.category ? quiz.category.charAt(0).toUpperCase() + quiz.category.slice(1) : 'General'}</span>
        <span class="quiz-visibility ${quiz.isPublic ? 'public' : 'private'}">
          <i class="fas ${quiz.isPublic ? 'fa-globe' : 'fa-lock'}"></i>
          ${quiz.isPublic ? 'Public' : 'Private'}
        </span>
      </div>
      <div class="quiz-card-body">
        <h5 class="quiz-title">${quiz.title}</h5>
        <p class="quiz-description">${quiz.description || 'No description'}</p>
      </div>
      <div class="quiz-card-footer">
        <div class="quiz-stats">
          <div class="quiz-stat">
            <i class="fas fa-list"></i>
            <span>${quiz.questions ? quiz.questions.length : 0} Questions</span>
          </div>
          <div class="quiz-stat">
            <i class="fas fa-play"></i>
            <span>${quiz.playCount || 0} Plays</span>
          </div>
        </div>
        <div class="quiz-code">
          Code: <span>${quiz.quizCode || 'N/A'}</span>
        </div>
      </div>
    </div>
  `;
  
  // Add event listeners
  const quizCard = cardCol.querySelector('.quiz-card');
  
  // Card click opens details
  quizCard.addEventListener('click', function(event) {
    // Ignore clicks on options
    if (event.target.closest('.quiz-options')) {
      return;
    }
    
    const quizId = this.getAttribute('data-quiz-id');
    openQuizDetails(quizId);
  });
  
  // Options menu toggle
  const optionsBtn = quizCard.querySelector('.quiz-option-btn');
  optionsBtn.addEventListener('click', function(event) {
    event.stopPropagation();
    
    const optionsMenu = this.nextElementSibling;
    const isActive = optionsMenu.classList.contains('active');
    
    // Close all open menus first
    document.querySelectorAll('.quiz-options-menu.active').forEach(menu => {
      if (menu !== optionsMenu) {
        menu.classList.remove('active');
      }
    });
    
    // Toggle current menu
    if (isActive) {
      optionsMenu.classList.remove('active');
    } else {
      optionsMenu.classList.add('active');
    }
  });
  
  // Menu item: Play
  quizCard.querySelector('.play-quiz').addEventListener('click', function(event) {
    event.stopPropagation();
    const quizId = this.getAttribute('data-quiz-id');
    playQuiz(quizId);
  });
  
  // Menu item: Edit
  quizCard.querySelector('.edit-quiz').addEventListener('click', function(event) {
    event.stopPropagation();
    const quizId = this.getAttribute('data-quiz-id');
    editQuiz(quizId);
  });
  
  // Menu item: Duplicate
  quizCard.querySelector('.duplicate-quiz').addEventListener('click', function(event) {
    event.stopPropagation();
    const quizId = this.getAttribute('data-quiz-id');
    duplicateQuiz(quizId);
  });
  
  // Menu item: Delete
  quizCard.querySelector('.delete-quiz').addEventListener('click', function(event) {
    event.stopPropagation();
    const quizId = this.getAttribute('data-quiz-id');
    showDeleteQuizModal(quizId, quiz.title);
  });
  
  return cardCol;
}

// Open quiz details modal
async function openQuizDetails(quizId) {
  try {
    // In a real app, this would fetch quiz details from API
    // For demo, we'll use mock data
    const quiz = await fetchQuizDetails(quizId);
    
    if (!quiz) {
      throw new Error('Quiz not found');
    }
    
    // Store current quiz ID
    currentQuizId = quizId;
    
    // Update modal content
    document.getElementById('detailsQuizTitle').textContent = quiz.title;
    document.getElementById('detailsCategory').textContent = quiz.category ? quiz.category.charAt(0).toUpperCase() + quiz.category.slice(1) : 'General';
    document.getElementById('detailsDifficulty').textContent = quiz.difficulty ? quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1) : 'Medium';
    document.getElementById('detailsPublic').textContent = quiz.isPublic ? 'Public' : 'Private';
    document.getElementById('detailsDescription').textContent = quiz.description || 'No description provided.';
    document.getElementById('detailsQuestions').textContent = quiz.questions ? quiz.questions.length : 0;
    document.getElementById('detailsPlays').textContent = quiz.playCount || 0;
    document.getElementById('detailsAvgScore').textContent = quiz.avgScore ? `${quiz.avgScore}%` : 'N/A';
    document.getElementById('detailsQuizCode').textContent = quiz.quizCode || 'N/A';
    document.getElementById('deleteQuizTitle').textContent = quiz.title;
    
    // Update questions list
    const questionsList = document.getElementById('detailsQuestionsList');
    questionsList.innerHTML = '';
    
    if (quiz.questions && quiz.questions.length > 0) {
      quiz.questions.forEach((question, index) => {
        const questionItem = document.createElement('div');
        questionItem.className = 'question-item';
        questionItem.innerHTML = `
          <div class="question-number">${index + 1}</div>
          <div class="question-text">${question.question}</div>
        `;
        questionsList.appendChild(questionItem);
      });
    } else {
      questionsList.innerHTML = `
        <div class="no-questions text-center py-3">
          <p class="text-muted">No questions added yet</p>
        </div>
      `;
    }
    
    // Show the modal
    const quizDetailsModal = new bootstrap.Modal(document.getElementById('quizDetailsModal'));
    quizDetailsModal.show();
  } catch (error) {
    console.error('Error opening quiz details:', error);
    showAlert('Error loading quiz details', 'danger');
  }
}

// Mock function to fetch quiz details - replace with real API call
async function fetchQuizDetails(quizId) {
  // This would be a real API call in production
  // For demo purposes, return mock data
  return {
    id: quizId,
    title: 'General Knowledge Quiz',
    description: 'Test your knowledge across various topics with this fun quiz.',
    category: 'general',
    difficulty: 'medium',
    isPublic: true,
    questions: [
      {
        question: 'What is the capital of France?',
        options: {
          A: 'London',
          B: 'Berlin',
          C: 'Paris',
          D: 'Madrid'
        },
        correctAnswer: 'C'
      },
      {
        question: 'Which planet is known as the Red Planet?',
        options: {
          A: 'Jupiter',
          B: 'Mars',
          C: 'Venus',
          D: 'Saturn'
        },
        correctAnswer: 'B'
      },
      {
        question: 'Who painted the Mona Lisa?',
        options: {
          A: 'Vincent van Gogh',
          B: 'Pablo Picasso',
          C: 'Leonardo da Vinci',
          D: 'Michelangelo'
        },
        correctAnswer: 'C'
      },
      {
        question: 'What is the chemical symbol for gold?',
        options: {
          A: 'Gd',
          B: 'Au',
          C: 'Ag',
          D: 'Fe'
        },
        correctAnswer: 'B'
      },
      {
        question: 'Which of these is NOT a programming language?',
        options: {
          A: 'Java',
          B: 'Python',
          C: 'Cobra',
          D: 'HTML'
        },
        correctAnswer: 'D'
      }
    ],
    quizCode: 'ABC123',
    playCount: 125,
    avgScore: 72,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// Play a quiz
function playQuiz(quizId) {
  window.location.href = `multiplayer.html?code=${fetchQuizDetails(quizId).quizCode}&host=true`;
}

// Edit a quiz
function editQuiz(quizId) {
  window.location.href = `quiz-editor.html?id=${quizId}`;
}

// Duplicate a quiz
async function duplicateQuiz(quizId) {
  try {
    const token = localStorage.getItem('token');
    
    // In a real app, this would be an API call
    // For demo purposes, just show success message
    
    showAlert('Quiz duplicated successfully', 'success');
    
    // Reload quizzes after a short delay
    setTimeout(() => {
      loadMyQuizzes();
    }, 1000);
  } catch (error) {
    console.error('Error duplicating quiz:', error);
    showAlert('Error duplicating quiz. Please try again.', 'danger');
  }
}

// Delete a quiz
async function deleteQuiz(quizId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/quiz/${quizId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete quiz');
    }
    
    showAlert('Quiz deleted successfully', 'success');
    
    // Close the modal
    const deleteQuizModal = bootstrap.Modal.getInstance(document.getElementById('deleteQuizModal'));
    const quizDetailsModal = bootstrap.Modal.getInstance(document.getElementById('quizDetailsModal'));
    
    if (deleteQuizModal) {
      deleteQuizModal.hide();
    }
    
    if (quizDetailsModal) {
      quizDetailsModal.hide();
    }
    
    // Reload quizzes after a short delay
    setTimeout(() => {
      loadMyQuizzes();
    }, 1000);
  } catch (error) {
    console.error('Error deleting quiz:', error);
    showAlert('Error deleting quiz. Please try again.', 'danger');
  }
}

// Show delete quiz confirmation modal
function showDeleteQuizModal(quizId, quizTitle) {
  // Set current quiz ID
  currentQuizId = quizId;
  
  // Update modal title
  document.getElementById('deleteQuizTitle').textContent = quizTitle;
  
  // Show the modal
  const deleteQuizModal = new bootstrap.Modal(document.getElementById('deleteQuizModal'));
  deleteQuizModal.show();
}

// Show create quiz modal
function showCreateQuizModal() {
  // Reset form
  document.getElementById('createQuizForm').reset();
  
  // Reset creation method selection
  creationMethodCards.forEach(card => {
    card.classList.remove('active');
  });
  creationMethodCards[0].classList.add('active');
  creationMethodInput.value = 'manual';
  
  // Show the modal
  const createQuizModal = new bootstrap.Modal(document.getElementById('createQuizModal'));
  createQuizModal.show();
}

// Event Listeners
document.addEventListener('click', function(event) {
  // Close all quiz option menus when clicking outside
  if (!event.target.closest('.quiz-options')) {
    document.querySelectorAll('.quiz-options-menu.active').forEach(menu => {
      menu.classList.remove('active');
    });
  }
});

if (createQuizBtn) {
  createQuizBtn.addEventListener('click', showCreateQuizModal);
}

if (searchQuizzesInput) {
  searchQuizzesInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase().trim();
    const quizCards = document.querySelectorAll('.quiz-card');
    
    quizCards.forEach(card => {
      const title = card.querySelector('.quiz-title').textContent.toLowerCase();
      const description = card.querySelector('.quiz-description').textContent.toLowerCase();
      const category = card.querySelector('.quiz-category').textContent.toLowerCase();
      
      if (title.includes(searchTerm) || description.includes(searchTerm) || category.includes(searchTerm)) {
        card.closest('.col').style.display = '';
      } else {
        card.closest('.col').style.display = 'none';
      }
    });
  });
}

// Creation method selection
creationMethodCards.forEach(card => {
  card.addEventListener('click', function() {
    // Remove active class from all cards
    creationMethodCards.forEach(c => c.classList.remove('active'));
    
    // Add active class to clicked card
    this.classList.add('active');
    
    // Update hidden input value
    creationMethodInput.value = this.getAttribute('data-method');
  });
});

if (continueBtn) {
  continueBtn.addEventListener('click', function() {
    const quizTitle = document.getElementById('quizTitle').value.trim();
    const quizDescription = document.getElementById('quizDescription').value.trim();
    const quizCategory = document.getElementById('quizCategory').value;
    const quizDifficulty = document.getElementById('quizDifficulty').value;
    const quizIsPublic = document.getElementById('quizIsPublic').checked;
    const creationMethod = document.getElementById('creationMethod').value;
    
    if (!quizTitle) {
      showAlert('Please enter a quiz title', 'warning');
      return;
    }
    
    // In a real app, this would create a new quiz and redirect to the editor
    // For demo purposes, redirect to a mock editor
    
    const createQuizModal = bootstrap.Modal.getInstance(document.getElementById('createQuizModal'));
    createQuizModal.hide();
    
    if (creationMethod === 'ai') {
      window.location.href = 'ai_quiz.html';
    } else {
      window.location.href = 'quiz-editor.html?new=true';
    }
  });
}

if (copyDetailsCodeBtn) {
  copyDetailsCodeBtn.addEventListener('click', function() {
    const quizCode = document.getElementById('detailsQuizCode').textContent;
    
    navigator.clipboard.writeText(quizCode).then(function() {
      showAlert('Quiz code copied to clipboard!', 'success');
    }, function() {
      showAlert('Failed to copy quiz code', 'danger');
    });
  });
}

if (playQuizBtn) {
  playQuizBtn.addEventListener('click', function() {
    if (currentQuizId) {
      playQuiz(currentQuizId);
    }
  });
}

if (editQuizBtn) {
  editQuizBtn.addEventListener('click', function() {
    if (currentQuizId) {
      editQuiz(currentQuizId);
    }
  });
}

if (duplicateQuizBtn) {
  duplicateQuizBtn.addEventListener('click', function() {
    if (currentQuizId) {
      duplicateQuiz(currentQuizId);
    }
  });
}

if (exportQuizBtn) {
  exportQuizBtn.addEventListener('click', function() {
    showAlert('Export feature coming soon!', 'info');
  });
}

if (deleteQuizBtn) {
  deleteQuizBtn.addEventListener('click', function() {
    if (currentQuizId) {
      const quizTitle = document.getElementById('detailsQuizTitle').textContent;
      showDeleteQuizModal(currentQuizId, quizTitle);
    }
  });
}

if (confirmDeleteBtn) {
  confirmDeleteBtn.addEventListener('click', function() {
    if (currentQuizId) {
      deleteQuiz(currentQuizId);
    }
  });
}

// Show alert message
function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
  alertDiv.style.zIndex = '9999';
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  document.body.appendChild(alertDiv);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

// Create New Quiz Button
const createQuizBtn = document.getElementById('createQuizBtn');
if (createQuizBtn) {
  createQuizBtn.addEventListener('click', function() {
    window.location.href = 'create-questions.html';
  });
} 
