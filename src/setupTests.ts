import '@testing-library/jest-dom';
import React from 'react';

// Mock Remotion hooks globally
jest.mock('remotion', () => ({
  useCurrentFrame: () => 0,
  useVideoConfig: () => ({ fps: 30, height: 1080, width: 1920 }),
  interpolate: jest.fn((value: any, input: any, output: any) => output[0]),
  spring: jest.fn(() => 1),
  AbsoluteFill: ({ children, ...props }: any) => 
    React.createElement('div', { 
      'data-testid': 'absolute-fill', 
      style: { 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
        ...props?.style 
      }, 
      ...props 
    }, children),
}));

// Mock CSS-in-JS and styles for better testing
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: (prop: string) => {
      // Return mock values for common CSS properties
      const mockStyles: Record<string, string> = {
        'background': 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
        'background-color': '#ff6b6b',
        'position': 'absolute',
        'top': '60px',
        'left': '50%',
        'transform': 'translateX(-50%)',
        'z-index': '10',
        'margin-top': '20px',
      };
      return mockStyles[prop] || '';
    },
  }),
});

// Mock HTMLElement style property for testing
Object.defineProperty(HTMLElement.prototype, 'style', {
  writable: true,
  value: {
    background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
    position: 'absolute',
    top: '60px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: '10',
    marginTop: '20px',
  },
}); 