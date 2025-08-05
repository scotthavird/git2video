/**
 * Example usage of GitHub API integration for PR video generation
 * This file demonstrates how to integrate the GitHub API with Remotion video generation
 */

import { createGitHubIntegration } from './index';
import { VideoMetadata } from './transformer';

// Example 1: Basic PR video generation
async function basicExample() {
  console.log('🚀 Basic PR video generation example\n');

  // Initialize GitHub integration
  const github = createGitHubIntegration({
    token: process.env.GITHUB_TOKEN!, // Set this in your environment
    enableCircuitBreaker: true,
    logLevel: 'info',
  });

  try {
    // Check if we have access to the repository
    const hasAccess = await github.checkRepositoryAccess('microsoft', 'vscode');
    console.log(`Repository access: ${hasAccess ? '✅ Granted' : '❌ Denied'}`);

    if (!hasAccess) {
      console.log('Cannot generate video without repository access');
      return;
    }

    // Generate summary video for a specific PR
    console.log('Generating video metadata for microsoft/vscode#123...');
    const videoMetadata = await github.generatePRVideo('microsoft', 'vscode', 123, {
      videoType: 'summary',
      includeCommits: true,
      includeFiles: true,
      includeReviews: true,
    });

    console.log('\n📹 Video Metadata Generated:');
    console.log(`Title: ${videoMetadata.title}`);
    console.log(`Subtitle: ${videoMetadata.subtitle}`);
    console.log(`Duration: ${videoMetadata.duration} seconds`);
    console.log(`Scenes: ${videoMetadata.scenes.length}`);
    console.log(`Participants: ${videoMetadata.participants.length}`);

    // Display scene breakdown
    console.log('\n🎬 Scene Breakdown:');
    videoMetadata.scenes.forEach((scene, index) => {
      console.log(`  ${index + 1}. ${scene.title} (${scene.duration}s) - ${scene.priority} priority`);
    });

    // Display key metrics
    console.log('\n📊 Key Metrics:');
    console.log(`  Commits: ${videoMetadata.keyMetrics.totalCommits}`);
    console.log(`  Files changed: ${videoMetadata.keyMetrics.totalFiles}`);
    console.log(`  Lines added: ${videoMetadata.keyMetrics.totalAdditions}`);
    console.log(`  Lines deleted: ${videoMetadata.keyMetrics.totalDeletions}`);
    console.log(`  Primary language: ${videoMetadata.keyMetrics.primaryLanguage}`);

    return videoMetadata;
  } catch (error) {
    console.error('❌ Error generating video:', error);
    throw error;
  }
}

// Example 2: Detailed video with custom options
async function detailedExample() {
  console.log('\n🎯 Detailed PR video generation example\n');

  const github = createGitHubIntegration({
    token: process.env.GITHUB_TOKEN!,
    enableCircuitBreaker: true,
    logLevel: 'debug',
    retryAttempts: 5,
    rateLimitBuffer: 20, // More conservative rate limiting
  });

  try {
    // Generate detailed video with all features
    const videoMetadata = await github.generatePRVideo('facebook', 'react', 456, {
      videoType: 'detailed',
      includeCommits: true,
      includeFiles: true,
      includeReviews: true,
      includeComments: true,
      includeTimeline: true,
      parallel: true,
      maxConcurrency: 3,
    });

    console.log('📹 Detailed Video Generated:');
    console.log(`Total duration: ${videoMetadata.duration} seconds`);
    
    // Show participants and their contributions
    console.log('\n👥 Participants:');
    videoMetadata.participants.slice(0, 5).forEach(participant => {
      console.log(`  ${participant.user.login} (${participant.role}):`);
      console.log(`    Commits: ${participant.contributions.commits}`);
      console.log(`    Reviews: ${participant.contributions.reviews}`);
      console.log(`    Comments: ${participant.contributions.comments}`);
    });

    return videoMetadata;
  } catch (error) {
    console.error('❌ Error generating detailed video:', error);
    throw error;
  }
}

