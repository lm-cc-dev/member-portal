"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, CheckCircle2, Loader2 } from "lucide-react";
import type { DisplayEvent } from "@/lib/home/types";

interface EventCardProps {
  event: DisplayEvent;
  variant: "suggested" | "registered" | "upcoming";
  onRegister?: (eventId: number) => Promise<void>;
}

/**
 * Parse a YYYY-MM-DD date string without timezone issues
 */
function parseDate(dateStr: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateStr.split("-").map(Number);
  return { year, month, day };
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Format date range for display (timezone-safe)
 */
function formatDateRange(startDate: string | null, endDate: string | null): string {
  if (!startDate) return "Date TBD";

  const start = parseDate(startDate);
  const startFormatted = `${MONTH_NAMES[start.month - 1]} ${start.day}, ${start.year}`;

  if (!endDate || startDate === endDate) {
    return startFormatted;
  }

  const end = parseDate(endDate);

  // Same month and year
  if (start.month === end.month && start.year === end.year) {
    return `${MONTH_NAMES[start.month - 1]} ${start.day}-${end.day}, ${start.year}`;
  }

  // Different month or year
  const endFormatted = `${MONTH_NAMES[end.month - 1]} ${end.day}, ${end.year}`;
  return `${startFormatted} - ${endFormatted}`;
}

/**
 * Format location for display
 */
function formatLocation(city: string | null, country: string | null): string | null {
  if (city && country) return `${city}, ${country}`;
  return city || country || null;
}

export function EventCard({ event, variant, onRegister }: EventCardProps) {
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = async () => {
    if (!onRegister || isRegistering) return;

    setIsRegistering(true);
    try {
      await onRegister(event.id);
    } finally {
      setIsRegistering(false);
    }
  };

  const location = formatLocation(event.city, event.country);
  const dateRange = formatDateRange(event.startDate, event.endDate);
  const hasCapacity = event.ticketsRemaining === null || event.ticketsRemaining > 0;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col !pt-0 !gap-0">
      {/* Cover Photo */}
      <div className="relative aspect-[16/9] bg-muted overflow-hidden">
        {event.coverPhoto ? (
          <Image
            src={event.coverPhoto.thumbnails?.card_cover?.url || event.coverPhoto.url}
            alt={event.topic}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <Calendar className="w-12 h-12 text-primary/30" />
          </div>
        )}

        {/* Variant Badge */}
        {variant === "suggested" && (
          <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground">
            Suggested
          </Badge>
        )}
        {variant === "registered" && (
          <Badge className="absolute top-2 left-2 bg-green-600 text-white">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Registered
          </Badge>
        )}
      </div>

      {/* Content */}
      <CardContent className="flex-1 flex flex-col p-4">
        <h3 className="font-semibold text-base mb-2 line-clamp-2">{event.topic}</h3>

        <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>{dateRange}</span>
          </div>

          {location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>{location}</span>
            </div>
          )}

          {event.capacity && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span>
                {event.registrationCount} / {event.capacity} registered
              </span>
            </div>
          )}
        </div>

        {/* Action */}
        <div className="mt-auto">
          {variant === "registered" ? (
            <div className="text-sm text-green-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              You&apos;re registered
            </div>
          ) : (
            <Button
              onClick={handleRegister}
              disabled={isRegistering || !hasCapacity}
              className="w-full"
              size="sm"
            >
              {isRegistering ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : hasCapacity ? (
                "Register"
              ) : (
                "Sold Out"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
