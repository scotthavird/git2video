/**
 * Integration tests for GitHub integration service
 */

import { GitHubIntegration, createGitHubIntegration } from '../index';
import { GitHubApiClient } from '../client';
import { GitHubPRFetcher } from '../fetcher';

// Mock all dependencies
jest.mock('../client');
jest.mock('../fetcher');
jest.mock('../transformer');
jest.mock('../errorHandler');
jest.mock('../logger');

describe('GitHubIntegration', () => {
  let integration: GitHubIntegration;
  const mockConfig = {
    token: 'test-token',
    enableCircuitBreaker: true,
    enableDetailedLogging: true,
    logLevel: 'info' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    integration = new GitHubIntegration(mockConfig);
  });

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      expect(integration).toBeDefined();
    });

    it('should initialize with custom configuration', () => {
      const customConfig = {
        ...mockConfig,
        timeout: 60000,
        retryAttempts: 5,
        enableCircuitBreaker: false,
      };

      const customIntegration = new GitHubIntegration(customConfig);
      expect(customIntegration).toBeDefined();
    });
  });

  describe('generatePRVideo', () => {
    beforeEach(() => {
      // Mock the fetcher to return test data
      const mockFetcher = GitHubPRFetcher as jest.MockedClass<typeof GitHubPRFetcher>;
      mockFetcher.prototype.fetchPRData = jest.fn().mockResolvedValue({
        pullRequest: { id: 1, number: 1, title: 'Test PR' },
        repository: { id: 1, name: 'test-repo' },
        commits: [],
        files: [],
        reviews: [],
        reviewComments: [],
        issueComments: [],
        timeline: [],
        participants: [],
        codeStats: {
          totalAdditions: 10,
          totalDeletions: 5,
          totalFiles: 2,
          languageBreakdown: { JavaScript: 15 },
          fileTypes: { js: 2 },
        },
        reviewStats: {
          approvals: 0,
          changesRequested: 0,
          comments: 0,
          averageReviewTime: 0,
        },
        timelineStats: {
          createdAt: new Date(),
          lastUpdateAt: new Date(),
          totalDuration: 0,
        },
      });
    });

    it('should generate video metadata for a PR', async () => {
      const result = await integration.generatePRVideo('owner', 'repo', 1);

      expect(result).toBeDefined();
      expect(result.title).toBeDefined();
      expect(result.scenes).toBeDefined();
      expect(result.keyMetrics).toBeDefined();
    });

    it('should handle different video types', async () => {
      const summaryResult = await integration.generatePRVideo('owner', 'repo', 1, {
        videoType: 'summary',
      });

      const detailedResult = await integration.generatePRVideo('owner', 'repo', 1, {
        videoType: 'detailed',
      });

      expect(summaryResult).toBeDefined();
      expect(detailedResult).toBeDefined();
    });

    it('should handle fetch options', async () => {
      const result = await integration.generatePRVideo('owner', 'repo', 1, {
        includeCommits: true,
        includeFiles: true,
        includeReviews: false,
        parallel: true,
        maxConcurrency: 3,
      });

      expect(result).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      const mockFetcher = GitHubPRFetcher as jest.MockedClass<typeof GitHubPRFetcher>;
      mockFetcher.prototype.fetchPRData = jest.fn().mockRejectedValue(
        new Error('API Error')
      );

      await expect(
        integration.generatePRVideo('owner', 'repo', 1)
      ).rejects.toThrow('API Error');
    });
  });

  describe('getPRData', () => {
    beforeEach(() => {
      const mockFetcher = GitHubPRFetcher as jest.MockedClass<typeof GitHubPRFetcher>;
      mockFetcher.prototype.fetchPRData = jest.fn().mockResolvedValue({
        pullRequest: { id: 1, number: 1, title: 'Test PR' },
        repository: { id: 1, name: 'test-repo' },
        commits: [{ sha: 'abc123' }],
        files: [{ filename: 'test.js' }],
        reviews: [],
        reviewComments: [],
        issueComments: [],
        timeline: [],
        participants: [],
        codeStats: {
          totalAdditions: 10,
          totalDeletions: 5,
          totalFiles: 1,
          languageBreakdown: {},
          fileTypes: {},
        },
        reviewStats: {
          approvals: 0,
          changesRequested: 0,
          comments: 0,
          averageReviewTime: 0,
        },
        timelineStats: {
          createdAt: new Date(),
          lastUpdateAt: new Date(),
          totalDuration: 0,
        },
      });
    });

    it('should fetch PR data without transformation', async () => {
      const result = await integration.getPRData('owner', 'repo', 1);

      expect(result).toBeDefined();
      expect(result.pullRequest).toBeDefined();
      expect(result.repository).toBeDefined();
      expect(result.commits).toHaveLength(1);
      expect(result.files).toHaveLength(1);
    });

    it('should pass fetch options correctly', async () => {
      const options = {
        includeCommits: false,
        includeFiles: true,
        parallel: false,
      };

      await integration.getPRData('owner', 'repo', 1, options);

      const mockFetcher = GitHubPRFetcher as jest.MockedClass<typeof GitHubPRFetcher>;
      expect(mockFetcher.prototype.fetchPRData).toHaveBeenCalledWith(
        'owner',
        'repo',
        1,
        options
      );
    });
  });

  describe('checkRepositoryAccess', () => {
    beforeEach(() => {
      const mockClient = GitHubApiClient as jest.MockedClass<typeof GitHubApiClient>;
      mockClient.prototype.checkRepositoryAccess = jest.fn().mockResolvedValue(true);
    });

    it('should check repository access', async () => {
      const hasAccess = await integration.checkRepositoryAccess('owner', 'repo');

      expect(hasAccess).toBe(true);
      expect(GitHubApiClient.prototype.checkRepositoryAccess).toHaveBeenCalledWith(
        'owner',
        'repo'
      );
    });

    it('should handle access check errors', async () => {
      const mockClient = GitHubApiClient as jest.MockedClass<typeof GitHubApiClient>;
      mockClient.prototype.checkRepositoryAccess = jest.fn().mockRejectedValue(
        new Error('Access denied')
      );

      const hasAccess = await integration.checkRepositoryAccess('owner', 'repo');
      expect(hasAccess).toBe(false);
    });
  });

  describe('getRateLimit', () => {
    beforeEach(() => {
      const mockClient = GitHubApiClient as jest.MockedClass<typeof GitHubApiClient>;
      mockClient.prototype.getRateLimit = jest.fn().mockResolvedValue({
        resources: {
          core: {
            limit: 5000,
            remaining: 4500,
            reset: Math.floor(Date.now() / 1000) + 3600,
            used: 500,
            resource: 'core',
          },
        },
        rate: {
          limit: 5000,
          remaining: 4500,
          reset: Math.floor(Date.now() / 1000) + 3600,
          used: 500,
          resource: 'core',
        },
      });
    });

    it('should fetch rate limit information', async () => {
      const rateLimit = await integration.getRateLimit();

      expect(rateLimit).toBeDefined();
      expect(rateLimit.resources.core.limit).toBe(5000);
      expect(rateLimit.resources.core.remaining).toBe(4500);
    });
  });

  describe('getSystemHealth', () => {
    it('should return system health information', () => {
      const health = integration.getSystemHealth();

      expect(health).toBeDefined();
      expect(health.health).toBeDefined();
      expect(health.errorStatistics).toBeDefined();
    });

    it('should include circuit breaker status when enabled', () => {
      const health = integration.getSystemHealth();

      expect(health.circuitBreakerStatus).toBeDefined();
    });
  });

  describe('exportDiagnostics', () => {
    it('should export diagnostics in JSON format', () => {
      const diagnostics = integration.exportDiagnostics('json');

      expect(typeof diagnostics).toBe('string');
      expect(() => JSON.parse(diagnostics)).not.toThrow();
    });

    it('should export diagnostics in CSV format', () => {
      const diagnostics = integration.exportDiagnostics('csv');

      expect(typeof diagnostics).toBe('string');
      expect(diagnostics).toContain(','); // CSV should contain commas
    });
  });

  describe('clearDiagnostics', () => {
    it('should clear all diagnostic data', () => {
      expect(() => integration.clearDiagnostics()).not.toThrow();
    });
  });
});

