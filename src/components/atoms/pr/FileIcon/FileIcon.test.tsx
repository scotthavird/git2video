import React from 'react';
import { render } from '@testing-library/react';
import { FileIcon } from './index';

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

describe('FileIcon', () => {
  it('renders JavaScript file icon', () => {
    const { getByText } = render(<FileIcon filename="app.js" />);
    expect(getByText('📄')).toBeInTheDocument();
  });

  it('renders React file icon', () => {
    const { getByText } = render(<FileIcon filename="Component.jsx" />);
    expect(getByText('⚛️')).toBeInTheDocument();
  });

  it('renders TypeScript file icon', () => {
    const { getByText } = render(<FileIcon filename="utils.ts" />);
    expect(getByText('📘')).toBeInTheDocument();
  });

  it('shows status indicator in overlay mode', () => {
    const { getByText } = render(
      <FileIcon filename="app.js" status="added" statusPosition="overlay" />
    );
    expect(getByText('+')).toBeInTheDocument();
  });

  it('shows status label in side mode', () => {
    const { getByText } = render(
      <FileIcon filename="app.js" status="modified" statusPosition="side" />
    );
    expect(getByText('Modified')).toBeInTheDocument();
    expect(getByText('~')).toBeInTheDocument();
  });

  it('renders fallback icon for unknown extensions', () => {
    const { getByText } = render(<FileIcon filename="unknown.xyz" />);
    expect(getByText('📄')).toBeInTheDocument();
  });

  it('handles files without extensions', () => {
    const { getByText } = render(<FileIcon filename="README" />);
    expect(getByText('📄')).toBeInTheDocument();
  });
});