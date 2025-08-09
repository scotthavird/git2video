import { z } from 'zod';

export interface CodeReviewMetrics {
  totalReviews: number;
  approvalRate: number; // percentage
  averageReviewTime: number; // hours
  reviewCoverageRate: number; // percentage of PRs that get reviewed
  reviewParticipation: number; // percentage of team members participating
  reviewDepth: {
    thoroughReviews: number; // reviews with 3+ comments
    quickApprovals: number; // reviews with 0 comments
    averageCommentsPerReview: number;
  };
  reviewerWorkload: Array<{
    reviewerName: string;
    reviewCount: number;
    averageTimePerReview: number;
    approvalRate: number;
  }>;
}

export interface IssueCategorizationMetrics {
  totalIssues: number;
  categories: {
    bugs: {
      count: number;
      percentage: number;
      severity: {
        critical: number;
        high: number;
        medium: number;
        low: number;
      };
      averageResolutionTime: number; // hours
    };
    features: {
      count: number;
      percentage: number;
      complexity: {
        complex: number;
        medium: number;
        simple: number;
      };
      averageImplementationTime: number; // hours
    };
    technicalDebt: {
      count: number;
      percentage: number;
      impact: {
        high: number;
        medium: number;
        low: number;
      };
      estimatedEffortHours: number;
    };
    documentation: {
      count: number;
      percentage: number;
      averageCompletionTime: number;
    };
    maintenance: {
      count: number;
      percentage: number;
      averageCompletionTime: number;
    };
  };
  trendAnalysis: {
    bugTrend: 'increasing' | 'stable' | 'decreasing';
    technicalDebtTrend: 'increasing' | 'stable' | 'decreasing';
    featureVelocityTrend: 'increasing' | 'stable' | 'decreasing';
  };
}

export interface SecurityMetrics {
  vulnerabilities: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  securityScans: {
    frequency: string; // e.g., "daily", "weekly"
    lastScanDate: string;
    passRate: number; // percentage
    averageFixTime: number; // hours
  };
  dependencyHealth: {
    totalDependencies: number;
    outdatedDependencies: number;
    vulnerableDependencies: number;
    licenseIssues: number;
  };
  complianceScore: number; // 0-100
  securityPractices: {
    twoFactorAuthEnabled: boolean;
    codeSigningEnabled: boolean;
    secretsManagementEnabled: boolean;
    automaticSecurityUpdates: boolean;
  };
}

export interface TechnicalDebtIndicators {
  overallDebtScore: number; // 0-100 (higher is worse)
  codeComplexity: {
    averageCyclomaticComplexity: number;
    highComplexityFiles: number;
    maintainabilityIndex: number; // 0-100
  };
  codeSmells: {
    duplicatedCode: number; // lines
    longMethods: number;
    largeClasses: number;
    deadCode: number; // lines
  };
  testCoverage: {
    overallCoverage: number; // percentage
    unitTestCoverage: number;
    integrationTestCoverage: number;
    missingTestFiles: number;
  };
  documentation: {
    codeDocumentationCoverage: number; // percentage
    outdatedDocumentation: number; // count
    missingReadmes: number;
  };
  refactoringNeeds: Array<{
    component: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    estimatedEffort: number; // hours
    impactArea: 'performance' | 'maintainability' | 'security' | 'scalability';
    description: string;
  }>;
}

export interface QualityTrends {
  timeframe: string; // e.g., "Last 3 months"
  codeQualityTrend: 'improving' | 'stable' | 'declining';
  bugIntroductionRate: Array<{
    date: string;
    bugsIntroduced: number;
    linesOfCodeChanged: number;
  }>;
  defectDensity: Array<{
    date: string;
    defectsPerKLOC: number; // defects per thousand lines of code
  }>;
  reviewEffectiveness: Array<{
    date: string;
    bugsFoundInReview: number;
    bugsFoundInProduction: number;
  }>;
}

export interface RiskAndQualityData {
  projectName: string;
  evaluationDate: string;
  overallRiskScore: number; // 0-100 (higher is riskier)
  overallQualityScore: number; // 0-100
  codeReviewMetrics: CodeReviewMetrics;
  issueCategorizationMetrics: IssueCategorizationMetrics;
  securityMetrics: SecurityMetrics;
  technicalDebtIndicators: TechnicalDebtIndicators;
  qualityTrends: QualityTrends;
  recommendations: Array<{
    category: 'process' | 'tooling' | 'training' | 'architecture';
    priority: 'immediate' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    expectedImpact: string;
    estimatedEffort: string;
  }>;
}

export interface RiskAndQualityMetricsProps {
  data: RiskAndQualityData;
  animationDelay?: number;
  showCodeReview?: boolean;
  showIssueCategories?: boolean;
  showSecurity?: boolean;
  showTechnicalDebt?: boolean;
  showTrends?: boolean;
  highlightSection?: 'review' | 'issues' | 'security' | 'debt' | 'trends' | null;
  theme?: 'light' | 'dark' | 'github';
  viewMode?: 'executive' | 'detailed' | 'compact';
}

