import React from 'react';
import { render } from '@testing-library/react';
import { CommitCard } from './index';
import { GitHubCommit, GitHubUser } from '../../../../github/types';

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
jest.mock('../../../atoms/pr/CommitHash', () => ({
  CommitHash: ({ hash }: { hash: string }) => <div data-testid="commit-hash">{hash.substring(0, 7)}</div>
}));

jest.mock('../../../atoms/pr/ContributorAvatar', () => ({
  ContributorAvatar: ({ user }: { user: GitHubUser }) => <div data-testid="contributor-avatar">{user.login}</div>
}));

jest.mock('../../../atoms/pr/MetricBadge', () => ({
  MetricBadge: ({ value, label }: { value: number, label: string }) => <div data-testid="metric-badge">{value} {label}</div>
}));

const mockUser: GitHubUser = {
  id: 1,
  login: 'testuser',
  avatar_url: 'https://example.com/avatar.jpg',
  html_url: 'https://github.com/testuser',
  type: 'User',
  name: 'Test User',
};

const mockCommit: GitHubCommit = {
  sha: 'a1b2c3d4e5f6789012345678901234567890abcd',
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
    message: 'Add new feature\n\nThis commit adds a comprehensive new feature with tests.',
    tree: {
      sha: 'tree123',
      url: 'https://api.github.com/repos/test/test/git/trees/tree123',
    },
    url: 'https://api.github.com/repos/test/test/git/commits/a1b2c3d',
    comment_count: 0,
  },
  url: 'https://api.github.com/repos/test/test/commits/a1b2c3d',
  html_url: 'https://github.com/test/test/commit/a1b2c3d',
  comments_url: 'https://api.github.com/repos/test/test/commits/a1b2c3d/comments',
  author: mockUser,
  committer: mockUser,
  parents: [],
  stats: {
    total: 150,
    additions: 100,
    deletions: 50,
  },
  files: [
    {
      filename: 'src/feature.js',
      status: 'added',
      additions: 50,
      deletions: 0,
      changes: 50,
    },
    {
      filename: 'tests/feature.test.js',
      status: 'added',
      additions: 30,
      deletions: 0,
      changes: 30,
    },
  ],
};

describe('CommitCard', () => {
  it('renders commit message correctly', () => {
    const { getByText } = render(<CommitCard commit={mockCommit} />);
    expect(getByText('Add new feature')).toBeInTheDocument();
  });

  it('renders commit hash', () => {
    const { getByTestId } = render(<CommitCard commit={mockCommit} />);
    expect(getByTestId('commit-hash')).toBeInTheDocument();
  });

  it('renders author information', () => {
    const { getByText, getByTestId } = render(<CommitCard commit={mockCommit} />);
    expect(getByText('Test User')).toBeInTheDocument();
    expect(getByText('by')).toBeInTheDocument();
    expect(getByTestId('contributor-avatar')).toBeInTheDocument();
  });

  it('shows stats when showStats is true', () => {
    const { getByTestId } = render(<CommitCard commit={mockCommit} showStats={true} />);
    const metricBadges = getByTestId('metric-badge');
    expect(metricBadges).toBeInTheDocument();
  });

  it('hides stats when showStats is false', () => {
    const { queryByTestId } = render(<CommitCard commit={mockCommit} showStats={false} />);
    expect(queryByTestId('metric-badge')).not.toBeInTheDocument();
  });

  it('shows files when showFiles is true', () => {
    const { getByText } = render(<CommitCard commit={mockCommit} showFiles={true} />);
    expect(getByText('Modified Files')).toBeInTheDocument();
    expect(getByText('feature.js')).toBeInTheDocument();
  });

  it('truncates long commit messages', () => {
    const longMessageCommit = {
      ...mockCommit,
      commit: {
        ...mockCommit.commit,
        message: 'This is a very long commit message that should be truncated because it exceeds the maximum length limit that we have set for display',
      },
    };
    
    const { getByText } = render(<CommitCard commit={longMessageCommit} maxMessageLength={50} />);
    expect(getByText(/\.\.\.$/)).toBeInTheDocument();
  });

  it('shows more indicator for multiline messages', () => {
    const { getByText } = render(<CommitCard commit={mockCommit} />);
    expect(getByText('View full message...')).toBeInTheDocument();
  });

  it('applies compact styling correctly', () => {
    const { container } = render(<CommitCard commit={mockCommit} compact={true} />);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveStyle('gap: 8px');
  });
});