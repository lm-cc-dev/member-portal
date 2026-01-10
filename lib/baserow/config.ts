/**
 * Baserow Configuration
 *
 * This file contains all Baserow-related configuration including API settings
 * and field ID mappings for the Members table.
 *
 * IMPORTANT: We use field IDs (not field names) to reference Baserow fields
 * because field names can change, but IDs remain stable.
 */

// API Configuration
export const BASEROW_API_URL = process.env.BASEROW_API_URL || 'https://api.baserow.io';
export const BASEROW_API_KEY = process.env.BASEROW_API_KEY;

if (!BASEROW_API_KEY) {
  console.warn('⚠️  BASEROW_API_KEY not set - Baserow features will not work');
}

// Table IDs
export const TABLES = {
  MEMBERS: 347,
  DEALS: 756,
  PORTFOLIO_COMPANIES: 757,
  CENTERS_OF_EXCELLENCE: 746,
  STAGES: 748,
  GEOGRAPHIES: 751,
  PERSONAL_HOBBIES: 753,
  NON_PROFIT_INTERESTS: 755,
  EVENTS: 769,
  EVENT_REGISTRATIONS: 770,
  DEAL_PROCESS: 772,
  INTROS: 774,
  MEMBER_CONNECTIONS: 775,
} as const;

/**
 * Intro Status Option IDs
 * These are the option IDs for the "Status" single-select field in Intros table
 */
export const INTRO_STATUS_OPTIONS = {
  REQUESTED: 3114,
  SCHEDULED: 3115,
  COMPLETED: 3116,
  DECLINED: 3117,
} as const;

/**
 * Members Table Field IDs
 *
 * These IDs are fetched from the Baserow API and should be updated
 * if the table structure changes.
 *
 * To update these IDs, run: npm run baserow:get-fields
 */
export const MEMBERS_FIELDS = {
  // Core Identity Fields
  ID: 'id', // Row ID (always 'id')
  MEMBER_ID: 'field_3390', // Member ID (e.g., M-0001) - Formula field, read-only
  NAME: 'field_7200', // Member Name
  EMAIL: 'field_3602', // Email Address
  PHONE: 'field_7245', // Phone Number
  BIRTHDAY: 'field_7231', // Birthday
  TITLE: 'field_7286', // Title
  BIO: 'field_7287', // Bio
  HEADSHOT: 'field_7288', // Headshot image file

  // Portal Integration
  PORTAL_ID: 'field_7285', // Link to Postgres user.id

  // Status & Onboarding
  MEMBER_STATUS: 'field_7246', // Active/Inactive status
  ONBOARDING_STATUS: 'field_4410', // New/Interview Scheduled/Onboarded/Rejected

  // Capital Information
  SOURCE_OF_WEALTH: 'field_7193',
  ASSOCIATION_TO_CAPITAL: 'field_7194',
  ASSOCIATION_TO_CAPITAL_DETAILS: 'field_7198',
  AUM: 'field_7195',
  CAPITAL_DISCRETION: 'field_7196',
  CAPITAL_DISCRETION_DETAILS: 'field_7199',
  CAPITAL_VEHICLE: 'field_7192',
  AVERAGE_CHECK_SIZE: 'field_7217',
  CAPITAL_LIMITATIONS_OPPORTUNITIES: 'field_7218',

  // Investment Preferences
  SECTOR_PREFERENCE: 'field_7205',
  STAGE_PREFERENCE: 'field_7208',
  GEOGRAPHIES: 'field_7216',
  LIQUIDITY_EXIT_HORIZON: 'field_7219',
  FUNDING_TYPES: 'field_7220',

  // Accreditation
  ACCREDITED_INVESTOR: 'field_7221',
  REASON_NOT_ACCREDITED: 'field_7222',

  // Agreements
  AGREED_NOT_DISCLOSE: 'field_7223',
  AGREED_NOT_DISCLOSE_DETAILS: 'field_7224',
  AGREED_NOT_CONTACT: 'field_7225',
  AGREED_NOT_CONTACT_DETAILS: 'field_7226',
  AGREED_NOT_CIRCUMVENT: 'field_7227',
  AGREED_NOT_CIRCUMVENT_DETAILS: 'field_7228',
  AGREED_NOT_INVESTMENT_ADVISOR: 'field_7229',
  AGREED_NOT_INVESTMENT_ADVISOR_DETAILS: 'field_7230',

  // Personal Information
  PERSONAL_HOBBIES: 'field_7234',
  OTHER_HOBBIES: 'field_7236',
  NON_PROFIT_INTERESTS: 'field_7240',
  OTHER_NON_PROFIT_INTERESTS: 'field_7241',

  // Contribution & Support
  HOW_CC_CAN_SUPPORT: 'field_7242',
  INTENDED_CONTRIBUTION: 'field_7243',
  AREAS_COMFORTABLE_SPEAKING: 'field_7244',

  // Relationships
  RELATIONSHIP_FLAGS: 'field_7247',
  INTERNAL_TIERS: 'field_7248',
  INTERNAL_TIERS_NOTES: 'field_7249',
  INTRODUCED_BY_MEMBER: 'field_7250',
  OTHER_INTRODUCTION_SOURCE: 'field_7251',

  // Related Records
  DEALS: 'field_7258',

  // Roster
  CONSENTED_TO_ROSTER: 'field_7289',
} as const;

/**
 * Member Status Option IDs
 * These are the option IDs for the "Member Status" single-select field
 */
export const MEMBER_STATUS_OPTIONS = {
  ACTIVE: 3105,
  INACTIVE: 3106,
} as const;

/**
 * Onboarding Status Option IDs
 */
