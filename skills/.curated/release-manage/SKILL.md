# Release Management Skill

## Description
Manages the complete software release lifecycle including versioning, changelog generation, deployment coordination, and post-release monitoring for reliable software delivery.

## Features
- **Version Management**: Semantic versioning and release numbering
- **Changelog Generation**: Automated release notes from commits
- **Release Planning**: Release scheduling and coordination
- **Deployment Orchestration**: Multi-environment deployment
- **Rollback Procedures**: Quick reversion capabilities
- **Post-Release Monitoring**: Release success validation

## Prerequisites
- Git repository with release branches
- CI/CD pipeline configured
- Versioning strategy defined
- Deployment environments ready

## Usage
```bash
# Prepare release
npm run release:prepare "1.2.0"

# Generate changelog
npm run release:changelog

# Create release branch
npm run release:branch

# Deploy to staging
npm run release:staging

# Final production release
npm run release:production

# Monitor release
npm run release:monitor

# Rollback if needed
npm run release:rollback
```

## Release Types
- **Major Release**: Breaking changes, new features
- **Minor Release**: New features, backward compatible
- **Patch Release**: Bug fixes and small improvements
- **Hotfix Release**: Critical bug fixes
- **Pre-release**: Alpha, beta, release candidates

## Release Process
- **Planning**: Feature freeze and testing
- **Preparation**: Version bumping and documentation
- **Validation**: Testing and quality assurance
- **Deployment**: Staged rollout across environments
- **Monitoring**: Post-release health checks
- **Communication**: Stakeholder notifications

## Best Practices
- Consistent versioning scheme
- Comprehensive testing before release
- Gradual rollout strategies
- Clear rollback procedures
- Stakeholder communication
- Post-mortem reviews