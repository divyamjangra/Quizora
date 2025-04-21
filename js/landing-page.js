// Quizora Landing Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS animations with improved settings
    AOS.init({
        duration: 1000,
        once: false,
        mirror: true,
        offset: 120,
        easing: 'ease-out-cubic',
        delay: 100
    });

    // Fix any animation classes that might be missing
    document.querySelectorAll('.animate__animated').forEach(el => {
        if (!el.classList.contains('animate__animated')) {
            el.classList.add('animate__animated');
        }
    });

    // Counter Animation with improved visual effect
    const counters = document.querySelectorAll('.counter');
    
    counters.forEach(counter => {
        counter.innerText = '0+';
        
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText.replace(/,/g, '').replace(/\+/g, '');
            const increment = target / 100;
            
            if (count < target) {
                counter.innerText = Math.ceil(count + increment).toLocaleString() + '+';
                setTimeout(updateCount, 30); // Faster animation
            } else {
                counter.innerText = target.toLocaleString() + '+';
                // Add a scale effect when counter reaches target
                counter.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    counter.style.transform = 'scale(1)';
                }, 300);
            }
        };
        
        // Start counting when in viewport with higher threshold
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCount();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        
        observer.observe(counter);
    });

    // Demo Section Question Rotation with improved transitions
    const demoQuestion = document.querySelector('.demo-question');
    if (demoQuestion) {
        const questions = [
            {
                question: 'What is the capital of France?',
                options: ['London', 'Berlin', 'Paris', 'Madrid'],
                correct: 2
            },
            {
                question: 'Which planet is known as the Red Planet?',
                options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
                correct: 1
            },
            {
                question: 'What is the chemical symbol for gold?',
                options: ['Go', 'Gd', 'Au', 'Ag'],
                correct: 2
            },
            {
                question: 'Who wrote "Romeo and Juliet"?',
                options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
                correct: 1
            }
        ];
        
        let currentQuestionIndex = 0;
        
        // Function to update the question with smoother animation
        function updateDemoQuestion() {
            const currentQuestion = questions[currentQuestionIndex];
            
            // Add fade out animation
            demoQuestion.classList.add('animate__fadeOut');
            
            setTimeout(() => {
                // Update question text
                document.querySelector('.question-text').textContent = currentQuestion.question;
                
                // Update options
                const optionElements = document.querySelectorAll('.option');
                optionElements.forEach((option, index) => {
                    option.textContent = currentQuestion.options[index];
                    option.classList.remove('correct', 'selected');
                    // Add staggered appear animations
                    option.style.animationDelay = `${index * 0.1}s`;
                    
                    if (index === currentQuestion.correct) {
                        option.classList.add('correct');
                    }
                });
                
                // Fade back in
                demoQuestion.classList.remove('animate__fadeOut');
                demoQuestion.classList.add('animate__fadeIn');
                
                // Move to next question
                currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
            }, 700); // Shorter transition time
        }
        
        // Initial update and then every 5 seconds
        updateDemoQuestion();
        setInterval(updateDemoQuestion, 5000);
        
        // Handle option selection in demo with improved visual feedback
        const optionElements = document.querySelectorAll('.option');
        optionElements.forEach(option => {
            option.addEventListener('click', function() {
                // Remove selected class from all options
                document.querySelectorAll('.option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // Add selected class to clicked option with pulse animation
                this.classList.add('selected', 'animate__animated', 'animate__pulse');
                
                // Remove pulse animation after it completes
                setTimeout(() => {
                    this.classList.remove('animate__animated', 'animate__pulse');
                }, 1000);
                
                // Show feedback if correct or incorrect
                if (this.classList.contains('correct')) {
                    this.style.boxShadow = '0 0 15px rgba(40, 167, 69, 0.7)';
                } else {
                    this.style.boxShadow = '0 0 15px rgba(220, 53, 69, 0.7)';
                }
                
                // Reset box shadow after a delay
                setTimeout(() => {
                    this.style.boxShadow = '';
                }, 1500);
            });
        });
    }

    // Newsletter Form Validation with improved feedback
    const newsletterForm = document.querySelector('.newsletter form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (email === '') {
                showFormMessage(emailInput, 'Please enter your email address', 'error');
                shakeElement(emailInput);
                return;
            }
            
            if (!isValidEmail(email)) {
                showFormMessage(emailInput, 'Please enter a valid email address', 'error');
                shakeElement(emailInput);
                return;
            }
            
            // Simulate subscription success
            showFormMessage(emailInput, 'Thank you for subscribing!', 'success');
            emailInput.value = '';
            
            // Visual success feedback
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.classList.add('btn-success');
            submitBtn.classList.remove('btn-outline-light');
            submitBtn.textContent = 'Subscribed!';
            
            // Reset button after delay
            setTimeout(() => {
                submitBtn.classList.remove('btn-success');
                submitBtn.classList.add('btn-outline-light');
                submitBtn.textContent = 'Subscribe';
            }, 3000);
        });
    }

    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    function showFormMessage(inputElement, message, type) {
        // Remove any existing message
        const existingMessage = inputElement.parentNode.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.classList.add('form-message', `message-${type}`, 'animate__animated', 'animate__fadeIn');
        messageElement.textContent = message;
        
        // Insert after input
        inputElement.parentNode.insertBefore(messageElement, inputElement.nextSibling);
        
        // Remove message after 3 seconds if it's a success message
        if (type === 'success') {
            setTimeout(() => {
                messageElement.classList.remove('animate__fadeIn');
                messageElement.classList.add('animate__fadeOut');
                setTimeout(() => {
                    messageElement.remove();
                }, 500);
            }, 3000);
        }
    }

    // Function to shake element for error feedback
    function shakeElement(element) {
        element.classList.add('animate__animated', 'animate__shakeX');
        setTimeout(() => {
            element.classList.remove('animate__animated', 'animate__shakeX');
        }, 1000);
    }

    // "Enter Code" button functionality with improved UX
    const enterCodeBtn = document.querySelector('.enter-code-btn');
    if (enterCodeBtn) {
        enterCodeBtn.addEventListener('click', function() {
            // Apply pulse animation on click
            this.classList.add('animate__animated', 'animate__pulse');
            setTimeout(() => {
                this.classList.remove('animate__animated', 'animate__pulse');
            }, 1000);
            
            const code = prompt('Please enter your quiz code:');
            if (code) {
                // Validate code (example validation)
                if (code.length < 5 || code.length > 10) {
                    alert('Invalid code format. Please try again.');
                } else {
                    // Show loading state
                    this.textContent = 'Loading...';
                    // Redirect to quiz page with code
                    setTimeout(() => {
                        window.location.href = `quiz.html?code=${encodeURIComponent(code)}`;
                    }, 500);
                }
            }
        });
    }

    // Add smooth scrolling for anchor links with enhanced behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href') !== '#') {
                e.preventDefault();
                
                // Add pulse animation on click
                this.classList.add('animate__animated', 'animate__pulse');
                setTimeout(() => {
                    this.classList.remove('animate__animated', 'animate__pulse');
                }, 1000);
                
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    // Highlight target section briefly
                    const originalBackground = target.style.background;
                    const originalTransition = target.style.transition;
                    
                    target.style.transition = 'background 1s ease';
                    
                    // Scroll to target with smooth behavior
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // Add hover effects to buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
            this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });
});

// Add CSS styles for message elements and animations
const style = document.createElement('style');
style.textContent = `
    .form-message {
        margin-top: 5px;
        font-size: 14px;
        animation-duration: 0.5s;
    }
    .message-error {
        color: #dc3545;
        padding: 5px;
        border-left: 3px solid #dc3545;
        background-color: rgba(220, 53, 69, 0.1);
    }
    .message-success {
        color: #28a745;
        padding: 5px;
        border-left: 3px solid #28a745;
        background-color: rgba(40, 167, 69, 0.1);
    }
    .light-theme .option {
        background-color: #e9ecef;
        color: #495057;
    }
    .light-theme .option.correct {
        background-color: #d4edda;
        color: #155724;
    }
    .light-theme .option.selected {
        background-color: #cce5ff;
        color: #004085;
    }
    .counter {
        transition: transform 0.3s ease;
    }
    .option {
        transition: all 0.3s ease, box-shadow 0.5s ease;
    }
`;
document.head.appendChild(style);
