/**
 * Summary video template for quick 2-3 minute PR overview videos
 * Optimized for high-level stakeholders and quick updates
 */

import {
  ScriptTemplate,
  TemplateType,
  ScriptSectionType,
  SectionDefinition,
  SectionOrderingRule,
  TransitionRule,
  TemplateDefaults,
  AudienceSuitability,
  DurationAllocation,
  ContentRequirement,
  VisualRequirement,
  ScriptAudience,
  NarrativeStyle,
  ContentSelectionStrategy,
  AdaptationSettings
} from '../types';

/**
 * Summary template for concise PR video generation
 * Target duration: 2-3 minutes
 * Focus: High-level impact, key metrics, outcome
 */
export class SummaryTemplate implements ScriptTemplate {
  readonly id = 'summary_template_v1';
  readonly name = 'PR Summary';
  readonly description = 'Concise 2-3 minute overview focusing on key outcomes and impact';
  readonly type: TemplateType = 'summary';

  readonly durationRange = {
    min: 90,  // 1.5 minutes
    max: 210, // 3.5 minutes
    default: 150 // 2.5 minutes
  };

  readonly structure = {
    required: this.createRequiredSections(),
    optional: this.createOptionalSections(),
    ordering: this.createOrderingRules(),
    transitions: this.createTransitionRules()
  };

  readonly defaults = this.createDefaults();
  readonly suitability = this.createSuitability();

  /**
   * Create required sections for summary template
   */
  private createRequiredSections(): SectionDefinition[] {
    return [
      {
        type: 'hook',
        name: 'Opening Hook',
        duration: {
          min: 3,
          max: 8,
          preferred: 5,
          percentage: 3
        },
        contentRequirements: [
          {
            type: 'pr_overview',
            required: true,
            minimum: 1,
            criteria: {
              importanceThreshold: 0.8,
              relevanceScoring: {
                factors: ['change_magnitude', 'participant_involvement'],
                algorithm: 'weighted_sum',
                normalization: 'min_max'
              },
              freshnessWeight: 0.3,
              audienceAlignmentWeight: 0.5
            }
          }
        ],
        visualRequirements: [
          {
            type: 'repository_logo',
            required: false,
            properties: { size: 'medium', position: 'top-left' }
          },
          {
            type: 'pr_number_badge',
            required: true,
            properties: { style: 'prominent', animation: 'fade_in' }
          }
        ],
        priority: 'critical'
      },
      {
        type: 'overview',
        name: 'PR Overview',
        duration: {
          min: 15,
          max: 30,
          preferred: 20,
          percentage: 15
        },
        contentRequirements: [
          {
            type: 'pr_overview',
            required: true,
            minimum: 1
          },
          {
            type: 'metrics',
            required: true,
            minimum: 3,
            maximum: 6,
            criteria: {
              importanceThreshold: 0.6,
              relevanceScoring: {
                factors: ['change_magnitude', 'timeline_significance'],
                algorithm: 'weighted_sum',
                normalization: 'min_max'
              },
              freshnessWeight: 0.2,
              audienceAlignmentWeight: 0.6
            }
          },
          {
            type: 'participant_data',
            required: false,
            maximum: 5
          }
        ],
        visualRequirements: [
          {
            type: 'metrics_dashboard',
            required: true,
            properties: { 
              layout: 'horizontal',
              metrics: ['files_changed', 'lines_added', 'lines_deleted', 'participants'],
              animation: 'count_up'
            }
          },
          {
            type: 'participant_avatars',
            required: false,
            properties: { max_count: 5, style: 'circular' }
          }
        ],
        priority: 'critical'
      },
      {
        type: 'key_insights',
        name: 'Key Changes',
        duration: {
          min: 20,
          max: 45,
          preferred: 30,
          percentage: 22,
          dynamic: {
            base: 20,
            perItem: 3,
            maxScale: 2.0,
            countingCriteria: {
              countType: 'file_changes',
              filters: [
                {
                  name: 'significant_changes',
                  criteria: {
                    field: 'significance',
                    operator: 'equals',
                    value: 'high'
                  },
                  action: 'include'
                }
              ],
              weights: { high: 1.0, medium: 0.5, low: 0.2 }
            }
          }
        },
        contentRequirements: [
          {
            type: 'file_changes',
            required: true,
            minimum: 1,
            maximum: 8,
            criteria: {
              importanceThreshold: 0.5,
              relevanceScoring: {
                factors: ['change_magnitude', 'file_importance'],
                algorithm: 'weighted_sum',
                normalization: 'min_max'
              },
              freshnessWeight: 0.1,
              audienceAlignmentWeight: 0.4
            }
          },
          {
            type: 'commit_data',
            required: false,
            maximum: 3
          }
        ],
        visualRequirements: [
          {
            type: 'file_change_chart',
            required: true,
            properties: {
              chart_type: 'bar',
              max_items: 8,
              color_coding: 'by_change_type',
              animation: 'slide_in'
            }
          },
          {
            type: 'language_breakdown',
            required: false,
            properties: { type: 'pie_chart', show_percentages: true }
          }
        ],
        priority: 'high'
      },
      {
        type: 'impact_assessment',
        name: 'Impact & Outcome',
        duration: {
          min: 15,
          max: 35,
          preferred: 25,
          percentage: 18
        },
        contentRequirements: [
          {
            type: 'impact_analysis',
            required: true,
            minimum: 1
          },
          {
            type: 'review_data',
            required: false,
            maximum: 3,
            criteria: {
              importanceThreshold: 0.7,
              relevanceScoring: {
                factors: ['review_feedback', 'participant_involvement'],
                algorithm: 'weighted_sum',
                normalization: 'min_max'
              },
              freshnessWeight: 0.4,
              audienceAlignmentWeight: 0.3
            }
          }
        ],
        visualRequirements: [
          {
            type: 'impact_visualization',
            required: true,
            properties: {
              style: 'before_after',
              metrics: ['performance', 'features', 'quality'],
              animation: 'transform'
            }
          },
          {
            type: 'approval_status',
            required: false,
            properties: { style: 'badge', color: 'success' }
          }
        ],
        priority: 'critical'
      },
      {
        type: 'call_to_action',
        name: 'Next Steps',
        duration: {
          min: 8,
          max: 15,
          preferred: 10,
          percentage: 7
        },
        contentRequirements: [
          {
            type: 'impact_analysis',
            required: true,
            minimum: 1
          }
        ],
        visualRequirements: [
          {
            type: 'action_items',
            required: false,
            properties: { style: 'checklist', max_items: 3 }
          }
        ],
        priority: 'medium'
      }
    ];
  }

