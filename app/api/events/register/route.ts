/**
 * Event Registration API
 *
 * POST /api/events/register
 * Registers the current member for an event
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db/client';
import { user as userTable } from '@/lib/db/schema/auth-schema';
import { eq } from 'drizzle-orm';
import { registerForEvent, isRegisteredForEvent } from '@/lib/home/events';

export async function POST(request: NextRequest) {
  try {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
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
        { success: false, error: 'Member profile not found' },
        { status: 404 }
      );
    }

    const memberId = parseInt(user.baserowMemberId);

    // Parse request body
    const body = await request.json();
    const { eventId } = body;

    if (!eventId || typeof eventId !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    // Check if already registered
    const alreadyRegistered = await isRegisteredForEvent(memberId, eventId);

    if (alreadyRegistered) {
      return NextResponse.json(
        { success: false, error: 'Already registered for this event' },
        { status: 409 }
      );
    }

    // Register for the event
    const registration = await registerForEvent(memberId, eventId);

    return NextResponse.json({
      success: true,
      registration: {
        id: registration.id,
        registrationId: registration['Registration ID'],
        dateRegistered: registration['Date Registered'],
      },
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to register for event' },
      { status: 500 }
    );
  }
}
