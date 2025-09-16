// Vyayam User Management System
class UserManager {
    constructor() {
        this.currentUser = null;
        this.users = new Map();
        this.storageKey = 'vyayam_users';
        this.currentUserKey = 'vyayam_current_user';
        this.init();
    }

    async init() {
        await this.loadUsers();
        await this.loadCurrentUser();
    }

    // Load users from localStorage
    async loadUsers() {
        try {
            const usersData = localStorage.getItem(this.storageKey);
            if (usersData) {
                const parsed = JSON.parse(usersData);
                this.users = new Map(Object.entries(parsed));
            }
        } catch (error) {
            console.error('Error loading users:', error);
            this.users = new Map();
        }
    }

    // Load current user
    async loadCurrentUser() {
        const currentUserId = localStorage.getItem(this.currentUserKey);
        if (currentUserId && this.users.has(currentUserId)) {
            this.currentUser = this.users.get(currentUserId);
        }
    }

    // Save users to localStorage
    saveUsers() {
        try {
            const usersObj = Object.fromEntries(this.users);
            localStorage.setItem(this.storageKey, JSON.stringify(usersObj));
        } catch (error) {
            console.error('Error saving users:', error);
        }
    }

    // Save current user
    saveCurrentUser() {
        if (this.currentUser) {
            localStorage.setItem(this.currentUserKey, this.currentUser.id);
        }
    }

    // Create a new user
    createUser(name, avatar = '💪') {
        const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const user = {
            id: userId,
            name: name.trim(),
            avatar: avatar,
            createdAt: new Date().toISOString(),
            lastActiveAt: new Date().toISOString(),
            // Google Sheets config
            sheetsUrl: null,
            apiKey: null,
            // Workout progress
            workoutProgress: {},
            completedExercises: [],
            currentDay: null,
            // Preferences
            preferences: {
                theme: 'light',
                autoAdvance: true,
                showTimer: true,
                soundEnabled: true
            }
        };

        this.users.set(userId, user);
        this.saveUsers();
        return user;
    }

    // Switch to a user
    switchToUser(userId) {
        if (this.users.has(userId)) {
            this.currentUser = this.users.get(userId);
            this.currentUser.lastActiveAt = new Date().toISOString();
            this.updateUser(this.currentUser);
            this.saveCurrentUser();
            return true;
        }
        return false;
    }

    // Update user data
    updateUser(userData) {
        if (userData && userData.id && this.users.has(userData.id)) {
            this.users.set(userData.id, { ...userData });
            this.saveUsers();
            
            // Update current user if it's the same
            if (this.currentUser && this.currentUser.id === userData.id) {
                this.currentUser = this.users.get(userData.id);
            }
            return true;
        }
        return false;
    }

    // Delete a user
    deleteUser(userId) {
        if (this.users.has(userId)) {
            this.users.delete(userId);
            this.saveUsers();
            
            // If deleting current user, clear current user
            if (this.currentUser && this.currentUser.id === userId) {
                this.currentUser = null;
                localStorage.removeItem(this.currentUserKey);
            }
            return true;
        }
        return false;
    }

    // Get all users
    getAllUsers() {
        return Array.from(this.users.values()).sort((a, b) => 
            new Date(b.lastActiveAt) - new Date(a.lastActiveAt)
        );
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user has any users
    hasUsers() {
        return this.users.size > 0;
    }

    // Get user-specific storage key
    getUserStorageKey(key) {
        if (!this.currentUser) return null;
        return `${key}_${this.currentUser.id}`;
    }

    // Get user-specific data with fallback to user object
    getUserData(key, defaultValue = null) {
        if (!this.currentUser) return defaultValue;
        return this.currentUser[key] || defaultValue;
    }

    // Set user-specific data
    setUserData(key, value) {
        if (!this.currentUser) return false;
        this.currentUser[key] = value;
        this.updateUser(this.currentUser);
        return true;
    }

    // Migrate existing localStorage data to default user
    async migrateExistingData() {
        const existingSheetUrl = localStorage.getItem('vyayam_sheet_url');
        const existingApiKey = localStorage.getItem('vyayam_api_key');
        
        if (existingSheetUrl || existingApiKey || !this.hasUsers()) {
            // Create default user with existing data
            const defaultUser = this.createUser('Default User', '🏋️');
            
            if (existingSheetUrl) {
                defaultUser.sheetsUrl = existingSheetUrl;
                localStorage.removeItem('vyayam_sheet_url');
            }
            
            if (existingApiKey) {
                defaultUser.apiKey = existingApiKey;
                localStorage.removeItem('vyayam_api_key');
            }

            // Update the user
            this.updateUser(defaultUser);
            
            // Switch to default user
            this.switchToUser(defaultUser.id);
            
            console.log('Migrated existing data to default user');
            return defaultUser;
        }
        
        return null;
    }

    // Export user data (for backup)
    exportUserData(userId = null) {
        const targetId = userId || (this.currentUser ? this.currentUser.id : null);
        if (targetId && this.users.has(targetId)) {
            return JSON.stringify(this.users.get(targetId), null, 2);
        }
        return null;
    }

    // Import user data (for restore)
    importUserData(userData) {
        try {
            const user = JSON.parse(userData);
            if (user.id && user.name) {
                // Generate new ID if user already exists
                if (this.users.has(user.id)) {
                    user.id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                }
                
                this.users.set(user.id, user);
                this.saveUsers();
                return user;
            }
        } catch (error) {
            console.error('Error importing user data:', error);
        }
        return null;
    }

    // Get avatar options
    static getAvatarOptions() {
        return [
            '💪', '🏋️', '🤸', '🏃', '🚴', '🧘', '🥋', '🏊', 
            '🎯', '🔥', '⚡', '🌟', '🚀', '👑', '🎮', '🎨',
            '😊', '😎', '🤩', '😇', '🤗', '😋', '🤔', '😴'
        ];
    }
}

// User Session Manager - handles user selection flow
class UserSessionManager {
    constructor() {
        this.userManager = new UserManager();
        this.onUserSelected = null;
    }

