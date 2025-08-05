/**
 * Data transformation layer for converting GitHub PR data into video generation context
 */

import { PRVideoData, GitHubUser, GitHubCommit, GitHubFile, GitHubReview } from './types';

// Video-specific data structures
export interface VideoSceneData {
  type: 'intro' | 'overview' | 'commits' | 'files' | 'reviews' | 'timeline' | 'summary' | 'outro';
  title: string;
  duration: number; // in seconds
  data: any;
  priority: 'high' | 'medium' | 'low';
}

export interface VideoMetadata {
  title: string;
  subtitle: string;
  description: string;
  duration: number;
  scenes: VideoSceneData[];
  participants: ParticipantSummary[];
  keyMetrics: KeyMetrics;
  theme: VideoTheme;
}

export interface ParticipantSummary {
  user: GitHubUser;
  role: 'author' | 'reviewer' | 'committer' | 'commenter';
  contributions: {
    commits: number;
    reviews: number;
    comments: number;
    linesAdded: number;
    linesDeleted: number;
  };
}

export interface KeyMetrics {
  totalCommits: number;
  totalFiles: number;
  totalAdditions: number;
  totalDeletions: number;
  totalReviews: number;
  totalComments: number;
  timeToFirstReview: number | null; // in hours
  timeToMerge: number | null; // in hours
  participantCount: number;
  primaryLanguage: string;
}

export interface VideoTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  style: 'modern' | 'classic' | 'minimal' | 'corporate';
}

export interface CommitScene {
  commits: CommitSummary[];
  totalStats: {
    additions: number;
    deletions: number;
    files: number;
  };
  timeline: Date[];
}

export interface CommitSummary {
  sha: string;
  shortSha: string;
  message: string;
  shortMessage: string;
  author: GitHubUser;
  date: Date;
  stats: {
    additions: number;
    deletions: number;
    files: number;
  };
  significance: 'major' | 'minor' | 'patch';
}

export interface FileChangesScene {
  files: FileChangeSummary[];
  languageBreakdown: LanguageStats[];
  categoryBreakdown: CategoryStats[];
  significantChanges: FileChangeSummary[];
}

export interface FileChangeSummary {
  filename: string;
  displayName: string;
  status: 'added' | 'removed' | 'modified' | 'renamed';
  language: string;
  category: 'source' | 'test' | 'config' | 'docs' | 'assets' | 'other';
  changes: number;
  additions: number;
  deletions: number;
  significance: 'high' | 'medium' | 'low';
}

export interface LanguageStats {
  language: string;
  files: number;
  lines: number;
  percentage: number;
  color: string;
}

export interface CategoryStats {
  category: string;
  files: number;
  changes: number;
  percentage: number;
}

export interface ReviewScene {
  reviews: ReviewSummary[];
  reviewFlow: ReviewFlow[];
  consensus: 'approved' | 'mixed' | 'blocked' | 'pending';
  keyDiscussions: Discussion[];
}

export interface ReviewSummary {
  reviewer: GitHubUser;
  state: 'approved' | 'changes_requested' | 'commented' | 'pending';
  date: Date;
  commentCount: number;
  keyPoints: string[];
}

export interface ReviewFlow {
  date: Date;
  event: 'review_requested' | 'review_submitted' | 'changes_requested' | 'approved';
  user: GitHubUser;
  context?: string;
}

export interface Discussion {
  topic: string;
  participants: GitHubUser[];
  commentCount: number;
  resolution: 'resolved' | 'ongoing' | 'deferred';
  key_points: string[];
}

export class PRVideoTransformer {
  /**
   * Transform PR data into video-ready metadata
   */
  transform(prData: PRVideoData, videoType: 'summary' | 'detailed' | 'technical' = 'summary'): VideoMetadata {
    console.log(`Transforming PR data for ${videoType} video...`);

    const scenes = this.generateScenes(prData, videoType);
    const participants = this.generateParticipantSummaries(prData);
    const keyMetrics = this.generateKeyMetrics(prData);
    const theme = this.selectTheme(prData, videoType);

    const title = this.generateTitle(prData);
    const subtitle = this.generateSubtitle(prData);
    const description = this.generateDescription(prData);
    const duration = scenes.reduce((total, scene) => total + scene.duration, 0);

    return {
      title,
      subtitle,
      description,
      duration,
      scenes,
      participants,
      keyMetrics,
      theme,
    };
  }

