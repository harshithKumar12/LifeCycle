@echo off
setlocal
cd /d "%~dp0"

echo Starting LifeDesk at http://127.0.0.1:5173
start "LifeDesk dev server" /D "%~dp0" cmd /k npm run dev -- --host 127.0.0.1
timeout /t 2 /nobreak >nul
start "" http://127.0.0.1:5173
echo.
echo The dev server is running in a separate window. Close that window to stop it.
pause