  /**
   * Create optional sections for summary template
   */
  private createOptionalSections(): SectionDefinition[] {
    return [
      {
        type: 'collaboration',
        name: 'Team Effort',
        duration: {
          min: 8,
          max: 20,
          preferred: 12,
          percentage: 8
        },
        contentRequirements: [
          {
            type: 'participant_data',
            required: true,
            minimum: 2,
            maximum: 6
          },
          {
            type: 'review_data',
            required: false,
            maximum: 3
          }
        ],
        visualRequirements: [
          {
            type: 'collaboration_network',
            required: false,
            properties: { style: 'node_graph', max_nodes: 6 }
          }
        ],
        priority: 'medium',
        conditions: [
          {
            type: 'data_availability',
            parameters: { min_participants: 3 },
            operator: 'greater_than'
          }
        ]
      },
      {
        type: 'timeline',
        name: 'Development Timeline',
        duration: {
          min: 10,
          max: 25,
          preferred: 15,
          percentage: 10
        },
        contentRequirements: [
          {
            type: 'timeline_events',
            required: true,
            minimum: 3,
            maximum: 8
          }
        ],
        visualRequirements: [
          {
            type: 'timeline_chart',
            required: true,
            properties: {
              style: 'horizontal',
              show_milestones: true,
              max_events: 8
            }
          }
        ],
        priority: 'low',
        conditions: [
          {
            type: 'content_volume',
            parameters: { min_timeline_events: 5 },
            operator: 'greater_than'
          },
          {
            type: 'duration_constraint',
            parameters: { min_total_duration: 120 },
            operator: 'greater_than'
          }
        ]
      }
    ];
  }

  /**
   * Create section ordering rules
   */
  private createOrderingRules(): SectionOrderingRule[] {
    return [
      {
        before: 'hook',
        after: 'overview',
        priority: 100
      },
      {
        before: 'overview',
        after: 'key_insights',
        priority: 90
      },
      {
        before: 'key_insights',
        after: 'impact_assessment',
        priority: 85
      },
      {
        before: 'collaboration',
        after: 'impact_assessment',
        priority: 60,
        conditions: [
          {
            type: 'data_availability',
            parameters: { section_type: 'collaboration' },
            operator: 'exists'
          }
        ]
      },
      {
        before: 'timeline',
        after: 'key_insights',
        priority: 50,
        conditions: [
          {
            type: 'data_availability',
            parameters: { section_type: 'timeline' },
            operator: 'exists'
          }
        ]
      },
      {
        before: 'impact_assessment',
        after: 'call_to_action',
        priority: 95
      }
    ];
  }

