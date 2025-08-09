import { z } from 'zod';

export interface DevelopmentVelocityMetrics {
  sprintVelocity: Array<{
    sprintNumber: number;
    sprintDate: string;
    storyPointsCompleted: number;
    storyPointsPlanned: number;
    teamSize: number;
    velocityPerDeveloper: number;
  }>;
  burndownEfficiency: number; // 0-100 percentage
  predictabilityScore: number; // 0-100 how consistent velocity is
  averageVelocity: number; // story points per sprint
  velocityTrend: 'increasing' | 'stable' | 'decreasing';
  cycleTime: {
    averageDays: number;
    improvementRate: number; // percentage improvement over time
  };
}

export interface ResourceAllocationMetrics {
  totalDevelopers: number;
  totalHoursAllocated: number;
  hoursSpentDevelopment: number;
  hoursSpentMaintenance: number;
  hoursSpentMeetings: number;
  hoursSpentBugFixes: number;
  utilizationRate: number; // 0-100 percentage
  costPerHour: number;
  totalProjectCost: number;
  budgetUtilization: number; // 0-100 percentage
  roleDistribution: Array<{
    role: 'senior' | 'mid' | 'junior' | 'lead' | 'architect';
    count: number;
    averageCost: number;
    utilization: number;
  }>;
}

export interface FeatureDeliveryImpact {
  featuresDelivered: number;
  featuresPlanned: number;
  deliveryRate: number; // 0-100 percentage
  businessValue: Array<{
    featureName: string;
    deliveryDate: string;
    businessImpact: 'high' | 'medium' | 'low';
    userAdoption: number; // 0-100 percentage
    revenueImpact: number; // currency value
    costToDeliver: number; // currency value
    roi: number; // percentage
    timeToValue: number; // days from delivery to impact
  }>;
  averageTimeToMarket: number; // days
  qualityMetrics: {
    bugReports: number;
    customerSatisfaction: number; // 0-100
    performanceImpact: number; // percentage improvement/degradation
  };
}

export interface CommunityEngagementMetrics {
  repositoryMetrics: {
    stars: number;
    starGrowthRate: number; // percentage month over month
    forks: number;
    forkGrowthRate: number;
    watchers: number;
    watcherGrowthRate: number;
    downloads: number;
    downloadGrowthRate: number;
  };
  contributorMetrics: {
    totalContributors: number;
    activeContributors: number; // contributors in last 3 months
    newContributors: number; // new contributors in last quarter
    retentionRate: number; // 0-100 percentage of contributors still active
    diversityIndex: number; // 0-100 measure of contributor diversity
  };
  communityHealth: {
    issueResponseTime: number; // hours
    prReviewTime: number; // hours
    communityScore: number; // 0-100 overall community health
    documentationQuality: number; // 0-100
    onboardingEffectiveness: number; // 0-100
  };
  adoption: {
    enterpriseAdoption: number; // number of enterprise users
    individualAdoption: number; // number of individual users
    geographicalSpread: Array<{
      region: string;
      userCount: number;
      growthRate: number;
    }>;
  };
}

export interface CostBenefitAnalysis {
  development: {
    totalCost: number;
    costPerFeature: number;
    costPerStoryPoint: number;
    maintenanceCostRatio: number; // maintenance cost as percentage of development cost
  };
  revenue: {
    directRevenue: number; // revenue directly attributed to the project
    costSavings: number; // operational cost savings
    efficiencyGains: number; // productivity improvements value
    riskMitigation: number; // value of risks mitigated
  };
  roi: {
    overallROI: number; // percentage
    paybackPeriod: number; // months
    netPresentValue: number; // NPV
    internalRateOfReturn: number; // IRR percentage
  };
  projections: Array<{
    quarter: string;
    projectedCost: number;
    projectedRevenue: number;
    projectedROI: number;
    confidence: number; // 0-100 confidence in projection
  }>;
}

