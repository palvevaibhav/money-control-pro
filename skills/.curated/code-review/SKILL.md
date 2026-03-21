# Code Review Skill

## Description
Facilitates comprehensive code review processes including automated checks, review guidelines, and collaboration tools to ensure code quality and knowledge sharing.

## Features
- **Automated Checks**: Pre-review quality gates
- **Review Guidelines**: Standardized review criteria
- **Collaboration Tools**: Comment and discussion features
- **Review Analytics**: Review metrics and trends
- **Knowledge Base**: Common issues and solutions
- **Integration**: GitHub/GitLab pull request integration

## Prerequisites
- Git repository with pull request workflow
- Code review tools configured
- Team review guidelines established
- CI/CD pipeline for automated checks

## Usage
```bash
# Run pre-review checks
npm run review:check

# Create review checklist
npm run review:create

# Analyze review feedback
npm run review:analyze

# Generate review report
npm run review:report

# Update review guidelines
npm run review:update
```

## Review Categories
- **Code Quality**: Style, structure, and maintainability
- **Functionality**: Logic correctness and edge cases
- **Security**: Vulnerability assessment and best practices
- **Performance**: Efficiency and optimization opportunities
- **Testing**: Test coverage and quality
- **Documentation**: Code comments and documentation

## Best Practices
- Small, focused pull requests
- Clear descriptions and context
- Address all review comments
- Use automated tools as first pass
- Knowledge sharing during reviews
- Continuous improvement of guidelines

## Tools Integration
- GitHub/GitLab pull requests
- Code quality tools (ESLint, SonarQube)
- Automated testing
- Documentation generators
- Code coverage reports