'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Avatar } from '@/components/profile/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle2 } from 'lucide-react';
import type { RosterMember } from '@/lib/baserow/roster';

interface IntroRequestDialogProps {
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
}

export function IntroRequestDialog({
  member,
  open,
  onOpenChange,
  userPreferences,
}: IntroRequestDialogProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form state when closing
      setReason('');
      setError(null);
      setIsSuccess(false);
    }
    onOpenChange(newOpen);
  };

  // Compute shared characteristics between current user and target member
  const computeSharedIds = () => {
    if (!member) return { sectors: [], hobbies: [], nonProfits: [], geographies: [] };

    const memberSectorIds = (member['Sector Preference'] || []).map(s => s.id);
    const memberHobbyIds = (member['Personal Hobbies'] || []).map(h => h.id);
    const memberNonProfitIds = (member['Non-Profit Interests'] || []).map(n => n.id);
    const memberGeographyIds = (member['Geographies'] || []).map(g => g.id);

    return {
      sectors: userPreferences.sectorIds.filter(id => memberSectorIds.includes(id)),
      hobbies: userPreferences.hobbyIds.filter(id => memberHobbyIds.includes(id)),
      nonProfits: userPreferences.nonProfitIds.filter(id => memberNonProfitIds.includes(id)),
      geographies: userPreferences.geographyIds.filter(id => memberGeographyIds.includes(id)),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!member) return;

    if (!reason.trim()) {
      setError('Please provide a reason for this introduction');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const sharedIds = computeSharedIds();

    try {
      const response = await fetch('/api/intros/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toMemberId: member.id,
          reason: reason.trim(),
          sharedSectorIds: sharedIds.sectors,
          sharedHobbyIds: sharedIds.hobbies,
          sharedNonProfitIds: sharedIds.nonProfits,
          sharedGeographyIds: sharedIds.geographies,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      setIsSuccess(true);

      // Close dialog after showing success
      setTimeout(() => {
        handleClose(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!member) return null;

  // Extract headshot for Avatar component
  const headshot = member['Headshot'] as any;
  const firstName = member['Name']?.split(' ')[0] || 'this member';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Introduction</DialogTitle>
          <DialogDescription>
            Collaboration Circle will facilitate an introduction between you and {member['Name']}.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-neutral-900">Request Submitted!</h3>
            <p className="text-sm text-muted-foreground mt-2">
              We&apos;ll reach out to coordinate the introduction.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Member Preview */}
            <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg">
              <Avatar
                name={member['Name'] || 'Member'}
                headshot={headshot}
                size="lg"
              />
              <div>
                <p className="font-medium text-neutral-900">{member['Name']}</p>
                {member['Title'] && (
                  <p className="text-sm text-primary">{member['Title']}</p>
                )}
              </div>
            </div>

            {/* Reason Field */}
            <div className="space-y-2">
              <Label htmlFor="reason">
                Why would you like to meet {firstName}? <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Share what you hope to discuss or learn from this connection..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                disabled={isSubmitting}
                className="resize-none"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !reason.trim()}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Request Intro'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
