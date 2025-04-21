// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips if using Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Add animation to cards on scroll
    const animateOnScroll = () => {
        const cards = document.querySelectorAll('.category-card, .quiz-card');
        cards.forEach(card => {
            const cardPosition = card.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.2;
            
            if (cardPosition < screenPosition) {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }
        });
    };

    // Initialize card animation
    const cards = document.querySelectorAll('.category-card, .quiz-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    // Listen for scroll events
    window.addEventListener('scroll', animateOnScroll);
    // Trigger once on load
    animateOnScroll();

    // Simulate user stats loading
    setTimeout(() => {
        const statNumbers = document.querySelectorAll('.stat-card h3');
        statNumbers.forEach(number => {
            const target = parseInt(number.textContent);
            let count = 0;
            const duration = 1500; // ms
            const interval = duration / target;
            
            const counter = setInterval(() => {
                count++;
                number.textContent = count;
                if (count >= target) {
                    clearInterval(counter);
                }
            }, interval);
        });
    }, 500);

    // Add event listeners to category buttons
    const categoryButtons = document.querySelectorAll('.category-card .btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const category = this.closest('.category-card').querySelector('h3').textContent;
            console.log(`Browsing ${category} quizzes`);
            // Add actual navigation or filtering logic here
        });
    });

    // Add event listeners to quiz start buttons
    const quizStartButtons = document.querySelectorAll('.quiz-card .btn');
    quizStartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const quizTitle = this.closest('.quiz-card').querySelector('h4').textContent;
            console.log(`Starting quiz: ${quizTitle}`);
            
            // Show a loading animation
            this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
            this.disabled = true;
            
            // Simulate loading and then redirect (would be replaced with actual navigation)
            setTimeout(() => {
                // Replace with actual quiz page navigation
                alert(`Quiz "${quizTitle}" would start now!`);
                this.innerHTML = 'Start Quiz';
                this.disabled = false;
            }, 1500);
        });
    });

    // Daily challenge button
    const challengeButton = document.querySelector('.daily-challenge .btn');
    if (challengeButton) {
        challengeButton.addEventListener('click', function() {
            this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
            this.disabled = true;
            
            // Simulate loading challenge
            setTimeout(() => {
                // Replace with actual challenge navigation
                alert('Daily challenge is ready to start!');
                this.innerHTML = 'Start Challenge';
                this.disabled = false;
            }, 1500);
        });
    }

    // Simulate notifications (just for demo)
    const notificationDropdown = document.getElementById('notificationsDropdown');
    if (notificationDropdown) {
        setTimeout(() => {
            // Add notification badge
            const badge = document.createElement('span');
            badge.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger';
            badge.innerHTML = '3';
            badge.style.fontSize = '0.6rem';
            notificationDropdown.appendChild(badge);
        }, 3000);
    }
}); 