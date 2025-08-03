/**
 * TypeScript interfaces for video script generation system
 * Supporting dynamic script creation for GitHub PR videos
 */

import { VideoMetadata, VideoSceneData } from '../../github/transformer';

/**
 * Core script data structures
 */
export interface VideoScript {
  /** Unique identifier for the script */
  id: string;
  /** Script title */
  title: string;
  /** Script description */
  description: string;
  /** Target video duration in seconds */
  targetDuration: number;
  /** Script sections in chronological order */
  sections: ScriptSection[];
  /** Metadata about the script generation */
  metadata: ScriptMetadata;
  /** Target audience for the script */
  audience: ScriptAudience;
  /** Narrative style and tone */
  style: NarrativeStyle;
}

/**
 * Individual script section with timing and content
 */
export interface ScriptSection {
  /** Unique section identifier */
  id: string;
  /** Section type for video generation */
  type: ScriptSectionType;
  /** Section title */
  title: string;
  /** Main narrative content */
  content: string;
  /** Voiceover script */
  voiceover: string;
  /** Visual cues and directions */
  visualCues: VisualCue[];
  /** Section duration in seconds */
  duration: number;
  /** Section timing within overall video */
  timing: {
    start: number;
    end: number;
  };
  /** Priority for content selection */
  priority: SectionPriority;
  /** Additional context data */
  data?: any;
}

/**
 * Script section types corresponding to video scenes
 */
export type ScriptSectionType = 
  | 'intro'
  | 'hook'
  | 'overview'
  | 'problem_statement'
  | 'solution_overview'
  | 'technical_details'
  | 'code_changes'
  | 'file_analysis'
  | 'review_process'
  | 'collaboration'
  | 'timeline'
  | 'impact_assessment'
  | 'key_insights'
  | 'summary'
  | 'call_to_action'
  | 'outro';

/**
 * Visual cues for video production
 */
export interface VisualCue {
  /** When to show this visual (seconds from section start) */
  timestamp: number;
  /** Type of visual element */
  type: 'code_highlight' | 'chart' | 'avatar' | 'metric' | 'animation' | 'transition';
  /** Visual element description */
  description: string;
  /** Duration to show this visual */
  duration: number;
  /** Additional visual properties */
  properties?: Record<string, any>;
}

/**
 * Section priority for content selection
 */
export type SectionPriority = 'critical' | 'high' | 'medium' | 'low' | 'optional';

/**
 * Script generation metadata
 */
export interface ScriptMetadata {
  /** Template used for generation */
  templateType: TemplateType;
  /** Generation timestamp */
  generatedAt: Date;
  /** Generator version */
  version: string;
  /** Content selection strategy used */
  selectionStrategy: ContentSelectionStrategy;
  /** Adaptation settings applied */
  adaptations: AdaptationSettings;
  /** Quality metrics */
  quality: QualityMetrics;
}

/**
 * Template types for different video formats
 */
export type TemplateType = 'summary' | 'detailed' | 'technical' | 'executive' | 'custom';

/**
 * Target audience definitions
 */
export interface ScriptAudience {
  /** Primary audience type */
  primary: AudienceType;
  /** Secondary audience types */
  secondary?: AudienceType[];
  /** Technical expertise level */
  technicalLevel: TechnicalLevel;
  /** Familiarity with the project */
  projectFamiliarity: ProjectFamiliarity;
  /** Preferred communication style */
  communicationStyle: CommunicationStyle;
}

export type AudienceType = 
  | 'engineering'
  | 'product'
  | 'executive'
  | 'qa'
  | 'design'
  | 'marketing'
  | 'general'
  | 'external';

export type TechnicalLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type ProjectFamiliarity = 'unfamiliar' | 'basic' | 'familiar' | 'expert';
export type CommunicationStyle = 'formal' | 'casual' | 'technical' | 'conversational' | 'presentation';

/**
 * Narrative style and tone settings
 */
export interface NarrativeStyle {
  /** Overall tone */
  tone: NarrativeTone;
  /** Pacing preference */
  pacing: NarrativePacing;
  /** Storytelling approach */
  approach: StorytellingApproach;
  /** Language complexity */
  complexity: LanguageComplexity;
  /** Emphasis style */
  emphasis: EmphasisStyle;
}

