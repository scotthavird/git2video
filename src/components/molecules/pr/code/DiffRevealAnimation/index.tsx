/**
 * DiffRevealAnimation Component
 * Animates the reveal of code diffs with smooth transitions and highlighting
 */

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from 'remotion';
import { DiffLine, ProcessedDiff } from '../utils/diffProcessor';
import { tokenizeCode, SyntaxToken } from '../utils/syntaxHighlighter';
import { colors } from '../../../../../theme/colors';

export interface DiffRevealAnimationProps {
  diff: ProcessedDiff;
  startFrame: number;
  durationFrames: number;
  style?: 'side-by-side' | 'unified' | 'split';
  showLineNumbers?: boolean;
  highlightChanges?: boolean;
  animationSpeed?: 'slow' | 'normal' | 'fast';
}

export const DiffRevealAnimation: React.FC<DiffRevealAnimationProps> = ({
  diff,
  startFrame,
  durationFrames,
  style = 'unified',
  showLineNumbers = true,
  highlightChanges = true,
  animationSpeed = 'normal',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const localFrame = Math.max(0, frame - startFrame);
  const progress = Math.min(1, localFrame / durationFrames);
  
  // Animation configuration based on speed
  const speedMultiplier = {
    slow: 0.7,
    normal: 1.0,
    fast: 1.4,
  }[animationSpeed];
  
  // Calculate which lines should be visible
  const totalLines = diff.lines.length;
  const visibleLineCount = Math.floor(interpolate(
    progress,
    [0, 1],
    [0, totalLines],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  ));
  
  // Spring animation for smooth reveal
  const revealSpring = spring({
    frame: localFrame,
    fps,
    config: {
      damping: 200 * speedMultiplier,
      stiffness: 100 * speedMultiplier,
      mass: 1,
    },
  });
  
  // Calculate current focus line for highlighting
  const focusLineIndex = Math.floor(interpolate(
    revealSpring,
    [0, 1],
    [0, totalLines - 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  ));
  
  const renderLine = (line: DiffLine, index: number) => {
    const isVisible = index < visibleLineCount;
    const isFocused = index === focusLineIndex;
    const isChanged = line.type === 'added' || line.type === 'removed';
    
    // Line appearance animation
    const lineOpacity = isVisible ? 
      interpolate(
        revealSpring,
        [index / totalLines, (index + 1) / totalLines],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      ) : 0;
    
    // Focus highlight animation
    const focusOpacity = isFocused && highlightChanges ? 
      interpolate(
        Math.sin((localFrame / fps) * 2 * Math.PI),
        [-1, 1],
        [0.3, 0.7]
      ) : 0;
    
    // Line background color based on type
    const getLineBackground = (lineType: DiffLine['type']) => {
      switch (lineType) {
        case 'added':
          return `rgba(34, 197, 94, 0.2)`; // Green for additions
        case 'removed':
          return `rgba(239, 68, 68, 0.2)`; // Red for deletions
        case 'context':
          return 'transparent';
        case 'hunk':
          return `rgba(59, 130, 246, 0.1)`; // Blue for hunk headers
        default:
          return 'transparent';
      }
    };
    
    // Tokenize content for syntax highlighting
    const tokens = tokenizeCode(line.content, diff.language);
    
    return (
      <div
        key={`line-${index}`}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          minHeight: '24px',
          opacity: lineOpacity,
          backgroundColor: getLineBackground(line.type),
          borderLeft: isChanged && highlightChanges ? 
            `3px solid ${line.type === 'added' ? colors.success : colors.error}` : 'none',
          paddingLeft: isChanged ? '8px' : '11px',
          position: 'relative',
          transform: `translateX(${interpolate(lineOpacity, [0, 1], [-20, 0])}px)`,
        }}
      >
        {/* Focus highlight overlay */}
        {isFocused && highlightChanges && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: colors.primary[100],
              opacity: focusOpacity,
              pointerEvents: 'none',
            }}
          />
        )}
        
        {/* Line numbers */}
        {showLineNumbers && (
          <div
            style={{
              width: '60px',
              textAlign: 'right',
              paddingRight: '12px',
              fontSize: '12px',
              color: colors.neutral[500],
              fontFamily: 'monospace',
              userSelect: 'none',
              flexShrink: 0,
            }}
          >
            {line.oldLineNumber || line.newLineNumber || ''}
          </div>
        )}
        
        {/* Diff prefix */}
        <div
          style={{
            width: '20px',
            textAlign: 'center',
            fontSize: '14px',
            fontFamily: 'monospace',
            color: line.type === 'added' ? colors.success : 
                   line.type === 'removed' ? colors.error : 
                   colors.neutral[400],
            flexShrink: 0,
          }}
        >
          {line.type === 'added' ? '+' : 
           line.type === 'removed' ? '-' : 
           line.type === 'hunk' ? '@' : ' '}
        </div>
        
        {/* Syntax highlighted content */}
        <div
          style={{
            flex: 1,
            fontSize: '14px',
            fontFamily: 'monospace',
            lineHeight: '1.5',
            whiteSpace: 'pre',
            color: colors.text.primary,
          }}
        >
          {renderSyntaxHighlightedContent(tokens, line.type)}
        </div>
      </div>
    );
  };
  
  const renderSyntaxHighlightedContent = (tokens: SyntaxToken[], lineType: DiffLine['type']) => {
    return tokens.map((token, index) => (
      <span
        key={`token-${index}`}
        style={{
          color: lineType === 'comment' ? colors.neutral[500] : token.color,
          fontWeight: token.style?.fontWeight || 'normal',
          fontStyle: token.style?.fontStyle || 'normal',
          opacity: lineType === 'removed' ? 0.7 : 1,
        }}
      >
        {token.content}
      </span>
    ));
  };
  
  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background.primary,
        padding: '20px',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: '16px',
          opacity: interpolate(progress, [0, 0.1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}
      >
        <div
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: colors.text.primary,
            marginBottom: '4px',
          }}
        >
          {diff.fileName}
        </div>
        <div
          style={{
            fontSize: '14px',
            color: colors.text.secondary,
            display: 'flex',
            gap: '16px',
          }}
        >
          <span>Language: {diff.language}</span>
          <span style={{ color: colors.success }}>+{diff.stats.additions}</span>
          <span style={{ color: colors.error }}>-{diff.stats.deletions}</span>
        </div>
      </div>
      
      {/* Progress indicator */}
      <div
        style={{
          height: '2px',
          backgroundColor: colors.neutral[200],
          marginBottom: '16px',
          borderRadius: '1px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            backgroundColor: colors.primary[500],
            width: `${progress * 100}%`,
            transition: 'width 0.1s ease-out',
          }}
        />
      </div>
      
      {/* Code diff content */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          border: `1px solid ${colors.neutral[300]}`,
          borderRadius: '6px',
          backgroundColor: colors.background.secondary,
        }}
      >
        <div
          style={{
            padding: '12px',
            maxHeight: '100%',
            overflow: 'auto',
          }}
        >
          {diff.lines.slice(0, visibleLineCount).map(renderLine)}
        </div>
      </div>
      
      {/* Summary footer */}
      {progress > 0.9 && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: colors.primary[50],
            borderRadius: '6px',
            fontSize: '14px',
            color: colors.text.secondary,
            opacity: interpolate(progress, [0.9, 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          }}
        >
          Changes: {diff.stats.changes} lines ({diff.stats.additions} additions, {diff.stats.deletions} deletions)
        </div>
      )}
    </AbsoluteFill>
  );
};

export default DiffRevealAnimation;