/**
 * Duration management and content fitting engine
 * Handles intelligent content selection and timing optimization for target video durations
 */

import {
  VideoScript,
  ScriptSection,
  ScriptSectionType,
  DurationAllocation,
  DynamicDurationRule,
  DurationAdaptation,
  AdaptationStrategy,
  SectionPriority,
  TemplateType,
  ScriptAudience
} from '../types';
import { AdaptedContent } from './ContentAdapter';

/**
 * Duration optimization result
 */
export interface DurationOptimizationResult {
  /** Optimized sections */
  sections: OptimizedSection[];
  /** Total duration */
  totalDuration: number;
  /** Duration compliance score (0-1) */
  compliance: number;
  /** Optimization metadata */
  metadata: DurationOptimizationMetadata;
  /** Warnings and recommendations */
  warnings: string[];
}

export interface OptimizedSection {
  /** Section definition */
  section: ScriptSection;
  /** Original duration */
  originalDuration: number;
  /** Optimized duration */
  optimizedDuration: number;
  /** Duration adjustment rationale */
  adjustmentRationale: string;
  /** Content cuts made */
  contentCuts: ContentCut[];
  /** Priority adjustments */
  priorityAdjustments: PriorityAdjustment[];
}

export interface ContentCut {
  /** Type of content cut */
  type: 'detail_reduction' | 'example_removal' | 'explanation_shortening' | 'section_removal';
  /** Description of what was cut */
  description: string;
  /** Time saved (seconds) */
  timeSaved: number;
  /** Impact on quality (0-1) */
  qualityImpact: number;
}

export interface PriorityAdjustment {
  /** Original priority */
  from: SectionPriority;
  /** New priority */
  to: SectionPriority;
  /** Adjustment reason */
  reason: string;
}

export interface DurationOptimizationMetadata {
  /** Optimization strategy used */
  strategy: string;
  /** Target duration */
  targetDuration: number;
  /** Content compression ratio */
  compressionRatio: number;
  /** Quality preservation score */
  qualityPreservation: number;
  /** Sections that couldn't be optimized */
  unoptimizedSections: string[];
}

/**
 * Duration management and optimization engine
 */
export class DurationAdapter {
  private strategyMap: Map<string, AdaptationStrategy>;
  private sectionDurationMap: Map<ScriptSectionType, DurationAllocation>;

  constructor() {
    this.strategyMap = new Map();
    this.sectionDurationMap = new Map();
    this.initializeStrategies();
    this.initializeSectionDurations();
  }

  /**
   * Optimize content to fit target duration while preserving quality
   */
  optimizeForDuration(
    content: AdaptedContent[],
    targetDuration: number,
    templateType: TemplateType,
    audience: ScriptAudience,
    customAdaptation?: DurationAdaptation
  ): DurationOptimizationResult {
    console.log(`Optimizing content for ${targetDuration}s target duration`);

    // Calculate initial duration estimate
    const initialDuration = this.calculateInitialDuration(content);
    console.log(`Initial duration estimate: ${initialDuration}s`);

    // Select appropriate adaptation strategy
    const strategy = this.selectAdaptationStrategy(
      initialDuration,
      targetDuration,
      templateType,
      customAdaptation
    );

    // Generate initial sections from content
    const initialSections = this.generateInitialSections(content, templateType);

    // Apply duration optimization
    const optimizedSections = this.applyDurationOptimization(
      initialSections,
      targetDuration,
      strategy,
      audience
    );

    // Calculate final metrics
    const totalDuration = optimizedSections.reduce(
      (sum, section) => sum + section.optimizedDuration, 0
    );
    
    const compliance = this.calculateCompliance(totalDuration, targetDuration);
    const warnings = this.generateWarnings(optimizedSections, targetDuration);

    const result: DurationOptimizationResult = {
      sections: optimizedSections,
      totalDuration,
      compliance,
      metadata: {
        strategy: strategy.name,
        targetDuration,
        compressionRatio: totalDuration / initialDuration,
        qualityPreservation: this.calculateQualityPreservation(optimizedSections),
        unoptimizedSections: this.findUnoptimizedSections(optimizedSections)
      },
      warnings
    };

    console.log(`Duration optimization complete: ${totalDuration}s (${compliance * 100}% compliance)`);
    return result;
  }

  /**
   * Generate dynamic duration allocation based on content
   */
  generateDynamicDuration(
    content: AdaptedContent[],
    sectionType: ScriptSectionType,
    rule: DynamicDurationRule
  ): number {
    const relevantContent = content.filter(c => 
      this.isContentRelevantToSection(c, sectionType)
    );

    const itemCount = this.countContentItems(relevantContent, rule.countingCriteria);
    const dynamicDuration = rule.base + (itemCount * rule.perItem);
    
    return Math.min(dynamicDuration, rule.base * rule.maxScale);
  }

