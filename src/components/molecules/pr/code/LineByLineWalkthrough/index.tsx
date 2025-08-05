/**
 * LineByLineWalkthrough Component
 * Provides detailed line-by-line code review walkthrough with annotations and explanations
 */

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill, Sequence } from 'remotion';
import { DiffLine, ProcessedDiff, ChangeContext, extractChangeContext } from '../utils/diffProcessor';
import { tokenizeCode, SyntaxToken } from '../utils/syntaxHighlighter';
import { colors } from '../../../../../theme/colors';

export interface LineByLineWalkthroughProps {
  diff: ProcessedDiff;
  startFrame: number;
  durationFrames: number;
  annotations?: LineAnnotation[];
  walkthrough?: WalkthroughStep[];
  focusMode?: 'line' | 'block' | 'context';
  explanationStyle?: 'popup' | 'sidebar' | 'overlay';
  autoAdvance?: boolean;
  showMinimap?: boolean;
}

export interface LineAnnotation {
  lineIndex: number;
  type: 'explanation' | 'warning' | 'improvement' | 'question' | 'praise';
  content: string;
  duration?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface WalkthroughStep {
  startLine: number;
  endLine: number;
  title: string;
  description: string;
  focusType: 'highlight' | 'zoom' | 'callout';
  duration: number;
}

export const LineByLineWalkthrough: React.FC<LineByLineWalkthroughProps> = ({
  diff,
  startFrame,
  durationFrames,
  annotations = [],
  walkthrough = [],
  focusMode = 'context',
  explanationStyle = 'sidebar',
  autoAdvance = true,
  showMinimap = true,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  
  const localFrame = Math.max(0, frame - startFrame);
  const progress = Math.min(1, localFrame / durationFrames);
  
  // Extract change contexts for intelligent walkthrough
  const changeContexts = React.useMemo(() => {
    return extractChangeContext(diff, 3);
  }, [diff]);
  
  // Generate walkthrough steps if not provided
  const effectiveWalkthrough = React.useMemo(() => {
    if (walkthrough.length > 0) return walkthrough;
    
    return generateAutoWalkthrough(changeContexts, durationFrames);
  }, [walkthrough, changeContexts, durationFrames]);
  
  // Current step calculation
  const currentStepIndex = Math.floor(progress * effectiveWalkthrough.length);
  const currentStep = effectiveWalkthrough[currentStepIndex];
  const stepProgress = (progress * effectiveWalkthrough.length) - currentStepIndex;
  
  // Animation springs
  const focusSpring = spring({
    frame: localFrame,
    fps,
    config: {
      damping: 150,
      stiffness: 80,
      mass: 1,
    },
  });
  
  const explanationSpring = spring({
    frame: localFrame,
    fps,
    config: {
      damping: 200,
      stiffness: 100,
      mass: 0.8,
    },
  });
  
  // Calculate focus area
  const getFocusArea = () => {
    if (!currentStep) return { startLine: 0, endLine: diff.lines.length - 1 };
    
    return {
      startLine: Math.max(0, currentStep.startLine),
      endLine: Math.min(diff.lines.length - 1, currentStep.endLine),
    };
  };
  
  const focusArea = getFocusArea();
  
  const renderLine = (line: DiffLine, index: number) => {
    const isInFocus = index >= focusArea.startLine && index <= focusArea.endLine;
    const isFocusCenter = index === Math.floor((focusArea.startLine + focusArea.endLine) / 2);
    const isChanged = line.type === 'added' || line.type === 'removed';
    
    // Line visibility and highlighting
    const lineOpacity = focusMode === 'context' ? 
      (isInFocus ? 1 : 0.3) :
      focusMode === 'line' ? 
      (isFocusCenter ? 1 : 0.2) :
      1; // block mode
    
    const focusIntensity = isInFocus ? 
      interpolate(
        Math.sin((localFrame / fps) * 3 * Math.PI),
        [-1, 1],
        [0.8, 1.0]
      ) : 1;
    
    // Get line annotation
    const annotation = annotations.find(ann => ann.lineIndex === index);
    const hasAnnotation = annotation !== undefined;
    
    // Tokenize for syntax highlighting
    const tokens = tokenizeCode(line.content, diff.language);
    
    return (
      <div
        key={`line-${index}`}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          minHeight: '28px',
          opacity: lineOpacity * focusIntensity,
          backgroundColor: getLineBackground(line.type, isInFocus, isFocusCenter),
          borderLeft: getBorderLeft(line.type, isInFocus, hasAnnotation),
          paddingLeft: '12px',
          paddingRight: '12px',
          paddingTop: '4px',
          paddingBottom: '4px',
          position: 'relative',
          transform: isFocusCenter ? `scale(${1 + focusSpring * 0.02})` : 'scale(1)',
          transition: 'transform 0.2s ease',
          marginBottom: '1px',
        }}
      >
        {/* Focus indicator */}
        {isFocusCenter && (
          <div
            style={{
              position: 'absolute',
              left: '-4px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '4px',
              height: '80%',
              backgroundColor: colors.primary[500],
              borderRadius: '2px',
              opacity: focusSpring,
            }}
          />
        )}
        
        {/* Line number */}
        <div
          style={{
            width: '60px',
            textAlign: 'right',
            paddingRight: '16px',
            fontSize: '13px',
            color: colors.neutral[500],
            fontFamily: 'monospace',
            flexShrink: 0,
            fontWeight: isFocusCenter ? 'bold' : 'normal',
          }}
        >
          {line.oldLineNumber || line.newLineNumber || ''}
        </div>
        
        {/* Diff marker */}
        <div
          style={{
            width: '24px',
            textAlign: 'center',
            fontSize: '14px',
            fontFamily: 'monospace',
            color: getDiffMarkerColor(line.type),
            flexShrink: 0,
            fontWeight: 'bold',
          }}
        >
          {getDiffMarker(line.type)}
        </div>
        
        {/* Code content */}
        <div
          style={{
            flex: 1,
            fontSize: '14px',
            fontFamily: 'monospace',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {renderSyntaxHighlightedContent(tokens, line.type, isInFocus)}
        </div>
        
        {/* Annotation indicator */}
        {hasAnnotation && (
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: getAnnotationColor(annotation.type),
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              flexShrink: 0,
              marginLeft: '8px',
              cursor: 'pointer',
            }}
          >
            {getAnnotationIcon(annotation.type)}
          </div>
        )}
      </div>
    );
  };
  
