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

:: Stop existing XAMPP services if running
echo Checking for existing XAMPP services...
tasklist | findstr /i "xampp-control.exe" >nul
if %ERRORLEVEL%==0 (
    echo Closing XAMPP Control Panel...
    taskkill /IM xampp-control.exe /F >nul 2>&1
    timeout /t 2 /nobreak >nul
)

:: Stop Apache if running
tasklist | findstr /i "httpd.exe" >nul
if %ERRORLEVEL%==0 (
    echo Stopping Apache...
    "C:\xampp\apache\bin\httpd.exe" -k stop >nul 2>&1
    taskkill /IM httpd.exe /F >nul 2>&1
    timeout /t 2 /nobreak >nul
)

:: Stop MySQL if running
tasklist | findstr /i "mysqld.exe" >nul
if %ERRORLEVEL%==0 (
    echo Stopping MySQL...
    "C:\xampp\mysql\bin\mysqladmin.exe" -u root shutdown >nul 2>&1
    taskkill /IM mysqld.exe /F >nul 2>&1
    timeout /t 2 /nobreak >nul
)

echo Starting XAMPP Control Panel...
start "" "C:\xampp\xampp-control.exe"
timeout /t 5 /nobreak >nul

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
