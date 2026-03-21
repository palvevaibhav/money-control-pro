# Money Control Pro

Money Control Pro is a Vite + React personal finance app with Google sign-in, local-first transaction tracking, savings goals, notification workflows, and Gemini-powered financial assistance.

## Production-readiness upgrades included

- Environment-driven Firebase and Gemini configuration with local fallback support.
- Safer localStorage parsing and cross-component sync events instead of polling/reload-based refreshes.
- A production-safe service worker strategy that caches the built app shell rather than source files.

## Getting started

### Prerequisites

- Node.js 20+
- npm 10+
- A Firebase web app configuration
- A Gemini API key for AI features

### Install

```bash
npm install
cp .env.example .env.local
```

### Configure environment variables

Populate `.env.local` with your own values:

- `VITE_GEMINI_API_KEY`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_FIREBASE_DATABASE_ID`

> The repository still supports `firebase-applet-config.json` as a fallback to preserve current local behavior, but production deployments should rely on environment variables.

## Available scripts

```bash
npm run dev                    # Start development server
npm run lint                   # Run TypeScript type checking
npm run build                  # Build for production
npm run preview                # Preview production build
npm run dev:full               # Full development workflow (install, build, sync, apk, deploy)
npm run build:apk              # Build Android APK (Windows)
npm run deploy                 # Deploy web application (Linux/Mac)
npm run generate:skills        # Generate skills.json from curated skills
```

## CI/CD Pipeline

This project includes a complete production-ready CI/CD system for both web and mobile deployment.

### GitHub Actions Workflow

The `.github/workflows/deploy.yml` provides automated deployment on every push to the `main` branch:

- **Node.js 22** setup and dependency installation
- **Vite build** for production
- **Java JDK 17** setup for Android builds
- **Capacitor sync** with Android platform
- **APK generation** using Gradle
- **Artifact upload** for APK downloads
- **Web deployment** using the deploy script

### Local Development Scripts

#### Full Development Workflow
```bash
npm run dev:full
```
Runs the complete pipeline locally:
1. Install dependencies
2. Build Vite app
3. Sync Capacitor
4. Build APK (if on Windows with Java)
5. Deploy web application
6. Generate skills configuration

#### APK Building (Windows)
```bash
npm run build:apk
# or
scripts/build-apk.bat
```
Builds Android APK with prerequisite checks and error handling.

#### Web Deployment (Linux/Mac)
```bash
npm run deploy
# or
./scripts/deploy.sh
```
Packages and deploys the web application to hosting services.

### Prerequisites for APK Building

- **Node.js 22.x**
- **Java JDK 17+** with `JAVA_HOME` configured
- **Android SDK** (optional, Gradle handles most dependencies)

### Environment Variables for Deployment

For automated deployment, set these environment variables in your CI/CD platform:

```bash
DEPLOY_ENDPOINT=https://your-deployment-api.com/deploy
DEPLOY_TOKEN=your-api-token
```

### Project Structure

```
money-control-pro/
├── .github/workflows/deploy.yml    # GitHub Actions CI/CD
├── scripts/
│   ├── build-apk.bat              # Windows APK builder
│   ├── deploy.sh                  # Linux/Mac web deployer
│   ├── full-dev.js                # Development orchestrator
│   └── generate-skills.js         # Skills configuration generator
├── skills/
│   └── .curated/                  # Curated skills directory
├── android/                       # Capacitor Android project
├── dist/                          # Vite build output
└── skills.json                    # Generated skills configuration
```

## Deployment checklist

Before deploying, confirm:

1. All `VITE_*` environment variables are configured in the hosting platform.
2. Firebase Authentication authorized domains include your production URL.
3. Firestore rules are configured for your expected user access pattern.
4. `npm run lint` and `npm run build` pass in CI.
5. Service worker caching has been validated after a fresh deploy.

## Notes

- AI features fail gracefully when the Gemini key is not configured.
- App data is stored in the browser via localStorage, scoped by authenticated user ID.
- For stricter production durability, the next recommended step is migrating transactional data from localStorage to Firestore.
