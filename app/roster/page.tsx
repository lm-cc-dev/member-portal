/**
 * Member Roster Page
 *
 * Displays active members who have consented to be on the roster,
 * with matching interests highlighted.
 */

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getMemberById } from '@/lib/baserow/members';
import { getRosterMembers, extractMemberPreferenceIds } from '@/lib/baserow/roster';
import { db } from '@/lib/db/client';
import { user as userTable } from '@/lib/db/schema/auth-schema';
import { eq } from 'drizzle-orm';
import { RosterGrid } from '@/components/roster/roster-grid';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Member Roster',
};

export default async function RosterPage() {
  // Get current session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/');
  }

  // Get user from database to get baserowMemberId
  const users = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, session.user.id))
    .limit(1);

  const user = users[0];

  if (!user || !user.baserowMemberId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">
            Your member profile could not be loaded. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  // Fetch current user's member data for preference matching
  let currentMember;
  let rosterMembers;

  try {
    currentMember = await getMemberById(parseInt(user.baserowMemberId));
    rosterMembers = await getRosterMembers();
  } catch (error) {
    console.error('Error loading roster data:', error);
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Roster</h1>
          <p className="text-gray-600">
            There was an error loading the member roster. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // Extract user's preferences for matching
  const userPreferences = extractMemberPreferenceIds(currentMember);

  // Exclude current user from roster
  const filteredRosterMembers = rosterMembers.filter(
    (member) => member.id !== parseInt(user.baserowMemberId!)
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <Image
              src="/cc_logo.png"
              alt="Collaboration Circle"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">Member Roster</h1>
              <p className="text-sm text-muted-foreground">
                Connect with fellow members
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{filteredRosterMembers.length} members</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <RosterGrid
          members={filteredRosterMembers}
          userPreferences={userPreferences}
        />
      </main>
    </div>
  );
}
