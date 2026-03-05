@echo off
echo ====================================
echo Iniciando Transporte App Local
echo ====================================
echo.

REM Matar procesos previos de Node
echo Cerrando procesos Node previos...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Iniciar servidor backend
echo Iniciando servidor backend...
start "Backend Server" cmd /k "cd server && npm run dev"
timeout /t 5 /nobreak >nul

REM Iniciar cliente frontend
echo Iniciando cliente frontend...
start "Frontend Client" cmd /k "cd client && npm run dev"

echo.
echo ====================================
echo Servidores iniciados!
echo ====================================
echo.
echo Backend: http://localhost:3001/api
echo Frontend: http://localhost:5174
echo.
echo IMPORTANTE: Espera a que ambos servidores terminen de iniciar
echo y luego abre el navegador en http://localhost:5174
echo.
pause
