"use client";

import { SocialLink, SocialPlatform } from "@/lib/hub/data";
import { Button } from "@/components/ui/button";
import { Linkedin, Instagram, ExternalLink } from "lucide-react";

const PLATFORM_ICONS: Record<SocialPlatform, React.ComponentType<{ className?: string }> | null> = {
  linkedin: Linkedin,
  instagram: Instagram,
  x: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  article: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8" />
      <path d="M15 18h-5" />
      <path d="M10 6h8v4h-8V6Z" />
    </svg>
  ),
  email: null,
  phone: null,
};

const PLATFORM_COLORS: Record<SocialPlatform, string> = {
  linkedin: "hover:bg-[#0077B5]/10 hover:text-[#0077B5] hover:border-[#0077B5]/30",
  instagram: "hover:bg-[#E4405F]/10 hover:text-[#E4405F] hover:border-[#E4405F]/30",
  x: "hover:bg-neutral-900/10 hover:text-neutral-900 hover:border-neutral-900/30 dark:hover:bg-neutral-100/10 dark:hover:text-neutral-100",
  article: "hover:bg-primary/10 hover:text-primary hover:border-primary/30",
  email: "",
  phone: "",
};

interface SocialLinkButtonProps {
  social: SocialLink;
}

export function SocialLinkButton({ social }: SocialLinkButtonProps) {
  const Icon = PLATFORM_ICONS[social.platform] || ExternalLink;
  const colorClass = PLATFORM_COLORS[social.platform] || "";

  if (!Icon) return null;

  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className={`transition-colors ${colorClass}`}
    >
      <a href={social.href} target="_blank" rel="noopener noreferrer">
        <Icon className="w-4 h-4 mr-1.5" />
        {social.label}
      </a>
    </Button>
  );
}
