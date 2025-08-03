# LineByLineWalkthrough

An advanced Remotion component that provides detailed, line-by-line code review walkthroughs with smart annotations, focus modes, and educational explanations.

## Features

- **Intelligent Focus**: Automatically focuses on changed code blocks with context
- **Smart Annotations**: Support for explanations, warnings, improvements, and questions
- **Multiple Focus Modes**: Line-by-line, block-level, or contextual focusing
- **Interactive Minimap**: Visual overview of file with focus indicators
- **Sidebar Explanations**: Detailed explanations and annotations panel
- **Auto Walkthrough**: Automatically generates walkthrough steps from code changes
- **Syntax Highlighting**: Full syntax highlighting with focus enhancements
- **Progress Tracking**: Visual progress indicators and step navigation

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `diff` | `ProcessedDiff` | Required | The processed diff to walk through |
| `startFrame` | `number` | Required | Frame to start the walkthrough |
| `durationFrames` | `number` | Required | Total duration of the walkthrough |
| `annotations` | `LineAnnotation[]` | `[]` | Manual annotations for specific lines |
| `walkthrough` | `WalkthroughStep[]` | `[]` | Custom walkthrough steps (auto-generated if empty) |
| `focusMode` | `'line' \| 'block' \| 'context'` | `'context'` | How to focus on code sections |
| `explanationStyle` | `'popup' \| 'sidebar' \| 'overlay'` | `'sidebar'` | Where to show explanations |
| `autoAdvance` | `boolean` | `true` | Whether to automatically advance through steps |
| `showMinimap` | `boolean` | `true` | Whether to show the code minimap |

## Usage

### Basic Usage
```tsx
import { LineByLineWalkthrough } from './LineByLineWalkthrough';
import { processGitHubFile } from '../utils/diffProcessor';

const MyVideoComponent = () => {
  const processedDiff = processGitHubFile(githubFile);
  
  return (
    <LineByLineWalkthrough
      diff={processedDiff}
      startFrame={90}
      durationFrames={240}
      focusMode="context"
      showMinimap={true}
    />
  );
};
```

### With Custom Annotations
```tsx
const annotations: LineAnnotation[] = [
  {
    lineIndex: 5,
    type: 'explanation',
    content: 'This line introduces the new authentication mechanism',
    priority: 'high'
  },
  {
    lineIndex: 12,
    type: 'warning',
    content: 'Potential security concern - ensure input validation',
    priority: 'critical'
  },
  {
    lineIndex: 20,
    type: 'improvement',
    content: 'Consider using async/await for better readability',
    priority: 'medium'
  }
];

<LineByLineWalkthrough
  diff={processedDiff}
  annotations={annotations}
  startFrame={90}
  durationFrames={240}
/>
```

### With Custom Walkthrough Steps
```tsx
const walkthrough: WalkthroughStep[] = [
  {
    startLine: 0,
    endLine: 10,
    title: 'Import Changes',
    description: 'New imports for authentication library',
    focusType: 'highlight',
    duration: 60
  },
  {
    startLine: 15,
    endLine: 30,
    title: 'Core Logic Update',
    description: 'Updated the main authentication flow',
    focusType: 'zoom',
    duration: 120
  }
];

<LineByLineWalkthrough
  diff={processedDiff}
  walkthrough={walkthrough}
  startFrame={90}
  durationFrames={240}
/>
```

## Focus Modes

### Line Mode
Focuses on individual lines one at a time, dimming all other content.

### Block Mode
Focuses on logical blocks of changes, showing full context around modifications.

### Context Mode (Default)
Shows changed lines with surrounding context, balancing detail with overview.

## Annotation Types

| Type | Icon | Color | Usage |
|------|------|-------|-------|
| `explanation` | `i` | Blue | General explanations and information |
| `warning` | `!` | Orange | Potential issues or concerns |
| `improvement` | `↑` | Green | Suggestions for improvement |
| `question` | `?` | Purple | Questions for review or discussion |
| `praise` | `✓` | Green | Positive feedback or good practices |

## Explanation Styles

### Sidebar (Default)
Shows explanations in a dedicated sidebar panel on the right side.

### Popup
Shows explanations as popups near the relevant code lines.

### Overlay
Shows explanations as overlay panels that can be positioned anywhere.

## Auto-Generated Walkthrough

When no custom walkthrough is provided, the component automatically:
1. Analyzes code changes using `extractChangeContext`
2. Groups related changes into logical steps
3. Prioritizes steps based on change importance
4. Generates appropriate titles and descriptions
5. Sets optimal focus areas and durations

## Minimap Features

- **Visual Overview**: Shows entire file structure at a glance
- **Change Indicators**: Different colors for additions, deletions, and context
- **Focus Indicator**: Highlights current focus area
- **Progress Tracking**: Shows walkthrough progress
- **Interactive Elements**: Visual feedback for navigation

## Sidebar Components

### Step Information
- Current step title and description
- Line range being reviewed
- Step progress indicator

### Active Annotations
- Filters annotations to current focus area
- Shows annotation type and priority
- Displays full annotation content
- Links to specific line numbers

## Performance Optimizations

- **Efficient Rendering**: Only renders visible code lines
- **Smart Focusing**: Optimized focus calculations
- **Token Caching**: Caches syntax highlighting tokens
- **Animation Optimization**: Uses transform-based animations
- **Memory Management**: Efficient cleanup of animation states

## Integration

Works seamlessly with:
- `diffProcessor.ts` for intelligent change analysis
- `syntaxHighlighter.ts` for enhanced code highlighting
- `ChangeContext` system for automatic walkthrough generation
- Theme system for consistent visual styling
- Other PR video components for complete workflows

## Accessibility

- **High Contrast**: Focus indicators with sufficient contrast
- **Clear Typography**: Readable fonts and sizing
- **Visual Hierarchy**: Clear information hierarchy
- **Progress Indicators**: Multiple ways to track progress
- **Annotation System**: Clear annotation categorization