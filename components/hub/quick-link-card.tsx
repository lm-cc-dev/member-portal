"use client";

import { QuickLink } from "@/lib/hub/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  MessageCircle,
  Hash,
  Video,
  TrendingUp,
  Users,
  Library,
  Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageCircle,
  Hash,
  Video,
  TrendingUp,
  Users,
  Library,
  Link: LinkIcon,
  ExternalLink,
};

interface QuickLinkCardProps {
  link: QuickLink;
}

export function QuickLinkCard({ link }: QuickLinkCardProps) {
  const Icon = ICON_MAP[link.icon] || LinkIcon;

  const content = (
    <Card className="group hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
      <CardContent className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
          <Icon className="w-6 h-6 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium text-neutral-900 group-hover:text-primary transition-colors">
              {link.title}
            </h3>
            {link.isExternal && (
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            )}
            {link.badge && (
              <Badge variant="secondary" className="text-xs">
                {link.badge}
              </Badge>
            )}
          </div>
          {link.description && (
            <p className="text-sm text-muted-foreground mt-0.5 truncate">
              {link.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (link.isExternal) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return <Link href={link.href}>{content}</Link>;
}
