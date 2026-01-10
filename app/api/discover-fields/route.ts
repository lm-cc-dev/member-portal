import { NextResponse } from 'next/server';
import { getTableFields } from '@/lib/baserow/client';
import { TABLES } from '@/lib/baserow/config';

export async function GET() {
  try {
    console.log('Discovering Baserow field IDs for Members table...');

    const fields = await getTableFields(TABLES.MEMBERS);

    const fieldMapping: Record<string, any> = {};
    const selectOptions: Record<string, any> = {};

    fields.forEach((field: any) => {
      fieldMapping[field.name] = `field_${field.id}`;

      // If it has select_options, capture those too
      if (field.select_options && field.select_options.length > 0) {
        selectOptions[field.name] = field.select_options.map((option: any) => ({
          label: option.value,
          id: option.id,
          color: option.color,
        }));
      }
    });

    return NextResponse.json({
      success: true,
      fields,
      fieldMapping,
      selectOptions,
    });
  } catch (error) {
    console.error('Error discovering fields:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
