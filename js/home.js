/**
 * Home page navigation functionality
 * Handles sidebar navigation and content display
 */

// Mapping of coming soon features to their specific messages
const teaserContent = {
    tournamentLink: {
        title: "Tournaments Coming Soon!",
        message: "Compete in live tournaments with players worldwide. Win exciting prizes and climb the global rankings!",
        icon: "fa-gamepad",
        estimatedRelease: "Next Month",
        features: ["Live competitions", "Real prizes", "Tournament brackets", "Spectator mode"]
    },
    achievementsLink: {
        title: "Achievements System Under Development",
        message: "Track your quiz mastery with our comprehensive achievement system. Earn badges, trophies, and special rewards!",
        icon: "fa-medal",
        estimatedRelease: "In 2 Weeks",
        features: ["500+ unique badges", "Skill progression tracking", "Special profile decorations", "Achievement leaderboards"]
    },
    classroomLink: {
        title: "Classroom Mode Coming Soon",
        message: "Perfect for teachers! Create educational quizzes, track student progress, and generate detailed performance reports.",
        icon: "fa-chalkboard-teacher",
        estimatedRelease: "Next Quarter",
        features: ["Student group management", "Assignment tracking", "Detailed analytics", "Educational templates"]
    },
    analyticsLink: {
        title: "Advanced Analytics Dashboard",
        message: "Gain deep insights into your quiz performance. Track progress, identify strengths and weaknesses, and improve your scores!",
        icon: "fa-chart-line",
        estimatedRelease: "In Development",
        features: ["Performance trends", "Comparative analysis", "Skill breakdown", "Custom reports"]
    },
    leaderboardsLink: {
        title: "Enhanced Leaderboard System",
        message: "Compete for the top spots across various categories. Daily, weekly, and monthly challenges with special rewards!",
        icon: "fa-list-ol",
        estimatedRelease: "Coming Next Month",
        features: ["Topic-specific rankings", "Time-based challenges", "Special competitions", "Tier progression"]
    },
    customizationLink: {
        title: "Advanced Quiz Customization",
        message: "Make your quizzes truly unique with advanced customization options. Themes, animations, custom branding and more!",
        icon: "fa-paint-brush",
        estimatedRelease: "In Final Testing",
        features: ["Custom themes", "Animation effects", "Brand integration", "Interactive elements"]
    }
};

// Array of random teaser messages for the sidebar
const sidebarTeaserMessages = [
    "Exciting tournaments with real prizes coming next month!",
    "New achievement system in development, track your quiz mastery!",
    "Classroom mode perfect for teachers coming soon!",
    "Advanced analytics dashboard under construction!",
    "Customizable quiz themes and designs on the way!",
    "Global leaderboards with daily and weekly challenges coming soon!",
    "Mobile app in development - quiz anywhere, anytime!"
];

// Quiz configuration data object
let quizConfig = {
    // Basic info
    title: '',
    description: '',
    category: '',
    numQuestions: 10,
    
    // Settings
    mode: 'multiplayer',
    participantLimit: 10,
    timePerQuestion: 20,
    chatDuration: 15,
    access: 'public',
    
    // Controls
    passwordProtection: false,
    password: '',
    requireApproval: false,
    enableAttentionDetection: true,
    enableAIModeration: true,
    showLeaderboard: true,
    allowRetakes: false,
    
    // Questions (will be filled later)
    questions: [],
    
    // Generated code
    quizCode: ''
};

// Question types and templates
const questionTemplates = {
    'multiple-choice': {
        type: 'multiple-choice',
        question: '',
        options: ['', '', '', ''],
        correctAnswer: null
    },
    'true-false': {
        type: 'true-false',
        question: '',
        correctAnswer: null
    },
    'short-answer': {
        type: 'short-answer',
        question: '',
        correctAnswer: '',
        acceptableAnswers: []
    },
    'matching': {
        type: 'matching',
        question: '',
        pairs: [
            { left: '', right: '' },
            { left: '', right: '' },
            { left: '', right: '' },
            { left: '', right: '' }
        ]
    },
    'fill-blank': {
        type: 'fill-blank',
        question: '',
        blanks: [{ blank: '', answer: '' }]
    },
    'ordering': {
        type: 'ordering',
        question: '',
        items: ['', '', '', ''],
        correctOrder: [0, 1, 2, 3]
    }
};

// Function to create a manual quiz (open the configuration modal)
function createManualQuiz() {
    // Reset the quiz configuration
    resetQuizConfig();
    
    // Show the configuration modal
    const createQuizModal = new bootstrap.Modal(document.getElementById('createQuizModal'));
    createQuizModal.show();
    
    // Set the first step as active
    setActiveStep(1);
    updateQuizSummary();
}

// Function to create an AI-assisted quiz (now shows Coming Soon popup)
function createAIQuiz() {
    // Load AI Quiz Manager script if not already loaded
    if (typeof showAIComingSoonPopup === 'function') {
        showAIComingSoonPopup();
    } else {
        // Load ai-quiz-manager.js if not loaded
        const script = document.createElement('script');
        script.src = 'js/ai-quiz-manager.js';
        script.onload = function() {
            showAIComingSoonPopup();
        };
        document.body.appendChild(script);
    }
}

// Initialize sidebar navigation
document.addEventListener('DOMContentLoaded', () => {
    initSidebarNavigation();
    
    // Set random teaser message
    setRandomTeaserMessage();
    
    // Initialize coming soon tooltips
    initComingSoonFeatures();
    
    // Initialize quiz creation functionality
    initQuizCreation();
    
    // Initialize theme toggle
    initThemeToggle();
    
    // Initialize enhanced quick actions
    initEnhancedQuickActions();
});

/**
 * Initialize enhanced quick actions interactions
 */
function initEnhancedQuickActions() {
    // Initialize Join Quiz functionality
    initJoinQuizAction();
    
    // Initialize AI Quiz functionality
    initAIQuizAction();
    
    // Initialize Challenge Friend functionality
    initChallengeFriendAction();
    
    // Handle the Create Quiz link in Quick Actions
    const createQuizLink = document.getElementById('createQuizLink');
    if (createQuizLink) {
        createQuizLink.addEventListener('click', function(e) {
            e.preventDefault();
            directQuizCreation();
        });
    }
    
    // Add common hover animations to action cards
    document.querySelectorAll('.action-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            const icon = card.querySelector('.action-icon');
            if (icon) icon.classList.add('pulse');
        });
        
        card.addEventListener('mouseleave', () => {
            const icon = card.querySelector('.action-icon');
            if (icon) icon.classList.remove('pulse');
        });
    });
}

