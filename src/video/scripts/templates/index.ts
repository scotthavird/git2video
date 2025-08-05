/**
 * Template exports for script generation system
 * Provides predefined templates for different video types and audiences
 */

export { SummaryTemplate } from './SummaryTemplate';
export { DetailedTemplate } from './DetailedTemplate';
export { TechnicalTemplate } from './TechnicalTemplate';

// Re-export commonly used types
export type {
  ScriptTemplate,
  TemplateType,
  SectionDefinition,
  SectionOrderingRule,
  TransitionRule,
  TemplateDefaults,
  AudienceSuitability,
  DurationAllocation,
  ContentRequirement,
  VisualRequirement
} from '../types';