/**
 * Content adaptation engine for intelligent content selection and prioritization
 * Transforms raw GitHub PR data into script-ready content based on audience and constraints
 */

import { 
  VideoMetadata, 
  VideoSceneData, 
  ParticipantSummary, 
  KeyMetrics 
} from '../../../github/transformer';
import { 
  ContentSelectionStrategy,
  ContentType,
  ScriptAudience,
  RelevanceScoring,
  PrioritizationRule,
  FilteringRule,
  ContentAdaptationRule,
  SectionPriority,
  ScriptSectionType,
  TemplateType,
  QualityMetrics
} from '../types';

/**
 * Adapted content result with scoring and metadata
 */
export interface AdaptedContent {
  /** Content data */
  data: any;
  /** Content type */
  type: ContentType;
  /** Relevance score (0-1) */
  relevanceScore: number;
  /** Priority level */
  priority: SectionPriority;
  /** Estimated duration impact */
  durationImpact: number;
  /** Adaptation metadata */
  metadata: ContentAdaptationMetadata;
}

export interface ContentAdaptationMetadata {
  /** Original content size/complexity */
  originalComplexity: number;
  /** Applied adaptations */
  adaptations: string[];
  /** Audience alignment score */
  audienceAlignment: number;
  /** Quality assessment */
  quality: number;
  /** Selection rationale */
  rationale: string;
}

/**
 * Content selection and adaptation engine
 */
export class ContentAdapter {
  private defaultStrategy: ContentSelectionStrategy;
  private adaptationRules: Map<string, ContentAdaptationRule[]>;

  constructor() {
    this.defaultStrategy = this.createDefaultStrategy();
    this.adaptationRules = new Map();
    this.initializeAdaptationRules();
  }

  /**
   * Adapt content based on template type, audience, and constraints
   */
  adaptContent(
    videoMetadata: VideoMetadata,
    templateType: TemplateType,
    audience: ScriptAudience,
    targetDuration: number,
    customStrategy?: Partial<ContentSelectionStrategy>
  ): AdaptedContent[] {
    console.log(`Adapting content for ${templateType} template, ${audience.primary} audience`);

    const strategy = this.mergeStrategies(this.defaultStrategy, customStrategy);
    const scenes = videoMetadata.scenes;

    // Extract and categorize content from scenes
    const categorizedContent = this.categorizeContent(scenes, videoMetadata);

    // Score content for relevance
    const scoredContent = this.scoreContentRelevance(
      categorizedContent,
      strategy.criteria,
      audience,
      templateType
    );

    // Apply prioritization rules
    const prioritizedContent = this.applyPrioritizationRules(
      scoredContent,
      strategy.prioritization,
      audience
    );

    // Apply filtering rules
    const filteredContent = this.applyFilteringRules(
      prioritizedContent,
      strategy.filtering
    );

    // Apply adaptation rules based on audience and template
    const adaptedContent = this.applyAdaptationRules(
      filteredContent,
      strategy.adaptation,
      audience,
      templateType
    );

    // Select content based on duration constraints
    const selectedContent = this.selectContentForDuration(
      adaptedContent,
      targetDuration,
      templateType
    );

    console.log(`Adapted ${selectedContent.length} content items for script generation`);
    return selectedContent;
  }

  /**
   * Categorize content from video scenes into content types
   */
  private categorizeContent(
    scenes: VideoSceneData[],
    metadata: VideoMetadata
  ): Map<ContentType, any[]> {
    const categorized = new Map<ContentType, any[]>();

    scenes.forEach(scene => {
      switch (scene.type) {
        case 'intro':
        case 'overview':
          this.addToCategory(categorized, 'pr_overview', {
            ...scene.data,
            sceneType: scene.type,
            title: scene.title,
            duration: scene.duration
          });
          break;

        case 'commits':
          this.addToCategory(categorized, 'commit_data', scene.data);
          break;

        case 'files':
          this.addToCategory(categorized, 'file_changes', scene.data);
          break;

        case 'reviews':
          this.addToCategory(categorized, 'review_data', scene.data);
          break;

        case 'timeline':
          this.addToCategory(categorized, 'timeline_events', scene.data);
          break;

        case 'summary':
          this.addToCategory(categorized, 'impact_analysis', scene.data);
          break;
      }
    });

    // Add participant data
    this.addToCategory(categorized, 'participant_data', metadata.participants);

    // Add metrics
    this.addToCategory(categorized, 'metrics', metadata.keyMetrics);

    return categorized;
  }

