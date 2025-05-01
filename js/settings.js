// DOM Elements
const profileForm = document.getElementById('profileForm');
const accountForm = document.getElementById('accountForm');
const appearanceForm = document.getElementById('appearanceForm');
const notificationForm = document.getElementById('notificationForm');
const privacyForm = document.getElementById('privacyForm');
const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
const photoUpload = document.getElementById('photoUpload');
const confirmDeleteCheckbox = document.getElementById('confirmDelete');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');

// Check if user is logged in
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = 'auth.html';
      return;
    }

    // Fetch user profile and settings
    await fetchUserProfile();
    await fetchUserSettings();
  } catch (error) {
    console.error('Error initializing settings page:', error);
    showAlert('Error loading settings. Please try again later.', 'danger');
  }
});

// Fetch user profile data
async function fetchUserProfile() {
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
    
    // Set form values
    document.getElementById('displayName').value = userData.displayName || '';
    document.getElementById('email').value = userData.email || '';
    document.getElementById('age').value = userData.age || '';
    document.getElementById('bio').value = userData.bio || '';
    
    // Set profile image if available
    if (userData.avatarUrl) {
      document.querySelector('.profile-preview').src = userData.avatarUrl;
    }
    
    // Update username in top bar
    document.querySelector('.username').textContent = userData.displayName || 'My Profile';
  } catch (error) {
    console.error('Error fetching user profile:', error);
    showAlert('Error loading profile data', 'danger');
  }
}

// Fetch user settings
async function fetchUserSettings() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/user/settings', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }

    const settings = await response.json();
    
    // Set theme
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    themeRadios.forEach(radio => {
      if (radio.value === settings.theme) {
        radio.checked = true;
      }
    });
    
    // Set language
    document.getElementById('language').value = settings.language || 'en';
    
    // Set notification settings
    document.getElementById('emailNotifications').checked = settings.notifications !== false;
    document.getElementById('pushNotifications').checked = settings.notifications !== false;
    document.getElementById('soundEffects').checked = settings.soundEffects !== false;
    
    // Set privacy settings
    document.getElementById('privacyMode').checked = settings.privacyMode === true;
    document.getElementById('showActivity').checked = settings.showActivity !== false;
    document.getElementById('allowFriendRequests').checked = settings.allowFriendRequests !== false;
    
    // Apply theme immediately
    applyTheme(settings.theme || 'light');
  } catch (error) {
    console.error('Error fetching user settings:', error);
    showAlert('Error loading settings data', 'danger');
  }
}

// Apply theme to page
function applyTheme(theme) {
  const body = document.body;
  
  if (theme === 'dark') {
    body.classList.add('dark-theme');
  } else if (theme === 'light') {
    body.classList.remove('dark-theme');
  } else if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      body.classList.add('dark-theme');
    } else {
      body.classList.remove('dark-theme');
    }
  }
}

// Upload photo handler
uploadPhotoBtn.addEventListener('click', () => {
  photoUpload.click();
});

// Preview uploaded photo
photoUpload.addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      showAlert('File size exceeds 2MB limit', 'warning');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
      document.querySelector('.profile-preview').src = e.target.result;
    }
    reader.readAsDataURL(file);
  }
});

// Profile form submit handler
profileForm.addEventListener('submit', async function(event) {
  event.preventDefault();
  
  try {
    const displayName = document.getElementById('displayName').value;
    const age = document.getElementById('age').value;
    const bio = document.getElementById('bio').value;
    
    // Validate inputs
    if (!displayName) {
      showAlert('Display name is required', 'warning');
      return;
    }
    
    const token = localStorage.getItem('token');
    
    // Upload photo if selected
    let avatarUrl = null;
    if (photoUpload.files.length > 0) {
      const formData = new FormData();
      formData.append('avatar', photoUpload.files[0]);
      
      const uploadResponse = await fetch('/api/user/upload-avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json();
        avatarUrl = uploadResult.avatarUrl;
      } else {
        throw new Error('Failed to upload profile picture');
      }
    }
    
    // Update profile
    const updateData = {
      displayName,
      age: age ? parseInt(age) : null,
      bio
    };
    
    if (avatarUrl) {
      updateData.avatarUrl = avatarUrl;
    }
    
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
    
    showAlert('Profile updated successfully', 'success');
    
    // Update username in top bar
    document.querySelector('.username').textContent = displayName;
  } catch (error) {
    console.error('Error updating profile:', error);
    showAlert('Error updating profile. Please try again.', 'danger');
  }
});

