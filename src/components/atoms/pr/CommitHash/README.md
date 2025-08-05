# CommitHash Component

A Remotion component for displaying commit hashes with interactive copy functionality and various styling options.

## Features

- Animated commit hash display with spring transitions
- Support for both short (7 chars) and full hash display
- Copy functionality with visual feedback
- Multiple style variants: default, minimal, badge
- Monospace font for proper hash readability
- Interactive hover effects

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `hash` | `string` | Required | The full commit hash |
| `short` | `boolean` | `true` | Whether to show short (7 chars) or full hash |
| `copyable` | `boolean` | `false` | Whether to show copy functionality |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Size variant of the hash display |
| `style` | `'default' \| 'minimal' \| 'badge'` | `'default'` | Visual style variant |
| `animationDelay` | `number` | `0` | Delay before animation starts (in seconds) |
| `showCopyFeedback` | `boolean` | `false` | Whether to show "Copied!" tooltip feedback |

## Usage

```tsx
import { CommitHash } from './components/atoms/pr/CommitHash';

// Basic usage (short hash)
<CommitHash hash="a1b2c3d4e5f6789012345678901234567890abcd" />

// Full hash with copy functionality
<CommitHash 
  hash="a1b2c3d4e5f6789012345678901234567890abcd"
  short={false}
  copyable={true}
  showCopyFeedback={true}
/>

// Badge style variant
<CommitHash 
  hash="a1b2c3d4e5f6789012345678901234567890abcd"
  style="badge"
  size="large"
/>
```

## Style Variants

- **Default**: Light gray background with border
- **Minimal**: Transparent background, text only
- **Badge**: Colored background with rounded corners

## Features

- **Monospace Font**: Uses system monospace fonts for proper alignment
- **Copy Feedback**: Animated tooltip showing copy confirmation
- **Responsive Sizing**: Scales appropriately at different sizes
- **Hover Effects**: Interactive feedback for copyable hashes

## Animation

The component uses:
- Spring animation for entrance effects
- Interpolated opacity for smooth fade-in
- Copy feedback tooltip with timing animation
- Scale transitions for interactive feedback