import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { colors } from '../../../../theme/colors';
import { PRStatusProps, StatusConfig } from './types';

export const PRStatus: React.FC<PRStatusProps> = ({
  status,
  merged = false,
  size = 'medium',
  animationDelay = 0,
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

  const statusConfigs: Record<string, StatusConfig> = {
    open: {
      color: colors.text.inverse,
      backgroundColor: colors.success,
      icon: '●',
      label: 'Open',
    },
    closed: {
      color: colors.text.inverse,
      backgroundColor: colors.error,
      icon: '●',
      label: 'Closed',
    },
    merged: {
      color: colors.text.inverse,
      backgroundColor: colors.primary[600],
      icon: '⚡',
      label: 'Merged',
    },
    draft: {
      color: colors.text.primary,
      backgroundColor: colors.neutral[300],
      icon: '●',
      label: 'Draft',
    },
  };

  const finalStatus = status === 'closed' && merged ? 'merged' : status;
  const config = statusConfigs[finalStatus];

  const sizeStyles = {
    small: { fontSize: 12, padding: '4px 8px', borderRadius: 12 },
    medium: { fontSize: 14, padding: '6px 12px', borderRadius: 16 },
    large: { fontSize: 16, padding: '8px 16px', borderRadius: 20 },
  };

  const currentSize = sizeStyles[size];

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: config.backgroundColor,
        color: config.color,
        fontSize: currentSize.fontSize,
        padding: currentSize.padding,
        borderRadius: currentSize.borderRadius,
        fontWeight: '600',
        fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
        transform: `scale(${scale})`,
        opacity,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: `1px solid ${config.backgroundColor}`,
      }}
    >
      <span style={{ fontSize: currentSize.fontSize * 0.8 }}>
        {config.icon}
      </span>
      <span>{config.label}</span>
    </div>
  );
};