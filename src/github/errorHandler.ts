/**
 * Comprehensive error handling and retry logic for GitHub API integration
 */

import {
  GitHubApiRateLimitError,
  GitHubApiAuthenticationError,
  GitHubApiNotFoundError,
  GitHubApiFetchError,
} from './types';

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableStatusCodes: number[];
  retryableErrors: string[];
}

export interface ErrorContext {
  operation: string;
  endpoint: string;
  params?: Record<string, any>;
  attempt: number;
  totalAttempts: number;
  startTime: number;
}

export interface ErrorReport {
  error: Error;
  context: ErrorContext;
  recoverable: boolean;
  suggestedAction: string;
  retryAfter?: number;
}

export class GitHubErrorHandler {
  private config: RetryConfig;
  private errorReports: ErrorReport[] = [];

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffFactor: 2,
      retryableStatusCodes: [429, 500, 502, 503, 504],
      retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN'],
      ...config,
    };
  }

  /**
   * Execute operation with comprehensive error handling and retry logic
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: Omit<ErrorContext, 'attempt' | 'totalAttempts' | 'startTime'>
  ): Promise<T> {
    const fullContext: ErrorContext = {
      ...context,
      attempt: 0,
      totalAttempts: this.config.maxAttempts,
      startTime: Date.now(),
    };

    let lastError: Error;

    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      fullContext.attempt = attempt;

      try {
        const result = await operation();
        
        // Log successful recovery if there were previous failures
        if (attempt > 1) {
          console.log(`✅ Operation succeeded on attempt ${attempt}/${this.config.maxAttempts} after ${Date.now() - fullContext.startTime}ms`);
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        const errorReport = this.analyzeError(lastError, fullContext);
        this.errorReports.push(errorReport);

        console.warn(`❌ Attempt ${attempt}/${this.config.maxAttempts} failed:`, {
          operation: context.operation,
          endpoint: context.endpoint,
          error: lastError.message,
          recoverable: errorReport.recoverable,
          suggestedAction: errorReport.suggestedAction,
        });

        // Don't retry if error is not recoverable
        if (!errorReport.recoverable) {
          throw this.enhanceError(lastError, fullContext);
        }

        // Don't wait after the last attempt
        if (attempt < this.config.maxAttempts) {
          const delay = this.calculateDelay(attempt, errorReport);
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await this.sleep(delay);
        }
      }
    }

    // All attempts failed
    throw this.enhanceError(lastError!, fullContext);
  }

  /**
   * Analyze error to determine if it's recoverable and suggest actions
   */
  analyzeError(error: Error, context: ErrorContext): ErrorReport {
    let recoverable = false;
    let suggestedAction = 'No automatic recovery available';
    let retryAfter: number | undefined;

    if (error instanceof GitHubApiRateLimitError) {
      recoverable = true;
      suggestedAction = `Wait until rate limit resets at ${error.resetTime.toISOString()}`;
      retryAfter = error.resetTime.getTime() - Date.now();
    } else if (error instanceof GitHubApiAuthenticationError) {
      recoverable = false;
      suggestedAction = 'Check GitHub token validity and permissions';
    } else if (error instanceof GitHubApiNotFoundError) {
      recoverable = false;
      suggestedAction = 'Verify repository and resource existence';
    } else if (error instanceof GitHubApiFetchError) {
      recoverable = this.config.retryableStatusCodes.includes(error.statusCode);
      suggestedAction = recoverable 
        ? 'Temporary server error, retrying with backoff'
        : 'Permanent error, manual intervention required';
    } else if (this.isNetworkError(error)) {
      recoverable = true;
      suggestedAction = 'Network connectivity issue, retrying with backoff';
    } else if (this.isTimeoutError(error)) {
      recoverable = true;
      suggestedAction = 'Request timeout, retrying with longer timeout';
    } else {
      // Unknown error - be conservative
      recoverable = context.attempt < 2; // Only retry once for unknown errors
      suggestedAction = 'Unknown error, limited retry attempts';
    }

    return {
      error,
      context,
      recoverable,
      suggestedAction,
      retryAfter,
    };
  }

  /**
   * Calculate delay for next retry attempt
   */
  private calculateDelay(attempt: number, errorReport: ErrorReport): number {
    // Use specific delay for rate limit errors
    if (errorReport.retryAfter && errorReport.retryAfter > 0) {
      return Math.min(errorReport.retryAfter, this.config.maxDelay);
    }

    // Exponential backoff with jitter
    const exponentialDelay = this.config.baseDelay * Math.pow(this.config.backoffFactor, attempt - 1);
    const jitter = Math.random() * 0.3 * exponentialDelay; // 30% jitter
    const delay = exponentialDelay + jitter;

    return Math.min(delay, this.config.maxDelay);
  }

  /**
   * Check if error is a network connectivity error
   */
  private isNetworkError(error: Error): boolean {
    const networkErrorCodes = ['ECONNRESET', 'ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN', 'ENETUNREACH'];
    return networkErrorCodes.some(code => error.message.includes(code));
  }

  /**
   * Check if error is a timeout error
   */
  private isTimeoutError(error: Error): boolean {
    return error.message.includes('ETIMEDOUT') || 
           error.message.includes('timeout') ||
           error.name === 'TimeoutError';
  }

  /**
   * Enhance error with additional context and debugging information
   */
  private enhanceError(error: Error, context: ErrorContext): Error {
    const enhancedMessage = `
GitHub API Error in ${context.operation}:
  Endpoint: ${context.endpoint}
  Attempt: ${context.attempt}/${context.totalAttempts}
  Duration: ${Date.now() - context.startTime}ms
  Original Error: ${error.message}
  
  Recent Error History:
${this.getRecentErrorHistory(5)}
    `.trim();

    // Create new error with enhanced message but preserve original type
    const enhancedError = new (error.constructor as any)(enhancedMessage);
    enhancedError.stack = error.stack;
    
    // Copy custom properties for GitHub API errors
    if (error instanceof GitHubApiRateLimitError) {
      (enhancedError as GitHubApiRateLimitError).resetTime = error.resetTime;
      (enhancedError as GitHubApiRateLimitError).remainingRequests = error.remainingRequests;
    } else if (error instanceof GitHubApiFetchError) {
      (enhancedError as GitHubApiFetchError).statusCode = error.statusCode;
      (enhancedError as GitHubApiFetchError).response = error.response;
    } else if (error instanceof GitHubApiNotFoundError) {
      (enhancedError as GitHubApiNotFoundError).resource = error.resource;
    }

    return enhancedError;
  }

  /**
   * Get recent error history for debugging
   */
  private getRecentErrorHistory(limit: number = 5): string {
    return this.errorReports
      .slice(-limit)
      .map((report, index) => {
        const timeAgo = Date.now() - report.context.startTime;
        return `  ${index + 1}. ${report.context.operation} (${timeAgo}ms ago): ${report.error.message}`;
      })
      .join('\n');
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get error statistics for monitoring
   */
  getErrorStatistics(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    recoveryRate: number;
    averageRetryCount: number;
    recentErrors: ErrorReport[];
  } {
    const totalErrors = this.errorReports.length;
    const errorsByType: Record<string, number> = {};
    let totalAttempts = 0;
    let successfulRecoveries = 0;

    this.errorReports.forEach(report => {
      const errorType = report.error.constructor.name;
      errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
      totalAttempts += report.context.attempt;
      
      if (report.recoverable && report.context.attempt < report.context.totalAttempts) {
        successfulRecoveries++;
      }
    });

    return {
      totalErrors,
      errorsByType,
      recoveryRate: totalErrors > 0 ? successfulRecoveries / totalErrors : 0,
      averageRetryCount: totalErrors > 0 ? totalAttempts / totalErrors : 0,
      recentErrors: this.errorReports.slice(-10),
    };
  }

  /**
   * Clear error history (useful for testing or memory management)
   */
  clearErrorHistory(): void {
    this.errorReports = [];
  }

  /**
   * Check if we should circuit-break based on recent error rate
   */
  shouldCircuitBreak(timeWindowMs: number = 300000, errorThreshold: number = 10): boolean {
    const cutoffTime = Date.now() - timeWindowMs;
    const recentErrors = this.errorReports.filter(
      report => report.context.startTime > cutoffTime
    );

    return recentErrors.length >= errorThreshold;
  }

  /**
   * Get recovery recommendations based on error patterns
   */
  getRecoveryRecommendations(): string[] {
    const recommendations: string[] = [];
    const stats = this.getErrorStatistics();

    if (stats.errorsByType['GitHubApiRateLimitError'] > 0) {
      recommendations.push('Consider implementing more aggressive rate limiting or request batching');
    }

    if (stats.errorsByType['GitHubApiAuthenticationError'] > 0) {
      recommendations.push('Verify GitHub token permissions and expiration');
    }

    if (stats.errorsByType['GitHubApiNotFoundError'] > 2) {
      recommendations.push('Check if repositories or resources have been deleted or renamed');
    }

    if (stats.recoveryRate < 0.5) {
      recommendations.push('Many errors are not recoverable - review API usage patterns');
    }

    if (stats.averageRetryCount > 2) {
      recommendations.push('High retry count suggests network or service instability');
    }

    if (this.shouldCircuitBreak()) {
      recommendations.push('CRITICAL: High error rate detected - consider circuit breaker pattern');
    }

    return recommendations.length > 0 ? recommendations : ['System appears healthy'];
  }
}

/**
 * Circuit breaker implementation for GitHub API calls
 */
export class GitHubCircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private failureThreshold: number = 5,
    private recoveryTimeoutMs: number = 60000
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeoutMs) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN - GitHub API calls temporarily disabled');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      console.warn(`🔥 Circuit breaker opened after ${this.failureCount} failures`);
    }
  }

  getState(): { state: string; failureCount: number; lastFailureTime: number } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
    };
  }

  reset(): void {
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.state = 'CLOSED';
  }
}