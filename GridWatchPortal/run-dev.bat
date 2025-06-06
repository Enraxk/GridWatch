@echo off
setlocal

:: Ports
set PORTAL_PORT=5141
set DEVICE_API_PORT=5224
set ADX_API_PORT=5257

:: Helper: Kill process on port
for %%P in (%PORTAL_PORT% %DEVICE_API_PORT% %ADX_API_PORT%) do (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%P') do (
        echo ⚠️ Killing process on port %%P (PID: %%a)...
        taskkill /F /PID %%a >nul 2>&1
    )
)

:: Step 1: Start Device API
echo 🚀 Starting GridWatch Device API (http://localhost:%DEVICE_API_PORT%)...
start "Device API" cmd /k "cd ..\GridWatchAPIs\GridWatchDeviceApi && dotnet run --urls=http://localhost:%DEVICE_API_PORT%"

:: Step 2: Start ADX API
echo 🚀 Starting GridWatch ADX API (http://localhost:%ADX_API_PORT%)...
start "ADX API" cmd /k "cd ..\GridWatchAPIs\GridWatchADXApi && dotnet run --urls=http://localhost:%ADX_API_PORT%"

:: Step 3: Install frontend dependencies
echo 🔧 Installing React frontend dependencies...
cd ClientApp
call npm install --legacy-peer-deps

:: Step 4: Build React
echo ⚙️ Building React client app...
call npm run build

:: Step 5: Copy dist to ../wwwroot
echo 📦 Copying dist output to ../wwwroot...
cd dist
xcopy * ..\..\wwwroot\ /E /I /Y
cd ..\..

:: Step 6: Start Portal
echo 🌐 Starting .NET Core Portal (http://localhost:%PORTAL_PORT%)...
start "GridWatch Portal" cmd /k "dotnet run --urls=http://localhost:%PORTAL_PORT%"

:: Step 7: Open browser
echo 🌍 Opening Chrome...
start chrome http://localhost:%PORTAL_PORT%

echo.
echo ✅ Portal available at:     http://localhost:%PORTAL_PORT%
echo ✅ Device API available at: http://localhost:%DEVICE_API_PORT%
echo ✅ ADX API available at:    http://localhost:%ADX_API_PORT%

endlocal
