# Accessibility Check Skill

## Description
Ensures the application is accessible to users with disabilities by checking compliance with WCAG guidelines, screen reader compatibility, and inclusive design principles.

## Features
- **WCAG Compliance**: Automated WCAG 2.1 AA compliance checking
- **Screen Reader Testing**: VoiceOver, NVDA, JAWS compatibility
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: Sufficient color contrast ratios
- **Semantic HTML**: Proper ARIA labels and roles
- **Focus Management**: Logical focus order and indicators

## Prerequisites
- Web application built and running
- Accessibility testing tools
- Screen readers for manual testing
- Design system with accessibility guidelines

## Usage
```bash
# Run accessibility audit
npm run a11y:audit

# Check color contrast
npm run a11y:contrast

# Test keyboard navigation
npm run a11y:keyboard

# Generate accessibility report
npm run a11y:report

# Check ARIA compliance
npm run a11y:aria
```

## Accessibility Checks
- **Perceivable**: Content is available to all senses
- **Operable**: Interface elements are usable
- **Understandable**: Information and operation are clear
- **Robust**: Works with current and future technologies

## Tools Used
- axe-core for automated testing
- Lighthouse accessibility audits
- Screen reader testing
- Manual accessibility reviews
- Color contrast analyzers

## Best Practices
- Semantic HTML structure
- Descriptive alt text for images
- Sufficient color contrast
- Keyboard navigation support
- Clear focus indicators
- Error message accessibility