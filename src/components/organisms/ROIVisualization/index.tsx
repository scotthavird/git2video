import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ROIVisualizationProps } from './types';

// GitHub-inspired color palette
const COLORS = {
  github: {
    dark: '#24292f',
    light: '#f6f8fa',
    blue: '#0969da',
    green: '#1f883d',
    red: '#cf222e',
    orange: '#fb8500',
    purple: '#8250df',
    yellow: '#fbbf24',
    teal: '#0891b2',
    gray: {
      100: '#f6f8fa',
      200: '#d1d9e0',
      300: '#b1bac4',
      400: '#8c959f',
      500: '#6e7781',
      600: '#57606a',
      700: '#424a53',
      800: '#32383f',
      900: '#24292f',
    }
  }
};

const MOBILE_OPTIMIZED = {
  minFontSize: 24,
  headerFontSize: 32,
  titleFontSize: 44,
  padding: 18,
  margin: 16,
  borderRadius: 10,
};

export const ROIVisualization: React.FC<ROIVisualizationProps> = ({
  data,
  animationDelay = 0,
  showVelocityMetrics = true,
  showResourceAllocation = true,
  showFeatureImpact = true,
  showCommunityMetrics = true,
  showCostBenefit = true,
  highlightSection = null,
  theme = 'github',
  viewMode = 'executive',
  timeframe = 'quarter'
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Animation timings
  const titleAnimation = spring({
    frame: frame - animationDelay * fps,
    fps,
    config: { damping: 0.7, stiffness: 120, mass: 0.8 }
  });

  const roiAnimation = spring({
    frame: frame - (animationDelay + 0.3) * fps,
    fps,
    config: { damping: 0.6, stiffness: 100, mass: 0.6 }
  });

  const sectionsAnimation = spring({
    frame: frame - (animationDelay + 0.6) * fps,
    fps,
    config: { damping: 0.6, stiffness: 100, mass: 0.6 }
  });

  const chartsAnimation = spring({
    frame: frame - (animationDelay + 1.0) * fps,
    fps,
    config: { damping: 0.6, stiffness: 100, mass: 0.6 }
  });

  // Layout calculations
  const containerPadding = Math.max(MOBILE_OPTIMIZED.padding, width * 0.015);
  const sectionWidth = (width - containerPadding * 4) / 3;
  const sectionHeight = (height - containerPadding * 3 - 160) / 2;

  // Utility functions
  const formatCurrency = (amount: number, compact: boolean = true): string => {
    if (compact) {
      if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
      if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
      return `$${amount.toFixed(0)}`;
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatPercentage = (value: number): string => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

  const getROIColor = (roi: number): string => {
    if (roi >= 200) return COLORS.github.green;
    if (roi >= 100) return COLORS.github.blue;
    if (roi >= 50) return COLORS.github.teal;
    if (roi >= 0) return COLORS.github.orange;
    return COLORS.github.red;
  };

  const getTrendColor = (trend: 'increasing' | 'stable' | 'decreasing'): string => {
    switch (trend) {
      case 'increasing': return COLORS.github.green;
      case 'decreasing': return COLORS.github.red;
      default: return COLORS.github.gray[500];
    }
  };

  const getTrendIcon = (trend: 'increasing' | 'stable' | 'decreasing'): string => {
    switch (trend) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      default: return '➖';
    }
  };

  const getRiskColor = (impact: string): string => {
    switch (impact) {
      case 'high': return COLORS.github.red;
      case 'medium': return COLORS.github.orange;
      default: return COLORS.github.yellow;
    }
  };

  const getImpactColor = (impact: string): string => {
    switch (impact) {
      case 'high': return COLORS.github.green;
      case 'medium': return COLORS.github.blue;
      default: return COLORS.github.gray[500];
    }
  };

  // Calculate total revenue
  const totalRevenue = data.costBenefitAnalysis.revenue.directRevenue + 
                      data.costBenefitAnalysis.revenue.costSavings + 
                      data.costBenefitAnalysis.revenue.efficiencyGains + 
                      data.costBenefitAnalysis.revenue.riskMitigation;

  // Simple line chart component
  const LineChart: React.FC<{ 
    data: Array<{ label: string; value: number; }>;
    color: string;
    height: number;
  }> = ({ data, color, height }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;
    
    return (
      <div style={{ height, position: 'relative' }}>
        <svg width="100%" height={height}>
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={data.map((point, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = ((maxValue - point.value) / range) * (height - 20) + 10;
              return `${x}%,${y}`;
            }).join(' ')}
            style={{
              strokeDasharray: `${chartsAnimation * 1000}px`,
              strokeDashoffset: `${(1 - chartsAnimation) * 1000}px`,
            }}
          />
          {data.map((point, index) => (
            <circle
              key={index}
              cx={`${(index / (data.length - 1)) * 100}%`}
              cy={((maxValue - point.value) / range) * (height - 20) + 10}
              r="4"
              fill={color}
              opacity={chartsAnimation}
            />
          ))}
        </svg>
        <div style={{
          position: 'absolute',
          bottom: -20,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: MOBILE_OPTIMIZED.minFontSize - 8,
          color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600],
        }}>
          {data.map((point, index) => (
            <span key={index}>{point.label}</span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      width,
      height,
      backgroundColor: theme === 'dark' ? COLORS.github.dark : COLORS.github.light,
      color: theme === 'dark' ? COLORS.github.light : COLORS.github.dark,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
      padding: containerPadding,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        transform: `translateY(${interpolate(titleAnimation, [0, 1], [30, 0])}px)`,
        opacity: titleAnimation,
        marginBottom: MOBILE_OPTIMIZED.margin,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
      }}>
        <div>
          <h1 style={{
            fontSize: MOBILE_OPTIMIZED.titleFontSize,
            fontWeight: 700,
            margin: 0,
            marginBottom: 8,
            color: COLORS.github.green,
          }}>
            ROI Business Impact
          </h1>
          <p style={{
            fontSize: MOBILE_OPTIMIZED.minFontSize,
            color: theme === 'dark' ? COLORS.github.gray[300] : COLORS.github.gray[600],
            margin: 0,
          }}>
            {data.projectName} • {data.evaluationPeriod.periodLabel}
          </p>
        </div>

        {/* Main ROI Display */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: MOBILE_OPTIMIZED.margin,
          transform: `scale(${roiAnimation})`,
          opacity: roiAnimation,
        }}>
          <div style={{
            backgroundColor: getROIColor(data.overallROI),
            color: 'white',
            padding: '20px 28px',
            borderRadius: MOBILE_OPTIMIZED.borderRadius + 4,
            textAlign: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }}>
            <div style={{ fontSize: MOBILE_OPTIMIZED.titleFontSize + 8, fontWeight: 800 }}>
              {formatPercentage(data.overallROI)}
            </div>
            <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4 }}>Overall ROI</div>
          </div>
          <div style={{
            backgroundColor: theme === 'dark' ? COLORS.github.gray[800] : COLORS.github.gray[100],
            padding: '16px 20px',
            borderRadius: MOBILE_OPTIMIZED.borderRadius,
            textAlign: 'center',
            border: `2px solid ${COLORS.github.blue}`,
          }}>
            <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize, fontWeight: 700, color: COLORS.github.blue }}>
              {data.costBenefitAnalysis.roi.paybackPeriod}
            </div>
            <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6 }}>Payback (months)</div>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div style={{
        transform: `translateY(${interpolate(roiAnimation, [0, 1], [20, 0])}px)`,
        opacity: roiAnimation,
        marginBottom: MOBILE_OPTIMIZED.margin * 1.5,
        backgroundColor: theme === 'dark' ? COLORS.github.gray[800] : COLORS.github.gray[100],
        borderRadius: MOBILE_OPTIMIZED.borderRadius,
        padding: MOBILE_OPTIMIZED.padding,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-around',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize + 4, fontWeight: 700, color: COLORS.github.red }}>
            {formatCurrency(data.costBenefitAnalysis.development.totalCost)}
          </div>
          <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
            Total Investment
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize + 4, fontWeight: 700, color: COLORS.github.green }}>
            {formatCurrency(totalRevenue)}
          </div>
          <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
            Total Returns
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize + 4, fontWeight: 700, color: COLORS.github.blue }}>
            {formatCurrency(data.costBenefitAnalysis.roi.netPresentValue)}
          </div>
          <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
            Net Present Value
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize + 4, fontWeight: 700, color: COLORS.github.purple }}>
            {formatPercentage(data.costBenefitAnalysis.roi.internalRateOfReturn)}
          </div>
          <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
            Internal Rate of Return
          </div>
        </div>
      </div>

      {/* Top Row - Velocity & Resource Allocation */}
      <div style={{
        display: 'flex',
        gap: MOBILE_OPTIMIZED.margin,
        marginBottom: MOBILE_OPTIMIZED.margin,
        transform: `translateY(${interpolate(sectionsAnimation, [0, 1], [20, 0])}px)`,
        opacity: sectionsAnimation,
      }}>
        {/* Development Velocity */}
        {showVelocityMetrics && (
          <div style={{
            width: sectionWidth,
            height: sectionHeight,
            backgroundColor: theme === 'dark' ? COLORS.github.gray[800] : COLORS.github.gray[100],
            borderRadius: MOBILE_OPTIMIZED.borderRadius,
            padding: MOBILE_OPTIMIZED.padding,
            border: highlightSection === 'velocity' ? `3px solid ${COLORS.github.blue}` : 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <h3 style={{
              fontSize: MOBILE_OPTIMIZED.headerFontSize,
              fontWeight: 600,
              margin: 0,
              marginBottom: 16,
              color: COLORS.github.blue,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              ⚡ Velocity Impact
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 2, fontWeight: 700, color: COLORS.github.blue }}>
                  {data.developmentVelocity.averageVelocity}
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Avg Velocity
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 2, fontWeight: 700, color: getTrendColor(data.developmentVelocity.velocityTrend) }}>
                  {getTrendIcon(data.developmentVelocity.velocityTrend)}
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  {data.developmentVelocity.velocityTrend}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 2, fontWeight: 700, color: COLORS.github.green }}>
                  {data.developmentVelocity.predictabilityScore}%
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Predictability
                </div>
              </div>
            </div>

            <div style={{ flex: 1, marginBottom: 16 }}>
              <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2, fontWeight: 600, marginBottom: 8 }}>Sprint Velocity Trend</div>
              <LineChart
                data={data.developmentVelocity.sprintVelocity.slice(-6).map(s => ({
                  label: `S${s.sprintNumber}`,
                  value: s.storyPointsCompleted,
                }))}
                color={COLORS.github.blue}
                height={80}
              />
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: 12,
              borderRadius: 8,
              backgroundColor: theme === 'dark' ? COLORS.github.gray[700] : COLORS.github.gray[200],
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2, fontWeight: 600 }}>{data.developmentVelocity.cycleTime.averageDays}d</div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>Cycle Time</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2, fontWeight: 600 }}>{data.developmentVelocity.burndownEfficiency}%</div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>Efficiency</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2, fontWeight: 600, color: data.developmentVelocity.cycleTime.improvementRate > 0 ? COLORS.github.green : COLORS.github.red }}>
                  {formatPercentage(data.developmentVelocity.cycleTime.improvementRate)}
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>Improvement</div>
              </div>
            </div>
          </div>
        )}

        {/* Resource Allocation */}
        {showResourceAllocation && (
          <div style={{
            width: sectionWidth,
            height: sectionHeight,
            backgroundColor: theme === 'dark' ? COLORS.github.gray[800] : COLORS.github.gray[100],
            borderRadius: MOBILE_OPTIMIZED.borderRadius,
            padding: MOBILE_OPTIMIZED.padding,
            border: highlightSection === 'resources' ? `3px solid ${COLORS.github.purple}` : 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <h3 style={{
              fontSize: MOBILE_OPTIMIZED.headerFontSize,
              fontWeight: 600,
              margin: 0,
              marginBottom: 16,
              color: COLORS.github.purple,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              👥 Resource Efficiency
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 2, fontWeight: 700, color: COLORS.github.purple }}>
                  {data.resourceAllocation.totalDevelopers}
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Team Size
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 2, fontWeight: 700, color: COLORS.github.blue }}>
                  {data.resourceAllocation.utilizationRate}%
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Utilization
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 2, fontWeight: 700, color: COLORS.github.green }}>
                  ${data.resourceAllocation.costPerHour}
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Cost/Hour
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 2, fontWeight: 700, color: data.resourceAllocation.budgetUtilization > 90 ? COLORS.github.red : COLORS.github.green }}>
                  {data.resourceAllocation.budgetUtilization}%
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Budget Used
                </div>
              </div>
            </div>

            {/* Time Allocation */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2, fontWeight: 600, marginBottom: 12 }}>Time Allocation</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4 }}>Development</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 60,
                      height: 6,
                      backgroundColor: theme === 'dark' ? COLORS.github.gray[700] : COLORS.github.gray[200],
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${(data.resourceAllocation.hoursSpentDevelopment / data.resourceAllocation.totalHoursAllocated) * 100 * chartsAnimation}%`,
                        height: '100%',
                        backgroundColor: COLORS.github.green,
                      }} />
                    </div>
                    <span style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, minWidth: 40, textAlign: 'right' }}>
                      {Math.round((data.resourceAllocation.hoursSpentDevelopment / data.resourceAllocation.totalHoursAllocated) * 100)}%
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4 }}>Maintenance</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 60,
                      height: 6,
                      backgroundColor: theme === 'dark' ? COLORS.github.gray[700] : COLORS.github.gray[200],
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${(data.resourceAllocation.hoursSpentMaintenance / data.resourceAllocation.totalHoursAllocated) * 100 * chartsAnimation}%`,
                        height: '100%',
                        backgroundColor: COLORS.github.orange,
                      }} />
                    </div>
                    <span style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, minWidth: 40, textAlign: 'right' }}>
                      {Math.round((data.resourceAllocation.hoursSpentMaintenance / data.resourceAllocation.totalHoursAllocated) * 100)}%
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4 }}>Bug Fixes</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 60,
                      height: 6,
                      backgroundColor: theme === 'dark' ? COLORS.github.gray[700] : COLORS.github.gray[200],
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${(data.resourceAllocation.hoursSpentBugFixes / data.resourceAllocation.totalHoursAllocated) * 100 * chartsAnimation}%`,
                        height: '100%',
                        backgroundColor: COLORS.github.red,
                      }} />
                    </div>
                    <span style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, minWidth: 40, textAlign: 'right' }}>
                      {Math.round((data.resourceAllocation.hoursSpentBugFixes / data.resourceAllocation.totalHoursAllocated) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feature Delivery Impact */}
        {showFeatureImpact && (
          <div style={{
            width: sectionWidth,
            height: sectionHeight,
            backgroundColor: theme === 'dark' ? COLORS.github.gray[800] : COLORS.github.gray[100],
            borderRadius: MOBILE_OPTIMIZED.borderRadius,
            padding: MOBILE_OPTIMIZED.padding,
            border: highlightSection === 'features' ? `3px solid ${COLORS.github.green}` : 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <h3 style={{
              fontSize: MOBILE_OPTIMIZED.headerFontSize,
              fontWeight: 600,
              margin: 0,
              marginBottom: 16,
              color: COLORS.github.green,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              🚀 Feature Impact
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 2, fontWeight: 700, color: COLORS.github.green }}>
                  {data.featureDeliveryImpact.featuresDelivered}
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Delivered
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 2, fontWeight: 700, color: COLORS.github.blue }}>
                  {data.featureDeliveryImpact.deliveryRate}%
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Success Rate
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 2, fontWeight: 700, color: COLORS.github.purple }}>
                  {data.featureDeliveryImpact.averageTimeToMarket}d
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Time to Market
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 2, fontWeight: 700, color: COLORS.github.teal }}>
                  {data.featureDeliveryImpact.qualityMetrics.customerSatisfaction}%
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Satisfaction
                </div>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2, fontWeight: 600, marginBottom: 12 }}>Top Performing Features</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.featureDeliveryImpact.businessValue
                  .sort((a, b) => b.roi - a.roi)
                  .slice(0, 3)
                  .map((feature, index) => (
                    <div key={index} style={{
                      padding: 8,
                      borderRadius: 6,
                      backgroundColor: theme === 'dark' ? COLORS.github.gray[700] : COLORS.github.gray[200],
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: MOBILE_OPTIMIZED.minFontSize - 4,
                          fontWeight: 600,
                          marginBottom: 2,
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                        }}>
                          {feature.featureName}
                        </div>
                        <div style={{
                          fontSize: MOBILE_OPTIMIZED.minFontSize - 6,
                          color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600],
                          display: 'flex',
                          gap: 8,
                        }}>
                          <span style={{ color: getImpactColor(feature.businessImpact) }}>
                            {feature.businessImpact} impact
                          </span>
                          <span>{feature.userAdoption}% adoption</span>
                        </div>
                      </div>
                      <div style={{
                        fontSize: MOBILE_OPTIMIZED.minFontSize - 2,
                        fontWeight: 700,
                        color: getROIColor(feature.roi),
                        textAlign: 'right',
                      }}>
                        {formatPercentage(feature.roi)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Row - Community & ROI Projections */}
      <div style={{
        display: 'flex',
        gap: MOBILE_OPTIMIZED.margin,
        flex: 1,
        transform: `translateY(${interpolate(chartsAnimation, [0, 1], [20, 0])}px)`,
        opacity: chartsAnimation,
      }}>
        {/* Community & Adoption */}
        {showCommunityMetrics && (
          <div style={{
            width: sectionWidth * 1.5,
            height: sectionHeight,
            backgroundColor: theme === 'dark' ? COLORS.github.gray[800] : COLORS.github.gray[100],
            borderRadius: MOBILE_OPTIMIZED.borderRadius,
            padding: MOBILE_OPTIMIZED.padding,
            border: highlightSection === 'community' ? `3px solid ${COLORS.github.teal}` : 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <h3 style={{
              fontSize: MOBILE_OPTIMIZED.headerFontSize,
              fontWeight: 600,
              margin: 0,
              marginBottom: 16,
              color: COLORS.github.teal,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              🌍 Community Value
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 4, fontWeight: 700, color: COLORS.github.yellow }}>
                  {data.communityEngagement.repositoryMetrics.stars}
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Stars
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 8, color: data.communityEngagement.repositoryMetrics.starGrowthRate > 0 ? COLORS.github.green : COLORS.github.red }}>
                  {formatPercentage(data.communityEngagement.repositoryMetrics.starGrowthRate)}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 4, fontWeight: 700, color: COLORS.github.blue }}>
                  {data.communityEngagement.repositoryMetrics.forks}
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Forks
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 8, color: data.communityEngagement.repositoryMetrics.forkGrowthRate > 0 ? COLORS.github.green : COLORS.github.red }}>
                  {formatPercentage(data.communityEngagement.repositoryMetrics.forkGrowthRate)}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 4, fontWeight: 700, color: COLORS.github.green }}>
                  {data.communityEngagement.contributorMetrics.activeContributors}
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Contributors
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 8, color: COLORS.github.green }}>
                  {data.communityEngagement.contributorMetrics.retentionRate}% retention
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 4, fontWeight: 700, color: COLORS.github.purple }}>
                  {data.communityEngagement.communityHealth.communityScore}
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Health Score
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1 }}>
              <div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2, fontWeight: 600, marginBottom: 8 }}>Adoption Metrics</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: MOBILE_OPTIMIZED.minFontSize - 4 }}>
                    <span>Enterprise Users</span>
                    <span>{data.communityEngagement.adoption.enterpriseAdoption}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: MOBILE_OPTIMIZED.minFontSize - 4 }}>
                    <span>Individual Users</span>
                    <span>{data.communityEngagement.adoption.individualAdoption}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: MOBILE_OPTIMIZED.minFontSize - 4 }}>
                    <span>Downloads</span>
                    <span>{data.communityEngagement.repositoryMetrics.downloads}</span>
                  </div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2, fontWeight: 600, marginBottom: 8 }}>Community Health</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: MOBILE_OPTIMIZED.minFontSize - 4 }}>
                    <span>Response Time</span>
                    <span>{Math.round(data.communityEngagement.communityHealth.issueResponseTime)}h</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: MOBILE_OPTIMIZED.minFontSize - 4 }}>
                    <span>Documentation</span>
                    <span>{data.communityEngagement.communityHealth.documentationQuality}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: MOBILE_OPTIMIZED.minFontSize - 4 }}>
                    <span>Onboarding</span>
                    <span>{data.communityEngagement.communityHealth.onboardingEffectiveness}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ROI Projections & Recommendations */}
        {showCostBenefit && (
          <div style={{
            width: sectionWidth * 1.5,
            height: sectionHeight,
            backgroundColor: theme === 'dark' ? COLORS.github.gray[800] : COLORS.github.gray[100],
            borderRadius: MOBILE_OPTIMIZED.borderRadius,
            padding: MOBILE_OPTIMIZED.padding,
            border: highlightSection === 'roi' ? `3px solid ${COLORS.github.orange}` : 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <h3 style={{
              fontSize: MOBILE_OPTIMIZED.headerFontSize,
              fontWeight: 600,
              margin: 0,
              marginBottom: 16,
              color: COLORS.github.orange,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              📊 ROI Projections
            </h3>

            <div style={{ flex: 1, marginBottom: 16 }}>
              <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2, fontWeight: 600, marginBottom: 8 }}>Quarterly ROI Forecast</div>
              <LineChart
                data={data.costBenefitAnalysis.projections.map(p => ({
                  label: p.quarter,
                  value: p.projectedROI,
                }))}
                color={COLORS.github.orange}
                height={80}
              />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2, fontWeight: 600, marginBottom: 12 }}>
                Strategic Recommendations
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.recommendations
                  .filter(r => r.priority === 'immediate' || r.priority === 'high')
                  .slice(0, 3)
                  .map((rec, index) => (
                    <div key={index} style={{
                      padding: 10,
                      borderRadius: 8,
                      backgroundColor: theme === 'dark' ? COLORS.github.gray[700] : COLORS.github.gray[200],
                      borderLeft: `4px solid ${rec.priority === 'immediate' ? COLORS.github.red : COLORS.github.orange}`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, fontWeight: 600, flex: 1 }}>
                          {rec.title}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: COLORS.github.green, fontWeight: 600 }}>
                            +{formatPercentage(rec.expectedROIImprovement)}
                          </div>
                          <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 8, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                            {formatCurrency(rec.implementationCost)}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                        {rec.timeframe} • {rec.category}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};