  /**
   * Score content for relevance based on strategy criteria
   */
  private scoreContentRelevance(
    categorizedContent: Map<ContentType, any[]>,
    criteria: any,
    audience: ScriptAudience,
    templateType: TemplateType
  ): Map<ContentType, any[]> {
    const scoredContent = new Map<ContentType, any[]>();

    categorizedContent.forEach((contentItems, contentType) => {
      const scoredItems = contentItems.map(item => ({
        ...item,
        relevanceScore: this.calculateRelevanceScore(
          item,
          contentType,
          criteria,
          audience,
          templateType
        )
      }));

      scoredContent.set(contentType, scoredItems);
    });

    return scoredContent;
  }

  /**
   * Calculate relevance score for a content item
   */
  private calculateRelevanceScore(
    content: any,
    contentType: ContentType,
    criteria: any,
    audience: ScriptAudience,
    templateType: TemplateType
  ): number {
    let score = 0;

    // Base relevance by content type and audience
    score += this.getContentTypeAudienceScore(contentType, audience);

    // Template-specific relevance
    score += this.getTemplateTypeScore(contentType, templateType);

    // Content-specific factors
    switch (contentType) {
      case 'commit_data':
        score += this.scoreCommitData(content);
        break;
      case 'file_changes':
        score += this.scoreFileChanges(content);
        break;
      case 'review_data':
        score += this.scoreReviewData(content);
        break;
      case 'metrics':
        score += this.scoreMetrics(content, audience);
        break;
      default:
        score += 0.5; // Neutral score
    }

    // Normalize to 0-1 range
    return Math.min(Math.max(score / 3, 0), 1);
  }

  /**
   * Apply prioritization rules to content
   */
  private applyPrioritizationRules(
    scoredContent: Map<ContentType, any[]>,
    rules: PrioritizationRule[],
    audience: ScriptAudience
  ): Map<ContentType, any[]> {
    const prioritizedContent = new Map<ContentType, any[]>();

    scoredContent.forEach((items, contentType) => {
      const applicableRules = rules.filter(rule => 
        rule.contentTypes.includes(contentType)
      );

      const prioritizedItems = items.map(item => {
        let priorityScore = item.relevanceScore;

        applicableRules.forEach(rule => {
          const ruleScore = this.applyPrioritizationRule(rule, item, audience);
          priorityScore += ruleScore * rule.weight;
        });

        return {
          ...item,
          priorityScore,
          priority: this.scoreToPriority(priorityScore)
        };
      });

      // Sort by priority score
      prioritizedItems.sort((a, b) => b.priorityScore - a.priorityScore);
      prioritizedContent.set(contentType, prioritizedItems);
    });

    return prioritizedContent;
  }

  /**
   * Apply filtering rules to content
   */
  private applyFilteringRules(
    prioritizedContent: Map<ContentType, any[]>,
    filteringRules: FilteringRule[]
  ): Map<ContentType, any[]> {
    const filteredContent = new Map<ContentType, any[]>();

    prioritizedContent.forEach((items, contentType) => {
      let filteredItems = [...items];

      filteringRules.forEach(rule => {
        filteredItems = this.applyFilteringRule(filteredItems, rule);
      });

      filteredContent.set(contentType, filteredItems);
    });

    return filteredContent;
  }

  /**
   * Apply adaptation rules based on audience and template
   */
  private applyAdaptationRules(
    filteredContent: Map<ContentType, any[]>,
    adaptationRules: ContentAdaptationRule[],
    audience: ScriptAudience,
    templateType: TemplateType
  ): AdaptedContent[] {
    const adaptedContent: AdaptedContent[] = [];

    filteredContent.forEach((items, contentType) => {
      items.forEach(item => {
        const applicableRules = adaptationRules.filter(rule =>
          this.isRuleApplicable(rule, item, audience, templateType)
        );

        const adaptedItem = this.applyAdaptations(
          item,
          contentType,
          applicableRules,
          audience
        );

        adaptedContent.push(adaptedItem);
      });
    });

    return adaptedContent;
  }

