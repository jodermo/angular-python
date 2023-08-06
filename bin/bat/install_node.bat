@echo off

echo Installing Node.js...
set "installer_path=../installer/node-v18.17.0-x64.msi"  REM Replace with the actual installer path

REM Install Node.js
start /wait %installer_path%
echo Python installation completed.

pause