export type NarrativeTone = 'professional' | 'enthusiastic' | 'educational' | 'collaborative' | 'celebratory';
export type NarrativePacing = 'slow' | 'moderate' | 'fast' | 'dynamic';
export type StorytellingApproach = 'chronological' | 'problem_solution' | 'journey' | 'analytical' | 'showcase';
export type LanguageComplexity = 'simple' | 'moderate' | 'complex' | 'technical';
export type EmphasisStyle = 'metrics_focused' | 'story_focused' | 'impact_focused' | 'process_focused';

/**
 * Template definition for script generation
 */
export interface ScriptTemplate {
  /** Template identifier */
  id: string;
  /** Template name */
  name: string;
  /** Template description */
  description: string;
  /** Template type */
  type: TemplateType;
  /** Target duration range */
  durationRange: {
    min: number;
    max: number;
    default: number;
  };
  /** Template structure definition */
  structure: TemplateStructure;
  /** Default settings */
  defaults: TemplateDefaults;
  /** Audience suitability */
  suitability: AudienceSuitability;
}

/**
 * Template structure with section definitions
 */
export interface TemplateStructure {
  /** Required sections that must be included */
  required: SectionDefinition[];
  /** Optional sections that can be included */
  optional: SectionDefinition[];
  /** Section ordering rules */
  ordering: SectionOrderingRule[];
  /** Transition rules between sections */
  transitions: TransitionRule[];
}

/**
 * Section definition within a template
 */
export interface SectionDefinition {
  /** Section type */
  type: ScriptSectionType;
  /** Section name */
  name: string;
  /** Duration allocation */
  duration: DurationAllocation;
  /** Content requirements */
  contentRequirements: ContentRequirement[];
  /** Visual requirements */
  visualRequirements: VisualRequirement[];
  /** Priority within template */
  priority: SectionPriority;
  /** Conditions for inclusion */
  conditions?: InclusionCondition[];
}

/**
 * Duration allocation for sections
 */
export interface DurationAllocation {
  /** Minimum duration in seconds */
  min: number;
  /** Maximum duration in seconds */
  max: number;
  /** Preferred duration in seconds */
  preferred: number;
  /** Duration as percentage of total video */
  percentage?: number;
  /** Dynamic duration based on content */
  dynamic?: DynamicDurationRule;
}

/**
 * Content requirements for sections
 */
export interface ContentRequirement {
  /** Type of content needed */
  type: ContentType;
  /** Whether this content is required */
  required: boolean;
  /** Minimum amount of content */
  minimum?: number;
  /** Maximum amount of content */
  maximum?: number;
  /** Selection criteria */
  criteria?: SelectionCriteria;
}

export type ContentType = 
  | 'pr_overview'
  | 'commit_data'
  | 'file_changes'
  | 'review_data'
  | 'participant_data'
  | 'metrics'
  | 'timeline_events'
  | 'discussion_threads'
  | 'code_samples'
  | 'impact_analysis';

/**
 * Visual requirements for sections
 */
export interface VisualRequirement {
  /** Type of visual element */
  type: string;
  /** Whether visual is required */
  required: boolean;
  /** Visual properties */
  properties?: Record<string, any>;
}

/**
 * Content selection and adaptation settings
 */
export interface ContentSelectionStrategy {
  /** Strategy name */
  name: string;
  /** Selection criteria */
  criteria: SelectionCriteria;
  /** Prioritization rules */
  prioritization: PrioritizationRule[];
  /** Content filtering rules */
  filtering: FilteringRule[];
  /** Adaptation rules */
  adaptation: ContentAdaptationRule[];
}

export interface SelectionCriteria {
  /** Importance threshold */
  importanceThreshold: number;
  /** Relevance scoring */
  relevanceScoring: RelevanceScoring;
  /** Content freshness weight */
  freshnessWeight: number;
  /** Audience alignment weight */
  audienceAlignmentWeight: number;
}

export interface RelevanceScoring {
  /** Factors to consider for relevance */
  factors: RelevanceFactor[];
  /** Scoring algorithm */
  algorithm: ScoringAlgorithm;
  /** Normalization method */
  normalization: NormalizationMethod;
}

export type RelevanceFactor = 
  | 'change_magnitude'
  | 'file_importance'
  | 'review_feedback'
  | 'participant_involvement'
  | 'discussion_activity'
  | 'timeline_significance';

export type ScoringAlgorithm = 'weighted_sum' | 'neural_ranking' | 'composite_score';
export type NormalizationMethod = 'min_max' | 'z_score' | 'percentile_rank';

/**
 * Adaptation settings for different contexts
 */
