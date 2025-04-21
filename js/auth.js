// Firebase Configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get auth and database references
const auth = firebase.auth();
const db = firebase.firestore();

// DOM elements
const loginForm = document.getElementById('login-form').querySelector('form');
const signupForm = document.getElementById('signup-form').querySelector('form');
const loginTab = document.getElementById('login-tab');
const signupTab = document.getElementById('signup-tab');

// Login functionality
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Get user info
  const username = loginForm.username.value.trim();
  const password = loginForm.password.value.trim();
  const rememberMe = loginForm.remember.checked;
  
  // Set persistence based on "remember me" option
  const persistence = rememberMe 
    ? firebase.auth.Auth.Persistence.LOCAL 
    : firebase.auth.Auth.Persistence.SESSION;
  
  auth.setPersistence(persistence)
    .then(() => {
      // Sign in user with email and password
      return auth.signInWithEmailAndPassword(username, password);
    })
    .then((userCredential) => {
      // Signed in successfully
      const user = userCredential.user;
      console.log("User logged in:", user);
      
      // Clear form and show success message
      loginForm.reset();
      showMessage('login-form', 'Success! Redirecting...', 'success');
      
      // Redirect to dashboard or home page
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1500);
    })
    .catch((error) => {
      // Handle errors
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Login error:", errorCode, errorMessage);
      
      // Show appropriate error message to user
      let message = "Failed to login. Please check your credentials.";
      if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
        message = "Invalid username or password.";
      } else if (errorCode === 'auth/too-many-requests') {
        message = "Too many failed login attempts. Please try again later.";
      }
      
      showMessage('login-form', message, 'error');
    });
});

// Signup functionality
signupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Get user info
  const fullName = signupForm.fullname.value.trim();
  const email = signupForm.email.value.trim();
  const username = signupForm['new-username'].value.trim();
  const password = signupForm['new-password'].value.trim();
  const confirmPassword = signupForm['confirm-password'].value.trim();
  const termsAccepted = signupForm.terms.checked;
  
  // Validate form
  if (!termsAccepted) {
    showMessage('signup-form', 'You must accept the Terms of Service and Privacy Policy.', 'error');
    return;
  }
  
  if (password !== confirmPassword) {
    showMessage('signup-form', 'Passwords do not match.', 'error');
    return;
  }
  
  // Create user with email and password
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed up successfully
      const user = userCredential.user;
      
      // Store additional user data in Firestore
      return db.collection('users').doc(user.uid).set({
        fullName: fullName,
        username: username,
        email: email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      // Update profile
      return auth.currentUser.updateProfile({
        displayName: username
      });
    })
    .then(() => {
      // Account created successfully
      console.log("User created successfully");
      
      // Clear form and show success message
      signupForm.reset();
      showMessage('signup-form', 'Account created successfully! Redirecting...', 'success');
      
      // Redirect to dashboard or home page
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1500);
    })
    .catch((error) => {
      // Handle errors
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Signup error:", errorCode, errorMessage);
      
      // Show appropriate error message to user
      let message = "Failed to create account. Please try again.";
      if (errorCode === 'auth/email-already-in-use') {
        message = "Email is already in use. Please try a different email.";
      } else if (errorCode === 'auth/weak-password') {
        message = "Password is too weak. Please use a stronger password.";
      } else if (errorCode === 'auth/invalid-email') {
        message = "Invalid email address.";
      }
      
      showMessage('signup-form', message, 'error');
    });
});

// Function to show messages (error or success)
function showMessage(formId, message, type) {
  const formElement = document.getElementById(formId);
  
  // Check if message element already exists, remove it if it does
  const existingMessage = formElement.querySelector('.message');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  // Create new message element
  const messageElement = document.createElement('div');
  messageElement.className = `message ${type}`;
  messageElement.textContent = message;
  
  // Insert after form title (h1)
  const subtitle = formElement.querySelector('.subtitle');
  subtitle.parentNode.insertBefore(messageElement, subtitle.nextSibling);
  
  // Remove message after 5 seconds
  setTimeout(() => {
    messageElement.remove();
  }, 5000);
}

// Reset messages when switching tabs
loginTab.addEventListener('click', () => {
  const message = document.querySelector('#login-form .message');
  if (message) message.remove();
});

signupTab.addEventListener('click', () => {
  const message = document.querySelector('#signup-form .message');
  if (message) message.remove();
});

// Listen for auth state changes
auth.onAuthStateChanged(user => {
  if (user) {
    console.log('User is logged in:', user);
  } else {
    console.log('User is logged out');
  }
}); 