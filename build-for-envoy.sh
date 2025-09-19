#!/bin/bash

# Build script for Envoy-hosted frontend
echo "🚀 Building OpenFront frontend for Envoy hosting..."

# Clean up previous builds
echo "🧹 Cleaning up previous builds..."
rm -rf envoy-static

# Build the frontend with Envoy configuration
echo "📦 Building frontend..."
npx webpack --config webpack.envoy-hosted.config.js --mode production

# Check if build succeeded
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "✅ Frontend build completed!"
echo "📁 Static files are in: ./envoy-static"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "⚠️  Docker is not running. Please start Docker to run the complete setup."
    echo ""
    echo "📋 To complete the setup manually:"
    echo "   1. Start Docker"
    echo "   2. Run: docker-compose -f docker-compose.envoy-hosted.yml up -d"
    echo "   3. Visit: http://localhost:3000"
    exit 0
fi

# Stop any existing containers
echo "🛑 Stopping any existing containers..."
docker-compose -f docker-compose.envoy-hosted.yml down

# Start the complete stack
echo "🐳 Starting Envoy + Static Server stack..."
docker-compose -f docker-compose.envoy-hosted.yml up -d

# Check if containers started successfully
if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 OpenFront Envoy setup is ready!"
    echo ""
    echo "🔗 Access the application at: http://localhost:3000"
    echo "📊 Envoy admin interface: http://localhost:9901"
    echo "🗂️  Static file server: http://localhost:8080"
    echo ""
    echo "🏗️  Architecture:"
    echo "   Browser → http://localhost:3000 (Envoy)"
    echo "   ├── Static files → http://localhost:8080 (Nginx)"
    echo "   └── API/WebSocket → openfront.io (Proxy)"
    echo ""
    echo "🛑 To stop: docker-compose -f docker-compose.envoy-hosted.yml down"
else
    echo "❌ Failed to start containers"
    echo "🔍 Check logs: docker-compose -f docker-compose.envoy-hosted.yml logs"
    exit 1
fi
