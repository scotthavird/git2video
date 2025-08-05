/**
 * Tests for GitHub API client
 */

import { GitHubApiClient } from '../client';
import {
  GitHubApiAuthenticationError,
  GitHubApiRateLimitError,
  GitHubApiNotFoundError,
  GitHubApiFetchError,
} from '../types';

// Use jest-fetch-mock
import fetchMock from 'jest-fetch-mock';
fetchMock.enableMocks();

describe('GitHubApiClient', () => {
  let client: GitHubApiClient;
  const mockToken = 'test-token';

  beforeEach(() => {
    client = new GitHubApiClient({ token: mockToken });
    fetchMock.resetMocks();
  });

  describe('constructor', () => {
    it('should require a token', () => {
      expect(() => new GitHubApiClient({ token: '' })).toThrow(GitHubApiAuthenticationError);
    });

    it('should set default configuration', () => {
      const defaultClient = new GitHubApiClient({ token: mockToken });
      expect(defaultClient).toBeDefined();
    });
  });

  describe('request', () => {
    it('should make successful API request', async () => {
      const mockResponse = { data: 'test' };
      fetchMock.mockResponseOnce(JSON.stringify(mockResponse), {
        status: 200,
        headers: {
          'x-ratelimit-remaining': '4999',
          'x-ratelimit-limit': '5000',
          'x-ratelimit-reset': '1640995200',
        },
      });

      const result = await client.request('/test');

      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `Bearer ${mockToken}`,
            'User-Agent': 'git2video-pr-analyzer/1.0.0',
          }),
        })
      );

      expect(result.data).toEqual(mockResponse);
      expect(result.status).toBe(200);
      expect(result.rateLimit).toBeDefined();
    });

    it('should handle authentication errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers(),
        json: () => Promise.resolve({ message: 'Bad credentials' }),
      });

      await expect(client.request('/test')).rejects.toThrow(GitHubApiAuthenticationError);
    });

    it('should handle rate limit errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        headers: new Headers({
          'x-ratelimit-remaining': '0',
          'x-ratelimit-reset': '1640995200',
        }),
        json: () => Promise.resolve({ message: 'API rate limit exceeded' }),
      });

      await expect(client.request('/test')).rejects.toThrow(GitHubApiRateLimitError);
    });

    it('should handle not found errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers(),
        url: 'https://api.github.com/test',
        json: () => Promise.resolve({ message: 'Not Found' }),
      });

      await expect(client.request('/test')).rejects.toThrow(GitHubApiNotFoundError);
    });

    it('should retry on network errors', async () => {
      const networkError = new Error('ECONNRESET');
      (fetch as jest.Mock)
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers(),
          json: () => Promise.resolve({ data: 'success' }),
        });

      const result = await client.request('/test');
      expect(result.data).toEqual({ data: 'success' });
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    it('should respect timeout', async () => {
      const timeoutClient = new GitHubApiClient({ token: mockToken, timeout: 100 });
      
      (fetch as jest.Mock).mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(resolve, 200))
      );

      await expect(timeoutClient.request('/test')).rejects.toThrow();
    });
  });

  describe('paginate', () => {
    it('should handle paginated responses', async () => {
      const page1Data = [{ id: 1 }, { id: 2 }];
      const page2Data = [{ id: 3 }, { id: 4 }];

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({
            'link': '<https://api.github.com/test?page=2>; rel="next"',
          }),
          json: () => Promise.resolve(page1Data),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers(),
          json: () => Promise.resolve(page2Data),
        });

      const results = [];
      for await (const page of client.paginate('/test')) {
        results.push(...page);
      }

      expect(results).toEqual([...page1Data, ...page2Data]);
    });
  });

  describe('getAllPages', () => {
    it('should return all paginated results as flat array', async () => {
      const page1Data = [{ id: 1 }, { id: 2 }];
      const page2Data = [{ id: 3 }, { id: 4 }];

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({
            'link': '<https://api.github.com/test?page=2>; rel="next"',
          }),
          json: () => Promise.resolve(page1Data),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers(),
          json: () => Promise.resolve(page2Data),
        });

      const results = await client.getAllPages('/test');
      expect(results).toEqual([...page1Data, ...page2Data]);
    });
  });

  describe('checkRepositoryAccess', () => {
    it('should return true for accessible repository', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: () => Promise.resolve({ id: 123, name: 'test-repo' }),
      });

      const hasAccess = await client.checkRepositoryAccess('owner', 'repo');
      expect(hasAccess).toBe(true);
    });

    it('should return false for inaccessible repository', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers(),
        url: 'https://api.github.com/repos/owner/repo',
        json: () => Promise.resolve({ message: 'Not Found' }),
      });

      const hasAccess = await client.checkRepositoryAccess('owner', 'repo');
      expect(hasAccess).toBe(false);
    });
  });
});