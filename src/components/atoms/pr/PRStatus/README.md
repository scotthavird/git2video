# PRStatus Component

A Remotion component for displaying the status of a Pull Request with smooth animations.

## Features

- Animated status badge with spring transitions
- Support for all PR states: open, closed, merged, draft
- Multiple size variants: small, medium, large
- Customizable animation delay
- Color-coded status indicators with icons

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `'open' \| 'closed' \| 'merged' \| 'draft'` | Required | The PR status to display |
| `merged` | `boolean` | `false` | Whether the PR is merged (overrides closed status) |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Size variant of the status badge |
| `animationDelay` | `number` | `0` | Delay before animation starts (in seconds) |

## Usage

```tsx
import { PRStatus } from './components/atoms/pr/PRStatus';

// Basic usage
<PRStatus status="open" />

// Merged PR
<PRStatus status="closed" merged={true} />

// Large size with delay
<PRStatus status="merged" size="large" animationDelay={0.5} />
```

## Status Variants

- **Open**: Green background with circle icon
- **Closed**: Red background with circle icon  
- **Merged**: Blue background with lightning icon
- **Draft**: Gray background with circle icon

## Animation

The component uses Remotion's spring animation for smooth scale transitions and interpolated opacity for fade-in effects.