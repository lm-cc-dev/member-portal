/**
 * Intro Request API
 *
 * POST /api/intros/request
 * Creates a new introduction request from the current member to another member
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db/client';
import { user as userTable } from '@/lib/db/schema/auth-schema';
import { eq } from 'drizzle-orm';
import { createRow } from '@/lib/baserow/client';
import { TABLES, INTRO_STATUS_OPTIONS } from '@/lib/baserow/config';

interface IntroRecord {
  id: number;
  'Intro ID': string;
  'Date Requested': string;
  'Status': { id: number; value: string };
  'Introduce Member': Array<{ id: number; value: string }>;
  'To Member': Array<{ id: number; value: string }>;
  'Reason for Intro': string;
  'Notes': string;
  'Member Connections': Array<{ id: number; value: string }>;
}

interface MemberConnectionRecord {
  id: number;
  'Connection ID': string;
  'Member A': Array<{ id: number; value: string }>;
  'Member B': Array<{ id: number; value: string }>;
  'How They Met': { id: number; value: string };
  'Date Connected': string;
  'Shared Sectors': Array<{ id: number; value: string }>;
  'Shared Hobbies': Array<{ id: number; value: string }>;
  'Shared Non-Profits': Array<{ id: number; value: string }>;
  'Shared Geographies': Array<{ id: number; value: string }>;
  'Related Intro': Array<{ id: number; value: string }>;
}

// How They Met option IDs
const HOW_THEY_MET_OPTIONS = {
  VIA_INTRO: 3118,
  EVENT: 3119,
  DEAL: 3120,
} as const;

function getTodayDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

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

    const currentMemberId = parseInt(user.baserowMemberId);

    // Parse request body
    const body = await request.json();
    const {
      toMemberId,
      reason,
      sharedSectorIds = [],
      sharedHobbyIds = [],
      sharedNonProfitIds = [],
      sharedGeographyIds = [],
    } = body;

    if (!toMemberId || typeof toMemberId !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Invalid member ID' },
        { status: 400 }
      );
    }

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Reason for introduction is required' },
        { status: 400 }
      );
    }

    // Prevent requesting intro to self
    if (toMemberId === currentMemberId) {
      return NextResponse.json(
        { success: false, error: 'Cannot request introduction to yourself' },
        { status: 400 }
      );
    }

    // Create a Member Connection record with shared characteristics
    const memberConnection = await createRow<MemberConnectionRecord>(
      TABLES.MEMBER_CONNECTIONS,
      {
        'Member A': [currentMemberId],
        'Member B': [toMemberId],
        'How They Met': HOW_THEY_MET_OPTIONS.VIA_INTRO,
        'Date Connected': getTodayDate(),
        'Shared Sectors': sharedSectorIds.length > 0 ? sharedSectorIds : [],
        'Shared Hobbies': sharedHobbyIds.length > 0 ? sharedHobbyIds : [],
        'Shared Non-Profits': sharedNonProfitIds.length > 0 ? sharedNonProfitIds : [],
        'Shared Geographies': sharedGeographyIds.length > 0 ? sharedGeographyIds : [],
      },
      true
    );

    // Create the intro request in Baserow, linked to the Member Connection
    const intro = await createRow<IntroRecord>(
      TABLES.INTROS,
      {
        'Introduce Member': [currentMemberId],
        'To Member': [toMemberId],
        'Date Requested': getTodayDate(),
        'Status': INTRO_STATUS_OPTIONS.REQUESTED,
        'Reason for Intro': reason.trim(),
        'Member Connections': [memberConnection.id],
      },
      true
    );

    return NextResponse.json({
      success: true,
      intro: {
        id: intro.id,
        introId: intro['Intro ID'],
        dateRequested: intro['Date Requested'],
        status: intro['Status']?.value || 'Requested',
      },
      memberConnection: {
        id: memberConnection.id,
        connectionId: memberConnection['Connection ID'],
      },
    });
  } catch (error) {
    console.error('Error creating intro request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create introduction request' },
      { status: 500 }
    );
  }
}
