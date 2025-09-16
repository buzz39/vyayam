// Google Sheets API Integration for Vyayam
class GoogleSheetsAPI {
    constructor() {
        this.apiKey = null; // Will be set by user
        this.spreadsheetId = null; // Will be extracted from the sheet URL
        this.range = 'Sheet1!A:F'; // Adjust based on your sheet structure
    }

    // Extract spreadsheet ID from Google Sheets URL
    extractSpreadsheetId(url) {
        const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        return match ? match[1] : null;
    }

    // Set up the API credentials
    setup(apiKey, sheetUrl) {
        this.apiKey = apiKey;
        this.spreadsheetId = this.extractSpreadsheetId(sheetUrl);
        
        if (!this.spreadsheetId) {
            throw new Error('Invalid Google Sheets URL');
        }
    }

    // Fetch workout data from Google Sheets
    async fetchWorkoutData() {
        if (!this.apiKey || !this.spreadsheetId) {
            throw new Error('API key and spreadsheet ID must be set');
        }

        const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${this.range}?key=${this.apiKey}`;
        
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return this.parseWorkoutData(data.values);
            
        } catch (error) {
            console.error('Error fetching data from Google Sheets:', error);
            throw error;
        }
    }

    // Parse the raw sheet data into structured workout data
    parseWorkoutData(values) {
        if (!values || values.length < 2) {
            throw new Error('No data found in the spreadsheet');
        }

        const workoutData = {};
        
        // Skip header row
        for (let i = 1; i < values.length; i++) {
            const row = values[i];
            const [day, muscleGroups, exercise, setsReps, , youtubeLink] = row;
            
            if (!day || !exercise) continue;
            
            const dayKey = `day${day.replace('Day ', '')}`;
            
            if (!workoutData[dayKey]) {
                workoutData[dayKey] = {
                    title: muscleGroups || `Day ${day.replace('Day ', '')}`,
                    exercises: [],
                    isRestDay: muscleGroups && muscleGroups.toLowerCase().includes('rest')
                };
            }
            
            // Extract YouTube video ID from URL
            const videoId = this.extractYouTubeId(youtubeLink);
            
            workoutData[dayKey].exercises.push({
                name: exercise,
                sets: setsReps || '3x10',
                videoId: videoId
            });
        }
        
        return workoutData;
    }

    // Extract YouTube video ID from various URL formats
    extractYouTubeId(url) {
        if (!url) return '';
        
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        
        return (match && match[2].length === 11) ? match[2] : '';
    }

    // Method to make the sheet publicly readable (instructions for user)
    getPublicAccessInstructions() {
        return `
        To use Google Sheets as your database:
        
        1. Open your Google Sheet
        2. Click "Share" in the top right
        3. Click "Change to anyone with the link"
        4. Set permission to "Viewer"
        5. Copy the share link
        
        OR
        
        1. Go to Google Cloud Console
        2. Enable Google Sheets API
        3. Create credentials (API Key)
        4. Restrict the API key to Google Sheets API
        5. Add the API key to this app
        `;
    }
}

// Enhanced Vyayam App with Google Sheets integration
class VyayamAppWithSheets extends VyayamApp {
    constructor() {
        super();
        this.sheetsAPI = new GoogleSheetsAPI();
        this.setupSheetsIntegration();
    }

    setupSheetsIntegration() {
        // Add setup UI for Google Sheets
        this.createSheetsSetupModal();
    }

    createSheetsSetupModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'sheetsSetupModal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Connect Google Sheets</h3>
                    <button class="close-btn" onclick="this.closest('.modal').classList.remove('active')">
                        <span class="material-icons">close</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 20px;">
                        <label for="sheetUrl">Google Sheets URL:</label>
                        <input type="url" id="sheetUrl" placeholder="https://docs.google.com/spreadsheets/d/..." 
                               style="width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label for="apiKey">API Key (optional for public sheets):</label>
                        <input type="text" id="apiKey" placeholder="Your Google Sheets API key"
                               style="width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div style="margin-bottom: 20px;">
                        <small style="color: #666;">
                            Make sure your Google Sheet is publicly accessible or provide an API key.
                            <a href="#" onclick="alert(this.getAttribute('data-instructions'))" 
                               data-instructions="${this.sheetsAPI.getPublicAccessInstructions()}">
                               View instructions
                            </a>
                        </small>
                    </div>
                    <button class="btn btn-primary" onclick="app.connectGoogleSheets()" style="width: 100%;">
                        Connect Sheet
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    async connectGoogleSheets() {
        const sheetUrl = document.getElementById('sheetUrl').value;
        const apiKey = document.getElementById('apiKey').value;

        if (!sheetUrl) {
            alert('Please enter a Google Sheets URL');
            return;
        }

        try {
            this.sheetsAPI.setup(apiKey, sheetUrl);
            await this.loadWorkoutDataFromSheets();
            document.getElementById('sheetsSetupModal').classList.remove('active');
            
            // Save connection details
            localStorage.setItem('vyayam_sheet_url', sheetUrl);
            if (apiKey) localStorage.setItem('vyayam_api_key', apiKey);
            
            alert('Successfully connected to Google Sheets!');
        } catch (error) {
            console.error('Error connecting to Google Sheets:', error);
            alert('Failed to connect to Google Sheets. Please check your URL and try again.');
        }
    }

    async loadWorkoutDataFromSheets() {
        this.showLoading(true);
        
        try {
            this.workoutData = await this.sheetsAPI.fetchWorkoutData();
            await this.cacheWorkoutData(this.workoutData);
            this.showLoading(false);
            this.showDaySelector();
        } catch (error) {
            console.error('Error loading from sheets:', error);
            // Fall back to static data
            await this.loadWorkoutData();
        }
    }

    async loadWorkoutData() {
        // Check if we have saved sheet connection
        const savedUrl = localStorage.getItem('vyayam_sheet_url');
        const savedApiKey = localStorage.getItem('vyayam_api_key');

        if (savedUrl) {
            try {
                this.sheetsAPI.setup(savedApiKey, savedUrl);
                await this.loadWorkoutDataFromSheets();
                return;
            } catch (error) {
                console.error('Error with saved sheet connection:', error);
            }
        }

        // Fall back to original static data loading
        await super.loadWorkoutData();
    }

    // Add method to show sheets setup
    showSheetsSetup() {
        document.getElementById('sheetsSetupModal').classList.add('active');
    }
}

// Replace the original app initialization
// const app = new VyayamAppWithSheets();