@echo off
echo Starting PostgreSQL...
net start postgresql-x64-13  REM Change 'postgresql-x64-13' to the appropriate service name based on the installed version
echo PostgreSQL started successfully.

pause
