// Theme Switcher Script for Quizora

document.addEventListener('DOMContentLoaded', function() {
    // Get theme toggle button
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const html = document.documentElement;
    
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        enableLightMode(false); // No animation on initial load
    } else if (savedTheme === 'dark') {
        enableDarkMode(false); // No animation on initial load
    } else {
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            enableLightMode(false);
        } else {
            // Default to dark theme if no preference is saved
            enableDarkMode(false);
        }
    }

    // Add event listener to toggle theme with animation
    themeToggle.addEventListener('click', function() {
        // Add animation to the theme toggle button
        this.classList.add('animate__animated', 'animate__rubberBand');
        setTimeout(() => {
            this.classList.remove('animate__animated', 'animate__rubberBand');
        }, 1000);
        
        if (body.classList.contains('light-theme')) {
            enableDarkMode(true);
        } else {
            enableLightMode(true);
        }
    });

    // Function to enable light theme
    function enableLightMode(animate) {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        html.classList.remove('bg-dark');
        html.classList.add('bg-light');
        body.classList.remove('bg-dark');
        body.classList.add('bg-light');
        themeToggle.innerHTML = '🌙';
        localStorage.setItem('theme', 'light');
        
        // Update text colors for better contrast in light mode
        document.querySelectorAll('.text-white, .text-light').forEach(el => {
            if (!el.closest('button') && !el.closest('.feature-card') && !el.closest('.footer')) {
                el.classList.remove('text-white', 'text-light');
                el.classList.add('text-dark');
                
                // Add fade animation if requested
                if (animate) {
                    el.classList.add('animate__animated', 'animate__fadeIn');
                    el.style.animationDuration = '0.5s';
                    setTimeout(() => {
                        el.classList.remove('animate__animated', 'animate__fadeIn');
                    }, 500);
                }
            }
        });
        
        // Update feature cards for light mode
        document.querySelectorAll('.feature-card').forEach(card => {
            card.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
        });
        
        // Update testimonial cards for light mode
        document.querySelectorAll('.testimonial-card').forEach(card => {
            card.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            card.style.borderColor = 'rgba(0, 0, 0, 0.1)';
        });
        
        // Update demo section for light mode
        document.querySelectorAll('.demo-screen').forEach(demo => {
            demo.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            demo.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
        });
        
        // Add transition overlay if animating
        if (animate) {
            addTransitionOverlay();
        }
    }

    // Function to enable dark theme
    function enableDarkMode(animate) {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        html.classList.remove('bg-light');
        html.classList.add('bg-dark');
        body.classList.remove('bg-light');
        body.classList.add('bg-dark');
        themeToggle.innerHTML = '🌞';
        localStorage.setItem('theme', 'dark');
        
        // Restore text colors for dark mode
        document.querySelectorAll('.text-dark').forEach(el => {
            if (!el.closest('button')) {
                el.classList.remove('text-dark');
                el.classList.add('text-white');
                
                // Add fade animation if requested
                if (animate) {
                    el.classList.add('animate__animated', 'animate__fadeIn');
                    el.style.animationDuration = '0.5s';
                    setTimeout(() => {
                        el.classList.remove('animate__animated', 'animate__fadeIn');
                    }, 500);
                }
            }
        });
        
        // Update feature cards for dark mode
        document.querySelectorAll('.feature-card').forEach(card => {
            card.style.backgroundColor = 'rgba(20, 20, 40, 0.7)';
            card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
        });
        
        // Update testimonial cards for dark mode
        document.querySelectorAll('.testimonial-card').forEach(card => {
            card.style.backgroundColor = 'rgba(20, 20, 40, 0.7)';
            card.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        });
        
        // Update demo section for dark mode
        document.querySelectorAll('.demo-screen').forEach(demo => {
            demo.style.backgroundColor = 'rgba(20, 20, 40, 0.8)';
            demo.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
        });
        
        // Add transition overlay if animating
        if (animate) {
            addTransitionOverlay();
        }
    }
    
    // Function to add transition overlay effect
    function addTransitionOverlay() {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        overlay.style.zIndex = '9999';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s ease';
        overlay.style.pointerEvents = 'none';
        
        // Add to body
        document.body.appendChild(overlay);
        
        // Trigger animation
        setTimeout(() => {
            overlay.style.opacity = '1';
            
            setTimeout(() => {
                overlay.style.opacity = '0';
                
                setTimeout(() => {
                    document.body.removeChild(overlay);
                }, 300);
            }, 300);
        }, 10);
    }
    
    // Listen for system theme changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
            if (e.matches) {
                enableLightMode(true);
            } else {
                enableDarkMode(true);
            }
        });
    }
}); 