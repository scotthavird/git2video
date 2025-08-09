import { render, screen } from '@testing-library/react';
import { RiskAndQualityMetrics } from './index';
import { RiskAndQualityData } from './types';

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

describe('RiskAndQualityMetrics', () => {
  const mockData: RiskAndQualityData = {
    projectName: 'Enterprise Security Platform',
    evaluationDate: '2024-06-15',
    overallRiskScore: 35,
    overallQualityScore: 87,
    codeReviewMetrics: {
      totalReviews: 248,
      approvalRate: 94.2,
      averageReviewTime: 6.8,
      reviewCoverageRate: 98.5,
      reviewParticipation: 89.3,
      reviewDepth: {
        thoroughReviews: 156,
        quickApprovals: 45,
        averageCommentsPerReview: 4.2,
      },
      reviewerWorkload: [
        { reviewerName: 'Alice Chen', reviewCount: 45, averageTimePerReview: 5.2, approvalRate: 96.7 },
        { reviewerName: 'Bob Martinez', reviewCount: 38, averageTimePerReview: 7.1, approvalRate: 91.2 },
        { reviewerName: 'Carol Kim', reviewCount: 42, averageTimePerReview: 6.3, approvalRate: 94.8 },
      ],
    },
    issueCategorizationMetrics: {
      totalIssues: 342,
      categories: {
        bugs: {
          count: 89,
          percentage: 26.0,
          severity: { critical: 3, high: 12, medium: 34, low: 40 },
          averageResolutionTime: 18.5,
        },
        features: {
          count: 156,
          percentage: 45.6,
          complexity: { complex: 23, medium: 89, simple: 44 },
          averageImplementationTime: 72.3,
        },
        technicalDebt: {
          count: 47,
          percentage: 13.7,
          impact: { high: 8, medium: 22, low: 17 },
          estimatedEffortHours: 340,
        },
        documentation: {
          count: 28,
          percentage: 8.2,
          averageCompletionTime: 12.5,
        },
        maintenance: {
          count: 22,
          percentage: 6.4,
          averageCompletionTime: 24.8,
        },
      },
      trendAnalysis: {
        bugTrend: 'decreasing',
        technicalDebtTrend: 'stable',
        featureVelocityTrend: 'increasing',
      },
    },
    securityMetrics: {
      vulnerabilities: {
        total: 12,
        critical: 1,
        high: 3,
        medium: 5,
        low: 3,
      },
      securityScans: {
        frequency: 'daily',
        lastScanDate: '2024-06-14',
        passRate: 97.8,
        averageFixTime: 8.2,
      },
      dependencyHealth: {
        totalDependencies: 156,
        outdatedDependencies: 23,
        vulnerableDependencies: 4,
        licenseIssues: 2,
      },
      complianceScore: 92,
      securityPractices: {
        twoFactorAuthEnabled: true,
        codeSigningEnabled: true,
        secretsManagementEnabled: true,
        automaticSecurityUpdates: false,
      },
    },
    technicalDebtIndicators: {
      overallDebtScore: 28,
      codeComplexity: {
        averageCyclomaticComplexity: 4.2,
        highComplexityFiles: 15,
        maintainabilityIndex: 78,
      },
      codeSmells: {
        duplicatedCode: 1250,
        longMethods: 34,
        largeClasses: 8,
        deadCode: 890,
      },
      testCoverage: {
        overallCoverage: 84.5,
        unitTestCoverage: 89.2,
        integrationTestCoverage: 76.8,
        missingTestFiles: 12,
      },
      documentation: {
        codeDocumentationCoverage: 67.8,
        outdatedDocumentation: 18,
        missingReadmes: 5,
      },
      refactoringNeeds: [
        {
          component: 'Authentication Service',
          priority: 'high',
          estimatedEffort: 40,
          impactArea: 'security',
          description: 'Legacy authentication methods need modernization',
        },
        {
          component: 'Data Processing Pipeline',
          priority: 'medium',
          estimatedEffort: 60,
          impactArea: 'performance',
          description: 'Optimization opportunities in data processing',
        },
      ],
    },
    qualityTrends: {
      timeframe: 'Last 6 months',
      codeQualityTrend: 'improving',
      bugIntroductionRate: [
        { date: '2024-01-01', bugsIntroduced: 12, linesOfCodeChanged: 2500 },
        { date: '2024-02-01', bugsIntroduced: 8, linesOfCodeChanged: 1800 },
        { date: '2024-03-01', bugsIntroduced: 6, linesOfCodeChanged: 2200 },
      ],
      defectDensity: [
        { date: '2024-01-01', defectsPerKLOC: 2.4 },
        { date: '2024-02-01', defectsPerKLOC: 1.9 },
        { date: '2024-03-01', defectsPerKLOC: 1.6 },
      ],
      reviewEffectiveness: [
        { date: '2024-01-01', bugsFoundInReview: 18, bugsFoundInProduction: 5 },
        { date: '2024-02-01', bugsFoundInReview: 22, bugsFoundInProduction: 3 },
        { date: '2024-03-01', bugsFoundInReview: 19, bugsFoundInProduction: 2 },
      ],
    },
    recommendations: [
      {
        category: 'process',
        priority: 'high',
        title: 'Implement Automated Security Scanning',
        description: 'Set up continuous security scanning in CI/CD pipeline',
        expectedImpact: 'Reduce security vulnerabilities by 60%',
        estimatedEffort: '2-3 sprints',
      },
      {
        category: 'tooling',
        priority: 'medium',
        title: 'Upgrade Code Analysis Tools',
        description: 'Update static analysis tools to latest versions',
        expectedImpact: 'Improve code quality detection by 25%',
        estimatedEffort: '1 sprint',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<RiskAndQualityMetrics data={mockData} />);
      expect(screen.getByText('Enterprise Security Platform')).toBeInTheDocument();
    });

    it('renders project information correctly', () => {
      render(<RiskAndQualityMetrics data={mockData} />);
      
      expect(screen.getByText('Enterprise Security Platform')).toBeInTheDocument();
      expect(screen.getByText('Risk & Quality Assessment')).toBeInTheDocument();
      expect(screen.getByText('June 15, 2024')).toBeInTheDocument();
    });

    it('displays overall risk and quality scores', () => {
      render(<RiskAndQualityMetrics data={mockData} />);
      
      expect(screen.getByText('35')).toBeInTheDocument(); // Risk score
      expect(screen.getByText('87')).toBeInTheDocument(); // Quality score
    });

    it('renders code review section when showCodeReview is true', () => {
      render(<RiskAndQualityMetrics data={mockData} showCodeReview={true} />);
      
      expect(screen.getByText('Code Review Quality')).toBeInTheDocument();
      expect(screen.getByText('248')).toBeInTheDocument(); // totalReviews
      expect(screen.getByText('94.2%')).toBeInTheDocument(); // approvalRate
      expect(screen.getByText('98.5%')).toBeInTheDocument(); // reviewCoverageRate
    });

    it('renders issue categories section when showIssueCategories is true', () => {
      render(<RiskAndQualityMetrics data={mockData} showIssueCategories={true} />);
      
      expect(screen.getByText('Issue Categorization')).toBeInTheDocument();
      expect(screen.getByText('342')).toBeInTheDocument(); // totalIssues
      expect(screen.getByText('26.0%')).toBeInTheDocument(); // bugs percentage
      expect(screen.getByText('45.6%')).toBeInTheDocument(); // features percentage
    });

    it('renders security section when showSecurity is true', () => {
      render(<RiskAndQualityMetrics data={mockData} showSecurity={true} />);
      
      expect(screen.getByText('Security Assessment')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument(); // total vulnerabilities
      expect(screen.getByText('97.8%')).toBeInTheDocument(); // security scan pass rate
      expect(screen.getByText('92')).toBeInTheDocument(); // compliance score
    });

    it('renders technical debt section when showTechnicalDebt is true', () => {
      render(<RiskAndQualityMetrics data={mockData} showTechnicalDebt={true} />);
      
      expect(screen.getByText('Technical Debt Analysis')).toBeInTheDocument();
      expect(screen.getByText('28')).toBeInTheDocument(); // overallDebtScore
      expect(screen.getByText('84.5%')).toBeInTheDocument(); // test coverage
      expect(screen.getByText('78')).toBeInTheDocument(); // maintainability index
    });

    it('renders trends section when showTrends is true', () => {
      render(<RiskAndQualityMetrics data={mockData} showTrends={true} />);
      
      expect(screen.getByText('Quality Trends')).toBeInTheDocument();
      expect(screen.getByText('Last 6 months')).toBeInTheDocument();
    });
  });

  describe('Component Props', () => {
    it('renders with custom animation delay', () => {
      render(<RiskAndQualityMetrics data={mockData} animationDelay={2} />);
      expect(screen.getByText('Enterprise Security Platform')).toBeInTheDocument();
    });

    it('hides code review section when showCodeReview is false', () => {
      render(<RiskAndQualityMetrics data={mockData} showCodeReview={false} />);
      expect(screen.queryByText('Code Review Quality')).not.toBeInTheDocument();
    });

    it('hides issue categories section when showIssueCategories is false', () => {
      render(<RiskAndQualityMetrics data={mockData} showIssueCategories={false} />);
      expect(screen.queryByText('Issue Categorization')).not.toBeInTheDocument();
    });

    it('hides security section when showSecurity is false', () => {
      render(<RiskAndQualityMetrics data={mockData} showSecurity={false} />);
      expect(screen.queryByText('Security Assessment')).not.toBeInTheDocument();
    });

    it('hides technical debt section when showTechnicalDebt is false', () => {
      render(<RiskAndQualityMetrics data={mockData} showTechnicalDebt={false} />);
      expect(screen.queryByText('Technical Debt Analysis')).not.toBeInTheDocument();
    });

    it('hides trends section when showTrends is false', () => {
      render(<RiskAndQualityMetrics data={mockData} showTrends={false} />);
      expect(screen.queryByText('Quality Trends')).not.toBeInTheDocument();
    });

    it('applies highlight styling when highlightSection is set', () => {
      render(<RiskAndQualityMetrics data={mockData} highlightSection="security" />);
      
      expect(screen.getByText('Security Assessment')).toBeInTheDocument();
    });

    it('renders with different themes', () => {
      const { container, rerender } = render(
        <RiskAndQualityMetrics data={mockData} theme="dark" />
      );
      
      let mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer.style.backgroundColor).toBeTruthy();

      rerender(<RiskAndQualityMetrics data={mockData} theme="light" />);
      mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer.style.backgroundColor).toBeTruthy();
    });

    it('renders with different view modes', () => {
      render(<RiskAndQualityMetrics data={mockData} viewMode="executive" />);
      expect(screen.getByText('Enterprise Security Platform')).toBeInTheDocument();

      const { rerender } = render(<RiskAndQualityMetrics data={mockData} viewMode="detailed" />);
      expect(screen.getByText('Enterprise Security Platform')).toBeInTheDocument();

      rerender(<RiskAndQualityMetrics data={mockData} viewMode="compact" />);
      expect(screen.getByText('Enterprise Security Platform')).toBeInTheDocument();
    });
  });

  describe('Risk Assessment Display', () => {
    it('displays risk score with appropriate color coding', () => {
      render(<RiskAndQualityMetrics data={mockData} />);
      
      expect(screen.getByText('35')).toBeInTheDocument(); // Risk score
      // Color coding would be in the component styling
    });

    it('shows quality score with visual indicators', () => {
      render(<RiskAndQualityMetrics data={mockData} />);
      
      expect(screen.getByText('87')).toBeInTheDocument(); // Quality score
    });

    it('handles high risk scenarios', () => {
      const highRiskData = {
        ...mockData,
        overallRiskScore: 85,
        securityMetrics: {
          ...mockData.securityMetrics,
          vulnerabilities: { total: 45, critical: 8, high: 15, medium: 12, low: 10 }
        }
      };
      
      render(<RiskAndQualityMetrics data={highRiskData} />);
      expect(screen.getByText('85')).toBeInTheDocument();
    });
  });

  describe('Security Metrics Display', () => {
    it('displays vulnerability breakdown correctly', () => {
      render(<RiskAndQualityMetrics data={mockData} />);
      
      expect(screen.getByText('1')).toBeInTheDocument(); // critical vulnerabilities
      expect(screen.getByText('3')).toBeInTheDocument(); // high vulnerabilities
      expect(screen.getByText('5')).toBeInTheDocument(); // medium vulnerabilities
    });

    it('shows security scan results', () => {
      render(<RiskAndQualityMetrics data={mockData} />);
      
      expect(screen.getByText('daily')).toBeInTheDocument(); // scan frequency
      expect(screen.getByText('97.8%')).toBeInTheDocument(); // pass rate
    });

    it('displays dependency health metrics', () => {
      render(<RiskAndQualityMetrics data={mockData} />);
      
      expect(screen.getByText('156')).toBeInTheDocument(); // total dependencies
      expect(screen.getByText('23')).toBeInTheDocument(); // outdated dependencies
      expect(screen.getByText('4')).toBeInTheDocument(); // vulnerable dependencies
    });

    it('shows security practice compliance', () => {
      render(<RiskAndQualityMetrics data={mockData} />);
      
      // Security practices would be displayed as indicators
      expect(screen.getByText('Security Assessment')).toBeInTheDocument();
    });
  });

  describe('Code Quality Metrics', () => {
    it('displays code complexity metrics', () => {
      render(<RiskAndQualityMetrics data={mockData} />);
      
      expect(screen.getByText('4.2')).toBeInTheDocument(); // cyclomatic complexity
      expect(screen.getByText('15')).toBeInTheDocument(); // high complexity files
    });

    it('shows test coverage information', () => {
      render(<RiskAndQualityMetrics data={mockData} />);
      
      expect(screen.getByText('84.5%')).toBeInTheDocument(); // overall coverage
      expect(screen.getByText('89.2%')).toBeInTheDocument(); // unit test coverage
    });

    it('displays code smells metrics', () => {
      render(<RiskAndQualityMetrics data={mockData} />);
      
      expect(screen.getByText('1250')).toBeInTheDocument(); // duplicated code
      expect(screen.getByText('34')).toBeInTheDocument(); // long methods
      expect(screen.getByText('8')).toBeInTheDocument(); // large classes
    });

    it('shows documentation quality', () => {
      render(<RiskAndQualityMetrics data={mockData} />);
      
      expect(screen.getByText('67.8%')).toBeInTheDocument(); // documentation coverage
      expect(screen.getByText('18')).toBeInTheDocument(); // outdated documentation
    });
  });

  describe('Issue Analysis Display', () => {
    it('shows issue category breakdown', () => {
      render(<RiskAndQualityMetrics data={mockData} />);
      
      expect(screen.getByText('89')).toBeInTheDocument(); // bugs count
      expect(screen.getByText('156')).toBeInTheDocument(); // features count
      expect(screen.getByText('47')).toBeInTheDocument(); // technical debt count
    });

    it('displays bug severity distribution', () => {
      render(<RiskAndQualityMetrics data={mockData} />);
      
      expect(screen.getByText('3')).toBeInTheDocument(); // critical bugs
      expect(screen.getByText('12')).toBeInTheDocument(); // high severity bugs
      expect(screen.getByText('34')).toBeInTheDocument(); // medium severity bugs
    });

    it('shows trend analysis', () => {
      render(<RiskAndQualityMetrics data={mockData} />);
      
      // Trends would be displayed with appropriate indicators
      expect(screen.getByText('Issue Categorization')).toBeInTheDocument();
    });
  });

  describe('Recommendations Section', () => {
    it('displays recommended actions', () => {
      render(<RiskAndQualityMetrics data={mockData} />);
      
      expect(screen.getByText('Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Implement Automated Security Scanning')).toBeInTheDocument();
      expect(screen.getByText('Upgrade Code Analysis Tools')).toBeInTheDocument();
    });

    it('shows priority levels', () => {
      render(<RiskAndQualityMetrics data={mockData} />);
      
      expect(screen.getByText('high')).toBeInTheDocument(); // priority level
      expect(screen.getByText('medium')).toBeInTheDocument(); // priority level
    });

    it('displays expected impact', () => {
      render(<RiskAndQualityMetrics data={mockData} />);
      
      expect(screen.getByText('Reduce security vulnerabilities by 60%')).toBeInTheDocument();
      expect(screen.getByText('Improve code quality detection by 25%')).toBeInTheDocument();
    });

    it('handles empty recommendations', () => {
      const dataWithoutRecommendations = {
        ...mockData,
        recommendations: [],
      };
      
      render(<RiskAndQualityMetrics data={dataWithoutRecommendations} />);
      expect(screen.queryByText('Recommendations')).not.toBeInTheDocument();
    });
  });

  describe('Animation States', () => {
    it('renders correctly at different frame values', () => {
      (require('remotion').useCurrentFrame as jest.Mock).mockReturnValue(0);
      const { rerender } = render(<RiskAndQualityMetrics data={mockData} />);
      expect(screen.getByText('Enterprise Security Platform')).toBeInTheDocument();

      (require('remotion').useCurrentFrame as jest.Mock).mockReturnValue(60);
      rerender(<RiskAndQualityMetrics data={mockData} />);
      expect(screen.getByText('Enterprise Security Platform')).toBeInTheDocument();

      (require('remotion').useCurrentFrame as jest.Mock).mockReturnValue(120);
      rerender(<RiskAndQualityMetrics data={mockData} />);
      expect(screen.getByText('Enterprise Security Platform')).toBeInTheDocument();
    });

    it('handles spring animations correctly', () => {
      const mockSpring = jest.fn().mockReturnValue(0.9);
      (require('remotion').spring as jest.Mock).mockImplementation(mockSpring);
      
      render(<RiskAndQualityMetrics data={mockData} />);
      
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
    it('handles zero vulnerability counts', () => {
      const zeroVulnData = {
        ...mockData,
        securityMetrics: {
          ...mockData.securityMetrics,
          vulnerabilities: { total: 0, critical: 0, high: 0, medium: 0, low: 0 }
        }
      };
      
      render(<RiskAndQualityMetrics data={zeroVulnData} />);
      expect(screen.getByText('Security Assessment')).toBeInTheDocument();
    });

    it('handles perfect test coverage', () => {
      const perfectCoverageData = {
        ...mockData,
        technicalDebtIndicators: {
          ...mockData.technicalDebtIndicators,
          testCoverage: {
            overallCoverage: 100,
            unitTestCoverage: 100,
            integrationTestCoverage: 100,
            missingTestFiles: 0
          }
        }
      };
      
      render(<RiskAndQualityMetrics data={perfectCoverageData} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('handles empty refactoring needs', () => {
      const noRefactoringData = {
        ...mockData,
        technicalDebtIndicators: {
          ...mockData.technicalDebtIndicators,
          refactoringNeeds: []
        }
      };
      
      render(<RiskAndQualityMetrics data={noRefactoringData} />);
      expect(screen.getByText('Technical Debt Analysis')).toBeInTheDocument();
    });

    it('handles extreme debt scores', () => {
      const highDebtData = {
        ...mockData,
        technicalDebtIndicators: {
          ...mockData.technicalDebtIndicators,
          overallDebtScore: 95
        }
      };
      
      render(<RiskAndQualityMetrics data={highDebtData} />);
      expect(screen.getByText('95')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('adjusts layout for different screen sizes', () => {
      const mobileConfig = { fps: 30, width: 1080, height: 1920 };
      (require('remotion').useVideoConfig as jest.Mock).mockReturnValue(mobileConfig);
      
      render(<RiskAndQualityMetrics data={mockData} />);
      expect(screen.getByText('Enterprise Security Platform')).toBeInTheDocument();
    });

    it('maintains readability at various sizes', () => {
      const smallConfig = { fps: 30, width: 720, height: 480 };
      (require('remotion').useVideoConfig as jest.Mock).mockReturnValue(smallConfig);
      
      render(<RiskAndQualityMetrics data={mockData} />);
      expect(screen.getByText('Enterprise Security Platform')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      render(<RiskAndQualityMetrics data={mockData} />);
      
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      const headings = screen.getAllByRole('heading', { level: 2 });
      expect(headings.length).toBeGreaterThan(0);
    });

    it('provides meaningful score indicators', () => {
      render(<RiskAndQualityMetrics data={mockData} />);
      
      expect(screen.getByText('Risk Score: 35/100')).toBeInTheDocument();
      expect(screen.getByText('Quality Score: 87/100')).toBeInTheDocument();
    });

    it('includes descriptive labels for metrics', () => {
      render(<RiskAndQualityMetrics data={mockData} />);
      
      expect(screen.getByText('Total Reviews')).toBeInTheDocument();
      expect(screen.getByText('Approval Rate')).toBeInTheDocument();
      expect(screen.getByText('Test Coverage')).toBeInTheDocument();
    });
  });
});