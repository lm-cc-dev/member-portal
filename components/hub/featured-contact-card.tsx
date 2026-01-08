"use client";

import { Contact } from "@/lib/hub/data";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SocialLinkButton } from "./social-link-button";
import { Mail, Phone, Star } from "lucide-react";
import Image from "next/image";

interface FeaturedContactCardProps {
  contact: Contact;
}

export function FeaturedContactCard({ contact }: FeaturedContactCardProps) {
  return (
    <Card className="overflow-hidden bg-gradient-to-br from-white to-primary/[0.02] border-primary/10 shadow-lg">
      <CardHeader className="pb-0">
        <Badge className="bg-secondary text-secondary-foreground gap-1 w-fit">
          <Star className="w-3 h-3" />
          Primary Contact
        </Badge>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-2xl overflow-hidden ring-4 ring-primary/10 shadow-md">
              <Image
                src={contact.headshotPath}
                alt={contact.name}
                width={128}
                height={128}
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-2xl font-semibold text-neutral-900">
                {contact.name}
              </h3>
              <p className="text-primary font-medium">{contact.role}</p>
              {contact.bio && (
                <p className="text-sm text-muted-foreground mt-2">
                  {contact.bio}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild variant="default" size="sm">
                <a href={`mailto:${contact.email}`}>
                  <Mail className="w-4 h-4 mr-1.5" />
                  Email
                </a>
              </Button>
              {contact.phone && (
                <Button asChild variant="outline" size="sm">
                  <a href={`tel:${contact.phone.replace(/\D/g, "")}`}>
                    <Phone className="w-4 h-4 mr-1.5" />
                    Call
                  </a>
                </Button>
              )}
            </div>

            {contact.socialLinks && contact.socialLinks.length > 0 && (
              <>
                <Separator className="my-3" />
                <div className="flex flex-wrap gap-2">
                  {contact.socialLinks.map((social) => (
                    <SocialLinkButton key={social.platform} social={social} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
