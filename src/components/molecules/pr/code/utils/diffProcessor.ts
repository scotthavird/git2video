/**
 * Diff Processing Utilities for GitHub PR Video Generation
 * Handles parsing and processing of Git diffs for visual animations
 */

import { GitHubFile } from '../../../../../github/types';

export interface DiffLine {
  type: 'added' | 'removed' | 'context' | 'header' | 'hunk';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
  originalIndex: number;
}

export interface ProcessedDiff {
  fileName: string;
  language: string;
  status: GitHubFile['status'];
  lines: DiffLine[];
  stats: {
    additions: number;
    deletions: number;
    changes: number;
  };
  context: {
    beforeLines: DiffLine[];
    afterLines: DiffLine[];
    changedLines: DiffLine[];
  };
}

export interface DiffChunk {
  oldStart: number;
  oldCount: number;
  newStart: number;
  newCount: number;
  lines: DiffLine[];
  header: string;
}

/**
 * Parse a unified diff patch into structured diff lines
 */
export function parseDiffPatch(patch: string, fileName: string): ProcessedDiff {
  const lines = patch.split('\n');
  const diffLines: DiffLine[] = [];
  const chunks: DiffChunk[] = [];
  
  let oldLineNumber = 0;
  let newLineNumber = 0;
  let currentChunk: DiffChunk | null = null;
  
  const language = detectLanguageFromFileName(fileName);
  let additions = 0;
  let deletions = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const originalIndex = i;
    
    // Parse hunk header (@@)
    if (line.startsWith('@@')) {
      const hunkMatch = line.match(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(.*)/);
      if (hunkMatch) {
        const [, oldStart, oldCount = '1', newStart, newCount = '1', context] = hunkMatch;
        
        currentChunk = {
          oldStart: parseInt(oldStart),
          oldCount: parseInt(oldCount),
          newStart: parseInt(newStart),
          newCount: parseInt(newCount),
          lines: [],
          header: context.trim()
        };
        
        oldLineNumber = parseInt(oldStart);
        newLineNumber = parseInt(newStart);
        chunks.push(currentChunk);
        
        diffLines.push({
          type: 'hunk',
          content: line,
          originalIndex,
        });
      }
      continue;
    }
    
    // Skip file headers
    if (line.startsWith('---') || line.startsWith('+++') || line.startsWith('diff')) {
      diffLines.push({
        type: 'header',
        content: line,
        originalIndex,
      });
      continue;
    }
    
    // Skip empty lines at the beginning
    if (!currentChunk && line.trim() === '') {
      continue;
    }
    
    if (!currentChunk) continue;
    
    const lineType = getLineType(line);
    const content = line.substring(1); // Remove the +/- prefix
    
    const diffLine: DiffLine = {
      type: lineType,
      content,
      originalIndex,
    };
    
    // Set line numbers based on type
    if (lineType === 'removed') {
      diffLine.oldLineNumber = oldLineNumber++;
      deletions++;
    } else if (lineType === 'added') {
      diffLine.newLineNumber = newLineNumber++;
      additions++;
    } else if (lineType === 'context') {
      diffLine.oldLineNumber = oldLineNumber++;
      diffLine.newLineNumber = newLineNumber++;
    }
    
    diffLines.push(diffLine);
    currentChunk.lines.push(diffLine);
  }
  
  // Categorize lines for context analysis
  const beforeLines = diffLines.filter(line => line.type === 'removed');
  const afterLines = diffLines.filter(line => line.type === 'added');
  const changedLines = diffLines.filter(line => line.type === 'added' || line.type === 'removed');
  
  return {
    fileName,
    language,
    status: determineFileStatus(additions, deletions),
    lines: diffLines,
    stats: {
      additions,
      deletions,
      changes: additions + deletions,
    },
    context: {
      beforeLines,
      afterLines,
      changedLines,
    },
  };
}

/**
 * Determine line type from diff prefix
 */
function getLineType(line: string): DiffLine['type'] {
  if (line.startsWith('+')) return 'added';
  if (line.startsWith('-')) return 'removed';
  if (line.startsWith(' ')) return 'context';
  if (line.startsWith('@@')) return 'hunk';
  return 'header';
}

/**
 * Detect programming language from file name
 */
