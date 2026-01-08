"use client";

import { Contact } from "@/lib/hub/data";
import { FeaturedContactCard } from "./featured-contact-card";
import { ContactCard } from "./contact-card";

interface QuickContactsSectionProps {
  contacts: Contact[];
}

export function QuickContactsSection({ contacts }: QuickContactsSectionProps) {
  const featuredContact = contacts.find((c) => c.isFeatured);
  const otherContacts = contacts.filter((c) => !c.isFeatured);

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-neutral-900">
          Your Contacts
        </h2>
        <p className="text-muted-foreground mt-1">
          Reach out to our team anytime
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {featuredContact && (
          <div className="lg:col-span-2">
            <FeaturedContactCard contact={featuredContact} />
          </div>
        )}

        <div className="space-y-4">
          {otherContacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </div>
      </div>
    </section>
  );
}
