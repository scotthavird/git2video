/**
 * Example implementation showing how to use the script generation system
 * Demonstrates integration with GitHub PR data and video metadata
 */

import { ScriptGenerator, ScriptUtils, type ScriptGenerationConfig } from './index';
import { PRVideoTransformer, type VideoMetadata } from '../../github/transformer';
import { type PRVideoData } from '../../github/types';

/**
 * Example usage of the script generation system
 */
export class ScriptGenerationExample {
  private scriptGenerator: ScriptGenerator;
  private transformer: PRVideoTransformer;

  constructor() {
    this.scriptGenerator = new ScriptGenerator();
    this.transformer = new PRVideoTransformer();
  }

  /**
   * Generate a summary video script for product managers
   */
  async generateProductSummary(prData: PRVideoData): Promise<void> {
    console.log('=== Generating Product Summary Script ===');

    // Transform PR data to video metadata
    const videoMetadata = this.transformer.transform(prData, 'summary');
    
    // Create product-focused configuration
    const config: ScriptGenerationConfig = {
      templateType: 'summary',
      targetDuration: 180, // 3 minutes
      audience: {
        primary: 'product',
        secondary: ['executive'],
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

    // Generate script
    const result = await this.scriptGenerator.generateScript(videoMetadata, config);
    
    if (result.success) {
      console.log(`✅ Script generated successfully in ${result.performance.generationTime}ms`);
      console.log(`📊 Quality score: ${(result.script.metadata.quality.overall * 100).toFixed(1)}%`);
      console.log(`⏱️  Total duration: ${result.script.sections.reduce((sum, s) => sum + s.duration, 0)}s`);
      console.log(`📝 Sections: ${result.script.sections.length}`);
      
      // Print script outline
      console.log('\n📋 Script Outline:');
      result.script.sections.forEach((section, index) => {
        console.log(`  ${index + 1}. ${section.title} (${section.duration}s) - ${section.priority}`);
      });

      // Print warnings if any
      if (result.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        result.warnings.forEach(warning => console.log(`  - ${warning}`));
      }

      // Print suggestions
      if (result.alternatives && result.alternatives.length > 0) {
        console.log('\n💡 Suggestions:');
        result.alternatives.forEach(suggestion => {
          console.log(`  - ${suggestion.description}`);
        });
      }
    } else {
      console.error('❌ Script generation failed:', result.errors);
    }
  }

  /**
   * Generate a technical deep dive for engineering teams
   */
  async generateTechnicalDeepDive(prData: PRVideoData): Promise<void> {
    console.log('\n=== Generating Technical Deep Dive Script ===');

    // Transform PR data with technical focus
    const videoMetadata = this.transformer.transform(prData, 'technical');
    
    // Create engineering-focused configuration
    const config = ScriptUtils.createEngineeringConfig(600, 'advanced'); // 10 minutes, advanced level
    
    // Enhance with custom adaptations
    config.adaptations = {
      duration: {
        shortForm: {
          name: 'technical_compressed',
          priorityAdjustments: {
            critical: 1.0,
            high: 0.9,
            medium: 0.7,
            low: 0.5,
            optional: 0.3
          },
          durationAdjustments: {
            intro: 0.8,
            technical_details: 1.0,
            code_changes: 1.0,
            review_process: 0.9,
            summary: 0.8
          } as any,
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
          durationAdjustments: {} as any,
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
          durationAdjustments: {} as any,
          contentModifications: []
        },
        cuttingPriorities: ['optional', 'low', 'medium', 'high', 'critical']
      },
      audience: {
        languageSimplification: [],
        technicalDepth: [
          {
            audienceLevel: 'advanced',
            adjustments: [
              {
                contentType: 'code_samples',
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
              { aspect: 'technical_achievement', weight: 0.9 },
              { aspect: 'innovation', weight: 0.8 }
            ]
          }
        ]
      },
      content: {
        transformations: [],
        summarization: [],
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
              maxExamples: 10,
              prioritization: ['complexity', 'novelty', 'impact'],
              filtering: [
                {
                  fileTypes: ['.js', '.ts', '.py', '.java'],
                  sizeConstraints: { minLines: 5, maxLines: 50 },
                  contentFilters: []
                }
              ]
            },
            presentation: {
              syntaxHighlighting: true,
              lineNumbers: true,
              contextLines: 3,
              annotations: 'callouts'
            }
          }
        ],
        jargonExplanation: [],
        conceptIntroduction: []
      }
    };

    // Generate script
    const result = await this.scriptGenerator.generateScript(videoMetadata, config);
    
    if (result.success) {
      console.log(`✅ Technical script generated in ${result.performance.generationTime}ms`);
      console.log(`🔧 Template: ${result.script.metadata.templateType}`);
      console.log(`👨‍💻 Audience: ${result.script.audience.primary} (${result.script.audience.technicalLevel})`);
      console.log(`⏱️  Duration: ${result.script.sections.reduce((sum, s) => sum + s.duration, 0)}s`);
      
      // Print detailed breakdown
      console.log('\n🔍 Technical Sections:');
      result.script.sections.forEach(section => {
        const visualCueCount = section.visualCues.length;
        console.log(`  📋 ${section.title}`);
        console.log(`     Duration: ${section.duration}s | Priority: ${section.priority} | Visuals: ${visualCueCount}`);
        
        if (section.type === 'code_changes' || section.type === 'technical_details') {
          console.log(`     Content preview: ${section.content.substring(0, 100)}...`);
        }
      });

      // Show quality breakdown
      const quality = result.script.metadata.quality;
      console.log('\n📊 Quality Metrics:');
      console.log(`  Overall: ${(quality.overall * 100).toFixed(1)}%`);
      console.log(`  Coherence: ${(quality.coherence * 100).toFixed(1)}%`);
      console.log(`  Engagement: ${(quality.engagement * 100).toFixed(1)}%`);
      console.log(`  Technical Accuracy: ${(quality.accuracy * 100).toFixed(1)}%`);
      console.log(`  Duration Compliance: ${(quality.durationCompliance * 100).toFixed(1)}%`);
    } else {
      console.error('❌ Technical script generation failed:', result.errors);
    }
  }