export interface ProductivityMetrics {
  codeMetrics: {
    linesOfCodePerDeveloper: number;
    functionalityPerLOC: number; // business value per line of code
    codeReuseRate: number; // 0-100 percentage
    technicalDebtRatio: number; // 0-100 percentage
  };
  processMetrics: {
    deploymentFrequency: number; // deployments per month
    leadTimeForChanges: number; // hours
    meanTimeToRecovery: number; // hours
    changeFailureRate: number; // 0-100 percentage
  };
  qualityMetrics: {
    defectRate: number; // defects per KLOC
    testCoverage: number; // 0-100 percentage
    automationRate: number; // 0-100 percentage of automated processes
    customerSatisfactionScore: number; // 0-100
  };
}

export interface ROIVisualizationData {
  projectName: string;
  evaluationPeriod: {
    startDate: string;
    endDate: string;
    periodLabel: string;
  };
  developmentVelocity: DevelopmentVelocityMetrics;
  resourceAllocation: ResourceAllocationMetrics;
  featureDeliveryImpact: FeatureDeliveryImpact;
  communityEngagement: CommunityEngagementMetrics;
  costBenefitAnalysis: CostBenefitAnalysis;
  productivityMetrics: ProductivityMetrics;
  overallROI: number; // main ROI percentage
  riskFactors: Array<{
    category: 'technical' | 'market' | 'resource' | 'timeline';
    risk: string;
    probability: number; // 0-100
    impact: 'low' | 'medium' | 'high';
    mitigation: string;
  }>;
  recommendations: Array<{
    category: 'investment' | 'optimization' | 'scaling' | 'pivot';
    priority: 'immediate' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    expectedROIImprovement: number; // percentage
    implementationCost: number;
    timeframe: string;
  }>;
}

export interface ROIVisualizationProps {
  data: ROIVisualizationData;
  animationDelay?: number;
  showVelocityMetrics?: boolean;
  showResourceAllocation?: boolean;
  showFeatureImpact?: boolean;
  showCommunityMetrics?: boolean;
  showCostBenefit?: boolean;
  highlightSection?: 'velocity' | 'resources' | 'features' | 'community' | 'roi' | null;
  theme?: 'light' | 'dark' | 'github';
  viewMode?: 'executive' | 'detailed' | 'strategic';
  timeframe?: 'quarter' | 'year' | 'project';
}