  /**
   * Validate duration constraints for a script
   */
  validateDurationConstraints(
    script: VideoScript,
    constraints: DurationConstraints
  ): DurationValidationResult {
    const violations: DurationViolation[] = [];
    const totalDuration = script.sections.reduce((sum, s) => sum + s.duration, 0);

    // Check overall duration
    if (totalDuration < constraints.minDuration) {
      violations.push({
        type: 'total_too_short',
        section: null,
        expected: constraints.minDuration,
        actual: totalDuration,
        severity: 'error'
      });
    }

    if (totalDuration > constraints.maxDuration) {
      violations.push({
        type: 'total_too_long',
        section: null,
        expected: constraints.maxDuration,
        actual: totalDuration,
        severity: 'error'
      });
    }

    // Check section constraints
    script.sections.forEach(section => {
      const sectionConstraints = constraints.sectionConstraints?.[section.type];
      if (sectionConstraints) {
        if (section.duration < sectionConstraints.min) {
          violations.push({
            type: 'section_too_short',
            section: section.id,
            expected: sectionConstraints.min,
            actual: section.duration,
            severity: 'warning'
          });
        }

        if (section.duration > sectionConstraints.max) {
          violations.push({
            type: 'section_too_long',
            section: section.id,
            expected: sectionConstraints.max,
            actual: section.duration,
            severity: 'warning'
          });
        }
      }
    });

    return {
      isValid: violations.filter(v => v.severity === 'error').length === 0,
      violations,
      suggestions: this.generateDurationSuggestions(violations, script)
    };
  }

  /**
   * Calculate initial duration estimate from content
   */
  private calculateInitialDuration(content: AdaptedContent[]): number {
    return content.reduce((total, item) => total + item.durationImpact, 0);
  }

  /**
   * Select appropriate adaptation strategy
   */
  private selectAdaptationStrategy(
    initialDuration: number,
    targetDuration: number,
    templateType: TemplateType,
    customAdaptation?: DurationAdaptation
  ): AdaptationStrategy {
    const durationRatio = targetDuration / initialDuration;

    if (customAdaptation) {
      if (durationRatio < 0.7) return customAdaptation.shortForm;
      if (durationRatio > 1.3) return customAdaptation.longForm;
      return customAdaptation.mediumForm;
    }

    // Use default strategies
    if (durationRatio < 0.7) {
      return this.strategyMap.get('aggressive_compression')!;
    } else if (durationRatio > 1.3) {
      return this.strategyMap.get('content_expansion')!;
    } else {
      return this.strategyMap.get('balanced_optimization')!;
    }
  }

  /**
   * Generate initial sections from content
   */
  private generateInitialSections(
    content: AdaptedContent[],
    templateType: TemplateType
  ): ScriptSection[] {
    const sectionMap = new Map<ScriptSectionType, AdaptedContent[]>();

    // Group content by section type
    content.forEach(item => {
      const sectionType = this.mapContentToSectionType(item, templateType);
      if (!sectionMap.has(sectionType)) {
        sectionMap.set(sectionType, []);
      }
      sectionMap.get(sectionType)!.push(item);
    });

    // Create sections
    const sections: ScriptSection[] = [];
    let currentTime = 0;

    sectionMap.forEach((sectionContent, sectionType) => {
      const duration = sectionContent.reduce((sum, c) => sum + c.durationImpact, 0);
      
      const section: ScriptSection = {
        id: `section_${sectionType}_${Date.now()}`,
        type: sectionType,
        title: this.generateSectionTitle(sectionType),
        content: this.generateSectionContent(sectionContent),
        voiceover: '',
        visualCues: [],
        duration,
        timing: {
          start: currentTime,
          end: currentTime + duration
        },
        priority: this.determineSectionPriority(sectionContent),
        data: sectionContent
      };

      sections.push(section);
      currentTime += duration;
    });

    return sections;
  }