  /**
   * Generate video scenes based on PR data and video type
   */
  private generateScenes(prData: PRVideoData, videoType: string): VideoSceneData[] {
    const scenes: VideoSceneData[] = [];

    // Intro scene (always included)
    scenes.push({
      type: 'intro',
      title: 'Pull Request Introduction',
      duration: 3,
      data: {
        prNumber: prData.pullRequest.number,
        title: prData.pullRequest.title,
        author: prData.pullRequest.user,
        repository: prData.repository,
        createdAt: prData.pullRequest.created_at,
      },
      priority: 'high',
    });

    // Overview scene
    scenes.push({
      type: 'overview',
      title: 'PR Overview',
      duration: 5,
      data: {
        description: prData.pullRequest.body,
        stats: prData.codeStats,
        participants: prData.participants.length,
        status: prData.pullRequest.state,
        labels: prData.pullRequest.labels,
      },
      priority: 'high',
    });

    // Commits scene (if significant commits)
    if (prData.commits.length > 0) {
      const commitScene = this.generateCommitScene(prData.commits);
      scenes.push({
        type: 'commits',
        title: 'Code Changes',
        duration: Math.min(prData.commits.length * 2, 15), // Max 15 seconds
        data: commitScene,
        priority: prData.commits.length > 5 ? 'high' : 'medium',
      });
    }

    // Files scene (if file changes)
    if (prData.files.length > 0) {
      const fileScene = this.generateFileChangesScene(prData.files);
      scenes.push({
        type: 'files',
        title: 'File Changes',
        duration: Math.min(prData.files.length * 1.5, 12), // Max 12 seconds
        data: fileScene,
        priority: prData.files.length > 10 ? 'high' : 'medium',
      });
    }

    // Reviews scene (if reviews exist)
    if (prData.reviews.length > 0 && videoType !== 'summary') {
      const reviewScene = this.generateReviewScene(prData);
      scenes.push({
        type: 'reviews',
        title: 'Code Review',
        duration: Math.min(prData.reviews.length * 3, 20), // Max 20 seconds
        data: reviewScene,
        priority: prData.reviews.length > 2 ? 'high' : 'medium',
      });
    }

    // Timeline scene (for detailed videos)
    if (videoType === 'detailed' || videoType === 'technical') {
      scenes.push({
        type: 'timeline',
        title: 'PR Timeline',
        duration: 8,
        data: {
          timeline: prData.timeline,
          timelineStats: prData.timelineStats,
          keyEvents: this.extractKeyTimelineEvents(prData),
        },
        priority: 'medium',
      });
    }

    // Summary scene
    scenes.push({
      type: 'summary',
      title: 'Summary',
      duration: 4,
      data: {
        outcome: prData.pullRequest.merged ? 'merged' : prData.pullRequest.state,
        impact: this.calculatePRImpact(prData),
        keyAchievements: this.extractKeyAchievements(prData),
        nextSteps: this.generateNextSteps(prData),
      },
      priority: 'high',
    });

    // Outro scene
    scenes.push({
      type: 'outro',
      title: 'Thank You',
      duration: 2,
      data: {
        repository: prData.repository,
        contributors: prData.participants.slice(0, 5), // Top 5 contributors
      },
      priority: 'low',
    });

    return scenes;
  }

  /**
   * Generate commit scene data
   */
  private generateCommitScene(commits: GitHubCommit[]): CommitScene {
    const commitSummaries: CommitSummary[] = commits.map(commit => ({
      sha: commit.sha,
      shortSha: commit.sha.substring(0, 7),
      message: commit.commit.message,
      shortMessage: commit.commit.message.split('\n')[0].substring(0, 50),
      author: commit.author || {
        id: 0,
        login: commit.commit.author.name,
        avatar_url: '',
        html_url: '',
        type: 'User' as const,
        name: commit.commit.author.name,
        email: commit.commit.author.email,
      },
      date: new Date(commit.commit.author.date),
      stats: {
        additions: commit.stats?.additions || 0,
        deletions: commit.stats?.deletions || 0,
        files: commit.files?.length || 0,
      },
      significance: this.determineCommitSignificance(commit),
    }));

    const totalStats = commitSummaries.reduce(
      (acc, commit) => ({
        additions: acc.additions + commit.stats.additions,
        deletions: acc.deletions + commit.stats.deletions,
        files: acc.files + commit.stats.files,
      }),
      { additions: 0, deletions: 0, files: 0 }
    );

    const timeline = commitSummaries.map(c => c.date).sort((a, b) => a.getTime() - b.getTime());

    return {
      commits: commitSummaries,
      totalStats,
      timeline,
    };
  }

