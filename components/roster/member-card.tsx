'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/profile/avatar';
import { Mail, Phone, Info, UserPlus } from 'lucide-react';
import type { RosterMember } from '@/lib/baserow/roster';

interface MemberCardProps {
  member: RosterMember;
  onViewDetails: () => void;
  onRequestIntro: () => void;
}

export function MemberCard({ member, onViewDetails, onRequestIntro }: MemberCardProps) {
  // Extract headshot for Avatar component
  // Cast to any since Baserow returns different shape than BaserowFile
  const headshot = member['Headshot'] as any;

  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Avatar */}
          <Avatar
            name={member['Name'] || 'Member'}
            headshot={headshot}
            size="lg"
          />

          {/* Name & Title */}
          <div>
            <h3 className="font-semibold text-lg text-neutral-900">
              {member['Name'] || 'Unknown'}
            </h3>
            {member['Title'] && (
              <p className="text-sm text-primary font-medium mt-0.5">
                {member['Title']}
              </p>
            )}
          </div>

          {/* Contact Icons */}
          <div className="flex items-center gap-2">
            {member['Email'] && (
              <Button asChild variant="ghost" size="icon-sm">
                <a href={`mailto:${member['Email']}`} title={`Email ${member['Name']}`}>
                  <Mail className="w-4 h-4" />
                </a>
              </Button>
            )}
            {member['Phone #'] && (
              <Button asChild variant="ghost" size="icon-sm">
                <a
                  href={`tel:${member['Phone #'].replace(/\D/g, '')}`}
                  title={`Call ${member['Name']}`}
                >
                  <Phone className="w-4 h-4" />
                </a>
              </Button>
            )}
          </div>

          {/* Geography Badges */}
          {member['Geographies'] && member['Geographies'].length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5">
              {member['Geographies'].slice(0, 2).map((geo) => (
                <Badge key={geo.id} variant="secondary" className="text-xs">
                  {geo.value}
                </Badge>
              ))}
              {member['Geographies'].length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{member['Geographies'].length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 w-full mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onViewDetails}
              className="flex-1"
            >
              <Info className="w-4 h-4 mr-2" />
              Details
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onRequestIntro}
              className="flex-1"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Intro
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
