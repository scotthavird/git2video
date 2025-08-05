# PRHeader Component

A Remotion molecule component that displays the complete header section of a Pull Request with animated elements.

## Features

- Animated slide-in transitions with spring effects
- Complete PR metadata display (title, number, status, author)
- Branch comparison visualization
- Labels and milestone display
- Repository information
- Responsive design with compact mode
- Time-based information (creation date, time since)
- Color-coded labels based on GitHub colors

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pullRequest` | `GitHubPullRequest` | Required | Complete PR data object |
| `repository` | `GitHubRepository` | Required | Repository information |
| `animationDelay` | `number` | `0` | Delay before animation starts (in seconds) |
| `showLabels` | `boolean` | `true` | Whether to display PR labels |
| `showMilestone` | `boolean` | `true` | Whether to display milestone if present |
| `compact` | `boolean` | `false` | Use compact layout with smaller spacing |

## Usage

```tsx
import { PRHeader } from './components/molecules/pr/PRHeader';

// Basic usage
<PRHeader 
  pullRequest={prData} 
  repository={repoData} 
/>

// Compact version for smaller screens
<PRHeader 
  pullRequest={prData} 
  repository={repoData} 
  compact={true}
/>

// Without labels and milestone
<PRHeader 
  pullRequest={prData} 
  repository={repoData} 
  showLabels={false}
  showMilestone={false}
/>

// With animation delay
<PRHeader 
  pullRequest={prData} 
  repository={repoData} 
  animationDelay={0.5}
/>
```

## Layout Structure

The component is organized in vertical sections:

### Top Row
- PR Status badge (using PRStatus atom)
- PR number (#123)
- Repository name (owner/repo)

### Title Section
- Large, prominent PR title
- Responsive font sizing based on compact mode

### Author & Metadata Row
- Author avatar (using ContributorAvatar atom)
- Author name and creation timestamp
- Branch comparison (head → base)

### Labels & Milestone (Optional)
- Color-coded GitHub labels (up to 5 displayed)
- Milestone badge if present
- "+X more" indicator for additional labels

## Styling Features

### Animations
- Slide-in effect from left (50px offset)
- Staggered label animations
- Spring-based entrance transitions
- Fade-in opacity animation

### Responsive Design
- **Normal Mode**: Full spacing and larger fonts
- **Compact Mode**: Reduced spacing and smaller fonts
- Flexible layout with proper wrapping

### Visual Elements
- Card-style container with border and shadow
- Color-coded PR status
- Monospace font for branch names
- GitHub-style label colors
- Proper contrast ratios for accessibility

## Dependencies

This component uses the following atomic components:
- `PRStatus`: For displaying PR state with animations
- `ContributorAvatar`: For showing author information

## Data Requirements

The component expects full GitHub API data structures:

```typescript
// Required PR fields
pullRequest: {
  number: number,
  title: string,
  state: 'open' | 'closed',
  merged: boolean,
  user: GitHubUser,
  labels: GitHubLabel[],
  milestone?: GitHubMilestone,
  head: { ref: string },
  base: { ref: string },
  created_at: string,
  // ... other PR fields
}

// Required repository fields  
repository: {
  full_name: string,
  // ... other repo fields
}
```

## Animation Timeline

- **0-30 frames**: Opacity fade-in
- **0-40 frames**: Slide-in from left
- **20 frames**: Status badge animation starts
- **40 frames**: Avatar animation starts
- **30+ frames**: Staggered label animations (5 frame intervals)