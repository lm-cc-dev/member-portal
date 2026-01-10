/**
 * Script to update member headshots with high-resolution professional portraits
 * Uses Unsplash images at 800x800 resolution for crisp display
 * Run with: npx tsx scripts/update-member-headshots.ts
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env file manually
const envPath = resolve(process.cwd(), '.env');
const envContent = readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
  }
});

const BASEROW_API_URL = envVars.BASEROW_API_URL || 'https://baserow-production-9f1c.up.railway.app';
const BASEROW_API_KEY = envVars.BASEROW_API_KEY;

if (!BASEROW_API_KEY) {
  console.error('Error: BASEROW_API_KEY not found in .env');
  process.exit(1);
}

// Table IDs
const MEMBERS_TABLE_ID = 347;

// High-resolution professional headshot photos from Unsplash
// These are professional portrait photos that convey executive presence
// Using 800x800 crop for optimal display at various sizes
const MEMBER_HEADSHOTS: Record<number, { name: string; url: string }> = {
  // Warren Buffett - ID 4 - Distinguished older businessman
  4: {
    name: 'Warren Buffett',
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=800&fit=crop&crop=face'
  },
  // Jamie Dimon - ID 5 - Executive in suit
  5: {
    name: 'Jamie Dimon',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=800&fit=crop&crop=face'
  },
  // Mary Barra - ID 6 - Professional woman executive
  6: {
    name: 'Mary Barra',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=800&fit=crop&crop=face'
  },
  // Satya Nadella - ID 7 - Tech executive
  7: {
    name: 'Satya Nadella',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=800&fit=crop&crop=face'
  },
  // Tim Cook - ID 8 - Clean-cut executive
  8: {
    name: 'Tim Cook',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop&crop=face'
  },
  // Sundar Pichai - ID 9 - Tech leader
  9: {
    name: 'Sundar Pichai',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=800&fit=crop&crop=face'
  },
  // Jensen Huang - ID 10 - Asian tech executive
  10: {
    name: 'Jensen Huang',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=800&fit=crop&crop=face'
  },
  // Brian Moynihan - ID 11 - Banking executive
  11: {
    name: 'Brian Moynihan',
    url: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=800&h=800&fit=crop&crop=face'
  },
  // Ginni Rometty - ID 12 - Senior woman executive
  12: {
    name: 'Ginni Rometty',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&h=800&fit=crop&crop=face'
  },
  // Marc Benioff - ID 13 - Tech entrepreneur
  13: {
    name: 'Marc Benioff',
    url: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=800&h=800&fit=crop&crop=face'
  },
  // Indra Nooyi - ID 14 - Indian-American woman executive
  14: {
    name: 'Indra Nooyi',
    url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=800&fit=crop&crop=face'
  },
  // Larry Fink - ID 15 - Finance executive
  15: {
    name: 'Larry Fink',
    url: 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=800&h=800&fit=crop&crop=face'
  },
  // Abigail Johnson - ID 16 - Finance woman executive
  16: {
    name: 'Abigail Johnson',
    url: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=800&h=800&fit=crop&crop=face'
  },
  // Ken Griffin - ID 17 - Hedge fund executive
  17: {
    name: 'Ken Griffin',
    url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&h=800&fit=crop&crop=face'
  },
  // Ray Dalio - ID 18 - Mature finance executive
  18: {
    name: 'Ray Dalio',
    url: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=800&h=800&fit=crop&crop=face'
  },
};

/**
 * Upload a file to Baserow via URL
 */
async function uploadFileViaUrl(imageUrl: string): Promise<any> {
  const response = await fetch(`${BASEROW_API_URL}/api/user-files/upload-via-url/`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${BASEROW_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: imageUrl }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to upload file: ${response.status} - ${text}`);
  }

  return response.json();
}

/**
 * Update a member's headshot field
 */
async function updateMemberHeadshot(memberId: number, fileData: any): Promise<void> {
  const response = await fetch(`${BASEROW_API_URL}/api/database/rows/table/${MEMBERS_TABLE_ID}/${memberId}/?user_field_names=true`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Token ${BASEROW_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      'Headshot': [{ name: fileData.name }],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to update member: ${response.status} - ${text}`);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('============================================================');
  console.log('UPDATING MEMBER HEADSHOTS WITH HIGH-RESOLUTION PHOTOS');
  console.log('============================================================\n');

  const memberIds = Object.keys(MEMBER_HEADSHOTS).map(Number);
  console.log(`Found ${memberIds.length} members to update\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const memberId of memberIds) {
    const member = MEMBER_HEADSHOTS[memberId];
    console.log(`Processing: ${member.name} (ID: ${memberId})`);

    try {
      // Upload the image via URL
      console.log(`  Uploading image...`);
      const fileData = await uploadFileViaUrl(member.url);
      console.log(`  Uploaded: ${fileData.name} (${fileData.image_width}x${fileData.image_height})`);

      // Update the member record
      console.log(`  Updating member record...`);
      await updateMemberHeadshot(memberId, fileData);
      console.log(`  Done!\n`);

      successCount++;
    } catch (error) {
      console.error(`  ERROR: ${error instanceof Error ? error.message : error}\n`);
      errorCount++;
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('============================================================');
  console.log(`COMPLETE: ${successCount} succeeded, ${errorCount} failed`);
  console.log('============================================================');
}

main().catch(console.error);
