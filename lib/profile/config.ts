/**
 * Profile Field Configuration
 *
 * Defines all editable fields in the member profile,
 * organized by sections with their validation and display rules.
 */

import { ProfileConfig, SelectOption } from './types';
import { TABLES } from '../baserow/config';

// AUM Options
const aumOptions: SelectOption[] = [
  { id: 3063, label: '0 - 30 million', color: 'blue' },
  { id: 3064, label: '30 - 100 million', color: 'green' },
  { id: 3065, label: '100 - 250 million', color: 'cyan' },
  { id: 3066, label: '250 - 1 billion', color: 'orange' },
  { id: 3067, label: '> 1 billion', color: 'red' },
  { id: 3068, label: 'N/A', color: 'gray' },
];

// Liquidity / Exit Horizon Options
const liquidityOptions: SelectOption[] = [
  { id: 3084, label: 'Illiquid (5+ Years)', color: 'darker-red' },
  { id: 3085, label: 'Semi-Liquid (Quarterly or Annual)', color: 'cyan' },
  { id: 3086, label: 'Very Liquid Only (Weekly or Monthly Liquidity)', color: 'orange' },
  { id: 3087, label: 'Publicly Traded Only', color: 'yellow' },
  { id: 3083, label: 'Opportunity Specific (All)', color: 'darker-green' },
];

// Funding Types Options (Multi-Select)
const fundingTypesOptions: SelectOption[] = [
  { id: 3089, label: 'Equity', color: 'dark-red' },
  { id: 3090, label: 'Debt', color: 'cyan' },
  { id: 3091, label: 'Convertible Note/SAFE', color: 'orange' },
  { id: 3092, label: 'Acquisition', color: 'yellow' },
  { id: 3093, label: 'Buy-out', color: 'red' },
  { id: 3094, label: 'M&A', color: 'purple' },
  { id: 3088, label: 'Opportunity Specific (All)', color: 'darker-green' },
];

// Capital Limitations & Opportunities Options (Multi-Select)
const capitalLimitationsOptions: SelectOption[] = [
  { id: 3078, label: 'No general restrictions', color: 'blue' },
  { id: 3079, label: 'Do not invest in SPVs', color: 'green' },
  { id: 3080, label: 'Do not invest in funds', color: 'cyan' },
  { id: 3081, label: 'Minority founder groups', color: 'orange' },
  { id: 3082, label: 'Impact-oriented', color: 'yellow' },
];

/**
 * Complete profile configuration
 */
export const profileConfig: ProfileConfig = {
  sections: [
    {
      id: 'basic-info',
      title: 'Basic Information',
      description: 'Your core profile information',
      fields: [
        {
          type: 'readonly',
          fieldKey: 'EMAIL',
          label: 'Email',
        },
        {
          type: 'readonly',
          fieldKey: 'NAME',
          label: 'Name',
        },
        {
          type: 'readonly',
          fieldKey: 'PHONE',
          label: 'Phone Number',
        },
        {
          type: 'date',
          fieldKey: 'BIRTHDAY',
          label: 'Birthday',
        },
      ],
    },
    {
      id: 'investment-preferences',
      title: 'Investment Preferences',
      description: 'Your investment focus and preferences',
      fields: [
        {
          type: 'single-select',
          fieldKey: 'AUM',
          label: 'Assets Under Management (AUM)',
          description: 'Total assets under your management',
          options: aumOptions,
        },
        {
          type: 'single-select',
          fieldKey: 'LIQUIDITY_EXIT_HORIZON',
          label: 'Liquidity / Exit Horizon Preference',
          description: 'Your preferred liquidity timeline',
          options: liquidityOptions,
        },
        {
          type: 'multi-select',
          fieldKey: 'FUNDING_TYPES',
          label: 'Funding Types',
          description: 'Types of funding you participate in',
          options: fundingTypesOptions,
        },
        {
          type: 'multi-select',
          fieldKey: 'CAPITAL_LIMITATIONS_OPPORTUNITIES',
          label: 'Capital Limitations & Opportunities',
          description: 'Your investment restrictions and focus areas',
          options: capitalLimitationsOptions,
        },
        {
          type: 'linked-records',
          fieldKey: 'SECTOR_PREFERENCE',
          label: 'Sector Preferences',
          description: 'Industries and sectors you invest in',
          tableId: TABLES.CENTERS_OF_EXCELLENCE,
          displayField: 'Name',
          multiple: true,
        },
        {
          type: 'linked-records',
          fieldKey: 'STAGE_PREFERENCE',
          label: 'Stage Preferences',
          description: 'Investment stages you focus on',
          tableId: TABLES.STAGES,
          displayField: 'Stage Name',
          multiple: true,
        },
        {
          type: 'linked-records',
          fieldKey: 'GEOGRAPHIES',
          label: 'Geographic Preferences',
          description: 'Regions where you invest',
          tableId: TABLES.GEOGRAPHIES,
          displayField: 'Name',
          multiple: true,
        },
      ],
    },
    {
      id: 'personal-interests',
      title: 'Personal Interests',
      description: 'Your hobbies and non-profit interests',
      fields: [
        {
          type: 'linked-records',
          fieldKey: 'PERSONAL_HOBBIES',
          label: 'Personal Hobbies',
          description: 'Your personal interests and hobbies',
          tableId: TABLES.PERSONAL_HOBBIES,
          displayField: 'Name',
          multiple: true,
          otherFieldKey: 'OTHER_HOBBIES',
          otherLabel: 'Other Hobbies',
          hasOther: true,
        },
        {
          type: 'linked-records',
          fieldKey: 'NON_PROFIT_INTERESTS',
          label: 'Non-Profit Interests',
          description: 'Causes and organizations you support',
          tableId: TABLES.NON_PROFIT_INTERESTS,
          displayField: 'Name',
          multiple: true,
          otherFieldKey: 'OTHER_NON_PROFIT_INTERESTS',
          otherLabel: 'Other Non-Profit Interests',
          hasOther: true,
        },
      ],
    },
  ],
};
