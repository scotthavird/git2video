import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { colors } from '../../../../theme/colors';
import { PRStatus } from '../../../atoms/pr/PRStatus';
import { ContributorAvatar } from '../../../atoms/pr/ContributorAvatar';
import { PRHeaderProps } from './types';

export const PRHeader: React.FC<PRHeaderProps> = ({
  pullRequest,
  repository,
  animationDelay = 0,
  showLabels = true,
  showMilestone = true,
  compact = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const animationStart = animationDelay * fps;
  
  const opacity = interpolate(
    frame - animationStart,
    [0, 30],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const slideIn = interpolate(
    frame - animationStart,
    [0, 40],
    [-50, 0],
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
      year: 'numeric',
    });
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 30) return `${diffInDays} days ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: compact ? '12px' : '16px',
        padding: compact ? '16px' : '24px',
        backgroundColor: colors.background.primary,
        border: `1px solid ${colors.neutral[300]}`,
        borderRadius: '12px',
        transform: `translateX(${slideIn}px)`,
        opacity,
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      }}
    >
      {/* Top row: Status, PR number, and repository */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <PRStatus
          status={pullRequest.state}
          merged={pullRequest.merged}
          size={compact ? 'small' : 'medium'}
          animationDelay={animationDelay + 0.2}
        />
        
        <span
          style={{
            fontSize: compact ? '14px' : '16px',
            color: colors.text.secondary,
            fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            fontWeight: '500',
          }}
        >
          #{pullRequest.number}
        </span>
        
        <span
          style={{
            fontSize: compact ? '12px' : '14px',
            color: colors.text.secondary,
            fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          {repository.full_name}
        </span>
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: compact ? '20px' : '28px',
          fontWeight: '700',
          color: colors.text.primary,
          margin: 0,
          lineHeight: 1.2,
          fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        {pullRequest.title}
      </h1>

      {/* Author and metadata row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ContributorAvatar
            user={pullRequest.user}
            size={compact ? 'small' : 'medium'}
            animationDelay={animationDelay + 0.4}
          />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            <span
              style={{
                fontSize: compact ? '14px' : '16px',
                fontWeight: '600',
                color: colors.text.primary,
                fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              }}
            >
              {pullRequest.user.name || pullRequest.user.login}
            </span>
            <span
              style={{
                fontSize: compact ? '12px' : '14px',
                color: colors.text.secondary,
                fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              }}
            >
              opened {getTimeSince(pullRequest.created_at)}
            </span>
          </div>
        </div>

        {/* Branch info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: compact ? '12px' : '14px',
            color: colors.text.secondary,
            fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
          }}
        >
          <span
            style={{
              backgroundColor: colors.neutral[100],
              padding: '4px 8px',
              borderRadius: '6px',
              border: `1px solid ${colors.neutral[300]}`,
            }}
          >
            {pullRequest.head.ref}
          </span>
          <span>→</span>
          <span
            style={{
              backgroundColor: colors.neutral[100],
              padding: '4px 8px',
              borderRadius: '6px',
              border: `1px solid ${colors.neutral[300]}`,
            }}
          >
            {pullRequest.base.ref}
          </span>
        </div>
      </div>

      {/* Labels and milestone */}
      {(showLabels || showMilestone) && (pullRequest.labels.length > 0 || pullRequest.milestone) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          {/* Labels */}
          {showLabels && pullRequest.labels.length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: '6px',
                flexWrap: 'wrap',
              }}
            >
              {pullRequest.labels.slice(0, 5).map((label, index) => (
                <span
                  key={label.id}
                  style={{
                    backgroundColor: `#${label.color}`,
                    color: parseInt(label.color, 16) > 0xffffff / 2 ? colors.text.primary : colors.text.inverse,
                    fontSize: compact ? '10px' : '12px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: '500',
                    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    opacity: interpolate(
                      frame - animationStart,
                      [30 + index * 5, 45 + index * 5],
                      [0, 1],
                      {
                        extrapolateLeft: 'clamp',
                        extrapolateRight: 'clamp',
                      }
                    ),
                  }}
                >
                  {label.name}
                </span>
              ))}
              {pullRequest.labels.length > 5 && (
                <span
                  style={{
                    fontSize: compact ? '10px' : '12px',
                    color: colors.text.secondary,
                    fontStyle: 'italic',
                    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  +{pullRequest.labels.length - 5} more
                </span>
              )}
            </div>
          )}

          {/* Milestone */}
          {showMilestone && pullRequest.milestone && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: colors.primary[100],
                color: colors.primary[700],
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: compact ? '12px' : '14px',
                fontWeight: '500',
                fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
              }}
            >
              <span>🎯</span>
              <span>{pullRequest.milestone.title}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};