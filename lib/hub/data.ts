export type LinkCategory =
  | "communication"
  | "events"
  | "resources"
  | "community"
  | "education";

export interface QuickLink {
  id: string;
  title: string;
  description?: string;
  href: string;
  icon: string;
  category: LinkCategory;
  isExternal: boolean;
  badge?: string;
}

export type SocialPlatform =
  | "linkedin"
  | "instagram"
  | "x"
  | "article"
  | "email"
  | "phone";

export interface SocialLink {
  platform: SocialPlatform;
  href: string;
  label: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  headshotPath: string;
  bio?: string;
  socialLinks?: SocialLink[];
  isFeatured?: boolean;
}

export const CATEGORY_LABELS: Record<LinkCategory, string> = {
  communication: "Communication",
  events: "Events & Meetings",
  resources: "Resources",
  community: "Community",
  education: "Education",
};

export const QUICK_LINKS: QuickLink[] = [
  {
    id: "whatsapp",
    title: "WhatsApp Group",
    description: "Join member discussions",
    href: "https://chat.whatsapp.com/PLACEHOLDER",
    icon: "MessageCircle",
    category: "communication",
    isExternal: true,
  },
  {
    id: "slack",
    title: "Slack Workspace",
    description: "Real-time collaboration",
    href: "https://collaborationcircle.slack.com",
    icon: "Hash",
    category: "communication",
    isExternal: true,
  },
  {
    id: "biweekly-zoom",
    title: "Biweekly Zoom Call",
    description: "Add to your calendar",
    href: "https://calendar.google.com/PLACEHOLDER",
    icon: "Video",
    category: "events",
    isExternal: true,
  },
  {
    id: "deal-registry",
    title: "Deal Registry",
    description: "Review investment opportunities",
    href: "/deals",
    icon: "TrendingUp",
    category: "resources",
    isExternal: false,
  },
  {
    id: "member-directory",
    title: "Member Directory",
    description: "Connect with fellow members",
    href: "/directory",
    icon: "Users",
    category: "community",
    isExternal: false,
  },
  {
    id: "resource-library",
    title: "Resource Library",
    description: "Documents and research",
    href: "/resources",
    icon: "Library",
    category: "education",
    isExternal: false,
  },
];

export const CONTACTS: Contact[] = [
  {
    id: "samira-salman",
    name: "Samira Salman",
    role: "Founder & CEO",
    email: "samira@collaborationcircle.com",
    phone: "+1 (713) 818-5840",
    headshotPath: "/sas_headshot.jpeg",
    bio: "Samira Salman is a master connector and collaboration architect whose work centers on uniting people, solutions, and capital to unlock transformative outcomes. As Founder & CEO of Salman Solutions and the visionary behind Collaboration Circle™, she has become a trusted authority at the intersection of capital and community—guiding families, founders, and investors toward relationship-driven success. With over $5.5 billion in transactions across industries and asset classes, Samira has earned her reputation as a force-multiplier, engineering growth through precision structuring, strategic partnerships, and human alignment. Through Collaboration Circle™, she has built a private ecosystem where single-family offices, founders, and game changers convene to co-create the future of capital and community.",
    socialLinks: [
      {
        platform: "linkedin",
        href: "https://www.linkedin.com/in/samirasalman",
        label: "LinkedIn",
      },
      {
        platform: "instagram",
        href: "https://www.instagram.com/samirasalman/",
        label: "Instagram",
      },
      {
        platform: "x",
        href: "https://x.com/samira_salman",
        label: "X",
      },
      {
        platform: "article",
        href: "https://fortune.com/2025/05/29/hnw-advisor-hosts-seminars-collaboration-circle/",
        label: "Fortune Article",
      },
    ],
    isFeatured: true,
  },
  {
    id: "kerri-scott",
    name: "Kerri Scott",
    role: "Events Director",
    email: "kerri@collaborationcircle.com",
    phone: "+1 (555) 123-4567",
    headshotPath: "/kerri_scott_headshot.jpeg",
  },
  {
    id: "jane-doe",
    name: "Jane Doe",
    role: "Member Relations",
    email: "jane@collaborationcircle.com",
    phone: "+1 (555) 234-5678",
    headshotPath: "/kerri_scott_headshot.jpeg", // Placeholder - update later
  },
  {
    id: "john-doe",
    name: "John Doe",
    role: "Operations Manager",
    email: "john@collaborationcircle.com",
    phone: "+1 (555) 345-6789",
    headshotPath: "/kerri_scott_headshot.jpeg", // Placeholder - update later
  },
];
