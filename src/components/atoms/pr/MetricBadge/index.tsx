import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { colors, withOpacity } from '../../../../theme/colors';
import { MetricBadgeProps, MetricTypeConfig } from './types';

export const MetricBadge: React.FC<MetricBadgeProps> = ({
  value,
  label,
  icon,
  type = 'default',
  size = 'medium',
  animationDelay = 0,
  countAnimation = true,
  formatValue = (val: number) => val.toLocaleString(),
  layout = 'horizontal',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const animationStart = animationDelay * fps;
  
  const scale = spring({
    frame: frame - animationStart,
    fps,
    config: {
      damping: 100,
      stiffness: 200,
      mass: 0.5,
    },
  });
  
  const opacity = interpolate(
    frame - animationStart,
    [0, 15],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Count animation
  const animatedValue = countAnimation ? interpolate(
    frame - animationStart,
    [20, 60],
    [0, value],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  ) : value;

  const typeConfigs: Record<string, MetricTypeConfig> = {
    default: {
      backgroundColor: colors.neutral[100],
      textColor: colors.text.primary,
      borderColor: colors.neutral[300],
    },
    success: {
      backgroundColor: colors.success,
      textColor: colors.text.inverse,
      iconColor: colors.text.inverse,
    },
    warning: {
      backgroundColor: colors.warning,
      textColor: colors.text.primary,
      iconColor: colors.text.primary,
    },
    error: {
      backgroundColor: colors.error,
      textColor: colors.text.inverse,
      iconColor: colors.text.inverse,
    },
    info: {
      backgroundColor: colors.primary[500],
      textColor: colors.text.inverse,
      iconColor: colors.text.inverse,
    },
  };

  const sizeStyles = {
    small: {
      padding: '6px 12px',
      fontSize: 12,
      iconSize: 14,
      gap: '4px',
      borderRadius: '12px',
    },
    medium: {
      padding: '8px 16px',
      fontSize: 14,
      iconSize: 16,
      gap: '6px',
      borderRadius: '16px',
    },
    large: {
      padding: '12px 20px',
      fontSize: 16,
      iconSize: 20,
      gap: '8px',
      borderRadius: '20px',
    },
  };

  const layoutStyles = {
    horizontal: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
    },
    vertical: {
      flexDirection: 'column' as const,
      alignItems: 'center' as const,
      textAlign: 'center' as const,
    },
    compact: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      minWidth: 'auto',
    },
  };

  const currentSize = sizeStyles[size];
  const currentLayout = layoutStyles[layout];
  const currentType = typeConfigs[type];

  const displayValue = Math.round(animatedValue);

  return (
    <div
      style={{
        display: 'inline-flex',
        ...currentLayout,
        gap: currentSize.gap,
        padding: currentSize.padding,
        backgroundColor: currentType.backgroundColor,
        color: currentType.textColor,
        borderRadius: currentSize.borderRadius,
        border: currentType.borderColor ? `1px solid ${currentType.borderColor}` : 'none',
        fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
        fontWeight: '600',
        fontSize: currentSize.fontSize,
        transform: `scale(${scale})`,
        opacity,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        minWidth: layout === 'compact' ? 'auto' : '60px',
        justifyContent: layout === 'vertical' ? 'center' : 'flex-start',
      }}
    >
      {icon && (
        <span
          style={{
            fontSize: currentSize.iconSize,
            color: currentType.iconColor || currentType.textColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </span>
      )}
      
      <div
        style={{
          display: 'flex',
          flexDirection: layout === 'horizontal' ? 'column' : 'row',
          alignItems: layout === 'vertical' ? 'center' : 'flex-start',
          gap: layout === 'vertical' ? currentSize.gap : '2px',
        }}
      >
        <span
          style={{
            fontSize: layout === 'vertical' ? currentSize.fontSize + 4 : currentSize.fontSize,
            fontWeight: '700',
            lineHeight: 1,
          }}
        >
          {formatValue(displayValue)}
        </span>
        
        <span
          style={{
            fontSize: layout === 'vertical' ? currentSize.fontSize - 2 : currentSize.fontSize - 2,
            fontWeight: '500',
            opacity: 0.8,
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};