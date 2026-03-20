# Money Control Pro

Money Control Pro is a Vite + React personal finance app that now ships from a single codebase to:

- the web
- iOS via Capacitor
- Android via Capacitor

It includes Google sign-in, local-first transaction tracking, savings goals, notification workflows, Gemini-powered financial assistance, biometric app lock, client-side key generation, encrypted vault sealing, and tamper-evident integrity checkpoints.

## Mobile and security support included

- Capacitor configuration for native iOS and Android builds.
- Native shell initialization for status bar, safe areas, keyboard resize, and mobile full-width layout.
- Native camera support for receipt scanning on iOS and Android.
- Redirect-based Google sign-in flow for native app shells.
- Biometric app lock for Face ID / fingerprint unlock.
- User-side RSA keypair generation for encrypted vault sealing.
- AES-GCM encrypted vault snapshots with optional admin public-key wrapping.
- Tamper-evident integrity checkpoints built from chained SHA-256 hashes.

## Getting started

### Prerequisites

- Node.js 20+
- npm 10+
- A Firebase web app configuration
- A Gemini API key for AI features
- Xcode for iOS builds
- Android Studio for Android builds

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
- `VITE_ADMIN_PUBLIC_KEY` (optional base64 SPKI public key for sealed-vault recovery)

> The repository still supports `firebase-applet-config.json` as a fallback to preserve current local behavior, but production deployments should rely on environment variables.

## Available scripts

```bash
npm run dev
npm run lint
npm run build
npm run preview
npm run cap:sync
npm run mobile:ios
npm run mobile:android
```

## Native mobile workflow

### Build and sync native projects

```bash
npm run cap:sync
```

### Open iOS in Xcode

```bash
npm run mobile:ios
```

### Open Android in Android Studio

```bash
npm run mobile:android
```

## Security model in this codebase

### App lock

- Biometric app lock can be enabled from the profile security center.
- The app requests Face ID / Touch ID / fingerprint auth before access when enabled.

### Encrypted vault sealing

- The app can generate a local RSA keypair for the signed-in user.
- A current vault snapshot is encrypted with AES-GCM.
- That AES key is wrapped with the user's public key.
- If `VITE_ADMIN_PUBLIC_KEY` is configured, the same vault key is also wrapped for admin-controlled recovery flows.

### Integrity shield

- User data changes can be checkpointed into a chained SHA-256 integrity log.
- This is tamper-evident verification inside the app.
- It is not a public blockchain or immutable decentralized ledger.

### Important limitation

This repo does **not** yet include a backend key server, hardware security module, or a remote append-only ledger. So while these changes add a strong client-side security foundation, a fully deployed Instagram-style end-to-end encrypted multi-device system still requires backend work.

## Deployment checklist

Before deploying, confirm:

1. All `VITE_*` environment variables are configured in the hosting platform.
2. Firebase Authentication authorized domains include your production URL and any Capacitor redirect domains you use.
3. Firestore rules are configured for your expected user access pattern.
4. `npm run lint`, `npm run build`, and `npm run cap:sync` pass in CI.
5. Service worker caching has been validated after a fresh web deploy.
6. iOS privacy strings and Android permissions are reviewed before store submission.
7. If you use admin vault recovery, `VITE_ADMIN_PUBLIC_KEY` is loaded from a secure deployment secret.

## Notes

- AI features fail gracefully when the Gemini key is not configured.
- App data is still stored locally in the browser/app sandbox and scoped by authenticated user ID.
- Receipt scanning uses the native device camera inside mobile builds.
- For stricter production durability, the next recommended step is migrating transactional data from localStorage to Firestore or another audited backend.
