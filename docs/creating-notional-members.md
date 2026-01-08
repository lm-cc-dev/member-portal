# Creating Notional Members in Baserow

This guide explains how to create notional (test/demo) member records in the Baserow database using the scripts provided.

## Overview

Two scripts are available in the `/scripts` directory:

1. **`seed-members.ts`** - Creates new member records
2. **`update-members.ts`** - Updates existing members with additional data (headshots, linked records, etc.)

## Prerequisites

- Node.js and npm installed
- `.env` file with Baserow credentials:
  ```
  BASEROW_API_URL=https://baserow-production-9f1c.up.railway.app
  BASEROW_API_KEY=your_api_key_here
  ```

## Script 1: Creating Members (`seed-members.ts`)

### Usage

```bash
npx tsx scripts/seed-members.ts
```

### What It Creates

For each member, the script creates a record with:
- **Name** - Full name
- **Email** - Email address (use fake domains, not real ones)
- **Phone #** - Phone number
- **Title** - Business title/role
- **Bio** - 2-3 sentence professional biography
- **Member Status** - Active (option ID: 3105)
- **Onboarding Status** - Onboarded (option ID: 1974)
- **Consented to Roster** - true/false (controls visibility on roster page)
- **AUM** - Assets under management
- **Average Check Size** - Investment check size
- **Association to Capital** - How they relate to capital
- **Capital Discretion** - Decision-making authority
- **Funding Types** - Types of investments (array)
- **Liquidity / Exit Horizon Preference** - Investment timeline
- **Accredited Investor** - Yes/No

### Key Option IDs

```typescript
// Member Status
ACTIVE: 3105
INACTIVE: 3106

// Onboarding Status
NEW: 1972
INTERVIEW_SCHEDULED: 1973
ONBOARDED: 1974
REJECTED: 1975

// AUM (Assets Under Management)
ZERO_TO_30M: 3063
THIRTY_TO_100M: 3064
HUNDRED_TO_250M: 3065
TWO_FIFTY_TO_1B: 3066
OVER_1B: 3067
NA: 3068

// Average Check Size
ZERO_TO_500K: 3073
FIVE_HUNDRED_TO_2M: 3074
TWO_TO_5M: 3075
FIVE_TO_10M: 3076
OVER_10M: 3077

// Association to Capital
OWN_CAPITAL_SELF: 3058
OWN_CAPITAL_TEAM: 3059
FAMILY_OFFICE: 3060
INVESTMENT_FIRM: 3061
OTHER: 3062

// Capital Discretion
FULL_DISCRETION: 3069
INVESTMENT_COMMITTEE: 3070
NO_DISCRETION: 3071
OTHER: 3072

// Funding Types (multi-select)
EQUITY: 3089
DEBT: 3090
CONVERTIBLE: 3091
ACQUISITION: 3092
BUYOUT: 3093
MA: 3094
OPPORTUNITY_SPECIFIC: 3088

// Liquidity / Exit Horizon
ILLIQUID: 3084
SEMI_LIQUID: 3085
VERY_LIQUID: 3086
PUBLIC_ONLY: 3087
OPPORTUNITY_SPECIFIC: 3083

// Accredited Investor
YES: 3095
NO: 3096

// Internal Tiers
CORE_CIRCLE: 3111
TRUSTED_ORBIT: 3112
PERIPHERAL_ALLIES: 3113

// Capital Limitations & Opportunities (multi-select)
NO_RESTRICTIONS: 3078
NO_SPVS: 3079
NO_FUNDS: 3080
MINORITY_FOUNDERS: 3081
IMPACT_ORIENTED: 3082
```

## Script 2: Updating Members (`update-members.ts`)

### Usage

```bash
npx tsx scripts/update-members.ts
```

### What It Updates

- **Headshot** - Uploads avatar image via URL to Baserow
- **Email** - Updates to fake email domain
- **Linked Records**:
  - Geographies
  - Stage Preference
  - Sector Preference
  - Personal Hobbies
  - Non-Profit Interests
- **Additional Fields**:
  - Source of Wealth
  - Birthday
  - Capital Vehicle
  - Intended Member Contribution
  - How CC Can Support Member Goals
  - Areas Comfortable Speaking to in Calls
  - Internal Tiers
  - Capital Limitations & Opportunities

### Linked Table IDs