// Account form submit handler (password change)
accountForm.addEventListener('submit', async function(event) {
  event.preventDefault();
  
  try {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      showAlert('All password fields are required', 'warning');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      showAlert('New passwords do not match', 'warning');
      return;
    }
    
    if (newPassword.length < 6) {
      showAlert('Password must be at least 6 characters', 'warning');
      return;
    }
    
    const token = localStorage.getItem('token');
    const response = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to change password');
    }
    
    // Clear form
    accountForm.reset();
    showAlert('Password changed successfully', 'success');
  } catch (error) {
    console.error('Error changing password:', error);
    showAlert(error.message || 'Error changing password. Please try again.', 'danger');
  }
});

// Appearance form submit handler
appearanceForm.addEventListener('submit', async function(event) {
  event.preventDefault();
  
  try {
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    let selectedTheme = 'light';
    themeRadios.forEach(radio => {
      if (radio.checked) {
        selectedTheme = radio.value;
      }
    });
    
    const language = document.getElementById('language').value;
    
    const token = localStorage.getItem('token');
    const response = await fetch('/api/user/settings', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        theme: selectedTheme,
        language
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save appearance settings');
    }
    
    // Apply theme immediately
    applyTheme(selectedTheme);
    
    showAlert('Appearance settings saved', 'success');
  } catch (error) {
    console.error('Error saving appearance settings:', error);
    showAlert('Error saving appearance settings. Please try again.', 'danger');
  }
});

// Notification form submit handler
notificationForm.addEventListener('submit', async function(event) {
  event.preventDefault();
  
  try {
    const emailNotifications = document.getElementById('emailNotifications').checked;
    const pushNotifications = document.getElementById('pushNotifications').checked;
    const soundEffects = document.getElementById('soundEffects').checked;
    
    // Both email and push are false, disable notifications completely
    const notifications = emailNotifications || pushNotifications;
    
    const token = localStorage.getItem('token');
    const response = await fetch('/api/user/settings', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        notifications,
        soundEffects
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save notification settings');
    }
    
    showAlert('Notification settings saved', 'success');
  } catch (error) {
    console.error('Error saving notification settings:', error);
    showAlert('Error saving notification settings. Please try again.', 'danger');
  }
});

// Privacy form submit handler
privacyForm.addEventListener('submit', async function(event) {
  event.preventDefault();
  
  try {
    const privacyMode = document.getElementById('privacyMode').checked;
    const showActivity = document.getElementById('showActivity').checked;
    const allowFriendRequests = document.getElementById('allowFriendRequests').checked;
    
    const token = localStorage.getItem('token');
    const response = await fetch('/api/user/settings', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        privacyMode,
        showActivity,
        allowFriendRequests
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save privacy settings');
    }
    
    showAlert('Privacy settings saved', 'success');
  } catch (error) {
    console.error('Error saving privacy settings:', error);
    showAlert('Error saving privacy settings. Please try again.', 'danger');
  }
});

// Enable/disable delete account button based on checkbox
confirmDeleteCheckbox.addEventListener('change', function() {
  deleteAccountBtn.disabled = !this.checked;
});

// Delete account handler
deleteAccountBtn.addEventListener('click', async function() {
  try {
    const password = document.getElementById('deleteConfirmPassword').value;
    
    if (!password) {
      showAlert('Please enter your password to confirm account deletion', 'warning');
      return;
    }
    
    const token = localStorage.getItem('token');
    const response = await fetch('/api/auth/delete-account', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete account');
    }
    
    // Clear local storage and redirect to landing page
    localStorage.removeItem('token');
    window.location.href = 'Landing Page.html';
  } catch (error) {
    console.error('Error deleting account:', error);
    showAlert(error.message || 'Error deleting account. Please try again.', 'danger');
  }
});

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
