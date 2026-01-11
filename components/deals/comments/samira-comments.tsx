'use client';

import { useState, useEffect, useCallback } from 'react';
import { CommentCard } from './comment-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles } from 'lucide-react';
import type { SamiraComment } from './types';

interface SamiraCommentsProps {
  dealId: number;
}

export function SamiraComments({ dealId }: SamiraCommentsProps) {
  const [comments, setComments] = useState<SamiraComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/deals/${dealId}/samira-comments`);
      if (!res.ok) throw new Error('Failed to fetch comments');
      const data = await res.json();
      setComments(data.comments || []);
      setError(null);
    } catch (err) {
      setError('Failed to load Samira\'s comments');
      console.error(err);
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
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return null; // Silently fail - don't show error for optional section
  }

  if (comments.length === 0) {
    return null; // Don't render section if no comments
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="size-5 text-primary" />
        <h3 className="text-base font-semibold">From Samira</h3>
      </div>

      <div className="space-y-3">
        {comments.map((comment) => (
          <CommentCard
            key={comment.id}
            id={comment.id}
            author={{ id: null, name: 'Samira' }}
            commentText={comment.commentText}
            createdDate={comment.createdDate}
            lastUpdated={comment.lastUpdated}
            isOwn={false}
            isTargeted={comment.isTargeted}
            variant="samira"
          />
        ))}
      </div>
    </div>
  );
}