  const renderSyntaxHighlightedContent = (
    tokens: SyntaxToken[], 
    lineType: DiffLine['type'], 
    isInFocus: boolean
  ) => {
    return tokens.map((token, index) => (
      <span
        key={`token-${index}`}
        style={{
          color: token.color,
          fontWeight: token.style?.fontWeight || 'normal',
          fontStyle: token.style?.fontStyle || 'normal',
          opacity: lineType === 'removed' ? 0.8 : 1,
          backgroundColor: isInFocus && token.type === 'keyword' ? 
            `${colors.primary[100]}` : 'transparent',
          padding: isInFocus && token.type === 'keyword' ? '1px 2px' : '0',
          borderRadius: '2px',
        }}
      >
        {token.content}
      </span>
    ));
  };
  
  const renderSidebar = () => {
    if (explanationStyle !== 'sidebar') return null;
    
    const sidebarWidth = 320;
    const sidebarOpacity = interpolate(
      explanationSpring,
      [0, 1],
      [0, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    
    return (
      <div
        style={{
          position: 'absolute',
          right: '20px',
          top: '80px',
          width: `${sidebarWidth}px`,
          height: height - 160,
          backgroundColor: colors.background.secondary,
          border: `1px solid ${colors.neutral[300]}`,
          borderRadius: '8px',
          padding: '20px',
          opacity: sidebarOpacity,
          overflow: 'auto',
        }}
      >
        {/* Current step info */}
        {currentStep && (
          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: colors.text.primary,
                marginBottom: '8px',
              }}
            >
              {currentStep.title}
            </div>
            <div
              style={{
                fontSize: '14px',
                color: colors.text.secondary,
                lineHeight: '1.5',
                marginBottom: '12px',
              }}
            >
              {currentStep.description}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: colors.text.secondary,
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Lines {currentStep.startLine + 1} - {currentStep.endLine + 1}</span>
              <span>Step {currentStepIndex + 1} of {effectiveWalkthrough.length}</span>
            </div>
          </div>
        )}
        
        {/* Annotations in focus area */}
        {annotations
          .filter(ann => ann.lineIndex >= focusArea.startLine && ann.lineIndex <= focusArea.endLine)
          .map((annotation, index) => (
            <div
              key={`annotation-${index}`}
              style={{
                padding: '12px',
                backgroundColor: colors.background.primary,
                border: `1px solid ${getAnnotationColor(annotation.type)}`,
                borderRadius: '6px',
                marginBottom: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: getAnnotationColor(annotation.type),
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 'bold',
                  }}
                >
                  {getAnnotationIcon(annotation.type)}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: colors.text.primary,
                    textTransform: 'capitalize',
                  }}
                >
                  {annotation.type}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: colors.text.secondary,
                  }}
                >
                  Line {annotation.lineIndex + 1}
                </div>
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: colors.text.primary,
                  lineHeight: '1.4',
                }}
              >
                {annotation.content}
              </div>
            </div>
          ))}
      </div>
    );
  };
  
  const renderMinimap = () => {
    if (!showMinimap) return null;
    
    const minimapWidth = 80;
    const minimapHeight = 200;
    const totalLines = diff.lines.length;
    
    return (
      <div
        style={{
          position: 'absolute',
          right: explanationStyle === 'sidebar' ? '360px' : '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: `${minimapWidth}px`,
          height: `${minimapHeight}px`,
          backgroundColor: colors.background.secondary,
          border: `1px solid ${colors.neutral[300]}`,
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        {/* Minimap lines */}
        {diff.lines.map((line, index) => {
          const lineHeight = minimapHeight / totalLines;
          const isInFocus = index >= focusArea.startLine && index <= focusArea.endLine;
          
          return (
            <div
              key={`minimap-${index}`}
              style={{
                height: `${lineHeight}px`,
                backgroundColor: getMiniMapLineColor(line.type, isInFocus),
                opacity: isInFocus ? 1 : 0.3,
              }}
            />
          );
        })}
        
        {/* Focus indicator */}
        <div
          style={{
            position: 'absolute',
            top: `${(focusArea.startLine / totalLines) * minimapHeight}px`,
            left: 0,
            right: 0,
            height: `${((focusArea.endLine - focusArea.startLine + 1) / totalLines) * minimapHeight}px`,
            border: `2px solid ${colors.primary[500]}`,
            borderRadius: '2px',
            pointerEvents: 'none',
          }}
        />
      </div>
    );
  };
  
  const renderProgressBar = () => {
    return (
      <div
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '20px',
          right: explanationStyle === 'sidebar' ? '360px' : '20px',
          height: '4px',
          backgroundColor: colors.neutral[200],
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            backgroundColor: colors.primary[500],
            width: `${progress * 100}%`,
            borderRadius: '2px',
            transition: 'width 0.1s ease-out',
          }}
        />
      </div>
    );
  };
  
  const codeAreaWidth = explanationStyle === 'sidebar' ? width - 380 : width - 40;
  const codeAreaLeft = 20;
  
  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background.primary,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px',
          borderBottom: `1px solid ${colors.neutral[300]}`,
          backgroundColor: colors.background.secondary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: colors.text.primary,
              marginBottom: '4px',
            }}
          >
            🔍 Line-by-Line Review: {diff.fileName}
          </div>
          <div
            style={{
              fontSize: '14px',
              color: colors.text.secondary,
            }}
          >
            {diff.language} • {diff.stats.changes} changes • Step {currentStepIndex + 1} of {effectiveWalkthrough.length}
          </div>
        </div>
        
        {currentStep && (
          <div
            style={{
              textAlign: 'right',
            }}
          >
            <div
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: colors.primary[600],
              }}
            >
              {currentStep.title}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: colors.text.secondary,
              }}
            >
              Focus: Lines {currentStep.startLine + 1}-{currentStep.endLine + 1}
            </div>
          </div>
        )}
      </div>
      
      {/* Code area */}
      <div
        style={{
          position: 'absolute',
          left: `${codeAreaLeft}px`,
          top: '80px',
          width: `${codeAreaWidth}px`,
          height: height - 160,
          overflow: 'auto',
          backgroundColor: colors.background.primary,
          border: `1px solid ${colors.neutral[300]}`,
          borderRadius: '6px',
        }}
      >
        <div style={{ padding: '16px' }}>
          {diff.lines.map(renderLine)}
        </div>
      </div>
      
      {/* Sidebar */}
      {renderSidebar()}
      
      {/* Minimap */}
      {renderMinimap()}
      
      {/* Progress bar */}
      {renderProgressBar()}
    </AbsoluteFill>
  );
};

