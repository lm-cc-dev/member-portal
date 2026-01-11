'use client';

import { MessageSquare } from 'lucide-react';
import { MemberComments } from './member-comments';
import { SamiraComments } from './samira-comments';
import { SteerCoComments } from './steerco-comments';
import { Separator } from '@/components/ui/separator';
import type { CommentsSectionProps } from './types';

/**
 * Main comments section component for deal pages
 *
 * Renders in order:
 * 1. Samira Comments (read-only feed from CEO)
 * 2. SteerCo Comments (read-only, only if user is on steering committee)
 * 3. Member Discussion (feed + comment form)
 */
export function CommentsSection({
  dealId,
  currentMemberId,
  isSteerCoMember,
  isAdmin,
}: CommentsSectionProps) {
  return (
    <section className="space-y-6">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="size-5 text-primary" />
        <h2 className="text-lg font-semibold">Comments & Discussion</h2>
      </div>

      {/* Samira's comments (read-only feed from CEO) */}
      <SamiraComments dealId={dealId} />

      {/* SteerCo comments (read-only, only for steerco members) */}
      {isSteerCoMember && (
        <>
          <Separator className="my-6" />
          <SteerCoComments dealId={dealId} currentMemberId={currentMemberId} />
        </>
      )}

      {/* Member Discussion (with comment form) */}
      <Separator className="my-6" />
      <MemberComments
        dealId={dealId}
        currentMemberId={currentMemberId}
        isSteerCoMember={isSteerCoMember}
      />
    </section>
  );
}
