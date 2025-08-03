/**
 * Test utilities for video generation integration testing
 * Provides mocks, fixtures, and helper functions for testing the complete pipeline
 */

import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { VideoMetadata } from '../../github/types';
import { ScriptGenerationConfig, VideoScript, ScriptAudience } from '../scripts/types';

// Mock Remotion hooks for testing
export const mockRemotionHooks = () => {
  jest.mock('remotion', () => ({
    useCurrentFrame: jest.fn(() => 30),
    useVideoConfig: jest.fn(() => ({
      fps: 30,
      durationInFrames: 240,
      width: 1920,
      height: 1080
    })),
    interpolate: jest.fn((input, inputRange, outputRange) => {
      const factor = (input - inputRange[0]) / (inputRange[1] - inputRange[0]);
      return outputRange[0] + factor * (outputRange[1] - outputRange[0]);
    }),
    spring: jest.fn(() => 1),
    Composition: ({ children }: any) => children,
    registerRoot: jest.fn(),
    AbsoluteFill: ({ children }: any) => children,
    Sequence: ({ children }: any) => children
  }));
};

// Test data builders
export class TestDataBuilder {
  static createMockVideoMetadata(overrides: Partial<VideoMetadata> = {}): VideoMetadata {
    return {
      id: 'test-pr-123',
      title: 'Implement user authentication system',
      description: 'Add comprehensive authentication with OAuth and JWT tokens',
      url: 'https://github.com/test/repo/pull/123',
      status: 'open',
      state: 'open',
      number: 123,
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-16T15:30:00Z'),
      mergedAt: null,
      closedAt: null,
      author: {
        login: 'johndoe',
        avatarUrl: 'https://github.com/johndoe.avatar',
        name: 'John Doe',
        email: 'john.doe@example.com'
      },
      reviewers: [
        {
          login: 'janedoe',
          avatarUrl: 'https://github.com/janedoe.avatar',
          name: 'Jane Doe',
          email: 'jane.doe@example.com',
          state: 'APPROVED'
        }
      ],
      assignees: [],
      labels: ['feature', 'authentication', 'security'],
      milestones: [],
      commits: [
        {
          sha: 'abc123def456',
          message: 'Add OAuth integration',
          author: {
            login: 'johndoe',
            avatarUrl: 'https://github.com/johndoe.avatar',
            name: 'John Doe',
            email: 'john.doe@example.com'
          },
          timestamp: new Date('2024-01-15T10:00:00Z'),
          additions: 250,
          deletions: 15,
          changedFiles: 8
        },
        {
          sha: 'def456ghi789',
          message: 'Add JWT token validation',
          author: {
            login: 'johndoe',
            avatarUrl: 'https://github.com/johndoe.avatar',
            name: 'John Doe',
            email: 'john.doe@example.com'
          },
          timestamp: new Date('2024-01-16T14:30:00Z'),
          additions: 180,
          deletions: 25,
          changedFiles: 5
        }
      ],
      files: [
        {
          filename: 'src/auth/oauth.ts',
          status: 'added',
          additions: 120,
          deletions: 0,
          changes: 120,
          patch: `+export class OAuthProvider {
+  constructor(private config: OAuthConfig) {}
+  
+  async authenticate(code: string): Promise<AuthResult> {
+    // Implementation
+  }
+}`
        },
        {
          filename: 'src/auth/jwt.ts',
          status: 'added',
          additions: 95,
          deletions: 0,
          changes: 95,
          patch: `+export class JWTValidator {
+  validate(token: string): boolean {
+    // Implementation
+  }
+}`
        },
        {
          filename: 'src/middleware/auth.ts',
          status: 'modified',
          additions: 45,
          deletions: 20,
          changes: 65,
          patch: `-export const oldAuthMiddleware = () => {
-  // Old implementation
-}
+export const authMiddleware = () => {
+  // New implementation with JWT
+}`
        }
      ],
      reviews: [
        {
          id: 'review-456',
          reviewer: {
            login: 'janedoe',
            avatarUrl: 'https://github.com/janedoe.avatar',
            name: 'Jane Doe',
            email: 'jane.doe@example.com'
          },
          state: 'APPROVED',
          submittedAt: new Date('2024-01-16T16:00:00Z'),
          body: 'Great implementation! The OAuth integration looks solid.',
          comments: []
        }
      ],
      checks: [
        {
          name: 'ci/tests',
          status: 'completed',
          conclusion: 'success',
          startedAt: new Date('2024-01-16T15:45:00Z'),
          completedAt: new Date('2024-01-16T15:50:00Z'),
          detailsUrl: 'https://github.com/test/repo/actions/runs/123'
        },
        {
          name: 'security-scan',
          status: 'completed',
          conclusion: 'success',
          startedAt: new Date('2024-01-16T15:50:00Z'),
          completedAt: new Date('2024-01-16T15:55:00Z'),
          detailsUrl: 'https://github.com/test/repo/actions/runs/124'
        }
      ],
      metrics: {
        totalAdditions: 430,
        totalDeletions: 40,
        totalChanges: 470,
        filesChanged: 13,
        commitsCount: 2,
        reviewersCount: 1,
        conversationLength: 1,
        timeToMerge: null,
        complexity: 'moderate'
      },
      ...overrides
    };
  }

