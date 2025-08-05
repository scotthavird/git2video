/**
 * Type definitions for DiffRevealAnimation component
 */

import { ProcessedDiff } from '../utils/diffProcessor';

export interface DiffRevealAnimationProps {
  diff: ProcessedDiff;
  startFrame: number;
  durationFrames: number;
  style?: 'side-by-side' | 'unified' | 'split';
  showLineNumbers?: boolean;
  highlightChanges?: boolean;
  animationSpeed?: 'slow' | 'normal' | 'fast';
}

export interface DiffAnimationConfig {
  revealSpeed: number;
  highlightDuration: number;
  focusTransitionDuration: number;
  lineHeight: number;
  fontSize: number;
}

export interface LineAnimationState {
  isVisible: boolean;
  isFocused: boolean;
  opacity: number;
  translateX: number;
  highlightOpacity: number;
}

export interface DiffRevealMetrics {
  totalLines: number;
  visibleLines: number;
  currentFocusLine: number;
  progress: number;
  animationFrame: number;
}