/**
 * API route for individual deal comment operations
 * PATCH: Update a comment (own only)
 * DELETE: Soft delete a comment (own only)
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db/client';
import { user as userTable } from '@/lib/db/schema/auth-schema';
import { eq } from 'drizzle-orm';
import {
  getDealCommentById,
  updateDealComment,
  deleteDealComment,
} from '@/lib/baserow/comments';

interface RouteParams {
  params: Promise<{ id: string; commentId: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id, commentId } = await params;
    const dealId = parseInt(id);
    const commentIdNum = parseInt(commentId);

    if (isNaN(dealId) || isNaN(commentIdNum)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's baserow member ID
    const users = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, session.user.id))
      .limit(1);

    const user = users[0];
    if (!user?.baserowMemberId) {
      return NextResponse.json(
        { error: 'Member record not linked' },
        { status: 404 }
      );
    }

    const memberId = parseInt(user.baserowMemberId);

    // Get the comment to verify ownership
    const comment = await getDealCommentById(commentIdNum);

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Verify the comment belongs to the correct deal
    if (!comment.deal.some((d) => d.id === dealId)) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Verify ownership
    if (!comment.author.some((a) => a.id === memberId)) {
      return NextResponse.json(
        { error: 'You can only edit your own comments' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { commentText } = body;

    if (!commentText || typeof commentText !== 'string') {
      return NextResponse.json(
        { error: 'Comment text is required' },
        { status: 400 }
      );
    }

    if (commentText.length > 10000) {
      return NextResponse.json(
        { error: 'Comment is too long (max 10000 characters)' },
        { status: 400 }
      );
    }

    // Update the comment
    const updatedComment = await updateDealComment(commentIdNum, {
      commentText: commentText.trim(),
    });

    return NextResponse.json({
      success: true,
      comment: {
        id: updatedComment.id,
        commentText: updatedComment.commentText,
        isAnonymous: updatedComment.isAnonymous,
        steercoOnly: updatedComment.steercoOnly,
        lastUpdated: updatedComment.lastUpdated,
      },
    });
  } catch (error) {
    console.error('[API] Error updating deal comment:', error);
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id, commentId } = await params;
    const dealId = parseInt(id);
    const commentIdNum = parseInt(commentId);

    if (isNaN(dealId) || isNaN(commentIdNum)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's baserow member ID
    const users = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, session.user.id))
      .limit(1);

    const user = users[0];
    if (!user?.baserowMemberId) {
      return NextResponse.json(
        { error: 'Member record not linked' },
        { status: 404 }
      );
    }

    const memberId = parseInt(user.baserowMemberId);

    // Get the comment to verify ownership
    const comment = await getDealCommentById(commentIdNum);

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Verify the comment belongs to the correct deal
    if (!comment.deal.some((d) => d.id === dealId)) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Verify ownership
    if (!comment.author.some((a) => a.id === memberId)) {
      return NextResponse.json(
        { error: 'You can only delete your own comments' },
        { status: 403 }
      );
    }

    // Soft delete the comment
    await deleteDealComment(commentIdNum);

    return NextResponse.json({
      success: true,
      message: 'Comment deleted',
    });
  } catch (error) {
    console.error('[API] Error deleting deal comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
