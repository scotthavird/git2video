/**
 * FileNavigationAnimation Component
 * Animates navigation between multiple files in a PR with smooth transitions
 */

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill, Sequence } from 'remotion';
import { ProcessedDiff } from '../utils/diffProcessor';
import { detectLanguageFromFileName } from '../utils/diffProcessor';
import { colors } from '../../../../../theme/colors';

export interface FileNavigationAnimationProps {
  files: ProcessedDiff[];
  startFrame: number;
  durationFrames: number;
  transitionDuration?: number;
  showFileTree?: boolean;
  highlightChanges?: boolean;
  animationStyle?: 'slide' | 'fade' | 'scale' | 'flip';
}

interface FileNode {
  path: string;
  name: string;
  type: 'file' | 'directory';
  diff?: ProcessedDiff;
  children?: FileNode[];
  depth: number;
}

export const FileNavigationAnimation: React.FC<FileNavigationAnimationProps> = ({
  files,
  startFrame,
  durationFrames,
  transitionDuration = 30,
  showFileTree = true,
  highlightChanges = true,
  animationStyle = 'slide',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  
  const localFrame = Math.max(0, frame - startFrame);
  const progress = Math.min(1, localFrame / durationFrames);
  
  // Calculate timing for each file
  const fileDisplayDuration = Math.floor((durationFrames - transitionDuration * (files.length - 1)) / files.length);
  const currentFileIndex = Math.floor(progress * files.length);
  const fileProgress = (progress * files.length) - currentFileIndex;
  
  // Build file tree structure
  const fileTree = React.useMemo(() => buildFileTree(files), [files]);
  
  // Animation springs
  const navigationSpring = spring({
    frame: localFrame,
    fps,
    config: {
      damping: 200,
      stiffness: 100,
      mass: 1,
    },
  });
  
  const getFileIcon = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const iconMap: Record<string, string> = {
      'ts': '🟦', 'tsx': '🟦', 'js': '🟨', 'jsx': '🟨',
      'py': '🐍', 'java': '☕', 'go': '🐹', 'rs': '🦀',
      'html': '🌐', 'css': '🎨', 'scss': '🎨', 'sass': '🎨',
      'json': '📋', 'xml': '📄', 'yml': '⚙️', 'yaml': '⚙️',
      'md': '📝', 'txt': '📄', 'pdf': '📕',
      'png': '🖼️', 'jpg': '🖼️', 'jpeg': '🖼️', 'svg': '🖼️',
    };
    return iconMap[ext || ''] || '📄';
  };
  
  const getStatusIcon = (status: ProcessedDiff['status']): string => {
    switch (status) {
      case 'added': return '➕';
      case 'removed': return '➖';
      case 'modified': return '📝';
      case 'renamed': return '🔄';
      default: return '📄';
    }
  };
  
  const getStatusColor = (status: ProcessedDiff['status']): string => {
    switch (status) {
      case 'added': return colors.success;
      case 'removed': return colors.error;
      case 'modified': return colors.warning;
      case 'renamed': return colors.primary[500];
      default: return colors.text.secondary;
    }
  };
  
  const renderFileTree = () => {
    if (!showFileTree) return null;
    
    const treeOpacity = interpolate(progress, [0, 0.1], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    });
    
    return (
      <div
        style={{
          position: 'absolute',
          left: '20px',
          top: '80px',
          width: '300px',
          height: height - 160,
          backgroundColor: colors.background.secondary,
          border: `1px solid ${colors.neutral[300]}`,
          borderRadius: '8px',
          padding: '16px',
          opacity: treeOpacity,
          overflow: 'auto',
        }}
      >
        <div
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: colors.text.primary,
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          📁 Changed Files ({files.length})
        </div>
        
        {files.map((file, index) => {
          const isActive = index === currentFileIndex;
          const wasProcessed = index < currentFileIndex;
          
          return (
            <div
              key={file.fileName}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                marginBottom: '4px',
                borderRadius: '4px',
                backgroundColor: isActive ? colors.primary[100] : 'transparent',
                border: isActive ? `2px solid ${colors.primary[300]}` : '2px solid transparent',
                cursor: 'pointer',
                opacity: wasProcessed ? 0.6 : 1,
                transform: isActive ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ fontSize: '16px' }}>
                {getFileIcon(file.fileName)}
              </span>
              <span style={{ fontSize: '16px' }}>
                {getStatusIcon(file.status)}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: isActive ? 'bold' : 'normal',
                    color: isActive ? colors.primary[700] : colors.text.primary,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {file.fileName.split('/').pop()}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: colors.text.secondary,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {file.fileName.includes('/') ? file.fileName.split('/').slice(0, -1).join('/') : ''}
                </div>
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: getStatusColor(file.status),
                  display: 'flex',
                  gap: '4px',
                }}
              >
                {file.stats.additions > 0 && <span>+{file.stats.additions}</span>}
                {file.stats.deletions > 0 && <span>-{file.stats.deletions}</span>}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  const renderCurrentFile = () => {
    if (currentFileIndex >= files.length) return null;
    
    const file = files[currentFileIndex];
    const mainContentX = showFileTree ? 340 : 20;
    const mainContentWidth = width - mainContentX - 20;
    
    // Animation based on style
    let transform = '';
    let opacity = 1;
    
    switch (animationStyle) {
      case 'slide':
        const slideX = interpolate(
          fileProgress,
          [0, 1],
          [mainContentWidth, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        transform = `translateX(${slideX}px)`;
        break;
        
      case 'fade':
        opacity = interpolate(
          fileProgress,
          [0, 0.2, 0.8, 1],
          [0, 1, 1, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        break;
        
      case 'scale':
        const scale = interpolate(
          fileProgress,
          [0, 0.2, 0.8, 1],
          [0.8, 1, 1, 0.8],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        transform = `scale(${scale})`;
        opacity = interpolate(
          fileProgress,
          [0, 0.2, 0.8, 1],
          [0, 1, 1, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        break;
        
      case 'flip':
        const rotateY = interpolate(
          fileProgress,
          [0, 0.5, 1],
          [-90, 0, 90],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        transform = `rotateY(${rotateY}deg)`;
        opacity = Math.abs(rotateY) < 90 ? 1 : 0;
        break;
    }
    
    return (
      <div
        style={{
          position: 'absolute',
          left: mainContentX,
          top: '80px',
          width: mainContentWidth,
          height: height - 160,
          transform,
          opacity,
          perspective: '1000px',
        }}
      >
        {/* File header */}
        <div
          style={{
            backgroundColor: colors.background.secondary,
            border: `1px solid ${colors.neutral[300]}`,
            borderRadius: '8px 8px 0 0',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '24px' }}>
            {getFileIcon(file.fileName)}
          </span>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: colors.text.primary,
                marginBottom: '4px',
              }}
            >
              {file.fileName}
            </div>
            <div
              style={{
                fontSize: '14px',
                color: colors.text.secondary,
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
              }}
            >
              <span>{file.language}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {getStatusIcon(file.status)}
                <span style={{ color: getStatusColor(file.status) }}>
                  {file.status}
                </span>
              </span>
              {highlightChanges && (
                <>
                  <span style={{ color: colors.success }}>+{file.stats.additions}</span>
                  <span style={{ color: colors.error }}>-{file.stats.deletions}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* File preview */}
        <div
          style={{
            backgroundColor: colors.background.primary,
            border: `1px solid ${colors.neutral[300]}`,
            borderTop: 'none',
            borderRadius: '0 0 8px 8px',
            height: 'calc(100% - 80px)',
            overflow: 'auto',
            position: 'relative',
          }}
        >
          {/* Code preview */}
          <div
            style={{
              padding: '20px',
              fontFamily: 'monospace',
              fontSize: '14px',
              lineHeight: '1.6',
            }}
          >
            {file.lines.slice(0, 20).map((line, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: '24px',
                  backgroundColor: 
                    line.type === 'added' ? 'rgba(34, 197, 94, 0.1)' :
                    line.type === 'removed' ? 'rgba(239, 68, 68, 0.1)' :
                    'transparent',
                  borderLeft: 
                    line.type === 'added' ? `3px solid ${colors.success}` :
                    line.type === 'removed' ? `3px solid ${colors.error}` :
                    '3px solid transparent',
                  paddingLeft: '8px',
                  marginBottom: '2px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    textAlign: 'right',
                    paddingRight: '12px',
                    color: colors.neutral[500],
                    fontSize: '12px',
                  }}
                >
                  {line.oldLineNumber || line.newLineNumber || ''}
                </div>
                <div
                  style={{
                    width: '20px',
                    textAlign: 'center',
                    color: 
                      line.type === 'added' ? colors.success :
                      line.type === 'removed' ? colors.error :
                      colors.neutral[400],
                  }}
                >
                  {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                </div>
                <div
                  style={{
                    flex: 1,
                    color: colors.text.primary,
                    whiteSpace: 'pre',
                  }}
                >
                  {line.content}
                </div>
              </div>
            ))}
            
            {file.lines.length > 20 && (
              <div
                style={{
                  padding: '12px',
                  textAlign: 'center',
                  color: colors.text.secondary,
                  fontStyle: 'italic',
                }}
              >
                ... and {file.lines.length - 20} more lines
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  const renderProgressIndicator = () => {
    return (
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        {files.map((_, index) => (
          <div
            key={index}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: 
                index < currentFileIndex ? colors.success :
                index === currentFileIndex ? colors.primary[500] :
                colors.neutral[300],
              transition: 'background-color 0.3s ease',
            }}
          />
        ))}
        <div
          style={{
            marginLeft: '12px',
            fontSize: '14px',
            color: colors.text.secondary,
          }}
        >
          {currentFileIndex + 1} of {files.length}
        </div>
      </div>
    );
  };
  
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
        }}
      >
        <div
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: colors.text.primary,
            marginBottom: '8px',
          }}
        >
          📂 File Changes Overview
        </div>
        <div
          style={{
            fontSize: '16px',
            color: colors.text.secondary,
          }}
        >
          Reviewing {files.length} changed files
        </div>
      </div>
      
      {/* File tree sidebar */}
      {renderFileTree()}
      
      {/* Main content area */}
      {renderCurrentFile()}
      
      {/* Progress indicator */}
      {renderProgressIndicator()}
    </AbsoluteFill>
  );
};

/**
 * Build a hierarchical file tree from flat file list
 */
function buildFileTree(files: ProcessedDiff[]): FileNode {
  const root: FileNode = {
    path: '',
    name: 'root',
    type: 'directory',
    children: [],
    depth: 0,
  };
  
  files.forEach(file => {
    const parts = file.fileName.split('/');
    let currentNode = root;
    
    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      const path = parts.slice(0, index + 1).join('/');
      
      let childNode = currentNode.children?.find(child => child.name === part);
      
      if (!childNode) {
        childNode = {
          path,
          name: part,
          type: isFile ? 'file' : 'directory',
          depth: index + 1,
          children: isFile ? undefined : [],
          diff: isFile ? file : undefined,
        };
        
        currentNode.children?.push(childNode);
      }
      
      currentNode = childNode;
    });
  });
  
  return root;
}

export default FileNavigationAnimation;