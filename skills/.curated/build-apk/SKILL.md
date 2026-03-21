# Build APK Skill

## Description
Automates the process of building Android APK for the Money Control Pro application. This skill handles the complete workflow from dependency installation to APK generation, ensuring all prerequisites are met and providing clear error messages.

## Features
- **Node.js Version Check**: Validates Node.js 22 is available
- **Java Environment**: Ensures JAVA_HOME is properly configured
- **Dependency Management**: Installs all required npm packages
- **Vite Build**: Compiles the React application for production
- **Capacitor Sync**: Synchronizes web assets with Android platform
- **Gradle Build**: Generates debug APK using Android Gradle Plugin
- **Device Installation**: Optionally installs APK on connected Android device

## Prerequisites
- Node.js 22.x
- Java JDK 17+
- Android SDK (if using Android Studio)
- Valid JAVA_HOME environment variable

## Usage
```bash
# Run the full APK build process
npm run build:apk

# Or use the orchestrator for complete workflow
npm run dev:full
```

## Output
- Debug APK: `android/app/build/outputs/apk/debug/app-debug.apk`
- Build logs with detailed error messages
- Installation status on connected devices

## Error Handling
The skill provides comprehensive error checking and user-friendly messages for common issues:
- Missing JAVA_HOME
- Incorrect Node.js version
- Failed dependency installation
- Build failures with specific error details