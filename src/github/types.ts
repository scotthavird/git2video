/**
 * Comprehensive TypeScript interfaces for GitHub API data structures
 * Used for PR data extraction and video generation
 */

// Base GitHub API types
export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  type: 'User' | 'Bot';
  name?: string;
  email?: string;
  company?: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: GitHubUser;
  html_url: string;
  description?: string;
  private: boolean;
  fork: boolean;
  language?: string;
  default_branch: string;
}

// Pull Request types
export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: 'open' | 'closed';
  merged: boolean;
  draft: boolean;
  user: GitHubUser;
  assignees: GitHubUser[];
  reviewers: GitHubUser[];
  labels: GitHubLabel[];
  milestone?: GitHubMilestone;
  base: GitHubBranch;
  head: GitHubBranch;
  html_url: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  merged_at?: string;
  merge_commit_sha?: string;
  mergeable?: boolean;
  mergeable_state?: string;
  merged_by?: GitHubUser;
  comments: number;
  review_comments: number;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
}

export interface GitHubBranch {
  label: string;
  ref: string;
  sha: string;
  user: GitHubUser;
  repo: GitHubRepository;
}

export interface GitHubLabel {
  id: number;
  name: string;
  color: string;
  description?: string;
}

export interface GitHubMilestone {
  id: number;
  number: number;
  title: string;
  description?: string;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  due_on?: string;
  closed_at?: string;
}

// Commit types
export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
    tree: {
      sha: string;
      url: string;
    };
    url: string;
    comment_count: number;
  };
  url: string;
  html_url: string;
  comments_url: string;
  author?: GitHubUser;
  committer?: GitHubUser;
  parents: Array<{
    sha: string;
    url: string;
    html_url: string;
  }>;
  stats?: {
    total: number;
    additions: number;
    deletions: number;
  };
  files?: GitHubFile[];
}

// File change types
export interface GitHubFile {
  sha?: string;
  filename: string;
  status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'changed' | 'unchanged';
  additions: number;
  deletions: number;
  changes: number;
  blob_url?: string;
  raw_url?: string;
  contents_url?: string;
  patch?: string;
  previous_filename?: string;
}

// Review types
export interface GitHubReview {
  id: number;
  user: GitHubUser;
  body?: string;
  state: 'PENDING' | 'COMMENTED' | 'APPROVED' | 'CHANGES_REQUESTED' | 'DISMISSED';
  html_url: string;
  pull_request_url: string;
  author_association: string;
  submitted_at?: string;
  commit_id: string;
}

export interface GitHubReviewComment {
  id: number;
  pull_request_review_id?: number;
  diff_hunk: string;
  path: string;
  position?: number;
  original_position?: number;
  commit_id: string;
  original_commit_id: string;
  user: GitHubUser;
  body: string;
  created_at: string;
  updated_at: string;
  html_url: string;
  pull_request_url: string;
  author_association: string;
  in_reply_to_id?: number;
  start_line?: number;
  line?: number;
  start_side?: 'LEFT' | 'RIGHT';
  side?: 'LEFT' | 'RIGHT';
}

// Issue comment types (for PR discussions)
export interface GitHubIssueComment {
  id: number;
  user: GitHubUser;
  created_at: string;
  updated_at: string;
  author_association: string;
  body: string;
  html_url: string;
  issue_url: string;
}

// Timeline event types
export interface GitHubTimelineEvent {
  id?: number;
  event: string;
  created_at: string;
  actor?: GitHubUser;
  commit_id?: string;
  commit_url?: string;
  label?: GitHubLabel;
  assignee?: GitHubUser;
  assigner?: GitHubUser;
  milestone?: GitHubMilestone;
  rename?: {
    from: string;
    to: string;
  };
  dismissed_review?: {
    state: string;
    review_id: number;
    dismissal_message?: string;
  };
  state?: string;
  body?: string;
  html_url?: string;
}

// Rate limiting types
export interface GitHubRateLimit {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
  resource: string;
}

export interface GitHubRateLimitResponse {
  resources: {
    core: GitHubRateLimit;
    search: GitHubRateLimit;
    graphql: GitHubRateLimit;
    integration_manifest: GitHubRateLimit;
    source_import: GitHubRateLimit;
    code_scanning_upload: GitHubRateLimit;
    actions_runner_registration: GitHubRateLimit;
    scim: GitHubRateLimit;
    dependency_snapshots: GitHubRateLimit;
  };
  rate: GitHubRateLimit;
}

// API Error types
export interface GitHubApiError {
  message: string;
  documentation_url?: string;
  errors?: Array<{
    resource: string;
    field: string;
    code: string;
    message?: string;
  }>;
}

// Response wrapper types
export interface GitHubApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
  rateLimit?: GitHubRateLimit;
}

// Aggregated data types for video generation
export interface PRVideoData {
  pullRequest: GitHubPullRequest;
  commits: GitHubCommit[];
  files: GitHubFile[];
  reviews: GitHubReview[];
  reviewComments: GitHubReviewComment[];
  issueComments: GitHubIssueComment[];
  timeline: GitHubTimelineEvent[];
  repository: GitHubRepository;
  participants: GitHubUser[];
  codeStats: {
    totalAdditions: number;
    totalDeletions: number;
    totalFiles: number;
    languageBreakdown: Record<string, number>;
    fileTypes: Record<string, number>;
  };
  reviewStats: {
    approvals: number;
    changesRequested: number;
    comments: number;
    averageReviewTime: number;
  };
  timelineStats: {
    createdAt: Date;
    firstReviewAt?: Date;
    lastUpdateAt: Date;
    mergedAt?: Date;
    closedAt?: Date;
    totalDuration: number;
    reviewDuration?: number;
  };
}

// Configuration types
export interface GitHubConfig {
  token: string;
  baseUrl?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  rateLimitBuffer?: number;
}

// Fetch options
export interface FetchOptions {
  includeCommits?: boolean;
  includeFiles?: boolean;
  includeReviews?: boolean;
  includeComments?: boolean;
  includeTimeline?: boolean;
  parallel?: boolean;
  maxConcurrency?: number;
}

// Error types
export class GitHubApiRateLimitError extends Error {
  constructor(
    message: string,
    public resetTime: Date,
    public remainingRequests: number
  ) {
    super(message);
    this.name = 'GitHubApiRateLimitError';
  }
}

export class GitHubApiAuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GitHubApiAuthenticationError';
  }
}

export class GitHubApiNotFoundError extends Error {
  constructor(message: string, public resource: string) {
    super(message);
    this.name = 'GitHubApiNotFoundError';
  }
}

export class GitHubApiFetchError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any
  ) {
    super(message);
    this.name = 'GitHubApiFetchError';
  }
}