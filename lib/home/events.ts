/**
 * Events Data Functions
 *
 * Functions for fetching and categorizing events for the home page
 */

import { listRows, createRow } from '@/lib/baserow/client';
import { TABLES } from '@/lib/baserow/config';
import type {
  BaserowEvent,
  EventRegistration,
  DisplayEvent,
  CategorizedEvents,
  LinkedRecord,
} from './types';

/**
 * Transform a Baserow event to a display-friendly format
 */
function transformEvent(event: BaserowEvent): DisplayEvent {
  return {
    id: event.id,
    eventId: event['Event ID'],
    topic: event['Topic'] || 'Untitled Event',
    startDate: event['Start Date'],
    endDate: event['End Date'],
    city: event['City'],
    country: event['Country'],
    coverPhoto: event['Cover Photo']?.[0] || null,
    capacity: event['Capacity'] ? parseInt(event['Capacity']) : null,
    registrationCount: event['Number of Registrations'] ? parseInt(event['Number of Registrations']) : 0,
    ticketsRemaining: event['Tickets Remaining'] ? parseInt(event['Tickets Remaining']) : null,
  };
}

/**
 * Get today's date in YYYY-MM-DD format for filtering
 */
function getTodayDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Fetch all upcoming events (Start Date >= today)
 */
export async function fetchUpcomingEvents(): Promise<BaserowEvent[]> {
  const today = getTodayDate();

  const response = await listRows<BaserowEvent>(TABLES.EVENTS, {
    useFieldNames: true,
    size: 100,
    filters: {
      'filter__Start Date__date_after_or_equal': today,
    },
  });

  return response.results;
}

/**
 * Fetch all events (for testing/when filters don't work)
 */
export async function fetchAllEvents(): Promise<BaserowEvent[]> {
  const response = await listRows<BaserowEvent>(TABLES.EVENTS, {
    useFieldNames: true,
    size: 100,
  });

  return response.results;
}

/**
 * Fetch event registrations for a specific member
 */
export async function fetchMemberRegistrations(memberId: number): Promise<EventRegistration[]> {
  const response = await listRows<EventRegistration>(TABLES.EVENT_REGISTRATIONS, {
    useFieldNames: true,
    size: 100,
    filters: {
      'filter__Member__link_row_has': memberId,
    },
  });

  return response.results;
}

/**
 * Extract event IDs from registrations
 */
function getRegisteredEventIds(registrations: EventRegistration[]): Set<number> {
  const ids = new Set<number>();
  for (const reg of registrations) {
    for (const eventLink of reg['Event'] || []) {
      ids.add(eventLink.id);
    }
  }
  return ids;
}

/**
 * Extract suggested event IDs from member's linked field
 */
function getSuggestedEventIds(suggestedEvents: LinkedRecord[] | null): Set<number> {
  const ids = new Set<number>();
  if (suggestedEvents) {
    for (const link of suggestedEvents) {
      ids.add(link.id);
    }
  }
  return ids;
}

/**
 * Filter events to only include upcoming ones (client-side filter for safety)
 */
function filterUpcomingEvents(events: BaserowEvent[]): BaserowEvent[] {
  const today = getTodayDate();
  return events.filter(event => {
    const startDate = event['Start Date'];
    if (!startDate) return false;
    return startDate >= today;
  });
}

/**
 * Get categorized events for a member
 *
 * @param memberId - The Baserow member row ID
 * @param memberSuggestedEvents - The member's Suggested Events linked records
 * @returns Categorized events for display
 */
export async function getEventsForMember(
  memberId: number,
  memberSuggestedEvents: LinkedRecord[] | null
): Promise<CategorizedEvents> {
  // Fetch all data in parallel
  const [allEvents, registrations] = await Promise.all([
    fetchAllEvents(),
    fetchMemberRegistrations(memberId),
  ]);

  // Filter to upcoming events
  const upcomingEvents = filterUpcomingEvents(allEvents);

  // Get sets of IDs for categorization
  const suggestedIds = getSuggestedEventIds(memberSuggestedEvents);
  const registeredIds = getRegisteredEventIds(registrations);

  // Categorize events
  const suggested: DisplayEvent[] = [];
  const registered: DisplayEvent[] = [];
  const upcoming: DisplayEvent[] = [];

  for (const event of upcomingEvents) {
    const displayEvent = transformEvent(event);

    if (registeredIds.has(event.id)) {
      // Registered takes priority
      registered.push(displayEvent);
    } else if (suggestedIds.has(event.id)) {
      // Suggested but not registered
      suggested.push(displayEvent);
    } else {
      // Not suggested or registered - general upcoming
      upcoming.push(displayEvent);
    }
  }

  // Sort by start date
  const sortByDate = (a: DisplayEvent, b: DisplayEvent) => {
    if (!a.startDate) return 1;
    if (!b.startDate) return -1;
    return a.startDate.localeCompare(b.startDate);
  };

  suggested.sort(sortByDate);
  registered.sort(sortByDate);
  upcoming.sort(sortByDate);

  return {
    suggested,
    registered,
    upcoming,
  };
}

/**
 * Register a member for an event
 *
 * @param memberId - The Baserow member row ID
 * @param eventId - The Baserow event row ID
 * @returns The created registration record
 */
export async function registerForEvent(
  memberId: number,
  eventId: number
): Promise<EventRegistration> {
  const today = getTodayDate();

  const registration = await createRow<EventRegistration>(
    TABLES.EVENT_REGISTRATIONS,
    {
      'Event': [eventId],
      'Member': [memberId],
      'Date Registered': today,
      'Guests': '0',
    },
    true
  );

  return registration;
}

/**
 * Check if a member is already registered for an event
 */
export async function isRegisteredForEvent(
  memberId: number,
  eventId: number
): Promise<boolean> {
  const registrations = await fetchMemberRegistrations(memberId);
  const registeredIds = getRegisteredEventIds(registrations);
  return registeredIds.has(eventId);
}