  static createMockScriptConfig(overrides: Partial<ScriptGenerationConfig> = {}): ScriptGenerationConfig {
    return {
      templateType: 'detailed',
      targetDuration: 420, // 7 minutes
      audience: {
        primary: 'engineering',
        secondary: ['product'],
        technicalLevel: 'intermediate',
        familiarityLevel: 'familiar',
        communicationStyle: 'conversational',
        interests: ['implementation', 'best_practices']
      },
      contentSelection: {
        name: 'balanced_selection',
        criteria: {
          importanceThreshold: 0.6,
          relevanceScoring: {
            factors: ['code_impact', 'review_feedback'],
            algorithm: 'weighted_sum',
            normalization: 'min_max'
          },
          freshnessWeight: 0.3,
          audienceAlignmentWeight: 0.6
        },
        prioritization: ['high_impact_files', 'core_changes', 'review_highlights'],
        filtering: ['exclude_minor_formatting'],
        adaptation: ['technical_depth', 'code_examples']
      },
      ...overrides
    };
  }

  static createComplexPRMetadata(): VideoMetadata {
    return this.createMockVideoMetadata({
      title: 'Refactor database layer and implement caching strategy',
      description: 'Major refactoring of the database layer with Redis caching implementation and performance optimizations',
      commits: Array.from({ length: 12 }, (_, i) => ({
        sha: `commit${i + 1}abc`,
        message: `Commit ${i + 1}: Database refactoring step ${i + 1}`,
        author: {
          login: 'developer',
          avatarUrl: 'https://github.com/developer.avatar',
          name: 'Developer',
          email: 'dev@example.com'
        },
        timestamp: new Date(Date.now() - (12 - i) * 24 * 60 * 60 * 1000),
        additions: Math.floor(Math.random() * 200) + 50,
        deletions: Math.floor(Math.random() * 100) + 10,
        changedFiles: Math.floor(Math.random() * 8) + 2
      })),
      files: Array.from({ length: 25 }, (_, i) => ({
        filename: `src/database/module${i + 1}.ts`,
        status: i < 5 ? 'added' : i < 15 ? 'modified' : 'deleted',
        additions: Math.floor(Math.random() * 150) + 20,
        deletions: Math.floor(Math.random() * 80) + 5,
        changes: Math.floor(Math.random() * 200) + 25,
        patch: `Sample patch content for file ${i + 1}`
      })),
      metrics: {
        totalAdditions: 2500,
        totalDeletions: 800,
        totalChanges: 3300,
        filesChanged: 25,
        commitsCount: 12,
        reviewersCount: 4,
        conversationLength: 45,
        timeToMerge: null,
        complexity: 'high'
      }
    });
  }

  static createSimplePRMetadata(): VideoMetadata {
    return this.createMockVideoMetadata({
      title: 'Fix typo in README',
      description: 'Correct spelling error in documentation',
      commits: [
        {
          sha: 'simple123',
          message: 'Fix typo in README.md',
          author: {
            login: 'contributor',
            avatarUrl: 'https://github.com/contributor.avatar',
            name: 'Contributor',
            email: 'contributor@example.com'
          },
          timestamp: new Date(),
          additions: 1,
          deletions: 1,
          changedFiles: 1
        }
      ],
      files: [
        {
          filename: 'README.md',
          status: 'modified',
          additions: 1,
          deletions: 1,
          changes: 2,
          patch: `-This is a typoo in the documentation.
+This is a typo in the documentation.`
        }
      ],
      metrics: {
        totalAdditions: 1,
        totalDeletions: 1,
        totalChanges: 2,
        filesChanged: 1,
        commitsCount: 1,
        reviewersCount: 0,
        conversationLength: 0,
        timeToMerge: null,
        complexity: 'low'
      }
    });
  }
}

// Performance measurement utilities
export class PerformanceTracker {
  private measurements: Map<string, number> = new Map();

  start(label: string): void {
    this.measurements.set(label, performance.now());
  }

  end(label: string): number {
    const startTime = this.measurements.get(label);
    if (!startTime) {
      throw new Error(`No measurement started for label: ${label}`);
    }
    const duration = performance.now() - startTime;
    this.measurements.delete(label);
    return duration;
  }

  measure<T>(label: string, fn: () => T): T {
    this.start(label);
    try {
      const result = fn();
      this.end(label);
      return result;
    } catch (error) {
      this.measurements.delete(label);
      throw error;
    }
  }

  async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    try {
      const result = await fn();
      this.end(label);
      return result;
    } catch (error) {
      this.measurements.delete(label);
      throw error;
    }
  }
}

// Assertion utilities for video content
export class VideoAssertions {
  static assertScriptValid(script: VideoScript): void {
    expect(script).toBeDefined();
    expect(script.id).toBeTruthy();
    expect(script.title).toBeTruthy();
    expect(script.sections).toBeInstanceOf(Array);
    expect(script.sections.length).toBeGreaterThan(0);
    expect(script.targetDuration).toBeGreaterThan(0);
    expect(script.metadata).toBeDefined();
    expect(script.audience).toBeDefined();
    expect(script.style).toBeDefined();
  }

