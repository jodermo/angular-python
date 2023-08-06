@echo off

echo Installing PostgreSQL...
set "installer_path=../installer/postgresql-15.3-4-windows-x64.exe"  REM Replace with the actual installer path

REM Install PostgreSQL
start /wait %installer_path% --unattendedmodeui minimal --mode unattended --superpassword postgres
echo PostgreSQL installation completed.


pause
