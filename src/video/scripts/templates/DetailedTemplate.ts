/**
 * Detailed video template for comprehensive 5-7 minute PR analysis videos
 * Optimized for teams and stakeholders who need in-depth understanding
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
 * Detailed template for comprehensive PR video generation
 * Target duration: 5-7 minutes
 * Focus: Complete story, process, collaboration, and technical insights
 */
export class DetailedTemplate implements ScriptTemplate {
  readonly id = 'detailed_template_v1';
  readonly name = 'PR Detailed Analysis';
  readonly description = 'Comprehensive 5-7 minute analysis covering process, collaboration, and technical details';
  readonly type: TemplateType = 'detailed';

  readonly durationRange = {
    min: 300,  // 5 minutes
    max: 480,  // 8 minutes
    default: 390 // 6.5 minutes
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
   * Create required sections for detailed template
   */
  private createRequiredSections(): SectionDefinition[] {
    return [
      {
        type: 'intro',
        name: 'Introduction',
        duration: {
          min: 8,
          max: 15,
          preferred: 12,
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
            type: 'title_sequence',
            required: true,
            properties: { 
              style: 'professional',
              duration: 3,
              elements: ['repository', 'pr_number', 'title']
            }
          },
          {
            type: 'author_introduction',
            required: true,
            properties: { include_avatar: true, show_role: true }
          }
        ],
        priority: 'critical'
      },
      {
        type: 'problem_statement',
        name: 'Problem & Motivation',
        duration: {
          min: 20,
          max: 45,
          preferred: 30,
          percentage: 8
        },
        contentRequirements: [
          {
            type: 'pr_overview',
            required: true,
            minimum: 1
          },
          {
            type: 'discussion_threads',
            required: false,
            maximum: 3,
            criteria: {
              importanceThreshold: 0.6,
              relevanceScoring: {
                factors: ['discussion_activity', 'participant_involvement'],
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
            type: 'problem_visualization',
            required: false,
            properties: {
              style: 'before_after',
              focus: 'pain_points'
            }
          },
          {
            type: 'context_diagram',
            required: false,
            properties: { type: 'system_overview' }
          }
        ],
        priority: 'high'
      },
      {
        type: 'solution_overview',
        name: 'Solution Approach',
        duration: {
          min: 25,
          max: 50,
          preferred: 35,
          percentage: 9
        },
        contentRequirements: [
          {
            type: 'pr_overview',
            required: true,
            minimum: 1
          },
          {
            type: 'commit_data',
            required: true,
            minimum: 1,
            maximum: 5,
            criteria: {
              importanceThreshold: 0.5,
              relevanceScoring: {
                factors: ['change_magnitude', 'timeline_significance'],
                algorithm: 'weighted_sum',
                normalization: 'min_max'
              },
              freshnessWeight: 0.2,
              audienceAlignmentWeight: 0.4
            }
          }
        ],
        visualRequirements: [
          {
            type: 'solution_architecture',
            required: false,
            properties: {
              style: 'flow_diagram',
              show_components: true
            }
          },
          {
            type: 'approach_timeline',
            required: true,
            properties: {
              style: 'horizontal',
              show_phases: true
            }
          }
        ],
        priority: 'critical'
      },
      {
        type: 'code_changes',
        name: 'Implementation Details',
        duration: {
          min: 45,
          max: 90,
          preferred: 60,
          percentage: 15,
          dynamic: {
            base: 30,
            perItem: 8,
            maxScale: 2.5,
            countingCriteria: {
              countType: 'file_changes',
              filters: [
                {
                  name: 'significant_changes',
                  criteria: {
                    field: 'significance',
                    operator: 'greater_than',
                    value: 'low'
                  },
                  action: 'include'
                }
              ],
              weights: { high: 1.0, medium: 0.7, low: 0.3 }
            }
          }
        },
        contentRequirements: [
          {
            type: 'commit_data',
            required: true,
            minimum: 1,
            maximum: 10
          },
          {
            type: 'file_changes',
            required: true,
            minimum: 1,
            maximum: 15,
            criteria: {
              importanceThreshold: 0.3,
              relevanceScoring: {
                factors: ['change_magnitude', 'file_importance'],
                algorithm: 'weighted_sum',
                normalization: 'min_max'
              },
              freshnessWeight: 0.1,
              audienceAlignmentWeight: 0.5
            }
          },
          {
            type: 'code_samples',
            required: false,
            maximum: 5
          }
        ],
        visualRequirements: [
          {
            type: 'commit_timeline',
            required: true,
            properties: {
              style: 'vertical',
              show_messages: true,
              show_stats: true,
              max_commits: 10
            }
          },
          {
            type: 'file_diff_visualization',
            required: true,
            properties: {
              style: 'side_by_side',
              highlight_changes: true,
              max_files: 8
            }
          },
          {
            type: 'code_snippet',
            required: false,
            properties: {
              syntax_highlighting: true,
              show_line_numbers: true,
              max_lines: 20
            }
          }
        ],
        priority: 'critical'
      },
      {
        type: 'review_process',
        name: 'Code Review & Feedback',
        duration: {
          min: 30,
          max: 70,
          preferred: 45,
          percentage: 12,
          dynamic: {
            base: 20,
            perItem: 8,
            maxScale: 2.0,
            countingCriteria: {
              countType: 'review_data',
              filters: [
                {
                  name: 'substantial_reviews',
                  criteria: {
                    field: 'commentCount',
                    operator: 'greater_than',
                    value: 2
                  },
                  action: 'include'
                }
              ],
              weights: { approved: 1.0, changes_requested: 1.2, commented: 0.8 }
            }
          }
        },
        contentRequirements: [
          {
            type: 'review_data',
            required: true,
            minimum: 1,
            maximum: 8,
            criteria: {
              importanceThreshold: 0.4,
              relevanceScoring: {
                factors: ['review_feedback', 'participant_involvement'],
                algorithm: 'weighted_sum',
                normalization: 'min_max'
              },
              freshnessWeight: 0.3,
              audienceAlignmentWeight: 0.4
            }
          },
          {
            type: 'discussion_threads',
            required: false,
            maximum: 5
          }
        ],
        visualRequirements: [
          {
            type: 'review_timeline',
            required: true,
            properties: {
              style: 'chronological',
              show_reviewers: true,
              show_status: true
            }
          },
          {
            type: 'feedback_summary',
            required: true,
            properties: {
              style: 'categorized',
              show_sentiment: true
            }
          },
          {
            type: 'discussion_threads',
            required: false,
            properties: {
              style: 'threaded',
              max_threads: 3
            }
          }
        ],
        priority: 'high'
      },
      {
        type: 'collaboration',
        name: 'Team Collaboration',
        duration: {
          min: 20,
          max: 45,
          preferred: 30,
          percentage: 8
        },
        contentRequirements: [
          {
            type: 'participant_data',
            required: true,
            minimum: 2,
            maximum: 10
          },
          {
            type: 'review_data',
            required: false,
            maximum: 5
          },
          {
            type: 'timeline_events',
            required: false,
            maximum: 8
          }
        ],
        visualRequirements: [
          {
            type: 'collaboration_network',
            required: true,
            properties: {
              style: 'force_directed',
              show_interactions: true,
              max_participants: 10
            }
          },
          {
            type: 'contribution_breakdown',
            required: true,
            properties: {
              style: 'stacked_bar',
              metrics: ['commits', 'reviews', 'comments']
            }
          }
        ],
        priority: 'medium'
      },
      {
        type: 'timeline',
        name: 'Development Timeline',
        duration: {
          min: 25,
          max: 50,
          preferred: 35,
          percentage: 9
        },
        contentRequirements: [
          {
            type: 'timeline_events',
            required: true,
            minimum: 3,
            maximum: 15
          },
          {
            type: 'commit_data',
            required: false,
            maximum: 8
          }
        ],
        visualRequirements: [
          {
            type: 'detailed_timeline',
            required: true,
            properties: {
              style: 'gantt_chart',
              show_milestones: true,
              show_duration: true,
              max_events: 15
            }
          },
          {
            type: 'activity_heatmap',
            required: false,
            properties: {
              granularity: 'daily',
              show_intensity: true
            }
          }
        ],
        priority: 'medium'
      },
      {
        type: 'impact_assessment',
        name: 'Impact & Results',
        duration: {
          min: 30,
          max: 60,
          preferred: 40,
          percentage: 10
        },
        contentRequirements: [
          {
            type: 'impact_analysis',
            required: true,
            minimum: 1
          },
          {
            type: 'metrics',
            required: true,
            minimum: 5,
            maximum: 12
          }
        ],
        visualRequirements: [
          {
            type: 'impact_dashboard',
            required: true,
            properties: {
              style: 'comprehensive',
              sections: ['quality', 'performance', 'features', 'maintenance'],
              show_trends: true
            }
          },
          {
            type: 'before_after_comparison',
            required: false,
            properties: {
              metrics: ['performance', 'code_quality', 'test_coverage']
            }
          }
        ],
        priority: 'critical'
      },
      {
        type: 'summary',
        name: 'Key Takeaways',
        duration: {
          min: 20,
          max: 40,
          preferred: 25,
          percentage: 6
        },
        contentRequirements: [
          {
            type: 'impact_analysis',
            required: true,
            minimum: 1
          },
          {
            type: 'pr_overview',
            required: true,
            minimum: 1
          }
        ],
        visualRequirements: [
          {
            type: 'key_points_summary',
            required: true,
            properties: {
              style: 'bulleted_list',
              max_points: 5,
              include_metrics: true
            }
          }
        ],
        priority: 'high'
      },
      {
        type: 'call_to_action',
        name: 'Next Steps & Follow-up',
        duration: {
          min: 15,
          max: 30,
          preferred: 20,
          percentage: 5
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
            type: 'action_plan',
            required: true,
            properties: {
              style: 'roadmap',
              show_priorities: true,
              max_actions: 5
            }
          }
        ],
        priority: 'medium'
      }
    ];
  }

  /**
   * Create optional sections for detailed template
   */
  private createOptionalSections(): SectionDefinition[] {
    return [
      {
        type: 'technical_details',
        name: 'Deep Technical Analysis',
        duration: {
          min: 30,
          max: 75,
          preferred: 50,
          percentage: 12
        },
        contentRequirements: [
          {
            type: 'code_samples',
            required: true,
            minimum: 2,
            maximum: 8
          },
          {
            type: 'file_changes',
            required: true,
            minimum: 3,
            maximum: 12
          }
        ],
        visualRequirements: [
          {
            type: 'code_analysis',
            required: true,
            properties: {
              style: 'annotated',
              show_complexity: true,
              show_dependencies: true
            }
          },
          {
            type: 'architecture_diagram',
            required: false,
            properties: {
              style: 'component_diagram',
              show_changes: true
            }
          }
        ],
        priority: 'medium',
        conditions: [
          {
            type: 'audience_type',
            parameters: { audience: 'engineering' },
            operator: 'equals'
          },
          {
            type: 'content_volume',
            parameters: { min_code_samples: 3 },
            operator: 'greater_than'
          }
        ]
      },
      {
        type: 'file_analysis',
        name: 'File Change Analysis',
        duration: {
          min: 25,
          max: 55,
          preferred: 35,
          percentage: 9
        },
        contentRequirements: [
          {
            type: 'file_changes',
            required: true,
            minimum: 5,
            maximum: 20
          }
        ],
        visualRequirements: [
          {
            type: 'file_tree_diff',
            required: true,
            properties: {
              style: 'hierarchical',
              show_changes: true,
              color_coded: true
            }
          },
          {
            type: 'file_impact_matrix',
            required: false,
            properties: {
              style: 'heatmap',
              dimensions: ['complexity', 'risk', 'impact']
            }
          }
        ],
        priority: 'low',
        conditions: [
          {
            type: 'content_volume',
            parameters: { min_files: 8 },
            operator: 'greater_than'
          },
          {
            type: 'duration_constraint',
            parameters: { min_total_duration: 300 },
            operator: 'greater_than'
          }
        ]
      },
      {
        type: 'key_insights',
        name: 'Strategic Insights',
        duration: {
          min: 20,
          max: 45,
          preferred: 30,
          percentage: 8
        },
        contentRequirements: [
          {
            type: 'metrics',
            required: true,
            minimum: 3,
            maximum: 8
          },
          {
            type: 'impact_analysis',
            required: true,
            minimum: 1
          }
        ],
        visualRequirements: [
          {
            type: 'insights_visualization',
            required: true,
            properties: {
              style: 'infographic',
              highlight_trends: true
            }
          }
        ],
        priority: 'medium',
        conditions: [
          {
            type: 'audience_type',
            parameters: { audience: 'product' },
            operator: 'equals'
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
        before: 'intro',
        after: 'problem_statement',
        priority: 100
      },
      {
        before: 'problem_statement',
        after: 'solution_overview',
        priority: 95
      },
      {
        before: 'solution_overview',
        after: 'code_changes',
        priority: 90
      },
      {
        before: 'code_changes',
        after: 'technical_details',
        priority: 70,
        conditions: [
          {
            type: 'data_availability',
            parameters: { section_type: 'technical_details' },
            operator: 'exists'
          }
        ]
      },
      {
        before: 'code_changes',
        after: 'file_analysis',
        priority: 65,
        conditions: [
          {
            type: 'data_availability',
            parameters: { section_type: 'file_analysis' },
            operator: 'exists'
          }
        ]
      },
      {
        before: 'technical_details',
        after: 'review_process',
        priority: 85
      },
      {
        before: 'file_analysis',
        after: 'review_process',
        priority: 80
      },
      {
        before: 'review_process',
        after: 'collaboration',
        priority: 75
      },
      {
        before: 'collaboration',
        after: 'timeline',
        priority: 70
      },
      {
        before: 'timeline',
        after: 'key_insights',
        priority: 60,
        conditions: [
          {
            type: 'data_availability',
            parameters: { section_type: 'key_insights' },
            operator: 'exists'
          }
        ]
      },
      {
        before: 'timeline',
        after: 'impact_assessment',
        priority: 85
      },
      {
        before: 'key_insights',
        after: 'impact_assessment',
        priority: 80
      },
      {
        before: 'impact_assessment',
        after: 'summary',
        priority: 90
      },
      {
        before: 'summary',
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
        from: 'intro',
        to: 'problem_statement',
        style: 'smooth',
        duration: 0.8
      },
      {
        from: 'problem_statement',
        to: 'solution_overview',
        style: 'fade',
        duration: 1.0
      },
      {
        from: 'solution_overview',
        to: 'code_changes',
        style: 'zoom',
        duration: 0.8
      },
      {
        from: 'code_changes',
        to: 'technical_details',
        style: 'slide',
        duration: 0.6
      },
      {
        from: 'code_changes',
        to: 'file_analysis',
        style: 'slide',
        duration: 0.6
      },
      {
        from: 'technical_details',
        to: 'review_process',
        style: 'smooth',
        duration: 0.7
      },
      {
        from: 'file_analysis',
        to: 'review_process',
        style: 'smooth',
        duration: 0.7
      },
      {
        from: 'review_process',
        to: 'collaboration',
        style: 'fade',
        duration: 0.8
      },
      {
        from: 'collaboration',
        to: 'timeline',
        style: 'slide',
        duration: 0.7
      },
      {
        from: 'timeline',
        to: 'key_insights',
        style: 'zoom',
        duration: 0.6
      },
      {
        from: 'timeline',
        to: 'impact_assessment',
        style: 'fade',
        duration: 0.8
      },
      {
        from: 'key_insights',
        to: 'impact_assessment',
        style: 'smooth',
        duration: 0.5
      },
      {
        from: 'impact_assessment',
        to: 'summary',
        style: 'fade',
        duration: 1.0
      },
      {
        from: 'summary',
        to: 'call_to_action',
        style: 'smooth',
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
        primary: 'engineering',
        secondary: ['product', 'qa'],
        technicalLevel: 'intermediate',
        projectFamiliarity: 'familiar',
        communicationStyle: 'technical'
      },
      style: {
        tone: 'professional',
        pacing: 'moderate',
        approach: 'journey',
        complexity: 'moderate',
        emphasis: 'process_focused'
      },
      contentSelection: {
        name: 'detailed_comprehensive',
        criteria: {
          importanceThreshold: 0.3,
          relevanceScoring: {
            factors: [
              'change_magnitude',
              'participant_involvement',
              'review_feedback',
              'timeline_significance',
              'discussion_activity'
            ],
            algorithm: 'weighted_sum',
            normalization: 'min_max'
          },
          freshnessWeight: 0.3,
          audienceAlignmentWeight: 0.4
        },
        prioritization: [
          {
            name: 'technical_depth_prioritization',
            contentTypes: ['code_samples', 'file_changes', 'commit_data'],
            scoringFunction: (content: any) => content.technical_complexity || 0.5,
            weight: 0.5
          },
          {
            name: 'collaboration_prioritization',
            contentTypes: ['review_data', 'participant_data', 'discussion_threads'],
            scoringFunction: (content: any) => content.collaboration_score || 0.5,
            weight: 0.3
          },
          {
            name: 'timeline_prioritization',
            contentTypes: ['timeline_events', 'commit_data'],
            scoringFunction: (content: any) => content.timeline_significance || 0.5,
            weight: 0.2
          }
        ],
        filtering: [
          {
            name: 'include_substantial_content',
            criteria: {
              field: 'significance',
              operator: 'greater_than',
              value: 'low'
            },
            action: 'boost'
          }
        ],
        adaptation: [
          {
            name: 'enhance_technical_for_engineers',
            triggers: [
              {
                type: 'audience_type',
                parameters: { audience: 'engineering' },
                operator: 'equals'
              }
            ],
            actions: [
              {
                type: 'expand_detail',
                parameters: { technical_depth: 'comprehensive' }
              }
            ]
          },
          {
            name: 'add_process_insights',
            triggers: [
              {
                type: 'audience_type',
                parameters: { audience: 'product' },
                operator: 'equals'
              }
            ],
            actions: [
              {
                type: 'add_explanation',
                parameters: { focus: 'process_implications' }
              }
            ]
          }
        ]
      },
      adaptations: {
        duration: {
          shortForm: {
            name: 'detailed_compressed',
            priorityAdjustments: {
              critical: 1.0,
              high: 0.8,
              medium: 0.6,
              low: 0.4,
              optional: 0.2
            },
            durationAdjustments: {
              intro: 0.8,
              problem_statement: 0.7,
              solution_overview: 0.8,
              code_changes: 0.7,
              technical_details: 0.6,
              review_process: 0.8,
              collaboration: 0.6,
              timeline: 0.7,
              impact_assessment: 0.9,
              summary: 0.8,
              call_to_action: 0.8
            } as Record<ScriptSectionType, number>,
            contentModifications: []
          },
          mediumForm: {
            name: 'detailed_standard',
            priorityAdjustments: {
              critical: 1.0,
              high: 1.0,
              medium: 0.9,
              low: 0.7,
              optional: 0.5
            },
            durationAdjustments: {
              intro: 1.0,
              problem_statement: 1.0,
              solution_overview: 1.0,
              code_changes: 1.0,
              technical_details: 1.0,
              review_process: 1.0,
              collaboration: 1.0,
              timeline: 1.0,
              impact_assessment: 1.0,
              summary: 1.0,
              call_to_action: 1.0
            } as Record<ScriptSectionType, number>,
            contentModifications: []
          },
          longForm: {
            name: 'detailed_expanded',
            priorityAdjustments: {
              critical: 1.0,
              high: 1.2,
              medium: 1.1,
              low: 1.0,
              optional: 0.8
            },
            durationAdjustments: {
              intro: 1.1,
              problem_statement: 1.3,
              solution_overview: 1.2,
              code_changes: 1.3,
              technical_details: 1.4,
              file_analysis: 1.3,
              review_process: 1.2,
              collaboration: 1.2,
              timeline: 1.1,
              key_insights: 1.3,
              impact_assessment: 1.1,
              summary: 1.0,
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
                  type: 'add_definition',
                  parameters: { 
                    trigger_complexity: 0.7,
                    definition_style: 'contextual'
                  }
                }
              ]
            }
          ],
          technicalDepth: [
            {
              audienceLevel: 'intermediate',
              adjustments: [
                {
                  contentType: 'code_samples',
                  detailLevel: 'detailed',
                  includeCode: true
                },
                {
                  contentType: 'technical_details',
                  detailLevel: 'comprehensive',
                  includeCode: true
                }
              ]
            },
            {
              audienceLevel: 'advanced',
              adjustments: [
                {
                  contentType: 'code_samples',
                  detailLevel: 'comprehensive',
                  includeCode: true
                },
                {
                  contentType: 'technical_details',
                  detailLevel: 'comprehensive',
                  includeCode: true
                }
              ]
            }
          ],
          emphasisAdjustments: [
            {
              audience: 'engineering',
              adjustments: [
                {
                  aspect: 'technical_achievement',
                  weight: 0.8
                },
                {
                  aspect: 'quality',
                  weight: 0.7
                },
                {
                  aspect: 'innovation',
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
                  aspect: 'collaboration',
                  weight: 0.6
                },
                {
                  aspect: 'efficiency',
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
              contentType: 'discussion_threads',
              targetLength: 100,
              strategy: 'key_points'
            }
          ],
          expansion: [
            {
              contentType: 'technical_details',
              triggers: [
                {
                  type: 'audience_type',
                  parameters: { audience: 'engineering' },
                  operator: 'equals'
                }
              ],
              strategy: 'add_details'
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
                maxExamples: 5,
                prioritization: ['complexity', 'impact', 'novelty'],
                filtering: [
                  {
                    fileTypes: ['.js', '.ts', '.py', '.java', '.cpp'],
                    sizeConstraints: { minLines: 5, maxLines: 50 },
                    contentFilters: ['test', 'example']
                  }
                ]
              },
              presentation: {
                syntaxHighlighting: true,
                lineNumbers: true,
                contextLines: 3,
                annotations: 'highlights'
              }
            }
          ],
          jargonExplanation: [
            {
              detection: {
                dictionary: ['merge conflict', 'rebase', 'squash', 'cherry-pick'],
                complexityScoring: true,
                contextAnalysis: true
              },
              explanation: {
                style: 'inline',
                depth: 'moderate',
                useAnalogies: true
              }
            }
          ],
          conceptIntroduction: [
            {
              identification: {
                complexityThreshold: 0.6,
                familiarityScoring: true,
                prerequisiteAnalysis: true
              },
              introduction: {
                timing: 'progressive',
                depth: 'foundational',
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
      primary: ['engineering', 'product', 'qa'],
      secondary: ['design', 'executive'],
      unsuitable: ['marketing'],
      scoring: {
        criteria: [
          {
            name: 'technical_depth_match',
            evaluation: (audience: ScriptAudience) => {
              const depthScores = {
                engineering: 0.9,
                product: 0.7,
                qa: 0.8,
                design: 0.5,
                executive: 0.3,
                general: 0.4
              };
              return depthScores[audience.primary] || 0.5;
            },
            weight: 0.4
          },
          {
            name: 'process_interest',
            evaluation: (audience: ScriptAudience) => {
              const processScores = {
                engineering: 0.8,
                product: 0.9,
                qa: 0.9,
                design: 0.6,
                executive: 0.5,
                general: 0.4
              };
              return processScores[audience.primary] || 0.5;
            },
            weight: 0.3
          },
          {
            name: 'time_investment',
            evaluation: (audience: ScriptAudience) => {
              const timeScores = {
                engineering: 0.8,
                product: 0.7,
                qa: 0.8,
                design: 0.6,
                executive: 0.3,
                general: 0.5
              };
              return timeScores[audience.primary] || 0.5;
            },
            weight: 0.3
          }
        ],
        weights: {
          technical_depth_match: 0.4,
          process_interest: 0.3,
          time_investment: 0.3
        },
        threshold: 0.6
      }
    };
  }
}