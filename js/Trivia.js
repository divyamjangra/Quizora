const fallbackQuestions = [
    {
        question: "What is the capital of France?",
        options: ["Moscow", "Paris", "Delhi", "London"],
        answer: "Paris",
        explanation: "Paris is the capital city of France.",
        type: "text",
        difficulty: "easy"
    },
    {
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        answer: "4",
        explanation: "2 + 2 equals 4.",
        type: "text",
        difficulty: "easy"
    },
    {
        question: "Identify the animal in the image.",
        options: ["Cat", "Dog", "Elephant", "Tiger"],
        answer: "Dog",
        explanation: "The image shows a dog.",
        type: "image",
        media: "trivia-images/dog-image.jpg",
        difficulty: "medium"
    },
    {
        question: "What is this famous landmark?",
        options: ["Eiffel Tower", "Statue of Liberty", "Taj Mahal", "Great Wall of China"],
        answer: "Eiffel Tower",
        explanation: "This is the Eiffel Tower, located in Paris, France.",
        type: "image",
        media: "trivia-images/eiffel-tower.jpg",
        difficulty: "easy"
    },
    {
        question: "Which planet is shown in this image?",
        options: ["Earth", "Mars", "Jupiter", "Saturn"],
        answer: "Saturn",
        explanation: "This is Saturn, recognizable by its distinctive ring system.",
        type: "image",
        media: "trivia-images/saturn.jpg",
        difficulty: "medium"
    },
    {
        question: "What is the largest planet in our solar system?",
        options: ["Earth", "Mars", "Jupiter", "Saturn"],
        answer: "Jupiter",
        explanation: "Jupiter is the largest planet in our solar system.",
        type: "image",
        media: "trivia-images/jupiter.jpg",
        difficulty: "medium"
    },
    {
        question: "Which animal is this?",
        options: ["Lion", "Tiger", "Leopard", "Cheetah"],
        answer: "Tiger",
        explanation: "This is a tiger, recognizable by its orange fur with black stripes.",
        type: "image",
        media: "trivia image/tiger.jpg",
        difficulty: "medium"
    }
];

// Motivational quotes based on performance
const quotes = {
    low: [
        "Every expert was once a beginner. Keep going!",
        "The only way to learn is by making mistakes. You're on the right path!",
        "Don't worry about your score - focus on what you've learned.",
        "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        "The more you practice, the better you'll become. Try again!"
    ],
    medium: [
        "Good effort! You're making progress.",
        "Well done! Practice makes perfect.",
        "You're halfway there! Keep pushing.",
        "You're showing great potential.",
        "Keep up the good work!"
    ],
    high: [
        "Excellent! You're mastering this topic.",
        "Outstanding performance! You're a natural.",
        "Impressive knowledge! Keep challenging yourself.",
        "Fantastic work! You should be proud of yourself.",
        "Brilliant! Your hard work is paying off."
    ]
};

// Sound elements
const correctSound = document.getElementById('correct-sound');
const wrongSound = document.getElementById('wrong-sound');
const timerSound = document.getElementById('timer-sound');
const completeSound = document.getElementById('complete-sound');

// Define global variables
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 60;
let timerInterval;
let userName = "";
let userSelectedOption = null;
let currentTheme = localStorage.getItem('quizora_theme') || 'light';

// Initialize when page loads
window.onload = function() {
    // Apply saved theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Update theme toggle button
    updateThemeToggleButton();
    
    // Event listeners
    document.getElementById('homeBtn').addEventListener('click', function() {
        window.location.href = 'home.html';
    });
    
    document.getElementById('theme-toggle-btn').addEventListener('click', toggleTheme);
    
    // Start the quiz
    fetchQuestions();
};

// Theme toggle function
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('quizora_theme', currentTheme);
    
    updateThemeToggleButton();
}