  /**
   * Select content to fit within duration constraints
   */
  private selectContentForDuration(
    adaptedContent: AdaptedContent[],
    targetDuration: number,
    templateType: TemplateType
  ): AdaptedContent[] {
    // Sort by priority and relevance
    const sortedContent = adaptedContent.sort((a, b) => {
      const priorityWeight = this.getPriorityWeight(a.priority) - this.getPriorityWeight(b.priority);
      if (priorityWeight !== 0) return priorityWeight;
      return b.relevanceScore - a.relevanceScore;
    });

    const selectedContent: AdaptedContent[] = [];
    let accumulatedDuration = 0;

    // Always include critical content
    const criticalContent = sortedContent.filter(c => c.priority === 'critical');
    criticalContent.forEach(content => {
      selectedContent.push(content);
      accumulatedDuration += content.durationImpact;
    });

    // Add high-priority content if space allows
    const highPriorityContent = sortedContent.filter(c => c.priority === 'high');
    for (const content of highPriorityContent) {
      if (accumulatedDuration + content.durationImpact <= targetDuration * 0.8) {
        selectedContent.push(content);
        accumulatedDuration += content.durationImpact;
      }
    }

    // Fill remaining space with medium and low priority content
    const remainingContent = sortedContent.filter(c => 
      !['critical', 'high'].includes(c.priority)
    );
    
    for (const content of remainingContent) {
      if (accumulatedDuration + content.durationImpact <= targetDuration * 0.95) {
        selectedContent.push(content);
        accumulatedDuration += content.durationImpact;
      }
    }

    return selectedContent;
  }

  /**
   * Helper methods for content scoring and adaptation
   */
  private getContentTypeAudienceScore(contentType: ContentType, audience: ScriptAudience): number {
    const scores: Record<string, Record<ContentType, number>> = {
      engineering: {
        pr_overview: 0.7,
        commit_data: 0.9,
        file_changes: 0.9,
        review_data: 0.8,
        participant_data: 0.6,
        metrics: 0.8,
        timeline_events: 0.7,
        discussion_threads: 0.8,
        code_samples: 0.9,
        impact_analysis: 0.7
      },
      product: {
        pr_overview: 0.9,
        commit_data: 0.6,
        file_changes: 0.5,
        review_data: 0.7,
        participant_data: 0.8,
        metrics: 0.9,
        timeline_events: 0.8,
        discussion_threads: 0.6,
        code_samples: 0.3,
        impact_analysis: 0.9
      },
      executive: {
        pr_overview: 0.9,
        commit_data: 0.4,
        file_changes: 0.3,
        review_data: 0.5,
        participant_data: 0.7,
        metrics: 0.9,
        timeline_events: 0.6,
        discussion_threads: 0.4,
        code_samples: 0.1,
        impact_analysis: 0.9
      }
    };

    return scores[audience.primary]?.[contentType] || 0.5;
  }

  private getTemplateTypeScore(contentType: ContentType, templateType: TemplateType): number {
    const scores: Record<TemplateType, Record<ContentType, number>> = {
      summary: {
        pr_overview: 0.9,
        commit_data: 0.5,
        file_changes: 0.4,
        review_data: 0.3,
        participant_data: 0.6,
        metrics: 0.8,
        timeline_events: 0.2,
        discussion_threads: 0.2,
        code_samples: 0.1,
        impact_analysis: 0.9
      },
      detailed: {
        pr_overview: 0.8,
        commit_data: 0.8,
        file_changes: 0.8,
        review_data: 0.8,
        participant_data: 0.7,
        metrics: 0.8,
        timeline_events: 0.7,
        discussion_threads: 0.6,
        code_samples: 0.6,
        impact_analysis: 0.8
      },
      technical: {
        pr_overview: 0.7,
        commit_data: 0.9,
        file_changes: 0.9,
        review_data: 0.8,
        participant_data: 0.6,
        metrics: 0.7,
        timeline_events: 0.6,
        discussion_threads: 0.8,
        code_samples: 0.9,
        impact_analysis: 0.7
      },
      executive: {
        pr_overview: 0.9,
        commit_data: 0.3,
        file_changes: 0.2,
        review_data: 0.4,
        participant_data: 0.8,
        metrics: 0.9,
        timeline_events: 0.6,
        discussion_threads: 0.3,
        code_samples: 0.1,
        impact_analysis: 0.9
      },
      custom: {
        pr_overview: 0.7,
        commit_data: 0.7,
        file_changes: 0.7,
        review_data: 0.7,
        participant_data: 0.7,
        metrics: 0.7,
        timeline_events: 0.7,
        discussion_threads: 0.7,
        code_samples: 0.7,
        impact_analysis: 0.7
      }
    };

    return scores[templateType]?.[contentType] || 0.5;
  }

