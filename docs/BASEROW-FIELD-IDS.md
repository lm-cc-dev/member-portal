# Baserow Field IDs Reference

## Important: Always Use Field IDs, Not Field Names

When working with Baserow, **always use field IDs** instead of field names. Field names can change, but IDs remain stable.

## Current Implementation

### Configuration Location

All Baserow field IDs are stored in: [lib/baserow/config.ts](../lib/baserow/config.ts)

### Field ID Format

Field IDs follow the format: `field_XXXXX` where XXXXX is the numeric field ID from Baserow.

For example:
```typescript
export const MEMBERS_FIELDS = {
  NAME: 'field_12345', // Maps to "Name" field
  EMAIL: 'field_12346', // Maps to "Email" field
  PHONE: 'field_12347', // Maps to "Phone #" field
}
```

## How to Get Field IDs

### Method 1: Using the MCP Server (Recommended during development)

The Baserow MCP server provides access to schema information:

```typescript
// Use the MCP tools available in Claude Code
mcp__Baserow_MCP__list_table_rows
```

### Method 2: Using the Script (For deployment)

Run the field ID discovery script:

```bash
npm run baserow:get-fields [table-id]
```

This will output all field IDs for the specified table (defaults to Members table).

### Method 3: Baserow API Directly

```bash
curl -H "Authorization: Token YOUR_API_KEY" \
  https://baserow-production-9f1c.up.railway.app/api/database/fields/table/347/
```

## Working with Fields in Code

### Reading Data

When fetching data from Baserow, use the `useFieldNames` parameter:

```typescript
// Using field names (easier to work with)
const member = await getRow(TABLES.MEMBERS, memberId, true);
console.log(member.Name, member.Email);

// Using field IDs (more stable, but harder to read)
const member = await getRow(TABLES.MEMBERS, memberId, false);
console.log(member['field_12345'], member['field_12346']);
```

### Writing Data

When updating Baserow, you can use field names with `useFieldNames: true`:

```typescript
await updateRow(
  TABLES.MEMBERS,
  memberId,
  {
    'Name': 'John Doe',
    'Email': 'john@example.com'
  },
  true // use field names
);
```

**Best Practice:** Use field names in the application code, but always maintain the field ID mappings in the config file for reference.

## Members Table Fields

### Core Identity
- `ID`: Row ID (always 'id', not a field ID)
- `Member ID`: Member identifier (e.g., M-0001)
- `Name`: Member name
- `Email`: Email address
- `Phone #`: Phone number
- `Birthday`: Date of birth

### Portal Integration
- `Portal ID`: **Critical** - Links to Postgres `user.id`

### Status Fields
- `Member Status`: Single-select with option IDs:
  - `3105` = "Active"
  - `3106` = "Inactive"
- `Onboarding Status`: Single-select with option IDs:
  - `1972` = "New"
  - `1973` = "Interview Scheduled"
  - `1974` = "Onboarded"
  - `1975` = "Rejected"

## Option ID Reference

For single-select and multiple-select fields, Baserow uses option IDs:

### Member Status Options
```typescript
export const MEMBER_STATUS_OPTIONS = {
  ACTIVE: 3105,
  INACTIVE: 3106,
} as const;
```

### When Checking Field Values

Always compare option IDs, not labels:

```typescript
// ✅ Correct
if (member['Member Status']?.id === MEMBER_STATUS_OPTIONS.ACTIVE) {
  // Member is active
}

// ❌ Wrong
if (member['Member Status']?.value === 'Active') {
  // This will break if the label changes
}
```

## Updating Field IDs

When Baserow schema changes:

1. Run the discovery script:
   ```bash
   npm run baserow:get-fields
   ```

2. Update [lib/baserow/config.ts](../lib/baserow/config.ts) with new field IDs

3. Update this documentation

4. Test all affected API routes and pages

## Related Files

- [lib/baserow/config.ts](../lib/baserow/config.ts) - Field ID configuration
- [lib/baserow/client.ts](../lib/baserow/client.ts) - API client
- [lib/baserow/members.ts](../lib/baserow/members.ts) - Members-specific operations
- [scripts/get-baserow-fields.ts](../scripts/get-baserow-fields.ts) - Field discovery script
