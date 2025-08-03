# CommitCard Component

A Remotion molecule component that displays comprehensive information about a single commit with animations and interactive elements.

## Features

- Animated commit card with spring transitions and slide-in effects
- Complete commit metadata display (hash, message, author, date)
- Statistics display (additions, deletions, files changed)
- File modification list with truncation
- Message truncation with "view more" indicators
- Author avatar and information
- Compact mode for space-constrained layouts
- Hover effects for interactivity

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `commit` | `GitHubCommit` | Required | Complete commit data object |
| `animationDelay` | `number` | `0` | Delay before animation starts (in seconds) |
| `showStats` | `boolean` | `true` | Whether to display commit statistics |
| `showFiles` | `boolean` | `false` | Whether to display modified files list |
| `compact` | `boolean` | `false` | Use compact layout with smaller spacing |
| `maxMessageLength` | `number` | `120` | Maximum length for commit message before truncation |

## Usage

```tsx
import { CommitCard } from './components/molecules/pr/CommitCard';

// Basic usage
<CommitCard commit={commitData} />

// With file list and stats
<CommitCard 
  commit={commitData} 
  showStats={true}
  showFiles={true}
/>

// Compact version
<CommitCard 
  commit={commitData} 
  compact={true}
  maxMessageLength={80}
/>

// With animation delay for staggered effects
<CommitCard 
  commit={commitData} 
  animationDelay={0.5}
/>

// Multiple commits with staggered animation
{commits.map((commit, index) => (
  <CommitCard 
    key={commit.sha}
    commit={commit}
    animationDelay={index * 0.2}
    showStats={true}
  />
))}
```

## Layout Structure

The component is organized in vertical sections:

### Header Section
- Commit hash badge (using CommitHash atom)
- Formatted timestamp
- Author avatar (using ContributorAvatar atom)

### Message Section
- Primary commit message (first line)
- Truncation with "..." if message exceeds maxMessageLength
- "View full message..." indicator for multiline commits

### Author Information
- "by [Author Name]" with email if available
- Links to author profile

### Statistics (Optional)
- Additions count with green badge
- Deletions count with red badge  
- Files changed count with blue badge

### Files List (Optional)
- "Modified Files" section header
- List of changed filenames (up to 3 shown)
- "+X more" indicator for additional files

## Styling Features

### Animations
- Scale and slide-in entrance effects
- Staggered animations for statistics badges
- File list animations with delays
- Hover effects for interactivity

### Visual Design
- Card-style container with subtle shadow
- Color-coded statistics (green for additions, red for deletions)
- Monospace font for commit hashes and filenames
- Responsive layout with proper text wrapping

### Responsive Modes
- **Normal Mode**: Full spacing and larger fonts
- **Compact Mode**: Reduced spacing and smaller fonts

## Dependencies

This component uses the following atomic components:
- `CommitHash`: For displaying commit SHA with copy functionality
- `ContributorAvatar`: For showing commit author
- `MetricBadge`: For displaying statistics (additions, deletions, files)

## Data Requirements

```typescript
commit: {
  sha: string,
  commit: {
    message: string,
    author: {
      name: string,
      email: string,
      date: string,
    },
  },
  author?: GitHubUser,
  stats?: {
    additions: number,
    deletions: number,
    total: number,
  },
  files?: GitHubFile[],
}
```

## Message Handling

The component intelligently handles commit messages:

- **Single Line**: Displays as-is if under maxMessageLength
- **Truncation**: Adds "..." if message is too long
- **Multiline**: Shows first line + "View full message..." indicator
- **Empty**: Handles gracefully with fallback display

## Animation Timeline

- **0-25 frames**: Opacity fade-in
- **0-35 frames**: Slide-in from top (30px offset)
- **20 frames**: Commit hash animation starts
- **30 frames**: Avatar animation starts
- **40+ frames**: Statistics badges (staggered)
- **40+ frames**: File list (staggered, 5 frame intervals)