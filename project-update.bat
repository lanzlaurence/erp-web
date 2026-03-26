@echo off
setlocal enabledelayedexpansion

REM =============================================================================
REM  update.bat — Project Update Script
REM  Always runs in the directory where this .bat file is placed.
REM =============================================================================

REM Change to the directory where this script lives
cd /d "%~dp0"

echo.
echo =============================================
echo   Project Update Script
echo   Working directory: %~dp0
echo =============================================
echo.

REM =============================================================================
REM  Composer
REM =============================================================================
echo ---------------------------------------------
echo   ^>^> composer update
echo ---------------------------------------------
call composer update
if %errorlevel% neq 0 ( echo [ERROR] composer update failed. & pause & exit /b %errorlevel% )
echo [OK] composer update completed.
echo.

echo ---------------------------------------------
echo   ^>^> composer dump-autoload
echo ---------------------------------------------
call composer dump-autoload
if %errorlevel% neq 0 ( echo [ERROR] composer dump-autoload failed. & pause & exit /b %errorlevel% )
echo [OK] composer dump-autoload completed.
echo.

echo ---------------------------------------------
echo   ^>^> composer clear-cache
echo ---------------------------------------------
call composer clear-cache
if %errorlevel% neq 0 ( echo [ERROR] composer clear-cache failed. & pause & exit /b %errorlevel% )
echo [OK] composer clear-cache completed.
echo.

REM =============================================================================
REM  NPM
REM =============================================================================
echo ---------------------------------------------
echo   ^>^> npm update
echo ---------------------------------------------
call npm update
if %errorlevel% neq 0 ( echo [ERROR] npm update failed. & pause & exit /b %errorlevel% )
echo [OK] npm update completed.
echo.

echo ---------------------------------------------
echo   ^>^> npm prune
echo ---------------------------------------------
call npm prune
if %errorlevel% neq 0 ( echo [ERROR] npm prune failed. & pause & exit /b %errorlevel% )
echo [OK] npm prune completed.
echo.

echo ---------------------------------------------
echo   ^>^> npm cache clean --force
echo ---------------------------------------------
call npm cache clean --force
if %errorlevel% neq 0 ( echo [ERROR] npm cache clean failed. & pause & exit /b %errorlevel% )
echo [OK] npm cache clean completed.
echo.

REM =============================================================================
REM  Laravel Artisan
REM =============================================================================
echo ---------------------------------------------
echo   ^>^> php artisan wayfinder:generate
echo ---------------------------------------------
call php artisan wayfinder:generate
if %errorlevel% neq 0 ( echo [ERROR] php artisan wayfinder:generate failed. & pause & exit /b %errorlevel% )
echo [OK] php artisan wayfinder:generate completed.
echo.

echo ---------------------------------------------
echo   ^>^> php artisan optimize:clear
echo ---------------------------------------------
call php artisan optimize:clear
if %errorlevel% neq 0 ( echo [ERROR] php artisan optimize:clear failed. & pause & exit /b %errorlevel% )
echo [OK] php artisan optimize:clear completed.
echo.

echo ---------------------------------------------
echo   ^>^> php artisan optimize
echo ---------------------------------------------
call php artisan optimize
if %errorlevel% neq 0 ( echo [ERROR] php artisan optimize failed. & pause & exit /b %errorlevel% )
echo [OK] php artisan optimize completed.
echo.

REM =============================================================================
REM  Build
REM =============================================================================
echo ---------------------------------------------
echo   ^>^> npm run build
echo ---------------------------------------------
call npm run build
if %errorlevel% neq 0 ( echo [ERROR] npm run build failed. & pause & exit /b %errorlevel% )
echo [OK] npm run build completed.
echo.

echo =============================================
echo   All steps completed successfully!
echo =============================================
echo.

pause