// Helper functions
function getLineBackground(
  lineType: DiffLine['type'], 
  isInFocus: boolean, 
  isFocusCenter: boolean
): string {
  let baseColor = 'transparent';
  
  switch (lineType) {
    case 'added':
      baseColor = 'rgba(34, 197, 94, 0.1)';
      break;
    case 'removed':
      baseColor = 'rgba(239, 68, 68, 0.1)';
      break;
    case 'hunk':
      baseColor = 'rgba(59, 130, 246, 0.05)';
      break;
  }
  
  if (isFocusCenter) {
    return `linear-gradient(90deg, ${colors.primary[50]} 0%, ${baseColor} 20%, ${baseColor} 80%, ${colors.primary[50]} 100%)`;
  }
  
  return baseColor;
}

function getBorderLeft(
  lineType: DiffLine['type'], 
  isInFocus: boolean, 
  hasAnnotation: boolean
): string {
  if (hasAnnotation) {
    return `4px solid ${colors.warning}`;
  }
  
  switch (lineType) {
    case 'added':
      return `3px solid ${colors.success}`;
    case 'removed':
      return `3px solid ${colors.error}`;
    default:
      return isInFocus ? `3px solid ${colors.primary[200]}` : '3px solid transparent';
  }
}

function getDiffMarker(lineType: DiffLine['type']): string {
  switch (lineType) {
    case 'added': return '+';
    case 'removed': return '-';
    case 'hunk': return '@';
    default: return ' ';
  }
}

