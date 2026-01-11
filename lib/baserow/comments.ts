/**
 * Baserow Comments API
 *
 * Data layer for deal comments functionality.
 * Handles all three comment types:
 * - Deal Comments (member comments)
 * - Samira Comments (CEO comments)
 * - Steering Committee Comments
 */

import { listRows, createRow, updateRow, getRow } from './client';
import {
  TABLES,
  DEAL_COMMENTS_FIELDS,
  SAMIRA_COMMENTS_FIELDS,
  STEERCO_COMMENTS_FIELDS,
} from './config';

// =============================================================================
// Types
// =============================================================================

export interface DealComment {
  id: number;
  deal: { id: number; value: string }[];
  author: { id: number; value: string }[];
  commentText: string;
  documents: any[];
  isAnonymous: boolean;
  steercoOnly: boolean;
  isDeleted: boolean;
  createdDate: string;
  lastUpdated: string;
  // Populated for display
  authorName?: string;
  authorHeadshot?: string;
}

export interface SamiraComment {
  id: number;
  deal: { id: number; value: string }[];
  targetMembers: { id: number; value: string }[];
  commentText: string;
  documents: any[];
  isDeleted: boolean;
  createdDate: string;
  lastUpdated: string;
}

export interface SteerCoComment {
  id: number;
  deal: { id: number; value: string }[];
  author: { id: number; value: string }[];
  commentText: string;
  documents: any[];
  isDeleted: boolean;
  createdDate: string;
  lastUpdated: string;
  // Populated for display
  authorName?: string;
  authorHeadshot?: string;
}

export interface CreateDealCommentData {
  commentText: string;
  isAnonymous?: boolean;
  steercoOnly?: boolean;
  documents?: any[];
}

export interface CreateSamiraCommentData {
  commentText: string;
  targetMembers?: number[];
  documents?: any[];
}

export interface CreateSteerCoCommentData {
  commentText: string;
  documents?: any[];
}

// =============================================================================
// Deal Comments (Member Comments)
// =============================================================================

/**
 * Get all comments for a deal
 * @param dealId - Baserow deal row ID
 * @param options - Filter options
 */
export async function getDealComments(
  dealId: number,
  options: { includeSteercoOnly?: boolean } = {}
): Promise<DealComment[]> {
  const response = await listRows<any>(TABLES.DEAL_COMMENTS, {
    useFieldNames: true,
    filters: {
      [`filter__Deal__link_row_has`]: dealId,
    },
    size: 200,
  });

  // Filter and transform
  let comments = response.results
    .filter((c: any) => !c['Is Deleted'])
    .map((c: any) => ({
      id: c.id,
      deal: c['Deal'] || [],
      author: c['Author'] || [],
      commentText: c['Comment Text'] || '',
      documents: c['Documents'] || [],
      isAnonymous: c['Is Anonymous'] || false,
      steercoOnly: c['SteerCo Only'] || false,
      isDeleted: c['Is Deleted'] || false,
      createdDate: c['Created Date'] || '',
      lastUpdated: c['Last Updated'] || '',
      authorName: c['Author']?.[0]?.value || 'Unknown',
    }));

  // Filter steerco-only if not requested
  if (!options.includeSteercoOnly) {
    comments = comments.filter((c) => !c.steercoOnly);
  }

  // Sort by created date (newest first)
  comments.sort(
    (a, b) =>
      new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
  );

  return comments;
}

/**
 * Create a new deal comment
 */
export async function createDealComment(
  dealId: number,
  memberId: number,
  data: CreateDealCommentData
): Promise<DealComment> {
  const row = await createRow(
    TABLES.DEAL_COMMENTS,
    {
      'Deal': [dealId],
      'Author': [memberId],
      'Comment Text': data.commentText,
      'Is Anonymous': data.isAnonymous || false,
      'SteerCo Only': data.steercoOnly || false,
      'Is Deleted': false,
      'Documents': data.documents || [],
    },
    true
  );

  return {
    id: row.id,
    deal: row['Deal'] || [],
    author: row['Author'] || [],
    commentText: row['Comment Text'] || '',
    documents: row['Documents'] || [],
    isAnonymous: row['Is Anonymous'] || false,
    steercoOnly: row['SteerCo Only'] || false,
    isDeleted: false,
    createdDate: row['Created Date'] || new Date().toISOString(),
    lastUpdated: row['Last Updated'] || new Date().toISOString(),
  };
}