/**
 * Initialize Join Quiz quick action
 */
function initJoinQuizAction() {
    const joinBtn = document.querySelector('.join-quiz-action .join-btn');
    const codeInput = document.querySelector('.join-quiz-action .quick-code-input');
    
    if (joinBtn && codeInput) {
        // Add enter key support
        codeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                joinBtn.click();
            }
        });
        
        // Handle join button click
        joinBtn.addEventListener('click', () => {
            const code = codeInput.value.trim().toUpperCase();
            
            if (code.length !== 6) {
                showQuickActionModal('error', 'Invalid Code', 'Please enter a valid 6-character quiz code.');
                return;
            }
            
            // Show loading state
            joinBtn.classList.add('btn-loading');
            
            // Simulate API call to join quiz
            setTimeout(() => {
                joinBtn.classList.remove('btn-loading');
                
                // Show success modal
                showQuickActionModal('success', 'Quiz Found!', 
                    `<p>Successfully found quiz with code <strong>${code}</strong>.</p>
                    <p class="mb-0">Quiz: <strong>Web Development Fundamentals</strong></p>
                    <p class="mb-0">Host: <strong>Alex Stevens</strong></p>
                    <p class="mb-0">Players: <strong>5</strong> currently waiting</p>`,
                    [
                        {
                            text: 'Join Now',
                            class: 'btn-success',
                            icon: 'fa-sign-in-alt',
                            callback: () => {
                                window.location.href = `multiplayer.html?code=${code}`;
                            }
                        },
                        {
                            text: 'Cancel',
                            class: 'btn-outline-secondary'
                        }
                    ]
                );
                
                // Clear the input
                codeInput.value = '';
            }, 1500);
        });
    }
}

/**
 * Initialize AI Quiz quick action
 */
function initAIQuizAction() {
    const generateBtn = document.querySelector('.ai-quiz-action .generate-btn');
    
    if (generateBtn) {
        generateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Load AI Quiz Manager script if not already loaded
            if (typeof showAIComingSoonPopup === 'function') {
                showAIComingSoonPopup();
            } else {
                // Load ai-quiz-manager.js if not loaded
                const script = document.createElement('script');
                script.src = 'js/ai-quiz-manager.js';
                script.onload = function() {
                    showAIComingSoonPopup();
                };
                document.body.appendChild(script);
            }
        });
    }
}

/**
 * Initialize Challenge Friend quick action
 */
function initChallengeFriendAction() {
    const challengeBtn = document.querySelector('.friend-challenge-controls .challenge-btn');
    const friendSelect = document.querySelector('.friend-challenge-controls .friend-select');
    
    if (challengeBtn && friendSelect) {
        challengeBtn.addEventListener('click', () => {
            const selectedFriend = friendSelect.value;
            const friendName = selectedFriend ? 
                friendSelect.options[friendSelect.selectedIndex].text : '';
            
            if (!selectedFriend) {
                showQuickActionModal('warning', 'Select a Friend', 'Please select a friend to challenge.');
                return;
            }
            
            // Show loading state
            challengeBtn.classList.add('btn-loading');
            
            // Simulate API call to challenge friend
            setTimeout(() => {
                challengeBtn.classList.remove('btn-loading');
                
                showQuickActionModal('success', 'Challenge Sent!', 
                    `<div class="text-center mb-3">
                        <div class="challenge-sent-animation">
                            <i class="fas fa-paper-plane challenge-icon"></i>
                            <div class="challenge-path"></div>
                            <i class="fas fa-user-circle friend-icon"></i>
                        </div>
                    </div>
                    <p>Your challenge has been sent to <strong>${friendName}</strong>!</p>
                    <p>They'll be notified immediately and can accept your challenge.</p>
                    <div class="challenge-options mt-3">
                        <p class="mb-2">While waiting, you can:</p>
                        <ul class="challenge-options-list">
                            <li>Prepare your quiz questions</li>
                            <li>Invite more friends to join</li>
                            <li>Setup custom game rules</li>
                        </ul>
                    </div>`,
                    [
                        {
                            text: 'View Challenge',
                            class: 'btn-primary',
                            icon: 'fa-eye',
                            callback: () => {
                                window.location.href = 'multiplayer.html?challenge=pending';
                            }
                        },
                        {
                            text: 'Close',
                            class: 'btn-outline-secondary'
                        }
                    ]
                );
                
                // Reset the select
                friendSelect.value = '';
            }, 1500);
        });
    }
}

/**
 * Show quick action modal with custom content
 */
