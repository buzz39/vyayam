# Vyayam - Your Personal Fitness PWA

Vyayam is a Progressive Web App (PWA) that transforms your Google Sheets workout data into a beautiful, interactive fitness companion. Track your exercises, watch instructional videos, and maintain your fitness routine with offline support.

## Features

🏋️ **Structured Workouts**: 6-day workout rotation with targeted muscle groups
📱 **Mobile-First Design**: Optimized for smartphones and tablets
🎥 **Video Integration**: Embedded YouTube exercise demonstrations
💾 **Offline Support**: Works without internet connection
📊 **Progress Tracking**: Monitor completed exercises and workout history
⚡ **PWA Features**: Install on device, push notifications, background sync

## Quick Start

1. **Clone or Download** this repository
2. **Open** `index.html` in a web browser
3. **Optional**: Connect your Google Sheets workout data
4. **Install**: Click the install prompt to add to your device

## Connecting Your Google Sheets

### Option 1: Public Sheet (Recommended)
1. Open your Google Sheets workout plan
2. Click "Share" → "Change to anyone with the link" → "Viewer"
3. Copy the share link
4. In Vyayam, click the settings icon and "Connect Google Sheets"
5. Paste your sheet URL

### Option 2: Private Sheet with API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Sheets API
4. Create credentials (API Key)
5. Restrict API key to Google Sheets API
6. In Vyayam, enter both sheet URL and API key

## Google Sheets Format

Your sheet should follow this structure:

| Day | Muscle Groups | Exercise | Sets x Reps | YouTube Link |
|-----|---------------|----------|-------------|--------------|
| Day 1 | Chest + Triceps | Bench Press | 4x8-10 | https://youtube.com/watch?v=... |
| Day 1 | Chest + Triceps | Incline Press | 4x8-10 | https://youtube.com/watch?v=... |

**Required Columns:**
- **Day**: Day 1, Day 2, etc.
- **Muscle Groups**: Target muscle groups for the day
- **Exercise**: Exercise name
- **Sets x Reps**: Format like "4x8-10" or "3x12"
- **YouTube Link**: Full YouTube URL for exercise demonstration

## File Structure

```
Vyayam/
├── index.html          # Main app HTML
├── styles.css          # App styling
├── app.js             # Core app functionality
├── sheets-api.js      # Google Sheets integration
├── sw.js              # Service Worker for PWA
├── manifest.json      # PWA manifest
├── icons/             # App icons
└── README.md          # This file
```

## Local Development

1. **Serve locally** (required for PWA features):
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using Live Server (VS Code extension)
   # Right-click index.html → "Open with Live Server"
   ```

2. **Access**: Open `http://localhost:8000` in your browser

3. **Test PWA features**: Use Chrome DevTools → Application tab

## Deployment

### Netlify (Recommended)
1. Drag and drop the Vyayam folder to Netlify
2. Your app will be available at a `.netlify.app` URL
3. PWA features work automatically with HTTPS

### GitHub Pages
1. Push to GitHub repository
2. Enable GitHub Pages in repository settings
3. Access via `https://username.github.io/vyayam`

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow deployment prompts

## Customization

### Workout Data
- Modify the `getStaticWorkoutData()` method in `app.js`
- Or connect your own Google Sheets

### Styling
- Edit `styles.css` for visual customization
- Modify CSS variables in `:root` for color themes

### Features
- Add new views in the bottom navigation
- Extend the `VyayamApp` class with new functionality

## PWA Installation

### Mobile (Android/iOS)
1. Open Vyayam in Chrome/Safari
2. Tap "Add to Home Screen" when prompted
3. Or use browser menu → "Install App"

### Desktop
1. Open in Chrome/Edge
2. Click install icon in address bar
3. Or use browser menu → "Install Vyayam"

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 90+
- ✅ Safari 14+
- ✅ Edge 90+

## Troubleshooting

### PWA Not Installing
- Ensure you're using HTTPS (not file://)
- Check that all required PWA files are present
- Verify manifest.json is valid

### Google Sheets Not Loading
- Confirm sheet is publicly accessible
- Check API key restrictions if using private sheet
- Verify sheet follows the required format

### Videos Not Playing
- Check YouTube URLs are valid
- Ensure internet connection for video streaming
- Some videos may be restricted in certain regions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use and modify for your fitness journey!

## Support

For issues or questions:
- Check the troubleshooting section
- Open an issue on GitHub
- Review browser console for error messages

---

**Stay fit with Vyayam! 💪**