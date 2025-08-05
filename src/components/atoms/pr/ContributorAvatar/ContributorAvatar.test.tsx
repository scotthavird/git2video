import React from 'react';
import { render } from '@testing-library/react';
import { ContributorAvatar } from './index';
import { GitHubUser } from '../../../../github/types';

// Mock Remotion hooks
jest.mock('remotion', () => ({
  useCurrentFrame: jest.fn(() => 30),
  useVideoConfig: jest.fn(() => ({ fps: 30, width: 1920, height: 1080 })),
  interpolate: jest.fn((frame, range, output) => {
    if (frame <= range[0]) return output[0];
    if (frame >= range[1]) return output[1];
    const progress = (frame - range[0]) / (range[1] - range[0]);
    return output[0] + (output[1] - output[0]) * progress;
  }),
  spring: jest.fn(() => 1),
}));

const mockUser: GitHubUser = {
  id: 1,
  login: 'testuser',
  avatar_url: 'https://example.com/avatar.jpg',
  html_url: 'https://github.com/testuser',
  type: 'User',
  name: 'Test User',
  email: 'test@example.com',
};

describe('ContributorAvatar', () => {
  it('renders user avatar with image', () => {
    const { getByAltText } = render(<ContributorAvatar user={mockUser} />);
    expect(getByAltText('testuser avatar')).toBeInTheDocument();
  });

  it('renders fallback initials when no avatar', () => {
    const userWithoutAvatar = { ...mockUser, avatar_url: '', name: 'Test User' };
    const { getByText } = render(<ContributorAvatar user={userWithoutAvatar} />);
    expect(getByText('T')).toBeInTheDocument();
  });

  it('shows role badge when showRole is true', () => {
    const { getByText } = render(
      <ContributorAvatar user={mockUser} showRole={true} role="author" />
    );
    expect(getByText('author')).toBeInTheDocument();
  });

  it('shows tooltip when showTooltip is true', () => {
    const { getByText } = render(
      <ContributorAvatar user={mockUser} showTooltip={true} />
    );
    expect(getByText('Test User')).toBeInTheDocument();
  });

  it('shows bot indicator for bot users', () => {
    const botUser = { ...mockUser, type: 'Bot' as const };
    const { getByText } = render(<ContributorAvatar user={botUser} />);
    expect(getByText('🤖')).toBeInTheDocument();
  });
});