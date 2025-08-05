/**
 * Main script generation engine for GitHub PR videos
 * Orchestrates content adaptation, template application, and script optimization
 */

import { VideoMetadata } from '../../github/transformer';
import { 
  VideoScript,
  ScriptSection,
  ScriptTemplate,
  ScriptGenerationConfig,
  ScriptGenerationResult,
  ScriptMetadata,
  TemplateType,
  ScriptAudience,
  NarrativeStyle,
  QualityMetrics,
  ScriptGenerationSuggestion,
  GenerationPerformance,
  ScriptSectionType,
  VisualCue,
  SectionPriority
} from './types';
import { ContentAdapter, AdaptedContent } from './adapters/ContentAdapter';
import { DurationAdapter, DurationOptimizationResult } from './adapters/DurationAdapter';
import { SummaryTemplate } from './templates/SummaryTemplate';
import { DetailedTemplate } from './templates/DetailedTemplate';
import { TechnicalTemplate } from './templates/TechnicalTemplate';

/**
 * Main script generation engine
 */
export class ScriptGenerator {
  private contentAdapter: ContentAdapter;
  private durationAdapter: DurationAdapter;
  private templates: Map<TemplateType, ScriptTemplate>;

  constructor() {
    this.contentAdapter = new ContentAdapter();
    this.durationAdapter = new DurationAdapter();
    this.templates = new Map();
    this.initializeTemplates();
  }

  /**
   * Generate a video script from GitHub PR data
   */
  async generateScript(
    videoMetadata: VideoMetadata,
    config: ScriptGenerationConfig
  ): Promise<ScriptGenerationResult> {
    const startTime = Date.now();
    console.log(`Generating ${config.templateType} script for ${config.audience.primary} audience`);

    try {
      // Performance tracking
      const performance: GenerationPerformance = {
        generationTime: 0,
        processingTime: 0,
        templateTime: 0,
        adaptationTime: 0,
        qualityTime: 0
      };

      // Step 1: Select and prepare template
      const templateStart = Date.now();
      const template = this.selectTemplate(config.templateType, config.templateOverrides);
      if (!template) {
        throw new Error(`Template not found: ${config.templateType}`);
      }
      performance.templateTime = Date.now() - templateStart;

      // Step 2: Adapt content based on template and audience
      const adaptationStart = Date.now();
      const adaptedContent = this.contentAdapter.adaptContent(
        videoMetadata,
        config.templateType,
        config.audience,
        config.targetDuration,
        config.contentSelection
      );
      performance.adaptationTime = Date.now() - adaptationStart;

      // Step 3: Optimize content for target duration
      const processingStart = Date.now();
      const durationOptimization = this.durationAdapter.optimizeForDuration(
        adaptedContent,
        config.targetDuration,
        config.templateType,
        config.audience,
        config.adaptations?.duration
      );
      performance.processingTime = Date.now() - processingStart;

      // Step 4: Generate script sections
      const script = this.generateScriptFromOptimization(
        durationOptimization,
        template,
        config,
        videoMetadata
      );

      // Step 5: Assess quality
      const qualityStart = Date.now();
      const quality = this.assessScriptQuality(script, config, durationOptimization);
      performance.qualityTime = Date.now() - qualityStart;

      // Step 6: Generate suggestions
      const suggestions = this.generateSuggestions(script, config, quality);

      performance.generationTime = Date.now() - startTime;

      const result: ScriptGenerationResult = {
        script,
        success: true,
        warnings: durationOptimization.warnings,
        errors: [],
        performance,
        alternatives: suggestions
      };

      console.log(`Script generation complete in ${performance.generationTime}ms`);
      return result;

    } catch (error) {
      const performance: GenerationPerformance = {
        generationTime: Date.now() - startTime,
        processingTime: 0,
        templateTime: 0,
        adaptationTime: 0,
        qualityTime: 0
      };

      return {
        script: this.createEmptyScript(config),
        success: false,
        warnings: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        performance,
        alternatives: []
      };
    }
  }

