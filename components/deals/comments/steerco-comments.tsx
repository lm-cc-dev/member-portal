'use client';

import { useState, useEffect, useCallback } from 'react';
import { CommentCard } from './comment-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty';
import { Shield, Lock } from 'lucide-react';
import type { SteerCoComment } from './types';

interface SteerCoCommentsProps {
  dealId: number;
  currentMemberId: number;
}

/**
 * SteerCo Comments section (read-only)
 *
 * Shows both actual SteerCo comments and member comments marked as steerco-only
 */
export function SteerCoComments({ dealId, currentMemberId }: SteerCoCommentsProps) {
  const [comments, setComments] = useState<SteerCoComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/deals/${dealId}/steerco-comments`);
      if (!res.ok) {
        if (res.status === 403) {
          // User is not on steerco - this is expected
          setComments([]);
          setError(null);
          return;
        }
        const errorData = await res.json().catch(() => ({}));
        console.error('[SteerCoComments] API error:', res.status, errorData);
        throw new Error(errorData.error || 'Failed to fetch comments');
      }
      const data = await res.json();
      setComments(data.comments || []);
      setError(null);
    } catch (err) {
      setError('Failed to load SteerCo comments');
      console.error('[SteerCoComments] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [dealId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="size-5 text-amber-600" />
        <h3 className="text-base font-semibold">Steering Committee Discussion</h3>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Lock className="size-3" />
          Private
        </span>
      </div>

      {/* Read-only comments list (no form) */}
      {comments.length === 0 ? (
        <Empty>
          <EmptyMedia variant="icon">
            <Shield />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No SteerCo comments yet</EmptyTitle>
            <EmptyDescription>
              No steering committee discussions have been added to this deal.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              id={comment.id}
              author={comment.author}
              commentText={comment.commentText}
              createdDate={comment.createdDate}
              lastUpdated={comment.lastUpdated}
              isOwn={comment.isOwn}
              variant="steerco"
            />
          ))}
        </div>
      )}
    </div>
  );
}
