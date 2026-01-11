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

## Deals Table Fields (Table ID: 756)

### Core Identity
- `Deal ID` (field_7252): Formula - auto-generated (e.g., D-0001)
- `Name` (field_7255): Text - deal name
- `Deal Owner` (field_7256): Multiple collaborators
- `Deal Source Member` (field_7257): Link to Members table
- `Source Name` (field_7259): Text - external source name
- `Source Email` (field_7260): Email

### Materials & Links
- `Internal Materials Link` (field_7261): URL - Dropbox (Not For Distribution)
- `External Materials Link` (field_7262): URL - Dropbox (For Distribution)
- `Company Provided Materials Link` (field_7263): URL
- `Deal Room Link` (field_7356): URL
- `Investment Memo Document` (field_7284): URL

### Company & Classification
- `Company` (field_7269): Link to Portfolio Companies table
- `Stage` (field_7271): Link to Stages table
- `Sector` (field_7282): Lookup from Company
- `Region` (field_7283): Lookup from Company

### Deal Details
- `Deal Summary` (field_7355): Text
- `Deal Size` (field_7358): Number (currency)
- `Expected Closing` (field_7359): Date
- `Minimum Investment` (field_7360): Number (currency)

### Deal Type Category (field_7429)
Single-select with option IDs:
```typescript
export const DEAL_TYPE_CATEGORY_OPTIONS = {
  DIRECT: 3132,
  HEDGE_FUNDS: 3133,
  PRIVATE_EQUITY: 3134,
  PRIVATE_CREDIT: 3135,
  VENTURE: 3136,
  REAL_ESTATE: 3137,
} as const;
```

| Option ID | Value |
|-----------|-------|
| 3132 | Direct |
| 3133 | Hedge Funds |
| 3134 | Private Equity |
| 3135 | Private Credit |
| 3136 | Venture |
| 3137 | Real Estate |

### Private Equity Type (field_7430)
Subtype field for when Deal Type Category = "Private Equity"
```typescript
export const PRIVATE_EQUITY_TYPE_OPTIONS = {
  BUYOUTS: 3138,
  GROWTH: 3139,
  SPECIAL_SITUATION_DISTRESSED: 3140,
  CONTINUATION: 3141,
  OTHER: 3142,
} as const;
```

| Option ID | Value |
|-----------|-------|
| 3138 | Buyouts |
| 3139 | Growth |
| 3140 | Special Situation / Distressed |
| 3141 | Continuation |
| 3142 | Other |

### Private Credit Type (field_7431)
Subtype field for when Deal Type Category = "Private Credit"
```typescript
export const PRIVATE_CREDIT_TYPE_OPTIONS = {
  SENIOR_LENDING: 3143,
  ASSET_FINANCING: 3144,
  CLO: 3145,
  OTHER: 3146,
} as const;
```

| Option ID | Value |
|-----------|-------|
| 3143 | Senior Lending |
| 3144 | Asset Financing |
| 3145 | CLO |
| 3146 | Other |

### Venture Type (field_7432)
Subtype field for when Deal Type Category = "Venture"
```typescript
export const VENTURE_TYPE_OPTIONS = {
  EARLY_STAGE: 3147,
  MIDDLE_STAGE: 3148,
  LATE_STAGE: 3149,
} as const;
```

| Option ID | Value |
|-----------|-------|
| 3147 | Early Stage |
| 3148 | Middle Stage |
| 3149 | Late Stage |

### Real Estate Type (field_7433)
Subtype field for when Deal Type Category = "Real Estate"
```typescript
export const REAL_ESTATE_TYPE_OPTIONS = {
  MULTIFAMILY: 3150,
  HOSPITALITY: 3151,
  INDUSTRIAL: 3152,
  RETAIL: 3153,
  OFFICE: 3154,
  SFR: 3155,
  LAND: 3156,
  MIXED_USE_OTHER: 3157,
  REITS: 3158,
} as const;
```

| Option ID | Value |
|-----------|-------|
| 3150 | Multifamily |
| 3151 | Hospitality |
| 3152 | Industrial |
| 3153 | Retail |
| 3154 | Office |
| 3155 | SFR |
| 3156 | Land |
| 3157 | Mixed Use / Other |
| 3158 | REITs |

### From Member? (field_7426)
Single-select with option IDs:
```typescript
export const FROM_MEMBER_OPTIONS = {
  YES: 3130,
  NO: 3131,
} as const;
```

### Related Records
- `Deal Process` (field_7351): Link to Deal Process table
- `Intros` (field_7375): Link to Intros table
- `Member Connections` (field_7396): Link to Member Connections table
- `Suggested Members` (field_7425): Link to Members table

### Files
- `Cover Photo` (field_7420): File
- `Fact Sheet` (field_7357): File
- `Documents` (field_7427): File
- `Logo` (field_7428): File
- `Deck` (field_7455): File - Investor deck/presentation

### Contact & Communication
- `Company Contact Name` (field_7434): Text
- `Company Contact Email` (field_7435): Email
- `Zoom Call Notes` (field_7441): Long text
- `Logged By` (field_7443): Text

### Financial Details
- `IRR` (field_7436): Number (decimal with % suffix)
- `Holding Period` (field_7437): Text
- `MOIE` (field_7438): Text
- `Fees` (field_7439): Text
- `Timing` (field_7440): Text

