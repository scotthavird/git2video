import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import fs from 'fs';
import { createRequire } from 'node:module';
import path from 'path';

const require = createRequire(import.meta.url);

// Ensure output directory exists
const outputDir = './out';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🚀 Starting PR Video Generation...');

// Get GitHub configuration from environment variables
const config = {
  githubToken: process.env.GITHUB_TOKEN || process.env.GH_TOKEN,
  repository: process.env.GITHUB_REPOSITORY, // format: owner/repo
  prNumber: process.env.PR_NUMBER || process.env.GITHUB_PR_NUMBER,
  videoType: process.env.VIDEO_TYPE || 'summary', // summary, detailed, technical
  videoTitle: process.env.VIDEO_TITLE,
  outputName: process.env.OUTPUT_NAME,
};

console.log('📋 Configuration:', {
  repository: config.repository,
  prNumber: config.prNumber,
  videoType: config.videoType,
  hasToken: !!config.githubToken,
});

// Validate required parameters
if (!config.githubToken) {
  console.error('❌ ERROR: GITHUB_TOKEN is required');
  console.error('   Set GITHUB_TOKEN environment variable with a valid GitHub API token');
  process.exit(1);
}

if (!config.repository) {
  console.error('❌ ERROR: GITHUB_REPOSITORY is required');
  console.error('   Set GITHUB_REPOSITORY environment variable (format: owner/repo)');
  process.exit(1);
}

if (!config.prNumber) {
  console.error('❌ ERROR: PR_NUMBER is required');
  console.error('   Set PR_NUMBER environment variable with the pull request number');
  process.exit(1);
}

// Import GitHub client
const { GitHubClient } = await import('./src/github/client.js');
const { PRVideoTransformer } = await import('./src/github/transformer.js');
const { ScriptGenerator } = await import('./src/video/scripts/ScriptGenerator.js');

async function fetchPRData() {
  console.log('📡 Fetching PR data from GitHub...');
  
  try {
    const client = new GitHubClient({
      token: config.githubToken,
      timeout: 30000,
    });

    const [owner, repo] = config.repository.split('/');
    const prNumber = parseInt(config.prNumber);

    console.log(`   Repository: ${owner}/${repo}`);
    console.log(`   PR Number: #${prNumber}`);

    // Fetch comprehensive PR data
    const prData = await client.fetchPRData(owner, repo, prNumber, {
      includeCommits: true,
      includeFiles: true,
      includeReviews: true,
      includeComments: true,
      includeTimeline: true,
    });

    console.log('✅ PR data fetched successfully');
    console.log(`   Title: ${prData.pullRequest.title}`);
    console.log(`   Author: ${prData.pullRequest.user.login}`);
    console.log(`   Files: ${prData.files.length}`);
    console.log(`   Commits: ${prData.commits.length}`);
    console.log(`   Reviews: ${prData.reviews.length}`);

    return prData;
  } catch (error) {
    console.error('❌ Failed to fetch PR data:', error.message);
    throw error;
  }
}

async function generateVideoContent(prData) {
  console.log('🎬 Generating video content...');

  try {
    // Transform PR data for video
    const transformer = new PRVideoTransformer();
    const videoMetadata = transformer.transform(prData, config.videoType);

    console.log(`   Video Type: ${config.videoType}`);
    console.log(`   Duration: ${videoMetadata.duration}s`);
    console.log(`   Scenes: ${videoMetadata.scenes.length}`);

    // Generate script
    const scriptGenerator = new ScriptGenerator();
    const script = await scriptGenerator.generateScript(videoMetadata, {
      videoType: config.videoType,
      targetDuration: videoMetadata.duration,
      audience: 'mixed', // Default to mixed audience
    });

    console.log('✅ Video content generated');

    return {
      metadata: videoMetadata,
      script: script,
      prData: prData,
    };
  } catch (error) {
    console.error('❌ Failed to generate video content:', error.message);
    throw error;
  }
}

async function renderVideo(videoContent) {
  console.log('🎨 Starting video rendering...');

  try {
    // Bundle the React app
    console.log('   Bundling application...');
    const bundled = await bundle({
      entryPoint: require.resolve('./src/index.tsx'),
      webpackOverride: (config) => config,
    });

    // Determine composition ID based on video type
    const compositionMap = {
      'summary': 'PRSummaryVideo',
      'detailed': 'PRDetailedVideo', 
      'technical': 'PRTechnicalVideo',
    };

    const compositionId = compositionMap[config.videoType] || 'PRSummaryVideo';

    // Prepare input props for Remotion
    const inputProps = {
      prData: videoContent.prData,
      metadata: videoContent.metadata,
      script: videoContent.script,
      title: config.videoTitle || videoContent.metadata.title,
    };

    console.log(`   Composition: ${compositionId}`);

    // Select composition
    const composition = await selectComposition({
      serveUrl: bundled,
      id: compositionId,
      inputProps,
    });

    console.log(`   Duration: ${composition.durationInFrames} frames (${composition.durationInFrames / composition.fps}s)`);
    console.log(`   Dimensions: ${composition.width}x${composition.height}`);

    // Generate output filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const defaultName = `pr-${config.prNumber}-${config.videoType}-${timestamp}`;
    const outputName = config.outputName || defaultName;
    const outputPath = path.join(outputDir, `${outputName}.mp4`);

    console.log('   Rendering video...');

    // Render the video
    await renderMedia({
      codec: 'h264',
      composition,
      serveUrl: bundled,
      outputLocation: outputPath,
      chromiumOptions: {
        enableMultiProcessOnLinux: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
        ],
      },
      inputProps,
      onProgress: ({ progress }) => {
        const percentage = Math.round(progress * 100);
        if (percentage % 10 === 0) {
          console.log(`   Progress: ${percentage}%`);
        }
      },
    });

    console.log('✅ Video rendered successfully!');
    console.log(`📁 Output: ${path.resolve(outputPath)}`);
    console.log(`🎬 Details: ${composition.width}x${composition.height}, ${composition.durationInFrames / composition.fps}s`);

    return outputPath;
  } catch (error) {
    console.error('❌ Video rendering failed:', error.message);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    console.log('🎯 PR Video Generation Pipeline Started');
    console.log('=====================================');

    // Step 1: Fetch PR data from GitHub
    const prData = await fetchPRData();

    // Step 2: Generate video content and script
    const videoContent = await generateVideoContent(prData);

    // Step 3: Render the video
    const outputPath = await renderVideo(videoContent);

    console.log('=====================================');
    console.log('🎉 SUCCESS: PR Video Generated!');
    console.log(`📽️  Video file: ${outputPath}`);
    console.log(`🔗 PR: ${prData.pullRequest.html_url}`);
    console.log('=====================================');

  } catch (error) {
    console.error('=====================================');
    console.error('💥 PIPELINE FAILED');
    console.error(`❌ Error: ${error.message}`);
    console.error('=====================================');
    process.exit(1);
  }
}

// Run the pipeline
main();