import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { colors, withOpacity } from '../../../../theme/colors';
import { ContributorAvatarProps } from './types';

export const ContributorAvatar: React.FC<ContributorAvatarProps> = ({
  user,
  size = 'medium',
  showTooltip = false,
  showRole = false,
  role,
  animationDelay = 0,
  hoverEffect = true,
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
    [0, 20],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Hover animation (simulated for video)
  const hoverScale = hoverEffect ? interpolate(
    frame - animationStart,
    [40, 60, 80],
    [1, 1.1, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  ) : 1;

  const sizeStyles = {
    small: { width: 32, height: 32, fontSize: 12 },
    medium: { width: 48, height: 48, fontSize: 14 },
    large: { width: 64, height: 64, fontSize: 16 },
  };

  const currentSize = sizeStyles[size];

  const roleColors = {
    author: colors.primary[500],
    reviewer: colors.secondary[500],
    committer: colors.success,
    commenter: colors.neutral[500],
  };

  const fallbackInitial = user.name?.charAt(0) || user.login.charAt(0);

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        transform: `scale(${scale * hoverScale})`,
        opacity,
      }}
    >
      <div
        style={{
          width: currentSize.width,
          height: currentSize.height,
          borderRadius: '50%',
          overflow: 'hidden',
          border: role ? `3px solid ${roleColors[role]}` : `2px solid ${colors.neutral[300]}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          position: 'relative',
          backgroundColor: colors.neutral[200],
        }}
      >
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={`${user.login} avatar`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={(e) => {
              // Fallback to initials if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.primary[100],
              color: colors.primary[700],
              fontSize: currentSize.fontSize,
              fontWeight: '600',
              fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            {fallbackInitial.toUpperCase()}
          </div>
        )}
        
        {/* Bot indicator */}
        {user.type === 'Bot' && (
          <div
            style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              width: '16px',
              height: '16px',
              backgroundColor: colors.secondary[500],
              borderRadius: '50%',
              border: `2px solid ${colors.background.primary}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px',
            }}
          >
            🤖
          </div>
        )}
      </div>

      {/* Role badge */}
      {showRole && role && (
        <div
          style={{
            backgroundColor: roleColors[role],
            color: colors.text.inverse,
            fontSize: '10px',
            padding: '2px 6px',
            borderRadius: '8px',
            fontWeight: '500',
            textTransform: 'capitalize',
            fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          {role}
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            top: '-40px',
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
            opacity: interpolate(
              frame - animationStart,
              [60, 80],
              [0, 1],
              {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }
            ),
          }}
        >
          {user.name || user.login}
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