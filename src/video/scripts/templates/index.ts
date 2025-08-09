export * from './DetailedTemplate';
export * from './SummaryTemplate';
export * from './TechnicalTemplate';
/**
 * Template exports for script generation system
 * Provides predefined templates for different video types and audiences
 */

export { DetailedTemplate } from './DetailedTemplate';
export { SummaryTemplate } from './SummaryTemplate';
export { TechnicalTemplate } from './TechnicalTemplate';

// Re-export commonly used types
export type {
    AudienceSuitability, ContentRequirement, DurationAllocation, ScriptTemplate, SectionDefinition,
    SectionOrderingRule, TemplateDefaults, TemplateType, TransitionRule, VisualRequirement
} from '../types';
