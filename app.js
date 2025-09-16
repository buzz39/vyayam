// Vyayam PWA Application
class VyayamApp {
    constructor() {
        this.workoutData = null;
        this.currentDay = null;
        this.currentExercise = 0;
        this.completedExercises = new Set();
        this.deferredPrompt = null;
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.loadWorkoutData();
        this.setupInstallPrompt();
        this.initDB();
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('backBtn').addEventListener('click', () => this.showDaySelector());
        document.getElementById('refreshBtn').addEventListener('click', () => this.loadWorkoutData());
        
        // Settings button
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettings());
        
        // Google Sheets sync button
        const syncBtn = document.getElementById('connectSheetsBtn');
        if (syncBtn) {
            syncBtn.addEventListener('click', () => {
                if (typeof this.showSheetsSetup === 'function') {
                    this.showSheetsSetup();
                } else {
                    alert('Google Sheets integration not available. Using static data.');
                }
            });
        }
        
        // Day selection
        document.querySelectorAll('.day-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const day = e.currentTarget.dataset.day;
                this.selectDay(day);
            });
        });

        // Modal controls
        document.getElementById('closeModalBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('exerciseModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeModal();
        });

        // Settings modal controls
        document.getElementById('closeSettingsBtn').addEventListener('click', () => this.closeSettings());
        document.getElementById('settingsModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeSettings();
        });

        // Settings actions
        document.getElementById('switchUserBtn').addEventListener('click', () => this.switchUser());
        document.getElementById('editProfileBtn').addEventListener('click', () => this.editProfile());
        document.getElementById('exportDataBtn').addEventListener('click', () => this.exportUserData());
        document.getElementById('manageSheetsBtn').addEventListener('click', () => {
            this.closeSettings();
            if (typeof this.showSheetsSetup === 'function') {
                this.showSheetsSetup();
            }
        });

        // Workout controls
        document.getElementById('startWorkoutBtn').addEventListener('click', () => this.startWorkout());
        
        // Install prompt
        document.getElementById('installBtn').addEventListener('click', () => this.installApp());
        document.getElementById('dismissInstallBtn').addEventListener('click', () => this.dismissInstallPrompt());

        // Bottom navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });
    }

    async loadWorkoutData() {
        this.showLoading(true);
        
        try {
            // For now, we'll use static data based on your sheet
            // Later this will be replaced with Google Sheets API calls
            this.workoutData = this.getStaticWorkoutData();
            
            this.showLoading(false);
            this.showDaySelector();
            
            // Cache data for offline use
            await this.cacheWorkoutData(this.workoutData);
            
        } catch (error) {
            console.error('Error loading workout data:', error);
            this.showError('Failed to load workout data. Using cached data.');
            
            // Try to load from cache
            const cachedData = await this.getCachedWorkoutData();
            if (cachedData) {
                this.workoutData = cachedData;
                this.showLoading(false);
                this.showDaySelector();
            }
        }
    }

    getStaticWorkoutData() {
        return {
            day1: {
                title: "Chest + Triceps",
                exercises: [
                    { name: "Bench Press", sets: "4x8-10", videoId: "rT7DgCr-3pg" },
                    { name: "Incline Dumbbell Press", sets: "4x8-10", videoId: "8iPEnn-ltC8" },
                    { name: "Dumbbell Flys", sets: "3x12", videoId: "eozdVDA78K0" },
                    { name: "Tricep Dips", sets: "3x10", videoId: "6kALHqr7kzs" },
                    { name: "Overhead DB Extension", sets: "3x12", videoId: "_gsUck-7M74" },
                    { name: "Rope Pushdowns", sets: "3x15", videoId: "2-LAMcpzODU" },
                    { name: "Deadlift", sets: "4x6-8", videoId: "op9kVnSso6Q" },
                    { name: "Pull-ups / Lat Pulldown", sets: "4x8-10", videoId: "HkfRY3ct13" },
                    { name: "Barbell Row", sets: "4x8-10", videoId: "YrQGI_RuBY8" }
                ]
            },
            day2: {
                title: "Back + Biceps",
                exercises: [
                    { name: "Deadlift", sets: "4x6-8", videoId: "op9kVnSso6Q" },
                    { name: "Pull-ups / Lat Pulldown", sets: "4x8-10", videoId: "uJziqXgpxRY4" },
                    { name: "Barbell Row", sets: "4x8-10", videoId: "YrQGI_UmpuY" },
                    { name: "Dumbbell Curl", sets: "3x10", videoId: "ykJmrZ5v0Oo" },
                    { name: "Hammer Curl", sets: "3x12", videoId: "zC3nLlEvin4" },
                    { name: "Face Pull", sets: "3x15", videoId: "rep-qVOkqgI" },
                    { name: "Overhead Press", sets: "4x8-10", videoId: "qEwKCR5JCog" },
                    { name: "Side Lateral Raises", sets: "4x12", videoId: "3VcKaXpzqRo" }
                ]
            },
            day3: {
                title: "Shoulders + Abs",
                exercises: [
                    { name: "Overhead Press", sets: "4x8-10", videoId: "qEwKCR5JCog" },
                    { name: "Side Lateral Raises", sets: "4x12", videoId: "3VcKaXpzqRo" },
                    { name: "Arnold Press", sets: "3x10", videoId: "6Z15_WdXmVw" },
                    { name: "Shrugs", sets: "3x15", videoId: "39RO2ZfREYU" },
                    { name: "Hanging Leg Raise", sets: "3x15", videoId: "4kGJewyJo4W" },
                    { name: "Plank", sets: "3x1 min", videoId: "pSHjTRCQxIW" },
                    { name: "Squat", sets: "4x8-10", videoId: "aclHkVaku9U" },
                    { name: "Romanian Deadlift", sets: "4x8-10", videoId: "2sF1sEo3voU" }
                ]
            },
            day4: {
                title: "Legs + Abs",
                exercises: [
                    { name: "Squat", sets: "4x8-10", videoId: "aclHkVaku9U" },
                    { name: "Romanian Deadlift", sets: "4x8-10", videoId: "2sF1sEo3voU" },
                    { name: "Walking Lunges", sets: "3x12 each leg", videoId: "wrwwXE_x-pQ" },
                    { name: "Leg Press", sets: "3x12", videoId: "IZxyjW9MPIQ" },
                    { name: "Calf Raises", sets: "4x15-20", videoId: "YMmzgK0pYs" },
                    { name: "Ab Rollouts / Cable Crunch", sets: "3x15", videoId: "FmSSCTNl" },
                    { name: "Incline Barbell Bench", sets: "4x8-10", videoId: "SrqOu55lrYU" }
                ]
            },
            day5: {
                title: "Chest + Biceps",
                exercises: [
                    { name: "Incline Barbell Bench", sets: "4x8-10", videoId: "SrqOu55lrYU" },
                    { name: "Dumbbell Pullover", sets: "3x12", videoId: "jahOYBZCWd4" },
                    { name: "Push-ups (weighted)", sets: "3x15-20", videoId: "IODxDxX7oi4" },
                    { name: "Barbell Curl", sets: "4x10", videoId: "kwG2ipFRgfo" },
                    { name: "Concentration Curl", sets: "3x12", videoId: "0AUGkch3tzc" },
                    { name: "Pull-ups", sets: "4x8-10", videoId: "eGo4IYlbE5g" }
                ]
            },
            day6: {
                title: "Back + Triceps",
                exercises: [
                    { name: "T-Bar Row", sets: "4x10", videoId: "HEnghi1WUvX5c" },
                    { name: "Dumbbell Row", sets: "3x12", videoId: "pYcpY20QaE8" },
                    { name: "Close Grip Bench Press", sets: "4x8-10", videoId: "nEF0bv2FW94" },
                    { name: "Skull Crushers", sets: "3x12", videoId: "d_KZxkY_0cM" },
                    { name: "Rope Overhead Extension", sets: "3x15", videoId: "YbX7Wd8jQ" }
                ]
            },
            day7: {
                title: "Rest / Active Recovery",
                isRestDay: true,
                exercises: [
                    { name: "Light Cardio / Yoga / Stretching", sets: "20-30 min", videoId: "Eml2xnoLpYE", description: "Choose light activities like walking, yoga, or stretching" }
                ]
            }
        };
    }

    async loadProgress(day, date = null) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const userId = this.currentUser ? this.currentUser.id : 'default';
        
        // Try to load from IndexedDB first
        if (this.db) {
            try {
                const transaction = this.db.transaction(['progress'], 'readonly');
                const store = transaction.objectStore('progress');
                const progressData = await store.get(`${userId}_${targetDate}`);
                
                if (progressData && progressData.day === day) {
                    return {
                        completedExercises: progressData.completedExercises || [],
                        timestamp: progressData.timestamp
                    };
                }
            } catch (error) {
                console.error('Error loading progress from IndexedDB:', error);
            }
        }
        
        // Try to load from user object
        if (this.currentUser && this.currentUser.workoutProgress) {
            const dayProgress = this.currentUser.workoutProgress[targetDate];
            if (dayProgress && dayProgress.day === day) {
                return {
                    completedExercises: dayProgress.completedExercises || [],
                    timestamp: dayProgress.timestamp
                };
            }
        }
        
        return null;
    }

    selectDay(day) {
        this.currentDay = day;
        this.currentExercise = 0;
        this.completedExercises.clear();
        
        // Load user-specific progress for this day
        this.loadProgress(day).then(progress => {
            if (progress) {
                this.completedExercises = new Set(progress.completedExercises);
                this.renderWorkout(); // Re-render with loaded progress
            }
        });
        
        this.showWorkoutView();
        this.renderWorkout();
    }

    showWorkoutView() {
        document.getElementById('daySelector').style.display = 'none';
        document.getElementById('workoutView').style.display = 'block';
        document.getElementById('workoutView').classList.add('slide-in');
    }

    showDaySelector() {
        document.getElementById('workoutView').style.display = 'none';
        document.getElementById('daySelector').style.display = 'block';
        document.getElementById('daySelector').classList.add('fade-in');
    }

    renderWorkout() {
        const dayData = this.workoutData[`day${this.currentDay}`];
        if (!dayData) return;

        // Update workout header
        document.getElementById('workoutTitle').textContent = `Day ${this.currentDay} - ${dayData.title}`;
        
        if (dayData.isRestDay) {
            document.getElementById('workoutProgress').textContent = 'Rest and Recovery Day';
        } else {
            document.getElementById('workoutProgress').textContent = 
                `${this.completedExercises.size} of ${dayData.exercises.length} exercises completed`;
        }

        // Render exercises
        const container = document.getElementById('exerciseContainer');
        container.innerHTML = '';

        if (dayData.isRestDay) {
            this.renderRestDay(dayData);
        } else {
            dayData.exercises.forEach((exercise, index) => {
                const exerciseCard = this.createExerciseCard(exercise, index);
                container.appendChild(exerciseCard);
            });
        }

        // Update progress
        this.updateProgress();
    }

    createExerciseCard(exercise, index) {
        const isCompleted = this.completedExercises.has(index);
        const isCurrent = index === this.currentExercise && !isCompleted;

        const card = document.createElement('div');
        card.className = `exercise-card ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`;
        
        card.innerHTML = `
            <div class="exercise-header">
                <div>
                    <div class="exercise-name">${exercise.name}</div>
                </div>
                <div class="exercise-sets">${exercise.sets}</div>
            </div>
            <div class="exercise-actions">
                <button class="btn btn-primary" onclick="app.showExerciseModal(${index})">
                    <span class="material-icons">play_arrow</span>
                    Watch Video
                </button>
                <button class="btn ${isCompleted ? 'btn-success' : 'btn-secondary'}" onclick="app.toggleExerciseComplete(${index})">
                    <span class="material-icons">${isCompleted ? 'check' : 'check_box_outline_blank'}</span>
                    ${isCompleted ? 'Completed' : 'Mark Complete'}
                </button>
            </div>
        `;

        return card;
    }

    renderRestDay(dayData) {
        const container = document.getElementById('exerciseContainer');
        
        const restCard = document.createElement('div');
        restCard.className = 'rest-day-card';
        restCard.innerHTML = `
            <div class="rest-day-content">
                <div class="rest-icon">
                    <span class="material-icons" style="font-size: 48px; color: #4caf50;">spa</span>
                </div>
                <h3>Rest & Recovery Day</h3>
                <p>Your body needs time to recover and rebuild. Consider these light activities:</p>
                <div class="rest-activities">
                    <div class="activity-item">
                        <span class="material-icons">directions_walk</span>
                        <span>Light Walking (15-30 min)</span>
                    </div>
                    <div class="activity-item">
                        <span class="material-icons">self_improvement</span>
                        <span>Yoga or Meditation</span>
                    </div>
                    <div class="activity-item">
                        <span class="material-icons">accessibility_new</span>
                        <span>Gentle Stretching</span>
                    </div>
                    <div class="activity-item">
                        <span class="material-icons">bathtub</span>
                        <span>Hydration & Sleep</span>
                    </div>
                </div>
                <div class="rest-video">
                    <button class="btn btn-primary" onclick="app.showRestVideo()">
                        <span class="material-icons">play_arrow</span>
                        Watch Stretching Video
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(restCard);
    }

    showRestVideo() {
        // Show stretching/yoga video for rest day
        document.getElementById('modalExerciseName').textContent = 'Rest Day - Gentle Stretching';
        document.getElementById('setsRepsInfo').innerHTML = `
            <span class="material-icons">timer</span>
            <span>20-30 minutes</span>
        `;

        // Embed YouTube video for stretching
        const videoContainer = document.getElementById('videoContainer');
        videoContainer.innerHTML = `
            <iframe 
                src="https://www.youtube.com/embed/Eml2xnoLpYE?autoplay=0&rel=0" 
                frameborder="0" 
                allowfullscreen>
            </iframe>
        `;

        // Update complete button for rest day
        const completeBtn = document.getElementById('markCompleteBtn');
        completeBtn.innerHTML = `
            <span class="material-icons">check</span>
            Mark Rest Day Complete
        `;
        completeBtn.onclick = () => {
            this.markRestDayComplete();
            this.closeModal();
        };

        document.getElementById('exerciseModal').classList.add('active');
    }

    markRestDayComplete() {
        // Mark rest day as complete
        this.completedExercises.clear();
        this.completedExercises.add(0);
        this.updateProgress();
        this.saveProgress();
    }

    showExerciseModal(exerciseIndex) {
        const dayData = this.workoutData[`day${this.currentDay}`];
        const exercise = dayData.exercises[exerciseIndex];

        document.getElementById('modalExerciseName').textContent = exercise.name;
        document.getElementById('setsRepsInfo').innerHTML = `
            <span class="material-icons">fitness_center</span>
            <span>${exercise.sets}</span>
        `;

        // Embed YouTube video
        const videoContainer = document.getElementById('videoContainer');
        videoContainer.innerHTML = `
            <iframe 
                src="https://www.youtube.com/embed/${exercise.videoId}?autoplay=0&rel=0" 
                frameborder="0" 
                allowfullscreen>
            </iframe>
        `;

        // Update complete button
        const isCompleted = this.completedExercises.has(exerciseIndex);
        const completeBtn = document.getElementById('markCompleteBtn');
        completeBtn.innerHTML = `
            <span class="material-icons">${isCompleted ? 'check' : 'check_box_outline_blank'}</span>
            ${isCompleted ? 'Completed' : 'Mark Complete'}
        `;
        completeBtn.onclick = () => {
            this.toggleExerciseComplete(exerciseIndex);
            this.closeModal();
        };

        document.getElementById('exerciseModal').classList.add('active');
    }

    closeModal() {
        document.getElementById('exerciseModal').classList.remove('active');
        // Clear video to stop playback
        document.getElementById('videoContainer').innerHTML = '';
    }

    toggleExerciseComplete(exerciseIndex) {
        if (this.completedExercises.has(exerciseIndex)) {
            this.completedExercises.delete(exerciseIndex);
        } else {
            this.completedExercises.add(exerciseIndex);
        }

        this.renderWorkout();
        this.saveProgress();
    }

    startWorkout() {
        const dayData = this.workoutData[`day${this.currentDay}`];
        
        if (dayData.isRestDay) {
            this.showRestVideo();
            return;
        }
        
        if (this.completedExercises.size === 0) {
            this.showExerciseModal(0);
        } else {
            // Continue from where left off
            for (let i = 0; i < dayData.exercises.length; i++) {
                if (!this.completedExercises.has(i)) {
                    this.showExerciseModal(i);
                    break;
                }
            }
        }
    }

    updateProgress() {
        const dayData = this.workoutData[`day${this.currentDay}`];
        const progress = (this.completedExercises.size / dayData.exercises.length) * 100;
        
        // Update progress bar if it exists
        const progressBar = document.querySelector('.progress-fill');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }

        // Update start button text
        const startBtn = document.getElementById('startWorkoutBtn');
        
        if (dayData.isRestDay) {
            if (this.completedExercises.size === 0) {
                startBtn.innerHTML = '<span class="material-icons">spa</span>Start Rest Day';
            } else {
                startBtn.innerHTML = '<span class="material-icons">check</span>Rest Day Complete!';
                startBtn.disabled = true;
            }
        } else {
            if (this.completedExercises.size === 0) {
                startBtn.innerHTML = '<span class="material-icons">play_arrow</span>Start Workout';
            } else if (this.completedExercises.size === dayData.exercises.length) {
                startBtn.innerHTML = '<span class="material-icons">check</span>Workout Complete!';
                startBtn.disabled = true;
            } else {
                startBtn.innerHTML = '<span class="material-icons">play_arrow</span>Continue Workout';
            }
        }
        
        startBtn.disabled = false; // Reset disabled state unless specifically set above
    }

    showLoading(show) {
        document.getElementById('loadingState').style.display = show ? 'flex' : 'none';
    }

    showError(message) {
        // Simple error handling - could be enhanced with a proper notification system
        console.error(message);
        alert(message);
    }

    // PWA Installation
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });

        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.hideInstallPrompt();
        });
    }

    showInstallPrompt() {
        document.getElementById('installPrompt').style.display = 'block';
    }

    hideInstallPrompt() {
        document.getElementById('installPrompt').style.display = 'none';
    }

    dismissInstallPrompt() {
        this.hideInstallPrompt();
    }

    async installApp() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            this.deferredPrompt = null;
            this.hideInstallPrompt();
        }
    }

    // Navigation
    switchView(view) {
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        // Handle view switching
        switch(view) {
            case 'workout':
                this.showDaySelector();
                break;
            case 'progress':
                this.showProgressView();
                break;
            case 'profile':
                this.showProfileView();
                break;
        }
    }

    showProgressView() {
        // Placeholder for progress view
        console.log('Progress view - to be implemented');
    }

    showProfileView() {
        // Placeholder for profile view
        console.log('Profile view - to be implemented');
    }

    // Data Persistence
    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('VyayamDB', 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                if (!db.objectStoreNames.contains('workouts')) {
                    db.createObjectStore('workouts', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('progress')) {
                    db.createObjectStore('progress', { keyPath: 'date' });
                }
            };
        });
    }

    async cacheWorkoutData(data) {
        if (!this.db) return;

        const transaction = this.db.transaction(['workouts'], 'readwrite');
        const store = transaction.objectStore('workouts');
        
        await store.put({
            id: 'current',
            data: data,
            timestamp: Date.now()
        });
    }

    async getCachedWorkoutData() {
        if (!this.db) return null;

        const transaction = this.db.transaction(['workouts'], 'readonly');
        const store = transaction.objectStore('workouts');
        const result = await store.get('current');
        
        return result ? result.data : null;
    }

    async saveProgress() {
        if (!this.db) return;

        const today = new Date().toISOString().split('T')[0];
        const userId = this.currentUser ? this.currentUser.id : 'default';
        const transaction = this.db.transaction(['progress'], 'readwrite');
        const store = transaction.objectStore('progress');
        
        await store.put({
            id: `${userId}_${today}`, // User-specific ID
            userId: userId,
            date: today,
            day: this.currentDay,
            completedExercises: Array.from(this.completedExercises),
            timestamp: Date.now()
        });

        // Also save to user object if available
        if (this.currentUser && this.userManager) {
            this.currentUser.workoutProgress = this.currentUser.workoutProgress || {};
            this.currentUser.workoutProgress[today] = {
                day: this.currentDay,
                completedExercises: Array.from(this.completedExercises),
                timestamp: Date.now()
            };
            this.userManager.updateUser(this.currentUser);
        }
    }

    // Settings Modal Methods
    showSettings() {
        this.updateSettingsDisplay();
        document.getElementById('settingsModal').classList.add('active');
    }

    closeSettings() {
        document.getElementById('settingsModal').classList.remove('active');
    }

    updateSettingsDisplay() {
        if (this.currentUser) {
            // Update user profile display
            document.getElementById('profileAvatar').textContent = this.currentUser.avatar;
            document.getElementById('profileName').textContent = this.currentUser.name;
            
            // Calculate and show stats
            const progressCount = this.currentUser.workoutProgress ? 
                Object.keys(this.currentUser.workoutProgress).length : 0;
            const statsText = progressCount > 0 ? 
                `${progressCount} workout${progressCount !== 1 ? 's' : ''} completed` : 
                'No workout data yet';
            document.getElementById('profileStats').textContent = statsText;

            // Update Google Sheets status
            const hasSheets = this.currentUser.sheetsUrl;
            const statusIcon = document.getElementById('sheetsStatusIcon');
            const statusText = document.getElementById('sheetsStatusText');
            
            if (hasSheets) {
                statusIcon.textContent = 'cloud_done';
                statusIcon.className = 'material-icons connected';
                statusText.textContent = 'Connected to Google Sheets';
            } else {
                statusIcon.textContent = 'cloud_off';
                statusIcon.className = 'material-icons disconnected';
                statusText.textContent = 'Not connected';
            }
        }
    }

    switchUser() {
        this.closeSettings();
        if (window.userManager) {
            window.userManager.showUserSelection((selectedUser) => {
                console.log('Switching to user:', selectedUser.name);
                
                // Update header UI
                const userAvatar = document.getElementById('currentUserAvatar');
                const userName = document.getElementById('currentUserName');
                if (userAvatar && userName) {
                    userAvatar.textContent = selectedUser.avatar;
                    userName.textContent = selectedUser.name;
                }
                
                // Update app context
                this.currentUser = selectedUser;
                this.userManager = window.userManager.userManager;
                
                // Reload workout data with new user context
                this.loadWorkoutData();
                
                // Go back to day selector
                this.showDaySelector();
            });
        }
    }

    editProfile() {
        if (!this.currentUser || !this.userManager) return;
        
        // Create edit profile modal (simplified version)
        const editModal = document.createElement('div');
        editModal.className = 'create-user-modal';
        editModal.innerHTML = `
            <div class="create-user-content">
                <h3>Edit Profile</h3>
                <div class="form-group">
                    <label>Name:</label>
                    <input type="text" id="edit-user-name" value="${this.currentUser.name}" maxlength="20">
                </div>
                <div class="form-group">
                    <label>Avatar:</label>
                    <div class="avatar-selection" id="edit-avatar-selection">
                        ${UserManager.getAvatarOptions().map(avatar => 
                            `<span class="avatar-option ${avatar === this.currentUser.avatar ? 'selected' : ''}" data-avatar="${avatar}">${avatar}</span>`
                        ).join('')}
                    </div>
                </div>
                <div class="form-actions">
                    <button id="btn-cancel-edit">Cancel</button>
                    <button id="btn-save-edit" class="primary">Save Changes</button>
                </div>
            </div>
        `;

        document.body.appendChild(editModal);

        let selectedAvatar = this.currentUser.avatar;
        
        // Avatar selection
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                selectedAvatar = option.dataset.avatar;
            });
        });

        // Cancel button
        document.getElementById('btn-cancel-edit').addEventListener('click', () => {
            editModal.remove();
        });

        // Save button
        document.getElementById('btn-save-edit').addEventListener('click', () => {
            const name = document.getElementById('edit-user-name').value.trim();
            if (name) {
                this.currentUser.name = name;
                this.currentUser.avatar = selectedAvatar;
                this.userManager.updateUser(this.currentUser);
                
                // Update UI
                const userAvatar = document.getElementById('currentUserAvatar');
                const userName = document.getElementById('currentUserName');
                if (userAvatar && userName) {
                    userAvatar.textContent = selectedAvatar;
                    userName.textContent = name;
                }
                
                editModal.remove();
                this.updateSettingsDisplay();
            }
        });
    }

    exportUserData() {
        if (!this.currentUser) return;
        
        const userData = {
            ...this.currentUser,
            exportDate: new Date().toISOString(),
            appVersion: '2.0'
        };
        
        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `vyayam-${this.currentUser.name}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert('User data exported successfully!');
    }
}

// Initialize the app - will be replaced by sheets-api.js if loaded
let app;