export const ONBOARDING_STATUS_OPTIONS = {
  NEW: 1972,
  INTERVIEW_SCHEDULED: 1973,
  ONBOARDED: 1974,
  REJECTED: 1975,
} as const;

/**
 * AUM (Assets Under Management) Option IDs
 */
export const AUM_OPTIONS = {
  ZERO_TO_30M: 3063,
  THIRTY_TO_100M: 3064,
  HUNDRED_TO_250M: 3065,
  TWO_FIFTY_TO_1B: 3066,
  OVER_1B: 3067,
  NA: 3068,
} as const;

/**
 * Liquidity / Exit Horizon Preference Option IDs
 */
export const LIQUIDITY_OPTIONS = {
  ILLIQUID_5_PLUS: 3084,
  SEMI_LIQUID: 3085,
  VERY_LIQUID: 3086,
  PUBLICLY_TRADED: 3087,
  OPPORTUNITY_SPECIFIC: 3083,
} as const;

/**
 * Funding Types Option IDs (Multiple Select)
 */
export const FUNDING_TYPES_OPTIONS = {
  EQUITY: 3089,
  DEBT: 3090,
  CONVERTIBLE_NOTE_SAFE: 3091,
  ACQUISITION: 3092,
  BUYOUT: 3093,
  MA: 3094,
  OPPORTUNITY_SPECIFIC: 3088,
} as const;

/**
 * Capital Limitations & Opportunities Option IDs (Multiple Select)
 */
export const CAPITAL_LIMITATIONS_OPTIONS = {
  NO_RESTRICTIONS: 3078,
  NO_SPVS: 3079,
  NO_FUNDS: 3080,
  MINORITY_FOUNDERS: 3081,
  IMPACT_ORIENTED: 3082,
} as const;

/**
 * Mapping from MEMBERS_FIELDS keys to Baserow field names
 * Used when fetching data with useFieldNames=true
 */
export const MEMBERS_FIELD_NAMES: Record<string, string> = {
  // Core Identity Fields
  ID: 'id',
  MEMBER_ID: 'Member ID',
  NAME: 'Name',
  EMAIL: 'Email',
  PHONE: 'Phone #',
  BIRTHDAY: 'Birthday',
  TITLE: 'Title',
  BIO: 'Bio',
  HEADSHOT: 'Headshot',

  // Portal Integration
  PORTAL_ID: 'Portal ID',

  // Status & Onboarding
  MEMBER_STATUS: 'Member Status',
  ONBOARDING_STATUS: 'Onboarding Status',

  // Capital Information
  SOURCE_OF_WEALTH: 'Source of Wealth',
  ASSOCIATION_TO_CAPITAL: 'Association to Capital',
  ASSOCIATION_TO_CAPITAL_DETAILS: 'Association to Capital Details',
  AUM: 'AUM',
  CAPITAL_DISCRETION: 'Capital Discretion',
  CAPITAL_DISCRETION_DETAILS: 'Capital Discretion Details',
  CAPITAL_VEHICLE: 'Capital Vehicle',
  AVERAGE_CHECK_SIZE: 'Average Check Size',
  CAPITAL_LIMITATIONS_OPPORTUNITIES: 'Capital Limitations & Opportunities',

  // Investment Preferences
  SECTOR_PREFERENCE: 'Sector Preference',
  STAGE_PREFERENCE: 'Stage Preference',
  GEOGRAPHIES: 'Geographies',
  LIQUIDITY_EXIT_HORIZON: 'Liquidity / Exit Horizon Preference',
  FUNDING_TYPES: 'Funding Types',

  // Accreditation
  ACCREDITED_INVESTOR: 'Accredited Investor',
  REASON_NOT_ACCREDITED: 'Reason Not Accredited',

  // Agreements
  AGREED_NOT_DISCLOSE: 'Agreed Not to Disclose CC Investments',
  AGREED_NOT_DISCLOSE_DETAILS: 'Agreed Not to Disclose CC Investments Details',
  AGREED_NOT_CONTACT: 'Agreed Not to Contact Group Member Without Consent',
  AGREED_NOT_CONTACT_DETAILS: 'Agreed Not to Contact Group Member Without Consent Details',
  AGREED_NOT_CIRCUMVENT: 'Agreed Not to Circumvent CC on Investments',
  AGREED_NOT_CIRCUMVENT_DETAILS: 'Agreed Not to Circumvent CC on Investments Details',
  AGREED_NOT_INVESTMENT_ADVISOR: 'Agreed CC Not Investment Advisor',
  AGREED_NOT_INVESTMENT_ADVISOR_DETAILS: 'Agreed CC Not Investment Advisor Details',

  // Personal Information
  PERSONAL_HOBBIES: 'Personal Hobbies',
  OTHER_HOBBIES: 'Other Hobbies',
  NON_PROFIT_INTERESTS: 'Non-Profit Interests',
  OTHER_NON_PROFIT_INTERESTS: 'Other Non-Profit Interests',

  // Contribution & Support
  HOW_CC_CAN_SUPPORT: 'How CC Can Support Member Goals',
  INTENDED_CONTRIBUTION: 'Intended Member Contribution',
  AREAS_COMFORTABLE_SPEAKING: 'Areas Comfortable Speaking to in Calls',

  // Relationships
  RELATIONSHIP_FLAGS: 'Relationship Flags',
  INTERNAL_TIERS: 'Internal Tiers',
  INTERNAL_TIERS_NOTES: 'Internal Tiers Notes',
  INTRODUCED_BY_MEMBER: 'Introduced By Member',
  OTHER_INTRODUCTION_SOURCE: 'Other Introduction Source',

  // Related Records
  DEALS: 'Deals',

  // Roster
  CONSENTED_TO_ROSTER: 'Consented to Roster',
};