function getDiffMarkerColor(lineType: DiffLine['type']): string {
  switch (lineType) {
    case 'added': return colors.success;
    case 'removed': return colors.error;
    case 'hunk': return colors.primary[500];
    default: return colors.neutral[400];
  }
}

function getAnnotationColor(type: LineAnnotation['type']): string {
  switch (type) {
    case 'explanation': return colors.primary[500];
    case 'warning': return colors.warning;
    case 'improvement': return colors.success;
    case 'question': return colors.secondary[500];
    case 'praise': return colors.success;
    default: return colors.neutral[500];
  }
}

function getAnnotationIcon(type: LineAnnotation['type']): string {
  switch (type) {
    case 'explanation': return 'i';
    case 'warning': return '!';
    case 'improvement': return '↑';
    case 'question': return '?';
    case 'praise': return '✓';
    default: return 'i';
  }
}

function getMiniMapLineColor(lineType: DiffLine['type'], isInFocus: boolean): string {
  let baseColor = colors.neutral[300];
  
  switch (lineType) {
    case 'added':
      baseColor = colors.success;
      break;
    case 'removed':
      baseColor = colors.error;
      break;
    case 'context':
      baseColor = colors.neutral[400];
      break;
  }
  
  return isInFocus ? baseColor : colors.neutral[200];
}

function generateAutoWalkthrough(
  contexts: ChangeContext[], 
  totalDuration: number
): WalkthroughStep[] {
  const steps: WalkthroughStep[] = [];
  const stepDuration = Math.floor(totalDuration / Math.max(contexts.length, 1));
  
  contexts.forEach((context, index) => {
    const startLine = context.beforeContext.length > 0 ? 
      context.beforeContext[0].originalIndex : 
      context.change[0].originalIndex;
    
    const endLine = context.afterContext.length > 0 ?
      context.afterContext[context.afterContext.length - 1].originalIndex :
      context.change[context.change.length - 1].originalIndex;
    
    steps.push({
      startLine,
      endLine,
      title: context.summary,
      description: `Reviewing ${context.importance} priority change`,
      focusType: context.importance === 'critical' ? 'zoom' : 'highlight',
      duration: stepDuration,
    });
  });
  
  return steps;
}

export default LineByLineWalkthrough;