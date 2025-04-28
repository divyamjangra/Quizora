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
