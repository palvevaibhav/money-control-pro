# Unit Testing Skill

## Description
Executes comprehensive unit tests for the Money Control Pro application, ensuring code quality and preventing regressions. This skill handles test discovery, execution, and reporting with detailed coverage analysis.

## Features
- **Test Discovery**: Automatically finds and runs all test files
- **Coverage Analysis**: Generates detailed test coverage reports
- **Multiple Formats**: Supports Jest, Vitest, and other testing frameworks
- **Parallel Execution**: Runs tests in parallel for faster execution
- **Watch Mode**: Supports continuous testing during development
- **CI Integration**: Optimized for continuous integration environments

## Prerequisites
- Node.js 22.x
- Testing framework (Jest, Vitest, etc.) installed
- Test files following naming conventions (*test.js, *.spec.js, etc.)

## Usage
```bash
# Run all unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- src/components/Dashboard.test.tsx
```

## Output
- Test results with pass/fail status
- Coverage reports (HTML, JSON, LCOV formats)
- Performance metrics and timing
- Error details for failed tests

## Error Handling
Provides detailed error messages for:
- Test failures with stack traces
- Missing dependencies
- Configuration issues
- Timeout errors

## Best Practices
- Tests are colocated with source files
- Descriptive test names and assertions
- Mock external dependencies
- Test edge cases and error conditions