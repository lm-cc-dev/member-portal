/**
 * Create Comment Tables in Baserow
 *
 * This script uses JWT authentication to create the comment-related tables
 * and fields in Baserow for the deal comments system.
 *
 * Required environment variables:
 * - BASEROW_API_URL: Baserow API URL
 * - BASEROW_ADMIN_EMAIL: Admin email for JWT auth
 * - BASEROW_ADMIN_PASSWORD: Admin password for JWT auth
 *
 * Usage: npx tsx scripts/create-comment-tables.ts
 */

const BASEROW_API_URL = process.env.BASEROW_API_URL || 'https://api.baserow.io';
const BASEROW_ADMIN_EMAIL = process.env.BASEROW_ADMIN_EMAIL;
const BASEROW_ADMIN_PASSWORD = process.env.BASEROW_ADMIN_PASSWORD;

// Database and table IDs
const DATABASE_ID = 100;
const DEALS_TABLE_ID = 756;
const MEMBERS_TABLE_ID = 347;

interface JWTResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    username: string;
  };
}

interface TableResponse {
  id: number;
  name: string;
  order: number;
  database_id: number;
}

interface FieldResponse {
  id: number;
  name: string;
  type: string;
  table_id: number;
}

/**
 * Get JWT token by logging in
 */
async function getJWTToken(): Promise<string> {
  if (!BASEROW_ADMIN_EMAIL || !BASEROW_ADMIN_PASSWORD) {
    throw new Error(
      'BASEROW_ADMIN_EMAIL and BASEROW_ADMIN_PASSWORD must be set in environment'
    );
  }

  console.log('Authenticating with Baserow...');

  const response = await fetch(`${BASEROW_API_URL}/api/user/token-auth/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: BASEROW_ADMIN_EMAIL,
      password: BASEROW_ADMIN_PASSWORD,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to authenticate: ${response.status} - ${error}`);
  }

  const data: JWTResponse = await response.json();
  console.log(`Authenticated as: ${data.user.username}`);
  return data.access_token;
}

/**
 * Make authenticated request with JWT
 */
