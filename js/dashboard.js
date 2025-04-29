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

   // Add event listeners
  modal.querySelector('.share-modal-close').addEventListener('click', () => {
    modal.classList.add('closing');
    setTimeout(() => {
      modal.remove();
    }, 300);
  });
  
  modal.querySelector('.copy-link-btn').addEventListener('click', () => {
    const linkInput = modal.querySelector('.share-link-input');
    linkInput.select();
    document.execCommand('copy');
    
    const copyBtn = modal.querySelector('.copy-link-btn');
    copyBtn.textContent = 'Copied!';
    copyBtn.classList.add('copied');
    
    setTimeout(() => {
      copyBtn.textContent = 'Copy';
      copyBtn.classList.remove('copied');
    }, 2000);
    
    showNotification('Link copied to clipboard!', 'success');
  });
  
  // Handle share options
  modal.querySelectorAll('.share-option').forEach(option => {
    option.addEventListener('click', () => {
      const platform = option.getAttribute('data-platform');
      shareToSocialMedia(platform, quizTitle);
    });
  });
  
  // Show modal with animation
  setTimeout(() => {
    modal.classList.add('visible');
  }, 10);
}

/**
 * Share to social media platform
 */
function shareToSocialMedia(platform, quizTitle) {
  const shareUrl = `https://quizora.com/q/ABC123`;
  const shareText = `Check out my quiz "${quizTitle}" on Quizora!`;
  
  let url;
  
  switch(platform) {
    case 'facebook':
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
      break;
    case 'twitter':
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
      break;
    case 'whatsapp':
      url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
      break;
    case 'email':
      url = `mailto:?subject=${encodeURIComponent('Check out my Quizora quiz!')}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
      break;
  }
  
  if (url) {
    window.open(url, '_blank');
  }
}

/**
 * Subscribe to notifications for upcoming features
 */
function subscribeToNotifications(email) {
  // Here you would typically send the email to your server
  // For now, we'll just show a success message
  
  const notifyInput = document.querySelector('.notify-input');
  const successMessage = document.createElement('div');
  successMessage.className = 'notify-success';
  successMessage.innerHTML = `
    <i class="bi bi-check-circle-fill"></i>
    <span>Thanks! We'll notify you when we launch.</span>
  `;
  
  notifyInput.innerHTML = '';
  notifyInput.appendChild(successMessage);
  
  showNotification('You\'ve been added to our notification list!', 'success');
}

/**
 * Show error message for input
 */
function showError(inputElement, message) {
  // Remove any existing error
  const existingError = inputElement.parentElement.querySelector('.input-error');
  if (existingError) {
    existingError.remove();
  }
  
  // Create error message
  const errorElement = document.createElement('div');
  errorElement.className = 'input-error';
  errorElement.textContent = message;
  
  // Add error styling to input
  inputElement.classList.add('input-error-highlight');
  
  // Insert error after input
  inputElement.parentElement.appendChild(errorElement);
  
  // Remove error after 3 seconds
  setTimeout(() => {
    if (errorElement.parentElement) {
      errorElement.remove();
      inputElement.classList.remove('input-error-highlight');
    }
  }, 3000);
}

/**
 * Update friend count in the footer
 */
function updateFriendCount() {
  const friendCountElement = document.querySelector('.section-footer .text-muted');
  if (friendCountElement) {
    const currentText = friendCountElement.textContent;
    const match = currentText.match(/(\d+)\/(\d+)/);
    
    if (match) {
      const online = parseInt(match[1]);
      const total = parseInt(match[2]) - 1; // Decrease total by 1
      friendCountElement.textContent = `${online}/${total} friends online`;
    }
  }
}

/**
 * Show notification toast
 */
function showNotification(message, type = 'info') {
  // Create notification container if it doesn't exist
  let notificationContainer = document.querySelector('.notification-container');
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.className = 'notification-container';
    document.body.appendChild(notificationContainer);
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  
  // Set icon based on type
  let icon;
  switch(type) {
    case 'success':
      icon = 'bi-check-circle-fill';
      break;
    case 'error':
      icon = 'bi-exclamation-circle-fill';
      break;
    case 'warning':
      icon = 'bi-exclamation-triangle-fill';
      break;
    default:
      icon = 'bi-info-circle-fill';
  }
  
  notification.innerHTML = `
    <div class="notification-icon">
      <i class="bi ${icon}"></i>
    </div>
    <div class="notification-content">
      ${message}
    </div>
    <button class="notification-close">
      <i class="bi bi-x"></i>
    </button>
  `;
  
  // Add to container
  notificationContainer.appendChild(notification);
  
  // Show notification with animation
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Add close button handler
  notification.querySelector('.notification-close').addEventListener('click', () => {
    closeNotification(notification);
  });
  
  // Auto close after 5 seconds
  setTimeout(() => {
    closeNotification(notification);
  }, 5000);
}

/**
 * Close notification with animation
 */
function closeNotification(notification) {
  notification.classList.add('closing');
  
  setTimeout(() => {
    if (notification.parentElement) {
      notification.parentElement.removeChild(notification);
      
      // Remove container if empty
      const container = document.querySelector('.notification-container');
      if (container && container.children.length === 0) {
        container.remove();
      }
    }
  }, 300);
}

/**
 * Validate email format
 */
function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
} 
