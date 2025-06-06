# PowerShell Script for running GridWatch APIs and Portal locally

$ErrorActionPreference = "Stop"

# Ports
$PORTAL_PORT = 5141
$DEVICE_API_PORT = 5224
$ADX_API_PORT = 5257

function Kill-PortIfUsed($port) {
    $pid = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty OwningProcess
    if ($pid) {
        Write-Host "⚠️ Killing process on port $port (PID: $pid)..."
        Stop-Process -Id $pid -Force
    }
}

# 🔪 Kill any process using the ports
Kill-PortIfUsed $PORTAL_PORT
Kill-PortIfUsed $DEVICE_API_PORT
Kill-PortIfUsed $ADX_API_PORT

# Step 1: Start Device API
Write-Host "🚀 Starting GridWatch Device API (http://localhost:$DEVICE_API_PORT)..."
Start-Process powershell -ArgumentList "cd ..\GridWatchAPIs\GridWatchDeviceApi; dotnet run --urls=http://localhost:$DEVICE_API_PORT" -NoNewWindow

# Step 2: Start ADX API
Write-Host "🚀 Starting GridWatch ADX API (http://localhost:$ADX_API_PORT)..."
Start-Process powershell -ArgumentList "cd ..\GridWatchAPIs\GridWatchADXApi; dotnet run --urls=http://localhost:$ADX_API_PORT" -NoNewWindow

# Step 3: Install frontend deps
Write-Host "🔧 Installing React client dependencies..."
Push-Location ClientApp
npm install --legacy-peer-deps

# Step 4: Build React
Write-Host "⚙️ Building React client app..."
npm run build

# Step 5: Copy dist to wwwroot
Write-Host "📦 Copying dist output to ../wwwroot..."
Remove-Item ../wwwroot/* -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path dist/* -Destination ../wwwroot/ -Recurse
Pop-Location

# Step 6: Start Portal
Write-Host "🌐 Starting .NET Core Portal (http://localhost:$PORTAL_PORT)..."
Start-Process powershell -ArgumentList "dotnet run --urls=http://localhost:$PORTAL_PORT" -NoNewWindow

# Step 7: Open browser
$PORTAL_URL = "http://localhost:$PORTAL_PORT"
Write-Host ""
Write-Host "✅ Portal available at:     $PORTAL_URL"
Write-Host "✅ Device API available at: http://localhost:$DEVICE_API_PORT"
Write-Host "✅ ADX API available at:    http://localhost:$ADX_API_PORT"
Write-Host ""
Write-Host "🌍 Opening Chrome..."

Start-Process "chrome.exe" $PORTAL_URL