function showQuickActionModal(type, title, content, buttons = [], closable = true) {
    // Remove any existing modal
    closeModal();
    
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.id = 'quickActionModal';
    modalContainer.className = 'quick-action-modal';
    
    // Set icon based on type
    let icon;
    let colorClass;
    switch (type) {
        case 'success':
            icon = 'fa-check-circle';
            colorClass = 'text-success';
            break;
        case 'warning':
            icon = 'fa-exclamation-triangle';
            colorClass = 'text-warning';
            break;
        case 'error':
            icon = 'fa-times-circle';
            colorClass = 'text-danger';
            break;
        case 'info':
        default:
            icon = 'fa-info-circle';
            colorClass = 'text-info';
            break;
    }
    
    // Create modal content
    modalContainer.innerHTML = `
        <div class="quick-action-modal-content">
            <div class="quick-action-modal-header">
                <h5 class="quick-action-modal-title">
                    <i class="fas ${icon} ${colorClass} me-2"></i> ${title}
                </h5>
                ${closable ? '<button class="quick-action-modal-close"><i class="fas fa-times"></i></button>' : ''}
            </div>
            <div class="quick-action-modal-body">
                ${content}
            </div>
            ${buttons.length > 0 ? '<div class="quick-action-modal-footer"></div>' : ''}
        </div>
    `;
    
    // Add buttons if provided
    if (buttons.length > 0) {
        const footer = modalContainer.querySelector('.quick-action-modal-footer');
        
        buttons.forEach(button => {
            const btn = document.createElement('button');
            btn.className = `btn ${button.class}`;
            
            btn.innerHTML = button.icon ? `<i class="fas ${button.icon} me-1"></i> ${button.text}` : button.text;
            
            if (button.callback) {
                btn.addEventListener('click', () => {
                    closeModal();
                    button.callback();
                });
            } else {
                btn.addEventListener('click', closeModal);
            }
            
            footer.appendChild(btn);
        });
    }
    
    // Add close button event
    if (closable) {
        const closeBtn = modalContainer.querySelector('.quick-action-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }
        
        // Close on click outside
        modalContainer.addEventListener('click', (e) => {
            if (e.target === modalContainer) {
                closeModal();
            }
        });
    }
    
    // Add to DOM
    document.body.appendChild(modalContainer);
    
    // Show modal with animation
    setTimeout(() => {
        modalContainer.classList.add('show');
    }, 10);
    
    return modalContainer;
}

/**
 * Close the quick action modal
 */
function closeModal() {
    const modal = document.getElementById('quickActionModal');
    
    if (modal) {
        modal.classList.remove('show');
        
        // Remove after animation completes
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
}

/**
 * Convert topic to a nice title
 */
function topicToTitle(topic) {
    if (!topic) return '';
    
    // Map of topic slugs to nice titles
    const topicTitles = {
        'science': 'Science Wonders Quiz',
        'history': 'Journey Through Time',
        'geography': 'World Explorer Challenge',
        'literature': 'Literary Masterpieces',
        'technology': 'Tech & Innovation Quiz'
    };
    
    return topicTitles[topic] || `${topic.charAt(0).toUpperCase() + topic.slice(1)} Quiz`;
}

/**
 * Initialize sidebar navigation
 */
function initSidebarNavigation() {
    // Dashboard link
    const dashboardLink = document.getElementById("dashboardLink");
    if (dashboardLink) {
        dashboardLink.addEventListener("click", (e) => {
            e.preventDefault();
            showContent("dashboardContent");
            document.getElementById("currentPageTitle").textContent = "Dashboard";
        });
    }
    
    // My Quizzes link - Show internal My Quizzes section instead of redirecting
    const myQuizzesLink = document.getElementById("myQuizzesLink");
    if (myQuizzesLink) {
        myQuizzesLink.addEventListener("click", (e) => {
            e.preventDefault();
            showContent("myQuizzesContent");
            document.getElementById("currentPageTitle").textContent = "My Quizzes";

            // Initialize the tab functionality if not already initialized
            if (!window.myQuizzesTabsInitialized) {
                initMyQuizzesTabs();
                window.myQuizzesTabsInitialized = true;
            }
        });
    }
    
    // Friends link
    const friendsLink = document.getElementById("friendsLink");
    if (friendsLink) {
        friendsLink.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "friends.html";
        });
    }
    
    // Settings link
    const settingsLink = document.getElementById("settingsLink");
    if (settingsLink) {
        settingsLink.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "settings.html";
        });
    }
    
    // Remove subscription link
    const subscriptionLink = document.getElementById("subscriptionLink");
    if (subscriptionLink) {
        const parentLi = subscriptionLink.parentElement;
        if (parentLi) {
            parentLi.style.display = "none";
        }
    }
    
    // Rankings main link (toggle submenu)
    const rankingsLink = document.getElementById("rankingsLink");
    if (rankingsLink) {
        rankingsLink.addEventListener("click", (e) => {
            e.preventDefault();
            toggleRankingsSubmenu();
        });
    }
    
    // Ranking sublinks
    setupRankingLinks();
    
    // Coming soon links
    setupComingSoonLinks();
    
    // Ensure rankings and coming soon sections are visible
    const subMenuItems = document.querySelectorAll(".sub-menu");
    subMenuItems.forEach(item => {
        item.style.display = "block";
    });
    
    // Remove upgrade button from sidebar
    const upgradeBtn = document.querySelector(".upgrade-btn");
    if (upgradeBtn) {
        upgradeBtn.style.display = "none";
    }
}

/**
 * Setup ranking links functionality
 */
function setupRankingLinks() {
    const rankingTypes = ["global", "country", "state", "city"];
    
    rankingTypes.forEach(type => {
        const link = document.getElementById(`${type}RankingsLink`);
        if (link) {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                showRankings(type);
            });
        }
    });
}

/**
 * Show rankings content based on type
 * @param {string} type - The type of ranking to show
 */
function showRankings(type) {
    // Create or update rankings content
    const contentArea = document.querySelector(".content");
    const pageTitle = document.getElementById("currentPageTitle");
    
    if (contentArea && pageTitle) {
        // Update page title
        pageTitle.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} Rankings`;
        
        // Create rankings content
        contentArea.innerHTML = `
            <div id="rankingsContent">
                <h1>${type.charAt(0).toUpperCase() + type.slice(1)} Rankings</h1>
                <p class="text-muted">Showing top performers in ${type} rankings.</p>
                
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i> 
                    Rankings are updated daily based on quiz performance.
                </div>
                
                <div class="rankings-table mt-4">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>User</th>
                                <th>Score</th>
                                <th>Quizzes</th>
                                <th>Accuracy</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><span class="badge bg-warning">1</span></td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <img src="images/profile.png" class="avatar me-2">
                                        <span>QuizMaster92</span>
                                    </div>
                                </td>
                                <td>15,423</td>
                                <td>142</td>
                                <td>94%</td>
                            </tr>
                            <tr>
                                <td><span class="badge bg-secondary">2</span></td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <img src="images/profile.png" class="avatar me-2">
                                        <span>BrainiacQueen</span>
                                    </div>
                                </td>
                                <td>14,876</td>
                                <td>130</td>
                                <td>92%</td>
                            </tr>
                            <tr>
                                <td><span class="badge bg-info">3</span></td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <img src="images/profile.png" class="avatar me-2">
                                        <span>TriviaTitan</span>
                                    </div>
                                </td>
                                <td>13,542</td>
                                <td>121</td>
                                <td>91%</td>
                            </tr>
                            <tr>
                                <td>4</td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <img src="images/profile.png" class="avatar me-2">
                                        <span>QuizWhiz</span>
                                    </div>
                                </td>
                                <td>12,987</td>
                                <td>115</td>
                                <td>89%</td>
                            </tr>
                            <tr>
                                <td>5</td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <img src="images/profile.png" class="avatar me-2">
                                        <span>You</span>
                                        <span class="badge bg-primary ms-2">You</span>
                                    </div>
                                </td>
                                <td>10,432</td>
                                <td>98</td>
                                <td>87%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
}

/**
 * Toggle visibility of rankings submenu
 */
function toggleRankingsSubmenu() {
    const subMenuItems = document.querySelectorAll(".nav-item.sub-menu");
    let allHidden = true;
    
    // Check if all submenu items are hidden
    subMenuItems.forEach(item => {
        if (item.style.display !== "none") {
            allHidden = false;
        }
    });
    
    // Toggle display
    subMenuItems.forEach(item => {
        item.style.display = allHidden ? "block" : "none";
    });
}

