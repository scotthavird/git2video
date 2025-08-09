import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { z } from 'zod';
import { DiffRevealAnimation } from './components/molecules/pr/code/DiffRevealAnimation';
import { FileNavigationAnimation } from './components/molecules/pr/code/FileNavigationAnimation';
import { LineByLineWalkthrough } from './components/molecules/pr/code/LineByLineWalkthrough';
import { processGitHubFile } from './components/molecules/pr/code/utils/diffProcessor';
import { PRHeader } from './components/molecules/pr/PRHeader';
import { HelloWorldComposition } from './components/organisms/HelloWorldComposition';
import { PRDetailedVideo, PRSummaryVideo, PRTechnicalVideo } from './compositions/PRVideoCompositions';

// Leadership persona components
import { ExecutiveImpactSummary } from './components/organisms/ExecutiveImpactSummary';
import { ExecutiveImpactSummarySchema } from './components/organisms/ExecutiveImpactSummary/types';
import { RiskAndQualityMetrics } from './components/organisms/RiskAndQualityMetrics';
import { RiskAndQualityMetricsSchema } from './components/organisms/RiskAndQualityMetrics/types';
import { ROIVisualization } from './components/organisms/ROIVisualization';
import { ROIVisualizationSchema } from './components/organisms/ROIVisualization/types';
import { StrategicMilestones } from './components/organisms/StrategicMilestones';
import { StrategicMilestonesSchema } from './components/organisms/StrategicMilestones/types';
import { TeamVelocityDashboard } from './components/organisms/TeamVelocityDashboard';
import { TeamVelocityDashboardSchema } from './components/organisms/TeamVelocityDashboard/types';

// Define schema for visual editing
export const HelloWorldSchema = z.object({
  title: z.string().default('Hello World'),
  subtitle: z.string().default('Welcome to Remotion'),
  contentHeader: z.string().default('Discover More'),
  outroMessage: z.string().default('Thank You!'),
});

// PR Video Component Schemas
export const DiffRevealSchema = z.object({
  fileName: z.string().default('src/components/Button.tsx'),
  language: z.string().default('typescript'),
  showLineNumbers: z.boolean().default(true),
  highlightChanges: z.boolean().default(true),
  animationSpeed: z.enum(['slow', 'normal', 'fast']).default('normal'),
});

export const FileNavigationSchema = z.object({
  showFileTree: z.boolean().default(true),
  highlightChanges: z.boolean().default(true),
  animationStyle: z.enum(['slide', 'fade', 'scale', 'flip']).default('slide'),
  transitionDuration: z.number().default(30),
});

export const LineByLineSchema = z.object({
  focusMode: z.enum(['line', 'block', 'context']).default('context'),
  explanationStyle: z.enum(['popup', 'sidebar', 'overlay']).default('sidebar'),
  showMinimap: z.boolean().default(true),
  autoAdvance: z.boolean().default(true),
});

export const PROverviewSchema = z.object({
  prTitle: z.string().default('Implement user authentication system'),
  authorName: z.string().default('Jane Developer'),
  showMetrics: z.boolean().default(true),
  showTimeline: z.boolean().default(true),
});

// Demo component wrappers
const DiffRevealDemo: React.FC<z.infer<typeof DiffRevealSchema>> = (props) => {
  // Create sample diff data
  const sampleFile = {
    filename: props.fileName,
    status: 'modified' as const,
    additions: 12,
    deletions: 5,
    changes: 17,
    patch: `@@ -1,8 +1,10 @@
 import React from 'react';
+import { ${props.language}Props } from './types';
 
-const Component = () => {
+const Component: React.FC<${props.language}Props> = (props) => {
+  const { title, onClick } = props;
   return (
-    <div>Hello World</div>
+    <div onClick={onClick}>{title}</div>
   );
 };`
  };
  
  const diff = processGitHubFile(sampleFile)!;
  
  return (
    <DiffRevealAnimation
      diff={diff}
      startFrame={0}
      durationFrames={180}
      showLineNumbers={props.showLineNumbers}
      highlightChanges={props.highlightChanges}
      animationSpeed={props.animationSpeed}
    />
  );
};

const FileNavigationDemo: React.FC<z.infer<typeof FileNavigationSchema>> = (props) => {
  // Create sample file data
  const sampleFiles = [
    {
      filename: 'src/components/Header.tsx',
      status: 'modified' as const,
      additions: 8,
      deletions: 3,
      changes: 11,
      patch: 'Sample header changes'
    },
    {
      filename: 'src/utils/api.ts',
      status: 'added' as const,
      additions: 45,
      deletions: 0,
      changes: 45,
      patch: 'New API utility functions'
    },
    {
      filename: 'README.md',
      status: 'modified' as const,
      additions: 2,
      deletions: 1,
      changes: 3,
      patch: 'Update documentation'
    }
  ];
  
  const processedFiles = sampleFiles.map(file => processGitHubFile(file)!).filter(Boolean);
  
  return (
    <FileNavigationAnimation
      files={processedFiles}
      startFrame={0}
      durationFrames={240}
      showFileTree={props.showFileTree}
      highlightChanges={props.highlightChanges}
      animationStyle={props.animationStyle}
      transitionDuration={props.transitionDuration}
    />
  );
};

const LineByLineDemo: React.FC<z.infer<typeof LineByLineSchema>> = (props) => {
  // Create detailed sample diff
  const sampleFile = {
    filename: 'src/auth/AuthService.ts',
    status: 'modified' as const,
    additions: 15,
    deletions: 8,
    changes: 23,
    patch: `@@ -10,20 +10,25 @@ export class AuthService {
   constructor(private config: AuthConfig) {}
 
-  async login(username: string, password: string) {
+  async login(username: string, password: string): Promise<AuthResult> {
+    // Validate input parameters
+    if (!username || !password) {
+      throw new AuthError('Username and password are required');
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
     
+    await this.logLoginAttempt(user.id, true);
     return { success: true, user };
   }`
  };
  
  const diff = processGitHubFile(sampleFile)!;
  
  // Sample annotations
  const annotations = [
    {
      lineIndex: 3,
      type: 'improvement' as const,
      content: 'Added proper TypeScript return type for better type safety',
      priority: 'medium' as const
    },
    {
      lineIndex: 8,
      type: 'explanation' as const,
      content: 'Input validation prevents security vulnerabilities',
      priority: 'high' as const
    },
    {
      lineIndex: 15,
      type: 'improvement' as const,
      content: 'Improved error handling - no longer exposes internal details',
      priority: 'high' as const
    },
    {
      lineIndex: 22,
      type: 'praise' as const,
      content: 'Added audit logging for security compliance',
      priority: 'medium' as const
    }
  ];
  
  return (
    <LineByLineWalkthrough
      diff={diff}
      startFrame={0}
      durationFrames={300}
      annotations={annotations}
      focusMode={props.focusMode}
      explanationStyle={props.explanationStyle}
      showMinimap={props.showMinimap}
      autoAdvance={props.autoAdvance}
    />
  );
};

