#!/bin/bash

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Start the development server
echo "🚀 Starting development server..."
npm run dev
