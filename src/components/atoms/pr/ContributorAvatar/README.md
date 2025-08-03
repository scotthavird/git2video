# ContributorAvatar Component

A Remotion component for displaying contributor avatars with role indicators and interactive effects.

## Features

- Animated avatar with spring transitions
- Support for GitHub user avatars with fallback to initials
- Role-based border colors and badges
- Bot user indicator
- Tooltip with user information
- Multiple size variants
- Hover effects for enhanced interactivity

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `user` | `GitHubUser` | Required | GitHub user object with avatar and profile data |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Size variant of the avatar |
| `showTooltip` | `boolean` | `false` | Whether to show tooltip with user name |
| `showRole` | `boolean` | `false` | Whether to show role badge below avatar |
| `role` | `'author' \| 'reviewer' \| 'committer' \| 'commenter'` | `undefined` | User's role in the PR |
| `animationDelay` | `number` | `0` | Delay before animation starts (in seconds) |
| `hoverEffect` | `boolean` | `true` | Whether to show hover scale effect |

## Usage

```tsx
import { ContributorAvatar } from './components/atoms/pr/ContributorAvatar';

// Basic usage
<ContributorAvatar user={githubUser} />

// With role and tooltip
<ContributorAvatar 
  user={githubUser} 
  role="author" 
  showRole={true}
  showTooltip={true}
  size="large"
/>

// Multiple avatars with staggered animation
{contributors.map((user, index) => (
  <ContributorAvatar 
    key={user.id}
    user={user}
    animationDelay={index * 0.1}
  />
))}
```

## Role Colors

- **Author**: Primary blue (`colors.primary[500]`)
- **Reviewer**: Secondary orange (`colors.secondary[500]`)
- **Committer**: Success green (`colors.success`)
- **Commenter**: Neutral gray (`colors.neutral[500]`)

## Features

- **Fallback Handling**: Shows user initials if avatar image fails to load
- **Bot Detection**: Special indicator for bot users
- **Responsive Design**: Scales appropriately at different sizes
- **Accessibility**: Proper alt text and semantic structure

## Animation

The component uses:
- Spring animation for entrance effects
- Interpolated opacity for smooth fade-in
- Optional hover scale effect for interactivity
- Delayed tooltip appearance