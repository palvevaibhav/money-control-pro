# Dependency Management Skill

## Description
Manages project dependencies including package updates, security patches, license compliance, and dependency analysis to maintain a healthy and secure dependency ecosystem.

## Features
- **Dependency Analysis**: Visual dependency graphs and impact analysis
- **Security Updates**: Automated security vulnerability patching
- **License Compliance**: License compatibility and attribution
- **Version Management**: Semantic versioning and update strategies
- **Bundle Size Monitoring**: Dependency impact on bundle size
- **Automated Updates**: Scheduled dependency updates

## Prerequisites
- Node.js project with package.json
- Package manager (npm, yarn, pnpm)
- Security scanning tools
- License compliance policies

## Usage
```bash
# Analyze dependencies
npm run deps:analyze

# Check for updates
npm run deps:check

# Update dependencies
npm run deps:update

# Security audit
npm run deps:audit

# Generate license report
npm run deps:licenses

# Clean unused dependencies
npm run deps:clean
```

## Dependency Types
- **Runtime Dependencies**: Core application dependencies
- **Development Dependencies**: Build and testing tools
- **Peer Dependencies**: Required by other packages
- **Optional Dependencies**: Non-critical optional packages
- **Bundled Dependencies**: Included in package distribution

## Security Features
- **Vulnerability Scanning**: Automated security checks
- **Patch Management**: Safe security update application
- **Dependency Locking**: Reproducible builds with lockfiles
- **Audit Trails**: Dependency change tracking
- **Risk Assessment**: Security risk evaluation

## Best Practices
- Regular dependency updates
- Use lockfiles for reproducibility
- Audit dependencies regularly
- Minimize dependency footprint
- Prefer maintained packages