export interface AdaptationSettings {
  /** Duration-based adaptations */
  duration: DurationAdaptation;
  /** Audience-based adaptations */
  audience: AudienceAdaptation;
  /** Content-based adaptations */
  content: ContentAdaptation;
  /** Technical-level adaptations */
  technical: TechnicalAdaptation;
}

export interface DurationAdaptation {
  /** Strategy for short videos */
  shortForm: AdaptationStrategy;
  /** Strategy for medium videos */
  mediumForm: AdaptationStrategy;
  /** Strategy for long videos */
  longForm: AdaptationStrategy;
  /** Content cutting priorities */
  cuttingPriorities: SectionPriority[];
}

export interface AudienceAdaptation {
  /** Language simplification rules */
  languageSimplification: LanguageRule[];
  /** Technical detail level adjustments */
  technicalDepth: TechnicalDepthRule[];
  /** Emphasis adjustments */
  emphasisAdjustments: EmphasisRule[];
}

export interface ContentAdaptation {
  /** Content transformation rules */
  transformations: ContentTransformationRule[];
  /** Summary generation rules */
  summarization: SummarizationRule[];
  /** Detail expansion rules */
  expansion: ExpansionRule[];
}

export interface TechnicalAdaptation {
  /** Code example inclusion rules */
  codeExamples: CodeExampleRule[];
  /** Jargon explanation rules */
  jargonExplanation: JargonRule[];
  /** Concept introduction rules */
  conceptIntroduction: ConceptRule[];
}

/**
 * Quality metrics for script assessment
 */
export interface QualityMetrics {
  /** Content coherence score (0-1) */
  coherence: number;
  /** Engagement potential score (0-1) */
  engagement: number;
  /** Technical accuracy score (0-1) */
  accuracy: number;
  /** Duration compliance score (0-1) */
  durationCompliance: number;
  /** Audience alignment score (0-1) */
  audienceAlignment: number;
  /** Overall quality score (0-1) */
  overall: number;
  /** Quality assessment details */
  details: QualityAssessment;
}

export interface QualityAssessment {
  /** Identified strengths */
  strengths: string[];
  /** Identified weaknesses */
  weaknesses: string[];
  /** Improvement suggestions */
  suggestions: string[];
  /** Risk factors */
  risks: string[];
}

/**
 * Rule definitions for various adaptation strategies
 */
export interface SectionOrderingRule {
  /** Section before */
  before: ScriptSectionType;
  /** Section after */
  after: ScriptSectionType;
  /** Rule priority */
  priority: number;
  /** Conditions for rule application */
  conditions?: InclusionCondition[];
}

export interface TransitionRule {
  /** Source section type */
  from: ScriptSectionType;
  /** Target section type */
  to: ScriptSectionType;
  /** Transition style */
  style: TransitionStyle;
  /** Transition duration */
  duration: number;
}

export type TransitionStyle = 'smooth' | 'cut' | 'fade' | 'zoom' | 'slide';

export interface InclusionCondition {
  /** Condition type */
  type: ConditionType;
  /** Condition parameters */
  parameters: Record<string, any>;
  /** Condition operator */
  operator: ConditionOperator;
}

export type ConditionType = 
  | 'data_availability'
  | 'content_volume'
  | 'audience_type'
  | 'duration_constraint'
  | 'priority_threshold';

export type ConditionOperator = 'equals' | 'greater_than' | 'less_than' | 'contains' | 'exists';

export interface DynamicDurationRule {
  /** Base duration */
  base: number;
  /** Duration per content item */
  perItem: number;
  /** Maximum scaling factor */
  maxScale: number;
  /** Content counting criteria */
  countingCriteria: CountingCriteria;
}

export interface CountingCriteria {
  /** What to count */
  countType: ContentType;
  /** Filtering rules */
  filters: FilteringRule[];
  /** Weighting factors */
  weights: Record<string, number>;
}

export interface PrioritizationRule {
  /** Rule name */
  name: string;
  /** Content types affected */
  contentTypes: ContentType[];
  /** Scoring function */
  scoringFunction: ScoringFunction;
  /** Rule weight */
  weight: number;
}

export interface FilteringRule {
  /** Rule name */
  name: string;
  /** Filter criteria */
  criteria: FilterCriteria;
  /** Filter action */
  action: FilterAction;
}

export interface FilterCriteria {
  /** Field to filter on */
  field: string;
  /** Filter operator */
  operator: ConditionOperator;
  /** Filter value */
  value: any;
}

