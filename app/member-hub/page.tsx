/**
 * Member Hub Page
 *
 * Central hub for quick links and contact information for members
 */

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { QuickLinksSection } from "@/components/hub/quick-links-section";
import { QuickContactsSection } from "@/components/hub/quick-contacts-section";
import { QUICK_LINKS, CONTACTS } from "@/lib/hub/data";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Member Hub",
};

export default async function MemberHubPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
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
              <h1 className="text-xl font-semibold text-neutral-900">
                Member Hub
              </h1>
              <p className="text-sm text-muted-foreground">
                Quick access to resources
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-12">
        <QuickContactsSection contacts={CONTACTS} />
        <QuickLinksSection links={QUICK_LINKS} />
      </main>
    </div>
  );
}
