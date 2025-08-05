#!/bin/bash

# Test script for PR video generation
# Usage: ./test-pr-video.sh [GITHUB_TOKEN] [REPO] [PR_NUMBER] [VIDEO_TYPE]

set -e

echo "🎬 PR Video Generation Test Script"
echo "=================================="

# Get parameters
GITHUB_TOKEN=${1:-$GITHUB_TOKEN}
GITHUB_REPOSITORY=${2:-$GITHUB_REPOSITORY}
PR_NUMBER=${3:-$PR_NUMBER}
VIDEO_TYPE=${4:-summary}

# Validate required parameters
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ ERROR: GitHub token is required"
    echo "Usage: ./test-pr-video.sh [GITHUB_TOKEN] [REPO] [PR_NUMBER] [VIDEO_TYPE]"
    echo "Or set GITHUB_TOKEN environment variable"
    exit 1
fi

if [ -z "$GITHUB_REPOSITORY" ]; then
    echo "❌ ERROR: GitHub repository is required (format: owner/repo)"
    echo "Usage: ./test-pr-video.sh [GITHUB_TOKEN] [REPO] [PR_NUMBER] [VIDEO_TYPE]"
    echo "Or set GITHUB_REPOSITORY environment variable"
    exit 1
fi

if [ -z "$PR_NUMBER" ]; then
    echo "❌ ERROR: PR number is required"
    echo "Usage: ./test-pr-video.sh [GITHUB_TOKEN] [REPO] [PR_NUMBER] [VIDEO_TYPE]"
    echo "Or set PR_NUMBER environment variable"
    exit 1
fi

echo "📋 Configuration:"
echo "   Repository: $GITHUB_REPOSITORY"
echo "   PR Number: $PR_NUMBER"
echo "   Video Type: $VIDEO_TYPE"
echo "   Output Directory: ./out/"
echo ""

# Create output directory
mkdir -p ./out

# Set environment variables
export GITHUB_TOKEN="$GITHUB_TOKEN"
export GITHUB_REPOSITORY="$GITHUB_REPOSITORY"
export PR_NUMBER="$PR_NUMBER"
export VIDEO_TYPE="$VIDEO_TYPE"
export OUTPUT_NAME="test-pr-${PR_NUMBER}-${VIDEO_TYPE}"

echo "🚀 Starting PR video generation..."
echo ""

# Run the Docker container
docker compose run --rm pr-video-render

echo ""
echo "✅ Video generation completed!"
echo "📁 Check the ./out/ directory for your video file"
echo ""

# List generated files
if [ -d "./out" ]; then
    echo "📋 Generated files:"
    ls -la ./out/
fi