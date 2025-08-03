import React from 'react';
import { useVideoConfig, AbsoluteFill, Sequence } from 'remotion';
import { PRHeader } from '../components/molecules/pr/PRHeader';
import { CommitCard } from '../components/molecules/pr/CommitCard';
import { DiffRevealAnimation } from '../components/molecules/pr/code/DiffRevealAnimation';
import { processGitHubFile } from '../components/molecules/pr/code/utils/diffProcessor';
import { PRVideoData } from '../github/types';
import { VideoMetadata, VideoScript } from '../video/scripts/types';

interface PRVideoCompositionProps {
  prData: PRVideoData;
  metadata: VideoMetadata;
  script: VideoScript;
  title?: string;
}

// Summary Video Composition (2-3 minutes)
export const PRSummaryVideo: React.FC<PRVideoCompositionProps> = ({
  prData,
  metadata,
  script,
}) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: metadata.theme.backgroundColor,
        fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {/* PR Header - First 4 seconds */}
      <Sequence from={0} durationInFrames={4 * fps}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '60px',
          }}
        >
          <PRHeader
            pullRequest={prData.pullRequest}
            repository={prData.repository}
            animationDelay={0}
            showLabels={true}
            compact={false}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Key Stats - 4-8 seconds */}
      <Sequence from={4 * fps} durationInFrames={4 * fps}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '60px',
            gap: '40px',
          }}
        >
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: metadata.theme.textColor,
              textAlign: 'center',
              marginBottom: '40px',
            }}
          >
            Key Changes
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '60px',
              width: '100%',
              maxWidth: '1200px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '72px',
                  fontWeight: 'bold',
                  color: metadata.theme.primaryColor,
                }}
              >
                {metadata.keyMetrics.totalFiles}
              </div>
              <div
                style={{
                  fontSize: '24px',
                  color: metadata.theme.textColor,
                  opacity: 0.8,
                }}
              >
                Files Changed
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '72px',
                  fontWeight: 'bold',
                  color: metadata.theme.secondaryColor,
                }}
              >
                {metadata.keyMetrics.totalCommits}
              </div>
              <div
                style={{
                  fontSize: '24px',
                  color: metadata.theme.textColor,
                  opacity: 0.8,
                }}
              >
                Commits
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '72px',
                  fontWeight: 'bold',
                  color: metadata.theme.primaryColor,
                }}
              >
                {metadata.keyMetrics.totalAdditions + metadata.keyMetrics.totalDeletions}
              </div>
              <div
                style={{
                  fontSize: '24px',
                  color: metadata.theme.textColor,
                  opacity: 0.8,
                }}
              >
                Line Changes
              </div>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Main Commits - 8-12 seconds */}
      {prData.commits.slice(0, 3).map((commit, index) => (
        <Sequence
          key={commit.sha}
          from={(8 + index * 1.3) * fps}
          durationInFrames={1.3 * fps}
        >
          <AbsoluteFill
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '60px',
            }}
          >
            <CommitCard
              commit={commit}
              animationDelay={0}
              showFiles={false}
              compact={true}
            />
          </AbsoluteFill>
        </Sequence>
      ))}

      {/* Conclusion - Last 2 seconds */}
      <Sequence from={12 * fps} durationInFrames={2 * fps}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '60px',
          }}
        >
          <div
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              color: metadata.theme.textColor,
              textAlign: 'center',
              marginBottom: '20px',
            }}
          >
            {prData.pullRequest.merged ? '✅ Merged Successfully' : '🔄 Ready for Review'}
          </div>
          <div
            style={{
              fontSize: '32px',
              color: metadata.theme.textColor,
              opacity: 0.8,
              textAlign: 'center',
            }}
          >
            {prData.repository.full_name} • PR #{prData.pullRequest.number}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// Detailed Video Composition (5-7 minutes)
