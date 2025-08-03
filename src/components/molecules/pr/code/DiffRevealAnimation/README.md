# DiffRevealAnimation

A sophisticated Remotion component that animates the reveal of code diffs with smooth transitions, syntax highlighting, and focus effects.

## Features

- **Smooth Line Reveal**: Lines appear with spring animations and smooth transitions
- **Syntax Highlighting**: Full syntax highlighting support for multiple programming languages
- **Focus Highlighting**: Dynamic highlighting of current lines being revealed
- **Multiple Styles**: Support for unified, side-by-side, and split diff views
- **Configurable Speed**: Adjustable animation speed (slow, normal, fast)
- **Line Numbers**: Optional line number display
- **Change Indicators**: Visual indicators for additions, deletions, and context

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `diff` | `ProcessedDiff` | Required | The processed diff data to animate |
| `startFrame` | `number` | Required | Frame to start the animation |
| `durationFrames` | `number` | Required | Duration of the animation in frames |
| `style` | `'side-by-side' \| 'unified' \| 'split'` | `'unified'` | Diff display style |
| `showLineNumbers` | `boolean` | `true` | Whether to show line numbers |
| `highlightChanges` | `boolean` | `true` | Whether to highlight changed lines |
| `animationSpeed` | `'slow' \| 'normal' \| 'fast'` | `'normal'` | Animation speed |

## Usage

```tsx
import { DiffRevealAnimation } from './DiffRevealAnimation';
import { processGitHubFile } from '../utils/diffProcessor';

const MyVideoComponent = () => {
  const processedDiff = processGitHubFile(githubFile);
  
  return (
    <DiffRevealAnimation
      diff={processedDiff}
      startFrame={30}
      durationFrames={180}
      style="unified"
      showLineNumbers={true}
      highlightChanges={true}
      animationSpeed="normal"
    />
  );
};
```

## Animation Phases

1. **Header Fade-in** (0-10% of duration): File name and stats appear
2. **Progress Bar** (0-100%): Shows animation progress
3. **Line Reveal** (10-90%): Lines appear with spring animation
4. **Focus Highlighting** (Throughout): Current line pulses
5. **Summary** (90-100%): Final change summary appears

## Styling

The component uses the theme color system and supports:
- Syntax highlighting colors based on language
- Diff-specific colors (green for additions, red for deletions)
- Focus highlighting with pulsing effect
- Responsive layout with proper spacing

## Performance

- Optimized for smooth 30fps playback
- Efficient token-based syntax highlighting
- Spring animations with configurable damping
- Memory-efficient line rendering

## Language Support

Supports syntax highlighting for:
- TypeScript/JavaScript
- Python
- Java
- Go
- Rust
- HTML/CSS
- JSON
- And many more...

## Integration

Works seamlessly with:
- `diffProcessor.ts` for parsing Git diffs
- `syntaxHighlighter.ts` for code tokenization
- Theme color system for consistent styling
- Other PR video components