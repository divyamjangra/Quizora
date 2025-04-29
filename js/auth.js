/**
 * QUIZORA AUTHENTICATION PAGE SCRIPTS
 * 
 * This file contains all the JavaScript functionality for the combined login/signup page:
 * - Form validation (with detailed error messages)
 * - Password strength checking
 * - Toggling between login and signup forms
 * - Show/hide password functionality
 * - CAPTCHA validation
 * - Form submission handlers
 */

// Wait for the DOM to be fully loaded before executing scripts
document.addEventListener('DOMContentLoaded', function() {
    
    // ====== ELEMENT REFERENCES ======
    // Toggle buttons
    const loginToggle = document.getElementById('loginToggle');
    const signupToggle = document.getElementById('signupToggle');
    const switchToSignupMobile = document.getElementById('switchToSignupMobile');
    const switchToLoginMobile = document.getElementById('switchToLoginMobile');
    
    // Forms
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const emailLoginForm = document.getElementById('emailLoginForm');
    const emailSignupForm = document.getElementById('emailSignupForm');
    
    // Password fields and toggles
    const passwordFields = document.querySelectorAll('input[type="password"]');
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    // Input fields for validation
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const signupName = document.getElementById('signupName');
    const signupEmail = document.getElementById('signupEmail');
    const signupPassword = document.getElementById('signupPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const agreeTerms = document.getElementById('agreeTerms');
    
    // New personal details fields
    const signupAge = document.getElementById('signupAge');
    const signupGender = document.getElementById('signupGender');
    const signupEducation = document.getElementById('signupEducation');
    
    // Password requirement indicators
    const lengthCheck = document.getElementById('length-check');
    const uppercaseCheck = document.getElementById('uppercase-check');
    const lowercaseCheck = document.getElementById('lowercase-check');
    const numberCheck = document.getElementById('number-check');
    const specialCheck = document.getElementById('special-check');
    
    // Validation message elements
    const loginEmailValidation = document.getElementById('loginEmailValidation');
    const loginPasswordValidation = document.getElementById('loginPasswordValidation');
    const signupNameValidation = document.getElementById('signupNameValidation');
    const signupEmailValidation = document.getElementById('signupEmailValidation');
    const signupPasswordValidation = document.getElementById('signupPasswordValidation');
    const confirmPasswordValidation = document.getElementById('confirmPasswordValidation');
    const termsValidation = document.getElementById('termsValidation');
    const loginCaptchaValidation = document.getElementById('loginCaptchaValidation');
    const signupCaptchaValidation = document.getElementById('signupCaptchaValidation');
    
    // New validation message elements for personal details
    const signupAgeValidation = document.getElementById('signupAgeValidation');
    const signupGenderValidation = document.getElementById('signupGenderValidation');
    const signupEducationValidation = document.getElementById('signupEducationValidation');
    
    // ====== FORM TOGGLE FUNCTIONALITY ======
    /**
     * Switch between login and signup forms
     * @param {string} formToShow - The form to display ('login' or 'signup')
     */
    function toggleForms(formToShow) {
        if (formToShow === 'login') {
            loginForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
            loginToggle.classList.add('active');
            signupToggle.classList.remove('active');
            
            // Reset signup form
            emailSignupForm.reset();
            resetValidationMessages();
            resetPasswordChecks();
        } else {
            loginForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
            loginToggle.classList.remove('active');
            signupToggle.classList.add('active');
            
            // Reset login form
            emailLoginForm.reset();
            resetValidationMessages();
        }
    }
    
    // Event listeners for form toggle
    loginToggle.addEventListener('click', () => toggleForms('login'));
    signupToggle.addEventListener('click', () => toggleForms('signup'));
    switchToSignupMobile.addEventListener('click', (e) => {
        e.preventDefault();
        toggleForms('signup');
    });
    switchToLoginMobile.addEventListener('click', (e) => {
        e.preventDefault();
        toggleForms('login');
    });
    
    // ====== PASSWORD VISIBILITY TOGGLE ======
    // Add event listeners to all password toggle buttons
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            // Find the closest input field to this toggle button
            const passwordInput = this.closest('.input-with-icon').querySelector('input');
            
            // Toggle password visibility
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                this.innerHTML = '<i class="far fa-eye-slash"></i>';
            } else {
                passwordInput.type = 'password';
                this.innerHTML = '<i class="far fa-eye"></i>';
            }
        });
    });
    
    // ====== VALIDATION FUNCTIONS ======
    /**
     * Resets all validation message elements to empty
     */
    function resetValidationMessages() {
        const validationElements = document.querySelectorAll('.validation-message');
        validationElements.forEach(el => el.textContent = '');
    }
    
    /**
     * Reset password requirement indicators to unchecked state
     */
    function resetPasswordChecks() {
        lengthCheck.innerHTML = '<i class="fas fa-times-circle"></i> At least 8 characters';
        uppercaseCheck.innerHTML = '<i class="fas fa-times-circle"></i> One uppercase letter';
        lowercaseCheck.innerHTML = '<i class="fas fa-times-circle"></i> One lowercase letter';
        numberCheck.innerHTML = '<i class="fas fa-times-circle"></i> One number';
        specialCheck.innerHTML = '<i class="fas fa-times-circle"></i> One special character';
    }
    
    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} - True if valid
     */
    function isValidEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }
    
    /**
     * Check if a CAPTCHA is completed
     * @returns {boolean} - True if CAPTCHA is completed
     */
    function isCaptchaCompleted() {
        return grecaptcha && grecaptcha.getResponse().length !== 0;
    }
    
    /**
     * Check password strength and update indicators
     * @param {string} password - Password to check
     * @returns {boolean} - True if password meets all requirements
     */
    function checkPasswordStrength(password) {
        // Define regex patterns for different password criteria
        const lengthPattern = /.{8,}/;
        const uppercasePattern = /[A-Z]/;
        const lowercasePattern = /[a-z]/;
        const numberPattern = /[0-9]/;
        const specialPattern = /[!@#$%^&*(),.?":{}|<>]/;
        
        // Check and update each requirement indicator
        if (lengthPattern.test(password)) {
            lengthCheck.innerHTML = '<i class="fas fa-check-circle"></i> At least 8 characters';
        } else {
            lengthCheck.innerHTML = '<i class="fas fa-times-circle"></i> At least 8 characters';
        }
        
        if (uppercasePattern.test(password)) {
            uppercaseCheck.innerHTML = '<i class="fas fa-check-circle"></i> One uppercase letter';
        } else {
            uppercaseCheck.innerHTML = '<i class="fas fa-times-circle"></i> One uppercase letter';
        }
        
        if (lowercasePattern.test(password)) {
            lowercaseCheck.innerHTML = '<i class="fas fa-check-circle"></i> One lowercase letter';
        } else {
            lowercaseCheck.innerHTML = '<i class="fas fa-times-circle"></i> One lowercase letter';
        }
        
        if (numberPattern.test(password)) {
            numberCheck.innerHTML = '<i class="fas fa-check-circle"></i> One number';
        } else {
            numberCheck.innerHTML = '<i class="fas fa-times-circle"></i> One number';
        }
        
        if (specialPattern.test(password)) {
            specialCheck.innerHTML = '<i class="fas fa-check-circle"></i> One special character';
        } else {
            specialCheck.innerHTML = '<i class="fas fa-times-circle"></i> One special character';
        }
        
        // Return true if all patterns match
        return lengthPattern.test(password) && 
               uppercasePattern.test(password) && 
               lowercasePattern.test(password) && 
               numberPattern.test(password) && 
               specialPattern.test(password);
    }
    
    // Live password strength checking
    if (signupPassword) {
        signupPassword.addEventListener('input', function() {
            checkPasswordStrength(this.value);
        });
    }
    
    // ====== INPUT VALIDATION ======
    // Add validation on blur for all input fields
    
    // Login email validation
    if (loginEmail) {
        loginEmail.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                loginEmailValidation.textContent = 'Email is required';
            } else if (!isValidEmail(this.value)) {
                loginEmailValidation.textContent = 'Please enter a valid email address';
            } else {
                loginEmailValidation.textContent = '';
            }
        });
    }
    
    // Login password validation
    if (loginPassword) {
        loginPassword.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                loginPasswordValidation.textContent = 'Password is required';
            } else if (this.value.length < 8) {
                loginPasswordValidation.textContent = 'Password must be at least 8 characters';
            } else {
                loginPasswordValidation.textContent = '';
            }
        });
    }
    
    // Signup name validation
    if (signupName) {
        signupName.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                signupNameValidation.textContent = 'Full name is required';
            } else if (this.value.length < 2) {
                signupNameValidation.textContent = 'Name must be at least 2 characters';
            } else if (!/^[A-Za-z ]+$/.test(this.value)) {
                signupNameValidation.textContent = 'Name can only contain letters and spaces';
            } else {
                signupNameValidation.textContent = '';
            }
        });
    }
    
    // Signup age validation
    if (signupAge) {
        signupAge.addEventListener('blur', function() {
            if (this.value === '') {
                signupAgeValidation.textContent = 'Age is required';
            } else if (isNaN(this.value) || this.value < 8 || this.value > 120) {
                signupAgeValidation.textContent = 'Please enter a valid age (8-120)';
            } else {
                signupAgeValidation.textContent = '';
            }
        });
    }
    
    // Signup gender validation
    if (signupGender) {
        signupGender.addEventListener('change', function() {
            if (this.value === '') {
                signupGenderValidation.textContent = 'Please select your gender';
            } else {
                signupGenderValidation.textContent = '';
            }
        });
    }
    
    // Signup education validation
    if (signupEducation) {
        signupEducation.addEventListener('change', function() {
            if (this.value === '') {
                signupEducationValidation.textContent = 'Please select your education level';
            } else {
                signupEducationValidation.textContent = '';
            }
        });
    }
    
    // Signup email validation
    if (signupEmail) {
        signupEmail.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                signupEmailValidation.textContent = 'Email is required';
            } else if (!isValidEmail(this.value)) {
                signupEmailValidation.textContent = 'Please enter a valid email address';
            } else {
                signupEmailValidation.textContent = '';
            }
        });
    }
    
    // Signup password validation
    if (signupPassword) {
        signupPassword.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                signupPasswordValidation.textContent = 'Password is required';
            } else if (!checkPasswordStrength(this.value)) {
                signupPasswordValidation.textContent = 'Password does not meet all requirements';
            } else {
                signupPasswordValidation.textContent = '';
            }
        });
    }
    
    // Confirm password validation
    if (confirmPassword && signupPassword) {
        confirmPassword.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                confirmPasswordValidation.textContent = 'Please confirm your password';
            } else if (this.value !== signupPassword.value) {
                confirmPasswordValidation.textContent = 'Passwords do not match';
            } else {
                confirmPasswordValidation.textContent = '';
            }
        });
        
        // Also check confirmation when primary password changes
        signupPassword.addEventListener('input', function() {
            if (confirmPassword.value !== '' && confirmPassword.value !== this.value) {
                confirmPasswordValidation.textContent = 'Passwords do not match';
            } else if (confirmPassword.value !== '') {
                confirmPasswordValidation.textContent = '';
            }
        });
    }
    
    // Terms checkbox validation
    if (agreeTerms) {
        agreeTerms.addEventListener('change', function() {
            if (!this.checked) {
                termsValidation.textContent = 'You must agree to the terms';
            } else {
                termsValidation.textContent = '';
            }
        });
    }
    
    // ====== FORM SUBMISSION HANDLERS ======
    // Login form submission
    if (emailLoginForm) {
        emailLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Reset validation messages
            resetValidationMessages();
            
            // Validate all fields
            let isValid = true;
            
            if (loginEmail.value.trim() === '') {
                loginEmailValidation.textContent = 'Email is required';
                isValid = false;
            } else if (!isValidEmail(loginEmail.value)) {
                loginEmailValidation.textContent = 'Please enter a valid email address';
                isValid = false;
            }
            
            if (loginPassword.value.trim() === '') {
                loginPasswordValidation.textContent = 'Password is required';
                isValid = false;
            }
            
            // Check CAPTCHA
            if (!isCaptchaCompleted()) {
                loginCaptchaValidation.textContent = 'Please complete the CAPTCHA';
                isValid = false;
            }
            
            if (isValid) {
                // Form data is valid, proceed with login
                console.log('Login form submitted successfully');
                
                // Collect form data
                const formData = {
                    email: loginEmail.value.trim(),
                    password: loginPassword.value,
                    rememberMe: document.getElementById('rememberMe').checked
                };
                
                // TODO: Send form data to your backend for authentication
                // For demonstration, we'll just show a success message
                alert('Login successful! Redirecting to dashboard...');
                
                // In a real implementation, you would redirect to the dashboard
                // window.location.href = 'dashboard.html';
            }
        });
    }
    
    // Signup form submission
    if (emailSignupForm) {
        emailSignupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Reset validation messages
            resetValidationMessages();
            
            // Validate all fields
            let isValid = true;
            
            if (signupName.value.trim() === '') {
                signupNameValidation.textContent = 'Full name is required';
                isValid = false;
            } else if (signupName.value.length < 2) {
                signupNameValidation.textContent = 'Name must be at least 2 characters';
                isValid = false;
            } else if (!/^[A-Za-z ]+$/.test(signupName.value)) {
                signupNameValidation.textContent = 'Name can only contain letters and spaces';
                isValid = false;
            }
            
            // Validate age
            if (signupAge.value === '') {
                signupAgeValidation.textContent = 'Age is required';
                isValid = false;
            } else if (isNaN(signupAge.value) || signupAge.value < 8 || signupAge.value > 120) {
                signupAgeValidation.textContent = 'Please enter a valid age (8-120)';
                isValid = false;
            }
            
            // Validate gender
            if (signupGender.value === '' || signupGender.value === null) {
                signupGenderValidation.textContent = 'Please select your gender';
                isValid = false;
            }
            
            // Validate education
            if (signupEducation.value === '' || signupEducation.value === null) {
                signupEducationValidation.textContent = 'Please select your education level';
                isValid = false;
            }
            
            if (signupEmail.value.trim() === '') {
                signupEmailValidation.textContent = 'Email is required';
                isValid = false;
            } else if (!isValidEmail(signupEmail.value)) {
                signupEmailValidation.textContent = 'Please enter a valid email address';
                isValid = false;
            }
            
            if (signupPassword.value.trim() === '') {
                signupPasswordValidation.textContent = 'Password is required';
                isValid = false;
            } else if (!checkPasswordStrength(signupPassword.value)) {
                signupPasswordValidation.textContent = 'Password does not meet all requirements';
                isValid = false;
            }
            
            if (confirmPassword.value.trim() === '') {
                confirmPasswordValidation.textContent = 'Please confirm your password';
                isValid = false;
            } else if (confirmPassword.value !== signupPassword.value) {
                confirmPasswordValidation.textContent = 'Passwords do not match';
                isValid = false;
            }
            
            if (!agreeTerms.checked) {
                termsValidation.textContent = 'You must agree to the terms';
                isValid = false;
            }
            
            // Check CAPTCHA
            if (!isCaptchaCompleted()) {
                signupCaptchaValidation.textContent = 'Please complete the CAPTCHA';
                isValid = false;
            }
            
            if (isValid) {
                // Form data is valid, proceed with signup
                console.log('Signup form submitted successfully');
                
                // Collect form data
                const formData = {
                    name: signupName.value.trim(),
                    age: signupAge.value,
                    gender: signupGender.value,
                    education: signupEducation.value,
                    email: signupEmail.value.trim(),
                    password: signupPassword.value
                };
                
                console.log('User registration data:', formData);
                
                // TODO: Send form data to your backend for user creation
                // For demonstration, we'll just show a success message
                alert('Account created successfully! Please check your email to verify your account.');
                
                // Redirect to login form after successful signup
                toggleForms('login');
            }
        });
    }
    
    // ====== SOCIAL AUTH HANDLERS ======
    // Google Sign-in
    const googleButtons = document.querySelectorAll('.google-btn');
    googleButtons.forEach(button => {
        button.addEventListener('click', function() {
            // In a real implementation, you would call your Firebase or Google OAuth method
            console.log('Google sign-in clicked');
            alert('Google authentication would happen here.');
            
            // Example code for Firebase Google Auth (commented out)
            /*
            firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())
                .then((result) => {
                    // Handle successful authentication
                    window.location.href = 'dashboard.html';
                }).catch((error) => {
                    // Handle errors
                    console.error('Google auth error:', error);
                    alert('Authentication failed: ' + error.message);
                });
            */
        });
    });
    
    // Microsoft Sign-in
    const microsoftButtons = document.querySelectorAll('.microsoft-btn');
    microsoftButtons.forEach(button => {
        button.addEventListener('click', function() {
            // In a real implementation, you would call your Microsoft OAuth method
            console.log('Microsoft sign-in clicked');
            alert('Microsoft authentication would happen here.');
        });
    });
    
    // ====== SECURITY INFORMATION ======
    // Show security information modal on page load
    setTimeout(() => {
        // Only show this modal occasionally or for new users
        // For demonstration, we'll show it with a random chance
        if (Math.random() > 0.7) { // 30% chance to show the modal
            const securityModal = new bootstrap.Modal(document.getElementById('securityModal'));
            securityModal.show();
        }
    }, 3000); // Show after 3 seconds
    
    // ====== INITIAL SETUP ======
    // Reset forms and validation messages on page load
    resetValidationMessages();
    resetPasswordChecks();
});

/**
 * This function is called by the reCAPTCHA API when it loads
 * It's required to be in the global scope
 */
function onRecaptchaLoad() {
    console.log('reCAPTCHA loaded');
}

/**
 * This function is called when the user successfully completes the CAPTCHA
 * It's required to be in the global scope
 */
function onRecaptchaSuccess() {
    // Clear any CAPTCHA validation messages
    const captchaValidations = document.querySelectorAll('[id$="CaptchaValidation"]');
    captchaValidations.forEach(el => el.textContent = '');
}

/**
 * This function is called when the CAPTCHA expires
 * It's required to be in the global scope
 */
function onRecaptchaExpired() {
    console.log('reCAPTCHA expired, please solve it again.');
} 
