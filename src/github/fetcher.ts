/**
 * Parallel data fetching service with dependency management for GitHub PR data
 */

import { GitHubApiClient } from './client';
import {
  GitHubPullRequest,
  GitHubCommit,
  GitHubFile,
  GitHubReview,
  GitHubReviewComment,
  GitHubIssueComment,
  GitHubTimelineEvent,
  GitHubRepository,
  GitHubUser,
  PRVideoData,
  FetchOptions,
  GitHubApiResponse,
} from './types';

export class GitHubPRFetcher {
  private client: GitHubApiClient;

  constructor(client: GitHubApiClient) {
    this.client = client;
  }

  /**
   * Fetch comprehensive PR data for video generation
   */
  async fetchPRData(
    owner: string,
    repo: string,
    prNumber: number,
    options: FetchOptions = {}
  ): Promise<PRVideoData> {
    const {
      includeCommits = true,
      includeFiles = true,
      includeReviews = true,
      includeComments = true,
      includeTimeline = true,
      parallel = true,
      maxConcurrency = 5,
    } = options;

    console.log(`Fetching PR data for ${owner}/${repo}#${prNumber}...`);

    // Always fetch PR and repository data first (dependencies for other requests)
    const [pullRequest, repository] = await Promise.all([
      this.fetchPullRequest(owner, repo, prNumber),
      this.fetchRepository(owner, repo),
    ]);

    if (parallel) {
      return this.fetchDataParallel(
        owner,
        repo,
        prNumber,
        pullRequest,
        repository,
        {
          includeCommits,
          includeFiles,
          includeReviews,
          includeComments,
          includeTimeline,
          maxConcurrency,
        }
      );
    } else {
      return this.fetchDataSequential(
        owner,
        repo,
        prNumber,
        pullRequest,
        repository,
        {
          includeCommits,
          includeFiles,
          includeReviews,
          includeComments,
          includeTimeline,
        }
      );
    }
  }

  /**
   * Fetch data in parallel with proper dependency management
   */
  private async fetchDataParallel(
    owner: string,
    repo: string,
    prNumber: number,
    pullRequest: GitHubPullRequest,
    repository: GitHubRepository,
    options: Required<Omit<FetchOptions, 'parallel'>>
  ): Promise<PRVideoData> {
    const tasks: Array<() => Promise<any>> = [];
    
    // Independent requests that can run immediately
    if (options.includeCommits) {
      tasks.push(() => this.fetchCommits(owner, repo, prNumber));
    }
    
    if (options.includeFiles) {
      tasks.push(() => this.fetchFiles(owner, repo, prNumber));
    }
    
    if (options.includeReviews) {
      tasks.push(() => this.fetchReviews(owner, repo, prNumber));
    }
    
    if (options.includeComments) {
      tasks.push(() => Promise.all([
        this.fetchReviewComments(owner, repo, prNumber),
        this.fetchIssueComments(owner, repo, prNumber),
      ]));
    }
    
    if (options.includeTimeline) {
      tasks.push(() => this.fetchTimeline(owner, repo, prNumber));
    }

    console.log(`Executing ${tasks.length} parallel requests...`);
    
    const results = await this.client.parallelRequests(
      tasks.map(task => async () => {
        const result = await task();
        return { data: result, status: 200, headers: {} };
      }),
      options.maxConcurrency
    );

    // Parse results based on order
    let resultIndex = 0;
    const commits = options.includeCommits ? results[resultIndex++].data : [];
    const files = options.includeFiles ? results[resultIndex++].data : [];
    const reviews = options.includeReviews ? results[resultIndex++].data : [];
    
    let reviewComments: GitHubReviewComment[] = [];
    let issueComments: GitHubIssueComment[] = [];
    if (options.includeComments) {
      const [rc, ic] = results[resultIndex++].data;
      reviewComments = rc;
      issueComments = ic;
    }
    
    const timeline = options.includeTimeline ? results[resultIndex++].data : [];

    console.log('Parallel fetch completed, processing data...');

    return this.processVideoData(
      pullRequest,
      repository,
      commits,
      files,
      reviews,
      reviewComments,
      issueComments,
      timeline
    );
  }

