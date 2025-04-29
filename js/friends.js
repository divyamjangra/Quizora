// DOM Elements
const friendsList = document.getElementById('friendsList');
const addFriendForm = document.getElementById('addFriendForm');
const friendRequests = document.getElementById('friendRequests');
const suggestedFriends = document.getElementById('suggestedFriends');
const activityList = document.getElementById('activityList');

// Friend profile modal elements
const friendProfileModal = document.getElementById('friendProfileModal');
const friendProfileImage = document.getElementById('friendProfileImage');
const friendProfileName = document.getElementById('friendProfileName');
const friendProfileRank = document.getElementById('friendProfileRank');
const friendQuizCount = document.getElementById('friendQuizCount');
const friendAvgScore = document.getElementById('friendAvgScore');
const friendCompletedCount = document.getElementById('friendCompletedCount');
const friendRecentQuizzes = document.getElementById('friendRecentQuizzes');
const challengeFriendBtn = document.getElementById('challengeFriendBtn');
const removeFriendBtn = document.getElementById('removeFriendBtn');

// Current friend being viewed in modal
let currentFriendId = null;

// Check if user is logged in
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = 'auth.html';
      return;
    }

    // Load user data and friends
    await loadUserData();
    await loadFriends();
    loadFriendRequests();
    loadSuggestedFriends();
    loadFriendActivity();
  } catch (error) {
    console.error('Error initializing friends page:', error);
    showAlert('Error loading friends data. Please try again later.', 'danger');
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

// Load friends list
async function loadFriends() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/user/friends', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch friends');
    }

    const friends = await response.json();
    
    // Clear loading spinner
    friendsList.innerHTML = '';
    
    if (friends.length === 0) {
      friendsList.innerHTML = `
        <div class="no-friends text-center py-4">
          <i class="fas fa-user-friends fa-3x text-muted mb-3"></i>
          <p>You don't have any friends yet</p>
          <button class="btn btn-primary mt-2" data-bs-toggle="modal" data-bs-target="#addFriendModal">
            <i class="fas fa-user-plus me-1"></i> Add Friends
          </button>
        </div>
      `;
      return;
    }
    
    // Display friends
    friends.forEach(friend => {
      const friendElement = document.createElement('div');
      friendElement.className = 'friend-item';
      friendElement.innerHTML = `
        <img src="${friend.avatarUrl || 'images/profile.png'}" alt="${friend.displayName}" class="friend-avatar">
        <div class="friend-info">
          <h6>${friend.displayName}</h6>
          <p class="text-muted small">${friend.email}</p>
        </div>
        <div class="friend-actions">
          <button class="btn btn-sm btn-outline-primary challenge-btn" data-friend-id="${friend.uid}">
            <i class="fas fa-gamepad"></i>
          </button>
          <button class="btn btn-sm btn-outline-secondary view-profile-btn" data-friend-id="${friend.uid}">
            <i class="fas fa-user"></i>
          </button>
        </div>
      `;
      friendsList.appendChild(friendElement);
      
      // Add event listener to view profile button
      const viewProfileBtn = friendElement.querySelector('.view-profile-btn');
      viewProfileBtn.addEventListener('click', () => openFriendProfile(friend.uid));
      
      // Add event listener to challenge button
      const challengeBtn = friendElement.querySelector('.challenge-btn');
      challengeBtn.addEventListener('click', () => challengeFriend(friend.uid, friend.displayName));
    });
  } catch (error) {
    console.error('Error loading friends:', error);
    friendsList.innerHTML = `
      <div class="alert alert-danger" role="alert">
        Could not load friends. Please try again later.
      </div>
    `;
  }
}

