import { z } from 'zod';

export interface CommitMetrics {
  dailyCommits: Array<{
    date: string;
    count: number;
    weekday: string;
  }>;
  averageCommitsPerDay: number;
  totalCommitsThisWeek: number;
  peakCommitHour: number;
  commitFrequency: 'high' | 'medium' | 'low';
  commitQualityScore: number; // 0-100 based on commit message quality, size, etc.
}

export interface PullRequestMetrics {
  averageReviewTime: number; // in hours
  averageMergeTime: number; // in hours
  mergeRate: number; // percentage
  totalPRsThisWeek: number;
  totalPRsMerged: number;
  totalPRsRejected: number;
  averagePRSize: {
    linesAdded: number;
    linesDeleted: number;
    filesChanged: number;
  };
  reviewEfficiency: number; // 0-100
}

export interface IssueResolutionMetrics {
  averageResolutionTime: number; // in hours
  resolutionRate: number; // percentage
  totalIssuesOpened: number;
  totalIssuesClosed: number;
  issueBacklog: number;
  issuesByPriority: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  firstResponseTime: number; // in hours
}

export interface CollaborationMetrics {
  activeDevelopers: number;
  codeReviewParticipation: number; // percentage
  crossTeamContributions: number;
  mentorshipActivities: number;
  knowledgeSharingEvents: number;
  pairProgrammingSessions: number;
  collaborationScore: number; // 0-100
}

export interface VelocityTrends {
  sprintVelocity: Array<{
    sprintNumber: number;
    storyPointsCompleted: number;
    sprintGoalAchieved: boolean;
    sprintDate: string;
  }>;
  burndownTrend: 'improving' | 'stable' | 'declining';
  productivityTrend: 'up' | 'stable' | 'down';
  qualityTrend: 'improving' | 'stable' | 'declining';
}

export interface TeamVelocityData {
  teamName: string;
  reportingPeriod: {
    startDate: string;
    endDate: string;
    periodLabel: string;
  };
  commitMetrics: CommitMetrics;
  pullRequestMetrics: PullRequestMetrics;
  issueResolutionMetrics: IssueResolutionMetrics;
  collaborationMetrics: CollaborationMetrics;
  velocityTrends: VelocityTrends;
  overallVelocityScore: number; // 0-100
  recommendedActions: Array<{
    category: 'efficiency' | 'quality' | 'collaboration' | 'process';
    priority: 'high' | 'medium' | 'low';
    action: string;
    expectedImpact: string;
  }>;
}

export interface TeamVelocityDashboardProps {
  data: TeamVelocityData;
  animationDelay?: number;
  showCommitMetrics?: boolean;
  showPRMetrics?: boolean;
  showIssueMetrics?: boolean;
  showCollaboration?: boolean;
  showTrends?: boolean;
  highlightSection?: 'commits' | 'prs' | 'issues' | 'collaboration' | 'trends' | null;
  theme?: 'light' | 'dark' | 'github';
  timeRange?: '7d' | '30d' | '90d';
}

// Zod schema for prop validation
export const TeamVelocityDashboardSchema = z.object({
  data: z.object({
    teamName: z.string(),
    reportingPeriod: z.object({
      startDate: z.string(),
      endDate: z.string(),
      periodLabel: z.string(),
    }),
    commitMetrics: z.object({
      dailyCommits: z.array(z.object({
        date: z.string(),
        count: z.number(),
        weekday: z.string(),
      })),
      averageCommitsPerDay: z.number(),
      totalCommitsThisWeek: z.number(),
      peakCommitHour: z.number().min(0).max(23),
      commitFrequency: z.enum(['high', 'medium', 'low']),
      commitQualityScore: z.number().min(0).max(100),
    }),
    pullRequestMetrics: z.object({
      averageReviewTime: z.number(),
      averageMergeTime: z.number(),
      mergeRate: z.number().min(0).max(100),
      totalPRsThisWeek: z.number(),
      totalPRsMerged: z.number(),
      totalPRsRejected: z.number(),
      averagePRSize: z.object({
        linesAdded: z.number(),
        linesDeleted: z.number(),
        filesChanged: z.number(),
      }),
      reviewEfficiency: z.number().min(0).max(100),
    }),
    issueResolutionMetrics: z.object({
      averageResolutionTime: z.number(),
      resolutionRate: z.number().min(0).max(100),
      totalIssuesOpened: z.number(),
      totalIssuesClosed: z.number(),
      issueBacklog: z.number(),
      issuesByPriority: z.object({
        critical: z.number(),
        high: z.number(),
        medium: z.number(),
        low: z.number(),
      }),
      firstResponseTime: z.number(),
    }),
    collaborationMetrics: z.object({
      activeDevelopers: z.number(),
      codeReviewParticipation: z.number().min(0).max(100),
      crossTeamContributions: z.number(),
      mentorshipActivities: z.number(),
      knowledgeSharingEvents: z.number(),
      pairProgrammingSessions: z.number(),
      collaborationScore: z.number().min(0).max(100),
    }),
    velocityTrends: z.object({
      sprintVelocity: z.array(z.object({
        sprintNumber: z.number(),
        storyPointsCompleted: z.number(),
        sprintGoalAchieved: z.boolean(),
        sprintDate: z.string(),
      })),
      burndownTrend: z.enum(['improving', 'stable', 'declining']),
      productivityTrend: z.enum(['up', 'stable', 'down']),
      qualityTrend: z.enum(['improving', 'stable', 'declining']),
    }),
    overallVelocityScore: z.number().min(0).max(100),
    recommendedActions: z.array(z.object({
      category: z.enum(['efficiency', 'quality', 'collaboration', 'process']),
      priority: z.enum(['high', 'medium', 'low']),
      action: z.string(),
      expectedImpact: z.string(),
    })),
  }),
  animationDelay: z.number().default(0),
  showCommitMetrics: z.boolean().default(true),
  showPRMetrics: z.boolean().default(true),
  showIssueMetrics: z.boolean().default(true),
  showCollaboration: z.boolean().default(true),
  showTrends: z.boolean().default(true),
  highlightSection: z.enum(['commits', 'prs', 'issues', 'collaboration', 'trends']).nullable().default(null),
  theme: z.enum(['light', 'dark', 'github']).default('github'),
  timeRange: z.enum(['7d', '30d', '90d']).default('30d'),
});