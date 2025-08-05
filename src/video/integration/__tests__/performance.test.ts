/**
 * Performance testing for video generation components
 * Validates performance benchmarks and optimization effectiveness
 */

import { ScriptGenerator } from '../../scripts/ScriptGenerator';
import { ContentAdapter } from '../../scripts/adapters/ContentAdapter';
import { DurationAdapter } from '../../scripts/adapters/DurationAdapter';
import { 
  TestDataBuilder, 
  PerformanceTracker, 
  IntegrationTestHelpers 
} from '../testUtils';

describe('Video Generation Performance Tests', () => {
  let scriptGenerator: ScriptGenerator;
  let contentAdapter: ContentAdapter;
  let durationAdapter: DurationAdapter;
  let performanceTracker: PerformanceTracker;

  beforeEach(() => {
    scriptGenerator = new ScriptGenerator();
    contentAdapter = new ContentAdapter();
    durationAdapter = new DurationAdapter();
    performanceTracker = new PerformanceTracker();
  });

  describe('Script Generation Performance', () => {
    it('should generate simple scripts within performance budget', async () => {
      // Arrange
      const prData = TestDataBuilder.createSimplePRMetadata();
      const config = TestDataBuilder.createMockScriptConfig({
        templateType: 'summary',
        targetDuration: 180
      });

      // Act
      const result = await performanceTracker.measureAsync(
        'simple-script-generation',
        () => scriptGenerator.generateScript(prData, config)
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.performance.generationTime).toBeLessThan(2000); // 2 seconds
      expect(result.performance.adaptationTime).toBeLessThan(500); // 0.5 seconds
      expect(result.performance.templateTime).toBeLessThan(100); // 0.1 seconds
    });

    it('should generate complex scripts within performance budget', async () => {
      // Arrange
      const prData = TestDataBuilder.createComplexPRMetadata();
      const config = TestDataBuilder.createMockScriptConfig({
        templateType: 'technical',
        targetDuration: 600
      });

      // Act
      const result = await performanceTracker.measureAsync(
        'complex-script-generation',
        () => scriptGenerator.generateScript(prData, config)
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.performance.generationTime).toBeLessThan(8000); // 8 seconds
      expect(result.performance.adaptationTime).toBeLessThan(2000); // 2 seconds
      expect(result.performance.processingTime).toBeLessThan(3000); // 3 seconds
    });

    it('should scale performance with PR complexity', async () => {
      // Arrange
      const scenarios = [
        { name: 'Simple', data: TestDataBuilder.createSimplePRMetadata(), maxTime: 2000 },
        { name: 'Standard', data: TestDataBuilder.createMockVideoMetadata(), maxTime: 4000 },
        { name: 'Complex', data: TestDataBuilder.createComplexPRMetadata(), maxTime: 8000 }
      ];

      const config = TestDataBuilder.createMockScriptConfig();
      const results = [];

      // Act
      for (const scenario of scenarios) {
        const result = await scriptGenerator.generateScript(scenario.data, config);
        results.push({
          name: scenario.name,
          time: result.performance.generationTime,
          maxTime: scenario.maxTime
        });
      }

      // Assert
      results.forEach(result => {
        expect(result.time).toBeLessThan(result.maxTime);
        console.log(`${result.name} PR: ${result.time}ms (max: ${result.maxTime}ms)`);
      });

      // Performance should scale reasonably (not exponentially)
      const simpleTime = results.find(r => r.name === 'Simple')!.time;
      const complexTime = results.find(r => r.name === 'Complex')!.time;
      
      expect(complexTime / simpleTime).toBeLessThan(10); // No more than 10x slower
    });
  });

  describe('Content Adaptation Performance', () => {
    it('should adapt content efficiently for different audiences', async () => {
      // Arrange
      const prData = TestDataBuilder.createMockVideoMetadata();
      const audiences = ['general', 'engineering', 'executive', 'product'] as const;
      
      // Act & Assert
      for (const audienceType of audiences) {
        const result = performanceTracker.measure(
          `content-adaptation-${audienceType}`,
          () => contentAdapter.adaptContent(
            prData,
            'detailed',
            {
              primary: audienceType,
              technicalLevel: 'intermediate',
              projectFamiliarity: 'familiar',
              communicationStyle: 'conversational'
            },
            300
          )
        );

        expect(result.sections.length).toBeGreaterThan(0);
        
        // Content adaptation should be fast
        const adaptationTime = performanceTracker.end(`content-adaptation-${audienceType}`);
        expect(adaptationTime).toBeLessThan(1000); // 1 second
      }
    });

    it('should handle large file sets efficiently', async () => {
      // Arrange - Create PR with many files
      const largePR = {
        ...TestDataBuilder.createMockVideoMetadata(),
        files: Array.from({ length: 50 }, (_, i) => ({
          filename: `src/module${i}.ts`,
          status: 'modified' as const,
          additions: Math.floor(Math.random() * 100) + 10,
          deletions: Math.floor(Math.random() * 50) + 5,
          changes: Math.floor(Math.random() * 150) + 15,
          patch: `Sample patch content for file ${i}`
        }))
      };

      // Act
      const result = performanceTracker.measure(
        'large-file-adaptation',
        () => contentAdapter.adaptContent(
          largePR,
          'detailed',
          {
            primary: 'engineering',
            technicalLevel: 'intermediate',
            projectFamiliarity: 'familiar',
            communicationStyle: 'technical'
          },
          600
        )
      );

      // Assert
      expect(result.sections.length).toBeGreaterThan(0);
      
      const adaptationTime = performanceTracker.end('large-file-adaptation');
      expect(adaptationTime).toBeLessThan(3000); // 3 seconds even for 50 files
    });
  });

  describe('Duration Optimization Performance', () => {
    it('should optimize duration efficiently', async () => {
      // Arrange
      const prData = TestDataBuilder.createMockVideoMetadata();
      const adaptedContent = contentAdapter.adaptContent(
        prData,
        'detailed',
        {
          primary: 'engineering',
          technicalLevel: 'intermediate',
          projectFamiliarity: 'familiar',
          communicationStyle: 'conversational'
        },
        300
      );

      // Act
      const result = performanceTracker.measure(
        'duration-optimization',
        () => durationAdapter.optimizeForDuration(
          adaptedContent,
          300,
          'detailed',
          {
            primary: 'engineering',
            technicalLevel: 'intermediate',
            projectFamiliarity: 'familiar',
            communicationStyle: 'conversational'
          }
        )
      );

      // Assert
      expect(result.sections.length).toBeGreaterThan(0);
      expect(result.compliance).toBeGreaterThan(0.7);
      
      const optimizationTime = performanceTracker.end('duration-optimization');
      expect(optimizationTime).toBeLessThan(500); // 0.5 seconds
    });

    it('should handle extreme duration constraints efficiently', async () => {
      // Arrange
      const prData = TestDataBuilder.createComplexPRMetadata();
      const adaptedContent = contentAdapter.adaptContent(
        prData,
        'technical',
        {
          primary: 'engineering',
          technicalLevel: 'expert',
          projectFamiliarity: 'familiar',
          communicationStyle: 'technical'
        },
        600
      );

      const extremeDurations = [60, 120, 300, 900, 1800]; // 1min to 30min

      // Act & Assert
      for (const targetDuration of extremeDurations) {
        const result = performanceTracker.measure(
          `duration-optimization-${targetDuration}`,
          () => durationAdapter.optimizeForDuration(
            adaptedContent,
            targetDuration,
            'technical',
            {
              primary: 'engineering',
              technicalLevel: 'expert',
              projectFamiliarity: 'familiar',
              communicationStyle: 'technical'
            }
          )
        );

        expect(result.sections.length).toBeGreaterThan(0);
        
        const optimizationTime = performanceTracker.end(`duration-optimization-${targetDuration}`);
        expect(optimizationTime).toBeLessThan(1000); // 1 second even for extreme cases
        
        console.log(`Duration ${targetDuration}s optimization: ${optimizationTime}ms`);
      }
    });
  });

  describe('Memory Usage Performance', () => {
    it('should not leak memory during script generation', async () => {
      // Arrange
      const prData = TestDataBuilder.createMockVideoMetadata();
      const config = TestDataBuilder.createMockScriptConfig();
      
      // Measure initial memory (if available)
      const initialMemory = process.memoryUsage ? process.memoryUsage().heapUsed : 0;
      
      // Act - Generate multiple scripts
      for (let i = 0; i < 10; i++) {
        const result = await scriptGenerator.generateScript(prData, config);
        expect(result.success).toBe(true);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      // Assert - Memory should not have grown significantly
      if (process.memoryUsage) {
        const finalMemory = process.memoryUsage().heapUsed;
        const memoryGrowth = finalMemory - initialMemory;
        const growthMB = memoryGrowth / (1024 * 1024);
        
        console.log(`Memory growth: ${growthMB.toFixed(2)}MB`);
        expect(growthMB).toBeLessThan(50); // Less than 50MB growth
      }
    });

    it('should handle concurrent operations without memory issues', async () => {
      // Arrange
      const prData = TestDataBuilder.createMockVideoMetadata();
      const configs = Array.from({ length: 5 }, () => 
        TestDataBuilder.createMockScriptConfig()
      );

      const initialMemory = process.memoryUsage ? process.memoryUsage().heapUsed : 0;

      // Act - Run concurrent script generations
      const results = await Promise.all(
        configs.map(config => scriptGenerator.generateScript(prData, config))
      );

      // Assert
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      if (process.memoryUsage) {
        const finalMemory = process.memoryUsage().heapUsed;
        const memoryGrowth = finalMemory - initialMemory;
        const growthMB = memoryGrowth / (1024 * 1024);
        
        console.log(`Concurrent memory growth: ${growthMB.toFixed(2)}MB`);
        expect(growthMB).toBeLessThan(30); // Less than 30MB growth for concurrent ops
      }
    });
  });

  describe('Template Performance', () => {
    it('should load and apply templates efficiently', async () => {
      // Arrange
      const prData = TestDataBuilder.createMockVideoMetadata();
      const templates = ['summary', 'detailed', 'technical'] as const;

      // Act & Assert
      for (const templateType of templates) {
        const config = TestDataBuilder.createMockScriptConfig({ templateType });
        
        const result = await performanceTracker.measureAsync(
          `template-${templateType}`,
          () => scriptGenerator.generateScript(prData, config)
        );

        expect(result.success).toBe(true);
        expect(result.performance.templateTime).toBeLessThan(200); // 0.2 seconds
        
        console.log(`${templateType} template: ${result.performance.templateTime}ms`);
      }
    });

    it('should cache template operations efficiently', async () => {
      // Arrange
      const prData = TestDataBuilder.createMockVideoMetadata();
      const config = TestDataBuilder.createMockScriptConfig({ templateType: 'detailed' });

      // Act - First generation (cold)
      const firstResult = await scriptGenerator.generateScript(prData, config);
      const firstTime = firstResult.performance.templateTime;

      // Act - Second generation (warm)
      const secondResult = await scriptGenerator.generateScript(prData, config);
      const secondTime = secondResult.performance.templateTime;

      // Assert
      expect(firstResult.success).toBe(true);
      expect(secondResult.success).toBe(true);
      
      // Second run should not be significantly slower (caching effect)
      expect(secondTime).toBeLessThanOrEqual(firstTime * 1.5);
      
      console.log(`Template timing - First: ${firstTime}ms, Second: ${secondTime}ms`);
    });
  });

  describe('Stress Testing', () => {
    it('should handle rapid successive generations', async () => {
      // Arrange
      const prData = TestDataBuilder.createMockVideoMetadata();
      const config = TestDataBuilder.createMockScriptConfig();
      const iterations = 20;

      // Act
      const startTime = Date.now();
      const results = [];
      
      for (let i = 0; i < iterations; i++) {
        const result = await scriptGenerator.generateScript(prData, config);
        results.push(result);
      }
      
      const totalTime = Date.now() - startTime;
      const averageTime = totalTime / iterations;

      // Assert
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      expect(averageTime).toBeLessThan(2000); // Average less than 2 seconds
      console.log(`Stress test - Total: ${totalTime}ms, Average: ${averageTime}ms`);
    });

    it('should maintain performance under varying load patterns', async () => {
      // Arrange
      const loadPatterns = [
        { name: 'Burst', concurrent: 5, sequential: 1 },
        { name: 'Sustained', concurrent: 2, sequential: 5 },
        { name: 'Mixed', concurrent: 3, sequential: 3 }
      ];

      const prData = TestDataBuilder.createMockVideoMetadata();
      const config = TestDataBuilder.createMockScriptConfig();

      // Act & Assert
      for (const pattern of loadPatterns) {
        const startTime = Date.now();
        
        // Concurrent operations
        const concurrentPromises = Array.from({ length: pattern.concurrent }, () =>
          scriptGenerator.generateScript(prData, config)
        );
        const concurrentResults = await Promise.all(concurrentPromises);

        // Sequential operations
        const sequentialResults = [];
        for (let i = 0; i < pattern.sequential; i++) {
          const result = await scriptGenerator.generateScript(prData, config);
          sequentialResults.push(result);
        }

        const totalTime = Date.now() - startTime;
        const totalOperations = pattern.concurrent + pattern.sequential;
        const averageTime = totalTime / totalOperations;

        // Assert
        [...concurrentResults, ...sequentialResults].forEach(result => {
          expect(result.success).toBe(true);
        });

        expect(averageTime).toBeLessThan(3000); // Average less than 3 seconds
        console.log(`${pattern.name} pattern - Total: ${totalTime}ms, Average: ${averageTime}ms`);
      }
    });
  });
});