### Priority (field_7442)
Single-select with option IDs:
```typescript
export const DEAL_PRIORITY_OPTIONS = {
  HIGH: 3159,
  MEDIUM: 3160,
  LOW: 3161,
} as const;
```

| Option ID | Value |
|-----------|-------|
| 3159 | High |
| 3160 | Medium |
| 3161 | Low |

### Status (field_7444)
Single-select with option IDs:
```typescript
export const DEAL_STATUS_OPTIONS = {
  NEW: 3162,
  DILIGENCE: 3163,
  OUTREACH: 3164,
  CLOSED: 3165,
} as const;
```

| Option ID | Value |
|-----------|-------|
| 3162 | New |
| 3163 | Diligence |
| 3164 | Outreach |
| 3165 | Closed |

## Portfolio Companies Table Fields (Table ID: 757)

### Management Highlights
- `Management Highlights`: Long text - key highlights about company management

## Emails Table Fields (Table ID: 777)

This table is used for staging email templates before sending.

### Core Fields
- `Subject` (field_7446): Text (Primary field)
- `To` (field_7449): Email
- `Content` (field_7450): Long text
- `Email ID` (field_7452): Formula - auto-generated (e.g., E-0001)

### Status & Timestamps
- `Created At` (field_7453): Created on (auto-populated)
- `Sent At` (field_7454): Date with time

### Send Status (field_7451)
Single-select with option IDs:
```typescript
export const EMAIL_SEND_STATUS_OPTIONS = {
  DRAFT: 3166,
  READY_TO_SEND: 3167,
  SENT: 3168,
  FAILED: 3169,
} as const;
```

| Option ID | Value |
|-----------|-------|
| 3166 | Draft |
| 3167 | Ready to Send |
| 3168 | Sent |
| 3169 | Failed |

### Usage Notes
- Emails are staged in this table with `Send Status = Draft`
- Content can be edited before sending
- Set `Send Status = Ready to Send` to trigger sending (via automation/webhook)
- After sending, status updates to `Sent` and `Sent At` is populated

## Deal Comments Table (Table ID: 778)

Member comments on deals with anonymous and steering committee visibility options.

### Fields
| Field Name | Field ID | Type | Description |
|------------|----------|------|-------------|
| Deal | field_7459 | link_row | Link to Deals table (756) |
| Author | field_7461 | link_row | Link to Members table (347) |
| Comment Text | field_7463 | long_text | The comment content |
| Documents | field_7464 | file | Supporting attachments |
| Is Anonymous | field_7465 | boolean | If true, author not shown publicly |
| SteerCo Only | field_7466 | boolean | If true, only visible to steering committee |
| Is Deleted | field_7467 | boolean | Soft delete flag |
| Created Date | field_7468 | created_on | Auto-populated timestamp |
| Last Updated | field_7469 | last_modified | Auto-updated timestamp |

### Visibility Logic
- `Is Anonymous = false` + `SteerCo Only = false` → Shows in public feed with author name
- `Is Anonymous = true` + `SteerCo Only = false` → Shows in public feed as "Anonymous Member"
- `Is Anonymous = false` + `SteerCo Only = true` → Shows only to SteerCo with author name
- `Is Anonymous = true` + `SteerCo Only = true` → Shows only to SteerCo as "Anonymous Member"

## Samira Comments Table (Table ID: 779)

CEO comments on deals - can be general or targeted to specific members.

### Fields
| Field Name | Field ID | Type | Description |
|------------|----------|------|-------------|
| Deal | field_7473 | link_row | Link to Deals table (756) |
| Target Members | field_7475 | link_row | Link to Members (multiple) - if empty, comment is general |
| Comment Text | field_7477 | long_text | The comment content |
| Documents | field_7478 | file | Supporting attachments |
| Is Deleted | field_7479 | boolean | Soft delete flag |
| Created Date | field_7480 | created_on | Auto-populated timestamp |
| Last Updated | field_7481 | last_modified | Auto-updated timestamp |

### Visibility Logic
- If `Target Members` is empty → General comment (shown to all members on deal page)
- If `Target Members` has values → Shown only to those specific members

## Steering Committee Comments Table (Table ID: 780)

Comments from steering committee members on deals they're reviewing.

### Fields
| Field Name | Field ID | Type | Description |
|------------|----------|------|-------------|
| Deal | field_7485 | link_row | Link to Deals table (756) |
| Author | field_7487 | link_row | Link to Members table (347) |
| Comment Text | field_7489 | long_text | The comment/opinion |
| Documents | field_7490 | file | Supporting attachments |
| Is Deleted | field_7491 | boolean | Soft delete flag |
| Created Date | field_7492 | created_on | Auto-populated timestamp |
| Last Updated | field_7493 | last_modified | Auto-updated timestamp |

**Note:** These comments are only visible to steering committee members and CC admin.

## Additional Deals Table Fields

| Field Name | Field ID | Type | Description |
|------------|----------|------|-------------|
| SteerCo Members | field_7494 | link_row | Link to Members on the steering committee for this deal |

## Related Files

- [lib/baserow/config.ts](../lib/baserow/config.ts) - Field ID configuration
- [lib/baserow/client.ts](../lib/baserow/client.ts) - API client
- [lib/baserow/members.ts](../lib/baserow/members.ts) - Members-specific operations
- [scripts/get-baserow-fields.ts](../scripts/get-baserow-fields.ts) - Field discovery script
- [scripts/create-comment-tables.ts](../scripts/create-comment-tables.ts) - Script to create comment tables
