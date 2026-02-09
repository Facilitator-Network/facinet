#!/bin/bash

# Script to reset git repository and prepare for fresh push
# Run this from the x402 directory: bash reset-git.sh

set -e

echo "🗑️  Removing old git repository..."
rm -rf .git

echo "📦 Initializing new git repository..."
git init

echo "✅ Verifying .gitignore is correct..."
if git check-ignore facinet-sdk/ .env.local .env > /dev/null 2>&1; then
    echo "   ✓ facinet-sdk/ is ignored"
    echo "   ✓ .env files are ignored"
else
    echo "   ⚠️  Warning: Some files may not be ignored properly"
fi

echo "📝 Adding all files (respecting .gitignore)..."
git add .

echo "🔍 Checking what will be committed..."
echo ""
echo "Files that should be ignored (should be empty):"
git ls-files | grep -E "facinet-sdk|\.env$|\.env\.local$" || echo "   ✓ None found (good!)"
echo ""

echo "📦 Creating initial commit..."
git commit -m "Initial commit: Complete x402 codebase with multichain support

- Fixed settle-custom route to support all networks (Avalanche, Ethereum Sepolia, Base Sepolia, Polygon Amoy)
- Updated SDK to send network/chain info in payload
- Added proper network configuration and USDC contract resolution
- All backend routes now use network-specific RPC and contract addresses"

echo ""
echo "✅ Git repository reset complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Create a new repository on GitHub (or use existing one)"
echo "   2. Run these commands:"
echo ""
echo "      git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
echo "      git branch -M main"
echo "      git push -u origin main"
echo ""
echo "   Or if using SSH:"
echo "      git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git"
echo "      git branch -M main"
echo "      git push -u origin main"
echo ""
