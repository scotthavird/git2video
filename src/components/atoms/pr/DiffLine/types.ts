export interface DiffLineProps {
  content: string;
  type: 'added' | 'removed' | 'context' | 'header';
  lineNumber?: number;
  oldLineNumber?: number;
  newLineNumber?: number;
  animationDelay?: number;
  showLineNumbers?: boolean;
  highlightSyntax?: boolean;
  language?: string;
}

export interface DiffTypeConfig {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  prefixIcon: string;
  prefixColor: string;
}