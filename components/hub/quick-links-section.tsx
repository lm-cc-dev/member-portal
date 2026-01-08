"use client";

import { QuickLink } from "@/lib/hub/data";
import { QuickLinkCard } from "./quick-link-card";

interface QuickLinksSectionProps {
  links: QuickLink[];
}

export function QuickLinksSection({ links }: QuickLinksSectionProps) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-neutral-900">Quick Links</h2>
        <p className="text-muted-foreground mt-1">
          Access your most important resources
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((link) => (
          <QuickLinkCard key={link.id} link={link} />
        ))}
      </div>
    </section>
  );
}