async function jwtFetch<T>(
  endpoint: string,
  jwtToken: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${BASEROW_API_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `JWT ${jwtToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Create a new table
 */
async function createTable(
  jwtToken: string,
  name: string
): Promise<TableResponse> {
  console.log(`Creating table: ${name}`);

  const table = await jwtFetch<TableResponse>(
    `/api/database/tables/database/${DATABASE_ID}/`,
    jwtToken,
    {
      method: 'POST',
      body: JSON.stringify({ name }),
    }
  );

  console.log(`  Created table ID: ${table.id}`);
  return table;
}

/**
 * Create a field in a table
 */
async function createField(
  jwtToken: string,
  tableId: number,
  fieldConfig: Record<string, any>
): Promise<FieldResponse> {
  console.log(`  Creating field: ${fieldConfig.name} (${fieldConfig.type})`);

  const field = await jwtFetch<FieldResponse>(
    `/api/database/fields/table/${tableId}/`,
    jwtToken,
    {
      method: 'POST',
      body: JSON.stringify(fieldConfig),
    }
  );

  console.log(`    Field ID: ${field.id}`);
  return field;
}

/**
 * Create Deal Comments table
 */
async function createDealCommentsTable(jwtToken: string): Promise<{
  tableId: number;
  fields: Record<string, number>;
}> {
  const table = await createTable(jwtToken, 'Deal Comments');
  const fields: Record<string, number> = {};

  // Deal link field
  const dealField = await createField(jwtToken, table.id, {
    name: 'Deal',
    type: 'link_row',
    link_row_table_id: DEALS_TABLE_ID,
  });
  fields['Deal'] = dealField.id;

  // Author link field
  const authorField = await createField(jwtToken, table.id, {
    name: 'Author',
    type: 'link_row',
    link_row_table_id: MEMBERS_TABLE_ID,
  });
  fields['Author'] = authorField.id;

  // Comment Text
  const textField = await createField(jwtToken, table.id, {
    name: 'Comment Text',
    type: 'long_text',
  });
  fields['Comment Text'] = textField.id;

  // Documents
  const docsField = await createField(jwtToken, table.id, {
    name: 'Documents',
    type: 'file',
  });
  fields['Documents'] = docsField.id;

  // Is Anonymous
  const anonField = await createField(jwtToken, table.id, {
    name: 'Is Anonymous',
    type: 'boolean',
  });
  fields['Is Anonymous'] = anonField.id;

  // SteerCo Only
  const steercoField = await createField(jwtToken, table.id, {
    name: 'SteerCo Only',
    type: 'boolean',
  });
  fields['SteerCo Only'] = steercoField.id;

  // Is Deleted
  const deletedField = await createField(jwtToken, table.id, {
    name: 'Is Deleted',
    type: 'boolean',
  });
  fields['Is Deleted'] = deletedField.id;

  // Created Date
  const createdField = await createField(jwtToken, table.id, {
    name: 'Created Date',
    type: 'created_on',
    date_include_time: true,
  });
  fields['Created Date'] = createdField.id;

  // Last Updated
  const updatedField = await createField(jwtToken, table.id, {
    name: 'Last Updated',
    type: 'last_modified',
    date_include_time: true,
  });
  fields['Last Updated'] = updatedField.id;

  return { tableId: table.id, fields };
}

/**
 * Create Samira Comments table
 */
async function createSamiraCommentsTable(jwtToken: string): Promise<{
  tableId: number;
  fields: Record<string, number>;
}> {
  const table = await createTable(jwtToken, 'Samira Comments');
  const fields: Record<string, number> = {};

  // Deal link field
  const dealField = await createField(jwtToken, table.id, {
    name: 'Deal',
    type: 'link_row',
    link_row_table_id: DEALS_TABLE_ID,
  });
  fields['Deal'] = dealField.id;

  // Target Members link field (multiple)
  const targetField = await createField(jwtToken, table.id, {
    name: 'Target Members',
    type: 'link_row',
    link_row_table_id: MEMBERS_TABLE_ID,
  });
  fields['Target Members'] = targetField.id;

  // Comment Text
  const textField = await createField(jwtToken, table.id, {
    name: 'Comment Text',
    type: 'long_text',
  });
  fields['Comment Text'] = textField.id;

  // Documents
  const docsField = await createField(jwtToken, table.id, {
    name: 'Documents',
    type: 'file',
  });
  fields['Documents'] = docsField.id;

  // Is Deleted
  const deletedField = await createField(jwtToken, table.id, {
    name: 'Is Deleted',
    type: 'boolean',
  });
  fields['Is Deleted'] = deletedField.id;

  // Created Date
  const createdField = await createField(jwtToken, table.id, {
    name: 'Created Date',
    type: 'created_on',
    date_include_time: true,
  });
  fields['Created Date'] = createdField.id;

  // Last Updated
  const updatedField = await createField(jwtToken, table.id, {
    name: 'Last Updated',
    type: 'last_modified',
    date_include_time: true,
  });
  fields['Last Updated'] = updatedField.id;

  return { tableId: table.id, fields };
}

/**
 * Create Steering Committee Comments table
 */
async function createSteerCoCommentsTable(jwtToken: string): Promise<{
  tableId: number;
  fields: Record<string, number>;
}> {
  const table = await createTable(jwtToken, 'Steering Committee Comments');
  const fields: Record<string, number> = {};

  // Deal link field
  const dealField = await createField(jwtToken, table.id, {
    name: 'Deal',
    type: 'link_row',
    link_row_table_id: DEALS_TABLE_ID,
  });
  fields['Deal'] = dealField.id;

  // Author link field
  const authorField = await createField(jwtToken, table.id, {
    name: 'Author',
    type: 'link_row',
    link_row_table_id: MEMBERS_TABLE_ID,
  });
  fields['Author'] = authorField.id;

  // Comment Text
  const textField = await createField(jwtToken, table.id, {
    name: 'Comment Text',
    type: 'long_text',
  });
  fields['Comment Text'] = textField.id;

  // Documents
  const docsField = await createField(jwtToken, table.id, {
    name: 'Documents',
    type: 'file',
  });
  fields['Documents'] = docsField.id;

  // Is Deleted
  const deletedField = await createField(jwtToken, table.id, {
    name: 'Is Deleted',
    type: 'boolean',
  });
  fields['Is Deleted'] = deletedField.id;

  // Created Date
  const createdField = await createField(jwtToken, table.id, {
    name: 'Created Date',
    type: 'created_on',
    date_include_time: true,
  });
  fields['Created Date'] = createdField.id;

  // Last Updated
  const updatedField = await createField(jwtToken, table.id, {
    name: 'Last Updated',
    type: 'last_modified',
    date_include_time: true,
  });
  fields['Last Updated'] = updatedField.id;

  return { tableId: table.id, fields };
}

/**
 * Add SteerCo Members field to Deals table
 */
async function addSteerCoMembersToDeals(jwtToken: string): Promise<number> {
  console.log('Adding SteerCo Members field to Deals table...');

  const field = await createField(jwtToken, DEALS_TABLE_ID, {
    name: 'SteerCo Members',
    type: 'link_row',
    link_row_table_id: MEMBERS_TABLE_ID,
  });

  return field.id;
}

/**
 * Main execution
 */
async function main() {
  console.log('='.repeat(60));
  console.log('Baserow Comment Tables Creation Script');
  console.log('='.repeat(60));
  console.log(`API URL: ${BASEROW_API_URL}`);
  console.log(`Database ID: ${DATABASE_ID}`);
  console.log('');

  try {
    // Get JWT token
    const jwtToken = await getJWTToken();
    console.log('');

    // Create tables
    console.log('Creating comment tables...');
    console.log('-'.repeat(40));

    const dealComments = await createDealCommentsTable(jwtToken);
    console.log('');

    const samiraComments = await createSamiraCommentsTable(jwtToken);
    console.log('');

    const steercoComments = await createSteerCoCommentsTable(jwtToken);
    console.log('');

    // Add SteerCo Members field to Deals
    console.log('-'.repeat(40));
    const steercoMembersFieldId = await addSteerCoMembersToDeals(jwtToken);
    console.log('');

    // Output summary
    console.log('='.repeat(60));
    console.log('SUCCESS! Tables and fields created.');
    console.log('='.repeat(60));
    console.log('');
    console.log('New Table IDs:');
    console.log(`  DEAL_COMMENTS: ${dealComments.tableId}`);
    console.log(`  SAMIRA_COMMENTS: ${samiraComments.tableId}`);
    console.log(`  STEERCO_COMMENTS: ${steercoComments.tableId}`);
    console.log('');
    console.log('New Field on Deals Table (756):');
    console.log(`  SteerCo Members: field_${steercoMembersFieldId}`);
    console.log('');
    console.log('Deal Comments Fields:');
    for (const [name, id] of Object.entries(dealComments.fields)) {
      console.log(`  ${name}: field_${id}`);
    }
    console.log('');
    console.log('Samira Comments Fields:');
    for (const [name, id] of Object.entries(samiraComments.fields)) {
      console.log(`  ${name}: field_${id}`);
    }
    console.log('');
    console.log('Steering Committee Comments Fields:');
    for (const [name, id] of Object.entries(steercoComments.fields)) {
      console.log(`  ${name}: field_${id}`);
    }
    console.log('');
    console.log('Next steps:');
    console.log('1. Update lib/baserow/config.ts with new table IDs');
    console.log('2. Update docs/BASEROW-FIELD-IDS.md with field mappings');
    console.log('3. Regenerate MCP server if needed');
  } catch (error) {
    console.error('');
    console.error('ERROR:', error);
    process.exit(1);
  }
}

main();
