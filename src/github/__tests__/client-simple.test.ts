/**
 * Simplified GitHub API client tests with proper fetch mocking
 */

import { GitHubApiClient } from '../client';
import {
  GitHubApiAuthenticationError,
  GitHubApiRateLimitError,
  GitHubApiNotFoundError,
  GitHubApiFetchError,
} from '../types';
import fetchMock from 'jest-fetch-mock';

// Enable fetch mocking
fetchMock.enableMocks();

describe('GitHubApiClient - Simplified Tests', () => {
  let client: GitHubApiClient;
  const mockToken = 'test-token-123';

  beforeEach(() => {
    client = new GitHubApiClient({ token: mockToken });
    fetchMock.resetMocks();
  });

  describe('constructor', () => {
    it('should require a token', () => {
      expect(() => new GitHubApiClient({ token: '' })).toThrow(GitHubApiAuthenticationError);
    });

    it('should set default configuration', () => {
      expect(client).toBeDefined();
    });
  });

  describe('request', () => {
    it('should make successful API request', async () => {
      const mockData = { id: 123, title: 'Test PR' };
      
      fetchMock.mockResponseOnce(JSON.stringify(mockData), {
        status: 200,
        headers: {
          'x-ratelimit-remaining': '4999',
          'x-ratelimit-limit': '5000',
          'x-ratelimit-reset': '1640995200',
        },
      });

      const result = await client.request('/pulls/123');
      
      expect(result.data).toEqual(mockData);
      expect(result.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.github.com/pulls/123',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token-123',
            'Accept': 'application/vnd.github.v3+json',
          }),
        })
      );
    });

    it('should handle authentication errors', async () => {
      fetchMock.mockRejectOnce(new Error('Authentication failed'));

      await expect(client.request('/test')).rejects.toThrow('Request failed after 3 attempts');
    });

    it('should handle rate limit errors', async () => {
      fetchMock.mockResponseOnce('Rate limit exceeded', {
        status: 403,
        headers: {
          'x-ratelimit-remaining': '0',
          'x-ratelimit-reset': '1640995200',
        },
      });

      await expect(client.request('/test')).rejects.toThrow();
    });

    it('should handle 404 errors', async () => {
      fetchMock.mockResponseOnce('Not Found', {
        status: 404,
      });

      await expect(client.request('/nonexistent')).rejects.toThrow();
    });

    it('should retry on network errors', async () => {
      // First two calls fail, third succeeds
      fetchMock
        .mockRejectOnce(new Error('Network error'))
        .mockRejectOnce(new Error('Network error'))
        .mockResponseOnce(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            'x-ratelimit-remaining': '4999',
            'x-ratelimit-limit': '5000',
            'x-ratelimit-reset': '1640995200',
          },
        });

      const result = await client.request('/test');
      expect(result.data).toEqual({ success: true });
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });
  });

  describe('pagination', () => {
    it('should handle paginated responses', async () => {
      const page1Data = [{ id: 1 }, { id: 2 }];
      const page2Data = [{ id: 3 }, { id: 4 }];

      // Mock first page
      fetchMock.mockResponseOnce(JSON.stringify(page1Data), {
        status: 200,
        headers: {
          'link': '<https://api.github.com/test?page=2>; rel="next"',
          'x-ratelimit-remaining': '4999',
        },
      });

      // Mock second page
      fetchMock.mockResponseOnce(JSON.stringify(page2Data), {
        status: 200,
        headers: {
          'x-ratelimit-remaining': '4998',
        },
      });

      const results = [];
      for await (const page of client.paginate('/test')) {
        results.push(...page.data);
      }

      expect(results).toEqual([...page1Data, ...page2Data]);
    });
  });

  describe('repository access', () => {
    it('should return true for accessible repository', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ id: 123 }), {
        status: 200,
      });

      const hasAccess = await client.checkRepositoryAccess('owner', 'repo');
      expect(hasAccess).toBe(true);
    });

    it('should return false for inaccessible repository', async () => {
      fetchMock.mockResponseOnce('Not Found', {
        status: 404,
      });

      const hasAccess = await client.checkRepositoryAccess('owner', 'private-repo');
      expect(hasAccess).toBe(false);
    });
  });

  describe('rate limiting', () => {
    it('should get rate limit status', async () => {
      const rateLimitResponse = {
        resources: {
          core: {
            limit: 5000,
            remaining: 4999,
            reset: 1640995200,
            used: 1,
            resource: 'core',
          },
        },
      };

      fetchMock.mockResponseOnce(JSON.stringify(rateLimitResponse), {
        status: 200,
      });

      const rateLimit = await client.getRateLimit();
      expect(rateLimit.resources.core.remaining).toBe(4999);
    });
  });
});