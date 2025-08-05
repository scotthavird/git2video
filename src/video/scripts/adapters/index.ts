/**
 * Adapter exports for script generation system
 * Provides content adaptation and duration optimization capabilities
 */

export { ContentAdapter, type AdaptedContent, type ContentAdaptationMetadata } from './ContentAdapter';
export { 
  DurationAdapter, 
  type DurationOptimizationResult,
  type OptimizedSection,
  type ContentCut,
  type PriorityAdjustment,
  type DurationOptimizationMetadata,
  type DurationConstraints,
  type DurationValidationResult,
  type DurationViolation
} from './DurationAdapter';

// Re-export commonly used types from the main types file
export type {
  ContentSelectionStrategy,
  ContentType,
  DurationAllocation,
  DynamicDurationRule,
  DurationAdaptation,
  AdaptationStrategy,
  SectionPriority,
  ScriptSectionType
} from '../types';