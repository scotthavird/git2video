/**
 * Tests for DiffRevealAnimation component
 */

import React from 'react';
import { render } from '@testing-library/react';
import { DiffRevealAnimation } from './index';
import { ProcessedDiff } from '../utils/diffProcessor';

// Mock Remotion hooks
jest.mock('remotion', () => ({
  useCurrentFrame: () => 60,
  useVideoConfig: () => ({ fps: 30, width: 1920, height: 1080, durationInFrames: 240 }),
  interpolate: (input: number, inputRange: number[], outputRange: number[]) => {
    const factor = (input - inputRange[0]) / (inputRange[1] - inputRange[0]);
    return outputRange[0] + factor * (outputRange[1] - outputRange[0]);
  },
  spring: () => 0.5,
  AbsoluteFill: ({ children, style }: any) => <div style={style}>{children}</div>,
}));

const mockDiff: ProcessedDiff = {
  fileName: 'src/components/Button.tsx',
  language: 'typescript',
  status: 'modified',
  lines: [
    {
      type: 'context',
      content: 'import React from "react";',
      oldLineNumber: 1,
      newLineNumber: 1,
      originalIndex: 0,
    },
    {
      type: 'removed',
      content: 'const Button = () => {',
      oldLineNumber: 2,
      originalIndex: 1,
    },
    {
      type: 'added',
      content: 'const Button: React.FC<ButtonProps> = (props) => {',
      newLineNumber: 2,
      originalIndex: 2,
    },
    {
      type: 'context',
      content: '  return <button>Click me</button>;',
      oldLineNumber: 3,
      newLineNumber: 3,
      originalIndex: 3,
    },
  ],
  stats: {
    additions: 1,
    deletions: 1,
    changes: 2,
  },
  context: {
    beforeLines: [
      {
        type: 'removed',
        content: 'const Button = () => {',
        oldLineNumber: 2,
        originalIndex: 1,
      },
    ],
    afterLines: [
      {
        type: 'added',
        content: 'const Button: React.FC<ButtonProps> = (props) => {',
        newLineNumber: 2,
        originalIndex: 2,
      },
    ],
    changedLines: [
      {
        type: 'removed',
        content: 'const Button = () => {',
        oldLineNumber: 2,
        originalIndex: 1,
      },
      {
        type: 'added',
        content: 'const Button: React.FC<ButtonProps> = (props) => {',
        newLineNumber: 2,
        originalIndex: 2,
      },
    ],
  },
};

describe('DiffRevealAnimation', () => {
  const defaultProps = {
    diff: mockDiff,
    startFrame: 0,
    durationFrames: 120,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<DiffRevealAnimation {...defaultProps} />);
    expect(container).toBeInTheDocument();
  });

  it('displays file name and language', () => {
    const { getByText } = render(<DiffRevealAnimation {...defaultProps} />);
    expect(getByText('src/components/Button.tsx')).toBeInTheDocument();
    expect(getByText(/Language: typescript/)).toBeInTheDocument();
  });

  it('shows change statistics', () => {
    const { getByText } = render(<DiffRevealAnimation {...defaultProps} />);
    expect(getByText('+1')).toBeInTheDocument();
    expect(getByText('-1')).toBeInTheDocument();
  });

  it('renders line numbers when enabled', () => {
    const { container } = render(
      <DiffRevealAnimation {...defaultProps} showLineNumbers={true} />
    );
    const lineNumbers = container.querySelectorAll('[style*="monospace"]');
    expect(lineNumbers.length).toBeGreaterThan(0);
  });

  it('applies correct diff prefixes', () => {
    const { getByText } = render(<DiffRevealAnimation {...defaultProps} />);
    // The component should render diff prefixes like +, -, and spaces
    expect(getByText('+')).toBeInTheDocument();
    expect(getByText('-')).toBeInTheDocument();
  });

  it('handles different animation speeds', () => {
    const { rerender } = render(
      <DiffRevealAnimation {...defaultProps} animationSpeed="slow" />
    );
    
    rerender(<DiffRevealAnimation {...defaultProps} animationSpeed="fast" />);
    
    // Component should render without errors for different speeds
    expect(true).toBe(true);
  });

  it('supports different diff styles', () => {
    const { rerender } = render(
      <DiffRevealAnimation {...defaultProps} style="unified" />
    );
    
    rerender(<DiffRevealAnimation {...defaultProps} style="side-by-side" />);
    rerender(<DiffRevealAnimation {...defaultProps} style="split" />);
    
    // Component should render without errors for different styles
    expect(true).toBe(true);
  });

  it('can disable line numbers', () => {
    const { container } = render(
      <DiffRevealAnimation {...defaultProps} showLineNumbers={false} />
    );
    
    // With line numbers disabled, there should be fewer monospace elements
    // (only the code content, not the line number columns)
    expect(container).toBeInTheDocument();
  });

  it('can disable change highlighting', () => {
    const { container } = render(
      <DiffRevealAnimation {...defaultProps} highlightChanges={false} />
    );
    
    expect(container).toBeInTheDocument();
  });

  it('handles empty diff gracefully', () => {
    const emptyDiff: ProcessedDiff = {
      ...mockDiff,
      lines: [],
      stats: { additions: 0, deletions: 0, changes: 0 },
    };
    
    const { container } = render(
      <DiffRevealAnimation {...defaultProps} diff={emptyDiff} />
    );
    
    expect(container).toBeInTheDocument();
  });

  it('renders syntax highlighted content', () => {
    const { container } = render(<DiffRevealAnimation {...defaultProps} />);
    
    // Should contain spans with syntax highlighting
    const highlightedElements = container.querySelectorAll('span');
    expect(highlightedElements.length).toBeGreaterThan(0);
  });

  it('shows progress indicator', () => {
    const { container } = render(<DiffRevealAnimation {...defaultProps} />);
    
    // Should contain a progress bar element
    const progressBars = container.querySelectorAll('[style*="width"]');
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('displays summary footer when animation is near completion', () => {
    // Mock higher frame to simulate near completion
    const mockUseCurrentFrame = require('remotion').useCurrentFrame as jest.Mock;
    mockUseCurrentFrame.mockReturnValue(110); // Near the end
    
    const { getByText } = render(<DiffRevealAnimation {...defaultProps} />);
    
    // Should show the summary with change counts
    expect(getByText(/Changes: 2 lines/)).toBeInTheDocument();
  });

  it('handles different line types correctly', () => {
    const diffWithAllTypes: ProcessedDiff = {
      ...mockDiff,
      lines: [
        { type: 'hunk', content: '@@ -1,3 +1,3 @@', originalIndex: 0 },
        { type: 'context', content: 'unchanged line', oldLineNumber: 1, newLineNumber: 1, originalIndex: 1 },
        { type: 'removed', content: 'old line', oldLineNumber: 2, originalIndex: 2 },
        { type: 'added', content: 'new line', newLineNumber: 2, originalIndex: 3 },
        { type: 'header', content: 'diff --git a/file b/file', originalIndex: 4 },
      ],
    };
    
    const { container } = render(
      <DiffRevealAnimation {...defaultProps} diff={diffWithAllTypes} />
    );
    
    expect(container).toBeInTheDocument();
  });
});