/**
 * Rate-limited GitHub API client with comprehensive authentication and error handling
 */

import {
  GitHubConfig,
  GitHubApiResponse,
  GitHubRateLimit,
  GitHubRateLimitResponse,
  GitHubApiError,
  GitHubApiRateLimitError,
  GitHubApiAuthenticationError,
  GitHubApiNotFoundError,
  GitHubApiFetchError,
} from './types';

export class GitHubApiClient {
  private config: Required<GitHubConfig>;
  private rateLimitInfo: GitHubRateLimit | null = null;
  private lastRequestTime: number = 0;
  private requestQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;

  constructor(config: GitHubConfig) {
    this.config = {
      baseUrl: 'https://api.github.com',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      rateLimitBuffer: 10,
      ...config,
    };

    if (!this.config.token) {
      throw new GitHubApiAuthenticationError('GitHub token is required');
    }
  }

  /**
   * Make an authenticated request to the GitHub API
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<GitHubApiResponse<T>> {
    await this.waitForRateLimit();

    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.config.baseUrl}${endpoint}`;

    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `Bearer ${this.config.token}`,
      'User-Agent': 'git2video-pr-analyzer/1.0.0',
      'X-GitHub-Api-Version': '2022-11-28',
      ...options.headers,
    };

    const requestOptions: RequestInit = {
      ...options,
      headers,
      // Note: AbortSignal.timeout not available in older Node.js versions
      // Manual timeout handling would need to be implemented if required
    };

    let lastError: Error = new Error('No attempts made');

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        this.lastRequestTime = Date.now();
        
        const response = await fetch(url, requestOptions);
        
        // Update rate limit info from headers if response exists
        if (response && response.headers) {
          this.updateRateLimitInfo(response.headers);
        }

        if (!response.ok) {
          await this.handleErrorResponse(response);
        }

        const data = await response.json() as T;

        return {
          data,
          status: response.status,
          headers: response.headers ? Object.fromEntries(response.headers.entries()) : {},
          rateLimit: this.rateLimitInfo || undefined,
        };
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on authentication errors or client errors
        if (
          error instanceof GitHubApiAuthenticationError ||
          error instanceof GitHubApiNotFoundError ||
          (error instanceof GitHubApiFetchError && error.statusCode < 500)
        ) {
          throw error;
        }

        // Rate limit errors should be handled by waiting, not retrying
        if (error instanceof GitHubApiRateLimitError) {
          await this.waitForRateLimitReset(error.resetTime);
          continue;
        }

        // Wait before retrying for network errors
        if (attempt < this.config.retryAttempts) {
          await this.sleep(this.config.retryDelay * attempt);
        }
      }
    }

    throw new GitHubApiFetchError(
      `Request failed after ${this.config.retryAttempts} attempts: ${lastError.message}`,
      0,
      lastError
    );
  }

  /**
   * Get current rate limit status
   */
  async getRateLimit(): Promise<GitHubRateLimitResponse> {
    // Direct fetch to avoid recursive call to this.request()
    const url = `${this.config.baseUrl}/rate_limit`;
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `Bearer ${this.config.token}`,
      'User-Agent': 'git2video-pr-analyzer/1.0.0',
      'X-GitHub-Api-Version': '2022-11-28',
    };

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new GitHubApiFetchError(
        `Failed to get rate limit: ${response.statusText}`,
        response.status
      );
    }

    return await response.json();
  }

  /**
   * Check if we're close to hitting rate limits
   */
  private async waitForRateLimit(): Promise<void> {
    if (!this.rateLimitInfo) {
      // Get initial rate limit info
      try {
        const rateLimitData = await this.getRateLimit();
        this.rateLimitInfo = rateLimitData.resources.core;
      } catch (error) {
        // If we can't get rate limit info, proceed with caution
        console.warn('Failed to fetch rate limit info:', error);
      }
    }

    if (this.rateLimitInfo) {
      const remainingBuffer = this.rateLimitInfo.remaining - this.config.rateLimitBuffer;
      
      if (remainingBuffer <= 0) {
        const resetTime = new Date(this.rateLimitInfo.reset * 1000);
        const waitTime = resetTime.getTime() - Date.now();
        
        if (waitTime > 0) {
          console.log(`Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)}s until reset...`);
          await this.sleep(waitTime);
        }
      }
    }

    // Ensure minimum delay between requests (100ms)
    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    if (timeSinceLastRequest < 100) {
      await this.sleep(100 - timeSinceLastRequest);
    }
  }

  /**
   * Wait for rate limit reset
   */
  private async waitForRateLimitReset(resetTime: Date): Promise<void> {
    const waitTime = resetTime.getTime() - Date.now();
    if (waitTime > 0) {
      console.log(`Rate limit exceeded. Waiting ${Math.ceil(waitTime / 1000)}s for reset...`);
      await this.sleep(waitTime);
    }
  }

  /**
   * Update rate limit information from response headers
   */
  private updateRateLimitInfo(headers: Headers): void {
    const remaining = headers.get('x-ratelimit-remaining');
    const limit = headers.get('x-ratelimit-limit');
    const reset = headers.get('x-ratelimit-reset');
    const used = headers.get('x-ratelimit-used');
    const resource = headers.get('x-ratelimit-resource') || 'core';

    if (remaining && limit && reset) {
      this.rateLimitInfo = {
        remaining: parseInt(remaining, 10),
        limit: parseInt(limit, 10),
        reset: parseInt(reset, 10),
        used: used ? parseInt(used, 10) : 0,
        resource,
      };
    }
  }

  /**
   * Handle error responses from the API
   */
  private async handleErrorResponse(response: Response): Promise<void> {
    let errorData: GitHubApiError;
    
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
    }

    switch (response.status) {
      case 401:
        throw new GitHubApiAuthenticationError(
          `Authentication failed: ${errorData.message}`
        );
      case 403:
        // Check if it's a rate limit error
        if (response.headers.get('x-ratelimit-remaining') === '0') {
          const resetTime = new Date(
            parseInt(response.headers.get('x-ratelimit-reset') || '0', 10) * 1000
          );
          const remaining = parseInt(
            response.headers.get('x-ratelimit-remaining') || '0',
            10
          );
          throw new GitHubApiRateLimitError(
            `Rate limit exceeded: ${errorData.message}`,
            resetTime,
            remaining
          );
        }
        throw new GitHubApiFetchError(
          `Forbidden: ${errorData.message}`,
          response.status,
          errorData
        );
      case 404:
        throw new GitHubApiNotFoundError(
          `Resource not found: ${errorData.message}`,
          response.url
        );
      case 422:
        throw new GitHubApiFetchError(
          `Validation failed: ${errorData.message}`,
          response.status,
          errorData
        );
      default:
        throw new GitHubApiFetchError(
          `API request failed: ${errorData.message}`,
          response.status,
          errorData
        );
    }
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get paginated results from the GitHub API
   */
  async *paginate<T>(
    endpoint: string,
    options: RequestInit = {},
    perPage: number = 100
  ): AsyncGenerator<T[], void, unknown> {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const url = new URL(endpoint, this.config.baseUrl);
      url.searchParams.set('page', page.toString());
      url.searchParams.set('per_page', perPage.toString());

      const response = await this.request<T[]>(url.toString(), options);
      
      if (response.data.length === 0) {
        break;
      }

      yield response.data;

      // Check if there are more pages using Link header
      const linkHeader = response.headers.link;
      hasMore = linkHeader ? linkHeader.includes('rel="next"') : false;
      page++;
    }
  }

  /**
   * Get all paginated results as a flat array
   */
  async getAllPages<T>(
    endpoint: string,
    options: RequestInit = {},
    perPage: number = 100
  ): Promise<T[]> {
    const results: T[] = [];
    
    for await (const page of this.paginate<T>(endpoint, options, perPage)) {
      results.push(...page);
    }
    
    return results;
  }

  /**
   * Make multiple parallel requests with concurrency control
   */
  async parallelRequests<T>(
    requests: Array<() => Promise<GitHubApiResponse<T>>>,
    maxConcurrency: number = 5
  ): Promise<GitHubApiResponse<T>[]> {
    const results: GitHubApiResponse<T>[] = [];
    const executing: Promise<void>[] = [];

    for (const request of requests) {
      const promise = this.executeRequest(request).then(result => {
        results.push(result);
      });

      executing.push(promise);

      if (executing.length >= maxConcurrency) {
        await Promise.race(executing);
        // Remove completed promises
        executing.splice(
          executing.findIndex(p => p === promise),
          1
        );
      }
    }

    await Promise.all(executing);
    return results;
  }

  /**
   * Execute a single request with proper error handling
   */
  private async executeRequest<T>(
    requestFn: () => Promise<GitHubApiResponse<T>>
  ): Promise<GitHubApiResponse<T>> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  /**
   * Process the request queue to ensure rate limiting
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        await request();
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Get current rate limit status
   */
  getCurrentRateLimit(): GitHubRateLimit | null {
    return this.rateLimitInfo;
  }

  /**
   * Check if authenticated user has access to repository
   */
  async checkRepositoryAccess(owner: string, repo: string): Promise<boolean> {
    try {
      await this.request(`/repos/${owner}/${repo}`);
      return true;
    } catch (error) {
      if (error instanceof GitHubApiNotFoundError) {
        return false;
      }
      throw error;
    }
  }
}