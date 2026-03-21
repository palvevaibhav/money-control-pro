# Security Audit Skill

## Description
Conducts comprehensive security analysis of the application, including dependency scanning, code analysis, and vulnerability assessment to ensure the application is secure against common threats.

## Features
- **Dependency Scanning**: Checks for vulnerable npm packages
- **Code Analysis**: Identifies security anti-patterns
- **Firebase Security**: Validates Firestore rules and authentication
- **Environment Variables**: Checks for exposed secrets
- **HTTPS Enforcement**: Ensures secure communication
- **CORS Configuration**: Validates cross-origin policies

## Prerequisites
- Node.js 22.x
- npm audit available
- Firebase project configured
- Environment variables properly set

## Usage
```bash
# Run security audit
npm run security:audit

# Check dependencies
npm audit

# Scan for secrets
npx secretlint "**/*.{js,ts,tsx,json}"

# Validate Firebase rules
npm run security:firebase
```

## Output
- Vulnerability reports with severity levels
- Code security issues with recommendations
- Firebase security rule analysis
- Environment variable exposure warnings

## Security Checks
- SQL injection prevention
- XSS protection
- CSRF protection
- Authentication bypass attempts
- Sensitive data exposure
- Insecure dependencies

## Best Practices
- Regular security updates
- Principle of least privilege
- Input validation and sanitization
- Secure session management
- Error handling without information leakage