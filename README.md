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
npm run dev
npm run lint
npm run build
npm run preview
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
