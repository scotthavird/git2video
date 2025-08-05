# FileIcon Component

A Remotion component for displaying file type icons with status indicators and animations.

## Features

- Animated file icons with spring transitions
- Support for 40+ file types with appropriate icons and colors
- Status indicators for file changes (added, modified, removed, etc.)
- Two status display modes: overlay and side
- File type detection based on extension
- Color-coded backgrounds and borders

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `filename` | `string` | Required | The filename to determine icon and type |
| `status` | `'added' \| 'removed' \| 'modified' \| 'renamed' \| 'copied' \| 'unchanged'` | `undefined` | File change status |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Size variant of the icon |
| `animationDelay` | `number` | `0` | Delay before animation starts (in seconds) |
| `showStatus` | `boolean` | `true` | Whether to show status indicator |
| `statusPosition` | `'overlay' \| 'side'` | `'overlay'` | Position of status indicator |

## Usage

```tsx
import { FileIcon } from './components/atoms/pr/FileIcon';

// Basic usage
<FileIcon filename="app.js" />

// With status (overlay)
<FileIcon filename="Component.tsx" status="modified" />

// With status (side)
<FileIcon 
  filename="README.md" 
  status="added" 
  statusPosition="side"
  size="large"
/>

// Multiple files with staggered animation
{files.map((file, index) => (
  <FileIcon 
    key={file.filename}
    filename={file.filename}
    status={file.status}
    animationDelay={index * 0.1}
  />
))}
```

## Supported File Types

### Programming Languages
- **JavaScript**: `.js` - 📄 (yellow)
- **React**: `.jsx` - ⚛️ (blue)
- **TypeScript**: `.ts`, `.tsx` - 📘 (blue)
- **Python**: `.py` - 🐍 (blue)
- **Java**: `.java` - ☕ (brown)
- **C/C++**: `.c`, `.cpp` - ⚙️ (gray/pink)
- **C#**: `.cs` - #️⃣ (green)
- **PHP**: `.php` - 🐘 (purple)
- **Ruby**: `.rb` - 💎 (red)
- **Go**: `.go` - 🐹 (cyan)
- **Rust**: `.rs` - 🦀 (orange)
- **Swift**: `.swift` - 🕊️ (orange)

### Web Technologies
- **HTML**: `.html` - 🌐 (red)
- **CSS**: `.css` - 🎨 (blue)
- **SCSS/Sass**: `.scss`, `.sass` - 🎨 (pink)
- **Vue**: `.vue` - 💚 (green)

### Data Formats
- **JSON**: `.json` - 📊 (black)
- **XML**: `.xml` - 📋 (orange)
- **YAML**: `.yaml`, `.yml` - 📄 (red)
- **CSV**: `.csv` - 📈 (green)

### Documentation
- **Markdown**: `.md` - 📝 (blue)
- **Text**: `.txt` - 📄 (brown)
- **PDF**: `.pdf` - 📕 (red)

### Images
- **Images**: `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg` - 🖼️/🎭 (orange)

### Archives
- **Archives**: `.zip`, `.tar`, `.gz` - 📦 (brown)

## Status Colors

- **Added**: Green (`colors.success`)
- **Modified**: Orange (`colors.warning`)
- **Removed**: Red (`colors.error`)
- **Renamed**: Blue (`colors.primary[500]`)
- **Copied**: Orange (`colors.secondary[500]`)
- **Unchanged**: Gray (`colors.neutral[500]`)

## Animation

The component uses:
- Spring animation for entrance effects
- Staggered animation for status indicators
- Scale transitions for interactive feedback
- Interpolated opacity for smooth fade-in