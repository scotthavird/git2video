import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { RiskAndQualityMetricsProps } from './types';

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
};

export const RiskAndQualityMetrics: React.FC<RiskAndQualityMetricsProps> = ({
  data,
  animationDelay = 0,
  showCodeReview = true,
  showIssueCategories = true,
  showSecurity = true,
  showTechnicalDebt = true,
  showTrends = true,
  highlightSection = null,
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

  const scoresAnimation = spring({
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
  const sectionHeight = (height - containerPadding * 3 - 140) / 2;

  // Utility functions
  const getScoreColor = (score: number, inverted: boolean = false): string => {
    const thresholds = inverted ? 
      { excellent: 20, good: 40, fair: 70 } : 
      { excellent: 80, good: 60, fair: 40 };
    
    if (inverted) {
      if (score <= thresholds.excellent) return COLORS.github.green;
      if (score <= thresholds.good) return COLORS.github.blue;
      if (score <= thresholds.fair) return COLORS.github.orange;
      return COLORS.github.red;
    } else {
      if (score >= thresholds.excellent) return COLORS.github.green;
      if (score >= thresholds.good) return COLORS.github.blue;
      if (score >= thresholds.fair) return COLORS.github.orange;
      return COLORS.github.red;
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return COLORS.github.red;
      case 'high': return COLORS.github.orange;
      case 'medium': return COLORS.github.yellow;
      case 'low': return COLORS.github.green;
      default: return COLORS.github.gray[500];
    }
  };

  const getTrendIcon = (trend: 'increasing' | 'stable' | 'decreasing' | 'improving' | 'declining'): string => {
    switch (trend) {
      case 'increasing':
      case 'declining': return '📈';
      case 'decreasing':
      case 'improving': return '📉';
      default: return '➖';
    }
  };

  const getTrendColor = (trend: 'increasing' | 'stable' | 'decreasing' | 'improving' | 'declining', context: 'positive' | 'negative'): string => {
    if (context === 'positive') {
      return (trend === 'increasing' || trend === 'improving') ? COLORS.github.green : 
             (trend === 'decreasing' || trend === 'declining') ? COLORS.github.red : COLORS.github.gray[500];
    } else {
      return (trend === 'increasing' || trend === 'declining') ? COLORS.github.red : 
             (trend === 'decreasing' || trend === 'improving') ? COLORS.github.green : COLORS.github.gray[500];
    }
  };

  const formatDuration = (hours: number): string => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${Math.round(hours)}h`;
    return `${Math.round(hours / 24)}d`;
  };

  // Simple donut chart component
  const DonutChart: React.FC<{ 
    data: Array<{ label: string; value: number; color: string }>;
    size: number;
    centerText?: string;
    centerSubtext?: string;
  }> = ({ data, size, centerText, centerSubtext }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;

    return (
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 10}
            fill="transparent"
            stroke={theme === 'dark' ? COLORS.github.gray[700] : COLORS.github.gray[200]}
            strokeWidth="20"
          />
          {data.map((item, index) => {
            const strokeDasharray = `${(item.value / total) * 2 * Math.PI * (size / 2 - 10)} ${2 * Math.PI * (size / 2 - 10)}`;
            const strokeDashoffset = -cumulativePercentage * 2 * Math.PI * (size / 2 - 10);
            cumulativePercentage += item.value / total;
            
            return (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={size / 2 - 10}
                fill="transparent"
                stroke={item.color}
                strokeWidth="20"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                opacity={chartsAnimation}
              />
            );
          })}
        </svg>
        {centerText && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize, fontWeight: 700 }}>{centerText}</div>
            {centerSubtext && (
              <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                {centerSubtext}
              </div>
            )}
          </div>
        )}
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
            color: COLORS.github.red,
          }}>
            Risk & Quality Assessment
          </h1>
          <p style={{
            fontSize: MOBILE_OPTIMIZED.minFontSize,
            color: theme === 'dark' ? COLORS.github.gray[300] : COLORS.github.gray[600],
            margin: 0,
          }}>
            {data.projectName} • {new Date(data.evaluationDate).toLocaleDateString()}
          </p>
        </div>

        {/* Overall Scores */}
        <div style={{
          display: 'flex',
          gap: MOBILE_OPTIMIZED.margin,
          transform: `scale(${scoresAnimation})`,
          opacity: scoresAnimation,
        }}>
          <div style={{
            backgroundColor: getScoreColor(data.overallQualityScore),
            color: 'white',
            padding: '16px 20px',
            borderRadius: MOBILE_OPTIMIZED.borderRadius,
            textAlign: 'center',
            minWidth: 100,
          }}>
            <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize + 4, fontWeight: 700 }}>
              {data.overallQualityScore}
            </div>
            <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6 }}>Quality Score</div>
          </div>
          <div style={{
            backgroundColor: getScoreColor(data.overallRiskScore, true),
            color: 'white',
            padding: '16px 20px',
            borderRadius: MOBILE_OPTIMIZED.borderRadius,
            textAlign: 'center',
            minWidth: 100,
          }}>
            <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize + 4, fontWeight: 700 }}>
              {data.overallRiskScore}
            </div>
            <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6 }}>Risk Score</div>
          </div>
        </div>
      </div>

      {/* Top Row - Code Review & Issue Categories */}
      <div style={{
        display: 'flex',
        gap: MOBILE_OPTIMIZED.margin,
        marginBottom: MOBILE_OPTIMIZED.margin,
        transform: `translateY(${interpolate(sectionsAnimation, [0, 1], [20, 0])}px)`,
        opacity: sectionsAnimation,
      }}>
        {/* Code Review Metrics */}
        {showCodeReview && (
          <div style={{
            width: sectionWidth,
            height: sectionHeight,
            backgroundColor: theme === 'dark' ? COLORS.github.gray[800] : COLORS.github.gray[100],
            borderRadius: MOBILE_OPTIMIZED.borderRadius,
            padding: MOBILE_OPTIMIZED.padding,
            border: highlightSection === 'review' ? `3px solid ${COLORS.github.blue}` : 'none',
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
              🔍 Code Review Health
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 2, fontWeight: 700, color: getScoreColor(data.codeReviewMetrics.reviewCoverageRate) }}>
                  {data.codeReviewMetrics.reviewCoverageRate}%
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Coverage
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 2, fontWeight: 700, color: getScoreColor(data.codeReviewMetrics.approvalRate) }}>
                  {data.codeReviewMetrics.approvalRate}%
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Approval Rate
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 2, fontWeight: 700, color: COLORS.github.blue }}>
                  {formatDuration(data.codeReviewMetrics.averageReviewTime)}
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Avg Review Time
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 2, fontWeight: 700, color: getScoreColor(data.codeReviewMetrics.reviewParticipation) }}>
                  {data.codeReviewMetrics.reviewParticipation}%
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Participation
                </div>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2, fontWeight: 600, marginBottom: 12 }}>Review Depth</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4 }}>Thorough Reviews</span>
                <span style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, fontWeight: 600, color: COLORS.github.green }}>
                  {data.codeReviewMetrics.reviewDepth.thoroughReviews}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4 }}>Quick Approvals</span>
                <span style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, fontWeight: 600, color: COLORS.github.orange }}>
                  {data.codeReviewMetrics.reviewDepth.quickApprovals}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4 }}>Avg Comments</span>
                <span style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, fontWeight: 600, color: COLORS.github.blue }}>
                  {data.codeReviewMetrics.reviewDepth.averageCommentsPerReview.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Issue Categories */}
        {showIssueCategories && (
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
              📋 Issue Breakdown
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
              <DonutChart
                size={120}
                centerText={data.issueCategorizationMetrics.totalIssues.toString()}
                centerSubtext="Total Issues"
                data={[
                  { label: 'Bugs', value: data.issueCategorizationMetrics.categories.bugs.count, color: COLORS.github.red },
                  { label: 'Features', value: data.issueCategorizationMetrics.categories.features.count, color: COLORS.github.blue },
                  { label: 'Tech Debt', value: data.issueCategorizationMetrics.categories.technicalDebt.count, color: COLORS.github.orange },
                  { label: 'Docs', value: data.issueCategorizationMetrics.categories.documentation.count, color: COLORS.github.purple },
                  { label: 'Maintenance', value: data.issueCategorizationMetrics.categories.maintenance.count, color: COLORS.github.green },
                ]}
              />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: COLORS.github.red }} />
                  <span style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, flex: 1 }}>Bugs</span>
                  <span style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, fontWeight: 600 }}>
                    {data.issueCategorizationMetrics.categories.bugs.percentage}%
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: COLORS.github.blue }} />
                  <span style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, flex: 1 }}>Features</span>
                  <span style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, fontWeight: 600 }}>
                    {data.issueCategorizationMetrics.categories.features.percentage}%
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: COLORS.github.orange }} />
                  <span style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, flex: 1 }}>Tech Debt</span>
                  <span style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, fontWeight: 600 }}>
                    {data.issueCategorizationMetrics.categories.technicalDebt.percentage}%
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[300] : COLORS.github.gray[600] }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {getTrendIcon(data.issueCategorizationMetrics.trendAnalysis.bugTrend)}
                <span>Bugs {data.issueCategorizationMetrics.trendAnalysis.bugTrend}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {getTrendIcon(data.issueCategorizationMetrics.trendAnalysis.technicalDebtTrend)}
                <span>Debt {data.issueCategorizationMetrics.trendAnalysis.technicalDebtTrend}</span>
              </div>
            </div>
          </div>
        )}

        {/* Security Metrics */}
        {showSecurity && (
          <div style={{
            width: sectionWidth,
            height: sectionHeight,
            backgroundColor: theme === 'dark' ? COLORS.github.gray[800] : COLORS.github.gray[100],
            borderRadius: MOBILE_OPTIMIZED.borderRadius,
            padding: MOBILE_OPTIMIZED.padding,
            border: highlightSection === 'security' ? `3px solid ${COLORS.github.red}` : 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <h3 style={{
              fontSize: MOBILE_OPTIMIZED.headerFontSize,
              fontWeight: 600,
              margin: 0,
              marginBottom: 16,
              color: COLORS.github.red,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              🛡️ Security Status
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize, fontWeight: 700, color: getScoreColor(data.securityMetrics.complianceScore) }}>
                  {data.securityMetrics.complianceScore}%
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Compliance
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize, fontWeight: 700, color: data.securityMetrics.vulnerabilities.total > 0 ? COLORS.github.red : COLORS.github.green }}>
                  {data.securityMetrics.vulnerabilities.total}
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Vulnerabilities
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize, fontWeight: 700, color: getScoreColor(data.securityMetrics.securityScans.passRate) }}>
                  {data.securityMetrics.securityScans.passRate}%
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Scan Pass Rate
                </div>
              </div>
            </div>

            {data.securityMetrics.vulnerabilities.total > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2, fontWeight: 600, marginBottom: 8 }}>Vulnerability Breakdown</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: MOBILE_OPTIMIZED.minFontSize - 4 }}>
                    <span style={{ color: getSeverityColor('critical') }}>Critical</span>
                    <span>{data.securityMetrics.vulnerabilities.critical}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: MOBILE_OPTIMIZED.minFontSize - 4 }}>
                    <span style={{ color: getSeverityColor('high') }}>High</span>
                    <span>{data.securityMetrics.vulnerabilities.high}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: MOBILE_OPTIMIZED.minFontSize - 4 }}>
                    <span style={{ color: getSeverityColor('medium') }}>Medium</span>
                    <span>{data.securityMetrics.vulnerabilities.medium}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: MOBILE_OPTIMIZED.minFontSize - 4 }}>
                    <span style={{ color: getSeverityColor('low') }}>Low</span>
                    <span>{data.securityMetrics.vulnerabilities.low}</span>
                  </div>
                </div>
              </div>
            )}

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2, fontWeight: 600, marginBottom: 8 }}>Security Practices</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Object.entries(data.securityMetrics.securityPractices).map(([practice, enabled]) => (
                  <div key={practice} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      backgroundColor: enabled ? COLORS.github.green : COLORS.github.red,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      color: 'white',
                      fontWeight: 700,
                    }}>
                      {enabled ? '✓' : '✗'}
                    </div>
                    <span style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, textTransform: 'capitalize' }}>
                      {practice.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Row - Technical Debt & Quality Trends */}
      <div style={{
        display: 'flex',
        gap: MOBILE_OPTIMIZED.margin,
        flex: 1,
        transform: `translateY(${interpolate(chartsAnimation, [0, 1], [20, 0])}px)`,
        opacity: chartsAnimation,
      }}>
        {/* Technical Debt */}
        {showTechnicalDebt && (
          <div style={{
            width: sectionWidth * 1.5,
            height: sectionHeight,
            backgroundColor: theme === 'dark' ? COLORS.github.gray[800] : COLORS.github.gray[100],
            borderRadius: MOBILE_OPTIMIZED.borderRadius,
            padding: MOBILE_OPTIMIZED.padding,
            border: highlightSection === 'debt' ? `3px solid ${COLORS.github.purple}` : 'none',
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
              ⚙️ Technical Debt Analysis
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 2, fontWeight: 700, color: getScoreColor(data.technicalDebtIndicators.overallDebtScore, true) }}>
                  {data.technicalDebtIndicators.overallDebtScore}
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Debt Score
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 2, fontWeight: 700, color: getScoreColor(data.technicalDebtIndicators.testCoverage.overallCoverage) }}>
                  {data.technicalDebtIndicators.testCoverage.overallCoverage}%
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Test Coverage
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.headerFontSize - 2, fontWeight: 700, color: getScoreColor(data.technicalDebtIndicators.codeComplexity.maintainabilityIndex) }}>
                  {data.technicalDebtIndicators.codeComplexity.maintainabilityIndex}
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  Maintainability
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1 }}>
              <div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2, fontWeight: 600, marginBottom: 8 }}>Code Smells</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: MOBILE_OPTIMIZED.minFontSize - 4 }}>
                    <span>Duplicated Code</span>
                    <span>{data.technicalDebtIndicators.codeSmells.duplicatedCode} lines</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: MOBILE_OPTIMIZED.minFontSize - 4 }}>
                    <span>Long Methods</span>
                    <span>{data.technicalDebtIndicators.codeSmells.longMethods}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: MOBILE_OPTIMIZED.minFontSize - 4 }}>
                    <span>Large Classes</span>
                    <span>{data.technicalDebtIndicators.codeSmells.largeClasses}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: MOBILE_OPTIMIZED.minFontSize - 4 }}>
                    <span>Dead Code</span>
                    <span>{data.technicalDebtIndicators.codeSmells.deadCode} lines</span>
                  </div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2, fontWeight: 600, marginBottom: 8 }}>Top Refactoring Needs</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {data.technicalDebtIndicators.refactoringNeeds.slice(0, 3).map((need, index) => (
                    <div key={index} style={{
                      padding: 6,
                      borderRadius: 6,
                      backgroundColor: theme === 'dark' ? COLORS.github.gray[700] : COLORS.github.gray[200],
                      border: `2px solid ${getSeverityColor(need.priority)}`,
                    }}>
                      <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, fontWeight: 600, marginBottom: 2 }}>
                        {need.component}
                      </div>
                      <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                        {need.impactArea} • {need.estimatedEffort}h
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quality Trends & Recommendations */}
        {(showTrends || data.recommendations.length > 0) && (
          <div style={{
            width: sectionWidth * 1.5,
            height: sectionHeight,
            backgroundColor: theme === 'dark' ? COLORS.github.gray[800] : COLORS.github.gray[100],
            borderRadius: MOBILE_OPTIMIZED.borderRadius,
            padding: MOBILE_OPTIMIZED.padding,
            border: highlightSection === 'trends' ? `3px solid ${COLORS.github.green}` : 'none',
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
              📈 Quality Trends & Actions
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 20, fontSize: MOBILE_OPTIMIZED.minFontSize - 2 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize + 4, marginBottom: 4 }}>
                  {getTrendIcon(data.qualityTrends.codeQualityTrend)}
                </div>
                <div style={{ fontWeight: 600, color: getTrendColor(data.qualityTrends.codeQualityTrend, 'positive') }}>
                  Code Quality
                </div>
                <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 4, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600] }}>
                  {data.qualityTrends.codeQualityTrend}
                </div>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 2, fontWeight: 600, marginBottom: 12 }}>
                Priority Recommendations
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
                        <span style={{
                          fontSize: MOBILE_OPTIMIZED.minFontSize - 8,
                          backgroundColor: rec.priority === 'immediate' ? COLORS.github.red : COLORS.github.orange,
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: 4,
                          textTransform: 'uppercase',
                          fontWeight: 600,
                        }}>
                          {rec.priority}
                        </span>
                      </div>
                      <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 6, color: theme === 'dark' ? COLORS.github.gray[400] : COLORS.github.gray[600], marginBottom: 4 }}>
                        {rec.description}
                      </div>
                      <div style={{ fontSize: MOBILE_OPTIMIZED.minFontSize - 8, color: COLORS.github.green, fontWeight: 600 }}>
                        Impact: {rec.expectedImpact} • Effort: {rec.estimatedEffort}
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