// Zod schema for prop validation
export const RiskAndQualityMetricsSchema = z.object({
  data: z.object({
    projectName: z.string(),
    evaluationDate: z.string(),
    overallRiskScore: z.number().min(0).max(100),
    overallQualityScore: z.number().min(0).max(100),
    codeReviewMetrics: z.object({
      totalReviews: z.number(),
      approvalRate: z.number().min(0).max(100),
      averageReviewTime: z.number(),
      reviewCoverageRate: z.number().min(0).max(100),
      reviewParticipation: z.number().min(0).max(100),
      reviewDepth: z.object({
        thoroughReviews: z.number(),
        quickApprovals: z.number(),
        averageCommentsPerReview: z.number(),
      }),
      reviewerWorkload: z.array(z.object({
        reviewerName: z.string(),
        reviewCount: z.number(),
        averageTimePerReview: z.number(),
        approvalRate: z.number().min(0).max(100),
      })),
    }),
    issueCategorizationMetrics: z.object({
      totalIssues: z.number(),
      categories: z.object({
        bugs: z.object({
          count: z.number(),
          percentage: z.number().min(0).max(100),
          severity: z.object({
            critical: z.number(),
            high: z.number(),
            medium: z.number(),
            low: z.number(),
          }),
          averageResolutionTime: z.number(),
        }),
        features: z.object({
          count: z.number(),
          percentage: z.number().min(0).max(100),
          complexity: z.object({
            complex: z.number(),
            medium: z.number(),
            simple: z.number(),
          }),
          averageImplementationTime: z.number(),
        }),
        technicalDebt: z.object({
          count: z.number(),
          percentage: z.number().min(0).max(100),
          impact: z.object({
            high: z.number(),
            medium: z.number(),
            low: z.number(),
          }),
          estimatedEffortHours: z.number(),
        }),
        documentation: z.object({
          count: z.number(),
          percentage: z.number().min(0).max(100),
          averageCompletionTime: z.number(),
        }),
        maintenance: z.object({
          count: z.number(),
          percentage: z.number().min(0).max(100),
          averageCompletionTime: z.number(),
        }),
      }),
      trendAnalysis: z.object({
        bugTrend: z.enum(['increasing', 'stable', 'decreasing']),
        technicalDebtTrend: z.enum(['increasing', 'stable', 'decreasing']),
        featureVelocityTrend: z.enum(['increasing', 'stable', 'decreasing']),
      }),
    }),
    securityMetrics: z.object({
      vulnerabilities: z.object({
        total: z.number(),
        critical: z.number(),
        high: z.number(),
        medium: z.number(),
        low: z.number(),
      }),
      securityScans: z.object({
        frequency: z.string(),
        lastScanDate: z.string(),
        passRate: z.number().min(0).max(100),
        averageFixTime: z.number(),
      }),
      dependencyHealth: z.object({
        totalDependencies: z.number(),
        outdatedDependencies: z.number(),
        vulnerableDependencies: z.number(),
        licenseIssues: z.number(),
      }),
      complianceScore: z.number().min(0).max(100),
      securityPractices: z.object({
        twoFactorAuthEnabled: z.boolean(),
        codeSigningEnabled: z.boolean(),
        secretsManagementEnabled: z.boolean(),
        automaticSecurityUpdates: z.boolean(),
      }),
    }),
    technicalDebtIndicators: z.object({
      overallDebtScore: z.number().min(0).max(100),
      codeComplexity: z.object({
        averageCyclomaticComplexity: z.number(),
        highComplexityFiles: z.number(),
        maintainabilityIndex: z.number().min(0).max(100),
      }),
      codeSmells: z.object({
        duplicatedCode: z.number(),
        longMethods: z.number(),
        largeClasses: z.number(),
        deadCode: z.number(),
      }),
      testCoverage: z.object({
        overallCoverage: z.number().min(0).max(100),
        unitTestCoverage: z.number().min(0).max(100),
        integrationTestCoverage: z.number().min(0).max(100),
        missingTestFiles: z.number(),
      }),
      documentation: z.object({
        codeDocumentationCoverage: z.number().min(0).max(100),
        outdatedDocumentation: z.number(),
        missingReadmes: z.number(),
      }),
      refactoringNeeds: z.array(z.object({
        component: z.string(),
        priority: z.enum(['critical', 'high', 'medium', 'low']),
        estimatedEffort: z.number(),
        impactArea: z.enum(['performance', 'maintainability', 'security', 'scalability']),
        description: z.string(),
      })),
    }),
    qualityTrends: z.object({
      timeframe: z.string(),
      codeQualityTrend: z.enum(['improving', 'stable', 'declining']),
      bugIntroductionRate: z.array(z.object({
        date: z.string(),
        bugsIntroduced: z.number(),
        linesOfCodeChanged: z.number(),
      })),
      defectDensity: z.array(z.object({
        date: z.string(),
        defectsPerKLOC: z.number(),
      })),
      reviewEffectiveness: z.array(z.object({
        date: z.string(),
        bugsFoundInReview: z.number(),
        bugsFoundInProduction: z.number(),
      })),
    }),
    recommendations: z.array(z.object({
      category: z.enum(['process', 'tooling', 'training', 'architecture']),
      priority: z.enum(['immediate', 'high', 'medium', 'low']),
      title: z.string(),
      description: z.string(),
      expectedImpact: z.string(),
      estimatedEffort: z.string(),
    })),
  }),
  animationDelay: z.number().default(0),
  showCodeReview: z.boolean().default(true),
  showIssueCategories: z.boolean().default(true),
  showSecurity: z.boolean().default(true),
  showTechnicalDebt: z.boolean().default(true),
  showTrends: z.boolean().default(true),
  highlightSection: z.enum(['review', 'issues', 'security', 'debt', 'trends']).nullable().default(null),
  theme: z.enum(['light', 'dark', 'github']).default('github'),
  viewMode: z.enum(['executive', 'detailed', 'compact']).default('executive'),
});