"use client";

import { Calendar, TrendingUp, LucideIcon } from "lucide-react";

interface EmptyStateProps {
  type: "events" | "deals";
  message?: string;
}

const icons: Record<EmptyStateProps["type"], LucideIcon> = {
  events: Calendar,
  deals: TrendingUp,
};

const defaultMessages: Record<EmptyStateProps["type"], string> = {
  events: "No events to display",
  deals: "No deals to display",
};

export function EmptyState({ type, message }: EmptyStateProps) {
  const Icon = icons[type];
  const displayMessage = message || defaultMessages[type];

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground text-sm">{displayMessage}</p>
    </div>
  );
}