// Zod schema for prop validation
export const ROIVisualizationSchema = z.object({
  data: z.object({
    projectName: z.string(),
    evaluationPeriod: z.object({
      startDate: z.string(),
      endDate: z.string(),
      periodLabel: z.string(),
    }),
    developmentVelocity: z.object({
      sprintVelocity: z.array(z.object({
        sprintNumber: z.number(),
        sprintDate: z.string(),
        storyPointsCompleted: z.number(),
        storyPointsPlanned: z.number(),
        teamSize: z.number(),
        velocityPerDeveloper: z.number(),
      })),
      burndownEfficiency: z.number().min(0).max(100),
      predictabilityScore: z.number().min(0).max(100),
      averageVelocity: z.number(),
      velocityTrend: z.enum(['increasing', 'stable', 'decreasing']),
      cycleTime: z.object({
        averageDays: z.number(),
        improvementRate: z.number(),
      }),
    }),
    resourceAllocation: z.object({
      totalDevelopers: z.number(),
      totalHoursAllocated: z.number(),
      hoursSpentDevelopment: z.number(),
      hoursSpentMaintenance: z.number(),
      hoursSpentMeetings: z.number(),
      hoursSpentBugFixes: z.number(),
      utilizationRate: z.number().min(0).max(100),
      costPerHour: z.number(),
      totalProjectCost: z.number(),
      budgetUtilization: z.number().min(0).max(100),
      roleDistribution: z.array(z.object({
        role: z.enum(['senior', 'mid', 'junior', 'lead', 'architect']),
        count: z.number(),
        averageCost: z.number(),
        utilization: z.number().min(0).max(100),
      })),
    }),
    featureDeliveryImpact: z.object({
      featuresDelivered: z.number(),
      featuresPlanned: z.number(),
      deliveryRate: z.number().min(0).max(100),
      businessValue: z.array(z.object({
        featureName: z.string(),
        deliveryDate: z.string(),
        businessImpact: z.enum(['high', 'medium', 'low']),
        userAdoption: z.number().min(0).max(100),
        revenueImpact: z.number(),
        costToDeliver: z.number(),
        roi: z.number(),
        timeToValue: z.number(),
      })),
      averageTimeToMarket: z.number(),
      qualityMetrics: z.object({
        bugReports: z.number(),
        customerSatisfaction: z.number().min(0).max(100),
        performanceImpact: z.number(),
      }),
    }),
    communityEngagement: z.object({
      repositoryMetrics: z.object({
        stars: z.number(),
        starGrowthRate: z.number(),
        forks: z.number(),
        forkGrowthRate: z.number(),
        watchers: z.number(),
        watcherGrowthRate: z.number(),
        downloads: z.number(),
        downloadGrowthRate: z.number(),
      }),
      contributorMetrics: z.object({
        totalContributors: z.number(),
        activeContributors: z.number(),
        newContributors: z.number(),
        retentionRate: z.number().min(0).max(100),
        diversityIndex: z.number().min(0).max(100),
      }),
      communityHealth: z.object({
        issueResponseTime: z.number(),
        prReviewTime: z.number(),
        communityScore: z.number().min(0).max(100),
        documentationQuality: z.number().min(0).max(100),
        onboardingEffectiveness: z.number().min(0).max(100),
      }),
      adoption: z.object({
        enterpriseAdoption: z.number(),
        individualAdoption: z.number(),
        geographicalSpread: z.array(z.object({
          region: z.string(),
          userCount: z.number(),
          growthRate: z.number(),
        })),
      }),
    }),
    costBenefitAnalysis: z.object({
      development: z.object({
        totalCost: z.number(),
        costPerFeature: z.number(),
        costPerStoryPoint: z.number(),
        maintenanceCostRatio: z.number(),
      }),
      revenue: z.object({
        directRevenue: z.number(),
        costSavings: z.number(),
        efficiencyGains: z.number(),
        riskMitigation: z.number(),
      }),
      roi: z.object({
        overallROI: z.number(),
        paybackPeriod: z.number(),
        netPresentValue: z.number(),
        internalRateOfReturn: z.number(),
      }),
      projections: z.array(z.object({
        quarter: z.string(),
        projectedCost: z.number(),
        projectedRevenue: z.number(),
        projectedROI: z.number(),
        confidence: z.number().min(0).max(100),
      })),
    }),
    productivityMetrics: z.object({
      codeMetrics: z.object({
        linesOfCodePerDeveloper: z.number(),
        functionalityPerLOC: z.number(),
        codeReuseRate: z.number().min(0).max(100),
        technicalDebtRatio: z.number().min(0).max(100),
      }),
      processMetrics: z.object({
        deploymentFrequency: z.number(),
        leadTimeForChanges: z.number(),
        meanTimeToRecovery: z.number(),
        changeFailureRate: z.number().min(0).max(100),
      }),
      qualityMetrics: z.object({
        defectRate: z.number(),
        testCoverage: z.number().min(0).max(100),
        automationRate: z.number().min(0).max(100),
        customerSatisfactionScore: z.number().min(0).max(100),
      }),
    }),
    overallROI: z.number(),
    riskFactors: z.array(z.object({
      category: z.enum(['technical', 'market', 'resource', 'timeline']),
      risk: z.string(),
      probability: z.number().min(0).max(100),
      impact: z.enum(['low', 'medium', 'high']),
      mitigation: z.string(),
    })),
    recommendations: z.array(z.object({
      category: z.enum(['investment', 'optimization', 'scaling', 'pivot']),
      priority: z.enum(['immediate', 'high', 'medium', 'low']),
      title: z.string(),
      description: z.string(),
      expectedROIImprovement: z.number(),
      implementationCost: z.number(),
      timeframe: z.string(),
    })),
  }),
  animationDelay: z.number().default(0),
  showVelocityMetrics: z.boolean().default(true),
  showResourceAllocation: z.boolean().default(true),
  showFeatureImpact: z.boolean().default(true),
  showCommunityMetrics: z.boolean().default(true),
  showCostBenefit: z.boolean().default(true),
  highlightSection: z.enum(['velocity', 'resources', 'features', 'community', 'roi']).nullable().default(null),
  theme: z.enum(['light', 'dark', 'github']).default('github'),
  viewMode: z.enum(['executive', 'detailed', 'strategic']).default('executive'),
  timeframe: z.enum(['quarter', 'year', 'project']).default('quarter'),
});