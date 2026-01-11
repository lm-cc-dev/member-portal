'use client';

/**
 * Deal Detail Content
 *
 * Main content area with public information and NDA-gated sections
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from '@/components/ui/empty';
import {
  DollarSign,
  Globe,
  FileText,
  Users,
  Mail,
  Lock,
  ExternalLink,
  Download,
  TrendingUp,
  Calendar,
  Percent,
  Clock,
  Briefcase,
  Building2,
  Layers,
} from 'lucide-react';
import type { DealDetail, BaserowDeal } from '@/lib/home/types';
import { formatCurrency } from '@/lib/home/deals';
import { formatDealType } from '@/lib/deals';
import { CommentsSection } from '@/components/deals/comments';

interface DealDetailContentProps {
  deal: DealDetail;
  currentMemberId: number;
  isSteerCoMember: boolean;
}

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  const [year, month, day] = dateStr.split('-').map(Number);
  return `${MONTH_NAMES[month - 1]} ${day}, ${year}`;
}

export function DealDetailContent({
  deal,
  currentMemberId,
  isSteerCoMember,
}: DealDetailContentProps) {
  // Safely extract values with defensive checks
  const company = deal?.company;
  const hasSignedNDA = deal?.hasSignedNDA ?? false;

  // Validate resource URLs
  const deckUrl = deal?.['Deck']?.[0]?.url;
  const validDeckUrl = deckUrl && deckUrl.startsWith('http') ? deckUrl : null;
  const factSheetUrl = deal?.['Fact Sheet']?.[0]?.url;
  const validFactSheetUrl = factSheetUrl && factSheetUrl.startsWith('http') ? factSheetUrl : null;

  return (
    <div className="space-y-8">
      {/* Always Visible Section */}
      <section className="space-y-6">
        {/* Deal Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
              Deal Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <InfoRow
              icon={DollarSign}
              label="Deal Size"
              value={formatCurrency(deal?.['Deal Size'] ?? null)}
            />
            <InfoRow
              icon={Building2}
              label="Sector"
              value={deal?.['Sector']?.[0]?.value || '-'}
            />
            <InfoRow
              icon={Globe}
              label="Region"
              value={deal?.['Region']?.[0]?.value || '-'}
            />
            <InfoRow
              icon={Briefcase}
              label="Deal Type"
              value={deal ? formatDealType(deal) : '-'}
            />
            <InfoRow
              icon={Layers}
              label="Stage"
              value={deal?.['Stage']?.[0]?.value || '-'}
            />
            <InfoRow
              icon={Calendar}
              label="Expected Closing"
              value={formatDate(deal?.['Expected Closing'] ?? null)}
            />
          </CardContent>
        </Card>

        {/* Deal Summary */}
        {deal?.['Deal Summary'] && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-primary" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">
                {deal['Deal Summary']}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Resources Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Download className="w-5 h-5 text-primary" />
              Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Deck Download */}
            {validDeckUrl && (
              <ResourceLink
                icon={FileText}
                label="Investor Deck"
                href={validDeckUrl}
              />
            )}

            {/* Data Room Access */}
            {deal?.['Deal Room Link'] && (
              <ResourceLink
                icon={ExternalLink}
                label="Data Room Access"
                href={deal['Deal Room Link']}
              />
            )}

            {/* Company Website */}
            {company?.['Website'] && (
              <ResourceLink
                icon={Globe}
                label="Company Website"
                href={company['Website']}
              />
            )}

            {!validDeckUrl &&
              !deal?.['Deal Room Link'] &&
              !company?.['Website'] && (
                <p className="text-sm text-muted-foreground py-2">
                  No resources available yet
                </p>
              )}
          </CardContent>
        </Card>

        {/* Company Contact */}
        {(deal?.['Company Contact Name'] || deal?.['Company Contact Email']) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-primary" />
                Company Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {deal?.['Company Contact Name'] && (
                <p className="font-medium text-neutral-900">
                  {deal['Company Contact Name']}
                </p>
              )}
              {deal?.['Company Contact Email'] && (
                <Button asChild variant="outline" size="sm">
                  <a href={`mailto:${deal['Company Contact Email']}`}>
                    <Mail className="w-4 h-4 mr-2" />
                    {deal['Company Contact Email']}
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Management Highlights */}
        {company?.['Management Highlights'] && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-primary" />
                Management Highlights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">
                {company['Management Highlights']}
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      <Separator />

      {/* NDA-Gated Section */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          {hasSignedNDA ? (
            <FileText className="w-5 h-5 text-primary" />
          ) : (
            <Lock className="w-5 h-5 text-amber-500" />
          )}
          Confidential Information
        </h2>

        {hasSignedNDA ? (
          <NDAContent deal={deal} />
        ) : (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="py-10">
              <Empty className="border-0 p-0 bg-transparent">
                <EmptyMedia variant="icon">
                  <Lock className="text-amber-600" />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>NDA Required</EmptyTitle>
                  <EmptyDescription>
                    This information is only available to members who have signed
                    the NDA for this deal.
                  </EmptyDescription>
                </EmptyHeader>
                <Button asChild className="mt-4">
                  <a
                    href={`mailto:samira@salmansolutions.com?subject=NDA Request - ${encodeURIComponent(deal?.['Name'] || 'Deal')}`}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Request NDA Access
                  </a>
                </Button>
              </Empty>
            </CardContent>
          </Card>
        )}
      </section>

      <Separator />

      {/* Comments Section */}
      <CommentsSection
        dealId={deal?.id ?? 0}
        currentMemberId={currentMemberId}
        isSteerCoMember={isSteerCoMember}
        isAdmin={false}
      />
    </div>
  );
}

// Helper Components

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <span className="text-sm text-muted-foreground flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {label}
      </span>
      <span className="font-medium text-sm text-neutral-900">{value}</span>
    </div>
  );
}

