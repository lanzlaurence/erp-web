@echo off

echo Current directory: %CD%

php artisan wayfinder:generate
php artisan optimize:clear
php artisan optimize

:: Check if port 8000 is already in use and kill it
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

:: Open in default browser
start "" "http://127.0.0.1:8000"

pause
