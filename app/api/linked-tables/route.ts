/**
 * API endpoint to fetch linked table records
 * This runs on the server where BASEROW_API_KEY is available
 */

import { NextRequest, NextResponse } from 'next/server';
import { listRows } from '@/lib/baserow/client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tableId = searchParams.get('tableId');
  const displayField = searchParams.get('displayField') || 'Name';

  if (!tableId) {
    return NextResponse.json(
      { error: 'tableId is required' },
      { status: 400 }
    );
  }

  try {
    const response = await listRows<any>(parseInt(tableId), {
      size: 200,
    });

    // Map to simple format
    const records = response.results.map((row: any) => ({
      id: row.id,
      value: row[displayField] || row.Name || `Record ${row.id}`,
    }));

    return NextResponse.json(records);
  } catch (error) {
    console.error(`Error fetching linked table ${tableId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch records' },
      { status: 500 }
    );
  }
}
