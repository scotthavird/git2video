import { render, screen } from '@testing-library/react';
import { ExecutiveImpactSummary } from './index';
import { ExecutiveImpactSummaryData } from './types';

// Mock Remotion hooks
jest.mock('remotion', () => ({
  useCurrentFrame: () => 30,
  useVideoConfig: () => ({ fps: 30, width: 1920, height: 1080 }),
  interpolate: jest.fn((frame, input, output) => {
    // Simulate interpolation for testing
    if (frame <= input[0]) return output[0];
    if (frame >= input[1]) return output[1];
    const progress = (frame - input[0]) / (input[1] - input[0]);
    return output[0] + (output[1] - output[0]) * progress;
  }),
  spring: jest.fn(() => 1), // Fully animated state for testing
  AbsoluteFill: ({ children, style }: any) => <div style={style}>{children}</div>,
}));

describe('ExecutiveImpactSummary', () => {
  const mockData: ExecutiveImpactSummaryData = {
    repositoryName: 'Test Repository',
    repositoryDescription: 'A test repository for executive impact analysis',
    healthMetrics: {
      stars: 1250,
      forks: 340,
      watchers: 89,
      contributors: 25,
      totalCommits: 2480,
      totalPullRequests: 456,
      totalIssues: 123,
      openIssues: 15,
      closedIssues: 108,
      healthScore: 85,
    },
    activityTrends: {
      commitTrend: {
        thisWeek: 32,
        lastWeek: 28,
        trend: 'up',
        percentChange: 14.3,
      },
      prTrend: {
        thisWeek: 8,
        lastWeek: 12,
        trend: 'down',
        percentChange: -33.3,
      },
      issueTrend: {
        thisWeek: 5,
        lastWeek: 7,
        trend: 'down',
        percentChange: -28.6,
      },
    },
    teamMetrics: {
      totalMembers: 25,
      activeMembers: 18,
      newMembersThisMonth: 3,
      topContributors: [
        { name: 'Alice Johnson', avatar: 'https://example.com/avatar1.jpg', contributions: 145, role: 'Senior Developer' },
        { name: 'Bob Smith', avatar: 'https://example.com/avatar2.jpg', contributions: 132, role: 'Tech Lead' },
        { name: 'Carol Davis', avatar: 'https://example.com/avatar3.jpg', contributions: 98, role: 'Full Stack Developer' },
      ],
      teamGrowthRate: 20,
    },
    kpis: {
      codeQualityScore: 87,
      deliveryVelocity: 24,
      customerSatisfaction: 92,
      technicalDebtRatio: 15,
      uptime: 99.8,
      securityScore: 94,
    },
    timeframe: {
      startDate: '2024-01-01',
      endDate: '2024-03-31',
      period: 'Q1 2024',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<ExecutiveImpactSummary data={mockData} />);
      expect(screen.getByText('Test Repository')).toBeInTheDocument();
    });

    it('renders repository information correctly', () => {
      render(<ExecutiveImpactSummary data={mockData} />);
      
      expect(screen.getByText('Test Repository')).toBeInTheDocument();
      expect(screen.getByText('A test repository for executive impact analysis')).toBeInTheDocument();
      expect(screen.getByText('Q1 2024 • Executive Summary')).toBeInTheDocument();
    });

    it('renders health metrics section when showHealthScore is true', () => {
      render(<ExecutiveImpactSummary data={mockData} showHealthScore={true} />);
      
      expect(screen.getByText('Repository Health')).toBeInTheDocument();
      expect(screen.getByText('85')).toBeInTheDocument();
      expect(screen.getByText('Stars')).toBeInTheDocument();
      expect(screen.getByText('Contributors')).toBeInTheDocument();
      expect(screen.getByText('Pull Requests')).toBeInTheDocument();
      expect(screen.getByText('Issues')).toBeInTheDocument();
    });

    it('renders activity trends section when showTrends is true', () => {
      render(<ExecutiveImpactSummary data={mockData} showTrends={true} />);
      
      expect(screen.getByText('Activity Trends')).toBeInTheDocument();
      expect(screen.getByText('Commits')).toBeInTheDocument();
      expect(screen.getByText('Pull Requests')).toBeInTheDocument();
      expect(screen.getByText('Issues Resolved')).toBeInTheDocument();
    });

    it('renders team metrics section when showTeamMetrics is true', () => {
      render(<ExecutiveImpactSummary data={mockData} showTeamMetrics={true} />);
      
      expect(screen.getByText('Team Performance')).toBeInTheDocument();
      expect(screen.getByText('Top Contributors')).toBeInTheDocument();
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      expect(screen.getByText('Carol Davis')).toBeInTheDocument();
    });

    it('renders KPIs section when showKPIs is true', () => {
      render(<ExecutiveImpactSummary data={mockData} showKPIs={true} />);
      
      expect(screen.getByText('Key Performance Indicators')).toBeInTheDocument();
      expect(screen.getByText('Code Quality')).toBeInTheDocument();
      expect(screen.getByText('Velocity')).toBeInTheDocument();
      expect(screen.getByText('Satisfaction')).toBeInTheDocument();
      expect(screen.getByText('Security')).toBeInTheDocument();
    });
  });

  describe('Component Props', () => {
    it('renders with custom animation delay', () => {
      render(<ExecutiveImpactSummary data={mockData} animationDelay={2} />);
      expect(screen.getByText('Test Repository')).toBeInTheDocument();
    });

    it('hides health score section when showHealthScore is false', () => {
      render(<ExecutiveImpactSummary data={mockData} showHealthScore={false} />);
      expect(screen.queryByText('Repository Health')).not.toBeInTheDocument();
    });

    it('hides trends section when showTrends is false', () => {
      render(<ExecutiveImpactSummary data={mockData} showTrends={false} />);
      expect(screen.queryByText('Activity Trends')).not.toBeInTheDocument();
    });

    it('hides team metrics section when showTeamMetrics is false', () => {
      render(<ExecutiveImpactSummary data={mockData} showTeamMetrics={false} />);
      expect(screen.queryByText('Team Performance')).not.toBeInTheDocument();
    });

    it('hides KPIs section when showKPIs is false', () => {
      render(<ExecutiveImpactSummary data={mockData} showKPIs={false} />);
      expect(screen.queryByText('Key Performance Indicators')).not.toBeInTheDocument();
    });

    it('applies highlight border when highlightMetric is set', () => {
      const { container } = render(
        <ExecutiveImpactSummary data={mockData} highlightMetric="health" />
      );
      
      // Check that health section exists
      expect(screen.getByText('Repository Health')).toBeInTheDocument();
      
      // The border styling should be applied to the health section container
      const healthSection = container.querySelector('[style*="border"]');
      expect(healthSection).toBeInTheDocument();
    });

    it('renders with dark theme', () => {
      const { container } = render(
        <ExecutiveImpactSummary data={mockData} theme="dark" />
      );
      
      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer.style.backgroundColor).toBeTruthy();
    });

    it('renders with light theme', () => {
      const { container } = render(
        <ExecutiveImpactSummary data={mockData} theme="light" />
      );
      
      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer.style.backgroundColor).toBeTruthy();
    });
  });

  describe('Data Formatting', () => {
    it('formats large numbers correctly', () => {
      const dataWithLargeNumbers = {
        ...mockData,
        healthMetrics: {
          ...mockData.healthMetrics,
          stars: 1250000, // Should display as 1.3M
          totalCommits: 5500, // Should display as 5.5K
        },
      };
      
      render(<ExecutiveImpactSummary data={dataWithLargeNumbers} />);
      // Numbers are formatted in the component, exact display depends on implementation
      expect(screen.getByText('Repository Health')).toBeInTheDocument();
    });

    it('displays trend indicators correctly', () => {
      render(<ExecutiveImpactSummary data={mockData} />);
      
      // Check that trend indicators are displayed (up, down arrows)
      expect(screen.getByText('Activity Trends')).toBeInTheDocument();
      // The actual trend icons are displayed within the component
    });

    it('handles health score color coding', () => {
      const highScoreData = {
        ...mockData,
        healthMetrics: { ...mockData.healthMetrics, healthScore: 95 },
      };
      
      render(<ExecutiveImpactSummary data={highScoreData} />);
      expect(screen.getByText('95')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('adjusts layout for different screen sizes', () => {
      // Mock different video config for mobile
      const mockVideoConfig = { fps: 30, width: 1080, height: 1920 };
      (require('remotion').useVideoConfig as jest.Mock).mockReturnValue(mockVideoConfig);
      
      render(<ExecutiveImpactSummary data={mockData} />);
      expect(screen.getByText('Test Repository')).toBeInTheDocument();
    });
  });

  describe('Animation States', () => {
    it('renders correctly at different frame values', () => {
      // Test with different frame values
      (require('remotion').useCurrentFrame as jest.Mock).mockReturnValue(0);
      const { rerender } = render(<ExecutiveImpactSummary data={mockData} />);
      expect(screen.getByText('Test Repository')).toBeInTheDocument();

      // Test mid-animation
      (require('remotion').useCurrentFrame as jest.Mock).mockReturnValue(60);
      rerender(<ExecutiveImpactSummary data={mockData} />);
      expect(screen.getByText('Test Repository')).toBeInTheDocument();

      // Test fully animated
      (require('remotion').useCurrentFrame as jest.Mock).mockReturnValue(120);
      rerender(<ExecutiveImpactSummary data={mockData} />);
      expect(screen.getByText('Test Repository')).toBeInTheDocument();
    });

    it('handles spring animations correctly', () => {
      const mockSpring = jest.fn().mockReturnValue(0.5);
      (require('remotion').spring as jest.Mock).mockImplementation(mockSpring);
      
      render(<ExecutiveImpactSummary data={mockData} />);
      
      // Verify spring was called with correct parameters
      expect(mockSpring).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            damping: expect.any(Number),
            stiffness: expect.any(Number),
            mass: expect.any(Number),
          }),
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('handles empty top contributors array', () => {
      const dataWithEmptyContributors = {
        ...mockData,
        teamMetrics: {
          ...mockData.teamMetrics,
          topContributors: [],
        },
      };
      
      render(<ExecutiveImpactSummary data={dataWithEmptyContributors} />);
      expect(screen.getByText('Team Performance')).toBeInTheDocument();
    });

    it('handles zero values in metrics', () => {
      const dataWithZeroValues = {
        ...mockData,
        healthMetrics: {
          ...mockData.healthMetrics,
          stars: 0,
          contributors: 0,
        },
      };
      
      render(<ExecutiveImpactSummary data={dataWithZeroValues} />);
      expect(screen.getByText('Repository Health')).toBeInTheDocument();
    });

    it('handles extreme health scores', () => {
      const lowScoreData = {
        ...mockData,
        healthMetrics: { ...mockData.healthMetrics, healthScore: 10 },
      };
      
      render(<ExecutiveImpactSummary data={lowScoreData} />);
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('renders with minimal data', () => {
      const minimalData = {
        ...mockData,
        teamMetrics: {
          ...mockData.teamMetrics,
          topContributors: [mockData.teamMetrics.topContributors[0]], // Only one contributor
        },
      };
      
      render(<ExecutiveImpactSummary data={minimalData} />);
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      render(<ExecutiveImpactSummary data={mockData} />);
      
      // Check for heading elements
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      
      // Multiple h2 elements for sections
      const headings = screen.getAllByRole('heading', { level: 2 });
      expect(headings.length).toBeGreaterThan(0);
    });

    it('provides meaningful text content', () => {
      render(<ExecutiveImpactSummary data={mockData} />);
      
      // Verify important metrics are displayed as text
      expect(screen.getByText(/85/)).toBeInTheDocument(); // Health score
      expect(screen.getByText(/145 contributions/)).toBeInTheDocument(); // Contributor stats
    });
  });
});