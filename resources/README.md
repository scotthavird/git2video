# External Resources

This directory contains reference implementations and external resources for video generation projects.

## recorder-main/

A comprehensive video recording and editing application built with Remotion. This is a full-featured video production tool that demonstrates advanced Remotion patterns.

### Key Features
- **Video Recording**: Browser-based video capture with device selection and resolution controls
- **Caption Processing**: Whisper-based transcription with real-time editing capabilities
- **Scene Management**: Multi-scene video composition with smooth transitions
- **B-Roll Support**: Background video integration with scaling and positioning
- **Real-time Preview**: Live editing and preview capabilities
- **Audio Processing**: Multi-track audio with volume controls and effects

### Architecture Highlights
- **Component Structure**: Well-organized Remotion components with clear separation of concerns
- **State Management**: Complex state handling for video recording and editing
- **Animation System**: Sophisticated transition animations between scenes
- **File Processing**: Video upload, conversion, and transcription workflows

### Key Files
- `remotion/Main.tsx` - Main composition entry point
- `remotion/captions/` - Caption processing and display components
- `remotion/scenes/` - Video scene management and transitions
- `remotion/layout/` - Responsive layout calculations
- `scripts/` - Video processing and transcription utilities
- `src/` - React application for video recording interface

### Development Patterns
- **Atomic Design**: Components organized by complexity
- **Animation Techniques**: Spring animations, interpolated values, and transition effects
- **Testing Strategy**: Jest-based component testing
- **TypeScript**: Strict type checking throughout

## template-code-hike-main/

A code-focused video template for creating educational programming content. This demonstrates how to create engaging code walkthrough videos.

### Key Features
- **Code Highlighting**: Syntax highlighting with customizable themes
- **Progress Tracking**: Visual progress indicators through code sections
- **Annotation System**: Callouts, errors, and inline token highlighting
- **Metadata Processing**: Automatic code analysis and metadata generation
- **Theme Support**: Customizable visual themes for different code styles

### Architecture Highlights
- **Code Analysis**: Automatic parsing and processing of code files
- **Progress Visualization**: Smooth transitions between code sections
- **Annotation Components**: Flexible system for code annotations
- **Theme System**: Extensible theming for different programming languages

### Key Files
- `src/Main.tsx` - Main composition with code transitions
- `src/calculate-metadata/` - Code analysis and metadata generation
- `src/annotations/` - Code annotation components (Callout, Error, InlineToken)
- `src/CodeTransition.tsx` - Smooth transitions between code sections
- `src/ProgressBar.tsx` - Visual progress indicators

### Development Patterns
- **Code Processing**: File system integration for code analysis
- **Animation Techniques**: Smooth transitions and progress indicators
- **Theme System**: Extensible theming architecture
- **Metadata Generation**: Automatic code structure analysis

## Usage for AI Assistants

When working with these resources:

### For recorder-main:
1. **Video Recording**: Study the device enumeration and media capture patterns
2. **Caption Processing**: Understand the Whisper integration and caption editing workflow
3. **Scene Management**: Learn multi-scene composition and transition techniques
4. **B-Roll Integration**: See how background videos are integrated and scaled
5. **Real-time Preview**: Understand live editing and preview capabilities

### For template-code-hike-main:
1. **Code Analysis**: Study the metadata generation and file processing patterns
2. **Animation Techniques**: Learn smooth transitions between code sections
3. **Annotation System**: Understand the flexible annotation component architecture
4. **Theme Integration**: See how themes are applied to code highlighting
5. **Progress Tracking**: Study visual progress indicators and timing

## Common Patterns

Both resources demonstrate:
- **Remotion Best Practices**: Proper composition structure and component organization
- **TypeScript Integration**: Comprehensive type definitions and strict checking
- **Animation Techniques**: Spring animations, interpolated values, and smooth transitions
- **Testing Strategies**: Jest-based component testing with Remotion utilities
- **Documentation**: Comprehensive README files and component documentation

These resources serve as excellent reference implementations for building video generation applications with Remotion, providing patterns for both recording/editing workflows and educational content creation.
