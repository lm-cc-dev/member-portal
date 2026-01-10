/**
 * Deals Data Functions
 *
 * Functions for fetching and categorizing deals for the home page
 */

import { listRows } from '@/lib/baserow/client';
import { TABLES } from '@/lib/baserow/config';
import type {
  BaserowDeal,
  DealProcess,
  Stage,
  DisplayDeal,
  InvestedDeal,
  CategorizedDeals,
  LinkedRecord,
} from './types';

// Stage names for categorization (these should match Baserow stage names)
const UNDERWRITING_STAGES = ['Underwriting', 'Due Diligence', 'Reviewing', 'In Review'];
const INVESTED_STAGES = ['Invested', 'Closed', 'Funded', 'Complete'];

/**
 * Transform a Baserow deal to a display-friendly format
 */
function transformDeal(deal: BaserowDeal): DisplayDeal {
  return {
    id: deal.id,
    dealId: deal['Deal ID'],
    name: deal['Name'] || 'Untitled Deal',
    companyName: deal['Company']?.[0]?.value || null,
    companyId: deal['Company']?.[0]?.id || null,
    dealSize: deal['Deal Size'],
    expectedClosing: deal['Expected Closing'],
    minimumInvestment: deal['Minimum Investment'],
    sector: deal['Sector']?.[0]?.value || null,
    region: deal['Region']?.[0]?.value || null,
    coverPhoto: deal['Cover Photo']?.[0] || null,
    stage: deal['Stage']?.[0]?.value || null,
    stageId: deal['Stage']?.[0]?.id || null,
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
 * Fetch all active deals (Expected Closing >= today or null)
 */
export async function fetchActiveDeals(): Promise<BaserowDeal[]> {
  const response = await listRows<BaserowDeal>(TABLES.DEALS, {
    useFieldNames: true,
    size: 100,
  });

  // Client-side filter for active deals
  const today = getTodayDate();
  return response.results.filter(deal => {
    const closingDate = deal['Expected Closing'];
    // Include if no closing date or closing date is today or later
    return !closingDate || closingDate >= today;
  });
}

/**
 * Fetch all deals (including closed ones for invested section)
 */
export async function fetchAllDeals(): Promise<BaserowDeal[]> {
  const response = await listRows<BaserowDeal>(TABLES.DEALS, {
    useFieldNames: true,
    size: 100,
  });

  return response.results;
}

/**
 * Fetch deal process records for a specific member
 */
export async function fetchMemberDealProcess(memberId: number): Promise<DealProcess[]> {
  const response = await listRows<DealProcess>(TABLES.DEAL_PROCESS, {
    useFieldNames: true,
    size: 100,
    filters: {
      'filter__Member__link_row_has': memberId,
    },
  });

  return response.results;
}

/**
 * Fetch all stages for reference
 */
export async function fetchStages(): Promise<Stage[]> {
  const response = await listRows<Stage>(TABLES.STAGES, {
    useFieldNames: true,
    size: 50,
  });

  return response.results;
}

/**
 * Extract suggested deal IDs from member's linked field
 */
function getSuggestedDealIds(suggestedDeals: LinkedRecord[] | null): Set<number> {
  const ids = new Set<number>();
  if (suggestedDeals) {
    for (const link of suggestedDeals) {
      ids.add(link.id);
    }
  }
  return ids;
}

/**
 * Build a map of deal ID to deal process record for a member
 */
function buildDealProcessMap(dealProcessRecords: DealProcess[]): Map<number, DealProcess> {
  const map = new Map<number, DealProcess>();
  for (const record of dealProcessRecords) {
    for (const dealLink of record['Deal'] || []) {
      map.set(dealLink.id, record);
    }
  }
  return map;
}

/**
 * Check if a stage name indicates the deal is in underwriting/review
 */
function isUnderwritingStage(stageName: string | null): boolean {
  if (!stageName) return false;
  return UNDERWRITING_STAGES.some(s =>
    stageName.toLowerCase().includes(s.toLowerCase())
  );
}

/**
 * Check if a stage name indicates the deal is invested/closed
 */
function isInvestedStage(stageName: string | null): boolean {
  if (!stageName) return false;
  return INVESTED_STAGES.some(s =>
    stageName.toLowerCase().includes(s.toLowerCase())
  );
}

/**
 * Get categorized deals for a member
 *
 * @param memberId - The Baserow member row ID
 * @param memberSuggestedDeals - The member's Suggested Deals linked records (may be null if field not created)
 * @returns Categorized deals for display
 */
export async function getDealsForMember(
  memberId: number,
  memberSuggestedDeals: LinkedRecord[] | null
): Promise<CategorizedDeals> {
  // Fetch all data in parallel
  const [allDeals, dealProcessRecords] = await Promise.all([
    fetchAllDeals(),
    fetchMemberDealProcess(memberId),
  ]);

  // Get suggested deal IDs
  const suggestedIds = getSuggestedDealIds(memberSuggestedDeals);

  // Build deal process map
  const dealProcessMap = buildDealProcessMap(dealProcessRecords);

  // Get today's date for filtering active deals
  const today = getTodayDate();

  // Categorize deals
  const suggested: DisplayDeal[] = [];
  const available: DisplayDeal[] = [];
  const reviewing: DisplayDeal[] = [];
  const invested: InvestedDeal[] = [];

  // Track which deal IDs are in reviewing or invested (to exclude from available)
  const engagedDealIds = new Set<number>();

  for (const deal of allDeals) {
    const displayDeal = transformDeal(deal);
    const dealProcess = dealProcessMap.get(deal.id);
    const stageName = deal['Stage']?.[0]?.value || null;

    // Check if member has a deal process record for this deal
    if (dealProcess) {
      if (isInvestedStage(stageName)) {
        // Member has invested in this deal
        const investedDeal: InvestedDeal = {
          ...displayDeal,
          committedAmount: dealProcess['Committed Amount'],
          dateClosed: dealProcess['Date Registered'], // Using Date Registered as date closed
        };
        invested.push(investedDeal);
        engagedDealIds.add(deal.id);
      } else if (isUnderwritingStage(stageName)) {
        // Member is reviewing this deal
        reviewing.push(displayDeal);
        engagedDealIds.add(deal.id);
      } else {
        // Has deal process but unknown stage - treat as reviewing
        reviewing.push(displayDeal);
        engagedDealIds.add(deal.id);
      }
    }
  }

  // Now categorize remaining deals (suggested and available)
  for (const deal of allDeals) {
    if (engagedDealIds.has(deal.id)) continue;

    const displayDeal = transformDeal(deal);
    const closingDate = deal['Expected Closing'];
    const isActive = !closingDate || closingDate >= today;

    if (suggestedIds.has(deal.id)) {
      // Suggested deals (show even if past closing for visibility)
      suggested.push(displayDeal);
    } else if (isActive) {
      // Active deals not engaged with
      available.push(displayDeal);
    }
    // Skip closed deals that aren't suggested or engaged
  }

  // Sort by expected closing date
  const sortByClosing = (a: DisplayDeal, b: DisplayDeal) => {
    if (!a.expectedClosing) return 1;
    if (!b.expectedClosing) return -1;
    return a.expectedClosing.localeCompare(b.expectedClosing);
  };

  suggested.sort(sortByClosing);
  available.sort(sortByClosing);
  reviewing.sort(sortByClosing);
  invested.sort((a, b) => {
    if (!a.dateClosed) return 1;
    if (!b.dateClosed) return -1;
    return b.dateClosed.localeCompare(a.dateClosed); // Most recent first
  });

  return {
    suggested,
    available,
    reviewing,
    invested,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(value: string | null): string {
  if (!value) return '-';

  const num = parseFloat(value);
  if (isNaN(num)) return value;

  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `$${(num / 1000).toFixed(0)}K`;
  }
  return `$${num.toLocaleString()}`;
}