```typescript
// Geographies (table 751)
NORTH_AMERICA: 2
EUROPE: 3
APAC: 4
LATIN_AMERICA: 5
MIDDLE_EAST_AFRICA: 6
EMERGING_MARKETS: 7

// Stages (table 748)
SEED: 2
ABC_ROUNDS: 3
GROWTH: 4
LATE_STAGE: 5
PUBLIC_MARKET: 6
DISTRESSED: 7
FUNDS: 8

// Sectors/Centers of Excellence (table 746)
TECHNOLOGY: 2
HEALTHCARE: 3
CONSUMER: 4
ENERGY: 5
REAL_ESTATE: 6
MANUFACTURING: 7
TELECOM: 8
ENTERTAINMENT: 9
AGRICULTURE: 10

// Personal Hobbies (table 753)
OUTDOORS: 1
FOOD_DRINK: 2
TRAVEL: 3
FITNESS: 4
ART: 5
SPORTS: 6
COOKING: 7

// Non-Profit Interests (table 755)
HEALTHCARE: 2
EDUCATION: 3
THE_ARTS: 4
SOCIAL_SERVICES: 5
ANIMALS: 6
CHILDREN: 7
ENVIRONMENT: 8
SOCIAL_ENGAGEMENT: 9
```

## Generating Avatar Headshots

The scripts use [UI Avatars](https://ui-avatars.com/) to generate professional-looking initials-based avatars:

```typescript
const avatarUrl = `https://ui-avatars.com/api/?name=Warren+Buffett&size=256&background=1e3a5f&color=fff&bold=true&format=png`;
```

Parameters:
- `name` - Name to generate initials from (URL encoded)
- `size` - Image size in pixels (256 recommended)
- `background` - Hex color code (without #)
- `color` - Text color (fff for white)
- `bold` - Makes initials bold
- `format` - Image format (png)

## Uploading Files to Baserow

Files must be uploaded to Baserow's file storage before they can be attached to records:

```typescript
async function uploadFileViaUrl(url: string): Promise<{ name: string } | null> {
  const response = await fetch(`${BASEROW_API_URL}/api/user-files/upload-via-url/`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${BASEROW_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  const result = await response.json();
  return { name: result.name };
}

// Then use in update:
updateData['Headshot'] = [{ name: uploadedFile.name }];
```

## API Endpoints

### Create a Member
```
POST /api/database/rows/table/347/?user_field_names=true
Authorization: Token YOUR_API_KEY
Content-Type: application/json
```

### Update a Member
```
PATCH /api/database/rows/table/347/{row_id}/?user_field_names=true
Authorization: Token YOUR_API_KEY
Content-Type: application/json
```

### List All Members
```
GET /api/database/rows/table/347/?user_field_names=true&size=100
Authorization: Token YOUR_API_KEY
```

### Upload File via URL
```
POST /api/user-files/upload-via-url/
Authorization: Token YOUR_API_KEY
Content-Type: application/json
Body: { "url": "https://example.com/image.png" }
```

## Example: Creating a New Member

```typescript
const member = {
  Name: 'John Smith',
  Email: 'jsmith@fakeinvest.com',
  'Phone #': '+1 (555) 555-0100',
  Title: 'Managing Partner, Smith Capital',
  Bio: 'John Smith is a seasoned investor with 20 years of experience in technology and healthcare sectors.',
  'Member Status': 3105, // Active
  'Onboarding Status': 1974, // Onboarded
  'Consented to Roster': true,
  AUM: 3066, // 250M - 1B
  'Average Check Size': 3075, // 2-5M
  'Association to Capital': 3060, // Family Office
  'Capital Discretion': 3069, // Full Discretion
  'Funding Types': [3089, 3091], // Equity, Convertible
  'Liquidity / Exit Horizon Preference': 3084, // Illiquid
  'Accredited Investor': 3095, // Yes
};

const response = await fetch(`${BASEROW_API_URL}/api/database/rows/table/347/?user_field_names=true`, {
  method: 'POST',
  headers: {
    'Authorization': `Token ${BASEROW_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(member),
});
```

## Tips

1. **Roster Visibility**: Set `Consented to Roster: true` for members you want to appear on the roster page, `false` for those who should be hidden.

2. **Linked Records**: Pass arrays of IDs for linked tables (e.g., `Geographies: [2, 3]` for North America and Europe).

3. **Fake Data**: Always use fake email domains and phone numbers for test data. Never use real contact information.

4. **Batch Updates**: The scripts process members sequentially to avoid rate limiting. Each member takes ~1-2 seconds.

5. **Checking Results**: Use the Baserow API to verify records were created/updated correctly:
   ```bash
   curl -s "${BASEROW_API_URL}/api/database/rows/table/347/{id}/?user_field_names=true" \
     -H "Authorization: Token ${BASEROW_API_KEY}" | jq
   ```

## Table Reference

| Table | ID | Purpose |
|-------|-----|---------|
| Members | 347 | Main member records |
| Centers of Excellence (Sectors) | 746 | Investment sectors |
| Stages | 748 | Investment stages |
| Geographies | 751 | Geographic regions |
| Personal Hobbies | 753 | Member hobbies |
| Non-Profit Interests | 755 | Charitable interests |
