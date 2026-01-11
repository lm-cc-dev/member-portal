"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Building2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import type { DisplayDeal, InvestedDeal } from "@/lib/home/types";
import { formatCurrency } from "@/lib/home/deals";

interface DealCardProps {
  deal: DisplayDeal | InvestedDeal;
  variant: "suggested" | "available" | "reviewing" | "invested";
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Format date for display (timezone-safe)
 */
function formatDate(dateStr: string | null): string {
  if (!dateStr) return "TBD";
  const [year, month, day] = dateStr.split("-").map(Number);
  return `${MONTH_NAMES[month - 1]} ${day}, ${year}`;
}

/**
 * Check if deal is an invested deal with additional fields
 */
function isInvestedDeal(deal: DisplayDeal | InvestedDeal): deal is InvestedDeal {
  return "committedAmount" in deal;
}

export function DealCard({ deal, variant }: DealCardProps) {
  const invested = isInvestedDeal(deal) ? deal : null;

  return (
    <Link href={`/deals/${deal.id}`} className="block h-full">
      <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col !pt-0 !gap-0 cursor-pointer">
      {/* Cover Photo / Company Logo */}
      <div className="relative aspect-[16/9] bg-muted overflow-hidden">
        {deal.coverPhoto ? (
          <Image
            src={deal.coverPhoto.thumbnails?.card_cover?.url || deal.coverPhoto.url}
            alt={deal.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <Building2 className="w-12 h-12 text-primary/30" />
          </div>
        )}

        {/* Variant Badge */}
        {variant === "suggested" && (
          <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground">
            Suggested
          </Badge>
        )}
        {variant === "reviewing" && (
          <Badge className="absolute top-2 left-2 bg-amber-500 text-white">
            <Clock className="w-3 h-3 mr-1" />
            Reviewing
          </Badge>
        )}
        {variant === "invested" && (
          <Badge className="absolute top-2 left-2 bg-green-600 text-white">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Invested
          </Badge>
        )}
      </div>

      {/* Content */}
      <CardContent className="flex-1 flex flex-col p-4">
        {/* Company Name */}
        {deal.companyName && (
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
            {deal.companyName}
          </p>
        )}

        {/* Deal Name */}
        <h3 className="font-semibold text-base mb-3 line-clamp-2">{deal.name}</h3>

        {/* Deal Info */}
        <div className="space-y-2 text-sm">
          {variant === "invested" && invested ? (
            // Invested deal shows committed amount and date closed
            <>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" />
                  Committed
                </span>
                <span className="font-medium text-green-600">
                  {formatCurrency(invested.committedAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Date Closed
                </span>
                <span className="font-medium">{formatDate(invested.dateClosed)}</span>
              </div>
            </>
          ) : (
            // Standard deal shows deal size, expected closing, min investment
            <>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  Deal Size
                </span>
                <span className="font-medium">{formatCurrency(deal.dealSize)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Expected Close
                </span>
                <span className="font-medium">{formatDate(deal.expectedClosing)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" />
                  Min Investment
                </span>
                <span className="font-medium">{formatCurrency(deal.minimumInvestment)}</span>
              </div>
            </>
          )}
        </div>

        {/* Sector/Region Tags */}
        {(deal.sector || deal.region) && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t">
            {deal.sector && (
              <Badge variant="outline" className="text-xs">
                {deal.sector}
              </Badge>
            )}
            {deal.region && (
              <Badge variant="outline" className="text-xs">
                {deal.region}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
    </Link>
  );
}
