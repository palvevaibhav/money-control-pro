# Mobile Testing Skill

## Description
Executes comprehensive testing for mobile applications including device compatibility, Capacitor plugin testing, and mobile-specific functionality validation.

## Features
- **Device Compatibility**: Tests across different Android devices
- **Capacitor Plugins**: Validates camera, biometric, and other plugins
- **UI Responsiveness**: Tests mobile UI components and layouts
- **Offline Functionality**: Tests app behavior without network
- **Performance**: Mobile-specific performance metrics
- **Installation Testing**: APK installation and launch validation

## Prerequisites
- Android SDK installed
- Capacitor configured
- Mobile devices or emulators available
- Testing frameworks for mobile

## Usage
```bash
# Run mobile tests
npm run test:mobile

# Test on specific device
npm run test:mobile -- --device emulator-5554

# Test Capacitor plugins
npm run test:plugins

# UI responsiveness tests
npm run test:ui

# Performance tests
npm run test:perf:mobile
```

## Output
- Device compatibility reports
- Plugin functionality results
- UI test screenshots
- Performance metrics
- Installation success rates

## Test Categories
- **Functional Testing**: Core app functionality
- **UI Testing**: Interface and user interactions
- **Plugin Testing**: Capacitor plugin integration
- **Performance Testing**: Mobile-specific performance
- **Compatibility Testing**: Different Android versions

## Mobile Considerations
- Screen size variations
- Touch interactions
- Battery and memory constraints
- Network connectivity changes
- Background/foreground transitions