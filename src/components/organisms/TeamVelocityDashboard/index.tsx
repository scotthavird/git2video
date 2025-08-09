import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { TeamVelocityDashboardProps } from './types';

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
  headerFontSize: 36,
  titleFontSize: 48,
  padding: 20,
  margin: 16,
  borderRadius: 12,
  iconSize: 28,
};

export const TeamVelocityDashboard: React.FC<TeamVelocityDashboardProps> = ({
  data,
  animationDelay = 0,
  showCommitMetrics = true,
  showPRMetrics = true,
  showIssueMetrics = true,
  showCollaboration = true,
  showTrends = true,
  highlightSection = null,
  theme = 'github',
  timeRange = '30d'
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Animation timings
  const titleAnimation = spring({
    frame: frame - animationDelay * fps,
    fps,
    config: { damping: 0.7, stiffness: 120, mass: 0.8 }
  });

  const sectionsAnimation = spring({
    frame: frame - (animationDelay + 0.3) * fps,
    fps,
    config: { damping: 0.6, stiffness: 100, mass: 0.6 }
  });

  const chartsAnimation = spring({
    frame: frame - (animationDelay + 0.8) * fps,
    fps,
    config: { damping: 0.6, stiffness: 100, mass: 0.6 }
  });

  // Layout calculations
  const containerPadding = Math.max(MOBILE_OPTIMIZED.padding, width * 0.015);
  const sectionWidth = (width - containerPadding * 4) / 3;
  const sectionHeight = (height - containerPadding * 3 - 100) / 2;

  // Utility functions
  const formatDuration = (hours: number): string => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${Math.round(hours)}h`;
    return `${Math.round(hours / 24)}d`;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return COLORS.github.green;
    if (score >= 60) return COLORS.github.blue;
    if (score >= 40) return COLORS.github.orange;
    return COLORS.github.red;
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable' | 'improving' | 'declining'): string => {
    if (trend === 'up' || trend === 'improving') return COLORS.github.green;
    if (trend === 'down' || trend === 'declining') return COLORS.github.red;
    return COLORS.github.gray[500];
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable' | 'improving' | 'declining'): string => {
    if (trend === 'up' || trend === 'improving') return '📈';
    if (trend === 'down' || trend === 'declining') return '📉';
    return '📊';
  };

  // Simple bar chart component
  const MiniBarChart: React.FC<{ data: Array<{ value: number; label: string }>; maxValue: number; color: string }> = ({ data, maxValue, color }) => (
    <div style={{ display: 'flex', alignItems: 'end', gap: 4, height: 60, justifyContent: 'space-between' }}>
      {data.map((item, index) => (
        <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
          <div style={{
            width: '100%',
            maxWidth: 20,
            height: Math.max(4, (item.value / maxValue) * 50),
            backgroundColor: color,
            borderRadius: 2,
            transform: `scaleY(${chartsAnimation})`,
            transformOrigin: 'bottom',
          }} />
          <span style={{ fontSize: 10, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600], marginTop: 4 }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );

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
        marginBottom: MOBILE_OPTIMIZED.margin * 1.5,
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
            color: COLORS.github.blue,
          }}>
            Team Velocity Dashboard
          </h1>
          <p style={{
            fontSize: MOBILE_OPTIMIZED.minFontSize,
            color: theme === 'dark' ? COLORS.github.gray[300] : COLORS.github.gray[600],
            margin: 0,
          }}>
            {data.teamName} • {data.reportingPeriod.periodLabel}
          </p>
        </div>
        <div style={{
          backgroundColor: getScoreColor(data.overallVelocityScore),
          color: 'white',
          padding: '12px 20px',
          borderRadius: MOBILE_OPTIMIZED.borderRadius,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize, fontWeight: 700 }}>
            {data.overallVelocityScore}
          </div>
          <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 8 }}>Velocity Score</div>
        </div>
      </div>

      {/* Top Row - Commit & PR Metrics */}
      <div style={{
        display: 'flex',
        gap: MOBILE_OPTIMIZED.margin,
        marginBottom: MOBILE_OPTIMIZED.margin,
        transform: `translateY(${interpolate(sectionsAnimation, [0, 1], [20, 0])}px)`,
        opacity: sectionsAnimation,
      }}>
        {/* Commit Metrics */}
        {showCommitMetrics && (
          <div style={{
            width: sectionWidth,
            height: sectionHeight,
            backgroundColor: theme === 'dark' ? COLORS.github.gray[800] : COLORS.github.gray[100],
            borderRadius: MOBILE_OPTIMIZED.borderRadius,
            padding: MOBILE_OPTIMIZED.padding,
            border: highlightSection === 'commits' ? `3px solid ${COLORS.github.green}` : 'none',
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
              💻 Commit Activity
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize, fontWeight: 700, color: COLORS.github.green }}>
                  {data.commitMetrics.totalCommitsThisWeek}
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  This Week
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize, fontWeight: 700, color: COLORS.github.blue }}>
                  {data.commitMetrics.averageCommitsPerDay.toFixed(1)}
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Avg/Day
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize, fontWeight: 700, color: getScoreColor(data.commitMetrics.commitQualityScore) }}>
                  {data.commitMetrics.commitQualityScore}%
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Quality
                </div>
              </div>
            </div>

            {/* Commit frequency chart */}
            <div style={{ flex: 1 }}>
              <MiniBarChart 
                data={data.commitMetrics.dailyCommits.slice(-7).map(d => ({ 
                  value: d.count, 
                  label: d.weekday.slice(0, 3) 
                }))}
                maxValue={Math.max(...data.commitMetrics.dailyCommits.map(d => d.count))}
                color={COLORS.github.green}
              />
            </div>

            <div style={{
              marginTop: 12,
              padding: 8,
              borderRadius: 6,
              backgroundColor: theme === 'dark' ? COLORS.github.gray[700] : COLORS.github.gray[200],
              fontSize: MOBILE_OPTIMIZED.minFontSize - 4,
              color: theme === 'dark' ? COLORS.github.gray[300] : COLORS.github.gray[600],
            }}>
              Peak activity: {data.commitMetrics.peakCommitHour}:00 • {data.commitMetrics.commitFrequency} frequency
            </div>
          </div>
        )}

        {/* Pull Request Metrics */}
        {showPRMetrics && (
          <div style={{
            width: sectionWidth,
            height: sectionHeight,
            backgroundColor: theme === 'dark' ? COLORS.github.gray[800] : COLORS.github.gray[100],
            borderRadius: MOBILE_OPTIMIZED.borderRadius,
            padding: MOBILE_OPTIMIZED.padding,
            border: highlightSection === 'prs' ? `3px solid ${COLORS.github.purple}` : 'none',
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
              🔀 Pull Requests
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 4, fontWeight: 700, color: COLORS.github.green }}>
                  {data.pullRequestMetrics.totalPRsMerged}
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Merged
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 4, fontWeight: 700, color: COLORS.github.red }}>
                  {data.pullRequestMetrics.totalPRsRejected}
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Rejected
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 4, fontWeight: 700, color: COLORS.github.blue }}>
                  {formatDuration(data.pullRequestMetrics.averageReviewTime)}
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Review Time
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 4, fontWeight: 700, color: COLORS.github.orange }}>
                  {data.pullRequestMetrics.mergeRate}%
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Merge Rate
                </div>
              </div>
            </div>

            {/* PR Size Metrics */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ 
                backgroundColor: theme === 'dark' ? COLORS.github.gray[700] : COLORS.github.gray[200], 
                borderRadius: 8, 
                padding: 12 
              }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2, fontWeight: 600, marginBottom: 8 }}>Average PR Size</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: MOBILE_OPTIMIZED.minFontSize - 4 }}>
                  <span style={{ color: COLORS.github.green }}>+{data.pullRequestMetrics.averagePRSize.linesAdded}</span>
                  <span style={{ color: COLORS.github.red }}>-{data.pullRequestMetrics.averagePRSize.linesDeleted}</span>
                  <span>{data.pullRequestMetrics.averagePRSize.filesChanged} files</span>
                </div>
              </div>
              
              <div style={{
                marginTop: 12,
                fontSize: MOBILE_OPTIMIZED.minFontSize - 2,
                color: getScoreColor(data.pullRequestMetrics.reviewEfficiency),
                fontWeight: 600,
                textAlign: 'center',
              }}>
                Review Efficiency: {data.pullRequestMetrics.reviewEfficiency}%
              </div>
            </div>
          </div>
        )}

        {/* Issue Resolution Metrics */}
        {showIssueMetrics && (
          <div style={{
            width: sectionWidth,
            height: sectionHeight,
            backgroundColor: theme === 'dark' ? COLORS.github.gray[800] : COLORS.github.gray[100],
            borderRadius: MOBILE_OPTIMIZED.borderRadius,
            padding: MOBILE_OPTIMIZED.padding,
            border: highlightSection === 'issues' ? `3px solid ${COLORS.github.orange}` : 'none',
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
              🐛 Issue Resolution
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 2, fontWeight: 700, color: COLORS.github.green }}>
                  {data.issueResolutionMetrics.totalIssuesClosed}
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Resolved
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 2, fontWeight: 700, color: COLORS.github.red }}>
                  {data.issueResolutionMetrics.issueBacklog}
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Backlog
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 2, fontWeight: 700, color: COLORS.github.blue }}>
                  {data.issueResolutionMetrics.resolutionRate}%
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Resolution Rate
                </div>
              </div>
            </div>

            {/* Issues by Priority */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2, fontWeight: 600, marginBottom: 12 }}>Issues by Priority</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 6, borderRadius: 6, backgroundColor: theme === 'dark' ? COLORS.github.gray[700] : COLORS.github.gray[200] }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: COLORS.github.red }} />
                  <span style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4 }}>Critical: {data.issueResolutionMetrics.issuesByPriority.critical}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 6, borderRadius: 6, backgroundColor: theme === 'dark' ? COLORS.github.gray[700] : COLORS.github.gray[200] }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: COLORS.github.orange }} />
                  <span style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4 }}>High: {data.issueResolutionMetrics.issuesByPriority.high}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 6, borderRadius: 6, backgroundColor: theme === 'dark' ? COLORS.github.gray[700] : COLORS.github.gray[200] }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: COLORS.github.yellow }} />
                  <span style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4 }}>Medium: {data.issueResolutionMetrics.issuesByPriority.medium}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 6, borderRadius: 6, backgroundColor: theme === 'dark' ? COLORS.github.gray[700] : COLORS.github.gray[200] }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: COLORS.github.green }} />
                  <span style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4 }}>Low: {data.issueResolutionMetrics.issuesByPriority.low}</span>
                </div>
              </div>
              
              <div style={{
                marginTop: 12,
                textAlign: 'center',
                fontSize: MOBILE_OPTIMIZED.minFontSize - 2,
                color: theme === 'dark' ? COLORS.github.gray[300] : COLORS.github.gray[600],
              }}>
                Avg Resolution: {formatDuration(data.issueResolutionMetrics.averageResolutionTime)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Row - Collaboration & Trends */}
      <div style={{
        display: 'flex',
        gap: MOBILE_OPTIMIZED.margin,
        transform: `translateY(${interpolate(chartsAnimation, [0, 1], [20, 0])}px)`,
        opacity: chartsAnimation,
        flex: 1,
      }}>
        {/* Collaboration Metrics */}
        {showCollaboration && (
          <div style={{
            width: sectionWidth * 1.5,
            height: sectionHeight,
            backgroundColor: theme === 'dark' ? COLORS.github.gray[800] : COLORS.github.gray[100],
            borderRadius: MOBILE_OPTIMIZED.borderRadius,
            padding: MOBILE_OPTIMIZED.padding,
            border: highlightSection === 'collaboration' ? `3px solid ${COLORS.github.blue}` : 'none',
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
              🤝 Team Collaboration
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 2, fontWeight: 700, color: COLORS.github.blue }}>
                  {data.collaborationMetrics.activeDevelopers}
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Active Devs
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 2, fontWeight: 700, color: COLORS.github.green }}>
                  {data.collaborationMetrics.codeReviewParticipation}%
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Review Rate
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 2, fontWeight: 700, color: getScoreColor(data.collaborationMetrics.collaborationScore) }}>
                  {data.collaborationMetrics.collaborationScore}%
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Collab Score
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1 }}>
              <div style={{ backgroundColor: theme === 'dark' ? COLORS.github.gray[700] : COLORS.github.gray[200], borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2, fontWeight: 600, marginBottom: 8 }}>Knowledge Sharing</div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, color: theme === 'dark' ? COLORS.github.gray[300] : COLORS.github.gray[600] }}>
                  Events: {data.collaborationMetrics.knowledgeSharingEvents}
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, color: theme === 'dark' ? COLORS.github.gray[300] : COLORS.github.gray[600] }}>
                  Mentoring: {data.collaborationMetrics.mentorshipActivities}
                </div>
              </div>
              <div style={{ backgroundColor: theme === 'dark' ? COLORS.github.gray[700] : COLORS.github.gray[200], borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2, fontWeight: 600, marginBottom: 8 }}>Pair Programming</div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, color: theme === 'dark' ? COLORS.github.gray[300] : COLORS.github.gray[600] }}>
                  Sessions: {data.collaborationMetrics.pairProgrammingSessions}
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, color: theme === 'dark' ? COLORS.github.gray[300] : COLORS.github.gray[600] }}>
                  Cross-team: {data.collaborationMetrics.crossTeamContributions}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Velocity Trends */}
        {showTrends && (
          <div style={{
            width: sectionWidth * 1.5,
            height: sectionHeight,
            backgroundColor: theme === 'dark' ? COLORS.github.gray[800] : COLORS.github.gray[100],
            borderRadius: MOBILE_OPTIMIZED.borderRadius,
            padding: MOBILE_OPTIMIZED.padding,
            border: highlightSection === 'trends' ? `3px solid ${COLORS.github.purple}` : 'none',
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
              📊 Velocity Trends
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize + 4, marginBottom: 4 }}>
                  {getTrendIcon(data.velocityTrends.productivityTrend)}
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2, fontWeight: 600, color: getTrendColor(data.velocityTrends.productivityTrend) }}>
                  Productivity
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  {data.velocityTrends.productivityTrend}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize + 4, marginBottom: 4 }}>
                  {getTrendIcon(data.velocityTrends.qualityTrend)}
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2, fontWeight: 600, color: getTrendColor(data.velocityTrends.qualityTrend) }}>
                  Quality
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  {data.velocityTrends.qualityTrend}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize + 4, marginBottom: 4 }}>
                  {getTrendIcon(data.velocityTrends.burndownTrend)}
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2, fontWeight: 600, color: getTrendColor(data.velocityTrends.burndownTrend) }}>
                  Burndown
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  {data.velocityTrends.burndownTrend}
                </div>
              </div>
            </div>

            {/* Sprint Velocity Chart */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2, fontWeight: 600, marginBottom: 12 }}>Sprint Velocity</div>
              <MiniBarChart 
                data={data.velocityTrends.sprintVelocity.slice(-6).map(s => ({ 
                  value: s.storyPointsCompleted, 
                  label: `S${s.sprintNumber}` 
                }))}
                maxValue={Math.max(...data.velocityTrends.sprintVelocity.map(s => s.storyPointsCompleted))}
                color={COLORS.github.purple}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};