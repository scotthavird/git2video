/**
 * Visual regression testing for video components
 * Tests component rendering consistency and visual output
 */

import React from 'react';
import { render } from '@testing-library/react';
import { DiffRevealAnimation } from '../../../components/molecules/pr/code/DiffRevealAnimation';
import { FileNavigationAnimation } from '../../../components/molecules/pr/code/FileNavigationAnimation';
import { LineByLineWalkthrough } from '../../../components/molecules/pr/code/LineByLineWalkthrough';
import { PRHeader } from '../../../components/molecules/pr/PRHeader';
import { CommitCard } from '../../../components/molecules/pr/CommitCard';
import { processGitHubFile } from '../../../components/molecules/pr/code/utils/diffProcessor';
import { TestDataBuilder, ComponentTestUtils } from '../testUtils';

// Mock Remotion hooks for consistent testing
jest.mock('remotion', () => ({
  useCurrentFrame: () => 60,
  useVideoConfig: () => ({
    fps: 30,
    width: 1920,
    height: 1080,
    durationInFrames: 240
  }),
  interpolate: (input: number, inputRange: number[], outputRange: number[]) => {
    const factor = Math.max(0, Math.min(1, (input - inputRange[0]) / (inputRange[1] - inputRange[0])));
    return outputRange[0] + factor * (outputRange[1] - outputRange[0]);
  },
  spring: () => 0.8,
  AbsoluteFill: ({ children, style }: any) => (
    <div data-testid="absolute-fill" style={{ position: 'absolute', ...style }}>
      {children}
    </div>
  ),
  Sequence: ({ children }: any) => <div data-testid="sequence">{children}</div>,
}));

