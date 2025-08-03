/**
 * Tests for GitHub PR fetcher
 */

import { GitHubPRFetcher } from '../fetcher';
import { GitHubApiClient } from '../client';
import { GitHubPullRequest, GitHubRepository, GitHubCommit } from '../types';

// Mock the client
jest.mock('../client');

describe('GitHubPRFetcher', () => {
  let fetcher: GitHubPRFetcher;
  let mockClient: jest.Mocked<GitHubApiClient>;

  const mockPR: GitHubPullRequest = {
    id: 123,
    number: 1,
    title: 'Test PR',
    body: 'Test description',
    state: 'open',
    merged: false,
    draft: false,
    user: {
      id: 1,
      login: 'testuser',
      avatar_url: 'https://github.com/testuser.png',
      html_url: 'https://github.com/testuser',
      type: 'User',
    },
    assignees: [],
    reviewers: [],
    labels: [],
    base: {
      label: 'main',
      ref: 'main',
      sha: 'abc123',
      user: {
        id: 1,
        login: 'testuser',
        avatar_url: 'https://github.com/testuser.png',
        html_url: 'https://github.com/testuser',
        type: 'User',
      },
      repo: {} as GitHubRepository,
    },
    head: {
      label: 'feature',
      ref: 'feature',
      sha: 'def456',
      user: {
        id: 1,
        login: 'testuser',
        avatar_url: 'https://github.com/testuser.png',
        html_url: 'https://github.com/testuser',
        type: 'User',
      },
      repo: {} as GitHubRepository,
    },
    html_url: 'https://github.com/owner/repo/pull/1',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    comments: 0,
    review_comments: 0,
    commits: 1,
    additions: 10,
    deletions: 5,
    changed_files: 2,
  };

  const mockRepo: GitHubRepository = {
    id: 456,
    name: 'test-repo',
    full_name: 'owner/test-repo',
    owner: {
      id: 1,
      login: 'owner',
      avatar_url: 'https://github.com/owner.png',
      html_url: 'https://github.com/owner',
      type: 'User',
    },
    html_url: 'https://github.com/owner/test-repo',
    private: false,
    fork: false,
    default_branch: 'main',
  };

  beforeEach(() => {
    mockClient = {
      request: jest.fn(),
      getAllPages: jest.fn(),
      parallelRequests: jest.fn(),
    } as any;

    fetcher = new GitHubPRFetcher(mockClient);
  });

  describe('fetchPRData', () => {
    beforeEach(() => {
      mockClient.request.mockImplementation((endpoint: string) => {
        if (endpoint.includes('/pulls/1')) {
          return Promise.resolve({ data: mockPR, status: 200, headers: {} });
        }
        if (endpoint.includes('/repos/owner/repo')) {
          return Promise.resolve({ data: mockRepo, status: 200, headers: {} });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      mockClient.getAllPages.mockResolvedValue([]);
      mockClient.parallelRequests.mockImplementation((requests) => {
        return Promise.all(requests.map(() => ({ data: [], status: 200, headers: {} })));
      });
    });

    it('should fetch basic PR data', async () => {
      const result = await fetcher.fetchPRData('owner', 'repo', 1, {
        includeCommits: false,
        includeFiles: false,
        includeReviews: false,
        includeComments: false,
        includeTimeline: false,
      });

      expect(result.pullRequest).toEqual(mockPR);
      expect(result.repository).toEqual(mockRepo);
      expect(result.commits).toEqual([]);
      expect(result.files).toEqual([]);
    });

    it('should fetch PR data with parallel requests', async () => {
      const result = await fetcher.fetchPRData('owner', 'repo', 1, {
        parallel: true,
        maxConcurrency: 3,
      });

      expect(mockClient.parallelRequests).toHaveBeenCalled();
      expect(result.pullRequest).toEqual(mockPR);
      expect(result.repository).toEqual(mockRepo);
    });

    it('should fetch PR data sequentially when parallel is disabled', async () => {
      const result = await fetcher.fetchPRData('owner', 'repo', 1, {
        parallel: false,
      });

      expect(mockClient.parallelRequests).not.toHaveBeenCalled();
      expect(mockClient.getAllPages).toHaveBeenCalled();
      expect(result.pullRequest).toEqual(mockPR);
    });

    it('should handle errors gracefully', async () => {
      mockClient.request.mockRejectedValueOnce(new Error('API Error'));

      await expect(
        fetcher.fetchPRData('owner', 'repo', 1)
      ).rejects.toThrow('API Error');
    });
  });

  describe('fetchCommits', () => {
    it('should fetch commits for a PR', async () => {
      const mockCommits: GitHubCommit[] = [
        {
          sha: 'abc123',
          commit: {
            author: {
              name: 'Test User',
              email: 'test@example.com',
              date: '2023-01-01T00:00:00Z',
            },
            committer: {
              name: 'Test User',
              email: 'test@example.com',
              date: '2023-01-01T00:00:00Z',
            },
            message: 'Test commit',
            tree: { sha: 'tree123', url: 'https://api.github.com/tree123' },
            url: 'https://api.github.com/commit123',
            comment_count: 0,
          },
          url: 'https://api.github.com/commit123',
          html_url: 'https://github.com/owner/repo/commit/abc123',
          comments_url: 'https://api.github.com/commits/abc123/comments',
          parents: [],
        },
      ];

      mockClient.getAllPages.mockResolvedValueOnce(mockCommits);
      mockClient.request.mockResolvedValue({
        data: {
          ...mockCommits[0],
          stats: { total: 15, additions: 10, deletions: 5 },
          files: [],
        },
        status: 200,
        headers: {},
      });

      const commits = await fetcher.fetchCommits('owner', 'repo', 1);

      expect(commits).toHaveLength(1);
      expect(commits[0].sha).toBe('abc123');
      expect(commits[0].stats).toBeDefined();
    });
  });

  describe('processVideoData', () => {
    it('should calculate code statistics correctly', async () => {
      const mockFiles = [
        {
          filename: 'src/test.js',
          status: 'modified' as const,
          additions: 10,
          deletions: 5,
          changes: 15,
        },
        {
          filename: 'src/test.py',
          status: 'added' as const,
          additions: 20,
          deletions: 0,
          changes: 20,
        },
      ];

      mockClient.request.mockImplementation((endpoint: string) => {
        if (endpoint.includes('/pulls/1')) {
          return Promise.resolve({ data: mockPR, status: 200, headers: {} });
        }
        if (endpoint.includes('/repos/owner/repo')) {
          return Promise.resolve({ data: mockRepo, status: 200, headers: {} });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      mockClient.getAllPages.mockImplementation((endpoint: string) => {
        if (endpoint.includes('/files')) {
          return Promise.resolve(mockFiles);
        }
        return Promise.resolve([]);
      });

      const result = await fetcher.fetchPRData('owner', 'repo', 1, {
        includeFiles: true,
        parallel: false,
      });

      expect(result.codeStats.totalAdditions).toBe(30);
      expect(result.codeStats.totalDeletions).toBe(5);
      expect(result.codeStats.totalFiles).toBe(2);
      expect(result.codeStats.languageBreakdown).toHaveProperty('JavaScript');
      expect(result.codeStats.languageBreakdown).toHaveProperty('Python');
    });

    it('should extract participants correctly', async () => {
      const mockReviews = [
        {
          id: 1,
          user: {
            id: 2,
            login: 'reviewer',
            avatar_url: 'https://github.com/reviewer.png',
            html_url: 'https://github.com/reviewer',
            type: 'User' as const,
          },
          body: 'Looks good',
          state: 'APPROVED' as const,
          html_url: 'https://github.com/owner/repo/pull/1#review-1',
          pull_request_url: 'https://api.github.com/pulls/1',
          author_association: 'MEMBER',
          commit_id: 'abc123',
        },
      ];

      mockClient.request.mockImplementation((endpoint: string) => {
        if (endpoint.includes('/pulls/1')) {
          return Promise.resolve({ data: mockPR, status: 200, headers: {} });
        }
        if (endpoint.includes('/repos/owner/repo')) {
          return Promise.resolve({ data: mockRepo, status: 200, headers: {} });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      mockClient.getAllPages.mockImplementation((endpoint: string) => {
        if (endpoint.includes('/reviews')) {
          return Promise.resolve(mockReviews);
        }
        return Promise.resolve([]);
      });

      const result = await fetcher.fetchPRData('owner', 'repo', 1, {
        includeReviews: true,
        parallel: false,
      });

      expect(result.participants).toHaveLength(2); // Author + reviewer
      expect(result.participants.some(p => p.login === 'testuser')).toBe(true);
      expect(result.participants.some(p => p.login === 'reviewer')).toBe(true);
    });
  });
});