#!/bin/bash

set -e
set -o pipefail

# Define ports
PORTAL_PORT=5141
DEVICE_API_PORT=5224
ADX_API_PORT=5257

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

# Step 1: Start Device API
echo "🚀 Starting GridWatch Device API (http://localhost:$DEVICE_API_PORT)..."
pushd ../GridWatchAPIs/GridWatchDeviceApi > /dev/null
dotnet run --urls=http://localhost:$DEVICE_API_PORT &
DEVICE_API_PID=$!
popd > /dev/null

# Step 2: Start ADX API
echo "🚀 Starting GridWatch ADX API (http://localhost:$ADX_API_PORT)..."
pushd ../GridWatchAPIs/GridWatchADXApi > /dev/null
dotnet run --urls=http://localhost:$ADX_API_PORT &
ADX_API_PID=$!
popd > /dev/null

# Step 3: Install React frontend deps
echo "🔧 Installing client dependencies (legacy peer deps)..."
cd ClientApp
npm install --legacy-peer-deps

# Step 4: Build React app
echo "⚙️ Building React client app..."
npm run build

# Step 5: Copy dist -> wwwroot
echo "📦 Copying dist output to ../wwwroot..."
rm -rf ../wwwroot/*
cp -r dist/* ../wwwroot/
cd ..

# Step 6: Start the Portal
echo "🌐 Starting .NET Core Portal (http://localhost:$PORTAL_PORT)..."
dotnet run --urls=http://localhost:$PORTAL_PORT &

# Step 7: Open in Chrome
PORTAL_URL="http://localhost:$PORTAL_PORT"
echo ""
echo "✅ Portal available at:     $PORTAL_URL"
echo "✅ Device API available at: http://localhost:$DEVICE_API_PORT"
echo "✅ ADX API available at:    http://localhost:$ADX_API_PORT"
echo ""

echo "🌍 Opening Chrome..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    open -a "Google Chrome" "$PORTAL_URL"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    google-chrome "$PORTAL_URL" || xdg-open "$PORTAL_URL"
else
    echo "⚠️  Auto-open not supported on this OS. Please open manually: $PORTAL_URL"
fi

# Cleanup on exit
trap "echo '🛑 Stopping background APIs...'; kill $DEVICE_API_PID $ADX_API_PID" EXIT

# Keep the script running so Portal remains alive
wait
