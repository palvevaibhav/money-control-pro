# Documentation Generation Skill

## Description
Automatically generates comprehensive documentation for the codebase including API documentation, component documentation, and usage guides to maintain up-to-date project documentation.

## Features
- **API Documentation**: Generates from JSDoc/TypeScript comments
- **Component Documentation**: React component props and usage
- **README Generation**: Auto-updates project README
- **Changelog Management**: Tracks version changes
- **Usage Examples**: Code examples and tutorials
- **Type Definitions**: TypeScript interface documentation

## Prerequisites
- Node.js 22.x
- TypeScript definitions
- JSDoc comments in code
- Documentation tools (TypeDoc, JSDoc)

## Usage
```bash
# Generate all documentation
npm run docs:generate

# Generate API docs
npm run docs:api

# Generate component docs
npm run docs:components

# Update README
npm run docs:readme

# Build documentation site
npm run docs:build
```

## Output
- HTML documentation site
- Markdown files for GitHub
- JSON API specifications
- Component usage examples
- Type definition files

## Documentation Types
- **API Reference**: Function signatures and parameters
- **Component Library**: React component documentation
- **Getting Started**: Setup and installation guides
- **Architecture**: System design and data flow
- **Deployment**: Production deployment guides

## Best Practices
- Keep documentation close to code
- Use consistent formatting
- Include code examples
- Update docs with code changes
- Version documentation with releases