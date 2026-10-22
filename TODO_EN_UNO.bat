@echo off
REM ========================================
REM   FerreteríaPRO - TODO EN UNO
REM ========================================
REM Este script:
REM 1. Verifica Node.js
REM 2. Instala dependencias
REM 3. Genera HTML portable
REM ========================================

echo.
echo ========================================
echo   FerreteríaPRO - Instalación Completa
echo ========================================
echo.

REM Cambiar a la carpeta del proyecto
cd /d "%~dp0"

REM ========================================
REM PASO 1: Verificar Node.js
REM ========================================
echo [PASO 1/3] Verificando Node.js...
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================
    echo [X] Node.js NO está instalado
    echo ========================================
    echo.
    echo Para continuar, necesitas instalar Node.js:
    echo.
    echo OPCIÓN 1 (Automática):
    echo   Abre PowerShell como administrador y ejecuta:
    echo   winget install OpenJS.NodeJS.LTS
    echo.
    echo OPCIÓN 2 (Manual):
    echo   1. Ve a: https://nodejs.org/
    echo   2. Descarga la versión LTS
    echo   3. Instala con las opciones por defecto
    echo   4. CIERRA esta ventana
    echo   5. Vuelve a ejecutar este script
    echo.
    echo ========================================
    pause
    exit /b 1
)

echo [OK] Node.js encontrado:
node --version
echo.

REM ========================================
REM PASO 2: Instalar dependencias
REM ========================================
echo [PASO 2/3] Instalando dependencias...
echo.

if exist "node_modules" (
    echo [OK] Dependencias ya instaladas
    echo.
) else (
    echo Instalando... (esto tarda 2-5 minutos)
    echo.
    call npm install
    
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ========================================
        echo [X] Error al instalar dependencias
        echo ========================================
        echo.
        echo Posibles soluciones:
        echo.
        echo 1. Verifica tu conexión a internet
        echo.
        echo 2. Ejecuta como administrador:
        echo    - Click derecho en este archivo
        echo    - "Ejecutar como administrador"
        echo.
        echo 3. Limpia e intenta de nuevo:
        echo    rmdir /s /q node_modules
        echo    del package-lock.json
        echo    npm install
        echo.
        echo ========================================
        pause
        exit /b 1
    )
    echo.
    echo [OK] Dependencias instaladas correctamente
    echo.
)

REM ========================================
REM PASO 3: Generar HTML portable
REM ========================================
echo [PASO 3/3] Generando archivo HTML portable...
echo.
echo Esto crea un único archivo HTML que se puede
echo abrir con doble clic en cualquier Windows.
echo.

call npm run build:portable

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================
    echo [X] Error al generar el HTML
    echo ========================================
    echo.
    pause
    exit /b 1
)

REM ========================================
REM ÉXITO
REM ========================================
echo.
echo ========================================
echo [OK] ¡TODO LISTO!
echo ========================================
echo.
echo Tu aplicación portable está en:
echo.
echo    dist\index.html
echo.
echo Este archivo:
echo ✓ Se puede abrir con doble clic
echo ✓ Se puede copiar a un USB
echo ✓ Funciona en cualquier Windows
echo ✓ No requiere instalación
echo ✓ Los datos se guardan localmente
echo.
echo ========================================
echo.

REM Preguntar si quiere copiar el archivo
echo ¿Deseas copiar el archivo al escritorio? (s/n)
set /p COPIAR=
if /i "%COPIAR%"=="s" (
    copy "dist\index.html" "%USERPROFILE%\Desktop\FerreteríaPRO.html" >nul
    echo.
    echo [OK] Archivo copiado al escritorio:
    echo      FerreteríaPRO.html
    echo.
    echo Ya puedes hacer doble clic para abrirlo.
    echo.
)

REM Preguntar si quiere abrir el archivo
echo ¿Deseas abrir el archivo ahora? (s/n)
set /p ABRIR=
if /i "%ABRIR%"=="s" (
    echo.
    echo Abriendo aplicación...
    start "" "dist\index.html"
)

echo.
echo ========================================
echo ¡Disfruta FerreteríaPRO!
echo ========================================
echo.
pause
