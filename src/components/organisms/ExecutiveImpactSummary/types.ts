import { z } from 'zod';

// GitHub-inspired data structures for executive summaries
export interface RepositoryHealthMetrics {
  stars: number;
  forks: number;
  watchers: number;
  contributors: number;
  totalCommits: number;
  totalPullRequests: number;
  totalIssues: number;
  openIssues: number;
  closedIssues: number;
  healthScore: number; // 0-100
}

export interface ActivityTrends {
  commitTrend: {
    thisWeek: number;
    lastWeek: number;
    trend: 'up' | 'down' | 'stable';
    percentChange: number;
  };
  prTrend: {
    thisWeek: number;
    lastWeek: number;
    trend: 'up' | 'down' | 'stable';
    percentChange: number;
  };
  issueTrend: {
    thisWeek: number;
    lastWeek: number;
    trend: 'up' | 'down' | 'stable';
    percentChange: number;
  };
}

export interface TeamMetrics {
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  topContributors: Array<{
    name: string;
    avatar: string;
    contributions: number;
    role: string;
  }>;
  teamGrowthRate: number;
}

export interface KeyPerformanceIndicators {
  codeQualityScore: number; // 0-100
  deliveryVelocity: number; // stories/sprint or similar
  customerSatisfaction: number; // 0-100
  technicalDebtRatio: number; // 0-100
  uptime: number; // 0-100
  securityScore: number; // 0-100
}

export interface ExecutiveImpactSummaryData {
  repositoryName: string;
  repositoryDescription: string;
  healthMetrics: RepositoryHealthMetrics;
  activityTrends: ActivityTrends;
  teamMetrics: TeamMetrics;
  kpis: KeyPerformanceIndicators;
  timeframe: {
    startDate: string;
    endDate: string;
    period: string; // e.g., "Q3 2024", "Last 30 days"
  };
}

export interface ExecutiveImpactSummaryProps {
  data: ExecutiveImpactSummaryData;
  animationDelay?: number;
  showHealthScore?: boolean;
  showTrends?: boolean;
  showTeamMetrics?: boolean;
  showKPIs?: boolean;
  highlightMetric?: 'health' | 'activity' | 'team' | 'kpis' | null;
  theme?: 'light' | 'dark' | 'github';
}

// Zod schema for prop validation
export const ExecutiveImpactSummarySchema = z.object({
  data: z.object({
    repositoryName: z.string(),
    repositoryDescription: z.string(),
    healthMetrics: z.object({
      stars: z.number(),
      forks: z.number(),
      watchers: z.number(),
      contributors: z.number(),
      totalCommits: z.number(),
      totalPullRequests: z.number(),
      totalIssues: z.number(),
      openIssues: z.number(),
      closedIssues: z.number(),
      healthScore: z.number().min(0).max(100),
    }),
    activityTrends: z.object({
      commitTrend: z.object({
        thisWeek: z.number(),
        lastWeek: z.number(),
        trend: z.enum(['up', 'down', 'stable']),
        percentChange: z.number(),
      }),
      prTrend: z.object({
        thisWeek: z.number(),
        lastWeek: z.number(),
        trend: z.enum(['up', 'down', 'stable']),
        percentChange: z.number(),
      }),
      issueTrend: z.object({
        thisWeek: z.number(),
        lastWeek: z.number(),
        trend: z.enum(['up', 'down', 'stable']),
        percentChange: z.number(),
      }),
    }),
    teamMetrics: z.object({
      totalMembers: z.number(),
      activeMembers: z.number(),
      newMembersThisMonth: z.number(),
      topContributors: z.array(z.object({
        name: z.string(),
        avatar: z.string(),
        contributions: z.number(),
        role: z.string(),
      })),
      teamGrowthRate: z.number(),
    }),
    kpis: z.object({
      codeQualityScore: z.number().min(0).max(100),
      deliveryVelocity: z.number(),
      customerSatisfaction: z.number().min(0).max(100),
      technicalDebtRatio: z.number().min(0).max(100),
      uptime: z.number().min(0).max(100),
      securityScore: z.number().min(0).max(100),
    }),
    timeframe: z.object({
      startDate: z.string(),
      endDate: z.string(),
      period: z.string(),
    }),
  }),
  animationDelay: z.number().default(0),
  showHealthScore: z.boolean().default(true),
  showTrends: z.boolean().default(true),
  showTeamMetrics: z.boolean().default(true),
  showKPIs: z.boolean().default(true),
  highlightMetric: z.enum(['health', 'activity', 'team', 'kpis']).nullable().default(null),
  theme: z.enum(['light', 'dark', 'github']).default('github'),
});