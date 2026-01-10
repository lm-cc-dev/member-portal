"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { User, Users, Compass, ArrowRight } from "lucide-react";

interface NavItem {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
}

const navItems: NavItem[] = [
  {
    href: "/profile",
    icon: User,
    title: "Your Profile",
    description: "Manage your member information",
  },
  {
    href: "/roster",
    icon: Users,
    title: "Member Roster",
    description: "Connect with other members",
  },
  {
    href: "/member-hub",
    icon: Compass,
    title: "Member Hub",
    description: "Resources and contacts",
  },
];

export function QuickNav() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <Card className="h-full hover:shadow-md transition-all hover:border-primary/20 group cursor-pointer !py-0">
            <CardContent className="py-4 px-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0 group-hover:from-primary/15 group-hover:to-primary/10 transition-colors">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {item.description}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
