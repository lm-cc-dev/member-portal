'use client';

import { useState } from 'react';
import { MemberCard } from './member-card';
import { MemberDetailDialog } from './member-detail-dialog';
import { IntroRequestDialog } from './intro-request-dialog';
import type { RosterMember } from '@/lib/baserow/roster';

interface RosterGridProps {
  members: RosterMember[];
  userPreferences: {
    nonProfitIds: number[];
    hobbyIds: number[];
    stageIds: number[];
    sectorIds: number[];
    geographyIds: number[];
  };
}

export function RosterGrid({ members, userPreferences }: RosterGridProps) {
  const [selectedMember, setSelectedMember] = useState<RosterMember | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [introMember, setIntroMember] = useState<RosterMember | null>(null);
  const [introDialogOpen, setIntroDialogOpen] = useState(false);

  const handleViewDetails = (member: RosterMember) => {
    setSelectedMember(member);
    setDialogOpen(true);
  };

  const handleRequestIntro = (member: RosterMember) => {
    setIntroMember(member);
    setIntroDialogOpen(true);
  };

  if (members.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No members have opted into the roster yet.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            onViewDetails={() => handleViewDetails(member)}
            onRequestIntro={() => handleRequestIntro(member)}
          />
        ))}
      </div>

      <MemberDetailDialog
        member={selectedMember}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        userPreferences={userPreferences}
        onRequestIntro={handleRequestIntro}
      />

      <IntroRequestDialog
        member={introMember}
        open={introDialogOpen}
        onOpenChange={setIntroDialogOpen}
        userPreferences={userPreferences}
      />
    </>
  );
}