// Load friend requests
function loadFriendRequests() {
  // For now using placeholder/mock data
  // In a real implementation, this would fetch from the API
  
  // Simulate no requests for now
  friendRequests.innerHTML = `
    <div class="no-requests text-center py-3">
      <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
      <p>No pending friend requests</p>
    </div>
  `;
  
   // Example of how it would look with requests:
  /*
  friendRequests.innerHTML = `
    <div class="friend-request">
      <img src="images/profile4.png" alt="User" class="friend-avatar">
      <div class="friend-info">
        <h6>Michael Brown</h6>
        <p class="text-muted small">Quiz Enthusiast</p>
      </div>
      <div class="request-actions">
        <button class="btn btn-sm btn-success accept-btn" data-friend-id="123">
          <i class="fas fa-check"></i>
        </button>
        <button class="btn btn-sm btn-danger reject-btn" data-friend-id="123">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  `;
  */
}

// Load suggested friends
function loadSuggestedFriends() {
  // For now using placeholder data
  // In a real implementation, this would fetch from the API
  suggestedFriends.innerHTML = `
    <div class="friend-suggestion">
      <img src="images/profile1.png" alt="User" class="friend-avatar">
      <div class="friend-info">
        <h6>Jane Cooper</h6>
        <p class="text-muted small">Quiz Expert • 15 quizzes</p>
      </div>
      <button class="btn btn-sm btn-outline-primary suggest-add-btn" data-email="jane@example.com">Add</button>
    </div>
    <div class="friend-suggestion">
      <img src="images/profile2.png" alt="User" class="friend-avatar">
      <div class="friend-info">
        <h6>Robert Johnson</h6>
        <p class="text-muted small">Quiz Master • 42 quizzes</p>
      </div>
      <button class="btn btn-sm btn-outline-primary suggest-add-btn" data-email="robert@example.com">Add</button>
    </div>
    <div class="friend-suggestion">
      <img src="images/profile3.png" alt="User" class="friend-avatar">
      <div class="friend-info">
        <h6>Emily Davis</h6>
        <p class="text-muted small">Quiz Enthusiast • 7 quizzes</p>
      </div>
      <button class="btn btn-sm btn-outline-primary suggest-add-btn" data-email="emily@example.com">Add</button>
    </div>
  `;
  
  // Add event listeners to suggestion buttons
  const addButtons = document.querySelectorAll('.suggest-add-btn');
  addButtons.forEach(button => {
    button.addEventListener('click', function() {
      const email = this.getAttribute('data-email');
      sendFriendRequest(email);
    });
  });
}

// Load friend activity
function loadFriendActivity() {
  // For now using placeholder data
  // In a real implementation, this would fetch from the API
  activityList.innerHTML = `
    <li class="activity-item">
      <div class="activity-icon bg-success">
        <i class="fas fa-trophy"></i>
      </div>
      <div class="activity-content">
        <p class="activity-text"><strong>Emma Watson</strong> scored 95% on <strong>Science Quiz</strong></p>
        <p class="activity-time">2 hours ago</p>
      </div>
    </li>
    <li class="activity-item">
      <div class="activity-icon bg-primary">
        <i class="fas fa-pencil-alt"></i>
      </div>
      <div class="activity-content">
        <p class="activity-text"><strong>John Doe</strong> created a new quiz: <strong>World History</strong></p>
        <p class="activity-time">Yesterday</p>
      </div>
    </li>
    <li class="activity-item">
      <div class="activity-icon bg-warning">
        <i class="fas fa-user-plus"></i>
      </div>
      <div class="activity-content">
        <p class="activity-text"><strong>Alex Smith</strong> and <strong>Sarah Johnson</strong> are now friends</p>
        <p class="activity-time">2 days ago</p>
      </div>
    </li>
  `;
}

