/**
 * Main GitHub API integration service
 * Combines client, fetcher, transformer, error handling, and logging
 */

import { GitHubApiClient } from './client';
import { GitHubPRFetcher } from './fetcher';
import { PRVideoTransformer, VideoMetadata } from './transformer';
import { GitHubErrorHandler, GitHubCircuitBreaker } from './errorHandler';
import { GitHubLogger } from './logger';
import { GitHubConfig, FetchOptions, PRVideoData } from './types';

export interface GitHubIntegrationConfig extends GitHubConfig {
  enableCircuitBreaker?: boolean;
  enableDetailedLogging?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  maxLogEntries?: number;
}

export class GitHubIntegration {
  private client: GitHubApiClient;
  private fetcher: GitHubPRFetcher;
  private transformer: PRVideoTransformer;
  private errorHandler: GitHubErrorHandler;
  private circuitBreaker?: GitHubCircuitBreaker;
  private logger: GitHubLogger;

  constructor(config: GitHubIntegrationConfig) {
    // Initialize logger first
    this.logger = new GitHubLogger({
      maxLogEntries: config.maxLogEntries,
      logLevel: config.logLevel || 'info',
    });

    this.logger.info('Initializing GitHub Integration', {
      baseUrl: config.baseUrl,
      enableCircuitBreaker: config.enableCircuitBreaker,
      enableDetailedLogging: config.enableDetailedLogging,
    });

    // Initialize error handler
    this.errorHandler = new GitHubErrorHandler({
      maxAttempts: config.retryAttempts || 3,
      baseDelay: config.retryDelay || 1000,
    });

    // Initialize circuit breaker if enabled
    if (config.enableCircuitBreaker) {
      this.circuitBreaker = new GitHubCircuitBreaker();
    }

    // Initialize API client
    this.client = new GitHubApiClient(config);

    // Initialize fetcher and transformer
    this.fetcher = new GitHubPRFetcher(this.client);
    this.transformer = new PRVideoTransformer();

    this.logger.info('GitHub Integration initialized successfully');
  }

  /**
   * Generate video metadata for a pull request
   */
  async generatePRVideo(
    owner: string,
    repo: string,
    prNumber: number,
    options: FetchOptions & { videoType?: 'summary' | 'detailed' | 'technical' } = {}
  ): Promise<VideoMetadata> {
    const tracker = this.logger.startPerformanceTracking('generatePRVideo', `${owner}/${repo}#${prNumber}`);
    
    try {
      this.logger.info(`Starting PR video generation for ${owner}/${repo}#${prNumber}`, {
        options,
      });

      // Fetch PR data with error handling and circuit breaking
      const prData = await this.executeWithErrorHandling(
        () => this.fetcher.fetchPRData(owner, repo, prNumber, options),
        'fetchPRData',
        `${owner}/${repo}#${prNumber}`
      );

      // Transform data for video generation
      const videoMetadata = this.transformer.transform(
        prData,
        options.videoType || 'summary'
      );

      this.logger.info('PR video generation completed successfully', {
        prNumber,
        scenesGenerated: videoMetadata.scenes.length,
        estimatedDuration: videoMetadata.duration,
        participantCount: videoMetadata.participants.length,
      });

      tracker.complete(true, {
        scenesGenerated: videoMetadata.scenes.length,
        participantCount: videoMetadata.participants.length,
      });

      return videoMetadata;
    } catch (error) {
      this.logger.error(`Failed to generate PR video for ${owner}/${repo}#${prNumber}`, {
        error: (error as Error).message,
      });

      tracker.error(error as Error);
      throw error;
    }
  }

  /**
   * Get comprehensive PR data without video transformation
   */
  async getPRData(
    owner: string,
    repo: string,
    prNumber: number,
    options: FetchOptions = {}
  ): Promise<PRVideoData> {
    const tracker = this.logger.startPerformanceTracking('getPRData', `${owner}/${repo}#${prNumber}`);
    
    try {
      this.logger.info(`Fetching PR data for ${owner}/${repo}#${prNumber}`);

      const prData = await this.executeWithErrorHandling(
        () => this.fetcher.fetchPRData(owner, repo, prNumber, options),
        'fetchPRData',
        `${owner}/${repo}#${prNumber}`
      );

      this.logger.info('PR data fetched successfully', {
        commits: prData.commits.length,
        files: prData.files.length,
        reviews: prData.reviews.length,
        participants: prData.participants.length,
      });

      tracker.complete(true);
      return prData;
    } catch (error) {
      this.logger.error(`Failed to fetch PR data for ${owner}/${repo}#${prNumber}`, {
        error: (error as Error).message,
      });

      tracker.error(error as Error);
      throw error;
    }
  }

