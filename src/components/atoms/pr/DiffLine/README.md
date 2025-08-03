# DiffLine Component

A Remotion component for displaying individual lines of code diff with syntax highlighting and animations.

## Features

- Animated diff line display with typing effects
- Support for all diff types: added, removed, context, header
- Optional line number display
- Basic syntax highlighting
- Color-coded backgrounds and borders
- Typing animation with cursor effect
- Monospace font for proper code alignment

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | Required | The line content to display |
| `type` | `'added' \| 'removed' \| 'context' \| 'header'` | Required | Type of diff line |
| `lineNumber` | `number` | `undefined` | General line number (legacy) |
| `oldLineNumber` | `number` | `undefined` | Line number in old file |
| `newLineNumber` | `number` | `undefined` | Line number in new file |
| `animationDelay` | `number` | `0` | Delay before animation starts (in seconds) |
| `showLineNumbers` | `boolean` | `true` | Whether to show line numbers column |
| `highlightSyntax` | `boolean` | `false` | Whether to apply syntax highlighting |
| `language` | `string` | `'text'` | Programming language for syntax highlighting |

## Usage

```tsx
import { DiffLine } from './components/atoms/pr/DiffLine';

// Added line
<DiffLine 
  content="console.log('Hello World');" 
  type="added"
  newLineNumber={42}
/>

// Removed line
<DiffLine 
  content="console.log('Goodbye');" 
  type="removed"
  oldLineNumber={41}
/>

// Context line (unchanged)
<DiffLine 
  content="function greet() {" 
  type="context"
  oldLineNumber={40}
  newLineNumber={40}
/>

// Header line
<DiffLine 
  content="@@ -40,3 +40,4 @@ function greet() {" 
  type="header"
  showLineNumbers={false}
/>

// With syntax highlighting
<DiffLine 
  content="const message = 'Hello';" 
  type="added"
  highlightSyntax={true}
  language="javascript"
  newLineNumber={43}
/>

// Multiple lines with staggered animation
{diffLines.map((line, index) => (
  <DiffLine 
    key={index}
    content={line.content}
    type={line.type}
    oldLineNumber={line.oldLineNumber}
    newLineNumber={line.newLineNumber}
    animationDelay={index * 0.1}
    highlightSyntax={true}
  />
))}
```

## Diff Types

### Added Lines
- **Prefix**: `+` (green)
- **Background**: Light green tint
- **Border**: Green left border
- **Use case**: New code additions

### Removed Lines
- **Prefix**: `-` (red)
- **Background**: Light red tint
- **Border**: Red left border
- **Use case**: Deleted code

### Context Lines
- **Prefix**: ` ` (space)
- **Background**: Transparent
- **Border**: Gray left border
- **Use case**: Unchanged code for context

### Header Lines
- **Prefix**: `@` (blue)
- **Background**: Light gray
- **Border**: Gray left border
- **Use case**: Diff section headers (e.g., `@@ -1,4 +1,4 @@`)

## Syntax Highlighting

Basic syntax highlighting is available for common programming patterns:

- **Keywords**: `function`, `const`, `let`, `var`, `if`, `else`, `return` (blue)
- **Comments**: Lines starting with `//` (gray, italic)
- **Strings**: Content in quotes `"..."`, `'...'`, `` `...` `` (green)
- **Numbers**: Numeric literals (orange)

```tsx
// Enable syntax highlighting
<DiffLine 
  content="const greeting = 'Hello World';" 
  type="added"
  highlightSyntax={true}
  language="javascript"
/>
```

## Line Numbers

The component supports both old and new line numbers for proper diff display:

```tsx
// Both old and new line numbers (context line)
<DiffLine 
  content="unchanged line" 
  type="context"
  oldLineNumber={10}
  newLineNumber={10}
/>

// Only new line number (added line)
<DiffLine 
  content="new line" 
  type="added"
  newLineNumber={11}
/>

// Only old line number (removed line)  
<DiffLine 
  content="removed line" 
  type="removed"
  oldLineNumber={11}
/>
```

## Animation

The component features:
- Spring animation for entrance effects
- Typing animation that reveals content character by character
- Blinking cursor effect during typing
- Staggered delays for multiple lines
- Smooth color transitions for syntax highlighting