  private scoreCommitData(content: any): number {
    let score = 0;

    if (content.commits) {
      // More commits = higher complexity/importance
      score += Math.min(content.commits.length / 10, 0.5);
      
      // Significant commits boost score
      const significantCommits = content.commits.filter((c: any) => 
        c.significance === 'major'
      ).length;
      score += significantCommits / content.commits.length * 0.3;
    }

    if (content.totalStats) {
      // Larger changes = higher impact
      const totalChanges = content.totalStats.additions + content.totalStats.deletions;
      score += Math.min(totalChanges / 1000, 0.2);
    }

    return score;
  }

  private scoreFileChanges(content: any): number {
    let score = 0;

    if (content.files) {
      // Number of files
      score += Math.min(content.files.length / 20, 0.3);
      
      // Significant changes
      const significantFiles = content.files.filter((f: any) => 
        f.significance === 'high'
      ).length;
      score += significantFiles / content.files.length * 0.4;
    }

    if (content.languageBreakdown) {
      // Language diversity
      score += Math.min(content.languageBreakdown.length / 5, 0.3);
    }

    return score;
  }

  private scoreReviewData(content: any): number {
    let score = 0;

    if (content.reviews) {
      // Number of reviews
      score += Math.min(content.reviews.length / 5, 0.3);
      
      // Review depth (comments)
      const totalComments = content.reviews.reduce((sum: number, r: any) => 
        sum + r.commentCount, 0
      );
      score += Math.min(totalComments / 20, 0.4);
    }

    if (content.consensus) {
      // Consensus type impacts importance
      const consensusScores = {
        blocked: 0.3,
        mixed: 0.2,
        approved: 0.2,
        pending: 0.1
      };
      score += consensusScores[content.consensus] || 0;
    }

    return score;
  }

  private scoreMetrics(content: any, audience: ScriptAudience): number {
    let score = 0.5; // Base score for metrics

    // Different audiences value different metrics
    if (audience.primary === 'executive') {
      // Executives care about impact and efficiency
      if (content.timeToMerge !== null) score += 0.2;
      if (content.participantCount > 3) score += 0.2;
    } else if (audience.primary === 'engineering') {
      // Engineers care about technical details
      if (content.totalCommits > 5) score += 0.2;
      if (content.totalFiles > 10) score += 0.2;
    }

    return Math.min(score, 1);
  }

  private applyPrioritizationRule(
    rule: PrioritizationRule,
    content: any,
    audience: ScriptAudience
  ): number {
    // Simplified rule application - in practice this would be more sophisticated
    return 0.1; // Small boost for having applicable rules
  }

  private scoreToPriority(score: number): SectionPriority {
    if (score >= 0.8) return 'critical';
    if (score >= 0.6) return 'high';
    if (score >= 0.4) return 'medium';
    if (score >= 0.2) return 'low';
    return 'optional';
  }

