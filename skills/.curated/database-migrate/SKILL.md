# Database Migration Skill

## Description
Manages database schema changes and data migrations for Firestore, ensuring smooth transitions between application versions and maintaining data integrity.

## Features
- **Schema Migration**: Handles Firestore schema updates
- **Data Transformation**: Migrates existing data to new formats
- **Backup Creation**: Automatic backups before migrations
- **Rollback Support**: Ability to revert migrations
- **Validation**: Ensures data integrity post-migration
- **Version Tracking**: Tracks migration history

## Prerequisites
- Firebase project configured
- Firestore database initialized
- Migration scripts prepared
- Admin privileges for database access

## Usage
```bash
# Run all pending migrations
npm run db:migrate

# Create new migration
npm run db:migrate:create "add_user_profiles"

# Run specific migration
npm run db:migrate:up 001

# Rollback migration
npm run db:migrate:down 001

# Check migration status
npm run db:migrate:status
```

## Output
- Migration execution logs
- Data transformation results
- Backup file locations
- Validation reports
- Error details and recovery steps

## Migration Types
- **Schema Changes**: Adding/removing fields
- **Data Transformation**: Converting data formats
- **Index Creation**: Adding database indexes
- **Security Rules**: Updating Firestore rules
- **Cleanup Operations**: Removing deprecated data

## Best Practices
- Test migrations on staging first
- Create backups before running
- Use transactions for data integrity
- Version control migration scripts
- Document migration purposes and impacts