@echo off

:: Auto-elevate to Administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

:: Go back to script directory after elevation
cd /d "%~dp0"

echo Current directory: %CD%

:: Start XAMPP only if not already running
tasklist | findstr /i "xampp-control.exe" >nul
if %ERRORLEVEL%==0 (
    echo XAMPP is already running. Skipping...
) else (
    echo Starting XAMPP Control Panel...
    start "" "C:\xampp\xampp-control.exe"
    timeout /t 5 /nobreak >nul
)

php artisan wayfinder:generate
php artisan optimize:clear
php artisan optimize

:: Kill anything on port 8000
netstat -ano | findstr ":8000" >nul
if %ERRORLEVEL%==0 (
    echo Port 8000 is in use. Stopping existing instance...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000"') do (
        taskkill /PID %%a /F >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)

echo Starting php artisan serve...
start "Laravel Server" cmd /k php artisan serve

:: Wait until port 8000 is ready
echo Waiting for server to be ready...
:waitloop
timeout /t 2 /nobreak >nul
netstat -ano | findstr ":8000" >nul
if %ERRORLEVEL% neq 0 goto waitloop

echo Server is ready!
start "" "http://127.0.0.1:8000"

pause