# GitHub API Integration for PR Video Generation

This module provides a comprehensive GitHub API integration system for extracting pull request data and transforming it into video-ready content for Remotion-based video generation.

## Features

- **Rate-limited API client** with automatic retry and backoff
- **Parallel data fetching** with dependency management
- **Comprehensive error handling** with circuit breaker pattern
- **Detailed logging and monitoring** with performance metrics
- **Data transformation** for video generation contexts
- **Type-safe TypeScript** interfaces for all GitHub data structures

## Quick Start

```typescript
import { createGitHubIntegration } from './github';

// Initialize the integration
const github = createGitHubIntegration({
  token: process.env.GITHUB_TOKEN!, // Required: GitHub Personal Access Token
  enableCircuitBreaker: true,
  logLevel: 'info',
});

// Generate video metadata for a pull request
const videoMetadata = await github.generatePRVideo('owner', 'repo', 123, {
  videoType: 'summary', // 'summary' | 'detailed' | 'technical'
  includeCommits: true,
  includeFiles: true,
  includeReviews: true,
  includeComments: true,
  parallel: true,
  maxConcurrency: 5,
});

console.log('Video metadata:', videoMetadata);
```

## Configuration Options

```typescript
interface GitHubIntegrationConfig {
  token: string;                    // GitHub token (required)
  baseUrl?: string;                 // API base URL (default: https://api.github.com)
  timeout?: number;                 // Request timeout in ms (default: 30000)
  retryAttempts?: number;           // Max retry attempts (default: 3)
  retryDelay?: number;              // Base retry delay in ms (default: 1000)
  rateLimitBuffer?: number;         // Rate limit buffer (default: 10)
  enableCircuitBreaker?: boolean;   // Enable circuit breaker (default: true)
  enableDetailedLogging?: boolean;  // Enable detailed logging (default: true)
  logLevel?: 'debug' | 'info' | 'warn' | 'error'; // Log level (default: 'info')
  maxLogEntries?: number;           // Max log entries to keep (default: 1000)
}
```

## API Reference

### GitHubIntegration

#### `generatePRVideo(owner, repo, prNumber, options?)`

Generate video metadata for a pull request.

```typescript
const videoMetadata = await github.generatePRVideo('microsoft', 'vscode', 123, {
  videoType: 'detailed',
  includeCommits: true,
  includeFiles: true,
  includeReviews: true,
  includeComments: false,
  includeTimeline: true,
  parallel: true,
  maxConcurrency: 3,
});
```

**Returns:** `VideoMetadata` object with scenes, participants, metrics, and theme.

#### `getPRData(owner, repo, prNumber, options?)`

Get raw PR data without video transformation.

```typescript
const prData = await github.getPRData('microsoft', 'vscode', 123, {
  includeCommits: true,
  includeFiles: true,
  parallel: true,
});
```

**Returns:** `PRVideoData` object with raw GitHub API data and calculated statistics.

#### `checkRepositoryAccess(owner, repo)`

Check if the current token has access to a repository.

```typescript
const hasAccess = await github.checkRepositoryAccess('microsoft', 'vscode');
console.log('Has access:', hasAccess);
```

#### `getRateLimit()`

Get current rate limit status.

```typescript
const rateLimit = await github.getRateLimit();
console.log('Remaining requests:', rateLimit.resources.core.remaining);
```

#### `getSystemHealth()`

Get comprehensive system health and monitoring data.

```typescript
const health = github.getSystemHealth();
console.log('System status:', health.health.status);
console.log('Error rate:', health.health.metrics.errors.errorRate);
```

## Video Types

### Summary Video (Default)
- Duration: ~15-20 seconds
- Scenes: Intro, Overview, Key Changes, Summary, Outro
- Best for: Quick PR overviews, status updates

### Detailed Video
- Duration: ~30-60 seconds  
- Scenes: All summary scenes + Timeline, Review Process
- Best for: Code review presentations, team updates

### Technical Video
- Duration: ~45-90 seconds
- Scenes: All detailed scenes + Technical details, Code analysis
- Best for: Technical deep-dives, architecture reviews

## Generated Video Metadata

The `VideoMetadata` object contains everything needed for video generation:

```typescript
interface VideoMetadata {
  title: string;                    // "PR #123: Add user authentication"
  subtitle: string;                 // "microsoft/vscode • 15 files • 3 contributors"
  description: string;              // Brief description
  duration: number;                 // Total duration in seconds
  scenes: VideoSceneData[];         // Array of video scenes
  participants: ParticipantSummary[]; // Contributor information
  keyMetrics: KeyMetrics;           // Important statistics
  theme: VideoTheme;                // Color scheme and styling
}
```

### Scene Types

- **intro**: PR introduction with basic info
- **overview**: High-level PR summary
- **commits**: Code changes timeline
- **files**: File modifications breakdown
- **reviews**: Code review process
- **timeline**: Detailed event timeline
- **summary**: Key outcomes and achievements
- **outro**: Thank you and credits

## Error Handling

The system includes comprehensive error handling:

```typescript
try {
  const videoMetadata = await github.generatePRVideo('owner', 'repo', 123);
} catch (error) {
  if (error instanceof GitHubApiRateLimitError) {
    console.log('Rate limited until:', error.resetTime);
  } else if (error instanceof GitHubApiAuthenticationError) {
    console.log('Invalid token or insufficient permissions');
  } else if (error instanceof GitHubApiNotFoundError) {
    console.log('Repository or PR not found');
  } else {
    console.log('Unexpected error:', error.message);
  }
}
```

## Monitoring and Diagnostics

### Health Monitoring

```typescript
const health = github.getSystemHealth();

if (health.health.status === 'critical') {
  console.log('System issues detected:');
  health.health.recommendations.forEach(rec => console.log('-', rec));
}
```

### Export Diagnostics

```typescript
// Export as JSON for analysis
const diagnostics = github.exportDiagnostics('json');
console.log('System diagnostics:', JSON.parse(diagnostics));

// Export as CSV for spreadsheet analysis
const csvData = github.exportDiagnostics('csv');
```

### Performance Metrics

The system automatically tracks:
- API response times
- Success/failure rates
- Rate limit utilization
- Error frequencies
- Recovery times

## Best Practices

### 1. Token Management

```typescript
// Use environment variables for tokens
const github = createGitHubIntegration({
  token: process.env.GITHUB_TOKEN!,
  // Never hardcode tokens in source code
});
```

### 2. Rate Limit Management

```typescript
// Check rate limits before heavy operations
const rateLimit = await github.getRateLimit();
if (rateLimit.resources.core.remaining < 100) {
  console.log('Low on API requests, consider waiting');
}
```

### 3. Error Recovery

```typescript
// Enable circuit breaker for production
const github = createGitHubIntegration({
  token: process.env.GITHUB_TOKEN!,
  enableCircuitBreaker: true,
  retryAttempts: 3,
  retryDelay: 2000,
});
```

### 4. Performance Optimization

```typescript
// Use parallel fetching for better performance
const videoMetadata = await github.generatePRVideo('owner', 'repo', 123, {
  parallel: true,
  maxConcurrency: 5, // Adjust based on rate limits
});
```

### 5. Monitoring

```typescript
// Regular health checks
setInterval(() => {
  const health = github.getSystemHealth();
  if (health.health.status !== 'healthy') {
    console.warn('System health issue:', health.health.summary);
  }
}, 60000); // Check every minute
```

## Integration with Remotion

The generated video metadata is designed to work seamlessly with Remotion:

```typescript
// In your Remotion composition
import { GitHubIntegration } from './github';

export const PRVideoComposition: React.FC<{
  owner: string;
  repo: string;
  prNumber: number;
}> = ({ owner, repo, prNumber }) => {
  const [videoData, setVideoData] = useState<VideoMetadata | null>(null);

  useEffect(() => {
    const github = createGitHubIntegration({
      token: process.env.GITHUB_TOKEN!,
    });

    github.generatePRVideo(owner, repo, prNumber)
      .then(setVideoData)
      .catch(console.error);
  }, [owner, repo, prNumber]);

  if (!videoData) return <div>Loading...</div>;

  return (
    <div style={{ backgroundColor: videoData.theme.backgroundColor }}>
      {videoData.scenes.map((scene, index) => (
        <Scene
          key={scene.type}
          from={index * 30} // Adjust timing as needed
          durationInFrames={scene.duration * 30} // Convert to frames
          scene={scene}
          theme={videoData.theme}
        />
      ))}
    </div>
  );
};
```

## Environment Variables

Create a `.env` file with:

```bash
# Required
GITHUB_TOKEN=your_github_personal_access_token

# Optional
GITHUB_API_BASE_URL=https://api.github.com
GITHUB_API_TIMEOUT=30000
GITHUB_ENABLE_CIRCUIT_BREAKER=true
GITHUB_LOG_LEVEL=info
```

## Testing

Run the test suite:

```bash
npm test src/github
```

Run specific test files:

```bash
npm test src/github/__tests__/client.test.ts
npm test src/github/__tests__/fetcher.test.ts
npm test src/github/__tests__/transformer.test.ts
npm test src/github/__tests__/integration.test.ts
```

## Troubleshooting

### Common Issues

1. **Authentication Error**
   - Verify your GitHub token is valid
   - Check token permissions (needs repo access)
   - Ensure token hasn't expired

2. **Rate Limit Exceeded**
   - Wait for rate limit reset
   - Reduce concurrency settings
   - Consider GitHub App authentication for higher limits

3. **Repository Not Found**
   - Verify repository exists and is accessible
   - Check repository name spelling
   - Ensure token has access to private repos if needed

4. **Network Errors**
   - Check internet connectivity
   - Verify GitHub API is accessible
   - Consider increasing timeout settings

### Debug Mode

Enable debug logging to troubleshoot issues:

```typescript
const github = createGitHubIntegration({
  token: process.env.GITHUB_TOKEN!,
  logLevel: 'debug',
  enableDetailedLogging: true,
});
```

This will provide detailed information about API calls, rate limits, and error conditions.