  private applyFilteringRule(items: any[], rule: FilteringRule): any[] {
    return items.filter(item => {
      const fieldValue = this.getNestedValue(item, rule.criteria.field);
      return this.evaluateFilterCriteria(fieldValue, rule.criteria);
    });
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private evaluateFilterCriteria(value: any, criteria: any): boolean {
    switch (criteria.operator) {
      case 'equals':
        return value === criteria.value;
      case 'greater_than':
        return value > criteria.value;
      case 'less_than':
        return value < criteria.value;
      case 'contains':
        return Array.isArray(value) ? value.includes(criteria.value) : 
               String(value).includes(String(criteria.value));
      case 'exists':
        return value !== undefined && value !== null;
      default:
        return true;
    }
  }

  private isRuleApplicable(
    rule: ContentAdaptationRule,
    content: any,
    audience: ScriptAudience,
    templateType: TemplateType
  ): boolean {
    return rule.triggers.every(trigger => 
      this.evaluateTriggerCondition(trigger, content, audience, templateType)
    );
  }

  private evaluateTriggerCondition(
    condition: any,
    content: any,
    audience: ScriptAudience,
    templateType: TemplateType
  ): boolean {
    // Simplified condition evaluation
    switch (condition.type) {
      case 'audience_type':
        return audience.primary === condition.parameters.audience;
      case 'content_volume':
        return this.evaluateContentVolume(content, condition.parameters);
      default:
        return true;
    }
  }

  private evaluateContentVolume(content: any, parameters: any): boolean {
    // Simplified content volume evaluation
    return true;
  }

  private applyAdaptations(
    content: any,
    contentType: ContentType,
    rules: ContentAdaptationRule[],
    audience: ScriptAudience
  ): AdaptedContent {
    const adaptations: string[] = [];
    let adaptedData = { ...content };

    rules.forEach(rule => {
      rule.actions.forEach(action => {
        switch (action.type) {
          case 'simplify_language':
            adaptedData = this.simplifyLanguage(adaptedData, action.parameters);
            adaptations.push('language_simplified');
            break;
          case 'reduce_detail':
            adaptedData = this.reduceDetail(adaptedData, action.parameters);
            adaptations.push('detail_reduced');
            break;
          case 'add_explanation':
            adaptedData = this.addExplanation(adaptedData, action.parameters);
            adaptations.push('explanation_added');
            break;
        }
      });
    });

    const durationImpact = this.estimateDurationImpact(adaptedData, contentType);

    return {
      data: adaptedData,
      type: contentType,
      relevanceScore: content.relevanceScore || 0.5,
      priority: content.priority || 'medium',
      durationImpact,
      metadata: {
        originalComplexity: this.calculateComplexity(content),
        adaptations,
        audienceAlignment: this.calculateAudienceAlignment(adaptedData, audience),
        quality: this.assessContentQuality(adaptedData),
        rationale: this.generateSelectionRationale(content, contentType, audience)
      }
    };
  }

  private simplifyLanguage(data: any, parameters: any): any {
    // Simplified language adaptation
    return data;
  }

  private reduceDetail(data: any, parameters: any): any {
    // Detail reduction adaptation
    return data;
  }

  private addExplanation(data: any, parameters: any): any {
    // Explanation addition adaptation
    return data;
  }

  private estimateDurationImpact(data: any, contentType: ContentType): number {
    // Base durations by content type (in seconds)
    const baseDurations: Record<ContentType, number> = {
      pr_overview: 10,
      commit_data: 15,
      file_changes: 12,
      review_data: 18,
      participant_data: 8,
      metrics: 6,
      timeline_events: 10,
      discussion_threads: 12,
      code_samples: 20,
      impact_analysis: 8
    };

    return baseDurations[contentType] || 10;
  }

  private calculateComplexity(content: any): number {
    // Simplified complexity calculation
    let complexity = 0.5;

    if (content.commits?.length > 10) complexity += 0.2;
    if (content.files?.length > 20) complexity += 0.2;
    if (content.reviews?.length > 5) complexity += 0.1;

    return Math.min(complexity, 1);
  }

  private calculateAudienceAlignment(data: any, audience: ScriptAudience): number {
    // Simplified audience alignment calculation
    return 0.8; // Default good alignment
  }

  private assessContentQuality(data: any): number {
    // Simplified quality assessment
    return 0.7; // Default decent quality
  }

  private generateSelectionRationale(
    content: any,
    contentType: ContentType,
    audience: ScriptAudience
  ): string {
    return `Selected ${contentType} content for ${audience.primary} audience based on relevance and impact`;
  }

  private getPriorityWeight(priority: SectionPriority): number {
    const weights = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
      optional: 4
    };
    return weights[priority];
  }

  private addToCategory(categorized: Map<ContentType, any[]>, type: ContentType, data: any): void {
    if (!categorized.has(type)) {
      categorized.set(type, []);
    }
    categorized.get(type)!.push(data);
  }

  private createDefaultStrategy(): ContentSelectionStrategy {
    return {
      name: 'default',
      criteria: {
        importanceThreshold: 0.3,
        relevanceScoring: {
          factors: ['change_magnitude', 'participant_involvement', 'review_feedback'],
          algorithm: 'weighted_sum',
          normalization: 'min_max'
        },
        freshnessWeight: 0.2,
        audienceAlignmentWeight: 0.4
      },
      prioritization: [],
      filtering: [],
      adaptation: []
    };
  }

  private mergeStrategies(
    base: ContentSelectionStrategy,
    override?: Partial<ContentSelectionStrategy>
  ): ContentSelectionStrategy {
    if (!override) return base;

    return {
      ...base,
      ...override,
      criteria: { ...base.criteria, ...override.criteria }
    };
  }

  private initializeAdaptationRules(): void {
    // Initialize adaptation rules for different scenarios
    // This would be loaded from configuration in a real implementation
  }
}