// Update theme toggle button icon
function updateThemeToggleButton() {
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (currentTheme === 'dark') {
        themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

// Fetch questions
function fetchQuestions() {
    questions = fallbackQuestions;
    initQuiz();
}

// Utility to shuffle answer options
function shuffleOptions(options) {
    const shuffled = [...options];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Initialize Quiz
function initQuiz() {
    // Ask for name with a nicer prompt
    const storedName = localStorage.getItem('quizora_player_name');
    if (storedName) {
        userName = storedName;
        startQuiz();
    } else {
        userName = prompt("Please enter your name:", "Player") || "Player";
        localStorage.setItem('quizora_player_name', userName);
        startQuiz();
    }
}

function startQuiz() {
    document.getElementById('totalQuestions').textContent = questions.length;
    resetQuiz();
    loadQuestion();
    updateSidebar();
}

// Reset quiz variables
function resetQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    timeLeft = 60;
}

// Load Question and Reset Timer
function loadQuestion() {
    clearInterval(timerInterval);
    timeLeft = 60;
    userSelectedOption = null;
    
    document.getElementById('currentQuestionNum').textContent = currentQuestionIndex + 1;
    
    // Reset timer UI
    const timerEl = document.getElementById('timer');
    const timerContainer = document.getElementById('timerContainer');
    timerEl.textContent = timeLeft;
    timerContainer.className = 'quiz-timer'; // Reset timer style
    
    // Get elements
    const questionEl = document.getElementById('question');
    const optionsEl = document.getElementById('options');
    const mediaContainer = document.getElementById('media-container');
    const explanationEl = document.getElementById('explanation');
    
    // Clear previous content
    mediaContainer.innerHTML = '';
    explanationEl.style.display = 'none';
    document.getElementById('explanation-text').textContent = '';
    optionsEl.innerHTML = '';
    
    // Load current question
    const currentQuestion = questions[currentQuestionIndex];
    questionEl.innerHTML = currentQuestion.question;
    
    // Display media if available
    if (currentQuestion.type === 'image' && currentQuestion.media) {
        // Show loading state
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'text-center mb-3';
        loadingDiv.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading image...</span></div><p class="mt-2">Loading image from: ' + currentQuestion.media + '</p>';
        mediaContainer.appendChild(loadingDiv);
        
        // Create image element
        const image = document.createElement('img');
        image.src = currentQuestion.media;
        image.alt = 'Question Image';
        image.className = 'img-fluid rounded question-image';
        
        // Add debug info to console
        console.log('Loading image from: ' + currentQuestion.media);
        
        // Handle image loading events
        image.onload = function() {
            console.log('Image loaded successfully: ' + currentQuestion.media);
            // Remove loading indicator when image loads
            mediaContainer.innerHTML = ''; // Clear container
            mediaContainer.appendChild(image);
            
            // Add image context message if not already in question
            if (!currentQuestion.question.includes('image')) {
                const imageContext = document.createElement('p');
                imageContext.className = 'text-muted mt-2';
                imageContext.textContent = 'Look at the image above to answer this question.';
                mediaContainer.appendChild(imageContext);
            }
        };
        
        image.onerror = function() {
            console.error('Failed to load image: ' + currentQuestion.media);
            // Handle image loading error
            mediaContainer.innerHTML = '';
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-warning';
            errorDiv.innerHTML = '<strong>Image could not be loaded</strong><p>Path: ' + currentQuestion.media + '</p>' +
                                '<p>Please check that the image exists in the "trivia image" folder.</p>';
            mediaContainer.appendChild(errorDiv);
        };
        
        // Start loading the image
        if (image.complete) {
            image.onload();
        }
    } else if (currentQuestion.type === 'video' && currentQuestion.media) {
        const videoWrapper = document.createElement('div');
        videoWrapper.className = 'video-wrapper';
        
        const video = document.createElement('video');
        video.src = currentQuestion.media;
        video.controls = true;
        video.autoplay = false;
        video.className = 'img-fluid rounded';
        videoWrapper.appendChild(video);
        mediaContainer.appendChild(videoWrapper);
        
        // Add video context message
        const videoContext = document.createElement('p');
        videoContext.className = 'text-muted mt-2';
        videoContext.textContent = 'Watch the video above to answer this question.';
        mediaContainer.appendChild(videoContext);
        
        // Add error handling for video
        video.onerror = function() {
            console.error('Failed to load video: ' + currentQuestion.media);
            mediaContainer.innerHTML = '';
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-warning';
            errorDiv.innerHTML = '<strong>Video could not be loaded</strong><p>Path: ' + currentQuestion.media + '</p>';
            mediaContainer.appendChild(errorDiv);
        };
    }
    
    // Create options with animation delay
    const shuffledOptions = shuffleOptions(currentQuestion.options);
    shuffledOptions.forEach((option, index) => {
        const optionButton = document.createElement('button');
        optionButton.className = 'option';
        optionButton.style.animationDelay = `${index * 0.1}s`;
        optionButton.innerHTML = `<span>${option}</span>`;
        optionButton.onclick = () => checkAnswer(optionButton, option);
        optionsEl.appendChild(optionButton);
    });
    
    // Update progress bar
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = `${((currentQuestionIndex + 1) / questions.length) * 100}%`;
    
    // Update rank
    updateRankDisplay();
    
    // Start timer
    startTimer();
}

function updateRankDisplay() {
    const rankDisplay = document.getElementById('rank-display');
    rankDisplay.textContent = `Rank: ${calculateRank(score)}`;
}

// Update sidebar stats
function updateSidebar() {
    document.getElementById('sidebar-score').textContent = score;
    document.getElementById('sidebar-rank').textContent = calculateRank(score);
    
    // Update quote based on performance
    updateMotivationalQuote();
}

// Update motivational quote based on performance
function updateMotivationalQuote() {
    const quoteEl = document.getElementById('motivational-quote');
    const percentage = questions.length > 0 ? (score / questions.length) * 100 : 0;
    
    let quoteCategory;
    if (percentage >= 70) {
        quoteCategory = 'high';
    } else if (percentage >= 40) {
        quoteCategory = 'medium';
    } else {
        quoteCategory = 'low';
    }
    
    const randomIndex = Math.floor(Math.random() * quotes[quoteCategory].length);
    quoteEl.textContent = quotes[quoteCategory][randomIndex];
}
