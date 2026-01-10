import { getTableFields } from '../lib/baserow/client';
import { TABLES } from '../lib/baserow/config';

async function discoverFields() {
  try {
    console.log('Discovering Baserow field IDs for Members table...\n');

    const fields = await getTableFields(TABLES.MEMBERS);

    console.log('All fields:');
    console.log(JSON.stringify(fields, null, 2));

    console.log('\n\nField ID mapping:');
    fields.forEach((field: any) => {
      console.log(`${field.name}: field_${field.id}`);

      // If it has select_options, show those too
      if (field.select_options && field.select_options.length > 0) {
        console.log(`  Options:`);
        field.select_options.forEach((option: any) => {
          console.log(`    ${option.value}: ${option.id}`);
        });
      }
    });

  } catch (error) {
    console.error('Error discovering fields:', error);
  }
}

discoverFields();
