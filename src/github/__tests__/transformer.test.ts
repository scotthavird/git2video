/**
 * Tests for PR video transformer
 */

import { PRVideoTransformer } from '../transformer';
import { PRVideoData, GitHubPullRequest, GitHubRepository, GitHubUser } from '../types';

describe('PRVideoTransformer', () => {
  let transformer: PRVideoTransformer;

  const mockUser: GitHubUser = {
    id: 1,
    login: 'testuser',
    avatar_url: 'https://github.com/testuser.png',
    html_url: 'https://github.com/testuser',
    type: 'User',
  };

  const mockRepo: GitHubRepository = {
    id: 456,
    name: 'test-repo',
    full_name: 'owner/test-repo',
    owner: mockUser,
    html_url: 'https://github.com/owner/test-repo',
    private: false,
    fork: false,
    default_branch: 'main',
  };

  const mockPR: GitHubPullRequest = {
    id: 123,
    number: 1,
    title: 'Add new feature',
    body: 'This PR adds a new feature to the application',
    state: 'open',
    merged: false,
    draft: false,
    user: mockUser,
    assignees: [],
    reviewers: [],
    labels: [],
    base: {
      label: 'main',
      ref: 'main',
      sha: 'abc123',
      user: mockUser,
      repo: mockRepo,
    },
    head: {
      label: 'feature',
      ref: 'feature',
      sha: 'def456',
      user: mockUser,
      repo: mockRepo,
    },
    html_url: 'https://github.com/owner/repo/pull/1',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z',
    comments: 2,
    review_comments: 1,
    commits: 3,
    additions: 150,
    deletions: 50,
    changed_files: 5,
  };

  const mockPRData: PRVideoData = {
    pullRequest: mockPR,
    repository: mockRepo,
    commits: [
      {
        sha: 'commit1',
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
          message: 'Add main feature implementation',
          tree: { sha: 'tree1', url: 'https://api.github.com/tree1' },
          url: 'https://api.github.com/commit1',
          comment_count: 0,
        },
        url: 'https://api.github.com/commit1',
        html_url: 'https://github.com/owner/repo/commit/commit1',
        comments_url: 'https://api.github.com/commits/commit1/comments',
        author: mockUser,
        parents: [],
        stats: { total: 100, additions: 80, deletions: 20 },
        files: [],
      },
      {
        sha: 'commit2',
        commit: {
          author: {
            name: 'Test User',
            email: 'test@example.com',
            date: '2023-01-01T12:00:00Z',
          },
          committer: {
            name: 'Test User',
            email: 'test@example.com',
            date: '2023-01-01T12:00:00Z',
          },
          message: 'Fix bug in feature',
          tree: { sha: 'tree2', url: 'https://api.github.com/tree2' },
          url: 'https://api.github.com/commit2',
          comment_count: 0,
        },
        url: 'https://api.github.com/commit2',
        html_url: 'https://github.com/owner/repo/commit/commit2',
        comments_url: 'https://api.github.com/commits/commit2/comments',
        author: mockUser,
        parents: [],
        stats: { total: 30, additions: 20, deletions: 10 },
        files: [],
      },
    ],
    files: [
      {
        filename: 'src/feature.js',
        status: 'added',
        additions: 100,
        deletions: 0,
        changes: 100,
      },
      {
        filename: 'src/utils.py',
        status: 'modified',
        additions: 30,
        deletions: 20,
        changes: 50,
      },
      {
        filename: 'tests/test_feature.js',
        status: 'added',
        additions: 50,
        deletions: 0,
        changes: 50,
      },
      {
        filename: 'README.md',
        status: 'modified',
        additions: 10,
        deletions: 5,
        changes: 15,
      },
      {
        filename: 'package.json',
        status: 'modified',
        additions: 5,
        deletions: 0,
        changes: 5,
      },
    ],
    reviews: [
      {
        id: 1,
        user: {
          id: 2,
          login: 'reviewer1',
          avatar_url: 'https://github.com/reviewer1.png',
          html_url: 'https://github.com/reviewer1',
          type: 'User',
        },
        body: 'Overall looks good, minor suggestions',
        state: 'APPROVED',
        html_url: 'https://github.com/owner/repo/pull/1#review-1',
        pull_request_url: 'https://api.github.com/pulls/1',
        author_association: 'MEMBER',
        submitted_at: '2023-01-01T18:00:00Z',
        commit_id: 'commit2',
      },
    ],
    reviewComments: [],
    issueComments: [],
    timeline: [],
    participants: [mockUser],
    codeStats: {
      totalAdditions: 195,
      totalDeletions: 25,
      totalFiles: 5,
      languageBreakdown: {
        JavaScript: 150,
        Python: 50,
        Markdown: 15,
        JSON: 5,
      },
      fileTypes: {
        js: 2,
        py: 1,
        md: 1,
        json: 1,
      },
    },
    reviewStats: {
      approvals: 1,
      changesRequested: 0,
      comments: 0,
      averageReviewTime: 18,
    },
    timelineStats: {
      createdAt: new Date('2023-01-01T00:00:00Z'),
      firstReviewAt: new Date('2023-01-01T18:00:00Z'),
      lastUpdateAt: new Date('2023-01-02T00:00:00Z'),
      mergedAt: undefined,
      closedAt: undefined,
      totalDuration: 24 * 60 * 60 * 1000, // 24 hours in ms
      reviewDuration: 18 * 60 * 60 * 1000, // 18 hours in ms
    },
  };

  beforeEach(() => {
    transformer = new PRVideoTransformer();
  });

  describe('transform', () => {
    it('should generate summary video metadata', () => {
      const result = transformer.transform(mockPRData, 'summary');

      expect(result.title).toContain('PR #1');
      expect(result.title).toContain('Add new feature');
      expect(result.subtitle).toContain('owner/test-repo');
      expect(result.subtitle).toContain('5 files');
      expect(result.description).toContain('open pull request');
      expect(result.scenes).toBeDefined();
      expect(result.participants).toBeDefined();
      expect(result.keyMetrics).toBeDefined();
      expect(result.theme).toBeDefined();
    });

    it('should generate detailed video metadata', () => {
      const result = transformer.transform(mockPRData, 'detailed');

      expect(result.scenes.length).toBeGreaterThan(0);
      expect(result.scenes.some(scene => scene.type === 'timeline')).toBe(true);
      expect(result.duration).toBeGreaterThan(0);
    });

    it('should generate technical video metadata', () => {
      const result = transformer.transform(mockPRData, 'technical');

      expect(result.scenes.some(scene => scene.type === 'timeline')).toBe(true);
      expect(result.keyMetrics.primaryLanguage).toBe('JavaScript');
    });

    it('should include all required scenes for summary video', () => {
      const result = transformer.transform(mockPRData, 'summary');

      const sceneTypes = result.scenes.map(scene => scene.type);
      expect(sceneTypes).toContain('intro');
      expect(sceneTypes).toContain('overview');
      expect(sceneTypes).toContain('summary');
      expect(sceneTypes).toContain('outro');
    });

    it('should calculate appropriate scene durations', () => {
      const result = transformer.transform(mockPRData, 'summary');

      result.scenes.forEach(scene => {
        expect(scene.duration).toBeGreaterThan(0);
        expect(scene.duration).toBeLessThanOrEqual(20); // Reasonable max duration
      });
    });
  });

  describe('generateKeyMetrics', () => {
    it('should calculate correct metrics', () => {
      const result = transformer.transform(mockPRData);

      expect(result.keyMetrics.totalCommits).toBe(2);
      expect(result.keyMetrics.totalFiles).toBe(5);
      expect(result.keyMetrics.totalAdditions).toBe(195);
      expect(result.keyMetrics.totalDeletions).toBe(25);
      expect(result.keyMetrics.totalReviews).toBe(1);
      expect(result.keyMetrics.participantCount).toBe(1);
      expect(result.keyMetrics.primaryLanguage).toBe('JavaScript');
    });
  });

  describe('generateParticipantSummaries', () => {
    it('should identify participant roles correctly', () => {
      const result = transformer.transform(mockPRData);

      const author = result.participants.find(p => p.user.login === 'testuser');
      expect(author?.role).toBe('author');
    });

    it('should calculate contribution statistics', () => {
      const result = transformer.transform(mockPRData);

      const author = result.participants.find(p => p.user.login === 'testuser');
      expect(author?.contributions.commits).toBe(2);
      expect(author?.contributions.linesAdded).toBe(100); // Sum of commit stats
      expect(author?.contributions.linesDeleted).toBe(30);
    });
  });

  describe('scene generation', () => {
    it('should generate commit scene with proper data', () => {
      const result = transformer.transform(mockPRData);

      const commitScene = result.scenes.find(scene => scene.type === 'commits');
      expect(commitScene).toBeDefined();
      expect(commitScene?.data.commits).toHaveLength(2);
      expect(commitScene?.data.totalStats.additions).toBe(100);
    });

    it('should generate file changes scene', () => {
      const result = transformer.transform(mockPRData);

      const fileScene = result.scenes.find(scene => scene.type === 'files');
      expect(fileScene).toBeDefined();
      expect(fileScene?.data.files).toHaveLength(5);
      expect(fileScene?.data.languageBreakdown).toBeDefined();
    });

    it('should prioritize scenes based on content', () => {
      const result = transformer.transform(mockPRData);

      const highPriorityScenes = result.scenes.filter(scene => scene.priority === 'high');
      expect(highPriorityScenes.length).toBeGreaterThan(0);

      // Intro and overview should always be high priority
      expect(result.scenes.find(s => s.type === 'intro')?.priority).toBe('high');
      expect(result.scenes.find(s => s.type === 'overview')?.priority).toBe('high');
    });
  });

  describe('theme selection', () => {
    it('should select appropriate theme for JavaScript projects', () => {
      const result = transformer.transform(mockPRData);

      expect(result.theme.style).toBe('modern');
      expect(result.theme.primaryColor).toBeDefined();
      expect(result.theme.backgroundColor).toBeDefined();
    });

    it('should have consistent theme colors', () => {
      const result = transformer.transform(mockPRData);

      expect(result.theme.primaryColor).toMatch(/^#[0-9A-F]{6}$/i);
      expect(result.theme.secondaryColor).toMatch(/^#[0-9A-F]{6}$/i);
      expect(result.theme.backgroundColor).toMatch(/^#[0-9A-F]{6}$/i);
      expect(result.theme.textColor).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });

  describe('file categorization', () => {
    it('should categorize files correctly', () => {
      const result = transformer.transform(mockPRData);

      const fileScene = result.scenes.find(scene => scene.type === 'files')?.data;
      const files = fileScene?.files;

      const testFile = files?.find((f: any) => f.filename.includes('test'));
      expect(testFile?.category).toBe('test');

      const sourceFile = files?.find((f: any) => f.filename === 'src/feature.js');
      expect(sourceFile?.category).toBe('source');

      const docFile = files?.find((f: any) => f.filename === 'README.md');
      expect(docFile?.category).toBe('docs');

      const configFile = files?.find((f: any) => f.filename === 'package.json');
      expect(configFile?.category).toBe('config');
    });

    it('should determine file significance', () => {
      const result = transformer.transform(mockPRData);

      const fileScene = result.scenes.find(scene => scene.type === 'files')?.data;
      const files = fileScene?.files;

      const bigFile = files?.find((f: any) => f.changes === 100);
      expect(bigFile?.significance).toBe('medium'); // 100 changes = medium

      const smallFile = files?.find((f: any) => f.changes === 5);
      expect(smallFile?.significance).toBe('low'); // 5 changes = low
    });
  });

  describe('error handling', () => {
    it('should handle empty commit list', () => {
      const emptyCommitData = { ...mockPRData, commits: [] };
      const result = transformer.transform(emptyCommitData);

      expect(result).toBeDefined();
      expect(result.keyMetrics.totalCommits).toBe(0);
    });

    it('should handle missing optional data', () => {
      const minimalData = {
        ...mockPRData,
        reviews: [],
        reviewComments: [],
        issueComments: [],
        timeline: [],
      };

      const result = transformer.transform(minimalData);

      expect(result).toBeDefined();
      expect(result.keyMetrics.totalReviews).toBe(0);
    });
  });
});