  static assertSectionValid(section: any): void {
    expect(section.id).toBeTruthy();
    expect(section.type).toBeTruthy();
    expect(section.title).toBeTruthy();
    expect(section.content).toBeTruthy();
    expect(section.duration).toBeGreaterThan(0);
    expect(section.priority).toBeDefined();
    expect(section.voiceover).toBeTruthy();
    expect(section.visualCues).toBeInstanceOf(Array);
  }

  static assertDurationCompliance(
    script: VideoScript,
    targetDuration: number,
    tolerance: number = 0.2
  ): void {
    const totalDuration = script.sections.reduce((sum, section) => sum + section.duration, 0);
    const deviation = Math.abs(totalDuration - targetDuration) / targetDuration;
    expect(deviation).toBeLessThanOrEqual(tolerance);
  }

  static assertAudienceAlignment(script: VideoScript, audience: ScriptAudience): void {
    expect(script.audience.primary).toBe(audience.primary);
    expect(script.audience.technicalLevel).toBe(audience.technicalLevel);
    
    // Check for appropriate technical content based on audience
    const technicalSections = script.sections.filter(s => 
      ['technical_details', 'code_changes', 'file_analysis'].includes(s.type)
    );
    
    if (audience.technicalLevel === 'beginner') {
      expect(technicalSections.length).toBeLessThanOrEqual(2);
    } else if (audience.technicalLevel === 'expert') {
      expect(technicalSections.length).toBeGreaterThanOrEqual(2);
    }
  }

  static assertVisualCuesPresent(script: VideoScript): void {
    script.sections.forEach(section => {
      expect(section.visualCues.length).toBeGreaterThan(0);
      section.visualCues.forEach(cue => {
        expect(cue.type).toBeTruthy();
        expect(cue.description).toBeTruthy();
        expect(cue.duration).toBeGreaterThan(0);
        expect(cue.timestamp).toBeGreaterThanOrEqual(0);
      });
    });
  }
}

// Component testing utilities
export class ComponentTestUtils {
  static renderWithMockProps<T>(
    Component: React.ComponentType<T>,
    props: T,
    mockOverrides: any = {}
  ): any {
    // Mock Remotion hooks
    const mockFrame = mockOverrides.frame || 30;
    const mockConfig = mockOverrides.config || {
      fps: 30,
      durationInFrames: 240,
      width: 1920,
      height: 1080
    };

    (useCurrentFrame as jest.Mock).mockReturnValue(mockFrame);
    (useVideoConfig as jest.Mock).mockReturnValue(mockConfig);
    (interpolate as jest.Mock).mockImplementation((input, inputRange, outputRange) => {
      const factor = (input - inputRange[0]) / (inputRange[1] - inputRange[0]);
      return outputRange[0] + factor * (outputRange[1] - outputRange[0]);
    });
    (spring as jest.Mock).mockReturnValue(mockOverrides.spring || 1);

    return Component;
  }

  static createTestProps<T>(baseProps: T, overrides: Partial<T> = {}): T {
    return { ...baseProps, ...overrides };
  }

  static expectAnimationProperties(element: any, expectedProperties: string[]): void {
    expectedProperties.forEach(property => {
      expect(element.props.style).toHaveProperty(property);
    });
  }

  static expectComponentStructure(element: any, expectedStructure: any): void {
    Object.keys(expectedStructure).forEach(key => {
      expect(element.props).toHaveProperty(key);
    });
  }
}

// Integration test helpers
export class IntegrationTestHelpers {
  static async waitForAsyncOperation(
    operation: () => Promise<any>,
    timeout: number = 5000
  ): Promise<any> {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Operation timed out')), timeout);
    });

    return Promise.race([operation(), timeoutPromise]);
  }

  static expectNoErrors(result: any): void {
    expect(result.errors).toBeInstanceOf(Array);
    expect(result.errors.length).toBe(0);
  }

  static expectWarnings(result: any, expectedCount?: number): void {
    expect(result.warnings).toBeInstanceOf(Array);
    if (expectedCount !== undefined) {
      expect(result.warnings.length).toBe(expectedCount);
    }
  }

  static expectSuccessfulGeneration(result: any): void {
    expect(result.success).toBe(true);
    this.expectNoErrors(result);
    expect(result.script).toBeDefined();
    expect(result.performance).toBeDefined();
  }

  static createPerformanceBenchmark(expectedBenchmarks: Record<string, number>): (result: any) => void {
    return (result: any) => {
      expect(result.performance).toBeDefined();
      Object.entries(expectedBenchmarks).forEach(([metric, maxTime]) => {
        expect(result.performance[metric]).toBeLessThanOrEqual(maxTime);
      });
    };
  }
}

// Export all utilities for easy import
export {
  mockRemotionHooks,
  TestDataBuilder,
  PerformanceTracker,
  VideoAssertions,
  ComponentTestUtils,
  IntegrationTestHelpers
};