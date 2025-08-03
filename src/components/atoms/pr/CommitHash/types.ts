export interface CommitHashProps {
  hash: string;
  short?: boolean;
  copyable?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: 'default' | 'minimal' | 'badge';
  animationDelay?: number;
  showCopyFeedback?: boolean;
}