export interface MetricBadgeProps {
  value: number;
  label: string;
  icon?: string;
  type?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
  animationDelay?: number;
  countAnimation?: boolean;
  formatValue?: (value: number) => string;
  layout?: 'horizontal' | 'vertical' | 'compact';
}

export interface MetricTypeConfig {
  backgroundColor: string;
  textColor: string;
  iconColor?: string;
  borderColor?: string;
}