  /**
   * Create transition rules
   */
  private createTransitionRules(): TransitionRule[] {
    return [
      {
        from: 'hook',
        to: 'overview',
        style: 'smooth',
        duration: 0.5
      },
      {
        from: 'overview',
        to: 'key_insights',
        style: 'fade',
        duration: 0.8
      },
      {
        from: 'key_insights',
        to: 'collaboration',
        style: 'slide',
        duration: 0.6
      },
      {
        from: 'key_insights',
        to: 'timeline',
        style: 'zoom',
        duration: 0.7
      },
      {
        from: 'collaboration',
        to: 'impact_assessment',
        style: 'smooth',
        duration: 0.5
      },
      {
        from: 'timeline',
        to: 'impact_assessment',
        style: 'smooth',
        duration: 0.5
      },
      {
        from: 'impact_assessment',
        to: 'call_to_action',
        style: 'fade',
        duration: 0.8
      }
    ];
  }

  /**
   * Create default configuration
   */
  private createDefaults(): TemplateDefaults {
    return {
      audience: {
        primary: 'product',
        secondary: ['executive', 'general'],
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
      },
      contentSelection: {
        name: 'summary_optimized',
        criteria: {
          importanceThreshold: 0.6,
          relevanceScoring: {
            factors: ['change_magnitude', 'participant_involvement', 'timeline_significance'],
            algorithm: 'weighted_sum',
            normalization: 'min_max'
          },
          freshnessWeight: 0.2,
          audienceAlignmentWeight: 0.5
        },
        prioritization: [
          {
            name: 'impact_prioritization',
            contentTypes: ['impact_analysis', 'metrics'],
            scoringFunction: (content: any) => content.impact_score || 0.5,
            weight: 0.4
          },
          {
            name: 'participant_involvement',
            contentTypes: ['participant_data', 'review_data'],
            scoringFunction: (content: any) => content.participant_count / 10,
            weight: 0.3
          }
        ],
        filtering: [
          {
            name: 'exclude_minor_changes',
            criteria: {
              field: 'significance',
              operator: 'equals',
              value: 'low'
            },
            action: 'exclude'
          },
          {
            name: 'limit_technical_details',
            criteria: {
              field: 'type',
              operator: 'equals',
              value: 'code_samples'
            },
            action: 'demote'
          }
        ],
        adaptation: [
          {
            name: 'simplify_for_non_technical',
            triggers: [
              {
                type: 'audience_type',
                parameters: { audience: 'executive' },
                operator: 'equals'
              }
            ],
            actions: [
              {
                type: 'simplify_language',
                parameters: { level: 'basic', add_definitions: true }
              },
              {
                type: 'reduce_detail',
                parameters: { technical_depth: 'surface' }
              }
            ]
          }
        ]
      },
      adaptations: {
        duration: {
          shortForm: {
            name: 'summary_compressed',
            priorityAdjustments: {
              critical: 1.0,
              high: 0.8,
              medium: 0.6,
              low: 0.3,
              optional: 0.1
            },
            durationAdjustments: {
              hook: 0.8,
              overview: 0.7,
              key_insights: 0.6,
              impact_assessment: 0.9,
              call_to_action: 0.8
            } as Record<ScriptSectionType, number>,
            contentModifications: []
          },
          mediumForm: {
            name: 'summary_standard',
            priorityAdjustments: {
              critical: 1.0,
              high: 1.0,
              medium: 0.9,
              low: 0.7,
              optional: 0.5
            },
            durationAdjustments: {
              hook: 1.0,
              overview: 1.0,
              key_insights: 1.0,
              impact_assessment: 1.0,
              call_to_action: 1.0
            } as Record<ScriptSectionType, number>,
            contentModifications: []
          },
          longForm: {
            name: 'summary_expanded',
            priorityAdjustments: {
              critical: 1.0,
              high: 1.2,
              medium: 1.1,
              low: 1.0,
              optional: 0.8
            },
            durationAdjustments: {
              hook: 1.1,
              overview: 1.3,
              key_insights: 1.2,
              collaboration: 1.4,
              timeline: 1.3,
              impact_assessment: 1.1,
              call_to_action: 1.0
            } as Record<ScriptSectionType, number>,
            contentModifications: []
          },
          cuttingPriorities: ['optional', 'low', 'medium', 'high', 'critical']
        },
        audience: {
          languageSimplification: [
            {
              trigger: 'complex',
              actions: [
                {
                  type: 'replace_jargon',
                  parameters: { 
                    dictionary: 'technical_terms',
                    replacement_style: 'explanatory'
                  }
                },
                {
                  type: 'add_analogy',
                  parameters: { context: 'business_familiar' }
                }
              ]
            }
          ],
          technicalDepth: [
            {
              audienceLevel: 'beginner',
              adjustments: [
                {
                  contentType: 'commit_data',
                  detailLevel: 'surface',
                  includeCode: false
                },
                {
                  contentType: 'file_changes',
                  detailLevel: 'overview',
                  includeCode: false
                }
              ]
            },
            {
              audienceLevel: 'intermediate',
              adjustments: [
                {
                  contentType: 'commit_data',
                  detailLevel: 'overview',
                  includeCode: false
                },
                {
                  contentType: 'file_changes',
                  detailLevel: 'detailed',
                  includeCode: false
                }
              ]
            }
          ],
          emphasisAdjustments: [
            {
              audience: 'executive',
              adjustments: [
                {
                  aspect: 'business_impact',
                  weight: 0.8
                },
                {
                  aspect: 'efficiency',
                  weight: 0.6
                }
              ]
            },
            {
              audience: 'product',
              adjustments: [
                {
                  aspect: 'business_impact',
                  weight: 0.7
                },
                {
                  aspect: 'quality',
                  weight: 0.6
                },
                {
                  aspect: 'collaboration',
                  weight: 0.5
                }
              ]
            }
          ]
        },
        content: {
          transformations: [],
          summarization: [
            {
              contentType: 'commit_data',
              targetLength: 50,
              strategy: 'key_points'
            },
            {
              contentType: 'review_data',
              targetLength: 30,
              strategy: 'extractive'
            }
          ],
          expansion: [
            {
              contentType: 'impact_analysis',
              triggers: [
                {
                  type: 'audience_type',
                  parameters: { audience: 'executive' },
                  operator: 'equals'
                }
              ],
              strategy: 'add_implications'
            }
          ]
        },
        technical: {
          codeExamples: [
            {
              inclusion: [
                {
                  type: 'audience_type',
                  parameters: { audience: 'engineering' },
                  operator: 'equals'
                }
              ],
              selection: {
                maxExamples: 0, // No code examples in summary
                prioritization: [],
                filtering: []
              },
              presentation: {
                syntaxHighlighting: false,
                lineNumbers: false,
                contextLines: 0,
                annotations: 'none'
              }
            }
          ],
          jargonExplanation: [
            {
              detection: {
                dictionary: ['pull request', 'merge', 'commit', 'repository'],
                complexityScoring: true,
                contextAnalysis: false
              },
              explanation: {
                style: 'parenthetical',
                depth: 'brief',
                useAnalogies: true
              }
            }
          ],
          conceptIntroduction: [
            {
              identification: {
                complexityThreshold: 0.7,
                familiarityScoring: true,
                prerequisiteAnalysis: false
              },
              introduction: {
                timing: 'just_in_time',
                depth: 'surface',
                useExamples: true
              }
            }
          ]
        }
      }
    };
  }

