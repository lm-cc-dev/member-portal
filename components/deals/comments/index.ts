/**
 * Deal Comments Module
 *
 * Export all components for deal comments functionality.
 *
 * Usage:
 * ```tsx
 * import { CommentsSection } from '@/components/deals/comments';
 *
 * <CommentsSection
 *   dealId={deal.id}
 *   currentMemberId={member.id}
 *   isSteerCoMember={isOnSteerCo}
 *   isAdmin={isAdmin}
 * />
 * ```
 */

// Main component
export { CommentsSection } from './comments-section';

// Individual sections (for custom layouts)
export { MemberComments } from './member-comments';
export { SamiraComments } from './samira-comments';
export { SteerCoComments } from './steerco-comments';

// Building blocks
export { CommentCard } from './comment-card';
export { CommentForm } from './comment-form';

// Types
export type {
  CommentsSectionProps,
  MemberComment,
  SamiraComment,
  SteerCoComment,
  CommentAuthor,
} from './types';

// Utilities
export { formatRelativeTime } from './utils';