describe('createGitHubIntegration', () => {
  it('should create integration instance with convenience function', () => {
    const integration = createGitHubIntegration({
      token: 'test-token',
      enableCircuitBreaker: false,
    });

    expect(integration).toBeInstanceOf(GitHubIntegration);
  });
});

describe('Integration workflow tests', () => {
  let integration: GitHubIntegration;

  beforeEach(() => {
    // Reset all mocks for workflow tests
    jest.clearAllMocks();

    // Setup realistic mock responses
    const mockClient = GitHubApiClient as jest.MockedClass<typeof GitHubApiClient>;
    mockClient.prototype.checkRepositoryAccess = jest.fn().mockResolvedValue(true);
    mockClient.prototype.getRateLimit = jest.fn().mockResolvedValue({
      resources: {
        core: {
          limit: 5000,
          remaining: 4000,
          reset: Math.floor(Date.now() / 1000) + 3600,
          used: 1000,
          resource: 'core',
        },
      },
    });

    const mockFetcher = GitHubPRFetcher as jest.MockedClass<typeof GitHubPRFetcher>;
    mockFetcher.prototype.fetchPRData = jest.fn().mockResolvedValue({
      pullRequest: {
        id: 123,
        number: 1,
        title: 'Add user authentication',
        state: 'open',
        merged: false,
      },
      repository: {
        id: 456,
        name: 'web-app',
        full_name: 'company/web-app',
      },
      commits: [
        { sha: 'abc123', commit: { message: 'Add login form' } },
        { sha: 'def456', commit: { message: 'Add password validation' } },
      ],
      files: [
        { filename: 'src/auth.js', status: 'added', changes: 120 },
        { filename: 'src/login.js', status: 'added', changes: 80 },
      ],
      reviews: [
        { id: 1, state: 'APPROVED', user: { login: 'reviewer1' } },
      ],
      reviewComments: [],
      issueComments: [],
      timeline: [],
      participants: [
        { id: 1, login: 'developer1' },
        { id: 2, login: 'reviewer1' },
      ],
      codeStats: {
        totalAdditions: 200,
        totalDeletions: 20,
        totalFiles: 2,
        languageBreakdown: { JavaScript: 200 },
        fileTypes: { js: 2 },
      },
      reviewStats: {
        approvals: 1,
        changesRequested: 0,
        comments: 0,
        averageReviewTime: 4,
      },
      timelineStats: {
        createdAt: new Date('2023-01-01T10:00:00Z'),
        firstReviewAt: new Date('2023-01-01T14:00:00Z'),
        lastUpdateAt: new Date('2023-01-01T16:00:00Z'),
        totalDuration: 6 * 60 * 60 * 1000, // 6 hours
        reviewDuration: 4 * 60 * 60 * 1000, // 4 hours
      },
    });

    integration = new GitHubIntegration({
      token: 'test-token',
      enableCircuitBreaker: true,
      logLevel: 'info',
    });
  });

  it('should complete full PR video generation workflow', async () => {
    // 1. Check repository access
    const hasAccess = await integration.checkRepositoryAccess('company', 'web-app');
    expect(hasAccess).toBe(true);

    // 2. Check rate limits
    const rateLimit = await integration.getRateLimit();
    expect(rateLimit.resources.core.remaining).toBeGreaterThan(0);

    // 3. Generate PR video
    const videoMetadata = await integration.generatePRVideo('company', 'web-app', 1, {
      videoType: 'summary',
      includeCommits: true,
      includeFiles: true,
      includeReviews: true,
      parallel: true,
    });

    expect(videoMetadata).toBeDefined();
    expect(videoMetadata.title).toContain('Add user authentication');
    expect(videoMetadata.scenes).toBeDefined();
    expect(videoMetadata.keyMetrics.totalCommits).toBe(2);

    // 4. Check system health
    const health = integration.getSystemHealth();
    expect(health.health.status).toBeDefined();
    expect(health.circuitBreakerStatus).toBeDefined();
  });

  it('should handle complete error recovery workflow', async () => {
    // Simulate initial failure followed by success
    const mockFetcher = GitHubPRFetcher as jest.MockedClass<typeof GitHubPRFetcher>;
    mockFetcher.prototype.fetchPRData = jest.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Temporary failure'))
      .mockResolvedValueOnce({
        pullRequest: { id: 1, number: 1, title: 'Test PR' },
        repository: { id: 1, name: 'test-repo' },
        commits: [],
        files: [],
        reviews: [],
        reviewComments: [],
        issueComments: [],
        timeline: [],
        participants: [],
        codeStats: {
          totalAdditions: 0,
          totalDeletions: 0,
          totalFiles: 0,
          languageBreakdown: {},
          fileTypes: {},
        },
        reviewStats: {
          approvals: 0,
          changesRequested: 0,
          comments: 0,
          averageReviewTime: 0,
        },
        timelineStats: {
          createdAt: new Date(),
          lastUpdateAt: new Date(),
          totalDuration: 0,
        },
      });

    // Should eventually succeed after retries
    const result = await integration.generatePRVideo('company', 'web-app', 1);
    expect(result).toBeDefined();

    // Check that error statistics were recorded
    const health = integration.getSystemHealth();
    expect(health.errorStatistics.totalErrors).toBeGreaterThan(0);
  });
});