/**
 * Seed script to create 15 notional members in Baserow
 * Run with: npx tsx scripts/seed-members.ts
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

interface MemberData {
  Name: string;
  Email: string;
  'Phone #': string;
  Title: string;
  Bio: string;
  'Member Status': number;
  'Onboarding Status': number;
  'Consented to Roster': boolean;
  AUM: number;
  'Average Check Size': number;
  'Association to Capital': number;
  'Capital Discretion': number;
  'Funding Types': number[];
  'Liquidity / Exit Horizon Preference': number;
  'Accredited Investor': number;
}

// Option IDs from config
const OPTIONS = {
  MEMBER_STATUS: { ACTIVE: 3105 },
  ONBOARDING_STATUS: { ONBOARDED: 1974 },
  AUM: {
    ZERO_TO_30M: 3063,
    THIRTY_TO_100M: 3064,
    HUNDRED_TO_250M: 3065,
    TWO_FIFTY_TO_1B: 3066,
    OVER_1B: 3067,
    NA: 3068,
  },
  CHECK_SIZE: {
    ZERO_TO_500K: 3073,
    FIVE_HUNDRED_TO_2M: 3074,
    TWO_TO_5M: 3075,
    FIVE_TO_10M: 3076,
    OVER_10M: 3077,
  },
  ASSOCIATION: {
    OWN_CAPITAL_SELF: 3058,
    OWN_CAPITAL_TEAM: 3059,
    FAMILY_OFFICE: 3060,
    INVESTMENT_FIRM: 3061,
    OTHER: 3062,
  },
  DISCRETION: {
    FULL_DISCRETION: 3069,
    INVESTMENT_COMMITTEE: 3070,
    NO_DISCRETION: 3071,
    OTHER: 3072,
  },
  FUNDING_TYPES: {
    EQUITY: 3089,
    DEBT: 3090,
    CONVERTIBLE: 3091,
    ACQUISITION: 3092,
    BUYOUT: 3093,
    MA: 3094,
    OPPORTUNITY_SPECIFIC: 3088,
  },
  LIQUIDITY: {
    ILLIQUID: 3084,
    SEMI_LIQUID: 3085,
    VERY_LIQUID: 3086,
    PUBLIC_ONLY: 3087,
    OPPORTUNITY_SPECIFIC: 3083,
  },
  ACCREDITED: {
    YES: 3095,
    NO: 3096,
  },
};

const members: MemberData[] = [
  {
    Name: 'Warren Buffett',
    Email: 'warren@collaborationcircle.com',
    'Phone #': '+1 (402) 555-0101',
    Title: 'Chairman & CEO, Berkshire Hathaway',
    Bio: "Warren Buffett is one of the most successful investors of all time, known as the 'Oracle of Omaha.' He has built Berkshire Hathaway into a diversified conglomerate with a market cap exceeding $700 billion through disciplined value investing.",
    'Member Status': OPTIONS.MEMBER_STATUS.ACTIVE,
    'Onboarding Status': OPTIONS.ONBOARDING_STATUS.ONBOARDED,
    'Consented to Roster': true,
    AUM: OPTIONS.AUM.OVER_1B,
    'Average Check Size': OPTIONS.CHECK_SIZE.OVER_10M,
    'Association to Capital': OPTIONS.ASSOCIATION.OWN_CAPITAL_TEAM,
    'Capital Discretion': OPTIONS.DISCRETION.FULL_DISCRETION,
    'Funding Types': [OPTIONS.FUNDING_TYPES.EQUITY, OPTIONS.FUNDING_TYPES.ACQUISITION],
    'Liquidity / Exit Horizon Preference': OPTIONS.LIQUIDITY.ILLIQUID,
    'Accredited Investor': OPTIONS.ACCREDITED.YES,
  },
  {
    Name: 'Jamie Dimon',
    Email: 'jamie@collaborationcircle.com',
    'Phone #': '+1 (212) 555-0102',
    Title: 'Chairman & CEO, JPMorgan Chase',
    Bio: 'Jamie Dimon has led JPMorgan Chase since 2005, steering it through the financial crisis and building it into the largest U.S. bank by assets. He is widely regarded as one of the most influential bankers in the world.',
    'Member Status': OPTIONS.MEMBER_STATUS.ACTIVE,
    'Onboarding Status': OPTIONS.ONBOARDING_STATUS.ONBOARDED,
    'Consented to Roster': true,
    AUM: OPTIONS.AUM.OVER_1B,
    'Average Check Size': OPTIONS.CHECK_SIZE.OVER_10M,
    'Association to Capital': OPTIONS.ASSOCIATION.INVESTMENT_FIRM,
    'Capital Discretion': OPTIONS.DISCRETION.INVESTMENT_COMMITTEE,
    'Funding Types': [OPTIONS.FUNDING_TYPES.EQUITY, OPTIONS.FUNDING_TYPES.DEBT],
    'Liquidity / Exit Horizon Preference': OPTIONS.LIQUIDITY.SEMI_LIQUID,
    'Accredited Investor': OPTIONS.ACCREDITED.YES,
  },
  {
    Name: 'Mary Barra',
    Email: 'mary@collaborationcircle.com',
    'Phone #': '+1 (313) 555-0103',
    Title: 'Chair & CEO, General Motors',
    Bio: 'Mary Barra became the first female CEO of a major global automaker when she took the helm at GM in 2014. She has transformed GM into a leader in electric vehicles and autonomous driving technology.',
    'Member Status': OPTIONS.MEMBER_STATUS.ACTIVE,
    'Onboarding Status': OPTIONS.ONBOARDING_STATUS.ONBOARDED,
    'Consented to Roster': true,
    AUM: OPTIONS.AUM.TWO_FIFTY_TO_1B,
    'Average Check Size': OPTIONS.CHECK_SIZE.FIVE_TO_10M,
    'Association to Capital': OPTIONS.ASSOCIATION.FAMILY_OFFICE,
    'Capital Discretion': OPTIONS.DISCRETION.FULL_DISCRETION,
    'Funding Types': [OPTIONS.FUNDING_TYPES.EQUITY],
    'Liquidity / Exit Horizon Preference': OPTIONS.LIQUIDITY.ILLIQUID,
    'Accredited Investor': OPTIONS.ACCREDITED.YES,
  },
  {
    Name: 'Satya Nadella',
    Email: 'satya@collaborationcircle.com',
    'Phone #': '+1 (425) 555-0104',
    Title: 'Chairman & CEO, Microsoft',
    Bio: 'Satya Nadella has led Microsoft since 2014, transforming it into a cloud computing powerhouse. Under his leadership, Microsoft has become one of the most valuable companies in the world.',
    'Member Status': OPTIONS.MEMBER_STATUS.ACTIVE,
    'Onboarding Status': OPTIONS.ONBOARDING_STATUS.ONBOARDED,
    'Consented to Roster': true,
    AUM: OPTIONS.AUM.OVER_1B,
    'Average Check Size': OPTIONS.CHECK_SIZE.OVER_10M,
    'Association to Capital': OPTIONS.ASSOCIATION.OWN_CAPITAL_TEAM,
    'Capital Discretion': OPTIONS.DISCRETION.FULL_DISCRETION,
    'Funding Types': [OPTIONS.FUNDING_TYPES.EQUITY, OPTIONS.FUNDING_TYPES.CONVERTIBLE],
    'Liquidity / Exit Horizon Preference': OPTIONS.LIQUIDITY.ILLIQUID,
    'Accredited Investor': OPTIONS.ACCREDITED.YES,
  },
  {
    Name: 'Tim Cook',
    Email: 'tim@collaborationcircle.com',
    'Phone #': '+1 (408) 555-0105',
    Title: 'CEO, Apple',
    Bio: 'Tim Cook succeeded Steve Jobs as Apple CEO in 2011 and has grown the company into the first to reach a $3 trillion market cap. He has expanded Apple into services while maintaining its hardware dominance.',
    'Member Status': OPTIONS.MEMBER_STATUS.ACTIVE,
    'Onboarding Status': OPTIONS.ONBOARDING_STATUS.ONBOARDED,
    'Consented to Roster': true,
    AUM: OPTIONS.AUM.OVER_1B,
    'Average Check Size': OPTIONS.CHECK_SIZE.OVER_10M,
    'Association to Capital': OPTIONS.ASSOCIATION.OWN_CAPITAL_SELF,
    'Capital Discretion': OPTIONS.DISCRETION.FULL_DISCRETION,
    'Funding Types': [OPTIONS.FUNDING_TYPES.EQUITY],
    'Liquidity / Exit Horizon Preference': OPTIONS.LIQUIDITY.SEMI_LIQUID,
    'Accredited Investor': OPTIONS.ACCREDITED.YES,
  },
  {
    Name: 'Sundar Pichai',
    Email: 'sundar@collaborationcircle.com',
    'Phone #': '+1 (650) 555-0106',
    Title: 'CEO, Alphabet/Google',
    Bio: 'Sundar Pichai leads both Google and its parent company Alphabet. He has driven Google\'s AI-first strategy and oversees one of the world\'s most influential technology companies.',
    'Member Status': OPTIONS.MEMBER_STATUS.ACTIVE,
    'Onboarding Status': OPTIONS.ONBOARDING_STATUS.ONBOARDED,
    'Consented to Roster': true,
    AUM: OPTIONS.AUM.OVER_1B,
    'Average Check Size': OPTIONS.CHECK_SIZE.FIVE_TO_10M,
    'Association to Capital': OPTIONS.ASSOCIATION.OWN_CAPITAL_TEAM,
    'Capital Discretion': OPTIONS.DISCRETION.FULL_DISCRETION,
    'Funding Types': [OPTIONS.FUNDING_TYPES.EQUITY, OPTIONS.FUNDING_TYPES.CONVERTIBLE],
    'Liquidity / Exit Horizon Preference': OPTIONS.LIQUIDITY.ILLIQUID,
    'Accredited Investor': OPTIONS.ACCREDITED.YES,
  },
  {
    Name: 'Jensen Huang',
    Email: 'jensen@collaborationcircle.com',
    'Phone #': '+1 (408) 555-0107',
    Title: 'Founder & CEO, NVIDIA',
    Bio: 'Jensen Huang co-founded NVIDIA in 1993 and has built it into the dominant force in AI computing. His vision for GPU computing has made NVIDIA essential to the AI revolution.',
    'Member Status': OPTIONS.MEMBER_STATUS.ACTIVE,
    'Onboarding Status': OPTIONS.ONBOARDING_STATUS.ONBOARDED,
    'Consented to Roster': true,
    AUM: OPTIONS.AUM.OVER_1B,
    'Average Check Size': OPTIONS.CHECK_SIZE.OVER_10M,
    'Association to Capital': OPTIONS.ASSOCIATION.OWN_CAPITAL_SELF,
    'Capital Discretion': OPTIONS.DISCRETION.FULL_DISCRETION,
    'Funding Types': [OPTIONS.FUNDING_TYPES.EQUITY],
    'Liquidity / Exit Horizon Preference': OPTIONS.LIQUIDITY.ILLIQUID,
    'Accredited Investor': OPTIONS.ACCREDITED.YES,
  },
  {
    Name: 'Brian Moynihan',
    Email: 'brian@collaborationcircle.com',
    'Phone #': '+1 (704) 555-0108',
    Title: 'Chairman & CEO, Bank of America',
    Bio: 'Brian Moynihan has led Bank of America since 2010, focusing on responsible growth and digital transformation. He has positioned BofA as a leader in sustainable finance.',
    'Member Status': OPTIONS.MEMBER_STATUS.ACTIVE,
    'Onboarding Status': OPTIONS.ONBOARDING_STATUS.ONBOARDED,
    'Consented to Roster': true,
    AUM: OPTIONS.AUM.TWO_FIFTY_TO_1B,
    'Average Check Size': OPTIONS.CHECK_SIZE.FIVE_TO_10M,
    'Association to Capital': OPTIONS.ASSOCIATION.INVESTMENT_FIRM,
    'Capital Discretion': OPTIONS.DISCRETION.INVESTMENT_COMMITTEE,
    'Funding Types': [OPTIONS.FUNDING_TYPES.EQUITY, OPTIONS.FUNDING_TYPES.DEBT],
    'Liquidity / Exit Horizon Preference': OPTIONS.LIQUIDITY.SEMI_LIQUID,
    'Accredited Investor': OPTIONS.ACCREDITED.YES,
  },
  {
    Name: 'Ginni Rometty',
    Email: 'ginni@collaborationcircle.com',
    'Phone #': '+1 (914) 555-0109',
    Title: 'Former CEO, IBM',
    Bio: 'Ginni Rometty led IBM from 2012 to 2020, pivoting the company toward cloud computing and AI. She was the first woman to lead IBM and is now a prominent voice in technology leadership.',
    'Member Status': OPTIONS.MEMBER_STATUS.ACTIVE,
    'Onboarding Status': OPTIONS.ONBOARDING_STATUS.ONBOARDED,
    'Consented to Roster': true,
    AUM: OPTIONS.AUM.HUNDRED_TO_250M,
    'Average Check Size': OPTIONS.CHECK_SIZE.TWO_TO_5M,
    'Association to Capital': OPTIONS.ASSOCIATION.OWN_CAPITAL_SELF,
    'Capital Discretion': OPTIONS.DISCRETION.FULL_DISCRETION,
    'Funding Types': [OPTIONS.FUNDING_TYPES.EQUITY, OPTIONS.FUNDING_TYPES.CONVERTIBLE],
    'Liquidity / Exit Horizon Preference': OPTIONS.LIQUIDITY.SEMI_LIQUID,
    'Accredited Investor': OPTIONS.ACCREDITED.YES,
  },
  {
    Name: 'Marc Benioff',
    Email: 'marc@collaborationcircle.com',
    'Phone #': '+1 (415) 555-0110',
    Title: 'Chair & CEO, Salesforce',
    Bio: 'Marc Benioff founded Salesforce in 1999 and pioneered the software-as-a-service model. He is known for his stakeholder capitalism philosophy and philanthropic work.',
    'Member Status': OPTIONS.MEMBER_STATUS.ACTIVE,
    'Onboarding Status': OPTIONS.ONBOARDING_STATUS.ONBOARDED,
    'Consented to Roster': true,
    AUM: OPTIONS.AUM.OVER_1B,
    'Average Check Size': OPTIONS.CHECK_SIZE.OVER_10M,
    'Association to Capital': OPTIONS.ASSOCIATION.OWN_CAPITAL_TEAM,
    'Capital Discretion': OPTIONS.DISCRETION.FULL_DISCRETION,
    'Funding Types': [OPTIONS.FUNDING_TYPES.EQUITY, OPTIONS.FUNDING_TYPES.ACQUISITION],
    'Liquidity / Exit Horizon Preference': OPTIONS.LIQUIDITY.ILLIQUID,
    'Accredited Investor': OPTIONS.ACCREDITED.YES,
  },
  {
    Name: 'Indra Nooyi',
    Email: 'indra@collaborationcircle.com',
    'Phone #': '+1 (914) 555-0111',
    Title: 'Former CEO, PepsiCo',
    Bio: 'Indra Nooyi led PepsiCo from 2006 to 2018, transforming its portfolio toward healthier products. She is consistently ranked among the most powerful women in business.',
    'Member Status': OPTIONS.MEMBER_STATUS.ACTIVE,
    'Onboarding Status': OPTIONS.ONBOARDING_STATUS.ONBOARDED,
    'Consented to Roster': true,
    AUM: OPTIONS.AUM.HUNDRED_TO_250M,
    'Average Check Size': OPTIONS.CHECK_SIZE.TWO_TO_5M,
    'Association to Capital': OPTIONS.ASSOCIATION.FAMILY_OFFICE,
    'Capital Discretion': OPTIONS.DISCRETION.FULL_DISCRETION,
    'Funding Types': [OPTIONS.FUNDING_TYPES.EQUITY],
    'Liquidity / Exit Horizon Preference': OPTIONS.LIQUIDITY.SEMI_LIQUID,
    'Accredited Investor': OPTIONS.ACCREDITED.YES,
  },
  {
    Name: 'Larry Fink',
    Email: 'larry@collaborationcircle.com',
    'Phone #': '+1 (212) 555-0112',
    Title: 'Chairman & CEO, BlackRock',
    Bio: 'Larry Fink co-founded BlackRock in 1988 and built it into the world\'s largest asset manager with over $10 trillion in assets. He is a leading voice on ESG investing and stakeholder capitalism.',
    'Member Status': OPTIONS.MEMBER_STATUS.ACTIVE,
    'Onboarding Status': OPTIONS.ONBOARDING_STATUS.ONBOARDED,
    'Consented to Roster': true,
    AUM: OPTIONS.AUM.OVER_1B,
    'Average Check Size': OPTIONS.CHECK_SIZE.OVER_10M,
    'Association to Capital': OPTIONS.ASSOCIATION.INVESTMENT_FIRM,
    'Capital Discretion': OPTIONS.DISCRETION.INVESTMENT_COMMITTEE,
    'Funding Types': [OPTIONS.FUNDING_TYPES.EQUITY, OPTIONS.FUNDING_TYPES.DEBT, OPTIONS.FUNDING_TYPES.MA],
    'Liquidity / Exit Horizon Preference': OPTIONS.LIQUIDITY.OPPORTUNITY_SPECIFIC,
    'Accredited Investor': OPTIONS.ACCREDITED.YES,
  },
  {
    Name: 'Abigail Johnson',
    Email: 'abigail@collaborationcircle.com',
    'Phone #': '+1 (617) 555-0113',
    Title: 'CEO, Fidelity Investments',
    Bio: 'Abigail Johnson leads Fidelity Investments, one of the largest asset managers globally. She has modernized the firm\'s technology and expanded into cryptocurrency services.',
    'Member Status': OPTIONS.MEMBER_STATUS.ACTIVE,
    'Onboarding Status': OPTIONS.ONBOARDING_STATUS.ONBOARDED,
    'Consented to Roster': true,
    AUM: OPTIONS.AUM.OVER_1B,
    'Average Check Size': OPTIONS.CHECK_SIZE.OVER_10M,
    'Association to Capital': OPTIONS.ASSOCIATION.FAMILY_OFFICE,
    'Capital Discretion': OPTIONS.DISCRETION.FULL_DISCRETION,
    'Funding Types': [OPTIONS.FUNDING_TYPES.EQUITY, OPTIONS.FUNDING_TYPES.CONVERTIBLE],
    'Liquidity / Exit Horizon Preference': OPTIONS.LIQUIDITY.SEMI_LIQUID,
    'Accredited Investor': OPTIONS.ACCREDITED.YES,
  },
  {
    Name: 'Ken Griffin',
    Email: 'ken@collaborationcircle.com',
    'Phone #': '+1 (312) 555-0114',
    Title: 'Founder & CEO, Citadel',
    Bio: 'Ken Griffin founded Citadel in 1990 and built it into one of the most successful hedge funds in history. He is also known for his significant art collection and philanthropic activities.',
    'Member Status': OPTIONS.MEMBER_STATUS.ACTIVE,
    'Onboarding Status': OPTIONS.ONBOARDING_STATUS.ONBOARDED,
    'Consented to Roster': true,
    AUM: OPTIONS.AUM.OVER_1B,
    'Average Check Size': OPTIONS.CHECK_SIZE.OVER_10M,
    'Association to Capital': OPTIONS.ASSOCIATION.INVESTMENT_FIRM,
    'Capital Discretion': OPTIONS.DISCRETION.FULL_DISCRETION,
    'Funding Types': [OPTIONS.FUNDING_TYPES.EQUITY, OPTIONS.FUNDING_TYPES.DEBT],
    'Liquidity / Exit Horizon Preference': OPTIONS.LIQUIDITY.VERY_LIQUID,
    'Accredited Investor': OPTIONS.ACCREDITED.YES,
  },
  {
    Name: 'Ray Dalio',
    Email: 'ray@collaborationcircle.com',
    'Phone #': '+1 (203) 555-0115',
    Title: 'Founder, Bridgewater Associates',
    Bio: 'Ray Dalio founded Bridgewater Associates, the world\'s largest hedge fund. He is known for his "Principles" philosophy and his economic research on debt cycles and global markets.',
    'Member Status': OPTIONS.MEMBER_STATUS.ACTIVE,
    'Onboarding Status': OPTIONS.ONBOARDING_STATUS.ONBOARDED,
    'Consented to Roster': false, // Opted out of roster
    AUM: OPTIONS.AUM.OVER_1B,
    'Average Check Size': OPTIONS.CHECK_SIZE.OVER_10M,
    'Association to Capital': OPTIONS.ASSOCIATION.INVESTMENT_FIRM,
    'Capital Discretion': OPTIONS.DISCRETION.FULL_DISCRETION,
    'Funding Types': [OPTIONS.FUNDING_TYPES.EQUITY, OPTIONS.FUNDING_TYPES.DEBT],
    'Liquidity / Exit Horizon Preference': OPTIONS.LIQUIDITY.ILLIQUID,
    'Accredited Investor': OPTIONS.ACCREDITED.YES,
  },
];

async function createMember(member: MemberData): Promise<void> {
  const url = `${BASEROW_API_URL}/api/database/rows/table/${MEMBERS_TABLE_ID}/?user_field_names=true`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${BASEROW_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(member),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create ${member.Name}: ${error}`);
  }

  const result = await response.json();
  console.log(`✓ Created: ${member.Name} (ID: ${result.id})`);
}

async function main() {
  console.log('Creating 15 notional members in Baserow...\n');

  for (const member of members) {
    try {
      await createMember(member);
    } catch (error) {
      console.error(`✗ Error: ${error}`);
    }
  }

  console.log('\nDone!');
  console.log('- 14 members should appear on the roster');
  console.log('- Ray Dalio opted out and should NOT appear');
}

main().catch(console.error);
