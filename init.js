// App Initialization Script with User Session Support
(function() {
    'use strict';
    
    let userSessionManager;
    
    // Wait for DOM to be ready
    async function initializeApp() {
        console.log('Starting app initialization with user sessions...');
        
        // Check if app is already initialized
        if (window.app && typeof window.app === 'object') {
            console.log('App already initialized');
            return;
        }
        
        // Initialize user session manager
        if (typeof UserSessionManager !== 'undefined') {
            userSessionManager = new UserSessionManager();
            await userSessionManager.init();
            
            // Show user selection and wait for user selection
            await new Promise((resolve) => {
                userSessionManager.showUserSelection((selectedUser) => {
                    console.log('User selected:', selectedUser.name);
                    updateUserUI(selectedUser);
                    initializeAppWithUser(selectedUser);
                    resolve();
                });
            });
        } else {
            console.log('UserSessionManager not available, falling back to original initialization');
            initializeAppWithUser(null);
        }
    }
    
    function initializeAppWithUser(user) {
        // Check if VyayamAppWithSheets is available (from sheets-api.js)
        if (typeof VyayamAppWithSheets !== 'undefined') {
            console.log('Initializing with Google Sheets integration');
            window.app = new VyayamAppWithSheets();
        } else if (typeof VyayamApp !== 'undefined') {
            console.log('Initializing with static data');
            window.app = new VyayamApp();
        } else {
            console.error('No app class available for initialization');
            // Retry after a short delay
            setTimeout(() => initializeAppWithUser(user), 100);
            return;
        }
        
        // Set user context in app
        if (window.app && user) {
            window.app.currentUser = user;
            window.app.userManager = userSessionManager ? userSessionManager.userManager : null;
        }
        
        // Ensure sync button is visible and functional
        const syncBtn = document.getElementById('connectSheetsBtn');
        if (syncBtn) {
            syncBtn.style.display = 'flex';
            console.log('Sync button is visible');
        }
        
        // Setup user switcher functionality
        setupUserSwitcher();
        
        // Expose app globally for debugging
        window.vyayamApp = window.app;
        window.userManager = userSessionManager;
    }
    
    function updateUserUI(user) {
        // Update header with current user info
        const userSwitcher = document.getElementById('userSwitcher');
        const userAvatar = document.getElementById('currentUserAvatar');
        const userName = document.getElementById('currentUserName');
        
        if (userSwitcher && userAvatar && userName) {
            userAvatar.textContent = user.avatar;
            userName.textContent = user.name;
            userSwitcher.style.display = 'flex';
        }
    }
    
    function setupUserSwitcher() {
        const userSwitcher = document.getElementById('userSwitcher');
        if (userSwitcher && userSessionManager) {
            userSwitcher.addEventListener('click', () => {
                // Show user selection modal to switch users
                userSessionManager.showUserSelection((selectedUser) => {
                    console.log('Switching to user:', selectedUser.name);
                    updateUserUI(selectedUser);
                    
                    // Reload the app with new user context
                    if (window.app && window.app.userManager) {
                        window.app.currentUser = selectedUser;
                        // Trigger reload of user-specific data
                        if (typeof window.app.loadWorkoutData === 'function') {
                            window.app.loadWorkoutData();
                        }
                    }
                });
            });
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        // DOM is already ready
        initializeApp();
    }
    
    // Also try initialization after scripts load
    window.addEventListener('load', initializeApp);
})();