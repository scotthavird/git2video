import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { colors } from '../../../../theme/colors';
import { CommitHash } from '../../../atoms/pr/CommitHash';
import { ContributorAvatar } from '../../../atoms/pr/ContributorAvatar';
import { MetricBadge } from '../../../atoms/pr/MetricBadge';
import { CommitCardProps } from './types';

export const CommitCard: React.FC<CommitCardProps> = ({
  commit,
  animationDelay = 0,
  showStats = true,
  showFiles = false,
  compact = false,
  maxMessageLength = 120,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const animationStart = animationDelay * fps;
  
  const scale = spring({
    frame: frame - animationStart,
    fps,
    config: {
      damping: 100,
      stiffness: 200,
      mass: 0.5,
    },
  });
  
  const opacity = interpolate(
    frame - animationStart,
    [0, 25],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const slideIn = interpolate(
    frame - animationStart,
    [0, 35],
    [30, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCommitMessage = () => {
    const lines = commit.commit.message.split('\n');
    const firstLine = lines[0];
    
    if (firstLine.length <= maxMessageLength) {
      return { title: firstLine, hasMore: lines.length > 1 };
    }
    
    return {
      title: firstLine.substring(0, maxMessageLength) + '...',
      hasMore: true,
    };
  };

  const message = getCommitMessage();
  const author = commit.author || {
    id: 0,
    login: commit.commit.author.name,
    avatar_url: '',
    html_url: '',
    type: 'User' as const,
    name: commit.commit.author.name,
    email: commit.commit.author.email,
  };

  const stats = commit.stats || { additions: 0, deletions: 0, total: 0 };
  const filesCount = commit.files?.length || 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: compact ? '8px' : '12px',
        padding: compact ? '12px' : '16px',
        backgroundColor: colors.background.primary,
        border: `1px solid ${colors.neutral[300]}`,
        borderRadius: '8px',
        transform: `scale(${scale}) translateY(${slideIn}px)`,
        opacity,
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        ':hover': {
          boxShadow: '0 4px 8px rgba(0,0,0,0.12)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Header with commit hash and metadata */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CommitHash
            hash={commit.sha}
            short={true}
            style="badge"
            size={compact ? 'small' : 'medium'}
            animationDelay={animationDelay + 0.2}
          />
          
          <span
            style={{
              fontSize: compact ? '12px' : '14px',
              color: colors.text.secondary,
              fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            {formatDate(commit.commit.author.date)}
          </span>
        </div>

        {/* Author avatar */}
        <ContributorAvatar
          user={author}
          size={compact ? 'small' : 'medium'}
          role="committer"
          animationDelay={animationDelay + 0.3}
        />
      </div>

      {/* Commit message */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <h3
          style={{
            fontSize: compact ? '14px' : '16px',
            fontWeight: '600',
            color: colors.text.primary,
            margin: 0,
            lineHeight: 1.3,
            fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          {message.title}
        </h3>
        
        {message.hasMore && (
          <span
            style={{
              fontSize: compact ? '12px' : '14px',
              color: colors.text.secondary,
              fontStyle: 'italic',
              fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            View full message...
          </span>
        )}
      </div>

      {/* Author info */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: compact ? '12px' : '14px',
          color: colors.text.secondary,
          fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        <span>by</span>
        <span style={{ fontWeight: '500', color: colors.text.primary }}>
          {author.name || author.login}
        </span>
        {commit.commit.author.email && (
          <span style={{ opacity: 0.8 }}>
            ({commit.commit.author.email})
          </span>
        )}
      </div>

      {/* Stats and files */}
      {(showStats || showFiles) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          {showStats && (
            <>
              {stats.additions > 0 && (
                <MetricBadge
                  value={stats.additions}
                  label="additions"
                  icon="+"
                  type="success"
                  size={compact ? 'small' : 'medium'}
                  layout="compact"
                  animationDelay={animationDelay + 0.4}
                />
              )}
              
              {stats.deletions > 0 && (
                <MetricBadge
                  value={stats.deletions}
                  label="deletions"
                  icon="-"
                  type="error"
                  size={compact ? 'small' : 'medium'}
                  layout="compact"
                  animationDelay={animationDelay + 0.5}
                />
              )}
            </>
          )}

          {showFiles && filesCount > 0 && (
            <MetricBadge
              value={filesCount}
              label={filesCount === 1 ? 'file' : 'files'}
              icon="📁"
              type="info"
              size={compact ? 'small' : 'medium'}
              layout="compact"
              animationDelay={animationDelay + 0.6}
            />
          )}
        </div>
      )}

      {/* Files list (if showFiles and files exist) */}
      {showFiles && commit.files && commit.files.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            marginTop: '4px',
            paddingTop: '8px',
            borderTop: `1px solid ${colors.neutral[200]}`,
          }}
        >
          <span
            style={{
              fontSize: compact ? '11px' : '12px',
              color: colors.text.secondary,
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            Modified Files
          </span>
          
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px',
            }}
          >
            {commit.files.slice(0, 3).map((file, index) => (
              <span
                key={file.filename}
                style={{
                  fontSize: compact ? '10px' : '11px',
                  color: colors.text.secondary,
                  backgroundColor: colors.neutral[100],
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
                  opacity: interpolate(
                    frame - animationStart,
                    [40 + index * 5, 50 + index * 5],
                    [0, 1],
                    {
                      extrapolateLeft: 'clamp',
                      extrapolateRight: 'clamp',
                    }
                  ),
                }}
              >
                {file.filename.split('/').pop()}
              </span>
            ))}
            
            {commit.files.length > 3 && (
              <span
                style={{
                  fontSize: compact ? '10px' : '11px',
                  color: colors.text.secondary,
                  fontStyle: 'italic',
                  fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                +{commit.files.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};