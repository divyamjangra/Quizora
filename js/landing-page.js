/**
 * Landing page functionality
 * Handles theme toggle, enter code button, and join quiz functionality
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI elements
    initThemeToggle();
    initEnterCodeButton();
    initJoinQuizButton();
});

/**
 * Initialize theme toggle functionality
 */
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        themeToggle.textContent = document.body.classList.contains('light-theme') ? '🌙' : '🌞';
    });
}

/**
 * Initialize enter code button
 */
function initEnterCodeButton() {
    const enterCodeBtn = document.getElementById('enterCodeBtn');
    if (!enterCodeBtn) return;
    
    enterCodeBtn.addEventListener('click', () => {
        const enterCodeModal = new bootstrap.Modal(document.getElementById('enterCodeModal'));
        enterCodeModal.show();
    });
}

/**
 * Initialize join quiz button
 */
function initJoinQuizButton() {
    const joinQuizBtn = document.getElementById('joinQuizBtn');
    if (!joinQuizBtn) return;
    
    joinQuizBtn.addEventListener('click', () => {
        const quizCode = document.getElementById('quizCode').value.trim().toUpperCase();
        
        if (!quizCode || quizCode.length !== 6) {
            alert('Please enter a valid quiz code');
            return;
        }
        
        window.location.href = `join-quiz.html?code=${quizCode}`;
    });
} 
