/**
 * API route for deal member comments
 * GET: Fetch comments for a deal
 * POST: Create a new comment
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db/client';
import { user as userTable } from '@/lib/db/schema/auth-schema';
import { eq } from 'drizzle-orm';
import {
  getDealComments,
  createDealComment,
  isMemberOnSteerCo,
} from '@/lib/baserow/comments';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const dealId = parseInt(id);

    if (isNaN(dealId)) {
      return NextResponse.json({ error: 'Invalid deal ID' }, { status: 400 });
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

    // Check if user is on SteerCo for this deal (for returning flag)
    const isSteerCo = await isMemberOnSteerCo(dealId, memberId);

    // Fetch comments - steerco-only comments go to the steerco section only
    const comments = await getDealComments(dealId, {
      includeSteercoOnly: false,
    });

    // Transform for display (hide author info for anonymous)
    const displayComments = comments.map((comment) => ({
      id: comment.id,
      commentText: comment.commentText,
      documents: comment.documents,
      isAnonymous: comment.isAnonymous,
      steercoOnly: comment.steercoOnly,
      createdDate: comment.createdDate,
      lastUpdated: comment.lastUpdated,
      // Only include author info if not anonymous
      author: comment.isAnonymous
        ? { name: 'Anonymous Member', id: null }
        : {
            id: comment.author[0]?.id,
            name: comment.authorName || comment.author[0]?.value || 'Unknown',
          },
      // Flag if current user owns this comment
      isOwn: comment.author[0]?.id === memberId,
    }));

    return NextResponse.json({
      success: true,
      comments: displayComments,
      count: displayComments.length,
      isSteerCo,
    });
  } catch (error) {
    console.error('[API] Error fetching deal comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const dealId = parseInt(id);

    if (isNaN(dealId)) {
      return NextResponse.json({ error: 'Invalid deal ID' }, { status: 400 });
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

    // Parse request body
    const body = await request.json();
    const { commentText, isAnonymous, steercoOnly } = body;

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

    // If posting steerco-only, verify user is on steerco
    if (steercoOnly) {
      const isSteerCo = await isMemberOnSteerCo(dealId, memberId);
      if (!isSteerCo) {
        return NextResponse.json(
          { error: 'Only steering committee members can post SteerCo-only comments' },
          { status: 403 }
        );
      }
    }

    // Create the comment
    const comment = await createDealComment(dealId, memberId, {
      commentText: commentText.trim(),
      isAnonymous: !!isAnonymous,
      steercoOnly: !!steercoOnly,
    });

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        commentText: comment.commentText,
        isAnonymous: comment.isAnonymous,
        steercoOnly: comment.steercoOnly,
        createdDate: comment.createdDate,
        author: comment.isAnonymous
          ? { name: 'Anonymous Member', id: null }
          : { id: memberId, name: user.name || 'You' },
        isOwn: true,
      },
    });
  } catch (error) {
    console.error('[API] Error creating deal comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