/**
 * Setup functionality for coming soon links
 */
function setupComingSoonLinks() {
    const comingSoonLinks = document.querySelectorAll(".coming-soon-link");
    
    comingSoonLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            
            // Get the link id to map to the correct teaser content
            const linkId = link.id;
            
            // Show the coming soon content on the main screen
            if (teaserContent[linkId]) {
                displayComingSoonContent(teaserContent[linkId]);
                
                // Also update the sidebar teaser with a random message
                setRandomTeaserMessage();
                
                // Update the page title
                const pageTitle = document.getElementById("currentPageTitle");
                if (pageTitle) {
                    pageTitle.textContent = "Coming Soon";
                }
                
                // If on mobile, close the sidebar
                const sidebar = document.querySelector('.sidebar');
                if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('active')) {
                    sidebar.classList.remove('active');
                    document.body.classList.remove('sidebar-active');
                }
            }
        });
    });
}

/**
 * Displays coming soon content in the main content area
 * @param {Object} content - The content to display
 */
function displayComingSoonContent(content) {
    const mainContent = document.querySelector(".content");
    if (!mainContent) return;
    
    // Calculate a random release date within the next 3 months if not specified
    const releaseDate = content.estimatedRelease || getRandomFutureDate();
    
    // Generate HTML for the feature list
    let featuresHtml = '';
    if (content.features && content.features.length > 0) {
        featuresHtml = `
            <div class="feature-list mt-4">
                <h5>Key Features:</h5>
                <div class="row">
                    ${content.features.map(feature => `
                        <div class="col-md-6 mb-2">
                            <div class="feature-item">
                                <i class="fas fa-check-circle text-success"></i>
                                <span>${feature}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Generate signup form HTML
    const signupHtml = `
        <div class="early-access-form mt-5">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Get Early Access</h5>
                    <p class="card-text">Sign up to be notified when this feature launches and get exclusive early access!</p>
                    <form class="row g-3">
                        <div class="col-md-8">
                            <input type="email" class="form-control" id="earlyAccessEmail" placeholder="Your email address">
                        </div>
                        <div class="col-md-4">
                            <button type="button" class="btn btn-primary w-100 notify-btn">Notify Me</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Create coming soon display with animation and countdown
    mainContent.innerHTML = `
        <div id="comingSoonContent" class="coming-soon-display">
            <div class="row">
                <div class="col-lg-8">
                    <div class="coming-soon-header">
                        <h1><i class="fas ${content.icon}"></i> ${content.title}</h1>
                        <div class="release-badge">
                            <span>Release: ${releaseDate}</span>
                        </div>
                    </div>
                    
                    <div class="coming-soon-description mt-4">
                        <p class="lead">${content.message}</p>
                    </div>
                    
                    ${featuresHtml}
                    
                    <!-- Progress Bar -->
                    <div class="development-progress mt-5">
                        <h5>Development Progress:</h5>
                        <div class="progress" style="height: 25px;">
                            <div class="progress-bar progress-bar-striped progress-bar-animated" 
                                role="progressbar" 
                                style="width: ${Math.floor(Math.random() * 40) + 60}%;" 
                                aria-valuenow="75" 
                                aria-valuemin="0" 
                                aria-valuemax="100">In Progress</div>
                        </div>
                    </div>
                    
                    ${signupHtml}
                </div>
                
                <div class="col-lg-4">
                    <div class="coming-soon-visual">
                        <div class="feature-preview">
                            <div class="preview-placeholder">
                                <i class="fas ${content.icon} fa-5x"></i>
                                <div class="glow"></div>
                            </div>
                            <div class="placeholder-text">Feature Preview</div>
                        </div>
                        
                        <!-- Interaction Elements -->
                        <div class="interaction-elements mt-4">
                            <button class="btn btn-outline-primary btn-block mb-3 suggest-btn">
                                <i class="fas fa-lightbulb me-2"></i> Suggest Feature Ideas
                            </button>
                            <button class="btn btn-outline-success btn-block feedback-btn">
                                <i class="fas fa-comment-dots me-2"></i> Provide Feedback
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add event listeners for the interactive elements
    setTimeout(() => {
        // Notify button
        const notifyBtn = document.querySelector('.notify-btn');
        if (notifyBtn) {
            notifyBtn.addEventListener('click', () => {
                const emailInput = document.getElementById('earlyAccessEmail');
                if (emailInput && emailInput.value) {
                    notifyBtn.innerHTML = '<i class="fas fa-check"></i> You\'re on the list!';
                    notifyBtn.classList.remove('btn-primary');
                    notifyBtn.classList.add('btn-success');
                    emailInput.disabled = true;
                } else {
                    alert('Please enter a valid email address');
                }
            });
        }
        
        // Suggestion and feedback buttons
        const suggestBtn = document.querySelector('.suggest-btn');
        const feedbackBtn = document.querySelector('.feedback-btn');
        
        if (suggestBtn) {
            suggestBtn.addEventListener('click', () => {
                showFeedbackForm('suggestion', content.title);
            });
        }
        
        if (feedbackBtn) {
            feedbackBtn.addEventListener('click', () => {
                showFeedbackForm('feedback', content.title);
            });
        }
    }, 100);
}

/**
 * Shows a feedback or suggestion form modal
 * @param {string} type - The type of form to show ('suggestion' or 'feedback')
 * @param {string} featureTitle - The title of the feature
 */
function showFeedbackForm(type, featureTitle) {
    // Create a title and description based on type
    const title = type === 'suggestion' ? 'Suggest a Feature' : 'Provide Feedback';
    const description = type === 'suggestion' 
        ? 'What features would you like to see included in this update?' 
        : 'Share your thoughts on this upcoming feature.';
    
    // Create the modal HTML
    const modalHtml = `
        <div class="modal fade" id="feedbackModal" tabindex="-1" aria-labelledby="feedbackModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="feedbackModalLabel">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>${description}</p>
                        <form>
                            <input type="hidden" id="featureType" value="${featureTitle}">
                            <div class="mb-3">
                                <label for="userName" class="form-label">Your Name</label>
                                <input type="text" class="form-control" id="userName" placeholder="Enter your name">
                            </div>
                            <div class="mb-3">
                                <label for="userEmail" class="form-label">Email Address</label>
                                <input type="email" class="form-control" id="userEmail" placeholder="Enter your email">
                            </div>
                            <div class="mb-3">
                                <label for="feedbackContent" class="form-label">Your ${type === 'suggestion' ? 'Suggestion' : 'Feedback'}</label>
                                <textarea class="form-control" id="feedbackContent" rows="4" placeholder="Share your thoughts..."></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="submitFeedbackBtn">Submit</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add the modal to the document
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    
    // Initialize the modal
    const feedbackModal = new bootstrap.Modal(document.getElementById('feedbackModal'));
    feedbackModal.show();
    
    // Add submit event handler
    const submitBtn = document.getElementById('submitFeedbackBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const nameInput = document.getElementById('userName');
            const emailInput = document.getElementById('userEmail');
            const contentInput = document.getElementById('feedbackContent');
            
            if (nameInput && emailInput && contentInput) {
                if (nameInput.value && emailInput.value && contentInput.value) {
                    // Here we would normally send this data to the server
                    // For now we'll just show a thank you message
                    alert('Thank you for your ' + type + '! We appreciate your input.');
                    feedbackModal.hide();
                    
                    // Remove the modal after hiding
                    setTimeout(() => {
                        document.body.removeChild(modalContainer);
                    }, 500);
                } else {
                    alert('Please fill out all fields');
                }
            }
        });
    }
    
    // Remove the modal when it's hidden
    document.getElementById('feedbackModal').addEventListener('hidden.bs.modal', function () {
        setTimeout(() => {
            document.body.removeChild(modalContainer);
        }, 500);
    });
}

/**
 * Generates a random future date string
 * @returns {string} A future date string like "Late June" or "Early August"
 */
function getRandomFutureDate() {
    const times = ["Early", "Mid", "Late"];
    const currentDate = new Date();
    const randomMonthsAhead = Math.floor(Math.random() * 3) + 1; // 1-3 months ahead
    
    const targetDate = new Date(currentDate);
    targetDate.setMonth(currentDate.getMonth() + randomMonthsAhead);
    
    const monthNames = ["January", "February", "March", "April", "May", "June",
                         "July", "August", "September", "October", "November", "December"];
    
    const timeIndex = Math.floor(Math.random() * times.length);
    return `${times[timeIndex]} ${monthNames[targetDate.getMonth()]}`;
}

/**
 * Set a random teaser message in the coming soon teaser box
 */
function setRandomTeaserMessage() {
    const teaserElement = document.getElementById("comingSoonTeaser");
    if (teaserElement) {
        const teaserText = teaserElement.querySelector(".teaser-text");
        if (teaserText) {
            // Get random message
            const randomIndex = Math.floor(Math.random() * sidebarTeaserMessages.length);
            teaserText.textContent = `"${sidebarTeaserMessages[randomIndex]}"`;
            
            // Animate the message change
            teaserElement.classList.add("message-update");
            setTimeout(() => {
                teaserElement.classList.remove("message-update");
            }, 1000);
        }
    }
}

/**
 * Initialize coming soon features with interactive elements
 */
function initComingSoonFeatures() {
    // Initially hide submenu items
    const subMenuItems = document.querySelectorAll(".sub-menu");
    subMenuItems.forEach(item => {
        item.style.display = "none";
    });
    
    // Add animation classes
    const teaserElement = document.getElementById("comingSoonTeaser");
    if (teaserElement) {
        teaserElement.classList.add("fade-in");
    }
}

/**
 * Show content section
 * @param {string} contentId - ID of the content section to show
 */
function showContent(contentId) {
    // Get all content sections
    const contentSections = [
        "dashboardContent", 
        "myQuizzesContent", 
        "rankingsContent", 
        "comingSoonContent"
    ];
    
    // Hide all content sections
    contentSections.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.add("d-none");
        }
    });
    
    // Show the selected content
    const selectedContent = document.getElementById(contentId);
    if (selectedContent) {
        selectedContent.classList.remove("d-none");
    }
    
    // If on mobile, close the sidebar
    const sidebar = document.querySelector('.sidebar');
    if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        document.body.classList.remove('sidebar-active');
    }
}

/**
 * Initialize theme toggle functionality
 */
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('quizora-theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
    }
    
    // Toggle theme on click
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-theme');
            
            // Save preference
            const isDarkMode = body.classList.contains('dark-theme');
            localStorage.setItem('quizora-theme', isDarkMode ? 'dark' : 'light');
        });
    }
}

/**
 * Initialize quiz creation functionality
 */
function initQuizCreation() {
    // Initialize quiz config object
    window.quizConfig = {
        title: '',
        description: '',
        quizType: 'multiple-choice',
        numQuestions: 10,
        timePerQuestion: 15,
        chatDuration: 10,
        maxParticipants: 20,
        allowLateJoin: true,
        showLeaderboard: true,
        requireNames: true,
        quizCode: generateQuizCode(),
        questions: []
    };
    
    // Create Quiz modal button - use the standard flow with wizard
    const createQuizBtn = document.getElementById('createQuizBtn');
    if (createQuizBtn) {
        createQuizBtn.addEventListener('click', function() {
            // Reset quiz configuration
            resetQuizConfig();
            
            // Show the create quiz modal
            const createQuizModal = new bootstrap.Modal(document.getElementById('createQuizModal'));
            createQuizModal.show();
        });
    }
    
    // New quiz buttons on dashboard - offer quick creation option
    const newQuizCard = document.getElementById('newQuizCard');
    const newDashboardQuizBtn = document.getElementById('newDashboardQuizBtn');
    
    if (newQuizCard) {
        newQuizCard.addEventListener('click', function(event) {
            // Check if ALT key is pressed for quick creation
            if (event.altKey) {
                directQuizCreation();
            } else {
                // Show confirmation dialog asking if they want to use the wizard or go directly to editor
                showQuickActionModal('info', 'Create Quiz', 
                    `<p>How would you like to create your quiz?</p>`,
                    [
                        {
                            text: 'Use Wizard',
                            class: 'btn-outline-primary',
                            icon: 'fa-magic',
                            callback: () => {
                                resetQuizConfig();
                                const createQuizModal = new bootstrap.Modal(document.getElementById('createQuizModal'));
                                createQuizModal.show();
                            }
                        },
                        {
                            text: 'Quick Create',
                            class: 'btn-primary',
                            icon: 'fa-bolt',
                            callback: () => {
                                directQuizCreation();
                            }
                        }
                    ]
                );
            }
        });
    }
    
    if (newDashboardQuizBtn) {
        newDashboardQuizBtn.addEventListener('click', function(event) {
            // Check if ALT key is pressed for quick creation
            if (event.altKey) {
                directQuizCreation();
            } else {
                // Show confirmation dialog asking if they want to use the wizard or go directly to editor
                showQuickActionModal('info', 'Create Quiz', 
                    `<p>How would you like to create your quiz?</p>`,
                    [
                        {
                            text: 'Use Wizard',
                            class: 'btn-outline-primary',
                            icon: 'fa-magic',
                            callback: () => {
                                resetQuizConfig();
                                const createQuizModal = new bootstrap.Modal(document.getElementById('createQuizModal'));
                                createQuizModal.show();
                            }
                        },
                        {
                            text: 'Quick Create',
                            class: 'btn-primary',
                            icon: 'fa-bolt',
                            callback: () => {
                                directQuizCreation();
                            }
                        }
                    ]
                );
            }
        });
    }
    
    // Initialize the navigation between steps
    initQuizStepsNavigation();
    
    // Initialize form handlers for validation and data collection
    initQuizFormHandlers();
    
    // Initialize question type selection
    initQuestionTypeSelection();
}

/**
 * Initialize navigation between quiz configuration steps
 */
function initQuizStepsNavigation() {
    // Next buttons
    document.getElementById('goToStep2Btn').addEventListener('click', () => {
        if (validateStep1()) {
            setActiveStep(2);
        }
    });
    
    document.getElementById('goToStep3Btn').addEventListener('click', () => {
        if (validateStep2()) {
            setActiveStep(3);
        }
    });
    
    // Back buttons
    document.getElementById('backToStep1Btn').addEventListener('click', () => {
        setActiveStep(1);
    });
    
    document.getElementById('backToStep2Btn').addEventListener('click', () => {
        setActiveStep(2);
    });
    
    // Create quiz button (final submission)
    document.getElementById('createQuizSubmitBtn').addEventListener('click', () => {
        if (validateStep3()) {
            finalizeQuizCreation();
        }
    });
}

/**
 * Set the active step in the quiz configuration
 * @param {number} stepNumber - The step number to activate
 */
function setActiveStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.setup-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show the target step
    document.getElementById(`step${stepNumber}`).classList.add('active');
    
    // Update the step indicators
    document.querySelectorAll('.step').forEach(step => {
        const stepNum = parseInt(step.getAttribute('data-step'));
        step.classList.remove('active', 'completed');
        
        if (stepNum === stepNumber) {
            step.classList.add('active');
        } else if (stepNum < stepNumber) {
            step.classList.add('completed');
        }
    });
    
    // Update the quiz summary
    updateQuizSummary();
}

/**
 * Initialize form change handlers for quiz configuration
 */
function initQuizFormHandlers() {
    // Basic info (Step 1)
    document.getElementById('quizTitle').addEventListener('change', (e) => {
        quizConfig.title = e.target.value.trim();
        updateQuizSummary();
    });
    
    document.getElementById('quizDescription').addEventListener('change', (e) => {
        quizConfig.description = e.target.value.trim();
    });
    
    document.getElementById('quizCategory').addEventListener('change', (e) => {
        quizConfig.category = e.target.value;
        updateQuizSummary();
    });
    
    document.getElementById('numQuestions').addEventListener('change', (e) => {
        quizConfig.numQuestions = parseInt(e.target.value);
        updateQuizSummary();
    });
    
    // Settings (Step 2)
    document.getElementById('quizMode').addEventListener('change', (e) => {
        quizConfig.mode = e.target.value;
        updateQuizSummary();
    });
    
    document.getElementById('participantLimit').addEventListener('change', (e) => {
        quizConfig.participantLimit = e.target.value;
        updateQuizSummary();
    });
    
    document.getElementById('timePerQuestion').addEventListener('change', (e) => {
        quizConfig.timePerQuestion = parseInt(e.target.value);
        updateQuizSummary();
    });
    
    document.getElementById('chatDuration').addEventListener('change', (e) => {
        quizConfig.chatDuration = parseInt(e.target.value);
        updateQuizSummary();
    });
    
    document.querySelectorAll('input[name="quizAccess"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            quizConfig.access = e.target.value;
            updateQuizSummary();
        });
    });
    
    // Controls (Step 3)
    document.getElementById('passwordProtection').addEventListener('change', (e) => {
        quizConfig.passwordProtection = e.target.checked;
        const passwordField = document.getElementById('passwordField');
        passwordField.classList.toggle('d-none', !e.target.checked);
        
        if (!e.target.checked) {
            quizConfig.password = '';
            document.getElementById('quizPassword').value = '';
        }
    });
    
    document.getElementById('quizPassword').addEventListener('change', (e) => {
        quizConfig.password = e.target.value;
    });
    
    document.getElementById('requireApproval').addEventListener('change', (e) => {
        quizConfig.requireApproval = e.target.checked;
    });
    
    document.getElementById('enableAttentionDetection').addEventListener('change', (e) => {
        quizConfig.enableAttentionDetection = e.target.checked;
    });
    
    document.getElementById('enableAIModeration').addEventListener('change', (e) => {
        quizConfig.enableAIModeration = e.target.checked;
    });
    
    document.getElementById('showLeaderboard').addEventListener('change', (e) => {
        quizConfig.showLeaderboard = e.target.checked;
    });
    
    document.getElementById('allowRetakes').addEventListener('change', (e) => {
        quizConfig.allowRetakes = e.target.checked;
    });
}

/**
 * Validate step 1 of quiz configuration
 * @returns {boolean} Whether the validation passed
 */
function validateStep1() {
    const title = document.getElementById('quizTitle').value.trim();
    const category = document.getElementById('quizCategory').value;
    
    if (!title) {
        alert('Please enter a quiz title');
        return false;
    }
    
    if (!category) {
        alert('Please select a category');
        return false;
    }
    
    // Update quiz config
    quizConfig.title = title;
    quizConfig.category = category;
    
    return true;
}

/**
 * Validate step 2 of quiz configuration
 * @returns {boolean} Whether the validation passed
 */
function validateStep2() {
    // Nothing to validate in step 2, all fields have defaults
    return true;
}

/**
 * Validate step 3 of quiz configuration
 * @returns {boolean} Whether the validation passed
 */
function validateStep3() {
    // Check if password protection is enabled but no password is set
    if (quizConfig.passwordProtection && !document.getElementById('quizPassword').value) {
        alert('Please enter a password or disable password protection');
        return false;
    }
    
    // Update password in config
    if (quizConfig.passwordProtection) {
        quizConfig.password = document.getElementById('quizPassword').value;
    }
    
    return true;
}

/**
 * Update the quiz summary display
 */
function updateQuizSummary() {
    const summaryEl = document.getElementById('quizSummary');
    if (!summaryEl) return;
    
    // Build summary string
    let summary = '';
    
    if (quizConfig.title) {
        summary += `"${quizConfig.title}" - `;
    }
    
    summary += `${quizConfig.numQuestions}-question `;
    summary += `${quizConfig.mode} quiz `;
    
    if (quizConfig.timePerQuestion !== 'unlimited') {
        summary += `with ${quizConfig.timePerQuestion}-second time limit`;
    } else {
        summary += `with no time limit`;
    }
    
    if (quizConfig.chatDuration > 0) {
        summary += ` and ${quizConfig.chatDuration}-second chat between questions`;
    }
    
    summaryEl.textContent = summary;
}

/**
 * Reset quiz configuration to default values
 */
function resetQuizConfig() {
    quizConfig = {
        title: '',
        description: '',
        category: '',
        numQuestions: 10,
        mode: 'multiplayer',
        participantLimit: 10,
        timePerQuestion: 20,
        chatDuration: 15,
        access: 'public',
        passwordProtection: false,
        password: '',
        requireApproval: false,
        enableAttentionDetection: true,
        enableAIModeration: true,
        showLeaderboard: true,
        allowRetakes: false,
        questions: [],
        quizCode: ''
    };
    
    // Reset form values
    document.getElementById('quizTitle').value = '';
    document.getElementById('quizDescription').value = '';
    document.getElementById('quizCategory').selectedIndex = 0;
    document.getElementById('numQuestions').value = '10';
    document.getElementById('quizMode').value = 'multiplayer';
    document.getElementById('participantLimit').value = '10';
    document.getElementById('timePerQuestion').value = '20';
    document.getElementById('chatDuration').value = '15';
    document.getElementById('accessPublic').checked = true;
    document.getElementById('passwordProtection').checked = false;
    document.getElementById('passwordField').classList.add('d-none');
    document.getElementById('quizPassword').value = '';
    document.getElementById('requireApproval').checked = false;
    document.getElementById('enableAttentionDetection').checked = true;
    document.getElementById('enableAIModeration').checked = true;
    document.getElementById('showLeaderboard').checked = true;
    document.getElementById('allowRetakes').checked = false;
}

/**
 * Initialize question type selection functionality
 */
function initQuestionTypeSelection() {
    const questionTypeCards = document.querySelectorAll('.question-type-card');
    
    questionTypeCards.forEach(card => {
        // Add hover effect
        card.addEventListener('mouseenter', function() {
            // Add subtle elevation animation
            this.style.transform = 'translateY(-8px) scale(1.02)';
            this.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
            
            // Add highlight glow for the selected type
            const icon = this.querySelector('.question-type-icon');
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            // Remove hover effects
            this.style.transform = '';
            this.style.boxShadow = '';
            
            const icon = this.querySelector('.question-type-icon');
            if (icon) {
                icon.style.transform = '';
            }
        });
        
        // Add click animation and selection
        card.addEventListener('click', function() {
            const questionType = this.getAttribute('data-type');
            
            // Animate the selection
            animateCardSelection(this);
            
            // Store the selected type
            localStorage.setItem('selectedQuestionType', questionType);
            
            // Close the modal with delay to show the animation
            setTimeout(() => {
                const questionTypeModal = bootstrap.Modal.getInstance(document.getElementById('questionTypeModal'));
                if (questionTypeModal) questionTypeModal.hide();
                
                // Redirect to the quiz editor page with the selected type
                redirectToQuestionCreation(questionType);
            }, 500);
        });
    });
}

/**
 * Animate the card selection with a ripple effect
 * @param {Element} card - The card element to animate
 */
function animateCardSelection(card) {
    // Create ripple effect
    const ripple = document.createElement('div');
    ripple.className = 'card-selection-ripple';
    card.appendChild(ripple);
    
    // Add selected class to the card
    card.classList.add('selected');
    
    // Create checkmark icon
    const checkmark = document.createElement('div');
    checkmark.className = 'selection-checkmark';
    checkmark.innerHTML = '<i class="fas fa-check"></i>';
    card.appendChild(checkmark);
    
    // Remove other selected cards
    document.querySelectorAll('.question-type-card').forEach(otherCard => {
        if (otherCard !== card && otherCard.classList.contains('selected')) {
            otherCard.classList.remove('selected');
            const oldCheckmark = otherCard.querySelector('.selection-checkmark');
            if (oldCheckmark) otherCard.removeChild(oldCheckmark);
        }
    });
    
    // Remove ripple after animation
    setTimeout(() => {
        if (ripple && ripple.parentNode === card) {
            card.removeChild(ripple);
        }
    }, 800);
}

/**
 * Redirect to the quiz editor page with the selected question type
 * @param {string} questionType - The type of question to create
 */
function redirectToQuestionCreation(questionType) {
    // Show loading animation
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="loading-content">
            <div class="spinner-container">
                <div class="spinner"></div>
            </div>
            <p>Preparing quiz editor...</p>
        </div>
    `;
    document.body.appendChild(loadingOverlay);
    
    // Set animation
    loadingOverlay.style.opacity = '0';
    setTimeout(() => {
        loadingOverlay.style.opacity = '1';
    }, 10);
    
    // Make sure quizConfig has the selected question type
    quizConfig.quizType = questionType;
    
    // Ensure we have a quiz code
    if (!quizConfig.quizCode) {
        quizConfig.quizCode = generateQuizCode();
    }
    
    // Convert quizConfig to the format expected by quiz-editor.js
    const quizEditorData = {
        id: null,
        title: quizConfig.title || 'Untitled Quiz',
        description: quizConfig.description || '',
        timePerQuestion: parseInt(quizConfig.timePerQuestion) || 20,
        chatDuration: parseInt(quizConfig.chatDuration) || 15,
        maxParticipants: parseInt(quizConfig.participantLimit) || 10,
        isPublic: quizConfig.access === 'public',
        requiresPassword: quizConfig.passwordProtection,
        password: quizConfig.password || '',
        requiresApproval: quizConfig.requireApproval || false,
        quizCode: quizConfig.quizCode,
        questions: [] // Start with empty questions array
    };
    
    // Store the quiz editor data in localStorage
    localStorage.setItem('currentQuizData', JSON.stringify(quizEditorData));
    
    // Redirect after a short delay to show the loading animation
    setTimeout(() => {
        // Redirect directly to the quiz editor page
        window.location.href = `quiz-editor.html?new=true`;
    }, 1200);
}

/**
 * Generate a random 6-character alphanumeric quiz code
 * @returns {string} The generated quiz code
 */
function generateQuizCode() {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like I, O, 0, 1
    let result = '';
    
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
}

/**
 * Finalize quiz creation and redirect to question type selection
 */
function finalizeQuizCreation() {
    // Generate a quiz code if not already present
    if (!quizConfig.quizCode) {
        quizConfig.quizCode = generateQuizCode();
    }
    
    // Store the quiz configuration in localStorage
    localStorage.setItem('quizConfig', JSON.stringify(quizConfig));
    
    // Close the modal
    const createQuizModal = bootstrap.Modal.getInstance(document.getElementById('createQuizModal'));
    createQuizModal.hide();
    
    // Show the question type modal
    setTimeout(() => {
        const questionTypeModal = new bootstrap.Modal(document.getElementById('questionTypeModal'));
        questionTypeModal.show();
    }, 500);
}

/**
 * Initialize My Quizzes tabs functionality
 */
function initMyQuizzesTabs() {
    // Initialize the create buttons
    const createNewQuizBtn = document.getElementById("createNewQuizBtn");
    const createQuizCardMyQuizzes = document.getElementById("createQuizCardMyQuizzes");
    
    if (createNewQuizBtn) {
        createNewQuizBtn.addEventListener("click", function(event) {
            // Check if ALT key is pressed for quick creation
            if (event.altKey) {
                directQuizCreation();
            } else {
                // Show confirmation dialog asking if they want to use the wizard or go directly to editor
                showQuickActionModal('info', 'Create Quiz', 
                    `<p>How would you like to create your quiz?</p>`,
                    [
                        {
                            text: 'Use Wizard',
                            class: 'btn-outline-primary',
                            icon: 'fa-magic',
                            callback: () => {
                                createManualQuiz();
                            }
                        },
                        {
                            text: 'Quick Create',
                            class: 'btn-primary',
                            icon: 'fa-bolt',
                            callback: () => {
                                directQuizCreation();
                            }
                        }
                    ]
                );
            }
        });
    }
    
    if (createQuizCardMyQuizzes) {
        createQuizCardMyQuizzes.addEventListener("click", function(event) {
            // Check if ALT key is pressed for quick creation
            if (event.altKey) {
                directQuizCreation();
            } else {
                // Show confirmation dialog asking if they want to use the wizard or go directly to editor
                showQuickActionModal('info', 'Create Quiz', 
                    `<p>How would you like to create your quiz?</p>`,
                    [
                        {
                            text: 'Use Wizard',
                            class: 'btn-outline-primary',
                            icon: 'fa-magic',
                            callback: () => {
                                createManualQuiz();
                            }
                        },
                        {
                            text: 'Quick Create',
                            class: 'btn-primary',
                            icon: 'fa-bolt',
                            callback: () => {
                                directQuizCreation();
                            }
                        }
                    ]
                );
            }
        });
    }
    
    // Initialize the quiz stats counters
    const statValues = document.querySelectorAll("#myQuizzesContent .stat-value");
    statValues.forEach(statValue => {
        const finalValue = parseInt(statValue.textContent);
        animateCounter(statValue, 0, finalValue, 1000);
    });
    
    // Add event listeners for quiz actions
    const startButtons = document.querySelectorAll("#myQuizzesContent .btn-outline-primary");
    const resultButtons = document.querySelectorAll("#myQuizzesContent .btn-outline-secondary");
    
    startButtons.forEach(button => {
        button.addEventListener("click", function() {
            const quizTitle = this.closest(".quiz-item-card").querySelector(".quiz-title").textContent;
            alert(`Starting quiz: ${quizTitle}`);
            // In a real implementation, you would redirect to the quiz play page
        });
    });
    
    resultButtons.forEach(button => {
        button.addEventListener('click', function() {
            const quizTitle = this.closest(".quiz-item-card").querySelector(".quiz-title").textContent;
            alert(`Viewing results for: ${quizTitle}`);
            // In a real implementation, you would redirect to the results page
        });
    });
}

/**
 * Animate a counter from start value to end value over a duration
 * @param {HTMLElement} element - The element to update with the counter value
 * @param {number} start - Starting value
 * @param {number} end - Ending value
 * @param {number} duration - Duration of animation in milliseconds
 */
function animateCounter(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        
        // Format with commas if needed
        element.textContent = value.toLocaleString();
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    
    window.requestAnimationFrame(step);
}

/**
 * Create a quiz directly and redirect to quiz editor without going through the wizard
 * This is for quick starts from dashboard
 */
function directQuizCreation() {
    // Set default values for a quick quiz
    resetQuizConfig();
    
    // Set some reasonable defaults
    quizConfig.title = "Quick Quiz";
    quizConfig.description = "Created on " + new Date().toLocaleDateString();
    quizConfig.category = "general";
    quizConfig.quizCode = generateQuizCode();
    
    // Convert quizConfig to the format expected by quiz-editor.js
    const quizEditorData = {
        id: null,
        title: quizConfig.title,
        description: quizConfig.description,
        timePerQuestion: parseInt(quizConfig.timePerQuestion) || 20,
        chatDuration: parseInt(quizConfig.chatDuration) || 15,
        maxParticipants: parseInt(quizConfig.participantLimit) || 10,
        isPublic: quizConfig.access === 'public',
        requiresPassword: quizConfig.passwordProtection,
        password: quizConfig.password || '',
        requiresApproval: quizConfig.requireApproval || false,
        quizCode: quizConfig.quizCode,
        questions: [] // Start with empty questions array
    };
    
    // Store the quiz editor data in localStorage
    localStorage.setItem('currentQuizData', JSON.stringify(quizEditorData));
    
    // Show loading animation
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="loading-content">
            <div class="spinner-container">
                <div class="spinner"></div>
            </div>
            <p>Preparing quiz editor...</p>
        </div>
    `;
    document.body.appendChild(loadingOverlay);
    
    // Set animation
    loadingOverlay.style.opacity = '0';
    setTimeout(() => {
        loadingOverlay.style.opacity = '1';
    }, 10);
    
    // Redirect after a short delay
    setTimeout(() => {
        window.location.href = `quiz-editor.html?new=true`;
    }, 1200);
}
