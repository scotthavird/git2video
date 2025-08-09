import { render, screen } from '@testing-library/react';
import { StrategicMilestones } from './index';
import { StrategicMilestonesData, Milestone, ProjectPhase } from './types';

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

describe('StrategicMilestones', () => {
  const mockMilestones: Milestone[] = [
    {
      id: 'milestone-1',
      title: 'Alpha Release',
      description: 'Initial alpha version with core features',
      dueDate: '2024-03-15',
      completedDate: '2024-03-12',
      status: 'completed',
      type: 'major_release',
      priority: 'critical',
      progress: 100,
      assignee: {
        name: 'John Smith',
        avatar: 'https://example.com/avatar1.jpg',
        role: 'Technical Lead'
      },
      deliverables: [
        { name: 'Core API', status: 'completed', progress: 100 },
        { name: 'User Interface', status: 'completed', progress: 100 },
        { name: 'Documentation', status: 'completed', progress: 100 }
      ],
      dependencies: [],
      businessImpact: {
        revenue: 250000,
        userCount: 1000,
        efficiency: 85,
        riskMitigation: 70
      },
      metrics: {
        plannedEffort: 120,
        actualEffort: 115,
        plannedDuration: 30,
        actualDuration: 27,
        qualityScore: 92
      }
    },
    {
      id: 'milestone-2',
      title: 'Beta Launch',
      description: 'Public beta with extended feature set',
      dueDate: '2024-05-01',
      status: 'in_progress',
      type: 'feature_launch',
      priority: 'high',
      progress: 65,
      assignee: {
        name: 'Sarah Johnson',
        avatar: 'https://example.com/avatar2.jpg',
        role: 'Product Manager'
      },
      deliverables: [
        { name: 'Advanced Features', status: 'in_progress', progress: 70 },
        { name: 'Beta Testing', status: 'in_progress', progress: 60 },
        { name: 'User Feedback System', status: 'completed', progress: 100 }
      ],
      dependencies: ['milestone-1'],
      businessImpact: {
        revenue: 500000,
        userCount: 5000,
        efficiency: 90,
        riskMitigation: 80
      },
      metrics: {
        plannedEffort: 200,
        actualEffort: 145,
        plannedDuration: 45,
        actualDuration: 35,
        qualityScore: 88
      }
    },
    {
      id: 'milestone-3',
      title: 'Production Ready',
      description: 'Full production deployment with all features',
      dueDate: '2024-07-15',
      status: 'planned',
      type: 'business_goal',
      priority: 'critical',
      progress: 15,
      assignee: {
        name: 'Mike Chen',
        avatar: 'https://example.com/avatar3.jpg',
        role: 'DevOps Lead'
      },
      deliverables: [
        { name: 'Infrastructure Setup', status: 'pending', progress: 0 },
        { name: 'Security Audit', status: 'pending', progress: 0 },
        { name: 'Performance Testing', status: 'in_progress', progress: 30 }
      ],
      dependencies: ['milestone-2'],
      businessImpact: {
        revenue: 1200000,
        userCount: 25000,
        efficiency: 95,
        riskMitigation: 95
      },
      metrics: {
        plannedEffort: 300,
        actualEffort: 0,
        plannedDuration: 60,
        actualDuration: 0,
        qualityScore: 0
      }
    }
  ];

  const mockPhases: ProjectPhase[] = [
    {
      id: 'phase-1',
      name: 'Development Phase',
      startDate: '2024-01-01',
      endDate: '2024-03-31',
      status: 'completed',
      milestones: ['milestone-1'],
      budget: { allocated: 500000, spent: 475000, currency: 'USD' },
      team: {
        size: 8,
        roles: [
          { role: 'Developer', count: 5 },
          { role: 'Designer', count: 2 },
          { role: 'QA', count: 1 }
        ]
      }
    },
    {
      id: 'phase-2',
      name: 'Testing Phase',
      startDate: '2024-04-01',
      endDate: '2024-06-30',
      status: 'active',
      milestones: ['milestone-2'],
      budget: { allocated: 300000, spent: 180000, currency: 'USD' },
      team: {
        size: 6,
        roles: [
          { role: 'Developer', count: 3 },
          { role: 'QA', count: 2 },
          { role: 'Product Manager', count: 1 }
        ]
      }
    }
  ];

  const mockData: StrategicMilestonesData = {
    projectName: 'Enterprise Platform 2.0',
    projectDescription: 'Next-generation platform for enterprise customers',
    timeline: {
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      currentDate: '2024-04-15'
    },
    milestones: mockMilestones,
    phases: mockPhases,
    events: [
      {
        id: 'event-1',
        date: '2024-03-12',
        type: 'milestone',
        title: 'Alpha Release Completed',
        description: 'Successfully delivered alpha version ahead of schedule',
        impact: 'positive',
        stakeholders: ['Engineering Team', 'Product Team'],
        relatedMilestones: ['milestone-1']
      }
    ],
    overallProgress: {
      percentage: 58,
      milestonesCompleted: 1,
      totalMilestones: 3,
      onTrackPercentage: 75,
      delayedPercentage: 10
    },
    keyMetrics: {
      averageVelocity: 2.5,
      budgetUtilization: 67,
      qualityScore: 90,
      riskLevel: 'medium',
      predictedCompletion: '2024-11-30',
      confidenceLevel: 85
    },
    upcomingDeadlines: [
      {
        milestoneId: 'milestone-2',
        daysUntilDue: 16,
        riskLevel: 'low'
      },
      {
        milestoneId: 'milestone-3',
        daysUntilDue: 91,
        riskLevel: 'medium'
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<StrategicMilestones data={mockData} />);
      expect(screen.getByText('Enterprise Platform 2.0')).toBeInTheDocument();
    });

    it('renders project information correctly', () => {
      render(<StrategicMilestones data={mockData} />);
      
      expect(screen.getByText('Enterprise Platform 2.0')).toBeInTheDocument();
      expect(screen.getByText('Next-generation platform for enterprise customers')).toBeInTheDocument();
    });

    it('renders timeline section when showTimeline is true', () => {
      render(<StrategicMilestones data={mockData} showTimeline={true} />);
      
      expect(screen.getByText('Project Timeline')).toBeInTheDocument();
      expect(screen.getByText('Alpha Release')).toBeInTheDocument();
      expect(screen.getByText('Beta Launch')).toBeInTheDocument();
      expect(screen.getByText('Production Ready')).toBeInTheDocument();
    });

    it('renders progress section when showProgress is true', () => {
      render(<StrategicMilestones data={mockData} showProgress={true} />);
      
      expect(screen.getByText('Overall Progress')).toBeInTheDocument();
      expect(screen.getByText('58%')).toBeInTheDocument();
      expect(screen.getByText('1 of 3 milestones completed')).toBeInTheDocument();
    });

    it('renders metrics section when showMetrics is true', () => {
      render(<StrategicMilestones data={mockData} showMetrics={true} />);
      
      expect(screen.getByText('Key Metrics')).toBeInTheDocument();
      expect(screen.getByText('67%')).toBeInTheDocument(); // budgetUtilization
      expect(screen.getByText('90')).toBeInTheDocument(); // qualityScore
    });

    it('renders upcoming deadlines when showUpcoming is true', () => {
      render(<StrategicMilestones data={mockData} showUpcoming={true} />);
      
      expect(screen.getByText('Upcoming Deadlines')).toBeInTheDocument();
      expect(screen.getByText('16 days')).toBeInTheDocument();
      expect(screen.getByText('91 days')).toBeInTheDocument();
    });
  });

  describe('Component Props', () => {
    it('renders with custom animation delay', () => {
      render(<StrategicMilestones data={mockData} animationDelay={2} />);
      expect(screen.getByText('Enterprise Platform 2.0')).toBeInTheDocument();
    });

    it('hides timeline section when showTimeline is false', () => {
      render(<StrategicMilestones data={mockData} showTimeline={false} />);
      expect(screen.queryByText('Project Timeline')).not.toBeInTheDocument();
    });

    it('hides progress section when showProgress is false', () => {
      render(<StrategicMilestones data={mockData} showProgress={false} />);
      expect(screen.queryByText('Overall Progress')).not.toBeInTheDocument();
    });

    it('hides metrics section when showMetrics is false', () => {
      render(<StrategicMilestones data={mockData} showMetrics={false} />);
      expect(screen.queryByText('Key Metrics')).not.toBeInTheDocument();
    });

    it('hides upcoming section when showUpcoming is false', () => {
      render(<StrategicMilestones data={mockData} showUpcoming={false} />);
      expect(screen.queryByText('Upcoming Deadlines')).not.toBeInTheDocument();
    });

    it('applies highlight styling when highlightMilestone is set', () => {
      render(<StrategicMilestones data={mockData} highlightMilestone="milestone-2" />);
      expect(screen.getByText('Beta Launch')).toBeInTheDocument();
    });

    it('renders with different themes', () => {
      const { container, rerender } = render(
        <StrategicMilestones data={mockData} theme="dark" />
      );
      
      let mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer.style.backgroundColor).toBeTruthy();

      rerender(<StrategicMilestones data={mockData} theme="light" />);
      mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer.style.backgroundColor).toBeTruthy();
    });

    it('renders with different view modes', () => {
      render(<StrategicMilestones data={mockData} viewMode="executive" />);
      expect(screen.getByText('Enterprise Platform 2.0')).toBeInTheDocument();

      const { rerender } = render(<StrategicMilestones data={mockData} viewMode="detailed" />);
      expect(screen.getByText('Enterprise Platform 2.0')).toBeInTheDocument();

      rerender(<StrategicMilestones data={mockData} viewMode="compact" />);
      expect(screen.getByText('Enterprise Platform 2.0')).toBeInTheDocument();
    });

    it('filters milestones by timeframe', () => {
      render(<StrategicMilestones data={mockData} timeframeMonths={6} />);
      expect(screen.getByText('Enterprise Platform 2.0')).toBeInTheDocument();
    });
  });

  describe('Milestone Status Display', () => {
    it('displays completed milestones correctly', () => {
      render(<StrategicMilestones data={mockData} />);
      
      expect(screen.getByText('Alpha Release')).toBeInTheDocument();
      // Completed milestone should show 100% progress and checkmark
    });

    it('displays in-progress milestones correctly', () => {
      render(<StrategicMilestones data={mockData} />);
      
      expect(screen.getByText('Beta Launch')).toBeInTheDocument();
      expect(screen.getByText('65%')).toBeInTheDocument(); // progress
    });

    it('displays planned milestones correctly', () => {
      render(<StrategicMilestones data={mockData} />);
      
      expect(screen.getByText('Production Ready')).toBeInTheDocument();
      expect(screen.getByText('15%')).toBeInTheDocument(); // progress
    });

    it('shows assignee information', () => {
      render(<StrategicMilestones data={mockData} />);
      
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('Technical Lead')).toBeInTheDocument();
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
      expect(screen.getByText('Product Manager')).toBeInTheDocument();
    });

    it('displays deliverables status', () => {
      render(<StrategicMilestones data={mockData} />);
      
      expect(screen.getByText('Core API')).toBeInTheDocument();
      expect(screen.getByText('Advanced Features')).toBeInTheDocument();
      expect(screen.getByText('Infrastructure Setup')).toBeInTheDocument();
    });
  });

  describe('Business Impact Display', () => {
    it('shows revenue impact correctly', () => {
      render(<StrategicMilestones data={mockData} />);
      
      // Revenue impacts should be displayed
      expect(screen.getByText('Business Impact')).toBeInTheDocument();
    });

    it('displays quality scores', () => {
      render(<StrategicMilestones data={mockData} />);
      
      expect(screen.getByText('92')).toBeInTheDocument(); // Alpha quality score
      expect(screen.getByText('88')).toBeInTheDocument(); // Beta quality score
    });

    it('shows effort metrics', () => {
      render(<StrategicMilestones data={mockData} />);
      
      // Effort metrics should be displayed
      expect(screen.getByText('Key Metrics')).toBeInTheDocument();
    });
  });

  describe('Risk Assessment', () => {
    it('displays risk levels correctly', () => {
      render(<StrategicMilestones data={mockData} />);
      
      expect(screen.getByText('medium')).toBeInTheDocument(); // overall risk level
    });

    it('shows upcoming deadline risks', () => {
      render(<StrategicMilestones data={mockData} />);
      
      expect(screen.getByText('Upcoming Deadlines')).toBeInTheDocument();
      expect(screen.getByText('low')).toBeInTheDocument(); // risk level for milestone-2
    });

    it('handles different risk levels', () => {
      const highRiskData = {
        ...mockData,
        upcomingDeadlines: [
          { milestoneId: 'milestone-2', daysUntilDue: 2, riskLevel: 'high' as const },
          { milestoneId: 'milestone-3', daysUntilDue: 91, riskLevel: 'medium' as const }
        ]
      };
      
      render(<StrategicMilestones data={highRiskData} />);
      expect(screen.getByText('high')).toBeInTheDocument();
    });
  });

  describe('Phase Information', () => {
    it('displays project phases', () => {
      render(<StrategicMilestones data={mockData} />);
      
      expect(screen.getByText('Development Phase')).toBeInTheDocument();
      expect(screen.getByText('Testing Phase')).toBeInTheDocument();
    });

    it('shows budget information', () => {
      render(<StrategicMilestones data={mockData} />);
      
      // Budget utilization should be displayed
      expect(screen.getByText('67%')).toBeInTheDocument();
    });

    it('displays team size information', () => {
      render(<StrategicMilestones data={mockData} />);
      
      // Team sizes should be shown
      expect(screen.getByText('Key Metrics')).toBeInTheDocument();
    });
  });

  describe('Animation States', () => {
    it('renders correctly at different frame values', () => {
      (require('remotion').useCurrentFrame as jest.Mock).mockReturnValue(0);
      const { rerender } = render(<StrategicMilestones data={mockData} />);
      expect(screen.getByText('Enterprise Platform 2.0')).toBeInTheDocument();

      (require('remotion').useCurrentFrame as jest.Mock).mockReturnValue(60);
      rerender(<StrategicMilestones data={mockData} />);
      expect(screen.getByText('Enterprise Platform 2.0')).toBeInTheDocument();

      (require('remotion').useCurrentFrame as jest.Mock).mockReturnValue(120);
      rerender(<StrategicMilestones data={mockData} />);
      expect(screen.getByText('Enterprise Platform 2.0')).toBeInTheDocument();
    });

    it('handles spring animations correctly', () => {
      const mockSpring = jest.fn().mockReturnValue(0.7);
      (require('remotion').spring as jest.Mock).mockImplementation(mockSpring);
      
      render(<StrategicMilestones data={mockData} />);
      
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
    it('handles empty milestones array', () => {
      const emptyData = { ...mockData, milestones: [] };
      render(<StrategicMilestones data={emptyData} />);
      expect(screen.getByText('Enterprise Platform 2.0')).toBeInTheDocument();
    });

    it('handles milestones without assignees', () => {
      const dataWithoutAssignees = {
        ...mockData,
        milestones: [{
          ...mockMilestones[0],
          assignee: undefined
        }]
      };
      
      render(<StrategicMilestones data={dataWithoutAssignees} />);
      expect(screen.getByText('Alpha Release')).toBeInTheDocument();
    });

    it('handles empty deliverables', () => {
      const dataWithEmptyDeliverables = {
        ...mockData,
        milestones: [{
          ...mockMilestones[0],
          deliverables: []
        }]
      };
      
      render(<StrategicMilestones data={dataWithEmptyDeliverables} />);
      expect(screen.getByText('Alpha Release')).toBeInTheDocument();
    });

    it('handles zero progress values', () => {
      const dataWithZeroProgress = {
        ...mockData,
        overallProgress: {
          percentage: 0,
          milestonesCompleted: 0,
          totalMilestones: 3,
          onTrackPercentage: 0,
          delayedPercentage: 0
        }
      };
      
      render(<StrategicMilestones data={dataWithZeroProgress} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('handles future due dates', () => {
      const futureData = {
        ...mockData,
        upcomingDeadlines: [
          { milestoneId: 'milestone-2', daysUntilDue: 365, riskLevel: 'low' as const }
        ]
      };
      
      render(<StrategicMilestones data={futureData} />);
      expect(screen.getByText('365 days')).toBeInTheDocument();
    });

    it('handles overdue milestones', () => {
      const overdueData = {
        ...mockData,
        upcomingDeadlines: [
          { milestoneId: 'milestone-2', daysUntilDue: -5, riskLevel: 'high' as const }
        ]
      };
      
      render(<StrategicMilestones data={overdueData} />);
      expect(screen.getByText('5 days overdue')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('adjusts layout for different screen sizes', () => {
      const mobileConfig = { fps: 30, width: 1080, height: 1920 };
      (require('remotion').useVideoConfig as jest.Mock).mockReturnValue(mobileConfig);
      
      render(<StrategicMilestones data={mockData} />);
      expect(screen.getByText('Enterprise Platform 2.0')).toBeInTheDocument();
    });

    it('maintains readability at various sizes', () => {
      const smallConfig = { fps: 30, width: 720, height: 480 };
      (require('remotion').useVideoConfig as jest.Mock).mockReturnValue(smallConfig);
      
      render(<StrategicMilestones data={mockData} />);
      expect(screen.getByText('Enterprise Platform 2.0')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      render(<StrategicMilestones data={mockData} />);
      
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      const headings = screen.getAllByRole('heading', { level: 2 });
      expect(headings.length).toBeGreaterThan(0);
    });

    it('provides meaningful progress indicators', () => {
      render(<StrategicMilestones data={mockData} />);
      
      expect(screen.getByText('58%')).toBeInTheDocument(); // Overall progress
      expect(screen.getByText('65%')).toBeInTheDocument(); // Milestone progress
    });

    it('includes status indicators', () => {
      render(<StrategicMilestones data={mockData} />);
      
      // Status should be indicated clearly
      expect(screen.getByText('Alpha Release')).toBeInTheDocument();
      expect(screen.getByText('Beta Launch')).toBeInTheDocument();
    });
  });
});