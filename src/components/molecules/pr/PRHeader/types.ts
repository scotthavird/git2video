import { GitHubPullRequest, GitHubRepository } from '../../../../github/types';

export interface PRHeaderProps {
  pullRequest: GitHubPullRequest;
  repository: GitHubRepository;
  animationDelay?: number;
  showLabels?: boolean;
  showMilestone?: boolean;
  compact?: boolean;
}