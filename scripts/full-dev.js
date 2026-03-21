#!/usr/bin/env node

/**
 * Money Control Pro - Full Development Orchestrator
 *
 * This script runs the complete development workflow:
 * 1. Install dependencies
 * 2. Build Vite application
 * 3. Sync Capacitor
 * 4. Build APK (if on Windows)
 * 5. Deploy web application
 *
 * Usage:
 *   npm run dev:full
 *   node scripts/full-dev.js
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class DevOrchestrator {
    constructor() {
        this.isWindows = os.platform() === 'win32';
        this.projectRoot = path.resolve(__dirname, '..');
        this.startTime = Date.now();
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
        console.log(`[${timestamp}] ${prefix} ${message}`);
    }

    error(message) {
        this.log(message, 'error');
        process.exit(1);
    }

    success(message) {
        this.log(message, 'success');
    }

    execCommand(command, description, options = {}) {
        try {
            this.log(`Starting: ${description}`);
            const result = execSync(command, {
                cwd: this.projectRoot,
                stdio: options.silent ? 'pipe' : 'inherit',
                encoding: 'utf8',
                ...options
            });
            this.success(`${description} completed`);
            return result;
        } catch (error) {
            this.error(`${description} failed: ${error.message}`);
        }
    }

    checkPrerequisites() {
        this.log('Checking prerequisites...');

        // Check Node.js version
        const nodeVersion = process.version;
        if (!nodeVersion.includes('v22')) {
            this.error(`Node.js version 22 required. Current: ${nodeVersion}`);
        }
        this.log(`Node.js version: ${nodeVersion}`);

        // Check npm
        try {
            execSync('npm --version', { stdio: 'pipe' });
        } catch (error) {
            this.error('npm is not available');
        }

        // Check Java (for Android builds)
        try {
            execSync('java -version', { stdio: 'pipe' });
            this.log('Java is available');
        } catch (error) {
            this.log('Warning: Java not found. Android builds will be skipped.');
            this.skipAndroid = true;
        }

        this.success('Prerequisites check completed');
    }

    installDependencies() {
        this.execCommand('npm install', 'Installing dependencies');
    }

    buildVite() {
        this.execCommand('npm run build', 'Building Vite application');
    }

    syncCapacitor() {
        this.execCommand('npx cap sync android', 'Syncing Capacitor with Android');
    }

    buildAPK() {
        if (this.skipAndroid) {
            this.log('Skipping APK build (Java not available)');
            return;
        }

        if (this.isWindows) {
            this.log('Building APK using Windows script...');
            this.execCommand('scripts\\build-apk.bat', 'Building Android APK');
        } else {
            this.log('Building APK using Gradle...');
            const androidDir = path.join(this.projectRoot, 'android');
            this.execCommand('./gradlew assembleDebug', 'Building Android APK', {
                cwd: androidDir
            });
        }
    }

    deploy() {
        if (this.isWindows) {
            this.log('Skipping deployment on Windows (use Linux/Mac for deployment)');
            return;
        }

        this.execCommand('chmod +x scripts/deploy.sh && ./scripts/deploy.sh', 'Deploying application');
    }

    generateSkills() {
        const skillsScript = path.join(this.projectRoot, 'scripts', 'generate-skills.js');
        if (fs.existsSync(skillsScript)) {
            this.execCommand('node scripts/generate-skills.js', 'Generating skills configuration');
        } else {
            this.log('Skills generation script not found, skipping...');
        }
    }

    showSummary() {
        const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
        console.log('\n' + '='.repeat(50));
        console.log('🎉 FULL DEVELOPMENT WORKFLOW COMPLETED!');
        console.log('='.repeat(50));
        console.log(`⏱️ Total time: ${duration}s`);
        console.log(`📁 Project: ${this.projectRoot}`);

        if (!this.skipAndroid) {
            const apkPath = this.isWindows
                ? path.join(this.projectRoot, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk')
                : 'android/app/build/outputs/apk/debug/app-debug.apk';

            if (fs.existsSync(apkPath)) {
                const stats = fs.statSync(apkPath);
                console.log(`📱 APK: ${apkPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
            }
        }

        console.log('\nNext steps:');
        console.log('1. Test the web application: npm run preview');
        if (!this.skipAndroid) {
            console.log('2. Install APK on device: adb install android/app/build/outputs/apk/debug/app-debug.apk');
        }
        console.log('3. Push to main branch to trigger CI/CD');
        console.log('='.repeat(50));
    }

    async run() {
        console.log('🚀 Starting Money Control Pro Full Development Workflow\n');

        try {
            this.checkPrerequisites();
            this.installDependencies();
            this.buildVite();
            this.syncCapacitor();
            this.buildAPK();
            this.deploy();
            this.generateSkills();
            this.showSummary();
        } catch (error) {
            this.error(`Workflow failed: ${error.message}`);
        }
    }
}

// Run the orchestrator
if (require.main === module) {
    const orchestrator = new DevOrchestrator();
    orchestrator.run().catch(console.error);
}

module.exports = DevOrchestrator;