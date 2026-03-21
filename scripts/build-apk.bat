@echo off
setlocal enabledelayedexpansion

echo =========================================
echo 💻 Money Control Pro - APK Build Script
echo =========================================

REM ----------------------------
REM Step 0: Check prerequisites
echo [Step 0] Checking prerequisites...

REM Check JAVA_HOME
IF NOT DEFINED JAVA_HOME (
    echo ❌ ERROR: JAVA_HOME is not set.
    echo Please set JAVA_HOME to your JDK 17+ installation path.
    echo Example: set JAVA_HOME="C:\Program Files\Java\jdk-17"
    pause
    exit /b 1
)

IF NOT EXIST "%JAVA_HOME%" (
    echo ❌ ERROR: JAVA_HOME path "%JAVA_HOME%" does not exist.
    pause
    exit /b 1
)

echo ✅ JAVA_HOME is set to: %JAVA_HOME%

REM Verify Java version
"%JAVA_HOME%\bin\java.exe" -version 2>&1 | findstr /i "version" > temp_java_version.txt
set /p JAVA_VERSION=<temp_java_version.txt
del temp_java_version.txt
echo Java version: !JAVA_VERSION!

REM Check if Node.js is available
where node >nul 2>&1
IF ERRORLEVEL 1 (
    echo ❌ ERROR: Node.js is not installed or not in PATH.
    pause
    exit /b 1
)

REM Check Node version (should be 22)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo Node version: !NODE_VERSION!
echo !NODE_VERSION! | findstr /i "v22" >nul
IF ERRORLEVEL 1 (
    echo ❌ ERROR: Node.js version 22 is required. Current: !NODE_VERSION!
    echo Please install Node.js 22 using nvm or from nodejs.org
    pause
    exit /b 1
)

REM Check npm
where npm >nul 2>&1
IF ERRORLEVEL 1 (
    echo ❌ ERROR: npm is not available.
    pause
    exit /b 1
)

echo ✅ All prerequisites verified.

REM ----------------------------
REM Step 1: Install dependencies
echo [Step 1] Installing Node.js dependencies...
call npm install
IF ERRORLEVEL 1 (
    echo ❌ ERROR: Failed to install dependencies.
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully.

REM ----------------------------
REM Step 2: Build Vite application
echo [Step 2] Building Vite production application...
call npm run build
IF ERRORLEVEL 1 (
    echo ❌ ERROR: Vite build failed.
    pause
    exit /b 1
)
echo ✅ Vite build completed successfully.

REM ----------------------------
REM Step 3: Sync Capacitor
echo [Step 3] Syncing Capacitor with Android platform...
call npx cap sync android
IF ERRORLEVEL 1 (
    echo ❌ ERROR: Capacitor sync failed.
    pause
    exit /b 1
)
echo ✅ Capacitor sync completed successfully.

REM ----------------------------
REM Step 4: Build Android APK
echo [Step 4] Building Android APK using Gradle...
cd android

REM Clean previous build
call gradlew clean
IF ERRORLEVEL 1 (
    echo ⚠️ Warning: Gradle clean failed, continuing...
)

REM Build debug APK
call gradlew assembleDebug
IF ERRORLEVEL 1 (
    echo ❌ ERROR: APK build failed.
    cd ..
    pause
    exit /b 1
)

cd ..
echo ✅ APK build completed successfully.

REM ----------------------------
REM Step 5: Verify APK output
echo [Step 5] Verifying APK output...
set APK_PATH=android\app\build\outputs\apk\debug\app-debug.apk

IF NOT EXIST "%APK_PATH%" (
    echo ❌ ERROR: APK file not found at expected location: %APK_PATH%
    pause
    exit /b 1
)

for %%A in ("%APK_PATH%") do set APK_SIZE=%%~zA
echo ✅ APK generated successfully at: %APK_PATH%
echo 📏 APK size: !APK_SIZE! bytes

REM ----------------------------
REM Step 6: Optional device installation
echo [Step 6] Checking for connected Android device...
adb devices 2>nul | findstr /i "device" >nul 2>&1
IF ERRORLEVEL 1 (
    echo ℹ️ No Android device connected, skipping installation.
) ELSE (
    echo 📱 Installing APK on connected device...
    adb install -r "%APK_PATH%"
    IF ERRORLEVEL 1 (
        echo ⚠️ Warning: Failed to install APK on device, but build was successful.
    ) ELSE (
        echo ✅ APK installed on device successfully.
    )
)

echo.
echo =========================================
echo 🎉 BUILD COMPLETED SUCCESSFULLY!
echo =========================================
echo 📱 APK Location: %CD%\%APK_PATH%
echo 📊 APK Size: !APK_SIZE! bytes
echo.
echo Next steps:
echo 1. Test the APK on your Android device
echo 2. Run 'npm run dev:full' for full development workflow
echo 3. Use GitHub Actions for automated deployment
echo =========================================

pause