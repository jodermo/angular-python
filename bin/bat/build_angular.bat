@echo off

echo Building Angular Project...
set "angular_app_path=../../angular-app"  REM Replace with the actual path to your Angular app

REM Change directory to the Angular app folder
cd /d "%angular_app_path%"

REM Build the Angular project
ng build

REM Check the errorlevel after the build
if %errorlevel% neq 0 (
    echo An error occurred during the build. Check the output for details.
    pause
    exit /b %errorlevel%
)

echo Angular Project build completed successfully.

pause
