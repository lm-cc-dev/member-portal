/**
 * Home Page Types
 *
 * TypeScript interfaces for Events, Deals, and related data
 */

// Baserow linked record format
export interface LinkedRecord {
  id: number;
  value: string;
}

// Baserow lookup value format (from linked tables)
export interface LookupValue {
  id: number;
  ids: Record<string, number>;
  value: string | null;
}

// Baserow file format
export interface BaserowFile {
  url: string;
  name: string;
  size: number;
  mime_type: string;
  is_image: boolean;
  image_width?: number;
  image_height?: number;
  uploaded_at: string;
  thumbnails?: {
    tiny?: { url: string; width: number; height: number };
    small?: { url: string; width: number; height: number };
    card_cover?: { url: string; width: number; height: number };
  };
}

// Event from Baserow Events table (769)
export interface BaserowEvent {
  id: number;
  'Event ID': string | null;
  'Topic': string | null;
  'Start Date': string | null;
  'End Date': string | null;
  'City': string | null;
  'Country': string | null;
  'Cover Photo': BaserowFile[] | null;
  'Capacity': string | null;
  'Agenda': string | null;
  'Geography': LinkedRecord[];
  'Members Suggested': LinkedRecord[];
  'Registrations': LinkedRecord[];
  'Number of Registrations': string | null;
  'Tickets Remaining': string | null;
}

// Event Registration from Baserow Event Registrations table (770)
export interface EventRegistration {
  id: number;
  'Registration ID': string | null;
  'Event': LinkedRecord[];
  'Member': LinkedRecord[];
  'Guests': string | null;
  'Date Registered': string | null;
}

// Deal from Baserow Deals table (756)
export interface BaserowDeal {
  id: number;
  'Deal ID': string | null;
  'Name': string | null;
  'Company': LinkedRecord[];
  'Deal Size': string | null;
  'Expected Closing': string | null;
  'Minimum Investment': string | null;
  'Deal Summary': string | null;
  'Stage': LinkedRecord[];
  'Sector': LookupValue[];
  'Region': LookupValue[];
  'Fact Sheet': BaserowFile[] | null;
  'Cover Photo': BaserowFile[] | null;
  'Deal Source Member': LinkedRecord[];
  'Deal Process': LinkedRecord[];
  'Deal Room Link': string | null;
  'Total Check Size': string | null;
}

// Deal Process from Baserow Deal Process table (772)
export interface DealProcess {
  id: number;
  'Process ID': string | null;
  'Deal': LinkedRecord[];
  'Member': LinkedRecord[];
  'Name': string | null;
  'Committed Amount': string | null;
  'Date Registered': string | null;
  'Signed CC NDA': boolean;
}

// Portfolio Company from Baserow Portfolio Companies table (757)
export interface PortfolioCompany {
  id: number;
  'Company ID': string | null;
  'Name': string | null;
  'Website': string | null;
  'Sector': LinkedRecord[];
  'Region': LinkedRecord[];
}

// Stage from Baserow Stages table (748)
export interface Stage {
  id: number;
  'Stage Name': string | null;
}

// Simplified event for UI display
export interface DisplayEvent {
  id: number;
  eventId: string | null;
  topic: string;
  startDate: string | null;
  endDate: string | null;
  city: string | null;
  country: string | null;
  coverPhoto: BaserowFile | null;
  capacity: number | null;
  registrationCount: number;
  ticketsRemaining: number | null;
}

// Simplified deal for UI display
export interface DisplayDeal {
  id: number;
  dealId: string | null;
  name: string;
  companyName: string | null;
  companyId: number | null;
  dealSize: string | null;
  expectedClosing: string | null;
  minimumInvestment: string | null;
  sector: string | null;
  region: string | null;
  coverPhoto: BaserowFile | null;
  stage: string | null;
  stageId: number | null;
}

// Invested deal with additional fields
export interface InvestedDeal extends DisplayDeal {
  committedAmount: string | null;
  dateClosed: string | null;
}

// Categorized events for home page
export interface CategorizedEvents {
  suggested: DisplayEvent[];
  registered: DisplayEvent[];
  upcoming: DisplayEvent[];
}

// Categorized deals for home page
export interface CategorizedDeals {
  suggested: DisplayDeal[];
  available: DisplayDeal[];
  reviewing: DisplayDeal[];
  invested: InvestedDeal[];
}

// Home page data payload
export interface HomePageData {
  events: CategorizedEvents;
  deals: CategorizedDeals;
  member: {
    id: number;
    name: string;
    email: string | null;
  };
}
