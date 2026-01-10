/**
 * Linked Table Utilities
 *
 * Functions for fetching linked table records (sectors, stages, geographies, etc.)
 * Uses API endpoint to fetch data (runs on client side)
 */

import { LinkedRecord } from './types';

/**
 * Fetch all records from a linked table via API
 */
export async function fetchLinkedTableRecords(
  tableId: number,
  displayField: string = 'Name'
): Promise<LinkedRecord[]> {
  try {
    const params = new URLSearchParams({
      tableId: tableId.toString(),
      displayField,
    });

    const response = await fetch(`/api/linked-tables?${params}`);

    if (!response.ok) {
      throw new Error('Failed to fetch linked table records');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching linked table ${tableId}:`, error);
    return [];
  }
}

/**
 * Cache for linked table records to avoid repeated API calls
 */
const linkedTableCache = new Map<number, { records: LinkedRecord[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch linked table records with caching
 */
export async function fetchLinkedTableRecordsCached(
  tableId: number,
  displayField: string = 'Name'
): Promise<LinkedRecord[]> {
  const now = Date.now();
  const cached = linkedTableCache.get(tableId);

  // Return cached data if still valid
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.records;
  }

  // Fetch fresh data
  const records = await fetchLinkedTableRecords(tableId, displayField);

  // Update cache
  linkedTableCache.set(tableId, { records, timestamp: now });

  return records;
}