  /**
   * Generate an executive summary for leadership
   */
  async generateExecutiveBrief(prData: PRVideoData): Promise<void> {
    console.log('\n=== Generating Executive Brief Script ===');

    // Transform PR data for executive audience
    const videoMetadata = this.transformer.transform(prData, 'summary');
    
    // Create executive-focused configuration
    const config = ScriptUtils.createExecutiveConfig(90); // 1.5 minutes
    
    // Generate script
    const result = await this.scriptGenerator.generateScript(videoMetadata, config);
    
    if (result.success) {
      console.log(`✅ Executive brief generated in ${result.performance.generationTime}ms`);
      console.log(`👔 Optimized for: ${result.script.audience.primary} audience`);
      console.log(`⚡ Quick duration: ${result.script.sections.reduce((sum, s) => sum + s.duration, 0)}s`);
      
      // Show executive-focused content
      console.log('\n📈 Executive Summary Sections:');
      result.script.sections.forEach(section => {
        console.log(`  ${section.title} (${section.duration}s)`);
        console.log(`    Focus: ${section.type} | Priority: ${section.priority}`);
        
        if (section.type === 'impact_assessment' || section.type === 'key_insights') {
          console.log(`    Key points: ${section.content.substring(0, 120)}...`);
        }
      });

      // Show business impact focus
      const impactSections = result.script.sections.filter(s => 
        s.type === 'impact_assessment' || s.type === 'key_insights'
      );
      console.log(`\n💼 Business Impact Focus: ${impactSections.length} sections`);
    } else {
      console.error('❌ Executive brief generation failed:', result.errors);
    }
  }

