@echo off
REM Run from project root by double-clicking this file
cd /d "%~dp0"
echo Starting simple HTTP server on port 8000...
python -m http.server 8000 2>nul || py -3 -m http.server 8000 2>nul || (
  echo Python not found. Install Python 3 or run with VSCode Live Server or 'npx http-server'.
  pause
)