// Open friend profile modal
async function openFriendProfile(friendId) {
  try {
    currentFriendId = friendId;
    
    // In a real implementation, fetch friend profile from API
    // For now, using mock data
    const friendData = {
      uid: friendId,
      displayName: 'Jane Smith',
      avatarUrl: 'images/profile1.png',
      rank: 'Quiz Expert',
      quizCount: 15,
      avgScore: 87,
      completedCount: 32,
      recentQuizzes: [
        { id: '1', title: 'Science Quiz', score: '95%', date: '2 days ago' },
        { id: '2', title: 'History Trivia', score: '78%', date: '1 week ago' },
        { id: '3', title: 'Math Challenge', score: '82%', date: '2 weeks ago' }
      ]
    };
    
    // Update modal with friend data
    friendProfileImage.src = friendData.avatarUrl || 'images/profile.png';
    friendProfileName.textContent = friendData.displayName;
    friendProfileRank.textContent = friendData.rank;
    friendQuizCount.textContent = friendData.quizCount;
    friendAvgScore.textContent = `${friendData.avgScore}%`;
    friendCompletedCount.textContent = friendData.completedCount;
    
    // Update recent quizzes
    if (friendData.recentQuizzes && friendData.recentQuizzes.length > 0) {
      let quizzesHTML = '';
      friendData.recentQuizzes.forEach(quiz => {
        quizzesHTML += `
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <span>${quiz.title}</span>
            <div>
              <span class="badge bg-success">${quiz.score}</span>
              <small class="text-muted ms-2">${quiz.date}</small>
            </div>
          </li>
        `;
      });
      friendRecentQuizzes.innerHTML = quizzesHTML;
    } else {
      friendRecentQuizzes.innerHTML = `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <span>No quizzes found</span>
        </li>
      `;
    }
    
    // Show the modal
    const modal = new bootstrap.Modal(friendProfileModal);
    modal.show();
  } catch (error) {
    console.error('Error opening friend profile:', error);
    showAlert('Error loading friend profile', 'danger');
  }
}

// Challenge friend to a quiz
function challengeFriend(friendId, friendName) {
  // For now, just show a notification
  showAlert(`Challenge sent to ${friendName || 'your friend'}!`, 'success');
  
  // In a real implementation, this would:
  // 1. Create a multiplayer quiz session
  // 2. Generate a unique code
  // 3. Send an invitation to the friend
  // 4. Redirect to the waiting room
}

// Send friend request
async function sendFriendRequest(email) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/user/friends', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ friendEmail: email })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send friend request');
    }
    
    showAlert('Friend request sent successfully!', 'success');
    
    // Close modal if open
    const modal = bootstrap.Modal.getInstance(document.getElementById('addFriendModal'));
    if (modal) {
      modal.hide();
    }
  } catch (error) {
    console.error('Error sending friend request:', error);
    showAlert(error.message || 'Error sending friend request', 'danger');
  }
}

// Remove friend
async function removeFriend(friendId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/user/friends/${friendId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove friend');
    }
    
    showAlert('Friend removed successfully', 'success');
    
    // Close the modal
    const modal = bootstrap.Modal.getInstance(friendProfileModal);
    if (modal) {
      modal.hide();
    }
    
    // Reload friends list
    await loadFriends();
  } catch (error) {
    console.error('Error removing friend:', error);
    showAlert('Error removing friend. Please try again.', 'danger');
  }
}
// Event Listeners
if (addFriendForm) {
  addFriendForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const friendEmail = document.getElementById('friendEmail').value;
    
    if (!friendEmail) {
      showAlert('Please enter your friend\'s email', 'warning');
      return;
    }
    
    sendFriendRequest(friendEmail);
    this.reset();
  });
}

if (challengeFriendBtn) {
  challengeFriendBtn.addEventListener('click', function() {
    if (currentFriendId) {
      const modal = bootstrap.Modal.getInstance(friendProfileModal);
      if (modal) {
        modal.hide();
      }
      challengeFriend(currentFriendId, friendProfileName.textContent);
    }
  });
}

if (removeFriendBtn) {
  removeFriendBtn.addEventListener('click', function() {
    if (currentFriendId) {
      if (confirm('Are you sure you want to remove this friend?')) {
        removeFriend(currentFriendId);
      }
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
