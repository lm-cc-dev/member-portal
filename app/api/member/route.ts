/**
 * API route to get the current user's member data from Baserow
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getMemberById } from '@/lib/baserow/members';
import { db } from '@/lib/db/client';
import { user as userTable } from '@/lib/db/schema/auth-schema';
import { eq } from 'drizzle-orm';
import { updateRow } from '@/lib/baserow/client';
import { TABLES } from '@/lib/baserow/config';
import { detectChanges, prepareUpdatePayload } from '@/lib/profile/utils';
import { FieldValue } from '@/lib/profile/types';

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

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.baserowMemberId) {
      return NextResponse.json(
        { error: 'Member record not linked. Please contact support.' },
        { status: 404 }
      );
    }

    // Get member data from Baserow
    const member = await getMemberById(parseInt(user.baserowMemberId));

    return NextResponse.json({
      success: true,
      member,
    });
  } catch (error) {
    console.error('[API] Error fetching member data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch member data' },
      { status: 500 }
    );
  }
}

/**
 * Update the current user's member data in Baserow
 * Only updates fields that have changed
 */
export async function PATCH(request: Request) {
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
        { error: 'Member record not found' },
        { status: 404 }
      );
    }

    const memberId = parseInt(user.baserowMemberId);

    // Get current member data
    const currentMember = await getMemberById(memberId);

    // Parse request body
    const modifiedData: Record<string, FieldValue> = await request.json();

    // Detect which fields have changed
    const changes = detectChanges(currentMember, modifiedData);

    // If no changes, return success without updating
    if (Object.keys(changes).length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No changes detected',
        member: currentMember,
      });
    }

    // Prepare the update payload for Baserow
    const updatePayload = prepareUpdatePayload(changes);

    console.log('[API] Updating member fields:', Object.keys(changes));
    console.log('[API] Update payload:', updatePayload);

    // Update the member record in Baserow (using field names)
    const updatedMember = await updateRow(
      TABLES.MEMBERS,
      memberId,
      updatePayload,
      true // useFieldNames=true since payload uses field names like 'Name'
    );

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      member: updatedMember,
      changedFields: Object.keys(changes).length,
    });
  } catch (error) {
    console.error('[API] Error updating member data:', error);
    return NextResponse.json(
      {
        error: 'Failed to update member data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
