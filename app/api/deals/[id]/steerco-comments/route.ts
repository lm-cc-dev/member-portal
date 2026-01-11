/**
 * API route for Steering Committee comments
 * GET: Fetch SteerCo comments for a deal (SteerCo members only)
 * POST: Create a new SteerCo comment (SteerCo members only)
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db/client';
import { user as userTable } from '@/lib/db/schema/auth-schema';
import { eq } from 'drizzle-orm';
import {
  getSteerCoComments,
  getSteercoOnlyMemberComments,
  createSteerCoComment,
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

    // Verify user is on SteerCo for this deal
    const isSteerCo = await isMemberOnSteerCo(dealId, memberId);
    if (!isSteerCo) {
      return NextResponse.json(
        { error: 'Only steering committee members can view SteerCo comments' },
        { status: 403 }
      );
    }

    // Fetch both SteerCo comments and steerco-only member comments
    const [steercoComments, steercoOnlyMemberComments] = await Promise.all([
      getSteerCoComments(dealId),
      getSteercoOnlyMemberComments(dealId),
    ]);

    // Transform SteerCo comments for display
    const displaySteercoComments = steercoComments.map((comment) => ({
      id: comment.id,
      commentText: comment.commentText,
      documents: comment.documents,
      createdDate: comment.createdDate,
      lastUpdated: comment.lastUpdated,
      source: 'steerco' as const,
      author: {
        id: comment.author[0]?.id,
        name: comment.authorName || comment.author[0]?.value || 'Unknown',
      },
      isOwn: comment.author[0]?.id === memberId,
    }));

    // Transform steerco-only member comments for display
    const displayMemberComments = steercoOnlyMemberComments.map((comment) => ({
      id: comment.id,
      commentText: comment.commentText,
      documents: comment.documents,
      createdDate: comment.createdDate,
      lastUpdated: comment.lastUpdated,
      source: 'member-steerco-only' as const,
      isAnonymous: comment.isAnonymous,
      author: comment.isAnonymous
        ? { name: 'Anonymous Member', id: null }
        : {
            id: comment.author[0]?.id,
            name: comment.authorName || comment.author[0]?.value || 'Unknown',
          },
      isOwn: comment.author[0]?.id === memberId,
    }));

    // Merge and sort by created date (newest first)
    const allComments = [...displaySteercoComments, ...displayMemberComments].sort(
      (a, b) =>
        new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
    );

    return NextResponse.json({
      success: true,
      comments: allComments,
      count: allComments.length,
    });
  } catch (error) {
    console.error('[API] Error fetching SteerCo comments:', error);
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

    // Verify user is on SteerCo for this deal
    const isSteerCo = await isMemberOnSteerCo(dealId, memberId);
    if (!isSteerCo) {
      return NextResponse.json(
        { error: 'Only steering committee members can post SteerCo comments' },
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

    // Create the comment
    const comment = await createSteerCoComment(dealId, memberId, {
      commentText: commentText.trim(),
    });

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        commentText: comment.commentText,
        createdDate: comment.createdDate,
        author: {
          id: memberId,
          name: user.name || 'You',
        },
        isOwn: true,
      },
    });
  } catch (error) {
    console.error('[API] Error creating SteerCo comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
