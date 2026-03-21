# Application Health Monitoring Skill

## Description
Monitors application health, performance, and reliability in production, providing real-time insights and alerts for issues affecting user experience.

## Features
- **Uptime Monitoring**: Tracks application availability
- **Performance Metrics**: Response times and throughput
- **Error Tracking**: Captures and analyzes errors
- **User Analytics**: Usage patterns and behavior
- **Resource Monitoring**: CPU, memory, and disk usage
- **Alert System**: Automated notifications for issues

## Prerequisites
- Application deployed to production
- Monitoring service configured
- Alert channels set up
- API endpoints accessible

## Usage
```bash
# Check application health
npm run health:check

# View performance metrics
npm run monitor:performance

# Check error rates
npm run monitor:errors

# Generate health report
npm run health:report

# Setup monitoring alerts
npm run monitor:alerts
```

## Monitoring Metrics
- **Availability**: Uptime percentage
- **Performance**: Response times, throughput
- **Errors**: Error rates, types, and frequencies
- **Resources**: CPU, memory, disk usage
- **User Experience**: Page load times, interactions

## Alert Types
- **Critical**: Application down or major errors
- **Warning**: Performance degradation or high error rates
- **Info**: Usage spikes or unusual patterns
- **Recovery**: System back to normal operation

## Best Practices
- Set appropriate alert thresholds
- Monitor key user journeys
- Regular health check reviews
- Incident response procedures
- Continuous improvement based on data