import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { StrategicMilestonesProps, Milestone } from './types';

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
  headerFontSize: 32,
  titleFontSize: 44,
  padding: 18,
  margin: 16,
  borderRadius: 10,
  timelineHeight: 6,
  milestoneSize: 16,
};

export const StrategicMilestones: React.FC<StrategicMilestonesProps> = ({
  data,
  animationDelay = 0,
  showTimeline = true,
  showProgress = true,
  showMetrics = true,
  showUpcoming = true,
  timeframeMonths = 12,
  highlightMilestone = null,
  theme = 'github',
  viewMode = 'executive'
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Animation timings
  const titleAnimation = spring({
    frame: frame - animationDelay * fps,
    fps,
    config: { damping: 0.7, stiffness: 120, mass: 0.8 }
  });

  const timelineAnimation = spring({
    frame: frame - (animationDelay + 0.5) * fps,
    fps,
    config: { damping: 0.6, stiffness: 100, mass: 0.6 }
  });

  const milestonesAnimation = spring({
    frame: frame - (animationDelay + 1.0) * fps,
    fps,
    config: { damping: 0.6, stiffness: 100, mass: 0.6 }
  });

  const metricsAnimation = spring({
    frame: frame - (animationDelay + 1.5) * fps,
    fps,
    config: { damping: 0.6, stiffness: 100, mass: 0.6 }
  });

  // Layout calculations
  const containerPadding = Math.max(MOBILE_OPTIMIZED.padding, width * 0.015);

  // Utility functions
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return COLORS.github.green;
      case 'in_progress': return COLORS.github.blue;
      case 'delayed': return COLORS.github.red;
      case 'cancelled': return COLORS.github.gray[500];
      default: return COLORS.github.gray[400];
    }
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'major_release': return '🚀';
      case 'feature_launch': return '✨';
      case 'project_phase': return '📋';
      case 'business_goal': return '🎯';
      case 'technical_milestone': return '⚙️';
      default: return '📌';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'critical': return COLORS.github.red;
      case 'high': return COLORS.github.orange;
      case 'medium': return COLORS.github.blue;
      default: return COLORS.github.gray[500];
    }
  };

  const getRiskColor = (risk: string): string => {
    switch (risk) {
      case 'critical': return COLORS.github.red;
      case 'high': return COLORS.github.orange;
      case 'medium': return COLORS.github.yellow;
      default: return COLORS.github.green;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getDaysUntilDue = (dueDateString: string, currentDateString: string): number => {
    const dueDate = new Date(dueDateString);
    const currentDate = new Date(currentDateString);
    const diffTime = dueDate.getTime() - currentDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Filter and sort milestones for display
  const displayMilestones = data.milestones
    .filter(m => m.status !== 'cancelled')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, viewMode === 'compact' ? 4 : 6);

  // Calculate timeline positions
  const timelineStart = new Date(data.timeline.startDate);
  const timelineEnd = new Date(data.timeline.endDate);
  const timelineRange = timelineEnd.getTime() - timelineStart.getTime();
  const currentProgress = (new Date(data.timeline.currentDate).getTime() - timelineStart.getTime()) / timelineRange;

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
      }}>
        <h1 style={{
          fontSize: MOBILE_OPTIMIZED.titleFontSize,
          fontWeight: 700,
          margin: 0,
          marginBottom: 8,
          color: COLORS.github.purple,
        }}>
          Strategic Milestones
        </h1>
        <p style={{
          fontSize: MOBILE_OPTIMIZED.minFontSize,
          color: theme === 'dark' ? COLORS.github.gray[300] : COLORS.github.gray[600],
          margin: 0,
          marginBottom: 4,
        }}>
          {data.projectName}
        </p>
        <p style={{
          fontSize: MOBILE_OPTIMIZED.minFontSize - 4,
          color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[500],
          margin: 0,
        }}>
          {formatDate(data.timeline.startDate)} - {formatDate(data.timeline.endDate)}
        </p>
      </div>

      {/* Progress Overview */}
      {showProgress && (
        <div style={{
          transform: `translateY(${interpolate(titleAnimation, [0, 1], [20, 0])}px)`,
          opacity: titleAnimation,
          marginBottom: MOBILE_OPTIMIZED.margin * 2,
          display: 'flex',
          gap: MOBILE_OPTIMIZED.margin,
        }}>
          <div style={{
            flex: 2,
            backgroundColor: theme === 'dark' ? COLORS.github.gray[800] : COLORS.github.gray[100],
            borderRadius: MOBILE_OPTIMIZED.borderRadius,
            padding: MOBILE_OPTIMIZED.padding,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <h3 style={{
              fontSize: MOBILE_OPTIMIZED.headerFontSize,
              fontWeight: 600,
              margin: 0,
              marginBottom: 16,
              color: COLORS.github.purple,
            }}>
              Overall Progress
            </h3>
            
            {/* Progress Bar */}
            <div style={{
              width: '100%',
              height: 12,
              backgroundColor: theme === 'dark' ? COLORS.github.gray[700] : COLORS.github.gray[200],
              borderRadius: 6,
              marginBottom: 16,
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${data.overallProgress.percentage * metricsAnimation}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${COLORS.github.green}, ${COLORS.github.blue})`,
                borderRadius: 6,
                transition: 'width 0.3s ease',
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 4, fontWeight: 700, color: COLORS.github.green }}>
                  {data.overallProgress.milestonesCompleted}
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Completed
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 4, fontWeight: 700, color: COLORS.github.blue }}>
                  {data.overallProgress.totalMilestones - data.overallProgress.milestonesCompleted}
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Remaining
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 4, fontWeight: 700, color: COLORS.github.orange }}>
                  {data.overallProgress.onTrackPercentage}%
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  On Track
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 4, fontWeight: 700, color: COLORS.github.red }}>
                  {data.overallProgress.delayedPercentage}%
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Delayed
                </div>
              </div>
            </div>
          </div>

          {showMetrics && (
            <div style={{
              flex: 1,
              backgroundColor: theme === 'dark' ? COLORS.github.gray[800] : COLORS.github.gray[100],
              borderRadius: MOBILE_OPTIMIZED.borderRadius,
              padding: MOBILE_OPTIMIZED.padding,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}>
              <h3 style={{
                fontSize: MOBILE_OPTIMIZED.headerFontSize,
                fontWeight: 600,
                margin: 0,
                marginBottom: 16,
                color: COLORS.github.blue,
              }}>
                Key Metrics
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2 }}>Velocity</span>
                  <span style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2, fontWeight: 600, color: COLORS.github.green }}>
                    {data.keyMetrics.averageVelocity}/quarter
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2 }}>Quality</span>
                  <span style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2, fontWeight: 600, color: getStatusColor(data.keyMetrics.qualityScore >= 80 ? 'completed' : 'in_progress') }}>
                    {data.keyMetrics.qualityScore}%
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2 }}>Budget</span>
                  <span style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2, fontWeight: 600, color: getRiskColor(data.keyMetrics.budgetUtilization > 90 ? 'high' : 'low') }}>
                    {data.keyMetrics.budgetUtilization}%
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2 }}>Risk Level</span>
                  <span style={{ 
                    fontSize: MOBILE_OPTIMIZED.minFontSize - 2, 
                    fontWeight: 600, 
                    color: getRiskColor(data.keyMetrics.riskLevel),
                    textTransform: 'uppercase',
                  }}>
                    {data.keyMetrics.riskLevel}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Timeline */}
      {showTimeline && (
        <div style={{
          transform: `translateY(${interpolate(timelineAnimation, [0, 1], [20, 0])}px)`,
          opacity: timelineAnimation,
          marginBottom: MOBILE_OPTIMIZED.margin * 2,
        }}>
          <h3 style={{
            fontSize: MOBILE_OPTIMIZED.headerFontSize,
            fontWeight: 600,
            marginBottom: 20,
            color: COLORS.github.purple,
          }}>
            Project Timeline
          </h3>

          <div style={{ position: 'relative', height: 80, marginBottom: 20 }}>
            {/* Timeline track */}
            <div style={{
              position: 'absolute',
              top: 40,
              left: 0,
              right: 0,
              height: MOBILE_OPTIMIZED.timelineHeight,
              backgroundColor: theme === 'dark' ? COLORS.github.gray[700] : COLORS.github.gray[200],
              borderRadius: MOBILE_OPTIMIZED.timelineHeight / 2,
            }} />
            
            {/* Progress indicator */}
            <div style={{
              position: 'absolute',
              top: 40,
              left: 0,
              width: `${currentProgress * 100 * timelineAnimation}%`,
              height: MOBILE_OPTIMIZED.timelineHeight,
              backgroundColor: COLORS.github.blue,
              borderRadius: MOBILE_OPTIMIZED.timelineHeight / 2,
            }} />

            {/* Current position indicator */}
            <div style={{
              position: 'absolute',
              top: 35,
              left: `${currentProgress * 100}%`,
              transform: 'translateX(-50%)',
              width: MOBILE_OPTIMIZED.milestoneSize,
              height: MOBILE_OPTIMIZED.milestoneSize,
              backgroundColor: COLORS.github.blue,
              borderRadius: '50%',
              border: `3px solid ${theme === 'dark' ? COLORS.github.dark : COLORS.github.light}`,
              opacity: timelineAnimation,
            }} />

            {/* Timeline labels */}
            <div style={{
              position: 'absolute',
              top: 60,
              left: 0,
              fontSize: MOBILE_OPTIMIZED.minFontSize - 6,
              color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600],
            }}>
              {formatDate(data.timeline.startDate)}
            </div>
            <div style={{
              position: 'absolute',
              top: 60,
              right: 0,
              fontSize: MOBILE_OPTIMIZED.minFontSize - 6,
              color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600],
            }}>
              {formatDate(data.timeline.endDate)}
            </div>
          </div>
        </div>
      )}

      {/* Milestones Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: viewMode === 'compact' ? '1fr 1fr' : '1fr 1fr 1fr',
        gap: MOBILE_OPTIMIZED.margin,
        flex: 1,
        transform: `translateY(${interpolate(milestonesAnimation, [0, 1], [20, 0])}px)`,
        opacity: milestonesAnimation,
      }}>
        {displayMilestones.map((milestone, index) => {
          const daysUntilDue = getDaysUntilDue(milestone.dueDate, data.timeline.currentDate);
          const isHighlighted = highlightMilestone === milestone.id;
          const staggerDelay = index * 0.1;
          const milestoneAnimation = spring({
            frame: frame - (animationDelay + 1.0 + staggerDelay) * fps,
            fps,
            config: { damping: 0.6, stiffness: 100, mass: 0.6 }
          });

          return (
            <div key={milestone.id} style={{
              backgroundColor: theme === 'dark' ? COLORS.github.gray[800] : COLORS.github.gray[100],
              borderRadius: MOBILE_OPTIMIZED.borderRadius,
              padding: MOBILE_OPTIMIZED.padding,
              border: isHighlighted ? `3px solid ${COLORS.github.purple}` : `1px solid ${theme === 'dark' ? COLORS.github.gray[700] : COLORS.github.gray[200]}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transform: `scale(${milestoneAnimation}) translateY(${interpolate(milestoneAnimation, [0, 1], [10, 0])}px)`,
              opacity: milestoneAnimation,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              minHeight: viewMode === 'compact' ? 200 : 240,
            }}>
              {/* Milestone Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{
                  fontSize: MOBILE_OPTIMIZED.minFontSize + 4,
                  marginRight: 8,
                  marginTop: 2,
                }}>
                  {getTypeIcon(milestone.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    fontSize: MOBILE_OPTIMIZED.minFontSize + 2,
                    fontWeight: 600,
                    margin: 0,
                    marginBottom: 4,
                    lineHeight: 1.3,
                    color: getStatusColor(milestone.status),
                  }}>
                    {milestone.title}
                  </h4>
                  <div style={{
                    fontSize: MOBILE_OPTIMIZED.minFontSize - 6,
                    color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600],
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    <span style={{ 
                      backgroundColor: getPriorityColor(milestone.priority),
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: 4,
                      fontSize: MOBILE_OPTIMIZED.minFontSize - 8,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}>
                      {milestone.priority}
                    </span>
                    <span>{formatDate(milestone.dueDate)}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{
                width: '100%',
                height: 6,
                backgroundColor: theme === 'dark' ? COLORS.github.gray[700] : COLORS.github.gray[200],
                borderRadius: 3,
                marginBottom: 12,
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${milestone.progress * milestoneAnimation}%`,
                  height: '100%',
                  backgroundColor: getStatusColor(milestone.status),
                  borderRadius: 3,
                }} />
              </div>

              {/* Milestone Description */}
              <p style={{
                fontSize: MOBILE_OPTIMIZED.minFontSize - 4,
                color: theme === 'dark' ? COLORS.github.gray[300] : COLORS.github.gray[600],
                lineHeight: 1.4,
                margin: 0,
                marginBottom: 12,
                flex: 1,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
              }}>
                {milestone.description}
              </p>

              {/* Deliverables */}
              {viewMode !== 'compact' && milestone.deliverables.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, fontWeight: 600, marginBottom: 6 }}>
                    Deliverables ({milestone.deliverables.filter(d => d.status === 'completed').length}/{milestone.deliverables.length})
                  </div>
                  {milestone.deliverables.slice(0, 2).map((deliverable, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: MOBILE_OPTIMIZED.minFontSize - 6,
                      marginBottom: 2,
                    }}>
                      <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: getStatusColor(deliverable.status),
                      }} />
                      <span>{deliverable.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 8,
                borderTop: `1px solid ${theme === 'dark' ? COLORS.github.gray[700] : COLORS.github.gray[200]}`,
                fontSize: MOBILE_OPTIMIZED.minFontSize - 6,
                color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600],
              }}>
                <span style={{
                  color: daysUntilDue < 0 ? COLORS.github.red : daysUntilDue < 7 ? COLORS.github.orange : getStatusColor(milestone.status),
                  fontWeight: 600,
                }}>
                  {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)}d overdue` : 
                   daysUntilDue === 0 ? 'Due today' : 
                   `${daysUntilDue}d remaining`}
                </span>
                <span>{milestone.progress}%</span>
              </div>
            </div>
          );
        })}

        {/* Upcoming Deadlines */}
        {showUpcoming && (
          <div style={{
            backgroundColor: theme === 'dark' ? COLORS.github.gray[800] : COLORS.github.gray[100],
            borderRadius: MOBILE_OPTIMIZED.borderRadius,
            padding: MOBILE_OPTIMIZED.padding,
            border: `2px dashed ${COLORS.github.orange}`,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: viewMode === 'compact' ? 200 : 240,
            transform: `scale(${metricsAnimation}) translateY(${interpolate(metricsAnimation, [0, 1], [10, 0])}px)`,
            opacity: metricsAnimation,
          }}>
            <h4 style={{
              fontSize: MOBILE_OPTIMIZED.minFontSize + 2,
              fontWeight: 600,
              margin: 0,
              marginBottom: 16,
              color: COLORS.github.orange,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              ⚠️ Upcoming Deadlines
            </h4>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.upcomingDeadlines.slice(0, 3).map((deadline, idx) => {
                const milestone = data.milestones.find(m => m.id === deadline.milestoneId);
                if (!milestone) return null;

                return (
                  <div key={idx} style={{
                    backgroundColor: theme === 'dark' ? COLORS.github.gray[700] : COLORS.github.gray[200],
                    borderRadius: 6,
                    padding: 10,
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
                        {milestone.title}
                      </div>
                      <div style={{
                        fontSize: MOBILE_OPTIMIZED.minFontSize - 6,
                        color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600],
                      }}>
                        {formatDate(milestone.dueDate)}
                      </div>
                    </div>
                    <div style={{
                      fontSize: MOBILE_OPTIMIZED.minFontSize - 4,
                      fontWeight: 700,
                      color: getRiskColor(deadline.riskLevel),
                      textAlign: 'right',
                    }}>
                      {deadline.daysUntilDue}d
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};