  /**
   * Apply duration optimization strategies
   */
  private applyDurationOptimization(
    sections: ScriptSection[],
    targetDuration: number,
    strategy: AdaptationStrategy,
    audience: ScriptAudience
  ): OptimizedSection[] {
    const optimizedSections: OptimizedSection[] = [];
    const totalCurrentDuration = sections.reduce((sum, s) => sum + s.duration, 0);
    const compressionNeeded = totalCurrentDuration > targetDuration;

    let remainingTime = targetDuration;

    // Sort sections by priority (accounting for strategy adjustments)
    const prioritizedSections = this.prioritizeSections(sections, strategy);

    prioritizedSections.forEach(section => {
      const originalDuration = section.duration;
      const priorityAdjustment = strategy.priorityAdjustments[section.priority] || 1;
      const durationAdjustment = strategy.durationAdjustments[section.type] || 1;
      
      let optimizedDuration = originalDuration * priorityAdjustment * durationAdjustment;

      if (compressionNeeded) {
        // Apply compression based on remaining time
        const timeAllocation = Math.min(optimizedDuration, remainingTime * 0.9);
        optimizedDuration = Math.max(timeAllocation, this.getMinimumSectionDuration(section.type));
      }

      const contentCuts = this.identifyContentCuts(
        section,
        originalDuration,
        optimizedDuration,
        audience
      );

      const priorityAdjustments = this.identifyPriorityAdjustments(
        section,
        strategy
      );

      // Update section timing
      const updatedSection: ScriptSection = {
        ...section,
        duration: optimizedDuration,
        timing: {
          start: targetDuration - remainingTime,
          end: targetDuration - remainingTime + optimizedDuration
        }
      };

      optimizedSections.push({
        section: updatedSection,
        originalDuration,
        optimizedDuration,
        adjustmentRationale: this.generateAdjustmentRationale(
          originalDuration,
          optimizedDuration,
          strategy.name
        ),
        contentCuts,
        priorityAdjustments
      });

      remainingTime -= optimizedDuration;
    });

    return optimizedSections;
  }

  /**
   * Map content to appropriate section type
   */
  private mapContentToSectionType(
    content: AdaptedContent,
    templateType: TemplateType
  ): ScriptSectionType {
    const mappings: Record<string, ScriptSectionType> = {
      pr_overview: 'overview',
      commit_data: 'code_changes',
      file_changes: 'file_analysis',
      review_data: 'review_process',
      participant_data: 'collaboration',
      metrics: 'key_insights',
      timeline_events: 'timeline',
      impact_analysis: 'impact_assessment'
    };

    return mappings[content.type] || 'overview';
  }

  private generateSectionTitle(sectionType: ScriptSectionType): string {
    const titles: Record<ScriptSectionType, string> = {
      intro: 'Introduction',
      hook: 'Opening Hook',
      overview: 'PR Overview',
      problem_statement: 'Problem Statement',
      solution_overview: 'Solution Overview',
      technical_details: 'Technical Details',
      code_changes: 'Code Changes',
      file_analysis: 'File Analysis',
      review_process: 'Review Process',
      collaboration: 'Team Collaboration',
      timeline: 'Development Timeline',
      impact_assessment: 'Impact Assessment',
      key_insights: 'Key Insights',
      summary: 'Summary',
      call_to_action: 'Next Steps',
      outro: 'Conclusion'
    };

    return titles[sectionType] || 'Section';
  }

  private generateSectionContent(content: AdaptedContent[]): string {
    // Generate narrative content from adapted content
    return content.map(item => 
      `Content from ${item.type}: ${JSON.stringify(item.data)}`
    ).join(' ');
  }

  private determineSectionPriority(content: AdaptedContent[]): SectionPriority {
    if (content.some(c => c.priority === 'critical')) return 'critical';
    if (content.some(c => c.priority === 'high')) return 'high';
    if (content.some(c => c.priority === 'medium')) return 'medium';
    if (content.some(c => c.priority === 'low')) return 'low';
    return 'optional';
  }

