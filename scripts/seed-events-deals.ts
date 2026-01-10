/**
 * Seed script to create Events, Deals, and Portfolio Companies in Baserow
 * Run with: npx tsx scripts/seed-events-deals.ts
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

// Table IDs
const TABLES = {
  PORTFOLIO_COMPANIES: 757,
  DEALS: 756,
  EVENTS: 769,
};

if (!BASEROW_API_KEY) {
  console.error('BASEROW_API_KEY not set');
  process.exit(1);
}

// =============================================================================
// LINKED TABLE IDs REFERENCE
// =============================================================================

const GEOGRAPHIES = {
  NORTH_AMERICA: 2,
  EUROPE: 3,
  APAC: 4,
  LATIN_AMERICA: 5,
  MIDDLE_EAST_AFRICA: 6,
  EMERGING_MARKETS: 7,
};

const SECTORS = {
  TECHNOLOGY: 2,
  HEALTHCARE: 3,
  CONSUMER: 4,
  ENERGY: 5,
  REAL_ESTATE: 6,
  MANUFACTURING: 7,
  TELECOM: 8,
  ENTERTAINMENT: 9,
  AGRICULTURE: 10,
};

const STAGES = {
  SEED: 2,
  ABC_ROUNDS: 3,
  GROWTH: 4,
  LATE_STAGE: 5,
  PUBLIC_MARKET: 6,
  DISTRESSED: 7,
  FUNDS: 8,
};

const MEMBERS = {
  WARREN_BUFFETT: 4,
  JAMIE_DIMON: 5,
  MARY_BARRA: 6,
  SATYA_NADELLA: 7,
  TIM_COOK: 8,
  SUNDAR_PICHAI: 9,
  JENSEN_HUANG: 10,
  BRIAN_MOYNIHAN: 11,
  GINNI_ROMETTY: 12,
  MARC_BENIOFF: 13,
  INDRA_NOOYI: 14,
  LARRY_FINK: 15,
  ABIGAIL_JOHNSON: 16,
  KEN_GRIFFIN: 17,
  RAY_DALIO: 18,
};

// =============================================================================
// PORTFOLIO COMPANIES DATA
// =============================================================================

interface PortfolioCompanyData {
  Name: string;
  Website: string;
  Region: number[];
  Sector: number[];
}

const portfolioCompanies: PortfolioCompanyData[] = [
  {
    Name: 'Nexus AI Labs',
    Website: 'https://nexusailabs.example.com',
    Region: [GEOGRAPHIES.NORTH_AMERICA],
    Sector: [SECTORS.TECHNOLOGY],
  },
  {
    Name: 'Meridian Real Estate Partners',
    Website: 'https://meridianrep.example.com',
    Region: [GEOGRAPHIES.NORTH_AMERICA],
    Sector: [SECTORS.REAL_ESTATE],
  },
  {
    Name: 'BioVenture Therapeutics',
    Website: 'https://bioventure.example.com',
    Region: [GEOGRAPHIES.EUROPE],
    Sector: [SECTORS.HEALTHCARE],
  },
  {
    Name: 'CleanGrid Energy',
    Website: 'https://cleangrid.example.com',
    Region: [GEOGRAPHIES.NORTH_AMERICA],
    Sector: [SECTORS.ENERGY],
  },
  {
    Name: 'Stellar Hospitality Group',
    Website: 'https://stellarhospitality.example.com',
    Region: [GEOGRAPHIES.MIDDLE_EAST_AFRICA],
    Sector: [SECTORS.CONSUMER, SECTORS.REAL_ESTATE],
  },
  {
    Name: 'Alpine Infrastructure Fund',
    Website: 'https://alpineinfra.example.com',
    Region: [GEOGRAPHIES.EUROPE],
    Sector: [SECTORS.REAL_ESTATE, SECTORS.MANUFACTURING],
  },
  {
    Name: 'Quantum Fintech Solutions',
    Website: 'https://quantumfintech.example.com',
    Region: [GEOGRAPHIES.APAC],
    Sector: [SECTORS.TECHNOLOGY],
  },
  {
    Name: 'Evergreen Agriculture Tech',
    Website: 'https://evergreenagtech.example.com',
    Region: [GEOGRAPHIES.LATIN_AMERICA],
    Sector: [SECTORS.AGRICULTURE, SECTORS.TECHNOLOGY],
  },
];

// =============================================================================
// DEALS DATA (Company IDs will be filled after creation)
// =============================================================================

interface DealData {
  Name: string;
  'Deal Summary': string;
  companyName: string; // Reference to match with created company
  'Deal Size': string;
  'Minimum Investment': string;
  'Expected Closing': string;
  Stage: number[];
  'Deal Source Member': number[];
  'Source Name': string;
  'Source Email': string;
}

const deals: DealData[] = [
  {
    Name: 'Nexus AI Series C',
    'Deal Summary': `Nexus AI Labs is raising a $150M Series C to accelerate development of their enterprise AI platform. The company has achieved product-market fit with Fortune 500 customers and is growing ARR at 180% YoY.

The platform enables companies to deploy custom AI models without extensive ML expertise, reducing time-to-production from months to days. Key customers include three of the top ten global banks and several Fortune 100 manufacturers.

Proceeds will fund expansion into APAC markets and development of next-generation multimodal AI capabilities.`,
    companyName: 'Nexus AI Labs',
    'Deal Size': '150000000.00',
    'Minimum Investment': '2000000.00',
    'Expected Closing': '2026-03-31',
    Stage: [STAGES.GROWTH],
    'Deal Source Member': [MEMBERS.JENSEN_HUANG, MEMBERS.SATYA_NADELLA],
    'Source Name': 'Michael Chen',
    'Source Email': 'mchen@nexusailabs.example.com',
  },
  {
    Name: 'Meridian NYC Tower Development',
    'Deal Summary': `Meridian Real Estate Partners is developing a 62-story mixed-use tower in Hudson Yards, Manhattan. The $500M raise represents the equity component of a $1.8B total project cost.

The development includes 400 luxury residential units, 250,000 sq ft of Class A office space, and ground-floor retail. Pre-leasing has secured commitments for 60% of office space from blue-chip tenants.

Expected returns of 18-22% IRR over a 5-year hold period, with quarterly distributions beginning in Year 2.`,
    companyName: 'Meridian Real Estate Partners',
    'Deal Size': '500000000.00',
    'Minimum Investment': '10000000.00',
    'Expected Closing': '2026-04-15',
    Stage: [STAGES.LATE_STAGE],
    'Deal Source Member': [MEMBERS.KEN_GRIFFIN, MEMBERS.LARRY_FINK],
    'Source Name': 'Sarah Rodriguez',
    'Source Email': 'srodriguez@meridianrep.example.com',
  },
  {
    Name: 'BioVenture Gene Therapy Platform',
    'Deal Summary': `BioVenture Therapeutics is raising $75M to advance its proprietary gene therapy platform through Phase 2 clinical trials. The company's lead candidate targets rare genetic disorders with no current treatment options.

The platform has demonstrated exceptional safety profiles in Phase 1 trials and received Breakthrough Therapy designation from the FDA. Partnership discussions are ongoing with three major pharmaceutical companies.

This round will fund completion of two Phase 2 trials and expansion of the manufacturing facility in Munich.`,
    companyName: 'BioVenture Therapeutics',
    'Deal Size': '75000000.00',
    'Minimum Investment': '1000000.00',
    'Expected Closing': '2026-02-28',
    Stage: [STAGES.ABC_ROUNDS],
    'Deal Source Member': [MEMBERS.GINNI_ROMETTY],
    'Source Name': 'Dr. Klaus Weber',
    'Source Email': 'kweber@bioventure.example.com',
  },
  {
    Name: 'CleanGrid Solar Infrastructure',
    'Deal Summary': `CleanGrid Energy is raising $200M to finance the construction of 500MW of utility-scale solar projects across the American Southwest. All projects have secured 20-year power purchase agreements with investment-grade utilities.

The portfolio includes five shovel-ready projects in Arizona, Nevada, and Texas with all permits and interconnection agreements in place. Construction is scheduled to begin Q2 2026.

Target returns of 12-15% unlevered IRR with stable, contracted cash flows. Qualifies for Investment Tax Credits providing additional value to tax-sensitive investors.`,
    companyName: 'CleanGrid Energy',
    'Deal Size': '200000000.00',
    'Minimum Investment': '5000000.00',
    'Expected Closing': '2026-03-15',
    Stage: [STAGES.GROWTH],
    'Deal Source Member': [MEMBERS.MARY_BARRA, MEMBERS.MARC_BENIOFF],
    'Source Name': 'Jennifer Park',
    'Source Email': 'jpark@cleangrid.example.com',
  },
  {
    Name: 'Stellar Dubai Resort Acquisition',
    'Deal Summary': `Stellar Hospitality Group is acquiring a premier beachfront resort property in Dubai for $350M. The 450-room luxury resort includes three restaurants, a world-class spa, and private beach access.

The property is currently underperforming under passive management. Stellar's operational expertise is projected to increase RevPAR by 40% within 24 months through repositioning and enhanced programming.

The acquisition includes 15 acres of adjacent developable land for future expansion. Target exit in 5-7 years with projected returns of 20-25% IRR.`,
    companyName: 'Stellar Hospitality Group',
    'Deal Size': '350000000.00',
    'Minimum Investment': '5000000.00',
    'Expected Closing': '2026-05-01',
    Stage: [STAGES.LATE_STAGE],
    'Deal Source Member': [MEMBERS.INDRA_NOOYI],
    'Source Name': 'Ahmed Al-Rashid',
    'Source Email': 'arashid@stellarhospitality.example.com',
  },
  {
    Name: 'Alpine European Logistics Fund',
    'Deal Summary': `Alpine Infrastructure Fund is raising $400M for a pan-European logistics real estate fund targeting last-mile distribution centers in major metropolitan areas. The fund has identified a pipeline of 12 properties across Germany, France, and the UK.

E-commerce growth continues to drive unprecedented demand for logistics space, with vacancy rates below 3% in target markets. The fund strategy focuses on value-add acquisitions with lease-up potential.

Target fund size of $400M with 60% leverage, projecting net returns of 14-18% IRR over a 7-year fund life.`,
    companyName: 'Alpine Infrastructure Fund',
    'Deal Size': '400000000.00',
    'Minimum Investment': '10000000.00',
    'Expected Closing': '2026-06-30',
    Stage: [STAGES.FUNDS],
    'Deal Source Member': [MEMBERS.LARRY_FINK, MEMBERS.ABIGAIL_JOHNSON],
    'Source Name': 'Heinrich Mueller',
    'Source Email': 'hmueller@alpineinfra.example.com',
  },
  {
    Name: 'Quantum Digital Banking Platform',
    'Deal Summary': `Quantum Fintech Solutions is raising $80M to scale its digital banking infrastructure platform across Southeast Asia. The platform enables traditional banks to launch digital-first products in weeks rather than years.

Currently serving 15 banks across Singapore, Indonesia, and Thailand, processing over $2B in monthly transactions. The platform has achieved SOC 2 Type II certification and partnerships with major payment networks.

Funds will accelerate expansion into Vietnam, Philippines, and India while enhancing the platform's AI-powered fraud detection capabilities.`,
    companyName: 'Quantum Fintech Solutions',
    'Deal Size': '80000000.00',
    'Minimum Investment': '2000000.00',
    'Expected Closing': '2026-04-30',
    Stage: [STAGES.ABC_ROUNDS],
    'Deal Source Member': [MEMBERS.JAMIE_DIMON, MEMBERS.BRIAN_MOYNIHAN],
    'Source Name': 'Wei Lin Tan',
    'Source Email': 'wtan@quantumfintech.example.com',
  },
  {
    Name: 'Evergreen Vertical Farming Expansion',
    'Deal Summary': `Evergreen Agriculture Tech is raising $60M to expand its network of AI-optimized vertical farms across Latin America. The company's proprietary growing systems achieve 95% water savings and 300% higher yields compared to traditional farming.

Current operations in Brazil and Mexico supply major grocery chains with premium produce year-round. The expansion will add facilities in Colombia, Chile, and Peru, tripling production capacity.

Strong ESG credentials with carbon-negative operations. Revenue growing 120% annually with clear path to profitability by 2027.`,
    companyName: 'Evergreen Agriculture Tech',
    'Deal Size': '60000000.00',
    'Minimum Investment': '1000000.00',
    'Expected Closing': '2026-03-01',
    Stage: [STAGES.GROWTH],
    'Deal Source Member': [MEMBERS.MARC_BENIOFF, MEMBERS.TIM_COOK],
    'Source Name': 'Carlos Mendez',
    'Source Email': 'cmendez@evergreenagtech.example.com',
  },
];

// =============================================================================
// EVENTS DATA
// =============================================================================

interface EventData {
  Topic: string;
  Agenda: string;
  'Start Date': string;
  'End Date': string;
  City: string;
  Country: string;
  Capacity: string;
  coverPhotoUrl: string;
  Geography: number[];
  'Members Suggested': number[];
}

const events: EventData[] = [
  {
    Topic: 'Monaco Wealth Summit 2026',
    Agenda: `Day 1 - March 15
• 6:00 PM - Welcome Reception at Yacht Club de Monaco
• 8:00 PM - Private Dinner with Keynote: "Global Markets Outlook 2026-2030"

Day 2 - March 16
• 9:00 AM - Breakfast Roundtable: AI & The Future of Asset Management
• 11:00 AM - Panel: Real Estate Opportunities in a Rising Rate Environment
• 1:00 PM - Lunch at Hotel de Paris
• 3:00 PM - Workshop: Family Office Governance & Succession Planning
• 7:00 PM - Gala Dinner at Prince's Palace (by invitation)

Day 3 - March 17
• 9:00 AM - Closing Session: Member Deal Presentations
• 12:00 PM - Farewell Brunch`,
    'Start Date': '2026-03-15',
    'End Date': '2026-03-17',
    City: 'Monaco',
    Country: 'Monaco',
    Capacity: '50',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=800&h=450&fit=crop',
    Geography: [GEOGRAPHIES.EUROPE],
    'Members Suggested': [MEMBERS.LARRY_FINK, MEMBERS.KEN_GRIFFIN, MEMBERS.JAMIE_DIMON, MEMBERS.ABIGAIL_JOHNSON],
  },
  {
    Topic: 'Aspen Winter Retreat',
    Agenda: `Day 1 - February 20
• 4:00 PM - Arrival & Check-in at The Little Nell
• 6:00 PM - Welcome Cocktails
• 7:30 PM - Intimate Dinner: "Investing in Climate Solutions"

Day 2 - February 21
• 8:00 AM - Optional: Guided Ski Experience
• 12:00 PM - Mountain-top Lunch
• 3:00 PM - Fireside Chat: "The Changing Landscape of Private Equity"
• 6:00 PM - Free Time & Spa
• 8:00 PM - Wine Dinner featuring Rare Burgundies

Day 3 - February 22
• 9:00 AM - Breakfast Discussion: Member Collaboration Opportunities
• 11:00 AM - Departures`,
    'Start Date': '2026-02-20',
    'End Date': '2026-02-22',
    City: 'Aspen',
    Country: 'United States',
    Capacity: '30',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&h=450&fit=crop',
    Geography: [GEOGRAPHIES.NORTH_AMERICA],
    'Members Suggested': [MEMBERS.WARREN_BUFFETT, MEMBERS.MARY_BARRA, MEMBERS.MARC_BENIOFF, MEMBERS.TIM_COOK],
  },
  {
    Topic: 'NYC Private Dinner: AI & Future of Finance',
    Agenda: `Evening of January 25

• 6:30 PM - Cocktail Reception at The Core Club
• 7:30 PM - Seated Dinner Begins
• 8:00 PM - Keynote: "How AI is Reshaping Investment Management"
  Guest Speaker: Leading AI Researcher from Stanford HAI
• 8:45 PM - Panel Discussion with Member Perspectives
  Featuring insights from tech and finance leaders
• 9:30 PM - Dessert & Open Networking
• 10:30 PM - Event Concludes

Dress Code: Business Attire
Limited to 40 guests for intimate discussion`,
    'Start Date': '2026-01-25',
    'End Date': '2026-01-25',
    City: 'New York',
    Country: 'United States',
    Capacity: '40',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&h=450&fit=crop',
    Geography: [GEOGRAPHIES.NORTH_AMERICA],
    'Members Suggested': [MEMBERS.SATYA_NADELLA, MEMBERS.JENSEN_HUANG, MEMBERS.SUNDAR_PICHAI, MEMBERS.JAMIE_DIMON, MEMBERS.KEN_GRIFFIN],
  },
  {
    Topic: 'London Financial Leaders Roundtable',
    Agenda: `April 10, 2026

• 8:30 AM - Arrival & Networking Breakfast at The Ned
• 9:30 AM - Opening Remarks
• 10:00 AM - Session 1: "European Markets Post-Election Landscape"
• 11:15 AM - Coffee Break
• 11:45 AM - Session 2: "Private Credit Opportunities in the UK"
• 1:00 PM - Networking Lunch
• 2:30 PM - Session 3: "ESG Investing - Regulatory Updates & Best Practices"
• 4:00 PM - Closing Discussion: Cross-Atlantic Deal Flow
• 5:00 PM - Event Concludes
• 6:30 PM - Optional: Private Tour of Tate Modern (limited spots)`,
    'Start Date': '2026-04-10',
    'End Date': '2026-04-10',
    City: 'London',
    Country: 'United Kingdom',
    Capacity: '35',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=450&fit=crop',
    Geography: [GEOGRAPHIES.EUROPE],
    'Members Suggested': [MEMBERS.LARRY_FINK, MEMBERS.ABIGAIL_JOHNSON, MEMBERS.BRIAN_MOYNIHAN, MEMBERS.GINNI_ROMETTY],
  },
  {
    Topic: 'Singapore Asia Investment Forum',
    Agenda: `Day 1 - May 8
• 9:00 AM - Registration & Breakfast at Marina Bay Sands
• 10:00 AM - Opening Keynote: "Asia's Investment Decade"
• 11:30 AM - Panel: Southeast Asian Tech Ecosystem
• 1:00 PM - Networking Lunch
• 2:30 PM - Breakout Sessions:
  - Track A: Real Estate & Infrastructure
  - Track B: Venture & Growth Equity
• 5:00 PM - Break
• 7:00 PM - Dinner Cruise on Singapore River

Day 2 - May 9
• 9:00 AM - Breakfast Roundtable: China Market Access
• 11:00 AM - Panel: Family Office Structures in Asia
• 12:30 PM - Closing Lunch & Departure`,
    'Start Date': '2026-05-08',
    'End Date': '2026-05-09',
    City: 'Singapore',
    Country: 'Singapore',
    Capacity: '60',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=450&fit=crop',
    Geography: [GEOGRAPHIES.APAC],
    'Members Suggested': [MEMBERS.SUNDAR_PICHAI, MEMBERS.TIM_COOK, MEMBERS.INDRA_NOOYI, MEMBERS.JENSEN_HUANG],
  },
  {
    Topic: 'Napa Valley Vineyard Experience',
    Agenda: `Day 1 - June 12
• 2:00 PM - Arrival at Meadowood Napa Valley
• 4:00 PM - Welcome Reception & Wine Tasting
• 5:30 PM - Presentation: "Wine as an Alternative Asset Class"
• 7:30 PM - Farm-to-Table Dinner with Winemaker Pairings

Day 2 - June 13
• 8:00 AM - Yoga & Wellness (optional)
• 9:30 AM - Breakfast
• 10:30 AM - Private Vineyard Tour & Barrel Tasting
  Visit to exclusive cult wine producers
• 1:00 PM - Lunch at PRESS Restaurant
• 3:00 PM - Member Discussion: "Building Lasting Wealth Across Generations"
• 5:00 PM - Farewell Reception
• 6:30 PM - Departures

Includes: Curated wine collection gift for each attendee`,
    'Start Date': '2026-06-12',
    'End Date': '2026-06-13',
    City: 'Napa',
    Country: 'United States',
    Capacity: '25',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&h=450&fit=crop',
    Geography: [GEOGRAPHIES.NORTH_AMERICA],
    'Members Suggested': [MEMBERS.WARREN_BUFFETT, MEMBERS.MARC_BENIOFF, MEMBERS.INDRA_NOOYI, MEMBERS.MARY_BARRA],
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

async function createRow(tableId: number, data: Record<string, unknown>): Promise<number | null> {
  const url = `${BASEROW_API_URL}/api/database/rows/table/${tableId}/?user_field_names=true`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${BASEROW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`  Failed to create row: ${error}`);
      return null;
    }

    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error(`  Error creating row: ${error}`);
    return null;
  }
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function createPortfolioCompanies(): Promise<Record<string, number>> {
  console.log('\n📦 Creating Portfolio Companies...\n');
  const companyIds: Record<string, number> = {};

  for (const company of portfolioCompanies) {
    const id = await createRow(TABLES.PORTFOLIO_COMPANIES, company);
    if (id) {
      companyIds[company.Name] = id;
      console.log(`  ✓ Created: ${company.Name} (ID: ${id})`);
    } else {
      console.log(`  ✗ Failed: ${company.Name}`);
    }
  }

  return companyIds;
}

async function createDeals(companyIds: Record<string, number>): Promise<void> {
  console.log('\n💰 Creating Deals...\n');

  for (const deal of deals) {
    const companyId = companyIds[deal.companyName];
    if (!companyId) {
      console.log(`  ✗ Skipped ${deal.Name}: Company "${deal.companyName}" not found`);
      continue;
    }

    const dealData = {
      Name: deal.Name,
      'Deal Summary': deal['Deal Summary'],
      Company: [companyId],
      'Deal Size': deal['Deal Size'],
      'Minimum Investment': deal['Minimum Investment'],
      'Expected Closing': deal['Expected Closing'],
      Stage: deal.Stage,
      'Deal Source Member': deal['Deal Source Member'],
      'Source Name': deal['Source Name'],
      'Source Email': deal['Source Email'],
    };

    const id = await createRow(TABLES.DEALS, dealData);
    if (id) {
      console.log(`  ✓ Created: ${deal.Name} (ID: ${id})`);
    } else {
      console.log(`  ✗ Failed: ${deal.Name}`);
    }
  }
}

async function createEvents(): Promise<void> {
  console.log('\n🎉 Creating Events...\n');

  for (const event of events) {
    // Upload cover photo first
    console.log(`  📷 Uploading cover photo for ${event.Topic}...`);
    const uploadedFile = await uploadFileViaUrl(event.coverPhotoUrl);

    const eventData: Record<string, unknown> = {
      Topic: event.Topic,
      Agenda: event.Agenda,
      'Start Date': event['Start Date'],
      'End Date': event['End Date'],
      City: event.City,
      Country: event.Country,
      Capacity: event.Capacity,
      Geography: event.Geography,
      'Members Suggested': event['Members Suggested'],
    };

    if (uploadedFile) {
      eventData['Cover Photo'] = [uploadedFile];
    }

    const id = await createRow(TABLES.EVENTS, eventData);
    if (id) {
      console.log(`  ✓ Created: ${event.Topic} (ID: ${id})`);
    } else {
      console.log(`  ✗ Failed: ${event.Topic}`);
    }
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('  SEEDING EVENTS, DEALS, AND PORTFOLIO COMPANIES');
  console.log('='.repeat(60));

  // Step 1: Create Portfolio Companies (needed for Deal links)
  const companyIds = await createPortfolioCompanies();
  console.log(`\n  Created ${Object.keys(companyIds).length} portfolio companies`);

  // Step 2: Create Deals (with Company links)
  await createDeals(companyIds);

  // Step 3: Create Events (with cover photos)
  await createEvents();

  console.log('\n' + '='.repeat(60));
  console.log('  SEEDING COMPLETE');
  console.log('='.repeat(60));
  console.log('\nSummary:');
  console.log(`  • Portfolio Companies: ${portfolioCompanies.length}`);
  console.log(`  • Deals: ${deals.length}`);
  console.log(`  • Events: ${events.length}`);
  console.log('\nVerify in Baserow that all records were created correctly.');
}

main().catch(console.error);
