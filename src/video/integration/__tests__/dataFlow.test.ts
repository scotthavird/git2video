/**
 * Data flow integration tests
 * Validates data transformation and flow between components
 */

import { PRVideoTransformer } from '../../../github/transformer';
import { ScriptGenerator } from '../../scripts/ScriptGenerator';
import { ContentAdapter } from '../../scripts/adapters/ContentAdapter';
import { DurationAdapter } from '../../scripts/adapters/DurationAdapter';
import { processGitHubFile, parseDiffPatch, groupRelatedChanges } from '../../../components/molecules/pr/code/utils/diffProcessor';
import { tokenizeCode, detectLanguageFromFileName } from '../../../components/molecules/pr/code/utils/syntaxHighlighter';
import { TestDataBuilder, VideoAssertions } from '../testUtils';

describe('Data Flow Integration Tests', () => {
  let transformer: PRVideoTransformer;
  let scriptGenerator: ScriptGenerator;
  let contentAdapter: ContentAdapter;
  let durationAdapter: DurationAdapter;

  beforeEach(() => {
    transformer = new PRVideoTransformer();
    scriptGenerator = new ScriptGenerator();
    contentAdapter = new ContentAdapter();
    durationAdapter = new DurationAdapter();
  });

  describe('GitHub Data to Video Metadata Flow', () => {
    it('should transform PR data correctly', () => {
      // Arrange
      const prData = TestDataBuilder.createMockVideoMetadata();

      // Act
      const videoMetadata = transformer.transform(prData, 'detailed');

      // Assert
      expect(videoMetadata.id).toBe(prData.id);
      expect(videoMetadata.title).toBe(prData.title);
      expect(videoMetadata.description).toBe(prData.description);
      expect(videoMetadata.files).toHaveLength(prData.files.length);
      expect(videoMetadata.commits).toHaveLength(prData.commits.length);
      expect(videoMetadata.metrics).toEqual(prData.metrics);
    });

    it('should preserve data integrity through transformations', () => {
      // Arrange
      const originalPR = TestDataBuilder.createComplexPRMetadata();

      // Act
      const transformed = transformer.transform(originalPR, 'technical');

      // Assert - Key data should be preserved
      expect(transformed.metrics.totalAdditions).toBe(originalPR.metrics.totalAdditions);
      expect(transformed.metrics.totalDeletions).toBe(originalPR.metrics.totalDeletions);
      expect(transformed.metrics.filesChanged).toBe(originalPR.metrics.filesChanged);
      expect(transformed.commits.length).toBe(originalPR.commits.length);
      
      // File data should be preserved
      originalPR.files.forEach((originalFile, index) => {
        const transformedFile = transformed.files[index];
        expect(transformedFile.filename).toBe(originalFile.filename);
        expect(transformedFile.additions).toBe(originalFile.additions);
        expect(transformedFile.deletions).toBe(originalFile.deletions);
        expect(transformedFile.status).toBe(originalFile.status);
      });
    });
  });

  describe('Content Adaptation Data Flow', () => {
    it('should adapt content while preserving essential information', () => {
      // Arrange
      const videoMetadata = TestDataBuilder.createMockVideoMetadata();
      const audienceConfigs = [
        {
          primary: 'general' as const,
          technicalLevel: 'beginner' as const,
          projectFamiliarity: 'basic' as const,
          communicationStyle: 'conversational' as const
        },
        {
          primary: 'engineering' as const,
          technicalLevel: 'expert' as const,
          projectFamiliarity: 'familiar' as const,
          communicationStyle: 'technical' as const
        }
      ];

      // Act & Assert
      audienceConfigs.forEach(audience => {
        const adaptedContent = contentAdapter.adaptContent(
          videoMetadata,
          'detailed',
          audience,
          300
        );

        // Essential information should be preserved
        expect(adaptedContent.sections.length).toBeGreaterThan(0);
        expect(adaptedContent.metadata.audience).toEqual(audience);
        expect(adaptedContent.metadata.sourceMetadata.id).toBe(videoMetadata.id);
        
        // Content should be adapted for audience
        const technicalSectionCount = adaptedContent.sections.filter(s => 
          ['technical_details', 'code_changes', 'file_analysis'].includes(s.type)
        ).length;
        
        if (audience.technicalLevel === 'beginner') {
          expect(technicalSectionCount).toBeLessThanOrEqual(2);
        } else if (audience.technicalLevel === 'expert') {
          expect(technicalSectionCount).toBeGreaterThanOrEqual(2);
        }
      });
    });

    it('should maintain data consistency through content selection', () => {
      // Arrange
      const videoMetadata = TestDataBuilder.createComplexPRMetadata();
      const audience = {
        primary: 'engineering' as const,
        technicalLevel: 'intermediate' as const,
        projectFamiliarity: 'familiar' as const,
        communicationStyle: 'conversational' as const
      };

      // Act
      const adaptedContent = contentAdapter.adaptContent(
        videoMetadata,
        'detailed',
        audience,
        600
      );

      // Assert
      // Total content should relate to original metrics
      const totalSectionDuration = adaptedContent.sections.reduce((sum, s) => sum + s.duration, 0);
      expect(totalSectionDuration).toBeGreaterThan(0);
      expect(totalSectionDuration).toBeLessThanOrEqual(800); // Some buffer above target
      
      // Section priorities should be valid
      adaptedContent.sections.forEach(section => {
        expect(['critical', 'high', 'medium', 'low', 'optional']).toContain(section.priority);
        expect(section.duration).toBeGreaterThan(0);
        expect(section.content).toBeTruthy();
      });
    });
  });

  describe('Duration Optimization Data Flow', () => {
    it('should optimize duration while preserving content quality', () => {
      // Arrange
      const videoMetadata = TestDataBuilder.createMockVideoMetadata();
      const audience = {
        primary: 'product' as const,
        technicalLevel: 'intermediate' as const,
        projectFamiliarity: 'basic' as const,
        communicationStyle: 'conversational' as const
      };
      
      const adaptedContent = contentAdapter.adaptContent(
        videoMetadata,
        'detailed',
        audience,
        400
      );

      const targetDurations = [180, 300, 600]; // Different duration targets

      // Act & Assert
      targetDurations.forEach(targetDuration => {
        const optimized = durationAdapter.optimizeForDuration(
          adaptedContent,
          targetDuration,
          'detailed',
          audience
        );

        const totalDuration = optimized.sections.reduce((sum, s) => sum + s.duration, 0);
        const deviation = Math.abs(totalDuration - targetDuration) / targetDuration;
        
        expect(deviation).toBeLessThan(0.25); // Within 25% of target
        expect(optimized.compliance).toBeGreaterThan(0.7);
        
        // High priority sections should be preserved
        const criticalSections = optimized.sections.filter(s => s.section.priority === 'critical');
        const highSections = optimized.sections.filter(s => s.section.priority === 'high');
        
        expect(criticalSections.length + highSections.length).toBeGreaterThan(0);
        
        console.log(`Target ${targetDuration}s -> Actual ${totalDuration}s (${(deviation * 100).toFixed(1)}% deviation)`);
      });
    });

    it('should handle extreme duration constraints gracefully', () => {
      // Arrange
      const videoMetadata = TestDataBuilder.createComplexPRMetadata();
      const audience = {
        primary: 'engineering' as const,
        technicalLevel: 'expert' as const,
        projectFamiliarity: 'familiar' as const,
        communicationStyle: 'technical' as const
      };
      
      const adaptedContent = contentAdapter.adaptContent(
        videoMetadata,
        'technical',
        audience,
        600
      );

      const extremeDurations = [60, 1800]; // 1 minute and 30 minutes

      // Act & Assert
      extremeDurations.forEach(targetDuration => {
        const optimized = durationAdapter.optimizeForDuration(
          adaptedContent,
          targetDuration,
          'technical',
          audience
        );

        expect(optimized.sections.length).toBeGreaterThan(0);
        expect(optimized.warnings.length).toBeGreaterThan(0); // Should warn about extreme duration
        
        const totalDuration = optimized.sections.reduce((sum, s) => sum + s.duration, 0);
        
        if (targetDuration === 60) {
          // Very short: should prioritize critical content
          expect(totalDuration).toBeLessThan(120); // Not more than 2x target
          const criticalSections = optimized.sections.filter(s => s.section.priority === 'critical');
          expect(criticalSections.length).toBeGreaterThan(0);
        } else {
          // Very long: should expand content appropriately
          expect(totalDuration).toBeGreaterThan(600); // Should expand beyond normal
          expect(optimized.sections.length).toBeGreaterThan(5);
        }
      });
    });
  });

  describe('Diff Processing Data Flow', () => {
    it('should process GitHub file data correctly', () => {
      // Arrange
      const githubFile = {
        filename: 'src/components/Button.tsx',
        status: 'modified' as const,
        additions: 15,
        deletions: 8,
        changes: 23,
        patch: `@@ -1,5 +1,6 @@
 import React from 'react';
+import { ButtonProps } from './types';
 
-const Button = () => {
+const Button: React.FC<ButtonProps> = (props) => {
   return <button>Click me</button>;
 };`
      };

      // Act
      const processedDiff = processGitHubFile(githubFile);

      // Assert
      expect(processedDiff).toBeDefined();
      expect(processedDiff!.fileName).toBe(githubFile.filename);
      expect(processedDiff!.language).toBe('tsx');
      expect(processedDiff!.status).toBe('modified');
      expect(processedDiff!.stats.additions).toBe(githubFile.additions);
      expect(processedDiff!.stats.deletions).toBe(githubFile.deletions);
      expect(processedDiff!.lines.length).toBeGreaterThan(0);
    });

    it('should parse diff patches correctly', () => {
      // Arrange
      const patchContent = `@@ -10,7 +10,8 @@ export class AuthService {
   }
 
-  async login(username: string, password: string) {
+  async login(username: string, password: string): Promise<AuthResult> {
+    this.validateInput(username, password);
     const result = await this.authenticate(username, password);
     return result;
   }`;

      // Act
      const parsedDiff = parseDiffPatch(patchContent, 'src/auth/AuthService.ts');

      // Assert
      expect(parsedDiff.fileName).toBe('src/auth/AuthService.ts');
      expect(parsedDiff.language).toBe('typescript');
      expect(parsedDiff.lines.length).toBeGreaterThan(0);
      
      const addedLines = parsedDiff.lines.filter(line => line.type === 'added');
      const removedLines = parsedDiff.lines.filter(line => line.type === 'removed');
      
      expect(addedLines.length).toBe(2);
      expect(removedLines.length).toBe(1);
    });

    it('should group related changes intelligently', () => {
      // Arrange
      const diffs = [
        processGitHubFile({
          filename: 'src/auth/login.ts',
          status: 'modified',
          additions: 25,
          deletions: 10,
          changes: 35,
          patch: 'mock patch'
        }),
        processGitHubFile({
          filename: 'src/auth/register.ts',
          status: 'added',
          additions: 80,
          deletions: 0,
          changes: 80,
          patch: 'mock patch'
        }),
        processGitHubFile({
          filename: 'src/utils/validation.ts',
          status: 'modified',
          additions: 15,
          deletions: 5,
          changes: 20,
          patch: 'mock patch'
        })
      ].filter(Boolean) as any[];

      // Act
      const groupedChanges = groupRelatedChanges(diffs);

      // Assert
      expect(groupedChanges.length).toBeGreaterThan(0);
      
      groupedChanges.forEach(group => {
        expect(group.type).toMatch(/^(addition|deletion|modification|refactor)$/);
        expect(group.files.length).toBeGreaterThan(0);
        expect(['low', 'medium', 'high']).toContain(group.impact);
        expect(group.complexity).toBeGreaterThanOrEqual(0);
        expect(group.description).toBeTruthy();
      });
    });
  });

  describe('Syntax Highlighting Data Flow', () => {
    it('should detect languages correctly from filenames', () => {
      // Arrange
      const testCases = [
        { filename: 'component.tsx', expected: 'tsx' },
        { filename: 'script.js', expected: 'javascript' },
        { filename: 'main.py', expected: 'python' },
        { filename: 'service.go', expected: 'go' },
        { filename: 'styles.css', expected: 'css' },
        { filename: 'data.json', expected: 'json' },
        { filename: 'README.md', expected: 'markdown' },
        { filename: 'unknown.xyz', expected: 'text' }
      ];

      // Act & Assert
      testCases.forEach(testCase => {
        const detected = detectLanguageFromFileName(testCase.filename);
        expect(detected).toBe(testCase.expected);
      });
    });

    it('should tokenize code correctly for different languages', () => {
      // Arrange
      const codeExamples = [
        {
          language: 'typescript',
          code: 'const message: string = "Hello, world!";',
          expectedTokenTypes: ['keyword', 'identifier', 'punctuation', 'type', 'operator', 'string']
        },
        {
          language: 'python',
          code: 'def greet(name: str) -> str:\n    return f"Hello, {name}!"',
          expectedTokenTypes: ['keyword', 'function', 'identifier', 'string']
        },
        {
          language: 'json',
          code: '{"name": "test", "value": 42}',
          expectedTokenTypes: ['property', 'string', 'number']
        }
      ];

      // Act & Assert
      codeExamples.forEach(example => {
        const tokens = tokenizeCode(example.code, example.language);
        
        expect(tokens.length).toBeGreaterThan(0);
        
        // Check that expected token types are present
        const tokenTypes = tokens.map(token => token.type);
        example.expectedTokenTypes.forEach(expectedType => {
          expect(tokenTypes).toContain(expectedType);
        });
        
        // Verify token integrity
        tokens.forEach(token => {
          expect(token.content).toBeTruthy();
          expect(token.color).toBeTruthy();
          expect(token.start).toBeGreaterThanOrEqual(0);
          expect(token.end).toBeGreaterThan(token.start);
        });
      });
    });
  });

  describe('End-to-End Data Flow', () => {
    it('should maintain data integrity through complete pipeline', async () => {
      // Arrange
      const originalPR = TestDataBuilder.createMockVideoMetadata();
      const config = TestDataBuilder.createMockScriptConfig();

      // Act - Full pipeline
      const result = await scriptGenerator.generateScript(originalPR, config);

      // Assert - Data integrity checks
      expect(result.success).toBe(true);
      
      // Original PR data should be traceable in final script
      expect(result.script.title).toContain(originalPR.title.split(' ')[0]); // At least part of title
      expect(result.script.metadata.selectionStrategy).toBeDefined();
      expect(result.script.audience).toEqual(config.audience);
      
      // Metrics should make sense relative to original
      const scriptDuration = result.script.sections.reduce((sum, s) => sum + s.duration, 0);
      const targetDuration = config.targetDuration;
      const deviation = Math.abs(scriptDuration - targetDuration) / targetDuration;
      expect(deviation).toBeLessThan(0.3); // Within 30%

      // Quality metrics should be populated
      const quality = result.script.metadata.quality;
      expect(quality.overall).toBeGreaterThan(0);
      expect(quality.coherence).toBeGreaterThan(0);
      expect(quality.engagement).toBeGreaterThan(0);
      expect(quality.accuracy).toBeGreaterThan(0);
    });

    it('should handle data transformations without loss', async () => {
      // Arrange
      const complexPR = TestDataBuilder.createComplexPRMetadata();
      const config = TestDataBuilder.createMockScriptConfig({
        templateType: 'technical',
        targetDuration: 600
      });

      // Track key metrics through pipeline
      const originalMetrics = {
        fileCount: complexPR.files.length,
        commitCount: complexPR.commits.length,
        totalChanges: complexPR.metrics.totalChanges,
        complexity: complexPR.metrics.complexity
      };

      // Act
      const result = await scriptGenerator.generateScript(complexPR, config);

      // Assert - Key information should be preserved or appropriately transformed
      expect(result.success).toBe(true);
      
      // Should have sections that relate to original complexity
      if (originalMetrics.complexity === 'high') {
        expect(result.script.sections.length).toBeGreaterThan(5);
        
        const technicalSections = result.script.sections.filter(s => 
          ['technical_details', 'code_changes', 'file_analysis'].includes(s.type)
        );
        expect(technicalSections.length).toBeGreaterThan(2);
      }
      
      // Performance should relate to complexity
      if (originalMetrics.fileCount > 20) {
        expect(result.performance.adaptationTime).toBeGreaterThan(500);
      }
      
      // Quality should account for complexity
      expect(result.script.metadata.quality.overall).toBeGreaterThan(0.6);
    });
  });
});