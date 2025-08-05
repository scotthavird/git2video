import { GitHubUser } from '../../../../github/types';

export interface ContributorAvatarProps {
  user: GitHubUser;
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
  showRole?: boolean;
  role?: 'author' | 'reviewer' | 'committer' | 'commenter';
  animationDelay?: number;
  hoverEffect?: boolean;
}