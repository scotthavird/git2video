import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { colors, withOpacity } from '../../../../theme/colors';
import { DiffLineProps, DiffTypeConfig } from './types';

export const DiffLine: React.FC<DiffLineProps> = ({
  content,
  type,
  lineNumber,
  oldLineNumber,
  newLineNumber,
  animationDelay = 0,
  showLineNumbers = true,
  highlightSyntax = false,
  language = 'text',
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

  // Typing animation for content
  const contentLength = content.length;
  const typingProgress = interpolate(
    frame - animationStart,
    [10, 30 + contentLength * 0.5],
    [0, contentLength],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const displayContent = content.substring(0, Math.floor(typingProgress));

  const typeConfigs: Record<string, DiffTypeConfig> = {
    added: {
      backgroundColor: withOpacity(colors.success, 0.1),
      borderColor: colors.success,
      textColor: colors.text.primary,
      prefixIcon: '+',
      prefixColor: colors.success,
    },
    removed: {
      backgroundColor: withOpacity(colors.error, 0.1),
      borderColor: colors.error,
      textColor: colors.text.primary,
      prefixIcon: '-',
      prefixColor: colors.error,
    },
    context: {
      backgroundColor: 'transparent',
      borderColor: colors.neutral[300],
      textColor: colors.text.secondary,
      prefixIcon: ' ',
      prefixColor: colors.neutral[500],
    },
    header: {
      backgroundColor: colors.neutral[100],
      borderColor: colors.neutral[400],
      textColor: colors.text.primary,
      prefixIcon: '@',
      prefixColor: colors.primary[500],
    },
  };

  const config = typeConfigs[type];

  // Simple syntax highlighting for common patterns
  const formatContent = (text: string): JSX.Element => {
    if (!highlightSyntax) {
      return <span>{text}</span>;
    }

    // Basic syntax highlighting patterns
    const patterns = [
      { regex: /(\bfunction\b|\bconst\b|\blet\b|\bvar\b|\bif\b|\belse\b|\breturn\b)/g, color: colors.primary[600] },
      { regex: /(\/\/.*$)/gm, color: colors.neutral[500] },
      { regex: /(".*?"|'.*?'|`.*?`)/g, color: colors.success },
      { regex: /(\d+)/g, color: colors.secondary[600] },
    ];

    let formattedText = text;
    const elements: JSX.Element[] = [];
    let lastIndex = 0;

    // Apply basic highlighting (simplified for video rendering)
    if (text.includes('function') || text.includes('const') || text.includes('let')) {
      return (
        <span style={{ color: colors.primary[600] }}>
          {text}
        </span>
      );
    } else if (text.trim().startsWith('//')) {
      return (
        <span style={{ color: colors.neutral[500], fontStyle: 'italic' }}>
          {text}
        </span>
      );
    } else if (text.includes('"') || text.includes("'")) {
      return (
        <span style={{ color: colors.success }}>
          {text}
        </span>
      );
    }

    return <span>{text}</span>;
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        minHeight: '20px',
        backgroundColor: config.backgroundColor,
        borderLeft: `3px solid ${config.borderColor}`,
        fontFamily: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
        fontSize: '14px',
        lineHeight: '20px',
        transform: `scale(${scale})`,
        opacity,
        padding: '2px 0',
        margin: '1px 0',
      }}
    >
      {/* Line numbers */}
      {showLineNumbers && (
        <div
          style={{
            display: 'flex',
            minWidth: '80px',
            backgroundColor: colors.neutral[50],
            borderRight: `1px solid ${colors.neutral[300]}`,
            padding: '0 8px',
            fontSize: '12px',
            color: colors.text.disabled,
            userSelect: 'none',
          }}
        >
          <span style={{ minWidth: '30px', textAlign: 'right' }}>
            {oldLineNumber || ''}
          </span>
          <span style={{ width: '10px', textAlign: 'center' }}>
            {oldLineNumber && newLineNumber ? ' ' : ''}
          </span>
          <span style={{ minWidth: '30px', textAlign: 'right' }}>
            {newLineNumber || ''}
          </span>
        </div>
      )}

      {/* Prefix indicator */}
      <div
        style={{
          minWidth: '20px',
          padding: '0 8px',
          color: config.prefixColor,
          fontWeight: 'bold',
          backgroundColor: config.backgroundColor,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {config.prefixIcon}
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          padding: '0 12px',
          color: config.textColor,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          backgroundColor: config.backgroundColor,
        }}
      >
        {formatContent(displayContent)}
        {typingProgress < contentLength && (
          <span
            style={{
              opacity: interpolate(frame % 60, [0, 30, 60], [1, 0, 1]),
              color: config.textColor,
            }}
          >
            |
          </span>
        )}
      </div>
    </div>
  );
};