export type FilterAction = 'include' | 'exclude' | 'boost' | 'demote';

export interface ContentAdaptationRule {
  /** Rule name */
  name: string;
  /** Trigger conditions */
  triggers: InclusionCondition[];
  /** Adaptation actions */
  actions: AdaptationAction[];
}

export interface AdaptationAction {
  /** Action type */
  type: AdaptationActionType;
  /** Action parameters */
  parameters: Record<string, any>;
}

export type AdaptationActionType = 
  | 'simplify_language'
  | 'add_explanation'
  | 'reduce_detail'
  | 'expand_detail'
  | 'change_emphasis'
  | 'reorder_content';

export interface AdaptationStrategy {
  /** Strategy name */
  name: string;
  /** Priority adjustments */
  priorityAdjustments: Record<SectionPriority, number>;
  /** Duration adjustments */
  durationAdjustments: Record<ScriptSectionType, number>;
  /** Content modifications */
  contentModifications: ContentAdaptationRule[];
}

export interface LanguageRule {
  /** Complexity level trigger */
  trigger: LanguageComplexity;
  /** Simplification actions */
  actions: LanguageAction[];
}

export interface LanguageAction {
  /** Action type */
  type: 'replace_jargon' | 'add_definition' | 'simplify_sentence' | 'add_analogy';
  /** Action parameters */
  parameters: Record<string, any>;
}

export interface TechnicalDepthRule {
  /** Audience technical level */
  audienceLevel: TechnicalLevel;
  /** Depth adjustments */
  adjustments: TechnicalAdjustment[];
}

export interface TechnicalAdjustment {
  /** Content type to adjust */
  contentType: ContentType;
  /** Detail level */
  detailLevel: 'surface' | 'overview' | 'detailed' | 'comprehensive';
  /** Include code examples */
  includeCode: boolean;
}

export interface EmphasisRule {
  /** Audience type */
  audience: AudienceType;
  /** Emphasis adjustments */
  adjustments: EmphasisAdjustment[];
}

export interface EmphasisAdjustment {
  /** Content aspect to emphasize */
  aspect: EmphasisAspect;
  /** Emphasis weight */
  weight: number;
}

export type EmphasisAspect = 
  | 'business_impact'
  | 'technical_achievement'
  | 'collaboration'
  | 'quality'
  | 'innovation'
  | 'efficiency';

export interface ContentTransformationRule {
  /** Source content type */
  source: ContentType;
  /** Target content type */
  target: ContentType;
  /** Transformation function */
  transformation: TransformationFunction;
}

export interface SummarizationRule {
  /** Content type to summarize */
  contentType: ContentType;
  /** Summary length target */
  targetLength: number;
  /** Summarization strategy */
  strategy: SummarizationStrategy;
}

export type SummarizationStrategy = 'extractive' | 'abstractive' | 'key_points' | 'statistical';

export interface ExpansionRule {
  /** Content type to expand */
  contentType: ContentType;
  /** Expansion triggers */
  triggers: InclusionCondition[];
  /** Expansion strategy */
  strategy: ExpansionStrategy;
}

export type ExpansionStrategy = 'add_context' | 'add_examples' | 'add_details' | 'add_implications';

export interface CodeExampleRule {
  /** When to include code examples */
  inclusion: InclusionCondition[];
  /** Code example selection */
  selection: CodeSelectionCriteria;
  /** Code presentation style */
  presentation: CodePresentationStyle;
}

export interface CodeSelectionCriteria {
  /** Maximum number of examples */
  maxExamples: number;
  /** Example prioritization */
  prioritization: CodePrioritization[];
  /** Example filtering */
  filtering: CodeFilteringRule[];
}

export type CodePrioritization = 'complexity' | 'novelty' | 'impact' | 'clarity';

export interface CodeFilteringRule {
  /** File type filters */
  fileTypes: string[];
  /** Size constraints */
  sizeConstraints: {
    minLines: number;
    maxLines: number;
  };
  /** Content filters */
  contentFilters: string[];
}

export interface CodePresentationStyle {
  /** Syntax highlighting */
  syntaxHighlighting: boolean;
  /** Line number display */
  lineNumbers: boolean;
  /** Context lines */
  contextLines: number;
  /** Annotation style */
  annotations: AnnotationStyle;
}

export type AnnotationStyle = 'none' | 'highlights' | 'callouts' | 'overlays';