  /**
   * Generate script sections from duration optimization
   */
  private generateScriptFromOptimization(
    optimization: DurationOptimizationResult,
    template: ScriptTemplate,
    config: ScriptGenerationConfig,
    videoMetadata: VideoMetadata
  ): VideoScript {
    // Apply template structure and generate content
    const sections = optimization.sections.map((optimizedSection, index) => {
      const section = optimizedSection.section;
      
      // Generate voiceover content
      const voiceover = this.generateVoiceover(
        section,
        config.audience,
        config.style || template.defaults.style
      );

      // Generate visual cues
      const visualCues = this.generateVisualCues(
        section,
        template,
        config.audience
      );

      return {
        ...section,
        voiceover,
        visualCues
      };
    });

    // Generate script metadata
    const metadata: ScriptMetadata = {
      templateType: config.templateType,
      generatedAt: new Date(),
      version: '1.0.0',
      selectionStrategy: config.contentSelection || template.defaults.contentSelection,
      adaptations: config.adaptations || template.defaults.adaptations,
      quality: this.calculateInitialQuality(sections)
    };

    const script: VideoScript = {
      id: `script_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: this.generateScriptTitle(videoMetadata, config),
      description: this.generateScriptDescription(videoMetadata, config),
      targetDuration: config.targetDuration,
      sections,
      metadata,
      audience: config.audience,
      style: { ...template.defaults.style, ...config.style }
    };

    return script;
  }

  /**
   * Generate voiceover content for a section
   */
  private generateVoiceover(
    section: ScriptSection,
    audience: ScriptAudience,
    style: NarrativeStyle
  ): string {
    const baseContent = section.content;
    
    // Apply narrative style transformations
    let voiceover = this.applyNarrativeStyle(baseContent, style);
    
    // Apply audience-specific adaptations
    voiceover = this.applyAudienceAdaptations(voiceover, audience);
    
    // Add section-specific narrative elements
    voiceover = this.addSectionNarrativeElements(voiceover, section.type, style);

    return voiceover;
  }

  /**
   * Generate visual cues for a section
   */
  private generateVisualCues(
    section: ScriptSection,
    template: ScriptTemplate,
    audience: ScriptAudience
  ): VisualCue[] {
    const visualCues: VisualCue[] = [];
    
    // Find template section definition
    const sectionDef = this.findSectionDefinition(section.type, template);
    
    if (sectionDef) {
      // Generate cues based on visual requirements
      sectionDef.visualRequirements.forEach((requirement, index) => {
        if (requirement.required || Math.random() > 0.5) { // Include optional cues randomly
          const cue: VisualCue = {
            timestamp: (section.duration / sectionDef.visualRequirements.length) * index,
            type: this.mapVisualRequirementToType(requirement.type),
            description: this.generateVisualDescription(requirement, section),
            duration: this.calculateVisualDuration(requirement, section.duration),
            properties: requirement.properties
          };
          visualCues.push(cue);
        }
      });
    }

    // Add default visual cues if none generated
    if (visualCues.length === 0) {
      visualCues.push({
        timestamp: 0,
        type: 'animation',
        description: `Default visual for ${section.type} section`,
        duration: section.duration * 0.8,
        properties: { style: 'fade_in' }
      });
    }

    return visualCues.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Assess script quality
   */
  private assessScriptQuality(
    script: VideoScript,
    config: ScriptGenerationConfig,
    optimization: DurationOptimizationResult
  ): QualityMetrics {
    const coherence = this.assessCoherence(script);
    const engagement = this.assessEngagement(script, config.audience);
    const accuracy = this.assessAccuracy(script);
    const durationCompliance = optimization.compliance;
    const audienceAlignment = this.assessAudienceAlignment(script, config.audience);

    const overall = (coherence + engagement + accuracy + durationCompliance + audienceAlignment) / 5;

    return {
      coherence,
      engagement,
      accuracy,
      durationCompliance,
      audienceAlignment,
      overall,
      details: {
        strengths: this.identifyStrengths(script, config),
        weaknesses: this.identifyWeaknesses(script, config),
        suggestions: this.generateQualityImprovements(script, config),
        risks: this.identifyRisks(script, config)
      }
    };
  }

  /**
   * Generate improvement suggestions
   */
  private generateSuggestions(
    script: VideoScript,
    config: ScriptGenerationConfig,
    quality: QualityMetrics
  ): ScriptGenerationSuggestion[] {
    const suggestions: ScriptGenerationSuggestion[] = [];

    // Duration-based suggestions
    if (quality.durationCompliance < 0.8) {
      suggestions.push({
        type: 'duration_adjustment',
        description: 'Consider adjusting target duration for better content fit',
        changes: {
          targetDuration: this.suggestOptimalDuration(script, config)
        },
        expectedImprovement: 'Better pacing and content completeness'
      });
    }

    // Template-based suggestions
    if (quality.audienceAlignment < 0.7) {
      const betterTemplate = this.suggestBetterTemplate(config.audience);
      if (betterTemplate !== config.templateType) {
        suggestions.push({
          type: 'template_change',
          description: `${betterTemplate} template may be better suited for this audience`,
          changes: {
            templateType: betterTemplate
          },
          expectedImprovement: 'Improved audience alignment and engagement'
        });
      }
    }

    // Style-based suggestions
    if (quality.engagement < 0.6) {
      suggestions.push({
        type: 'style_modification',
        description: 'Consider more dynamic pacing and storytelling approach',
        changes: {
          style: {
            pacing: 'dynamic',
            approach: 'journey'
          }
        },
        expectedImprovement: 'Higher audience engagement'
      });
    }

    return suggestions;
  }

  /**
   * Apply narrative style to content
   */
  private applyNarrativeStyle(content: string, style: NarrativeStyle): string {
    let adaptedContent = content;

    // Apply tone
    switch (style.tone) {
      case 'enthusiastic':
        adaptedContent = this.addEnthusiasticTone(adaptedContent);
        break;
      case 'educational':
        adaptedContent = this.addEducationalTone(adaptedContent);
        break;
      case 'collaborative':
        adaptedContent = this.addCollaborativeTone(adaptedContent);
        break;
      // Add more tone adaptations as needed
    }

    // Apply pacing indicators
    if (style.pacing === 'slow') {
      adaptedContent = this.addPacingMarkers(adaptedContent, 'slow');
    } else if (style.pacing === 'fast') {
      adaptedContent = this.addPacingMarkers(adaptedContent, 'fast');
    }

    return adaptedContent;
  }

  /**
   * Apply audience-specific adaptations
   */
  private applyAudienceAdaptations(content: string, audience: ScriptAudience): string {
    let adaptedContent = content;

    // Technical level adaptations
    switch (audience.technicalLevel) {
      case 'beginner':
        adaptedContent = this.simplifyTechnicalLanguage(adaptedContent);
        break;
      case 'expert':
        adaptedContent = this.enhanceTechnicalDepth(adaptedContent);
        break;
    }

    // Communication style adaptations
    switch (audience.communicationStyle) {
      case 'formal':
        adaptedContent = this.applyFormalLanguage(adaptedContent);
        break;
      case 'conversational':
        adaptedContent = this.applyConversationalLanguage(adaptedContent);
        break;
    }

    return adaptedContent;
  }

  /**
   * Add section-specific narrative elements
   */
  private addSectionNarrativeElements(
    content: string,
    sectionType: ScriptSectionType,
    style: NarrativeStyle
  ): string {
    const transitions: Record<ScriptSectionType, string> = {
      intro: "Let's dive into this pull request...",
      hook: "Here's what makes this change significant...",
      overview: "Let me walk you through the key aspects...",
      problem_statement: "The challenge we're addressing is...",
      solution_overview: "Here's how we approached the solution...",
      technical_details: "Let's examine the technical implementation...",
      code_changes: "Looking at the code changes...",
      file_analysis: "Analyzing the affected files...",
      review_process: "The review process revealed...",
      collaboration: "This was truly a team effort...",
      timeline: "The development timeline shows...",
      impact_assessment: "The impact of these changes...",
      key_insights: "The key takeaways are...",
      summary: "To summarize what we've accomplished...",
      call_to_action: "Moving forward, the next steps are...",
      outro: "Thanks for joining this code review journey..."
    };

    const transition = transitions[sectionType] || "";
    return transition ? `${transition} ${content}` : content;
  }

  /**
   * Helper methods for content adaptation
   */
  private addEnthusiasticTone(content: string): string {
    return content.replace(/\./g, '!').replace(/This is/g, 'This is exciting -');
  }

  private addEducationalTone(content: string): string {
    return content.replace(/\b(shows|demonstrates|indicates)\b/g, 'teaches us that');
  }

  private addCollaborativeTone(content: string): string {
    return content.replace(/\bThe\b/g, 'Our').replace(/\bis\b/g, 'was achieved together');
  }

  private addPacingMarkers(content: string, pace: 'slow' | 'fast'): string {
    if (pace === 'slow') {
      return content.replace(/\./g, '... [pause]');
    } else {
      return content.replace(/\s+/g, ' '); // Remove extra whitespace for faster pacing
    }
  }

  private simplifyTechnicalLanguage(content: string): string {
    const replacements: Record<string, string> = {
      'refactored': 'improved',
      'implemented': 'added',
      'optimized': 'made faster',
      'deprecated': 'marked as old'
    };

    let simplified = content;
    Object.entries(replacements).forEach(([tech, simple]) => {
      simplified = simplified.replace(new RegExp(tech, 'gi'), simple);
    });

    return simplified;
  }

  private enhanceTechnicalDepth(content: string): string {
    // Add more technical context and detail
    return content.replace(/changed/g, 'refactored the implementation to');
  }

  private applyFormalLanguage(content: string): string {
    return content.replace(/let's/gi, 'we shall').replace(/we're/gi, 'we are');
  }

  private applyConversationalLanguage(content: string): string {
    return content.replace(/we shall/gi, "let's").replace(/we are/gi, "we're");
  }

  /**
   * Quality assessment methods
   */
  private assessCoherence(script: VideoScript): number {
    // Analyze logical flow and transitions between sections
    let coherenceScore = 0.8; // Base score

    // Check section ordering
    const sectionOrder = script.sections.map(s => s.type);
    if (this.isLogicalOrder(sectionOrder)) {
      coherenceScore += 0.1;
    }

    // Check duration distribution
    const durationVariance = this.calculateDurationVariance(script.sections);
    if (durationVariance < 0.3) {
      coherenceScore += 0.1;
    }

    return Math.min(coherenceScore, 1.0);
  }

  private assessEngagement(script: VideoScript, audience: ScriptAudience): number {
    // Assess potential audience engagement
    let engagementScore = 0.6; // Base score

    // Check for variety in section types
    const sectionTypes = new Set(script.sections.map(s => s.type));
    engagementScore += Math.min(sectionTypes.size / 10, 0.2);

    // Check for appropriate pacing
    const avgSectionDuration = script.sections.reduce((sum, s) => sum + s.duration, 0) / script.sections.length;
    if (avgSectionDuration > 20 && avgSectionDuration < 60) {
      engagementScore += 0.1;
    }

    // Check for visual variety
    const visualTypes = new Set(script.sections.flatMap(s => s.visualCues.map(v => v.type)));
    engagementScore += Math.min(visualTypes.size / 8, 0.1);

    return Math.min(engagementScore, 1.0);
  }

  private assessAccuracy(script: VideoScript): number {
    // Assess technical accuracy and content reliability
    // This would involve more sophisticated analysis in a real implementation
    return 0.85; // Placeholder
  }

  private assessAudienceAlignment(script: VideoScript, audience: ScriptAudience): number {
    // Assess how well the script matches the target audience
    let alignmentScore = 0.7; // Base score

    // Check technical level alignment
    const technicalContent = script.sections.filter(s => 
      ['technical_details', 'code_changes', 'file_analysis'].includes(s.type)
    ).length;

    if (audience.technicalLevel === 'beginner' && technicalContent < 2) {
      alignmentScore += 0.2;
    } else if (audience.technicalLevel === 'expert' && technicalContent >= 3) {
      alignmentScore += 0.2;
    }

    return Math.min(alignmentScore, 1.0);
  }

  /**
   * Template management methods
   */
  private selectTemplate(
    templateType: TemplateType,
    overrides?: Partial<ScriptTemplate>
  ): ScriptTemplate | null {
    const baseTemplate = this.templates.get(templateType);
    
    if (!baseTemplate) {
      return null;
    }

    if (overrides) {
      // Apply overrides to template
      return { ...baseTemplate, ...overrides };
    }

    return baseTemplate;
  }

  private findSectionDefinition(
    sectionType: ScriptSectionType,
    template: ScriptTemplate
  ): any {
    return [...template.structure.required, ...template.structure.optional]
      .find(def => def.type === sectionType);
  }

  /**
   * Utility methods
   */
  private mapVisualRequirementToType(requirementType: string): VisualCue['type'] {
    const mapping: Record<string, VisualCue['type']> = {
      'title_sequence': 'animation',
      'metrics_dashboard': 'chart',
      'code_diff_detailed': 'code_highlight',
      'participant_avatars': 'avatar',
      'timeline_chart': 'chart'
    };

    return mapping[requirementType] || 'animation';
  }

  private generateVisualDescription(requirement: any, section: ScriptSection): string {
    return `${requirement.type} visualization for ${section.type} section`;
  }

  private calculateVisualDuration(requirement: any, sectionDuration: number): number {
    return requirement.properties?.duration || sectionDuration * 0.8;
  }

  private isLogicalOrder(sectionOrder: ScriptSectionType[]): boolean {
    // Check if sections follow a logical narrative order
    const idealOrder = ['intro', 'overview', 'code_changes', 'review_process', 'summary'];
    
    // Simple check - could be more sophisticated
    let orderScore = 0;
    for (let i = 0; i < Math.min(sectionOrder.length, idealOrder.length); i++) {
      if (sectionOrder[i] === idealOrder[i]) {
        orderScore++;
      }
    }
    
    return orderScore >= idealOrder.length * 0.6;
  }

  private calculateDurationVariance(sections: ScriptSection[]): number {
    const durations = sections.map(s => s.duration);
    const mean = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const variance = durations.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / durations.length;
    return Math.sqrt(variance) / mean; // Coefficient of variation
  }

  private calculateInitialQuality(sections: ScriptSection[]): QualityMetrics {
    return {
      coherence: 0.8,
      engagement: 0.7,
      accuracy: 0.85,
      durationCompliance: 0.9,
      audienceAlignment: 0.75,
      overall: 0.8,
      details: {
        strengths: ['Good section variety', 'Appropriate pacing'],
        weaknesses: ['Could enhance engagement'],
        suggestions: ['Add more visual variety'],
        risks: ['Duration may exceed target']
      }
    };
  }

  private generateScriptTitle(videoMetadata: VideoMetadata, config: ScriptGenerationConfig): string {
    const audiencePrefix = config.audience.primary === 'executive' ? 'Executive Brief:' :
                          config.audience.primary === 'engineering' ? 'Technical Review:' :
                          'Team Update:';
    
    return `${audiencePrefix} ${videoMetadata.title}`;
  }

  private generateScriptDescription(videoMetadata: VideoMetadata, config: ScriptGenerationConfig): string {
    return `${config.templateType.charAt(0).toUpperCase() + config.templateType.slice(1)} video script for ${config.audience.primary} audience - ${videoMetadata.description}`;
  }

  private identifyStrengths(script: VideoScript, config: ScriptGenerationConfig): string[] {
    const strengths: string[] = [];
    
    if (script.sections.length >= 5) {
      strengths.push('Comprehensive section coverage');
    }
    
    if (script.sections.some(s => s.visualCues.length > 2)) {
      strengths.push('Rich visual content');
    }
    
    return strengths;
  }

  private identifyWeaknesses(script: VideoScript, config: ScriptGenerationConfig): string[] {
    const weaknesses: string[] = [];
    
    const totalDuration = script.sections.reduce((sum, s) => sum + s.duration, 0);
    if (Math.abs(totalDuration - config.targetDuration) > config.targetDuration * 0.2) {
      weaknesses.push('Duration significantly differs from target');
    }
    
    return weaknesses;
  }

  private generateQualityImprovements(script: VideoScript, config: ScriptGenerationConfig): string[] {
    return [
      'Consider adding more transitional elements between sections',
      'Enhance visual variety to maintain engagement',
      'Optimize section durations for better pacing'
    ];
  }

  private identifyRisks(script: VideoScript, config: ScriptGenerationConfig): string[] {
    const risks: string[] = [];
    
    if (script.sections.length > 8) {
      risks.push('Too many sections may reduce coherence');
    }
    
    return risks;
  }

  private suggestOptimalDuration(script: VideoScript, config: ScriptGenerationConfig): number {
    const currentDuration = script.sections.reduce((sum, s) => sum + s.duration, 0);
    const target = config.targetDuration;
    
    // Suggest duration that's closer to natural content length
    if (currentDuration > target * 1.5) {
      return Math.ceil(currentDuration * 0.8);
    } else if (currentDuration < target * 0.7) {
      return Math.floor(currentDuration * 1.2);
    }
    
    return target;
  }

  private suggestBetterTemplate(audience: ScriptAudience): TemplateType {
    switch (audience.primary) {
      case 'executive':
        return 'summary';
      case 'engineering':
        return audience.technicalLevel === 'expert' ? 'technical' : 'detailed';
      case 'product':
        return 'detailed';
      default:
        return 'summary';
    }
  }

  private createEmptyScript(config: ScriptGenerationConfig): VideoScript {
    return {
      id: `empty_script_${Date.now()}`,
      title: 'Script Generation Failed',
      description: 'An error occurred during script generation',
      targetDuration: config.targetDuration,
      sections: [],
      metadata: {
        templateType: config.templateType,
        generatedAt: new Date(),
        version: '1.0.0',
        selectionStrategy: {
          name: 'default',
          criteria: {
            importanceThreshold: 0.5,
            relevanceScoring: {
              factors: [],
              algorithm: 'weighted_sum',
              normalization: 'min_max'
            },
            freshnessWeight: 0.2,
            audienceAlignmentWeight: 0.5
          },
          prioritization: [],
          filtering: [],
          adaptation: []
        },
        adaptations: {
          duration: {
            shortForm: { name: 'default', priorityAdjustments: {}, durationAdjustments: {}, contentModifications: [] },
            mediumForm: { name: 'default', priorityAdjustments: {}, durationAdjustments: {}, contentModifications: [] },
            longForm: { name: 'default', priorityAdjustments: {}, durationAdjustments: {}, contentModifications: [] },
            cuttingPriorities: []
          },
          audience: { languageSimplification: [], technicalDepth: [], emphasisAdjustments: [] },
          content: { transformations: [], summarization: [], expansion: [] },
          technical: { codeExamples: [], jargonExplanation: [], conceptIntroduction: [] }
        },
        quality: {
          coherence: 0,
          engagement: 0,
          accuracy: 0,
          durationCompliance: 0,
          audienceAlignment: 0,
          overall: 0,
          details: { strengths: [], weaknesses: [], suggestions: [], risks: [] }
        }
      },
      audience: config.audience,
      style: {
        tone: 'professional',
        pacing: 'moderate',
        approach: 'analytical',
        complexity: 'moderate',
        emphasis: 'process_focused'
      }
    };
  }

  /**
   * Initialize default templates
   */
  private initializeTemplates(): void {
    this.templates.set('summary', new SummaryTemplate());
    this.templates.set('detailed', new DetailedTemplate());
    this.templates.set('technical', new TechnicalTemplate());
  }

  /**
   * Add a custom template
   */
  addTemplate(template: ScriptTemplate): void {
    this.templates.set(template.type, template);
  }

  /**
   * Get available template types
   */
  getAvailableTemplates(): TemplateType[] {
    return Array.from(this.templates.keys());
  }

  /**
   * Get template by type
   */
  getTemplate(type: TemplateType): ScriptTemplate | undefined {
    return this.templates.get(type);
  }
}