describe('Visual Regression Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('DiffRevealAnimation Visual Tests', () => {
    const createMockDiff = () => {
      const githubFile = {
        filename: 'src/components/Button.tsx',
        status: 'modified' as const,
        additions: 3,
        deletions: 2,
        changes: 5,
        patch: `@@ -1,5 +1,6 @@
 import React from 'react';
+import { ButtonProps } from './types';
 
-const Button = () => {
+const Button: React.FC<ButtonProps> = (props) => {
   return <button>Click me</button>;`
      };
      return processGitHubFile(githubFile)!;
    };

    it('should render diff animation with consistent layout', () => {
      // Arrange
      const diff = createMockDiff();
      const props = {
        diff,
        startFrame: 0,
        durationFrames: 120,
        showLineNumbers: true,
        highlightChanges: true
      };

      // Act
      const { container, getByText } = render(<DiffRevealAnimation {...props} />);

      // Assert - Layout structure
      expect(container.querySelector('[data-testid="absolute-fill"]')).toBeInTheDocument();
      expect(getByText('src/components/Button.tsx')).toBeInTheDocument();
      expect(getByText(/Language: tsx/)).toBeInTheDocument();
      
      // Progress indicator should be present
      const progressElements = container.querySelectorAll('[style*="width"]');
      expect(progressElements.length).toBeGreaterThan(0);
      
      // Diff markers should be present
      expect(getByText('+')).toBeInTheDocument();
      expect(getByText('-')).toBeInTheDocument();
    });

    it('should maintain visual consistency across different animation speeds', () => {
      const diff = createMockDiff();
      const speeds = ['slow', 'normal', 'fast'] as const;
      
      speeds.forEach(speed => {
        const props = {
          diff,
          startFrame: 0,
          durationFrames: 120,
          animationSpeed: speed
        };

        const { container } = render(<DiffRevealAnimation {...props} />);
        
        // Core elements should always be present regardless of speed
        expect(container.querySelector('[data-testid="absolute-fill"]')).toBeInTheDocument();
        
        // File header should be consistent
        const fileHeader = container.querySelector('div');
        expect(fileHeader).toBeInTheDocument();
        
        // Cleanup for next iteration
        // Note: In a real test environment, you'd want to use separate test instances
      });
    });

    it('should handle different diff styles visually', () => {
      const diff = createMockDiff();
      const styles = ['unified', 'side-by-side', 'split'] as const;
      
      styles.forEach(style => {
        const props = {
          diff,
          startFrame: 0,
          durationFrames: 120,
          style
        };

        const { container } = render(<DiffRevealAnimation {...props} />);
        
        // Should render without visual errors
        expect(container.querySelector('[data-testid="absolute-fill"]')).toBeInTheDocument();
        
        // Should have diff content regardless of style
        const diffContent = container.querySelectorAll('[style*="monospace"]');
        expect(diffContent.length).toBeGreaterThan(0);
      });
    });
  });

  describe('FileNavigationAnimation Visual Tests', () => {
    const createMockFiles = () => {
      const files = [
        {
          filename: 'src/components/Button.tsx',
          status: 'modified' as const,
          additions: 15,
          deletions: 5,
          changes: 20,
          patch: 'mock patch content'
        },
        {
          filename: 'src/utils/helpers.ts',
          status: 'added' as const,
          additions: 50,
          deletions: 0,
          changes: 50,
          patch: 'mock patch content'
        },
        {
          filename: 'README.md',
          status: 'modified' as const,
          additions: 2,
          deletions: 1,
          changes: 3,
          patch: 'mock patch content'
        }
      ];
      
      return files.map(file => processGitHubFile(file)!);
    };

    it('should render file navigation with consistent structure', () => {
      // Arrange
      const files = createMockFiles();
      const props = {
        files,
        startFrame: 0,
        durationFrames: 180,
        showFileTree: true,
        highlightChanges: true
      };

      // Act
      const { container, getByText } = render(<FileNavigationAnimation {...props} />);

      // Assert
      expect(container.querySelector('[data-testid="absolute-fill"]')).toBeInTheDocument();
      expect(getByText('📂 File Changes Overview')).toBeInTheDocument();
      expect(getByText(`Reviewing ${files.length} changed files`)).toBeInTheDocument();
      
      // File tree should show file count
      expect(getByText(`📁 Changed Files (${files.length})`)).toBeInTheDocument();
      
      // Progress indicator should be present
      const progressDots = container.querySelectorAll('[style*="border-radius: 50%"]');
      expect(progressDots.length).toBe(files.length);
    });

    it('should display file icons and status correctly', () => {
      const files = createMockFiles();
      const props = {
        files,
        startFrame: 0,
        durationFrames: 180,
        showFileTree: true
      };

      const { container } = render(<FileNavigationAnimation {...props} />);
      
      // Should contain file status indicators
      const statusElements = Array.from(container.querySelectorAll('*')).filter(
        el => el.textContent?.includes('➕') || 
             el.textContent?.includes('📝') || 
             el.textContent?.includes('➖')
      );
      expect(statusElements.length).toBeGreaterThan(0);
      
      // Should contain file type icons
      const iconElements = Array.from(container.querySelectorAll('*')).filter(
        el => el.textContent?.includes('🟦') || // TypeScript
             el.textContent?.includes('📝') || // Markdown
             el.textContent?.includes('📄')    // Generic
      );
      expect(iconElements.length).toBeGreaterThan(0);
    });

    it('should handle different animation styles visually', () => {
      const files = createMockFiles();
      const animationStyles = ['slide', 'fade', 'scale', 'flip'] as const;
      
      animationStyles.forEach(animationStyle => {
        const props = {
          files,
          startFrame: 0,
          durationFrames: 180,
          animationStyle
        };

        const { container } = render(<FileNavigationAnimation {...props} />);
        
        // Core structure should be consistent
        expect(container.querySelector('[data-testid="absolute-fill"]')).toBeInTheDocument();
        
        // Should have main content area
        const contentAreas = container.querySelectorAll('[style*="position: absolute"]');
        expect(contentAreas.length).toBeGreaterThan(0);
      });
    });
  });

  describe('LineByLineWalkthrough Visual Tests', () => {
    const createMockDiffForWalkthrough = () => {
      const githubFile = {
        filename: 'src/auth/login.ts',
        status: 'modified' as const,
        additions: 8,
        deletions: 3,
        changes: 11,
        patch: `@@ -10,15 +10,20 @@ export class LoginService {
   }
 
-  async login(username: string, password: string) {
+  async login(username: string, password: string): Promise<LoginResult> {
+    // Validate input parameters
+    if (!username || !password) {
+      throw new Error('Username and password are required');
+    }
+    
     const user = await this.findUser(username);
     if (!user) {
-      throw new Error('User not found');
+      return { success: false, error: 'Invalid credentials' };
     }
     
-    const isValid = await this.validatePassword(password, user.hash);
+    const isValid = await this.validatePassword(password, user.passwordHash);
     if (!isValid) {
-      throw new Error('Invalid password');
+      return { success: false, error: 'Invalid credentials' };
     }
     
     return { success: true, user };`
      };
      return processGitHubFile(githubFile)!;
    };

    it('should render walkthrough with proper layout structure', () => {
      // Arrange
      const diff = createMockDiffForWalkthrough();
      const props = {
        diff,
        startFrame: 0,
        durationFrames: 240,
        focusMode: 'context' as const,
        showMinimap: true
      };

      // Act
      const { container, getByText } = render(<LineByLineWalkthrough {...props} />);

      // Assert
      expect(container.querySelector('[data-testid="absolute-fill"]')).toBeInTheDocument();
      expect(getByText(/🔍 Line-by-Line Review:/)).toBeInTheDocument();
      expect(getByText(/src\/auth\/login\.ts/)).toBeInTheDocument();
      
      // Should show language and statistics
      expect(getByText(/typescript/)).toBeInTheDocument();
      expect(getByText(/changes/)).toBeInTheDocument();
    });

    it('should display code with proper syntax highlighting structure', () => {
      const diff = createMockDiffForWalkthrough();
      const props = {
        diff,
        startFrame: 0,
        durationFrames: 240,
        focusMode: 'context' as const
      };

      const { container } = render(<LineByLineWalkthrough {...props} />);
      
      // Should have monospace code areas
      const codeElements = container.querySelectorAll('[style*="monospace"]');
      expect(codeElements.length).toBeGreaterThan(0);
      
      // Should have line numbers if enabled (default)
      const lineNumbers = Array.from(container.querySelectorAll('*')).filter(
        el => el.textContent && /^\d+$/.test(el.textContent.trim())
      );
      expect(lineNumbers.length).toBeGreaterThan(0);
      
      // Should have diff markers
      const diffMarkers = Array.from(container.querySelectorAll('*')).filter(
        el => el.textContent === '+' || el.textContent === '-' || el.textContent === ' '
      );
      expect(diffMarkers.length).toBeGreaterThan(0);
    });

    it('should render sidebar when explanation style is sidebar', () => {
      const diff = createMockDiffForWalkthrough();
      const props = {
        diff,
        startFrame: 0,
        durationFrames: 240,
        explanationStyle: 'sidebar' as const,
        focusMode: 'context' as const
      };

      const { container } = render(<LineByLineWalkthrough {...props} />);
      
      // Should have sidebar elements
      const sidebarElements = container.querySelectorAll('[style*="right:"]');
      expect(sidebarElements.length).toBeGreaterThan(0);
      
      // Should show step information
      const stepElements = Array.from(container.querySelectorAll('*')).filter(
        el => el.textContent?.includes('Step') && el.textContent?.includes('of')
      );
      expect(stepElements.length).toBeGreaterThan(0);
    });

    it('should display minimap when enabled', () => {
      const diff = createMockDiffForWalkthrough();
      const props = {
        diff,
        startFrame: 0,
        durationFrames: 240,
        showMinimap: true,
        focusMode: 'context' as const
      };

      const { container } = render(<LineByLineWalkthrough {...props} />);
      
      // Minimap should create multiple line elements
      const minimapLines = container.querySelectorAll('[style*="height:"][style*="background"]');
      expect(minimapLines.length).toBeGreaterThan(0);
    });
  });

  describe('PR Component Visual Tests', () => {
    it('should render PR header with consistent styling', () => {
      const prData = TestDataBuilder.createMockVideoMetadata();
      const props = {
        pr: prData,
        showAvatar: true,
        showStatus: true,
        showMetrics: true
      };

      const { container, getByText } = render(<PRHeader {...props} />);
      
      // Should display title
      expect(getByText(prData.title)).toBeInTheDocument();
      
      // Should display author information
      expect(getByText(prData.author.name)).toBeInTheDocument();
      
      // Should display status if enabled
      if (props.showStatus) {
        expect(getByText(prData.status)).toBeInTheDocument();
      }
    });

    it('should render commit card with proper information display', () => {
      const commit = TestDataBuilder.createMockVideoMetadata().commits[0];
      const props = {
        commit,
        showDiff: true,
        showAuthor: true,
        showTimestamp: true
      };

      const { container, getByText } = render(<CommitCard {...props} />);
      
      // Should display commit message
      expect(getByText(commit.message)).toBeInTheDocument();
      
      // Should display author
      expect(getByText(commit.author.name)).toBeInTheDocument();
      
      // Should display metrics
      expect(getByText(`+${commit.additions}`)).toBeInTheDocument();
      expect(getByText(`-${commit.deletions}`)).toBeInTheDocument();
    });
  });

  describe('Cross-Component Visual Consistency', () => {
    it('should use consistent color schemes across components', () => {
      // This test would typically use visual regression testing tools
      // For now, we test that components render without errors and have expected structure
      
      const diff = processGitHubFile({
        filename: 'test.ts',
        status: 'modified',
        additions: 5,
        deletions: 2,
        changes: 7,
        patch: 'mock patch'
      })!;

      const components = [
        <DiffRevealAnimation key="diff" diff={diff} startFrame={0} durationFrames={120} />,
        <FileNavigationAnimation key="nav" files={[diff]} startFrame={0} durationFrames={120} />,
        <LineByLineWalkthrough key="walk" diff={diff} startFrame={0} durationFrames={120} />
      ];

      components.forEach((component, index) => {
        const { container } = render(component);
        
        // Each component should have proper root container
        expect(container.querySelector('[data-testid="absolute-fill"]')).toBeInTheDocument();
        
        // Should not have broken layouts (basic check)
        expect(container.firstChild).toBeInTheDocument();
      });
    });

    it('should maintain responsive layout principles', () => {
      // Test components at different viewport assumptions
      const diff = processGitHubFile({
        filename: 'responsive.ts',
        status: 'modified',
        additions: 10,
        deletions: 5,
        changes: 15,
        patch: 'mock patch'
      })!;

      // Mock different video configurations
      const configs = [
        { width: 1920, height: 1080 }, // Full HD
        { width: 1280, height: 720 },  // HD
        { width: 854, height: 480 }    // SD
      ];

      configs.forEach(config => {
        // Mock the video config for this test
        require('remotion').useVideoConfig.mockReturnValue({
          ...config,
          fps: 30,
          durationInFrames: 240
        });

        const { container } = render(
          <DiffRevealAnimation diff={diff} startFrame={0} durationFrames={120} />
        );

        // Should render successfully at different resolutions
        expect(container.querySelector('[data-testid="absolute-fill"]')).toBeInTheDocument();
      });
    });
  });

  describe('Animation State Visual Tests', () => {
    it('should handle animation states visually', () => {
      const diff = processGitHubFile({
        filename: 'animation.ts',
        status: 'modified',
        additions: 8,
        deletions: 3,
        changes: 11,
        patch: 'mock patch'
      })!;

      // Test different animation frames
      const frames = [0, 30, 60, 90, 120];
      
      frames.forEach(frame => {
        require('remotion').useCurrentFrame.mockReturnValue(frame);
        
        const { container } = render(
          <DiffRevealAnimation diff={diff} startFrame={0} durationFrames={120} />
        );
        
        // Should render at any frame without errors
        expect(container.querySelector('[data-testid="absolute-fill"]')).toBeInTheDocument();
        
        // Progress should be reflected in some visual way
        const progressElements = container.querySelectorAll('[style*="width"]');
        expect(progressElements.length).toBeGreaterThan(0);
      });
    });
  });
});