function ResourceLink({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
}) {
  return (
    <Button
      asChild
      variant="outline"
      className="w-full justify-start h-auto py-3"
    >
      <a href={href} target="_blank" rel="noopener noreferrer">
        <Icon className="w-4 h-4 mr-3 text-primary" />
        <span className="flex-1 text-left">{label}</span>
        <ExternalLink className="w-4 h-4 ml-2 opacity-40" />
      </a>
    </Button>
  );
}

function NDAContent({ deal }: { deal: DealDetail }) {
  // Defensive checks for all NDA content
  const hasFinancials =
    deal?.['IRR'] || deal?.['MOIE'] || deal?.['Holding Period'] || deal?.['Fees'];

  // Validate fact sheet URL
  const factSheetUrl = deal?.['Fact Sheet']?.[0]?.url;
  const validFactSheetUrl = factSheetUrl && factSheetUrl.startsWith('http') ? factSheetUrl : null;

  return (
    <div className="space-y-6">
      {/* Financial Metrics */}
      {hasFinancials && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Financial Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {deal?.['IRR'] && (
                <MetricBox icon={Percent} label="Target IRR" value={deal['IRR']} />
              )}
              {deal?.['MOIE'] && (
                <MetricBox icon={TrendingUp} label="MOIE" value={deal['MOIE']} />
              )}
              {deal?.['Holding Period'] && (
                <MetricBox
                  icon={Clock}
                  label="Holding Period"
                  value={deal['Holding Period']}
                />
              )}
              {deal?.['Fees'] && (
                <MetricBox icon={DollarSign} label="Fees" value={deal['Fees']} />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fact Sheet */}
      {validFactSheetUrl && (
        <Card>
          <CardContent className="py-4">
            <ResourceLink
              icon={FileText}
              label="Download Fact Sheet"
              href={validFactSheetUrl}
            />
          </CardContent>
        </Card>
      )}

      {/* Zoom Call Notes */}
      {deal?.['Zoom Call Notes'] && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Meeting Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">
              {deal['Zoom Call Notes']}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty state if no NDA content */}
      {!hasFinancials &&
        !validFactSheetUrl &&
        !deal?.['Zoom Call Notes'] && (
          <Card>
            <CardContent className="py-8">
              <p className="text-sm text-muted-foreground text-center">
                No confidential information has been added to this deal yet.
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}

function MetricBox({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-100">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="font-semibold text-lg text-neutral-900">{value}</p>
    </div>
  );
}