export function detectLanguageFromFileName(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  const languageMap: Record<string, string> = {
    'ts': 'typescript',
    'tsx': 'tsx',
    'js': 'javascript',
    'jsx': 'jsx',
    'py': 'python',
    'java': 'java',
    'kt': 'kotlin',
    'swift': 'swift',
    'go': 'go',
    'rs': 'rust',
    'cpp': 'cpp',
    'cc': 'cpp',
    'cxx': 'cpp',
    'c': 'c',
    'h': 'c',
    'hpp': 'cpp',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'sh': 'bash',
    'bash': 'bash',
    'zsh': 'bash',
    'ps1': 'powershell',
    'sql': 'sql',
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'json': 'json',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'toml': 'toml',
    'md': 'markdown',
    'markdown': 'markdown',
    'dockerfile': 'dockerfile',
    'tf': 'terraform',
    'hcl': 'hcl',
  };
  
  return languageMap[extension || ''] || 'text';
}

/**
 * Determine file status based on additions/deletions
 */
function determineFileStatus(additions: number, deletions: number): GitHubFile['status'] {
  if (additions > 0 && deletions === 0) return 'added';
  if (additions === 0 && deletions > 0) return 'removed';
  if (additions > 0 && deletions > 0) return 'modified';
  return 'unchanged';
}

/**
 * Process GitHub file data to create structured diffs
 */
export function processGitHubFile(file: GitHubFile): ProcessedDiff | null {
  if (!file.patch) {
    // Handle files without patches (binary files, etc.)
    return {
      fileName: file.filename,
      language: detectLanguageFromFileName(file.filename),
      status: file.status,
      lines: [],
      stats: {
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes,
      },
      context: {
        beforeLines: [],
        afterLines: [],
        changedLines: [],
      },
    };
  }
  
  return parseDiffPatch(file.patch, file.filename);
}

/**
 * Group related changes for better visual storytelling
 */
export interface ChangeGroup {
  type: 'addition' | 'deletion' | 'modification' | 'refactor';
  description: string;
  files: ProcessedDiff[];
  impact: 'low' | 'medium' | 'high';
  complexity: number;
}

export function groupRelatedChanges(diffs: ProcessedDiff[]): ChangeGroup[] {
  const groups: ChangeGroup[] = [];
  
  // Group by file type and change pattern
  const fileGroups = new Map<string, ProcessedDiff[]>();
  
  diffs.forEach(diff => {
    const key = `${diff.language}-${diff.status}`;
    if (!fileGroups.has(key)) {
      fileGroups.set(key, []);
    }
    fileGroups.get(key)!.push(diff);
  });
  
  fileGroups.forEach((files, key) => {
    const [language, status] = key.split('-');
    const totalChanges = files.reduce((sum, file) => sum + file.stats.changes, 0);
    
    let type: ChangeGroup['type'];
    let description: string;
    
    if (status === 'added') {
      type = 'addition';
      description = `New ${language} files`;
    } else if (status === 'removed') {
      type = 'deletion';
      description = `Removed ${language} files`;
    } else if (totalChanges > 100) {
      type = 'refactor';
      description = `Major ${language} refactoring`;
    } else {
      type = 'modification';
      description = `${language} improvements`;
    }
    
    const impact = totalChanges > 200 ? 'high' : totalChanges > 50 ? 'medium' : 'low';
    const complexity = Math.min(10, Math.floor(totalChanges / 10));
    
    groups.push({
      type,
      description,
      files,
      impact,
      complexity,
    });
  });
  
  // Sort by impact and complexity
  return groups.sort((a, b) => {
    const impactWeight = { high: 3, medium: 2, low: 1 };
    return (impactWeight[b.impact] * b.complexity) - (impactWeight[a.impact] * a.complexity);
  });
}

/**
 * Generate smooth transitions between diff states
 */
export interface DiffTransition {
  from: DiffLine[];
  to: DiffLine[];
  keyFrames: Array<{
    frame: number;
    lines: DiffLine[];
    focusLine?: number;
  }>;
}

