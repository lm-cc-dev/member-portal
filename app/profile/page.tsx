/**
 * Profile Page
 *
 * Displays and allows editing of the current user's member information from Baserow
 */

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getMemberById } from '@/lib/baserow/members';
import { db } from '@/lib/db/client';
import { user as userTable } from '@/lib/db/schema/auth-schema';
import { eq } from 'drizzle-orm';
import { ProfileForm } from '@/components/profile/profile-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: "Profile"
};

export default async function ProfilePage() {
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
          <p className="text-gray-600">
            Your member profile could not be loaded. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  // Get member data from Baserow
  let member;
  try {
    member = await getMemberById(parseInt(user.baserowMemberId));
  } catch (error) {
    console.error('Error loading member data:', error);
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Profile</h1>
          <p className="text-gray-600">
            There was an error loading your profile. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
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
            <h1 className="text-xl font-semibold text-neutral-900">Profile</h1>
            <p className="text-sm text-muted-foreground">Manage your member information</p>
          </div>
        </div>
      </header>
      <ProfileForm initialMemberData={member} />
    </div>
  );
}
