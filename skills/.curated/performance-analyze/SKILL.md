# Performance Analysis Skill

## Description
Analyzes application performance including bundle size, runtime performance, memory usage, and loading times to ensure optimal user experience and efficient resource utilization.

## Features
- **Bundle Analysis**: Analyzes JavaScript bundle sizes and dependencies
- **Runtime Performance**: Measures rendering and interaction performance
- **Memory Profiling**: Identifies memory leaks and usage patterns
- **Loading Performance**: Analyzes initial load times and critical paths
- **Lighthouse Integration**: Automated performance scoring
- **Network Analysis**: Monitors API call performance

## Prerequisites
- Node.js 22.x
- Build tools (Vite, Webpack)
- Performance monitoring tools
- Production build available

## Usage
```bash
# Analyze bundle size
npm run build:analyze

# Run performance tests
npm run perf:test

# Generate Lighthouse report
npm run lighthouse

# Memory profiling
npm run perf:memory

# Network analysis
npm run perf:network
```

## Output
- Bundle size breakdown by module
- Performance metrics (FCP, LCP, TBT, CLS)
- Memory usage graphs
- Network waterfall charts
- Optimization recommendations

## Performance Metrics
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- Total Blocking Time (TBT)

## Optimization Strategies
- Code splitting and lazy loading
- Image optimization
- Bundle size reduction
- Caching strategies
- CDN optimization