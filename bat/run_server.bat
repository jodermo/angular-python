@echo off
REM Change directory to your project directory
cd /D "%~dp0\.."

REM Activate the virtual environment
call env\Scripts\activate

cd python-server\

REM Set environment variables
set FLASK_APP=server.py

REM Run the server
python server.py

pause
