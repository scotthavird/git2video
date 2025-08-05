import React from 'react';
import { render } from '@testing-library/react';
import { DiffLine } from './index';

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

describe('DiffLine', () => {
  it('renders added line correctly', () => {
    const { getByText } = render(
      <DiffLine content="console.log('Hello');" type="added" />
    );
    expect(getByText('+')).toBeInTheDocument();
    expect(getByText("console.log('Hello');")).toBeInTheDocument();
  });

  it('renders removed line correctly', () => {
    const { getByText } = render(
      <DiffLine content="console.log('Goodbye');" type="removed" />
    );
    expect(getByText('-')).toBeInTheDocument();
  });

  it('renders context line correctly', () => {
    const { getByText } = render(
      <DiffLine content="function test() {" type="context" />
    );
    expect(getByText(' ')).toBeInTheDocument();
  });

  it('renders header line correctly', () => {
    const { getByText } = render(
      <DiffLine content="@@ -1,4 +1,4 @@" type="header" />
    );
    expect(getByText('@')).toBeInTheDocument();
  });

  it('shows line numbers when enabled', () => {
    const { getByText } = render(
      <DiffLine 
        content="test line" 
        type="context" 
        oldLineNumber={10}
        newLineNumber={10}
        showLineNumbers={true}
      />
    );
    expect(getByText('10')).toBeInTheDocument();
  });

  it('hides line numbers when disabled', () => {
    const { container } = render(
      <DiffLine 
        content="test line" 
        type="context" 
        showLineNumbers={false}
      />
    );
    expect(container.textContent).not.toContain('10');
  });

  it('applies syntax highlighting for JavaScript keywords', () => {
    const { container } = render(
      <DiffLine 
        content="function test() {" 
        type="added" 
        highlightSyntax={true}
        language="javascript"
      />
    );
    const contentElement = container.querySelector('span[style*="color"]');
    expect(contentElement).toBeInTheDocument();
  });
});