  /**
   * Fetch data sequentially (fallback for debugging or low rate limits)
   */
  private async fetchDataSequential(
    owner: string,
    repo: string,
    prNumber: number,
    pullRequest: GitHubPullRequest,
    repository: GitHubRepository,
    options: Omit<FetchOptions, 'parallel' | 'maxConcurrency'>
  ): Promise<PRVideoData> {
    console.log('Fetching data sequentially...');

    const commits = options.includeCommits 
      ? await this.fetchCommits(owner, repo, prNumber) 
      : [];
    
    const files = options.includeFiles 
      ? await this.fetchFiles(owner, repo, prNumber) 
      : [];
    
    const reviews = options.includeReviews 
      ? await this.fetchReviews(owner, repo, prNumber) 
      : [];
    
    const reviewComments = options.includeComments 
      ? await this.fetchReviewComments(owner, repo, prNumber) 
      : [];
    
    const issueComments = options.includeComments 
      ? await this.fetchIssueComments(owner, repo, prNumber) 
      : [];
    
    const timeline = options.includeTimeline 
      ? await this.fetchTimeline(owner, repo, prNumber) 
      : [];

    return this.processVideoData(
      pullRequest,
      repository,
      commits,
      files,
      reviews,
      reviewComments,
      issueComments,
      timeline
    );
  }

  /**
   * Fetch pull request details
   */
  async fetchPullRequest(owner: string, repo: string, prNumber: number): Promise<GitHubPullRequest> {
    console.log(`Fetching PR ${owner}/${repo}#${prNumber}...`);
    const response = await this.client.request<GitHubPullRequest>(
      `/repos/${owner}/${repo}/pulls/${prNumber}`
    );
    return response.data;
  }

  /**
   * Fetch repository details
   */
  async fetchRepository(owner: string, repo: string): Promise<GitHubRepository> {
    console.log(`Fetching repository ${owner}/${repo}...`);
    const response = await this.client.request<GitHubRepository>(
      `/repos/${owner}/${repo}`
    );
    return response.data;
  }

  /**
   * Fetch all commits for a PR
   */
  async fetchCommits(owner: string, repo: string, prNumber: number): Promise<GitHubCommit[]> {
    console.log(`Fetching commits for PR ${prNumber}...`);
    const commits = await this.client.getAllPages<GitHubCommit>(
      `/repos/${owner}/${repo}/pulls/${prNumber}/commits`
    );
    
    // Fetch detailed stats for each commit if needed
    const commitsWithStats = await Promise.all(
      commits.map(async (commit) => {
        try {
          const response = await this.client.request<GitHubCommit>(
            `/repos/${owner}/${repo}/commits/${commit.sha}`
          );
          return { ...commit, stats: response.data.stats, files: response.data.files };
        } catch (error) {
          console.warn(`Failed to fetch stats for commit ${commit.sha}:`, error);
          return commit;
        }
      })
    );

    return commitsWithStats;
  }

  /**
   * Fetch all file changes for a PR
   */
  async fetchFiles(owner: string, repo: string, prNumber: number): Promise<GitHubFile[]> {
    console.log(`Fetching files for PR ${prNumber}...`);
    return this.client.getAllPages<GitHubFile>(
      `/repos/${owner}/${repo}/pulls/${prNumber}/files`
    );
  }

  /**
   * Fetch all reviews for a PR
   */
  async fetchReviews(owner: string, repo: string, prNumber: number): Promise<GitHubReview[]> {
    console.log(`Fetching reviews for PR ${prNumber}...`);
    return this.client.getAllPages<GitHubReview>(
      `/repos/${owner}/${repo}/pulls/${prNumber}/reviews`
    );
  }

  /**
   * Fetch all review comments for a PR
   */
  async fetchReviewComments(owner: string, repo: string, prNumber: number): Promise<GitHubReviewComment[]> {
    console.log(`Fetching review comments for PR ${prNumber}...`);
    return this.client.getAllPages<GitHubReviewComment>(
      `/repos/${owner}/${repo}/pulls/${prNumber}/comments`
    );
  }