  /**
   * Check if repository is accessible
   */
  async checkRepositoryAccess(owner: string, repo: string): Promise<boolean> {
    const tracker = this.logger.startPerformanceTracking('checkRepositoryAccess', `${owner}/${repo}`);
    
    try {
      const hasAccess = await this.executeWithErrorHandling(
        () => this.client.checkRepositoryAccess(owner, repo),
        'checkRepositoryAccess',
        `${owner}/${repo}`
      );

      this.logger.info(`Repository access check for ${owner}/${repo}`, {
        hasAccess,
      });

      tracker.complete(true, { hasAccess });
      return hasAccess;
    } catch (error) {
      this.logger.warn(`Repository access check failed for ${owner}/${repo}`, {
        error: (error as Error).message,
      });

      tracker.error(error as Error);
      return false;
    }
  }

  /**
   * Get current rate limit status
   */
  async getRateLimit(): Promise<any> {
    const tracker = this.logger.startPerformanceTracking('getRateLimit');
    
    try {
      const rateLimit = await this.executeWithErrorHandling(
        () => this.client.getRateLimit(),
        'getRateLimit'
      );

      // Record rate limit metrics
      this.logger.recordRateLimit({
        timestamp: new Date(),
        remaining: rateLimit.resources.core.remaining,
        limit: rateLimit.resources.core.limit,
        reset: new Date(rateLimit.resources.core.reset * 1000),
        resource: 'core',
      });

      tracker.complete(true);
      return rateLimit;
    } catch (error) {
      this.logger.error('Failed to fetch rate limit', {
        error: (error as Error).message,
      });

      tracker.error(error as Error);
      throw error;
    }
  }

  /**
   * Get system health and monitoring data
   */
  getSystemHealth(): {
    health: ReturnType<GitHubLogger['getHealthReport']>;
    circuitBreakerStatus?: ReturnType<GitHubCircuitBreaker['getState']>;
    errorStatistics: ReturnType<GitHubErrorHandler['getErrorStatistics']>;
  } {
    const health = this.logger.getHealthReport();
    const circuitBreakerStatus = this.circuitBreaker?.getState();
    const errorStatistics = this.errorHandler.getErrorStatistics();

    this.logger.debug('System health check requested', {
      status: health.status,
      circuitBreakerState: circuitBreakerStatus?.state,
      totalErrors: errorStatistics.totalErrors,
    });

    return {
      health,
      circuitBreakerStatus,
      errorStatistics,
    };
  }

  /**
   * Export system logs and metrics
   */
  exportDiagnostics(format: 'json' | 'csv' = 'json'): string {
    this.logger.info('Exporting system diagnostics', { format });
    
    const logs = this.logger.exportLogs(format);
    const health = this.getSystemHealth();
    
    if (format === 'json') {
      return JSON.stringify({
        logs: JSON.parse(logs),
        health,
        exportedAt: new Date().toISOString(),
      }, null, 2);
    }
    
    return logs; // CSV format
  }

  /**
   * Clear all logs and metrics (useful for testing)
   */
  clearDiagnostics(): void {
    this.logger.info('Clearing all diagnostics data');
    this.errorHandler.clearErrorHistory();
    this.circuitBreaker?.reset();
  }

  /**
   * Execute operation with comprehensive error handling
   */
  private async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    operationName: string,
    endpoint?: string
  ): Promise<T> {
    const context = {
      operation: operationName,
      endpoint: endpoint || 'unknown',
      params: {},
    };

    if (this.circuitBreaker) {
      return this.circuitBreaker.execute(async () => {
        return this.errorHandler.executeWithRetry(operation, context);
      });
    } else {
      return this.errorHandler.executeWithRetry(operation, context);
    }
  }
}

// Export all types and classes for external use
export * from './types';
export * from './client';
export * from './fetcher';
export * from './transformer';
export * from './errorHandler';
export * from './logger';

// Convenience function to create a GitHub integration instance
export function createGitHubIntegration(config: GitHubIntegrationConfig): GitHubIntegration {
  return new GitHubIntegration(config);
}

// Default configuration
export const defaultConfig: Partial<GitHubIntegrationConfig> = {
  baseUrl: 'https://api.github.com',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  rateLimitBuffer: 10,
  enableCircuitBreaker: true,
  enableDetailedLogging: true,
  logLevel: 'info',
  maxLogEntries: 1000,
};