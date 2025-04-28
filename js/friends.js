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
  
