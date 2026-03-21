#!/bin/bash

# =========================================
# 💻 Money Control Pro - Complete Deploy Script (FINAL)
# =========================================

set -euo pipefail

# ----------------------------
# Configuration
BRANCH_NAME="${BRANCH_NAME:-main}"
COMMIT_MESSAGE="${COMMIT_MESSAGE:-Automated deployment $(date +'%Y-%m-%d %H:%M:%S')}"
REPO_URL="${REPO_URL:-}"
GITHUB_TOKEN="${GITHUB_TOKEN:-}"

# ----------------------------
# Helpers
log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"; }
error() { echo "❌ ERROR: $1" >&2; exit 1; }
success() { echo "✅ $1"; }
warning() { echo "⚠️  WARNING: $1"; }

get_repo_path() {
    git remote get-url origin | sed 's|https://github.com/||;s|git@github.com:||;s|\.git||'
}

# ----------------------------
# Step 0: Validate environment
log "Step 0: Validating environment..."

command -v git >/dev/null || error "Git not installed"
command -v npm >/dev/null || error "npm not installed"

if ! git rev-parse --git-dir >/dev/null 2>&1; then
    error "Not a git repository"
fi

if ! git remote get-url origin >/dev/null 2>&1; then
    if [ -z "$REPO_URL" ]; then
        error "No origin remote. Provide REPO_URL."
    else
        git remote add origin "$REPO_URL"
    fi
fi

success "Environment OK"

# ----------------------------
# Step 1: Full Dev Workflow
log "Step 1: Running full dev workflow..."

npm run dev:full || error "Dev workflow failed"

success "Dev workflow complete"

# ----------------------------
# Step 2: Git Add
log "Step 2: Staging changes..."
git add -A

if git diff --staged --quiet; then
    warning "Nothing to commit"
    exit 0
fi

# ----------------------------
# Step 3: Commit
log "Step 3: Committing..."
git commit -m "$COMMIT_MESSAGE"
COMMIT_HASH=$(git rev-parse HEAD)

success "Committed: $COMMIT_HASH"

# ----------------------------
# Step 4: Push
log "Step 4: Pushing..."

CURRENT_BRANCH=$(git branch --show-current)

if [ "$CURRENT_BRANCH" != "$BRANCH_NAME" ]; then
    git checkout "$BRANCH_NAME" 2>/dev/null || git checkout -b "$BRANCH_NAME"
fi

# Retry push (network safe)
for i in 1 2 3; do
    if git push -u origin "$BRANCH_NAME"; then
        success "Push successful"
        break
    else
        warning "Push failed (attempt $i), retrying..."
        sleep 3
    fi

    if [ "$i" -eq 3 ]; then
        error "Push failed after retries"
    fi
done

# ----------------------------
# Step 5: GitHub Actions Monitor
log "Step 5: Checking GitHub Actions..."

if command -v gh >/dev/null && command -v jq >/dev/null; then
    log "GitHub CLI detected"

    # Authenticate if token provided
    if [ -n "$GITHUB_TOKEN" ]; then
        echo "$GITHUB_TOKEN" | gh auth login --with-token >/dev/null 2>&1 || true
    fi

    sleep 5

    gh run list --limit 3 || warning "Cannot fetch workflow list"

    LATEST_RUN=$(gh run list --branch "$BRANCH_NAME" --limit 1 --json databaseId 2>/dev/null | jq -r '.[0].databaseId // empty')

    if [ -n "$LATEST_RUN" ]; then
        log "Watching workflow: $LATEST_RUN"
        gh run watch "$LATEST_RUN" || warning "Failed to watch run"
    else
        warning "No workflow run found"
    fi
else
    warning "gh or jq not installed, skipping monitoring"
fi

# ----------------------------
# Step 6: Deployment Summary
log "Step 6: Creating summary..."

REPO_PATH=$(get_repo_path)

cat <<EOF > deployment-info.json
{
  "timestamp": "$(date -Iseconds)",
  "commit_hash": "$COMMIT_HASH",
  "branch": "$BRANCH_NAME",
  "repository": "$REPO_PATH"
}
EOF

success "deployment-info.json created"

# ----------------------------
# Final Output
echo ""
echo "========================================="
echo "🎉 DEPLOYMENT COMPLETE"
echo "========================================="
echo "🔗 Repo: https://github.com/$REPO_PATH"
echo "🧾 Commit: $COMMIT_HASH"
echo "🌿 Branch: $BRANCH_NAME"
echo ""

echo "📱 APK (after CI):"
echo "https://github.com/$REPO_PATH/actions"

echo ""

# ----------------------------
# Open browser (cross-platform)
URL="https://github.com/$REPO_PATH/actions"

if command -v xdg-open >/dev/null; then
    xdg-open "$URL" >/dev/null 2>&1 &
elif command -v open >/dev/null; then
    open "$URL" >/dev/null 2>&1 &
elif command -v start >/dev/null; then
    start "$URL"
fi

success "All done 🚀"