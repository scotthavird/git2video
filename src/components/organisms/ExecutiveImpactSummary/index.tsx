import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ExecutiveImpactSummaryProps } from './types';

// GitHub-inspired color palette for leadership presentation
const COLORS = {
  github: {
    dark: '#24292f',
    light: '#f6f8fa',
    blue: '#0969da',
    green: '#1f883d',
    red: '#cf222e',
    orange: '#fb8500',
    purple: '#8250df',
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
  minFontSize: 28,
  headerFontSize: 42,
  titleFontSize: 56,
  padding: 24,
  margin: 20,
  borderRadius: 12,
  iconSize: 32,
  avatarSize: 48,
};

export const ExecutiveImpactSummary: React.FC<ExecutiveImpactSummaryProps> = ({
  data,
  animationDelay = 0,
  showHealthScore = true,
  showTrends = true,
  showTeamMetrics = true,
  showKPIs = true,
  highlightMetric = null,
  theme = 'github'
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Animation timings optimized for mobile viewing
  const titleAnimation = spring({
    frame: frame - animationDelay * fps,
    fps,
    config: { damping: 0.7, stiffness: 120, mass: 0.8 }
  });

  const metricsAnimation = spring({
    frame: frame - (animationDelay + 0.5) * fps,
    fps,
    config: { damping: 0.6, stiffness: 100, mass: 0.6 }
  });

  const trendsAnimation = spring({
    frame: frame - (animationDelay + 1.0) * fps,
    fps,
    config: { damping: 0.6, stiffness: 100, mass: 0.6 }
  });

  const kpiAnimation = spring({
    frame: frame - (animationDelay + 1.5) * fps,
    fps,
    config: { damping: 0.6, stiffness: 100, mass: 0.6 }
  });

  // Mobile-responsive layout calculations
  const containerPadding = Math.max(MOBILE_OPTIMIZED.padding, width * 0.02);
  const sectionWidth = (width - containerPadding * 3) / 2;
  const sectionHeight = (height - containerPadding * 4 - 120) / 2;

  // Utility functions for formatting
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable'): string => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable'): string => {
    switch (trend) {
      case 'up': return COLORS.github.green;
      case 'down': return COLORS.github.red;
      default: return COLORS.github.gray[500];
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return COLORS.github.green;
    if (score >= 60) return COLORS.github.blue;
    if (score >= 40) return COLORS.github.orange;
    return COLORS.github.red;
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
      {/* Header Section */}
      <div style={{
        transform: `translateY(${interpolate(titleAnimation, [0, 1], [50, 0])}px)`,
        opacity: titleAnimation,
        marginBottom: MOBILE_OPTIMIZED.margin * 1.5,
      }}>
        <h1 style={{
          fontSize: MOBILE_OPTIMIZED.titleFontSize,
          fontWeight: 700,
          margin: 0,
          marginBottom: 12,
          color: COLORS.github.blue,
        }}>
          {data.repositoryName}
        </h1>
        <p style={{
          fontSize: MOBILE_OPTIMIZED.minFontSize,
          color: theme === 'dark' ? COLORS.github.gray[300] : COLORS.github.gray[600],
          margin: 0,
          marginBottom: 8,
          lineHeight: 1.4,
        }}>
          {data.repositoryDescription}
        </p>
        <p style={{
          fontSize: MOBILE_OPTIMIZED.minFontSize - 4,
          color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[500],
          margin: 0,
          fontWeight: 500,
        }}>
          {data.timeframe.period} • Executive Summary
        </p>
      </div>

      {/* Main Dashboard Grid */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: MOBILE_OPTIMIZED.margin,
        flex: 1,
      }}>
        {/* Repository Health Metrics */}
        {showHealthScore && (
          <div style={{
            width: sectionWidth,
            height: sectionHeight,
            backgroundColor: theme === 'dark' ? COLORS.github.gray[800] : COLORS.github.gray[100],
            borderRadius: MOBILE_OPTIMIZED.borderRadius,
            padding: MOBILE_OPTIMIZED.padding,
            border: highlightMetric === 'health' ? `3px solid ${COLORS.github.blue}` : 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transform: `scale(${metricsAnimation}) translateY(${interpolate(metricsAnimation, [0, 1], [30, 0])}px)`,
            opacity: metricsAnimation,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <div>
              <h2 style={{
                fontSize: MOBILE_OPTIMIZED.headerFontSize,
                fontWeight: 600,
                margin: 0,
                marginBottom: 16,
                color: COLORS.github.blue,
              }}>
                Repository Health
              </h2>
              
              {/* Health Score Circle */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 20,
              }}>
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  border: `6px solid ${getScoreColor(data.healthMetrics.healthScore)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 20,
                  background: `conic-gradient(${getScoreColor(data.healthMetrics.healthScore)} ${data.healthMetrics.healthScore * 3.6}deg, ${theme === 'dark' ? COLORS.github.gray[700] : COLORS.github.gray[200]} 0deg)`,
                }}>
                  <span style={{
                    fontSize: MOBILE_OPTIMIZED.minFontSize + 4,
                    fontWeight: 700,
                    color: getScoreColor(data.healthMetrics.healthScore),
                  }}>
                    {data.healthMetrics.healthScore}
                  </span>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: MOBILE_OPTIMIZED.minFontSize - 2, color: theme === 'dark' ? COLORS.github.gray[300] : COLORS.github.gray[600] }}>Health Score</p>
                  <p style={{ margin: 0, fontSize: MOBILE_OPTIMIZED.minFontSize + 6, fontWeight: 700 }}>{data.healthMetrics.healthScore}/100</p>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 8, fontWeight: 700, color: COLORS.github.blue }}>⭐</div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize + 2, fontWeight: 600 }}>{formatNumber(data.healthMetrics.stars)}</div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>Stars</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 8, fontWeight: 700, color: COLORS.github.green }}>👥</div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize + 2, fontWeight: 600 }}>{formatNumber(data.healthMetrics.contributors)}</div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>Contributors</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 8, fontWeight: 700, color: COLORS.github.purple }}>🔀</div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize + 2, fontWeight: 600 }}>{formatNumber(data.healthMetrics.totalPullRequests)}</div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>Pull Requests</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 8, fontWeight: 700, color: COLORS.github.orange }}>📋</div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize + 2, fontWeight: 600 }}>{formatNumber(data.healthMetrics.totalIssues)}</div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>Issues</div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Trends */}
        {showTrends && (
          <div style={{
            width: sectionWidth,
            height: sectionHeight,
            backgroundColor: theme === 'dark' ? COLORS.github.gray[800] : COLORS.github.gray[100],
            borderRadius: MOBILE_OPTIMIZED.borderRadius,
            padding: MOBILE_OPTIMIZED.padding,
            border: highlightMetric === 'activity' ? `3px solid ${COLORS.github.green}` : 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transform: `scale(${trendsAnimation}) translateY(${interpolate(trendsAnimation, [0, 1], [30, 0])}px)`,
            opacity: trendsAnimation,
            display: 'flex',
            flexDirection: 'column',
          }}>
            <h2 style={{
              fontSize: MOBILE_OPTIMIZED.headerFontSize,
              fontWeight: 600,
              margin: 0,
              marginBottom: 24,
              color: COLORS.github.green,
            }}>
              Activity Trends
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1, justifyContent: 'space-around' }}>
              {/* Commits Trend */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize + 2, fontWeight: 600 }}>Commits</div>
                  <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>This week: {data.activityTrends.commitTrend.thisWeek}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize, color: getTrendColor(data.activityTrends.commitTrend.trend) }}>
                    {getTrendIcon(data.activityTrends.commitTrend.trend)}
                  </span>
                  <span style={{ 
                    fontSize: MOBILE_OPTIMIZED.minFontSize, 
                    fontWeight: 600, 
                    color: getTrendColor(data.activityTrends.commitTrend.trend) 
                  }}>
                    {Math.abs(data.activityTrends.commitTrend.percentChange)}%
                  </span>
                </div>
              </div>

              {/* PRs Trend */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize + 2, fontWeight: 600 }}>Pull Requests</div>
                  <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>This week: {data.activityTrends.prTrend.thisWeek}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize, color: getTrendColor(data.activityTrends.prTrend.trend) }}>
                    {getTrendIcon(data.activityTrends.prTrend.trend)}
                  </span>
                  <span style={{ 
                    fontSize: MOBILE_OPTIMIZED.minFontSize, 
                    fontWeight: 600, 
                    color: getTrendColor(data.activityTrends.prTrend.trend) 
                  }}>
                    {Math.abs(data.activityTrends.prTrend.percentChange)}%
                  </span>
                </div>
              </div>

              {/* Issues Trend */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize + 2, fontWeight: 600 }}>Issues Resolved</div>
                  <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>This week: {data.activityTrends.issueTrend.thisWeek}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize, color: getTrendColor(data.activityTrends.issueTrend.trend) }}>
                    {getTrendIcon(data.activityTrends.issueTrend.trend)}
                  </span>
                  <span style={{ 
                    fontSize: MOBILE_OPTIMIZED.minFontSize, 
                    fontWeight: 600, 
                    color: getTrendColor(data.activityTrends.issueTrend.trend) 
                  }}>
                    {Math.abs(data.activityTrends.issueTrend.percentChange)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team Metrics */}
        {showTeamMetrics && (
          <div style={{
            width: sectionWidth,
            height: sectionHeight,
            backgroundColor: theme === 'dark' ? COLORS.github.gray[800] : COLORS.github.gray[100],
            borderRadius: MOBILE_OPTIMIZED.borderRadius,
            padding: MOBILE_OPTIMIZED.padding,
            border: highlightMetric === 'team' ? `3px solid ${COLORS.github.purple}` : 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transform: `scale(${kpiAnimation}) translateY(${interpolate(kpiAnimation, [0, 1], [30, 0])}px)`,
            opacity: kpiAnimation,
            display: 'flex',
            flexDirection: 'column',
          }}>
            <h2 style={{
              fontSize: MOBILE_OPTIMIZED.headerFontSize,
              fontWeight: 600,
              margin: 0,
              marginBottom: 24,
              color: COLORS.github.purple,
            }}>
              Team Performance
            </h2>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize, fontWeight: 700, color: COLORS.github.purple }}>
                  {data.teamMetrics.totalMembers}
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Total Members
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize, fontWeight: 700, color: COLORS.github.green }}>
                  {data.teamMetrics.activeMembers}
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Active
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize, fontWeight: 700, color: COLORS.github.blue }}>
                  +{data.teamMetrics.newMembersThisMonth}
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  New
                </div>
              </div>
            </div>

            {/* Top Contributors */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize, fontWeight: 600, marginBottom: 12 }}>Top Contributors</div>
              {data.teamMetrics.topContributors.slice(0, 3).map((contributor, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 12,
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: theme === 'dark' ? COLORS.github.gray[700] : COLORS.github.gray[200],
                }}>
                  <div style={{
                    width: MOBILE_OPTIMIZED.avatarSize,
                    height: MOBILE_OPTIMIZED.avatarSize,
                    borderRadius: '50%',
                    backgroundColor: COLORS.github.blue,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: MOBILE_OPTIMIZED.minFontSize,
                    fontWeight: 700,
                    color: 'white',
                  }}>
                    {contributor.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2, fontWeight: 600 }}>{contributor.name}</div>
                    <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                      {contributor.contributions} contributions • {contributor.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Performance Indicators */}
        {showKPIs && (
          <div style={{
            width: sectionWidth,
            height: sectionHeight,
            backgroundColor: theme === 'dark' ? COLORS.github.gray[800] : COLORS.github.gray[100],
            borderRadius: MOBILE_OPTIMIZED.borderRadius,
            padding: MOBILE_OPTIMIZED.padding,
            border: highlightMetric === 'kpis' ? `3px solid ${COLORS.github.orange}` : 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transform: `scale(${kpiAnimation}) translateY(${interpolate(kpiAnimation, [0, 1], [30, 0])}px)`,
            opacity: kpiAnimation,
            display: 'flex',
            flexDirection: 'column',
          }}>
            <h2 style={{
              fontSize: MOBILE_OPTIMIZED.headerFontSize,
              fontWeight: 600,
              margin: 0,
              marginBottom: 24,
              color: COLORS.github.orange,
            }}>
              Key Performance Indicators
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1 }}>
              {/* Code Quality */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ 
                  fontSize: MOBILE_OPTIMIZED.headerFontSize + 8, 
                  fontWeight: 700, 
                  color: getScoreColor(data.kpis.codeQualityScore),
                  marginBottom: 4,
                }}>
                  {data.kpis.codeQualityScore}
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600], textAlign: 'center' }}>
                  Code Quality
                </div>
              </div>

              {/* Delivery Velocity */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ 
                  fontSize: MOBILE_OPTIMIZED.headerFontSize + 8, 
                  fontWeight: 700, 
                  color: COLORS.github.green,
                  marginBottom: 4,
                }}>
                  {data.kpis.deliveryVelocity}
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600], textAlign: 'center' }}>
                  Velocity
                </div>
              </div>

              {/* Customer Satisfaction */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ 
                  fontSize: MOBILE_OPTIMIZED.headerFontSize + 8, 
                  fontWeight: 700, 
                  color: getScoreColor(data.kpis.customerSatisfaction),
                  marginBottom: 4,
                }}>
                  {data.kpis.customerSatisfaction}%
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600], textAlign: 'center' }}>
                  Satisfaction
                </div>
              </div>

              {/* Security Score */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ 
                  fontSize: MOBILE_OPTIMIZED.headerFontSize + 8, 
                  fontWeight: 700, 
                  color: getScoreColor(data.kpis.securityScore),
                  marginBottom: 4,
                }}>
                  {data.kpis.securityScore}%
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600], textAlign: 'center' }}>
                  Security
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};