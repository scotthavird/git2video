import React from 'react';
import { render } from '@testing-library/react';
import { PRHeader } from './index';
import { GitHubPullRequest, GitHubRepository, GitHubUser } from '../../../../github/types';

// Mock Remotion hooks
jest.mock('remotion', () => ({
  useCurrentFrame: jest.fn(() => 60),
  useVideoConfig: jest.fn(() => ({ fps: 30, width: 1920, height: 1080 })),
  interpolate: jest.fn((frame, range, output) => {
    if (frame <= range[0]) return output[0];
    if (frame >= range[1]) return output[1];
    const progress = (frame - range[0]) / (range[1] - range[0]);
    return output[0] + (output[1] - output[0]) * progress;
  }),
  spring: jest.fn(() => 1),
}));

// Mock atomic components
jest.mock('../../../atoms/pr/PRStatus', () => ({
  PRStatus: ({ status }: { status: string }) => <div data-testid="pr-status">{status}</div>
}));

jest.mock('../../../atoms/pr/ContributorAvatar', () => ({
  ContributorAvatar: ({ user }: { user: GitHubUser }) => <div data-testid="contributor-avatar">{user.login}</div>
}));

const mockUser: GitHubUser = {
  id: 1,
  login: 'testuser',
  avatar_url: 'https://example.com/avatar.jpg',
  html_url: 'https://github.com/testuser',
  type: 'User',
  name: 'Test User',
};

const mockRepository: GitHubRepository = {
  id: 1,
  name: 'test-repo',
  full_name: 'testuser/test-repo',
  owner: mockUser,
  html_url: 'https://github.com/testuser/test-repo',
  private: false,
  fork: false,
  default_branch: 'main',
};

const mockPullRequest: GitHubPullRequest = {
  id: 1,
  number: 123,
  title: 'Add new feature',
  body: 'This PR adds a new feature',
  state: 'open',
  merged: false,
  draft: false,
  user: mockUser,
  assignees: [],
  reviewers: [],
  labels: [
    { id: 1, name: 'feature', color: '0e8a16', description: 'New feature' },
    { id: 2, name: 'high-priority', color: 'd73a4a', description: 'High priority' },
  ],
  base: {
    label: 'main',
    ref: 'main',
    sha: 'abc123',
    user: mockUser,
    repo: mockRepository,
  },
  head: {
    label: 'feature-branch',
    ref: 'feature-branch', 
    sha: 'def456',
    user: mockUser,
    repo: mockRepository,
  },
  html_url: 'https://github.com/testuser/test-repo/pull/123',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-02T00:00:00Z',
  comments: 5,
  review_comments: 3,
  commits: 10,
  additions: 100,
  deletions: 50,
  changed_files: 8,
};

describe('PRHeader', () => {
  it('renders PR title and number correctly', () => {
    const { getByText } = render(
      <PRHeader pullRequest={mockPullRequest} repository={mockRepository} />
    );
    expect(getByText('Add new feature')).toBeInTheDocument();
    expect(getByText('#123')).toBeInTheDocument();
  });

  it('renders repository name', () => {
    const { getByText } = render(
      <PRHeader pullRequest={mockPullRequest} repository={mockRepository} />
    );
    expect(getByText('testuser/test-repo')).toBeInTheDocument();
  });

  it('renders branch information', () => {
    const { getByText } = render(
      <PRHeader pullRequest={mockPullRequest} repository={mockRepository} />
    );
    expect(getByText('feature-branch')).toBeInTheDocument();
    expect(getByText('main')).toBeInTheDocument();
    expect(getByText('→')).toBeInTheDocument();
  });

  it('renders labels when showLabels is true', () => {
    const { getByText } = render(
      <PRHeader pullRequest={mockPullRequest} repository={mockRepository} showLabels={true} />
    );
    expect(getByText('feature')).toBeInTheDocument();
    expect(getByText('high-priority')).toBeInTheDocument();
  });

  it('hides labels when showLabels is false', () => {
    const { queryByText } = render(
      <PRHeader pullRequest={mockPullRequest} repository={mockRepository} showLabels={false} />
    );
    expect(queryByText('feature')).not.toBeInTheDocument();
  });

  it('renders milestone when present', () => {
    const prWithMilestone = {
      ...mockPullRequest,
      milestone: {
        id: 1,
        number: 1,
        title: 'v1.0.0',
        state: 'open' as const,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z',
      },
    };
    
    const { getByText } = render(
      <PRHeader pullRequest={prWithMilestone} repository={mockRepository} showMilestone={true} />
    );
    expect(getByText('v1.0.0')).toBeInTheDocument();
  });

  it('applies compact styling correctly', () => {
    const { container } = render(
      <PRHeader pullRequest={mockPullRequest} repository={mockRepository} compact={true} />
    );
    const header = container.firstChild as HTMLElement;
    expect(header).toHaveStyle('gap: 12px');
  });
});