export interface JargonRule {
  /** Jargon detection criteria */
  detection: JargonDetectionCriteria;
  /** Explanation strategy */
  explanation: JargonExplanationStrategy;
}

export interface JargonDetectionCriteria {
  /** Technical term dictionary */
  dictionary: string[];
  /** Complexity scoring */
  complexityScoring: boolean;
  /** Context analysis */
  contextAnalysis: boolean;
}

export interface JargonExplanationStrategy {
  /** Explanation style */
  style: 'inline' | 'parenthetical' | 'footnote' | 'tooltip';
  /** Explanation depth */
  depth: 'brief' | 'moderate' | 'comprehensive';
  /** Use analogies */
  useAnalogies: boolean;
}

export interface ConceptRule {
  /** Concept identification */
  identification: ConceptIdentificationCriteria;
  /** Introduction strategy */
  introduction: ConceptIntroductionStrategy;
}

export interface ConceptIdentificationCriteria {
  /** Concept complexity threshold */
  complexityThreshold: number;
  /** Audience familiarity scoring */
  familiarityScoring: boolean;
  /** Prerequisite analysis */
  prerequisiteAnalysis: boolean;
}

export interface ConceptIntroductionStrategy {
  /** Introduction timing */
  timing: 'just_in_time' | 'upfront' | 'progressive';
  /** Introduction depth */
  depth: 'surface' | 'foundational' | 'comprehensive';
  /** Use examples */
  useExamples: boolean;
}

export interface TemplateDefaults {
  /** Default audience */
  audience: ScriptAudience;
  /** Default narrative style */
  style: NarrativeStyle;
  /** Default content selection */
  contentSelection: ContentSelectionStrategy;
  /** Default adaptations */
  adaptations: AdaptationSettings;
}

export interface AudienceSuitability {
  /** Primary suitable audiences */
  primary: AudienceType[];
  /** Secondary suitable audiences */
  secondary: AudienceType[];
  /** Unsuitable audiences */
  unsuitable: AudienceType[];
  /** Suitability scoring */
  scoring: SuitabilityScoring;
}

export interface SuitabilityScoring {
  /** Scoring criteria */
  criteria: SuitabilityCriteria[];
  /** Scoring weights */
  weights: Record<string, number>;
  /** Minimum suitability threshold */
  threshold: number;
}

export interface SuitabilityCriteria {
  /** Criteria name */
  name: string;
  /** Evaluation function */
  evaluation: EvaluationFunction;
  /** Weight in overall scoring */
  weight: number;
}

/**
 * Function type definitions for extensibility
 */
export type ScoringFunction = (content: any, context: any) => number;
export type TransformationFunction = (content: any, context: any) => any;
export type EvaluationFunction = (audience: ScriptAudience, context: any) => number;

/**
 * Script generation configuration
 */
export interface ScriptGenerationConfig {
  /** Target template type */
  templateType: TemplateType;
  /** Target duration in seconds */
  targetDuration: number;
  /** Target audience */
  audience: ScriptAudience;
  /** Narrative style preferences */
  style: Partial<NarrativeStyle>;
  /** Content selection overrides */
  contentSelection?: Partial<ContentSelectionStrategy>;
  /** Custom adaptations */
  adaptations?: Partial<AdaptationSettings>;
  /** Quality requirements */
  qualityRequirements?: Partial<QualityMetrics>;
  /** Custom template overrides */
  templateOverrides?: Partial<ScriptTemplate>;
}

/**
 * Script generation result
 */
export interface ScriptGenerationResult {
  /** Generated script */
  script: VideoScript;
  /** Generation success status */
  success: boolean;
  /** Generation warnings */
  warnings: string[];
  /** Generation errors */
  errors: string[];
  /** Performance metrics */
  performance: GenerationPerformance;
  /** Alternative suggestions */
  alternatives?: ScriptGenerationSuggestion[];
}

export interface GenerationPerformance {
  /** Generation time in milliseconds */
  generationTime: number;
  /** Content processing time */
  processingTime: number;
  /** Template matching time */
  templateTime: number;
  /** Adaptation time */
  adaptationTime: number;
  /** Quality assessment time */
  qualityTime: number;
}

export interface ScriptGenerationSuggestion {
  /** Suggestion type */
  type: 'template_change' | 'duration_adjustment' | 'audience_refinement' | 'style_modification';
  /** Suggestion description */
  description: string;
  /** Suggested changes */
  changes: Record<string, any>;
  /** Expected improvement */
  expectedImprovement: string;
}