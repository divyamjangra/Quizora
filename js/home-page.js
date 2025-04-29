/**
 * Home page functionality
 * Handles join quiz modal and quiz buttons
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI elements
    initJoinQuizModal();
    initJoinQuizButton();
    initPlayQuizButtons();
});

/**
 * Initialize the join quiz modal buttons
 */
function initJoinQuizModal() {
    document.querySelectorAll('.join-quiz-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const joinQuizModal = new bootstrap.Modal(document.getElementById('joinQuizModal'));
            joinQuizModal.show();
        });
    });
}

/**
 * Initialize the join quiz button functionality
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
        
        window.location.href = `multiplayer.html?code=${quizCode}`;
    });
}

/**
 * Initialize play quiz buttons
 */
function initPlayQuizButtons() {
    document.querySelectorAll('.play-quiz-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const quizCode = this.getAttribute('data-quiz-code');
            window.location.href = `multiplayer.html?code=${quizCode}`;
        });
    });
} 