  /**
   * Generate file changes scene data
   */
  private generateFileChangesScene(files: GitHubFile[]): FileChangesScene {
    const fileChanges: FileChangeSummary[] = files.map(file => ({
      filename: file.filename,
      displayName: this.getDisplayFilename(file.filename),
      status: file.status as any,
      language: this.getFileLanguage(file.filename),
      category: this.getFileCategory(file.filename),
      changes: file.changes,
      additions: file.additions,
      deletions: file.deletions,
      significance: this.determineFileSignificance(file),
    }));

    const languageBreakdown = this.calculateLanguageBreakdown(fileChanges);
    const categoryBreakdown = this.calculateCategoryBreakdown(fileChanges);
    const significantChanges = fileChanges
      .filter(f => f.significance === 'high')
      .slice(0, 10); // Top 10 most significant changes

    return {
      files: fileChanges,
      languageBreakdown,
      categoryBreakdown,
      significantChanges,
    };
  }

  /**
   * Generate review scene data
   */
  private generateReviewScene(prData: PRVideoData): ReviewScene {
    const reviews: ReviewSummary[] = prData.reviews.map(review => ({
      reviewer: review.user,
      state: review.state.toLowerCase() as any,
      date: new Date(review.submitted_at || review.pull_request_url),
      commentCount: prData.reviewComments.filter(c => c.pull_request_review_id === review.id).length,
      keyPoints: this.extractReviewKeyPoints(review, prData.reviewComments),
    }));

    const reviewFlow = this.generateReviewFlow(prData);
    const consensus = this.determineReviewConsensus(reviews);
    const keyDiscussions = this.extractKeyDiscussions(prData);

    return {
      reviews,
      reviewFlow,
      consensus,
      keyDiscussions,
    };
  }

  /**
   * Generate participant summaries
   */
  private generateParticipantSummaries(prData: PRVideoData): ParticipantSummary[] {
    const participantMap = new Map<number, ParticipantSummary>();

    // Initialize participants
    prData.participants.forEach(user => {
      participantMap.set(user.id, {
        user,
        role: 'commenter',
        contributions: {
          commits: 0,
          reviews: 0,
          comments: 0,
          linesAdded: 0,
          linesDeleted: 0,
        },
      });
    });

    // Count commits
    prData.commits.forEach(commit => {
      if (commit.author) {
        const participant = participantMap.get(commit.author.id);
        if (participant) {
          participant.contributions.commits++;
          participant.contributions.linesAdded += commit.stats?.additions || 0;
          participant.contributions.linesDeleted += commit.stats?.deletions || 0;
          participant.role = 'committer';
        }
      }
    });

    // Count reviews
    prData.reviews.forEach(review => {
      const participant = participantMap.get(review.user.id);
      if (participant) {
        participant.contributions.reviews++;
        participant.role = 'reviewer';
      }
    });

    // Count comments
    [...prData.reviewComments, ...prData.issueComments].forEach(comment => {
      const participant = participantMap.get(comment.user.id);
      if (participant) {
        participant.contributions.comments++;
      }
    });

    // Set author role
    const author = participantMap.get(prData.pullRequest.user.id);
    if (author) {
      author.role = 'author';
    }

    return Array.from(participantMap.values())
      .sort((a, b) => {
        // Sort by contribution level
        const aTotal = a.contributions.commits + a.contributions.reviews + a.contributions.comments;
        const bTotal = b.contributions.commits + b.contributions.reviews + b.contributions.comments;
        return bTotal - aTotal;
      });
  }

