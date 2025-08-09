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

async function fetchRepositoryReadme(repoFullName: string, token: string): Promise<string | undefined> {
  try {
    const url = `https://api.github.com/repos/${repoFullName}/readme`;
    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3.raw',
        Authorization: `Bearer ${token as string}`,
        'User-Agent': 'git2video-pr-analyzer/1.0.0',
      },
    });
    if (!res.ok) return undefined;
    return await res.text();
  } catch {
    return undefined;
  }
}

async function fetchPRData() {
  console.log('📡 Fetching PR data from GitHub...');
  
  try {
    // Import GitHub client and related services
    const { GitHubApiClient } = await import('./src/github/client');
    const { GitHubPRFetcher } = await import('./src/github/fetcher');
    
    const client = new GitHubApiClient({
      token: (config.githubToken as string),
      timeout: 30000,
    });

    const fetcher = new GitHubPRFetcher(client);
    const [owner, repo] = (config.repository as string).split('/');
    const prNumber = parseInt(config.prNumber as string);

    console.log(`   Repository: ${owner}/${repo}`);
    console.log(`   PR Number: #${prNumber}`);
    
    // Validate repository format
    if (!owner || !repo) {
      throw new Error(`Invalid repository format: ${config.repository}. Expected format: owner/repo`);
    }
    
    if (isNaN(prNumber)) {
      throw new Error(`Invalid PR number: ${config.prNumber}. Expected a number`);
    }

    // Fetch comprehensive PR data
    const prData = await fetcher.fetchPRData(owner, repo, prNumber, {
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
    // Import video generation modules
    const { PRVideoTransformer } = await import('./src/github/transformer');
    const { ScriptGenerator } = await import('./src/narrative/scripts');
    const { generateNarrative } = await import('./src/narrative');
    
    // Transform PR data for video
    const transformer = new PRVideoTransformer();
    const vt = (['summary','detailed','technical'].includes(String(config.videoType)) ? (config.videoType as 'summary'|'detailed'|'technical') : 'summary');
    const videoMetadata = transformer.transform(prData, vt);

    console.log(`   Video Type: ${config.videoType}`);
    console.log(`   Duration: ${videoMetadata.duration}s`);
    console.log(`   Scenes: ${videoMetadata.scenes.length}`);

    // Generate script
    const scriptGenerator = new ScriptGenerator();
    const script = await scriptGenerator.generateScript(videoMetadata, {
      templateType: (['summary','detailed','technical'].includes(String(config.videoType)) ? (config.videoType as any) : 'summary'),
      targetDuration: videoMetadata.duration,
      audience: {
        primary: 'general',
        technicalLevel: 'intermediate',
        projectFamiliarity: 'basic',
        communicationStyle: 'presentation',
      },
      style: { tone: 'professional', pacing: 'moderate', approach: 'chronological', complexity: 'moderate', emphasis: 'impact_focused' },
    });

    // Generate persona-based narrative via Ollama (best-effort)
    let narrative: { transcript: string; model: string; persona: string } | undefined;
    try {
      const ollamaBase = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
      const model = process.env.NARRATIVE_MODEL || 'llama3.1:8b';
      const persona = (process.env.PERSONA || 'executive') as any;
      const readmeText = await fetchRepositoryReadme(config.repository!, config.githubToken!);
      narrative = await generateNarrative(
        { pr: prData, metadata: videoMetadata, readmeText },
        { baseUrl: ollamaBase, model, persona }
      );
      console.log(`🗣️ Narrative generated with ${model} (${persona})`);
    } catch (e) {
      console.warn('Narrative generation skipped or failed:', (e as Error).message);
    }

    console.log('✅ Video content generated');

    return {
      metadata: videoMetadata,
      script: script,
      prData: prData,
      narrative,
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

    const compositionId = compositionMap[String(config.videoType)] || 'PRSummaryVideo';

    // Prepare input props for Remotion
    const inputProps = {
      prData: videoContent.prData,
      metadata: videoContent.metadata,
      script: videoContent.script,
      title: config.videoTitle || videoContent.metadata.title,
      narrative: videoContent.narrative,
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
        disableWebSecurity: true,
        gl: 'angle',
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