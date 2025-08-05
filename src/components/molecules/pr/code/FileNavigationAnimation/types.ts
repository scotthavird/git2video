/**
 * Type definitions for FileNavigationAnimation component
 */

import { ProcessedDiff } from '../utils/diffProcessor';

export interface FileNavigationAnimationProps {
  files: ProcessedDiff[];
  startFrame: number;
  durationFrames: number;
  transitionDuration?: number;
  showFileTree?: boolean;
  highlightChanges?: boolean;
  animationStyle?: 'slide' | 'fade' | 'scale' | 'flip';
}

export interface FileNode {
  path: string;
  name: string;
  type: 'file' | 'directory';
  diff?: ProcessedDiff;
  children?: FileNode[];
  depth: number;
}

export interface NavigationState {
  currentFileIndex: number;
  fileProgress: number;
  totalProgress: number;
  transitionProgress: number;
}

export interface FileAnimationConfig {
  transitionDuration: number;
  fileDisplayDuration: number;
  animationStyle: 'slide' | 'fade' | 'scale' | 'flip';
  showFileTree: boolean;
  highlightChanges: boolean;
}

export interface FileTreeConfig {
  maxDepth: number;
  showFullPath: boolean;
  expandByDefault: boolean;
  showFileIcons: boolean;
  showStatusIcons: boolean;
}

export interface FilePreviewConfig {
  maxPreviewLines: number;
  showLineNumbers: boolean;
  syntaxHighlighting: boolean;
  showDiffMarkers: boolean;
}