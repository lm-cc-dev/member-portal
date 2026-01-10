'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar } from '@/components/profile/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { InterestBadge } from './interest-badge';
import { Mail, Phone, UserPlus } from 'lucide-react';
import type { RosterMember } from '@/lib/baserow/roster';

interface MemberDetailDialogProps {
  member: RosterMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userPreferences: {
    nonProfitIds: number[];
    hobbyIds: number[];
    stageIds: number[];
    sectorIds: number[];
    geographyIds: number[];
  };
  onRequestIntro: (member: RosterMember) => void;
}

interface InterestSectionProps {
  title: string;
  items: Array<{ id: number; value: string }>;
  matchingIds: number[];
}

function InterestSection({ title, items, matchingIds }: InterestSectionProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-neutral-700">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <InterestBadge
            key={item.id}
            value={item.value}
            colorIndex={index}
            isMatching={matchingIds.includes(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

export function MemberDetailDialog({
  member,
  open,
  onOpenChange,
  userPreferences,
  onRequestIntro,
}: MemberDetailDialogProps) {
  if (!member) return null;

  // Extract headshot for Avatar component
  // Cast to any since Baserow returns different shape than BaserowFile
  const headshot = member['Headshot'] as any;

  const nonProfitInterests = member['Non-Profit Interests'] || [];
  const personalHobbies = member['Personal Hobbies'] || [];
  const stagePreference = member['Stage Preference'] || [];
  const sectorPreference = member['Sector Preference'] || [];

  const hasInterests =
    nonProfitInterests.length > 0 ||
    personalHobbies.length > 0 ||
    stagePreference.length > 0 ||
    sectorPreference.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4 pt-2">
            <Avatar
              name={member['Name'] || 'Member'}
              headshot={headshot}
              size="xl"
            />
            <div>
              <DialogTitle className="text-xl font-semibold">
                {member['Name']}
              </DialogTitle>
              {member['Title'] && (
                <p className="text-primary font-medium mt-0.5">
                  {member['Title']}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Contact Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          {member['Email'] && (
            <Button asChild variant="outline" size="sm">
              <a href={`mailto:${member['Email']}`}>
                <Mail className="w-4 h-4 mr-2" />
                Email
              </a>
            </Button>
          )}
          {member['Phone #'] && (
            <Button asChild variant="outline" size="sm">
              <a href={`tel:${member['Phone #'].replace(/\D/g, '')}`}>
                <Phone className="w-4 h-4 mr-2" />
                Call
              </a>
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              onOpenChange(false);
              onRequestIntro(member);
            }}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Request Intro
          </Button>
        </div>

        {/* Bio Section */}
        {member['Bio'] && (
          <>
            <Separator className="my-4" />
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-neutral-700">About</h4>
              <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">
                {member['Bio']}
              </p>
            </div>
          </>
        )}

        <Separator className="my-4" />

        {/* Interests Sections */}
        {hasInterests ? (
          <div className="space-y-6">
            <InterestSection
              title="Non-Profit Interests"
              items={nonProfitInterests}
              matchingIds={userPreferences.nonProfitIds}
            />
            <InterestSection
              title="Personal Hobbies"
              items={personalHobbies}
              matchingIds={userPreferences.hobbyIds}
            />
            <InterestSection
              title="Investment Stages"
              items={stagePreference}
              matchingIds={userPreferences.stageIds}
            />
            <InterestSection
              title="Centers of Excellence"
              items={sectorPreference}
              matchingIds={userPreferences.sectorIds}
            />
          </div>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-4">
            No interests or preferences shared yet.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