  /**
   * Create audience suitability configuration
   */
  private createSuitability(): AudienceSuitability {
    return {
      primary: ['product', 'executive', 'general'],
      secondary: ['marketing', 'qa'],
      unsuitable: [],
      scoring: {
        criteria: [
          {
            name: 'time_availability',
            evaluation: (audience: ScriptAudience) => {
              const timeScores = {
                executive: 0.9,
                product: 0.8,
                general: 0.9,
                engineering: 0.6,
                qa: 0.7
              };
              return timeScores[audience.primary] || 0.5;
            },
            weight: 0.4
          },
          {
            name: 'technical_alignment',
            evaluation: (audience: ScriptAudience) => {
              const techScores = {
                executive: 0.3,
                product: 0.7,
                general: 0.8,
                engineering: 0.4,
                qa: 0.6
              };
              return techScores[audience.primary] || 0.5;
            },
            weight: 0.3
          },
          {
            name: 'impact_focus',
            evaluation: (audience: ScriptAudience) => {
              const impactScores = {
                executive: 0.9,
                product: 0.9,
                general: 0.7,
                engineering: 0.5,
                qa: 0.6
              };
              return impactScores[audience.primary] || 0.5;
            },
            weight: 0.3
          }
        ],
        weights: {
          time_availability: 0.4,
          technical_alignment: 0.3,
          impact_focus: 0.3
        },
        threshold: 0.6
      }
    };
  }
}