/**
 * Members Table Operations
 *
 * Type-safe helpers for working with the Members table in Baserow.
 */

import {
  getRow,
  listRows,
  updateRow,
  BaserowError,
} from './client';
import {
  TABLES,
  MEMBERS_FIELDS,
  MEMBER_STATUS_OPTIONS,
} from './config';

/**
 * Member data structure (using field names for convenience)
 * This represents a member record from Baserow
 */
export interface Member {
  id: number;
  'Member ID': string | null;
  'Name': string | null;
  'Email': string | null;
  'Phone #': string | null;
  'Birthday': string | null;
  'Portal ID': string | null; // Postgres user.id
  'Member Status': {
    id: number;
    value: string;
    color: string;
  } | null;
  'Onboarding Status': {
    id: number;
    value: string;
    color: string;
  } | null;
  // Add other fields as needed
  [key: string]: any;
}

/**
 * Find a member by email address
 *
 * @param email - Email address to search for
 * @returns Member record or null if not found
 */
export async function findMemberByEmail(
  email: string
): Promise<Member | null> {
  try {
    const response = await listRows<Member>(TABLES.MEMBERS, {
      search: email,
      useFieldNames: true,
      size: 1,
    });

    if (response.results.length === 0) {
      return null;
    }

    // Verify exact email match (search is fuzzy)
    const member = response.results[0];
    if (member.Email?.toLowerCase() === email.toLowerCase()) {
      return member;
    }

    return null;
  } catch (error) {
    if (error instanceof BaserowError) {
      console.error('Baserow error finding member:', error);
    }
    throw error;
  }
}

/**
 * Get a member by their Baserow row ID
 *
 * @param memberId - Baserow row ID
 * @returns Member record
 */
export async function getMemberById(memberId: number): Promise<Member> {
  return getRow<Member>(TABLES.MEMBERS, memberId, true);
}

/**
 * Update the Portal ID field in a member record
 * This links the Baserow member to a Postgres user
 *
 * @param memberId - Baserow row ID
 * @param portalId - Postgres user.id
 * @returns Updated member record
 */
export async function updateMemberPortalId(
  memberId: number,
  portalId: string
): Promise<Member> {
  return updateRow<Member>(
    TABLES.MEMBERS,
    memberId,
    {
      'Portal ID': portalId,
    },
    true // use field names
  );
}

/**
 * Check if a member is eligible to register
 * Currently checks: Member Status = "Active"
 *
 * @param member - Member record
 * @returns true if eligible, false otherwise
 */
export function isMemberEligibleToRegister(member: Member): boolean {
  // Check if Member Status is "Active"
  const memberStatus = member['Member Status'];

  if (!memberStatus) {
    return false;
  }

  return memberStatus.id === MEMBER_STATUS_OPTIONS.ACTIVE;
}

/**
 * Get the reason why a member is not eligible to register
 *
 * @param member - Member record
 * @returns Reason string or null if eligible
 */
export function getMemberIneligibilityReason(member: Member): string | null {
  const memberStatus = member['Member Status'];

  if (!memberStatus) {
    return 'Your member status has not been set. Please contact support.';
  }

  if (memberStatus.id !== MEMBER_STATUS_OPTIONS.ACTIVE) {
    return `Your member status is "${memberStatus.value}". Only active members can register.`;
  }

  return null;
}