// Example 3: Batch processing multiple PRs
async function batchProcessingExample() {
  console.log('\n🔄 Batch processing example\n');

  const github = createGitHubIntegration({
    token: process.env.GITHUB_TOKEN!,
    enableCircuitBreaker: true,
    logLevel: 'info',
  });

  const prList = [
    { owner: 'microsoft', repo: 'vscode', number: 123 },
    { owner: 'microsoft', repo: 'vscode', number: 124 },
    { owner: 'microsoft', repo: 'vscode', number: 125 },
  ];

  console.log(`Processing ${prList.length} PRs...`);

  const results = [];
  for (const pr of prList) {
    try {
      console.log(`\nProcessing ${pr.owner}/${pr.repo}#${pr.number}...`);
      
      const videoMetadata = await github.generatePRVideo(
        pr.owner,
        pr.repo,
        pr.number,
        { videoType: 'summary', parallel: true }
      );

      results.push({
        pr,
        success: true,
        metadata: videoMetadata,
      });

      console.log(`✅ Success: ${videoMetadata.title}`);
    } catch (error) {
      console.log(`❌ Failed: ${error}`);
      results.push({
        pr,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Add delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📊 Batch Processing Summary:');
  const successful = results.filter(r => r.success).length;
  console.log(`Successful: ${successful}/${results.length}`);

  return results;
}

// Example 4: Monitoring and health checks
async function monitoringExample() {
  console.log('\n📊 Monitoring and health checks example\n');

  const github = createGitHubIntegration({
    token: process.env.GITHUB_TOKEN!,
    enableCircuitBreaker: true,
    enableDetailedLogging: true,
  });

  // Check current rate limit status
  try {
    const rateLimit = await github.getRateLimit();
    console.log('🔒 Rate Limit Status:');
    console.log(`  Remaining: ${rateLimit.resources.core.remaining}/${rateLimit.resources.core.limit}`);
    console.log(`  Resets at: ${new Date(rateLimit.resources.core.reset * 1000).toISOString()}`);

    const utilizationPercent = ((rateLimit.resources.core.limit - rateLimit.resources.core.remaining) / rateLimit.resources.core.limit) * 100;
    console.log(`  Utilization: ${utilizationPercent.toFixed(1)}%`);
  } catch (error) {
    console.error('❌ Failed to fetch rate limit:', error);
  }

  // Generate some activity for monitoring
  try {
    await github.generatePRVideo('microsoft', 'vscode', 123, {
      videoType: 'summary',
    });
  } catch (error) {
    // Expected to potentially fail for demonstration
  }

  // Get system health report
  const health = github.getSystemHealth();
  console.log('\n🏥 System Health:');
  console.log(`  Status: ${health.health.status.toUpperCase()}`);
  console.log(`  Summary: ${health.health.summary}`);

  if (health.health.recommendations.length > 0) {
    console.log('  Recommendations:');
    health.health.recommendations.forEach(rec => {
      console.log(`    - ${rec}`);
    });
  }

  // Performance metrics
  const perf = health.health.metrics.performance;
  console.log('\n⚡ Performance Metrics:');
  console.log(`  Average response time: ${Math.round(perf.averageResponseTime)}ms`);
  console.log(`  Success rate: ${(perf.successRate * 100).toFixed(1)}%`);

  // Error metrics
  const errors = health.health.metrics.errors;
  console.log('\n🚨 Error Metrics:');
  console.log(`  Total errors: ${errors.totalErrors}`);
  console.log(`  Error rate: ${(errors.errorRate * 100).toFixed(1)}%`);

  // Circuit breaker status
  if (health.circuitBreakerStatus) {
    console.log('\n🔌 Circuit Breaker:');
    console.log(`  State: ${health.circuitBreakerStatus.state}`);
    console.log(`  Failures: ${health.circuitBreakerStatus.failureCount}`);
  }

  return health;
}

// Example 5: Integration with Remotion (pseudo-code)
function remotionIntegrationExample() {
  console.log('\n🎥 Remotion integration example\n');

  // This would be used in a Remotion composition
  const exampleRemotionComponent = `
// In your Remotion composition file
import React, { useEffect, useState } from 'react';
import { useVideoConfig, useCurrentFrame, interpolate } from 'remotion';
import { createGitHubIntegration, VideoMetadata } from './github';

export const PRVideoComposition: React.FC<{
  owner: string;
  repo: string;
  prNumber: number;
}> = ({ owner, repo, prNumber }) => {
  const [videoData, setVideoData] = useState<VideoMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPRData = async () => {
      try {
        const github = createGitHubIntegration({
          token: process.env.GITHUB_TOKEN!,
        });

        const metadata = await github.generatePRVideo(owner, repo, prNumber, {
          videoType: 'summary',
          includeCommits: true,
          includeFiles: true,
          includeReviews: true,
        });

        setVideoData(metadata);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPRData();
  }, [owner, repo, prNumber]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message={error} />;
  }

  if (!videoData) {
    return <div>No data available</div>;
  }

  return (
    <div style={{
      backgroundColor: videoData.theme.backgroundColor,
      color: videoData.theme.textColor,
      width: '100%',
      height: '100%',
    }}>
      {videoData.scenes.map((scene, index) => (
        <SceneRenderer
          key={scene.type}
          scene={scene}
          theme={videoData.theme}
          sceneIndex={index}
          totalScenes={videoData.scenes.length}
        />
      ))}
    </div>
  );
};

// Scene renderer component
const SceneRenderer: React.FC<{
  scene: VideoSceneData;
  theme: VideoTheme;
  sceneIndex: number;
  totalScenes: number;
}> = ({ scene, theme, sceneIndex, totalScenes }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Calculate scene timing
  const sceneStartFrame = sceneIndex * scene.duration * fps;
  const sceneEndFrame = sceneStartFrame + scene.duration * fps;
  const sceneProgress = interpolate(
    frame,
    [sceneStartFrame, sceneEndFrame],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  // Only render when this scene is active
  if (frame < sceneStartFrame || frame > sceneEndFrame) {
    return null;
  }

  switch (scene.type) {
    case 'intro':
      return <IntroScene data={scene.data} theme={theme} progress={sceneProgress} />;
    case 'overview':
      return <OverviewScene data={scene.data} theme={theme} progress={sceneProgress} />;
    case 'commits':
      return <CommitsScene data={scene.data} theme={theme} progress={sceneProgress} />;
    case 'files':
      return <FilesScene data={scene.data} theme={theme} progress={sceneProgress} />;
    case 'summary':
      return <SummaryScene data={scene.data} theme={theme} progress={sceneProgress} />;
    default:
      return <DefaultScene data={scene.data} theme={theme} progress={sceneProgress} />;
  }
};
  `;

  console.log('📝 Example Remotion Component Structure:');
  console.log(exampleRemotionComponent);
}

// Example 6: Error handling and recovery
async function errorHandlingExample() {
  console.log('\n🛡️ Error handling and recovery example\n');

  const github = createGitHubIntegration({
    token: process.env.GITHUB_TOKEN!,
    enableCircuitBreaker: true,
    retryAttempts: 3,
    retryDelay: 2000,
  });

  // Simulate various error conditions
  const testCases = [
    { owner: 'nonexistent', repo: 'repo', number: 1, expectedError: 'Not Found' },
    { owner: 'microsoft', repo: 'vscode', number: 999999, expectedError: 'Not Found' },
    // Add more test cases as needed
  ];

  for (const testCase of testCases) {
    try {
      console.log(`Testing ${testCase.owner}/${testCase.repo}#${testCase.number}...`);
      
      const result = await github.generatePRVideo(
        testCase.owner,
        testCase.repo,
        testCase.number
      );
      
      console.log(`✅ Unexpected success: ${result.title}`);
    } catch (error) {
      console.log(`❌ Expected error: ${error}`);
      
      // Check error statistics
      const health = github.getSystemHealth();
      console.log(`Error count: ${health.errorStatistics.totalErrors}`);
    }
  }
}

// Main execution function
async function runExamples() {
  console.log('🎬 GitHub API Integration Examples\n');
  console.log('=====================================\n');

  // Check if GitHub token is available
  if (!process.env.GITHUB_TOKEN) {
    console.error('❌ GITHUB_TOKEN environment variable is required');
    console.log('Please set GITHUB_TOKEN to your GitHub Personal Access Token');
    process.exit(1);
  }

  try {
    // Run examples sequentially
    await basicExample();
    await detailedExample();
    await batchProcessingExample();
    await monitoringExample();
    remotionIntegrationExample();
    await errorHandlingExample();

    console.log('\n✅ All examples completed successfully!');
  } catch (error) {
    console.error('\n❌ Example execution failed:', error);
    process.exit(1);
  }
}

// Export for use in other modules
export {
  basicExample,
  detailedExample,
  batchProcessingExample,
  monitoringExample,
  remotionIntegrationExample,
  errorHandlingExample,
  runExamples,
};

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples().catch(console.error);
}