  /**
   * Compare different template approaches for the same PR
   */
  async compareTemplateApproaches(prData: PRVideoData): Promise<void> {
    console.log('\n=== Comparing Template Approaches ===');

    const videoMetadata = this.transformer.transform(prData, 'detailed');
    const baseAudience = {
      primary: 'product' as const,
      technicalLevel: 'intermediate' as const,
      projectFamiliarity: 'basic' as const,
      communicationStyle: 'conversational' as const
    };

    const templateConfigs = [
      { type: 'summary' as const, duration: 180 },
      { type: 'detailed' as const, duration: 360 },
      { type: 'technical' as const, duration: 600 }
    ];

    console.log('Generating scripts with different templates...\n');

    for (const { type, duration } of templateConfigs) {
      const config: ScriptGenerationConfig = {
        templateType: type,
        targetDuration: duration,
        audience: baseAudience,
        style: {
          tone: 'professional',
          pacing: 'moderate',
          approach: 'problem_solution',
          complexity: 'moderate',
          emphasis: 'impact_focused'
        }
      };

      const result = await this.scriptGenerator.generateScript(videoMetadata, config);
      
      if (result.success) {
        const totalDuration = result.script.sections.reduce((sum, s) => sum + s.duration, 0);
        const quality = result.script.metadata.quality.overall;
        
        console.log(`📋 ${type.toUpperCase()} Template:`);
        console.log(`   Target: ${duration}s | Actual: ${totalDuration}s | Quality: ${(quality * 100).toFixed(1)}%`);
        console.log(`   Sections: ${result.script.sections.length} | Warnings: ${result.warnings.length}`);
        console.log(`   Generation time: ${result.performance.generationTime}ms`);
        
        // Show section breakdown
        const sectionTypes = result.script.sections.map(s => s.type);
        console.log(`   Section types: ${sectionTypes.join(', ')}`);
        console.log('');
      } else {
        console.log(`❌ ${type.toUpperCase()} Template failed: ${result.errors.join(', ')}\n`);
      }
    }
  }

  /**
   * Demonstrate custom template creation
   */
  async demonstrateCustomTemplate(prData: PRVideoData): Promise<void> {
    console.log('\n=== Custom Template Demo ===');

    // This would show how to create a custom template
    // For now, we'll just show the concept
    console.log('Custom templates can be created by implementing the ScriptTemplate interface');
    console.log('Available templates:', this.scriptGenerator.getAvailableTemplates());
    
    const summaryTemplate = this.scriptGenerator.getTemplate('summary');
    if (summaryTemplate) {
      console.log(`Summary template duration range: ${summaryTemplate.durationRange.min}-${summaryTemplate.durationRange.max}s`);
      console.log(`Required sections: ${summaryTemplate.structure.required.length}`);
      console.log(`Optional sections: ${summaryTemplate.structure.optional.length}`);
    }
  }

  /**
   * Show configuration validation
   */
  demonstrateConfigValidation(): void {
    console.log('\n=== Configuration Validation Demo ===');

    const validConfigs = [
      ScriptUtils.createBasicConfig('summary', 180, 'general'),
      ScriptUtils.createEngineeringConfig(600, 'advanced'),
      ScriptUtils.createExecutiveConfig(90)
    ];

    const invalidConfigs = [
      ScriptUtils.createBasicConfig('summary', 30, 'general'), // Too short
      ScriptUtils.createBasicConfig('technical', 180, 'executive'), // Mismatch
      { ...ScriptUtils.createBasicConfig(), targetDuration: 1500 } // Too long
    ];

    console.log('✅ Valid Configurations:');
    validConfigs.forEach((config, index) => {
      const validation = ScriptUtils.validateConfig(config);
      console.log(`  ${index + 1}. ${config.templateType} for ${config.audience.primary}: ${validation.isValid ? '✓' : '✗'}`);
    });

    console.log('\n❌ Invalid Configurations:');
    invalidConfigs.forEach((config, index) => {
      const validation = ScriptUtils.validateConfig(config);
      console.log(`  ${index + 1}. ${config.templateType} for ${config.audience.primary}: ${validation.isValid ? '✓' : '✗'}`);
      if (!validation.isValid) {
        validation.errors.forEach(error => console.log(`     - ${error}`));
      }
    });
  }
}

/**
 * Example function to run all demonstrations
 */
export async function runScriptGenerationExamples(prData: PRVideoData): Promise<void> {
  console.log('🎬 Script Generation System Demo');
  console.log('=================================\n');

  const example = new ScriptGenerationExample();

  try {
    // Generate different types of scripts
    await example.generateProductSummary(prData);
    await example.generateTechnicalDeepDive(prData);
    await example.generateExecutiveBrief(prData);

    // Compare approaches
    await example.compareTemplateApproaches(prData);

    // Show system capabilities
    await example.demonstrateCustomTemplate(prData);
    example.demonstrateConfigValidation();

    console.log('\n✅ All script generation examples completed successfully!');
    console.log('\n📚 Key Features Demonstrated:');
    console.log('  - Multi-template system (Summary, Detailed, Technical)');
    console.log('  - Audience-specific adaptations');
    console.log('  - Dynamic content selection and prioritization');
    console.log('  - Duration-aware optimization');
    console.log('  - Quality assessment and suggestions');
    console.log('  - Configuration validation');
    console.log('  - Performance tracking');

  } catch (error) {
    console.error('❌ Error running script generation examples:', error);
  }
}

