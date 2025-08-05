# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Basic Development
```bash
# Start Remotion Studio with hot reload
npm run dev
# or
docker-compose up remotion-dev

# Open http://localhost:3000
```

### Video Rendering
```bash
# Render video locally
npm run render
# or
docker-compose up remotion-render

# Custom render with environment variables
TITLE="Custom Title" SUBTITLE="Custom Subtitle" npm run render
```

### Testing
```bash
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage
```

### Docker Operations
```bash
# Build and push Docker image
./scripts/build-and-push.sh v1.0.0

# Test container locally
./scripts/test-local.sh "Custom Title" "Custom Subtitle"

# Check container status
./scripts/status.sh
```

## Architecture Overview

This is a Remotion-based video generation template using atomic design principles and Docker containerization.

### Component Architecture
- **Atoms** (`src/components/atoms/`): Basic building blocks like AnimatedText, AnimatedCircle, ScrollingPage
- **Molecules** (`src/components/molecules/`): Composite components like IntroSection, ContentSection, OutroSection  
- **Organisms** (`src/components/organisms/`): Main compositions like HelloWorldComposition

### Key Files
- `src/index.tsx`: Main composition registration with Zod schemas for visual editing
- `render.mjs`: Video rendering script that reads environment variables for props
- `remotion.config.ts`: Remotion webpack and video configuration
- `docker-compose.yml`: Development and render services configuration

### Reference Projects
The `resources/` directory contains two reference implementations:

1. **recorder-main/**: Advanced video recording and editing with captions, scene management, and B-roll integration
2. **template-code-hike-main/**: Code-focused video generation with syntax highlighting and annotations

Study these for patterns on video recording, caption processing, scene transitions, code visualization, and progress tracking.

### Environment Variables for Rendering
The render script accepts these environment variables:
- `TITLE`: Main title text (default: "Hello World")
- `SUBTITLE`: Subtitle text (default: "Welcome to Remotion")
- `CONTENT_HEADER`: Content section header (default: "Discover More")
- `OUTRO_MESSAGE`: Outro message (default: "Thank You!")

### GitHub Actions Integration
- Manual video rendering via Actions tab with customizable parameters
- Automatic Docker image building and publishing to GitHub Container Registry
- Output videos available as workflow artifacts and releases

### Component Development Patterns
- Use Zod schemas for prop validation and visual editing support
- Mock Remotion hooks in tests: `useCurrentFrame`, `useVideoConfig`, `interpolate`, `spring`
- Follow atomic design hierarchy when creating new components
- Each component should have: `index.tsx`, `types.ts`, `README.md`, and `ComponentName.test.tsx`

### Docker Considerations
- Container runs as non-root user for security
- Chrome dependencies required for Remotion rendering
- Output directory `/usr/src/app/out` with proper permissions
- Use `node:22-bookworm-slim` base image with Chrome packages