"use client";

import {
  TrendingUp,
  Sparkles,
  Briefcase,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { DealCard } from "./deal-card";
import { EmptyState } from "./empty-state";
import type { CategorizedDeals } from "@/lib/home/types";

interface DealsSectionProps {
  deals: CategorizedDeals;
}

export function DealsSection({ deals }: DealsSectionProps) {
  const hasSuggested = deals.suggested.length > 0;
  const hasAvailable = deals.available.length > 0;
  const hasReviewing = deals.reviewing.length > 0;
  const hasInvested = deals.invested.length > 0;
  const hasAnyDeals = hasSuggested || hasAvailable || hasReviewing || hasInvested;

  return (
    <section className="space-y-8">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Deals</h2>
          <p className="text-sm text-muted-foreground">
            Investment opportunities curated for members
          </p>
        </div>
      </div>

      {!hasAnyDeals ? (
        <EmptyState type="deals" message="No deals available at this time" />
      ) : (
        <div className="space-y-8">
          {/* Suggested Deals */}
          {hasSuggested && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-secondary" />
                <h3 className="font-medium">Suggested for You</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {deals.suggested.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {deals.suggested.map((deal) => (
                  <DealCard key={deal.id} deal={deal} variant="suggested" />
                ))}
              </div>
            </div>
          )}

          {/* Available Deals */}
          {hasAvailable && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-medium">Available Deals</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {deals.available.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {deals.available.map((deal) => (
                  <DealCard key={deal.id} deal={deal} variant="available" />
                ))}
              </div>
            </div>
          )}

          {/* Deals Reviewing */}
          {hasReviewing && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <h3 className="font-medium">Deals You&apos;re Reviewing</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {deals.reviewing.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {deals.reviewing.map((deal) => (
                  <DealCard key={deal.id} deal={deal} variant="reviewing" />
                ))}
              </div>
            </div>
          )}

          {/* Invested Deals */}
          {hasInvested && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <h3 className="font-medium">Your Investments</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {deals.invested.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {deals.invested.map((deal) => (
                  <DealCard key={deal.id} deal={deal} variant="invested" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
