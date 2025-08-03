/**
 * End-to-end integration tests for the complete video generation pipeline
 * Tests the full workflow from GitHub data to rendered video components
 */

import { ScriptGenerator } from '../../scripts/ScriptGenerator';
import { PRVideoTransformer } from '../../../github/transformer';
import { TestDataBuilder, VideoAssertions, IntegrationTestHelpers } from '../testUtils';
import { runScriptGenerationExamples, createSamplePRData } from '../../scripts/example';

describe('End-to-End Video Generation Pipeline', () => {
  let scriptGenerator: ScriptGenerator;
  let transformer: PRVideoTransformer;

  beforeEach(() => {
    scriptGenerator = new ScriptGenerator();
    transformer = new PRVideoTransformer();
  });

  describe('Complete Pipeline Integration', () => {
    it('should generate video content from GitHub PR data to final script', async () => {
      // Arrange
      const prData = TestDataBuilder.createMockVideoMetadata();
      const config = TestDataBuilder.createMockScriptConfig({
        templateType: 'detailed',
        targetDuration: 300,
        audience: {
          primary: 'engineering',
          technicalLevel: 'intermediate',
          projectFamiliarity: 'familiar',
          communicationStyle: 'conversational'
        }
      });

      // Act
      const result = await scriptGenerator.generateScript(prData, config);

      // Assert
      IntegrationTestHelpers.expectSuccessfulGeneration(result);
      VideoAssertions.assertScriptValid(result.script);
      VideoAssertions.assertDurationCompliance(result.script, config.targetDuration, 0.15);
      VideoAssertions.assertAudienceAlignment(result.script, config.audience);
      VideoAssertions.assertVisualCuesPresent(result.script);

      // Verify script quality
      expect(result.script.metadata.quality.overall).toBeGreaterThan(0.7);
      expect(result.script.sections.length).toBeGreaterThan(3);
      
      // Verify performance metrics
      expect(result.performance.generationTime).toBeLessThan(5000); // 5 seconds
      expect(result.performance.adaptationTime).toBeLessThan(1000); // 1 second
    });

    it('should handle complex PR data with multiple file changes', async () => {
      // Arrange
      const complexPR = TestDataBuilder.createComplexPRMetadata();
      const config = TestDataBuilder.createMockScriptConfig({
        templateType: 'technical',
        targetDuration: 600, // 10 minutes for complex PR
        audience: {
          primary: 'engineering',
          technicalLevel: 'expert',
          projectFamiliarity: 'familiar',
          communicationStyle: 'technical'
        }
      });

      // Act
      const result = await scriptGenerator.generateScript(complexPR, config);

      // Assert
      expect(result.success).toBe(true);
      expect(result.script.sections.length).toBeGreaterThan(5);
      
      // Should include technical sections for expert audience
      const technicalSections = result.script.sections.filter(s => 
        ['technical_details', 'code_changes', 'file_analysis'].includes(s.type)
      );
      expect(technicalSections.length).toBeGreaterThanOrEqual(3);
      
      // Should handle the complexity appropriately
      expect(result.script.metadata.quality.accuracy).toBeGreaterThan(0.8);
    });

    it('should handle simple PR data efficiently', async () => {
      // Arrange
      const simplePR = TestDataBuilder.createSimplePRMetadata();
      const config = TestDataBuilder.createMockScriptConfig({
        templateType: 'summary',
        targetDuration: 120, // 2 minutes for simple PR
        audience: {
          primary: 'general',
          technicalLevel: 'beginner',
          projectFamiliarity: 'basic',
          communicationStyle: 'conversational'
        }
      });

      // Act
      const result = await scriptGenerator.generateScript(simplePR, config);

      // Assert
      expect(result.success).toBe(true);
      expect(result.script.sections.length).toBeLessThanOrEqual(5);
      
      // Should avoid too much technical content for beginners
      const technicalSections = result.script.sections.filter(s => 
        ['technical_details', 'code_changes'].includes(s.type)
      );
      expect(technicalSections.length).toBeLessThanOrEqual(2);
      
      // Should be faster for simple PRs
      expect(result.performance.generationTime).toBeLessThan(2000); // 2 seconds
    });
  });

  describe('Template System Integration', () => {
    it('should generate different outputs for different templates', async () => {
      // Arrange
      const prData = TestDataBuilder.createMockVideoMetadata();
      const baseConfig = TestDataBuilder.createMockScriptConfig();
      
      const templates = ['summary', 'detailed', 'technical'] as const;
      const results = [];

      // Act
      for (const templateType of templates) {
        const config = { ...baseConfig, templateType };
        const result = await scriptGenerator.generateScript(prData, config);
        results.push({ templateType, result });
      }

      // Assert
      results.forEach(({ templateType, result }) => {
        expect(result.success).toBe(true);
        expect(result.script.metadata.templateType).toBe(templateType);
      });

      // Summary should be shortest
      const summaryScript = results.find(r => r.templateType === 'summary')!.result.script;
      const technicalScript = results.find(r => r.templateType === 'technical')!.result.script;
      
      const summaryDuration = summaryScript.sections.reduce((sum, s) => sum + s.duration, 0);
      const technicalDuration = technicalScript.sections.reduce((sum, s) => sum + s.duration, 0);
      
      expect(summaryDuration).toBeLessThan(technicalDuration);
      expect(summaryScript.sections.length).toBeLessThanOrEqual(technicalScript.sections.length);
    });

    it('should provide appropriate suggestions for template improvements', async () => {
      // Arrange
      const prData = TestDataBuilder.createMockVideoMetadata();
      const mismatchedConfig = TestDataBuilder.createMockScriptConfig({
        templateType: 'technical',
        targetDuration: 60, // Too short for technical template
        audience: {
          primary: 'executive', // Mismatch with technical template
          technicalLevel: 'beginner',
          projectFamiliarity: 'basic',
          communicationStyle: 'formal'
        }
      });

      // Act
      const result = await scriptGenerator.generateScript(prData, mismatchedConfig);

      // Assert
      expect(result.success).toBe(true);
      expect(result.alternatives).toBeDefined();
      expect(result.alternatives!.length).toBeGreaterThan(0);
      
      // Should suggest better template
      const templateSuggestion = result.alternatives!.find(alt => alt.type === 'template_change');
      expect(templateSuggestion).toBeDefined();
      expect(templateSuggestion!.changes.templateType).not.toBe('technical');
    });
  });

  describe('Performance Integration', () => {
    it('should meet performance benchmarks across different scenarios', async () => {
      const scenarios = [
        { name: 'Simple PR', data: TestDataBuilder.createSimplePRMetadata(), maxTime: 1500 },
        { name: 'Standard PR', data: TestDataBuilder.createMockVideoMetadata(), maxTime: 3000 },
        { name: 'Complex PR', data: TestDataBuilder.createComplexPRMetadata(), maxTime: 7000 }
      ];

      for (const scenario of scenarios) {
        const config = TestDataBuilder.createMockScriptConfig();
        const startTime = Date.now();
        
        const result = await scriptGenerator.generateScript(scenario.data, config);
        const totalTime = Date.now() - startTime;
        
        expect(result.success).toBe(true);
        expect(totalTime).toBeLessThan(scenario.maxTime);
        expect(result.performance.generationTime).toBeLessThan(scenario.maxTime);
        
        console.log(`${scenario.name}: ${totalTime}ms (${result.performance.generationTime}ms generation)`);
      }
    });

    it('should handle concurrent script generation', async () => {
      // Arrange
      const prData = TestDataBuilder.createMockVideoMetadata();
      const configs = [
        TestDataBuilder.createMockScriptConfig({ templateType: 'summary' }),
        TestDataBuilder.createMockScriptConfig({ templateType: 'detailed' }),
        TestDataBuilder.createMockScriptConfig({ templateType: 'technical' })
      ];

      // Act
      const startTime = Date.now();
      const results = await Promise.all(
        configs.map(config => scriptGenerator.generateScript(prData, config))
      );
      const totalTime = Date.now() - startTime;

      // Assert
      results.forEach(result => {
        expect(result.success).toBe(true);
        VideoAssertions.assertScriptValid(result.script);
      });

      // Concurrent generation should not take much longer than sequential
      expect(totalTime).toBeLessThan(8000); // 8 seconds for 3 concurrent generations
    });
  });

  describe('Error Handling Integration', () => {
    it('should gracefully handle invalid PR data', async () => {
      // Arrange
      const invalidPR = {
        ...TestDataBuilder.createMockVideoMetadata(),
        files: [], // No files
        commits: [], // No commits
        metrics: {
          totalAdditions: 0,
          totalDeletions: 0,
          totalChanges: 0,
          filesChanged: 0,
          commitsCount: 0,
          reviewersCount: 0,
          conversationLength: 0,
          timeToMerge: null,
          complexity: 'low' as const
        }
      };
      const config = TestDataBuilder.createMockScriptConfig();

      // Act
      const result = await scriptGenerator.generateScript(invalidPR, config);

      // Assert
      expect(result.success).toBe(true); // Should still succeed with minimal content
      expect(result.warnings.length).toBeGreaterThan(0); // Should have warnings
      expect(result.script.sections.length).toBeGreaterThan(0); // Should have at least intro/outro
    });

    it('should handle extremely short duration requirements', async () => {
      // Arrange
      const prData = TestDataBuilder.createMockVideoMetadata();
      const shortConfig = TestDataBuilder.createMockScriptConfig({
        targetDuration: 30 // 30 seconds - very short
      });

      // Act
      const result = await scriptGenerator.generateScript(prData, shortConfig);

      // Assert
      expect(result.success).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0); // Should warn about short duration
      
      const totalDuration = result.script.sections.reduce((sum, s) => sum + s.duration, 0);
      expect(totalDuration).toBeLessThanOrEqual(60); // Should respect constraint
    });

    it('should handle extremely long duration requirements', async () => {
      // Arrange
      const prData = TestDataBuilder.createMockVideoMetadata();
      const longConfig = TestDataBuilder.createMockScriptConfig({
        targetDuration: 1800 // 30 minutes - very long
      });

      // Act
      const result = await scriptGenerator.generateScript(prData, longConfig);

      // Assert
      expect(result.success).toBe(true);
      
      const totalDuration = result.script.sections.reduce((sum, s) => sum + s.duration, 0);
      expect(totalDuration).toBeGreaterThan(600); // Should expand content appropriately
      expect(result.script.sections.length).toBeGreaterThan(5); // Should have more sections
    });
  });

  describe('Quality Assurance Integration', () => {
    it('should maintain quality standards across different configurations', async () => {
      // Arrange
      const prData = TestDataBuilder.createMockVideoMetadata();
      const configurations = [
        { audience: 'general', technical: 'beginner', minQuality: 0.7 },
        { audience: 'engineering', technical: 'intermediate', minQuality: 0.75 },
        { audience: 'engineering', technical: 'expert', minQuality: 0.8 },
        { audience: 'executive', technical: 'beginner', minQuality: 0.7 }
      ];

      // Act & Assert
      for (const cfg of configurations) {
        const config = TestDataBuilder.createMockScriptConfig({
          audience: {
            primary: cfg.audience as any,
            technicalLevel: cfg.technical as any,
            projectFamiliarity: 'familiar',
            communicationStyle: 'conversational'
          }
        });

        const result = await scriptGenerator.generateScript(prData, config);
        
        expect(result.success).toBe(true);
        expect(result.script.metadata.quality.overall).toBeGreaterThan(cfg.minQuality);
        
        // Quality details should be populated
        expect(result.script.metadata.quality.details.strengths.length).toBeGreaterThan(0);
        expect(result.script.metadata.quality.details.suggestions.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Example Integration', () => {
    it('should run script generation examples without errors', async () => {
      // Arrange
      const samplePRData = createSamplePRData();

      // Act & Assert - should not throw
      await expect(runScriptGenerationExamples(samplePRData)).resolves.not.toThrow();
    });
  });
});