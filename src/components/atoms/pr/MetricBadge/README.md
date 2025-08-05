# MetricBadge Component

A Remotion component for displaying numerical metrics with animations, icons, and various styling options.

## Features

- Animated count-up transitions for numeric values
- Support for icons and multiple color types
- Three layout modes: horizontal, vertical, compact
- Custom value formatting
- Color-coded types: default, success, warning, error, info
- Spring animations with customizable delays

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | Required | The numeric value to display |
| `label` | `string` | Required | The label describing the metric |
| `icon` | `string` | `undefined` | Optional icon (emoji or symbol) |
| `type` | `'default' \| 'success' \| 'warning' \| 'error' \| 'info'` | `'default'` | Visual style type |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Size variant |
| `animationDelay` | `number` | `0` | Delay before animation starts (in seconds) |
| `countAnimation` | `boolean` | `true` | Whether to animate the count from 0 to value |
| `formatValue` | `(value: number) => string` | `toLocaleString()` | Custom value formatting function |
| `layout` | `'horizontal' \| 'vertical' \| 'compact'` | `'horizontal'` | Layout arrangement |

## Usage

```tsx
import { MetricBadge } from './components/atoms/pr/MetricBadge';

// Basic usage
<MetricBadge value={42} label="commits" />

// With icon and type
<MetricBadge 
  value={15} 
  label="files changed" 
  icon="📁"
  type="info"
/>

// Success metric with custom formatting
<MetricBadge 
  value={95} 
  label="coverage"
  type="success"
  formatValue={(val) => `${val}%`}
/>

// Vertical layout for card displays
<MetricBadge 
  value={1247} 
  label="lines added"
  layout="vertical"
  size="large"
  icon="+"
/>

// Multiple metrics with staggered animation
{metrics.map((metric, index) => (
  <MetricBadge 
    key={metric.label}
    value={metric.value}
    label={metric.label}
    animationDelay={index * 0.2}
    type={metric.type}
  />
))}
```

## Type Styles

- **Default**: Light gray background with dark text
- **Success**: Green background with white text
- **Warning**: Orange background with dark text
- **Error**: Red background with white text
- **Info**: Blue background with white text

## Layout Modes

### Horizontal (Default)
Value and label stacked vertically, icon on the left:
```
[📁] 42
     commits
```

### Vertical
All elements stacked vertically, centered:
```
📁
42
commits
```

### Compact
Value and label inline, minimal spacing:
```
[📁] 42 commits
```

## Custom Formatting

Provide a `formatValue` function for custom number formatting:

```tsx
// Percentage
formatValue={(val) => `${val}%`}

// File size
formatValue={(val) => `${(val / 1024).toFixed(1)}KB`}

// Duration
formatValue={(val) => `${Math.floor(val / 60)}m ${val % 60}s`}

// Large numbers
formatValue={(val) => val > 1000 ? `${(val/1000).toFixed(1)}k` : val.toString()}
```

## Animation

The component features:
- Spring animation for entrance effects
- Count-up animation from 0 to final value over 40 frames
- Interpolated opacity for smooth fade-in
- Customizable animation delays for staggered effects