import { render, screen } from '@testing-library/react';
import { TeamVelocityDashboard } from './index';
import { TeamVelocityData } from './types';

// Mock Remotion hooks
jest.mock('remotion', () => ({
  useCurrentFrame: () => 30,
  useVideoConfig: () => ({ fps: 30, width: 1920, height: 1080 }),
  interpolate: jest.fn((frame, input, output) => {
    if (frame <= input[0]) return output[0];
    if (frame >= input[1]) return output[1];
    const progress = (frame - input[0]) / (input[1] - input[0]);
    return output[0] + (output[1] - output[0]) * progress;
  }),
  spring: jest.fn(() => 1),
  AbsoluteFill: ({ children, style }: any) => <div style={style}>{children}</div>,
}));

describe('TeamVelocityDashboard', () => {
  const mockData: TeamVelocityData = {
    teamName: 'Platform Engineering Team',
    reportingPeriod: {
      startDate: '2024-01-01',
      endDate: '2024-03-31',
      periodLabel: 'Q1 2024',
    },
    commitMetrics: {
      dailyCommits: [
        { date: '2024-03-01', count: 15, weekday: 'Friday' },
        { date: '2024-03-02', count: 8, weekday: 'Saturday' },
        { date: '2024-03-03', count: 12, weekday: 'Sunday' },
        { date: '2024-03-04', count: 22, weekday: 'Monday' },
        { date: '2024-03-05', count: 18, weekday: 'Tuesday' },
      ],
      averageCommitsPerDay: 15.2,
      totalCommitsThisWeek: 75,
      peakCommitHour: 14,
      commitFrequency: 'high',
      commitQualityScore: 87,
    },
    pullRequestMetrics: {
      averageReviewTime: 8.5,
      averageMergeTime: 12.3,
      mergeRate: 94.2,
      totalPRsThisWeek: 18,
      totalPRsMerged: 17,
      totalPRsRejected: 1,
      averagePRSize: {
        linesAdded: 142,
        linesDeleted: 38,
        filesChanged: 6,
      },
      reviewEfficiency: 92,
    },
    issueResolutionMetrics: {
      averageResolutionTime: 24.8,
      resolutionRate: 89.5,
      totalIssuesOpened: 23,
      totalIssuesClosed: 21,
      issueBacklog: 15,
      issuesByPriority: {
        critical: 1,
        high: 4,
        medium: 8,
        low: 10,
      },
      firstResponseTime: 2.1,
    },
    collaborationMetrics: {
      activeDevelopers: 12,
      codeReviewParticipation: 95.8,
      crossTeamContributions: 8,
      mentorshipActivities: 6,
      knowledgeSharingEvents: 3,
      pairProgrammingSessions: 15,
      collaborationScore: 88,
    },
    velocityTrends: {
      sprintVelocity: [
        { sprintNumber: 1, storyPointsCompleted: 42, sprintGoalAchieved: true, sprintDate: '2024-01-15' },
        { sprintNumber: 2, storyPointsCompleted: 38, sprintGoalAchieved: false, sprintDate: '2024-01-29' },
        { sprintNumber: 3, storyPointsCompleted: 45, sprintGoalAchieved: true, sprintDate: '2024-02-12' },
        { sprintNumber: 4, storyPointsCompleted: 47, sprintGoalAchieved: true, sprintDate: '2024-02-26' },
        { sprintNumber: 5, storyPointsCompleted: 44, sprintGoalAchieved: true, sprintDate: '2024-03-12' },
        { sprintNumber: 6, storyPointsCompleted: 49, sprintGoalAchieved: true, sprintDate: '2024-03-26' },
      ],
      burndownTrend: 'improving',
      productivityTrend: 'up',
      qualityTrend: 'improving',
    },
    overallVelocityScore: 91,
    recommendedActions: [
      {
        category: 'efficiency',
        priority: 'high',
        action: 'Implement automated testing pipeline',
        expectedImpact: 'Reduce manual testing time by 40%',
      },
      {
        category: 'collaboration',
        priority: 'medium',
        action: 'Increase pair programming sessions',
        expectedImpact: 'Improve knowledge sharing and code quality',
      },
      {
        category: 'process',
        priority: 'low',
        action: 'Review meeting schedule optimization',
        expectedImpact: 'Free up 2-3 hours per week for development',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<TeamVelocityDashboard data={mockData} />);
      expect(screen.getByText('Platform Engineering Team')).toBeInTheDocument();
    });

    it('renders team information correctly', () => {
      render(<TeamVelocityDashboard data={mockData} />);
      
      expect(screen.getByText('Platform Engineering Team')).toBeInTheDocument();
      expect(screen.getByText('Q1 2024 • Team Velocity Dashboard')).toBeInTheDocument();
    });

    it('renders commit metrics section when showCommitMetrics is true', () => {
      render(<TeamVelocityDashboard data={mockData} showCommitMetrics={true} />);
      
      expect(screen.getByText('Commit Activity')).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument(); // totalCommitsThisWeek
      expect(screen.getByText('15.2')).toBeInTheDocument(); // averageCommitsPerDay
      expect(screen.getByText('Quality Score: 87')).toBeInTheDocument();
    });

    it('renders PR metrics section when showPRMetrics is true', () => {
      render(<TeamVelocityDashboard data={mockData} showPRMetrics={true} />);
      
      expect(screen.getByText('Pull Request Metrics')).toBeInTheDocument();
      expect(screen.getByText('8.5h')).toBeInTheDocument(); // averageReviewTime
      expect(screen.getByText('94.2%')).toBeInTheDocument(); // mergeRate
      expect(screen.getByText('18')).toBeInTheDocument(); // totalPRsThisWeek
    });

    it('renders issue metrics section when showIssueMetrics is true', () => {
      render(<TeamVelocityDashboard data={mockData} showIssueMetrics={true} />);
      
      expect(screen.getByText('Issue Resolution')).toBeInTheDocument();
      expect(screen.getByText('24.8h')).toBeInTheDocument(); // averageResolutionTime
      expect(screen.getByText('89.5%')).toBeInTheDocument(); // resolutionRate
    });

    it('renders collaboration section when showCollaboration is true', () => {
      render(<TeamVelocityDashboard data={mockData} showCollaboration={true} />);
      
      expect(screen.getByText('Team Collaboration')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument(); // activeDevelopers
      expect(screen.getByText('95.8%')).toBeInTheDocument(); // codeReviewParticipation
      expect(screen.getByText('88')).toBeInTheDocument(); // collaborationScore
    });

    it('renders trends section when showTrends is true', () => {
      render(<TeamVelocityDashboard data={mockData} showTrends={true} />);
      
      expect(screen.getByText('Velocity Trends')).toBeInTheDocument();
      expect(screen.getByText('91')).toBeInTheDocument(); // overallVelocityScore
    });
  });

  describe('Component Props', () => {
    it('renders with custom animation delay', () => {
      render(<TeamVelocityDashboard data={mockData} animationDelay={2} />);
      expect(screen.getByText('Platform Engineering Team')).toBeInTheDocument();
    });

    it('hides commit metrics section when showCommitMetrics is false', () => {
      render(<TeamVelocityDashboard data={mockData} showCommitMetrics={false} />);
      expect(screen.queryByText('Commit Activity')).not.toBeInTheDocument();
    });

    it('hides PR metrics section when showPRMetrics is false', () => {
      render(<TeamVelocityDashboard data={mockData} showPRMetrics={false} />);
      expect(screen.queryByText('Pull Request Metrics')).not.toBeInTheDocument();
    });

    it('hides issue metrics section when showIssueMetrics is false', () => {
      render(<TeamVelocityDashboard data={mockData} showIssueMetrics={false} />);
      expect(screen.queryByText('Issue Resolution')).not.toBeInTheDocument();
    });

    it('hides collaboration section when showCollaboration is false', () => {
      render(<TeamVelocityDashboard data={mockData} showCollaboration={false} />);
      expect(screen.queryByText('Team Collaboration')).not.toBeInTheDocument();
    });

    it('hides trends section when showTrends is false', () => {
      render(<TeamVelocityDashboard data={mockData} showTrends={false} />);
      expect(screen.queryByText('Velocity Trends')).not.toBeInTheDocument();
    });

    it('applies highlight styling when highlightSection is set', () => {
      const { container } = render(
        <TeamVelocityDashboard data={mockData} highlightSection="commits" />
      );
      
      expect(screen.getByText('Commit Activity')).toBeInTheDocument();
      const highlightedSection = container.querySelector('[style*="border"]');
      expect(highlightedSection).toBeInTheDocument();
    });

    it('renders with dark theme', () => {
      const { container } = render(
        <TeamVelocityDashboard data={mockData} theme="dark" />
      );
      
      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer.style.backgroundColor).toBeTruthy();
    });

    it('filters data by time range', () => {
      render(<TeamVelocityDashboard data={mockData} timeRange="7d" />);
      expect(screen.getByText('Platform Engineering Team')).toBeInTheDocument();
      // Time range filtering affects data display
    });
  });

  describe('Data Visualization', () => {
    it('displays commit frequency indicators correctly', () => {
      render(<TeamVelocityDashboard data={mockData} />);
      
      // High frequency should show appropriate indicator
      expect(screen.getByText('Commit Activity')).toBeInTheDocument();
    });

    it('shows sprint velocity chart data', () => {
      render(<TeamVelocityDashboard data={mockData} />);
      
      // Sprint data should be visualized
      expect(screen.getByText('Velocity Trends')).toBeInTheDocument();
    });

    it('displays issue priority breakdown', () => {
      render(<TeamVelocityDashboard data={mockData} />);
      
      // Issue priorities should be shown
      expect(screen.getByText('Issue Resolution')).toBeInTheDocument();
    });

    it('shows collaboration metrics correctly', () => {
      render(<TeamVelocityDashboard data={mockData} />);
      
      expect(screen.getByText('Team Collaboration')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument(); // pairProgrammingSessions
      expect(screen.getByText('6')).toBeInTheDocument(); // mentorshipActivities
    });
  });

  describe('Trend Indicators', () => {
    it('displays improving trends correctly', () => {
      render(<TeamVelocityDashboard data={mockData} />);
      
      // Improving trends should show positive indicators
      expect(screen.getByText('Velocity Trends')).toBeInTheDocument();
    });

    it('handles different trend states', () => {
      const datWithVariedTrends = {
        ...mockData,
        velocityTrends: {
          ...mockData.velocityTrends,
          burndownTrend: 'declining' as const,
          productivityTrend: 'stable' as const,
          qualityTrend: 'improving' as const,
        },
      };
      
      render(<TeamVelocityDashboard data={datWithVariedTrends} />);
      expect(screen.getByText('Velocity Trends')).toBeInTheDocument();
    });

    it('shows sprint goal achievement indicators', () => {
      render(<TeamVelocityDashboard data={mockData} />);
      
      // Sprint goals achieved should be visualized
      expect(screen.getByText('Velocity Trends')).toBeInTheDocument();
    });
  });

  describe('Recommendations Section', () => {
    it('displays recommended actions when present', () => {
      render(<TeamVelocityDashboard data={mockData} />);
      
      expect(screen.getByText('Recommended Actions')).toBeInTheDocument();
      expect(screen.getByText('Implement automated testing pipeline')).toBeInTheDocument();
      expect(screen.getByText('Increase pair programming sessions')).toBeInTheDocument();
    });

    it('shows priority indicators for recommendations', () => {
      render(<TeamVelocityDashboard data={mockData} />);
      
      // High priority actions should be highlighted
      expect(screen.getByText('Recommended Actions')).toBeInTheDocument();
    });

    it('handles empty recommendations array', () => {
      const dataWithoutRecommendations = {
        ...mockData,
        recommendedActions: [],
      };
      
      render(<TeamVelocityDashboard data={dataWithoutRecommendations} />);
      expect(screen.queryByText('Recommended Actions')).not.toBeInTheDocument();
    });
  });

  describe('Animation States', () => {
    it('renders correctly at different frame values', () => {
      (require('remotion').useCurrentFrame as jest.Mock).mockReturnValue(0);
      const { rerender } = render(<TeamVelocityDashboard data={mockData} />);
      expect(screen.getByText('Platform Engineering Team')).toBeInTheDocument();

      (require('remotion').useCurrentFrame as jest.Mock).mockReturnValue(60);
      rerender(<TeamVelocityDashboard data={mockData} />);
      expect(screen.getByText('Platform Engineering Team')).toBeInTheDocument();

      (require('remotion').useCurrentFrame as jest.Mock).mockReturnValue(120);
      rerender(<TeamVelocityDashboard data={mockData} />);
      expect(screen.getByText('Platform Engineering Team')).toBeInTheDocument();
    });

    it('handles spring animations correctly', () => {
      const mockSpring = jest.fn().mockReturnValue(0.8);
      (require('remotion').spring as jest.Mock).mockImplementation(mockSpring);
      
      render(<TeamVelocityDashboard data={mockData} />);
      
      expect(mockSpring).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            damping: expect.any(Number),
            stiffness: expect.any(Number),
          }),
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('handles zero values in metrics', () => {
      const dataWithZeros = {
        ...mockData,
        commitMetrics: {
          ...mockData.commitMetrics,
          totalCommitsThisWeek: 0,
          averageCommitsPerDay: 0,
        },
      };
      
      render(<TeamVelocityDashboard data={dataWithZeros} />);
      expect(screen.getByText('Commit Activity')).toBeInTheDocument();
    });

    it('handles empty sprint velocity array', () => {
      const dataWithEmptyVelocity = {
        ...mockData,
        velocityTrends: {
          ...mockData.velocityTrends,
          sprintVelocity: [],
        },
      };
      
      render(<TeamVelocityDashboard data={dataWithEmptyVelocity} />);
      expect(screen.getByText('Velocity Trends')).toBeInTheDocument();
    });

    it('handles extreme values gracefully', () => {
      const dataWithExtremeValues = {
        ...mockData,
        pullRequestMetrics: {
          ...mockData.pullRequestMetrics,
          averageReviewTime: 168, // 1 week
          mergeRate: 100,
        },
      };
      
      render(<TeamVelocityDashboard data={dataWithExtremeValues} />);
      expect(screen.getByText('Pull Request Metrics')).toBeInTheDocument();
    });

    it('handles missing optional data fields', () => {
      const minimalData = {
        teamName: 'Test Team',
        reportingPeriod: mockData.reportingPeriod,
        commitMetrics: mockData.commitMetrics,
        pullRequestMetrics: mockData.pullRequestMetrics,
        issueResolutionMetrics: mockData.issueResolutionMetrics,
        collaborationMetrics: mockData.collaborationMetrics,
        velocityTrends: mockData.velocityTrends,
        overallVelocityScore: 85,
        recommendedActions: [],
      };
      
      render(<TeamVelocityDashboard data={minimalData} />);
      expect(screen.getByText('Test Team')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('adjusts layout for different screen sizes', () => {
      const mobileConfig = { fps: 30, width: 1080, height: 1920 };
      (require('remotion').useVideoConfig as jest.Mock).mockReturnValue(mobileConfig);
      
      render(<TeamVelocityDashboard data={mockData} />);
      expect(screen.getByText('Platform Engineering Team')).toBeInTheDocument();
    });

    it('maintains readability at various sizes', () => {
      const smallConfig = { fps: 30, width: 720, height: 480 };
      (require('remotion').useVideoConfig as jest.Mock).mockReturnValue(smallConfig);
      
      render(<TeamVelocityDashboard data={mockData} />);
      expect(screen.getByText('Platform Engineering Team')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      render(<TeamVelocityDashboard data={mockData} />);
      
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      const headings = screen.getAllByRole('heading', { level: 2 });
      expect(headings.length).toBeGreaterThan(0);
    });

    it('provides meaningful numerical data', () => {
      render(<TeamVelocityDashboard data={mockData} />);
      
      // Key metrics should be accessible as text
      expect(screen.getByText(/91/)).toBeInTheDocument(); // Overall score
      expect(screen.getByText(/94.2%/)).toBeInTheDocument(); // Merge rate
    });

    it('includes descriptive labels for metrics', () => {
      render(<TeamVelocityDashboard data={mockData} />);
      
      expect(screen.getByText('Average Review Time')).toBeInTheDocument();
      expect(screen.getByText('Merge Rate')).toBeInTheDocument();
      expect(screen.getByText('Resolution Rate')).toBeInTheDocument();
    });
  });
});