  private prioritizeSections(
    sections: ScriptSection[],
    strategy: AdaptationStrategy
  ): ScriptSection[] {
    return sections.sort((a, b) => {
      const aPriority = this.getPriorityValue(a.priority);
      const bPriority = this.getPriorityValue(b.priority);
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority; // Lower value = higher priority
      }
      
      // Secondary sort by strategy adjustments
      const aAdjustment = strategy.priorityAdjustments[a.priority] || 1;
      const bAdjustment = strategy.priorityAdjustments[b.priority] || 1;
      return bAdjustment - aAdjustment;
    });
  }

  private getPriorityValue(priority: SectionPriority): number {
    const values = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
      optional: 4
    };
    return values[priority];
  }

  private getMinimumSectionDuration(sectionType: ScriptSectionType): number {
    const minimums: Record<ScriptSectionType, number> = {
      intro: 2,
      hook: 3,
      overview: 5,
      problem_statement: 3,
      solution_overview: 4,
      technical_details: 8,
      code_changes: 6,
      file_analysis: 4,
      review_process: 5,
      collaboration: 3,
      timeline: 4,
      impact_assessment: 3,
      key_insights: 4,
      summary: 3,
      call_to_action: 2,
      outro: 2
    };

    return minimums[sectionType] || 3;
  }

  private identifyContentCuts(
    section: ScriptSection,
    originalDuration: number,
    optimizedDuration: number,
    audience: ScriptAudience
  ): ContentCut[] {
    const cuts: ContentCut[] = [];
    const timeToSave = originalDuration - optimizedDuration;

    if (timeToSave <= 0) return cuts;

    // Identify what to cut based on audience and section type
    if (timeToSave > 5) {
      cuts.push({
        type: 'detail_reduction',
        description: 'Reduced technical details for time constraints',
        timeSaved: Math.min(timeToSave * 0.6, 8),
        qualityImpact: 0.2
      });
    }

    if (timeToSave > 3) {
      cuts.push({
        type: 'example_removal',
        description: 'Removed secondary examples',
        timeSaved: Math.min(timeToSave * 0.3, 5),
        qualityImpact: 0.1
      });
    }

    return cuts;
  }

  private identifyPriorityAdjustments(
    section: ScriptSection,
    strategy: AdaptationStrategy
  ): PriorityAdjustment[] {
    const adjustments: PriorityAdjustment[] = [];
    const priorityAdjustment = strategy.priorityAdjustments[section.priority];

    if (priorityAdjustment && priorityAdjustment !== 1) {
      const newPriority = this.adjustPriority(section.priority, priorityAdjustment);
      if (newPriority !== section.priority) {
        adjustments.push({
          from: section.priority,
          to: newPriority,
          reason: `Strategy ${strategy.name} adjustment`
        });
      }
    }

    return adjustments;
  }

  private adjustPriority(
    currentPriority: SectionPriority,
    adjustment: number
  ): SectionPriority {
    const priorities: SectionPriority[] = ['critical', 'high', 'medium', 'low', 'optional'];
    const currentIndex = priorities.indexOf(currentPriority);
    
    if (adjustment > 1) {
      // Increase priority (move towards critical)
      return priorities[Math.max(0, currentIndex - 1)];
    } else if (adjustment < 1) {
      // Decrease priority (move towards optional)
      return priorities[Math.min(priorities.length - 1, currentIndex + 1)];
    }
    
    return currentPriority;
  }

  private generateAdjustmentRationale(
    originalDuration: number,
    optimizedDuration: number,
    strategyName: string
  ): string {
    const change = ((optimizedDuration - originalDuration) / originalDuration) * 100;
    
    if (Math.abs(change) < 5) {
      return 'Duration maintained within acceptable range';
    } else if (change < 0) {
      return `Duration reduced by ${Math.abs(change).toFixed(1)}% using ${strategyName} strategy`;
    } else {
      return `Duration expanded by ${change.toFixed(1)}% using ${strategyName} strategy`;
    }
  }

  private calculateCompliance(actualDuration: number, targetDuration: number): number {
    const deviation = Math.abs(actualDuration - targetDuration) / targetDuration;
    return Math.max(0, 1 - deviation);
  }

  private calculateQualityPreservation(optimizedSections: OptimizedSection[]): number {
    const qualityImpacts = optimizedSections.flatMap(s => s.contentCuts.map(c => c.qualityImpact));
    
    if (qualityImpacts.length === 0) return 1.0;
    
    const averageImpact = qualityImpacts.reduce((sum, impact) => sum + impact, 0) / qualityImpacts.length;
    return Math.max(0, 1 - averageImpact);
  }

  private findUnoptimizedSections(optimizedSections: OptimizedSection[]): string[] {
    return optimizedSections
      .filter(s => s.contentCuts.length === 0 && s.originalDuration === s.optimizedDuration)
      .map(s => s.section.id);
  }

  private generateWarnings(
    optimizedSections: OptimizedSection[],
    targetDuration: number
  ): string[] {
    const warnings: string[] = [];
    const totalDuration = optimizedSections.reduce((sum, s) => sum + s.optimizedDuration, 0);

    if (totalDuration > targetDuration * 1.1) {
      warnings.push(`Total duration ${totalDuration}s exceeds target by ${((totalDuration / targetDuration - 1) * 100).toFixed(1)}%`);
    }

    if (totalDuration < targetDuration * 0.9) {
      warnings.push(`Total duration ${totalDuration}s is ${((1 - totalDuration / targetDuration) * 100).toFixed(1)}% below target`);
    }

    const heavilyCutSections = optimizedSections.filter(s => 
      s.contentCuts.reduce((sum, cut) => sum + cut.qualityImpact, 0) > 0.3
    );

    if (heavilyCutSections.length > 0) {
      warnings.push(`${heavilyCutSections.length} sections have significant content cuts that may impact quality`);
    }

    return warnings;
  }

  private isContentRelevantToSection(content: AdaptedContent, sectionType: ScriptSectionType): boolean {
    // Map content types to relevant sections
    const relevanceMap: Record<string, ScriptSectionType[]> = {
      pr_overview: ['overview', 'intro', 'summary'],
      commit_data: ['code_changes', 'technical_details'],
      file_changes: ['file_analysis', 'code_changes'],
      review_data: ['review_process', 'collaboration'],
      metrics: ['key_insights', 'impact_assessment']
    };

    return relevanceMap[content.type]?.includes(sectionType) || false;
  }

  private countContentItems(content: AdaptedContent[], criteria: any): number {
    // Simplified content counting
    return content.length;
  }

  private generateDurationSuggestions(
    violations: DurationViolation[],
    script: VideoScript
  ): string[] {
    const suggestions: string[] = [];

    violations.forEach(violation => {
      switch (violation.type) {
        case 'total_too_long':
          suggestions.push('Consider removing optional sections or reducing detail level');
          break;
        case 'total_too_short':
          suggestions.push('Consider adding examples or expanding key sections');
          break;
        case 'section_too_long':
          suggestions.push(`Section ${violation.section} could be shortened by reducing examples or details`);
          break;
        case 'section_too_short':
          suggestions.push(`Section ${violation.section} could benefit from additional context or examples`);
          break;
      }
    });

    return suggestions;
  }

  /**
   * Initialize adaptation strategies
   */
  private initializeStrategies(): void {
    this.strategyMap.set('aggressive_compression', {
      name: 'aggressive_compression',
      priorityAdjustments: {
        critical: 1.0,
        high: 0.7,
        medium: 0.5,
        low: 0.3,
        optional: 0.1
      },
      durationAdjustments: {
        intro: 0.8,
        overview: 0.7,
        code_changes: 0.6,
        review_process: 0.5,
        summary: 0.9,
        outro: 0.7
      } as Record<ScriptSectionType, number>,
      contentModifications: []
    });

    this.strategyMap.set('content_expansion', {
      name: 'content_expansion',
      priorityAdjustments: {
        critical: 1.0,
        high: 1.3,
        medium: 1.2,
        low: 1.1,
        optional: 1.0
      },
      durationAdjustments: {
        intro: 1.2,
        overview: 1.3,
        technical_details: 1.4,
        code_changes: 1.3,
        summary: 1.1,
        outro: 1.1
      } as Record<ScriptSectionType, number>,
      contentModifications: []
    });

    this.strategyMap.set('balanced_optimization', {
      name: 'balanced_optimization',
      priorityAdjustments: {
        critical: 1.0,
        high: 1.0,
        medium: 0.9,
        low: 0.8,
        optional: 0.6
      },
      durationAdjustments: {
        intro: 1.0,
        overview: 1.0,
        code_changes: 1.0,
        review_process: 1.0,
        summary: 1.0,
        outro: 1.0
      } as Record<ScriptSectionType, number>,
      contentModifications: []
    });
  }

  /**
   * Initialize section duration mappings
   */
  private initializeSectionDurations(): void {
    const defaultDuration: DurationAllocation = {
      min: 2,
      max: 30,
      preferred: 10,
      percentage: 10
    };

    // Set specific durations for different section types
    this.sectionDurationMap.set('intro', { ...defaultDuration, preferred: 5, max: 10 });
    this.sectionDurationMap.set('overview', { ...defaultDuration, preferred: 15, max: 25 });
    this.sectionDurationMap.set('code_changes', { ...defaultDuration, preferred: 20, max: 40 });
    this.sectionDurationMap.set('review_process', { ...defaultDuration, preferred: 15, max: 30 });
    this.sectionDurationMap.set('summary', { ...defaultDuration, preferred: 8, max: 15 });
    this.sectionDurationMap.set('outro', { ...defaultDuration, preferred: 3, max: 8 });
  }
}

/**
 * Duration constraint and validation types
 */
export interface DurationConstraints {
  minDuration: number;
  maxDuration: number;
  sectionConstraints?: Record<ScriptSectionType, { min: number; max: number }>;
}

export interface DurationValidationResult {
  isValid: boolean;
  violations: DurationViolation[];
  suggestions: string[];
}

export interface DurationViolation {
  type: 'total_too_short' | 'total_too_long' | 'section_too_short' | 'section_too_long';
  section: string | null;
  expected: number;
  actual: number;
  severity: 'error' | 'warning';
}