/**
 * Update a deal comment
 */
export async function updateDealComment(
  commentId: number,
  data: Partial<CreateDealCommentData>
): Promise<DealComment> {
  const updateData: Record<string, any> = {};

  if (data.commentText !== undefined) {
    updateData['Comment Text'] = data.commentText;
  }
  if (data.isAnonymous !== undefined) {
    updateData['Is Anonymous'] = data.isAnonymous;
  }
  if (data.steercoOnly !== undefined) {
    updateData['SteerCo Only'] = data.steercoOnly;
  }
  if (data.documents !== undefined) {
    updateData['Documents'] = data.documents;
  }

  const row = await updateRow(TABLES.DEAL_COMMENTS, commentId, updateData, true);

  return {
    id: row.id,
    deal: row['Deal'] || [],
    author: row['Author'] || [],
    commentText: row['Comment Text'] || '',
    documents: row['Documents'] || [],
    isAnonymous: row['Is Anonymous'] || false,
    steercoOnly: row['SteerCo Only'] || false,
    isDeleted: row['Is Deleted'] || false,
    createdDate: row['Created Date'] || '',
    lastUpdated: row['Last Updated'] || '',
  };
}

/**
 * Soft delete a deal comment
 */
export async function deleteDealComment(commentId: number): Promise<void> {
  await updateRow(
    TABLES.DEAL_COMMENTS,
    commentId,
    { 'Is Deleted': true },
    true
  );
}

/**
 * Get a single deal comment by ID
 */
export async function getDealCommentById(
  commentId: number
): Promise<DealComment | null> {
  try {
    const row = await getRow(TABLES.DEAL_COMMENTS, commentId, true);
    return {
      id: row.id,
      deal: row['Deal'] || [],
      author: row['Author'] || [],
      commentText: row['Comment Text'] || '',
      documents: row['Documents'] || [],
      isAnonymous: row['Is Anonymous'] || false,
      steercoOnly: row['SteerCo Only'] || false,
      isDeleted: row['Is Deleted'] || false,
      createdDate: row['Created Date'] || '',
      lastUpdated: row['Last Updated'] || '',
    };
  } catch {
    return null;
  }
}

// =============================================================================
// Samira Comments (CEO Comments)
// =============================================================================

/**
 * Get Samira comments for a deal
 * @param dealId - Baserow deal row ID
 * @param forMemberId - If provided, includes targeted comments for this member
 */
export async function getSamiraComments(
  dealId: number,
  forMemberId?: number
): Promise<SamiraComment[]> {
  const response = await listRows<any>(TABLES.SAMIRA_COMMENTS, {
    useFieldNames: true,
    filters: {
      [`filter__Deal__link_row_has`]: dealId,
    },
    size: 200,
  });

  // Filter and transform
  const comments = response.results
    .filter((c: any) => {
      // Exclude deleted
      if (c['Is Deleted']) return false;

      // If no target members, it's a general comment (visible to all)
      const targetMembers = c['Target Members'] || [];
      if (targetMembers.length === 0) return true;

      // If has target members, only show if forMemberId is in the list
      if (forMemberId) {
        return targetMembers.some((m: any) => m.id === forMemberId);
      }

      return false;
    })
    .map((c: any) => ({
      id: c.id,
      deal: c['Deal'] || [],
      targetMembers: c['Target Members'] || [],
      commentText: c['Comment Text'] || '',
      documents: c['Documents'] || [],
      isDeleted: c['Is Deleted'] || false,
      createdDate: c['Created Date'] || '',
      lastUpdated: c['Last Updated'] || '',
    }));

  // Sort by created date (newest first)
  comments.sort(
    (a, b) =>
      new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
  );

  return comments;
}

/**
 * Create a Samira comment
 */
export async function createSamiraComment(
  dealId: number,
  data: CreateSamiraCommentData
): Promise<SamiraComment> {
  const row = await createRow(
    TABLES.SAMIRA_COMMENTS,
    {
      'Deal': [dealId],
      'Target Members': data.targetMembers || [],
      'Comment Text': data.commentText,
      'Is Deleted': false,
      'Documents': data.documents || [],
    },
    true
  );

  return {
    id: row.id,
    deal: row['Deal'] || [],
    targetMembers: row['Target Members'] || [],
    commentText: row['Comment Text'] || '',
    documents: row['Documents'] || [],
    isDeleted: false,
    createdDate: row['Created Date'] || new Date().toISOString(),
    lastUpdated: row['Last Updated'] || new Date().toISOString(),
  };
}

