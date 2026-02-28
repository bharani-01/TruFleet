/**
 * TruFleet Authentication Middleware
 * Include this script at the top of any protected page
 * Redirects to login.html if user is not authenticated
 */

(function() {
    'use strict';
    
    // Check if user is authenticated
    function checkAuth() {
        const currentUser = localStorage.getItem('trufleet_user');
        
        // If no user data found, redirect to login
        if (!currentUser) {
            console.warn('No authentication found. Redirecting to login...');
            window.location.href = 'register.html';
            return false;
        }
        
        try {
            // Validate user data structure
            const user = JSON.parse(currentUser);
            if (!user.email || !user.name) {
                console.warn('Invalid user data. Redirecting to login...');
                localStorage.removeItem('trufleet_user');
                window.location.href = 'register.html';
                return false;
            }
            
            // User is authenticated
            return true;
        } catch (err) {
            console.error('Error parsing user data:', err);
            localStorage.removeItem('trufleet_user');
            window.location.href = 'register.html';
            return false;
        }
    }
    
    // Run authentication check immediately
    checkAuth();
    
    // Also expose a logout function globally
    window.logout = function() {
        if (confirm('Are you sure you want to log out?')) {
            localStorage.removeItem('trufleet_user');
            localStorage.removeItem('rememberMe');
            window.location.href = 'register.html';
        }
    };
    
    // Display user info in navbar (if user icon exists)
    function displayUserInfo() {
        const currentUser = localStorage.getItem('trufleet_user');
        if (!currentUser) return;
        
        try {
            const user = JSON.parse(currentUser);
            
            // Find user icon/account link and add click handler
            const accountLinks = document.querySelectorAll('a[href="account.html"]');
            accountLinks.forEach(link => {
                // You can optionally show user name/initials here
                link.title = `${user.name} (${user.email})`;
            });
        } catch (err) {
            console.error('Error displaying user info:', err);
        }
    }
    
    // Run after DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', displayUserInfo);
    } else {
        displayUserInfo();
    }
})();
