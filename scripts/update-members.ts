/**
 * Update script to add headshots, fake emails, and linked records to members
 * Run with: npx tsx scripts/update-members.ts
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
const MEMBERS_TABLE_ID = 347;

if (!BASEROW_API_KEY) {
  console.error('BASEROW_API_KEY not set');
  process.exit(1);
}

// Linked Table IDs
const GEOGRAPHIES = {
  NORTH_AMERICA: 2,
  EUROPE: 3,
  APAC: 4,
  LATIN_AMERICA: 5,
  MIDDLE_EAST_AFRICA: 6,
  EMERGING_MARKETS: 7,
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

const HOBBIES = {
  OUTDOORS: 1,
  FOOD_DRINK: 2,
  TRAVEL: 3,
  FITNESS: 4,
  ART: 5,
  SPORTS: 6,
  COOKING: 7,
};

const NON_PROFITS = {
  HEALTHCARE: 2,
  EDUCATION: 3,
  THE_ARTS: 4,
  SOCIAL_SERVICES: 5,
  ANIMALS: 6,
  CHILDREN: 7,
  ENVIRONMENT: 8,
  SOCIAL_ENGAGEMENT: 9,
};

// Option IDs for remaining fields
const OPTIONS = {
  INTERNAL_TIERS: {
    CORE_CIRCLE: 3111,
    TRUSTED_ORBIT: 3112,
    PERIPHERAL_ALLIES: 3113,
  },
  CAPITAL_LIMITATIONS: {
    NO_RESTRICTIONS: 3078,
    NO_SPVS: 3079,
    NO_FUNDS: 3080,
    MINORITY_FOUNDERS: 3081,
    IMPACT_ORIENTED: 3082,
  },
};

interface MemberUpdate {
  id: number;
  name: string;
  avatarUrl: string;
  data: Record<string, unknown>;
}

// Member updates with all data
const memberUpdates: MemberUpdate[] = [
  {
    id: 4,
    name: 'Warren Buffett',
    avatarUrl: 'https://ui-avatars.com/api/?name=Warren+Buffett&size=256&background=1e3a5f&color=fff&bold=true&format=png',
    data: {
      Email: 'wbuffett@berkshirepartners.com',
      'Source of Wealth': 'Berkshire Hathaway investments, insurance, and diversified holdings',
      Birthday: '1930-08-30',
      'Capital Vehicle': 'Berkshire Hathaway Inc.',
      'Intended Member Contribution': 'Value investing expertise, deal sourcing in insurance and consumer sectors',
      'How CC Can Support Member Goals': 'Access to private deal flow in undervalued businesses',
      'Areas Comfortable Speaking to in Calls': 'Value investing principles, long-term capital allocation, insurance industry',
      'Internal Tiers': OPTIONS.INTERNAL_TIERS.CORE_CIRCLE,
      'Capital Limitations & Opportunities': [OPTIONS.CAPITAL_LIMITATIONS.NO_RESTRICTIONS],
      Geographies: [GEOGRAPHIES.NORTH_AMERICA],
      'Stage Preference': [STAGES.LATE_STAGE, STAGES.PUBLIC_MARKET],
      'Sector Preference': [SECTORS.CONSUMER, SECTORS.MANUFACTURING, SECTORS.ENERGY],
      'Personal Hobbies': [HOBBIES.FOOD_DRINK, HOBBIES.SPORTS],
      'Non-Profit Interests': [NON_PROFITS.EDUCATION, NON_PROFITS.CHILDREN],
    },
  },
  {
    id: 5,
    name: 'Jamie Dimon',
    avatarUrl: 'https://ui-avatars.com/api/?name=Jamie+Dimon&size=256&background=2c5282&color=fff&bold=true&format=png',
    data: {
      Email: 'jdimon@jpminvestments.net',
      'Source of Wealth': 'Banking executive compensation, JPMorgan equity',
      Birthday: '1956-03-13',
      'Capital Vehicle': 'Dimon Family Office',
      'Intended Member Contribution': 'Financial services expertise, macroeconomic insights',
      'How CC Can Support Member Goals': 'Co-investment opportunities in fintech and banking',
      'Areas Comfortable Speaking to in Calls': 'Global banking, regulatory environment, economic outlook',
      'Internal Tiers': OPTIONS.INTERNAL_TIERS.CORE_CIRCLE,
      'Capital Limitations & Opportunities': [OPTIONS.CAPITAL_LIMITATIONS.NO_RESTRICTIONS],
      Geographies: [GEOGRAPHIES.NORTH_AMERICA, GEOGRAPHIES.EUROPE],
      'Stage Preference': [STAGES.GROWTH, STAGES.LATE_STAGE],
      'Sector Preference': [SECTORS.TECHNOLOGY, SECTORS.REAL_ESTATE],
      'Personal Hobbies': [HOBBIES.SPORTS, HOBBIES.TRAVEL],
      'Non-Profit Interests': [NON_PROFITS.EDUCATION, NON_PROFITS.SOCIAL_SERVICES],
    },
  },
  {
    id: 6,
    name: 'Mary Barra',
    avatarUrl: 'https://ui-avatars.com/api/?name=Mary+Barra&size=256&background=805ad5&color=fff&bold=true&format=png',
    data: {
      Email: 'mbarra@gmventures.org',
      'Source of Wealth': 'GM executive compensation, automotive investments',
      Birthday: '1961-12-24',
      'Capital Vehicle': 'Barra Family Trust',
      'Intended Member Contribution': 'Automotive and EV industry expertise, manufacturing insights',
      'How CC Can Support Member Goals': 'Access to EV and mobility startups',
      'Areas Comfortable Speaking to in Calls': 'Electric vehicles, autonomous driving, manufacturing transformation',
      'Internal Tiers': OPTIONS.INTERNAL_TIERS.TRUSTED_ORBIT,
      'Capital Limitations & Opportunities': [OPTIONS.CAPITAL_LIMITATIONS.NO_RESTRICTIONS, OPTIONS.CAPITAL_LIMITATIONS.IMPACT_ORIENTED],
      Geographies: [GEOGRAPHIES.NORTH_AMERICA],
      'Stage Preference': [STAGES.GROWTH, STAGES.LATE_STAGE],
      'Sector Preference': [SECTORS.MANUFACTURING, SECTORS.TECHNOLOGY, SECTORS.ENERGY],
      'Personal Hobbies': [HOBBIES.FITNESS, HOBBIES.TRAVEL],
      'Non-Profit Interests': [NON_PROFITS.EDUCATION, NON_PROFITS.ENVIRONMENT],
    },
  },
  {
    id: 7,
    name: 'Satya Nadella',
    avatarUrl: 'https://ui-avatars.com/api/?name=Satya+Nadella&size=256&background=3182ce&color=fff&bold=true&format=png',
    data: {
      Email: 'snadella@msftinvest.com',
      'Source of Wealth': 'Microsoft executive compensation and equity',
      Birthday: '1967-08-19',
      'Capital Vehicle': 'Nadella Family Office',
      'Intended Member Contribution': 'Cloud computing and AI expertise, tech ecosystem insights',
      'How CC Can Support Member Goals': 'Early access to enterprise AI and cloud startups',
      'Areas Comfortable Speaking to in Calls': 'Cloud infrastructure, artificial intelligence, digital transformation',
      'Internal Tiers': OPTIONS.INTERNAL_TIERS.CORE_CIRCLE,
      'Capital Limitations & Opportunities': [OPTIONS.CAPITAL_LIMITATIONS.NO_RESTRICTIONS],
      Geographies: [GEOGRAPHIES.NORTH_AMERICA, GEOGRAPHIES.APAC],
      'Stage Preference': [STAGES.SEED, STAGES.ABC_ROUNDS, STAGES.GROWTH],
      'Sector Preference': [SECTORS.TECHNOLOGY, SECTORS.HEALTHCARE],
      'Personal Hobbies': [HOBBIES.SPORTS, HOBBIES.ART],
      'Non-Profit Interests': [NON_PROFITS.EDUCATION, NON_PROFITS.CHILDREN, NON_PROFITS.HEALTHCARE],
    },
  },
  {
    id: 8,
    name: 'Tim Cook',
    avatarUrl: 'https://ui-avatars.com/api/?name=Tim+Cook&size=256&background=4a5568&color=fff&bold=true&format=png',
    data: {
      Email: 'tcook@applecap.io',
      'Source of Wealth': 'Apple executive compensation and equity',
      Birthday: '1960-11-01',
      'Capital Vehicle': 'Cook Investments LLC',
      'Intended Member Contribution': 'Consumer tech expertise, supply chain insights',
      'How CC Can Support Member Goals': 'Access to consumer hardware and services startups',
      'Areas Comfortable Speaking to in Calls': 'Consumer technology, privacy, supply chain management',
      'Internal Tiers': OPTIONS.INTERNAL_TIERS.TRUSTED_ORBIT,
      'Capital Limitations & Opportunities': [OPTIONS.CAPITAL_LIMITATIONS.NO_RESTRICTIONS, OPTIONS.CAPITAL_LIMITATIONS.IMPACT_ORIENTED],
      Geographies: [GEOGRAPHIES.NORTH_AMERICA, GEOGRAPHIES.APAC],
      'Stage Preference': [STAGES.LATE_STAGE, STAGES.PUBLIC_MARKET],
      'Sector Preference': [SECTORS.TECHNOLOGY, SECTORS.CONSUMER, SECTORS.HEALTHCARE],
      'Personal Hobbies': [HOBBIES.FITNESS, HOBBIES.OUTDOORS],
      'Non-Profit Interests': [NON_PROFITS.EDUCATION, NON_PROFITS.ENVIRONMENT, NON_PROFITS.SOCIAL_ENGAGEMENT],
    },
  },
  {
    id: 9,
    name: 'Sundar Pichai',
    avatarUrl: 'https://ui-avatars.com/api/?name=Sundar+Pichai&size=256&background=38a169&color=fff&bold=true&format=png',
    data: {
      Email: 'spichai@alphabetventures.net',
      'Source of Wealth': 'Google/Alphabet executive compensation and equity',
      Birthday: '1972-06-10',
      'Capital Vehicle': 'Pichai Family Trust',
      'Intended Member Contribution': 'AI and search technology expertise, advertising insights',
      'How CC Can Support Member Goals': 'Deal flow in AI/ML and digital advertising startups',
      'Areas Comfortable Speaking to in Calls': 'AI development, search technology, digital advertising',
      'Internal Tiers': OPTIONS.INTERNAL_TIERS.CORE_CIRCLE,
      'Capital Limitations & Opportunities': [OPTIONS.CAPITAL_LIMITATIONS.NO_RESTRICTIONS],
      Geographies: [GEOGRAPHIES.NORTH_AMERICA, GEOGRAPHIES.APAC, GEOGRAPHIES.EUROPE],
      'Stage Preference': [STAGES.SEED, STAGES.ABC_ROUNDS],
      'Sector Preference': [SECTORS.TECHNOLOGY, SECTORS.ENTERTAINMENT],
      'Personal Hobbies': [HOBBIES.SPORTS, HOBBIES.TRAVEL, HOBBIES.FOOD_DRINK],
      'Non-Profit Interests': [NON_PROFITS.EDUCATION, NON_PROFITS.CHILDREN],
    },
  },
  {
    id: 10,
    name: 'Jensen Huang',
    avatarUrl: 'https://ui-avatars.com/api/?name=Jensen+Huang&size=256&background=276749&color=fff&bold=true&format=png',
    data: {
      Email: 'jhuang@nvdiaholdings.com',
      'Source of Wealth': 'NVIDIA founder equity and executive compensation',
      Birthday: '1963-02-17',
      'Capital Vehicle': 'Huang Family Office',
      'Intended Member Contribution': 'GPU and AI computing expertise, semiconductor insights',
      'How CC Can Support Member Goals': 'Early stage AI and semiconductor investments',
      'Areas Comfortable Speaking to in Calls': 'AI computing, graphics processing, data center infrastructure',
      'Internal Tiers': OPTIONS.INTERNAL_TIERS.CORE_CIRCLE,
      'Capital Limitations & Opportunities': [OPTIONS.CAPITAL_LIMITATIONS.NO_RESTRICTIONS],
      Geographies: [GEOGRAPHIES.NORTH_AMERICA, GEOGRAPHIES.APAC],
      'Stage Preference': [STAGES.SEED, STAGES.ABC_ROUNDS, STAGES.GROWTH],
      'Sector Preference': [SECTORS.TECHNOLOGY, SECTORS.HEALTHCARE, SECTORS.ENTERTAINMENT],
      'Personal Hobbies': [HOBBIES.ART, HOBBIES.FOOD_DRINK],
      'Non-Profit Interests': [NON_PROFITS.EDUCATION, NON_PROFITS.HEALTHCARE],
    },
  },
  {
    id: 11,
    name: 'Brian Moynihan',
    avatarUrl: 'https://ui-avatars.com/api/?name=Brian+Moynihan&size=256&background=2b6cb0&color=fff&bold=true&format=png',
    data: {
      Email: 'bmoynihan@bofawealth.org',
      'Source of Wealth': 'Bank of America executive compensation and equity',
      Birthday: '1959-10-09',
      'Capital Vehicle': 'Moynihan Family Office',
      'Intended Member Contribution': 'Consumer banking expertise, sustainable finance insights',
      'How CC Can Support Member Goals': 'Access to fintech and sustainable finance opportunities',
      'Areas Comfortable Speaking to in Calls': 'Consumer banking, ESG investing, digital banking',
      'Internal Tiers': OPTIONS.INTERNAL_TIERS.TRUSTED_ORBIT,
      'Capital Limitations & Opportunities': [OPTIONS.CAPITAL_LIMITATIONS.NO_RESTRICTIONS, OPTIONS.CAPITAL_LIMITATIONS.IMPACT_ORIENTED],
      Geographies: [GEOGRAPHIES.NORTH_AMERICA, GEOGRAPHIES.EUROPE],
      'Stage Preference': [STAGES.GROWTH, STAGES.LATE_STAGE],
      'Sector Preference': [SECTORS.TECHNOLOGY, SECTORS.REAL_ESTATE],
      'Personal Hobbies': [HOBBIES.SPORTS, HOBBIES.OUTDOORS],
      'Non-Profit Interests': [NON_PROFITS.ENVIRONMENT, NON_PROFITS.SOCIAL_SERVICES],
    },
  },
  {
    id: 12,
    name: 'Ginni Rometty',
    avatarUrl: 'https://ui-avatars.com/api/?name=Ginni+Rometty&size=256&background=9f7aea&color=fff&bold=true&format=png',
    data: {
      Email: 'grometty@techleaders.net',
      'Source of Wealth': 'IBM executive compensation and equity, board positions',
      Birthday: '1957-07-29',
      'Capital Vehicle': 'Rometty Investments LLC',
      'Intended Member Contribution': 'Enterprise technology transformation expertise',
      'How CC Can Support Member Goals': 'Board opportunities and enterprise tech investments',
      'Areas Comfortable Speaking to in Calls': 'Digital transformation, enterprise software, leadership',
      'Internal Tiers': OPTIONS.INTERNAL_TIERS.TRUSTED_ORBIT,
      'Capital Limitations & Opportunities': [OPTIONS.CAPITAL_LIMITATIONS.NO_RESTRICTIONS],
      Geographies: [GEOGRAPHIES.NORTH_AMERICA, GEOGRAPHIES.EUROPE],
      'Stage Preference': [STAGES.GROWTH, STAGES.LATE_STAGE],
      'Sector Preference': [SECTORS.TECHNOLOGY, SECTORS.HEALTHCARE],
      'Personal Hobbies': [HOBBIES.TRAVEL, HOBBIES.ART],
      'Non-Profit Interests': [NON_PROFITS.EDUCATION, NON_PROFITS.SOCIAL_ENGAGEMENT],
    },
  },
  {
    id: 13,
    name: 'Marc Benioff',
    avatarUrl: 'https://ui-avatars.com/api/?name=Marc+Benioff&size=256&background=ed8936&color=fff&bold=true&format=png',
    data: {
      Email: 'mbenioff@sfholdings.io',
      'Source of Wealth': 'Salesforce founder equity and executive compensation',
      Birthday: '1964-09-25',
      'Capital Vehicle': 'Benioff Family Office',
      'Intended Member Contribution': 'SaaS and cloud software expertise, stakeholder capitalism advocacy',
      'How CC Can Support Member Goals': 'Impact-oriented investment opportunities',
      'Areas Comfortable Speaking to in Calls': 'SaaS business models, stakeholder capitalism, philanthropy',
      'Internal Tiers': OPTIONS.INTERNAL_TIERS.CORE_CIRCLE,
      'Capital Limitations & Opportunities': [OPTIONS.CAPITAL_LIMITATIONS.NO_RESTRICTIONS, OPTIONS.CAPITAL_LIMITATIONS.IMPACT_ORIENTED],
      Geographies: [GEOGRAPHIES.NORTH_AMERICA],
      'Stage Preference': [STAGES.SEED, STAGES.ABC_ROUNDS, STAGES.GROWTH],
      'Sector Preference': [SECTORS.TECHNOLOGY, SECTORS.HEALTHCARE],
      'Personal Hobbies': [HOBBIES.TRAVEL, HOBBIES.ART, HOBBIES.FITNESS],
      'Non-Profit Interests': [NON_PROFITS.CHILDREN, NON_PROFITS.ENVIRONMENT, NON_PROFITS.HEALTHCARE],
    },
  },
  {
    id: 14,
    name: 'Indra Nooyi',
    avatarUrl: 'https://ui-avatars.com/api/?name=Indra+Nooyi&size=256&background=d53f8c&color=fff&bold=true&format=png',
    data: {
      Email: 'inooyi@globalconsumer.com',
      'Source of Wealth': 'PepsiCo executive compensation, board positions',
      Birthday: '1955-10-28',
      'Capital Vehicle': 'Nooyi Family Trust',
      'Intended Member Contribution': 'Consumer goods expertise, global business strategy',
      'How CC Can Support Member Goals': 'Board opportunities and consumer brand investments',
      'Areas Comfortable Speaking to in Calls': 'Consumer brands, global strategy, women in leadership',
      'Internal Tiers': OPTIONS.INTERNAL_TIERS.TRUSTED_ORBIT,
      'Capital Limitations & Opportunities': [OPTIONS.CAPITAL_LIMITATIONS.NO_RESTRICTIONS, OPTIONS.CAPITAL_LIMITATIONS.IMPACT_ORIENTED],
      Geographies: [GEOGRAPHIES.NORTH_AMERICA, GEOGRAPHIES.APAC, GEOGRAPHIES.EMERGING_MARKETS],
      'Stage Preference': [STAGES.GROWTH, STAGES.LATE_STAGE],
      'Sector Preference': [SECTORS.CONSUMER, SECTORS.HEALTHCARE],
      'Personal Hobbies': [HOBBIES.COOKING, HOBBIES.ART, HOBBIES.TRAVEL],
      'Non-Profit Interests': [NON_PROFITS.EDUCATION, NON_PROFITS.CHILDREN, NON_PROFITS.HEALTHCARE],
    },
  },
  {
    id: 15,
    name: 'Larry Fink',
    avatarUrl: 'https://ui-avatars.com/api/?name=Larry+Fink&size=256&background=1a365d&color=fff&bold=true&format=png',
    data: {
      Email: 'lfink@blackrockinvest.net',
      'Source of Wealth': 'BlackRock founder equity and executive compensation',
      Birthday: '1952-11-02',
      'Capital Vehicle': 'Fink Family Office',
      'Intended Member Contribution': 'Asset management expertise, ESG investing insights',
      'How CC Can Support Member Goals': 'Co-investment in large-scale alternative assets',
      'Areas Comfortable Speaking to in Calls': 'Asset management, ESG investing, global markets',
      'Internal Tiers': OPTIONS.INTERNAL_TIERS.CORE_CIRCLE,
      'Capital Limitations & Opportunities': [OPTIONS.CAPITAL_LIMITATIONS.NO_RESTRICTIONS, OPTIONS.CAPITAL_LIMITATIONS.IMPACT_ORIENTED],
      Geographies: [GEOGRAPHIES.NORTH_AMERICA, GEOGRAPHIES.EUROPE, GEOGRAPHIES.APAC],
      'Stage Preference': [STAGES.LATE_STAGE, STAGES.PUBLIC_MARKET, STAGES.FUNDS],
      'Sector Preference': [SECTORS.TECHNOLOGY, SECTORS.REAL_ESTATE, SECTORS.ENERGY],
      'Personal Hobbies': [HOBBIES.ART, HOBBIES.TRAVEL],
      'Non-Profit Interests': [NON_PROFITS.ENVIRONMENT, NON_PROFITS.EDUCATION, NON_PROFITS.THE_ARTS],
    },
  },
  {
    id: 16,
    name: 'Abigail Johnson',
    avatarUrl: 'https://ui-avatars.com/api/?name=Abigail+Johnson&size=256&background=744210&color=fff&bold=true&format=png',
    data: {
      Email: 'ajohnson@fidelitycap.org',
      'Source of Wealth': 'Fidelity family ownership and executive compensation',
      Birthday: '1961-12-19',
      'Capital Vehicle': 'Johnson Family Office',
      'Intended Member Contribution': 'Asset management expertise, cryptocurrency insights',
      'How CC Can Support Member Goals': 'Access to fintech and digital asset opportunities',
      'Areas Comfortable Speaking to in Calls': 'Asset management, cryptocurrency, retirement investing',
      'Internal Tiers': OPTIONS.INTERNAL_TIERS.CORE_CIRCLE,
      'Capital Limitations & Opportunities': [OPTIONS.CAPITAL_LIMITATIONS.NO_RESTRICTIONS],
      Geographies: [GEOGRAPHIES.NORTH_AMERICA, GEOGRAPHIES.EUROPE],
      'Stage Preference': [STAGES.GROWTH, STAGES.LATE_STAGE, STAGES.FUNDS],
      'Sector Preference': [SECTORS.TECHNOLOGY, SECTORS.HEALTHCARE],
      'Personal Hobbies': [HOBBIES.FITNESS, HOBBIES.TRAVEL, HOBBIES.OUTDOORS],
      'Non-Profit Interests': [NON_PROFITS.EDUCATION, NON_PROFITS.THE_ARTS],
    },
  },
  {
    id: 17,
    name: 'Ken Griffin',
    avatarUrl: 'https://ui-avatars.com/api/?name=Ken+Griffin&size=256&background=553c9a&color=fff&bold=true&format=png',
    data: {
      Email: 'kgriffin@citadelinvest.com',
      'Source of Wealth': 'Citadel hedge fund founder equity',
      Birthday: '1968-10-15',
      'Capital Vehicle': 'Griffin Family Office',
      'Intended Member Contribution': 'Quantitative trading expertise, market structure insights',
      'How CC Can Support Member Goals': 'Access to trading technology and fintech startups',
      'Areas Comfortable Speaking to in Calls': 'Market structure, quantitative strategies, art collecting',
      'Internal Tiers': OPTIONS.INTERNAL_TIERS.CORE_CIRCLE,
      'Capital Limitations & Opportunities': [OPTIONS.CAPITAL_LIMITATIONS.NO_RESTRICTIONS],
      Geographies: [GEOGRAPHIES.NORTH_AMERICA],
      'Stage Preference': [STAGES.GROWTH, STAGES.LATE_STAGE],
      'Sector Preference': [SECTORS.TECHNOLOGY, SECTORS.REAL_ESTATE],
      'Personal Hobbies': [HOBBIES.ART, HOBBIES.TRAVEL],
      'Non-Profit Interests': [NON_PROFITS.EDUCATION, NON_PROFITS.THE_ARTS, NON_PROFITS.CHILDREN],
    },
  },
  {
    id: 18,
    name: 'Ray Dalio',
    avatarUrl: 'https://ui-avatars.com/api/?name=Ray+Dalio&size=256&background=c53030&color=fff&bold=true&format=png',
    data: {
      Email: 'rdalio@bridgewatermgmt.net',
      'Source of Wealth': 'Bridgewater Associates founder equity',
      Birthday: '1949-08-08',
      'Capital Vehicle': 'Dalio Family Office',
      'Intended Member Contribution': 'Macro investing expertise, principles-based management',
      'How CC Can Support Member Goals': 'Long-term macro investment opportunities',
      'Areas Comfortable Speaking to in Calls': 'Macroeconomics, debt cycles, management principles',
      'Internal Tiers': OPTIONS.INTERNAL_TIERS.TRUSTED_ORBIT,
      'Capital Limitations & Opportunities': [OPTIONS.CAPITAL_LIMITATIONS.NO_RESTRICTIONS],
      Geographies: [GEOGRAPHIES.NORTH_AMERICA, GEOGRAPHIES.APAC, GEOGRAPHIES.EMERGING_MARKETS],
      'Stage Preference': [STAGES.LATE_STAGE, STAGES.FUNDS],
      'Sector Preference': [SECTORS.TECHNOLOGY, SECTORS.REAL_ESTATE, SECTORS.ENERGY],
      'Personal Hobbies': [HOBBIES.OUTDOORS, HOBBIES.TRAVEL, HOBBIES.FITNESS],
      'Non-Profit Interests': [NON_PROFITS.EDUCATION, NON_PROFITS.ENVIRONMENT, NON_PROFITS.SOCIAL_ENGAGEMENT],
    },
  },
];

// Upload file via URL to Baserow
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

async function updateMember(update: MemberUpdate): Promise<void> {
  const url = `${BASEROW_API_URL}/api/database/rows/table/${MEMBERS_TABLE_ID}/${update.id}/?user_field_names=true`;

  // First, upload the avatar
  console.log(`  Uploading avatar for ${update.name}...`);
  const uploadedFile = await uploadFileViaUrl(update.avatarUrl);

  // Prepare the update data
  const updateData: Record<string, unknown> = { ...update.data };
  if (uploadedFile) {
    updateData['Headshot'] = [uploadedFile];
  }

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Token ${BASEROW_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update member ${update.id}: ${error}`);
  }

  const result = await response.json();
  console.log(`✓ Updated: ${result.Name} (ID: ${result.id})`);
}

async function main() {
  console.log('Updating 15 members with headshots, emails, and linked records...\n');

  for (const update of memberUpdates) {
    try {
      await updateMember(update);
    } catch (error) {
      console.error(`✗ Error: ${error}`);
    }
  }

  console.log('\nDone!');
  console.log('All members updated with:');
  console.log('- Professional avatar headshots');
  console.log('- Fake email addresses');
  console.log('- Geographies, Stages, Sectors, Hobbies, and Non-Profits');
  console.log('- Source of Wealth, Capital Vehicle, and other details');
}

main().catch(console.error);
