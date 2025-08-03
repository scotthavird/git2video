/**
 * Simple integration test for GitHub API client
 */

import { createGitHubIntegration } from '../index';
import { GitHubApiClient } from '../client';

// Mock fetch globally
global.fetch = jest.fn();

describe('GitHub Integration - Simple Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createGitHubIntegration', () => {
    it('should create integration with default config', () => {
      const integration = createGitHubIntegration({
        token: 'test-token',
      });

      expect(integration).toBeDefined();
      expect(integration).toHaveProperty('client');
    });

    it('should create integration with custom config', () => {
      const integration = createGitHubIntegration({
        token: 'test-token',
        enableCircuitBreaker: true,
        logLevel: 'debug',
      });

      expect(integration).toBeDefined();
      expect(integration).toHaveProperty('client');
    });
  });

  describe('Basic functionality', () => {
    it('should have all required methods', () => {
      const integration = createGitHubIntegration({
        token: 'test-token',
      });

      expect(typeof integration.generatePRVideo).toBe('function');
      expect(typeof integration.getPRData).toBe('function');
      expect(typeof integration.checkRepositoryAccess).toBe('function');
      expect(typeof integration.getSystemHealth).toBe('function');
    });

    it('should handle health check', () => {
      const integration = createGitHubIntegration({
        token: 'test-token',
      });

      const health = integration.getSystemHealth();
      
      expect(health).toBeDefined();
      expect(health.health).toBeDefined();
      expect(health.errorStatistics).toBeDefined();
    });
  });
});