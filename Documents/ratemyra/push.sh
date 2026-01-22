#!/bin/bash

echo "🚀 Pushing RateMyRA to GitHub..."
echo ""

# Switch back to HTTPS (easier for authentication)
git remote set-url origin https://github.com/ultradoce/ratemyra.git

echo "📤 Pushing to GitHub..."
echo "You'll be prompted for:"
echo "  - Username: ultradoce"
echo "  - Password: Use a GitHub Personal Access Token"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "🌐 View your repo: https://github.com/ultradoce/ratemyra"
else
    echo ""
    echo "❌ Push failed. You may need to:"
    echo "1. Get a Personal Access Token: https://github.com/settings/tokens"
    echo "2. Use it as your password when prompted"
    echo ""
    echo "Or run manually:"
    echo "  git push -u origin main"
fi