  /**
   * Generate key metrics
   */
  private generateKeyMetrics(prData: PRVideoData): KeyMetrics {
    const timeToFirstReview = prData.timelineStats.firstReviewAt && prData.timelineStats.createdAt
      ? (prData.timelineStats.firstReviewAt.getTime() - prData.timelineStats.createdAt.getTime()) / (1000 * 60 * 60)
      : null;

    const timeToMerge = prData.timelineStats.mergedAt && prData.timelineStats.createdAt
      ? (prData.timelineStats.mergedAt.getTime() - prData.timelineStats.createdAt.getTime()) / (1000 * 60 * 60)
      : null;

    const languageEntries = Object.entries(prData.codeStats.languageBreakdown);
    const primaryLanguage = languageEntries.length > 0
      ? languageEntries.sort(([,a], [,b]) => b - a)[0][0]
      : 'Unknown';

    return {
      totalCommits: prData.commits.length,
      totalFiles: prData.files.length,
      totalAdditions: prData.codeStats.totalAdditions,
      totalDeletions: prData.codeStats.totalDeletions,
      totalReviews: prData.reviews.length,
      totalComments: prData.reviewComments.length + prData.issueComments.length,
      timeToFirstReview,
      timeToMerge,
      participantCount: prData.participants.length,
      primaryLanguage,
    };
  }

  /**
   * Select appropriate theme based on PR data and video type
   */
  private selectTheme(prData: PRVideoData, videoType: string): VideoTheme {
    const themes: Record<string, VideoTheme> = {
      modern: {
        primaryColor: '#0066CC',
        secondaryColor: '#33CC33',
        backgroundColor: '#1A1A1A',
        textColor: '#FFFFFF',
        style: 'modern',
      },
      corporate: {
        primaryColor: '#2E86AB',
        secondaryColor: '#A23B72',
        backgroundColor: '#F8F9FA',
        textColor: '#212529',
        style: 'corporate',
      },
      minimal: {
        primaryColor: '#6366F1',
        secondaryColor: '#8B5CF6',
        backgroundColor: '#FFFFFF',
        textColor: '#111827',
        style: 'minimal',
      },
    };

    // Select theme based on repository language or type
    const primaryLanguage = this.generateKeyMetrics(prData).primaryLanguage.toLowerCase();
    
    if (['javascript', 'typescript', 'react'].includes(primaryLanguage)) {
      return themes.modern;
    } else if (['java', 'c#', 'enterprise'].includes(primaryLanguage)) {
      return themes.corporate;
    } else {
      return themes.minimal;
    }
  }

  // Helper methods
  private generateTitle(prData: PRVideoData): string {
    return `PR #${prData.pullRequest.number}: ${prData.pullRequest.title}`;
  }

  private generateSubtitle(prData: PRVideoData): string {
    return `${prData.repository.full_name} • ${prData.codeStats.totalFiles} files • ${prData.participants.length} contributors`;
  }

  private generateDescription(prData: PRVideoData): string {
    const status = prData.pullRequest.merged ? 'Merged' : prData.pullRequest.state;
    return `${status} pull request with ${prData.codeStats.totalAdditions} additions and ${prData.codeStats.totalDeletions} deletions across ${prData.codeStats.totalFiles} files.`;
  }

  private determineCommitSignificance(commit: GitHubCommit): 'major' | 'minor' | 'patch' {
    const changes = (commit.stats?.additions || 0) + (commit.stats?.deletions || 0);
    if (changes > 500) return 'major';
    if (changes > 100) return 'minor';
    return 'patch';
  }

  private getDisplayFilename(filename: string): string {
    const parts = filename.split('/');
    return parts.length > 3 ? `.../${parts.slice(-2).join('/')}` : filename;
  }

  private getFileLanguage(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    const languageMap: Record<string, string> = {
      'js': 'JavaScript', 'jsx': 'JavaScript', 'ts': 'TypeScript', 'tsx': 'TypeScript',
      'py': 'Python', 'java': 'Java', 'cpp': 'C++', 'c': 'C', 'cs': 'C#',
      'php': 'PHP', 'rb': 'Ruby', 'go': 'Go', 'rs': 'Rust', 'swift': 'Swift',
    };
    return languageMap[extension] || 'Other';
  }

  private getFileCategory(filename: string): 'source' | 'test' | 'config' | 'docs' | 'assets' | 'other' {
    if (filename.includes('test') || filename.includes('spec')) return 'test';
    if (filename.includes('config') || filename.includes('.json') || filename.includes('.yml')) return 'config';
    if (filename.includes('README') || filename.includes('.md')) return 'docs';
    if (filename.includes('assets') || filename.includes('images') || filename.includes('.png')) return 'assets';
    if (filename.includes('.js') || filename.includes('.ts') || filename.includes('.py')) return 'source';
    return 'other';
  }

  private determineFileSignificance(file: GitHubFile): 'high' | 'medium' | 'low' {
    if (file.changes > 200) return 'high';
    if (file.changes > 50) return 'medium';
    return 'low';
  }

