/**
 * Roster Operations
 *
 * Functions for fetching and filtering roster members from Baserow.
 */

import { listRows, BaserowError } from './client';
import { TABLES, MEMBER_STATUS_OPTIONS } from './config';
import { Member } from './members';

/**
 * Roster member with essential fields for display
 */
export interface RosterMember {
  id: number;
  'Name': string | null;
  'Title': string | null;
  'Email': string | null;
  'Phone #': string | null;
  'Bio': string | null;
  'Headshot': Array<{ url: string; thumbnails?: { small?: { url: string }; card_cover?: { url: string }; large?: { url: string } } }> | null;
  'Geographies': Array<{ id: number; value: string }>;
  'Non-Profit Interests': Array<{ id: number; value: string }>;
  'Personal Hobbies': Array<{ id: number; value: string }>;
  'Stage Preference': Array<{ id: number; value: string }>;
  'Sector Preference': Array<{ id: number; value: string }>;
  'Consented to Roster': boolean;
  'Member Status': {
    id: number;
    value: string;
    color: string;
  } | null;
}

/**
 * Get all members who have consented to be on the roster and are active
 *
 * @returns Array of roster members
 */
export async function getRosterMembers(): Promise<RosterMember[]> {
  try {
    // Fetch all members - we'll filter in memory since Baserow filtering
    // for boolean + select combinations can be complex
    const response = await listRows<RosterMember>(TABLES.MEMBERS, {
      useFieldNames: true,
      size: 200, // Reasonable max for roster
    });

    // Filter for consented and active members
    const rosterMembers = response.results.filter((member) => {
      const isConsented = member['Consented to Roster'] === true;
      const isActive = member['Member Status']?.id === MEMBER_STATUS_OPTIONS.ACTIVE;
      return isConsented && isActive;
    });

    return rosterMembers;
  } catch (error) {
    if (error instanceof BaserowError) {
      console.error('Baserow error fetching roster:', error);
    }
    throw error;
  }
}

/**
 * Extract preference IDs from a member for matching comparison
 *
 * @param member - Member record
 * @returns Object with arrays of IDs for each preference type
 */
export function extractMemberPreferenceIds(member: Member | RosterMember): {
  nonProfitIds: number[];
  hobbyIds: number[];
  stageIds: number[];
  sectorIds: number[];
  geographyIds: number[];
} {
  const extractIds = (field: Array<{ id: number; value: string }> | undefined | null): number[] => {
    if (!field || !Array.isArray(field)) return [];
    return field.map((item) => item.id);
  };

  return {
    nonProfitIds: extractIds(member['Non-Profit Interests'] as any),
    hobbyIds: extractIds(member['Personal Hobbies'] as any),
    stageIds: extractIds(member['Stage Preference'] as any),
    sectorIds: extractIds(member['Sector Preference'] as any),
    geographyIds: extractIds(member['Geographies'] as any),
  };
}

/**
 * Check if a value matches between current user and another member
 *
 * @param valueId - ID of the value to check
 * @param userIds - Array of IDs from current user's preferences
 * @returns true if the value is in the user's preferences
 */
export function isMatchingPreference(valueId: number, userIds: number[]): boolean {
  return userIds.includes(valueId);
}
