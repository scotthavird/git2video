import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { z } from 'zod';
import { HelloWorldComposition } from './components/organisms/HelloWorldComposition';
import { DiffRevealAnimation } from './components/molecules/pr/code/DiffRevealAnimation';
import { FileNavigationAnimation } from './components/molecules/pr/code/FileNavigationAnimation';
import { LineByLineWalkthrough } from './components/molecules/pr/code/LineByLineWalkthrough';
import { PRHeader } from './components/molecules/pr/PRHeader';
import { CommitCard } from './components/molecules/pr/CommitCard';
import { processGitHubFile } from './components/molecules/pr/code/utils/diffProcessor';
import { TestDataBuilder } from './video/integration/testUtils';

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
  const samplePR = TestDataBuilder.createMockVideoMetadata({
    title: props.prTitle,
    author: {
      login: 'jane-dev',
      avatarUrl: 'https://github.com/jane-dev.avatar',
      name: props.authorName,
      email: 'jane@example.com'
    }
  });
  
  return (
    <PRHeader
      pr={samplePR}
      showAvatar={true}
      showStatus={props.showMetrics}
      showMetrics={props.showMetrics}
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
    </>
  );
};

registerRoot(RemotionRoot); 