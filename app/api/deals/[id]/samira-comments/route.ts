/**
 * API route for Samira (CEO) comments
 * GET: Fetch Samira comments for a deal (filtered by target members)
 * POST: Create a new Samira comment (admin only)
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db/client';
import { user as userTable } from '@/lib/db/schema/auth-schema';
import { eq } from 'drizzle-orm';
import {
  getSamiraComments,
  createSamiraComment,
} from '@/lib/baserow/comments';
import { listRows } from '@/lib/baserow/client';

// CC Admin Accounts table ID
const CC_ADMIN_TABLE = 776;

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Check if the current user is a CC Admin
 */
async function isUserAdmin(email: string): Promise<boolean> {
  try {
    const response = await listRows<any>(CC_ADMIN_TABLE, {
      useFieldNames: true,
      search: email,
      size: 10,
    });

    return response.results.some(
      (admin: any) => admin['Email']?.toLowerCase() === email.toLowerCase()
    );
  } catch (error) {
    console.error('[API] Error checking admin status:', error);
    return false;
  }
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

    // Fetch Samira comments (filtered for this member)
    const comments = await getSamiraComments(dealId, memberId);

    // Transform for display
    const displayComments = comments.map((comment) => ({
      id: comment.id,
      commentText: comment.commentText,
      documents: comment.documents,
      createdDate: comment.createdDate,
      lastUpdated: comment.lastUpdated,
      // Indicate if this is a targeted comment for this member
      isTargeted: comment.targetMembers.length > 0,
      targetMemberCount: comment.targetMembers.length,
    }));

    return NextResponse.json({
      success: true,
      comments: displayComments,
      count: displayComments.length,
    });
  } catch (error) {
    console.error('[API] Error fetching Samira comments:', error);
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

    // Verify admin status
    const isAdmin = await isUserAdmin(session.user.email);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only administrators can post Samira comments' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { commentText, targetMembers } = body;

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

    // Validate targetMembers if provided
    const targetMemberIds = Array.isArray(targetMembers)
      ? targetMembers.filter((id) => typeof id === 'number')
      : [];

    // Create the comment
    const comment = await createSamiraComment(dealId, {
      commentText: commentText.trim(),
      targetMembers: targetMemberIds,
    });

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        commentText: comment.commentText,
        createdDate: comment.createdDate,
        isTargeted: targetMemberIds.length > 0,
        targetMemberCount: targetMemberIds.length,
      },
    });
  } catch (error) {
    console.error('[API] Error creating Samira comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
