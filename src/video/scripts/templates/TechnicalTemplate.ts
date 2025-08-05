/**
 * Technical video template for in-depth 8-12 minute engineering-focused PR analysis
 * Optimized for technical teams requiring comprehensive code review and implementation details
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
 * Technical template for comprehensive engineering-focused PR video generation
 * Target duration: 8-12 minutes
 * Focus: Deep technical analysis, code quality, architecture, and implementation patterns
 */
export class TechnicalTemplate implements ScriptTemplate {
  readonly id = 'technical_template_v1';
  readonly name = 'PR Technical Deep Dive';
  readonly description = 'Comprehensive 8-12 minute technical analysis for engineering teams';
  readonly type: TemplateType = 'technical';

  readonly durationRange = {
    min: 480,  // 8 minutes
    max: 720,  // 12 minutes
    default: 600 // 10 minutes
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
   * Create required sections for technical template
   */
  private createRequiredSections(): SectionDefinition[] {
    return [
      {
        type: 'intro',
        name: 'Technical Introduction',
        duration: {
          min: 10,
          max: 20,
          preferred: 15,
          percentage: 2.5
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
            maximum: 8
          }
        ],
        visualRequirements: [
          {
            type: 'technical_header',
            required: true,
            properties: {
              style: 'code_themed',
              elements: ['repository', 'branch_info', 'pr_stats'],
              show_tech_stack: true
            }
          },
          {
            type: 'complexity_metrics',
            required: true,
            properties: {
              metrics: ['cyclomatic_complexity', 'maintainability_index', 'tech_debt'],
              style: 'dashboard'
            }
          }
        ],
        priority: 'critical'
      },
      {
        type: 'technical_details',
        name: 'Architecture & Design',
        duration: {
          min: 60,
          max: 120,
          preferred: 80,
          percentage: 13,
          dynamic: {
            base: 40,
            perItem: 12,
            maxScale: 2.5,
            countingCriteria: {
              countType: 'code_samples',
              filters: [
                {
                  name: 'significant_code_changes',
                  criteria: {
                    field: 'complexity',
                    operator: 'greater_than',
                    value: 'medium'
                  },
                  action: 'include'
                }
              ],
              weights: { high: 1.5, medium: 1.0, low: 0.5 }
            }
          }
        },
        contentRequirements: [
          {
            type: 'code_samples',
            required: true,
            minimum: 3,
            maximum: 15,
            criteria: {
              importanceThreshold: 0.4,
              relevanceScoring: {
                factors: ['change_magnitude', 'file_importance', 'review_feedback'],
                algorithm: 'weighted_sum',
                normalization: 'min_max'
              },
              freshnessWeight: 0.2,
              audienceAlignmentWeight: 0.6
            }
          },
          {
            type: 'file_changes',
            required: true,
            minimum: 5,
            maximum: 25
          }
        ],
        visualRequirements: [
          {
            type: 'architecture_diagram',
            required: true,
            properties: {
              style: 'layered_architecture',
              show_changes: true,
              highlight_affected_components: true
            }
          },
          {
            type: 'code_diff_detailed',
            required: true,
            properties: {
              style: 'side_by_side',
              syntax_highlighting: true,
              show_line_numbers: true,
              highlight_key_changes: true,
              max_files: 10
            }
          },
          {
            type: 'dependency_graph',
            required: false,
            properties: {
              style: 'force_directed',
              show_change_impact: true
            }
          }
        ],
        priority: 'critical'
      },
      {
        type: 'code_changes',
        name: 'Implementation Analysis',
        duration: {
          min: 80,
          max: 150,
          preferred: 100,
          percentage: 17,
          dynamic: {
            base: 50,
            perItem: 8,
            maxScale: 3.0,
            countingCriteria: {
              countType: 'commit_data',
              filters: [
                {
                  name: 'substantial_commits',
                  criteria: {
                    field: 'changes',
                    operator: 'greater_than',
                    value: 50
                  },
                  action: 'include'
                }
              ],
              weights: { major: 1.5, minor: 1.0, patch: 0.7 }
            }
          }
        },
        contentRequirements: [
          {
            type: 'commit_data',
            required: true,
            minimum: 3,
            maximum: 20
          },
          {
            type: 'file_changes',
            required: true,
            minimum: 5,
            maximum: 30
          },
          {
            type: 'code_samples',
            required: true,
            minimum: 5,
            maximum: 20
          }
        ],
        visualRequirements: [
          {
            type: 'commit_graph',
            required: true,
            properties: {
              style: 'detailed_tree',
              show_diffs: true,
              show_stats: true,
              color_code_by_type: true
            }
          },
          {
            type: 'code_quality_metrics',
            required: true,
            properties: {
              metrics: ['complexity', 'duplication', 'coverage', 'maintainability'],
              show_trends: true,
              highlight_improvements: true
            }
          },
          {
            type: 'code_annotation',
            required: true,
            properties: {
              style: 'inline_comments',
              annotation_types: ['pattern_explanation', 'complexity_notes', 'trade_offs']
            }
          }
        ],
        priority: 'critical'
      },
      {
        type: 'file_analysis',
        name: 'File Structure & Impact',
        duration: {
          min: 40,
          max: 80,
          preferred: 55,
          percentage: 9
        },
        contentRequirements: [
          {
            type: 'file_changes',
            required: true,
            minimum: 3,
            maximum: 25
          }
        ],
        visualRequirements: [
          {
            type: 'file_impact_analysis',
            required: true,
            properties: {
              style: 'impact_matrix',
              dimensions: ['complexity', 'coupling', 'change_frequency'],
              color_coding: 'risk_based'
            }
          },
          {
            type: 'module_dependency_map',
            required: true,
            properties: {
              style: 'hierarchical_graph',
              show_coupling_strength: true,
              highlight_changes: true
            }
          },
          {
            type: 'file_diff_summary',
            required: true,
            properties: {
              group_by: 'module',
              show_statistics: true,
              highlight_hotspots: true
            }
          }
        ],
        priority: 'high'
      },
      {
        type: 'review_process',
        name: 'Technical Review Analysis',
        duration: {
          min: 50,
          max: 100,
          preferred: 70,
          percentage: 12
        },
        contentRequirements: [
          {
            type: 'review_data',
            required: true,
            minimum: 1,
            maximum: 12
          },
          {
            type: 'discussion_threads',
            required: false,
            maximum: 10,
            criteria: {
              importanceThreshold: 0.5,
              relevanceScoring: {
                factors: ['discussion_activity', 'review_feedback', 'participant_involvement'],
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
            type: 'review_analysis_dashboard',
            required: true,
            properties: {
              sections: ['feedback_categorization', 'reviewer_expertise', 'discussion_heatmap'],
              show_resolution_status: true
            }
          },
          {
            type: 'code_review_annotations',
            required: true,
            properties: {
              style: 'threaded_comments',
              show_reviewer_context: true,
              highlight_critical_feedback: true
            }
          },
          {
            type: 'feedback_classification',
            required: true,
            properties: {
              categories: ['bugs', 'performance', 'maintainability', 'style', 'architecture'],
              show_resolution_status: true
            }
          }
        ],
        priority: 'high'
      },
      {
        type: 'collaboration',
        name: 'Engineering Collaboration',
        duration: {
          min: 30,
          max: 60,
          preferred: 40,
          percentage: 7
        },
        contentRequirements: [
          {
            type: 'participant_data',
            required: true,
            minimum: 2,
            maximum: 12
          },
          {
            type: 'review_data',
            required: false,
            maximum: 8
          }
        ],
        visualRequirements: [
          {
            type: 'collaboration_metrics',
            required: true,
            properties: {
              metrics: ['code_ownership', 'review_participation', 'knowledge_sharing'],
              style: 'network_analysis'
            }
          },
          {
            type: 'expertise_mapping',
            required: true,
            properties: {
              show_domain_expertise: true,
              highlight_knowledge_transfer: true
            }
          }
        ],
        priority: 'medium'
      },
      {
        type: 'timeline',
        name: 'Development Flow',
        duration: {
          min: 35,
          max: 70,
          preferred: 50,
          percentage: 8
        },
        contentRequirements: [
          {
            type: 'timeline_events',
            required: true,
            minimum: 5,
            maximum: 20
          },
          {
            type: 'commit_data',
            required: true,
            minimum: 3,
            maximum: 15
          }
        ],
        visualRequirements: [
          {
            type: 'development_timeline',
            required: true,
            properties: {
              style: 'swimlane_diagram',
              show_parallel_work: true,
              highlight_bottlenecks: true,
              include_review_cycles: true
            }
          },
          {
            type: 'velocity_analysis',
            required: false,
            properties: {
              metrics: ['commit_frequency', 'review_turnaround', 'issue_resolution'],
              show_trends: true
            }
          }
        ],
        priority: 'medium'
      },
      {
        type: 'impact_assessment',
        name: 'Technical Impact & Quality',
        duration: {
          min: 45,
          max: 90,
          preferred: 60,
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
            maximum: 15
          }
        ],
        visualRequirements: [
          {
            type: 'technical_impact_matrix',
            required: true,
            properties: {
              dimensions: ['performance', 'maintainability', 'scalability', 'security'],
              show_before_after: true,
              risk_assessment: true
            }
          },
          {
            type: 'quality_metrics_dashboard',
            required: true,
            properties: {
              metrics: ['test_coverage', 'code_quality', 'performance_impact', 'security_score'],
              show_trends: true,
              benchmark_comparison: true
            }
          }
        ],
        priority: 'critical'
      },
      {
        type: 'key_insights',
        name: 'Technical Insights & Patterns',
        duration: {
          min: 40,
          max: 80,
          preferred: 55,
          percentage: 9
        },
        contentRequirements: [
          {
            type: 'code_samples',
            required: true,
            minimum: 2,
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
            type: 'pattern_analysis',
            required: true,
            properties: {
              patterns: ['design_patterns', 'anti_patterns', 'best_practices'],
              show_examples: true,
              highlight_innovations: true
            }
          },
          {
            type: 'learning_highlights',
            required: true,
            properties: {
              categories: ['technical_debt_reduction', 'performance_optimizations', 'architectural_improvements'],
              show_impact: true
            }
          }
        ],
        priority: 'high'
      },
      {
        type: 'summary',
        name: 'Technical Summary',
        duration: {
          min: 25,
          max: 50,
          preferred: 35,
          percentage: 6
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
            minimum: 3,
            maximum: 8
          }
        ],
        visualRequirements: [
          {
            type: 'technical_summary_dashboard',
            required: true,
            properties: {
              sections: ['key_achievements', 'quality_improvements', 'risk_mitigation'],
              style: 'executive_summary'
            }
          }
        ],
        priority: 'high'
      },
      {
        type: 'call_to_action',
        name: 'Technical Follow-up',
        duration: {
          min: 20,
          max: 40,
          preferred: 25,
          percentage: 4
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
            type: 'technical_action_items',
            required: true,
            properties: {
              categories: ['monitoring', 'follow_up_optimizations', 'knowledge_sharing'],
              prioritize_by_impact: true
            }
          }
        ],
        priority: 'medium'
      }
    ];
  }

  /**
   * Create optional sections for technical template
   */
  private createOptionalSections(): SectionDefinition[] {
    return [
      {
        type: 'problem_statement',
        name: 'Technical Problem Context',
        duration: {
          min: 30,
          max: 60,
          preferred: 40,
          percentage: 7
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
            maximum: 5
          }
        ],
        visualRequirements: [
          {
            type: 'problem_diagram',
            required: true,
            properties: {
              style: 'technical_flowchart',
              show_pain_points: true,
              highlight_constraints: true
            }
          }
        ],
        priority: 'medium',
        conditions: [
          {
            type: 'content_volume',
            parameters: { min_discussion_threads: 3 },
            operator: 'greater_than'
          }
        ]
      },
      {
        type: 'solution_overview',
        name: 'Technical Solution Design',
        duration: {
          min: 40,
          max: 80,
          preferred: 55,
          percentage: 9
        },
        contentRequirements: [
          {
            type: 'pr_overview',
            required: true,
            minimum: 1
          },
          {
            type: 'code_samples',
            required: true,
            minimum: 2,
            maximum: 8
          }
        ],
        visualRequirements: [
          {
            type: 'solution_architecture',
            required: true,
            properties: {
              style: 'technical_blueprint',
              show_design_decisions: true,
              highlight_trade_offs: true
            }
          },
          {
            type: 'design_rationale',
            required: true,
            properties: {
              show_alternatives_considered: true,
              highlight_decision_factors: true
            }
          }
        ],
        priority: 'medium',
        conditions: [
          {
            type: 'content_volume',
            parameters: { min_code_samples: 5 },
            operator: 'greater_than'
          },
          {
            type: 'duration_constraint',
            parameters: { min_total_duration: 540 },
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
        before: 'intro',
        after: 'problem_statement',
        priority: 95,
        conditions: [
          {
            type: 'data_availability',
            parameters: { section_type: 'problem_statement' },
            operator: 'exists'
          }
        ]
      },
      {
        before: 'intro',
        after: 'technical_details',
        priority: 100
      },
      {
        before: 'problem_statement',
        after: 'solution_overview',
        priority: 90,
        conditions: [
          {
            type: 'data_availability',
            parameters: { section_type: 'solution_overview' },
            operator: 'exists'
          }
        ]
      },
      {
        before: 'solution_overview',
        after: 'technical_details',
        priority: 85
      },
      {
        before: 'technical_details',
        after: 'code_changes',
        priority: 95
      },
      {
        before: 'code_changes',
        after: 'file_analysis',
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
        after: 'impact_assessment',
        priority: 85
      },
      {
        before: 'impact_assessment',
        after: 'key_insights',
        priority: 80
      },
      {
        before: 'key_insights',
        after: 'summary',
        priority: 85
      },
      {
        before: 'summary',
        after: 'call_to_action',
        priority: 90
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
        style: 'zoom',
        duration: 0.8
      },
      {
        from: 'intro',
        to: 'technical_details',
        style: 'slide',
        duration: 0.7
      },
      {
        from: 'problem_statement',
        to: 'solution_overview',
        style: 'fade',
        duration: 1.0
      },
      {
        from: 'solution_overview',
        to: 'technical_details',
        style: 'zoom',
        duration: 0.6
      },
      {
        from: 'technical_details',
        to: 'code_changes',
        style: 'slide',
        duration: 0.5
      },
      {
        from: 'code_changes',
        to: 'file_analysis',
        style: 'smooth',
        duration: 0.6
      },
      {
        from: 'file_analysis',
        to: 'review_process',
        style: 'fade',
        duration: 0.7
      },
      {
        from: 'review_process',
        to: 'collaboration',
        style: 'slide',
        duration: 0.6
      },
      {
        from: 'collaboration',
        to: 'timeline',
        style: 'zoom',
        duration: 0.7
      },
      {
        from: 'timeline',
        to: 'impact_assessment',
        style: 'fade',
        duration: 0.8
      },
      {
        from: 'impact_assessment',
        to: 'key_insights',
        style: 'smooth',
        duration: 0.5
      },
      {
        from: 'key_insights',
        to: 'summary',
        style: 'fade',
        duration: 0.8
      },
      {
        from: 'summary',
        to: 'call_to_action',
        style: 'smooth',
        duration: 0.6
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
        secondary: ['qa'],
        technicalLevel: 'advanced',
        projectFamiliarity: 'expert',
        communicationStyle: 'technical'
      },
      style: {
        tone: 'educational',
        pacing: 'slow',
        approach: 'analytical',
        complexity: 'technical',
        emphasis: 'metrics_focused'
      },
      contentSelection: {
        name: 'technical_comprehensive',
        criteria: {
          importanceThreshold: 0.2,
          relevanceScoring: {
            factors: [
              'change_magnitude',
              'file_importance',
              'review_feedback',
              'discussion_activity',
              'timeline_significance',
              'participant_involvement'
            ],
            algorithm: 'weighted_sum',
            normalization: 'min_max'
          },
          freshnessWeight: 0.2,
          audienceAlignmentWeight: 0.6
        },
        prioritization: [
          {
            name: 'code_complexity_prioritization',
            contentTypes: ['code_samples', 'file_changes'],
            scoringFunction: (content: any) => content.complexity_score || 0.5,
            weight: 0.6
          },
          {
            name: 'technical_discussion_prioritization',
            contentTypes: ['review_data', 'discussion_threads'],
            scoringFunction: (content: any) => content.technical_depth_score || 0.5,
            weight: 0.4
          }
        ],
        filtering: [
          {
            name: 'include_all_technical_content',
            criteria: {
              field: 'type',
              operator: 'contains',
              value: 'technical'
            },
            action: 'boost'
          }
        ],
        adaptation: [
          {
            name: 'maximize_technical_detail',
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
                parameters: { 
                  technical_depth: 'comprehensive',
                  include_implementation_details: true
                }
              }
            ]
          }
        ]
      },
      adaptations: {
        duration: {
          shortForm: {
            name: 'technical_focused',
            priorityAdjustments: {
              critical: 1.0,
              high: 0.9,
              medium: 0.7,
              low: 0.5,
              optional: 0.3
            },
            durationAdjustments: {
              intro: 0.8,
              technical_details: 0.9,
              code_changes: 1.0,
              file_analysis: 0.8,
              review_process: 0.9,
              collaboration: 0.6,
              timeline: 0.7,
              impact_assessment: 0.9,
              key_insights: 1.0,
              summary: 0.8,
              call_to_action: 0.7
            } as Record<ScriptSectionType, number>,
            contentModifications: []
          },
          mediumForm: {
            name: 'technical_standard',
            priorityAdjustments: {
              critical: 1.0,
              high: 1.0,
              medium: 0.9,
              low: 0.8,
              optional: 0.6
            },
            durationAdjustments: {
              intro: 1.0,
              problem_statement: 1.0,
              solution_overview: 1.0,
              technical_details: 1.0,
              code_changes: 1.0,
              file_analysis: 1.0,
              review_process: 1.0,
              collaboration: 1.0,
              timeline: 1.0,
              impact_assessment: 1.0,
              key_insights: 1.0,
              summary: 1.0,
              call_to_action: 1.0
            } as Record<ScriptSectionType, number>,
            contentModifications: []
          },
          longForm: {
            name: 'technical_comprehensive',
            priorityAdjustments: {
              critical: 1.0,
              high: 1.2,
              medium: 1.1,
              low: 1.0,
              optional: 0.9
            },
            durationAdjustments: {
              intro: 1.1,
              problem_statement: 1.3,
              solution_overview: 1.4,
              technical_details: 1.3,
              code_changes: 1.2,
              file_analysis: 1.2,
              review_process: 1.1,
              collaboration: 1.1,
              timeline: 1.0,
              impact_assessment: 1.1,
              key_insights: 1.3,
              summary: 1.0,
              call_to_action: 1.0
            } as Record<ScriptSectionType, number>,
            contentModifications: []
          },
          cuttingPriorities: ['optional', 'low', 'medium', 'high', 'critical']
        },
        audience: {
          languageSimplification: [], // No simplification for technical audience
          technicalDepth: [
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
            },
            {
              audienceLevel: 'expert',
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
                  weight: 0.9
                },
                {
                  aspect: 'innovation',
                  weight: 0.8
                },
                {
                  aspect: 'quality',
                  weight: 0.8
                },
                {
                  aspect: 'efficiency',
                  weight: 0.6
                }
              ]
            }
          ]
        },
        content: {
          transformations: [],
          summarization: [], // Minimal summarization for technical content
          expansion: [
            {
              contentType: 'code_samples',
              triggers: [
                {
                  type: 'audience_type',
                  parameters: { audience: 'engineering' },
                  operator: 'equals'
                }
              ],
              strategy: 'add_details'
            },
            {
              contentType: 'technical_details',
              triggers: [
                {
                  type: 'audience_type',
                  parameters: { audience: 'engineering' },
                  operator: 'equals'
                }
              ],
              strategy: 'add_context'
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
                maxExamples: 15,
                prioritization: ['complexity', 'novelty', 'impact', 'clarity'],
                filtering: [
                  {
                    fileTypes: ['.js', '.ts', '.py', '.java', '.cpp', '.rs', '.go'],
                    sizeConstraints: { minLines: 3, maxLines: 100 },
                    contentFilters: []
                  }
                ]
              },
              presentation: {
                syntaxHighlighting: true,
                lineNumbers: true,
                contextLines: 5,
                annotations: 'callouts'
              }
            }
          ],
          jargonExplanation: [
            {
              detection: {
                dictionary: ['design_patterns', 'algorithms', 'data_structures'],
                complexityScoring: true,
                contextAnalysis: true
              },
              explanation: {
                style: 'tooltip',
                depth: 'comprehensive',
                useAnalogies: false
              }
            }
          ],
          conceptIntroduction: [
            {
              identification: {
                complexityThreshold: 0.4,
                familiarityScoring: true,
                prerequisiteAnalysis: true
              },
              introduction: {
                timing: 'upfront',
                depth: 'comprehensive',
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
      primary: ['engineering'],
      secondary: ['qa'],
      unsuitable: ['executive', 'marketing', 'general'],
      scoring: {
        criteria: [
          {
            name: 'technical_expertise_match',
            evaluation: (audience: ScriptAudience) => {
              const expertiseScores = {
                engineering: 1.0,
                qa: 0.7,
                product: 0.3,
                design: 0.2,
                executive: 0.1,
                general: 0.1
              };
              return expertiseScores[audience.primary] || 0.1;
            },
            weight: 0.5
          },
          {
            name: 'time_investment_willingness',
            evaluation: (audience: ScriptAudience) => {
              const timeScores = {
                engineering: 0.9,
                qa: 0.8,
                product: 0.4,
                design: 0.3,
                executive: 0.1,
                general: 0.2
              };
              return timeScores[audience.primary] || 0.2;
            },
            weight: 0.3
          },
          {
            name: 'detail_appreciation',
            evaluation: (audience: ScriptAudience) => {
              const detailScores = {
                engineering: 1.0,
                qa: 0.9,
                product: 0.5,
                design: 0.4,
                executive: 0.2,
                general: 0.3
              };
              return detailScores[audience.primary] || 0.3;
            },
            weight: 0.2
          }
        ],
        weights: {
          technical_expertise_match: 0.5,
          time_investment_willingness: 0.3,
          detail_appreciation: 0.2
        },
        threshold: 0.7
      }
    };
  }
}