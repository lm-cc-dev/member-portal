'use client';

import { useState, useEffect, useCallback } from 'react';
import { CommentCard } from './comment-card';
import { CommentForm } from './comment-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty';
import { MessageSquare } from 'lucide-react';
import type { MemberComment } from './types';

interface MemberCommentsProps {
  dealId: number;
  currentMemberId: number;
  isSteerCoMember: boolean;
}

export function MemberComments({ dealId, currentMemberId, isSteerCoMember }: MemberCommentsProps) {
  const [comments, setComments] = useState<MemberComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/deals/${dealId}/comments`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('[MemberComments] API error:', res.status, errorData);
        throw new Error(errorData.error || 'Failed to fetch comments');
      }
      const data = await res.json();
      setComments(data.comments || []);
      setError(null);
    } catch (err) {
      setError('Failed to load comments');
      console.error('[MemberComments] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [dealId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (data: {
    commentText: string;
    isAnonymous?: boolean;
    steercoOnly?: boolean;
  }) => {
    const res = await fetch(`/api/deals/${dealId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to post comment');
    }

    // Refresh comments
    await fetchComments();
  };

  const handleEdit = async (commentId: number, newText: string) => {
    const res = await fetch(`/api/deals/${dealId}/comments/${commentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentText: newText }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to update comment');
    }

    // Refresh comments
    await fetchComments();
  };

  const handleDelete = async (commentId: number) => {
    const res = await fetch(`/api/deals/${dealId}/comments/${commentId}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to delete comment');
    }

    // Refresh comments
    await fetchComments();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
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
      {/* Comment form - steerco-only option removed as those go to steerco section */}
      <CommentForm
        onSubmit={handleSubmit}
        placeholder="Share your thoughts on this deal..."
        showAnonymousOption
      />

      {/* Comments list */}
      {comments.length === 0 ? (
        <Empty>
          <EmptyMedia variant="icon">
            <MessageSquare />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>Start the conversation</EmptyTitle>
            <EmptyDescription>
              Be the first to comment on this deal.
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
              isAnonymous={comment.isAnonymous}
              steercoOnly={comment.steercoOnly}
              variant="default"
              onEdit={comment.isOwn ? handleEdit : undefined}
              onDelete={comment.isOwn ? handleDelete : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
