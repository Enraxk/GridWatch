#!/bin/bash

set -e
set -o pipefail

PORTAL_PORT=5141
DEVICE_API_PORT=5224
ADX_API_PORT=5257

# Helper: Kill process using port
kill_port_if_used() {
  local PORT=$1
  local PID=$(lsof -ti tcp:$PORT)
  if [ -n "$PID" ]; then
    echo "⚠️ Killing existing process on port $PORT (PID: $PID)..."
    kill -9 $PID
  fi
}

kill_port_if_used $PORTAL_PORT
kill_port_if_used $DEVICE_API_PORT
kill_port_if_used $ADX_API_PORT

# Track all PIDs for cleanup
declare -a PIDS

# Trap BEFORE starting background processes
cleanup() {
  echo -e "\n🛑 Stopping all background services..."
  for PID in "${PIDS[@]}"; do
    kill $PID 2>/dev/null || true
  done
}
trap cleanup EXIT

# Start Device API
echo "🚀 Starting Device API..."
pushd ../GridWatchAPIs/GridWatchDeviceApi > /dev/null
dotnet run --urls=http://localhost:$DEVICE_API_PORT &
PIDS+=($!)
popd > /dev/null

# Start ADX API
echo "🚀 Starting ADX API..."
pushd ../GridWatchAPIs/GridWatchADXApi > /dev/null
dotnet run --urls=http://localhost:$ADX_API_PORT &
PIDS+=($!)
popd > /dev/null

# Build frontend


echo "📦 Copying frontend to wwwroot..."
cd ClientApp
npm install --legacy-peer-deps || { echo "❌ npm install failed"; exit 1; }

npm run build || { echo "❌ Frontend build failed"; exit 1; }

cd ..

# Safer clear of wwwroot
echo "🧹 Clearing wwwroot..."
find wwwroot -mindepth 1 -delete || { echo "❌ Failed to clear wwwroot"; exit 1; }

# Copy built files
cp -r ClientApp/dist/* wwwroot/ || { echo "❌ Failed to copy frontend to wwwroot"; exit 1; }


# Start Portal
echo "🌐 Starting Portal..."
dotnet run --urls=http://localhost:$PORTAL_PORT > portal.log 2>&1 &

PIDS+=($!)

# Open browser
PORTAL_URL="http://localhost:$PORTAL_PORT"
echo "✅ Portal available at:     $PORTAL_URL"
echo "✅ Device API available at: http://localhost:$DEVICE_API_PORT"
echo "✅ ADX API available at:    http://localhost:$ADX_API_PORT"
echo ""

# Open browser (fresh state)
PORTAL_URL="http://localhost:$PORTAL_PORT"
echo "🌍 Opening in Chrome..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    open -na "Google Chrome" --args --user-data-dir="/tmp/temporary-gridwatch-profile" --incognito "$PORTAL_URL"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    google-chrome --user-data-dir=/tmp/temporary-gridwatch-profile --incognito "$PORTAL_URL" || xdg-open "$PORTAL_URL"
else
    echo "⚠️ Auto-open not supported on this OS"
fi

# Keep alive until Ctrl+C
wait