const PROverviewDemo: React.FC<z.infer<typeof PROverviewSchema>> = (props) => {
  // Create mock PR data that matches GitHubPullRequest interface
  const samplePR = {
    id: 123456,
    number: 42,
    title: props.prTitle,
    body: 'This PR implements a comprehensive user authentication system with secure password handling and session management.',
    state: 'open' as const,
    merged: false,
    draft: false,
    user: {
      id: 12345,
      login: 'jane-dev',
      avatar_url: 'https://github.com/jane-dev.avatar',
      html_url: 'https://github.com/jane-dev',
      type: 'User' as const,
      name: props.authorName,
      email: 'jane@example.com'
    },
    assignees: [],
    reviewers: [],
    labels: [
      { id: 1, name: 'enhancement', color: '84b6eb', description: 'New feature or request' },
      { id: 2, name: 'security', color: 'd73a4a', description: 'Security related changes' }
    ],
    milestone: undefined,
    base: {
      label: 'main',
      ref: 'main',
      sha: 'abc123',
      user: { id: 1, login: 'repo-owner', avatar_url: '', html_url: '', type: 'User' as const },
      repo: {
        id: 1,
        name: 'awesome-app',
        full_name: 'company/awesome-app',
        owner: { id: 1, login: 'company', avatar_url: '', html_url: '', type: 'User' as const },
        html_url: 'https://github.com/company/awesome-app',
        private: false,
        fork: false,
        default_branch: 'main'
      }
    },
    head: {
      label: 'feature/auth-system',
      ref: 'feature/auth-system',
      sha: 'def456',
      user: { id: 12345, login: 'jane-dev', avatar_url: '', html_url: '', type: 'User' as const },
      repo: {
        id: 1,
        name: 'awesome-app',
        full_name: 'company/awesome-app',
        owner: { id: 1, login: 'company', avatar_url: '', html_url: '', type: 'User' as const },
        html_url: 'https://github.com/company/awesome-app',
        private: false,
        fork: false,
        default_branch: 'main'
      }
    },
    html_url: 'https://github.com/company/awesome-app/pull/42',
    created_at: '2025-08-01T10:00:00Z',
    updated_at: '2025-08-03T15:30:00Z',
    closed_at: undefined,
    merged_at: undefined,
    merge_commit_sha: undefined,
    mergeable: true,
    mergeable_state: 'clean',
    merged_by: undefined,
    comments: 3,
    review_comments: 5,
    commits: 8,
    additions: 125,
    deletions: 42,
    changed_files: 12
  };

  const sampleRepository = {
    id: 1,
    name: 'awesome-app',
    full_name: 'company/awesome-app',
    owner: { id: 1, login: 'company', avatar_url: '', html_url: '', type: 'User' as const },
    html_url: 'https://github.com/company/awesome-app',
    description: 'An awesome application with great features',
    private: false,
    fork: false,
    language: 'TypeScript',
    default_branch: 'main'
  };
  
  return (
    <PRHeader
      pullRequest={samplePR}
      repository={sampleRepository}
      animationDelay={0}
      showLabels={props.showMetrics}
      showMilestone={props.showTimeline}
      compact={false}
    />
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Original Hello World Demo */}
      <Composition
        id="HelloWorld"
        component={HelloWorldComposition}
        durationInFrames={240} // 8 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        schema={HelloWorldSchema}
        defaultProps={{
          title: 'Hello World',
          subtitle: 'Welcome to Remotion',
          contentHeader: 'Discover More',
          outroMessage: 'Thank You!',
        }}
      />
      
      {/* PR Video Generation Components */}
      <Composition
        id="DiffRevealDemo"
        component={DiffRevealDemo}
        durationInFrames={180} // 6 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        schema={DiffRevealSchema}
        defaultProps={{
          fileName: 'src/components/Button.tsx',
          language: 'typescript',
          showLineNumbers: true,
          highlightChanges: true,
          animationSpeed: 'normal',
        }}
      />
      
      <Composition
        id="FileNavigationDemo"
        component={FileNavigationDemo}
        durationInFrames={240} // 8 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        schema={FileNavigationSchema}
        defaultProps={{
          showFileTree: true,
          highlightChanges: true,
          animationStyle: 'slide',
          transitionDuration: 30,
        }}
      />
      
      <Composition
        id="LineByLineDemo"
        component={LineByLineDemo}
        durationInFrames={300} // 10 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        schema={LineByLineSchema}
        defaultProps={{
          focusMode: 'context',
          explanationStyle: 'sidebar',
          showMinimap: true,
          autoAdvance: true,
        }}
      />
      
      <Composition
        id="PROverviewDemo"
        component={PROverviewDemo}
        durationInFrames={180} // 6 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        schema={PROverviewSchema}
        defaultProps={{
          prTitle: 'Implement user authentication system',
          authorName: 'Jane Developer',
          showMetrics: true,
          showTimeline: true,
        }}
      />
      
      {/* Production PR Video Compositions */}
      <Composition
        id="PRSummaryVideo"
        component={PRSummaryVideo}
        durationInFrames={420} // 14 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        schema={z.object({
          prData: z.any(),
          metadata: z.any(),
          script: z.any(),
          title: z.string().optional(),
          narrative: z
            .object({
              transcript: z.string(),
              model: z.string(),
              persona: z.string(),
            })
            .optional(),
        })}
        defaultProps={{
          prData: {
            pullRequest: {
              id: 123456,
              number: 42,
              title: 'Example PR',
              body: 'Example PR description',
              state: 'open',
              merged: false,
              draft: false,
              user: { id: 1, login: 'user', avatar_url: '', html_url: '', type: 'User' },
              assignees: [],
              reviewers: [],
              labels: [],
              base: { label: 'main', ref: 'main', sha: 'abc123', user: { id: 1, login: 'user', avatar_url: '', html_url: '', type: 'User' }, repo: { id: 1, name: 'repo', full_name: 'user/repo', owner: { id: 1, login: 'user', avatar_url: '', html_url: '', type: 'User' }, html_url: '', private: false, fork: false, default_branch: 'main' } },
              head: { label: 'feature', ref: 'feature', sha: 'def456', user: { id: 1, login: 'user', avatar_url: '', html_url: '', type: 'User' }, repo: { id: 1, name: 'repo', full_name: 'user/repo', owner: { id: 1, login: 'user', avatar_url: '', html_url: '', type: 'User' }, html_url: '', private: false, fork: false, default_branch: 'main' } },
              html_url: '',
              created_at: '2025-01-01T00:00:00Z',
              updated_at: '2025-01-01T00:00:00Z',
              comments: 0,
              review_comments: 0,
              commits: 1,
              additions: 10,
              deletions: 5,
              changed_files: 2
            },
            commits: [],
            files: [],
            reviews: [],
            reviewComments: [],
            issueComments: [],
            timeline: [],
            repository: { id: 1, name: 'repo', full_name: 'user/repo', owner: { id: 1, login: 'user', avatar_url: '', html_url: '', type: 'User' }, html_url: '', private: false, fork: false, default_branch: 'main' },
            participants: [],
            codeStats: { totalAdditions: 10, totalDeletions: 5, totalFiles: 2, languageBreakdown: {}, fileTypes: {} },
            reviewStats: { approvals: 0, changesRequested: 0, comments: 0 }
          },
          metadata: {
            title: 'Example PR Video',
            subtitle: 'Pull Request Overview',
            description: 'Video showing PR changes',
            duration: 60,
            scenes: [],
            participants: [],
            keyMetrics: {
              totalCommits: 1,
              totalFiles: 2,
              totalAdditions: 10,
              totalDeletions: 5,
              totalReviews: 0,
              totalComments: 0,
              timeToFirstReview: null,
              timeToMerge: null,
              participantCount: 1,
              primaryLanguage: 'TypeScript'
            },
            theme: {
              primaryColor: '#0066CC',
              secondaryColor: '#33CC33',
              backgroundColor: '#1A1A1A',
              textColor: '#FFFFFF',
              style: 'modern'
            }
          },
          script: {
            id: 'default-script',
            title: 'Default Script',
            description: 'Default script for preview',
            targetDuration: 60,
            sections: [],
            metadata: {
              templateType: 'summary',
              generatedAt: new Date(),
              version: '1.0.0',
              selectionStrategy: {
                name: 'default',
                criteria: { importanceThreshold: 0.5, relevanceScoring: { factors: [], algorithm: 'weighted_sum', normalization: 'min_max' }, freshnessWeight: 0.2, audienceAlignmentWeight: 0.5 },
                prioritization: [],
                filtering: [],
                adaptation: []
              },
              adaptations: {
                duration: { shortForm: { name: 'default', priorityAdjustments: {}, durationAdjustments: {}, contentModifications: [] }, mediumForm: { name: 'default', priorityAdjustments: {}, durationAdjustments: {}, contentModifications: [] }, longForm: { name: 'default', priorityAdjustments: {}, durationAdjustments: {}, contentModifications: [] }, cuttingPriorities: [] },
                audience: { languageSimplification: [], technicalDepth: [], emphasisAdjustments: [] },
                content: { transformations: [], summarization: [], expansion: [] },
                technical: { codeExamples: [], jargonExplanation: [], conceptIntroduction: [] }
              },
              quality: { coherence: 1, engagement: 1, accuracy: 1, durationCompliance: 1, audienceAlignment: 1, overall: 1, details: { strengths: [], weaknesses: [], suggestions: [], risks: [] } }
            },
            audience: { primary: 'engineering', technicalLevel: 'intermediate', projectFamiliarity: 'familiar', communicationStyle: 'technical' },
            style: { tone: 'professional', pacing: 'moderate', approach: 'analytical', complexity: 'moderate', emphasis: 'process_focused' }
          }
        }}
      />
      
      <Composition
        id="PRDetailedVideo"
        component={PRDetailedVideo}
        durationInFrames={1260} // 42 seconds at 30fps (will be dynamic)
        fps={30}
        width={1920}
        height={1080}
        schema={z.object({
          prData: z.any(),
          metadata: z.any(),
          script: z.any(),
          title: z.string().optional(),
        })}
        defaultProps={{
          prData: {
            pullRequest: {
              id: 123456,
              number: 42,
              title: 'Example PR',
              body: 'Example PR description',
              state: 'open',
              merged: false,
              draft: false,
              user: { id: 1, login: 'user', avatar_url: '', html_url: '', type: 'User' },
              assignees: [],
              reviewers: [],
              labels: [],
              base: { label: 'main', ref: 'main', sha: 'abc123', user: { id: 1, login: 'user', avatar_url: '', html_url: '', type: 'User' }, repo: { id: 1, name: 'repo', full_name: 'user/repo', owner: { id: 1, login: 'user', avatar_url: '', html_url: '', type: 'User' }, html_url: '', private: false, fork: false, default_branch: 'main' } },
              head: { label: 'feature', ref: 'feature', sha: 'def456', user: { id: 1, login: 'user', avatar_url: '', html_url: '', type: 'User' }, repo: { id: 1, name: 'repo', full_name: 'user/repo', owner: { id: 1, login: 'user', avatar_url: '', html_url: '', type: 'User' }, html_url: '', private: false, fork: false, default_branch: 'main' } },
              html_url: '',
              created_at: '2025-01-01T00:00:00Z',
              updated_at: '2025-01-01T00:00:00Z',
              comments: 0,
              review_comments: 0,
              commits: 1,
              additions: 10,
              deletions: 5,
              changed_files: 2
            },
            commits: [],
            files: [],
            reviews: [],
            reviewComments: [],
            issueComments: [],
            timeline: [],
            repository: { id: 1, name: 'repo', full_name: 'user/repo', owner: { id: 1, login: 'user', avatar_url: '', html_url: '', type: 'User' }, html_url: '', private: false, fork: false, default_branch: 'main' },
            participants: [],
            codeStats: { totalAdditions: 10, totalDeletions: 5, totalFiles: 2, languageBreakdown: {}, fileTypes: {} },
            reviewStats: { approvals: 0, changesRequested: 0, comments: 0 }
          },
          metadata: {
            title: 'Example PR Video',
            subtitle: 'Pull Request Overview',
            description: 'Video showing PR changes',
            duration: 60,
            scenes: [],
            participants: [],
            keyMetrics: {
              totalCommits: 1,
              totalFiles: 2,
              totalAdditions: 10,
              totalDeletions: 5,
              totalReviews: 0,
              totalComments: 0,
              timeToFirstReview: null,
              timeToMerge: null,
              participantCount: 1,
              primaryLanguage: 'TypeScript'
            },
            theme: {
              primaryColor: '#0066CC',
              secondaryColor: '#33CC33',
              backgroundColor: '#1A1A1A',
              textColor: '#FFFFFF',
              style: 'modern'
            }
          },
          script: {
            id: 'default-script',
            title: 'Default Script',
            description: 'Default script for preview',
            targetDuration: 60,
            sections: [],
            metadata: {
              templateType: 'summary',
              generatedAt: new Date(),
              version: '1.0.0',
              selectionStrategy: {
                name: 'default',
                criteria: { importanceThreshold: 0.5, relevanceScoring: { factors: [], algorithm: 'weighted_sum', normalization: 'min_max' }, freshnessWeight: 0.2, audienceAlignmentWeight: 0.5 },
                prioritization: [],
                filtering: [],
                adaptation: []
              },
              adaptations: {
                duration: { shortForm: { name: 'default', priorityAdjustments: {}, durationAdjustments: {}, contentModifications: [] }, mediumForm: { name: 'default', priorityAdjustments: {}, durationAdjustments: {}, contentModifications: [] }, longForm: { name: 'default', priorityAdjustments: {}, durationAdjustments: {}, contentModifications: [] }, cuttingPriorities: [] },
                audience: { languageSimplification: [], technicalDepth: [], emphasisAdjustments: [] },
                content: { transformations: [], summarization: [], expansion: [] },
                technical: { codeExamples: [], jargonExplanation: [], conceptIntroduction: [] }
              },
              quality: { coherence: 1, engagement: 1, accuracy: 1, durationCompliance: 1, audienceAlignment: 1, overall: 1, details: { strengths: [], weaknesses: [], suggestions: [], risks: [] } }
            },
            audience: { primary: 'engineering', technicalLevel: 'intermediate', projectFamiliarity: 'familiar', communicationStyle: 'technical' },
            style: { tone: 'professional', pacing: 'moderate', approach: 'analytical', complexity: 'moderate', emphasis: 'process_focused' }
          }
        }}
      />
      
      <Composition
        id="PRTechnicalVideo"
        component={PRTechnicalVideo}
        durationInFrames={1800} // 60 seconds at 30fps (will be dynamic)
        fps={30}
        width={1920}
        height={1080}
        schema={z.object({
          prData: z.any(),
          metadata: z.any(),
          script: z.any(),
          title: z.string().optional(),
        })}
        defaultProps={{
          prData: {
            pullRequest: {
              id: 123456,
              number: 42,
              title: 'Example PR',
              body: 'Example PR description',
              state: 'open',
              merged: false,
              draft: false,
              user: { id: 1, login: 'user', avatar_url: '', html_url: '', type: 'User' },
              assignees: [],
              reviewers: [],
              labels: [],
              base: { label: 'main', ref: 'main', sha: 'abc123', user: { id: 1, login: 'user', avatar_url: '', html_url: '', type: 'User' }, repo: { id: 1, name: 'repo', full_name: 'user/repo', owner: { id: 1, login: 'user', avatar_url: '', html_url: '', type: 'User' }, html_url: '', private: false, fork: false, default_branch: 'main' } },
              head: { label: 'feature', ref: 'feature', sha: 'def456', user: { id: 1, login: 'user', avatar_url: '', html_url: '', type: 'User' }, repo: { id: 1, name: 'repo', full_name: 'user/repo', owner: { id: 1, login: 'user', avatar_url: '', html_url: '', type: 'User' }, html_url: '', private: false, fork: false, default_branch: 'main' } },
              html_url: '',
              created_at: '2025-01-01T00:00:00Z',
              updated_at: '2025-01-01T00:00:00Z',
              comments: 0,
              review_comments: 0,
              commits: 1,
              additions: 10,
              deletions: 5,
              changed_files: 2
            },
            commits: [],
            files: [],
            reviews: [],
            reviewComments: [],
            issueComments: [],
            timeline: [],
            repository: { id: 1, name: 'repo', full_name: 'user/repo', owner: { id: 1, login: 'user', avatar_url: '', html_url: '', type: 'User' }, html_url: '', private: false, fork: false, default_branch: 'main' },
            participants: [],
            codeStats: { totalAdditions: 10, totalDeletions: 5, totalFiles: 2, languageBreakdown: {}, fileTypes: {} },
            reviewStats: { approvals: 0, changesRequested: 0, comments: 0 }
          },
          metadata: {
            title: 'Example PR Video',
            subtitle: 'Pull Request Overview',
            description: 'Video showing PR changes',
            duration: 60,
            scenes: [],
            participants: [],
            keyMetrics: {
              totalCommits: 1,
              totalFiles: 2,
              totalAdditions: 10,
              totalDeletions: 5,
              totalReviews: 0,
              totalComments: 0,
              timeToFirstReview: null,
              timeToMerge: null,
              participantCount: 1,
              primaryLanguage: 'TypeScript'
            },
            theme: {
              primaryColor: '#0066CC',
              secondaryColor: '#33CC33',
              backgroundColor: '#1A1A1A',
              textColor: '#FFFFFF',
              style: 'modern'
            }
          },
          script: {
            id: 'default-script',
            title: 'Default Script',
            description: 'Default script for preview',
            targetDuration: 60,
            sections: [],
            metadata: {
              templateType: 'summary',
              generatedAt: new Date(),
              version: '1.0.0',
              selectionStrategy: {
                name: 'default',
                criteria: { importanceThreshold: 0.5, relevanceScoring: { factors: [], algorithm: 'weighted_sum', normalization: 'min_max' }, freshnessWeight: 0.2, audienceAlignmentWeight: 0.5 },
                prioritization: [],
                filtering: [],
                adaptation: []
              },
              adaptations: {
                duration: { shortForm: { name: 'default', priorityAdjustments: {}, durationAdjustments: {}, contentModifications: [] }, mediumForm: { name: 'default', priorityAdjustments: {}, durationAdjustments: {}, contentModifications: [] }, longForm: { name: 'default', priorityAdjustments: {}, durationAdjustments: {}, contentModifications: [] }, cuttingPriorities: [] },
                audience: { languageSimplification: [], technicalDepth: [], emphasisAdjustments: [] },
                content: { transformations: [], summarization: [], expansion: [] },
                technical: { codeExamples: [], jargonExplanation: [], conceptIntroduction: [] }
              },
              quality: { coherence: 1, engagement: 1, accuracy: 1, durationCompliance: 1, audienceAlignment: 1, overall: 1, details: { strengths: [], weaknesses: [], suggestions: [], risks: [] } }
            },
            audience: { primary: 'engineering', technicalLevel: 'intermediate', projectFamiliarity: 'familiar', communicationStyle: 'technical' },
            style: { tone: 'professional', pacing: 'moderate', approach: 'analytical', complexity: 'moderate', emphasis: 'process_focused' }
          }
        }}
      />
      
      {/* Leadership Persona Components */}
      <Composition
        id="ExecutiveImpactSummary"
        component={ExecutiveImpactSummary}
        durationInFrames={300} // 10 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        schema={ExecutiveImpactSummarySchema}
        defaultProps={{
          data: {
            repositoryName: 'Enterprise Platform',
            repositoryDescription: 'Core business platform powering critical operations and customer experiences',
            healthMetrics: {
              stars: 2847,
              forks: 423,
              watchers: 156,
              contributors: 47,
              totalCommits: 8923,
              totalPullRequests: 1247,
              totalIssues: 892,
              openIssues: 23,
              closedIssues: 869,
              healthScore: 87,
            },
            activityTrends: {
              commitTrend: {
                thisWeek: 156,
                lastWeek: 142,
                trend: 'up',
                percentChange: 9.8,
              },
              prTrend: {
                thisWeek: 24,
                lastWeek: 19,
                trend: 'up',
                percentChange: 26.3,
              },
              issueTrend: {
                thisWeek: 18,
                lastWeek: 22,
                trend: 'down',
                percentChange: -18.2,
              },
            },
            teamMetrics: {
              totalMembers: 47,
              activeMembers: 42,
              newMembersThisMonth: 3,
              topContributors: [
                { name: 'Sarah Chen', avatar: '', contributions: 247, role: 'Lead Engineer' },
                { name: 'Marcus Johnson', avatar: '', contributions: 189, role: 'Senior Developer' },
                { name: 'Elena Rodriguez', avatar: '', contributions: 156, role: 'Full Stack' },
              ],
              teamGrowthRate: 12.5,
            },
            kpis: {
              codeQualityScore: 91,
              deliveryVelocity: 34,
              customerSatisfaction: 89,
              technicalDebtRatio: 18,
              uptime: 99.7,
              securityScore: 94,
            },
            timeframe: {
              startDate: '2024-01-01',
              endDate: '2024-12-31',
              period: 'Q3 2024',
            },
          },
          animationDelay: 0,
          showHealthScore: true,
          showTrends: true,
          showTeamMetrics: true,
          showKPIs: true,
          highlightMetric: null,
          theme: 'github',
        }}
      />

      <Composition
        id="TeamVelocityDashboard"
        component={TeamVelocityDashboard}
        durationInFrames={330} // 11 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        schema={TeamVelocityDashboardSchema}
        defaultProps={{
          data: {
            teamName: 'Platform Engineering Team',
            reportingPeriod: {
              startDate: '2024-07-01',
              endDate: '2024-09-30',
              periodLabel: 'Q3 2024 Performance Review',
            },
            commitMetrics: {
              dailyCommits: [
                { date: '2024-09-23', count: 23, weekday: 'Monday' },
                { date: '2024-09-24', count: 31, weekday: 'Tuesday' },
                { date: '2024-09-25', count: 28, weekday: 'Wednesday' },
                { date: '2024-09-26', count: 35, weekday: 'Thursday' },
                { date: '2024-09-27', count: 19, weekday: 'Friday' },
                { date: '2024-09-28', count: 8, weekday: 'Saturday' },
                { date: '2024-09-29', count: 4, weekday: 'Sunday' },
              ],
              averageCommitsPerDay: 24.8,
              totalCommitsThisWeek: 148,
              peakCommitHour: 14,
              commitFrequency: 'high',
              commitQualityScore: 87,
            },
            pullRequestMetrics: {
              averageReviewTime: 18.5,
              averageMergeTime: 32.2,
              mergeRate: 94,
              totalPRsThisWeek: 24,
              totalPRsMerged: 22,
              totalPRsRejected: 2,
              averagePRSize: {
                linesAdded: 247,
                linesDeleted: 89,
                filesChanged: 7,
              },
              reviewEfficiency: 91,
            },
            issueResolutionMetrics: {
              averageResolutionTime: 26.8,
              resolutionRate: 89,
              totalIssuesOpened: 34,
              totalIssuesClosed: 31,
              issueBacklog: 12,
              issuesByPriority: {
                critical: 1,
                high: 4,
                medium: 5,
                low: 2,
              },
              firstResponseTime: 4.2,
            },
            collaborationMetrics: {
              activeDevelopers: 42,
              codeReviewParticipation: 95,
              crossTeamContributions: 18,
              mentorshipActivities: 12,
              knowledgeSharingEvents: 8,
              pairProgrammingSessions: 23,
              collaborationScore: 92,
            },
            velocityTrends: {
              sprintVelocity: [
                { sprintNumber: 18, storyPointsCompleted: 78, sprintGoalAchieved: true, sprintDate: '2024-08-05' },
                { sprintNumber: 19, storyPointsCompleted: 82, sprintGoalAchieved: true, sprintDate: '2024-08-19' },
                { sprintNumber: 20, storyPointsCompleted: 71, sprintGoalAchieved: false, sprintDate: '2024-09-02' },
                { sprintNumber: 21, storyPointsCompleted: 89, sprintGoalAchieved: true, sprintDate: '2024-09-16' },
                { sprintNumber: 22, storyPointsCompleted: 85, sprintGoalAchieved: true, sprintDate: '2024-09-30' },
              ],
              burndownTrend: 'improving',
              productivityTrend: 'up',
              qualityTrend: 'improving',
            },
            overallVelocityScore: 88,
            recommendedActions: [
              {
                category: 'efficiency',
                priority: 'high',
                action: 'Implement automated code review checks',
                expectedImpact: 'Reduce review time by 25%',
              },
              {
                category: 'collaboration',
                priority: 'medium',
                action: 'Expand pair programming sessions',
                expectedImpact: 'Improve knowledge sharing and code quality',
              },
            ],
          },
          animationDelay: 0,
          showCommitMetrics: true,
          showPRMetrics: true,
          showIssueMetrics: true,
          showCollaboration: true,
          showTrends: true,
          highlightSection: null,
          theme: 'github',
          timeRange: '30d',
        }}
      />

      <Composition
        id="StrategicMilestones"
        component={StrategicMilestones}
        durationInFrames={360} // 12 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        schema={StrategicMilestonesSchema}
        defaultProps={{
          data: {
            projectName: 'Digital Transformation Initiative',
            projectDescription: 'Modernizing core business systems and processes to drive innovation and operational efficiency',
            timeline: {
              startDate: '2024-01-01',
              endDate: '2025-06-30',
              currentDate: '2024-08-15',
            },
            milestones: [
              {
                id: 'ms1',
                title: 'API Gateway v2.0 Release',
                description: 'Launch next-generation API gateway with enhanced security and performance features',
                dueDate: '2024-09-30',
                completedDate: '2024-09-15',
                status: 'completed',
                type: 'major_release',
                priority: 'critical',
                progress: 100,
                assignee: {
                  name: 'Alex Thompson',
                  avatar: '',
                  role: 'Platform Lead',
                },
                deliverables: [
                  { name: 'Security audit', status: 'completed', progress: 100 },
                  { name: 'Performance benchmarks', status: 'completed', progress: 100 },
                  { name: 'Documentation', status: 'completed', progress: 100 },
                ],
                dependencies: [],
                businessImpact: {
                  revenue: 250000,
                  userCount: 15000,
                  efficiency: 35,
                  riskMitigation: 85,
                },
                metrics: {
                  plannedEffort: 340,
                  actualEffort: 315,
                  plannedDuration: 90,
                  actualDuration: 82,
                  qualityScore: 94,
                },
              },
              {
                id: 'ms2',
                title: 'Mobile App Redesign',
                description: 'Complete redesign of customer-facing mobile application with modern UX/UI',
                dueDate: '2024-11-15',
                status: 'in_progress',
                type: 'feature_launch',
                priority: 'high',
                progress: 67,
                assignee: {
                  name: 'Maria Garcia',
                  avatar: '',
                  role: 'UX Lead',
                },
                deliverables: [
                  { name: 'User research', status: 'completed', progress: 100 },
                  { name: 'Design system', status: 'completed', progress: 100 },
                  { name: 'Frontend development', status: 'in_progress', progress: 78 },
                  { name: 'Testing & QA', status: 'pending', progress: 0 },
                ],
                dependencies: ['ms1'],
                businessImpact: {
                  revenue: 180000,
                  userCount: 45000,
                  efficiency: 25,
                  riskMitigation: 40,
                },
                metrics: {
                  plannedEffort: 280,
                  actualEffort: 195,
                  plannedDuration: 120,
                  actualDuration: 83,
                  qualityScore: 88,
                },
              },
              {
                id: 'ms3',
                title: 'Data Analytics Platform',
                description: 'Deploy comprehensive analytics platform for business intelligence and reporting',
                dueDate: '2025-02-28',
                status: 'planned',
                type: 'business_goal',
                priority: 'medium',
                progress: 15,
                assignee: {
                  name: 'David Kim',
                  avatar: '',
                  role: 'Data Lead',
                },
                deliverables: [
                  { name: 'Architecture design', status: 'completed', progress: 100 },
                  { name: 'Data pipeline', status: 'pending', progress: 0 },
                  { name: 'Dashboard development', status: 'pending', progress: 0 },
                  { name: 'User training', status: 'pending', progress: 0 },
                ],
                dependencies: ['ms1', 'ms2'],
                businessImpact: {
                  revenue: 320000,
                  userCount: 5000,
                  efficiency: 60,
                  riskMitigation: 70,
                },
                metrics: {
                  plannedEffort: 450,
                  actualEffort: 45,
                  plannedDuration: 180,
                  actualDuration: 25,
                  qualityScore: 0,
                },
              },
            ],
            phases: [
              {
                id: 'phase1',
                name: 'Foundation',
                startDate: '2024-01-01',
                endDate: '2024-09-30',
                status: 'completed',
                milestones: ['ms1'],
                budget: {
                  allocated: 850000,
                  spent: 782000,
                  currency: 'USD',
                },
                team: {
                  size: 12,
                  roles: [
                    { role: 'Engineers', count: 8 },
                    { role: 'Designers', count: 2 },
                    { role: 'QA', count: 2 },
                  ],
                },
              },
            ],
            events: [
              {
                id: 'evt1',
                date: '2024-09-15',
                type: 'milestone',
                title: 'API Gateway Launch',
                description: 'Successfully launched API Gateway v2.0 ahead of schedule',
                impact: 'positive',
                stakeholders: ['Engineering', 'Product', 'Business'],
                relatedMilestones: ['ms1'],
              },
            ],
            overallProgress: {
              percentage: 45,
              milestonesCompleted: 1,
              totalMilestones: 3,
              onTrackPercentage: 78,
              delayedPercentage: 22,
            },
            keyMetrics: {
              averageVelocity: 2.5,
              budgetUtilization: 72,
              qualityScore: 91,
              riskLevel: 'medium',
              predictedCompletion: '2025-05-15',
              confidenceLevel: 85,
            },
            upcomingDeadlines: [
              {
                milestoneId: 'ms2',
                daysUntilDue: 62,
                riskLevel: 'medium',
              },
            ],
          },
          animationDelay: 0,
          showTimeline: true,
          showProgress: true,
          showMetrics: true,
          showUpcoming: true,
          timeframeMonths: 12,
          highlightMilestone: null,
          theme: 'github',
          viewMode: 'executive',
        }}
      />

      <Composition
        id="RiskAndQualityMetrics"
        component={RiskAndQualityMetrics}
        durationInFrames={390} // 13 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        schema={RiskAndQualityMetricsSchema}
        defaultProps={{
          data: {
            projectName: 'Enterprise Platform',
            evaluationDate: '2024-08-15T00:00:00Z',
            overallRiskScore: 23,
            overallQualityScore: 87,
            codeReviewMetrics: {
              totalReviews: 247,
              approvalRate: 94,
              averageReviewTime: 18.5,
              reviewCoverageRate: 96,
              reviewParticipation: 89,
              reviewDepth: {
                thoroughReviews: 186,
                quickApprovals: 61,
                averageCommentsPerReview: 3.8,
              },
              reviewerWorkload: [
                { reviewerName: 'Sarah Chen', reviewCount: 45, averageTimePerReview: 22.3, approvalRate: 91 },
                { reviewerName: 'Marcus Johnson', reviewCount: 38, averageTimePerReview: 15.7, approvalRate: 96 },
              ],
            },
            issueCategorizationMetrics: {
              totalIssues: 234,
              categories: {
                bugs: {
                  count: 67,
                  percentage: 29,
                  severity: {
                    critical: 2,
                    high: 8,
                    medium: 31,
                    low: 26,
                  },
                  averageResolutionTime: 32.4,
                },
                features: {
                  count: 89,
                  percentage: 38,
                  complexity: {
                    complex: 15,
                    medium: 47,
                    simple: 27,
                  },
                  averageImplementationTime: 120.5,
                },
                technicalDebt: {
                  count: 45,
                  percentage: 19,
                  impact: {
                    high: 8,
                    medium: 23,
                    low: 14,
                  },
                  estimatedEffortHours: 340,
                },
                documentation: {
                  count: 21,
                  percentage: 9,
                  averageCompletionTime: 8.2,
                },
                maintenance: {
                  count: 12,
                  percentage: 5,
                  averageCompletionTime: 16.7,
                },
              },
              trendAnalysis: {
                bugTrend: 'decreasing',
                technicalDebtTrend: 'stable',
                featureVelocityTrend: 'increasing',
              },
            },
            securityMetrics: {
              vulnerabilities: {
                total: 7,
                critical: 0,
                high: 1,
                medium: 3,
                low: 3,
              },
              securityScans: {
                frequency: 'daily',
                lastScanDate: '2024-08-14',
                passRate: 94,
                averageFixTime: 12.3,
              },
              dependencyHealth: {
                totalDependencies: 156,
                outdatedDependencies: 23,
                vulnerableDependencies: 3,
                licenseIssues: 0,
              },
              complianceScore: 91,
              securityPractices: {
                twoFactorAuthEnabled: true,
                codeSigningEnabled: true,
                secretsManagementEnabled: true,
                automaticSecurityUpdates: true,
              },
            },
            technicalDebtIndicators: {
              overallDebtScore: 22,
              codeComplexity: {
                averageCyclomaticComplexity: 4.2,
                highComplexityFiles: 12,
                maintainabilityIndex: 78,
              },
              codeSmells: {
                duplicatedCode: 1240,
                longMethods: 18,
                largeClasses: 7,
                deadCode: 340,
              },
              testCoverage: {
                overallCoverage: 84,
                unitTestCoverage: 89,
                integrationTestCoverage: 76,
                missingTestFiles: 8,
              },
              documentation: {
                codeDocumentationCoverage: 72,
                outdatedDocumentation: 15,
                missingReadmes: 3,
              },
              refactoringNeeds: [
                {
                  component: 'UserService',
                  priority: 'high',
                  estimatedEffort: 32,
                  impactArea: 'maintainability',
                  description: 'Refactor user authentication logic for better separation of concerns',
                },
                {
                  component: 'DatabaseManager',
                  priority: 'medium',
                  estimatedEffort: 18,
                  impactArea: 'performance',
                  description: 'Optimize query performance and connection pooling',
                },
              ],
            },
            qualityTrends: {
              timeframe: 'Last 3 months',
              codeQualityTrend: 'improving',
              bugIntroductionRate: [
                { date: '2024-06-01', bugsIntroduced: 12, linesOfCodeChanged: 2340 },
                { date: '2024-07-01', bugsIntroduced: 8, linesOfCodeChanged: 1890 },
                { date: '2024-08-01', bugsIntroduced: 6, linesOfCodeChanged: 2100 },
              ],
              defectDensity: [
                { date: '2024-06-01', defectsPerKLOC: 2.8 },
                { date: '2024-07-01', defectsPerKLOC: 2.1 },
                { date: '2024-08-01', defectsPerKLOC: 1.9 },
              ],
              reviewEffectiveness: [
                { date: '2024-06-01', bugsFoundInReview: 18, bugsFoundInProduction: 8 },
                { date: '2024-07-01', bugsFoundInReview: 22, bugsFoundInProduction: 5 },
                { date: '2024-08-01', bugsFoundInReview: 19, bugsFoundInProduction: 3 },
              ],
            },
            recommendations: [
              {
                category: 'process',
                priority: 'immediate',
                title: 'Implement automated security scanning',
                description: 'Set up continuous security scanning in CI/CD pipeline',
                expectedImpact: 'Reduce security vulnerabilities by 60%',
                estimatedEffort: '2 weeks',
              },
              {
                category: 'tooling',
                priority: 'high',
                title: 'Upgrade testing framework',
                description: 'Migrate to modern testing framework with better coverage reporting',
                expectedImpact: 'Improve test reliability and developer productivity',
                estimatedEffort: '3 weeks',
              },
            ],
          },
          animationDelay: 0,
          showCodeReview: true,
          showIssueCategories: true,
          showSecurity: true,
          showTechnicalDebt: true,
          showTrends: true,
          highlightSection: null,
          theme: 'github',
          viewMode: 'executive',
        }}
      />

      <Composition
        id="ROIVisualization"
        component={ROIVisualization}
        durationInFrames={420} // 14 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        schema={ROIVisualizationSchema}
        defaultProps={{
          data: {
            projectName: 'Digital Platform Investment',
            evaluationPeriod: {
              startDate: '2024-01-01',
              endDate: '2024-12-31',
              periodLabel: 'FY 2024 Annual Review',
            },
            developmentVelocity: {
              sprintVelocity: [
                { sprintNumber: 18, sprintDate: '2024-05-01', storyPointsCompleted: 78, storyPointsPlanned: 80, teamSize: 12, velocityPerDeveloper: 6.5 },
                { sprintNumber: 19, sprintDate: '2024-05-15', storyPointsCompleted: 82, storyPointsPlanned: 85, teamSize: 12, velocityPerDeveloper: 6.8 },
                { sprintNumber: 20, sprintDate: '2024-06-01', storyPointsCompleted: 75, storyPointsPlanned: 80, teamSize: 11, velocityPerDeveloper: 6.8 },
                { sprintNumber: 21, sprintDate: '2024-06-15', storyPointsCompleted: 89, storyPointsPlanned: 85, teamSize: 13, velocityPerDeveloper: 6.8 },
                { sprintNumber: 22, sprintDate: '2024-07-01', storyPointsCompleted: 85, storyPointsPlanned: 90, teamSize: 13, velocityPerDeveloper: 6.5 },
                { sprintNumber: 23, sprintDate: '2024-07-15', storyPointsCompleted: 92, storyPointsPlanned: 90, teamSize: 14, velocityPerDeveloper: 6.6 },
              ],
              burndownEfficiency: 91,
              predictabilityScore: 87,
              averageVelocity: 83.5,
              velocityTrend: 'increasing',
              cycleTime: {
                averageDays: 8.2,
                improvementRate: 15.3,
              },
            },
            resourceAllocation: {
              totalDevelopers: 47,
              totalHoursAllocated: 9600,
              hoursSpentDevelopment: 6720,
              hoursSpentMaintenance: 1440,
              hoursSpentMeetings: 960,
              hoursSpentBugFixes: 480,
              utilizationRate: 87,
              costPerHour: 125,
              totalProjectCost: 1200000,
              budgetUtilization: 78,
              roleDistribution: [
                { role: 'senior', count: 12, averageCost: 150, utilization: 92 },
                { role: 'mid', count: 18, averageCost: 125, utilization: 88 },
                { role: 'junior', count: 10, averageCost: 85, utilization: 85 },
                { role: 'lead', count: 5, averageCost: 175, utilization: 89 },
                { role: 'architect', count: 2, averageCost: 200, utilization: 82 },
              ],
            },
            featureDeliveryImpact: {
              featuresDelivered: 34,
              featuresPlanned: 38,
              deliveryRate: 89,
              businessValue: [
                {
                  featureName: 'Advanced Search',
                  deliveryDate: '2024-06-15',
                  businessImpact: 'high',
                  userAdoption: 78,
                  revenueImpact: 125000,
                  costToDeliver: 45000,
                  roi: 177.8,
                  timeToValue: 14,
                },
                {
                  featureName: 'Mobile Dashboard',
                  deliveryDate: '2024-07-30',
                  businessImpact: 'medium',
                  userAdoption: 65,
                  revenueImpact: 89000,
                  costToDeliver: 32000,
                  roi: 178.1,
                  timeToValue: 21,
                },
                {
                  featureName: 'API v2.0',
                  deliveryDate: '2024-08-10',
                  businessImpact: 'high',
                  userAdoption: 92,
                  revenueImpact: 240000,
                  costToDeliver: 78000,
                  roi: 207.7,
                  timeToValue: 7,
                },
              ],
              averageTimeToMarket: 45,
              qualityMetrics: {
                bugReports: 23,
                customerSatisfaction: 89,
                performanceImpact: 18.5,
              },
            },
            communityEngagement: {
              repositoryMetrics: {
                stars: 2847,
                starGrowthRate: 23.4,
                forks: 423,
                forkGrowthRate: 18.9,
                watchers: 156,
                watcherGrowthRate: 15.2,
                downloads: 45670,
                downloadGrowthRate: 34.7,
              },
              contributorMetrics: {
                totalContributors: 89,
                activeContributors: 47,
                newContributors: 12,
                retentionRate: 84,
                diversityIndex: 67,
              },
              communityHealth: {
                issueResponseTime: 4.2,
                prReviewTime: 18.5,
                communityScore: 88,
                documentationQuality: 82,
                onboardingEffectiveness: 79,
              },
              adoption: {
                enterpriseAdoption: 23,
                individualAdoption: 1247,
                geographicalSpread: [
                  { region: 'North America', userCount: 567, growthRate: 28.3 },
                  { region: 'Europe', userCount: 423, growthRate: 34.1 },
                  { region: 'Asia Pacific', userCount: 280, growthRate: 45.7 },
                ],
              },
            },
            costBenefitAnalysis: {
              development: {
                totalCost: 1200000,
                costPerFeature: 35294,
                costPerStoryPoint: 14371,
                maintenanceCostRatio: 15,
              },
              revenue: {
                directRevenue: 1890000,
                costSavings: 340000,
                efficiencyGains: 450000,
                riskMitigation: 125000,
              },
              roi: {
                overallROI: 137.5,
                paybackPeriod: 8.7,
                netPresentValue: 1650000,
                internalRateOfReturn: 45.3,
              },
              projections: [
                { quarter: 'Q1', projectedCost: 300000, projectedRevenue: 420000, projectedROI: 40, confidence: 92 },
                { quarter: 'Q2', projectedCost: 320000, projectedRevenue: 580000, projectedROI: 81, confidence: 87 },
                { quarter: 'Q3', projectedCost: 340000, projectedRevenue: 720000, projectedROI: 112, confidence: 89 },
                { quarter: 'Q4', projectedCost: 240000, projectedRevenue: 1085000, projectedROI: 352, confidence: 78 },
              ],
            },
            productivityMetrics: {
              codeMetrics: {
                linesOfCodePerDeveloper: 2340,
                functionalityPerLOC: 0.87,
                codeReuseRate: 78,
                technicalDebtRatio: 18,
              },
              processMetrics: {
                deploymentFrequency: 45,
                leadTimeForChanges: 6.2,
                meanTimeToRecovery: 2.1,
                changeFailureRate: 4.3,
              },
              qualityMetrics: {
                defectRate: 1.8,
                testCoverage: 84,
                automationRate: 89,
                customerSatisfactionScore: 89,
              },
            },
            overallROI: 137.5,
            riskFactors: [
              {
                category: 'technical',
                risk: 'Legacy system integration challenges',
                probability: 35,
                impact: 'medium',
                mitigation: 'Incremental migration with parallel systems',
              },
              {
                category: 'market',
                risk: 'Competitive landscape changes',
                probability: 60,
                impact: 'high',
                mitigation: 'Agile development with rapid iteration cycles',
              },
            ],
            recommendations: [
              {
                category: 'investment',
                priority: 'immediate',
                title: 'Expand automation infrastructure',
                description: 'Invest in CI/CD and testing automation to reduce manual overhead',
                expectedROIImprovement: 23.5,
                implementationCost: 85000,
                timeframe: '6 months',
              },
              {
                category: 'optimization',
                priority: 'high',
                title: 'Optimize development workflows',
                description: 'Streamline code review and deployment processes',
                expectedROIImprovement: 15.7,
                implementationCost: 25000,
                timeframe: '3 months',
              },
            ],
          },
          animationDelay: 0,
          showVelocityMetrics: true,
          showResourceAllocation: true,
          showFeatureImpact: true,
          showCommunityMetrics: true,
          showCostBenefit: true,
          highlightSection: null,
          theme: 'github',
          viewMode: 'executive',
          timeframe: 'year',
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot); 