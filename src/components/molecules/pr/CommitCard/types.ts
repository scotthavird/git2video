import { GitHubCommit } from '../../../../github/types';

export interface CommitCardProps {
  commit: GitHubCommit;
  animationDelay?: number;
  showStats?: boolean;
  showFiles?: boolean;
  compact?: boolean;
  maxMessageLength?: number;
}