/**
 * Soft delete a Samira comment
 */
export async function deleteSamiraComment(commentId: number): Promise<void> {
  await updateRow(
    TABLES.SAMIRA_COMMENTS,
    commentId,
    { 'Is Deleted': true },
    true
  );
}

/**
 * Get steerco-only member comments for a deal
 * These are member comments marked as SteerCo Only
 */
export async function getSteercoOnlyMemberComments(
  dealId: number
): Promise<DealComment[]> {
  const response = await listRows<any>(TABLES.DEAL_COMMENTS, {
    useFieldNames: true,
    filters: {
      [`filter__Deal__link_row_has`]: dealId,
    },
    size: 200,
  });

  // Filter for steerco-only comments only
  const comments = response.results
    .filter((c: any) => !c['Is Deleted'] && c['SteerCo Only'])
    .map((c: any) => ({
      id: c.id,
      deal: c['Deal'] || [],
      author: c['Author'] || [],
      commentText: c['Comment Text'] || '',
      documents: c['Documents'] || [],
      isAnonymous: c['Is Anonymous'] || false,
      steercoOnly: true,
      isDeleted: c['Is Deleted'] || false,
      createdDate: c['Created Date'] || '',
      lastUpdated: c['Last Updated'] || '',
      authorName: c['Author']?.[0]?.value || 'Unknown',
    }));

  return comments;
}

// =============================================================================
// Steering Committee Comments
// =============================================================================

/**
 * Get SteerCo comments for a deal
 */
export async function getSteerCoComments(
  dealId: number
): Promise<SteerCoComment[]> {
  const response = await listRows<any>(TABLES.STEERCO_COMMENTS, {
    useFieldNames: true,
    filters: {
      [`filter__Deal__link_row_has`]: dealId,
    },
    size: 200,
  });

  // Filter and transform
  const comments = response.results
    .filter((c: any) => !c['Is Deleted'])
    .map((c: any) => ({
      id: c.id,
      deal: c['Deal'] || [],
      author: c['Author'] || [],
      commentText: c['Comment Text'] || '',
      documents: c['Documents'] || [],
      isDeleted: c['Is Deleted'] || false,
      createdDate: c['Created Date'] || '',
      lastUpdated: c['Last Updated'] || '',
      authorName: c['Author']?.[0]?.value || 'Unknown',
    }));

  // Sort by created date (newest first)
  comments.sort(
    (a, b) =>
      new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
  );

  return comments;
}

/**
 * Create a SteerCo comment
 */
export async function createSteerCoComment(
  dealId: number,
  memberId: number,
  data: CreateSteerCoCommentData
): Promise<SteerCoComment> {
  const row = await createRow(
    TABLES.STEERCO_COMMENTS,
    {
      'Deal': [dealId],
      'Author': [memberId],
      'Comment Text': data.commentText,
      'Is Deleted': false,
      'Documents': data.documents || [],
    },
    true
  );

  return {
    id: row.id,
    deal: row['Deal'] || [],
    author: row['Author'] || [],
    commentText: row['Comment Text'] || '',
    documents: row['Documents'] || [],
    isDeleted: false,
    createdDate: row['Created Date'] || new Date().toISOString(),
    lastUpdated: row['Last Updated'] || new Date().toISOString(),
  };
}

/**
 * Soft delete a SteerCo comment
 */
export async function deleteSteerCoComment(commentId: number): Promise<void> {
  await updateRow(
    TABLES.STEERCO_COMMENTS,
    commentId,
    { 'Is Deleted': true },
    true
  );
}

// =============================================================================
// Authorization Helpers
// =============================================================================

/**
 * Check if a member is on the steering committee for a deal
 */
export async function isMemberOnSteerCo(
  dealId: number,
  memberId: number
): Promise<boolean> {
  try {
    const deal = await getRow(TABLES.DEALS, dealId, true);
    const steercoMembers = deal['SteerCo Members'] || [];
    return steercoMembers.some((m: any) => m.id === memberId);
  } catch {
    return false;
  }
}
