@echo off
rem Spusti dva servery (8787 = Nextcloud host, 8788 = editor) a otvori test.
cd /d "%~dp0"
start "Jam spike 8787" powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1" -Port 8787
start "Jam spike 8788" powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1" -Port 8788
timeout /t 3 /nobreak >nul
start "" "http://localhost:8787/host.html?editor=http://localhost:8788/"
