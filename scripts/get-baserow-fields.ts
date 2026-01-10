/**
 * Utility script to fetch field IDs from Baserow
 *
 * Usage: npx tsx scripts/get-baserow-fields.ts [table-id]
 *
 * This script fetches field metadata from Baserow and displays the field IDs
 * that should be used in lib/baserow/config.ts
 */

import { getTableFields } from '../lib/baserow/client';
import { TABLES } from '../lib/baserow/config';

async function main() {
  const tableId = process.argv[2]
    ? parseInt(process.argv[2])
    : TABLES.MEMBERS;

  console.log(`\n🔍 Fetching fields for table ID: ${tableId}\n`);

  try {
    const fields = await getTableFields(tableId);

    console.log(`Found ${fields.length} fields:\n`);
    console.log('Field ID → Field Name (Type)');
    console.log('─'.repeat(50));

    fields.forEach((field: any) => {
      console.log(`field_${field.id} → ${field.name} (${field.type})`);
    });

    console.log('\n📋 Copy these to lib/baserow/config.ts:\n');

    fields.forEach((field: any) => {
      const constantName = field.name
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');

      console.log(`  ${constantName}: 'field_${field.id}', // ${field.name}`);
    });

    console.log('\n✅ Done!\n');
  } catch (error) {
    console.error('❌ Error fetching fields:', error);
    console.error('\nMake sure BASEROW_API_KEY and BASEROW_API_URL are set in your .env file\n');
    process.exit(1);
  }
}

main();