  /**
   * Fetch all issue comments for a PR
   */
  async fetchIssueComments(owner: string, repo: string, prNumber: number): Promise<GitHubIssueComment[]> {
    console.log(`Fetching issue comments for PR ${prNumber}...`);
    return this.client.getAllPages<GitHubIssueComment>(
      `/repos/${owner}/${repo}/issues/${prNumber}/comments`
    );
  }

  /**
   * Fetch timeline events for a PR
   */
  async fetchTimeline(owner: string, repo: string, prNumber: number): Promise<GitHubTimelineEvent[]> {
    console.log(`Fetching timeline for PR ${prNumber}...`);
    const response = await this.client.request<GitHubTimelineEvent[]>(
      `/repos/${owner}/${repo}/issues/${prNumber}/timeline`,
      {
        headers: {
          'Accept': 'application/vnd.github.mockingbird-preview+json',
        },
      }
    );
    return response.data;
  }

  /**
   * Process and aggregate all fetched data into video-ready format
   */
  private processVideoData(
    pullRequest: GitHubPullRequest,
    repository: GitHubRepository,
    commits: GitHubCommit[],
    files: GitHubFile[],
    reviews: GitHubReview[],
    reviewComments: GitHubReviewComment[],
    issueComments: GitHubIssueComment[],
    timeline: GitHubTimelineEvent[]
  ): PRVideoData {
    console.log('Processing video data...');

    // Calculate participants
    const participants = this.extractParticipants(
      pullRequest,
      commits,
      reviews,
      reviewComments,
      issueComments
    );

    // Calculate code statistics
    const codeStats = this.calculateCodeStats(files, commits);

    // Calculate review statistics
    const reviewStats = this.calculateReviewStats(reviews, reviewComments, timeline);

    // Calculate timeline statistics
    const timelineStats = this.calculateTimelineStats(pullRequest, reviews, timeline);

    const result: PRVideoData = {
      pullRequest,
      commits,
      files,
      reviews,
      reviewComments,
      issueComments,
      timeline,
      repository,
      participants,
      codeStats,
      reviewStats,
      timelineStats,
    };

    console.log(`Data processing complete:
      - ${commits.length} commits
      - ${files.length} files changed
      - ${reviews.length} reviews
      - ${reviewComments.length} review comments
      - ${issueComments.length} issue comments
      - ${participants.length} participants
    `);

    return result;
  }

  /**
   * Extract unique participants from all PR activity
   */
  private extractParticipants(
    pullRequest: GitHubPullRequest,
    commits: GitHubCommit[],
    reviews: GitHubReview[],
    reviewComments: GitHubReviewComment[],
    issueComments: GitHubIssueComment[]
  ): GitHubUser[] {
    const userMap = new Map<number, GitHubUser>();

    // Add PR author
    userMap.set(pullRequest.user.id, pullRequest.user);

    // Add assignees and reviewers
    pullRequest.assignees.forEach(user => userMap.set(user.id, user));
    pullRequest.reviewers.forEach(user => userMap.set(user.id, user));

    // Add commit authors and committers
    commits.forEach(commit => {
      if (commit.author) userMap.set(commit.author.id, commit.author);
      if (commit.committer) userMap.set(commit.committer.id, commit.committer);
    });

    // Add reviewers
    reviews.forEach(review => userMap.set(review.user.id, review.user));

    // Add comment authors
    reviewComments.forEach(comment => userMap.set(comment.user.id, comment.user));
    issueComments.forEach(comment => userMap.set(comment.user.id, comment.user));

    return Array.from(userMap.values());
  }

