# Internationalization Management Skill

## Description
Manages application internationalization (i18n) including translation management, locale support, and cultural adaptation to provide a localized experience for global users.

## Features
- **Translation Management**: Centralized translation files
- **Locale Detection**: Automatic user locale detection
- **Pluralization**: Proper handling of plural forms
- **Date/Number Formatting**: Locale-specific formatting
- **RTL Support**: Right-to-left language support
- **Translation Extraction**: Automated string extraction

## Prerequisites
- React i18n library configured
- Translation files prepared
- Locale data available
- Cultural adaptation guidelines

## Usage
```bash
# Extract translatable strings
npm run i18n:extract

# Add new language
npm run i18n:add "es"

# Update translations
npm run i18n:update

# Check missing translations
npm run i18n:check

# Build localized versions
npm run i18n:build
```

## Supported Languages
- English (en) - Base language
- Spanish (es)
- French (fr)
- German (de)
- Chinese (zh)
- Japanese (ja)
- Arabic (ar) - RTL support

## Features
- **Dynamic Loading**: Load translations on demand
- **Fallback Support**: Graceful degradation for missing translations
- **Context Awareness**: Different translations based on context
- **Interpolation**: Dynamic content in translations
- **Namespaces**: Organize translations by feature/module

## Best Practices
- Use descriptive keys for translations
- Avoid hardcoded strings in components
- Test translations in context
- Consider cultural differences
- Regular translation updates