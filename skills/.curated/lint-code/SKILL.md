# Code Linting Skill

## Description
Performs comprehensive code quality analysis using ESLint, TypeScript compiler, and other linting tools to ensure consistent code style and catch potential issues before they reach production.

## Features
- **ESLint Integration**: Configurable linting rules for JavaScript/TypeScript
- **TypeScript Checking**: Static type analysis and error detection
- **Auto-fixing**: Automatically fixes common style issues
- **Custom Rules**: Project-specific linting configurations
- **IDE Integration**: Works with VS Code and other editors
- **Pre-commit Hooks**: Prevents commits with linting errors

## Prerequisites
- Node.js 22.x
- ESLint and TypeScript installed
- Configuration files (.eslintrc.js, tsconfig.json)

## Usage
```bash
# Run linting
npm run lint

# Auto-fix issues
npm run lint:fix

# Check TypeScript types
npm run type-check

# Lint specific files
npx eslint src/components/Dashboard.tsx
```

## Output
- Linting errors and warnings with file locations
- TypeScript compilation errors
- Suggested fixes and improvements
- Code quality metrics

## Error Handling
Handles common issues:
- Syntax errors
- Type mismatches
- Unused variables/imports
- Code style violations
- Missing type annotations

## Configuration
- Extends recommended rulesets
- Custom rules for React and TypeScript
- Ignores generated files and dependencies
- Integrates with Prettier for formatting