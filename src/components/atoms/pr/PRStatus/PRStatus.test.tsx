import React from 'react';
import { render } from '@testing-library/react';
import { PRStatus } from './index';

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

describe('PRStatus', () => {
  it('renders open status correctly', () => {
    const { getByText } = render(<PRStatus status="open" />);
    expect(getByText('Open')).toBeInTheDocument();
  });

  it('renders closed status correctly', () => {
    const { getByText } = render(<PRStatus status="closed" />);
    expect(getByText('Closed')).toBeInTheDocument();
  });

  it('renders merged status correctly when merged is true', () => {
    const { getByText } = render(<PRStatus status="closed" merged={true} />);
    expect(getByText('Merged')).toBeInTheDocument();
  });

  it('renders draft status correctly', () => {
    const { getByText } = render(<PRStatus status="draft" />);
    expect(getByText('Draft')).toBeInTheDocument();
  });

  it('applies correct size styles', () => {
    const { container } = render(<PRStatus status="open" size="large" />);
    const statusElement = container.firstChild as HTMLElement;
    expect(statusElement.style.fontSize).toBe('16px');
  });
});