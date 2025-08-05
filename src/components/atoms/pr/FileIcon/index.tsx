import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { colors, withOpacity } from '../../../../theme/colors';
import { FileIconProps, FileTypeConfig, StatusConfig } from './types';

export const FileIcon: React.FC<FileIconProps> = ({
  filename,
  status,
  size = 'medium',
  animationDelay = 0,
  showStatus = true,
  statusPosition = 'overlay',
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

  // Status animation
  const statusOpacity = interpolate(
    frame - animationStart,
    [20, 35],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const sizeStyles = {
    small: { width: 20, height: 20, fontSize: 12 },
    medium: { width: 28, height: 28, fontSize: 16 },
    large: { width: 36, height: 36, fontSize: 20 },
  };

  const currentSize = sizeStyles[size];
  const extension = filename.split('.').pop()?.toLowerCase() || '';

  const fileTypeConfigs: Record<string, FileTypeConfig> = {
    // Programming languages
    js: { icon: '📄', color: '#f1e05a', backgroundColor: '#fff8dc' },
    jsx: { icon: '⚛️', color: '#61dafb', backgroundColor: '#e1f5fe' },
    ts: { icon: '📘', color: '#2b7489', backgroundColor: '#e3f2fd' },
    tsx: { icon: '⚛️', color: '#2b7489', backgroundColor: '#e3f2fd' },
    py: { icon: '🐍', color: '#3572A5', backgroundColor: '#e8f4fd' },
    java: { icon: '☕', color: '#b07219', backgroundColor: '#fff3e0' },
    cpp: { icon: '⚙️', color: '#f34b7d', backgroundColor: '#fce4ec' },
    c: { icon: '⚙️', color: '#555555', backgroundColor: '#f5f5f5' },
    cs: { icon: '#️⃣', color: '#239120', backgroundColor: '#e8f5e8' },
    php: { icon: '🐘', color: '#4F5D95', backgroundColor: '#ede7f6' },
    rb: { icon: '💎', color: '#701516', backgroundColor: '#ffebee' },
    go: { icon: '🐹', color: '#00ADD8', backgroundColor: '#e0f2f1' },
    rs: { icon: '🦀', color: '#dea584', backgroundColor: '#fdf6e3' },
    swift: { icon: '🕊️', color: '#ffac45', backgroundColor: '#fff8e1' },
    
    // Web technologies
    html: { icon: '🌐', color: '#e34c26', backgroundColor: '#ffebee' },
    css: { icon: '🎨', color: '#1572B6', backgroundColor: '#e3f2fd' },
    scss: { icon: '🎨', color: '#c6538c', backgroundColor: '#fce4ec' },
    sass: { icon: '🎨', color: '#c6538c', backgroundColor: '#fce4ec' },
    vue: { icon: '💚', color: '#4FC08D', backgroundColor: '#e8f5e8' },
    
    // Data formats
    json: { icon: '📊', color: '#292929', backgroundColor: '#f5f5f5' },
    xml: { icon: '📋', color: '#ff6600', backgroundColor: '#fff3e0' },
    yaml: { icon: '📄', color: '#cb171e', backgroundColor: '#ffebee' },
    yml: { icon: '📄', color: '#cb171e', backgroundColor: '#ffebee' },
    csv: { icon: '📈', color: '#0f9d58', backgroundColor: '#e8f5e8' },
    
    // Documentation
    md: { icon: '📝', color: '#083fa1', backgroundColor: '#e3f2fd' },
    txt: { icon: '📄', color: '#5d4037', backgroundColor: '#efebe9' },
    pdf: { icon: '📕', color: '#d32f2f', backgroundColor: '#ffebee' },
    
    // Configuration
    gitignore: { icon: '🚫', color: '#f14e32', backgroundColor: '#ffebee' },
    dockerignore: { icon: '🐳', color: '#0db7ed', backgroundColor: '#e1f5fe' },
    dockerfile: { icon: '🐳', color: '#0db7ed', backgroundColor: '#e1f5fe' },
    
    // Images
    png: { icon: '🖼️', color: '#ff9800', backgroundColor: '#fff3e0' },
    jpg: { icon: '🖼️', color: '#ff9800', backgroundColor: '#fff3e0' },
    jpeg: { icon: '🖼️', color: '#ff9800', backgroundColor: '#fff3e0' },
    gif: { icon: '🖼️', color: '#ff9800', backgroundColor: '#fff3e0' },
    svg: { icon: '🎭', color: '#ff9800', backgroundColor: '#fff3e0' },
    
    // Archives
    zip: { icon: '📦', color: '#795548', backgroundColor: '#efebe9' },
    tar: { icon: '📦', color: '#795548', backgroundColor: '#efebe9' },
    gz: { icon: '📦', color: '#795548', backgroundColor: '#efebe9' },
  };

  const statusConfigs: Record<string, StatusConfig> = {
    added: { icon: '+', color: colors.success, label: 'Added' },
    removed: { icon: '-', color: colors.error, label: 'Removed' },
    modified: { icon: '~', color: colors.warning, label: 'Modified' },
    renamed: { icon: '↔', color: colors.primary[500], label: 'Renamed' },
    copied: { icon: '⧉', color: colors.secondary[500], label: 'Copied' },
    unchanged: { icon: '=', color: colors.neutral[500], label: 'Unchanged' },
  };

  const fileConfig = fileTypeConfigs[extension] || fileTypeConfigs[filename] || {
    icon: '📄',
    color: colors.neutral[600],
    backgroundColor: colors.neutral[100],
  };

  const statusConfig = status ? statusConfigs[status] : null;

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: statusPosition === 'side' ? '6px' : '0',
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      <div
        style={{
          width: currentSize.width,
          height: currentSize.height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: currentSize.fontSize,
          backgroundColor: fileConfig.backgroundColor || 'transparent',
          borderRadius: '6px',
          border: `1px solid ${withOpacity(fileConfig.color, 0.3)}`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <span>{fileConfig.icon}</span>
        
        {/* Overlay status indicator */}
        {showStatus && status && statusPosition === 'overlay' && statusConfig && (
          <div
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '16px',
              height: '16px',
              backgroundColor: statusConfig.color,
              color: colors.text.inverse,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 'bold',
              border: `2px solid ${colors.background.primary}`,
              opacity: statusOpacity,
            }}
          >
            {statusConfig.icon}
          </div>
        )}
      </div>

      {/* Side status indicator */}
      {showStatus && status && statusPosition === 'side' && statusConfig && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            opacity: statusOpacity,
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              backgroundColor: statusConfig.color,
              color: colors.text.inverse,
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px',
              fontWeight: 'bold',
            }}
          >
            {statusConfig.icon}
          </div>
          <span
            style={{
              fontSize: '12px',
              color: colors.text.secondary,
              fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            {statusConfig.label}
          </span>
        </div>
      )}
    </div>
  );
};