@echo off

echo Installing Python...
set "installer_path=../installer/python-3.11.4-amd64.exe"  REM Replace with the actual installer path

REM Install Python
start /wait %installer_path%
echo Python installation completed.
