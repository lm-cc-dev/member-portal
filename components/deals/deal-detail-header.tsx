'use client';

/**
 * Deal Detail Header
 *
 * Hero section with cover photo, company logo, navigation, and profile menu
 */

import Image from 'next/image';
import Link from 'next/link';
import { signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowLeft, Building2, LogOut, User } from 'lucide-react';
import type { DealDetail } from '@/lib/home/types';

interface DealDetailHeaderProps {
  deal: DealDetail;
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
}

function getInitials(name: string): string {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function DealDetailHeader({ deal, user }: DealDetailHeaderProps) {
  // Safely extract values with defensive checks
  const coverPhoto = deal?.['Cover Photo']?.[0];
  const logo = deal?.['Logo']?.[0];
  const companyName = deal?.['Company']?.[0]?.value || 'Unknown Company';

  // Validate image URLs
  const coverPhotoUrl = coverPhoto?.url && coverPhoto.url.startsWith('http') ? coverPhoto.url : null;
  const logoUrl = logo?.thumbnails?.small?.url || logo?.url;
  const validLogoUrl = logoUrl && logoUrl.startsWith('http') ? logoUrl : null;

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <>
      {/* Sticky Navigation Bar */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-900 truncate">
              {deal?.['Name'] || 'Deal Details'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {companyName}
            </p>
          </div>
          {/* Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="rounded-full">
                <Avatar className="h-8 w-8">
                  {user.image && <AvatarImage src={user.image} alt={user.name} />}
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  View Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Hero Section with Cover Photo */}
      <div className="relative">
        {/* Cover Photo Background */}
        <div className="relative h-48 md:h-64 bg-gradient-to-br from-primary/10 to-primary/5">
          {coverPhotoUrl ? (
            <Image
              src={coverPhotoUrl}
              alt={deal?.['Name'] || 'Deal cover'}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="w-16 h-16 text-primary/20" />
            </div>
          )}
          {/* Gradient Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        {/* Logo & Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
          <div className="max-w-4xl mx-auto flex items-end gap-4">
            {/* Company Logo */}
            <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl bg-white shadow-lg overflow-hidden border border-neutral-100">
              {validLogoUrl ? (
                <Image
                  src={validLogoUrl}
                  alt={companyName}
                  width={80}
                  height={80}
                  className="object-contain w-full h-full p-2"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-neutral-50">
                  <Building2 className="w-8 h-8 text-neutral-400" />
                </div>
              )}
            </div>

            {/* Title */}
            <div className="flex-1 min-w-0 text-white pb-1">
              <p className="text-sm opacity-90 truncate font-medium">
                {companyName}
              </p>
              <h1 className="text-xl md:text-2xl font-bold truncate">
                {deal?.['Name'] || 'Untitled Deal'}
              </h1>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
