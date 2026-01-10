"use client";

import { useState } from "react";
import { Calendar, Sparkles, CheckCircle2, CalendarDays } from "lucide-react";
import { EventCard } from "./event-card";
import { EmptyState } from "./empty-state";
import type { CategorizedEvents } from "@/lib/home/types";

interface EventsSectionProps {
  events: CategorizedEvents;
}

export function EventsSection({ events }: EventsSectionProps) {
  const [categorizedEvents, setCategorizedEvents] = useState(events);

  const handleRegister = async (eventId: number) => {
    try {
      const response = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to register");
      }

      // Move the event from suggested/upcoming to registered
      setCategorizedEvents((prev) => {
        // Find the event in suggested or upcoming
        const eventFromSuggested = prev.suggested.find((e) => e.id === eventId);
        const eventFromUpcoming = prev.upcoming.find((e) => e.id === eventId);
        const registeredEvent = eventFromSuggested || eventFromUpcoming;

        if (!registeredEvent) return prev;

        return {
          suggested: prev.suggested.filter((e) => e.id !== eventId),
          registered: [...prev.registered, registeredEvent].sort((a, b) => {
            if (!a.startDate) return 1;
            if (!b.startDate) return -1;
            return a.startDate.localeCompare(b.startDate);
          }),
          upcoming: prev.upcoming.filter((e) => e.id !== eventId),
        };
      });
    } catch (error) {
      console.error("Registration failed:", error);
      alert(error instanceof Error ? error.message : "Failed to register for event");
    }
  };

  const hasSuggested = categorizedEvents.suggested.length > 0;
  const hasRegistered = categorizedEvents.registered.length > 0;
  const hasUpcoming = categorizedEvents.upcoming.length > 0;
  const hasAnyEvents = hasSuggested || hasRegistered || hasUpcoming;

  return (
    <section className="space-y-8">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Events</h2>
          <p className="text-sm text-muted-foreground">
            Exclusive events for Collaboration Circle members
          </p>
        </div>
      </div>

      {!hasAnyEvents ? (
        <EmptyState type="events" message="No upcoming events at this time" />
      ) : (
        <div className="space-y-8">
          {/* Suggested Events */}
          {hasSuggested && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-secondary" />
                <h3 className="font-medium">Suggested for You</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {categorizedEvents.suggested.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorizedEvents.suggested.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    variant="suggested"
                    onRegister={handleRegister}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Registered Events */}
          {hasRegistered && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <h3 className="font-medium">Your Registered Events</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {categorizedEvents.registered.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorizedEvents.registered.map((event) => (
                  <EventCard key={event.id} event={event} variant="registered" />
                ))}
              </div>
            </div>
          )}

          {/* All Upcoming Events */}
          {hasUpcoming && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-medium">All Upcoming Events</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {categorizedEvents.upcoming.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorizedEvents.upcoming.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    variant="upcoming"
                    onRegister={handleRegister}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
