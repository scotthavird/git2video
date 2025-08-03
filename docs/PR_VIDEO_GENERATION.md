# PR Video Generation Guide

This system automatically generates professional videos from GitHub pull requests, perfect for team updates, documentation, and stakeholder communications.

## 🎬 Video Types

### Summary Video (2-3 minutes)
- **Audience**: General stakeholders, product managers
- **Content**: High-level overview, key metrics, outcome
- **Use case**: Team updates, executive briefings

### Detailed Video (5-7 minutes)  
- **Audience**: Development team, reviewers
- **Content**: Full commit walkthrough, file changes, review process
- **Use case**: Code reviews, team knowledge sharing

### Technical Video (8-12 minutes)
- **Audience**: Engineers, technical leads
- **Content**: In-depth code analysis, architectural decisions
- **Use case**: Technical documentation, onboarding

## 🚀 Local Testing

### Quick Start

1. **Get a GitHub token** with repo access:
   ```bash
   # Go to: https://github.com/settings/tokens
   # Create token with 'repo' scope
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Generate a video**:
   ```bash
   # Using the test script
   ./test-pr-video.sh

   # Or manually with Docker Compose
   docker-compose run --rm pr-video-render
   ```

### Advanced Usage

```bash
# Generate different video types
VIDEO_TYPE=summary ./test-pr-video.sh
VIDEO_TYPE=detailed ./test-pr-video.sh  
VIDEO_TYPE=technical ./test-pr-video.sh

# Custom configuration
GITHUB_TOKEN=ghp_xxx \
GITHUB_REPOSITORY=microsoft/vscode \
PR_NUMBER=12345 \
VIDEO_TYPE=detailed \
./test-pr-video.sh
```

## 🔧 Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `GITHUB_TOKEN` | ✅ | GitHub API token | `ghp_xxxxxxxxxxxx` |
| `GITHUB_REPOSITORY` | ✅ | Repository (owner/repo) | `microsoft/vscode` |
| `PR_NUMBER` | ✅ | Pull request number | `12345` |
| `VIDEO_TYPE` | ❌ | Video style | `summary` (default) |
| `VIDEO_TITLE` | ❌ | Custom title | `"Feature Implementation"` |
| `OUTPUT_NAME` | ❌ | Output filename | `my-pr-video` |

## 🏃‍♂️ GitHub Actions Integration

### Basic Workflow

```yaml
name: Generate PR Video
on:
  pull_request:
    types: [closed]

jobs:
  generate-video:
    runs-on: ubuntu-latest
    if: github.event.pull_request.merged == true
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Generate PR Video
      run: |
        docker run --rm \
          -v ${{ github.workspace }}/out:/usr/src/app/out \
          -e GITHUB_TOKEN=${{ secrets.GITHUB_TOKEN }} \
          -e GITHUB_REPOSITORY=${{ github.repository }} \
          -e PR_NUMBER=${{ github.event.number }} \
          -e VIDEO_TYPE=summary \
          ghcr.io/your-org/git2video:latest \
          node render-pr-video.mjs
    
    - name: Upload Video
      uses: actions/upload-artifact@v4
      with:
        name: pr-video
        path: out/*.mp4
```

### Advanced Workflow with Multiple Types

```yaml
name: PR Video Suite
on:
  pull_request:
    types: [closed]

jobs:
  generate-videos:
    runs-on: ubuntu-latest
    if: github.event.pull_request.merged == true
    strategy:
      matrix:
        video_type: [summary, detailed, technical]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Generate ${{ matrix.video_type }} Video
      run: |
        docker run --rm \
          -v ${{ github.workspace }}/out:/usr/src/app/out \
          -e GITHUB_TOKEN=${{ secrets.GITHUB_TOKEN }} \
          -e GITHUB_REPOSITORY=${{ github.repository }} \
          -e PR_NUMBER=${{ github.event.number }} \
          -e VIDEO_TYPE=${{ matrix.video_type }} \
          -e OUTPUT_NAME=pr-${{ github.event.number }}-${{ matrix.video_type }} \
          ghcr.io/your-org/git2video:latest \
          node render-pr-video.mjs
    
    - name: Upload ${{ matrix.video_type }} Video
      uses: actions/upload-artifact@v4
      with:
        name: pr-video-${{ matrix.video_type }}
        path: out/*.mp4
```

## 🐛 Troubleshooting

### Common Issues

**❌ "GITHUB_TOKEN is required"**
- Ensure you have a valid GitHub token with `repo` scope
- Check that the token isn't expired

**❌ "Cannot read properties of undefined"**
- Verify the repository name format is `owner/repo`
- Ensure the PR number exists and is accessible

**❌ "Rate limit exceeded"**
- Use a token with higher rate limits
- Add delays between requests if processing multiple PRs

**❌ "Video rendering failed"**
- Check that all required components are available
- Verify Docker has sufficient memory allocated

### Debug Mode

```bash
# Enable verbose logging
DEBUG=1 ./test-pr-video.sh

# Check Docker logs
docker-compose logs pr-video-render
```

## 📊 Performance Guidelines

### Resource Requirements

- **Memory**: 2GB minimum, 4GB recommended
- **CPU**: 2 cores minimum for reasonable render times
- **Storage**: ~500MB per video

### Render Times (approximate)

| Video Type | Small PR | Medium PR | Large PR |
|------------|----------|-----------|----------|
| Summary | 30s | 45s | 60s |
| Detailed | 60s | 90s | 120s |
| Technical | 90s | 150s | 200s |

*Times based on 2-core, 4GB Docker container*

## 🎨 Customization

### Themes
Videos automatically select themes based on:
- Primary programming language
- Repository type
- PR complexity

### Content Adaptation
The system intelligently adapts content for:
- **Technical depth** based on audience
- **Duration** based on PR complexity
- **Focus areas** based on change types

## 📈 Output Quality

Generated videos include:
- **1080p resolution** (1920x1080)
- **30fps smooth animations**
- **H.264 encoding** for broad compatibility
- **Professional typography** and color schemes
- **Accessibility features** (high contrast, clear fonts)

## 🔒 Security Considerations

- **Token Security**: Never commit tokens to repositories
- **Private Repos**: Ensure tokens have appropriate access
- **Rate Limits**: Respect GitHub API rate limits
- **Container Security**: Use official base images and security scanning