  private calculateLanguageBreakdown(files: FileChangeSummary[]): LanguageStats[] {
    const languageMap = new Map<string, { files: number; lines: number }>();
    
    files.forEach(file => {
      const current = languageMap.get(file.language) || { files: 0, lines: 0 };
      languageMap.set(file.language, {
        files: current.files + 1,
        lines: current.lines + file.changes,
      });
    });

    const total = Array.from(languageMap.values()).reduce((sum, lang) => sum + lang.lines, 0);
    
    return Array.from(languageMap.entries())
      .map(([language, stats]) => ({
        language,
        files: stats.files,
        lines: stats.lines,
        percentage: (stats.lines / total) * 100,
        color: this.getLanguageColor(language),
      }))
      .sort((a, b) => b.lines - a.lines);
  }

  private calculateCategoryBreakdown(files: FileChangeSummary[]): CategoryStats[] {
    const categoryMap = new Map<string, { files: number; changes: number }>();
    
    files.forEach(file => {
      const current = categoryMap.get(file.category) || { files: 0, changes: 0 };
      categoryMap.set(file.category, {
        files: current.files + 1,
        changes: current.changes + file.changes,
      });
    });

    const total = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.changes, 0);
    
    return Array.from(categoryMap.entries())
      .map(([category, stats]) => ({
        category,
        files: stats.files,
        changes: stats.changes,
        percentage: (stats.changes / total) * 100,
      }))
      .sort((a, b) => b.changes - a.changes);
  }

  private getLanguageColor(language: string): string {
    const colors: Record<string, string> = {
      'JavaScript': '#f1e05a',
      'TypeScript': '#2b7489',
      'Python': '#3572A5',
      'Java': '#b07219',
      'C++': '#f34b7d',
      'C': '#555555',
      'C#': '#239120',
      'PHP': '#4F5D95',
      'Ruby': '#701516',
      'Go': '#00ADD8',
      'Rust': '#dea584',
      'Swift': '#ffac45',
    };
    return colors[language] || '#cccccc';
  }

  private extractReviewKeyPoints(review: GitHubReview, comments: any[]): string[] {
    // This would analyze review body and comments to extract key points
    // For now, return placeholder
    return review.body ? [review.body.substring(0, 100)] : [];
  }

  private generateReviewFlow(prData: PRVideoData): ReviewFlow[] {
    // Generate chronological review flow events
    return [];
  }

  private determineReviewConsensus(reviews: ReviewSummary[]): 'approved' | 'mixed' | 'blocked' | 'pending' {
    const approved = reviews.filter(r => r.state === 'approved').length;
    const blocked = reviews.filter(r => r.state === 'changes_requested').length;
    
    if (blocked > 0) return 'blocked';
    if (approved > 0) return 'approved';
    if (reviews.length > 0) return 'mixed';
    return 'pending';
  }

  private extractKeyDiscussions(prData: PRVideoData): Discussion[] {
    // Analyze comments to extract key discussion topics
    return [];
  }

  private extractKeyTimelineEvents(prData: PRVideoData): any[] {
    return prData.timeline.filter(event => 
      ['closed', 'merged', 'reopened', 'review_requested', 'approved'].includes(event.event)
    );
  }

  private calculatePRImpact(prData: PRVideoData): string {
    const totalChanges = prData.codeStats.totalAdditions + prData.codeStats.totalDeletions;
    if (totalChanges > 1000) return 'Major';
    if (totalChanges > 200) return 'Medium';
    return 'Minor';
  }

  private extractKeyAchievements(prData: PRVideoData): string[] {
    const achievements: string[] = [];
    
    if (prData.pullRequest.merged) {
      achievements.push('Successfully merged');
    }
    
    if (prData.reviews.some(r => r.state === 'APPROVED')) {
      achievements.push('Code review approved');
    }
    
    if (prData.codeStats.totalFiles > 10) {
      achievements.push('Comprehensive changes');
    }
    
    return achievements;
  }

  private generateNextSteps(prData: PRVideoData): string[] {
    if (prData.pullRequest.merged) {
      return ['Monitor deployment', 'Gather feedback', 'Plan next iteration'];
    } else if (prData.pullRequest.state === 'open') {
      return ['Address review feedback', 'Complete testing', 'Prepare for merge'];
    } else {
      return ['Review and reopen if needed'];
    }
  }
}