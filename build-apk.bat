@echo off
setlocal

echo =========================================
echo 💻 Starting Full APK Build Automation Script
echo =========================================

REM ----------------------------
REM Step 0: Check JAVA_HOME
echo [Step 0] Checking JAVA_HOME...
IF NOT DEFINED JAVA_HOME (
    echo ❌ JAVA_HOME is not set. Please set JAVA_HOME to your JDK folder (e.g., C:\Program Files\Android\Android Studio\jbr)
    pause
    exit /b 1
)
IF NOT EXIST "%JAVA_HOME%" (
    echo ❌ JAVA_HOME path "%JAVA_HOME%" does not exist. Please fix it.
    pause
    exit /b 1
)
echo ✅ JAVA_HOME is set to %JAVA_HOME%
echo java version:
"%JAVA_HOME%\bin\java.exe" -version

REM ----------------------------
REM Step 1: Ensure Node 22 is active
echo [Step 1] Switching to Node 22...
nvm use 22
IF ERRORLEVEL 1 (
    echo ❌ Node 22 not found, installing fresh...
    nvm install 22
    IF ERRORLEVEL 1 (
        echo ❌ Failed to install Node 22 via NVM!
        pause
        exit /b 1
    )
)

REM Step 2: Check npm
echo [Step 2] Checking npm...
where npm >nul 2>&1
IF ERRORLEVEL 1 (
    echo ⚠️ npm not found, reinstalling for Node 22...
    nvm install 22 --reinstall-packages-from=22
    IF ERRORLEVEL 1 (
        echo ❌ Failed to reinstall npm!
        pause
        exit /b 1
    )
)

REM ----------------------------
REM Step 3: Clean old Android build
echo [Step 3] Cleaning old Android build...
rmdir /s /q android

REM ----------------------------
REM Step 4: Install Node dependencies
echo [Step 4] Installing Node dependencies...


REM ----------------------------
REM Step 5: Build Vite production app
echo [Step 5] Building Vite production app...
call npm run build
IF ERRORLEVEL 1 (
    echo ❌ Vite build failed!
    pause
    exit /b 1
)

REM ----------------------------
REM Step 6: Add Android platform (fresh)
echo [Step 6] Adding Capacitor Android platform...
call npx cap add android
IF ERRORLEVEL 1 (
    echo ⚠️ Capacitor Android platform may already exist, continuing...
)

REM ----------------------------
REM Step 7: Copy web build to Android
echo [Step 7] Copying web build to Android...
call npx cap copy
call npx cap sync
IF ERRORLEVEL 1 (
    echo ❌ Capacitor sync failed!
    pause
    exit /b 1
)

REM ----------------------------
REM Step 8: Build Debug APK
echo [Step 8] Building Debug APK...
cd android
gradlew assembleDebug
IF ERRORLEVEL 1 (
    echo ❌ APK build failed!
    pause
    exit /b 1
)

REM ----------------------------
REM Step 9: Install APK on connected device (optional)
echo [Step 9] Installing APK on connected Android device...
adb devices | findstr /i "device" >nul
IF ERRORLEVEL 1 (
    echo ⚠️ No device connected, skipping installation.
) ELSE (
    adb install -r app\build\outputs\apk\debug\app-debug.apk
    IF ERRORLEVEL 1 (
        echo ❌ Failed to install APK on device!
    ) ELSE (
        echo ✅ APK installed on device successfully!
    )
)

echo =========================================
echo ✅ APK build process completed successfully!
echo APK location: android\app\build\outputs\apk\debug\app-debug.apk
echo =========================================
pause