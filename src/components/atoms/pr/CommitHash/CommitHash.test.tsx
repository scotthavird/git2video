import React from 'react';
import { render } from '@testing-library/react';
import { CommitHash } from './index';

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

describe('CommitHash', () => {
  const fullHash = 'a1b2c3d4e5f6789012345678901234567890abcd';

  it('renders short hash by default', () => {
    const { getByText } = render(<CommitHash hash={fullHash} />);
    expect(getByText('a1b2c3d')).toBeInTheDocument();
  });

  it('renders full hash when short is false', () => {
    const { getByText } = render(<CommitHash hash={fullHash} short={false} />);
    expect(getByText(fullHash)).toBeInTheDocument();
  });

  it('shows copy icon when copyable is true', () => {
    const { getByText } = render(<CommitHash hash={fullHash} copyable={true} />);
    expect(getByText('📋')).toBeInTheDocument();
  });

  it('applies correct style variant', () => {
    const { container } = render(<CommitHash hash={fullHash} style="badge" />);
    const codeElement = container.querySelector('code');
    expect(codeElement).toHaveStyle('border-radius: 12px');
  });

  it('shows copy feedback when enabled', () => {
    const { getByText } = render(
      <CommitHash hash={fullHash} showCopyFeedback={true} />
    );
    expect(getByText('Copied!')).toBeInTheDocument();
  });
});