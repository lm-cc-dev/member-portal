'use client';

import { BaserowFile } from '@/lib/profile/types';
import { getInitials, getAvatarColor } from '@/lib/profile/utils';
import Image from 'next/image';

interface AvatarProps {
  name: string;
  headshot?: BaserowFile[] | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
  onEditClick?: () => void;
}

const sizeClasses = {
  sm: 'w-12 h-12 text-lg',
  md: 'w-16 h-16 text-2xl',
  lg: 'w-24 h-24 text-4xl',
  xl: 'w-32 h-32 text-5xl',
};

export function Avatar({
  name,
  headshot,
  size = 'xl',
  editable = false,
  onEditClick,
}: AvatarProps) {
  const initials = getInitials(name);
  const bgColor = getAvatarColor(name);
  const hasImage = headshot && headshot.length > 0 && headshot[0]?.url;

  // Get the best image URL based on size (use larger thumbnails for better quality)
  const getImageUrl = () => {
    if (!hasImage) return null;
    const thumbnails = headshot[0].thumbnails;
    // For larger sizes, use bigger thumbnails to avoid pixelation
    if (size === 'xl' || size === 'lg') {
      return thumbnails?.card_cover?.url || thumbnails?.large?.url || headshot[0].url;
    }
    return thumbnails?.small?.url || headshot[0].url;
  };
  const imageUrl = getImageUrl();

  return (
    <div className="relative inline-block">
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden border-4 border-white shadow-lg relative`}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${name}'s profile picture`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white font-semibold select-none"
            style={{ backgroundColor: bgColor }}
          >
            {initials}
          </div>
        )}
      </div>

      {editable && onEditClick && (
        <button
          onClick={onEditClick}
          className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg transition-colors"
          aria-label="Edit profile picture"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