  /**
   * Calculate code statistics from files and commits
   */
  private calculateCodeStats(files: GitHubFile[], commits: GitHubCommit[]) {
    const totalAdditions = files.reduce((sum, file) => sum + file.additions, 0);
    const totalDeletions = files.reduce((sum, file) => sum + file.deletions, 0);
    const totalFiles = files.length;

    // Language breakdown based on file extensions
    const languageBreakdown: Record<string, number> = {};
    const fileTypes: Record<string, number> = {};

    files.forEach(file => {
      const extension = file.filename.split('.').pop()?.toLowerCase() || 'unknown';
      fileTypes[extension] = (fileTypes[extension] || 0) + 1;

      // Map extensions to languages (basic mapping)
      const language = this.mapExtensionToLanguage(extension);
      languageBreakdown[language] = (languageBreakdown[language] || 0) + file.changes;
    });

    return {
      totalAdditions,
      totalDeletions,
      totalFiles,
      languageBreakdown,
      fileTypes,
    };
  }

  /**
   * Calculate review statistics
   */
  private calculateReviewStats(
    reviews: GitHubReview[],
    reviewComments: GitHubReviewComment[],
    timeline: GitHubTimelineEvent[]
  ) {
    const approvals = reviews.filter(r => r.state === 'APPROVED').length;
    const changesRequested = reviews.filter(r => r.state === 'CHANGES_REQUESTED').length;
    const comments = reviewComments.length;

    // Calculate average review time (from PR creation to first review)
    const firstReview = reviews
      .filter(r => r.submitted_at)
      .sort((a, b) => new Date(a.submitted_at!).getTime() - new Date(b.submitted_at!).getTime())[0];

    let averageReviewTime = 0;
    if (firstReview && firstReview.submitted_at) {
      // This would need PR creation time, which we'll calculate in timeline stats
      averageReviewTime = 0; // Placeholder
    }

    return {
      approvals,
      changesRequested,
      comments,
      averageReviewTime,
    };
  }

  /**
   * Calculate timeline statistics
   */
  private calculateTimelineStats(
    pullRequest: GitHubPullRequest,
    reviews: GitHubReview[],
    timeline: GitHubTimelineEvent[]
  ) {
    const createdAt = new Date(pullRequest.created_at);
    const lastUpdateAt = new Date(pullRequest.updated_at);
    const mergedAt = pullRequest.merged_at ? new Date(pullRequest.merged_at) : undefined;
    const closedAt = pullRequest.closed_at ? new Date(pullRequest.closed_at) : undefined;

    const firstReviewAt = reviews
      .filter(r => r.submitted_at)
      .sort((a, b) => new Date(a.submitted_at!).getTime() - new Date(b.submitted_at!).getTime())[0]
      ?.submitted_at ? new Date(reviews[0].submitted_at!) : undefined;

    const totalDuration = lastUpdateAt.getTime() - createdAt.getTime();
    const reviewDuration = firstReviewAt 
      ? firstReviewAt.getTime() - createdAt.getTime() 
      : undefined;

    return {
      createdAt,
      firstReviewAt,
      lastUpdateAt,
      mergedAt,
      closedAt,
      totalDuration,
      reviewDuration,
    };
  }

  /**
   * Map file extension to programming language
   */
  private mapExtensionToLanguage(extension: string): string {
    const languageMap: Record<string, string> = {
      'js': 'JavaScript',
      'jsx': 'JavaScript',
      'ts': 'TypeScript',
      'tsx': 'TypeScript',
      'py': 'Python',
      'java': 'Java',
      'cpp': 'C++',
      'c': 'C',
      'cs': 'C#',
      'php': 'PHP',
      'rb': 'Ruby',
      'go': 'Go',
      'rs': 'Rust',
      'swift': 'Swift',
      'kt': 'Kotlin',
      'scala': 'Scala',
      'html': 'HTML',
      'css': 'CSS',
      'scss': 'SCSS',
      'sass': 'Sass',
      'less': 'Less',
      'md': 'Markdown',
      'json': 'JSON',
      'xml': 'XML',
      'yaml': 'YAML',
      'yml': 'YAML',
      'toml': 'TOML',
      'sql': 'SQL',
      'sh': 'Shell',
      'bash': 'Shell',
      'dockerfile': 'Docker',
      'makefile': 'Makefile',
    };

    return languageMap[extension] || 'Other';
  }
}