export const PRDetailedVideo: React.FC<PRVideoCompositionProps> = ({
  prData,
  metadata,
  script,
}) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: metadata.theme.backgroundColor,
        fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {/* Header */}
      <Sequence from={0} durationInFrames={3 * fps}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '60px',
          }}
        >
          <PRHeader
            pullRequest={prData.pullRequest}
            repository={prData.repository}
            animationDelay={0}
            showLabels={true}
            compact={false}
          />
        </AbsoluteFill>
      </Sequence>

      {/* All Commits */}
      {prData.commits.map((commit, index) => (
        <Sequence
          key={commit.sha}
          from={(3 + index * 2) * fps}
          durationInFrames={2 * fps}
        >
          <AbsoluteFill
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '40px',
            }}
          >
            <CommitCard
              commit={commit}
              animationDelay={0}
              showFiles={true}
              compact={false}
            />
          </AbsoluteFill>
        </Sequence>
      ))}

      {/* File Changes */}
      {prData.files.slice(0, 5).map((file, index) => {
        const diff = processGitHubFile(file);
        if (!diff) return null;

        return (
          <Sequence
            key={file.filename}
            from={(3 + prData.commits.length * 2 + index * 3) * fps}
            durationInFrames={3 * fps}
          >
            <DiffRevealAnimation
              diff={diff}
              startFrame={0}
              durationFrames={3 * fps}
              showLineNumbers={true}
              highlightChanges={true}
              animationSpeed="normal"
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

// Technical Video Composition (8-12 minutes)
export const PRTechnicalVideo: React.FC<PRVideoCompositionProps> = ({
  prData,
  metadata,
  script,
}) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: metadata.theme.backgroundColor,
        fontFamily: '"JetBrains Mono", "SF Mono", Monaco, "Cascadia Code", monospace',
      }}
    >
      {/* Technical Header */}
      <Sequence from={0} durationInFrames={2 * fps}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px',
          }}
        >
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: metadata.theme.textColor,
              textAlign: 'center',
              marginBottom: '20px',
            }}
          >
            Technical Analysis
          </div>
          <PRHeader
            pullRequest={prData.pullRequest}
            repository={prData.repository}
            animationDelay={0.5}
            showLabels={true}
            compact={true}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Detailed Code Changes */}
      {prData.files.map((file, index) => {
        const diff = processGitHubFile(file);
        if (!diff) return null;

        return (
          <Sequence
            key={file.filename}
            from={(2 + index * 4) * fps}
            durationInFrames={4 * fps}
          >
            <DiffRevealAnimation
              diff={diff}
              startFrame={0}
              durationFrames={4 * fps}
              showLineNumbers={true}
              highlightChanges={true}
              animationSpeed="slow"
            />
          </Sequence>
        );
      })}

      {/* Technical Summary */}
      <Sequence
        from={(2 + prData.files.length * 4) * fps}
        durationInFrames={3 * fps}
      >
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '60px',
          }}
        >
          <div
            style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: metadata.theme.textColor,
              textAlign: 'center',
              marginBottom: '40px',
            }}
          >
            Technical Impact
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '40px',
              width: '100%',
              maxWidth: '800px',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '24px',
                  color: metadata.theme.primaryColor,
                  marginBottom: '10px',
                }}
              >
                Primary Language
              </div>
              <div
                style={{
                  fontSize: '32px',
                  color: metadata.theme.textColor,
                }}
              >
                {metadata.keyMetrics.primaryLanguage}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: '24px',
                  color: metadata.theme.primaryColor,
                  marginBottom: '10px',
                }}
              >
                Complexity
              </div>
              <div
                style={{
                  fontSize: '32px',
                  color: metadata.theme.textColor,
                }}
              >
                {metadata.keyMetrics.totalAdditions + metadata.keyMetrics.totalDeletions > 500 ? 'High' : 
                 metadata.keyMetrics.totalAdditions + metadata.keyMetrics.totalDeletions > 100 ? 'Medium' : 'Low'}
              </div>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};