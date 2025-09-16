#!/bin/bash

# Vyayam PWA Deployment Script

echo "🏋️ Vyayam PWA Deployment Helper"
echo "================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit: Vyayam PWA with 7-day workout plan"
else
    echo "📁 Git repository already exists"
fi

echo ""
echo "🚀 Choose your deployment platform:"
echo "1) Netlify (Drag & Drop)"
echo "2) Vercel (GitHub Integration)"
echo "3) Both (Setup for both platforms)"

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🌐 Netlify Deployment:"
        echo "1. Visit https://netlify.com"
        echo "2. Sign up/Login"
        echo "3. Drag the entire Vyayam folder to the deploy area"
        echo "4. Your app will be live instantly!"
        echo ""
        echo "📁 Files ready for Netlify deployment:"
        echo "- netlify.toml (configuration file)"
        echo "- All PWA files optimized"
        ;;
    2)
        echo ""
        echo "⚡ Vercel Deployment:"
        echo "1. Push this code to GitHub:"
        echo "   git remote add origin https://github.com/yourusername/vyayam.git"
        echo "   git push -u origin main"
        echo ""
        echo "2. Visit https://vercel.com"
        echo "3. Import your GitHub repository"
        echo "4. Deploy automatically!"
        echo ""
        echo "📁 Files ready for Vercel deployment:"
        echo "- vercel.json (configuration file)"
        echo "- All PWA files optimized"
        ;;
    3)
        echo ""
        echo "🌟 Universal Setup Complete!"
        echo "Your Vyayam PWA is ready for both platforms:"
        echo ""
        echo "For Netlify:"
        echo "- Drag & drop folder to netlify.com"
        echo ""
        echo "For Vercel:"
        echo "- Push to GitHub and import to vercel.com"
        echo ""
        echo "Both configurations are included!"
        ;;
    *)
        echo "Invalid choice. Please run the script again."
        ;;
esac

echo ""
echo "✅ Deployment files created:"
echo "- netlify.toml (Netlify configuration)"
echo "- vercel.json (Vercel configuration)"
echo "- .gitignore (Git ignore file)"
echo "- DEPLOYMENT.md (Detailed guide)"
echo ""
echo "🎉 Your Vyayam PWA is ready to deploy!"