/**
 * Create sample PR data for testing
 */
export function createSamplePRData(): PRVideoData {
  // This would normally come from the GitHub API
  return {
    pullRequest: {
      id: 123456789,
      number: 42,
      title: 'Implement advanced caching system for improved performance',
      body: 'This PR introduces a new caching layer that improves application performance by 40%. The implementation includes Redis integration, cache invalidation strategies, and comprehensive monitoring.',
      state: 'closed',
      merged: true,
      draft: false,
      user: {
        id: 1,
        login: 'jane-engineer',
        avatar_url: 'https://github.com/jane-engineer.avatar',
        html_url: 'https://github.com/jane-engineer',
        type: 'User',
        name: 'Jane Engineer'
      },
      assignees: [],
      reviewers: [],
      labels: [
        { id: 1, name: 'performance', color: 'green', description: 'Performance improvement' },
        { id: 2, name: 'backend', color: 'blue', description: 'Backend changes' }
      ],
      base: {
        label: 'main',
        ref: 'main',
        sha: 'abc123',
        user: { id: 1, login: 'repo-owner', avatar_url: '', html_url: '', type: 'User' },
        repo: {
          id: 1,
          name: 'awesome-app',
          full_name: 'company/awesome-app',
          owner: { id: 1, login: 'company', avatar_url: '', html_url: '', type: 'User' },
          html_url: 'https://github.com/company/awesome-app',
          private: false,
          fork: false,
          default_branch: 'main'
        }
      },
      head: {
        label: 'feature/caching-system',
        ref: 'feature/caching-system',
        sha: 'def456',
        user: { id: 1, login: 'jane-engineer', avatar_url: '', html_url: '', type: 'User' },
        repo: {
          id: 1,
          name: 'awesome-app',
          full_name: 'company/awesome-app',
          owner: { id: 1, login: 'company', avatar_url: '', html_url: '', type: 'User' },
          html_url: 'https://github.com/company/awesome-app',
          private: false,
          fork: false,
          default_branch: 'main'
        }
      },
      html_url: 'https://github.com/company/awesome-app/pull/42',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-20T15:30:00Z',
      closed_at: '2024-01-20T15:30:00Z',
      merged_at: '2024-01-20T15:30:00Z',
      merge_commit_sha: 'merge123',
      mergeable: true,
      merged_by: {
        id: 2,
        login: 'tech-lead',
        avatar_url: 'https://github.com/tech-lead.avatar',
        html_url: 'https://github.com/tech-lead',
        type: 'User'
      },
      comments: 8,
      review_comments: 15,
      commits: 12,
      additions: 450,
      deletions: 120,
      changed_files: 8
    },
    commits: [],
    files: [],
    reviews: [],
    reviewComments: [],
    issueComments: [],
    timeline: [],
    repository: {
      id: 1,
      name: 'awesome-app',
      full_name: 'company/awesome-app',
      owner: { id: 1, login: 'company', avatar_url: '', html_url: '', type: 'User' },
      html_url: 'https://github.com/company/awesome-app',
      description: 'An awesome application with great performance',
      private: false,
      fork: false,
      language: 'TypeScript',
      default_branch: 'main'
    },
    participants: [],
    codeStats: {
      totalAdditions: 450,
      totalDeletions: 120,
      totalFiles: 8,
      languageBreakdown: { TypeScript: 350, JavaScript: 100 },
      fileTypes: { '.ts': 6, '.js': 2 }
    },
    reviewStats: {
      approvals: 2,
      changesRequested: 1,
      comments: 15,
      averageReviewTime: 24
    },
    timelineStats: {
      createdAt: new Date('2024-01-15T10:00:00Z'),
      firstReviewAt: new Date('2024-01-16T14:00:00Z'),
      lastUpdateAt: new Date('2024-01-20T15:30:00Z'),
      mergedAt: new Date('2024-01-20T15:30:00Z'),
      totalDuration: 5.5 * 24, // 5.5 days in hours
      reviewDuration: 4.5 * 24 // 4.5 days in hours
    }
  };
}

// Export example runner
export { ScriptGenerationExample };