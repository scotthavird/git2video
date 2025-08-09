export * from './adapters/ContentAdapter';
export * from './adapters/DurationAdapter';
export * from './ScriptGenerator';
export * from './templates';
export * from './types';
/**
 * Main exports for the video script generation system
 * Provides complete script generation capabilities for GitHub PR videos
 */

// Main script generator
export { ScriptGenerator } from './ScriptGenerator';

// Core types and interfaces
export type {
    AdaptationAction,
    AdaptationActionType, AdaptationSettings, AdaptationStrategy, AnnotationStyle, AudienceAdaptation, AudienceSuitability, AudienceType,
    // Code-specific types
    CodeExampleRule, CodeFilteringRule,
    CodePresentationStyle, CodePrioritization, CodeSelectionCriteria, CommunicationStyle, ConceptIdentificationCriteria,
    ConceptIntroductionStrategy, ConceptRule, ConditionOperator, ConditionType, ContentAdaptation, ContentAdaptationRule, ContentRequirement,
    // Content selection and adaptation
    ContentSelectionStrategy, ContentTransformationRule, ContentType, CountingCriteria, DurationAdaptation, DurationAllocation, DynamicDurationRule, EmphasisAdjustment,
    EmphasisAspect, EmphasisRule, EmphasisStyle, EvaluationFunction, ExpansionRule,
    ExpansionStrategy, FilterAction, FilterCriteria, FilteringRule, GenerationPerformance,

    // Rules and conditions
    InclusionCondition, JargonDetectionCriteria,
    JargonExplanationStrategy, JargonRule, LanguageAction, LanguageComplexity,
    // Language and technical rules
    LanguageRule, NarrativePacing, NarrativeStyle,
    NarrativeTone, NormalizationMethod,
    PrioritizationRule, ProjectFamiliarity, QualityAssessment, QualityMetrics, RelevanceFactor, RelevanceScoring, ScoringAlgorithm,
    // Function types
    ScoringFunction,
    // Audience and style
    ScriptAudience,
    // Script generation
    ScriptGenerationConfig,
    ScriptGenerationResult, ScriptGenerationSuggestion, ScriptMetadata, ScriptSection,
    ScriptSectionType,
    // Template system
    ScriptTemplate, SectionDefinition,
    SectionOrderingRule, SectionPriority, StorytellingApproach, SuitabilityCriteria,
    // Suitability and evaluation
    SuitabilityScoring, SummarizationRule,
    SummarizationStrategy, TechnicalAdaptation, TechnicalAdjustment, TechnicalDepthRule, TechnicalLevel, TemplateDefaults, TemplateType, TransformationFunction, TransitionRule,
    // Core script types
    VideoScript, VisualCue, VisualRequirement
} from './types';

// Adapter exports
export {
    ContentAdapter,
    DurationAdapter,
    type AdaptedContent,
    type ContentAdaptationMetadata, type ContentCut, type DurationConstraints, type DurationOptimizationMetadata, type DurationOptimizationResult, type DurationValidationResult,
    type DurationViolation, type OptimizedSection, type PriorityAdjustment
} from './adapters';

// Template exports
export {
    DetailedTemplate, SummaryTemplate, TechnicalTemplate
} from './templates';

// Utility functions for common operations
export const ScriptUtils = {
  /**
   * Create a basic script generation configuration
   */
  createBasicConfig(
    templateType: TemplateType = 'summary',
    targetDuration: number = 180,
    audienceType: AudienceType = 'general'
  ): ScriptGenerationConfig {
    return {
      templateType,
      targetDuration,
      audience: {
        primary: audienceType,
        technicalLevel: 'intermediate',
        projectFamiliarity: 'basic',
        communicationStyle: 'conversational'
      },
      style: {
        tone: 'professional',
        pacing: 'moderate',
        approach: 'problem_solution',
        complexity: 'moderate',
        emphasis: 'impact_focused'
      }
    };
  },

  /**
   * Create an engineering-focused configuration
   */
  createEngineeringConfig(
    targetDuration: number = 600,
    technicalLevel: TechnicalLevel = 'advanced'
  ): ScriptGenerationConfig {
    return {
      templateType: technicalLevel === 'expert' ? 'technical' : 'detailed',
      targetDuration,
      audience: {
        primary: 'engineering',
        technicalLevel,
        projectFamiliarity: 'familiar',
        communicationStyle: 'technical'
      },
      style: {
        tone: 'educational',
        pacing: 'moderate',
        approach: 'analytical',
        complexity: 'technical',
        emphasis: 'metrics_focused'
      }
    };
  },

  /**
   * Create an executive-focused configuration
   */
  createExecutiveConfig(
    targetDuration: number = 120
  ): ScriptGenerationConfig {
    return {
      templateType: 'summary',
      targetDuration,
      audience: {
        primary: 'executive',
        technicalLevel: 'beginner',
        projectFamiliarity: 'basic',
        communicationStyle: 'formal'
      },
      style: {
        tone: 'professional',
        pacing: 'fast',
        approach: 'problem_solution',
        complexity: 'simple',
        emphasis: 'impact_focused'
      }
    };
  },

  /**
   * Validate a script generation configuration
   */
  validateConfig(config: ScriptGenerationConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.targetDuration < 60) {
      errors.push('Target duration must be at least 60 seconds');
    }

    if (config.targetDuration > 1200) {
      errors.push('Target duration should not exceed 20 minutes');
    }

    if (!config.audience.primary) {
      errors.push('Primary audience must be specified');
    }

    if (config.templateType === 'technical' && config.audience.technicalLevel === 'beginner') {
      errors.push('Technical template is not suitable for beginner technical level');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Estimate script generation time based on configuration
   */
  estimateGenerationTime(config: ScriptGenerationConfig): number {
    let baseTime = 1000; // 1 second base

    // Template complexity factor
    const templateFactors = {
      summary: 1.0,
      detailed: 1.5,
      technical: 2.0,
      executive: 0.8,
      custom: 1.2
    };

    baseTime *= templateFactors[config.templateType] || 1.0;

    // Duration factor
    baseTime *= Math.sqrt(config.targetDuration / 180); // Normalized to 3 minutes

    // Audience complexity factor
    const audienceFactors = {
      general: 1.0,
      engineering: 1.3,
      product: 1.1,
      executive: 0.9,
      qa: 1.2,
      design: 1.0,
      marketing: 0.9,
      external: 1.1
    };

    baseTime *= audienceFactors[config.audience.primary] || 1.0;

    return Math.round(baseTime);
  }
};

// Export commonly used type aliases for convenience
export type {
    ScriptAudience as VideoAudience,
    ScriptGenerationConfig as VideoScriptConfig,
    ScriptGenerationResult as VideoScriptResult, TemplateType as VideoTemplateType
} from './types';
