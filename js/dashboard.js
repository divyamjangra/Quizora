/**
 * Quizora Dashboard JavaScript
 * Handles all interactive functionality for the dashboard components
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all components
  initDashboard();
  initQuizCards();
  initRankingSystem();
  initFriendSystem();
  initComingSoonFeatures();
  
  // Add ripple effect to all buttons
  document.querySelectorAll('.btn, .quiz-action-btn, .friend-action-btn, .request-action-btn').forEach(button => {
    button.addEventListener('mousedown', createRippleEffect);
  });
});

/**
 * Initialize dashboard components and animations
 */
function initDashboard() {
  // Animate stat cards with counting effect
  document.querySelectorAll('.stat-value').forEach(statValue => {
    const finalValue = parseInt(statValue.textContent);
    animateCounter(statValue, 0, finalValue, 1500);
  });
  
  // Set position numbers for ranking items
  document.querySelectorAll('.ranking-item').forEach((item, index) => {
    const position = item.querySelector('.ranking-position');
    position.textContent = `#${index + 1}`;
    
    // Add hover effect
    item.addEventListener('mouseenter', () => {
      item.classList.add('ranking-item-hover');
    });
    
    item.addEventListener('mouseleave', () => {
      item.classList.remove('ranking-item-hover');
    });
  });
}

/**
 * Initialize quiz card interactions
 */
function initQuizCards() {
  // Add hover effects to quiz cards
  document.querySelectorAll('.quiz-card, .create-quiz-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.classList.add('quiz-card-hover');
    });
    
    card.addEventListener('mouseleave', () => {
      card.classList.remove('quiz-card-hover');
    });
  });
  
  // Make create quiz card clickable
  const createQuizCard = document.querySelector('.create-quiz-card');
  if (createQuizCard) {
    createQuizCard.addEventListener('click', () => {
      window.location.href = 'create-questions.html';
    });
  }
  
  // Add click handlers for quiz action buttons
  document.querySelectorAll('.quiz-action-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      
      const action = btn.getAttribute('title');
      const quizCard = btn.closest('.quiz-card');
      const quizTitle = quizCard.querySelector('.quiz-title').textContent;
      
      switch(action) {
        case 'Edit Quiz':
          editQuiz(quizTitle);
          break;
        case 'Host Quiz':
          hostQuiz(quizTitle);
          break;
        case 'Share Quiz':
          shareQuiz(quizTitle);
          break;
      }
    });
  });
}

/**
 * Initialize ranking system interactions
 */
function initRankingSystem() {
  // Handle ranking filter dropdown
  const rankingFilterDropdown = document.getElementById('rankingFilterDropdown');
  if (rankingFilterDropdown) {
    document.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        rankingFilterDropdown.textContent = item.textContent;
        // Here you would typically fetch and update the rankings based on the selected filter
        showFilterChangeAnimation();
      });
    });
  }
  
  // Add tooltips to achievement badges
  document.querySelectorAll('.achievement-badge').forEach(badge => {
    const title = badge.getAttribute('data-title');
    
    badge.addEventListener('mouseenter', (e) => {
      showTooltip(e, title);
    });
    
    badge.addEventListener('mouseleave', () => {
      hideTooltip();
    });
  });
}

/**
 * Initialize friend system interactions
 */
function initFriendSystem() {
  // Handle friend request actions
  document.querySelectorAll('.request-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const request = btn.closest('.friend-request');
      const name = request.querySelector('.request-name').textContent;
      
      if (btn.classList.contains('accept')) {
        acceptFriendRequest(request, name);
      } else if (btn.classList.contains('decline')) {
        declineFriendRequest(request, name);
      }
    });
  });
  
  // Handle friend action buttons
  document.querySelectorAll('.friend-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const friendCard = btn.closest('.friend-card');
      const friendName = friendCard.querySelector('.friend-name').textContent;
      const action = btn.querySelector('i').classList.contains('bi-controller') ? 'challenge' : 'message';
      
      if (action === 'challenge') {
        challengeFriend(friendName);
      } else {
        messageFriend(friendName);
      }
    });
  });
}

/**
 * Initialize coming soon features
 */
function initComingSoonFeatures() {
  // Handle notify me button
  const notifyButton = document.querySelector('.notify-input button');
  const notifyInput = document.querySelector('.notify-input input');
  
  if (notifyButton && notifyInput) {
    notifyButton.addEventListener('click', () => {
      const email = notifyInput.value.trim();
      if (validateEmail(email)) {
        subscribeToNotifications(email);
      } else {
        showError(notifyInput, 'Please enter a valid email address');
      }
    });
  }
}

/**
 * Create ripple effect on button click
 */
