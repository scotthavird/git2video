import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { colors, withOpacity } from '../../../../theme/colors';
import { CommitHashProps } from './types';

export const CommitHash: React.FC<CommitHashProps> = ({
  hash,
  short = true,
  copyable = false,
  size = 'medium',
  style = 'default',
  animationDelay = 0,
  showCopyFeedback = false,
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
    [0, 15],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Copy feedback animation (simulated for video)
  const copyFeedbackOpacity = showCopyFeedback ? interpolate(
    frame - animationStart,
    [60, 75, 105, 120],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  ) : 0;

  const displayHash = short ? hash.substring(0, 7) : hash;

  const sizeStyles = {
    small: { fontSize: 12, padding: '2px 6px' },
    medium: { fontSize: 14, padding: '4px 8px' },
    large: { fontSize: 16, padding: '6px 12px' },
  };

  const styleVariants = {
    default: {
      backgroundColor: colors.neutral[100],
      color: colors.text.primary,
      border: `1px solid ${colors.neutral[300]}`,
      borderRadius: '6px',
    },
    minimal: {
      backgroundColor: 'transparent',
      color: colors.text.secondary,
      border: 'none',
      borderRadius: '0',
    },
    badge: {
      backgroundColor: colors.primary[100],
      color: colors.primary[700],
      border: `1px solid ${colors.primary[300]}`,
      borderRadius: '12px',
    },
  };

  const currentSize = sizeStyles[size];
  const currentStyle = styleVariants[style];

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      <code
        style={{
          fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
          fontSize: currentSize.fontSize,
          padding: currentSize.padding,
          backgroundColor: currentStyle.backgroundColor,
          color: currentStyle.color,
          border: currentStyle.border,
          borderRadius: currentStyle.borderRadius,
          fontWeight: '500',
          letterSpacing: '0.5px',
          cursor: copyable ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
          ...(copyable && {
            ':hover': {
              backgroundColor: colors.neutral[200],
              transform: 'translateY(-1px)',
            }
          }),
        }}
      >
        {displayHash}
      </code>

      {copyable && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '16px',
            height: '16px',
            cursor: 'pointer',
            opacity: 0.6,
            fontSize: '12px',
          }}
        >
          📋
        </div>
      )}

      {/* Copy feedback tooltip */}
      {showCopyFeedback && (
        <div
          style={{
            position: 'absolute',
            top: '-35px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: colors.neutral[800],
            color: colors.text.inverse,
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            opacity: copyFeedbackOpacity,
            pointerEvents: 'none',
          }}
        >
          Copied!
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderTop: `4px solid ${colors.neutral[800]}`,
            }}
          />
        </div>
      )}
    </div>
  );
};