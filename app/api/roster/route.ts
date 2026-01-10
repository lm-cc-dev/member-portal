/**
 * API route to get roster members and current user preferences for matching
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getMemberById } from '@/lib/baserow/members';
import { getRosterMembers, extractMemberPreferenceIds } from '@/lib/baserow/roster';
import { db } from '@/lib/db/client';
import { user as userTable } from '@/lib/db/schema/auth-schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database to get baserowMemberId
    const users = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, session.user.id))
      .limit(1);

    const user = users[0];

    if (!user || !user.baserowMemberId) {
      return NextResponse.json(
        { error: 'Member record not linked' },
        { status: 404 }
      );
    }

    // Fetch current user's member data for preference matching
    const currentMember = await getMemberById(parseInt(user.baserowMemberId));
    const currentUserPreferences = extractMemberPreferenceIds(currentMember);

    // Fetch all roster members
    const rosterMembers = await getRosterMembers();

    // Exclude current user from roster
    const filteredRosterMembers = rosterMembers.filter(
      (member) => member.id !== parseInt(user.baserowMemberId!)
    );

    return NextResponse.json({
      success: true,
      rosterMembers: filteredRosterMembers,
      currentUserPreferences,
      currentUserId: parseInt(user.baserowMemberId),
    });
  } catch (error) {
    console.error('[API] Error fetching roster:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roster data' },
      { status: 500 }
    );
  }
}
