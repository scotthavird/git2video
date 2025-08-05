# FileNavigationAnimation

A comprehensive Remotion component that animates navigation through multiple files in a pull request, featuring a file tree sidebar and smooth transitions between files.

## Features

- **File Tree Sidebar**: Hierarchical display of changed files with status indicators
- **Multiple Animation Styles**: Support for slide, fade, scale, and flip transitions
- **File Previews**: Live preview of file changes with syntax highlighting
- **Status Indicators**: Visual indicators for file status (added, modified, deleted, renamed)
- **Progress Tracking**: Progress indicators and current file highlighting
- **Language Detection**: Automatic language detection with appropriate icons
- **Change Statistics**: Display of additions/deletions for each file

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `files` | `ProcessedDiff[]` | Required | Array of processed diff files to navigate |
| `startFrame` | `number` | Required | Frame to start the animation |
| `durationFrames` | `number` | Required | Total duration of the animation |
| `transitionDuration` | `number` | `30` | Duration of transitions between files (frames) |
| `showFileTree` | `boolean` | `true` | Whether to show the file tree sidebar |
| `highlightChanges` | `boolean` | `true` | Whether to highlight changed lines |
| `animationStyle` | `'slide' \| 'fade' \| 'scale' \| 'flip'` | `'slide'` | Animation style for file transitions |

## Usage

```tsx
import { FileNavigationAnimation } from './FileNavigationAnimation';
import { processGitHubFile } from '../utils/diffProcessor';

const MyVideoComponent = () => {
  const processedFiles = githubFiles.map(processGitHubFile);
  
  return (
    <FileNavigationAnimation
      files={processedFiles}
      startFrame={60}
      durationFrames={300}
      transitionDuration={20}
      showFileTree={true}
      highlightChanges={true}
      animationStyle="slide"
    />
  );
};
```

## Animation Styles

### Slide
Files slide in from the right with smooth easing transitions.

### Fade
Files fade in and out with opacity transitions.

### Scale
Files scale up when appearing and scale down when disappearing.

### Flip
Files flip in 3D space with perspective transforms.

## File Tree Features

- **Hierarchical Structure**: Displays files in their directory structure
- **Status Icons**: Visual indicators for file status (➕ added, 📝 modified, ➖ deleted, 🔄 renamed)
- **File Type Icons**: Language-specific icons for different file types
- **Change Statistics**: Shows additions/deletions count for each file
- **Active Highlighting**: Current file is highlighted with border and background
- **Progress Indication**: Processed files are dimmed to show progress

## File Preview Features

- **Syntax Highlighting**: Language-aware syntax highlighting for code files
- **Diff Markers**: Visual indicators for added/removed lines
- **Line Numbers**: Optional line number display
- **Change Highlighting**: Background colors for added/removed lines
- **Scroll Indication**: Shows when there are more lines beyond the preview

## Layout

- **Sidebar**: File tree (300px width when enabled)
- **Main Area**: File preview (remaining width)
- **Header**: Title and file count
- **Footer**: Progress indicators and navigation

## Supported File Types

Automatically detects and displays appropriate icons for:
- TypeScript/JavaScript (🟦/🟨)
- Python (🐍)
- Java (☕)
- Go (🐹)
- Rust (🦀)
- HTML (🌐)
- CSS/SCSS (🎨)
- JSON (📋)
- Markdown (📝)
- Images (🖼️)
- And many more...

## Performance

- Optimized for smooth 30fps playback
- Efficient DOM updates with transform-based animations
- Memory-efficient file tree building
- Lazy rendering of file previews

## Integration

Works seamlessly with:
- `diffProcessor.ts` for processing Git diffs
- `syntaxHighlighter.ts` for code highlighting
- Theme color system for consistent styling
- Other PR video components for complete workflows