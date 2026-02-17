#!/bin/bash

# Taflex TS Setup Script
# This script ensures the environment is ready for development.

echo "🚀 Starting Taflex TS setup..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it from https://nodejs.org/"
    exit 1
fi

# Check Node version (optional, but recommended)
NODE_VERSION=$(node -v | cut -d 'v' -f 2)
echo "✅ Found Node.js v$NODE_VERSION"

# Install NPM dependencies
echo "📦 Installing NPM dependencies..."
npm install

# Install Playwright Browsers
echo "🎭 Installing Playwright browsers..."
npx playwright install --with-deps

# Create .env from .env.example if it doesn't exist
if [ ! -f .env ]; then
    echo "📄 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your specific credentials."
else
    echo "✅ .env file already exists."
fi

# Set permissions for utility scripts
echo "🔐 Setting execution permissions for utility scripts..."
chmod +x *.sh
echo "✅ Permissions updated for allure.sh, docs.sh, and setup.sh."

echo "✨ Setup complete! You can now run 'npm test' to verify the installation."
