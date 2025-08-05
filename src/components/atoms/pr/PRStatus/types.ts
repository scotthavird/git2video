export interface PRStatusProps {
  status: 'open' | 'closed' | 'merged' | 'draft';
  merged?: boolean;
  size?: 'small' | 'medium' | 'large';
  animationDelay?: number;
}

export interface StatusConfig {
  color: string;
  backgroundColor: string;
  icon: string;
  label: string;
}