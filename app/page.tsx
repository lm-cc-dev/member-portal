/**
 * Home Page
 *
 * Dashboard-style home page for authenticated members with Events and Deals sections.
 * Displays login form for unauthenticated users.
 */

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db/client";
import { user as userTable } from "@/lib/db/schema/auth-schema";
import { eq } from "drizzle-orm";
import { getMemberById } from "@/lib/baserow/members";
import { getEventsForMember } from "@/lib/home/events";
import { getDealsForMember } from "@/lib/home/deals";
import type { LinkedRecord } from "@/lib/home/types";
import { DashboardHeader } from "@/components/home/dashboard-header";
import { EventsSection } from "@/components/home/events-section";
import { DealsSection } from "@/components/home/deals-section";
import { QuickNav } from "@/components/home/quick-nav";
import { LoginForm } from "@/components/auth/login-form";
import Image from "next/image";

export const metadata = {
  title: "Home",
};

// Type for member data from Baserow
interface MemberData {
  id: number;
  Name: string | null;
  Email: string | null;
  "Suggested Events"?: LinkedRecord[] | null;
  "Suggested Deals"?: LinkedRecord[] | null;
  [key: string]: unknown;
}

export default async function HomePage() {
  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Show login form for unauthenticated users
  if (!session?.user) {
    return <UnauthenticatedView />;
  }

  // Get user from database to get baserowMemberId
  const users = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, session.user.id))
    .limit(1);

  const dbUser = users[0];

  // Handle case where user doesn't have a linked member profile
  if (!dbUser || !dbUser.baserowMemberId) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <DashboardHeader
          user={{
            name: session.user.name || "Member",
            email: session.user.email || "",
            image: session.user.image,
          }}
        />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
            <p className="text-muted-foreground">
              Your member profile could not be loaded. Please contact support.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const memberId = parseInt(dbUser.baserowMemberId);

  // Fetch member data and related events/deals in parallel
  let member: MemberData;
  try {
    member = await getMemberById(memberId) as MemberData;
  } catch (error) {
    console.error("Error loading member data:", error);
    return (
      <div className="min-h-screen bg-neutral-50">
        <DashboardHeader
          user={{
            name: session.user.name || "Member",
            email: session.user.email || "",
            image: session.user.image,
          }}
        />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
            <p className="text-muted-foreground">
              There was an error loading your profile. Please try again later.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Fetch events and deals data
  const [eventsData, dealsData] = await Promise.all([
    getEventsForMember(memberId, member["Suggested Events"] || null),
    getDealsForMember(memberId, member["Suggested Deals"] || null),
  ]);

  const memberName = member.Name || session.user.name || "Member";

  return (
    <div className="min-h-screen bg-neutral-50">
      <DashboardHeader
        user={{
          name: memberName,
          email: member.Email || session.user.email || "",
          image: session.user.image,
        }}
      />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {/* Welcome Section */}
        <section>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">
            Welcome back, {memberName.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground">
            Your personalized dashboard for events, deals, and member resources.
          </p>
        </section>

        {/* Quick Navigation */}
        <QuickNav />

        {/* Divider */}
        <div className="border-t border-neutral-200" />

        {/* Events Section */}
        <EventsSection events={eventsData} />

        {/* Divider */}
        <div className="border-t border-neutral-200" />

        {/* Deals Section */}
        <DealsSection deals={dealsData} />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Collaboration Circle. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

/**
 * Unauthenticated view with login form
 */
function UnauthenticatedView() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-neutral-50">
      <div className="text-center mb-8">
        {/* CC Logo Icon */}
        <div className="flex justify-center mb-4">
          <Image
            src="/cc_logo.png"
            alt="Collaboration Circle"
            width={80}
            height={80}
            priority
            className="object-contain"
          />
        </div>

        {/* Headings */}
        <h1 className="text-3xl font-bold text-neutral-900 mb-1">
          Collaboration Circle
        </h1>
        <p className="text-lg text-neutral-600">Member Portal</p>
      </div>

      <LoginForm />
    </div>
  );
}
