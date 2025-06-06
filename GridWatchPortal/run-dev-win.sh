#!/bin/bash

set -e
set -o pipefail

# Define ports
PORTAL_PORT=5141
DEVICE_API_PORT=5224
ADX_API_PORT=5257
REACT_DEV_PORT=3000

# Helper: Kill port if in use
kill_port_if_used() {
  local PORT=$1
  local PID=$(netstat -ano | grep ":$PORT" | awk '{print $5}' | head -n 1 | tr -d '\r')
  if [[ -n "$PID" && "$PID" -ne 0 ]]; then
    echo "⚠️ Killing existing process on port $PORT (PID: $PID)..."
    taskkill //PID $PID //F || echo "⚠️ Failed to kill process $PID. It may not exist."
  else
    echo "ℹ️ No process found on port $PORT or PID is invalid."
  fi
}

# 🔪 Kill any previous processes using our dev ports
kill_port_if_used $PORTAL_PORT
kill_port_if_used $DEVICE_API_PORT
kill_port_if_used $ADX_API_PORT
kill_port_if_used $REACT_DEV_PORT

# Set development environment variables
export ASPNETCORE_ENVIRONMENT=Development
export FRONTEND_URL=http://localhost:$REACT_DEV_PORT

# Step 1: Start Device API
echo "🚀 Starting GridWatch Device API (http://localhost:$DEVICE_API_PORT)..."
pushd ../GridWatchAPIs/GridWatchDeviceApi > /dev/null
ASPNETCORE_ENVIRONMENT=Development FRONTEND_URL=http://localhost:$REACT_DEV_PORT dotnet watch run --urls=http://localhost:$DEVICE_API_PORT &
DEVICE_API_PID=$!
popd > /dev/null

# Step 2: Start ADX API
echo "🚀 Starting GridWatch ADX API (http://localhost:$ADX_API_PORT)..."
pushd ../GridWatchAPIs/GridWatchADXApi > /dev/null
ASPNETCORE_ENVIRONMENT=Development FRONTEND_URL=http://localhost:$REACT_DEV_PORT dotnet watch run --urls=http://localhost:$ADX_API_PORT &
ADX_API_PID=$!
popd > /dev/null

# Step 3: Setup Client App and build static version
echo "⚙️ Building static version of React app for Portal..."
pushd ClientApp > /dev/null

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "🔧 Installing client dependencies (legacy peer deps)..."
  npm install --legacy-peer-deps
fi

# Create proper .env file for React
cat > .env << EOF
VITE_PORTAL_URL=http://localhost:$PORTAL_PORT
VITE_DEVICE_API_URL=http://localhost:$DEVICE_API_PORT
VITE_ADX_API_URL=http://localhost:$ADX_API_PORT
VITE_AZURE_MAP_KEY=3DUoZWK-t-H5hAHs8shat8elzIXK-e60tFx-G0Imw9s
EOF

# Update postcss.config.js for Tailwind
cat > postcss.config.js << EOF
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
EOF

# Create TypeScript definitions for Vite
mkdir -p src
if [ ! -f "src/vite-env.d.ts" ]; then
  echo "/// <reference types=\"vite/client\" />" > src/vite-env.d.ts
fi

# Check for necessary packages
if ! npm list @tailwindcss/postcss &>/dev/null || ! npm list autoprefixer &>/dev/null; then
  echo "Installing Tailwind CSS and PostCSS dependencies..."
  npm install -D @tailwindcss/postcss postcss autoprefixer @tailwindcss/forms --legacy-peer-deps
fi

# Build the static version
echo "🏗️ Building static version of React app..."
npm run build

# Create wwwroot directory if it doesn't exist
mkdir -p ../wwwroot

# Copy dist files to wwwroot for the static portal
echo "📦 Copying dist output to ../wwwroot..."
cp -r dist/* ../wwwroot/

popd > /dev/null

# Step 4: Start .NET Core Portal with static files
echo "🌐 Starting .NET Core Portal with static files (http://localhost:$PORTAL_PORT)..."
ASPNETCORE_ENVIRONMENT=Development FRONTEND_URL=http://localhost:$REACT_DEV_PORT dotnet watch run --urls=http://localhost:$PORTAL_PORT &
PORTAL_PID=$!

# Step 5: Start React Dev Server for frontend hot reloading
echo "⚛️ Starting React development server (http://localhost:$REACT_DEV_PORT)..."
cd ClientApp

# Start React dev server
echo "⚛️ Starting React dev server with development settings..."
npm run dev &
REACT_PID=$!
cd ..

# Display URLs
echo ""
echo "✅ React Dev Server:      http://localhost:$REACT_DEV_PORT (USE THIS FOR DEVELOPMENT)"
echo "✅ .NET Portal (static):  http://localhost:$PORTAL_PORT (STATIC BUILD)"
echo "✅ Device API available:  http://localhost:$DEVICE_API_PORT"
echo "✅ ADX API available:     http://localhost:$ADX_API_PORT"
echo ""

echo "🌍 Opening browser with React Dev Server..."
PORTAL_URL="http://localhost:$REACT_DEV_PORT"
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$PORTAL_URL"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "$PORTAL_URL"
else
    start "$PORTAL_URL" || echo "⚠️ Auto-open not supported. Please open manually: $PORTAL_URL"
fi

# Cleanup on exit
trap "echo '🛑 Stopping all processes...'; kill $DEVICE_API_PID $ADX_API_PID $PORTAL_PID $REACT_PID" EXIT

# Keep the script running so servers remain alive
wait