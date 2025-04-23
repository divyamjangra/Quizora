// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Handle tab navigation
    const tabLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    const tabContents = document.querySelectorAll('.tab-pane');

    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            tabLinks.forEach(tabLink => {
                tabLink.classList.remove('active');
            });
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Get the target tab
            const target = this.getAttribute('href');
            
            // Hide all tab contents
            tabContents.forEach(content => {
                content.classList.remove('show', 'active');
            });
            
            // Show the target tab content
            document.querySelector(target).classList.add('show', 'active');
        });
    });

    // Handle edit profile button
    const editProfileBtn = document.querySelector('.edit-profile-btn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function() {
            // Simulate file upload dialog
            alert('Profile picture upload functionality would be implemented here');
        });
    }

    // Handle edit profile button in overview tab
    const editProfileInfoBtn = document.querySelector('.profile-card .btn-outline-info');
    if (editProfileInfoBtn) {
        editProfileInfoBtn.addEventListener('click', function() {
            // Switch to settings tab
            tabLinks.forEach(tabLink => {
                tabLink.classList.remove('active');
                if (tabLink.getAttribute('href') === '#settings') {
                    tabLink.classList.add('active');
                }
            });
            
            // Hide all tab contents
            tabContents.forEach(content => {
                content.classList.remove('show', 'active');
            });
            
            // Show settings tab
            document.querySelector('#settings').classList.add('show', 'active');
        });
    }

    // Handle form submission
    const settingsForm = document.querySelector('#settings form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Show saving indicator
            const saveBtn = this.querySelector('button[type="submit"]');
            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
            saveBtn.disabled = true;
            
            // Simulate save operation
            setTimeout(() => {
                saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
                
                // Reset button after a delay
                setTimeout(() => {
                    saveBtn.innerHTML = originalText;
                    saveBtn.disabled = false;
                    
                    // Show success toast or message
                    alert('Profile settings saved successfully!');
                }, 1500);
            }, 2000);
        });
    }

    // Handle delete account button
    const deleteAccountBtn = document.querySelector('.btn-outline-danger');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                alert('Account deletion process would be initiated here.');
            }
        });
    }

    // Initialize stat numbers animation
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

    // URL hash handling for deep linking to tabs
    function handleHash() {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#')) {
            const tabId = hash;
            const tabLink = document.querySelector(`.sidebar-nav .nav-link[href="${tabId}"]`);
            
            if (tabLink) {
                // Trigger click on the tab link
                tabLink.click();
            }
        }
    }
    
    // Check hash on page load
    handleHash();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHash);
}); 