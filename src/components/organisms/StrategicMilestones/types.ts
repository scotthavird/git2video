import { z } from 'zod';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completedDate?: string;
  status: 'completed' | 'in_progress' | 'planned' | 'delayed' | 'cancelled';
  type: 'major_release' | 'feature_launch' | 'project_phase' | 'business_goal' | 'technical_milestone';
  priority: 'critical' | 'high' | 'medium' | 'low';
  progress: number; // 0-100
  assignee?: {
    name: string;
    avatar: string;
    role: string;
  };
  deliverables: Array<{
    name: string;
    status: 'completed' | 'in_progress' | 'pending';
    progress: number;
  }>;
  dependencies: string[]; // IDs of other milestones
  businessImpact: {
    revenue: number;
    userCount: number;
    efficiency: number;
    riskMitigation: number;
  };
  metrics: {
    plannedEffort: number; // story points or hours
    actualEffort: number;
    plannedDuration: number; // days
    actualDuration: number;
    qualityScore: number; // 0-100
  };
}

export interface ProjectPhase {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'completed' | 'active' | 'upcoming';
  milestones: string[]; // milestone IDs
  budget: {
    allocated: number;
    spent: number;
    currency: string;
  };
  team: {
    size: number;
    roles: Array<{
      role: string;
      count: number;
    }>;
  };
}

export interface TimelineEvent {
  id: string;
  date: string;
  type: 'milestone' | 'release' | 'decision' | 'blocker' | 'achievement';
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  stakeholders: string[];
  relatedMilestones: string[];
}

export interface StrategicMilestonesData {
  projectName: string;
  projectDescription: string;
  timeline: {
    startDate: string;
    endDate: string;
    currentDate: string;
  };
  milestones: Milestone[];
  phases: ProjectPhase[];
  events: TimelineEvent[];
  overallProgress: {
    percentage: number;
    milestonesCompleted: number;
    totalMilestones: number;
    onTrackPercentage: number;
    delayedPercentage: number;
  };
  keyMetrics: {
    averageVelocity: number; // milestones per quarter
    budgetUtilization: number; // percentage
    qualityScore: number; // 0-100
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    predictedCompletion: string; // date
    confidenceLevel: number; // 0-100
  };
  upcomingDeadlines: Array<{
    milestoneId: string;
    daysUntilDue: number;
    riskLevel: 'low' | 'medium' | 'high';
  }>;
}

export interface StrategicMilestonesProps {
  data: StrategicMilestonesData;
  animationDelay?: number;
  showTimeline?: boolean;
  showProgress?: boolean;
  showMetrics?: boolean;
  showUpcoming?: boolean;
  timeframeMonths?: number;
  highlightMilestone?: string | null;
  theme?: 'light' | 'dark' | 'github';
  viewMode?: 'executive' | 'detailed' | 'compact';
}

// Zod schema for prop validation
export const StrategicMilestonesSchema = z.object({
  data: z.object({
    projectName: z.string(),
    projectDescription: z.string(),
    timeline: z.object({
      startDate: z.string(),
      endDate: z.string(),
      currentDate: z.string(),
    }),
    milestones: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      dueDate: z.string(),
      completedDate: z.string().optional(),
      status: z.enum(['completed', 'in_progress', 'planned', 'delayed', 'cancelled']),
      type: z.enum(['major_release', 'feature_launch', 'project_phase', 'business_goal', 'technical_milestone']),
      priority: z.enum(['critical', 'high', 'medium', 'low']),
      progress: z.number().min(0).max(100),
      assignee: z.object({
        name: z.string(),
        avatar: z.string(),
        role: z.string(),
      }).optional(),
      deliverables: z.array(z.object({
        name: z.string(),
        status: z.enum(['completed', 'in_progress', 'pending']),
        progress: z.number().min(0).max(100),
      })),
      dependencies: z.array(z.string()),
      businessImpact: z.object({
        revenue: z.number(),
        userCount: z.number(),
        efficiency: z.number(),
        riskMitigation: z.number(),
      }),
      metrics: z.object({
        plannedEffort: z.number(),
        actualEffort: z.number(),
        plannedDuration: z.number(),
        actualDuration: z.number(),
        qualityScore: z.number().min(0).max(100),
      }),
    })),
    phases: z.array(z.object({
      id: z.string(),
      name: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      status: z.enum(['completed', 'active', 'upcoming']),
      milestones: z.array(z.string()),
      budget: z.object({
        allocated: z.number(),
        spent: z.number(),
        currency: z.string(),
      }),
      team: z.object({
        size: z.number(),
        roles: z.array(z.object({
          role: z.string(),
          count: z.number(),
        })),
      }),
    })),
    events: z.array(z.object({
      id: z.string(),
      date: z.string(),
      type: z.enum(['milestone', 'release', 'decision', 'blocker', 'achievement']),
      title: z.string(),
      description: z.string(),
      impact: z.enum(['positive', 'negative', 'neutral']),
      stakeholders: z.array(z.string()),
      relatedMilestones: z.array(z.string()),
    })),
    overallProgress: z.object({
      percentage: z.number().min(0).max(100),
      milestonesCompleted: z.number(),
      totalMilestones: z.number(),
      onTrackPercentage: z.number().min(0).max(100),
      delayedPercentage: z.number().min(0).max(100),
    }),
    keyMetrics: z.object({
      averageVelocity: z.number(),
      budgetUtilization: z.number().min(0).max(100),
      qualityScore: z.number().min(0).max(100),
      riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
      predictedCompletion: z.string(),
      confidenceLevel: z.number().min(0).max(100),
    }),
    upcomingDeadlines: z.array(z.object({
      milestoneId: z.string(),
      daysUntilDue: z.number(),
      riskLevel: z.enum(['low', 'medium', 'high']),
    })),
  }),
  animationDelay: z.number().default(0),
  showTimeline: z.boolean().default(true),
  showProgress: z.boolean().default(true),
  showMetrics: z.boolean().default(true),
  showUpcoming: z.boolean().default(true),
  timeframeMonths: z.number().default(12),
  highlightMilestone: z.string().nullable().default(null),
  theme: z.enum(['light', 'dark', 'github']).default('github'),
  viewMode: z.enum(['executive', 'detailed', 'compact']).default('executive'),
});