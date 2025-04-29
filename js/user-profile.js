/**
 * QUIZORA USER PROFILE POPUP
 * 
 * This file contains functionality for the user profile popup that shows:
 * - User profile picture and name
 * - Current subscription tier with badge (Free/Pro/Pro Plus)
 * - Special animations for Pro and Pro Plus users
 * - Remaining usage quota
 * - Upgrade prompt
 */

class UserProfilePopup {
    constructor() {
        // Subscription tier data
        this.subscriptionTiers = {
            free: {
                name: 'Free',
                badgeClass: 'free-badge',
                dailyLimit: 5,
                animation: false,
                color: '#6c757d'
            },
            pro: {
                name: 'Pro',
                badgeClass: 'pro-badge',
                dailyLimit: 50,
                animation: true,
                color: '#a864fd'
            },
            proplus: {
                name: 'Pro Plus',
                badgeClass: 'proplus-badge',
                dailyLimit: Infinity,
                animation: true,
                color: '#ff6b6b'
            }
        };
        
        // State variables
        this.currentUser = null;
        this.subscription = null;
        this.usageToday = 0;
        this.popupElement = null;
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize the user profile popup
     */
    init() {
        // Create popup element if it doesn't exist
        if (!document.getElementById('userProfilePopup')) {
            this.createPopupElement();
        } else {
            this.popupElement = document.getElementById('userProfilePopup');
        }
        
        // Load user data
        this.loadUserData();
        
        // Add click event to profile image and the entire profile section
        const profilePic = document.querySelector('.profile-pic');
        const profileSettings = document.querySelector('.profile-settings');
        
        if (profilePic) {
            profilePic.addEventListener('click', (e) => {
                e.stopPropagation();
                this.togglePopup();
            });
        }
        
        if (profileSettings) {
            profileSettings.addEventListener('click', (e) => {
                e.stopPropagation();
                this.togglePopup();
            });
        }
        
        // Close popup when clicking outside
        document.addEventListener('click', (e) => {
            if (this.popupElement && 
                this.popupElement.style.display === 'block' && 
                !this.popupElement.contains(e.target)) {
                this.hidePopup();
            }
        });
    }
    
    /**
     * Create the popup element and append to body
     */
    createPopupElement() {
        const popupDiv = document.createElement('div');
        popupDiv.id = 'userProfilePopup';
        popupDiv.classList.add('user-profile-popup');
        popupDiv.style.display = 'none';
        
        // Initial content will be updated later
        popupDiv.innerHTML = `
            <div class="popup-loading">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(popupDiv);
        this.popupElement = popupDiv;
        
        // Add CSS if not already included
        if (!document.getElementById('userProfileStyles')) {
            this.addStyles();
        }
    }
    
    /**
     * Add required CSS styles
     */
    addStyles() {
        const styleElement = document.createElement('style');
        styleElement.id = 'userProfileStyles';
        styleElement.textContent = `
            .user-profile-popup {
                position: absolute;
                width: 320px;
                background-color: #1a1a1a;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                z-index: 1000;
                overflow: hidden;
                font-family: 'Montserrat', sans-serif;
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: white;
            }
            
            .popup-header {
                padding: 20px;
                display: flex;
                align-items: center;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .popup-user-avatar {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                object-fit: cover;
                border: 2px solid #05bcfe;
            }
            
            .popup-user-info {
                margin-left: 15px;
            }
            
            .popup-user-name {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 5px;
                display: flex;
                align-items: center;
            }
            
            .subscription-badge {
                margin-left: 10px;
                padding: 3px 8px;
                border-radius: 50px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
            }
            
            .free-badge {
                background-color: #6c757d;
                color: white;
            }
            
            .pro-badge {
                background: linear-gradient(90deg, #a864fd, #8d63f7);
                color: white;
                box-shadow: 0 0 10px rgba(168, 100, 253, 0.7);
                animation: pulsePro 2s infinite;
            }
            
            .proplus-badge {
                background: linear-gradient(90deg, #ff6b6b, #ff4f4f);
                color: white;
                box-shadow: 0 0 15px rgba(255, 107, 107, 0.7);
                animation: pulseProPlus 2s infinite;
            }
            
            @keyframes pulsePro {
                0% { box-shadow: 0 0 10px rgba(168, 100, 253, 0.7); }
                50% { box-shadow: 0 0 20px rgba(168, 100, 253, 0.9); }
                100% { box-shadow: 0 0 10px rgba(168, 100, 253, 0.7); }
            }
            
            @keyframes pulseProPlus {
                0% { box-shadow: 0 0 15px rgba(255, 107, 107, 0.7); }
                50% { box-shadow: 0 0 30px rgba(255, 107, 107, 0.9); transform: scale(1.05); }
                100% { box-shadow: 0 0 15px rgba(255, 107, 107, 0.7); }
            }
            
            .popup-user-email {
                font-size: 14px;
                color: rgba(255, 255, 255, 0.7);
            }
            
            .popup-content {
                padding: 20px;
            }
            
            .popup-section {
                margin-bottom: 20px;
            }
            
            .popup-section-title {
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
            }
            
            .popup-section-title i {
                margin-right: 10px;
                color: #05bcfe;
            }
            
            .usage-info {
                background-color: rgba(255, 255, 255, 0.05);
                border-radius: 10px;
                padding: 15px;
            }
            
            .usage-progress {
                margin: 10px 0;
                height: 8px;
                background-color: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                overflow: hidden;
            }
            
            .usage-bar {
                height: 100%;
                border-radius: 4px;
                background-color: #05bcfe;
                transition: width 0.3s ease;
            }
            
            .usage-text {
                display: flex;
                justify-content: space-between;
                font-size: 14px;
                color: rgba(255, 255, 255, 0.8);
            }
            
            .upgrade-btn {
                display: block;
                width: 100%;
                padding: 12px;
                background: linear-gradient(90deg, #05bcfe, #04a0d8);
                color: white;
                border: none;
                border-radius: 5px;
                font-weight: 600;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
                text-decoration: none;
            }
            
            .upgrade-btn:hover {
                background: linear-gradient(90deg, #04a0d8, #038bbd);
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(5, 188, 254, 0.3);
            }
            
            .popup-footer {
                padding: 15px 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: space-between;
            }
            
            .popup-footer-link {
                color: rgba(255, 255, 255, 0.7);
                font-size: 14px;
                transition: color 0.3s ease;
                text-decoration: none;
            }
            
            .popup-footer-link:hover {
                color: white;
            }
            
            .popup-loading {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 200px;
            }
            
            .premium-benefits {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.7);
                margin-top: 10px;
            }
            
            .premium-benefits ul {
                list-style-type: none;
                padding-left: 5px;
                margin-top: 5px;
            }
            
            .premium-benefits li {
                margin-bottom: 5px;
                display: flex;
                align-items: flex-start;
            }
            
            .premium-benefits li i {
                color: #05bcfe;
                margin-right: 5px;
                margin-top: 3px;
                font-size: 10px;
            }
            
            /* Pro+ Special Animation */
            .proplus-user .popup-header {
                position: relative;
                overflow: hidden;
            }
            
            .proplus-user .popup-header::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: linear-gradient(
                    60deg,
                    rgba(255, 107, 107, 0) 30%,
                    rgba(255, 107, 107, 0.1) 50%,
                    rgba(255, 107, 107, 0) 70%
                );
                animation: shine 3s infinite linear;
                pointer-events: none;
            }
            
            @keyframes shine {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        
        document.head.appendChild(styleElement);
    }
    
    /**
     * Load user data and subscription info
     */
    loadUserData() {
        // In a real application, this would come from your backend
        // For demo purposes, we'll use mock data and localStorage
        
        // Mock user data
        this.currentUser = {
            name: 'Alex Johnson',
            email: 'alex@example.com',
            profilePic: 'https://randomuser.me/api/portraits/men/32.jpg' // placeholder image
        };
        
        // Check if user has a subscription
        const subscriptionData = localStorage.getItem('quizora_subscription');
        
        if (subscriptionData) {
            this.subscription = JSON.parse(subscriptionData);
        } else {
            // Default to free plan if no subscription found
            this.subscription = {
                plan: 'free',
                isActive: true
            };
        }
        
        // Simulate usage
        this.usageToday = this.getSimulatedUsage();
    }
    
    /**
     * Get simulated usage based on subscription tier
     * @returns {number} - The number of quizzes used today
     */
    getSimulatedUsage() {
        const tier = this.subscriptionTiers[this.subscription.plan];
        // For demo purposes, generate a random usage count
        return Math.min(Math.floor(Math.random() * (tier.dailyLimit + 1)), tier.dailyLimit);
    }
    
    /**
     * Toggle popup visibility
     */
    togglePopup() {
        if (this.popupElement.style.display === 'block') {
            this.hidePopup();
        } else {
            this.showPopup();
        }
    }
    
    /**
     * Show popup and update content
     */
    showPopup() {
        // Position the popup relative to the profile picture
        const profilePic = document.querySelector('.profile-pic');
        if (profilePic) {
            const rect = profilePic.getBoundingClientRect();
            this.popupElement.style.top = `${rect.bottom + window.scrollY + 10}px`;
            this.popupElement.style.right = `${window.innerWidth - rect.right - window.scrollX}px`;
        } else {
            // Default position
            this.popupElement.style.top = '80px';
            this.popupElement.style.right = '20px';
        }
        
        // Update popup content
        this.updatePopupContent();
        
        // Show popup
        this.popupElement.style.display = 'block';
    }
    
    /**
     * Hide popup
     */
    hidePopup() {
        this.popupElement.style.display = 'none';
    }
    
    /**
     * Update popup content with user and subscription data
     */
    updatePopupContent() {
        if (!this.currentUser || !this.subscription) {
            return;
        }
        
        const tier = this.subscriptionTiers[this.subscription.plan];
        const remainingQuizzes = tier.dailyLimit === Infinity ? 
            '∞' : (tier.dailyLimit - this.usageToday);
        
        // Add special class for Pro+ users to enable advanced animations
        this.popupElement.className = 'user-profile-popup';
        if (this.subscription.plan === 'proplus') {
            this.popupElement.classList.add('proplus-user');
        }
        
        // Calculate progress percentage for progress bar
        const progressPercentage = tier.dailyLimit === Infinity ? 
            10 : ((this.usageToday / tier.dailyLimit) * 100);
        
        this.popupElement.innerHTML = `
            <div class="popup-header">
                <img src="${this.currentUser.profilePic}" alt="Profile" class="popup-user-avatar">
                <div class="popup-user-info">
                    <div class="popup-user-name">
                        ${this.currentUser.name}
                        <span class="subscription-badge ${tier.badgeClass}">${tier.name}</span>
                    </div>
                    <div class="popup-user-email">${this.currentUser.email}</div>
                </div>
            </div>
            
            <div class="popup-content">
                <div class="popup-section">
                    <div class="popup-section-title">
                        <i class="fas fa-chart-pie"></i> Daily Usage
                    </div>
                    <div class="usage-info">
                        <div class="usage-progress">
                            <div class="usage-bar" style="width: ${progressPercentage}%; background-color: ${tier.color};"></div>
                        </div>
                        <div class="usage-text">
                            <span>Used: ${this.usageToday} quiz${this.usageToday === 1 ? '' : 'zes'}</span>
                            <span>Remaining: ${remainingQuizzes}</span>
                        </div>
                    </div>
                </div>
                
                ${this.subscription.plan === 'free' ? `
                <div class="popup-section">
                    <div class="popup-section-title">
                        <i class="fas fa-crown"></i> Upgrade to Premium
                    </div>
                    <a href="purchase.html?plan=pro" class="upgrade-btn">Upgrade Now</a>
                    <div class="premium-benefits">
                        <div>Premium benefits include:</div>
                        <ul>
                            <li><i class="fas fa-circle"></i> 50 AI-generated quizzes per day</li>
                            <li><i class="fas fa-circle"></i> Advanced features and analytics</li>
                            <li><i class="fas fa-circle"></i> Ad-free experience</li>
                        </ul>
                    </div>
                </div>
                ` : ''}
                
                ${this.subscription.plan === 'pro' ? `
                <div class="popup-section">
                    <div class="popup-section-title">
                        <i class="fas fa-crown"></i> Upgrade to Pro Plus
                    </div>
                    <a href="purchase.html?plan=proplus" class="upgrade-btn">Upgrade to Pro Plus</a>
                    <div class="premium-benefits">
                        <div>Pro Plus benefits include:</div>
                        <ul>
                            <li><i class="fas fa-circle"></i> Unlimited AI-generated quizzes</li>
                            <li><i class="fas fa-circle"></i> 24/7 priority support</li>
                            <li><i class="fas fa-circle"></i> Team collaboration features</li>
                        </ul>
                    </div>
                </div>
                ` : ''}
            </div>
            
            <div class="popup-footer">
                <a href="settings.html" class="popup-footer-link">Account Settings</a>
                <a href="#" class="popup-footer-link" id="logoutLink">Sign Out</a>
            </div>
        `;
        
        // Add logout event listener
        const logoutLink = this.popupElement.querySelector('#logoutLink');
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
    }
    
    /**
     * Handle user logout
     */
    handleLogout() {
        if (confirm('Are you sure you want to log out?')) {
            // In a real application, this would call your logout API
            console.log('User logging out...');
            // Redirect to login page
            window.location.href = 'auth.html';
        }
    }
}

// Initialize the user profile popup when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create the popup
    window.userProfilePopup = new UserProfilePopup();
    
    // Add profile pic click event if the element exists
    // This might be added later by other scripts, so we'll add a mutation observer
    if (!document.querySelector('.profile-pic') && !document.querySelector('.profile-settings')) {
        // Set up an observer to watch for additions to the body
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    const profilePic = document.querySelector('.profile-pic');
                    const profileSettings = document.querySelector('.profile-settings');
                    
                    if (profilePic && !profilePic._hasClickEvent) {
                        profilePic.addEventListener('click', (e) => {
                            e.stopPropagation();
                            window.userProfilePopup.togglePopup();
                        });
                        profilePic._hasClickEvent = true;
                    }
                    
                    if (profileSettings && !profileSettings._hasClickEvent) {
                        profileSettings.addEventListener('click', (e) => {
                            e.stopPropagation();
                            window.userProfilePopup.togglePopup();
                        });
                        profileSettings._hasClickEvent = true;
                    }
                    
                    if ((profilePic && profilePic._hasClickEvent) && 
                        (profileSettings && profileSettings._hasClickEvent)) {
                        observer.disconnect();
                    }
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}); 
