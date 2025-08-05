import React from 'react';
import { render } from '@testing-library/react';
import { MetricBadge } from './index';

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

describe('MetricBadge', () => {
  it('renders value and label correctly', () => {
    const { getByText } = render(
      <MetricBadge value={42} label="commits" />
    );
    expect(getByText('42')).toBeInTheDocument();
    expect(getByText('commits')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    const { getByText } = render(
      <MetricBadge value={10} label="files" icon="📁" />
    );
    expect(getByText('📁')).toBeInTheDocument();
  });

  it('formats value with custom formatter', () => {
    const customFormat = (val: number) => `${val}%`;
    const { getByText } = render(
      <MetricBadge 
        value={95} 
        label="coverage" 
        formatValue={customFormat}
      />
    );
    expect(getByText('95%')).toBeInTheDocument();
  });

  it('applies success type styling', () => {
    const { container } = render(
      <MetricBadge value={100} label="tests" type="success" />
    );
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveStyle('background-color: #52c41a');
  });

  it('uses vertical layout correctly', () => {
    const { container } = render(
      <MetricBadge value={5} label="reviews" layout="vertical" />
    );
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveStyle('flex-direction: column');
  });

  it('disables count animation when countAnimation is false', () => {
    const { getByText } = render(
      <MetricBadge value={1000} label="lines" countAnimation={false} />
    );
    expect(getByText('1,000')).toBeInTheDocument();
  });
});