    async init() {
        await this.userManager.init();
        await this.userManager.migrateExistingData();
    }

    // Show user selection screen
    async showUserSelection(onUserSelected) {
        this.onUserSelected = onUserSelected;
        
        // Check if we have a current user and auto-login is enabled
        const currentUser = this.userManager.getCurrentUser();
        if (currentUser) {
            // Auto-select current user but still show selection after delay
            setTimeout(() => this.handleUserSelected(currentUser), 100);
            return;
        }

        // Create and show user selection modal
        this.createUserSelectionModal();
    }

    createUserSelectionModal() {
        // Remove existing modal if any
        const existingModal = document.getElementById('user-selection-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'user-selection-modal';
        modal.className = 'user-selection-modal';
        modal.innerHTML = `
            <div class="user-selection-content">
                <div class="user-selection-header">
                    <h2>🏋️ Welcome to Vyayam</h2>
                    <p>Select your profile or create a new one</p>
                </div>
                <div class="user-profiles" id="user-profiles">
                    ${this.renderUserProfiles()}
                </div>
                <div class="user-selection-actions">
                    <button class="btn-create-user" id="btn-create-user">
                        <span>➕ Create New Profile</span>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupUserSelectionEvents();
    }

    renderUserProfiles() {
        const users = this.userManager.getAllUsers();
        if (users.length === 0) {
            return '<div class="no-users">No profiles yet. Create your first profile to get started!</div>';
        }

        return users.map(user => `
            <div class="user-profile-card" data-user-id="${user.id}">
                <div class="user-avatar">${user.avatar}</div>
                <div class="user-info">
                    <div class="user-name">${user.name}</div>
                    <div class="user-last-active">Last active: ${this.formatDate(user.lastActiveAt)}</div>
                    ${user.sheetsUrl ? '<div class="user-sheets-connected">📊 Google Sheets Connected</div>' : ''}
                </div>
                <div class="user-actions">
                    <button class="btn-select-user" data-user-id="${user.id}">Select</button>
                    <button class="btn-delete-user" data-user-id="${user.id}">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    setupUserSelectionEvents() {
        // Select user buttons
        document.querySelectorAll('.btn-select-user').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.target.dataset.userId;
                this.selectUser(userId);
            });
        });

        // Delete user buttons
        document.querySelectorAll('.btn-delete-user').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const userId = e.target.dataset.userId;
                this.deleteUser(userId);
            });
        });

        // Create user button
        document.getElementById('btn-create-user').addEventListener('click', () => {
            this.showCreateUserModal();
        });

        // User profile cards (click to select)
        document.querySelectorAll('.user-profile-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('btn-delete-user')) {
                    const userId = card.dataset.userId;
                    this.selectUser(userId);
                }
            });
        });
    }

    selectUser(userId) {
        if (this.userManager.switchToUser(userId)) {
            const user = this.userManager.getCurrentUser();
            this.handleUserSelected(user);
        }
    }

    deleteUser(userId) {
        const user = this.userManager.users.get(userId);
        if (user && confirm(`Delete profile "${user.name}"? This cannot be undone.`)) {
            this.userManager.deleteUser(userId);
            // Refresh the user list
            document.getElementById('user-profiles').innerHTML = this.renderUserProfiles();
            this.setupUserSelectionEvents();
        }
    }

    showCreateUserModal() {
        const createModal = document.createElement('div');
        createModal.className = 'create-user-modal';
        createModal.innerHTML = `
            <div class="create-user-content">
                <h3>Create New Profile</h3>
                <div class="form-group">
                    <label>Name:</label>
                    <input type="text" id="new-user-name" placeholder="Enter your name" maxlength="20">
                </div>
                <div class="form-group">
                    <label>Avatar:</label>
                    <div class="avatar-selection" id="avatar-selection">
                        ${UserManager.getAvatarOptions().map(avatar => 
                            `<span class="avatar-option" data-avatar="${avatar}">${avatar}</span>`
                        ).join('')}
                    </div>
                </div>
                <div class="form-actions">
                    <button id="btn-cancel-create">Cancel</button>
                    <button id="btn-confirm-create" class="primary">Create Profile</button>
                </div>
            </div>
        `;

        document.body.appendChild(createModal);

        let selectedAvatar = '💪';
        
        // Avatar selection
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                selectedAvatar = option.dataset.avatar;
            });
        });

        // Select first avatar by default
        document.querySelector('.avatar-option').classList.add('selected');

        // Cancel button
        document.getElementById('btn-cancel-create').addEventListener('click', () => {
            createModal.remove();
        });

        // Create button
        document.getElementById('btn-confirm-create').addEventListener('click', () => {
            const name = document.getElementById('new-user-name').value.trim();
            if (name) {
                const newUser = this.userManager.createUser(name, selectedAvatar);
                this.userManager.switchToUser(newUser.id);
                createModal.remove();
                this.handleUserSelected(newUser);
            } else {
                alert('Please enter a name for your profile');
            }
        });

        // Focus on name input
        setTimeout(() => {
            document.getElementById('new-user-name').focus();
        }, 100);
    }

    handleUserSelected(user) {
        // Remove user selection modal
        const modal = document.getElementById('user-selection-modal');
        if (modal) modal.remove();

        // Remove create user modal if open
        const createModal = document.querySelector('.create-user-modal');
        if (createModal) createModal.remove();

        // Call the callback
        if (this.onUserSelected) {
            this.onUserSelected(user);
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    }
}