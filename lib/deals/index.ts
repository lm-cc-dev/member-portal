/**
 * Deal Detail Data Functions
 *
 * Functions for fetching individual deal data with company info and NDA status
 */

import { getRow, listRows } from '@/lib/baserow/client';
import { TABLES } from '@/lib/baserow/config';
import type {
  BaserowDeal,
  DealProcess,
  PortfolioCompany,
  DealDetail,
} from '@/lib/home/types';

/**
 * Fetch a single deal by its Baserow row ID
 */
export async function getDealById(dealId: number): Promise<BaserowDeal> {
  return getRow<BaserowDeal>(TABLES.DEALS, dealId, true);
}

/**
 * Fetch portfolio company by ID
 */
export async function getPortfolioCompanyById(
  companyId: number
): Promise<PortfolioCompany> {
  return getRow<PortfolioCompany>(TABLES.PORTFOLIO_COMPANIES, companyId, true);
}

/**
 * Check if a member has signed the NDA for a specific deal
 * Returns true if any deal process record exists with Signed CC NDA = true
 */
export async function checkMemberNDAStatus(
  memberId: number,
  dealId: number
): Promise<boolean> {
  try {
    const response = await listRows<DealProcess>(TABLES.DEAL_PROCESS, {
      useFieldNames: true,
      size: 10,
      filters: {
        'filter__Member__link_row_has': memberId,
        'filter__Deal__link_row_has': dealId,
      },
    });

    // Check if any deal process record exists with Signed CC NDA = true
    return response.results.some((dp) => dp['Signed CC NDA'] === true);
  } catch (error) {
    console.error('Error checking NDA status:', error);
    return false;
  }
}

/**
 * Get full deal detail with company info and NDA status
 */
export async function getDealDetail(
  dealId: number,
  memberId: number
): Promise<DealDetail> {
  // Fetch deal data
  const deal = await getDealById(dealId);

  // Fetch company data if linked
  let company: PortfolioCompany | null = null;
  if (deal['Company']?.[0]?.id) {
    try {
      company = await getPortfolioCompanyById(deal['Company'][0].id);
    } catch (error) {
      console.error('Error fetching company:', error);
    }
  }

  // Check NDA status
  const hasSignedNDA = await checkMemberNDAStatus(memberId, dealId);

  return {
    ...deal,
    company,
    hasSignedNDA,
  };
}

/**
 * Format deal type for display
 * Combines category with relevant subtype
 */
export function formatDealType(deal: BaserowDeal): string {
  const category = deal['Deal Type Category']?.value;
  if (!category) return '-';

  // Get the appropriate subtype based on category
  let subtype: string | undefined;
  switch (category) {
    case 'Private Equity':
      subtype = deal['Private Equity Type']?.value;
      break;
    case 'Private Credit':
      subtype = deal['Private Credit Type']?.value;
      break;
    case 'Venture':
      subtype = deal['Venture Type']?.value;
      break;
    case 'Real Estate':
      subtype = deal['Real Estate Type']?.value;
      break;
  }

  if (subtype) {
    return `${category} - ${subtype}`;
  }
  return category;
}
