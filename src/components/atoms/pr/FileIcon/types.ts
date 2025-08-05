export interface FileIconProps {
  filename: string;
  status?: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'unchanged';
  size?: 'small' | 'medium' | 'large';
  animationDelay?: number;
  showStatus?: boolean;
  statusPosition?: 'overlay' | 'side';
}

export interface FileTypeConfig {
  icon: string;
  color: string;
  backgroundColor?: string;
}

export interface StatusConfig {
  icon: string;
  color: string;
  label: string;
}