"use client";

import { Contact } from "@/lib/hub/data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone } from "lucide-react";
import Image from "next/image";

interface ContactCardProps {
  contact: Contact;
}

export function ContactCard({ contact }: ContactCardProps) {
  return (
    <Card className="h-full">
      <CardContent className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-neutral-100">
            <Image
              src={contact.headshotPath}
              alt={contact.name}
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-neutral-900">{contact.name}</h3>
          <p className="text-sm text-primary font-medium">{contact.role}</p>

          <div className="flex gap-1 mt-2">
            <Button asChild variant="ghost" size="icon-xs">
              <a href={`mailto:${contact.email}`} title={`Email ${contact.name}`}>
                <Mail className="w-4 h-4" />
              </a>
            </Button>
            {contact.phone && (
              <Button asChild variant="ghost" size="icon-xs">
                <a
                  href={`tel:${contact.phone.replace(/\D/g, "")}`}
                  title={`Call ${contact.name}`}
                >
                  <Phone className="w-4 h-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
