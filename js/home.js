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

    // Add smooth scrolling and content toggling for navigation links
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const mainContent = document.querySelector('main');
    const exploreSection = document.querySelector('#explore-section');
    
    // Initially hide the explore section
    if (exploreSection) {
        exploreSection.style.display = 'none';
    }
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active class on navigation
            navLinks.forEach(nl => nl.classList.remove('active'));
            this.classList.add('active');
            
            const href = this.getAttribute('href');
            
            if (href === '#explore-section') {
                // Hide main content, show explore section with fade animation
                if (mainContent) {
                    mainContent.style.opacity = '0';
                    setTimeout(() => {
                        mainContent.style.display = 'none';
                        exploreSection.style.display = 'block';
                        setTimeout(() => {
                            exploreSection.style.opacity = '1';
                        }, 50);
                    }, 300);
                }
            } else {
                // Show main content, hide explore section with fade animation
                if (exploreSection) {
                    exploreSection.style.opacity = '0';
                    setTimeout(() => {
                        exploreSection.style.display = 'none';
                        mainContent.style.display = 'block';
                        setTimeout(() => {
                            mainContent.style.opacity = '1';
                        }, 50);
                    }, 300);
                }
            }
        });
    });
}); 
