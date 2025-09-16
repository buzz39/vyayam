// App Initialization Script
(function() {
    'use strict';
    
    // Wait for DOM to be ready
    function initializeApp() {
        // Check if app is already initialized
        if (window.app && typeof window.app === 'object') {
            console.log('App already initialized');
            return;
        }
        
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
            setTimeout(initializeApp, 100);
            return;
        }
        
        // Ensure sync button is visible and functional
        const syncBtn = document.getElementById('connectSheetsBtn');
        if (syncBtn) {
            syncBtn.style.display = 'flex';
            console.log('Sync button is visible');
        }
        
        // Expose app globally for debugging
        window.vyayamApp = window.app;
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