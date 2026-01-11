/**
 * Deal Detail Page
 *
 * Displays comprehensive deal information with NDA-gated content
 */

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/db/client';
import { user as userTable } from '@/lib/db/schema/auth-schema';
import { eq } from 'drizzle-orm';
import { getDealDetail } from '@/lib/deals';
import { isMemberOnSteerCo } from '@/lib/baserow/comments';
import { DealDetailHeader } from '@/components/deals/deal-detail-header';
import { DealDetailContent } from '@/components/deals/deal-detail-content';

interface DealPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: DealPageProps) {
  const { id } = await params;
  return {
    title: `Deal ${id} | Collaboration Circle`,
  };
}

export default async function DealPage({ params }: DealPageProps) {
  const { id } = await params;
  const dealId = parseInt(id, 10);

  if (isNaN(dealId)) {
    notFound();
  }

  // Authenticate user
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/');
  }

  // Get member ID from database
  const users = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, session.user.id))
    .limit(1);

  const dbUser = users[0];

  if (!dbUser?.baserowMemberId) {
    redirect('/');
  }

  const memberId = parseInt(dbUser.baserowMemberId);

  // Fetch deal detail with NDA status
  let dealDetail;
  try {
    dealDetail = await getDealDetail(dealId, memberId);
  } catch (error) {
    console.error('Error loading deal:', error);
    notFound();
  }

  // Check if member is on steering committee for this deal
  const isSteerCoMember = await isMemberOnSteerCo(dealId, memberId);

  // Prepare user info for profile menu
  const user = {
    name: session.user.name || 'Member',
    email: session.user.email || '',
    image: session.user.image,
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header with hero section */}
      <DealDetailHeader deal={dealDetail} user={user} />

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <DealDetailContent
          deal={dealDetail}
          currentMemberId={memberId}
          isSteerCoMember={isSteerCoMember}
        />
      </main>
    </div>
  );
}
