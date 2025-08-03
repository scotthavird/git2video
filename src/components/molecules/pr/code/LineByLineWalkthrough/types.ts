/**
 * Type definitions for LineByLineWalkthrough component
 */

import { ProcessedDiff } from '../utils/diffProcessor';

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

export interface FocusArea {
  startLine: number;
  endLine: number;
  intensity: number;
}

export interface WalkthroughState {
  currentStepIndex: number;
  stepProgress: number;
  totalProgress: number;
  focusArea: FocusArea;
}

export interface AnnotationConfig {
  displayDuration: number;
  fadeInDuration: number;
  fadeOutDuration: number;
  maxSimultaneous: number;
}

export interface MinimapConfig {
  width: number;
  height: number;
  showFocusIndicator: boolean;
  lineHeight: number;
}

export interface SidebarConfig {
  width: number;
  showStepInfo: boolean;
  showAnnotations: boolean;
  expandByDefault: boolean;
}