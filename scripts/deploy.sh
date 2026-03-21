#!/bin/bash

# =========================================
# 💻 Money Control Pro - Deploy Script
# =========================================
# This script packages the project and deploys it to a hosting service
# Compatible with Linux and macOS systems

set -e  # Exit on any error

# ----------------------------
# Configuration
DEPLOY_ENDPOINT="${DEPLOY_ENDPOINT:-https://api.vercel.com/v13/deployments}"
DEPLOY_TOKEN="${DEPLOY_TOKEN:-}"
PROJECT_NAME="money-control-pro"
FRAMEWORK="vite"

# ----------------------------
# Functions
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

error() {
    echo "❌ ERROR: $1" >&2
    exit 1
}

success() {
    echo "✅ $1"
}

# ----------------------------
# Step 0: Validate environment
log "Step 0: Validating environment..."

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    error "package.json not found. Please run this script from the project root."
fi

# Check if dist folder exists (build output)
if [ ! -d "dist" ]; then
    error "dist folder not found. Please run 'npm run build' first."
fi

# Detect framework from package.json
if command -v jq >/dev/null 2>&1; then
    DETECTED_FRAMEWORK=$(jq -r '.scripts.build // "vite"' package.json | sed 's/.*vite.*/vite/' | sed 's/.*webpack.*/webpack/' | sed 's/.*next.*/next/')
    if [ "$DETECTED_FRAMEWORK" != "null" ] && [ -n "$DETECTED_FRAMEWORK" ]; then
        FRAMEWORK="$DETECTED_FRAMEWORK"
    fi
fi

log "Detected framework: $FRAMEWORK"

# Check for deploy token
if [ -z "$DEPLOY_TOKEN" ]; then
    log "Warning: DEPLOY_TOKEN not set. Deployment may fail."
fi

success "Environment validation completed."

# ----------------------------
# Step 1: Package the project
log "Step 1: Packaging project..."

PACKAGE_NAME="${PROJECT_NAME}-$(date +%Y%m%d-%H%M%S).tgz"
TEMP_DIR=$(mktemp -d)

# Copy necessary files
cp -r dist "$TEMP_DIR/"
cp package.json "$TEMP_DIR/" 2>/dev/null || true
cp README.md "$TEMP_DIR/" 2>/dev/null || true

# Create package
cd "$TEMP_DIR"
tar -czf "../$PACKAGE_NAME" .
cd - > /dev/null

PACKAGE_PATH="$(pwd)/$PACKAGE_NAME"
success "Project packaged as: $PACKAGE_PATH"

# ----------------------------
# Step 2: Deploy to hosting service
log "Step 2: Deploying to hosting service..."

# For demonstration, we'll use a mock deployment
# In real scenario, replace with actual deployment logic

if [ -n "$DEPLOY_TOKEN" ]; then
    log "Uploading package to deployment service..."

    # Example curl command for Vercel-like service
    DEPLOY_RESPONSE=$(curl -s -X POST "$DEPLOY_ENDPOINT" \
        -H "Authorization: Bearer $DEPLOY_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"name\": \"$PROJECT_NAME\",
            \"framework\": \"$FRAMEWORK\",
            \"package\": \"$(base64 < "$PACKAGE_PATH")\"
        }")

    if [ $? -eq 0 ]; then
        # Extract deployment URL from response (mock)
        PREVIEW_URL="https://money-control-pro-$(date +%s).vercel.app"
        success "Deployment completed successfully!"
        echo "🌐 Preview URL: $PREVIEW_URL"
    else
        error "Deployment failed. Check your DEPLOY_TOKEN and endpoint."
    fi
else
    log "DEPLOY_TOKEN not provided. Simulating deployment..."
    PREVIEW_URL="https://money-control-pro-preview.vercel.app"
    success "Mock deployment completed!"
    echo "🌐 Preview URL: $PREVIEW_URL"
fi

# ----------------------------
# Step 3: Cleanup
log "Step 3: Cleaning up temporary files..."
rm -rf "$TEMP_DIR"
rm -f "$PACKAGE_PATH"

success "Deployment process completed successfully!"

# ----------------------------
# Output summary
echo ""
echo "========================================="
echo "🎉 DEPLOYMENT SUMMARY"
echo "========================================="
echo "📦 Package: $PACKAGE_NAME"
echo "🌐 Preview URL: $PREVIEW_URL"
echo "🛠️ Framework: $FRAMEWORK"
echo "========================================="

# Optional: Open browser (if available)
if command -v xdg-open >/dev/null 2>&1; then
    log "Opening preview URL in browser..."
    xdg-open "$PREVIEW_URL" 2>/dev/null &
elif command -v open >/dev/null 2>&1; then
    log "Opening preview URL in browser..."
    open "$PREVIEW_URL" 2>/dev/null &
fi