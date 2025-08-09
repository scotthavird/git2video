# Remotion Docker Template

A dockerized Remotion template for creating animated videos. Generates a 15-second "Hello World" animation with atomic design components.

📖 **[Read the complete developer guide](https://www.scotthavird.com/blog/remotion-docker-template)** - Learn about building scalable video generation pipelines with Remotion, Docker, and GitHub Actions.

## Quick Start

### Prerequisites
- Docker & Docker Compose

### 1. Clone Repository
```bash
git clone https://github.com/scotthavird/remotion-docker-template
cd remotion-docker-template
```

### 2. Development Mode
```bash
# Start Remotion Studio with hot reload
docker-compose up remotion-dev

# Open http://localhost:3000
```

### 3. Render Video
```bash
# Generate video
docker-compose up remotion-render

# Output: ./out/HelloWorld.mp4
```

### Local Development (Alternative)
```bash
pnpm install
pnpm dev    # Start studio
pnpm render # Render video
```

## GitHub Actions & Container Registry

### Quick Setup (2 minutes)
1. **Enable Container Registry**: Settings → Packages → "Inherit access from source repository"
2. **Push to main**: `git push origin main` (triggers first build)
3. **Use Actions**: Go to Actions tab → "Render Video" → "Run workflow"

### Automated Workflows
1. **Build & Publish**: Pushes Docker image to `ghcr.io/{username}/{repository}` on main branch
2. **PR Video Generation**: 
   - **Automatic**: Videos generated when PRs are merged into main
   - **Manual**: Generate videos for any PR via Actions tab
3. **Template Video Rendering**: Manual video generation with customizable parameters

### Usage

**PR Videos (Automatic)**:
- Merge any PR into main → Video automatically generated
- Check Releases section for `pr-video-{PR_NUMBER}-automatic`
- Original PR gets commented with download link

**PR Videos (Manual Testing)**:
1. Go to **Actions** tab → **"Generate PR Video"**
2. Enter PR number and choose video type
3. Video available in Releases as `pr-video-{PR_NUMBER}-manual`

**Template Videos**:
1. Go to **Actions** tab → **"Render Video"** 
2. Click **"Run workflow"** 
3. Customize parameters (title, subtitle, etc.)
4. Download from artifacts or releases

### Container Registry Setup
- Enable in Settings → Packages
- Create PAT with `write:packages` permission for local pushing

## What's Included

- **Components**: Atomic design (atoms → molecules → organisms)  
- **Docker**: Development and render containers
- **GitHub Actions**: Automated building and rendering
- **Visual Editing**: Real-time prop editing in Remotion Studio
- **TypeScript**: Full type safety

## Scripts
- `./scripts/build-and-push.sh` - Build/push Docker image
- `./scripts/test-local.sh` - Test container locally

## Cursor Rules

This project includes Cursor rules to enhance AI-assisted development:

- **Project Structure** (`.cursor/rules/project-structure.mdc`) - Overview of the codebase architecture
- **Remotion Components** (`.cursor/rules/remotion-components.mdc`) - Component development patterns and atomic design
- **GitHub Actions** (`.cursor/rules/github-actions.mdc`) - Workflow development and automation patterns
- **Docker Development** (`.cursor/rules/docker-development.mdc`) - Container development and deployment patterns

These rules help Cursor understand the project structure, coding patterns, and development workflows for better AI assistance.

## Persona-based Narrative Generation (Open-source LLM via Ollama)

This template can generate a persona-based transcript from PR context and the repository README using an open-source model running locally in an Ollama sidecar (e.g., Llama 3.1 8B Instruct).

Steps:

1. Start the Ollama service:

```bash
docker compose up -d ollama
```

2. Pull a model once inside the container (examples):

```bash
docker exec -it ollama bash -lc "ollama pull llama3.1:8b"
# Alternatives: qwen2.5:7b, mistral:7b-instruct
```

3. Set env (see `env.example`):

```bash
export GITHUB_TOKEN=...           # required
export GITHUB_REPOSITORY=owner/repo
export PR_NUMBER=123
export VIDEO_TYPE=summary         # summary|detailed|technical
export OLLAMA_BASE_URL=http://ollama:11434
export NARRATIVE_MODEL=llama3.1:8b
export PERSONA=executive          # executive|product|engineering|qa|design|marketing|general|external
```

4. Render the PR video with narrative:

```bash
docker compose up pr-video-render
```

The narrative is available to Remotion compositions via `inputProps.narrative`. The `PRSummaryVideo` overlays the transcript as a small caption by default.

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).

**Built with [Remotion](https://remotion.dev) 🎬**
