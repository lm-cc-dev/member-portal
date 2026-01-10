/**
 * Script to update cover photos for Deals and Events
 * Uses high-quality Unsplash images at 1600x900 resolution
 * Run with: npx tsx scripts/update-cover-photos.ts
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env file manually
const envPath = resolve(process.cwd(), '.env');
const envContent = readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && !key.startsWith('#')) {
    process.env[key.trim()] = values.join('=').trim();
  }
});

const BASEROW_API_URL = process.env.BASEROW_API_URL;
const BASEROW_API_KEY = process.env.BASEROW_API_KEY;

if (!BASEROW_API_KEY) {
  console.error('BASEROW_API_KEY not set');
  process.exit(1);
}

// Table IDs
const TABLES = {
  DEALS: 756,
  EVENTS: 769,
};

// =============================================================================
// DEAL COVER PHOTOS - High quality images matching each deal
// Using 1600x900 for crisp display on high-DPI screens
// =============================================================================

const dealPhotos: { id: number; name: string; url: string }[] = [
  {
    id: 3,
    name: 'Nexus AI Series C',
    // AI/Technology - abstract circuit board pattern
    url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1600&h=900&fit=crop&crop=center',
  },
  {
    id: 4,
    name: 'Meridian NYC Tower Development',
    // NYC skyline with modern skyscrapers
    url: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1600&h=900&fit=crop&crop=center',
  },
  {
    id: 5,
    name: 'BioVenture Gene Therapy Platform',
    // Biotech/laboratory with DNA imagery
    url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1600&h=900&fit=crop&crop=center',
  },
  {
    id: 6,
    name: 'CleanGrid Solar Infrastructure',
    // Solar panels at sunset
    url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1600&h=900&fit=crop&crop=center',
  },
  {
    id: 7,
    name: 'Stellar Dubai Resort Acquisition',
    // Dubai luxury resort/beach view
    url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1600&h=900&fit=crop&crop=center',
  },
  {
    id: 8,
    name: 'Alpine European Logistics Fund',
    // Modern logistics/warehouse facility
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&h=900&fit=crop&crop=center',
  },
  {
    id: 9,
    name: 'Quantum Digital Banking Platform',
    // Fintech/digital banking - modern city at night with lights
    url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1600&h=900&fit=crop&crop=center',
  },
  {
    id: 10,
    name: 'Evergreen Vertical Farming Expansion',
    // Vertical farming/hydroponics
    url: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=1600&h=900&fit=crop&crop=center',
  },
];

// =============================================================================
// EVENT COVER PHOTOS - Higher resolution versions
// =============================================================================

const eventPhotos: { id: number; name: string; url: string }[] = [
  {
    id: 4, // Monaco Wealth Summit
    name: 'Monaco Wealth Summit 2026',
    url: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=1600&h=900&fit=crop&crop=center',
  },
  {
    id: 5, // Aspen Winter Retreat
    name: 'Aspen Winter Retreat',
    url: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=1600&h=900&fit=crop&crop=center',
  },
  {
    id: 6, // NYC Private Dinner
    name: 'NYC Private Dinner',
    url: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1600&h=900&fit=crop&crop=center',
  },
  {
    id: 7, // London Roundtable
    name: 'London Financial Leaders Roundtable',
    url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600&h=900&fit=crop&crop=center',
  },
  {
    id: 8, // Singapore Forum
    name: 'Singapore Asia Investment Forum',
    url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1600&h=900&fit=crop&crop=center',
  },
  {
    id: 9, // Napa Valley
    name: 'Napa Valley Vineyard Experience',
    url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1600&h=900&fit=crop&crop=center',
  },
];

// =============================================================================
// API HELPER FUNCTIONS
// =============================================================================

async function uploadFileViaUrl(url: string): Promise<{ name: string } | null> {
  const uploadUrl = `${BASEROW_API_URL}/api/user-files/upload-via-url/`;

  try {
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${BASEROW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`  Failed to upload file: ${error}`);
      return null;
    }

    const result = await response.json();
    return { name: result.name };
  } catch (error) {
    console.error(`  Error uploading file: ${error}`);
    return null;
  }
}

async function updateRow(tableId: number, rowId: number, data: Record<string, unknown>): Promise<boolean> {
  const url = `${BASEROW_API_URL}/api/database/rows/table/${tableId}/${rowId}/?user_field_names=true`;

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Token ${BASEROW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`  Failed to update row: ${error}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`  Error updating row: ${error}`);
    return false;
  }
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function updateDealPhotos(): Promise<void> {
  console.log('\n💰 Updating Deal Cover Photos...\n');

  for (const deal of dealPhotos) {
    console.log(`  📷 Uploading photo for ${deal.name}...`);
    const uploadedFile = await uploadFileViaUrl(deal.url);

    if (uploadedFile) {
      const success = await updateRow(TABLES.DEALS, deal.id, {
        'Cover Photo': [uploadedFile],
      });
      if (success) {
        console.log(`  ✓ Updated: ${deal.name} (ID: ${deal.id})`);
      } else {
        console.log(`  ✗ Failed to update: ${deal.name}`);
      }
    } else {
      console.log(`  ✗ Failed to upload photo for: ${deal.name}`);
    }
  }
}

async function updateEventPhotos(): Promise<void> {
  console.log('\n🎉 Updating Event Cover Photos (Higher Resolution)...\n');

  for (const event of eventPhotos) {
    console.log(`  📷 Uploading photo for ${event.name}...`);
    const uploadedFile = await uploadFileViaUrl(event.url);

    if (uploadedFile) {
      const success = await updateRow(TABLES.EVENTS, event.id, {
        'Cover Photo': [uploadedFile],
      });
      if (success) {
        console.log(`  ✓ Updated: ${event.name} (ID: ${event.id})`);
      } else {
        console.log(`  ✗ Failed to update: ${event.name}`);
      }
    } else {
      console.log(`  ✗ Failed to upload photo for: ${event.name}`);
    }
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('  UPDATING COVER PHOTOS FOR DEALS AND EVENTS');
  console.log('='.repeat(60));

  // Update Deal Photos
  await updateDealPhotos();

  // Update Event Photos with higher resolution
  await updateEventPhotos();

  console.log('\n' + '='.repeat(60));
  console.log('  UPDATE COMPLETE');
  console.log('='.repeat(60));
  console.log('\nSummary:');
  console.log(`  • Deals updated: ${dealPhotos.length}`);
  console.log(`  • Events updated: ${eventPhotos.length}`);
  console.log('\nAll images are now 1600x900 resolution for crisp display.');
}

main().catch(console.error);
