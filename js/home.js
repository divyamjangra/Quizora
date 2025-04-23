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

    // Add functionality for view toggle in explore section
    const gridViewBtn = document.querySelector('.view-toggle .btn:first-child');
    const listViewBtn = document.querySelector('.view-toggle .btn:last-child');
    const quizCards = document.querySelectorAll('.recently-added .row');
    
    if (gridViewBtn && listViewBtn) {
        listViewBtn.addEventListener('click', function() {
            gridViewBtn.classList.remove('active');
            this.classList.add('active');
            
            quizCards.forEach(row => {
                // Change layout to list view
                const cards = row.querySelectorAll('.col-lg-4');
                cards.forEach(card => {
                    card.classList.remove('col-lg-4', 'col-md-6');
                    card.classList.add('col-12', 'mb-3');
                    
                    // Restructure card for list view
                    const quizCard = card.querySelector('.quiz-card');
                    quizCard.classList.add('d-md-flex');
                    
                    const imgContainer = quizCard.querySelector('.quiz-img');
                    if (imgContainer) {
                        imgContainer.style.width = '30%';
                        imgContainer.style.minWidth = '200px';
                    }
                });
            });
        });
        
        gridViewBtn.addEventListener('click', function() {
            listViewBtn.classList.remove('active');
            this.classList.add('active');
            
            quizCards.forEach(row => {
                // Change layout back to grid view
                const cards = row.querySelectorAll('.col-12');
                cards.forEach(card => {
                    card.classList.remove('col-12', 'mb-3');
                    card.classList.add('col-lg-4', 'col-md-6');
                    
                    // Restore card structure for grid view
                    const quizCard = card.querySelector('.quiz-card');
                    quizCard.classList.remove('d-md-flex');
                    
                    const imgContainer = quizCard.querySelector('.quiz-img');
                    if (imgContainer) {
                        imgContainer.style.width = '';
                        imgContainer.style.minWidth = '';
                    }
                });
            });
        });
    }
    
    // Search functionality
    const searchForm = document.querySelector('.search-box form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchInput = this.querySelector('input').value.trim().toLowerCase();
            
            if (searchInput.length > 0) {
                console.log(`Searching for: ${searchInput}`);
                
                // Simulate search - highlight matching cards
                const allQuizCards = document.querySelectorAll('.quiz-card');
                let hasMatches = false;
                
                allQuizCards.forEach(card => {
                    const cardTitle = card.querySelector('h4').textContent.toLowerCase();
                    const cardDescription = card.querySelector('p').textContent.toLowerCase();
                    const cardCategory = card.querySelector('.badge').textContent.toLowerCase();
                    
                    if (cardTitle.includes(searchInput) || 
                        cardDescription.includes(searchInput) || 
                        cardCategory.includes(searchInput)) {
                        card.style.transform = 'scale(1.03)';
                        card.style.boxShadow = '0 0 15px rgba(108, 99, 255, 0.7)';
                        hasMatches = true;
                    } else {
                        card.style.opacity = '0.5';
                    }
                });
                
                // Show search results message
                if (hasMatches) {
                    alert(`Found quizzes matching "${searchInput}"`);
                } else {
                    alert(`No quizzes found matching "${searchInput}"`);
                }
                
                // Reset the highlighting after a delay
                setTimeout(() => {
                    allQuizCards.forEach(card => {
                        card.style.transform = '';
                        card.style.boxShadow = '';
                        card.style.opacity = '1';
                    });
                }, 3000);
            }
        });
    }
    
    // Collection cards animation
    const collectionCards = document.querySelectorAll('.collection-card');
    collectionCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const overlay = this.querySelector('.collection-overlay');
            overlay.style.background = 'linear-gradient(to top, rgba(108, 99, 255, 0.8) 0%, rgba(108, 99, 255, 0.2) 100%)';
        });
        
        card.addEventListener('mouseleave', function() {
            const overlay = this.querySelector('.collection-overlay');
            overlay.style.background = 'linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 100%)';
        });
    });
    
    // Filter and Sort functionality
    const filterButtons = document.querySelectorAll('.search-filter-bar .dropdown-item');
    filterButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const filterType = this.textContent;
            console.log(`Filtering by: ${filterType}`);
            
            // Update dropdown button text to show selected filter
            const dropdownButton = this.closest('.dropdown').querySelector('.dropdown-toggle');
            if (dropdownButton) {
                if (dropdownButton.textContent.includes('Filter')) {
                    dropdownButton.innerHTML = `<i class="fas fa-filter me-2"></i> ${filterType}`;
                } else if (dropdownButton.textContent.includes('Sort')) {
                    dropdownButton.innerHTML = `<i class="fas fa-sort me-2"></i> ${filterType}`;
                }
            }
            
            // Simulate filter/sort effect
            const quizCards = document.querySelectorAll('.quiz-card');
            
            // Simple animation to show the filtering effect
            quizCards.forEach(card => {
                card.style.opacity = '0.2';
                card.style.transform = 'scale(0.95)';
            });
            
            setTimeout(() => {
                quizCards.forEach(card => {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                });
                
                // If filtering by category, only show matching cards
                if (filterType !== 'All Categories' && dropdownButton.textContent.includes('Filter')) {
                    quizCards.forEach(card => {
                        const category = card.querySelector('.badge').textContent;
                        if (category.toLowerCase() !== filterType.toLowerCase()) {
                            // Just dimming for demo purposes instead of hiding
                            card.style.opacity = '0.5';
                        }
                    });
                }
            }, 500);
        });
    });
    
    // Topic tag hover effect
    const topicTags = document.querySelectorAll('.topic-tag');
    topicTags.forEach(tag => {
        tag.addEventListener('click', function(e) {
            e.preventDefault();
            const topic = this.textContent;
            console.log(`Selected topic: ${topic}`);
            
            // Highlight the selected tag
            topicTags.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            this.style.backgroundColor = 'var(--primary-color)';
            
            // Reset other tags
            setTimeout(() => {
                this.style.backgroundColor = '';
            }, 3000);
        });
    });

    // Get all necessary elements
    const historyLink = document.getElementById('historyLink');
    const leaderboardLink = document.getElementById('leaderboardLink');
    const historySection = document.getElementById('historySection');
    const leaderboardSection = document.getElementById('leaderboardSection');
    const welcomeSection = document.getElementById('welcomeSection');
    const categorySection = document.getElementById('categorySection');
    const popularSection = document.getElementById('popularSection');
    const exploreSection = document.querySelector('.explore-section');
    const mainContent = document.querySelector('main');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    // Function to hide all sections
    function hideAllSections() {
        historySection.style.display = 'none';
        leaderboardSection.style.display = 'none';
        welcomeSection.style.display = 'none';
        categorySection.style.display = 'none';
        popularSection.style.display = 'none';
        exploreSection.style.display = 'none';
    }

    // Function to show all main sections
    function showAllSections() {
        historySection.style.display = 'none';
        leaderboardSection.style.display = 'none';
        welcomeSection.style.display = 'block';
        categorySection.style.display = 'block';
        popularSection.style.display = 'block';
        exploreSection.style.display = 'none';
    }

    // Function to update active navigation
    function updateActiveNav(activeLink) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    // History link click handler
    historyLink.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (historySection.style.display === 'none') {
            hideAllSections();
            historySection.style.display = 'block';
            updateActiveNav(historyLink);
        } else {
            showAllSections();
            updateActiveNav(document.querySelector('.nav-link[href="home.html"]'));
        }
    });

    // Leaderboard link click handler
    leaderboardLink.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (leaderboardSection.style.display === 'none') {
            hideAllSections();
            leaderboardSection.style.display = 'block';
            updateActiveNav(leaderboardLink);
        } else {
            showAllSections();
            updateActiveNav(document.querySelector('.nav-link[href="home.html"]'));
        }
    });

    // Explore link click handler
    document.querySelector('.nav-link[href="#explore-section"]').addEventListener('click', function(e) {
        e.preventDefault();
        hideAllSections();
        exploreSection.style.display = 'block';
        exploreSection.scrollIntoView({ behavior: 'smooth' });
        updateActiveNav(this);
    });

    // Home link click handler
    document.querySelector('.nav-link[href="home.html"]').addEventListener('click', function(e) {
        e.preventDefault();
        showAllSections();
        updateActiveNav(this);
    });

    // Leaderboard type toggle
    const leaderboardTypeButtons = document.querySelectorAll('.btn-group .btn');
    leaderboardTypeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const type = this.dataset.type;
            
            // Update button active state
            leaderboardTypeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show/hide leaderboard types
            document.querySelectorAll('.leaderboard-type').forEach(section => {
                section.style.display = section.dataset.type === type ? 'block' : 'none';
            });
        });
    });

    // Initialize sections
    showAllSections();
    
    // Notification handling
    const notificationItems = document.querySelectorAll('.notification-item');
    const notificationModal = new bootstrap.Modal(document.getElementById('notificationModal'));
    const notificationContent = document.querySelector('.notification-content');
    const notificationActionBtn = document.querySelector('.notification-action-btn');
    
    // Sample notification data (in a real app, this would come from a database)
    const notificationsData = {
        "1": {
            title: "New Quiz Added",
            content: `<div class="notification-detail">
                        <div class="notification-icon bg-primary mb-3">
                            <i class="fas fa-flask fa-2x"></i>
                        </div>
                        <h4>Space Exploration Quiz</h4>
                        <p>A new quiz has been added to the Science category!</p>
                        <p>Test your knowledge about space, planets, and space missions in this exciting new quiz.</p>
                        <div class="quiz-meta mt-3">
                            <div><i class="fas fa-question-circle me-2"></i> 20 Questions</div>
                            <div><i class="fas fa-clock me-2"></i> 15 Minutes</div>
                            <div><i class="fas fa-star me-2"></i> Difficulty: Medium</div>
                        </div>
                     </div>`,
            actionText: "Take Quiz Now",
            actionHandler: function() {
                alert("Redirecting to Space Exploration Quiz...");
                notificationModal.hide();
            }
        },
        "2": {
            title: "Achievement Unlocked",
            content: `<div class="notification-detail text-center">
                        <div class="achievement-icon mb-3">
                            <i class="fas fa-award fa-3x text-warning"></i>
                        </div>
                        <h4>Science Explorer</h4>
                        <p class="badge bg-success mb-3">Achievement Unlocked</p>
                        <p>Congratulations! You've completed 3 science quizzes with a score of 80% or higher.</p>
                        <p>This achievement has earned you 50 bonus XP!</p>
                        <div class="progress mt-3">
                            <div class="progress-bar bg-info" role="progressbar" style="width: 75%" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                        <p class="small mt-2">75% progress towards your next achievement</p>
                     </div>`,
            actionText: "View All Achievements",
            actionHandler: function() {
                window.location.href = "profile.html#achievements";
            }
        },
        "3": {
            title: "Challenge Invitation",
            content: `<div class="notification-detail">
                        <div class="d-flex align-items-center mb-3">
                            <img src="https://via.placeholder.com/50" class="rounded-circle me-3" alt="Alex">
                            <div>
                                <h5 class="mb-0">Alex Johnson</h5>
                                <small class="text-muted">@alexj • Top 5 Player</small>
                            </div>
                        </div>
                        <div class="challenge-card p-3 rounded mb-3">
                            <h5>History Challenge</h5>
                            <p>Alex has challenged you to beat their score of 85% on the World War II quiz!</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <span><i class="fas fa-trophy text-warning"></i> 100 XP Bonus if you win</span>
                                <span>Expires in 24 hours</span>
                            </div>
                        </div>
                        <p class="text-center">Do you accept this challenge?</p>
                     </div>`,
            actionText: "Accept Challenge",
            actionHandler: function() {
                alert("Challenge accepted! Good luck!");
                notificationModal.hide();
            }
        }
    };
    
    notificationItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get notification data
            const notificationId = this.dataset.notificationId;
            const notificationData = notificationsData[notificationId];
            
            if (notificationData) {
                // Update modal title
                document.getElementById('notificationModalLabel').textContent = notificationData.title;
                
                // Update modal content
                notificationContent.innerHTML = notificationData.content;
                
                // Update action button
                notificationActionBtn.textContent = notificationData.actionText;
                
                // Clear previous event listeners
                const newActionBtn = notificationActionBtn.cloneNode(true);
                notificationActionBtn.parentNode.replaceChild(newActionBtn, notificationActionBtn);
                
                // Add new event listener
                newActionBtn.addEventListener('click', notificationData.actionHandler);
                
                // Show modal
                notificationModal.show();
            }
        });
    });
}); 

