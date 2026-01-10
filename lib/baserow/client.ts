/**
 * Baserow API Client
 *
 * Simple client for making requests to the Baserow API.
 * Handles authentication and error handling.
 */

import { BASEROW_API_URL, BASEROW_API_KEY } from './config';

export class BaserowError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'BaserowError';
  }
}

/**
 * Make a request to the Baserow API
 *
 * @param endpoint - API endpoint (e.g., '/api/database/rows/table/347/')
 * @param options - Fetch options
 * @returns Response JSON
 */
export async function baserowFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!BASEROW_API_KEY) {
    throw new Error('BASEROW_API_KEY is not configured');
  }

  const url = `${BASEROW_API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      cache: 'no-store', // Prevent Next.js caching issues
      headers: {
        'Authorization': `Token ${BASEROW_API_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new BaserowError(
        `Baserow API error: ${response.statusText}`,
        response.status,
        errorBody
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof BaserowError) {
      throw error;
    }
    throw new Error(`Failed to fetch from Baserow: ${error}`);
  }
}

/**
 * Get a single row from a Baserow table
 *
 * @param tableId - Table ID
 * @param rowId - Row ID
 * @param useFieldNames - Whether to use field names (true) or field IDs (false)
 * @returns Row data
 */
export async function getRow<T = any>(
  tableId: number,
  rowId: number,
  useFieldNames = false
): Promise<T> {
  const params = new URLSearchParams({
    user_field_names: useFieldNames.toString(),
  });

  return baserowFetch<T>(
    `/api/database/rows/table/${tableId}/${rowId}/?${params}`
  );
}

/**
 * List rows from a Baserow table with optional filtering
 *
 * @param tableId - Table ID
 * @param options - Query options
 * @returns Paginated list of rows
 */
export async function listRows<T = any>(
  tableId: number,
  options: {
    page?: number;
    size?: number;
    search?: string;
    useFieldNames?: boolean;
    filters?: Record<string, any>;
  } = {}
): Promise<{
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}> {
  const params = new URLSearchParams({
    page: (options.page || 1).toString(),
    size: (options.size || 100).toString(),
    user_field_names: (options.useFieldNames !== false).toString(),
  });

  if (options.search) {
    params.append('search', options.search);
  }

  // Add filters if provided
  if (options.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      params.append(key, String(value));
    });
  }

  return baserowFetch(
    `/api/database/rows/table/${tableId}/?${params}`
  );
}

/**
 * Create a new row in a Baserow table
 *
 * @param tableId - Table ID
 * @param data - Row data
 * @param useFieldNames - Whether to use field names (true) or field IDs (false)
 * @returns Created row
 */
export async function createRow<T = any>(
  tableId: number,
  data: Record<string, any>,
  useFieldNames = false
): Promise<T> {
  const params = new URLSearchParams({
    user_field_names: useFieldNames.toString(),
  });

  return baserowFetch<T>(
    `/api/database/rows/table/${tableId}/?${params}`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

/**
 * Update a row in a Baserow table
 *
 * @param tableId - Table ID
 * @param rowId - Row ID
 * @param data - Updated data
 * @param useFieldNames - Whether to use field names (true) or field IDs (false)
 * @returns Updated row
 */
export async function updateRow<T = any>(
  tableId: number,
  rowId: number,
  data: Record<string, any>,
  useFieldNames = false
): Promise<T> {
  const params = new URLSearchParams({
    user_field_names: useFieldNames.toString(),
  });

  return baserowFetch<T>(
    `/api/database/rows/table/${tableId}/${rowId}/?${params}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    }
  );
}

/**
 * Delete a row from a Baserow table
 *
 * @param tableId - Table ID
 * @param rowId - Row ID
 */
export async function deleteRow(
  tableId: number,
  rowId: number
): Promise<void> {
  await baserowFetch(
    `/api/database/rows/table/${tableId}/${rowId}/`,
    {
      method: 'DELETE',
    }
  );
}

/**
 * Get field metadata for a table
 * Useful for discovering field IDs
 *
 * @param tableId - Table ID
 * @returns Array of field definitions
 */
export async function getTableFields(tableId: number): Promise<any[]> {
  return baserowFetch(`/api/database/fields/table/${tableId}/`);
}