function createRippleEffect(e) {
  const button = e.currentTarget;
  
  const circle = document.createElement('span');
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${e.clientX - button.getBoundingClientRect().left - diameter / 2}px`;
  circle.style.top = `${e.clientY - button.getBoundingClientRect().top - diameter / 2}px`;
  circle.classList.add('ripple');
  
  const ripple = button.querySelector('.ripple');
  if (ripple) {
    ripple.remove();
  }
  
  button.appendChild(circle);
  
  // Remove the ripple after animation completes
  setTimeout(() => {
    if (circle) {
      circle.remove();
    }
  }, 600);
}

/**
 * Animate counter from start to end value
 */
function animateCounter(element, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const value = Math.floor(progress * (end - start) + start);
    
    // Format the number with commas if it's large
    element.textContent = value.toLocaleString();
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  
  window.requestAnimationFrame(step);
}

/**
 * Show tooltip at mouse position
 */
function showTooltip(event, text) {
  let tooltip = document.getElementById('custom-tooltip');
  
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'custom-tooltip';
    document.body.appendChild(tooltip);
  }
  
  tooltip.textContent = text;
  tooltip.style.left = `${event.pageX + 10}px`;
  tooltip.style.top = `${event.pageY + 10}px`;
  tooltip.classList.add('visible');
}

/**
 * Hide tooltip
 */
function hideTooltip() {
  const tooltip = document.getElementById('custom-tooltip');
  if (tooltip) {
    tooltip.classList.remove('visible');
  }
}

/**
 * Show animation when filter changes
 */
function showFilterChangeAnimation() {
  const rankingList = document.querySelector('.ranking-list');
  if (rankingList) {
    rankingList.classList.add('filter-change');
    setTimeout(() => {
      rankingList.classList.remove('filter-change');
    }, 500);
  }
}

/**
 * Accept friend request
 */
function acceptFriendRequest(requestElement, friendName) {
  requestElement.classList.add('request-accepted');
  
  // Show success message
  showNotification(`You are now friends with ${friendName}!`, 'success');
  
  // Remove the request after animation
  setTimeout(() => {
    requestElement.style.height = '0';
    requestElement.style.margin = '0';
    requestElement.style.padding = '0';
    requestElement.style.opacity = '0';
    
    setTimeout(() => {
      requestElement.remove();
      updateFriendCount();
    }, 300);
  }, 1000);
}

/**
 * Decline friend request
 */
function declineFriendRequest(requestElement, friendName) {
  requestElement.classList.add('request-declined');
  
  // Show info message
  showNotification(`Friend request from ${friendName} declined`, 'info');
  
  // Remove the request after animation
  setTimeout(() => {
    requestElement.style.height = '0';
    requestElement.style.margin = '0';
    requestElement.style.padding = '0';
    requestElement.style.opacity = '0';
    
    setTimeout(() => {
      requestElement.remove();
    }, 300);
  }, 1000);
}

/**
 * Challenge a friend to a quiz
 */
function challengeFriend(friendName) {
  showNotification(`Challenge sent to ${friendName}!`, 'success');
  
  // Here you would typically open a modal to select a quiz for the challenge
  // For now, we'll just show a notification
}

/**
 * Open message interface with a friend
 */
function messageFriend(friendName) {
  showNotification(`Opening chat with ${friendName}...`, 'info');
  
  // Here you would typically open a chat interface
  // For now, we'll just show a notification
}

/**
 * Edit a quiz
 */
function editQuiz(quizTitle) {
  showNotification(`Opening editor for "${quizTitle}"...`, 'info');
  
  // Simulate loading and redirect
  setTimeout(() => {
    window.location.href = 'create-questions.html?edit=true&title=' + encodeURIComponent(quizTitle);
  }, 1000);
}

/**
 * Host a quiz
 */
function hostQuiz(quizTitle) {
  showNotification(`Preparing to host "${quizTitle}"...`, 'info');
  
  // Simulate loading and redirect
  setTimeout(() => {
    window.location.href = 'multiplayer.html?host=true&title=' + encodeURIComponent(quizTitle);
  }, 1000);
}

/**
 * Share a quiz
 */
function shareQuiz(quizTitle) {
  // Create a share modal
  const modal = document.createElement('div');
  modal.className = 'share-modal';
  modal.innerHTML = `
    <div class="share-modal-content">
      <div class="share-modal-header">
        <h5>Share "${quizTitle}"</h5>
        <button class="share-modal-close">&times;</button>
      </div>
      <div class="share-modal-body">
        <div class="share-link-container">
          <input type="text" value="https://quizora.com/q/ABC123" readonly class="share-link-input">
          <button class="copy-link-btn">Copy</button>
        </div>
        <div class="share-options">
          <button class="share-option" data-platform="facebook">
            <i class="bi bi-facebook"></i>
          </button>
          <button class="share-option" data-platform="twitter">
            <i class="bi bi-twitter"></i>
          </button>
          <button class="share-option" data-platform="whatsapp">
            <i class="bi bi-whatsapp"></i>
          </button>
          <button class="share-option" data-platform="email">
            <i class="bi bi-envelope"></i>
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
