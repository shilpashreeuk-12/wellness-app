#!/bin/bash

echo "🔄 Updating GitHub repository with fixed dependencies..."

# Initialize git if needed
if [ ! -d ".git" ]; then
    git init
    echo "📝 Git initialized"
fi

# Add all files
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "📋 No changes to commit - repository is up to date"
else
    # Commit the changes
    git commit -m "Fix: Remove lucide-react dependency and use React 18 for compatibility

- Remove lucide-react@0.300.0 (conflicts with React 19)
- Downgrade to React 18.2.0 for stability
- Use custom SVG icons instead of lucide-react
- Add .npmrc with legacy-peer-deps for compatibility
- Update all dependencies to compatible versions"

    echo "✅ Changes committed successfully"
fi

# Check if remote exists
if git remote get-url origin 2>/dev/null; then
    echo "📤 Pushing to existing remote..."
    git push
else
    echo "⚠️  No remote repository configured"
    echo "🔗 To push to GitHub, run:"
    echo "git remote add origin https://github.com/YOUR-USERNAME/wellness-app.git"
    echo "git branch -M main"
    echo "git push -u origin main"
fi

echo ""
echo "✅ Repository update complete!"
echo "Now redeploy on Netlify - it should work!"