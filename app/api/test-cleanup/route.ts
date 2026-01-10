import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { user as userTable } from '@/lib/db/schema/auth-schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    // Find test user
    const testUser = await db.query.user.findFirst({
      where: eq(userTable.email, 'test1@gmail.com'),
    });

    if (!testUser) {
      return NextResponse.json({ status: 'clean', message: 'No test user found' });
    }

    return NextResponse.json({
      status: 'found',
      user: {
        id: testUser.id,
        email: testUser.email,
        baserowMemberId: testUser.baserowMemberId,
        createdAt: testUser.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    // Delete test user
    await db.delete(userTable).where(eq(userTable.email, 'test1@gmail.com'));

    return NextResponse.json({ status: 'deleted', message: 'Test user removed' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