export function generateDiffTransition(
  oldLines: DiffLine[],
  newLines: DiffLine[],
  durationFrames: number
): DiffTransition {
  const keyFrames: DiffTransition['keyFrames'] = [];
  const frameStep = Math.max(1, Math.floor(durationFrames / 10));
  
  // Create intermediate states
  for (let frame = 0; frame <= durationFrames; frame += frameStep) {
    const progress = frame / durationFrames;
    const intermediateLines = interpolateLines(oldLines, newLines, progress);
    
    keyFrames.push({
      frame,
      lines: intermediateLines,
      focusLine: findFocusLine(intermediateLines, progress),
    });
  }
  
  return {
    from: oldLines,
    to: newLines,
    keyFrames,
  };
}

/**
 * Interpolate between two sets of diff lines
 */
function interpolateLines(oldLines: DiffLine[], newLines: DiffLine[], progress: number): DiffLine[] {
  if (progress <= 0) return oldLines;
  if (progress >= 1) return newLines;
  
  // Simple implementation - in practice, you'd want more sophisticated line matching
  const maxLines = Math.max(oldLines.length, newLines.length);
  const currentLineCount = Math.floor(oldLines.length + (newLines.length - oldLines.length) * progress);
  
  const result: DiffLine[] = [];
  
  for (let i = 0; i < currentLineCount; i++) {
    if (i < oldLines.length && progress < 0.5) {
      result.push(oldLines[i]);
    } else if (i < newLines.length) {
      result.push(newLines[i]);
    }
  }
  
  return result;
}

/**
 * Find the line that should be focused during transition
 */
function findFocusLine(lines: DiffLine[], progress: number): number | undefined {
  const changedLines = lines.findIndex(line => line.type === 'added' || line.type === 'removed');
  return changedLines >= 0 ? changedLines : undefined;
}

/**
 * Extract contextual information around changes
 */
export interface ChangeContext {
  beforeContext: DiffLine[];
  change: DiffLine[];
  afterContext: DiffLine[];
  summary: string;
  importance: 'critical' | 'important' | 'minor';
}

export function extractChangeContext(
  diff: ProcessedDiff,
  contextLines: number = 3
): ChangeContext[] {
  const contexts: ChangeContext[] = [];
  const { lines } = diff;
  
  let currentChange: DiffLine[] = [];
  let changeStart = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.type === 'added' || line.type === 'removed') {
      if (currentChange.length === 0) {
        changeStart = i;
      }
      currentChange.push(line);
    } else {
      if (currentChange.length > 0) {
        // Process the current change
        const beforeContext = lines.slice(
          Math.max(0, changeStart - contextLines),
          changeStart
        ).filter(l => l.type === 'context');
        
        const afterContext = lines.slice(
          i,
          Math.min(lines.length, i + contextLines)
        ).filter(l => l.type === 'context');
        
        contexts.push({
          beforeContext,
          change: currentChange,
          afterContext,
          summary: summarizeChange(currentChange),
          importance: assessChangeImportance(currentChange),
        });
        
        currentChange = [];
        changeStart = -1;
      }
    }
  }
  
  // Handle any remaining change
  if (currentChange.length > 0) {
    const beforeContext = lines.slice(
      Math.max(0, changeStart - contextLines),
      changeStart
    ).filter(l => l.type === 'context');
    
    contexts.push({
      beforeContext,
      change: currentChange,
      afterContext: [],
      summary: summarizeChange(currentChange),
      importance: assessChangeImportance(currentChange),
    });
  }
  
  return contexts;
}

/**
 * Generate a summary of a change block
 */
function summarizeChange(changes: DiffLine[]): string {
  const additions = changes.filter(l => l.type === 'added').length;
  const deletions = changes.filter(l => l.type === 'removed').length;
  
  if (additions > 0 && deletions > 0) {
    return `Modified ${Math.max(additions, deletions)} lines`;
  } else if (additions > 0) {
    return `Added ${additions} lines`;
  } else if (deletions > 0) {
    return `Removed ${deletions} lines`;
  }
  
  return 'No changes';
}

/**
 * Assess the importance of a change based on content
 */
function assessChangeImportance(changes: DiffLine[]): ChangeContext['importance'] {
  const content = changes.map(l => l.content.toLowerCase()).join(' ');
  
  // Critical patterns
  if (content.includes('security') || content.includes('auth') || content.includes('password')) {
    return 'critical';
  }
  
  // Important patterns
  if (content.includes('function') || content.includes('class') || content.includes('export')) {
    return 'important';
  }
  
  return 'minor';
}