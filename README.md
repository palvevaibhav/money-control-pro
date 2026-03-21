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

### Core Development
```bash
npm run dev                    # Start development server
npm run build                  # Build for production
npm run preview                # Preview production build
npm run clean                  # Clean build artifacts
npm run dev:full               # Full development workflow
```

### Testing & Quality
```bash
npm run test                   # Run unit tests
npm run test:unit              # Run unit tests with Vitest
npm run test:watch             # Run tests in watch mode
npm run test:coverage          # Run tests with coverage
npm run test:mobile            # Run mobile-specific tests
npm run lint                   # Run ESLint
npm run lint:fix               # Auto-fix linting issues
npm run type-check             # TypeScript type checking
```

### Security & Performance
```bash
npm run security:audit         # Security vulnerability scan
npm run security:firebase      # Validate Firebase security rules
npm run performance:analyze    # Bundle size analysis
npm run performance:test       # Lighthouse performance test
npm run performance:memory     # Memory usage profiling
```

### Documentation
```bash
npm run docs:generate          # Generate TypeDoc documentation
npm run docs:api               # Generate API documentation
npm run docs:components        # Generate component docs
npm run docs:build             # Build all documentation
```

### Database & Migration
```bash
npm run db:migrate             # Run database migrations
npm run db:migrate:create      # Create new migration
npm run db:migrate:status      # Check migration status
npm run db:migrate:up          # Run pending migrations
npm run db:migrate:down        # Rollback migration
```

### CI/CD & Deployment
```bash
npm run ci:trigger             # Trigger CI pipeline
npm run ci:status              # Check CI status
npm run deploy:staging         # Deploy to staging
npm run deploy:production      # Deploy to production
npm run deploy:rollback        # Rollback deployment
```

### Mobile Development
```bash
npm run build:apk              # Build Android APK (Windows)
npm run cap:sync               # Sync Capacitor
npm run cap:open:android       # Open Android Studio
npm run mobile:android         # Full Android workflow
```

### Monitoring & Health
```bash
npm run health:check           # Application health check
npm run health:report          # Generate health report
npm run monitor:performance    # Performance monitoring
npm run monitor:errors         # Error monitoring
```

### Accessibility & Internationalization
```bash
npm run a11y:audit             # Accessibility audit
npm run a11y:contrast          # Color contrast check
npm run a11y:report            # Accessibility report
npm run i18n:extract           # Extract translatable strings
npm run i18n:add               # Add new language
npm run i18n:update            # Update translations
npm run i18n:check             # Check translation completeness
npm run i18n:build             # Build localized versions
```

### Backup & Recovery
```bash
npm run backup:create          # Create data backup
npm run backup:restore         # Restore from backup
npm run backup:list            # List available backups
npm run backup:export          # Export user data
npm run backup:cleanup         # Clean old backups
```

### Analytics & Error Tracking
```bash
npm run analytics:event        # Track custom event
npm run analytics:dashboard    # View analytics dashboard
npm run analytics:export       # Export analytics data
npm run analytics:privacy      # Check privacy compliance
npm run error:setup            # Setup error tracking
npm run error:dashboard        # View error dashboard
npm run error:test             # Test error reporting
npm run error:report           # Generate error report
```

### API Management
```bash
npm run api:docs               # Generate API documentation
npm run api:test               # Test API endpoints
npm run api:health             # Check API health
npm run api:monitor            # Monitor API usage
```

### Code Review & Collaboration
```bash
npm run review:check           # Run pre-review checks
npm run review:create          # Create review checklist
npm run review:analyze         # Analyze review feedback
npm run review:report          # Generate review report
npm run collab:setup           # Setup team workspace
npm run collab:board           # Create project board
npm run collab:meeting         # Schedule team meeting
npm run collab:docs            # Setup knowledge base
npm run collab:progress        # Track team progress
npm run collab:report          # Generate collaboration report
```

### Dependency Management
```bash
npm run deps:analyze           # Analyze dependencies
npm run deps:check             # Check for updates
npm run deps:update            # Update dependencies
npm run deps:audit             # Security audit
npm run deps:licenses          # Check licenses
npm run deps:clean             # Remove unused dependencies
```

### Environment & Feature Management
```bash
npm run env:setup              # Setup environment
npm run env:validate           # Validate configuration
npm run env:sync               # Sync environments
npm run env:backup             # Backup environment config
npm run env:restore            # Restore environment config
npm run env:health             # Check environment health
npm run flag:create            # Create feature flag
npm run flag:rollout           # Rollout feature to percentage
npm run flag:target            # Target specific users
npm run flag:experiment        # Run A/B test
npm run flag:disable           # Disable feature
npm run flag:status            # Check flag status
```

### Release Management
```bash
npm run release:prepare        # Prepare release
npm run release:changelog      # Generate changelog
npm run release:branch         # Create release branch
npm run release:staging        # Deploy to staging
npm run release:production     # Deploy to production
npm run release:monitor        # Monitor release
npm run release:rollback       # Rollback release
```

### Skills Management
```bash
npm run generate:skills        # Generate skills.json from curated skills
```

## Skills System

This project includes a comprehensive skills system that provides automated workflows and best practices for various development tasks. Each skill is documented in the `skills/.curated/` directory with detailed instructions and usage examples.

### Available Skills

The project currently includes **22 specialized skills**:

#### Development & Testing
- **build-apk**: Android APK building automation
- **test-unit**: Unit testing with coverage analysis
- **lint-code**: Code quality and style checking
- **mobile-test**: Mobile-specific testing and validation

#### Security & Performance
- **security-audit**: Security vulnerability scanning
- **performance-analyze**: Bundle size and performance analysis
- **accessibility-check**: WCAG compliance and accessibility testing
- **error-track**: Error monitoring and tracking

#### Infrastructure & Deployment
- **ci-cd-pipeline**: Continuous integration and deployment
- **database-migrate**: Database schema migrations
- **env-manage**: Environment configuration management
- **backup-restore**: Data backup and recovery

#### Collaboration & Quality
- **code-review**: Code review processes and automation
- **dev-workflow**: Development workflow management
- **collaborate**: Team collaboration tools
- **docs-generate**: Documentation generation

#### Advanced Features
- **feature-flags**: Feature flag management and A/B testing
- **i18n-manage**: Internationalization and localization
- **analytics-track**: User analytics and behavior tracking
- **api-manage**: API documentation and testing
- **deps-manage**: Dependency management and security
- **release-manage**: Release lifecycle management
- **monitor-health**: Application health monitoring

### Using Skills

Each skill provides:
- **Detailed documentation** in `skills/.curated/{skill-name}/SKILL.md`
- **Automated scripts** accessible via npm commands
- **Best practices** and usage examples
- **Prerequisites** and setup instructions

Skills are automatically discovered and can be extended by adding new directories to `skills/.curated/` with SKILL.md files.

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
